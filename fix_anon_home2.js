const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

const confirmIdx = home.indexOf('async function confirm(id: string)');
const tryIdx = home.indexOf('try {', confirmIdx);

const before = home.substring(0, tryIdx);
const after = home.substring(tryIdx);

const insert = `const user = getAuth().currentUser;
    if (!user?.email) {
      Alert.alert('Cuenta requerida', 'Debes crear una cuenta para predecir. Es gratis!', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear cuenta', onPress: () => navigation.navigate('Register') },
      ]);
      return;
    }
    `;

// Remover el 'const user = getAuth().currentUser;' que ya existe dentro del try
const newAfter = after.replace('const user = getAuth().currentUser;\n      if (user) {', 'if (user) {');

home = before + insert + newAfter;

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK - includes Crear cuenta:', home.includes('Crear cuenta'));