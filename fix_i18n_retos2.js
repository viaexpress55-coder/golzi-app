const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

home = home.replace(
  `<Text style={rs.retoLabel}>{reto.label}</Text>`,
  `<Text style={rs.retoLabel}>{t(reto.label)}</Text>`
);

// Fix LOCAL/EMPATE/VISITA/NINGUNO — pueden estar como texto directo en JSX
home = home.replace(/>LOCAL</g, `>{t('reto_local')}<`);
home = home.replace(/>EMPATE</g, `>{t('reto_empate')}<`);
home = home.replace(/>VISITA</g, `>{t('reto_visita')}<`);
home = home.replace(/>NINGUNO</g, `>{t('reto_ninguno')}<`);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK:', home.includes("t(reto.label)"));