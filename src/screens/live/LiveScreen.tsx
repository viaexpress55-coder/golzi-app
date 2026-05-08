import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { startAutoSync, stopAutoSync } from '../../services/footballApi';

const C = {
  bg:        '#000000',
  surface2:  '#111111',
  gold:      '#FFD700',
  gold2:     '#FFA500',
  goldBorder:'rgba(255,215,0,0.3)',
  text:      '#FFFFFF',
  muted:     '#888888',
  muted2:    '#AAAAAA',
  green:     '#00FF87',
  red:       '#FF3355',
  cyan:      '#00C6FF',
};

function LiveBadge({ minute }: { minute?: number | null }) {
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
      <Text style={s.liveTxt}>EN VIVO{minute ? ` · ${minute}'` : ''}</Text>
    </View>
  );
}

function EventIcon({ type }: { type: string }) {
  const icons: Record<string,string> = {
    'GOAL':'⚽','YELLOW_CARD':'🟨','RED_CARD':'🟥',
    'SUBSTITUTION':'🔄','PENALTY':'⚽','OWN_GOAL':'⚽',
    'VAR':'📺','GOL':'⚽','AMARILLA':'🟨','ROJA':'🟥',
  };
  return <Text style={{ fontSize:14 }}>{icons[type] || '📌'}</Text>;
}

