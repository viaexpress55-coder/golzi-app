const fs = require('fs');
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');

// Reemplazar el pending_invite existente para también leer golzi_redirect_path
splash = splash.replace(
  `const savedLang = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('golzi_lang') : null;
    // Detectar deep link de liga en URL web
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/\\/liga\\/([A-Z0-9-]+)/i);
      if (match) {
        localStorage.setItem('golzi_pending_invite', match[1]);
      }
    }`,
  `const savedLang = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('golzi_lang') : null;
    // Detectar deep link de liga — desde URL directa o desde redirect SPA
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Intentar desde URL actual
      const path = window.location.pathname;
      const matchUrl = path.match(/\\/liga\\/([A-Z0-9-]+)/i);
      if (matchUrl) {
        localStorage.setItem('golzi_pending_invite', matchUrl[1]);
      }
      // Intentar desde redirect path guardado
      const redirectPath = localStorage.getItem('golzi_redirect_path');
      if (redirectPath) {
        localStorage.removeItem('golzi_redirect_path');
        const matchRedirect = redirectPath.match(/\\/liga\\/([A-Z0-9-]+)/i);
        if (matchRedirect) {
          localStorage.setItem('golzi_pending_invite', matchRedirect[1]);
        }
      }
    }`
);

fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash);
console.log('OK:', splash.includes('golzi_redirect_path'));