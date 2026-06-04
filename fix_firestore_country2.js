const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function fixCountries() {
  const snap = await db.collection('users').get();
  const batch = db.batch();
  let count = 0;
  
  snap.docs.forEach(d => {
    const country = d.data().country;
    // Eliminar países con emojis o inválidos
    if (country && (country.includes('🌍') || country.includes('🌎') || country.length > 3)) {
      batch.update(d.ref, { country: '' });
      console.log(d.id, d.data().username, country, '-> ""');
      count++;
    }
  });
  
  if (count > 0) await batch.commit();
  console.log('OK - actualizados:', count);
  process.exit(0);
}

fixCountries().catch(e => { console.error(e); process.exit(1); });