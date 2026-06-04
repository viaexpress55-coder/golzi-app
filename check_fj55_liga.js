const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const snap = await db.collection('leagues')
    .where('memberIds', 'array-contains', 'kgHGCFkdzwTeQ6kEuxRjxd5etqA3')
    .get();
  console.log('Ligas encontradas:', snap.size);
  snap.forEach(doc => {
    console.log('Liga:', doc.data().name, '| miembros:', doc.data().memberIds?.length);
  });
}
check().catch(console.error);