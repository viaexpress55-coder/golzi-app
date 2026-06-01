const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// 1. Agregar estado inviteOpen
liga = liga.replace(
  `const [qrModalVisible, setQrModalVisible] = useState(false);`,
  `const [qrModalVisible, setQrModalVisible] = useState(false);
  const [togglingInvite, setTogglingInvite] = useState(false);`
);

// 2. Agregar función toggleInvite después de copyCode
liga = liga.replace(
  `// ─── Tabs dinámicos`,
  `async function toggleInvite() {
    if (!selectedLeague || !user) return;
    if (selectedLeague.ownerId !== user.uid) return;
    try {
      setTogglingInvite(true);
      const newState = !selectedLeague.inviteOpen;
      await updateDoc(doc(db, 'leagues', selectedLeague.id), {
        inviteOpen: newState,
      });
      setSelectedLeague({ ...selectedLeague, inviteOpen: newState });
    } catch (e) {
      Alert.alert('Error', 'No se pudo cambiar el estado de invitacion');
    } finally {
      setTogglingInvite(false);
    }
  }

  // ─── Tabs dinámicos`
);

// 3. Reemplazar sección de share buttons con control de invitación
liga = liga.replace(
  `<View style={{ gap:8 }}>
                  <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                    <LinearGradient colors={['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']} style={s.shareBtnInner}>
                      <Text style={s.shareBtnTxt}>📤 COMPARTIR POR WHATSAPP / REDES</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.shareBtn} onPress={copyCode} activeOpacity={0.85}>
                    <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']} style={[s.shareBtnInner, {borderColor:'rgba(255,215,0,0.3)'}]}>
                      <Text style={[s.shareBtnTxt, {color:C.gold}]}>📋 COPIAR CÓDIGO: {selectedLeague?.code}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>`,
  `<View style={{ gap:8 }}>
                  {/* Control de invitación — solo owner en GOLZAIR+ */}
                  {selectedLeague && user && selectedLeague.ownerId === user.uid && ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase()) && (
                    <TouchableOpacity style={s.shareBtn} onPress={toggleInvite} disabled={togglingInvite} activeOpacity={0.85}>
                      <LinearGradient
                        colors={selectedLeague.inviteOpen ? ['rgba(255,51,85,0.12)','rgba(255,51,85,0.04)'] : ['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']}
                        style={[s.shareBtnInner, {borderColor: selectedLeague.inviteOpen ? 'rgba(255,51,85,0.4)' : 'rgba(0,255,135,0.4)'}]}
                      >
                        <Text style={[s.shareBtnTxt, {color: selectedLeague.inviteOpen ? '#FF3355' : '#00FF87'}]}>
                          {togglingInvite ? '...' : selectedLeague.inviteOpen ? '🔓 INVITACION ABIERTA — TAP PARA CERRAR' : '🔒 INVITACION CERRADA — TAP PARA ABRIR'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {/* Botones de compartir — owner siempre, miembros solo si inviteOpen o plan pequeño */}
                  {selectedLeague && user && (
                    selectedLeague.ownerId === user.uid ||
                    selectedLeague.inviteOpen ||
                    !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())
                  ) && (
                    <>
                      <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                        <LinearGradient colors={['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']} style={s.shareBtnInner}>
                          <Text style={s.shareBtnTxt}>📤 COMPARTIR POR WHATSAPP / REDES</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.shareBtn} onPress={copyCode} activeOpacity={0.85}>
                        <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']} style={[s.shareBtnInner, {borderColor:'rgba(255,215,0,0.3)'}]}>
                          <Text style={[s.shareBtnTxt, {color:C.gold}]}>📋 COPIAR CODIGO: {selectedLeague?.code}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Mensaje para miembros cuando invitación está cerrada en GOLZAIR+ */}
                  {selectedLeague && user && selectedLeague.ownerId !== user.uid &&
                    ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase()) &&
                    !selectedLeague.inviteOpen && (
                    <View style={s.inviteClosedBox}>
                      <Text style={s.inviteClosedTxt}>🔒 El administrador ha cerrado las invitaciones</Text>
                    </View>
                  )}
                </View>`
);

// 4. También ocultar QR en hero card para miembros no-owner cuando está cerrado
liga = liga.replace(
  `{QR_PLANS.includes((selectedLeague.plan || '').toUpperCase()) ? (`,
  `{QR_PLANS.includes((selectedLeague.plan || '').toUpperCase()) && (user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())) ? (`
);

// 5. Agregar estilos
liga = liga.replace(
  `  scanBtn:{ borderRadius:12, overflow:'hidden' },`,
  `  inviteClosedBox:{ backgroundColor:'rgba(255,51,85,0.06)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,51,85,0.2)', padding:12, alignItems:'center' },
  inviteClosedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:'#FF3355', letterSpacing:1 },
  scanBtn:{ borderRadius:12, overflow:'hidden' },`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK - Control de invitacion aplicado');