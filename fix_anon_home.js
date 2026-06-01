const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

home = home.replace(
  `async function confirm(id: string) {
    const match = matches.find(m => m.id === id);
    try {
      const user = getAuth().currentUser;
      if (user) {`,
  `async function confirm(id: string) {
    const match = matches.find(m => m.id === id);
    const user = getAuth().currentUser;
    if (!user?.email) {
      Alert.alert('Cuenta requerida', 'Debes crear una cuenta para predecir. Es gratis!', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear cuenta', onPress: () => navigation.navigate('Register') },
      ]);
      return;
    }
    try {
      if (user) {`
);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK');