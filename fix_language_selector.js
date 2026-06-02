const fs = require('fs');
const c = fs.readFileSync('src/locales/i18n.ts', 'utf8');
console.log(c.substring(0, 800));