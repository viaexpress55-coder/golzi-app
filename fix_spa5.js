const fs = require('fs');

// Fix 1: SplashScreen - navegar a Liga directamente
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');
splash = splash.replace(
  `setTimeout(() => navigation.navigate('Main'), 300);`,
  `setTimeout(() => {
            navigation.navigate('Main');
            // Dar tiempo para que Main monte y luego LigaScreen lea el pending
          }, 500);`
);
fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash);
console.log('OK Splash');

// Fix 2: LigaScreen - aumentar delay para leer pending_invite
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');
liga = liga.replace(
  `setTimeout(() => {
              setJoinCode(pending);
              setTab(2);
            }, 800);`,
  `setTimeout(() => {
              setJoinCode(pending);
              setTab(2);
            }, 1500);`
);
fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK Liga');