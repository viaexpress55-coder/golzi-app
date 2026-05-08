import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
};

const GROUPS = [
  { name:'A', teams:[
    { flag:'🇲🇽', name:'México',        pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇿🇦', name:'Sudáfrica',     pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇰🇷', name:'Corea del Sur', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇿', name:'Chequia',       pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'B', teams:[
    { flag:'🇨🇦', name:'Canadá',         pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇧🇦', name:'Bosnia y Herz.', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇶🇦', name:'Qatar',          pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇭', name:'Suiza',          pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'C', teams:[
    { flag:'🇧🇷', name:'Brasil',    pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇲🇦', name:'Marruecos', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇭🇹', name:'Haití',     pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', name:'Escocia',   pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'D', teams:[
    { flag:'🇺🇸', name:'USA',       pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇵🇾', name:'Paraguay',  pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇦🇺', name:'Australia', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇹🇷', name:'Türkiye',   pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'E', teams:[
    { flag:'🇩🇪', name:'Alemania',        pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇼', name:'Curaçao',         pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇮', name:'Costa de Marfil', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇪🇨', name:'Ecuador',         pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'F', teams:[
    { flag:'🇳🇱', name:'Países Bajos', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇯🇵', name:'Japón',        pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇹🇳', name:'Túnez',        pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇸🇪', name:'Suecia',       pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'G', teams:[
    { flag:'🇧🇪', name:'Bélgica',       pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇪🇬', name:'Egipto',        pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇮🇷', name:'Irán',          pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇳🇿', name:'Nueva Zelanda', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'H', teams:[
    { flag:'🇪🇸', name:'España',         pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇻', name:'Cabo Verde',     pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇸🇦', name:'Arabia Saudita', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇺🇾', name:'Uruguay',        pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'I', teams:[
    { flag:'🇫🇷', name:'Francia', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇸🇳', name:'Senegal', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇳🇴', name:'Noruega', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇮🇶', name:'Iraq',    pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'J', teams:[
    { flag:'🇦🇷', name:'Argentina', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇩🇿', name:'Argelia',   pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇦🇹', name:'Austria',   pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇯🇴', name:'Jordania',  pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'K', teams:[
    { flag:'🇵🇹', name:'Portugal',   pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇩', name:'Congo DR',   pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇺🇿', name:'Uzbekistán', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇴', name:'Colombia',   pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'L', teams:[
    { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Inglaterra', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇭🇷', name:'Croacia',    pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇬🇭', name:'Ghana',      pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇵🇦', name:'Panamá',     pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
];

export default function MundialScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [selGroup, setSelGroup] = useState<string|null>(null);

  const TABS = ['GRUPOS', 'FIXTURE', t('mundial_teams')];

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
            <Text style={{ fontSize:20 }}>🌍</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>{t('mundial_title')}</Text>
            <Text style={s.headerSub}>FIFA WORLD CUP 2026</Text>
          </View>
        </View>
        <View style={s.teamCountBadge}>
          <Text style={s.teamCountNum}>48</Text>
          <Text style={s.teamCountLbl}>{t('mundial_teams')}</Text>
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

        {/* GRUPOS */}
        {tab === 0 && GROUPS.map(g => (
          <View key={g.name} style={s.groupCard}>

            <LinearGradient
              colors={['rgba(255,215,0,0.06)','transparent']}
              start={{x:0.5,y:0}} end={{x:0.5,y:1}}
              style={s.groupGlow}
            />

            <TouchableOpacity
              style={s.groupHeader}
              onPress={() => setSelGroup(selGroup === g.name ? null : g.name)}
            >
              <View style={s.groupHeaderLeft}>
                <LinearGradient
                  colors={[C.gold, C.gold2]}
                  style={s.groupLetterBox}
                >
                  <Text style={s.groupLetter}>{g.name}</Text>
                </LinearGradient>
                <Text style={s.groupName}>GRUPO {g.name}</Text>
              </View>
              <Text style={s.groupArrow}>
                {selGroup === g.name ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {/* Preview teams */}
            <View style={s.groupPreview}>
              {g.teams.map((team,i) => (
                <View key={i} style={s.previewTeam}>
                  <Text style={s.previewFlag}>{team.flag}</Text>
                  <Text style={s.previewName}>{team.name}</Text>
                </View>
              ))}
            </View>

            {/* Expanded table */}
            {selGroup === g.name && (
              <View style={s.table}>
                <View style={s.tableHeader}>
                  <Text style={[s.th, { flex:2, textAlign:'left' }]}>EQUIPO</Text>
                  <Text style={s.th}>PJ</Text>
                  <Text style={s.th}>G</Text>
                  <Text style={s.th}>E</Text>
                  <Text style={s.th}>P</Text>
                  <Text style={s.th}>GD</Text>
                  <Text style={[s.th, { color:C.gold }]}>PTS</Text>
                </View>
                {g.teams.map((team,i) => (
                  <View
                    key={i}
                    style={[
                      s.tableRow,
                      i < 2 && s.tableRowQ,
                      i === g.teams.length-1 && { borderBottomWidth:0 }
                    ]}
                  >
                    <View style={[s.tdTeam, { flex:2 }]}>
                      <Text style={s.tdFlag}>{team.flag}</Text>
                      <Text style={s.tdName}>{team.name}</Text>
                    </View>
                    <Text style={s.td}>{team.pj}</Text>
                    <Text style={s.td}>{team.g}</Text>
                    <Text style={s.td}>{team.e}</Text>
                    <Text style={s.td}>{team.p}</Text>
                    <Text style={s.td}>{team.gf-team.gc > 0 ? '+' : ''}{team.gf-team.gc}</Text>
                    <Text style={[s.td, { color:C.gold, fontFamily:'BebasNeue_400Regular', fontSize:14 }]}>
                      {team.pts}
                    </Text>
                  </View>
                ))}
                <View style={s.classifyLegend}>
                  <View style={s.classifyDot} />
                  <Text style={s.classifyTxt}>Clasifica a octavos de final</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* FIXTURE */}
        {tab === 1 && (
          <LinearGradient
            colors={['rgba(255,215,0,0.06)','rgba(255,215,0,0.02)']}
            style={s.comingSoon}
          >
            <Text style={s.comingSoonIcon}>📅</Text>
            <Text style={s.comingSoonTxt}>FIXTURE COMPLETO</Text>
            <Text style={s.comingSoonSub}>104 partidos · 16 ciudades sede</Text>
            <Text style={s.comingSoonSub2}>Disponible al inicio del torneo · 11 jun 2026</Text>
          </LinearGradient>
        )}

        {/* EQUIPOS */}
        {tab === 2 && (
          <View style={s.teamsGrid}>
            {GROUPS.flatMap(g => g.teams).map((team,i) => (
              <LinearGradient
                key={i}
                colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']}
                style={s.teamCard}
              >
                <Text style={s.teamCardFlag}>{team.flag}</Text>
                <Text style={s.teamCardName}>{team.name}</Text>
              </LinearGradient>
            ))}
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
  teamCountBadge:{ alignItems:'center' },
  teamCountNum:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold },
  teamCountLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },

  // Tabs
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginVertical:10 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },

  scroll:{ paddingHorizontal:12, paddingBottom:40 },

  // Group card
  groupCard:{ backgroundColor:C.surface2, borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', borderTopWidth:2, borderTopColor:C.gold, marginBottom:10, overflow:'hidden' },
  groupGlow:{ position:'absolute', top:0, left:0, right:0, height:60 },
  groupHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14 },
  groupHeaderLeft:{ flexDirection:'row', alignItems:'center', gap:10 },
  groupLetterBox:{ width:32, height:32, borderRadius:8, alignItems:'center', justifyContent:'center' },
  groupLetter:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:'#000' },
  groupName:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.gold, letterSpacing:2 },
  groupArrow:{ fontSize:10, color:C.muted },

  // Preview
  groupPreview:{ flexDirection:'row', paddingHorizontal:14, paddingBottom:12, gap:12, flexWrap:'wrap' },
  previewTeam:{ flexDirection:'row', alignItems:'center', gap:5 },
  previewFlag:{ fontSize:16 },
  previewName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2 },

  // Table
  table:{ borderTopWidth:1, borderTopColor:'rgba(255,215,0,0.1)', padding:12 },
  tableHeader:{ flexDirection:'row', paddingBottom:8, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  th:{ flex:1, fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, textAlign:'center', letterSpacing:0.5 },
  tableRow:{ flexDirection:'row', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.04)', alignItems:'center' },
  tableRowQ:{ borderLeftWidth:2, borderLeftColor:C.green, paddingLeft:4 },
  tdTeam:{ flexDirection:'row', alignItems:'center', gap:6 },
  tdFlag:{ fontSize:16 },
  tdName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.text },
  td:{ flex:1, fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted2, textAlign:'center' },
  classifyLegend:{ flexDirection:'row', alignItems:'center', gap:6, marginTop:10 },
  classifyDot:{ width:8, height:8, borderRadius:2, backgroundColor:C.green },
  classifyTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },

  // Coming soon
  comingSoon:{ borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:40, alignItems:'center', marginTop:8 },
  comingSoonIcon:{ fontSize:48, marginBottom:16 },
  comingSoonTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:3, marginBottom:8 },
  comingSoonSub:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted2, letterSpacing:1 },
  comingSoonSub2:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, marginTop:6 },

  // Teams grid
  teamsGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  teamCard:{ borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.12)', padding:12, alignItems:'center', width:'31%' },
  teamCardFlag:{ fontSize:26, marginBottom:6 },
  teamCardName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:9, color:C.text, textAlign:'center' },
});