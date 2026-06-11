const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  // Crear documento del cliente
  await db.collection('clients').doc('mundial2026').set({
    clientId: 'mundial2026',
    name: 'Mundial 2026',
    slug: 'mundial2026',
    primaryColor: '#FFD700',
    secondaryColor: '#020408',
    logoUrl: 'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5',
    poweredBy: 'GOLZI',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: {
      allowGoogleLogin: true,
      allowEmailLogin: true,
      showWorldCup: true,
      showRanking: true,
      showTournaments: true,
    }
  });

  console.log('✅ Cliente mundial2026 creado en Firestore');

  // Crear liga demo
  await db.collection('clients').doc('mundial2026').collection('leagues').doc('liga-principal').set({
    name: 'Liga Mundial 2026',
    clientId: 'mundial2026',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    memberCount: 0,
  });

  console.log('✅ Liga principal creada');
}

main().catch(console.error);