const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

// Buscar y mostrar el texto actual
const idx = i18n.indexOf('profile_upgrade');
console.log('Texto actual:', i18n.substring(idx, idx+80));

// Reemplazar por índice
const start = idx;
const end = i18n.indexOf('\n', start);
i18n = i18n.slice(0, start) + `profile_upgrade: 'CREA TU LIGA — DESDE $9.99',` + i18n.slice(end);

fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK:', i18n.substring(idx, idx+60));