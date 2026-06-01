const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Fix el texto con salto de línea problemático
liga = liga.replace(
  `<Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:'rgba(255,215,0,0.6)', letterSpacing:1, marginTop:8, textAlign:'center' }}>SCANNER DISPONIBLE{'\n'}EN APP NATIVA</Text>`,
  `<Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:'rgba(255,215,0,0.6)', letterSpacing:1, marginTop:8, textAlign:'center' }}>SCANNER EN APP NATIVA</Text>`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');