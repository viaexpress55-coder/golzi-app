const fs = require('fs');

// Fix 1: SplashScreen — detectar inviteCode en URL web y guardarlo
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');

const oldSavedLang = `const savedLang = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('golzi_lang') : null;`;

const newSavedLang = `const savedLang = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('golzi_lang') : null;
    // Detectar deep link de liga en URL web
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/\\/liga\\/([A-Z0-9-]+)/i);
      if (match) {
        localStorage.setItem('golzi_pending_invite', match[1]);
      }
    }`;

splash = splash.replace(oldSavedLang, newSavedLang);
fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash);
console.log('OK - SplashScreen fix aplicado');

// Fix 2: LigaScreen — leer pending invite al cargar
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

const oldAuthEffect = `const unsub = auth.onAuthStateChanged(async u => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setUserData(snap.data());
      }
    });`;

const newAuthEffect = `const unsub = auth.onAuthStateChanged(async u => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setUserData(snap.data());
        // Revisar si hay invite pendiente desde deep link web
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const pending = localStorage.getItem('golzi_pending_invite');
          if (pending) {
            localStorage.removeItem('golzi_pending_invite');
            setJoinCode(pending);
            setTab(2);
          }
        }
      }
    });`;

liga = liga.replace(oldAuthEffect, newAuthEffect);
fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK - LigaScreen deep link fix aplicado');