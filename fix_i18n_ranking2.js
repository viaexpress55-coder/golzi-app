const fs = require('fs');

// Agregar clave ranking_paises al i18n
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');
const paisesKeys = {
  es: 'PAISES', en: 'COUNTRIES', pt: 'PAISES', fr: 'PAYS',
  de: 'LAENDER', it: 'PAESI', ru: 'СТРАНЫ', ar: 'دول',
  zh: '国家', ja: '国々', ko: '국가들', hi: 'देश'
};
Object.keys(paisesKeys).forEach(lang => {
  const searchStr = `${lang}: {\r\n    translation: {`;
  i18n = i18n.replace(searchStr, `${searchStr}\n      ranking_paises: '🌍 ${paisesKeys[lang]}',`);
});
fs.writeFileSync('src/locales/i18n.ts', i18n);

// Actualizar RankingScreen
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');
ranking = ranking.replace(`'🌍 PAÍSES'`, `t('ranking_paises')`);
fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK:', ranking.includes("t('ranking_paises')"));