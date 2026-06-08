// functions/src/predictions/onMatchFinishChallenges.ts
import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();

const RETO_POINTS: Record<string, number> = {
  first_goal:   5,
  over_goals:   3,
  yellow_cards: 3,
  ht_result:    4,
  penalty:      4,
};

async function fetchMatchDetails(apiId: number): Promise<any> {
  const API_KEY = process.env.FOOTBALL_API_KEY || '';
  const res = await fetch(`https://api.football-data.org/v4/matches/${apiId}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });
  if (!res.ok) return null;
  return res.json();
}

interface ChallengeData {
  firstGoalTeam:    'home' | 'away' | 'none';
  overGoals:        boolean;
  hasRedCard:       boolean;
  yellowCardsRange: '0-2' | '3-4' | '5-6' | '7+';
  htResult:         '1' | 'x' | '2';
  hasPenalty:       boolean;
}

function extractChallengeData(apiData: any, homeTeam: string, awayTeam: string): ChallengeData {
  const goals     = apiData.goals     || [];
  const bookings  = apiData.bookings  || [];
  const score     = apiData.score     || {};
  const fullHome  = score.fullTime?.home ?? 0;
  const fullAway  = score.fullTime?.away ?? 0;
  const htHome    = score.halfTime?.home ?? 0;
  const htAway    = score.halfTime?.away ?? 0;
  const penalties = score.penalties;

  // Primer gol
  let firstGoalTeam: 'home' | 'away' | 'none' = 'none';
  if (goals.length > 0) {
    const sorted = [...goals].sort((a: any, b: any) => a.minute - b.minute);
    const scorerTeam = sorted[0]?.team?.name ?? '';
    if (scorerTeam === homeTeam) firstGoalTeam = 'home';
    else if (scorerTeam === awayTeam) firstGoalTeam = 'away';
  }

  // Más de 2.5 goles
  const overGoals = (fullHome + fullAway) > 2;

  // Tarjeta roja
  const hasRedCard = bookings.some((b: any) => b.card === 'RED_CARD');

  // Rango tarjetas amarillas
  const totalYellows = bookings.filter((b: any) => b.card === 'YELLOW_CARD').length;
  let yellowCardsRange: '0-2' | '3-4' | '5-6' | '7+' = '0-2';
  if (totalYellows <= 2) yellowCardsRange = '0-2';
  else if (totalYellows <= 4) yellowCardsRange = '3-4';
  else if (totalYellows <= 6) yellowCardsRange = '5-6';
  else yellowCardsRange = '7+';

  // Resultado al descanso
  let htResult: '1' | 'x' | '2' = 'x';
  if (htHome > htAway) htResult = '1';
  else if (htAway > htHome) htResult = '2';

  // Tanda de penaltis
  const hasPenalty = penalties !== null && penalties !== undefined &&
                     penalties.home !== null && penalties.away !== null;

  return { firstGoalTeam, overGoals, hasRedCard, yellowCardsRange, htResult, hasPenalty };
}

function evaluateChallenge(retoId: string, answer: string, data: ChallengeData): boolean {
  switch (retoId) {
    case 'first_goal':    return answer === data.firstGoalTeam;
    case 'over_goals':    return (answer === 'yes') === data.overGoals;
    case 'red_card':      return (answer === 'yes') === data.hasRedCard;
    case 'yellow_cards':  return answer === data.yellowCardsRange;
    case 'ht_result':     return answer === data.htResult;
    case 'penalty':       return (answer === 'yes') === data.hasPenalty;
    default:              return false;
  }
}

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
    if (before.status === 'finished' || after.status !== 'finished') return;
    if (after.homeScore === null || after.awayScore === null) return;

    const matchId  = event.params.matchId;
    const matchRef = db.collection('matches').doc(matchId);

    try {
      await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(matchRef);
        if (snap.data()?.challengesProcessed === true) throw new Error('ALREADY_PROCESSED');
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
      console.warn(`Partido ${matchId} sin apiId`);
      return;
    }

    const apiData = await fetchMatchDetails(apiId);
    if (!apiData) {
      console.error(`No se pudieron obtener datos de la API para ${matchId}`);
      return;
    }

    const challengeData = extractChallengeData(apiData, homeTeam, awayTeam);

    await matchRef.update({
      challengeData: {
        ...challengeData,
        enrichedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    const challengesSnap = await db
      .collection('quick_challenges')
      .where('matchId', '==', matchId)
      .where('status',  '==', 'pending')
      .get();

    if (challengesSnap.empty) return;

    const batchSize = 500;
    const docs      = challengesSnap.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + batchSize);
      const userPointsMap: Record<string, number> = {};

      for (const challengeDoc of chunk) {
        const challenge = challengeDoc.data();
        const answers   = challenge.answers as Record<string, string> ?? {};
        let totalPoints = 0;
        let correctCount = 0;
        const retoResults: Record<string, { correct: boolean; pts: number }> = {};

        for (const [retoId, answer] of Object.entries(answers)) {
          const correct = evaluateChallenge(retoId, answer, challengeData);
          const pts     = correct ? (RETO_POINTS[retoId] ?? 0) : 0;
          totalPoints  += pts;
          if (correct) correctCount++;
          retoResults[retoId] = { correct, pts };
        }

        batch.update(challengeDoc.ref, {
          status:       totalPoints > 0 ? 'correct_partial' : 'incorrect',
          pointsEarned: totalPoints,
          correctCount,
          retoResults,
          calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (totalPoints > 0) {
          if (!userPointsMap[challenge.userId]) userPointsMap[challenge.userId] = 0;
          userPointsMap[challenge.userId] += totalPoints;
        }
      }

      for (const [userId, pts] of Object.entries(userPointsMap)) {
        batch.update(db.collection('users').doc(userId), {
          totalPoints:     admin.firestore.FieldValue.increment(pts),
          challengePoints: admin.firestore.FieldValue.increment(pts),
          lastActive:      admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      console.log(`Batch ${Math.floor(i / batchSize) + 1} completado`);
    }

    console.log(`Retos del partido ${matchId} procesados`);
  }
);
