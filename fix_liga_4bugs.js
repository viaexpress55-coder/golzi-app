const fs = require('fs');
const path = 'src/screens/league/LigaScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// FIX 1: Badge muestra plan del usuario no de la liga
content = content.replace(
  `        {selectedLeague && (\r\n          <LinearGradient colors={[C.gold, C.gold2]} style={s.planBadge}>\r\n            <Text style={s.planBadgeTxt}>⚡ {selectedLeague.plan}</Text>\r\n          </LinearGradient>\r\n        )}`,
  `        {userData && (\r\n          <LinearGradient colors={[C.gold, C.gold2]} style={s.planBadge}>\r\n            <Text style={s.planBadgeTxt}>⚡ {(userData as any).plan || 'FREE'}</Text>\r\n          </LinearGradient>\r\n        )}`
);
console.log('✅ Fix #4: Badge plan usuario aplicado');

// FIX 2: CHAT — solo lectura en ligas empresariales para miembros invitados
const EMPRESARIAL_PLANS = ['PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
content = content.replace(
  `                <View style={s.chatInputRow}>\r\n                  <TextInput\r\n                    style={s.chatInput}\r\n                    placeholder="Escribe un mensaje..."\r\n                    placeholderTextColor={C.muted}\r\n                    value={chatMsg}\r\n                    onChangeText={setChatMsg}\r\n                    maxLength={200}\r\n                    onSubmitEditing={sendChatMsg}\r\n                  />\r\n                  <TouchableOpacity style={[s.chatSendBtn, !chatMsg && { opacity:0.4 }]} onPress={sendChatMsg}>\r\n                    <Text style={s.chatSendTxt}>⚡</Text>\r\n                  </TouchableOpacity>\r\n                </View>`,
  `                {(() => {\r\n                  const esEmpresarial = ['PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague?.plan||'').toUpperCase());\r\n                  const esMiembroInvitado = selectedLeague?.ownerId !== user?.uid;\r\n                  if (esEmpresarial && esMiembroInvitado) {\r\n                    return (\r\n                      <View style={{padding:12, alignItems:'center', backgroundColor:'rgba(255,215,0,0.04)', borderTopWidth:1, borderTopColor:'rgba(255,215,0,0.1)'}}>\r\n                        <Text style={{fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#6B7A99', letterSpacing:1}}>📢 Solo el administrador puede publicar en este canal</Text>\r\n                      </View>\r\n                    );\r\n                  }\r\n                  return (\r\n                    <View style={s.chatInputRow}>\r\n                      <TextInput\r\n                        style={s.chatInput}\r\n                        placeholder="Escribe un mensaje..."\r\n                        placeholderTextColor={C.muted}\r\n                        value={chatMsg}\r\n                        onChangeText={setChatMsg}\r\n                        maxLength={200}\r\n                        onSubmitEditing={sendChatMsg}\r\n                      />\r\n                      <TouchableOpacity style={[s.chatSendBtn, !chatMsg && { opacity:0.4 }]} onPress={sendChatMsg}>\r\n                        <Text style={s.chatSendTxt}>⚡</Text>\r\n                      </TouchableOpacity>\r\n                    </View>\r\n                  );\r\n                })()}`
);
console.log('✅ Fix #2: Chat solo lectura en ligas empresariales aplicado');

// FIX 3: CREAR — redirigir a Plans si es FREE
content = content.replace(
  `      const freshPlan = (userSnap.data()?.plan || 'free').toUpperCase();\r\n      // Validar plan\r\n      if (freshPlan === 'FREE' || !userSnap.data()?.plan) {\r\n        setCreateError('Necesitas un plan para crear liga');\r\n        setCreating(false);\r\n        return;\r\n      }`,
  `      const freshPlan = (userSnap.data()?.plan || 'free').toUpperCase();\r\n      // Validar plan — redirigir a Plans si es FREE\r\n      if (freshPlan === 'FREE' || !userSnap.data()?.plan) {\r\n        setCreating(false);\r\n        navigation.navigate('Plans');\r\n        return;\r\n      }`
);
console.log('✅ Fix #3: CREAR redirige a Plans si es FREE aplicado');

// FIX 4: TABLA solo visible si ligaPlan >= MASTER (ya funciona por hasTabla)
// Solo falta asegurarse que hasTabla use la liga del owner y no del invitado
// Ya está correcto: hasTabla = TABLA_PLANS.includes(ligaPlan) donde ligaPlan = selectedLeague.plan
console.log('✅ Fix #1: TABLA ya correcta — visible para todos en liga MASTER+');

fs.writeFileSync(path, content, 'utf8');
console.log('\n✅ Script completado.');