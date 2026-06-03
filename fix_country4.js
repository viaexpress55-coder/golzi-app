const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Fix 1: Eliminar nota gris duplicada
register = register.replace(
  `<View style={s.countryNote}>
          <Text style={s.countryNoteTxt}>
            🌍 Elige tu país de origen. No tiene que participar en el Mundial — define tu ranking global y el emoji de tu bandera en el perfil. Es obligatorio para completar el registro.
          </Text>
        </View>`,
  ``
);

// Fix 2: Modal FlatList usar ALL_COUNTRIES
const flatIdx = register.indexOf('data={', register.indexOf('FlatList\r\n') !== -1 ? register.indexOf('FlatList\r\n') : register.indexOf('FlatList\n'));
console.log('FlatList data:', register.substring(flatIdx, flatIdx+50));

register = register.replace(
  `data={COUNTRIES}`,
  `data={ALL_COUNTRIES}`
);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', register);
console.log('OK nota eliminada:', !register.includes('countryNoteTxt'));
console.log('OK ALL_COUNTRIES en modal:', register.includes('data={ALL_COUNTRIES}'));