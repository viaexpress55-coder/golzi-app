const fs = require('fs');
const c = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');
// Buscar todas las referencias a podiumFlag
let idx = 0;
while ((idx = c.indexOf('podiumFlag', idx)) !== -1) {
  console.log(idx + ':', c.substring(idx-10, idx+60));
  idx++;
}