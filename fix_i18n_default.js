const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

// Agregar LATAM_COUNTRIES después de deviceCountry
i18n = i18n.replace(
  `const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'es';\r\nconst deviceCountry = Localization.getLocales()[0]?.regionCode || 'CO';`,
  `const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'es';\r\nconst deviceCountry = Localization.getLocales()[0]?.regionCode || 'CO';\r\nconst LATAM_COUNTRIES = ['CO','MX','AR','BR','CL','VE','PE','EC','UY','PY','BO','CR','PA','GT','HN','SV','NI','DO','CU','PR'];\r\nconst defaultLanguage = LATAM_COUNTRIES.includes(deviceCountry) ? 'es' : (SUPPORTED_LANGUAGES.includes(deviceLanguage) ? deviceLanguage : 'es');`
);

// Fix selectedLanguage para usar defaultLanguage
const selIdx = i18n.indexOf('selectedLanguage');
const selEnd = i18n.indexOf(';', selIdx) + 1;
console.log('selectedLanguage:', i18n.substring(selIdx-20, selEnd));

i18n = i18n.replace(
  `lng: selectedLanguage,`,
  `lng: selectedLanguage || defaultLanguage,`
);

fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK LATAM:', i18n.includes('LATAM_COUNTRIES'));
console.log('OK lng:', i18n.includes('defaultLanguage'));