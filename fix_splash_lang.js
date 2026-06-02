const fs = require('fs');
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');

// Fix clave de idioma
splash = splash.replace(
  `localStorage.getItem('golzi_lang')`,
  `localStorage.getItem('golzi_language')`
);

// También agregar import de AsyncStorage si no existe
if (!splash.includes('AsyncStorage')) {
  splash = splash.replace(
    `import { useNavigation } from '@react-navigation/native';`,
    `import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';`
  );
}

// Guardar idioma seleccionado en SplashScreen usando AsyncStorage
splash = splash.replace(
  `i18n.changeLanguage(lang.i18n);`,
  `i18n.changeLanguage(lang.i18n);
      AsyncStorage.setItem('golzi_language', lang.i18n).catch(() => {});
      if (typeof localStorage !== 'undefined') localStorage.setItem('golzi_language', lang.i18n);`
);

fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash);
console.log('OK');