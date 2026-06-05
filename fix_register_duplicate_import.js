const fs = require('fs');
const filePath = 'src/screens/register/RegisterScreen.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Encontrar la línea con ].map(c => ({ ...c, flag: '' }));
const mapIdx = lines.findIndex(l => l.includes("].map(c => ({ ...c, flag: '' }))"));
console.log('map línea:', mapIdx+1);
console.log('Línea map+1:', lines[mapIdx+1]);
console.log('Línea map+2:', lines[mapIdx+2]);

// Eliminar todas las líneas de import duplicadas después del map
// Buscar siguiente "import React" después del map
let dupStart = -1;
for (let i = mapIdx+1; i < Math.min(mapIdx+20, lines.length); i++) {
  if (lines[i].includes("import React")) {
    dupStart = i;
    break;
  }
}

if (dupStart > 0) {
  // Encontrar hasta dónde llegan los imports duplicados
  let dupEnd = dupStart;
  while (dupEnd < lines.length && (lines[dupEnd].startsWith('import ') || lines[dupEnd].trim() === '' || lines[dupEnd].includes('} from '))) {
    dupEnd++;
  }
  console.log('Eliminando líneas', dupStart+1, 'a', dupEnd);
  lines.splice(dupStart, dupEnd - dupStart);
  console.log('✅ Imports duplicados eliminados');
} else {
  console.warn('⚠️ No se encontraron imports duplicados');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');