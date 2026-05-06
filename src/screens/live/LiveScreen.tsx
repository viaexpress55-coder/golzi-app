import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const EVENTS = [
  { min:23, team:'MX', event:'GOL', player:'Lozano (MEX)', desc:'Gol de penal' },
  { min:38, team:'CA', event:'AMARILLA', player:'Davies (CAN)', desc:'Tarjeta amarilla' },
  { min:61, team:'CA', event:'GOL', player:'David (CAN)', desc:'Gol · 1-1' },
  { min:70, team:'MX', event:'GOL', player:'Jimenez (MEX)', desc:'Gol · 2-1' },
];

const OTHERS = [
  { home:'US', away:'UY', hName:'USA', aName:'Uruguay', time:'17:00 ET' },
  { home:'DE', away:'JP', hName:'Alemania', aName:'Japan', time:'20:00 ET' },
];

export default function LiveScreen() {
  const { t } = useTranslation();
  const [pulse, setPulse] = useState(true);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  useEffect(() => {
    const timer = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerBack}>←</Text>
        <View style={s.headerCenter}>
          <Text style={s.headerIcon}>📡</Text>
          <Text style={s.headerTitle}>{t('live_title')}</Text>
        </View>
        <Text style={s.headerIcon2}>📈</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.liveBadge}>
          <View style={[s.liveDot, { opacity: pulse ? 1 : 0.3 }]} />
          <Text style={s.liveTxt}>{t('live_title')} · Grupo A</Text>
        </View>

        <View style={s.scoreboard}>
          <View style={s.scoreTopLine} />
          <Text style={s.scoreVenue}>ESTADIO AZTECA · CIUDAD DE MEXICO</Text>

          <View style={s.scoreRow}>
            <View style={s.scoreteam}>
              <Text style={s.scoreFlag}>🇲🇽</Text>
              <Text style={s.scoreCode}>MX</Text>
              <Text style={s.scoreName}>MEXICO</Text>
            </View>
            <View style={s.scoreCenter}>
              <Text style={s.scoreDigits}>2 · 1</Text>
              <View style={s.minRow}>
                <View style={[s.minDot, { opacity: pulse ? 1 : 0.3 }]} />
                <Text style={s.minTxt}>90 FIN'</Text>
              </View>
            </View>
            <View style={s.scoreteam}>
              <Text style={s.scoreFlag}>🇨🇦</Text>
              <Text style={s.scoreCode}>CA</Text>
              <Text style={s.scoreName}>CANADA</Text>
            </View>
          </View>

          <View style={s.possBox}>
            <Text style={s.possLabel}>POSESION DEL BALON</Text>
            <View style={s.possBar}>
              <LinearGradient colors={['#FFD700','#FFA500']} start={{x:0,y:0}} end={{x:1,y:0}} style={[s.possHome, {width:'59%'}]} />
              <View style={[s.possAway, {width:'41%'}]} />
            </View>
            <View style={s.possPcts}>
              <Text style={s.possPct}>59%</Text>
              <Text style={s.possPct}>41%</Text>
            </View>
          </View>

          <View style={s.eventFeed}>
            {EVENTS.map((e, i) => (
              <View key={i} style={s.eventRow}>
                <Text style={s.eventMin}>{e.min}'</Text>
                <Text style={s.eventIcon}>{e.event === 'GOL' ? (e.team === 'MX' ? '🇲🇽' : '🇨🇦') : '🟨'}</Text>
                <Text style={s.eventTxt}>{e.player} — {e.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.myPred}>
          <View>
            <Text style={s.myPredLabel}>{t('live_your_prediction')}</Text>
            <Text style={s.myPredScore}>MEX 2 — 1 CAN ✓</Text>
            <Text style={s.myPredSub}>{t('live_winning')}</Text>
          </View>
          <Text style={s.myPredPts}>+10</Text>
        </View>

        <Text style={s.sectionLabel}>{t('live_other_matches')}</Text>
        {OTHERS.map((m, i) => (
          <View key={i} style={s.miniMatch}>
            <Text style={s.miniTeams}>{m.hName} vs {m.aName}</Text>
            <View style={s.miniTime}>
              <Text style={s.miniTimeTxt}>{m.time}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:13, paddingTop:48, paddingBottom:10 },
  headerBack:{ fontSize:18, color:C.muted, width:30 },
  headerCenter:{ flexDirection:'row', alignItems:'center', gap:6 },
  headerIcon:{ fontSize:17 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:17, color:C.gold, letterSpacing:2 },
  headerIcon2:{ fontSize:17, width:30, textAlign:'right' },
  scroll:{ paddingHorizontal:10, paddingBottom:40 },
  liveBadge:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(232,0,61,0.12)', borderWidth:1, borderColor:'rgba(232,0,61,0.3)', borderRadius:20, alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:4, marginBottom:8 },
  liveDot:{ width:7, height:7, borderRadius:4, backgroundColor:C.red },
  liveTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.red, letterSpacing:1 },
  scoreboard:{ backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:12, overflow:'hidden', marginBottom:8 },
  scoreTopLine:{ height:3, backgroundColor:C.red },
  scoreVenue:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, textAlign:'center', padding:10, paddingBottom:6 },
  scoreRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, paddingBottom:10 },
  scoreteam:{ flex:1, alignItems:'center', gap:2 },
  scoreFlag:{ fontSize:28 },
  scoreCode:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.text, letterSpacing:1 },
  scoreName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:1 },
  scoreCenter:{ alignItems:'center' },
  scoreDigits:{ fontFamily:'BebasNeue_400Regular', fontSize:42, color:C.text, letterSpacing:3, lineHeight:46 },
  minRow:{ flexDirection:'row', alignItems:'center', gap:4, marginTop:2 },
  minDot:{ width:6, height:6, borderRadius:3, backgroundColor:C.red },
  minTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.red, letterSpacing:1 },
  possBox:{ paddingHorizontal:12, paddingBottom:10 },
  possLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, marginBottom:4 },
  possBar:{ height:5, borderRadius:3, flexDirection:'row', overflow:'hidden', backgroundColor:C.surface },
  possHome:{ height:'100%', borderRadius:3 },
  possAway:{ height:'100%', backgroundColor:'rgba(0,48,135,0.8)' },
  possPcts:{ flexDirection:'row', justifyContent:'space-between', marginTop:2 },
  possPct:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:8, color:C.muted },
  eventFeed:{ borderTopWidth:1, borderTopColor:C.border2, padding:10, gap:5 },
  eventRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  eventMin:{ fontFamily:'BebasNeue_400Regular', fontSize:12, color:C.gold, width:22 },
  eventIcon:{ fontSize:12 },
  eventTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2, flex:1 },
  myPred:{ backgroundColor:'rgba(0,255,135,0.07)', borderWidth:1, borderColor:'rgba(0,255,135,0.2)', borderRadius:10, padding:12, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  myPredLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.green, letterSpacing:2, marginBottom:3 },
  myPredScore:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.text, letterSpacing:1 },
  myPredSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, marginTop:2 },
  myPredPts:{ fontFamily:'BebasNeue_400Regular', fontSize:36, color:C.green, lineHeight:40 },
  sectionLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:6 },
  miniMatch:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:8, padding:10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:5 },
  miniTeams:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.text },
  miniTime:{ backgroundColor:'rgba(0,198,255,0.1)', borderWidth:1, borderColor:'rgba(0,198,255,0.25)', borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  miniTimeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.cyan },
});