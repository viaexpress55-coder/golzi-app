const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Encontrar y eliminar el require de db interno
const reqDbIdx = register.indexOf("const { db } = require('../../services/firebase');");
console.log('require db en:', reqDbIdx);
console.log('contexto:', register.substring(reqDbIdx-50, reqDbIdx+100));

if (reqDbIdx !== -1) {
  register = register.replace(
    `const { db } = require('../../services/firebase');`,
    ``
  );
}

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', register);
console.log('OK requires db:', (register.match(/require.*services\/firebase/g) || []).length);