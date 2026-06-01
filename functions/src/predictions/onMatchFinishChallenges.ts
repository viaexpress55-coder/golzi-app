// functions/src/predictions/onMatchFinishChallenges.ts
// ─────────────────────────────────────────────────────────────────────────────
// Procesa los Retos Rápidos (quick_challenges) cuando un partido termina.
// Se activa en el mismo trigger que onMatchFinish (status → 'finished').
// IDEMPOTENTE: usa challengesProcessed para evitar puntos dobles.
// Requiere que el documento matches/{matchId} tenga campo apiId (numérico).
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();

// ── Puntos por reto (espejo de HomeScreen) ────────────────────────────────────
const RETO_POINTS: Record<string, number> = {
  first_goal: 15,
  over_goals: 8,
  red_card:   8,
  ht_result:  12,
  penalty:    10,
};

// ── Obtener detalles del partido desde football-data.org ──────────────────────
async function fetchMatchDetails(apiId: number): Promise<any> {
  const API_KEY  = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY ||
                   process.env.FOOTBALL_API_KEY || '';
  const BASE_URL = 'https://api.football-data.org/v4';

  const res = await fetch(`${BASE_URL}/matches/${apiId}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) {
    console.error(`Error API football-data: ${res.status}`);
    return null;
  }
  return res.json();
}

// ── Extraer datos de retos desde la respuesta de la API ───────────────────────
interface ChallengeData {
  firstGoalTeam: 'home' | 'away' | 'none';  // primer gol
  overGoals:     boolean;                    // más de 2.5 goles
  hasRedCard:    boolean;                    // hubo tarjeta roja
  htResult:      '1' | 'x' | '2';           // resultado al descanso
  hasPenalty:    boolean;                    // hubo tanda de penaltis
}

function extractChallengeData(
  apiData:   any,
  homeTeam:  string,
  awayTeam:  string,
): ChallengeData {
  const goals       = apiData.goals        || [];
  const bookings    = apiData.bookings      || [];
  const score       = apiData.score         || {};
  const fullHome    = score.fullTime?.home  ?? 0;
  const fullAway    = score.fullTime?.away  ?? 0;
  const htHome      = score.halfTime?.home  ?? 0;
  const htAway      = score.halfTime?.away  ?? 0;
  const penalties   = score.penalties;

  // firstGoalTeam: equipo del primer gol ordenado por minuto
  let firstGoalTeam: 'home' | 'away' | 'none' = 'none';
  if (goals.length > 0) {
    const sorted   = [...goals].sort((a: any, b: any) => a.minute - b.minute);
    const first    = sorted[0];
    const scorerTeam = first?.team?.name ?? '';
    if (scorerTeam === homeTeam)      firstGoalTeam = 'home';
    else if (scorerTeam === awayTeam) firstGoalTeam = 'away';
    else                              firstGoalTeam = 'none';
  }

  // overGoals: más de 2.5 goles en el partido
  const overGoals = (fullHome + fullAway) > 2;

  // hasRedCard: alguna tarjeta roja
  const hasRedCard = bookings.some((b: any) => b.card === 'RED_CARD');

  // htResult: resultado al descanso
  let htResult: '1' | 'x' | '2' = 'x';
  if (htHome > htAway)      htResult = '1';
  else if (htAway > htHome) htResult = '2';

  // hasPenalty: tanda de penaltis (solo eliminatoria)
  const hasPenalty = penalties !== null &&
                     penalties !== undefined &&
                     penalties.home !== null &&
                     penalties.away !== null;

  return { firstGoalTeam, overGoals, hasRedCard, htResult, hasPenalty };
}

// ── Evaluar respuesta de un reto contra los datos reales ──────────────────────
function evaluateChallenge(
  retoId:  string,
  answer:  string,
  data:    ChallengeData,
): boolean {
  switch (retoId) {
    case 'first_goal':
      return answer === data.firstGoalTeam;
    case 'over_goals':
      return (answer === 'yes') === data.overGoals;
    case 'red_card':
      return (answer === 'yes') === data.hasRedCard;
    case 'ht_result':
      return answer === data.htResult;
    case 'penalty':
      return (answer === 'yes') === data.hasPenalty;
    default:
      return false;
  }
}

// ── Trigger principal ─────────────────────────────────────────────────────────
export const onMatchFinishChallenges = onDocumentUpdated(
  {
    document:       'matches/{matchId}',
    timeoutSeconds: 540,
    memory:         '1GiB',
    maxInstances:   10,
  },
  async (event) => {
    const before = event.data?.before.data();
    const after  = event.data?.after.data();

    if (!before || !after) return;

    // Solo cuando el partido acaba de terminar
    if (before.status === 'finished' || after.status !== 'finished') return;
    if (after.homeScore === null || after.awayScore === null)         return;

    const matchId = event.params.matchId;
    const matchRef = db.collection('matches').doc(matchId);

    // ── IDEMPOTENCIA ──────────────────────────────────────────────────────────
    try {
      await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(matchRef);
        if (snap.data()?.challengesProcessed === true) {
          throw new Error('ALREADY_PROCESSED');
        }
        transaction.update(matchRef, {
          challengesProcessed:   true,
          challengesProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    } catch (err: any) {
      if (err.message === 'ALREADY_PROCESSED') return;
      throw err;
    }

    const apiId    = after.apiId    as number | undefined;
    const homeTeam = after.homeTeam as string;
    const awayTeam = after.awayTeam as string;

    if (!apiId) {
      console.warn(`⚠️ Partido ${matchId} sin apiId — no se pueden evaluar retos`);
      return;
    }

    console.log(`⚡ Procesando retos para partido ${matchId} (apiId: ${apiId})`);

    // ── Obtener datos de la API ───────────────────────────────────────────────
    const apiData = await fetchMatchDetails(apiId);
    if (!apiData) {
      console.error(`❌ No se pudieron obtener datos de la API para ${matchId}`);
      return;
    }

    const challengeData = extractChallengeData(apiData, homeTeam, awayTeam);

    // Guardar datos de retos en el documento del partido (útil para auditoría
    // y para que la TABLA los pueda leer sin volver a llamar la API)
    await matchRef.update({
      challengeData: {
        firstGoalTeam: challengeData.firstGoalTeam,
        overGoals:     challengeData.overGoals,
        hasRedCard:    challengeData.hasRedCard,
        htResult:      challengeData.htResult,
        hasPenalty:    challengeData.hasPenalty,
        enrichedAt:    admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    console.log(`   Datos del partido:`, challengeData);

    // ── Obtener todos los quick_challenges pendientes para este partido ────────
    const challengesSnap = await db
      .collection('quick_challenges')
      .where('matchId', '==', matchId)
      .where('status',  '==', 'pending')
      .get();

    if (challengesSnap.empty) {
      console.log(`   Sin retos pendientes para ${matchId}`);
      return;
    }

    console.log(`   Evaluando ${challengesSnap.size} retos...`);

    // ── Procesar en batches de 500 ────────────────────────────────────────────
    const batchSize = 500;
    const docs      = challengesSnap.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch         = db.batch();
      const chunk         = docs.slice(i, i + batchSize);
      const userPointsMap: Record<string, number> = {};

      for (const challengeDoc of chunk) {
        const challenge = challengeDoc.data();
        const answers   = challenge.answers as Record<string, string> ?? {};

        let totalPoints  = 0;
        let correctCount = 0;
        const retoResults: Record<string, { correct: boolean; pts: number }> = {};

        // Evaluar cada reto respondido
        for (const [retoId, answer] of Object.entries(answers)) {
          const correct = evaluateChallenge(retoId, answer, challengeData);
          const pts     = correct ? (RETO_POINTS[retoId] ?? 0) : 0;
          totalPoints  += pts;
          if (correct) correctCount++;
          retoResults[retoId] = { correct, pts };
        }

        // Actualizar el documento del reto
        batch.update(challengeDoc.ref, {
          status:       totalPoints > 0 ? 'correct_partial' : 'incorrect',
          pointsEarned: totalPoints,
          correctCount,
          retoResults,
          calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Acumular puntos por usuario
        if (totalPoints > 0) {
          if (!userPointsMap[challenge.userId]) {
            userPointsMap[challenge.userId] = 0;
          }
          userPointsMap[challenge.userId] += totalPoints;
        }
      }

      // Sumar puntos de retos a totalPoints del usuario
      for (const [userId, pts] of Object.entries(userPointsMap)) {
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, {
          totalPoints:       admin.firestore.FieldValue.increment(pts),
          challengePoints:   admin.firestore.FieldValue.increment(pts),
          lastActive:        admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1} completado (${chunk.length} retos)`);
    }

    console.log(`✅ Retos del partido ${matchId} procesados`);
  }
);