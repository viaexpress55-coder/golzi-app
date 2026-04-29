import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', green:'#00C853', red:'#E8003D',
  cyan:'#00C6FF', border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const MY_LEAGUE = {
  name: 'Los Golzaires',
  code: 'GOLZ-2026',
  plan: 'LIGA',
  members: [
    { pos:1, name:'CarlosGol',   country:'🇨🇴', pts:847, isMe:false },
    { pos:2, name:'viaexpress',  country:'🇨🇴', pts:421, isMe:true  },
    { pos:3, name:'FutbolRey',   country:'🇲🇽', pts:398, isMe:false },
    { pos:4, name:'SambaBR',     country:'🇧🇷', pts:312, isMe:false },
    { pos:5, name:'TigreCol',    country:'🇨🇴', pts:287, isMe:false },
  ],
};

const TABS = ['MI LIGA', 'UNIRSE', 'CREAR'];

export default function LigaScreen() {
  const [tab, setTab]       = useState(0);
  const [code, setCode]     = useState('');
  const [ligaName, setLigaName] = useState('');
  const [joined, setJoined] = useState(false);
  const [created, setCreated] = useState(false);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo}>GOLZI</Text>
        <Text style={s.headerTitle}>MI LIGA</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={s.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabActive]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* MI LIGA */}
        {tab === 0 && (
          <View>
            <View style={s.ligaCard}>
              <View style={s.ligaCardTop}>
                <View>
                  <Text style={s.ligaName}>{MY_LEAGUE.name}</Text>
                  <Text style={s.ligaMembers}>{MY_LEAGUE.members.length} participantes · Plan {MY_LEAGUE.plan}</Text>
                </View>
                <View style={s.qrBox}>
                  <Text style={s.qrTxt}>QR</Text>
                </View>
              </View>
              <View style={s.codeRow}>
                <Text style={s.codeLabel}>CODIGO DE INVITACION</Text>
                <View style={s.codeBadge}>
                  <Text style={s.codeTxt}>{MY_LEAGUE.code}</Text>
                </View>
              </View>
            </View>

            <Text style={s.sectionTitle}>RANKING DE LA LIGA</Text>
            {MY_LEAGUE.members.map((m, i) => (
              <View key={i} style={[s.memberRow, m.isMe && s.memberRowMe]}>
                <Text style={[s.memberPos, i === 0 && { color: C.gold }]}>{m.pos}</Text>
                <Text style={s.memberFlag}>{m.country}</Text>
                <Text style={[s.memberName, m.isMe && { color: C.gold }]}>{m.name}</Text>
                {m.isMe && <View style={s.youBadge}><Text style={s.youTxt}>TU</Text></View>}
                <Text style={[s.memberPts, m.isMe && { color: C.gold }]}>{m.pts}</Text>
              </View>
            ))}

            <View style={s.inviteBox}>
              <Text style={s.inviteTitle}>Invita a tus amigos</Text>
              <Text style={s.inviteSub}>Comparte el codigo {MY_LEAGUE.code}</Text>
              <TouchableOpacity style={s.shareBtn}>
                <Text style={s.shareBtnTxt}>COMPARTIR LIGA</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* UNIRSE */}
        {tab === 1 && (
          <View>
            {joined ? (
              <View style={s.successBox}>
                <Text style={s.successIcon}>🎉</Text>
                <Text style={s.successTitle}>UNIDO A LA LIGA</Text>
                <Text style={s.successSub}>Ya eres parte de la liga. Empieza a predecir.</Text>
                <TouchableOpacity style={s.successBtn} onPress={() => { setJoined(false); setTab(0); }}>
                  <Text style={s.successBtnTxt}>VER MI LIGA</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={s.formTitle}>UNIRSE CON CODIGO</Text>
                <Text style={s.formSub}>Pide el codigo al administrador de la liga</Text>
                <TextInput
                  style={s.input}
                  placeholder="Ej: GOLZ-2026"
                  placeholderTextColor={C.muted}
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                  maxLength={12}
                />
                <TouchableOpacity
                  style={[s.actionBtn, !code && s.actionBtnDisabled]}
                  onPress={() => code && setJoined(true)}
                  activeOpacity={0.85}
                >
                  <Text style={s.actionBtnTxt}>UNIRSE A LA LIGA</Text>
                </TouchableOpacity>

                <View style={s.divider}>
                  <View style={s.divLine} />
                  <Text style={s.divTxt}>o escanea el QR</Text>
                  <View style={s.divLine} />
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
                <Text style={s.successSub}>Tu liga "{ligaName}" está lista. Comparte el código con tus amigos.</Text>
                <View style={s.codeBadge}>
                  <Text style={s.codeTxt}>GOLZ-{Math.random().toString(36).slice(2,6).toUpperCase()}</Text>
                </View>
                <TouchableOpacity style={[s.successBtn, { marginTop: 16 }]} onPress={() => { setCreated(false); setTab(0); }}>
                  <Text style={s.successBtnTxt}>VER MI LIGA</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={s.formTitle}>CREAR LIGA PRIVADA</Text>
                <Text style={s.formSub}>Necesitas plan LIGA o superior</Text>

                <Text style={s.inputLabel}>NOMBRE DE LA LIGA</Text>
                <TextInput
                  style={s.input}
                  placeholder="Ej: Los Campeones 2026"
                  placeholderTextColor={C.muted}
                  value={ligaName}
                  onChangeText={setLigaName}
                  maxLength={30}
                />

                <View style={s.planFeatures}>
                  <Text style={s.planFeatTitle}>PLAN LIGA — $4.99/torneo</Text>
                  {['Hasta 12 participantes', 'QR unico de invitacion', 'Ranking privado en tiempo real', 'Estadisticas de tu liga'].map((f, i) => (
                    <View key={i} style={s.featRow}>
                      <Text style={s.featDot}>✓</Text>
                      <Text style={s.featTxt}>{f}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[s.actionBtn, !ligaName && s.actionBtnDisabled]}
                  onPress={() => ligaName && setCreated(true)}
                  activeOpacity={0.85}
                >
                  <Text style={s.actionBtnTxt}>CREAR LIGA</Text>
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
  root:{ flex:1, backgroundColor:C.dark },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:48, paddingBottom:12, borderBottomWidth:1, borderBottomColor:C.border },
  logo:{ fontSize:18, color:C.gold, fontWeight:'900', letterSpacing:3, width:60 },
  headerTitle:{ fontSize:15, color:C.text, fontWeight:'700', letterSpacing:2 },
  tabRow:{ flexDirection:'row', paddingHorizontal:16, paddingVertical:10, gap:8 },
  tab:{ flex:1, paddingVertical:7, borderRadius:8, backgroundColor:C.surface, alignItems:'center', borderWidth:1, borderColor:C.border },
  tabActive:{ backgroundColor:'rgba(0,200,83,0.12)', borderColor:'rgba(0,200,83,0.4)' },
  tabTxt:{ fontSize:11, color:C.muted, fontWeight:'600', letterSpacing:0.5 },
  tabTxtActive:{ color:C.green },
  scroll:{ paddingHorizontal:16, paddingBottom:40 },
  ligaCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.borderG, borderRadius:12, padding:14, marginBottom:16 },
  ligaCardTop:{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  ligaName:{ fontSize:20, color:C.gold, fontWeight:'900', letterSpacing:1 },
  ligaMembers:{ fontSize:11, color:C.muted, marginTop:2 },
  qrBox:{ width:52, height:52, backgroundColor:'#fff', borderRadius:8, alignItems:'center', justifyContent:'center' },
  qrTxt:{ fontSize:11, color:'#000', fontWeight:'700' },
  codeRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  codeLabel:{ fontSize:9, color:C.muted, letterSpacing:1 },
  codeBadge:{ backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:C.borderG, borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  codeTxt:{ fontSize:13, color:C.gold, fontWeight:'700', letterSpacing:1 },
  sectionTitle:{ fontSize:12, color:C.muted, fontWeight:'700', letterSpacing:2, marginBottom:8 },
  memberRow:{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border },
  memberRowMe:{ backgroundColor:'rgba(255,215,0,0.04)', borderRadius:8, paddingHorizontal:6 },
  memberPos:{ width:24, fontSize:16, fontWeight:'900', color:C.muted, textAlign:'center' },
  memberFlag:{ fontSize:18 },
  memberName:{ flex:1, fontSize:13, color:C.text, fontWeight:'600' },
  youBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:20, paddingHorizontal:6, paddingVertical:2 },
  youTxt:{ fontSize:9, color:C.gold, fontWeight:'700' },
  memberPts:{ fontSize:16, color:C.green, fontWeight:'900' },
  inviteBox:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:14, marginTop:16, alignItems:'center' },
  inviteTitle:{ fontSize:14, color:C.text, fontWeight:'700', marginBottom:4 },
  inviteSub:{ fontSize:12, color:C.muted, marginBottom:12 },shareBtn:{ backgroundColor:'rgba(0,200,83,0.12)', borderWidth:1, borderColor:'rgba(0,200,83,0.3)', borderRadius:10, paddingVertical:10, paddingHorizontal:24 },
  shareBtnTxt:{ fontSize:13, color:C.green, fontWeight:'700', letterSpacing:1 },
  formTitle:{ fontSize:20, color:C.gold, fontWeight:'900', letterSpacing:1, marginBottom:4 },
  formSub:{ fontSize:12, color:C.muted, marginBottom:20 },
  inputLabel:{ fontSize:10, color:C.muted, fontWeight:'700', letterSpacing:1, marginBottom:6 },
  input:{ backgroundColor:C.surface2, borderWidth:1, borderColor:C.border, borderRadius:10, paddingHorizontal:14, paddingVertical:12, fontSize:15, color:C.text, marginBottom:12 } as any,
  actionBtn:{ backgroundColor:C.green, borderRadius:10, paddingVertical:13, alignItems:'center' },
  actionBtnDisabled:{ opacity:0.4 },
  actionBtnTxt:{ fontSize:15, color:'#000', fontWeight:'900', letterSpacing:1 },
  divider:{ flexDirection:'row', alignItems:'center', gap:10, marginVertical:16 },
  divLine:{ flex:1, height:1, backgroundColor:C.border },
  divTxt:{ fontSize:11, color:C.muted },
  qrScanBtn:{ borderWidth:1, borderColor:C.border, borderRadius:10, paddingVertical:12, alignItems:'center', marginBottom:12 },
  qrScanTxt:{ fontSize:14, color:C.muted, fontWeight:'700', letterSpacing:1 },
  infoBox:{ backgroundColor:'rgba(255,215,0,0.04)', borderWidth:1, borderColor:C.borderG, borderRadius:8, padding:10 },
  infoTxt:{ fontSize:11, color:C.muted, lineHeight:16 },
  planFeatures:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, marginBottom:14 },
  planFeatTitle:{ fontSize:12, color:C.gold, fontWeight:'700', marginBottom:8 },
  featRow:{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 },
  featDot:{ fontSize:12, color:C.green, fontWeight:'700' },
  featTxt:{ fontSize:12, color:C.muted2 },
  successBox:{ alignItems:'center', paddingTop:32 },
  successIcon:{ fontSize:52, marginBottom:12 },
  successTitle:{ fontSize:24, color:C.gold, fontWeight:'900', letterSpacing:2, marginBottom:8 },
  successSub:{ fontSize:13, color:C.muted, textAlign:'center', marginBottom:16, lineHeight:20 },
  successBtn:{ backgroundColor:C.green, borderRadius:10, paddingVertical:12, paddingHorizontal:32 },
  successBtnTxt:{ fontSize:15, color:'#000', fontWeight:'900', letterSpacing:1 },
});