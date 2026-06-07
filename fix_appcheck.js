const fs = require('fs');

// Agregar App Check a firebase.ts
const path = 'src/services/firebase.ts';
let content = fs.readFileSync(path, 'utf8');

// Verificar si ya tiene App Check
if (content.includes('app-check')) {
  console.log('⚠️  App Check ya configurado');
} else {
  // Agregar import de App Check
  const oldImport = `import { initializeApp } from 'firebase/app';`;
  const newImport = `import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';`;

  content = content.replace(oldImport, newImport);

  // Agregar inicialización después de initializeApp
  const oldInit = `const app = initializeApp(firebaseConfig);`;
  const newInit = `const app = initializeApp(firebaseConfig);

// App Check — protección contra bots y abuso
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LfXhxItAAAAAGxVk0tZUnyNVuARc-1s2jHRaLn4'),
    isTokenAutoRefreshEnabled: true,
  });
}`;

  content = content.replace(oldInit, newInit);
  fs.writeFileSync(path, content, 'utf8');
  console.log('✅ App Check agregado a firebase.ts');
}