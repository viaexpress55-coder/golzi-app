const fs = require('fs');
let mundial = fs.readFileSync('src/screens/mundial/MundialScreen.tsx', 'utf8');

mundial = mundial.replace(
  `>GRUPO {g.name}<`,
  `>{t('mundial_group')} {g.name}<`
);

// También en fixture — "Grupo A" como separador
mundial = mundial.replace(
  />\s*Grupo ([A-Z])\s*</g,
  `>{t('mundial_group')} $1<`
);

fs.writeFileSync('src/screens/mundial/MundialScreen.tsx', mundial);
console.log('OK:', mundial.includes("t('mundial_group')"));