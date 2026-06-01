const fs = require('fs');
let c = fs.readFileSync('src/screens/mundial/MundialScreen.tsx', 'utf8');

// Buscar donde se muestra el nombre del grupo en el header
const i = c.indexOf('groupTitle');
console.log('groupTitle:', c.substring(i-20, i+150));

const j = c.indexOf('groupName');
console.log('groupName:', c.substring(j-20, j+150));

// Buscar el Text con g.name
const k = c.indexOf('{g.name}');
console.log('g.name en JSX:', c.substring(k-50, k+100));