const fs = require('fs');
let c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// 1. Nota amarilla obligatoria
c = c.replace(
  `<View style={s.countryGrid}>`,
  `<View style={{backgroundColor:'rgba(255,215,0,0.08)',borderRadius:10,padding:10,marginBottom:10,borderWidth:1,borderColor:'rgba(255,215,0,0.3)'}}>
          <Text style={{fontFamily:'BarlowCondensed_400Regular',fontSize:11,color:'#FFD700',textAlign:'center'}}>⚠️ Obligatorio · Elige tu país. Define tu ranking global y bandera en tu perfil.</Text>
        </View>
        <View style={s.countryGrid}>`
);

// 2. Reemplazar emoji bandera por imagen
const flagStart = c.indexOf('<Text style={s.countryFlag}>');
const flagEnd = c.indexOf('</Text>', flagStart) + '</Text>'.length;

c = c.slice(0, flagStart) + 
  `<Image source={{uri:\`https://flagcdn.com/w40/\${(i===8&&country===8&&selectedCountry?selectedCountry.code:item.code).toLowerCase()}.png\`}} style={{width:28,height:20,borderRadius:2}} resizeMode="cover"/>` + 
  c.slice(flagEnd);

// 3. Renombrar variable del map de 'c' a 'item'
c = c.replace(
  `{COUNTRIES.map((c, i) => (`,
  `{COUNTRIES.map((item, i) => (`
);
c = c.replace(
  `if (c.code === 'OT') {`,
  `if (item.code === 'OT') {`
);
c = c.replace(
  `{i === 8 && country === 8 && selectedCountry ? selectedCountry.name : c.name}`,
  `{i === 8 && country === 8 && selectedCountry ? selectedCountry.name : item.name}`
);

// 4. Eliminar nota gris duplicada
const noteIdx = c.indexOf('<View style={s.countryNote}>');
if (noteIdx !== -1) {
  const noteEnd = c.indexOf('</View>', noteIdx) + '</View>'.length;
  c = c.slice(0, noteIdx) + c.slice(noteEnd);
}

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', c);
console.log('OK flagcdn:', c.includes('flagcdn.com'));
console.log('OK item:', c.includes('map((item, i)'));
console.log('OK nota:', c.includes('Obligatorio'));