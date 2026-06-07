const fs = require('fs');
let content = fs.readFileSync('src/locales/i18n.ts', 'utf8');

// KO
content = content.replace(
  `splash_enter: 'GOLZAIR\ub85c \ucc38\uac00'`,
  `splash_title: '2026 \uc6d4\ub4dc\ucef5', splash_select_lang: '\uc5b8\uc5b4 \uc120\ud0dd', splash_info: '16\uac1c \uac1c\uce58 \ub3c4\uc2dc \u00b7 48\uac1c \ud300', splash_enter: 'GOLZAIR\ub85c \ucc38\uac00'`
);

if (content.includes('2026 \uc6d4\ub4dc\ucef5')) {
  console.log('✅ KO agregado');
} else {
  console.log('❌ KO falló — buscando marcador exacto...');
  const idx = content.indexOf('GOLZAIR');
  const koIdx = content.indexOf('ko: {');
  const slice = content.substring(koIdx, koIdx + 5000);
  const enterIdx = slice.indexOf('splash_enter');
  console.log('Exacto:', JSON.stringify(slice.substring(enterIdx, enterIdx + 50)));
}

fs.writeFileSync('src/locales/i18n.ts', content, 'utf8');
console.log('✅ Script completado.');