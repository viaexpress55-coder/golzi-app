const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const snap = await db.collection('public_tournaments').get();
  console.log('Total torneos públicos:', snap.size);
  snap.forEach(d => console.log('-', d.id, '|', d.data().name));
}
check().catch(console.error);