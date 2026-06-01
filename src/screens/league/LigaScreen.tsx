import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, ActivityIndicator, Share, Alert, Modal
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';
import { functions, db } from '../../services/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import {
  collection, addDoc, onSnapshot, orderBy, query,
  doc, getDoc, getDocs, setDoc, updateDoc, where, serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', goldBorder:'rgba(255,215,0,0.25)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
};

// Planes que tienen acceso a la Tabla de predicciones del grupo
const TABLA_PLANS = ['MASTER','GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];

// Planes que tienen acceso al QR de invitación
const QR_PLANS = ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];

function generateCode() {
  return 'GOLZ-' + Math.random().toString(36).slice(2,6).toUpperCase();
}

// ─── Lógica de puntos (espejo de la función Firebase) ────────────────────────
function calcPoints(pred: { homeScore: number; awayScore: number }, result: { homeScore: number; awayScore: number }): { pts: number; type: 'exact' | 'winner' | 'draw' | 'miss' } {
  if (pred.homeScore === result.homeScore && pred.awayScore === result.awayScore) {
    return { pts: 10, type: 'exact' };
  }
  const predWinner = pred.homeScore > pred.awayScore ? 'home' : pred.homeScore < pred.awayScore ? 'away' : 'draw';
  const realWinner = result.homeScore > result.awayScore ? 'home' : result.homeScore < result.awayScore ? 'away' : 'draw';
  if (predWinner === realWinner) {
    return predWinner === 'draw' ? { pts: 2, type: 'draw' } : { pts: 5, type: 'winner' };
  }
  return { pts: 0, type: 'miss' };
}

function getMaxMembersByPlan(plan: string): number {
  const p = plan.toUpperCase();
  if (p === 'LIGA')          return 5;
  if (p === 'PRO')           return 10;
  if (p === 'MASTER')        return 25;
  if (p === 'GOLZAIR')       return 100;
  if (p === 'PARTNER')       return 500;
  if (p === 'BUSINESS')      return 1000;
  if (p === 'GOLD')          return 2500;
  if (p === 'GOLZI PREMIUM') return 5000;
  return 5;
}

