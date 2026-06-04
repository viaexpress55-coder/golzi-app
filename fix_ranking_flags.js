const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix calcCountryRanking — normalizar país antes de agrupar
ranking = ranking.replace(
  `  for (const p of players) {
    if (!map[p.country]) map[p.country] = { country: p.country, total: 0, count: 0, exact: 0 };
    map[p.country].total += p.pts;`,
  `  for (const p of players) {
    const countryKey = normalizeCountry(p.country);
    if (!map[countryKey]) map[countryKey] = { country: countryKey, total: 0, count: 0, exact: 0 };
    map[countryKey].total += p.pts;`
);

// También arreglar las líneas siguientes del loop
ranking = ranking.replace(
  `map[p.country].count += 1;
    map[p.country].exact += p.exact ?? 0;`,
  `map[countryKey].count += 1;
    map[countryKey].exact += p.exact ?? 0;`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK:', ranking.includes('countryKey'));