const fs = require('fs');
let c = fs.readFileSync('App.tsx', 'utf8');
// Agregar comentario para forzar rebuild
c = c.replace(
  `import './src/locales/i18n';`,
  `import './src/locales/i18n'; // v${Date.now()}`
);
fs.writeFileSync('App.tsx', c, 'utf8');
console.log('✅ Cache bust aplicado');