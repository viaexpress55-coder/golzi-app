const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix 1: Contador total — usar globalData.length en lugar de MOCK_GLOBAL.length
ranking = ranking.replace(
  `{MOCK_GLOBAL.length} GOLZAIRES`,
  `{globalData.length || MOCK_GLOBAL.length} GOLZAIRES`
);

// Fix 2: Texto paywall — buscar el texto sub que quedó
ranking = ranking.replace(
  `<Text style={pw.sub}>Unete a una liga activa para ver el ranking completo</Text>`,
  `<Text style={pw.sub}>Unete a una liga para ver el ranking completo</Text>`
);

// También buscar si quedó el texto viejo
const oldPaywall = ranking.indexOf('GOLZAIR');
if (oldPaywall !== -1) {
  console.log('GOLZAIR encontrado en:', ranking.substring(oldPaywall - 50, oldPaywall + 100));
}

// Fix 3: Username — si es email mostrar solo la parte antes del @
ranking = ranking.replace(
  `{player.username}`,
  `{player.username?.includes('@') ? player.username.split('@')[0] : player.username}`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');