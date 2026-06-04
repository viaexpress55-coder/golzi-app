const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Excluir usuarios sin país válido del countryRanking
ranking = ranking.replace(
  `const countryRanking = calcCountryRanking((globalData.length > 0 ? globalData : []).filter(p => p.country && p.country.length === 2 && p.country !== 'XX'));`,
  `const countryRanking = calcCountryRanking((globalData.length > 0 ? globalData : []).filter(p => p.country && p.country.length === 2 && p.country !== 'XX' && p.country !== '🌍'));`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK:', ranking.includes("p.country !== '🌍'"));