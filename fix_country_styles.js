const fs = require('fs');
let c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Agregar estado de búsqueda
c = c.replace(
  `const [showCountryModal, setShowCountryModal] = useState(false);`,
  `const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');`
);

// Reemplazar el select por input + lista filtrada
const selectStart = c.indexOf('{typeof window !== \'undefined\' ? (');
const selectEnd = c.indexOf(')}', c.indexOf('</ScrollView>\n            )}')) + 2;

const newBlock = `<TextInput
              style={{backgroundColor:'#1a2030', color:'#F0F4FF', padding:10, borderRadius:8, marginBottom:8, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', fontSize:14}}
              placeholder="Buscar país..."
              placeholderTextColor="#6B7A99"
              value={countrySearch}
              onChangeText={setCountrySearch}
            />
            <ScrollView style={{maxHeight:350}}>
              {ALL_COUNTRIES.filter(item => 
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

c = c.slice(0, selectStart) + newBlock + c.slice(selectEnd);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', c);
console.log('OK:', c.includes('countrySearch'));