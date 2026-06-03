const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

// Fix 1: Importar COUNTRY_FLAGS
profile = profile.replace(
  `import { useTranslation } from 'react-i18next';`,
  `import { useTranslation } from 'react-i18next';
import { COUNTRY_FLAGS } from '../../locales/i18n';`
);

// Fix 2: País con bandera
profile = profile.replace(
  `{ lbl: t('profile_country'),val: country },`,
  `{ lbl: t('profile_country'), val: (COUNTRY_FLAGS[country] || '') + ' ' + country },`
);

// Fix 3: Upgrade text
i18n = i18n.replace(
  `profile_upgrade: 'MEJORAR A LIGA — $4.99/torneo',`,
  `profile_upgrade: 'CREA TU LIGA — DESDE $9.99',`
);

// Fix 4: Eliminar botón notif — buscar por contenido exacto
const notifBtnIdx = profile.indexOf(`style={s.notifBtn}`);
if (notifBtnIdx !== -1) {
  // Buscar el TouchableOpacity que contiene notifBtn
  let searchBack = notifBtnIdx;
  while (searchBack > 0 && !profile.substring(searchBack, searchBack+20).includes('<TouchableOpacity')) {
    searchBack--;
  }
  const notifEnd = profile.indexOf('</TouchableOpacity>', notifBtnIdx) + '</TouchableOpacity>'.length;
  // Verificar que el bloque es razonable (menos de 500 chars)
  if (notifEnd - searchBack < 500) {
    profile = profile.slice(0, searchBack) + profile.slice(notifEnd);
    console.log('OK notif eliminado');
  } else {
    console.log('Bloque muy largo:', notifEnd - searchBack);
  }
}

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK bandera:', profile.includes('COUNTRY_FLAGS[country]'));
console.log('OK upgrade:', i18n.includes('CREA TU LIGA'));
console.log('OK notif:', !profile.includes('notifBtn'));