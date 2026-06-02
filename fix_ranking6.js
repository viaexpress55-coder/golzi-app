const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

ranking = ranking.replace(
  `{MOCK_GLOBAL.length}`,
  `{globalData.length || MOCK_GLOBAL.length}`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');