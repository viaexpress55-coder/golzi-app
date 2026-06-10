const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Marcadores realistas con probabilidades
const SCORES = [
  { h:1, a:0, w:18 }, { h:2, a:0, w:14 }, { h:1, a:1, w:13 },
  { h:2, a:1, w:12 }, { h:0, a:1, w:11 }, { h:3, a:0, w:8 },
  { h:0, a:2, w:7 },  { h:2, a:2, w:6 },  { h:3, a:1, w:5 },
  { h:0, a:0, w:5 },  { h:1, a:2, w:4 },  { h:3, a:2, w:3 },
  { h:4, a:0, w:2 },  { h:0, a:3, w:2 },  { h:4, a:1, w:1 },
];

function randomScore() {
  const total = SCORES.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const s of SCORES) {
    r -= s.w;
    if (r <= 0) return { home: s.h, away: s.a };
  }
  return { home: 1, away: 0 };
}

async function main() {
  // Obtener partidos
  const matchesSnap = await db.collection('matches').get();
  const matches = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('Partidos:', matches.length);

  // Obtener usuarios ficticios
  const usersSnap = await db.collection('users').where('isFake', '==', true).get();
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('Usuarios ficticios:', users.length);

  let total = 0;
  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const user of users) {
    // Cada usuario predice entre 60-72 partidos (no todos)
    const numPredictions = Math.floor(Math.random() * 13) + 60;
    const shuffledMatches = [...matches].sort(() => Math.random() - 0.5).slice(0, numPredictions);

    for (const match of shuffledMatches) {
      const score = randomScore();
      const predRef = db.collection('predictions').doc(`${user.id}_${match.id}`);
      batch.set(predRef, {
        userId: user.id,
        matchId: match.id,
        homeScore: score.home,
        awayScore: score.away,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isFake: true,
      }, { merge: true });

      batchCount++;
      total++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`✅ ${total} predicciones guardadas...`);
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Total predicciones generadas: ${total}`);
  console.log('Promedio por usuario:', Math.round(total / users.length));
}

main().catch(console.error);