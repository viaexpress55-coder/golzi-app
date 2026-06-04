const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Verificar cómo está countryRanking
const idx = ranking.indexOf('countryRanking');
console.log('countryRanking:', ranking.substring(idx, idx+150));

// Agregar filtro directamente
ranking = ranking.replace(
  `const countryRanking = calcCountryRanking((globalData.length > 0 ? globalData : []).filter(p => p.country && p.country.length === 2));`,
  `const countryRanking = calcCountryRanking((globalData.length > 0 ? globalData : []).filter(p => p.country && p.country.length === 2 && p.country !== '🌍'));`
);

// Si no existe el filtro aún
if (!ranking.includes('country.length === 2')) {
  ranking = ranking.replace(
    `const countryRanking = calcCountryRanking(globalData.length > 0 ? globalData : []);`,
    `const countryRanking = calcCountryRanking((globalData.length > 0 ? globalData : []).filter(p => p.country && p.country.length === 2));`
  );
}

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK filtro:', ranking.includes('country.length === 2'));