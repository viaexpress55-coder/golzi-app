const fs = require('fs');
let register = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Usar índices directos
const start = register.indexOf('<View style={s.countryGrid}>');
const end = register.indexOf('        </View>', start) + '        </View>'.length;

console.log('Bloque start:', start, 'end:', end);
console.log('Bloque:', register.substring(start, end+5));

const newBlock = `<View style={{marginBottom:8}}>
          <TouchableOpacity 
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
          </TouchableOpacity>
        </View>`;

register = register.slice(0, start) + newBlock + register.slice(end);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', register);
console.log('OK:', register.includes('Seleccionar país'));