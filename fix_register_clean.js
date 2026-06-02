const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Fix 1: eliminar doble ;; en import db
register = register.replace(
  `import { db } from '../../services/firebase';;`,
  `import { db } from '../../services/firebase';`
);

// Fix 2: eliminar import duplicado de db que se agregó
register = register.replace(
  `import { collection, query, where, getDocs } from 'firebase/firestore';\nimport { db } from '../../services/firebase';\n`,
  `import { collection, query, where, getDocs } from 'firebase/firestore';\n`
);

// Verificar resultado
const dbCount = (register.match(/import \{ db \}/g) || []).length;
const firestoreCount = (register.match(/firebase\/firestore/g) || []).length;
console.log('import db count:', dbCount);
console.log('firestore imports:', firestoreCount);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', register);
console.log('OK');