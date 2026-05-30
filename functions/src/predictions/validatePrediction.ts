// functions/src/predictions/validatePrediction.ts
// ─────────────────────────────────────────────────────────────────
// REGLA DEL PRIMER PITAZO — Validación en servidor
// La validación del cliente es UX. Esta es la que realmente importa.
// ─────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

interface PredictionRequest {
  matchId: string;
  homeScore: number;
  awayScore: number;
  tournamentId: string;
}

export const submitPrediction = onCall(
  { region: 'us-central1' },
  async (request) => {
    // ── Verificar autenticación ──
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const userId = request.auth.uid;
    const { matchId, homeScore, awayScore, tournamentId } = request.data as PredictionRequest;

    // ── Validar inputs ──
    if (!matchId || homeScore === undefined || awayScore === undefined) {
      throw new HttpsError('invalid-argument', 'Datos de predicción incompletos');
    }

    if (homeScore < 0 || awayScore < 0 || homeScore > 20 || awayScore > 20) {
      throw new HttpsError('invalid-argument', 'Marcador inválido');
    }

    // ── Verificar plan activo ──
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'Usuario no encontrado');
    }

    const userData = userDoc.data()!;
    
    // Verificar acceso: plan pagado O miembro de una liga privada
    if (userData.plan === 'free') {
      // Verificar si está en alguna liga
      const leagueSnap = await db.collection('leagues')
        .where('memberIds', 'array-contains', userId)
        .limit(1)
        .get();
      
      if (leagueSnap.empty) {
        throw new HttpsError('permission-denied', 'Necesitas un plan de pago o unirte a una liga privada para predecir');
      }
    } else {
      // Tiene plan — verificar que no haya expirado
      const planExpiry = userData.planExpiry?.toDate();
      if (!planExpiry || planExpiry < new Date()) {
        throw new HttpsError('permission-denied', 'Tu plan ha expirado');
      }
    }

    // ── REGLA DEL PRIMER PITAZO — verificar en servidor ──
    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) {
      throw new HttpsError('not-found', 'Partido no encontrado');
    }

    const matchData = matchDoc.data()!;
    const kickoffTime: Date = matchData.kickoffTime.toDate();
    const now = new Date();

    if (now >= kickoffTime) {
      throw new HttpsError(
        'failed-precondition',
        'El partido ya inició — regla del primer pitazo. Sin excepciones.'
      );
    }

    if (matchData.status === 'live' || matchData.status === 'finished') {
      throw new HttpsError(
        'failed-precondition',
        'No es posible predecir este partido'
      );
    }

    // ── Verificar que no exista predicción previa para este partido ──
    const existingPred = await db
      .collection('predictions')
      .where('userId', '==', userId)
      .where('matchId', '==', matchId)
      .limit(1)
      .get();

    if (!existingPred.empty) {
      throw new HttpsError(
        'already-exists',
        'Ya tienes una predicción para este partido'
      );
    }

    // ── Todo válido — escribir predicción ──
    const predRef = db.collection('predictions').doc();
    const now2 = admin.firestore.FieldValue.serverTimestamp();

    await predRef.set({
      predictionId: predRef.id,
      userId,
      matchId,
      tournamentId,
      homeScore,
      awayScore,
      pointsEarned: 0,
      status: 'pending',
      createdAt: now2,
      lockedAt: now2,
    });

    return {
      success: true,
      predictionId: predRef.id,
      message: `Predicción confirmada: ${homeScore} - ${awayScore}`,
    };
  }
);
