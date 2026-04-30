import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
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

const TABS = ['MI LIGA', 'UNIRSE', 'CREAR'];

export default function LigaScreen() {
  const [tab,     setTab]     = useState(0);
  const [code,    setCode]    = useState('');
  const [ligaNm,  setLigaNm]  = useState('');
  const [joined,  setJoined]  = useState(false);
  const [created, setCreated] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      <View style={s.bgGlow} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>🔗</Text>
          <Text style={s.headerTitle}>MI LIGA</Text>
        </View>
        <View style={s.planTag}>
          <Text style={s.planTagTxt}>{MY_LEAGUE.plan}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map((t,i) => (
          <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* MI LIGA */}
        {tab === 0 && (
          <View>
            {/* Liga hero */}
            <LinearGradient
              colors={['rgba(255,215,0,0.1)','rgba(255,165,0,0.05)']}
              start={{x:0,y:0}} end={{x:1,y:1}}
              style={s.ligaHero}
            >
              <View style={s.ligaHeroLeft}>
                <Text style={s.ligaName}>{MY_LEAGUE.name}</Text>
                <Text style={s.ligaInfo}>{MY_LEAGUE.members.length} participantes · Plan {MY_LEAGUE.plan}</Text>
              </View>
              {/* QR placeholder */}
              <View style={s.qrBox}>
                <Text style={s.qrTxt}>QR</Text>
                <Text style={s.qrCode}>{MY_LEAGUE.code}</Text>
              </View>
            </LinearGradient>

            {/* Codigo */}
            <View style={s.codeRow}>
              <Text style={s.codeLabel}>CODIGO DE INVITACION</Text>
              <View style={s.codeBadge}>
                <Text style={s.codeTxt}>{MY_LEAGUE.code}</Text>
              </View>
            </View>

            <Text style={s.sectionLabel}>RANKING DE LA LIGA</Text>

            {MY_LEAGUE.members.map((m,i) => (
              <View key={i} style={[s.memberRow, m.isMe && s.memberRowMe]}>
                <Text style={[s.memberPos, i===0 && { color:C.gold }]}>{m.pos}</Text>
                <Text style={s.memberFlag}>{m.country}</Text>
                <Text style={[s.memberName, m.isMe && { color:C.gold }]}>{m.name}</Text>
                {m.isMe && <View style={s.youBadge}><Text style={s.youTxt}>TU</Text></View>}
                <Text style={[s.memberPts, m.isMe && { color:C.gold }]}>{m.pts}</Text>
              </View>
            ))}

            <TouchableOpacity style={s.shareBtn}>
              <Text style={s.shareBtnTxt}>COMPARTIR LIGA</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UNIRSE */}
        {tab === 1 && (
          <View>
            {joined ? (
              <View style={s.successBox}>
                <Text style={s.successIcon}>🎉</Text>
                <Text style={s.successTitle}>UNIDO A LA LIGA</Text>
                <Text style={s.successSub}>Ya eres parte. Empieza a predecir.</Text>
                <TouchableOpacity style={s.successBtn} onPress={() => { setJoined(false); setTab(0); }}>
                  <Text style={s.successBtnTxt}>VER MI LIGA</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={s.formTitle}>UNIRSE CON CODIGO</Text>
                <Text style={s.formSub}>Pide el codigo al administrador</Text>
                <View style={s.inputWrap}>
                  <TextInput style={s.input} placeholder="Ej: GOLZ-2026" placeholderTextColor={C.muted}
                    value={code} onChangeText={setCode} autoCapitalize="characters" maxLength={12} />
                </View>
                <TouchableOpacity
                  style={[s.actionBtn, !code && s.actionBtnOff]}
                  onPress={() => code && setJoined(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#FFD700','#E8A000']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.actionBtnInner}>
                    <Text style={s.actionBtnTxt}>UNIRSE A LA LIGA</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={s.divRow}>
                  <View style={s.divLine} /><Text style={s.divTxt}>o escanea el QR</Text><View style={s.divLine} />
                </View>
                <TouchableOpacity style={s.qrScanBtn}>
                  <Text style={s.qrScanTxt}>ESCANEAR QR</Text>
                </TouchableOpacity>
                <View style={s.infoBox}>
                  <Text style={s.infoTxt}>Necesitas plan PLAYER o superior para unirte a ligas privadas.</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* CREAR */}
        {tab === 2 && (
          <View>
            {created ? (
              <View style={s.successBox}>
                <Text style={s.successIcon}>🏆</Text>
                <Text style={s.successTitle}>LIGA CREADA</Text>
                <Text style={s.successSub}>"{ligaNm}" esta lista.</Text>
                <View style={s.codeBadge}>
                  <Text style={s.codeTxt}>GOLZ-{Math.random().toString(36).slice(2,6).toUpperCase()}</Text>
                </View>
                <TouchableOpacity style={[s.successBtn, {marginTop:16}]} onPress={() => { setCreated(false); setTab(0); }}>
                  <Text style={s.successBtnTxt}>VER MI LIGA</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={s.formTitle}>CREAR LIGA PRIVADA</Text>
                <Text style={s.formSub}>Necesitas plan LIGA o superior</Text>
                <Text style={s.inputLabel}>NOMBRE DE LA LIGA</Text>
                <View style={s.inputWrap}>
                  <TextInput style={s.input} placeholder="Ej: Los Campeones 2026" placeholderTextColor={C.muted}
                    value={ligaNm} onChangeText={setLigaNm} maxLength={30} />
                </View>
                <View style={s.featuresBox}>
                  <Text style={s.featuresTitle}>PLAN LIGA — $4.99/torneo</Text>
                  {['Hasta 12 participantes','QR unico de invitacion','Ranking privado en tiempo real','Estadisticas de tu liga'].map((f,i) => (
                    <View key={i} style={s.featRow}>
                      <Text style={s.featDot}>✓</Text>
                      <Text style={s.featTxt}>{f}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[s.actionBtn, !ligaNm && s.actionBtnOff]}
                  onPress={() => ligaNm && setCreated(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#FFD700','#E8A000']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.actionBtnInner}>
                    <Text style={s.actionBtnTxt}>CREAR LIGA</Text>
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
  root:{ flex:1, backgroundColor:C.darker },
  bgGlow:{ position:'absolute', width:300, height:300, borderRadius:150, top:-60, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.08)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:13, paddingTop:48, paddingBottom:10 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  headerIcon:{ fontSize:17 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:17, color:C.gold, letterSpacing:2 },
  planTag:{ backgroundColor:'rgba(0,198,255,0.1)', borderWidth:1, borderColor:'rgba(0,198,255,0.28)', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  planTagTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.cyan, letterSpacing:1 },
  tabRow:{ flexDirection:'row', paddingHorizontal:13, gap:6, marginBottom:10 },
  tab:{ flex:1, paddingVertical:6, borderRadius:7, backgroundColor:C.surface, alignItems:'center', borderWidth:1, borderColor:C.border2 },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:C.border },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  scroll:{ paddingHorizontal:13, paddingBottom:40 },
  ligaHero:{ borderWidth:1, borderColor:C.border, borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  ligaHeroLeft:{ flex:1 },
  ligaName:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:1 },
  ligaInfo:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, marginTop:2 },
  qrBox:{ alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderRadius:8, padding:8, minWidth:56 },
  qrTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.gold },
  qrCode:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:8, color:C.muted, marginTop:2 },
  codeRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  codeLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:1 },
  codeBadge:{ backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:C.border, borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  codeTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.gold, letterSpacing:1 },
  sectionLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:2, marginBottom:8 },
  memberRow:{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:9, borderBottomWidth:1, borderBottomColor:C.border2 },
  memberRowMe:{ backgroundColor:'rgba(255,215,0,0.04)', borderRadius:8, paddingHorizontal:6 },
  memberPos:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.muted, width:24, textAlign:'center' },
  memberFlag:{ fontSize:16 },
  memberName:{ flex:1, fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.text },
  youBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:20, paddingHorizontal:6, paddingVertical:1 },
  youTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.gold },
  memberPts:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.green },
  shareBtn:{ marginTop:16, borderWidth:1, borderColor:'rgba(0,255,135,0.3)', borderRadius:10, paddingVertical:11, alignItems:'center', backgroundColor:'rgba(0,255,135,0.06)' },
  shareBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:15, color:C.green, letterSpacing:2 },
  formTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.gold, letterSpacing:1, marginBottom:4 },
  formSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, marginBottom:16 },
  inputLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:1, marginBottom:6 },
  inputWrap:{ backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:10, paddingHorizontal:14, height:48, justifyContent:'center', marginBottom:12 },
  input:{ fontFamily:'Barlow_400Regular', fontSize:15, color:C.text } as any,
  actionBtn:{ borderRadius:12, overflow:'hidden', marginBottom:14 },
  actionBtnOff:{ opacity:0.4 },
  actionBtnInner:{ paddingVertical:13, alignItems:'center' },
  actionBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:2, color:'#000' },
  divRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12 },
  divLine:{ flex:1, height:1, backgroundColor:C.border2 },
  divTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },
  qrScanBtn:{ borderWidth:1, borderColor:C.border2, borderRadius:10, paddingVertical:11, alignItems:'center', marginBottom:12 },
  qrScanTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:15, color:C.muted, letterSpacing:2 },
  infoBox:{ backgroundColor:'rgba(255,215,0,0.04)', borderWidth:1, borderColor:C.border, borderRadius:8, padding:10 },
  infoTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, lineHeight:16 },
  featuresBox:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:10, padding:12, marginBottom:14 },
  featuresTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.gold, marginBottom:8 },
  featRow:{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 },
  featDot:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.green },
  featTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted2 },
  successBox:{ alignItems:'center', paddingTop:32 },
  successIcon:{ fontSize:48, marginBottom:12 },
  successTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:2, marginBottom:8 },
  successSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, textAlign:'center', marginBottom:16 },
  successBtn:{ backgroundColor:'rgba(0,255,135,0.12)', borderWidth:1, borderColor:'rgba(0,255,135,0.3)', borderRadius:10, paddingVertical:11, paddingHorizontal:32 },
  successBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.green, letterSpacing:2 },
});