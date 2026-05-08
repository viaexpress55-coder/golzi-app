import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';

const C = {
  bg:        '#000000',
  surface2:  '#111111',
  gold:      '#FFD700',
  gold2:     '#FFA500',
  goldBorder:'rgba(255,215,0,0.3)',
  text:      '#FFFFFF',
  muted:     '#888888',
  muted2:    '#AAAAAA',
  green:     '#00FF87',
  red:       '#FF3355',
  cyan:      '#00C6FF',
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

  const TABS = [t('liga_title'), 'UNIRSE', 'CREAR'];

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>

      {/* HEADER */}
      <LinearGradient colors={['#000','#0A0A0A']} style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconBox}>
            <Text style={{ fontSize:20 }}>🔗</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>{t('liga_title')}</Text>
            <Text style={s.headerSub}>FIFA WORLD CUP 2026</Text>
          </View>
        </View>
        <View style={s.planBadge}>
          <Text style={s.planBadgeTxt}>⚽ {MY_LEAGUE.plan}</Text>
        </View>
      </LinearGradient>

      {/* TABS */}
      <View style={s.tabRow}>
        {TABS.map((tabName,i) => (
          <TouchableOpacity
            key={i}
            style={[s.tab, tab===i && s.tabOn]}
            onPress={() => setTab(i)}
          >
            <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tabName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* TAB 0 — MI LIGA */}
        {tab === 0 && (
          <View style={s.tabContent}>

            {/* Liga hero card */}
            <LinearGradient
              colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']}
              start={{x:0,y:0}} end={{x:1,y:1}}
              style={s.ligaHero}
            >
              <LinearGradient
                colors={['rgba(255,215,0,0.08)','transparent']}
                start={{x:0.5,y:0}} end={{x:0.5,y:1}}
                style={s.heroGlow}
              />
              <View style={s.ligaHeroTop}>
                <View>
                  <Text style={s.ligaName}>{MY_LEAGUE.name}</Text>
                  <Text style={s.ligaInfo}>
                    {MY_LEAGUE.members.length} participantes · Plan {MY_LEAGUE.plan}
                  </Text>
                </View>
                <View style={s.qrBox}>
                  <Text style={s.qrLabel}>QR</Text>
                  <Text style={s.qrCode}>{MY_LEAGUE.code}</Text>
                </View>
              </View>

              {/* Invite code */}
              <View style={s.codeRow}>
                <Text style={s.codeLabel}>CÓDIGO DE INVITACIÓN</Text>
                <View style={s.codePill}>
                  <Text style={s.codeTxt}>🔑 {MY_LEAGUE.code}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Ranking */}
            <View style={s.rankCard}>
              <Text style={s.rankTitle}>RANKING DE LA LIGA</Text>
              {MY_LEAGUE.members.map((m,i) => (
                <LinearGradient
                  key={i}
                  colors={m.isMe
                    ? ['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']
                    : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']
                  }
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={[s.memberRow, m.isMe && s.memberRowMe]}
                >
                  <Text style={[s.memberPos, i===0 && { color:C.gold }]}>
                    {i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : m.pos}
                  </Text>

                  <LinearGradient
                    colors={m.isMe ? [C.gold, C.gold2] : ['#2A2A2A','#1A1A1A']}
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

                  <Text style={[s.memberPts, m.isMe && { color:C.gold }]}>{m.pts}</Text>
                </LinearGradient>
              ))}
            </View>

            {/* Share button */}
            <TouchableOpacity style={s.shareBtn} activeOpacity={0.85}>
              <LinearGradient
                colors={['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']}
                style={s.shareBtnInner}
              >
                <Text style={s.shareBtnTxt}>📤 COMPARTIR LIGA</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        )}

        {/* TAB 1 — UNIRSE */}
        {tab === 1 && (
          <View style={s.tabContent}>
            {joined ? (
              <LinearGradient
                colors={['rgba(0,255,135,0.08)','rgba(0,255,135,0.02)']}
                style={s.successCard}
              >
                <Text style={s.successIcon}>🏆</Text>
                <Text style={s.successTitle}>UNIDO A LA LIGA</Text>
                <Text style={s.successSub}>Ya eres parte. Empieza a predecir.</Text>
                <TouchableOpacity
                  style={s.successBtn}
                  onPress={() => { setJoined(false); setTab(0); }}
                >
                  <Text style={s.successBtnTxt}>VER MI LIGA →</Text>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View style={s.formCard}>
                <Text style={s.formTitle}>UNIRSE CON CÓDIGO</Text>
                <Text style={s.formSub}>Pide el código al administrador de la liga</Text>

                <Text style={s.inputLabel}>CÓDIGO DE INVITACIÓN</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.input}
                    placeholder="Ej: GOLZ-2026"
                    placeholderTextColor={C.muted}
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="characters"
                    maxLength={12}
                  />
                </View>

                <TouchableOpacity
                  style={[s.actionBtn, !code && { opacity:0.4 }]}
                  onPress={() => code && setJoined(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[C.gold, C.gold2]}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.actionBtnInner}
                  >
                    <Text style={s.actionBtnTxt}>⚡ UNIRSE A LA LIGA</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={s.divRow}>
                  <View style={s.divLine} />
                  <Text style={s.divTxt}>o escanea el QR</Text>
                  <View style={s.divLine} />
                </View>

                <TouchableOpacity style={s.qrBtn}>
                  <Text style={s.qrBtnTxt}>📷 ESCANEAR QR</Text>
                </TouchableOpacity>

                <View style={s.infoBox}>
                  <Text style={s.infoTxt}>
                    💡 Necesitas plan PLAYER o superior para unirte a ligas privadas.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 2 — CREAR */}
        {tab === 2 && (
          <View style={s.tabContent}>
            {created ? (
              <LinearGradient
                colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.02)']}
                style={s.successCard}
              >
                <Text style={s.successIcon}>🏆</Text>
                <Text style={s.successTitle}>LIGA CREADA</Text>
                <Text style={s.successSub}>"{ligaNm}" está lista para jugar.</Text>
                <View style={s.codePill}>
                  <Text style={s.codeTxt}>
                    🔑 GOLZ-{Math.random().toString(36).slice(2,6).toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.successBtn, { marginTop:16 }]}
                  onPress={() => { setCreated(false); setTab(0); }}
                >
                  <Text style={s.successBtnTxt}>VER MI LIGA →</Text>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View style={s.formCard}>
                <Text style={s.formTitle}>CREAR LIGA PRIVADA</Text>
                <Text style={s.formSub}>Necesitas plan LIGA o superior</Text>

                <Text style={s.inputLabel}>NOMBRE DE LA LIGA</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.input}
                    placeholder="Ej: Los Campeones 2026"
                    placeholderTextColor={C.muted}
                    value={ligaNm}
                    onChangeText={setLigaNm}
                    maxLength={30}
                  />
                </View>

                {/* Features */}
                <LinearGradient
                  colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']}
                  style={s.featCard}
                >
                  <Text style={s.featTitle}>🔗 LIGA — $4.99/torneo</Text>
                  {[
                    'Hasta 12 participantes',
                    'QR único de invitación',
                    'Ranking privado en tiempo real',
                    'Estadísticas de tu liga',
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
                  <LinearGradient
                    colors={[C.gold, C.gold2]}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.actionBtnInner}
                  >
                    <Text style={s.actionBtnTxt}>⚡ CREAR LIGA — $4.99</Text>
                  </LinearGradient>
                </TouchableOpacity>
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

  // Header
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:12 },
  headerIconBox:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', alignItems:'center', justifyContent:'center' },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  headerSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, letterSpacing:2 },
  planBadge:{ backgroundColor:'rgba(255,215,0,0.1)', borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:12, paddingVertical:6 },
  planBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.gold, letterSpacing:1 },

  // Tabs
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginVertical:10 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },

  scroll:{ paddingBottom:40 },
  tabContent:{ paddingHorizontal:12, gap:10 },

  // Liga hero
  ligaHero:{ borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.25)', borderTopWidth:2, borderTopColor:C.gold, padding:16, overflow:'hidden' },
  heroGlow:{ position:'absolute', top:0, left:0, right:0, height:80 },
  ligaHeroTop:{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 },
  ligaName:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold, letterSpacing:1 },
  ligaInfo:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, marginTop:2 },
  qrBox:{ backgroundColor:'rgba(255,255,255,0.05)', borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:10, alignItems:'center' },
  qrLabel:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold },
  qrCode:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:7, color:C.muted, marginTop:2 },
  codeRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  codeLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },
  codePill:{ backgroundColor:'rgba(255,215,0,0.12)', borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:12, paddingVertical:6 },
  codeTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.gold, letterSpacing:1 },

  // Rank card
  rankCard:{ backgroundColor:'#111', borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:16 },
  rankTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:12 },

  // Member rows
  memberRow:{ flexDirection:'row', alignItems:'center', borderRadius:12, padding:10, marginBottom:6, gap:10 },
  memberRowMe:{ borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  memberPos:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted, width:28, textAlign:'center' },
  memberAvatar:{ width:36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center' },
  memberAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted2 },
  memberInfo:{ flex:1, gap:2 },
  memberNameRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  memberName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.text },
  youBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:6, paddingHorizontal:6, paddingVertical:1, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  youTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.gold, letterSpacing:1 },
  memberFlag:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted },
  memberPts:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.text },

  // Share button
  shareBtn:{ borderRadius:14, overflow:'hidden' },
  shareBtnInner:{ borderRadius:14, borderWidth:1, borderColor:'rgba(0,255,135,0.25)', paddingVertical:14, alignItems:'center' },
  shareBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.green, letterSpacing:2 },

  // Form card
  formCard:{ backgroundColor:'#111', borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:16, gap:8 },
  formTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:1 },
  formSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted },
  inputLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, marginTop:4 },
  inputWrap:{ backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingHorizontal:14, height:50, justifyContent:'center' },
  input:{ fontFamily:'BarlowCondensed_400Regular', fontSize:15, color:C.text } as any,

  // Action button
  actionBtn:{ borderRadius:14, overflow:'hidden' },
  actionBtnInner:{ paddingVertical:15, alignItems:'center' },
  actionBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:2, color:'#000' },

  // Divider
  divRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  divLine:{ flex:1, height:1, backgroundColor:'rgba(255,255,255,0.06)' },
  divTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },

  // QR button
  qrBtn:{ borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingVertical:13, alignItems:'center' },
  qrBtnTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.muted, letterSpacing:1 },

  // Info box
  infoBox:{ backgroundColor:'rgba(255,215,0,0.05)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:12 },
  infoTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, lineHeight:17 },

  // Features card
  featCard:{ borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:14, gap:8 },
  featTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.gold, marginBottom:4 },
  featRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  featCheck:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.green },
  featTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted2 },

  // Success card
  successCard:{ borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:32, alignItems:'center', gap:10 },
  successIcon:{ fontSize:56 },
  successTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:2 },
  successSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, textAlign:'center' },
  successBtn:{ backgroundColor:'rgba(255,215,0,0.1)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingVertical:12, paddingHorizontal:28 },
  successBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold, letterSpacing:2 },
});