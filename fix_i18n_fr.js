const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

i18n = i18n.replace(
  `onboard_have_account: 'J'ai déjà un compte →',`,
  `onboard_have_account: 'Deja un compte →',`
);

fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK');