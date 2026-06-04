const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function fixAll() {
  const snap = await db.collection('users').get();
  const batch = db.batch();
  let count = 0;
  snap.docs.forEach(d => {
    const country = d.data().country;
    if (!country || !/^[A-Z]{2}$/.test(country)) {
      batch.update(d.ref, { country: 'XX' });
      count++;
    }
  });
  if (count > 0) await batch.commit();
  console.log('OK - actualizados:', count);
  process.exit(0);
}
fixAll().catch(e => { console.error(e); process.exit(1); });