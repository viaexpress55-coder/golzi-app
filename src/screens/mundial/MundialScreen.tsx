import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { useTranslation } from 'react-i18next';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
};

const GROUPS = [
  { name:'A', teams:[
    { flag:'🇲🇽', name:'México',        pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇿🇦', name:'Sudáfrica',     pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇰🇷', name:'Corea del Sur', pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇿', name:'Chequia',       pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
  ]},
  { name:'B', teams:[
    { flag:'🇨🇦', name:'Canadá',          pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇧🇦', name:'Bosnia y Herz.',  pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇶🇦', name:'Qatar',           pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
    { flag:'🇨🇭', name:'Suiza',           pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0 },
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
    Barlow_400Regular,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      <View style={s.bgGlow} />

      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>🌍</Text>
          <Text style={s.headerTitle}>{t('mundial_title')}</Text>
        </View>
        <Text style={s.headerSub}>48 {t('mundial_teams')}</Text>
      </View>

      <View style={s.tabRow}>
        {TABS.map((tabName,i) => (
          <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tabName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {tab === 0 && GROUPS.map(g => (
          <View key={g.name} style={s.groupCard}>
            <TouchableOpacity
              style={s.groupHeader}
              onPress={() => setSelGroup(selGroup === g.name ? null : g.name)}
            >
              <Text style={s.groupName}>GRUPO {g.name}</Text>
              <Text style={s.groupArrow}>{selGroup === g.name ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            <View style={s.groupPreview}>
              {g.teams.map((team,i) => (
                <View key={i} style={s.previewTeam}>
                  <Text style={s.previewFlag}>{team.flag}</Text>
                  <Text style={s.previewName}>{team.name}</Text>
                </View>
              ))}
            </View>

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
                  <View key={i} style={[s.tableRow, i<2 && s.tableRowQ, i===g.teams.length-1 && {borderBottomWidth:0}]}>
                    <View style={[s.tdTeam, { flex:2 }]}>
                      <Text style={s.tdFlag}>{team.flag}</Text>
                      <Text style={s.tdName}>{team.name}</Text>
                    </View>
                    <Text style={s.td}>{team.pj}</Text>
                    <Text style={s.td}>{team.g}</Text>
                    <Text style={s.td}>{team.e}</Text>
                    <Text style={s.td}>{team.p}</Text>
                    <Text style={s.td}>{team.gf-team.gc>0?'+':''}{team.gf-team.gc}</Text>
                    <Text style={[s.td, { color:C.gold, fontFamily:'BebasNeue_400Regular' }]}>{team.pts}</Text>
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

        {tab === 1 && (
          <View style={s.comingSoon}>
            <Text style={s.comingSoonIcon}>📅</Text>
            <Text style={s.comingSoonTxt}>FIXTURE COMPLETO</Text>
            <Text style={s.comingSoonSub}>104 partidos · 16 ciudades sede</Text>
            <Text style={s.comingSoonSub2}>Disponible al inicio del torneo</Text>
          </View>
        )}

        {tab === 2 && (
          <View style={s.teamsGrid}>
            {GROUPS.flatMap(g => g.teams).map((team,i) => (
              <View key={i} style={s.teamCard}>
                <Text style={s.teamCardFlag}>{team.flag}</Text>
                <Text style={s.teamCardName}>{team.name}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  bgGlow:{ position:'absolute', width:350, height:350, borderRadius:175, top:-80, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.08)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:13, paddingTop:48, paddingBottom:10 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  headerIcon:{ fontSize:17 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:17, color:C.gold, letterSpacing:2 },
  headerSub:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:2 },
  tabRow:{ flexDirection:'row', paddingHorizontal:13, gap:6, marginBottom:10 },
  tab:{ flex:1, paddingVertical:6, borderRadius:7, backgroundColor:C.surface, alignItems:'center', borderWidth:1, borderColor:C.border2 },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:C.border },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  scroll:{ paddingHorizontal:13, paddingBottom:40 },
  groupCard:{ backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:11, marginBottom:8, overflow:'hidden' },
  groupHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:11 },
  groupName:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold, letterSpacing:2 },
  groupArrow:{ fontSize:10, color:C.muted },
  groupPreview:{ flexDirection:'row', paddingHorizontal:11, paddingBottom:10, gap:12, flexWrap:'wrap' },
  previewTeam:{ flexDirection:'row', alignItems:'center', gap:4 },
  previewFlag:{ fontSize:14 },
  previewName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2 },
  table:{ borderTopWidth:1, borderTopColor:C.border2, padding:10 },
  tableHeader:{ flexDirection:'row', paddingBottom:6, borderBottomWidth:1, borderBottomColor:C.border2 },
  th:{ flex:1, fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, textAlign:'center', letterSpacing:0.5 },
  tableRow:{ flexDirection:'row', paddingVertical:7, borderBottomWidth:1, borderBottomColor:C.border2, alignItems:'center' },
  tableRowQ:{ borderLeftWidth:2, borderLeftColor:C.green, paddingLeft:4 },
  tdTeam:{ flexDirection:'row', alignItems:'center', gap:5 },
  tdFlag:{ fontSize:14 },
  tdName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.text },
  td:{ flex:1, fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted2, textAlign:'center' },
  classifyLegend:{ flexDirection:'row', alignItems:'center', gap:4, marginTop:8 },
  classifyDot:{ width:8, height:8, borderRadius:2, backgroundColor:C.green },
  classifyTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },
  comingSoon:{ alignItems:'center', paddingTop:48, paddingBottom:32 },
  comingSoonIcon:{ fontSize:48, marginBottom:12 },
  comingSoonTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:3, marginBottom:6 },
  comingSoonSub:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted2, letterSpacing:1 },
  comingSoonSub2:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, marginTop:4 },
  teamsGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  teamCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:10, padding:10, alignItems:'center', width:'30%' },
  teamCardFlag:{ fontSize:24, marginBottom:4 },
  teamCardName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.text, textAlign:'center' },
});