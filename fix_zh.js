const fs = require('fs');
let c = fs.readFileSync('src/locales/i18n.ts', 'utf8');
const find = "reto_ht_result: '\u534a\u573a\u7ed3\u679c\uff1f',";
const add = "reto_yellow_cards: '\u4e24\u961f\u9ec4\u724c\u603b\u6570\u5728\u54ea\u4e2a\u8303\u56f4?', ";
if (c.includes(find)) {
  c = c.replace(find, add + find);
  fs.writeFileSync('src/locales/i18n.ts', c, 'utf8');
  console.log('✅ ZH agregado');
} else {
  console.log('❌ no encontrado');
}