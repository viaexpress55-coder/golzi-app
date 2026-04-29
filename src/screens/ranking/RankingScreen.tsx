import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', green:'#00C853', red:'#E8003D',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const TABS = ['GLOBAL', 'MI LIGA', 'PAIS'];

const PLAYERS = [
  { pos:1,  name:'CarlosGol',    country:'🇨🇴', pts:847, exact:12, badge:'PRO',    trend:'up'   },
  { pos:2,  name:'FutbolRey',    country:'🇲🇽', pts:821, exact:11, badge:'LIGA',   trend:'up'   },
  { pos:3,  name:'GolazoAR',     country:'🇦🇷', pts:798, exact:10, badge:'PLAYER', trend:'same' },
  { pos:4,  name:'VinotintaFC',  country:'🇻🇪', pts:754, exact:9,  badge:'PLAYER', trend:'down' },
  { pos:5,  name:'SambaBR',      country:'🇧🇷', pts:731, exact:9,  badge:'PRO',    trend:'up'   },
  { pos:6,  name:'LaPulga10',    country:'🇦🇷', pts:698, exact:8,  badge:'PLAYER', trend:'same' },
  { pos:7,  name:'TigreCol',     country:'🇨🇴', pts:672, exact:8,  badge:'LIGA',   trend:'up'   },
  { pos:8,  name:'AztecaMX',     country:'🇲🇽', pts:651, exact:7,  badge:'PLAYER', trend:'down' },
  { pos:9,  name:'CanarioUS',    country:'🇺🇸', pts:634, exact:7,  badge:'PLAYER', trend:'same' },
  { pos:10, name:'TuYo',         country:'🇨🇴', pts:612, exact:6,  badge:'FREE',   trend:'up'   },
  { pos:11, name:'GolzairPE',    country:'🇵🇪', pts:589, exact:6,  badge:'PLAYER', trend:'same' },
  { pos:12, name:'viaexpress',   country:'🇨🇴', pts:421, exact:4,  badge:'PLAYER', trend:'up', isMe:true },
];

const ME = PLAYERS.find(p => p.isMe)!;

function PosNum({ pos }: { pos: number }) {
  const color = pos === 1 ? C.gold : pos === 2 ? '#CCC' : pos === 3 ? '#CD7F32' : C.muted;
  return <Text style={[s.posNum, { color }]}>{pos}</Text>;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up')   return <Text style={{ color: C.green,  fontSize: 10 }}>▲</Text>;
  if (trend === 'down') return <Text style={{ color: C.red,    fontSize: 10 }}>▼</Text>;
  return <Text style={{ color: C.muted, fontSize: 10 }}>—</Text>;
}

function BadgeChip({ badge }: { badge: string }) {
  const color = badge === 'PRO' ? C.green : badge === 'LIGA' ? '#00C6FF' : badge === 'PLAYER' ? C.gold : C.muted;
  return (
    <View style={[s.badge, { borderColor: color + '44', backgroundColor: color + '18' }]}>
      <Text style={[s.badgeTxt, { color }]}>{badge}</Text>
    </View>
  );
}

