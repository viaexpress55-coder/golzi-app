const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix 1: Emoji bandera con imagen flagcdn
ranking = ranking.replace(
  `<Text style={{ fontSize:32 }}>{c.country}</Text>`,
  `<Image source={{uri:\`https://flagcdn.com/w40/\${c.country.toLowerCase()}.png\`}} style={{width:40,height:28,borderRadius:3}} resizeMode="cover"/>`
);

// Fix 2: Nombre completo del país
ranking = ranking.replace(
  `{c.country} {isMyCountry ?`,
  `{getCountryName(c.country)} {isMyCountry ?`
);

// Fix 3: Tab PAIS — también usar nombre completo
ranking = ranking.replace(
  `{p.country}`,
  `{getCountryName(p.country)}`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK flagcdn:', ranking.includes('flagcdn.com/w40'));
console.log('OK getCountryName:', (ranking.match(/getCountryName/g)||[]).length);