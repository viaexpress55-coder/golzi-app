const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Verificar qué dice globalSorted ahora
const i = ranking.indexOf('globalSorted');
console.log('globalSorted:', ranking.substring(i, i+100));

// Eliminar MOCK_GLOBAL como fallback
ranking = ranking.replace(
  `const globalSorted = [...globalData].sort((a,b) => b.pts - a.pts);`,
  `const globalSorted = globalData.length > 0 ? [...globalData].sort((a,b) => b.pts - a.pts) : [];`
);

// También verificar si hay otro uso de MOCK_GLOBAL
let idx = 0;
while ((idx = ranking.indexOf('MOCK_GLOBAL', idx)) !== -1) {
  console.log('MOCK_GLOBAL en:', idx, ranking.substring(idx-20, idx+60));
  idx++;
}

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');