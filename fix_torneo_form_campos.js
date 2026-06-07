const fs = require('fs');
const path = 'src/screens/league/TournamentScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// FIX 1: addDoc principal
content = content.replace(
  'isPublic: tPublic && canPublic,\r\n        ownerId: userId,\r\n        ligaId,\r\n        createdAt: serverTimestamp(),',
  'isPublic: tPublic && canPublic,\r\n        ownerId: userId,\r\n        ligaId,\r\n        tags: tCategoria ? [tCategoria] : [],\r\n        createdAt: serverTimestamp(),'
);
console.log('✅ addDoc campos agregados');

// FIX 2: setDoc público
content = content.replace(
  'isPublic: true, ownerId: userId,\r\n          createdAt: serverTimestamp(),',
  'isPublic: true, ownerId: userId,\r\n          tags: tCategoria ? [tCategoria] : [],\r\n          createdAt: serverTimestamp(),'
);
console.log('✅ setDoc público campos agregados');

// FIX 3: selector categoría antes del toggle público
content = content.replace(
  '>\r\n\r\n              {canPublic && (\r\n                <TouchableOpacity onPress={() => setTPublic(!tPublic)} style={[s.pub',
  `>\r\n\r\n              <Text style={s.inputLabel}>\u{1F3F7}\uFE0F CATEGOR\u00CDA DEL NEGOCIO</Text>\r\n              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8 }}>\r\n                {['Restaurante','Sports Bar','Cervecer\u00EDa','Bar','Hotel','Casino','Empresa','Comunidad','Otro'].map(cat => (\r\n                  <TouchableOpacity\r\n                    key={cat}\r\n                    onPress={() => setTCategoria(tCategoria === cat ? '' : cat)}\r\n                    style={{\r\n                      paddingHorizontal:12, paddingVertical:6, borderRadius:16,\r\n                      backgroundColor: tCategoria === cat ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',\r\n                      borderWidth:1,\r\n                      borderColor: tCategoria === cat ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)',\r\n                    }}\r\n                  >\r\n                    <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color: tCategoria === cat ? '#FFD700' : '#6B7A99' }}>\r\n                      {cat}\r\n                    </Text>\r\n                  </TouchableOpacity>\r\n                ))}\r\n              </View>\r\n\r\n              {canPublic && (\r\n                <TouchableOpacity onPress={() => setTPublic(!tPublic)} style={[s.pub`
);
console.log('✅ Selector categoría agregado');

fs.writeFileSync(path, content, 'utf8');
console.log('\n✅ Script completado.');