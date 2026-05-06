import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
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

const FLAGS: Record<string,string> = {
  CO:'🇨🇴', MX:'🇲🇽', BR:'🇧🇷', AR:'🇦🇷',
  US:'🇺🇸', VE:'🇻🇪', PE:'🇵🇪', CL:'🇨🇱',
};

export default function RankingScreen() {
  const { t } = useTranslation();
  const [tab,     setTab]     = useState(0);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const TABS = [t('ranking_title'), t('liga_title'), t('profile_country')];

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'));
        const snap = await getDocs(q);
        setPlayers(snap.docs.map((d, i) => ({ id:d.id, pos:i+1, ...d.data() })));
      } catch { } finally { setLoading(false); }
    }
    load();
  }, []);

  if (!fontsLoaded || loading) return (
    <View style={[s.root, { justifyContent:'center', alignItems:'center' }]}>
      <ActivityIndicator color={C.gold} size="large" />
    </View>
  );

  const top3 = players.slice(0,3);
  const rest  = players.slice(3);

  return (
    <View style={s.root}>
      <View style={s.bgGlow} />

      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>🏆</Text>
          <Text style={s.headerTitle}>{t('ranking_title')}</Text>
        </View>
        <Text style={s.headerSub}>{players.length} GOLZAIRES</Text>
      </View>

      <View style={s.tabRow}>
        {TABS.map((tab_name,i) => (
          <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tab_name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {players.length > 0 && (
          <LinearGradient
            colors={['rgba(255,215,0,0.1)','rgba(255,165,0,0.05)']}
            start={{x:0,y:0}} end={{x:1,y:1}}
            style={s.myHero}
          >
            <View style={s.myHeroLeft}>
              <Text style={s.myHeroLabel}>{t('ranking_position')}</Text>
              <Text style={s.myHeroPos}>#—</Text>
            </View>
            <View style={s.myHeroMid}>
              <Text style={s.myHeroName}>Tu cuenta</Text>
              <Text style={s.myHeroSub}>{t('ranking_complete')}</Text>
            </View>
            <View style={s.myHeroRight}>
              <Text style={s.myHeroPts}>0</Text>
              <Text style={s.myHeroPtsLbl}>pts</Text>
            </View>
          </LinearGradient>
        )}

        {top3.length > 0 && (
          <View style={s.podium}>
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((p,i) => {
              const isFirst = p.pos === 1;
              const medal = p.pos===1?'🥇':p.pos===2?'🥈':'🥉';
              const barH   = isFirst ? 60 : p.pos===2 ? 48 : 38;
              return (
                <View key={p.id} style={[s.podiumItem, isFirst && s.podiumFirst]}>
                  <Text style={s.podiumFlag}>{FLAGS[p.country]||'🌍'}</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{p.username}</Text>
                  <View style={[s.podiumBar, { height:barH, backgroundColor: isFirst?'rgba(255,215,0,0.15)':'rgba(255,255,255,0.05)' }]}>
                    <Text style={s.podiumMedal}>{medal}</Text>
                  </View>
                  <Text style={s.podiumPts}>{p.totalPoints} pts</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={s.divider} />

        {rest.map(p => (
          <View key={p.id} style={s.row}>
            <Text style={[s.rowPos, { color:C.muted }]}>{p.pos}</Text>
            <Text style={s.rowFlag}>{FLAGS[p.country]||'🌍'}</Text>
            <View style={s.rowMid}>
              <Text style={s.rowName}>{p.username}</Text>
              <View style={[s.planTag, { borderColor: p.plan==='pro'?C.green:p.plan==='liga'?C.cyan:C.gold+'44' }]}>
                <Text style={[s.planTagTxt, { color: p.plan==='pro'?C.green:p.plan==='liga'?C.cyan:C.gold }]}>
                  {(p.plan||'free').toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={s.rowPts}>{p.totalPoints}</Text>
          </View>
        ))}

        {players.length === 0 && (
          <View style={{ padding:32, alignItems:'center' }}>
            <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:C.muted }}>
              No hay jugadores aun
            </Text>
          </View>
        )}

        <Text style={s.footer}>{t('ranking_updated')} · {players.length} participantes</Text>
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
  myHero:{ borderWidth:1, borderColor:C.border, borderRadius:11, padding:12, flexDirection:'row', alignItems:'center', marginBottom:14 },
  myHeroLeft:{ alignItems:'center', width:52 },
  myHeroLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:1 },
  myHeroPos:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold },
  myHeroMid:{ flex:1, paddingHorizontal:10 },
  myHeroName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.text },
  myHeroSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, marginTop:1 },
  myHeroRight:{ alignItems:'flex-end' },
  myHeroPts:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.green },
  myHeroPtsLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },
  podium:{ flexDirection:'row', alignItems:'flex-end', justifyContent:'center', gap:8, marginBottom:12, paddingTop:4 },
  podiumItem:{ flex:1, alignItems:'center' },
  podiumFirst:{ transform:[{ scale:1.05 }] },
  podiumFlag:{ fontSize:18, marginBottom:2 },
  podiumName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:9, color:C.muted, marginBottom:3, textAlign:'center' },
  podiumBar:{ width:'100%', borderRadius:6, alignItems:'center', justifyContent:'center' },
  podiumMedal:{ fontSize:18 },
  podiumPts:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted, marginTop:3 },
  divider:{ height:1, backgroundColor:'rgba(255,215,0,0.1)', marginBottom:8 },
  row:{ flexDirection:'row', alignItems:'center', paddingVertical:9, borderBottomWidth:1, borderBottomColor:C.border2, gap:8 },
  rowPos:{ fontFamily:'BebasNeue_400Regular', fontSize:16, width:26, textAlign:'center' },
  rowFlag:{ fontSize:16 },
  rowMid:{ flex:1, flexDirection:'row', alignItems:'center', gap:6 },
  rowName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.text },
  planTag:{ borderWidth:1, borderRadius:20, paddingHorizontal:6, paddingVertical:1 },
  planTagTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, letterSpacing:0.5 },
  rowPts:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.green, width:44, textAlign:'right' },
  footer:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, textAlign:'center', marginTop:14, letterSpacing:0.5 },
});