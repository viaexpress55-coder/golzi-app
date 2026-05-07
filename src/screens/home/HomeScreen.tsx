import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { savePrediction } from '../../services/auth';
import { getAuth } from 'firebase/auth';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular, Barlow_500Medium } from '@expo-google-fonts/barlow';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';

// ✅ NUEVO IMPORT
import { getUpcomingMatches, getLiveMatches, formatApiMatch } from '../../services/footballApi';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26', surface3:'#1E2535',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', gold3:'#FF6B00',
  green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
};

const AI_TIPS: Record<string, string> = {
  'WC2026_001': 'Mexico lleva ventaja historica vs Canada. Modelo GOLZI: 58% probabilidad local.',
  'WC2026_002': 'USA en racha de 5 partidos sin perder. Partido cerrado esperado.',
  'WC2026_003': 'Brasil favorito con 71% segun modelos predictivos.',
  'WC2026_004': 'Argentina domina con 72% de probabilidad. Messi en forma.',
};

// 🔥 NUEVAS FUNCIONES
function getMatchCountdown(kickoffTime: any, status?: string): { text: string; isLive: boolean } {
  if (status === 'live' || status === 'IN_PLAY' || status === 'PAUSED') {
    return { text: 'EN VIVO', isLive: true };
  }

  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const now = new Date();
  const diff = kickoff.getTime() - now.getTime();

  if (diff <= 0 && diff > -7200000) return { text: 'EN VIVO', isLive: true };

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (days > 0) return { text: `⏱ ${days}d ${hours}h ${minutes}m`, isLive: false };
  if (hours > 0) return { text: `⏱ ${hours}h ${minutes}m`, isLive: false };
  return { text: `⏱ ${minutes}m`, isLive: false };
}

function getMatchDate(kickoffTime: any, language: string): string {
  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const locale = {
    es: 'es-CO', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR',
    de: 'de-DE', it: 'it-IT', ru: 'ru-RU', ar: 'ar-SA',
    zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', hi: 'hi-IN',
  }[language] || 'es-CO';

  return kickoff.toLocaleDateString(locale, {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });
}

