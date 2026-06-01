const fs = require('fs');
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');

// Agregar import de getAuth si no existe
if (!splash.includes('getAuth')) {
  splash = splash.replace(
    `import { useNavigation } from '@react-navigation/native';`,
    `import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';`
  );
}

// Agregar lógica de auto-redirect después de procesar el pending_invite
splash = splash.replace(
  `Animated.timing(fadeAnim, { toValue:1, duration:800, useNativeDriver:false }).start();`,
  `Animated.timing(fadeAnim, { toValue:1, duration:800, useNativeDriver:false }).start();

    // Auto-redirect si hay pending_invite y usuario ya tiene sesión
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
    }`
);

fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash);
console.log('OK:', splash.includes('Auto-redirect'));
