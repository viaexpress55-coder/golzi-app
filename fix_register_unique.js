const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Verificar imports de Firestore
if (!register.includes('getDocs')) {
  register = register.replace(
    `import { db } from '../../services/firebase';`,
    `import { db } from '../../services/firebase';\r\nimport { collection, query, where, getDocs } from 'firebase/firestore';`
  );
}

// Insertar validación después de setLoading(true); setError('');
const insertAfter = `setLoading(true); setError('');`;
const idx = register.indexOf(insertAfter) + insertAfter.length;

const validation = `\r\n      // Validar username unico\r\n      const usernameSnap = await getDocs(query(collection(db, 'users'), where('username', '==', username.trim())));\r\n      if (!usernameSnap.empty) { setError('Este nombre de usuario ya esta en uso.'); setLoading(false); shake(); return; }\r\n`;

register = register.slice(0, idx) + validation + register.slice(idx);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', register);
console.log('OK:', register.includes('usernameSnap'));