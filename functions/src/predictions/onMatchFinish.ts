// functions/src/predictions/onMatchFinish.ts
import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();

function calculatePoints(
  predictedHome: number, predictedAway: number,
  actualHome: number,    actualAway: number
): { points: number; status: string } {
  if (predictedHome === actualHome && predictedAway === actualAway)
    return { points: 10, status: 'correct_exact' };
  const predictedResult = Math.sign(predictedHome - predictedAway);
  const actualResult    = Math.sign(actualHome - actualAway);
  if (actualResult === 0 && predictedResult === 0)
    return { points: 2, status: 'correct_draw' };
  if (predictedResult === actualResult)
    return { points: 5, status: 'correct_result' };
  return { points: 0, status: 'incorrect' };
}

export const onMatchFinish = onDocumentUpdated(
  { document: 'matches/{matchId}', timeoutSeconds: 540, memory: '1GiB', minInstances: 1, maxInstances: 10 },
  async (event) => {
    const before = event.data?.before.data();
    const after  = event.data?.after.data();
    if (!before || !after) return;
    if (before.status === 'finished' || after.status !== 'finished') return;
    if (after.homeScore === null || after.awayScore === null) return;

    const matchId    = event.params.matchId;
    const actualHome = after.homeScore as number;
    const actualAway = after.awayScore as number;
    const matchRef   = db.collection('matches').doc(matchId);

    try {
      await db.runTransaction(async (transaction) => {
        const matchSnap = await transaction.get(matchRef);
        if (matchSnap.data()?.pointsProcessed === true) throw new Error('ALREADY_PROCESSED');
        transaction.update(matchRef, {
          pointsProcessed:   true,
          pointsProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    } catch (err: any) {
      if (err.message === 'ALREADY_PROCESSED') return;
      throw err;
    }

    console.log('Partido terminado: ' + matchId + ' ' + actualHome + ':' + actualAway);

    const predictionsSnap = await db.collection('predictions')
      .where('matchId', '==', matchId)
      .where('status',  '==', 'pending')
      .get();

    if (predictionsSnap.empty) { console.log('Sin predicciones pendientes'); return; }

    console.log('Procesando ' + predictionsSnap.size + ' predicciones...');

    const batchSize = 500;
    const docs      = predictionsSnap.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + batchSize);

      // Map: userId -> { points, exact, result, draw, total }
      const userStatsMap: Record<string, { points: number; exact: number; result: number; draw: number; total: number }> = {};

      for (const predDoc of chunk) {
        const pred = predDoc.data();
        const { points, status } = calculatePoints(pred.homeScore, pred.awayScore, actualHome, actualAway);

        batch.update(predDoc.ref, {
          pointsEarned: points,
          status:       status,
          calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (!userStatsMap[pred.userId]) {
          userStatsMap[pred.userId] = { points: 0, exact: 0, result: 0, draw: 0, total: 0 };
        }
        userStatsMap[pred.userId].points += points;
        userStatsMap[pred.userId].total  += 1;
        if (status === 'correct_exact')  userStatsMap[pred.userId].exact  += 1;
        if (status === 'correct_result') userStatsMap[pred.userId].result += 1;
        if (status === 'correct_draw')   userStatsMap[pred.userId].draw   += 1;
      }

      for (const [userId, stats] of Object.entries(userStatsMap)) {
        const userRef = db.collection('users').doc(userId);
        const upd: any = {
          totalPredictions: admin.firestore.FieldValue.increment(stats.total),
          lastActive:       admin.firestore.FieldValue.serverTimestamp(),
        };
        if (stats.points > 0)  upd.totalPoints        = admin.firestore.FieldValue.increment(stats.points);
        if (stats.exact > 0)   upd.exactPredictions   = admin.firestore.FieldValue.increment(stats.exact);
        if (stats.result > 0)  upd.correctPredictions = admin.firestore.FieldValue.increment(stats.result);
        if (stats.draw > 0)    upd.drawPredictions    = admin.firestore.FieldValue.increment(stats.draw);
        batch.update(userRef, upd);
      }

      await batch.commit();
      console.log('Batch ' + (Math.floor(i / batchSize) + 1) + ' completado (' + chunk.length + ' predicciones)');
    }

    console.log('Partido ' + matchId + ' procesado — ' + predictionsSnap.size + ' predicciones');
  }
);