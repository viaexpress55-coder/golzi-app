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
import { getUpcomingMatches, getLiveMatches, formatApiMatch } from '../../services/footballApi';

const C = {
  bg:        '#000000',
  surface:   '#0A0A0A',
  surface2:  '#111111',
  gold:      '#FFD700',
  gold2:     '#FFA500',
  goldBorder:'rgba(255,215,0,0.3)',
  text:      '#FFFFFF',
  muted:     '#888888',
  muted2:    '#AAAAAA',
  green:     '#00FF87',
  red:       '#FF3355',
};

function getMatchCountdown(kickoffTime: any, status?: string): { text: string; isLive: boolean } {
  if (status === 'live' || status === 'IN_PLAY' || status === 'PAUSED') {
    return { text: 'EN VIVO', isLive: true };
  }
  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const diff = kickoff.getTime() - Date.now();
  if (diff <= 0 && diff > -7200000) return { text: 'EN VIVO', isLive: true };
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return { text: `${days}d ${hours}h ${minutes}m`, isLive: false };
  if (hours > 0) return { text: `${hours}h ${minutes}m`, isLive: false };
  return { text: `${minutes}m`, isLive: false };
}

function getMatchDate(kickoffTime: any, language: string): string {
  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const locale: Record<string,string> = {
    es:'es-CO', en:'en-US', pt:'pt-BR', fr:'fr-FR',
    de:'de-DE', it:'it-IT', ru:'ru-RU', ar:'ar-SA',
    zh:'zh-CN', ja:'ja-JP', ko:'ko-KR', hi:'hi-IN',
  };
  return kickoff.toLocaleDateString(locale[language] || 'es-CO', {
    day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
  });
}

