const fs = require('fs');
let c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Buscar la nota gris
const i = c.indexOf('countryNoteTxt');
if (i !== -1) {
  // Encontrar el View que la contiene
  const viewStart = c.lastIndexOf('<View', i);
  const viewEnd = c.indexOf('</View>', i) + '</View>'.length;
  console.log('Nota:', c.substring(viewStart, viewEnd+10));
  // Eliminar
  c = c.slice(0, viewStart) + c.slice(viewEnd);
  console.log('OK eliminado');
} else {
  // Buscar por texto
  const j = c.indexOf('Elige tu país de origen');
  console.log('Texto en:', j);
  console.log('Contexto:', c.substring(j-100, j+200));
}

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', c);