const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function update() {
  await db.collection('matches').doc('WC2026_A01').update({
    status: 'IN_PLAY',
    homeScore: 0,
    awayScore: 0,
  });
  console.log('✅ México vs Sudáfrica → IN_PLAY');
}
update().catch(console.error);