function Scoreboard({ match }: { match: any }) {
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef({ home:match.homeScore, away:match.awayScore });

  useEffect(() => {
    if (
      prevScore.current.home !== match.homeScore ||
      prevScore.current.away !== match.awayScore
    ) {
      Animated.sequence([
        Animated.timing(scoreAnim, { toValue:1.4, duration:200, useNativeDriver:true }),
        Animated.timing(scoreAnim, { toValue:0.9, duration:100, useNativeDriver:true }),
        Animated.timing(scoreAnim, { toValue:1,   duration:150, useNativeDriver:true }),
      ]).start();
      prevScore.current = { home:match.homeScore, away:match.awayScore };
    }
  }, [match.homeScore, match.awayScore]);

  const isLive     = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  return (
    <View style={s.scoreCard}>

      {/* Gold glow top */}
      <LinearGradient
        colors={isLive
          ? ['rgba(255,51,85,0.12)','transparent']
          : ['rgba(255,215,0,0.06)','transparent']
        }
        start={{x:0.5,y:0}} end={{x:0.5,y:1}}
        style={s.scoreCardGlow}
      />

      {/* Top line */}
      <View style={[s.scoreTopLine, { backgroundColor: isLive ? C.red : C.gold }]} />

      {/* Venue */}
      <Text style={s.scoreVenue}>
        {match.venue || match.stadium || 'ESTADIO'} · {match.competition || 'FIFA WORLD CUP 2026'}
      </Text>

      {/* Status badge */}
      {isLive && <LiveBadge minute={match.minute} />}
      {isFinished && (
        <View style={s.finishedBadge}>
          <Text style={s.finishedTxt}>FINAL</Text>
        </View>
      )}

      {/* Teams & Score */}
      <View style={s.scoreRow}>
        <View style={s.scoreTeam}>
          <Text style={s.scoreFlag}>{match.homeFlag || '🏳'}</Text>
          <Text style={s.scoreCode}>{(match.homeTeam||'').slice(0,3).toUpperCase()}</Text>
          <Text style={s.scoreName}>{match.homeTeam}</Text>
        </View>

        <View style={s.scoreCenter}>
          {match.homeScore !== null && match.awayScore !== null ? (
            <Animated.View style={[s.scoreBox, { transform:[{ scale:scoreAnim }] }]}>
              <Text style={s.scoreNum}>{match.homeScore}</Text>
              <Text style={s.scoreDash}>-</Text>
              <Text style={s.scoreNum}>{match.awayScore}</Text>
            </Animated.View>
          ) : (
            <View style={s.vsCircle}>
              <Text style={s.vsTxt}>VS</Text>
            </View>
          )}
          {isLive && (
            <View style={s.minRow}>
              <View style={s.minDot} />
              <Text style={s.minTxt}>{match.minute || '0'}'</Text>
            </View>
          )}
        </View>

        <View style={s.scoreTeam}>
          <Text style={s.scoreFlag}>{match.awayFlag || '🏳'}</Text>
          <Text style={s.scoreCode}>{(match.awayTeam||'').slice(0,3).toUpperCase()}</Text>
          <Text style={s.scoreName}>{match.awayTeam}</Text>
        </View>
      </View>

      {/* Events feed */}
      {match.events && match.events.length > 0 && (
        <View style={s.eventFeed}>
          {match.events.map((e: any, i: number) => (
            <View key={i} style={s.eventRow}>
              <Text style={s.eventMin}>{e.minute}'</Text>
              <EventIcon type={e.type} />
              <Text style={s.eventTxt} numberOfLines={1}>{e.player} — {e.detail || e.type}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function LiveScreen() {
  const { t } = useTranslation();
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  useEffect(() => {
    startAutoSync();
    const q = query(collection(db, 'live_matches'));
    const unsub = onSnapshot(q, snap => {
      setLiveMatches(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue:1.05, duration:1000, useNativeDriver:true }),
        Animated.timing(pulseAnim, { toValue:1,    duration:1000, useNativeDriver:true }),
      ])
    ).start();

    return () => { unsub(); stopAutoSync(); };
  }, []);

  if (!fontsLoaded) return <View style={s.root} />;

  const live     = liveMatches.filter(m => m.status==='IN_PLAY' || m.status==='PAUSED');
  const today    = liveMatches.filter(m => m.status==='SCHEDULED' || m.status==='TIMED');
  const finished = liveMatches.filter(m => m.status==='FINISHED').slice(-3);
  const isEmpty  = !loading && liveMatches.length === 0;

  return (
    <View style={s.root}>

      {/* HEADER */}
      <LinearGradient colors={['#000','#0A0A0A']} style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconBox}>
            <Text style={{ fontSize:20 }}>📡</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>{t('live_title')}</Text>
            <Text style={s.headerSub}>FIFA WORLD CUP 2026</Text>
          </View>
        </View>
        {live.length > 0 && (
          <View style={s.liveCountBadge}>
            <Text style={s.liveCountNum}>{live.length}</Text>
            <Text style={s.liveCountLbl}>EN VIVO</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* EN VIVO */}
        {live.length > 0 && (
          <View>
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={s.sectionLabel}>EN VIVO AHORA</Text>
            </View>
            {live.map(m => <Scoreboard key={m.id} match={m} />)}
          </View>
        )}

        {/* HOY */}
        {today.length > 0 && (
          <View>
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>{t('live_other_matches')}</Text>
            </View>
            {today.map((m,i) => (
              <LinearGradient
                key={i}
                colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']}
                style={s.miniCard}
              >
                <View style={s.miniTeamBox}>
                  <Text style={s.miniFlag}>{m.homeFlag || '🏳'}</Text>
                  <Text style={s.miniName}>{m.homeTeam}</Text>
                </View>
                <View style={s.miniCenter}>
                  <Text style={s.miniVs}>VS</Text>
                  <Text style={s.miniTime}>
                    {m.utcDate ? new Date(m.utcDate).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}
                  </Text>
                </View>
                <View style={[s.miniTeamBox, { alignItems:'flex-end' }]}>
                  <Text style={s.miniFlag}>{m.awayFlag || '🏳'}</Text>
                  <Text style={s.miniName}>{m.awayTeam}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* RECIENTES */}
        {finished.length > 0 && (
          <View>
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>RESULTADOS RECIENTES</Text>
            </View>
            {finished.map((m,i) => (
              <LinearGradient
                key={i}
                colors={['rgba(0,255,135,0.05)','rgba(0,255,135,0.01)']}
                style={[s.miniCard, { borderColor:'rgba(0,255,135,0.1)' }]}
              >
                <View style={s.miniTeamBox}>
                  <Text style={s.miniFlag}>{m.homeFlag || '🏳'}</Text>
                  <Text style={s.miniName}>{m.homeTeam}</Text>
                </View>
                <View style={s.miniCenter}>
                  <Text style={s.miniScore}>{m.homeScore} - {m.awayScore}</Text>
                  <Text style={s.miniFinal}>FINAL</Text>
                </View>
                <View style={[s.miniTeamBox, { alignItems:'flex-end' }]}>
                  <Text style={s.miniFlag}>{m.awayFlag || '🏳'}</Text>
                  <Text style={s.miniName}>{m.awayTeam}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* EMPTY STATE */}
        {isEmpty && (
          <Animated.View style={[s.emptyBox, { transform:[{ scale:pulseAnim }] }]}>
            <LinearGradient
              colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']}
              style={s.emptyCard}
            >
              <Text style={s.emptyIcon}>📡</Text>
              <Text style={s.emptyTitle}>SIN PARTIDOS EN VIVO</Text>
              <Text style={s.emptySub}>Los partidos aparecen automáticamente</Text>
              <Text style={s.emptySub}>cuando empiecen</Text>
              <View style={s.emptyDivider} />
              <Text style={s.emptyDate}>⚽ Próximo partido: 11 jun 2026</Text>
            </LinearGradient>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },

  // Header
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:12 },
  headerIconBox:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', alignItems:'center', justifyContent:'center' },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  headerSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, letterSpacing:2 },
  liveCountBadge:{ backgroundColor:'rgba(255,51,85,0.12)', borderRadius:10, borderWidth:1, borderColor:'rgba(255,51,85,0.3)', padding:10, alignItems:'center' },
  liveCountNum:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.red },
  liveCountLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.red, letterSpacing:2 },

  scroll:{ paddingHorizontal:12, paddingBottom:40 },

  // Section header
  sectionHeader:{ flexDirection:'row', alignItems:'center', gap:8, marginTop:14, marginBottom:8 },
  sectionDot:{ width:8, height:8, borderRadius:4, backgroundColor:C.red },
  sectionLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3 },

  // Score card
  scoreCard:{ backgroundColor:C.surface2, borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', marginBottom:12, overflow:'hidden' },
  scoreCardGlow:{ position:'absolute', top:0, left:0, right:0, height:80 },
  scoreTopLine:{ height:3 },
  scoreVenue:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, textAlign:'center', paddingTop:10, paddingBottom:6 },

  // Live badge
  liveBadge:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,51,85,0.12)', borderWidth:1, borderColor:'rgba(255,51,85,0.3)', borderRadius:20, alignSelf:'center', paddingHorizontal:12, paddingVertical:4, marginBottom:6 },
  liveDot:{ width:8, height:8, borderRadius:4, backgroundColor:C.red },
  liveTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.red, letterSpacing:1 },

  // Finished badge
  finishedBadge:{ backgroundColor:'rgba(136,136,136,0.1)', borderRadius:20, alignSelf:'center', paddingHorizontal:12, paddingVertical:4, marginBottom:6, borderWidth:1, borderColor:'rgba(136,136,136,0.2)' },
  finishedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:2 },

  // Score row
  scoreRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingBottom:14, paddingTop:4 },
  scoreTeam:{ flex:1, alignItems:'center', gap:6 },
  scoreFlag:{ fontSize:44 },
  scoreCode:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.gold, letterSpacing:2 },
  scoreName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted, textAlign:'center' },
  scoreCenter:{ alignItems:'center', paddingHorizontal:8 },
  scoreBox:{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(255,215,0,0.06)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', paddingHorizontal:16, paddingVertical:10 },
  scoreNum:{ fontFamily:'BebasNeue_400Regular', fontSize:52, color:C.text, lineHeight:56 },
  scoreDash:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.muted },
  vsCircle:{ width:72, height:72, borderRadius:36, backgroundColor:'rgba(255,215,0,0.08)', borderWidth:2, borderColor:C.gold, alignItems:'center', justifyContent:'center' },
  vsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold },
  minRow:{ flexDirection:'row', alignItems:'center', gap:5, marginTop:6 },
  minDot:{ width:8, height:8, borderRadius:4, backgroundColor:C.red },
  minTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.red, letterSpacing:1 },

  // Events
  eventFeed:{ borderTopWidth:1, borderTopColor:'rgba(255,215,0,0.1)', padding:12, gap:8 },
  eventRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  eventMin:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.gold, width:28 },
  eventTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2, flex:1 },

  // Mini cards
  miniCard:{ borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:14, flexDirection:'row', alignItems:'center', marginBottom:8 },
  miniTeamBox:{ flex:1, alignItems:'flex-start', gap:4 },
  miniFlag:{ fontSize:22 },
  miniName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.text },
  miniCenter:{ alignItems:'center', paddingHorizontal:12 },
  miniVs:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.muted },
  miniTime:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.cyan },
  miniScore:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.green },
  miniFinal:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },

  // Empty state
  emptyBox:{ marginTop:40, paddingHorizontal:4 },
  emptyCard:{ borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:40, alignItems:'center' },
  emptyIcon:{ fontSize:56, marginBottom:16 },
  emptyTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold, letterSpacing:3, marginBottom:10 },
  emptySub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, textAlign:'center' },
  emptyDivider:{ width:40, height:1, backgroundColor:'rgba(255,215,0,0.2)', marginVertical:16 },
  emptyDate:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.gold2 },
});