const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const auth = admin.auth();

async function create() {
  // Crear usuario en Firebase Auth
  const user = await auth.createUser({
    email: 'golzitest@gmail.com',
    password: 'Golzi2026!',
    displayName: 'GolziGold',
  });
  
  // Crear perfil en Firestore
  await db.collection('users').doc(user.uid).set({
    userId: user.uid,
    username: 'GolziGold',
    country: 'CO',
    language: 'es',
    plan: 'GOLD',
    planExpiry: '2027-01-01',
    totalPoints: 0,
    currentStreak: 0,
    maxStreak: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  console.log('✅ Usuario creado');
  console.log('Email: golzitest@gmail.com');
  console.log('Password: Golzi2026!');
  console.log('Plan: GOLD');
  console.log('UID:', user.uid);
}
create().catch(console.error);