import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', green:'#00C853', red:'#E8003D',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const AI_TIPS: Record<string, string> = {
  'WC2026_001': 'Mexico lleva ventaja historica vs Canada. Probabilidad local: 58%.',
  'WC2026_002': 'USA en racha de 5 partidos sin perder. Partido cerrado esperado.',
  'WC2026_003': 'Brasil favorito con 71% de probabilidad segun modelos.',
  'WC2026_004': 'Argentina domina con 72% de probabilidad. Messi en forma.',
};

export default function HomeScreen() {
  const [matches,   setMatches]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [scores,    setScores]    = useState<Record<string, [string,string]>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadMatches() {
      try {
        const q = query(collection(db, 'matches'), orderBy('kickoffTime'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMatches(data);
      } catch (e) {
        console.error('Error loading matches:', e);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  function getScore(id: string): [string, string] {
    return scores[id] || ['0', '0'];
  }

  function setScore(id: string, side: 0|1, val: string) {
    const cur = getScore(id);
    const next: [string,string] = [...cur] as [string,string];
    next[side] = val.replace(/[^0-9]/g,'').slice(0,2);
    setScores(prev => ({ ...prev, [id]: next }));
  }

  function confirm(id: string) {
    setConfirmed(prev => ({ ...prev, [id]: true }));
    setSelected(null);
  }

  if (loading) {
    return (
      <View style={[s.root, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator color={C.gold} size="large" />
        <Text style={{ color:C.muted, marginTop:12, fontSize:13 }}>Cargando partidos...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.headerLogo}>GOLZI</Text>
        <View style={s.planBadge}>
          <Text style={s.planTxt}>PLAYER</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>PREDICTOR</Text>
        <Text style={s.sectionSub}>Cierra al primer pitazo · Sin excepciones</Text>

        {matches.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyTxt}>No hay partidos disponibles</Text>
          </View>
        )}

        {matches.map(m => (
          <View key={m.id}>
            <TouchableOpacity
              style={[
                s.matchCard,
                m.status === 'finished' && s.matchDone,
                selected === m.id && s.matchSelected,
                confirmed[m.id] && s.matchConfirmed,
              ]}
              onPress={() => {
                if (m.status === 'finished') return;
                setSelected(selected === m.id ? null : m.id);
              }}
              activeOpacity={0.8}
            >
              <View style={s.matchRow}>
                <View style={s.teamBox}>
                  <Text style={s.flag}>{m.homeFlag || '🏳️'}</Text>
                  <Text style={s.teamName}>{m.homeTeam}</Text>
                </View>
                <View style={[s.scoreBox, confirmed[m.id] && s.scoreBoxConfirmed]}>
                  {confirmed[m.id]
                    ? <Text style={s.scoreText}>{getScore(m.id)[0]}-{getScore(m.id)[1]}</Text>
                    : <Text style={s.scoreText}>{m.status === 'finished' ? `${m.homeScore}-${m.awayScore}` : 'vs'}</Text>
                  }
                </View>
                <View style={s.teamBox}>
                  <Text style={s.flag}>{m.awayFlag || '🏳️'}</Text>
                  <Text style={s.teamName}>{m.awayTeam}</Text>
                </View>
              </View>
              <View style={s.matchMeta}>
                <View style={s.statusDot}>
                  <View style={[s.dot,
                    m.status === 'live'     && s.dotLive,
                    m.status === 'scheduled'&& s.dotSched,
                    m.status === 'finished' && s.dotDone,
                  ]} />
                  <Text style={[s.metaTxt,
                    m.status === 'live' && s.txtLive,
                    m.status === 'scheduled' && s.txtSched,
                  ]}>
                    {m.status === 'live' ? 'EN VIVO' : m.status === 'finished' ? 'FINALIZADO' : m.group + ' · ' + m.stadium}
                  </Text>
                </View>
                {confirmed[m.id] && (
                  <View style={s.confirmedBadge}>
                    <Text style={s.confirmedTxt}>✓ ENVIADA</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {selected === m.id && !confirmed[m.id] && (
              <View style={s.predictPanel}>
                <Text style={s.predictTitle}>PREDECIR PARTIDO</Text>
                <View style={s.aiBox}>
                  <Text style={s.aiLabel}>IA GOLZI — ANALISIS</Text>
                  <Text style={s.aiTxt}>{AI_TIPS[m.id] || 'Analizando datos del partido...'}</Text>
                </View>
                <View style={s.inputRow}>
                  <View style={s.teamSmall}>
                    <Text style={s.flagSm}>{m.homeFlag || '🏳️'}</Text>
                    <Text style={s.teamNameSm}>{m.homeTeam}</Text>
                  </View>
                  <View style={s.scoreInputRow}>
                    <TextInput
                      style={s.scoreInput}
                      value={getScore(m.id)[0]}
                      onChangeText={v => setScore(m.id, 0, v)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={s.scoreDash}>-</Text>
                    <TextInput
                      style={s.scoreInput}
                      value={getScore(m.id)[1]}
                      onChangeText={v => setScore(m.id, 1, v)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={s.teamSmall}>
                    <Text style={s.flagSm}>{m.awayFlag || '🏳️'}</Text>
                    <Text style={s.teamNameSm}>{m.awayTeam}</Text>
                  </View>
                </View>
                <View style={s.ptsGuide}>
                  <Text style={s.ptsItem}>10 pts — Resultado exacto</Text>
                  <Text style={s.ptsItem}>5 pts — Ganador correcto</Text>
                  <Text style={s.ptsItem}>2 pts — Empate sin score</Text>
                </View>
                <TouchableOpacity style={s.confirmBtn} onPress={() => confirm(m.id)} activeOpacity={0.85}>
                  <Text style={s.confirmTxt}>CONFIRMAR PREDICCION</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.dark },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:48, paddingBottom:12, borderBottomWidth:1, borderBottomColor:C.border },
  headerLogo:{ fontSize:22, color:C.gold, letterSpacing:4, fontWeight:'900' },
  planBadge:{ backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:C.borderG, borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  planTxt:{ fontSize:11, color:C.gold, fontWeight:'700', letterSpacing:1 },
  scroll:{ paddingHorizontal:16, paddingTop:16, paddingBottom:40 },
  sectionTitle:{ fontSize:20, color:C.gold, fontWeight:'900', letterSpacing:2, marginBottom:2 },
  sectionSub:{ fontSize:11, color:C.muted, marginBottom:14, letterSpacing:0.3 },
  emptyBox:{ padding:32, alignItems:'center' },
  emptyTxt:{ fontSize:14, color:C.muted },
  matchCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:14, marginBottom:8 },
  matchDone:{ opacity:0.5 },
  matchSelected:{ borderColor:'rgba(0,200,83,0.4)' },
  matchConfirmed:{ borderColor:'rgba(0,200,83,0.6)' },
  matchRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  teamBox:{ flex:1, alignItems:'center' },
  flag:{ fontSize:28, marginBottom:4 },
  teamName:{ fontSize:13, color:C.text, fontWeight:'600' },
  scoreBox:{ backgroundColor:C.surface2, borderRadius:8, paddingHorizontal:14, paddingVertical:6, minWidth:56, alignItems:'center' },
  scoreBoxConfirmed:{ backgroundColor:'rgba(0,200,83,0.1)', borderWidth:1, borderColor:'rgba(0,200,83,0.3)' },
  scoreText:{ fontSize:18, color:C.green, fontWeight:'900' },
  matchMeta:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  statusDot:{ flexDirection:'row', alignItems:'center', gap:6, flex:1 },
  dot:{ width:6, height:6, borderRadius:3, backgroundColor:C.muted },
  dotLive:{ backgroundColor:C.red },
  dotSched:{ backgroundColor:C.gold },
  dotDone:{ backgroundColor:C.muted },
  metaTxt:{ fontSize:11, color:C.muted, flex:1 },
  txtLive:{ color:C.red, fontWeight:'600' },
  txtSched:{ color:C.gold },
  confirmedBadge:{ backgroundColor:'rgba(0,200,83,0.1)', borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  confirmedTxt:{ fontSize:10, color:C.green, fontWeight:'700' },
  predictPanel:{ backgroundColor:C.surface2, borderWidth:1, borderColor:'rgba(0,200,83,0.2)', borderRadius:12, padding:14, marginBottom:8, marginTop:-4 },
  predictTitle:{ fontSize:16, color:C.gold, fontWeight:'900', letterSpacing:1, marginBottom:10 },
  aiBox:{ backgroundColor:'rgba(0,200,83,0.06)', borderWidth:1, borderColor:'rgba(0,200,83,0.2)', borderRadius:10, padding:10, marginBottom:12 },
  aiLabel:{ fontSize:9, color:C.green, fontWeight:'700', letterSpacing:1, marginBottom:4 },
  aiTxt:{ fontSize:12, color:C.muted2, lineHeight:18 },
  inputRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  teamSmall:{ flex:1, alignItems:'center' },
  flagSm:{ fontSize:22, marginBottom:2 },
  teamNameSm:{ fontSize:11, color:C.muted, textAlign:'center' },
  scoreInputRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  scoreInput:{ width:52, height:48, backgroundColor:C.dark, borderWidth:1, borderColor:C.border, borderRadius:8, fontSize:24, color:C.gold, textAlign:'center', fontWeight:'900' } as any,
  scoreDash:{ fontSize:20, color:C.muted },
  ptsGuide:{ backgroundColor:'rgba(255,215,0,0.04)', borderRadius:8, padding:8, marginBottom:12, gap:2 },
  ptsItem:{ fontSize:11, color:C.muted },
  confirmBtn:{ backgroundColor:C.green, borderRadius:10, paddingVertical:12, alignItems:'center' },
  confirmTxt:{ fontSize:15, color:'#000', fontWeight:'900', letterSpacing:1 },
});