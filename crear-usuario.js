const admin = require('./node_modules/firebase-admin/lib/index.js');
const sa = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
admin.firestore().collection('users').doc('Gpu9FG7tdSR6zx0dXNGJilcv9AI2').set({
  plan: 'pro',
  userId: 'Gpu9FG7tdSR6zx0dXNGJilcv9AI2',
  username: 'GolziTest',
  country: 'CO',
  language: 'es',
  timezone: 'America/Bogota',
  totalPoints: 0,
  currentStreak: 0,
  planExpiry: new Date('2027-01-01')
}).then(() => { console.log('✅ Documento creado'); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); });