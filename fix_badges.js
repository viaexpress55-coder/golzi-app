const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Todos los badges deben empezar bloqueados
profile = profile.replace(/earned:true/g, 'earned:false');

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK - earned:true restantes:', (profile.match(/earned:true/g)||[]).length);