export default function LigaScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setUserData(snap.data());
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const pending = localStorage.getItem('golzi_pending_invite');
          if (pending) {
            localStorage.removeItem('golzi_pending_invite');
            setTimeout(() => {
              setJoinCode(pending);
              setTab(2);
            }, 1500);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  const route = useRoute<any>();
  const [tab, setTab] = useState(route?.params?.inviteCode ? 2 : 0);
  const [autoCode] = useState(route?.params?.inviteCode || '');
  const [loading, setLoading] = useState(true);
  const [myLeagues, setMyLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [chatMsgs, setChatMsgs] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const [joinCode, setJoinCode] = useState(route?.params?.inviteCode || '');
  const [ligaName, setLigaName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const chatScrollRef = useRef<any>(null);

  // ─── Estado Tabla ────────────────────────────────────────────────────────────
  const [tablaData, setTablaData] = useState<any[]>([]);
  const [tablaLoading, setTablaLoading] = useState(false);
  const [tablaLoaded, setTablaLoaded] = useState<string | null>(null);

  // ─── Estado QR Modal ─────────────────────────────────────────────────────────
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [togglingInvite, setTogglingInvite] = useState(false);
  const [poolUsed, setPoolUsed] = useState(0);
  const [ligaSize, setLigaSize] = useState(0); // cupos para la nueva liga
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  // ─── Cargar ligas del usuario ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const q = query(collection(db, 'leagues'), where('memberIds', 'array-contains', user.uid));
    const unsub = onSnapshot(q, snap => {
      const leagues = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyLeagues(leagues);
      if (leagues.length > 0 && !selectedLeague) setSelectedLeague(leagues[0]);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ─── Cargar miembros ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedLeague) return;
    const q = query(collection(db, 'leagues', selectedLeague.id, 'members'));
    const unsub = onSnapshot(q, async snap => {
      const memberList = await Promise.all(snap.docs.map(async d => {
        const userData = await getDoc(doc(db, 'users', d.id));
        return { id: d.id, ...d.data(), ...userData.data() };
      }));
      setMembers(memberList.sort((a,b) => (b.totalPoints||0) - (a.totalPoints||0)));
    });
    return () => unsub();
  }, [selectedLeague]);

  // ─── Cargar chat ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedLeague) return;
    const q = query(collection(db, 'leagues', selectedLeague.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setChatMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsub();
  }, [selectedLeague]);

  // ─── Cargar tabla de predicciones ────────────────────────────────────────────
  async function loadTabla() {
    if (!selectedLeague || !members.length) return;
    if (tablaLoaded === selectedLeague.id) return; // ya cargado para esta liga

    setTablaLoading(true);
    try {
      // 1. Partidos finalizados
      const matchesSnap = await getDocs(
        query(collection(db, 'matches'), where('status', 'in', ['FINISHED', 'finished']))
      );
      const finishedMatches: Record<string, any> = {};
      matchesSnap.docs.forEach(d => {
        finishedMatches[d.id] = { id: d.id, ...d.data() };
      });
      const finishedIds = Object.keys(finishedMatches);

      // 2. Predicciones de todos los miembros
      const memberIds = members.map(m => m.id);

      // Firestore "in" acepta máx 30 items; dividimos si hay más
      const chunks: string[][] = [];
      for (let i = 0; i < memberIds.length; i += 30) {
        chunks.push(memberIds.slice(i, i + 30));
      }

      const allPredictions: any[] = [];
      for (const chunk of chunks) {
        const predSnap = await getDocs(
          query(collection(db, 'predictions'), where('userId', 'in', chunk))
        );
        predSnap.docs.forEach(d => allPredictions.push({ id: d.id, ...d.data() }));
      }

      // 3. Calcular stats por miembro
      const statsMap: Record<string, { exact: number; winner: number; draw: number; miss: number; pts: number; total: number }> = {};
      memberIds.forEach(uid => {
        statsMap[uid] = { exact: 0, winner: 0, draw: 0, miss: 0, pts: 0, total: 0 };
      });

      allPredictions.forEach(pred => {
        const match = finishedMatches[pred.matchId];
        if (!match || pred.homeScore === undefined || pred.awayScore === undefined) return;
        if (match.homeScore === null || match.homeScore === undefined) return;
        if (!statsMap[pred.userId]) return;

        const result = calcPoints(
          { homeScore: pred.homeScore, awayScore: pred.awayScore },
          { homeScore: match.homeScore, awayScore: match.awayScore }
        );
        statsMap[pred.userId][result.type]++;
        statsMap[pred.userId].pts += result.pts;
        statsMap[pred.userId].total++;
      });

      // 4. Combinar con info de miembro y ordenar por puntos
      const tabla = members.map(m => ({
        ...m,
        tablaStats: statsMap[m.id] ?? { exact: 0, winner: 0, draw: 0, miss: 0, pts: 0, total: 0 },
      })).sort((a, b) => b.tablaStats.pts - a.tablaStats.pts);

      setTablaData(tabla);
      setTablaLoaded(selectedLeague.id);
    } catch (e) {
      console.error('Error cargando tabla:', e);
    } finally {
      setTablaLoading(false);
    }
  }

  // Cargar tabla cuando se abre el tab
  useEffect(() => {
    if (tab === 4 && selectedLeague && members.length > 0) {
      loadTabla();
    }
  }, [tab, selectedLeague, members]);

  // Reset tabla si cambia de liga
  useEffect(() => {
    setTablaLoaded(null);
    setTablaData([]);
  }, [selectedLeague?.id]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  function getDefaultLigaSize(plan: string, existingCount: number): number {
    const total = getMaxMembersByPlan(plan);
    if (existingCount === 0) return total;
    return Math.max(10, Math.floor(total / (existingCount + 1)));
  }

  async function handleCreate() {
    if (!ligaName.trim()) { setCreateError('Ingresa un nombre'); return; }
    if (!user) { setCreateError('Debes iniciar sesion'); return; }
    if (!user.email) { setCreateError('Debes crear una cuenta para crear una liga'); return; }
    try {
      setCreating(true);
      setCreateError('');
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const freshPlan = (userSnap.data()?.plan || 'free').toUpperCase();
      // Validar plan
      if (freshPlan === 'FREE' || !userSnap.data()?.plan) {
        setCreateError('Necesitas un plan de pago para crear una liga');
        setCreating(false);
        return;
      }
      // Validar pool de cupos
      const MULTILIGA_PLANS = ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
      const isMultiliga = MULTILIGA_PLANS.includes(freshPlan);
      const ownerSnap = await getDocs(
        query(collection(db, 'leagues'), where('ownerId', '==', user.uid))
      );
      if (!isMultiliga && !ownerSnap.empty) {
        setCreateError('Ya tienes una liga creada. Un usuario solo puede crear 1 liga.');
        setCreating(false);
        return;
      }
      if (isMultiliga) {
        const totalUsed = ownerSnap.docs.reduce((acc, d) => acc + (d.data().maxMembers || 0), 0);
        const planMax = getMaxMembersByPlan(freshPlan);
        const newSize = ligaSize || getDefaultLigaSize(freshPlan, ownerSnap.docs.length);
        if (totalUsed + newSize > planMax) {
          setCreateError('No tienes suficientes cupos disponibles. Pool: ' + planMax + ' | Usados: ' + totalUsed + ' | Disponibles: ' + (planMax - totalUsed));
          setCreating(false);
          return;
        }
        // Usar el tamaño seleccionado
        (window as any).__newLigaSize = newSize;
      }
      const code = generateCode();
      const leagueRef = doc(collection(db, 'leagues'));
      await setDoc(leagueRef, {
        name: ligaName.trim(),
        code,
        ownerId: user.uid,
        memberIds: [user.uid],
        plan: freshPlan,
        maxMembers: (() => {
          const MULTILIGA_PLANS = ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
          if (MULTILIGA_PLANS.includes(freshPlan)) {
            return (typeof window !== 'undefined' && (window as any).__newLigaSize) || ligaSize || 10;
          }
          return getMaxMembersByPlan(freshPlan);
        })(),
        createdAt: serverTimestamp(),
        inviteLink: 'https://golzi.app/liga/' + code,
      });
      await setDoc(doc(db, 'leagues', leagueRef.id, 'members', user.uid), {
        userId: user.uid,
        joinedAt: serverTimestamp(),
        role: 'owner',
      });
      setLigaName('');
      setTab(0);
      Alert.alert('Liga creada', 'Codigo: ' + code);
    } catch (e) {
      setCreateError('Error al crear la liga');
    } finally {
      setCreating(false);
    }
  }
  async function handleJoin() {
    if (!joinCode.trim()) { setJoinError('Ingresa el código'); return; }
    if (!user) { setJoinError('Debes iniciar sesión'); return; }
    if (!user.email) { setJoinError('Debes crear una cuenta para unirte a una liga'); return; }
    try {
      setJoining(true);
      setJoinError('');
      const q = query(collection(db, 'leagues'), where('code', '==', joinCode.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) { setJoinError('Código no encontrado'); return; }
      const leagueDoc = snap.docs[0];
      const leagueData = leagueDoc.data();
      if (leagueData.memberIds?.includes(user.uid)) {
        setJoinError('Ya eres miembro de esta liga');
        return;
      }
      if ((leagueData.memberIds?.length || 0) >= (leagueData.maxMembers || 5)) {
        setJoinError('Liga llena');
        return;
      }
      await updateDoc(leagueDoc.ref, {
        memberIds: [...(leagueData.memberIds || []), user.uid]
      });
      await setDoc(doc(db, 'leagues', leagueDoc.id, 'members', user.uid), {
        userId: user.uid,
        joinedAt: serverTimestamp(),
        role: 'member',
      });
      setJoinCode('');
      setTab(0);
      Alert.alert('¡Te uniste!', `Bienvenido a ${leagueData.name}`);
    } catch (e: any) {
      setJoinError('Error al unirse a la liga');
    } finally {
      setJoining(false);
    }
  }

  const BANNED_WORDS = ['puta', 'mierda', 'hijueputa', 'malparido', 'pendejo', 'coño', 'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'perra', 'verga', 'culero', 'cabron'];

  async function sendChatMsg() {
    if (!chatMsg.trim() || !selectedLeague || !user) return;
    const txt = chatMsg.trim();
    const lower = txt.toLowerCase();
    const hasBanned = BANNED_WORDS.some(w => lower.includes(w));
    if (hasBanned) {
      Alert.alert('⚠️ Mensaje no permitido', 'Por favor mantén un lenguaje respetuoso.');
      return;
    }
    setChatMsg('');
    try {
      await addDoc(collection(db, 'leagues', selectedLeague.id, 'messages'), {
        text: txt,
        userId: user.uid,
        user: user.displayName || user.email?.split('@')[0] || 'Usuario',
        createdAt: serverTimestamp(),
      });
    } catch(e) { console.error(e); }
  }

  async function handleShare() {
    if (!selectedLeague) return;
    const msg = `🏆 ¡Únete a mi liga "${selectedLeague.name}" en GOLZI!\n\n⚡ Código: ${selectedLeague.code}\n🔗 Link: ${selectedLeague.inviteLink || `https://golzi.app/liga/${selectedLeague.code}`}\n\n📲 Descarga GOLZI: https://golzi.app`;
    try {
      await Share.share({ message: msg, url: selectedLeague.inviteLink });
    } catch(e) {}
  }

  async function copyCode() {
    if (!selectedLeague) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(selectedLeague.code);
        Alert.alert('✅ Copiado', `Código ${selectedLeague.code} copiado`);
      }
    } catch(e) {}
  }

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    setScannerVisible(false);
    // Extraer código del URL o usar directo
    const match = data.match(/liga\/([A-Z0-9-]+)/i);
    const code = match ? match[1] : data.trim().toUpperCase();
    setJoinCode(code);
    setTab(2);
    setTimeout(() => setScanned(false), 2000);
  }

  async function toggleInvite() {
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

  // ─── Tabs dinámicos ──────────────────────────────────────────────────────────
  const hasTabla = TABLA_PLANS.includes((selectedLeague?.plan || '').toUpperCase());
  const TABS = hasTabla
    ? ['MI LIGA', 'CHAT', 'UNIRSE', 'CREAR', 'TABLA']
    : ['MI LIGA', 'CHAT', 'UNIRSE', 'CREAR'];

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <LinearGradient colors={['#020408','#05080F']} style={s.header}>
        <View style={s.topLine} />
        <View style={s.headerLeft}>
          <Image
            source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
            style={s.headerLogo} resizeMode="contain"
          />
          <View>
            <Text style={s.headerTitle}>LIGA</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        {selectedLeague && (
          <LinearGradient colors={[C.gold, C.gold2]} style={s.planBadge}>
            <Text style={s.planBadgeTxt}>⚡ {selectedLeague.plan}</Text>
          </LinearGradient>
        )}
      </LinearGradient>

      {/* TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabRowScroll}
        contentContainerStyle={s.tabRow}
      >
        {TABS.map((tabName, i) => (
          <TouchableOpacity
            key={i}
            style={[
              s.tab,
              tab === i && s.tabOn,
              tabName === 'TABLA' && s.tabTabla,
              tabName === 'TABLA' && tab === i && s.tabTablaOn,
            ]}
            onPress={() => setTab(i)}
          >
            {tabName === 'TABLA' && <Text style={s.tabTablaIcon}>📊</Text>}
            <Text style={[
              s.tabTxt,
              tab === i && s.tabTxtOn,
              tabName === 'TABLA' && s.tabTablaTxt,
              tabName === 'TABLA' && tab === i && s.tabTablaTxtOn,
            ]}>
              {tabName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MODAL SCANNER */}
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

      {/* MODAL QR */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <TouchableOpacity
          style={s.qrModalOverlay}
          activeOpacity={1}
          onPress={() => setQrModalVisible(false)}
        >
          <View style={s.qrModalCard}>
            <LinearGradient colors={['#0A0F1A','#020408']} style={StyleSheet.absoluteFill} />
            <View style={s.qrModalTopLine} />
            <Text style={s.qrModalTitle}>{selectedLeague?.name}</Text>
            <Text style={s.qrModalSub}>Escanea para unirte a la liga</Text>
            <View style={s.qrModalQR}>
              {selectedLeague && (
                <QRCode
                  value={selectedLeague.inviteLink || `https://golzi.app/liga/${selectedLeague.code}`}
                  size={200}
                  color="#FFD700"
                  backgroundColor="#020408"
                />
              )}
            </View>
            <View style={s.qrModalCodeRow}>
              <Text style={s.qrModalCodeLabel}>CÓDIGO</Text>
              <Text style={s.qrModalCode}>{selectedLeague?.code}</Text>
            </View>
            <Text style={s.qrModalLink}>golzi.app/liga/{selectedLeague?.code}</Text>
            <TouchableOpacity
              style={s.qrModalShareBtn}
              onPress={() => { setQrModalVisible(false); handleShare(); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.qrModalShareInner}>
                <Text style={s.qrModalShareTxt}>📤 COMPARTIR INVITACIÓN</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={s.qrModalClose}>Toca fuera para cerrar</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* TAB 0 — MI LIGA */}
        {tab === 0 && (
          <View style={s.tabContent}>
            {loading ? (
              <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
            ) : !user ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>🔒</Text>
                <Text style={s.emptyTitle}>INICIA SESIÓN</Text>
                <Text style={s.emptySub}>Para acceder a tu liga debes iniciar sesión</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Login')}>
                  <LinearGradient colors={[C.gold, C.gold2]} style={s.emptyBtnInner}>
                    <Text style={s.emptyBtnTxt}>⚡ INICIAR SESIÓN</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : myLeagues.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>🏆</Text>
                <Text style={s.emptyTitle}>SIN LIGAS AÚN</Text>
                <Text style={s.emptySub}>Crea tu primera liga o únete con un código</Text>
                <View style={s.emptyBtns}>
                  <TouchableOpacity style={[s.emptyBtn, {flex:1}]} onPress={() => setTab(3)}>
                    <LinearGradient colors={[C.gold, C.gold2]} style={s.emptyBtnInner}>
                      <Text style={s.emptyBtnTxt}>⚡ CREAR</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.emptyBtn, {flex:1}]} onPress={() => setTab(2)}>
                    <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.05)']} style={[s.emptyBtnInner, {borderWidth:1, borderColor:'rgba(255,215,0,0.3)'}]}>
                      <Text style={[s.emptyBtnTxt, {color:C.gold}]}>UNIRSE</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {myLeagues.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.leagueSelector}>
                    {myLeagues.map((l,i) => (
                      <TouchableOpacity key={i} style={[s.leagueChip, selectedLeague?.id === l.id && s.leagueChipOn]} onPress={() => setSelectedLeague(l)}>
                        <Text style={[s.leagueChipTxt, selectedLeague?.id === l.id && s.leagueChipTxtOn]}>{l.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {selectedLeague && (
                  <View style={s.ligaHero}>
                    <LinearGradient colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.03)']} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill} />
                    <View style={s.heroTopLine} />
                    <View style={s.ligaHeroTop}>
                      <View style={{ flex:1 }}>
                        <Text style={s.ligaName}>{selectedLeague.name}</Text>
                        <Text style={s.ligaInfo}>{members.length}/{selectedLeague.maxMembers || 5} jugadores · Plan {selectedLeague.plan}</Text>
                      </View>
                      {/* QR real para GOLZAIR+ / placeholder para el resto */}
                      {QR_PLANS.includes((selectedLeague.plan || '').toUpperCase()) && (user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen) ? (
                        <TouchableOpacity onPress={() => setQrModalVisible(true)} activeOpacity={0.85}>
                          <View style={s.qrBoxReal}>
                            <QRCode
                              value={selectedLeague.inviteLink || `https://golzi.app/liga/${selectedLeague.code}`}
                              size={72}
                              color="#FFD700"
                              backgroundColor="#020408"
                            />
                            <Text style={s.qrTapTxt}>TAP PARA VER</Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <View style={s.qrBox}>
                          <Text style={s.qrLabel}>QR</Text>
                          <Text style={s.qrCode}>{selectedLeague.code}</Text>
                          <Text style={s.qrLockTxt}>GOLZAIR+</Text>
                        </View>
                      )}
                    </View>
                    {(user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen) && (
                      <View style={s.codeRow}>
                        <Text style={s.codeLabel}>CODIGO INVITACION</Text>
                        <LinearGradient colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.08)']} style={s.codePill}>
                          <Text style={s.codeTxt}>{selectedLeague.code}</Text>
                        </LinearGradient>
                      </View>
                    )}
                  </View>
                )}

                <View style={s.rankCard}>
                  <Text style={s.rankTitle}>RANKING</Text>
                  {members.length === 0 ? (
                    <Text style={s.emptySub}>Invita jugadores con el código</Text>
                  ) : members.map((m,i) => (
                    <LinearGradient
                      key={i}
                      colors={m.id === user?.uid ? ['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
                      start={{x:0,y:0}} end={{x:1,y:0}}
                      style={[s.memberRow, m.id === user?.uid && s.memberRowMe]}
                    >
                      <Text style={[s.memberPos, i===0 && { color:C.gold }]}>
                        {i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : i+1}
                      </Text>
                      <LinearGradient
                        colors={m.id === user?.uid ? [C.gold, C.gold2] : ['#1A1F2E','#141824']}
                        style={s.memberAvatar}
                      >
                        <Text style={[s.memberAvatarTxt, m.id === user?.uid && { color:'#000' }]}>
                          {(m.username || m.email || 'U').slice(0,1).toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <View style={s.memberInfo}>
                        <View style={s.memberNameRow}>
                          <Text style={[s.memberName, m.id === user?.uid && { color:C.gold }]}>
                            {m.username || m.email?.split('@')[0] || 'Usuario'}
                          </Text>
                          {m.id === user?.uid && (
                            <View style={s.youBadge}><Text style={s.youTxt}>TÚ</Text></View>
                          )}
                        </View>
                        <Text style={s.memberFlag}>{m.country || '🌍'}</Text>
                      </View>
                      <View style={s.memberPtsBox}>
                        <Text style={[s.memberPts, m.id === user?.uid && { color:C.gold }]}>{m.totalPoints || 0}</Text>
                        <Text style={s.memberPtsLbl}>PTS</Text>
                      </View>
                    </LinearGradient>
                  ))}
                </View>

                <View style={{ gap:8 }}>
                  {selectedLeague && user && selectedLeague.ownerId === user.uid && (
                    <TouchableOpacity style={s.shareBtn} onPress={toggleInvite} disabled={togglingInvite} activeOpacity={0.85}>
                      <LinearGradient
                        colors={selectedLeague.inviteOpen ? ['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)'] : ['rgba(255,51,85,0.12)','rgba(255,51,85,0.04)']}
                        style={[s.shareBtnInner, {borderColor: selectedLeague.inviteOpen ? 'rgba(0,255,135,0.4)' : 'rgba(255,51,85,0.4)'}]}
                      >
                        <Text style={[s.shareBtnTxt, {color: selectedLeague.inviteOpen ? '#00FF87' : '#FF3355'}]}>
                          {togglingInvite ? '...' : selectedLeague.inviteOpen ? 'INVITACION ABIERTA - TAP PARA CERRAR' : 'INVITACION CERRADA - TAP PARA ABRIR'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  {selectedLeague && user && (selectedLeague.ownerId === user.uid || selectedLeague.inviteOpen) && (
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
                  {selectedLeague && user && selectedLeague.ownerId !== user.uid && !selectedLeague.inviteOpen && (
                    <View style={{backgroundColor:'rgba(255,51,85,0.06)',borderRadius:12,borderWidth:1,borderColor:'rgba(255,51,85,0.2)',padding:12,alignItems:'center'}}>
                      <Text style={{fontFamily:'BarlowCondensed_700Bold',fontSize:11,color:'#FF3355',letterSpacing:1}}>El administrador ha cerrado las invitaciones</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* TAB 1 — CHAT */}
        {tab === 1 && (
          <View style={s.chatContainer}>
            {!selectedLeague ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>💬</Text>
                <Text style={s.emptyTitle}>SIN LIGA</Text>
                <Text style={s.emptySub}>Únete o crea una liga para chatear</Text>
              </View>
            ) : (
              <>
                <ScrollView ref={chatScrollRef} style={s.chatMessages} contentContainerStyle={{ padding:12, gap:8 }} showsVerticalScrollIndicator={false}>
                  {chatMsgs.length === 0 && (
                    <View style={{ alignItems:'center', justifyContent:'center', paddingVertical:60, gap:10 }}>
                      <Text style={{ fontSize:40 }}>💬</Text>
                      <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#6B7A99', letterSpacing:1 }}>SIN MENSAJES AÚN</Text>
                      <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#6B7A99', textAlign:'center' }}>Sé el primero en escribir</Text>
                    </View>
                  )}
                  {chatMsgs.map((m, i) => (
                    <View key={i} style={[s.chatBubbleWrap, m.userId === user?.uid && s.chatBubbleWrapMe]}>
                      {m.userId !== user?.uid && (
                        <View style={s.chatAvatar}>
                          <Text style={s.chatAvatarTxt}>{(m.user||'U').slice(0,1)}</Text>
                        </View>
                      )}
                      <View style={[s.chatBubble, m.userId === user?.uid && s.chatBubbleMe]}>
                        {m.userId !== user?.uid && <Text style={s.chatUser}>{m.user}</Text>}
                        <Text style={[s.chatText, m.userId === user?.uid && s.chatTextMe]}>{m.text}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={s.chatInputRow}>
                  <TextInput
                    style={s.chatInput}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor={C.muted}
                    value={chatMsg}
                    onChangeText={setChatMsg}
                    maxLength={200}
                    onSubmitEditing={sendChatMsg}
                  />
                  <TouchableOpacity style={[s.chatSendBtn, !chatMsg && { opacity:0.4 }]} onPress={sendChatMsg}>
                    <Text style={s.chatSendTxt}>⚡</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* TAB 2 — UNIRSE */}
        {tab === 2 && (
          <View style={s.tabContent}>
            <View style={s.formCard}>
              <Text style={s.formEyebrow}>GOLZI · MUNDIAL 2026</Text>
              <Text style={s.formTitle}>UNIRSE A LIGA</Text>
              <View style={s.formTitleLine} />
              <Text style={s.formSub}>Pide el código al administrador</Text>
              <Text style={s.inputLabel}>CÓDIGO DE LIGA</Text>
              <View style={s.inputWrap}>
                <Text style={s.inputIcon}>🏆</Text>
                <TextInput
                  style={s.input}
                  placeholder="Ej: GOLZ-2026"
                  placeholderTextColor={C.muted}
                  value={joinCode}
                  onChangeText={v => { setJoinCode(v); setJoinError(''); }}
                  autoCapitalize="characters"
                  maxLength={12}
                />
              </View>
              {joinError ? <Text style={s.errorTxt}>{joinError}</Text> : null}
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
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, (!joinCode || joining) && { opacity:0.4 }]}
                onPress={handleJoin}
                disabled={!joinCode || joining}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.actionBtnInner}>
                  {joining ? <ActivityIndicator color="#000" /> : <Text style={s.actionBtnTxt}>⚡ UNIRME</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 3 — CREAR */}
        {tab === 3 && (
          <View style={s.tabContent}>
            <View style={s.formCard}>
              <Text style={s.formEyebrow}>GOLZI · MUNDIAL 2026</Text>
              <Text style={s.formTitle}>CREAR LIGA</Text>
              <View style={s.formTitleLine} />
              <Text style={s.formSub}>Tu plan: {(userData?.plan || 'LIGA').toUpperCase()} · hasta {getMaxMembersByPlan(userData?.plan || 'liga')} jugadores</Text>
              <Text style={s.inputLabel}>NOMBRE DE LA LIGA</Text>
              <View style={s.inputWrap}>
                <Text style={s.inputIcon}>🏆</Text>
                <TextInput
                  style={s.input}
                  placeholder="Ej: Los Campeones 2026"
                  placeholderTextColor={C.muted}
                  value={ligaName}
                  onChangeText={v => { setLigaName(v); setCreateError(''); }}
                  maxLength={30}
                />
              </View>
              {createError ? <Text style={s.errorTxt}>{createError}</Text> : null}
              {/* Selector de cupos para GOLZAIR+ */}
              {userData && ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((userData.plan||'').toUpperCase()) && (
                <View style={{ gap:8 }}>
                  <Text style={s.inputLabel}>CUPOS PARA ESTA LIGA</Text>
                  <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#6B7A99' }}>
                    {(() => {
                      const total = getMaxMembersByPlan(userData.plan);
                      const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0);
                      const avail = total - used;
                      return 'Pool total: ' + total + ' | Usados: ' + used + ' | Disponibles: ' + avail;
                    })()}
                  </Text>
                  <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
                    {[...new Set([
                      (() => { const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0); return getMaxMembersByPlan(userData.plan) - used; })(),
                      (() => { const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0); return Math.floor((getMaxMembersByPlan(userData.plan) - used) / 2); })(),
                      25, 20, 10
                    ].filter(n => { const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0); return n >= 10 && n <= getMaxMembersByPlan(userData.plan) - used; }))].map(size => (
                      <TouchableOpacity
                        key={size}
                        onPress={() => setLigaSize(size)}
                        style={{
                          paddingHorizontal:14, paddingVertical:8, borderRadius:20,
                          backgroundColor: ligaSize === size ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                          borderWidth:1,
                          borderColor: ligaSize === size ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color: ligaSize === size ? '#FFD700' : '#6B7A99' }}>
                          {size} cupos
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.featCard}>
                <Text style={s.featTitle}>⚡ PLAN {(userData?.plan || 'LIGA').toUpperCase()}</Text>
                {['Hasta ' + getMaxMembersByPlan(userData?.plan || 'liga') + ' jugadores','Ranking privado en tiempo real','Chat de liga'].map((f,i) => (
                  <View key={i} style={s.featRow}>
                    <Text style={s.featCheck}>✓</Text>
                    <Text style={s.featTxt}>{f}</Text>
                  </View>
                ))}
              </LinearGradient>
              <TouchableOpacity
                style={[s.actionBtn, (!ligaName || creating) && { opacity:0.4 }]}
                onPress={handleCreate}
                disabled={!ligaName || creating}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.actionBtnInner}>
                  {creating ? <ActivityIndicator color="#000" /> : <Text style={s.actionBtnTxt}>⚡ CREAR LIGA</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 4 — TABLA DE PREDICCIONES (solo MASTER+) */}
        {tab === 4 && (
          <View style={s.tabContent}>
            {!selectedLeague ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyIcon}>📊</Text>
                <Text style={s.emptyTitle}>SIN LIGA</Text>
                <Text style={s.emptySub}>Selecciona una liga para ver la tabla</Text>
              </View>
            ) : tablaLoading ? (
              <View style={{ paddingVertical: 60, alignItems: 'center', gap: 12 }}>
                <ActivityIndicator color={C.gold} size="large" />
                <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted }}>Calculando predicciones...</Text>
              </View>
            ) : (
              <>
                {/* Header card */}
                <View style={s.tablaHeader}>
                  <LinearGradient
                    colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.03)']}
                    start={{x:0,y:0}} end={{x:1,y:1}}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.tablaHeaderTopLine} />
                  <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
                    <Text style={{ fontSize:28 }}>📊</Text>
                    <View>
                      <Text style={s.tablaTitleTxt}>TABLA DE PREDICCIONES</Text>
                      <Text style={s.tablaSubTxt}>{selectedLeague.name} · {tablaData.length} jugadores</Text>
                    </View>
                  </View>
                  {/* Leyenda de puntos */}
                  <View style={s.tablaLegend}>
                    {[
                      { color: C.gold,   label: '✅ Exacta', pts: '+10' },
                      { color: C.cyan,   label: '〜 Resultado', pts: '+5' },
                      { color: C.muted2, label: '〜 Empate', pts: '+2' },
                    ].map((item, i) => (
                      <View key={i} style={s.tablaLegendItem}>
                        <View style={[s.tablaLegendDot, { backgroundColor: item.color }]} />
                        <Text style={s.tablaLegendTxt}>{item.label} </Text>
                        <Text style={[s.tablaLegendPts, { color: item.color }]}>{item.pts}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Tabla columns header */}
                <View style={s.tablaColHeader}>
                  <Text style={[s.tablaColTxt, { flex: 0.4 }]}>#</Text>
                  <Text style={[s.tablaColTxt, { flex: 2.2, textAlign: 'left' }]}>JUGADOR</Text>
                  <Text style={[s.tablaColTxt, { flex: 0.8 }]}>✅</Text>
                  <Text style={[s.tablaColTxt, { flex: 0.8 }]}>〜</Text>
                  <Text style={[s.tablaColTxt, { flex: 0.8 }]}>PRED</Text>
                  <Text style={[s.tablaColTxt, { flex: 1, color: C.gold }]}>PTS</Text>
                </View>

                {/* Filas */}
                {tablaData.length === 0 ? (
                  <View style={s.tablaEmpty}>
                    <Text style={s.tablaEmptyIcon}>⚽</Text>
                    <Text style={s.tablaEmptyTitle}>AÚN NO HAY RESULTADOS</Text>
                    <Text style={s.tablaEmptySub}>La tabla se activa cuando terminen los primeros partidos</Text>
                  </View>
                ) : tablaData.map((m, i) => {
                  const isMe = m.id === user?.uid;
                  const stats = m.tablaStats;
                  const pct = stats.total > 0 ? Math.round((stats.exact / stats.total) * 100) : 0;
                  const isTop = i === 0;
                  return (
                    <LinearGradient
                      key={m.id}
                      colors={
                        isMe
                          ? ['rgba(255,215,0,0.14)', 'rgba(255,215,0,0.05)']
                          : isTop
                          ? ['rgba(0,255,135,0.08)', 'rgba(0,255,135,0.02)']
                          : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']
                      }
                      start={{x:0,y:0}} end={{x:1,y:0}}
                      style={[
                        s.tablaRow,
                        isMe && s.tablaRowMe,
                        isTop && !isMe && s.tablaRowTop,
                        i === tablaData.length - 1 && { marginBottom: 0 },
                      ]}
                    >
                      {/* Posición */}
                      <View style={[s.tablaPos, { flex: 0.4 }]}>
                        {i === 0 ? (
                          <Text style={{ fontSize: 16 }}>🥇</Text>
                        ) : i === 1 ? (
                          <Text style={{ fontSize: 16 }}>🥈</Text>
                        ) : i === 2 ? (
                          <Text style={{ fontSize: 16 }}>🥉</Text>
                        ) : (
                          <Text style={s.tablaPosNum}>{i + 1}</Text>
                        )}
                      </View>

                      {/* Jugador */}
                      <View style={[s.tablaPlayerCell, { flex: 2.2 }]}>
                        <LinearGradient
                          colors={isMe ? [C.gold, C.gold2] : ['#1A1F2E', '#141824']}
                          style={s.tablaAvatar}
                        >
                          <Text style={[s.tablaAvatarTxt, isMe && { color: '#000' }]}>
                            {(m.username || m.email || 'U').slice(0, 1).toUpperCase()}
                          </Text>
                        </LinearGradient>
                        <View style={{ flex: 1, gap: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={[s.tablaPlayerName, isMe && { color: C.gold }]} numberOfLines={1}>
                              {m.username || m.email?.split('@')[0] || 'Usuario'}
                            </Text>
                            {isMe && (
                              <View style={s.tablaMeBadge}>
                                <Text style={s.tablaMeTxt}>TÚ</Text>
                              </View>
                            )}
                          </View>
                          {/* Barra de precisión */}
                          {stats.total > 0 && (
                            <View style={s.tablaAccRow}>
                              <View style={s.tablaAccBar}>
                                <View style={[s.tablaAccFill, { width: `${pct}%` as any }]} />
                              </View>
                              <Text style={s.tablaAccTxt}>{pct}%</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Exactas */}
                      <View style={{ flex: 0.8, alignItems: 'center' }}>
                        <Text style={[s.tablaStatNum, { color: C.gold }]}>{stats.exact}</Text>
                      </View>

                      {/* Resultado (winner + draw) */}
                      <View style={{ flex: 0.8, alignItems: 'center' }}>
                        <Text style={[s.tablaStatNum, { color: C.cyan }]}>{stats.winner + stats.draw}</Text>
                      </View>

                      {/* Total predicciones */}
                      <View style={{ flex: 0.8, alignItems: 'center' }}>
                        <Text style={s.tablaStatNum}>{stats.total}</Text>
                      </View>

                      {/* Puntos */}
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={[s.tablaPts, isMe && { color: C.gold }, isTop && !isMe && { color: C.green }]}>
                          {stats.pts}
                        </Text>
                        <Text style={s.tablaPtsLbl}>PTS</Text>
                      </View>
                    </LinearGradient>
                  );
                })}

                {/* Botón refresh */}
                <TouchableOpacity
                  style={s.tablaRefreshBtn}
                  onPress={() => { setTablaLoaded(null); setTablaData([]); loadTabla(); }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255,215,0,0.08)', 'rgba(255,215,0,0.02)']}
                    style={s.tablaRefreshInner}
                  >
                    <Text style={s.tablaRefreshTxt}>🔄 ACTUALIZAR TABLA</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Nota de partidos pendientes */}
                <View style={s.tablaNota}>
                  <Text style={s.tablaNotaTxt}>
                    ⚡ Los puntos se calculan sobre partidos finalizados. La tabla se actualiza en tiempo real conforme avanzan los partidos del Mundial.
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.15)', position:'relative' },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:10 },
  headerLogo:{ width:36, height:36 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  headerSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, letterSpacing:2 },
  planBadge:{ borderRadius:10, paddingHorizontal:12, paddingVertical:6 },
  planBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:'#000', letterSpacing:1 },

  // Tabs — ahora en ScrollView horizontal para acomodar el tab extra
  tabRowScroll:{ maxHeight:50, marginTop:10, marginBottom:2 },
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, paddingBottom:2 },
  tab:{ paddingVertical:9, paddingHorizontal:14, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)', minWidth:64 },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  // Tab TABLA especial
  tabTabla:{ flexDirection:'row', gap:4, backgroundColor:'rgba(255,215,0,0.06)', borderColor:'rgba(255,215,0,0.2)' },
  tabTablaOn:{ backgroundColor:'rgba(255,215,0,0.15)', borderColor:C.gold },
  tabTablaIcon:{ fontSize:10 },
  tabTablaTxt:{ color:'rgba(255,215,0,0.7)' },
  tabTablaTxtOn:{ color:C.gold },

  scroll:{ paddingBottom:40 },
  tabContent:{ paddingHorizontal:12, gap:12 },
  emptyBox:{ alignItems:'center', paddingVertical:50, gap:12, paddingHorizontal:24 },
  emptyIcon:{ fontSize:56 },
  emptyTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, letterSpacing:2 },
  emptySub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, textAlign:'center' },
  emptyBtns:{ flexDirection:'row', gap:10, width:'100%' },
  emptyBtn:{ borderRadius:12, overflow:'hidden' },
  emptyBtnInner:{ paddingVertical:14, alignItems:'center', borderRadius:12 },
  emptyBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:'#000', letterSpacing:2 },
  leagueSelector:{ marginBottom:8 },
  leagueChip:{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', marginRight:8 },
  leagueChipOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  leagueChipTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.muted },
  leagueChipTxtOn:{ color:C.gold },
  ligaHero:{ borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.4)', padding:16, overflow:'hidden', position:'relative' },
  heroTopLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:C.gold },
  ligaHeroTop:{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, gap:12 },
  ligaName:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, letterSpacing:1 },
  ligaInfo:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, marginTop:2 },
  qrBox:{ backgroundColor:'rgba(255,255,255,0.05)', borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:10, alignItems:'center' },
  qrLabel:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.gold },
  qrCode:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:7, color:C.muted, marginTop:2 },
  qrLockTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:'rgba(255,215,0,0.4)', marginTop:3, letterSpacing:1 },

  // QR Real (GOLZAIR+)
  qrBoxReal:{ backgroundColor:'#020408', borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.4)', padding:8, alignItems:'center', gap:4 },
  qrTapTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.gold, letterSpacing:1 },

  // Modal QR
  qrModalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.92)', alignItems:'center', justifyContent:'center', padding:24 },
  qrModalCard:{ width:'100%', maxWidth:340, borderRadius:24, overflow:'hidden', padding:28, alignItems:'center', gap:12, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  qrModalTopLine:{ position:'absolute', top:0, left:0, right:0, height:3, backgroundColor:C.gold },
  qrModalTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, letterSpacing:2, textAlign:'center' },
  qrModalSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted, textAlign:'center' },
  qrModalQR:{ backgroundColor:'#020408', borderRadius:16, borderWidth:2, borderColor:'rgba(255,215,0,0.4)', padding:16, marginVertical:4 },
  qrModalCodeRow:{ flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'rgba(255,215,0,0.08)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', paddingHorizontal:16, paddingVertical:10 },
  qrModalCodeLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:2 },
  qrModalCode:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.gold, letterSpacing:2 },
  qrModalLink:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  qrModalShareBtn:{ borderRadius:14, overflow:'hidden', width:'100%' },
  qrModalShareInner:{ paddingVertical:14, alignItems:'center', borderRadius:14 },
  qrModalShareTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:'#000', letterSpacing:2 },
  qrModalClose:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:'rgba(255,255,255,0.2)' },
  inviteClosedBox:{ backgroundColor:'rgba(255,51,85,0.06)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,51,85,0.2)', padding:12, alignItems:'center' },
  inviteClosedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:'#FF3355', letterSpacing:1 },
  scanBtn:{ borderRadius:12, overflow:'hidden' },
  scanBtnInner:{ borderRadius:12, borderWidth:1, borderColor:'rgba(0,198,255,0.3)', paddingVertical:14, alignItems:'center' },
  scanBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:'#00C6FF', letterSpacing:2 },
  codeRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  codeLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },
  codePill:{ borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:12, paddingVertical:6 },
  codeTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.gold, letterSpacing:1 },
  rankCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:16 },
  rankTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:12 },
  memberRow:{ flexDirection:'row', alignItems:'center', borderRadius:12, padding:10, marginBottom:6, gap:10 },
  memberRowMe:{ borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  memberPos:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted, width:28, textAlign:'center' },
  memberAvatar:{ width:38, height:38, borderRadius:19, alignItems:'center', justifyContent:'center' },
  memberAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted2 },
  memberInfo:{ flex:1, gap:2 },
  memberNameRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  memberName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.text },
  youBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:6, paddingHorizontal:6, paddingVertical:1, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  youTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.gold, letterSpacing:1 },
  memberFlag:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted },
  memberPtsBox:{ alignItems:'center' },
  memberPts:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.text },
  memberPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },
  shareBtn:{ borderRadius:14, overflow:'hidden' },
  shareBtnInner:{ borderRadius:14, borderWidth:1, borderColor:'rgba(0,255,135,0.4)', paddingVertical:14, alignItems:'center' },
  shareBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.green, letterSpacing:2 },
  formCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.12)', padding:16, gap:10 },
  formEyebrow:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'rgba(255,215,0,0.5)', letterSpacing:3 },
  formTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.gold, letterSpacing:1 },
  formTitleLine:{ width:48, height:3, backgroundColor:C.gold, borderRadius:2 },
  formSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted },
  inputLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, marginTop:4 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingHorizontal:12, height:50 },
  inputIcon:{ fontSize:16, marginRight:8 },
  input:{ flex:1, fontFamily:'BarlowCondensed_400Regular', fontSize:15, color:C.text } as any,
  errorTxt:{ color:C.red, fontFamily:'BarlowCondensed_400Regular', fontSize:12 },
  actionBtn:{ borderRadius:14, overflow:'hidden' },
  actionBtnInner:{ paddingVertical:15, alignItems:'center' },
  actionBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:2, color:'#000' },
  chatContainer:{ flex:1, height:500 },
  chatMessages:{ flex:1, backgroundColor:'rgba(255,255,255,0.02)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', marginHorizontal:12, marginBottom:10, maxHeight:380 },
  chatBubbleWrap:{ flexDirection:'row', alignItems:'flex-end', gap:8, marginBottom:8 },
  chatBubbleWrapMe:{ flexDirection:'row-reverse' },
  chatAvatar:{ width:32, height:32, borderRadius:16, backgroundColor:'rgba(255,215,0,0.2)', alignItems:'center', justifyContent:'center' },
  chatAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold },
  chatBubble:{ backgroundColor:'rgba(255,255,255,0.06)', borderRadius:16, borderBottomLeftRadius:4, padding:10, maxWidth:'75%', gap:3 },
  chatBubbleMe:{ backgroundColor:'rgba(255,215,0,0.12)', borderRadius:16, borderBottomRightRadius:4, borderWidth:1, borderColor:'rgba(255,215,0,0.25)' },
  chatUser:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.gold, letterSpacing:0.5 },
  chatText:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted2, lineHeight:18 },
  chatTextMe:{ color:C.text },
  chatInputRow:{ flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:12, paddingBottom:8 },
  chatInput:{ flex:1, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,215,0,0.25)', borderRadius:12, paddingHorizontal:14, paddingVertical:10, color:C.text, fontFamily:'BarlowCondensed_400Regular', fontSize:14 } as any,
  chatSendBtn:{ width:44, height:44, borderRadius:12, backgroundColor:'rgba(255,215,0,0.15)', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', alignItems:'center', justifyContent:'center' },
  chatSendTxt:{ fontSize:18 },
  featCard:{ borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:14, gap:8 },
  featTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.gold, marginBottom:4 },
  featRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  featCheck:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.green },
  featTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted2 },

  // ─── TABLA styles ────────────────────────────────────────────────────────────
  tablaHeader:{ borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.35)', padding:16, overflow:'hidden', position:'relative', gap:14 },
  tablaHeaderTopLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:C.gold },
  tablaTitleTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.gold, letterSpacing:2 },
  tablaSubTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, marginTop:1 },
  tablaLegend:{ flexDirection:'row', flexWrap:'wrap', gap:10 },
  tablaLegendItem:{ flexDirection:'row', alignItems:'center', gap:4 },
  tablaLegendDot:{ width:6, height:6, borderRadius:3 },
  tablaLegendTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  tablaLegendPts:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10 },

  tablaColHeader:{ flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:8, marginTop:4 },
  tablaColTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:1.5, textAlign:'center' },

  tablaRow:{ flexDirection:'row', alignItems:'center', borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.04)', padding:10, marginBottom:6, gap:4 },
  tablaRowMe:{ borderColor:'rgba(255,215,0,0.3)', borderWidth:1 },
  tablaRowTop:{ borderColor:'rgba(0,255,135,0.2)', borderWidth:1 },

  tablaPos:{ alignItems:'center', justifyContent:'center' },
  tablaPosNum:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.muted },

  tablaPlayerCell:{ flexDirection:'row', alignItems:'center', gap:8 },
  tablaAvatar:{ width:32, height:32, borderRadius:16, alignItems:'center', justifyContent:'center', flexShrink:0 },
  tablaAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:15, color:C.muted2 },
  tablaPlayerName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.text },
  tablaMeBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:5, paddingHorizontal:5, paddingVertical:1, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  tablaMeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.gold, letterSpacing:1 },

  tablaAccRow:{ flexDirection:'row', alignItems:'center', gap:4 },
  tablaAccBar:{ flex:1, height:3, borderRadius:2, backgroundColor:'rgba(255,255,255,0.06)', overflow:'hidden', maxWidth:60 },
  tablaAccFill:{ height:3, borderRadius:2, backgroundColor:C.gold },
  tablaAccTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },

  tablaStatNum:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted2 },

  tablaPts:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.text },
  tablaPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },

  tablaEmpty:{ paddingVertical:50, alignItems:'center', gap:10 },
  tablaEmptyIcon:{ fontSize:50 },
  tablaEmptyTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:2 },
  tablaEmptySub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted, textAlign:'center', paddingHorizontal:24 },

  tablaRefreshBtn:{ borderRadius:12, overflow:'hidden', marginTop:4 },
  tablaRefreshInner:{ borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', paddingVertical:12, alignItems:'center' },
  tablaRefreshTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.muted, letterSpacing:1 },

  tablaNota:{ backgroundColor:'rgba(255,215,0,0.04)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.1)', padding:12, marginTop:4 },
  tablaNotaTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, textAlign:'center', lineHeight:15 },
});