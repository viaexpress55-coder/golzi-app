const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Fix código invitación - todos los planes
liga = liga.replace(
  `user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())`,
  `user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen`
);

// Verificar línea 30834
const idx = liga.indexOf(`inviteOpen) && (`);
console.log('idx 30834 area:', liga.substring(idx - 150, idx + 200));

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');