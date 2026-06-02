const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

home = home.replace(
  `>DESBLOQUEAR — $1.99</Text>`,
  `>{t('home_join_league')}</Text>`
);

// Agregar clave i18n
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');
const keys = {
  es: 'UNETE A UNA LIGA', en: 'JOIN A LEAGUE', pt: 'ENTRE EM UMA LIGA',
  fr: 'REJOINS UNE LIGUE', de: 'TRITT EINER LIGA BEI', it: 'UNISCITI A UNA LEGA',
  ru: 'ВСТУПИ В ЛИГУ', ar: 'انضم لدوري', zh: '加入联赛', ja: 'リーグに参加', 
  ko: '리그 참가', hi: 'लीग जॉइन करें'
};
Object.keys(keys).forEach(lang => {
  const searchStr = `${lang}: {\r\n    translation: {`;
  i18n = i18n.replace(searchStr, `${searchStr}\n      home_join_league: '${keys[lang]}',`);
});

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK:', home.includes("t('home_join_league')"));