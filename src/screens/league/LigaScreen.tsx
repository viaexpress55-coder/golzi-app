import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', goldBorder:'rgba(255,215,0,0.25)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
};

const MY_LEAGUE = {
  name:'Los Golzaires', code:'GOLZ-2026', plan:'LIGA',
  members:[
    { pos:1, name:'CarlosGol',  country:'🇨🇴', pts:847, isMe:false },
    { pos:2, name:'viaexpress', country:'🇨🇴', pts:421, isMe:true  },
    { pos:3, name:'FutbolRey',  country:'🇲🇽', pts:398, isMe:false },
    { pos:4, name:'SambaBR',    country:'🇧🇷', pts:312, isMe:false },
    { pos:5, name:'TigreCol',   country:'🇨🇴', pts:287, isMe:false },
  ],
};

export default function LigaScreen() {
  const { t } = useTranslation();
  const [tab,     setTab]     = useState(0);
  const [code,    setCode]    = useState('');
  const [ligaNm,  setLigaNm]  = useState('');
  const [joined,  setJoined]  = useState(false);
  const [created, setCreated] = useState(false);
  const [codeFocus, setCodeFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMsgs, setChatMsgs] = useState<any[]>([]);
  const chatScrollRef = useRef<any>(null);
  const LEAGUE_ID = MY_LEAGUE.code;

  useEffect(() => {
    const q = query(
      collection(db, 'leagues', LEAGUE_ID, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      setChatMsgs(msgs);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated:true }), 100);
    });
    return () => unsub();
  }, []);

  async function sendChatMsg() {
    if (!chatMsg.trim()) return;
    const user = getAuth().currentUser;
    const txt = chatMsg.trim();
    setChatMsg('');
    try {
      await addDoc(collection(db, 'leagues', LEAGUE_ID, 'messages'), {
        text: txt,
        userId: user?.uid || 'anonymous',
        user: user?.displayName || 'viaexpress',
        flag: '🇨🇴',
        createdAt: serverTimestamp(),
      });
    } catch(e) { console.error(e); }
  }

  const TABS = [t('liga_title'), t('liga_chat'), t('liga_join'), t('liga_create')];

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

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
            <Text style={s.headerTitle}>{t('liga_title')}</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        <LinearGradient colors={[C.gold, C.gold2]} style={s.planBadge}>
          <Text style={s.planBadgeTxt}>⚽ {MY_LEAGUE.plan}</Text>
        </LinearGradient>
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

            {/* Liga hero card */}
            <View style={s.ligaHero}>
              <LinearGradient
                colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.03)']}
                start={{x:0,y:0}} end={{x:1,y:1}}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.heroTopLine} />
              <View style={s.ligaHeroTop}>
                <View style={{ flex:1 }}>
                  <Text style={s.ligaName}>{MY_LEAGUE.name}</Text>
                  <Text style={s.ligaInfo}>{MY_LEAGUE.members.length} participantes · Plan {MY_LEAGUE.plan}</Text>
                </View>
                <View style={s.qrBox}>
                  <Text style={s.qrLabel}>QR</Text>
                  <Text style={s.qrCode}>{MY_LEAGUE.code}</Text>
                </View>
              </View>
              <View style={s.codeRow}>
                <Text style={s.codeLabel}>{t('liga_invite_code')}</Text>
                <LinearGradient colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.08)']} style={s.codePill}>
                  <Text style={s.codeTxt}>🔗 {MY_LEAGUE.code}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Ranking */}
            <View style={s.rankCard}>
              <Text style={s.rankTitle}>{t('liga_ranking')}</Text>
              {MY_LEAGUE.members.map((m,i) => (
                <LinearGradient
                  key={i}
                  colors={m.isMe ? ['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={[s.memberRow, m.isMe && s.memberRowMe]}
                >
                  <Text style={[s.memberPos, i===0 && { color:C.gold }]}>
                    {i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : m.pos}
                  </Text>
                  <LinearGradient
                    colors={m.isMe ? [C.gold, C.gold2] : ['#1A1F2E','#141824']}
                    style={s.memberAvatar}
                  >
                    <Text style={[s.memberAvatarTxt, m.isMe && { color:'#000' }]}>
                      {m.name.slice(0,1).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={s.memberInfo}>
                    <View style={s.memberNameRow}>
                      <Text style={[s.memberName, m.isMe && { color:C.gold }]}>{m.name}</Text>
                      {m.isMe && (
                        <View style={s.youBadge}>
                          <Text style={s.youTxt}>TÚ</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.memberFlag}>{m.country}</Text>
                  </View>
                  <View style={s.memberPtsBox}>
                    <Text style={[s.memberPts, m.isMe && { color:C.gold }]}>{m.pts}</Text>
                    <Text style={s.memberPtsLbl}>PTS</Text>
                  </View>
                </LinearGradient>
              ))}
            </View>

            {/* Share button */}
            <TouchableOpacity style={s.shareBtn} activeOpacity={0.85}>
              <LinearGradient
                colors={['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']}
                style={s.shareBtnInner}
              >
                <Text style={s.shareBtnTxt}>📤 {t('liga_share')}</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        )}

        {/* TAB 1 — CHAT */}
        {tab === 1 && (
          <View style={s.chatContainer}>
            <ScrollView style={s.chatMessages} contentContainerStyle={{ padding:12, gap:8 }} showsVerticalScrollIndicator={false}>
              {chatMsgs.map((m, i) => (
                <View key={i} style={[s.chatBubbleWrap, m.userId === getAuth().currentUser?.uid && s.chatBubbleWrapMe]}>
                  {m.userId !== getAuth().currentUser?.uid && (
                    <View style={s.chatAvatar}>
                      <Text style={s.chatAvatarTxt}>{m.user.slice(0,1)}</Text>
                    </View>
                  )}
                  <View style={[s.chatBubble, m.isMe && s.chatBubbleMe]}>
                    {m.userId !== getAuth().currentUser?.uid && <Text style={s.chatUser}>{m.user} {m.flag}</Text>}
                    <Text style={[s.chatText, m.isMe && s.chatTextMe]}>{m.text}</Text>
                    <Text style={s.chatTime}>{m.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={s.chatInputRow}>
              <TextInput
                style={s.chatInput}
                placeholder={t('liga_write_message')}
                placeholderTextColor={C.muted}
                value={chatMsg}
                onChangeText={setChatMsg}
                maxLength={200}
              />
              <TouchableOpacity
                style={[s.chatSendBtn, !chatMsg && { opacity:0.4 }]}
                onPress={sendChatMsg}
              >
                <Text style={s.chatSendTxt}>⚡</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2 — UNIRSE */}
        {tab === 2 && (
          <View style={s.tabContent}>
            {joined ? (
              <LinearGradient colors={['rgba(0,255,135,0.1)','rgba(0,255,135,0.02)']} style={s.successCard}>
                <Text style={s.successIcon}>🏆</Text>
                <Text style={s.successTitle}>¡UNIDO A LA LIGA!</Text>
                <Text style={s.successSub}>Ya eres parte. Empieza a predecir.</Text>
                <TouchableOpacity style={s.successBtn} onPress={() => { setJoined(false); setTab(0); }}>
                  <Text style={s.successBtnTxt}>VER MI LIGA →</Text>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View style={s.formCard}>
                <Text style={s.formEyebrow}>GOLZI · MUNDIAL 2026</Text>
                <Text style={s.formTitle}>{t('liga_join_code')}</Text>
                <View style={s.formTitleLine} />
                <Text style={s.formSub}>Pide el código al administrador de la liga</Text>

                <Text style={s.inputLabel}>{t('liga_invite_code')}</Text>
                <View style={[s.inputWrap, codeFocus && s.inputFocus]}>
                  <Text style={s.inputIcon}>🔗</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Ej: GOLZ-2026"
                    placeholderTextColor={C.muted}
                    value={code}
                    onChangeText={setCode}
                    onFocus={() => setCodeFocus(true)}
                    onBlur={() => setCodeFocus(false)}
                    autoCapitalize="characters"
                    maxLength={12}
                  />
                </View>

                <TouchableOpacity
                  style={[s.actionBtn, !code && { opacity:0.4 }]}
                  onPress={() => code && setJoined(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.actionBtnInner}>
                    <Text style={s.actionBtnTxt}>⚡ {t('liga_join_btn')}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={s.divRow}>
                  <View style={s.divLine} />
                  <Text style={s.divTxt}>o escanea el QR</Text>
                  <View style={s.divLine} />
                </View>

                <TouchableOpacity style={s.qrBtn}>
                  <Text style={s.qrBtnTxt}>📷 {t('liga_scan_qr')}</Text>
                </TouchableOpacity>

                <View style={s.infoBox}>
                  <Text style={s.infoTxt}>💡 Necesitas plan GOLZAIR o superior para unirte a ligas privadas.</Text>
              </View>

              <View style={s.addonBox}>
                <Text style={s.addonBoxTitle}>🔓 ¿YA TIENES GOLZAIR?</Text>
                <Text style={s.addonBoxSub}>Expande tu liga con add-ons opcionales</Text>
                <View style={s.addonList}>
                  <View style={s.addonItem}>
                    <Text style={s.addonItemTxt}>+1 Liga adicional</Text>
                    <Text style={s.addonItemPrice}>$1.99</Text>
                  </View>
                  <View style={s.addonItem}>
                    <Text style={s.addonItemTxt}>+10 personas/liga</Text>
                    <Text style={s.addonItemPrice}>$0.99</Text>
                  </View>
                </View>
                <TouchableOpacity style={s.addonBtn} onPress={() => navigation.navigate('Plans')}>
                  <Text style={s.addonBtnTxt}>⚡ VER PLANES Y ADD-ONS</Text>
                </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 3 — CREAR */}
        {tab === 3 && (
          <View style={s.tabContent}>
            {created ? (
              <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.02)']} style={s.successCard}>
                <Text style={s.successIcon}>🏆</Text>
                <Text style={s.successTitle}>¡LIGA CREADA!</Text>
                <Text style={s.successSub}>"{ligaNm}" está lista para jugar.</Text>
                <LinearGradient colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.08)']} style={s.codePill}>
                  <Text style={s.codeTxt}>🔗 GOLZ-{Math.random().toString(36).slice(2,6).toUpperCase()}</Text>
                </LinearGradient>
                <TouchableOpacity style={[s.successBtn, { marginTop:8 }]} onPress={() => { setCreated(false); setTab(0); }}>
                  <Text style={s.successBtnTxt}>VER MI LIGA →</Text>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View style={s.formCard}>
                <Text style={s.formEyebrow}>GOLZI · MUNDIAL 2026</Text>
                <Text style={s.formTitle}>{t('liga_create_title')}</Text>
                <View style={s.formTitleLine} />
                <Text style={s.formSub}>Necesitas plan LIGA o superior</Text>

                <Text style={s.inputLabel}>{t('liga_name_label')}</Text>
                <View style={[s.inputWrap, nameFocus && s.inputFocus]}>
                  <Text style={s.inputIcon}>🏆</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Ej: Los Campeones 2026"
                    placeholderTextColor={C.muted}
                    value={ligaNm}
                    onChangeText={setLigaNm}
                    onFocus={() => setNameFocus(true)}
                    onBlur={() => setNameFocus(false)}
                    maxLength={30}
                  />
                </View>

                <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.featCard}>
                  <Text style={s.featTitle}>🏆 LIGA — $4.99/torneo</Text>
                  {[
                    'Hasta 25 participantes',
                    'QR único de invitación',
                    'Ranking privado en tiempo real',
                    'Add-on: +10 personas ($1.99)',
                  ].map((f,i) => (
                    <View key={i} style={s.featRow}>
                      <Text style={s.featCheck}>✓</Text>
                      <Text style={s.featTxt}>{f}</Text>
                    </View>
                  ))}
                </LinearGradient>

                <TouchableOpacity
                  style={[s.actionBtn, !ligaNm && { opacity:0.4 }]}
                  onPress={() => ligaNm && setCreated(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.actionBtnInner}>
                    <Text style={s.actionBtnTxt}>⚡ {t('liga_create_btn')}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={s.infoBox}>
                  <Text style={s.infoTxt}>🔒 El pago es por acceso a funcionalidades. Sin apuestas. Sin dinero en juego. Pago único por torneo.</Text>
                </View>
              </View>
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

  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginVertical:10 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },

  scroll:{ paddingBottom:40 },
  tabContent:{ paddingHorizontal:12, gap:12 },

  ligaHero:{ borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.25)', padding:16, overflow:'hidden', position:'relative' },
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

  rankCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:16 },
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
  shareBtnInner:{ borderRadius:14, borderWidth:1, borderColor:'rgba(0,255,135,0.25)', paddingVertical:14, alignItems:'center' },
  shareBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.green, letterSpacing:2 },

  formCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.12)', padding:16, gap:10 },
  formEyebrow:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'rgba(255,215,0,0.5)', letterSpacing:3 },
  formTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.gold, letterSpacing:1 },
  formTitleLine:{ width:48, height:3, backgroundColor:C.gold, borderRadius:2 },
  formSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted },
  inputLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, marginTop:4 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingHorizontal:12, height:50 },
  inputFocus:{ borderColor:'rgba(255,215,0,0.5)', backgroundColor:'rgba(255,215,0,0.05)' },
  inputIcon:{ fontSize:16, marginRight:8 },
  input:{ flex:1, fontFamily:'BarlowCondensed_400Regular', fontSize:15, color:C.text } as any,

  actionBtn:{ borderRadius:14, overflow:'hidden' },
  actionBtnInner:{ paddingVertical:15, alignItems:'center' },
  actionBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:2, color:'#000' },

  divRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  divLine:{ flex:1, height:1, backgroundColor:'rgba(255,255,255,0.06)' },
  divTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },

  qrBtn:{ borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingVertical:13, alignItems:'center' },
  qrBtnTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.muted, letterSpacing:1 },

  // Chat
  chatContainer:{ flex:1, height:500 },
  chatMessages:{ flex:1, backgroundColor:'rgba(255,255,255,0.02)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', marginHorizontal:12, marginBottom:10, maxHeight:380 },
  chatBubbleWrap:{ flexDirection:'row', alignItems:'flex-end', gap:8, marginBottom:8 },
  chatBubbleWrapMe:{ flexDirection:'row-reverse' },
  chatAvatar:{ width:32, height:32, borderRadius:16, backgroundColor:'rgba(255,215,0,0.2)', alignItems:'center', justifyContent:'center' },
  chatAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold },
  chatBubble:{ backgroundColor:'rgba(255,255,255,0.06)', borderRadius:16, borderBottomLeftRadius:4, padding:10, maxWidth:'75%', gap:3 },
  chatBubbleMe:{ backgroundColor:'rgba(255,215,0,0.12)', borderRadius:16, borderBottomRightRadius:4, borderWidth:1, borderColor:'rgba(255,215,0,0.25)' },
  chatUser:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.gold, letterSpacing:0.5 },
  chatText:{ fontFamily:'Barlow_400Regular', fontSize:13, color:C.muted2, lineHeight:18 },
  chatTextMe:{ color:C.text },
  chatTime:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, alignSelf:'flex-end' },
  chatInputRow:{ flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:12, paddingBottom:8 },
  chatInput:{ flex:1, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,215,0,0.25)', borderRadius:12, paddingHorizontal:14, paddingVertical:10, color:C.text, fontFamily:'Barlow_400Regular', fontSize:14 } as any,
  chatSendBtn:{ width:44, height:44, borderRadius:12, backgroundColor:'rgba(255,215,0,0.15)', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', alignItems:'center', justifyContent:'center' },
  chatSendTxt:{ fontSize:18 },

  infoBox:{ backgroundColor:'rgba(255,215,0,0.05)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:12 },
  infoTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, lineHeight:17 },
  addonBox:{ backgroundColor:'rgba(0,198,255,0.06)', borderRadius:12, borderWidth:1, borderColor:'rgba(0,198,255,0.2)', padding:14, gap:8 },
  addonBoxTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.cyan, letterSpacing:1 },
  addonBoxSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },
  addonList:{ gap:6 },
  addonItem:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  addonItemTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted2 },
  addonItemPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.cyan },
  addonBtn:{ backgroundColor:'rgba(0,198,255,0.1)', borderRadius:10, borderWidth:1, borderColor:'rgba(0,198,255,0.3)', paddingVertical:10, alignItems:'center' },
  addonBtnTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.cyan, letterSpacing:1 },

  featCard:{ borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:14, gap:8 },
  featTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.gold, marginBottom:4 },
  featRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  featCheck:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.green },
  featTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted2 },

  successCard:{ borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:32, alignItems:'center', gap:10 },
  successIcon:{ fontSize:56 },
  successTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:2 },
  successSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, textAlign:'center' },
  successBtn:{ backgroundColor:'rgba(255,215,0,0.1)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingVertical:12, paddingHorizontal:28 },
  successBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold, letterSpacing:2 },
});