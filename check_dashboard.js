const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const snap = await db.collection('leagues').where('code', '==', 'GOLZ-6D9Y').get();
  if (snap.empty) { console.log('Liga no encontrada'); return; }
  const liga = snap.docs[0].data();
  console.log('plan:', liga.plan);
  console.log('ownerId:', liga.ownerId);
  console.log('status:', liga.status);
}
check().catch(console.error);