const fs = require('fs');
const c = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Buscar textos hardcodeados
const m = c.match(/'[A-Za-zÀ-ÿ][^']{2,60}'/g);
if (m) [...new Set(m)].filter(x => 
  !x.includes('rgba') && !x.includes('font') && !x.includes('Barlow') && 
  !x.includes('Bebas') && !x.includes('center') && !x.includes('firebase') && 
  !x.includes('react') && !x.includes('expo') && !x.includes('correct') &&
  !x.includes('pending') && !x.includes('users') && x.length > 6
).forEach(x => console.log(x));