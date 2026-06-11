const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  const snap = await db.collection('matches').limit(3).get();
  snap.forEach(d => {
    const data = d.data();
    console.log(d.id, '| homeTeam:', data.homeTeam, '| homeFlag:', data.homeFlag, '| awayTeam:', data.awayTeam, '| awayFlag:', data.awayFlag);
  });
}
main().catch(console.error);