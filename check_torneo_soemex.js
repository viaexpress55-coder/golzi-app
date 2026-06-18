const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  console.log('--- public_tournaments ---');
  const snap1 = await db.collection('public_tournaments').get();
  console.log('Total:', snap1.size);
  snap1.forEach(d => console.log(d.id, '|', d.data().name));

  console.log('--- tournaments (root) ---');
  const snap2 = await db.collection('tournaments').get();
  console.log('Total:', snap2.size);
  snap2.forEach(d => console.log(d.id, '|', d.data().name));

  console.log('--- leagues con tournaments subcollection ---');
  const leaguesSnap = await db.collection('leagues').get();
  for (const leagueDoc of leaguesSnap.docs) {
    const tSnap = await leagueDoc.ref.collection('tournaments').get();
    if (!tSnap.empty) {
      console.log('Liga:', leagueDoc.id, '| Torneos:', tSnap.size);
      tSnap.forEach(t => console.log('  -', t.id, '|', t.data().name));
    }
  }
}

main().catch(console.error);