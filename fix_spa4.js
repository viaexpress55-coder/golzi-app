const fs = require('fs');
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');

splash = splash.replace(
  `// Auto-redirect si hay pending_invite y usuario ya tiene sesión
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const pending = localStorage.getItem('golzi_pending_invite');
      if (pending) {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Ya tiene sesión — ir directo a Main (LigaScreen leerá el pending)
          setTimeout(() => navigation.navigate('Main'), 300);
        }
      }
    }`,
  `// Auto-redirect si hay pending_invite y usuario ya tiene sesión
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const pending = localStorage.getItem('golzi_pending_invite');
      if (pending) {
        const auth = getAuth();
        // Esperar a que Firebase Auth restaure la sesión
        const unsubAuth = auth.onAuthStateChanged((currentUser) => {
          unsubAuth();
          if (currentUser) {
            setTimeout(() => navigation.navigate('Main'), 300);
          }
        });
      }
    }`
);

fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash);
console.log('OK:', splash.includes('onAuthStateChanged'));