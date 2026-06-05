const fs = require('fs');
const filePath = 'src/screens/register/RegisterScreen.tsx';
let src = fs.readFileSync(filePath, 'utf8');

// Fix: agregar ; y newline después del .map(c => ({ ...c, flag: '' }))
src = src.replace(
  `].map(c => ({ ...c, flag: '' }))mport React`,
  `].map(c => ({ ...c, flag: '' }));\nimport React`
);

fs.writeFileSync(filePath, src, 'utf8');
console.log('✅ Syntax fix aplicado');