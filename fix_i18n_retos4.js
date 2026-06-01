const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

const idx = home.indexOf('reto={reto} match={m}');
home = home.slice(0, idx) + 'reto={{...reto, label: t(reto.label)}} match={m}' + home.slice(idx + 'reto={reto} match={m}'.length);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK:', home.includes('reto={{...reto, label: t(reto.label)}}'));