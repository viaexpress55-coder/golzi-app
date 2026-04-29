import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', green:'#00C853', red:'#E8003D',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const EVENTS = [
  { min:12, team:'MX', event:'GOL', player:'H. Lozano',    pts:'+5 pts si predijiste resultado' },
  { min:34, team:'MX', event:'GOL', player:'R. Jiménez',   pts:'+10 pts si predijiste exacto'  },
  { min:45, team:'CA', event:'GOL', player:'A. Davies',    pts:null },
  { min:63, team:'MX', event:'GOL', player:'H. Lozano',    pts:null },
];

const PREDICTIONS = [
  { name:'CarlosGol',   country:'🇨🇴', pred:'2-1', pts:'+10', correct:true  },
  { name:'FutbolRey',   country:'🇲🇽', pred:'3-1', pts:'+5',  correct:false },
  { name:'viaexpress',  country:'🇨🇴', pred:'2-0', pts:'+5',  correct:false, isMe:true },
  { name:'GolazoAR',    country:'🇦🇷', pred:'1-0', pts:'+5',  correct:false },
  { name:'SambaBR',     country:'🇧🇷', pred:'2-1', pts:'+10', correct:true  },
];

export default function LiveScreen() {
  const [mins, setMins] = useState(63);
  const [sec, setSec]   = useState(0);
  const [score, setScore] = useState([3, 1]);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setSec(s => {
        if (s >= 59) { setMins(m => m + 1); return 0; }
        return s + 1;
      });
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>GOLZI</Text>
        <View style={s.liveBadge}>
          <View style={[s.liveDot, { opacity: pulse ? 1 : 0.3 }]} />
          <Text style={s.liveTxt}>EN VIVO</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Marcador principal */}
        <View style={s.scoreboard}>
          <Text style={s.matchLabel}>GRUPO A · JORNADA 1</Text>
          <Text style={s.stadium}>SoFi Stadium, Los Angeles</Text>

          <View style={s.teamsRow}>
            <View style={s.teamBig}>
              <Text style={s.flagBig}>🇲🇽</Text>
              <Text style={s.teamBigName}>México</Text>
            </View>
            <View style={s.scoreMain}>
              <Text style={s.scoreDigits}>{score[0]} - {score[1]}</Text>
              <View style={s.minBadge}>
                <View style={[s.minDot, { opacity: pulse ? 1 : 0.3 }]} />
                <Text style={s.minTxt}>{mins}'{String(sec).padStart(2,'0')}"</Text>
              </View>
            </View>
            <View style={s.teamBig}>
              <Text style={s.flagBig}>🇨🇦</Text>
              <Text style={s.teamBigName}>Canadá</Text>
            </View>
          </View>

          {/* Stats barras */}
          <View style={s.statsBox}>
            <View style={s.statRow}>
              <Text style={s.statVal}>62%</Text>
              <View style={s.statBarWrap}>
                <View style={s.statBarBg}>
                  <View style={[s.statBarFill, { width:'62%' }]} />
                </View>
                <Text style={s.statLabel}>Posesión</Text>
                <View style={s.statBarBg}>
                  <View style={[s.statBarFillR, { width:'38%' }]} />
                </View>
              </View>
              <Text style={s.statVal}>38%</Text>
            </View>
            <View style={s.statRow}>
              <Text style={s.statVal}>8</Text>
              <View style={s.statBarWrap}>
                <View style={s.statBarBg}>
                  <View style={[s.statBarFill, { width:'62%' }]} />
                </View>
                <Text style={s.statLabel}>Tiros</Text>
                <View style={s.statBarBg}>
                  <View style={[s.statBarFillR, { width:'38%' }]} />
                </View>
              </View>
              <Text style={s.statVal}>5</Text>
            </View>
            <View style={s.statRow}>
              <Text style={s.statVal}>3</Text>
              <View style={s.statBarWrap}>
                <View style={s.statBarBg}>
                  <View style={[s.statBarFill, { width:'75%' }]} />
                </View>
                <Text style={s.statLabel}>Al arco</Text>
                <View style={s.statBarBg}>
                  <View style={[s.statBarFillR, { width:'25%' }]} />
                </View>
              </View>
              <Text style={s.statVal}>1</Text>
            </View>
          </View>
        </View>

        {/* Timeline de goles */}
        <Text style={s.sectionTitle}>GOLES</Text>
        {EVENTS.map((e, i) => (
          <View key={i} style={s.eventRow}>
            <Text style={s.eventMin}>{e.min}'</Text>
            <View style={[s.eventDot, { backgroundColor: e.team === 'MX' ? C.green : C.red }]} />
            <View style={s.eventInfo}>
              <Text style={s.eventTxt}>
                {e.team === 'MX' ? '🇲🇽' : '🇨🇦'} {e.player}
              </Text>
              {e.pts && <Text style={s.eventPts}>{e.pts}</Text>}
            </View>
          </View>
        ))}

        {/* Mi predicción */}
        <View style={s.myPredCard}>
          <Text style={s.myPredLabel}>TU PREDICCION</Text>
          <View style={s.myPredRow}>
            <Text style={s.myPredScore}>2 - 0</Text>
            <View style={s.myPredStatus}>
              <Text style={s.myPredStatusTxt}>Ganador correcto</Text>
              <Text style={s.myPredPts}>+5 pts</Text>
            </View>
          </View>
        </View>

        {/* Predicciones en vivo */}
        <Text style={s.sectionTitle}>PREDICCIONES EN VIVO</Text>
        {PREDICTIONS.map((p, i) => (
          <View key={i} style={[s.predRow, p.isMe && s.predRowMe]}>
            <Text style={s.predFlag}>{p.country}</Text>
            <Text style={[s.predName, p.isMe && { color: C.gold }]}>{p.name}</Text>
            <Text style={s.predScore}>{p.pred}</Text>
            <View style={[s.predPtsBadge, { backgroundColor: p.correct ? 'rgba(0,200,83,0.15)' : 'rgba(255,215,0,0.1)' }]}>
              <Text style={[s.predPts, { color: p.correct ? C.green : C.gold }]}>{p.pts}</Text>
            </View>
          </View>
        ))}

        <Text style={s.footer}>Datos en tiempo real · Regla del Primer Pitazo activa</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.dark },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:48, paddingBottom:12, borderBottomWidth:1, borderBottomColor:C.border },
  logo:{ fontSize:18, color:C.gold, fontWeight:'900', letterSpacing:3, width:60 },
  liveBadge:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(232,0,61,0.12)', borderWidth:1, borderColor:'rgba(232,0,61,0.3)', borderRadius:20, paddingHorizontal:12, paddingVertical:4 },
  liveDot:{ width:7, height:7, borderRadius:4, backgroundColor:C.red },
  liveTxt:{ fontSize:12, color:C.red, fontWeight:'700', letterSpacing:1 },
  scroll:{ paddingBottom:40 },
  scoreboard:{ backgroundColor:C.surface, borderBottomWidth:1, borderBottomColor:C.border, padding:16 },
  matchLabel:{ fontSize:10, color:C.muted, letterSpacing:2, textAlign:'center', marginBottom:2 },
  stadium:{ fontSize:11, color:C.muted, textAlign:'center', marginBottom:16 },
  teamsRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  teamBig:{ flex:1, alignItems:'center' },
  flagBig:{ fontSize:40, marginBottom:6 },
  teamBigName:{ fontSize:14, color:C.text, fontWeight:'700' },
  scoreMain:{ alignItems:'center' },
  scoreDigits:{ fontSize:52, color:C.green, fontWeight:'900', letterSpacing:4 },
  minBadge:{ flexDirection:'row', alignItems:'center', gap:4, marginTop:2 },
  minDot:{ width:6, height:6, borderRadius:3, backgroundColor:C.red },
  minTxt:{ fontSize:13, color:C.red, fontWeight:'600' },
  statsBox:{ gap:8 },
  statRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  statVal:{ fontSize:11, color:C.muted, width:32, textAlign:'center' },
  statBarWrap:{ flex:1, flexDirection:'row', alignItems:'center', gap:4 },
  statBarBg:{ flex:1, height:6, backgroundColor:C.surface2, borderRadius:3, overflow:'hidden' },
  statBarFill:{ height:'100%', backgroundColor:C.green, borderRadius:3 },
  statBarFillR:{ height:'100%', backgroundColor:C.red, borderRadius:3, alignSelf:'flex-end' },
  statLabel:{ fontSize:10, color:C.muted, width:56, textAlign:'center' },
  sectionTitle:{ fontSize:13, color:C.muted, fontWeight:'700', letterSpacing:2, paddingHorizontal:16, paddingTop:16, paddingBottom:8 },
  eventRow:{ flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:16, paddingVertical:8, borderBottomWidth:1, borderBottomColor:C.border },
  eventMin:{ fontSize:13, color:C.muted, fontWeight:'700', width:28 },
  eventDot:{ width:8, height:8, borderRadius:4 },
  eventInfo:{ flex:1 },
  eventTxt:{ fontSize:13, color:C.text, fontWeight:'500' },
  eventPts:{ fontSize:10, color:C.green, marginTop:1 },
  myPredCard:{ marginHorizontal:16, marginTop:12, backgroundColor:'rgba(0,200,83,0.06)', borderWidth:1, borderColor:'rgba(0,200,83,0.2)', borderRadius:12, padding:12 },
  myPredLabel:{ fontSize:9, color:C.green, fontWeight:'700', letterSpacing:1, marginBottom:6 },
  myPredRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  myPredScore:{ fontSize:28, color:C.green, fontWeight:'900', letterSpacing:4 },
  myPredStatus:{ alignItems:'flex-end' },
  myPredStatusTxt:{ fontSize:12, color:C.muted2 },
  myPredPts:{ fontSize:18, color:C.green, fontWeight:'900' },
  predRow:{ flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:16, paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border },
  predRowMe:{ backgroundColor:'rgba(255,215,0,0.04)' },
  predFlag:{ fontSize:16 },
  predName:{ flex:1, fontSize:13, color:C.text, fontWeight:'500' },
  predScore:{ fontSize:14, color:C.muted, fontWeight:'700' },
  predPtsBadge:{ borderRadius:20, paddingHorizontal:8, paddingVertical:3 },
  predPts:{ fontSize:12, fontWeight:'700' },
  footer:{ fontSize:10, color:C.muted, textAlign:'center', padding:16, letterSpacing:0.3 },
});