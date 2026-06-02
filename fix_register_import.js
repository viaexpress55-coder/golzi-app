const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Buscar todos los imports de firebase/firestore y db
let idx = 0;
while ((idx = register.indexOf('firebase/firestore', idx)) !== -1) {
  console.log(idx + ':', register.substring(idx-30, idx+60));
  idx++;
}
console.log('---');
idx = 0;
while ((idx = register.indexOf("services/firebase'", idx)) !== -1) {
  console.log(idx + ':', register.substring(idx-30, idx+60));
  idx++;
}