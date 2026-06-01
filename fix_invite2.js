const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Agregar estado
if (!liga.includes('togglingInvite')) {
  liga = liga.replace(
    `const [qrModalVisible, setQrModalVisible] = useState(false);`,
    `const [qrModalVisible, setQrModalVisible] = useState(false);\n  const [togglingInvite, setTogglingInvite] = useState(false);`
  );
}

// Agregar función toggleInvite
if (!liga.includes('toggleInvite')) {
  liga = liga.replace(
    `async function handleJoin()`,
    `async function toggleInvite() {
    if (!selectedLeague || !user) return;
    if (selectedLeague.ownerId !== user.uid) return;
    try {
      setTogglingInvite(true);
      const newState = !selectedLeague.inviteOpen;
      await updateDoc(doc(db, 'leagues', selectedLeague.id), { inviteOpen: newState });
      setSelectedLeague({ ...selectedLeague, inviteOpen: newState });
    } catch (e) {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    } finally {
      setTogglingInvite(false);
    }
  }

  async function handleJoin()`
  );
}

// Reemplazar share section usando indexOf para encontrar posicion exacta
const marker = `<View style={{ gap:8 }}>`;
const idx = liga.indexOf(marker);

// Encontrar fin del bloque </View>
let searchFrom = idx + marker.length;
const endMarker = `</View>`;
const endIdx = liga.indexOf(endMarker, searchFrom) + endMarker.length;

const newShare = `<View style={{ gap:8 }}>
                  {selectedLeague && user && selectedLeague.ownerId === user.uid && ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase()) && (
                    <TouchableOpacity style={s.shareBtn} onPress={toggleInvite} disabled={togglingInvite} activeOpacity={0.85}>
                      <LinearGradient
                        colors={selectedLeague.inviteOpen ? ['rgba(255,51,85,0.12)','rgba(255,51,85,0.04)'] : ['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']}
                        style={[s.shareBtnInner, {borderColor: selectedLeague.inviteOpen ? 'rgba(255,51,85,0.4)' : 'rgba(0,255,135,0.4)'}]}
                      >
                        <Text style={[s.shareBtnTxt, {color: selectedLeague.inviteOpen ? '#FF3355' : '#00FF87'}]}>
                          {togglingInvite ? '...' : selectedLeague.inviteOpen ? 'INVITACION ABIERTA - TAP PARA CERRAR' : 'INVITACION CERRADA - TAP PARA ABRIR'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  {selectedLeague && user && (selectedLeague.ownerId === user.uid || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())) && (
                    <>
                      <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                        <LinearGradient colors={['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']} style={s.shareBtnInner}>
                          <Text style={s.shareBtnTxt}>COMPARTIR POR WHATSAPP / REDES</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.shareBtn} onPress={copyCode} activeOpacity={0.85}>
                        <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']} style={[s.shareBtnInner,{borderColor:'rgba(255,215,0,0.3)'}]}>
                          <Text style={[s.shareBtnTxt,{color:'#FFD700'}]}>COPIAR CODIGO: {selectedLeague?.code}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedLeague && user && selectedLeague.ownerId !== user.uid && ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase()) && !selectedLeague.inviteOpen && (
                    <View style={{backgroundColor:'rgba(255,51,85,0.06)',borderRadius:12,borderWidth:1,borderColor:'rgba(255,51,85,0.2)',padding:12,alignItems:'center'}}>
                      <Text style={{fontFamily:'BarlowCondensed_700Bold',fontSize:11,color:'#FF3355',letterSpacing:1}}>El administrador ha cerrado las invitaciones</Text>
                    </View>
                  )}
                </View>`;

liga = liga.slice(0, idx) + newShare + liga.slice(endIdx);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK - idx:' + idx + ' endIdx:' + endIdx);