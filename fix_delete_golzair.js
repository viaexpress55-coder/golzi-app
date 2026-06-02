const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function deleteGolzair() {
  const snap = await db.collection('users')
    .where('username', '==', 'Golzair')
    .get();
  
  console.log('Usuarios Golzair:', snap.docs.length);
  snap.docs.forEach(d => console.log(d.id, d.data().username, d.data().totalPoints));
  
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  console.log('OK - eliminados');
  process.exit(0);
}

deleteGolzair().catch(e => { console.error(e); process.exit(1); });