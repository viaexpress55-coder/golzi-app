const admin = require('./node_modules/firebase-admin/lib/index.js');
const sa = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
admin.auth().getUserByEmail('golziapp@gmail.com').then(u => {
  console.log('UID:', u.uid);
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });