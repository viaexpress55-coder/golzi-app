const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix doble 
ranking = ranking.replace(
  `<<Text style={pw.sub}>Unete a una liga para ver el ranking completo</Text></Text>`,
  `<Text style={pw.sub}>Unete a una liga para ver el ranking completo</Text>`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK:', !ranking.includes('<<Text'));