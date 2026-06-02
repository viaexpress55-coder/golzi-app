const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix contador footer
ranking = ranking.replace(
  `{MOCK_GLOBAL.length} {t('ranking_participants')}`,
  `{globalData.length || MOCK_GLOBAL.length} {t('ranking_participants')}`
);

// Fix username con email
ranking = ranking.replace(
  `{player.username}`,
  `{player.username?.includes('@') ? player.username.split('@')[0] : player.username}`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');