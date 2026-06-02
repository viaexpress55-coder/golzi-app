const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix paywall sub — usar índice directo
const subIdx = ranking.indexOf('Desbloquea el ranking completo con');
if (subIdx !== -1) {
  // Encontrar el cierre del Text
  const subEnd = ranking.indexOf('</Text>', subIdx) + '</Text>'.length;
  console.log('Reemplazando:', ranking.substring(subIdx - 20, subEnd));
  ranking = ranking.slice(0, subIdx - 20) + 
    `<Text style={pw.sub}>Unete a una liga para ver el ranking completo</Text>` + 
    ranking.slice(subEnd);
}

// Fix contador GOLZAIRES en header
ranking = ranking.replace(
  /\{[^}]*\}\s*GOLZAIRES/g,
  (match) => {
    console.log('Contador encontrado:', match);
    return match;
  }
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK - paywall fix:', !ranking.includes('Desbloquea el ranking'));