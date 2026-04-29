import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', green:'#00C853', red:'#E8003D',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const TABS = ['GRUPOS', 'FIXTURE', 'EQUIPOS'];

const GROUPS = [
  {
    name:'GRUPO A',
    teams:[
      { flag:'🇲🇽', name:'México',  pj:1, g:1, e:0, p:0, gf:3, gc:1, pts:3 },
      { flag:'🇨🇦', name:'Canadá',  pj:1, g:0, e:0, p:1, gf:1, gc:3, pts:0 },
      { flag:'🇺🇸', name:'USA',     pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇵🇦', name:'Panamá',  pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
    ],
  },
  {
    name:'GRUPO B',
    teams:[
      { flag:'🇦🇷', name:'Argentina', pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇵🇱', name:'Polonia',   pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇸🇦', name:'Arabia S.', pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇦🇺', name:'Australia', pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
    ],
  },
  {
    name:'GRUPO C',
    teams:[
      { flag:'🇪🇸', name:'España',    pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇲🇦', name:'Marruecos', pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇩🇪', name:'Alemania',  pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇯🇵', name:'Japón',     pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
    ],
  },
  {
    name:'GRUPO D',
    teams:[
      { flag:'🇧🇷', name:'Brasil',   pj:1, g:1, e:0, p:0, gf:2, gc:1, pts:3 },
      { flag:'🇨🇴', name:'Colombia', pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇵🇹', name:'Portugal', pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
      { flag:'🇳🇬', name:'Nigeria',  pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0 },
    ],
  },
];

const FIXTURES = [
  { date:'11 Jun', home:'🇲🇽', hName:'México',   away:'🇨🇦', aName:'Canadá',   score:'3-1',  status:'done',  stadium:'SoFi Stadium'    },
  { date:'12 Jun', home:'🇺🇸', hName:'USA',      away:'🇵🇦', aName:'Panamá',   score:null,   status:'sched', stadium:'MetLife Stadium'  },
  { date:'13 Jun', home:'🇦🇷', hName:'Argentina',away:'🇵🇱', aName:'Polonia',  score:null,   status:'sched', stadium:'AT&T Stadium'     },
  { date:'13 Jun', home:'🇪🇸', hName:'España',   away:'🇲🇦', aName:'Marruecos',score:null,   status:'sched', stadium:'Rose Bowl'        },
  { date:'14 Jun', home:'🇧🇷', hName:'Brasil',   away:'🇨🇴', aName:'Colombia', score:null,   status:'sched', stadium:'Levi\'s Stadium'  },
  { date:'14 Jun', home:'🇩🇪', hName:'Alemania', away:'🇯🇵', aName:'Japón',    score:null,   status:'sched', stadium:'SoFi Stadium'    },
  { date:'15 Jun', home:'🇲🇽', hName:'México',   away:'🇺🇸', aName:'USA',      score:null,   status:'live',  stadium:'AT&T Stadium'    },
];

export default function MundialScreen() {
  const [tab, setTab] = useState(0);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo}>GOLZI</Text>
        <Text style={s.headerTitle}>MUNDIAL 2026</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabActive]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* GRUPOS */}
        {tab === 0 && GROUPS.map((g, gi) => (
          <View key={gi} style={s.groupCard}>
            <Text style={s.groupName}>{g.name}</Text>
            <View style={s.tableHeader}>
              <Text style={[s.th, { flex:2, textAlign:'left' }]}>EQUIPO</Text>
              <Text style={s.th}>PJ</Text>
              <Text style={s.th}>G</Text>
              <Text style={s.th}>E</Text>
              <Text style={s.th}>P</Text>
              <Text style={s.th}>GD</Text>
              <Text style={[s.th, { color: C.gold }]}>PTS</Text>
            </View>
            {g.teams.map((t, ti) => (
              <View key={ti} style={[s.tableRow, ti < 2 && s.tableRowQ, ti === g.teams.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[s.tdTeam, { flex:2 }]}>
                  <Text style={s.tdFlag}>{t.flag}</Text>
                  <Text style={s.tdName}>{t.name}</Text>
                </View>
                <Text style={s.td}>{t.pj}</Text>
                <Text style={s.td}>{t.g}</Text>
                <Text style={s.td}>{t.e}</Text>
                <Text style={s.td}>{t.p}</Text>
                <Text style={s.td}>{t.gf - t.gc > 0 ? '+' : ''}{t.gf - t.gc}</Text>
                <Text style={[s.td, { color: C.gold, fontWeight:'700' }]}>{t.pts}</Text>
              </View>
            ))}
            <View style={s.classifyLegend}>
              <View style={s.classifyDot} />
              <Text style={s.classifyTxt}>Clasifica a octavos</Text>
            </View>
          </View>
        ))}

        {/* FIXTURE */}
        {tab === 1 && FIXTURES.map((f, i) => (
          <View key={i} style={s.fixtureCard}>
            <View style={s.fixtureTop}>
              <Text style={s.fixtureDate}>{f.date}</Text>
              <View style={[
                s.statusBadge,
                f.status === 'live'  && s.statusLive,
                f.status === 'done'  && s.statusDone,
              ]}>
                <Text style={[
                  s.statusTxt,
                  f.status === 'live' && { color: C.red },
                  f.status === 'done' && { color: C.muted },
                ]}>
                  {f.status === 'live' ? '● EN VIVO' : f.status === 'done' ? 'FINALIZADO' : 'PROGRAMADO'}
                </Text>
              </View>
            </View>
            <View style={s.fixtureTeams}>
              <View style={s.fixtureTeam}>
                <Text style={s.fixtureFlag}>{f.home}</Text>
                <Text style={s.fixtureName}>{f.hName}</Text>
              </View>
              <View style={s.fixtureScore}>
                {f.score
                  ? <Text style={s.fixtureScoreTxt}>{f.score}</Text>
                  : <Text style={s.fixtureVs}>vs</Text>
                }
              </View>
              <View style={s.fixtureTeam}>
                <Text style={s.fixtureFlag}>{f.away}</Text>
                <Text style={s.fixtureName}>{f.aName}</Text>
              </View>
            </View>
            <Text style={s.fixtureStadium}>{f.stadium}</Text>
          </View>
        ))}

        {/* EQUIPOS */}
        {tab === 2 && (
          <View style={s.teamsGrid}>
            {GROUPS.flatMap(g => g.teams).map((t, i) => (
              <View key={i} style={s.teamCard}>
                <Text style={s.teamCardFlag}>{t.flag}</Text>
                <Text style={s.teamCardName}>{t.name}</Text>
                <Text style={s.teamCardPts}>{t.pts} pts</Text>
              </View>
            ))}
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
  groupCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:12, marginBottom:12 },
  groupName:{ fontSize:14, color:C.gold, fontWeight:'900', letterSpacing:2, marginBottom:8 },
  tableHeader:{ flexDirection:'row', paddingBottom:6, borderBottomWidth:1, borderBottomColor:C.border },
  th:{ flex:1, fontSize:9, color:C.muted, textAlign:'center', fontWeight:'700', letterSpacing:0.5 },
  tableRow:{ flexDirection:'row', paddingVertical:7, borderBottomWidth:1, borderBottomColor:C.border, alignItems:'center' },
  tableRowQ:{ borderLeftWidth:2, borderLeftColor:C.green, paddingLeft:4 },
  tdTeam:{ flexDirection:'row', alignItems:'center', gap:6 },
  tdFlag:{ fontSize:16 },
  tdName:{ fontSize:12, color:C.text, fontWeight:'500' },
  td:{ flex:1, fontSize:12, color:C.muted2, textAlign:'center' },
  classifyLegend:{ flexDirection:'row', alignItems:'center', gap:4, marginTop:8 },
  classifyDot:{ width:8, height:8, borderRadius:1, backgroundColor:C.green },
  classifyTxt:{ fontSize:10, color:C.muted },
  fixtureCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:12, marginBottom:8 },
  fixtureTop:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  fixtureDate:{ fontSize:11, color:C.muted, fontWeight:'600' },
  statusBadge:{ borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  statusLive:{ backgroundColor:'rgba(232,0,61,0.1)' },
  statusDone:{ backgroundColor:'rgba(136,136,136,0.1)' },
  statusTxt:{ fontSize:10, color:C.gold, fontWeight:'600', letterSpacing:0.5 },
  fixtureTeams:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  fixtureTeam:{ flex:1, alignItems:'center' },
  fixtureFlag:{ fontSize:28, marginBottom:4 },
  fixtureName:{ fontSize:12, color:C.text, fontWeight:'600', textAlign:'center' },
  fixtureScore:{ paddingHorizontal:12 },
  fixtureScoreTxt:{ fontSize:20, color:C.green, fontWeight:'900', letterSpacing:2 },
  fixtureVs:{ fontSize:16, color:C.muted, fontWeight:'700' },
  fixtureStadium:{ fontSize:10, color:C.muted, textAlign:'center' },
  teamsGrid:{ flexDirection:'row', flexWrap:'wrap', gap:10 },
  teamCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:10, padding:12, alignItems:'center', width:'30%' },
  teamCardFlag:{ fontSize:28, marginBottom:4 },
  teamCardName:{ fontSize:11, color:C.text, fontWeight:'600', textAlign:'center' },
  teamCardPts:{ fontSize:10, color:C.muted, marginTop:2 },
});