const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function update() {
  await db.collection('users').doc('anusYcS15ghuBzdTa0dTg4GuLag2').update({ plan: 'BUSINESS' });
  const snap = await db.collection('leagues').where('code', '==', 'GOLZ-FCAP').get();
  await snap.docs[0].ref.update({ plan: 'BUSINESS' });
  console.log('✅ tumarca y liga GOLZ-FCAP → BUSINESS');
}
update().catch(console.error);