const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Fix TU NIVEL con flecha izquierda
const idx = profile.indexOf("' \u2190 TU NIVEL'");
console.log('idx:', idx);
if (idx !== -1) {
  profile = profile.slice(0, idx) + "' \u2190 ' + t('profile_tu_nivel')" + profile.slice(idx + "' \u2190 TU NIVEL'".length);
} else {
  // Buscar con índice
  const i = profile.indexOf('TU NIVEL');
  const start = profile.lastIndexOf("'", i);
  const end = profile.indexOf("'", i) + 1;
  console.log('Encontrado:', profile.substring(start, end));
  profile = profile.slice(0, start) + `' \u2190 ' + t('profile_tu_nivel')` + profile.slice(end);
}

// Fix Cerrar sesion
profile = profile.replace(/>Cerrar sesion</g, `>{t('profile_logout')}<`);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK TU NIVEL:', profile.includes("t('profile_tu_nivel')"));
console.log('OK Cerrar:', profile.includes("t('profile_logout')"));