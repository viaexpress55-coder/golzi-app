const fs = require('fs');
let c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// 1. Agregar estado countrySearch
c = c.replace(
  `const [showCountryModal, setShowCountryModal] = useState(false);`,
  `const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');`
);

// 2. Reemplazar el grid de países por botón selector
const gridStart = c.indexOf('<View style={s.countryGrid}>');
const gridEnd = c.indexOf('        </View>', gridStart) + '        </View>'.length;
c = c.slice(0, gridStart) + `<TouchableOpacity 
          style={{borderRadius:12, overflow:'hidden', marginBottom:8}}
          onPress={() => setShowCountryModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedCountry ? ['rgba(255,215,0,0.15)','rgba(255,215,0,0.05)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
            style={{flexDirection:'row', alignItems:'center', padding:14, borderRadius:12, borderWidth:1, borderColor: selectedCountry ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.1)', gap:10}}
          >
            <Text style={{fontSize:24}}>{selectedCountry ? selectedCountry.flag : '🌍'}</Text>
            <Text style={{fontFamily:'BarlowCondensed_400Regular', fontSize:16, color: selectedCountry ? '#FFD700' : '#6B7A99', flex:1}}>
              {selectedCountry ? selectedCountry.name : 'Seleccionar país →'}
            </Text>
            {selectedCountry && <Text style={{fontSize:16, color:'#00FF87'}}>✓</Text>}
          </LinearGradient>
        </TouchableOpacity>` + c.slice(gridEnd);

// 3. Agregar nota amarilla antes del botón
c = c.replace(
  `<TouchableOpacity \n          style={{borderRadius:12`,
  `<View style={{backgroundColor:'rgba(255,215,0,0.08)', borderRadius:10, padding:12, marginBottom:10, borderWidth:1, borderColor:'rgba(255,215,0,0.3)'}}>
          <Text style={{fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:'#FFD700', textAlign:'center'}}>⚠️ Obligatorio · Elige tu país de origen. Define tu ranking global y el emoji de tu bandera en tu perfil.</Text>
        </View>
        <TouchableOpacity \n          style={{borderRadius:12`
);

// 4. Reemplazar FlatList del modal con buscador + ScrollView
const modalFlatStart = c.indexOf('<FlatList');
const modalFlatEnd = c.indexOf('/>', modalFlatStart) + 2;

const newModal = `<TextInput
              style={{backgroundColor:'#1a2030', color:'#F0F4FF', padding:10, borderRadius:8, marginBottom:8, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', fontSize:14}}
              placeholder="Buscar país..."
              placeholderTextColor="#6B7A99"
              value={countrySearch}
              onChangeText={setCountrySearch}
            />
            <ScrollView>
              {ALL_COUNTRIES.filter(item => 
                !countrySearch || 
                item.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                item.code.toLowerCase().includes(countrySearch.toLowerCase())
              ).map(item => (
                <TouchableOpacity
                  key={item.code}
                  style={s.modalItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountry(0);
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={s.modalFlag}>{item.flag}</Text>
                  <Text style={s.modalCountryName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>`;

c = c.slice(0, modalFlatStart) + newModal + c.slice(modalFlatEnd);

// 5. Eliminar nota duplicada si existe
c = c.replace(
  `<View style={s.countryNote}>
          <Text style={s.countryNoteTxt}>
            🌍 Elige tu país de origen. No tiene que participar en el Mundial — define tu ranking global y el emoji de tu bandera en el perfil. Es obligatorio para completar el registro.
          </Text>
        </View>`,
  ``
);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', c);
console.log('OK countrySearch:', c.includes('countrySearch'));
console.log('OK selector:', c.includes('Seleccionar país'));
console.log('OK buscador:', c.includes('Buscar país'));
console.log('OK ScrollView:', c.includes('ALL_COUNTRIES.filter'));