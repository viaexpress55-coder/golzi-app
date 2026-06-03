const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

profile = profile.replace(
  `import { COUNTRY_FLAGS } from '../../locales/i18n';\nimport { COUNTRY_FLAGS } from '../../locales/i18n';`,
  `import { COUNTRY_FLAGS } from '../../locales/i18n';`
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
const count = (profile.match(/import \{ COUNTRY_FLAGS \}/g)||[]).length;
console.log('OK - imports COUNTRY_FLAGS:', count);