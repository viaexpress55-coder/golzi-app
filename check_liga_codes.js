const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const snap = await db.collection('leagues')
    .where('ownerId', '==', 'anusYcS15ghuBzdTa0dTg4GuLag2')
    .get();
  snap.forEach(d => {
    const data = d.data();
    console.log('Liga:', data.name, '| code:', data.code, '| inviteLink:', data.inviteLink || 'NONE');
  });
}
check().catch(console.error);