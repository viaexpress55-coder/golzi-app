const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Reemplazar el modal del scanner completo
const oldScanner = liga.substring(
  liga.indexOf('{/* MODAL SCANNER */}'),
  liga.indexOf('{/* MODAL QR */}')
);

const newScanner = `{/* MODAL SCANNER */}
      <Modal visible={scannerVisible} transparent={false} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
        <View style={{ flex:1, backgroundColor:'#020408', justifyContent:'center', alignItems:'center' }}>
          
          {/* Botón cerrar */}
          <View style={{ position:'absolute', top:52, left:16, zIndex:10 }}>
            <TouchableOpacity onPress={() => setScannerVisible(false)} style={{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:12, padding:12, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' }}>
              <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#FFD700', letterSpacing:1 }}>✕ CERRAR</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:'#FFD700', letterSpacing:3, marginBottom:8 }}>ESCANEAR QR GOLZI</Text>

          {typeof window !== 'undefined' ? (
            /* WEB — scanner no disponible, usar código manual */
            <View style={{ alignItems:'center', gap:16, paddingHorizontal:32 }}>
              <View style={{ width:200, height:200, borderRadius:16, borderWidth:2, borderColor:'rgba(255,215,0,0.4)', backgroundColor:'rgba(255,215,0,0.05)', justifyContent:'center', alignItems:'center' }}>
                <Text style={{ fontSize:60 }}>📷</Text>
                <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:'rgba(255,215,0,0.6)', letterSpacing:1, marginTop:8, textAlign:'center' }}>SCANNER DISPONIBLE{'\n'}EN APP NATIVA</Text>
              </View>
              <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:'#6B7A99', textAlign:'center' }}>En la web ingresa el codigo manualmente o descarga la app GOLZI para escanear QR</Text>
              <TouchableOpacity onPress={() => setScannerVisible(false)} style={{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:12, paddingVertical:12, paddingHorizontal:24, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' }}>
                <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#FFD700', letterSpacing:1 }}>INGRESAR CODIGO MANUAL</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* APP NATIVA — scanner real */
            <View style={{ alignItems:'center', gap:16 }}>
              <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:'#6B7A99', textAlign:'center', paddingHorizontal:32 }}>Apunta la camara al codigo QR de la liga</Text>
              {permission?.granted ? (
                <View style={{ width:280, height:280, borderRadius:16, overflow:'hidden', borderWidth:2, borderColor:'rgba(255,215,0,0.4)' }}>
                  <CameraView
                    style={{ width:280, height:280 }}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  />
                  {/* Marco de escaneo */}
                  <View style={{ position:'absolute', top:0, left:0, right:0, bottom:0, justifyContent:'center', alignItems:'center' }}>
                    <View style={{ width:180, height:180, borderWidth:2, borderColor:'#FFD700', borderRadius:8 }} />
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={requestPermission} style={{ backgroundColor:'rgba(255,215,0,0.1)', borderRadius:12, padding:16, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' }}>
                  <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#FFD700', letterSpacing:1 }}>PERMITIR CAMARA</Text>
                </TouchableOpacity>
              )}
              {scanned && <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#00FF87', letterSpacing:1 }}>✅ QR ESCANEADO</Text>}
            </View>
          )}
        </View>
      </Modal>

      `;

liga = liga.replace(oldScanner, newScanner);
fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK:', liga.includes('SCANNER DISPONIBLE'));