const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix 1: Username vacío — usar primeras letras del ID
ranking = ranking.replace(
  `username: d.data().username || 'Golzaire',`,
  `username: d.data().username || ('User' + d.id.slice(0,4)),`
);

// Fix 2: Eliminar fallback a MOCK_GLOBAL — solo datos reales
ranking = ranking.replace(
  `const globalSorted = (globalData.length > 0 ? globalData : MOCK_GLOBAL).sort((a,b) => b.pts - a.pts);`,
  `const globalSorted = [...globalData].sort((a,b) => b.pts - a.pts);`
);

ranking = ranking.replace(
  `{globalData.length || MOCK_GLOBAL.length}`,
  `{globalData.length}`
);

// Fix 3: Footer contador
ranking = ranking.replace(
  `{globalData.length || MOCK_GLOBAL.length} {t('ranking_participants')}`,
  `{globalData.length} {t('ranking_participants')}`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');