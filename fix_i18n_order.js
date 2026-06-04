const fs = require('fs');
let content = fs.readFileSync('src/locales/i18n.ts', 'utf8');

// Eliminar las 3 líneas problemáticas
content = content.replace(
  /const LATAM_COUNTRIES = \[.*?\];\r?\nconst defaultLanguage = .*?;\r?\n/s,
  ''
);

// Insertar después de SUPPORTED_LANGUAGES
const suppEnd = content.indexOf("'hi'];") + "'hi'];".length;
const insert = `\r\nconst LATAM_COUNTRIES = ['CO','MX','AR','BR','CL','VE','PE','EC','UY','PY','BO','CR','PA','GT','HN','SV','NI','DO','CU','PR'];\r\nconst defaultLanguage = LATAM_COUNTRIES.includes(deviceCountry) ? 'es' : (SUPPORTED_LANGUAGES.includes(deviceLanguage) ? deviceLanguage : 'es');\r\n`;

content = content.slice(0, suppEnd) + insert + content.slice(suppEnd);

fs.writeFileSync('src/locales/i18n.ts', content);

const suppIdx = content.indexOf('SUPPORTED_LANGUAGES =');
const defaultIdx = content.indexOf('defaultLanguage =');
console.log('Orden correcto:', suppIdx < defaultIdx);




