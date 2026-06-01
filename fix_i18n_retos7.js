const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Buscar el texto exacto en JSX con el estilo retosToggleTitle
const marker = '>RETOS RÁPIDOS<';
const idx = home.indexOf(marker);
console.log('idx:', idx);
if (idx !== -1) {
  home = home.slice(0, idx + 1) + "{t('home_retos_rapidos')}" + home.slice(idx + marker.length - 1);
  console.log('OK');
} else {
  // Buscar sin tilde
  const marker2 = '>RETOS R';
  const idx2 = home.indexOf(marker2);
  console.log('idx2:', idx2);
  console.log(home.substring(idx2, idx2 + 50));
}

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);