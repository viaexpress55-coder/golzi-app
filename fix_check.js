const fs = require('fs');
let c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Reemplazar FlatList por ScrollView con map para web
const flatStart = c.indexOf('<FlatList');
const flatEnd = c.indexOf('/>', c.indexOf('windowSize={5}', flatStart)) + 2;

console.log('FlatList bloque:', c.substring(flatStart, flatEnd+50));

const newList = `<ScrollView style={{maxHeight:400}}>
              {ALL_COUNTRIES.map(item => (
                <TouchableOpacity
                  key={item.code}
                  style={s.modalItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountry(0);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={s.modalItemFlag}>{item.flag}</Text>
                  <Text style={s.modalItemName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>`;

c = c.slice(0, flatStart) + newList + c.slice(flatEnd);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', c);
console.log('OK ScrollView:', c.includes('ALL_COUNTRIES.map'));