const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  const snap = await db.collection('matches')
    .where('status', '==', 'finished')
    .get();
  
  console.log('Total partidos finished:', snap.size);
  snap.forEach(d => {
    const data = d.data();
    console.log(d.id, '|', data.homeTeam, data.homeScore, '-', data.awayScore, data.awayTeam, '| status:', data.status);
  });
}

main().catch(console.error);