// 🔥 LIVE BADGE
function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: 'rgba(232,0,61,0.15)',
      borderWidth: 1, borderColor: 'rgba(232,0,61,0.5)',
      borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
    }}>
      <Animated.View style={{
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: '#E8003D',
        opacity: pulse,
      }} />
      <Text style={{
        fontFamily: 'BebasNeue_400Regular',
        fontSize: 11, color: '#E8003D', letterSpacing: 1,
      }}>EN VIVO</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const [matches,   setMatches]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [scores,    setScores]    = useState<Record<string, [string,string]>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular, Barlow_500Medium,
  });

  useEffect(() => {
    async function loadMatches() {
      try {
        const liveMatches = await getLiveMatches();
        const upcomingMatches = await getUpcomingMatches(8);
        const apiMatches = [...liveMatches, ...upcomingMatches];

        if (apiMatches.length > 0) {
          setMatches(apiMatches.map(formatApiMatch));
        } else {
          const q = query(collection(db, 'matches'), orderBy('kickoffTime'));
          const snap = await getDocs(q);
          setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error(e);
        try {
          const q = query(collection(db, 'matches'), orderBy('kickoffTime'));
          const snap = await getDocs(q);
          setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  // 🔁 AUTO REFRESH
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 60000);
    return () => clearInterval(timer);
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

  async function confirm(id: string) {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const [home, away] = getScore(id);
        await savePrediction(user.uid, id, parseInt(home)||0, parseInt(away)||0);
      }
    } catch (e) { console.error(e); }
    setConfirmed(prev => ({ ...prev, [id]: true }));
    setSelected(null);
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={[s.root, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator color={C.gold} size="large" />
        <Text style={{ color:C.muted, marginTop:12, fontSize:13, fontFamily:'System' }}>
          {t('loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>🎯</Text>
          <Text style={s.headerTitle}>PREDICTOR</Text>
        </View>
        <Text style={s.headerBell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.subHeader}>
          {matches.length} {t('home_matches')}
        </Text>

        {matches.map(m => (
          <View key={m.id}>
            <View style={[s.matchCard, m.status === 'finished' && s.matchDone]}>
              <View style={s.cardTopLine} />

              <Text style={s.stageLabel}>
                {m.group || 'GRUPO'} · {m.stadium || 'ESTADIO'}
              </Text>

              <View style={s.teamsRow}>
                <View style={s.teamBox}>
                  <Text style={s.teamFlag}>{m.homeFlag || '🏳'}</Text>
                  <Text style={s.teamCode}>{m.homeTeam?.slice(0,3).toUpperCase()}</Text>
                  <Text style={s.teamName}>{m.homeTeam}</Text>
                </View>

                <View style={s.vsBox}>
                  <Text style={s.vsText}>VS</Text>
                  {confirmed[m.id] && (
                    <View style={s.confirmedScore}>
                      <Text style={s.confirmedScoreTxt}>{getScore(m.id)[0]}-{getScore(m.id)[1]}</Text>
                    </View>
                  )}
                  {selected === m.id && !confirmed[m.id] && (
                    <View style={s.scoreInputRow}>
                      <TextInput style={s.scoreInput} value={getScore(m.id)[0]} onChangeText={v => setScore(m.id, 0, v)} keyboardType="numeric" maxLength={2}/>
                      <Text style={s.scoreSep}>-</Text>
                      <TextInput style={s.scoreInput} value={getScore(m.id)[1]} onChangeText={v => setScore(m.id, 1, v)} keyboardType="numeric" maxLength={2}/>
                    </View>
                  )}
                </View>

                <View style={s.teamBox}>
                  <Text style={s.teamFlag}>{m.awayFlag || '🏳'}</Text>
                  <Text style={s.teamCode}>{m.awayTeam?.slice(0,3).toUpperCase()}</Text>
                  <Text style={s.teamName}>{m.awayTeam}</Text>
                </View>
              </View>

              <View style={s.cardFooter}>
                <Text style={s.cardTime}>
                  📅 {m.group} · {m.stadium}
                </Text>

                {m.kickoffTime && (
                  <View style={{ flexDirection:'row', justifyContent:'space-between', paddingHorizontal:11, paddingBottom:4 }}>
                    <Text style={s.cardTime}>
                      🕐 {getMatchDate(m.kickoffTime, i18n.language)}
                    </Text>

                    {(() => {
                      const cd = getMatchCountdown(m.kickoffTime, m.status);
                      return cd.isLive ? (
                        <LiveBadge />
                      ) : (
                        <Text style={[s.cardTime, { color: C.gold }]}>
                          {cd.text}
                        </Text>
                      );
                    })()}
                  </View>
                )}

                {confirmed[m.id] && (
                  <View style={s.ptsBadge}>
                    <Text style={s.ptsBadgeTxt}>+10 PTS EXACTO</Text>
                  </View>
                )}
              </View>

              {selected === m.id && !confirmed[m.id] && (
                <View style={s.aiStrip}>
                  <Text style={s.aiStripTxt}>
                    🤖 IA GOLZI — {AI_TIPS[m.id] || 'Analizando datos...'}
                  </Text>
                </View>
              )}

              {m.status !== 'finished' && (
                <TouchableOpacity
                  style={s.confirmBtn}
                  onPress={() => selected === m.id ? confirm(m.id) : setSelected(m.id)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={confirmed[m.id] ? ['#00FF87','#00C853'] : [C.red,'#B00025']}
                    start={{ x:0, y:0 }} end={{ x:1, y:0 }}
                    style={s.confirmBtnInner}
                  >
                    <Text style={s.confirmBtnTxt}>
                      {confirmed[m.id]
                        ? `✔ ${t('home_sent')}`
                        : selected === m.id
                          ? `⚡ ${t('home_confirm')}`
                          : `⚡ ${t('home_predict')}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <View style={s.ptsGuide}>
          <Text style={s.ptsGuideTitle}>{t('home_points')}</Text>
          <View style={s.ptsRow}>
            {[
              {v:'+10', l:t('home_exact')},
              {v:'+5',  l:t('home_winner')},
              {v:'+2',  l:t('home_draw')},
            ].map((p,i) => (
              <View key={i} style={s.ptsCard}>
                <Text style={s.ptsVal}>{p.v}</Text>
                <Text style={s.ptsLbl}>{p.l}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:13, paddingTop:48, paddingBottom:10, backgroundColor:C.darker },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  headerIcon:{ fontSize:17 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:17, color:C.gold, letterSpacing:2 },
  headerBell:{ fontSize:17 },
  scroll:{ paddingHorizontal:10, paddingBottom:40 },
  subHeader:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, textTransform:'uppercase', marginBottom:10, marginTop:4 },
  matchCard:{ backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:12, marginBottom:8, overflow:'hidden' },
  matchDone:{ opacity:0.5 },
  cardTopLine:{ height:2, backgroundColor:C.red },
  stageLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.gold, letterSpacing:3, textTransform:'uppercase', margin:11, marginBottom:9 },
  teamsRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:11, marginBottom:8 },
  teamBox:{ flex:1, alignItems:'center', gap:3 },
  teamFlag:{ fontSize:26 },
  teamCode:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.text, letterSpacing:1 },
  teamName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted, letterSpacing:0.5 },
  vsBox:{ alignItems:'center', gap:4, paddingHorizontal:8 },
  vsText:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted },
  confirmedScore:{ backgroundColor:'rgba(0,255,135,0.12)', borderWidth:1, borderColor:'rgba(0,255,135,0.3)', borderRadius:8, paddingHorizontal:12, paddingVertical:4 },
  confirmedScoreTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.green, letterSpacing:2 },
  scoreInputRow:{ flexDirection:'row', alignItems:'center', gap:4 },
  scoreInput:{ width:48, height:48, backgroundColor:'rgba(255,215,0,0.12)', borderWidth:1, borderColor:'rgba(255,215,0,0.35)', borderRadius:6, color:C.gold, fontFamily:'BebasNeue_400Regular', fontSize:28, textAlign:'center' } as any,
  scoreSep:{ fontFamily:'BebasNeue_400Regular', fontSize:15, color:C.muted },
  cardFooter:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:11, paddingBottom:8 },
  cardTime:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:9, color:C.muted, letterSpacing:0.3 },
  ptsBadge:{ backgroundColor:'rgba(0,255,135,0.12)', borderWidth:1, borderColor:'rgba(0,255,135,0.28)', borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  ptsBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.green, letterSpacing:1 },
  aiStrip:{ marginHorizontal:11, marginBottom:8, backgroundColor:'rgba(0,198,255,0.08)', borderWidth:1, borderColor:'rgba(0,198,255,0.18)', borderRadius:9, padding:8 },
  aiStripTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:9, color:C.muted, letterSpacing:0.3, lineHeight:14 },
  confirmBtn:{ marginHorizontal:11, marginBottom:11 },
  confirmBtnInner:{ borderRadius:10, paddingVertical:11, alignItems:'center' },
  confirmBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, letterSpacing:2, color:'#fff' },
  ptsGuide:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:12, padding:12, marginTop:8 },
  ptsGuideTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:8 },
  ptsRow:{ flexDirection:'row', gap:8 },
  ptsCard:{ flex:1, backgroundColor:'rgba(255,215,0,0.08)', borderWidth:1, borderColor:'rgba(255,215,0,0.2)', borderRadius:8, padding:8, alignItems:'center' },
  ptsVal:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold, lineHeight:18 },
  ptsLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted, letterSpacing:0.5, textAlign:'center', marginTop:2 },
});