function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue:0.2, duration:600, useNativeDriver:true }),
        Animated.timing(pulse, { toValue:1,   duration:600, useNativeDriver:true }),
      ])
    ).start();
  }, []);
  return (
    <View style={s.liveBadge}>
      <Animated.View style={[s.liveDot, { opacity:pulse }]} />
      <Text style={s.liveTxt}>EN VIVO</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const [matches,   setMatches]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<string|null>(null);
  const [scores,    setScores]    = useState<Record<string,[string,string]>>({});
  const [confirmed, setConfirmed] = useState<Record<string,boolean>>({});
  const [, forceUpdate] = useState(0);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular, Barlow_500Medium,
  });

  useEffect(() => {
    async function loadMatches() {
      try {
        const [live, upcoming] = await Promise.all([getLiveMatches(), getUpcomingMatches(8)]);
        const api = [...live, ...upcoming];
        if (api.length > 0) {
          setMatches(api.map(formatApiMatch));
        } else {
          const q = query(collection(db, 'matches'), orderBy('kickoffTime'));
          const snap = await getDocs(q);
          setMatches(snap.docs.map(d => ({ id:d.id, ...d.data() })));
        }
      } catch {
        try {
          const q = query(collection(db, 'matches'), orderBy('kickoffTime'));
          const snap = await getDocs(q);
          setMatches(snap.docs.map(d => ({ id:d.id, ...d.data() })));
        } catch {}
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
    const timer = setInterval(() => forceUpdate(n => n+1), 60000);
    return () => clearInterval(timer);
  }, []);

  function getScore(id:string):[string,string] { return scores[id]||['0','0']; }

  function setScore(id:string, side:0|1, val:string) {
    const cur = getScore(id);
    const next:[string,string] = [...cur] as [string,string];
    next[side] = val.replace(/[^0-9]/g,'').slice(0,2);
    setScores(prev => ({ ...prev, [id]:next }));
  }

  async function confirm(id:string) {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const [home, away] = getScore(id);
        await savePrediction(user.uid, id, parseInt(home)||0, parseInt(away)||0);
      }
    } catch {}
    setConfirmed(prev => ({ ...prev, [id]:true }));
    setSelected(null);
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={[s.root, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator color={C.gold} size="large" />
        <Text style={{ color:C.muted, marginTop:16, fontSize:13 }}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>

      {/* HEADER */}
      <LinearGradient colors={['#000','#0A0A0A']} style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconBox}>
            <Text style={{ fontSize:20 }}>⚽</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>PREDICTOR</Text>
            <Text style={s.headerSub}>FIFA WORLD CUP 2026</Text>
          </View>
        </View>
        <TouchableOpacity style={s.bellBtn}>
          <Text style={{ fontSize:18 }}>🔔</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* STATS BANNER */}
        <LinearGradient
          colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']}
          start={{x:0,y:0}} end={{x:1,y:0}}
          style={s.statsBanner}
        >
          {[
            { val:matches.length, lbl:t('home_matches') },
            { val:104,            lbl:'TOTAL' },
            { val:35,             lbl:'DÍAS' },
          ].map((st,i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.statDivider} />}
              <View style={s.statItem}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </LinearGradient>

        {/* MATCH CARDS */}
        {matches.map(m => {
          const cd          = getMatchCountdown(m.kickoffTime, m.status);
          const isSelected  = selected === m.id;
          const isConfirmed = confirmed[m.id];

          return (
            <View key={m.id} style={s.card}>

              {/* Gold glow top */}
              <LinearGradient
                colors={['rgba(255,215,0,0.08)','transparent']}
                start={{x:0.5,y:0}} end={{x:0.5,y:1}}
                style={s.cardGlow}
              />

              {/* Card header */}
              <View style={s.cardHeader}>
                <View style={s.cardHeaderLeft}>
                  <View style={s.groupPill}>
                    <Text style={s.groupPillTxt}>{m.group || 'GRUPO'}</Text>
                  </View>
                  <Text style={s.stadiumTxt} numberOfLines={1}>{m.stadium || 'ESTADIO'}</Text>
                </View>
                {cd.isLive
                  ? <LiveBadge />
                  : <View style={s.countdownPill}>
                      <Text style={s.countdownTxt}>⏱ {cd.text}</Text>
                    </View>
                }
              </View>

              {/* TEAMS ROW */}
              <View style={s.teamsRow}>

                {/* Home */}
                <View style={s.teamBox}>
                  <Text style={s.teamFlag}>{m.homeFlag || '🏳'}</Text>
                  <Text style={s.teamCode}>{(m.homeTeam||'').slice(0,3).toUpperCase()}</Text>
                  <Text style={s.teamName} numberOfLines={1}>{m.homeTeam}</Text>
                </View>

                {/* Center: VS / Score input / Confirmed */}
                <View style={s.centerBox}>
                  {isConfirmed ? (
                    <LinearGradient
                      colors={['rgba(0,255,135,0.12)','rgba(0,255,135,0.04)']}
                      style={s.confirmedBox}
                    >
                      <Text style={s.confirmedNum}>{getScore(m.id)[0]}</Text>
                      <Text style={s.confirmedDash}>-</Text>
                      <Text style={s.confirmedNum}>{getScore(m.id)[1]}</Text>
                    </LinearGradient>
                  ) : isSelected ? (
                    <View style={s.inputRow}>
                      <TextInput
                        style={s.scoreInput}
                        value={getScore(m.id)[0]}
                        onChangeText={v => setScore(m.id, 0, v)}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={s.inputDash}>-</Text>
                      <TextInput
                        style={s.scoreInput}
                        value={getScore(m.id)[1]}
                        onChangeText={v => setScore(m.id, 1, v)}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  ) : (
                    <View style={s.vsCircle}>
                      <Text style={s.vsTxt}>VS</Text>
                    </View>
                  )}
                </View>

                {/* Away */}
                <View style={s.teamBox}>
                  <Text style={s.teamFlag}>{m.awayFlag || '🏳'}</Text>
                  <Text style={s.teamCode}>{(m.awayTeam||'').slice(0,3).toUpperCase()}</Text>
                  <Text style={s.teamName} numberOfLines={1}>{m.awayTeam}</Text>
                </View>

              </View>

              {/* Date + PTS */}
              {m.kickoffTime && (
                <View style={s.dateRow}>
                  <Text style={s.dateTxt}>🕐 {getMatchDate(m.kickoffTime, i18n.language)}</Text>
                  {isConfirmed && (
                    <View style={s.ptsPill}>
                      <Text style={s.ptsPillTxt}>+10 PTS ✓</Text>
                    </View>
                  )}
                </View>
              )}

              {/* PREDICT BUTTON */}
              {m.status !== 'finished' && (
                <TouchableOpacity
                  style={s.predictBtn}
                  onPress={() => isSelected ? confirm(m.id) : setSelected(m.id)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={
                      isConfirmed ? ['#00FF87','#00C853'] :
                      isSelected  ? [C.gold, C.gold2] :
                      ['#1C1C1C','#141414']
                    }
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.predictBtnInner}
                  >
                    <Text style={[
                      s.predictBtnTxt,
                      { color: isConfirmed || isSelected ? '#000' : C.gold }
                    ]}>
                      {isConfirmed
                        ? `✔  ${t('home_sent')}`
                        : isSelected
                          ? `⚡  ${t('home_confirm')}`
                          : `⚡  ${t('home_predict')}`
                      }
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

            </View>
          );
        })}

        {/* POINTS GUIDE */}
        <LinearGradient
          colors={['rgba(255,215,0,0.07)','rgba(255,215,0,0.02)']}
          style={s.ptsGuide}
        >
          <Text style={s.ptsGuideTitle}>{t('home_points')}</Text>
          <View style={s.ptsRow}>
            {[
              { v:'+10', l:t('home_exact'),  c:C.gold },
              { v:'+5',  l:t('home_winner'), c:C.gold2 },
              { v:'+2',  l:t('home_draw'),   c:C.muted2 },
            ].map((p,i) => (
              <View key={i} style={s.ptsCard}>
                <Text style={[s.ptsVal,{ color:p.c }]}>{p.v}</Text>
                <Text style={s.ptsLbl}>{p.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },

  // Header
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:12 },
  headerIconBox:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:C.goldBorder, alignItems:'center', justifyContent:'center' },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  headerSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, letterSpacing:2 },
  bellBtn:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.05)', alignItems:'center', justifyContent:'center' },

  // Stats
  statsBanner:{ flexDirection:'row', marginHorizontal:12, marginTop:12, marginBottom:8, borderRadius:14, borderWidth:1, borderColor:C.goldBorder, padding:14, alignItems:'center', justifyContent:'space-around' },
  statItem:{ alignItems:'center' },
  statVal:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold },
  statLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, marginTop:2 },
  statDivider:{ width:1, height:36, backgroundColor:'rgba(255,215,0,0.2)' },

  scroll:{ paddingBottom:40 },

  // Card
  card:{ marginHorizontal:12, marginBottom:10, backgroundColor:'#111', borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', borderTopWidth:2, borderTopColor:C.gold, overflow:'hidden' },
  cardGlow:{ position:'absolute', top:0, left:0, right:0, height:70, zIndex:0 },

  // Card header
  cardHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingTop:12, paddingBottom:6, zIndex:1 },
  cardHeaderLeft:{ flexDirection:'row', alignItems:'center', gap:8, flex:1 },
  groupPill:{ backgroundColor:'rgba(255,215,0,0.12)', borderRadius:6, borderWidth:1, borderColor:C.goldBorder, paddingHorizontal:8, paddingVertical:3 },
  groupPillTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:12, color:C.gold, letterSpacing:1 },
  stadiumTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, flex:1 },
  countdownPill:{ backgroundColor:'rgba(255,215,0,0.06)', borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', paddingHorizontal:10, paddingVertical:4 },
  countdownTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.gold },

  // Live badge
  liveBadge:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,51,85,0.12)', borderWidth:1, borderColor:'rgba(255,51,85,0.35)', borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  liveDot:{ width:7, height:7, borderRadius:4, backgroundColor:C.red },
  liveTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.red, letterSpacing:1 },

  // Teams row
  teamsRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:12, zIndex:1 },
  teamBox:{ flex:1, alignItems:'center', gap:6 },
  teamFlag:{ fontSize:44 },
  teamCode:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.gold, letterSpacing:2 },
  teamName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2, textAlign:'center' },

  // Center
  centerBox:{ alignItems:'center', justifyContent:'center', paddingHorizontal:8, width:80 },
  vsCircle:{ width:64, height:64, borderRadius:32, backgroundColor:'rgba(255,215,0,0.08)', borderWidth:2, borderColor:C.gold, alignItems:'center', justifyContent:'center' },
  vsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold },

  // Score input
  inputRow:{ flexDirection:'row', alignItems:'center', gap:4 },
  scoreInput:{ width:50, height:50, backgroundColor:'rgba(255,215,0,0.1)', borderWidth:2, borderColor:C.gold, borderRadius:10, color:C.gold, fontFamily:'BebasNeue_400Regular', fontSize:28, textAlign:'center' } as any,
  inputDash:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted },

  // Confirmed
  confirmedBox:{ flexDirection:'row', alignItems:'center', gap:6, borderRadius:12, paddingHorizontal:14, paddingVertical:12, borderWidth:1, borderColor:'rgba(0,255,135,0.25)' },
  confirmedNum:{ fontFamily:'BebasNeue_400Regular', fontSize:34, color:C.green },
  confirmedDash:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.green },

  // Date row
  dateRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingBottom:10, zIndex:1 },
  dateTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted },
  ptsPill:{ backgroundColor:'rgba(0,255,135,0.1)', borderWidth:1, borderColor:'rgba(0,255,135,0.3)', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  ptsPillTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.green, letterSpacing:1 },

  // Predict button
  predictBtn:{ marginHorizontal:14, marginBottom:14, zIndex:1 },
  predictBtnInner:{ borderRadius:12, paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.25)' },
  predictBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:3 },

  // Points guide
  ptsGuide:{ marginHorizontal:12, marginTop:4, borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:14 },
  ptsGuideTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:10 },
  ptsRow:{ flexDirection:'row', gap:8 },
  ptsCard:{ flex:1, backgroundColor:'rgba(255,215,0,0.04)', borderWidth:1, borderColor:'rgba(255,215,0,0.12)', borderRadius:10, padding:10, alignItems:'center' },
  ptsVal:{ fontFamily:'BebasNeue_400Regular', fontSize:20 },
  ptsLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted, textAlign:'center', marginTop:2 },
});