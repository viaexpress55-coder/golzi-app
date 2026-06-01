const fs = require('fs');

// Fix i18n — agregar home_si y home_no + retos_rapidos
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

const siNoKeys = {
  es: { home_si: 'SI', home_no: 'NO', home_retos_rapidos: 'RETOS RAPIDOS' },
  en: { home_si: 'YES', home_no: 'NO', home_retos_rapidos: 'QUICK CHALLENGES' },
  pt: { home_si: 'SIM', home_no: 'NAO', home_retos_rapidos: 'DESAFIOS RAPIDOS' },
  fr: { home_si: 'OUI', home_no: 'NON', home_retos_rapidos: 'DEFIS RAPIDES' },
  de: { home_si: 'JA', home_no: 'NEIN', home_retos_rapidos: 'SCHNELLE AUFGABEN' },
  it: { home_si: 'SI', home_no: 'NO', home_retos_rapidos: 'SFIDE RAPIDE' },
  ru: { home_si: 'ДА', home_no: 'НЕТ', home_retos_rapidos: 'БЫСТРЫЕ ЗАДАНИЯ' },
  ar: { home_si: 'نعم', home_no: 'لا', home_retos_rapidos: 'تحديات سريعة' },
  zh: { home_si: '是', home_no: '否', home_retos_rapidos: '快速挑战' },
  ja: { home_si: 'はい', home_no: 'いいえ', home_retos_rapidos: 'クイックチャレンジ' },
  ko: { home_si: '예', home_no: '아니오', home_retos_rapidos: '빠른 챌린지' },
  hi: { home_si: 'हाँ', home_no: 'नहीं', home_retos_rapidos: 'त्वरित चुनौतियाँ' },
};

Object.keys(siNoKeys).forEach(lang => {
  const keys = siNoKeys[lang];
  const searchStr = `${lang}: {\r\n    translation: {`;
  const insertStr = Object.entries(keys).map(([k,v]) => `      ${k}: '${v}',`).join('\n');
  i18n = i18n.replace(searchStr, `${searchStr}\n${insertStr}`);
});
fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK i18n');

// Fix HomeScreen — SÍ/NO en opciones yn
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

home = home.replace(
  `t('home_si') || 'SI'`,
  `t('home_si')`
);

// Buscar donde están las opciones yn hardcodeadas
const idx = home.indexOf("val:'yes', label:'S");
console.log('yn options idx:', idx);
console.log(home.substring(idx - 20, idx + 100));