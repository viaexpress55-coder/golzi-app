const fs = require('fs');
const path = 'src/screens/league/LigaScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Buscar el cierre del bloque de chips y agregar input después
const old = /(\.map\(size => \([\s\S]*?<\/TouchableOpacity>\r?\n\s+\)\)}\r?\n\s+<\/View>)(\r?\n\s+<\/View>\r?\n\s+\)}\r?\n\s+<LinearGradient)/;

if (old.test(content)) {
  content = content.replace(old, (match, chipsBlock, after) => {
    return chipsBlock + `
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:4 }}>
                    <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'#6B7A99', letterSpacing:1 }}>O INGRESA:</Text>
                    <TextInput
                      style={{ flex:1, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', borderRadius:10, paddingHorizontal:12, paddingVertical:8, color:'#FFFFFF', fontFamily:'BarlowCondensed_700Bold', fontSize:14 }}
                      placeholder="Ej: 50"
                      placeholderTextColor="#6B7A99"
                      keyboardType="numeric"
                      maxLength={5}
                      value={ligaSize > 0 ? String(ligaSize) : ''}
                      onChangeText={v => {
                        const n = parseInt(v);
                        if (!isNaN(n) && n > 0) setLigaSize(n);
                        else if (v === '') setLigaSize(0);
                      }}
                    />
                    <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#6B7A99' }}>cupos</Text>
                  </View>` + after;
  });
  console.log('✅ Fix cupos editable aplicado');
} else {
  console.log('❌ Patron no encontrado — debug:');
  const idx = content.indexOf('ligaSize === size');
  if (idx > -1) console.log(JSON.stringify(content.substring(idx + 200, idx + 500)));
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');