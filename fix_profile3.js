const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Encontrar y eliminar el limit(20) restante
const idx = profile.indexOf('limit(20)');
console.log('Contexto:', profile.substring(idx - 100, idx + 50));

profile = profile.replace(/,?\s*limit\(20\)/g, '');

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK - limit(20) eliminado:', !profile.includes('limit(20)'));