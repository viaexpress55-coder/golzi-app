const fs = require('fs');

// Agregar claves faltantes
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');
const extraKeys = {
  es: { profile_racha: 'RACHA', profile_tu_nivel: 'TU NIVEL', profile_cerrar: 'Cerrar sesion' },
  en: { profile_racha: 'STREAK', profile_tu_nivel: 'YOUR LEVEL', profile_cerrar: 'Log out' },
  pt: { profile_racha: 'SEQUENCIA', profile_tu_nivel: 'SEU NIVEL', profile_cerrar: 'Sair' },
  fr: { profile_racha: 'SERIE', profile_tu_nivel: 'VOTRE NIVEAU', profile_cerrar: 'Se deconnecter' },
  de: { profile_racha: 'SERIE', profile_tu_nivel: 'IHR LEVEL', profile_cerrar: 'Abmelden' },
  it: { profile_racha: 'SERIE', profile_tu_nivel: 'IL TUO LIVELLO', profile_cerrar: 'Esci' },
  ru: { profile_racha: 'СЕРИЯ', profile_tu_nivel: 'ВАШ УРОВЕНЬ', profile_cerrar: 'Выйти' },
  ar: { profile_racha: 'سلسلة', profile_tu_nivel: 'مستواك', profile_cerrar: 'تسجيل الخروج' },
  zh: { profile_racha: '连胜', profile_tu_nivel: '您的等级', profile_cerrar: '退出登录' },
  ja: { profile_racha: '連勝', profile_tu_nivel: 'あなたのレベル', profile_cerrar: 'ログアウト' },
  ko: { profile_racha: '연승', profile_tu_nivel: '내 레벨', profile_cerrar: '로그아웃' },
  hi: { profile_racha: 'स्ट्रीक', profile_tu_nivel: 'आपका स्तर', profile_cerrar: 'लॉग आउट' },
};
Object.keys(extraKeys).forEach(lang => {
  const keys = extraKeys[lang];
  const searchStr = `${lang}: {\r\n    translation: {`;
  const insertStr = Object.entries(keys).map(([k,v]) => `      ${k}: '${v}',`).join('\n');
  i18n = i18n.replace(searchStr, `${searchStr}\n${insertStr}`);
});
fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK i18n');

// Actualizar ProfileScreen
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');
profile = profile.replace(/>RACHA</g, `>{t('profile_racha')}<`);
profile = profile.replace(`' TU NIVEL'`, `' ' + t('profile_tu_nivel')`);
profile = profile.replace(`→ TU NIVEL'`, `→ ' + t('profile_tu_nivel') + '`);
profile = profile.replace(/>Cerrar sesion</g, `>{t('profile_cerrar')}<`);
fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK ProfileScreen');