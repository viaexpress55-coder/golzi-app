import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, ActivityIndicator, Share, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';
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

function generateCode() {
  return 'GOLZ-' + Math.random().toString(36).slice(2,6).toUpperCase();
}

export default function LigaScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myLeagues, setMyLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [chatMsgs, setChatMsgs] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [ligaName, setLigaName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const chatScrollRef = useRef<any>(null);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  // Cargar ligas del usuario
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

  // Cargar miembros de la liga seleccionada
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

  // Cargar chat
  useEffect(() => {
    if (!selectedLeague) return;
    const q = query(collection(db, 'leagues', selectedLeague.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setChatMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsub();
  }, [selectedLeague]);

  async function handleCreate() {
    if (!ligaName.trim()) { setCreateError('Ingresa un nombre'); return; }
    if (!user) { setCreateError('Debes iniciar sesión'); return; }
    try {
      setCreating(true);
      setCreateError('');
      const code = generateCode();
      const leagueRef = doc(collection(db, 'leagues'));
      await setDoc(leagueRef, {
        name: ligaName.trim(),
        code,
        ownerId: user.uid,
        memberIds: [user.uid],
        plan: 'LIGA',
        maxMembers: 5,
        createdAt: serverTimestamp(),
        inviteLink: `https://golzi.app/liga/${code}`,
      });
      await setDoc(doc(db, 'leagues', leagueRef.id, 'members', user.uid), {
        userId: user.uid,
        joinedAt: serverTimestamp(),
        role: 'owner',
      });
      setLigaName('');
      setTab(0);
      Alert.alert('¡Liga creada!', `Código: ${code}`);
    } catch (e: any) {
      setCreateError('Error al crear la liga');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) { setJoinError('Ingresa el código'); return; }
    if (!user) { setJoinError('Debes iniciar sesión'); return; }
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

  async function sendChatMsg() {
    if (!chatMsg.trim() || !selectedLeague || !user) return;
    const txt = chatMsg.trim();
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
    try {
      await Share.share({
        message: `¡Únete a mi liga en GOLZI! Código: ${selectedLeague.code}\n${selectedLeague.inviteLink || 'https://golzi.app'}`,
      });
    } catch(e) {}
  }

  const TABS = ['MI LIGA', 'CHAT', 'UNIRSE', 'CREAR'];

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
      <View style={s.tabRow}>
        {TABS.map((tabName,i) => (
          <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tabName}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
                {/* Liga selector si tiene varias */}
                {myLeagues.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.leagueSelector}>
                    {myLeagues.map((l,i) => (
                      <TouchableOpacity key={i} style={[s.leagueChip, selectedLeague?.id === l.id && s.leagueChipOn]} onPress={() => setSelectedLeague(l)}>
                        <Text style={[s.leagueChipTxt, selectedLeague?.id === l.id && s.leagueChipTxtOn]}>{l.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Liga hero card */}
                {selectedLeague && (
                  <View style={s.ligaHero}>
                    <LinearGradient colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.03)']} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill} />
                    <View style={s.heroTopLine} />
                    <View style={s.ligaHeroTop}>
                      <View style={{ flex:1 }}>
                        <Text style={s.ligaName}>{selectedLeague.name}</Text>
                        <Text style={s.ligaInfo}>{members.length}/{selectedLeague.maxMembers || 5} jugadores · Plan {selectedLeague.plan}</Text>
                      </View>
                      <View style={s.qrBox}>
                        <Text style={s.qrLabel}>QR</Text>
                        <Text style={s.qrCode}>{selectedLeague.code}</Text>
                      </View>
                    </View>
                    <View style={s.codeRow}>
                      <Text style={s.codeLabel}>CÓDIGO DE INVITACIÓN</Text>
                      <LinearGradient colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.08)']} style={s.codePill}>
                        <Text style={s.codeTxt}>🏆 {selectedLeague.code}</Text>
                      </LinearGradient>
                    </View>
                  </View>
                )}

                {/* Ranking */}
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

                {/* Share button */}
                <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                  <LinearGradient colors={['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']} style={s.shareBtnInner}>
                    <Text style={s.shareBtnTxt}>📤 COMPARTIR LIGA</Text>
                  </LinearGradient>
                </TouchableOpacity>
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
              <Text style={s.formSub}>Necesitas plan LIGA o superior</Text>
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
              <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.featCard}>
                <Text style={s.featTitle}>⚡ PLAN LIGA</Text>
                {['Hasta 5 jugadores','Código QR de invitación','Ranking privado en tiempo real','Chat de liga'].map((f,i) => (
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
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginVertical:10 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
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
});