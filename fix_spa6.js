const fs = require('fs');

// Fix SplashScreen - pasar inviteCode como parámetro a Liga
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');

splash = splash.replace(
  `setTimeout(() => {
            navigation.navigate('Main');
            // Dar tiempo para que Main monte y luego LigaScreen lea el pending
          }, 500);`,
  `const inviteCode = localStorage.getItem('golzi_pending_invite');
            setTimeout(() => {
              navigation.navigate('Main', {
                screen: 'Liga',
                params: { inviteCode }
              } as any);
            }, 500);`
);

fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash);
console.log('OK:', splash.includes('screen: \'Liga\''));