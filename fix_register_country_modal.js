const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Reemplazar el grid de países por un solo botón
const oldBlock = `<View style={s.countryGrid}>
          {COUNTRIES.map((c, i) => (
            <Pressable key={i}
              style={[s.countryBtn, country === i && s.countryBtnOn]}
              onPress={() => {
                if (c.code === 'OT') {
                  setShowCountryModal(true);
                } else {
                  setCountry(i);
                }
              }}
            >
              <LinearGradient
                colors={country === i ? ['rgba(255,215,0,0.15)','rgba(255,215,0,0.05)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
                style={s.countryBtnGrad}
              >
                <Text style={s.countryFlag}>
                  {i === 8 && country === 8 && selectedCountry ? selectedCountry.flag : c.flag}
                </Text>
                <Text style={[s.countryName, country === i && s.countryNameOn]}>
                  {i === 8 && country === 8 && selectedCountry ? selectedCountry.name : c.name}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>`;

const newBlock = `<TouchableOpacity 
          style={[s.countrySelector, selectedCountry && s.countrySelectorSelected]}
          onPress={() => setShowCountryModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedCountry ? ['rgba(255,215,0,0.15)','rgba(255,215,0,0.05)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
            style={s.countrySelectorInner}
          >
            {selectedCountry ? (
              <>
                <Text style={s.countrySelectorFlag}>{selectedCountry.flag}</Text>
                <Text style={s.countrySelectorName}>{selectedCountry.name}</Text>
                <Text style={s.countrySelectorCheck}>✓</Text>
              </>
            ) : (
              <>
                <Text style={s.countrySelectorFlag}>🌍</Text>
                <Text style={s.countrySelectorPlaceholder}>Seleccionar país →</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>`;

register = register.replace(oldBlock, newBlock);

// Actualizar la lógica del modal para usar selectedCountry y setCountry(0)
register = register.replace(
  `setSelectedCountry(item);
                  setShowCountryModal(false);`,
  `setSelectedCountry(item);
                  setCountry(0);
                  setShowCountryModal(false);`
);

// Agregar estilos para el nuevo selector
const styleInsert = `
  countrySelector:{ borderRadius:12, overflow:'hidden', marginBottom:8 },
  countrySelectorSelected:{ },
  countrySelectorInner:{ flexDirection:'row', alignItems:'center', padding:14, borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', gap:10 },
  countrySelectorFlag:{ fontSize:24 },
  countrySelectorName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:16, color:'#FFD700', flex:1 },
  countrySelectorCheck:{ fontSize:16, color:'#00FF87' },
  countrySelectorPlaceholder:{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:'#6B7A99', flex:1 },`;

register = register.replace(
  `countryGrid:{`,
  `${styleInsert}\n  countryGrid:{`
);

// Agregar nota obligatoria en amarillo
register = register.replace(
  `</Text>
        </View>
        <View style={s.countryGrid}>`,
  `</Text>
        </View>
        <View style={s.countryNoteBox}>
          <Text style={s.countryNote}>⚠️ Obligatorio · Elige tu país de origen. No tiene que participar en el Mundial — define tu ranking global y el emoji de tu bandera en tu perfil.</Text>
        </View>
        <View style={s.countryGrid}>`
);

// Estilos para la nota
register = register.replace(
  `countrySelector:{`,
  `countryNoteBox:{ backgroundColor:'rgba(255,215,0,0.08)', borderRadius:10, padding:12, marginBottom:10, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  countryNote:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:'#FFD700', textAlign:'center', lineHeight:18 },
  countrySelector:{`
);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', register);
console.log('OK selector:', register.includes('countrySelector'));
console.log('OK nota:', register.includes('countryNote'));