const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// 1. Agregar import de CameraView
liga = liga.replace(
  `import QRCode from 'react-native-qrcode-svg';`,
  `import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';`
);

// 2. Agregar estado del scanner después de qrModalVisible
liga = liga.replace(
  `const [qrModalVisible, setQrModalVisible] = useState(false);`,
  `const [qrModalVisible, setQrModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);`
);

// 3. Agregar función handleScan después de copyCode
liga = liga.replace(
  `// ─── Tabs dinámicos`,
  `function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    setScannerVisible(false);
    // Extraer código del URL o usar directo
    const match = data.match(/liga\\/([A-Z0-9-]+)/i);
    const code = match ? match[1] : data.trim().toUpperCase();
    setJoinCode(code);
    setTab(2);
    setTimeout(() => setScanned(false), 2000);
  }

  // ─── Tabs dinámicos`
);

// 4. Agregar botón ESCANEAR QR en tab UNIRSE, después del input de código
liga = liga.replace(
  `{joinError ? <Text style={s.errorTxt}>{joinError}</Text> : null}`,
  `{joinError ? <Text style={s.errorTxt}>{joinError}</Text> : null}
              <TouchableOpacity
                style={s.scanBtn}
                onPress={async () => {
                  if (!permission?.granted) await requestPermission();
                  setScanned(false);
                  setScannerVisible(true);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['rgba(0,198,255,0.12)','rgba(0,198,255,0.04)']} style={s.scanBtnInner}>
                  <Text style={s.scanBtnTxt}>📷 ESCANEAR QR DE GOLZI</Text>
                </LinearGradient>
              </TouchableOpacity>`
);

// 5. Agregar modal scanner antes del modal QR
liga = liga.replace(
  `{/* MODAL QR */}`,
  `{/* MODAL SCANNER */}
      <Modal visible={scannerVisible} transparent={false} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
        <View style={{ flex:1, backgroundColor:'#020408' }}>
          <View style={{ position:'absolute', top:52, left:16, zIndex:10 }}>
            <TouchableOpacity onPress={() => setScannerVisible(false)} style={{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:12, padding:12, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' }}>
              <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#FFD700', letterSpacing:1 }}>✕ CERRAR</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:20 }}>
            <Text style={{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:'#FFD700', letterSpacing:3, marginTop:80 }}>ESCANEAR QR GOLZI</Text>
            <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:'#6B7A99', textAlign:'center', paddingHorizontal:32 }}>Apunta la camara al codigo QR de la liga</Text>
            {permission?.granted ? (
              <CameraView
                style={{ width:280, height:280, borderRadius:16, overflow:'hidden', borderWidth:2, borderColor:'rgba(255,215,0,0.4)' }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            ) : (
              <TouchableOpacity onPress={requestPermission} style={{ backgroundColor:'rgba(255,215,0,0.1)', borderRadius:12, padding:16, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' }}>
                <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#FFD700', letterSpacing:1 }}>PERMITIR CAMARA</Text>
              </TouchableOpacity>
            )}
            {scanned && <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#00FF87', letterSpacing:1 }}>✅ QR ESCANEADO</Text>}
          </View>
        </View>
      </Modal>

      {/* MODAL QR */}`
);

// 6. Agregar estilos del scanner
liga = liga.replace(
  `  qrModalClose:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:'rgba(255,255,255,0.2)' },`,
  `  qrModalClose:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:'rgba(255,255,255,0.2)' },
  scanBtn:{ borderRadius:12, overflow:'hidden' },
  scanBtnInner:{ borderRadius:12, borderWidth:1, borderColor:'rgba(0,198,255,0.3)', paddingVertical:14, alignItems:'center' },
  scanBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:'#00C6FF', letterSpacing:2 },`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK - QR Scanner agregado');