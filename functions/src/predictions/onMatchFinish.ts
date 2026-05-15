// functions/src/predictions/onMatchFinish.ts
// ─────────────────────────────────────────────────────────────────────────────
// Trigger principal de GOLZI: se activa cuando un partido termina
// Calcula puntos de TODOS los usuarios que predijeron ese partido
// IDEMPOTENTE: usa pointsProcessed para evitar puntos dobles en reintentos
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();

// ── Regla de puntos según doc técnico ────────────────────────────────────────
function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): { points: number; status: string } {
  // Marcador exacto: +10
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return { points: 10, status: 'correct_exact' };
  }

  const predictedResult = Math.sign(predictedHome - predictedAway);
  const actualResult    = Math.sign(actualHome - actualAway);

  // Empate acertado: +2
  if (actualResult === 0 && predictedResult === 0) {
    return { points: 2, status: 'correct_draw' };
  }

  // Solo ganador correcto (no marcador exacto): +5
  if (predictedResult === actualResult) {
    return { points: 5, status: 'correct_result' };
  }

  // Todo incorrecto: 0
  return { points: 0, status: 'incorrect' };
}

// ── Trigger: se activa cuando status del partido cambia a 'finished' ─────────
export const onMatchFinish = onDocumentUpdated(
  {
    document:       'matches/{matchId}',
    timeoutSeconds: 540,
    memory:         '1GiB',
    minInstances:   1,
    maxInstances:   10,
  },
  async (event) => {
    const before = event.data?.before.data();
    const after  = event.data?.after.data();

    if (!before || !after) return;

    // Solo procesar si el partido acaba de terminar
    if (before.status === 'finished' || after.status !== 'finished') return;
    if (after.homeScore === null || after.awayScore === null) return;

    const matchId    = event.params.matchId;
    const actualHome = after.homeScore as number;
    const actualAway = after.awayScore as number;

    // ── IDEMPOTENCIA: verificar si ya fue procesado ───────────────────────────
    // Usar transacción para marcar el partido como "en proceso" atómicamente
    const matchRef = db.collection('matches').doc(matchId);

    try {
      await db.runTransaction(async (transaction) => {
        const matchSnap = await transaction.get(matchRef);
        const matchData = matchSnap.data();

        if (matchData?.pointsProcessed === true) {
          console.log(`⚠️ Partido ${matchId} ya fue procesado — saltando`);
          throw new Error('ALREADY_PROCESSED');
        }

        // Marcar como en proceso ANTES de calcular (previene ejecuciones paralelas)
        transaction.update(matchRef, {
          pointsProcessed:   true,
          pointsProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    } catch (err: any) {
      if (err.message === 'ALREADY_PROCESSED') return;
      throw err;
    }

    console.log(`⚽ Partido terminado: ${matchId} — ${actualHome}:${actualAway}`);

    // ── Obtener todas las predicciones pendientes ─────────────────────────────
    const predictionsSnap = await db
      .collection('predictions')
      .where('matchId', '==', matchId)
      .where('status', '==', 'pending')
      .get();

    if (predictionsSnap.empty) {
      console.log('   Sin predicciones pendientes para este partido');
      return;
    }

    console.log(`   Procesando ${predictionsSnap.size} predicciones...`);

    // ── Procesar en batches de 500 (límite de Firestore) ─────────────────────
    const batchSize = 500;
    const docs      = predictionsSnap.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch          = db.batch();
      const chunk          = docs.slice(i, i + batchSize);
      const userPointsMap: Record<string, number> = {};

      for (const predDoc of chunk) {
        const pred = predDoc.data();
        const { points, status } = calculatePoints(
          pred.homeScore,
          pred.awayScore,
          actualHome,
          actualAway
        );

        // Actualizar predicción
        batch.update(predDoc.ref, {
          pointsEarned: points,
          status:       status,
          calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Acumular puntos por usuario
        if (!userPointsMap[pred.userId]) {
          userPointsMap[pred.userId] = 0;
        }
        userPointsMap[pred.userId] += points;
      }

      // Actualizar totalPoints de cada usuario afectado
      for (const [userId, points] of Object.entries(userPointsMap)) {
        const userRef = db.collection('users').doc(userId);
        if (points > 0) {
          batch.update(userRef, {
            totalPoints: admin.firestore.FieldValue.increment(points),
            lastActive:  admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      await batch.commit();
      console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1} completado (${chunk.length} predicciones)`);
    }

    console.log(`✅ Partido ${matchId} procesado completamente — ${predictionsSnap.size} predicciones`);
  }
);