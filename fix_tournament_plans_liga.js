const fs = require('fs');
const path = 'src/screens/league/LigaScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const TOURNAMENT_PLANS = ['BUSINESS','GOLD','GOLZI PREMIUM'];",
  "const TOURNAMENT_PLANS = ['GOLD','GOLZI PREMIUM'];"
);
console.log('✅ TOURNAMENT_PLANS en LigaScreen corregido — solo GOLD y GOLZI PREMIUM');

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');