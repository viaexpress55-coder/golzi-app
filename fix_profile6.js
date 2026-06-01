const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Eliminar la línea duplicada de RETOS
profile = profile.replace(
  `{ val: String(challenges.length), lbl: 'RETOS', c: C.cyan },
            { val: String(challenges.length), lbl: 'RETOS', c: C.cyan },`,
  `{ val: String(challenges.length), lbl: 'RETOS', c: C.cyan },`
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK');