const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

liga = liga.replace(
  `if (!joinCode.trim()) { setJoinError('Ingresa el código'); return; }
    if (!user) { setJoinError('Debes iniciar sesión'); return; }`,
  `if (!joinCode.trim()) { setJoinError('Ingresa el codigo'); return; }
    if (!user) { setJoinError('Debes iniciar sesion'); return; }
    if (!user.email) { setJoinError('Debes crear una cuenta para unirte a una liga'); return; }`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');