const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Agregar nota amarilla antes del selector
register = register.replace(
  `<View style={{marginBottom:8}}>
          <TouchableOpacity`,
  `<View style={s.countryNoteBox}>
          <Text style={s.countryNote}>⚠️ Obligatorio · Elige tu país de origen. No tiene que participar en el Mundial — define tu ranking global y el emoji de tu bandera en tu perfil.</Text>
        </View>
        <View style={{marginBottom:8}}>
          <TouchableOpacity`
);

// Actualizar modal para setCountry(0) al seleccionar
register = register.replace(
  `setSelectedCountry(item);\r\n                  setShowCountryModal(false);`,
  `setSelectedCountry(item);\r\n                  setCountry(0);\r\n                  setShowCountryModal(false);`
);
register = register.replace(
  `setSelectedCountry(item);\n                  setShowCountryModal(false);`,
  `setSelectedCountry(item);\n                  setCountry(0);\n                  setShowCountryModal(false);`
);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', register);
console.log('OK nota:', register.includes('countryNoteBox'));
console.log('OK setCountry:', register.includes('setCountry(0)'));