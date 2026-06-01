const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Verificar si ya está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function updateMatch() {
  await db.collection('matches').doc('WC2026_A01').update({
    homeScore: 1,
    awayScore: 0,
    status: 'finished',
  });
  console.log('OK - Partido actualizado: México 1 - 0 Sudáfrica');
  process.exit(0);
}

updateMatch().catch(console.error);