const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Invertir colores: verde = abierto, rojo = cerrado
liga = liga.replace(
  `colors={selectedLeague.inviteOpen ? ['rgba(255,51,85,0.12)','rgba(255,51,85,0.04)'] : ['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']}
                        style={[s.shareBtnInner, {borderColor: selectedLeague.inviteOpen ? 'rgba(255,51,85,0.4)' : 'rgba(0,255,135,0.4)'}]}`,
  `colors={selectedLeague.inviteOpen ? ['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)'] : ['rgba(255,51,85,0.12)','rgba(255,51,85,0.04)']}
                        style={[s.shareBtnInner, {borderColor: selectedLeague.inviteOpen ? 'rgba(0,255,135,0.4)' : 'rgba(255,51,85,0.4)'}]}`
);

liga = liga.replace(
  `{color: selectedLeague.inviteOpen ? '#FF3355' : '#00FF87'}`,
  `{color: selectedLeague.inviteOpen ? '#00FF87' : '#FF3355'}`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');