export default function RankingScreen() {
  const [tab, setTab] = useState(0);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>GOLZI</Text>
        <Text style={s.headerTitle}>RANKING</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Mi posición */}
      <View style={s.myPosCard}>
        <View style={s.myPosLeft}>
          <Text style={s.myPosLabel}>TU POSICION</Text>
          <Text style={s.myPosNum}>#{ME.pos}</Text>
        </View>
        <View style={s.myPosMid}>
          <Text style={s.myPosName}>{ME.country} {ME.name}</Text>
          <Text style={s.myPosStats}>{ME.exact} predicciones exactas</Text>
        </View>
        <View style={s.myPosRight}>
          <Text style={s.myPosPts}>{ME.pts}</Text>
          <Text style={s.myPosPtsLabel}>pts</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabActive]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Top 3 podio */}
        <View style={s.podium}>
          {PLAYERS.slice(0, 3).map((p, i) => (
            <View key={i} style={[s.podiumItem, i === 0 && s.podiumFirst]}>
              <Text style={s.podiumFlag}>{p.country}</Text>
              <Text style={s.podiumName}>{p.name}</Text>
              <View style={[s.podiumBar, { height: i === 0 ? 56 : i === 1 ? 44 : 36, backgroundColor: i === 0 ? C.gold + '33' : C.muted + '22' }]}>
                <Text style={[s.podiumPos, { color: i === 0 ? C.gold : i === 1 ? '#CCC' : '#CD7F32' }]}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </Text>
              </View>
              <Text style={s.podiumPts}>{p.pts} pts</Text>
            </View>
          ))}
        </View>

        {/* Resto del ranking */}
        {PLAYERS.slice(3).map((p) => (
          <View key={p.pos} style={[s.row, p.isMe && s.rowMe]}>
            <PosNum pos={p.pos} />
            <Text style={s.rowFlag}>{p.country}</Text>
            <View style={s.rowMid}>
              <View style={s.rowNameRow}>
                <Text style={[s.rowName, p.isMe && { color: C.gold }]}>{p.name}</Text>
                <BadgeChip badge={p.badge} />
              </View>
              <Text style={s.rowExact}>{p.exact} exactas</Text>
            </View>
            <TrendIcon trend={p.trend} />
            <Text style={[s.rowPts, p.isMe && { color: C.gold }]}>{p.pts}</Text>
          </View>
        ))}

        <Text style={s.footer}>Actualizado en tiempo real · {PLAYERS.length} participantes</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.dark },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:48, paddingBottom:12, borderBottomWidth:1, borderBottomColor:C.border },
  logo:{ fontSize:18, color:C.gold, fontWeight:'900', letterSpacing:3, width:60 },
  headerTitle:{ fontSize:16, color:C.text, fontWeight:'700', letterSpacing:2 },
  myPosCard:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,215,0,0.06)', borderBottomWidth:1, borderBottomColor:C.borderG, paddingHorizontal:16, paddingVertical:12 },
  myPosLeft:{ alignItems:'center', width:56 },
  myPosLabel:{ fontSize:8, color:C.muted, letterSpacing:1 },
  myPosNum:{ fontSize:24, color:C.gold, fontWeight:'900' },
  myPosMid:{ flex:1, paddingHorizontal:12 },
  myPosName:{ fontSize:14, color:C.text, fontWeight:'600' },
  myPosStats:{ fontSize:11, color:C.muted, marginTop:2 },
  myPosRight:{ alignItems:'flex-end' },
  myPosPts:{ fontSize:24, color:C.green, fontWeight:'900' },
  myPosPtsLabel:{ fontSize:10, color:C.muted },
  tabRow:{ flexDirection:'row', paddingHorizontal:16, paddingVertical:10, gap:8 },
  tab:{ flex:1, paddingVertical:7, borderRadius:8, backgroundColor:C.surface, alignItems:'center', borderWidth:1, borderColor:C.border },
  tabActive:{ backgroundColor:'rgba(0,200,83,0.12)', borderColor:'rgba(0,200,83,0.4)' },
  tabTxt:{ fontSize:11, color:C.muted, fontWeight:'600', letterSpacing:0.5 },
  tabTxtActive:{ color:C.green },
  scroll:{ paddingHorizontal:16, paddingBottom:40 },
  podium:{ flexDirection:'row', alignItems:'flex-end', justifyContent:'center', gap:8, marginBottom:16, paddingTop:8 },
  podiumItem:{ flex:1, alignItems:'center' },
  podiumFirst:{ transform:[{ scale: 1.05 }] },
  podiumFlag:{ fontSize:20, marginBottom:2 },
  podiumName:{ fontSize:10, color:C.muted, marginBottom:4, textAlign:'center' },
  podiumBar:{ width:'100%', borderRadius:6, alignItems:'center', justifyContent:'center' },
  podiumPos:{ fontSize:20 },
  podiumPts:{ fontSize:11, color:C.muted, marginTop:4 },
  row:{ flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border, gap:8 },
  rowMe:{ backgroundColor:'rgba(255,215,0,0.04)', borderRadius:8, paddingHorizontal:6, borderBottomWidth:0, marginBottom:1 },
  posNum:{ width:28, fontSize:16, fontWeight:'900', textAlign:'center' },
  rowFlag:{ fontSize:18 },
  rowMid:{ flex:1 },
  rowNameRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  rowName:{ fontSize:13, color:C.text, fontWeight:'600' },
  rowExact:{ fontSize:10, color:C.muted, marginTop:1 },
  badge:{ borderWidth:1, borderRadius:20, paddingHorizontal:6, paddingVertical:1 },
  badgeTxt:{ fontSize:8, fontWeight:'700', letterSpacing:0.5 },
  rowPts:{ fontSize:16, color:C.green, fontWeight:'900', width:40, textAlign:'right' },
  footer:{ fontSize:10, color:C.muted, textAlign:'center', marginTop:16, letterSpacing:0.3 },
});