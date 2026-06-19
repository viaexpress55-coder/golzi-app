const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  const snap = await db.collection('matches')
    .where('homeTeam', '==', 'Escocia')
    .get();
  
  snap.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, '| homeTeam:', data.homeTeam, '| homeFlag:', JSON.stringify(data.homeFlag));
  });

  const snap2 = await db.collection('matches')
    .where('awayTeam', '==', 'Escocia')
    .get();
  
  snap2.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, '| awayTeam:', data.awayTeam, '| awayFlag:', JSON.stringify(data.awayFlag));
  });
}

main().catch(console.error);