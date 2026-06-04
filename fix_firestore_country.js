const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function fixCountries() {
  // Buscar usuarios con país como nombre completo
  const snap = await db.collection('users').get();
  const batch = db.batch();
  let count = 0;
  
  const nameToCode = {
    'Venezuela':'VE','Colombia':'CO','Mexico':'MX','México':'MX',
    'Argentina':'AR','Brasil':'BR','Chile':'CL','Peru':'PE','Perú':'PE',
    'Ecuador':'EC','Uruguay':'UY','USA':'US','Spain':'ES','España':'ES',
  };
  
  snap.docs.forEach(d => {
    const country = d.data().country;
    if (country && country.length > 2 && nameToCode[country]) {
      batch.update(d.ref, { country: nameToCode[country] });
      console.log(d.id, country, '->', nameToCode[country]);
      count++;
    }
  });
  
  if (count > 0) await batch.commit();
  console.log('OK - actualizados:', count);
  process.exit(0);
}

fixCountries().catch(e => { console.error(e); process.exit(1); });