const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  const snap = await db.collection('users')
    .where('username', '==', 'CristianCL')
    .get();
  
  if (snap.empty) {
    console.log('No encontrado CristianCL');
    // Buscar todos los fake users con sufijos de país
    const fakeSnap = await db.collection('users')
      .where('isFake', '==', true)
      .limit(5)
      .get();
    fakeSnap.forEach(doc => {
      const d = doc.data();
      console.log(doc.id, '| username:', d.username, '| country:', d.country);
    });
  } else {
    snap.forEach(doc => {
      console.log(doc.id, JSON.stringify(doc.data()));
    });
  }
}

main().catch(console.error);