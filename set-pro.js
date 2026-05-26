const admin = require('./node_modules/firebase-admin/lib/index.js');
const sa = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
admin.firestore().collection('users').doc('WKnyB57KasdSDpwSqFnEC3nvMDD2').update({
  plan: 'pro',
  planExpiry: new Date('2027-01-01')
}).then(() => { console.log('✅ Plan PRO asignado'); process.exit(0); })
.catch(e => { console.error(e); process.exit(1); });