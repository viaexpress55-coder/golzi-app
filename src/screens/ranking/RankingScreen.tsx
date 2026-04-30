import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', green:'#00C853', red:'#E8003D',
  cyan:'#00C6FF', border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const TABS = ['GLOBAL', 'MI LIGA', 'PAIS'];

const FLAGS: Record<string, string> = {
  CO:'🇨🇴', MX:'🇲🇽', BR:'🇧🇷', AR:'🇦🇷',
  US:'🇺🇸', VE:'🇻🇪', PE:'🇵🇪', CL:'🇨🇱',
};

function BadgeChip({ plan }: { plan: string }) {
  const color = plan === 'pro' ? '#00FF87' : plan === 'liga' ? '#00C6FF' : plan === 'player' ? '#FFD700' : '#6B7A99';
  return (
    <View style={[s.badge, { borderColor: color + '44', backgroundColor: color + '18' }]}>
      <Text style={[s.badgeTxt, { color }]}>{plan.toUpperCase()}</Text>
    </View>
  );
}

export default function RankingScreen() {
  const [tab,     setTab]     = useState(0);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRanking() {
      try {
        const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map((d, i) => ({ id: d.id, pos: i + 1, ...d.data() }));
        setPlayers(data);
      } catch (e) {
        console.error('Error loading ranking:', e);
      } finally {
        setLoading(false);
      }
    }
    loadRanking();
  }, []);

  if (loading) {
    return (
      <View style={[s.root, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator color={C.gold} size="large" />
        <Text style={{ color:C.muted, marginTop:12, fontSize:13 }}>Cargando ranking...</Text>
      </View>
    );
  }

  const top3 = players.slice(0, 3);
  const rest  = players.slice(3);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo}>GOLZI</Text>
        <Text style={s.headerTitle}>RANKING</Text>
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

        {players.length === 0 && (
          <View style={{ padding:32, alignItems:'center' }}>
            <Text style={{ color:C.muted, fontSize:14 }}>No hay jugadores aun</Text>
          </View>
        )}

        {/* Podio top 3 */}
        {top3.length > 0 && (
          <View style={s.podium}>
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((p, i) => {
              const isFirst = p.pos === 1;
              const medal = p.pos === 1 ? '🥇' : p.pos === 2 ? '🥈' : '🥉';
              return (
                <View key={p.id} style={[s.podiumItem, isFirst && s.podiumFirst]}>
                  <Text style={s.podiumFlag}>{FLAGS[p.country] || '🌍'}</Text>
                  <Text style={s.podiumName}>{p.username}</Text>
                  <View style={[s.podiumBar, { height: isFirst ? 56 : p.pos === 2 ? 44 : 36, backgroundColor: isFirst ? C.gold + '33' : C.muted + '22' }]}>
                    <Text style={[s.podiumPos]}>{medal}</Text>
                  </View>
                  <Text style={s.podiumPts}>{p.totalPoints} pts</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Resto */}
        {rest.map(p => (
          <View key={p.id} style={s.row}>
            <Text style={[s.posNum, { color: C.muted }]}>{p.pos}</Text>
            <Text style={s.rowFlag}>{FLAGS[p.country] || '🌍'}</Text>
            <View style={s.rowMid}>
              <View style={s.rowNameRow}>
                <Text style={s.rowName}>{p.username}</Text>
                <BadgeChip plan={p.plan || 'free'} />
              </View>
              <Text style={s.rowExact}>{p.reputationPoints || 0} rep pts</Text>
            </View>
            <Text style={s.rowPts}>{p.totalPoints}</Text>
          </View>
        ))}

        <Text style={s.footer}>
          Actualizado en tiempo real · {players.length} participantes
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.dark },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:48, paddingBottom:12, borderBottomWidth:1, borderBottomColor:C.border },
  logo:{ fontSize:18, color:C.gold, fontWeight:'900', letterSpacing:3, width:60 },
  headerTitle:{ fontSize:16, color:C.text, fontWeight:'700', letterSpacing:2 },
  tabRow:{ flexDirection:'row', paddingHorizontal:16, paddingVertical:10, gap:8 },
  tab:{ flex:1, paddingVertical:7, borderRadius:8, backgroundColor:C.surface, alignItems:'center', borderWidth:1, borderColor:C.border },
  tabActive:{ backgroundColor:'rgba(0,200,83,0.12)', borderColor:'rgba(0,200,83,0.4)' },
  tabTxt:{ fontSize:11, color:C.muted, fontWeight:'600', letterSpacing:0.5 },
  tabTxtActive:{ color:C.green },
  scroll:{ paddingHorizontal:16, paddingBottom:40 },
  podium:{ flexDirection:'row', alignItems:'flex-end', justifyContent:'center', gap:8, marginBottom:16, paddingTop:8 },
  podiumItem:{ flex:1, alignItems:'center' },
  podiumFirst:{ transform:[{ scale:1.05 }] },
  podiumFlag:{ fontSize:20, marginBottom:2 },
  podiumName:{ fontSize:10, color:C.muted, marginBottom:4, textAlign:'center' },
  podiumBar:{ width:'100%', borderRadius:6, alignItems:'center', justifyContent:'center' },
  podiumPos:{ fontSize:20 },
  podiumPts:{ fontSize:11, color:C.muted, marginTop:4 },
  row:{ flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border, gap:8 },
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
