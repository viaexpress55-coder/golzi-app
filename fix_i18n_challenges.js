const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

const langs = {
  en: 'CHALLENGES', pt: 'DESAFIOS', fr: 'DEFIS', de: 'HERAUSFORDERUNGEN',
  it: 'SFIDE', ru: 'ЗАДАНИЯ', ar: 'التحديات', zh: '挑战', ja: 'チャレンジ',
  ko: '챌린지', hi: 'चुनौतियाँ'
};

Object.keys(langs).forEach(lang => {
  const searchStr = `${lang}: {\r\n    translation: {`;
  i18n = i18n.replace(searchStr, `${searchStr}\n      profile_challenges: '${langs[lang]}',`);
});

fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK');