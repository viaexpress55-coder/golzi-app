import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { startAutoSync, stopAutoSync } from '../../services/footballApi';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
};

// Componente badge EN VIVO animado
function LiveBadge({ minute }: { minute?: number | null }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={ls.liveBadge}>
      <Animated.View style={[ls.liveDot, { opacity: pulse }]} />
      <Text style={ls.liveTxt}>EN VIVO{minute ? ` · ${minute}'` : ''}</Text>
    </View>
  );
}

// Icono de evento
function EventIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    'GOAL': '⚽', 'YELLOW_CARD': '🟨', 'RED_CARD': '🟥',
    'SUBSTITUTION': '🔄', 'PENALTY': '⚽', 'OWN_GOAL': '⚽',
    'VAR': '📺', 'GOL': '⚽', 'AMARILLA': '🟨', 'ROJA': '🟥',
  };
  return <Text style={{ fontSize: 12 }}>{icons[type] || '📌'}</Text>;
}

// Componente de marcador animado estilo FIFA
function Scoreboard({ match }: { match: any }) {
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef({ home: match.homeScore, away: match.awayScore });

  useEffect(() => {
    if (
      prevScore.current.home !== match.homeScore ||
      prevScore.current.away !== match.awayScore
    ) {
      // Animación de gol
      Animated.sequence([
        Animated.timing(scoreAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(scoreAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(scoreAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      prevScore.current = { home: match.homeScore, away: match.awayScore };
    }
  }, [match.homeScore, match.awayScore]);

  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  return (
    <View style={ls.scoreboard}>
      <LinearGradient
        colors={['rgba(232,0,61,0.15)', 'rgba(232,0,61,0.05)', 'transparent']}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={ls.scoreboardGradient}
      >
        <View style={ls.scoreTopLine} />

        <Text style={ls.scoreVenue}>
          {match.venue || match.stadium || 'ESTADIO'} · {match.competition || 'FIFA WORLD CUP 2026'}
        </Text>

        {isLive && <LiveBadge minute={match.minute} />}
        {isFinished && (
          <View style={ls.finishedBadge}>
            <Text style={ls.finishedTxt}>FINAL</Text>
          </View>
        )}

        <View style={ls.scoreRow}>
          {/* Equipo local */}
          <View style={ls.scoreteam}>
            <Text style={ls.scoreFlag}>{match.homeFlag || '⚽'}</Text>
            <Text style={ls.scoreCode}>
              {(match.homeTeam || '').slice(0, 3).toUpperCase()}
            </Text>
            <Text style={ls.scoreName}>{match.homeTeam}</Text>
          </View>

          {/* Marcador */}
          <View style={ls.scoreCenter}>
            {match.homeScore !== null && match.awayScore !== null ? (
              <Animated.Text style={[ls.scoreDigits, { transform: [{ scale: scoreAnim }] }]}>
                {match.homeScore} - {match.awayScore}
              </Animated.Text>
            ) : (
              <Text style={ls.scoreDigitsVs}>VS</Text>
            )}
            <View style={ls.minRow}>
              {isLive && (
                <>
                  <View style={ls.minDot} />
                  <Text style={ls.minTxt}>{match.minute || '0'}'</Text>
                </>
              )}
              {!isLive && !isFinished && (
                <Text style={ls.scheduledTxt}>
                  {match.kickoffTime ? new Date(
                    match.kickoffTime?.seconds ? match.kickoffTime.seconds * 1000 : match.kickoffTime
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              )}
            </View>
          </View>

          {/* Equipo visitante */}
          <View style={ls.scoreteam}>
            <Text style={ls.scoreFlag}>{match.awayFlag || '⚽'}</Text>
            <Text style={ls.scoreCode}>
              {(match.awayTeam || '').slice(0, 3).toUpperCase()}
            </Text>
            <Text style={ls.scoreName}>{match.awayTeam}</Text>
          </View>
        </View>

        {/* Feed de eventos */}
        {match.events && match.events.length > 0 && (
          <View style={ls.eventFeed}>
            {match.events.map((e: any, i: number) => (
              <View key={i} style={ls.eventRow}>
                <Text style={ls.eventMin}>{e.minute}'</Text>
                <EventIcon type={e.type} />
                <Text style={ls.eventTxt}>{e.player} — {e.detail || e.type}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

export default function LiveScreen() {
  const { t } = useTranslation();
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  useEffect(() => {
    // Iniciar auto-sync con la API
    startAutoSync();

    // Escuchar cambios en Firestore en tiempo real
    const q = query(collection(db, 'live_matches'));
    const unsub = onSnapshot(q, (snap) => {
      const matches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLiveMatches(matches);
      setLoading(false);
    });

    return () => {
      unsub();
      stopAutoSync();
    };
  }, []);

  if (!fontsLoaded) return <View style={ls.root} />;

  const live = liveMatches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const today = liveMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED');
  const finished = liveMatches.filter(m => m.status === 'FINISHED').slice(-3);

  return (
    <View style={ls.root}>
      <View style={ls.header}>
        <Text style={ls.headerBack}>←</Text>
        <View style={ls.headerCenter}>
          <Text style={ls.headerIcon}>📡</Text>
          <Text style={ls.headerTitle}>{t('live_title')}</Text>
        </View>
        <Text style={ls.headerIcon2}>📈</Text>
      </View>

      <ScrollView contentContainerStyle={ls.scroll} showsVerticalScrollIndicator={false}>

        {/* PARTIDOS EN VIVO */}
        {live.length > 0 && (
          <View>
            <Text style={ls.sectionLabel}>🔴 EN VIVO AHORA</Text>
            {live.map(m => <Scoreboard key={m.id} match={m} />)}
          </View>
        )}

        {/* HOY */}
        {today.length > 0 && (
          <View>
            <Text style={ls.sectionLabel}>{t('live_other_matches')}</Text>
            {today.map((m, i) => (
              <View key={i} style={ls.miniMatch}>
                <View style={ls.miniLeft}>
                  <Text style={ls.miniFlag}>{m.homeFlag || '⚽'}</Text>
                  <Text style={ls.miniTeams}>{m.homeTeam}</Text>
                </View>
                <View style={ls.miniCenter}>
                  <Text style={ls.miniVs}>VS</Text>
                  <Text style={ls.miniTime}>
                    {m.utcDate ? new Date(m.utcDate).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    }) : ''}
                  </Text>
                </View>
                <View style={ls.miniRight}>
                  <Text style={ls.miniTeams}>{m.awayTeam}</Text>
                  <Text style={ls.miniFlag}>{m.awayFlag || '⚽'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* RESULTADOS RECIENTES */}
        {finished.length > 0 && (
          <View>
            <Text style={ls.sectionLabel}>RESULTADOS RECIENTES</Text>
            {finished.map((m, i) => (
              <View key={i} style={ls.miniMatch}>
                <View style={ls.miniLeft}>
                  <Text style={ls.miniFlag}>{m.homeFlag || '⚽'}</Text>
                  <Text style={ls.miniTeams}>{m.homeTeam}</Text>
                </View>
                <View style={ls.miniCenter}>
                  <Text style={ls.miniScore}>{m.homeScore} - {m.awayScore}</Text>
                  <Text style={ls.miniFinished}>FINAL</Text>
                </View>
                <View style={ls.miniRight}>
                  <Text style={ls.miniTeams}>{m.awayTeam}</Text>
                  <Text style={ls.miniFlag}>{m.awayFlag || '⚽'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sin partidos */}
        {!loading && liveMatches.length === 0 && (
          <View style={ls.emptyBox}>
            <Text style={ls.emptyIcon}>📡</Text>
            <Text style={ls.emptyTitle}>SIN PARTIDOS EN VIVO</Text>
            <Text style={ls.emptySub}>Los partidos aparecen automáticamente</Text>
            <Text style={ls.emptySub}>cuando empiecen</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const ls = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:13, paddingTop:48, paddingBottom:10 },
  headerBack:{ fontSize:18, color:C.muted, width:30 },
  headerCenter:{ flexDirection:'row', alignItems:'center', gap:6 },
  headerIcon:{ fontSize:17 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:17, color:C.gold, letterSpacing:2 },
  headerIcon2:{ fontSize:17, width:30, textAlign:'right' },
  scroll:{ paddingHorizontal:10, paddingBottom:40 },
  sectionLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:8, marginTop:8 },

  // Scoreboard
  scoreboard:{ borderRadius:12, overflow:'hidden', marginBottom:10, borderWidth:1, borderColor:C.border2 },
  scoreboardGradient:{ padding:0 },
  scoreTopLine:{ height:3, backgroundColor:C.red },
  scoreVenue:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, textAlign:'center', paddingTop:8, paddingBottom:4 },
  scoreRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, paddingBottom:10, paddingTop:6 },
  scoreteam:{ flex:1, alignItems:'center', gap:3 },
  scoreFlag:{ fontSize:32 },
  scoreCode:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.text, letterSpacing:1 },
  scoreName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:9, color:C.muted, letterSpacing:0.5, textAlign:'center' },
  scoreCenter:{ alignItems:'center', paddingHorizontal:8 },
  scoreDigits:{ fontFamily:'BebasNeue_400Regular', fontSize:48, color:C.text, letterSpacing:4, lineHeight:52 },
  scoreDigitsVs:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.muted, letterSpacing:3 },
  minRow:{ flexDirection:'row', alignItems:'center', gap:4, marginTop:2 },
  minDot:{ width:7, height:7, borderRadius:4, backgroundColor:C.red },
  minTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.red, letterSpacing:1 },
  scheduledTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted },

  // Live badge
  liveBadge:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(232,0,61,0.12)', borderWidth:1, borderColor:'rgba(232,0,61,0.3)', borderRadius:20, alignSelf:'center', paddingHorizontal:10, paddingVertical:3, marginBottom:4 },
  liveDot:{ width:7, height:7, borderRadius:4, backgroundColor:C.red },
  liveTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.red, letterSpacing:1 },

  // Finished badge
  finishedBadge:{ backgroundColor:'rgba(107,122,153,0.15)', borderRadius:20, alignSelf:'center', paddingHorizontal:10, paddingVertical:3, marginBottom:4 },
  finishedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:2 },

  // Event feed
  eventFeed:{ borderTopWidth:1, borderTopColor:C.border2, padding:10, gap:6 },
  eventRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  eventMin:{ fontFamily:'BebasNeue_400Regular', fontSize:13, color:C.gold, width:26 },
  eventTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2, flex:1 },

  // Mini matches
  miniMatch:{ backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:10, padding:10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  miniLeft:{ flex:1, flexDirection:'row', alignItems:'center', gap:6 },
  miniRight:{ flex:1, flexDirection:'row', alignItems:'center', gap:6, justifyContent:'flex-end' },
  miniCenter:{ alignItems:'center', paddingHorizontal:8 },
  miniFlag:{ fontSize:16 },
  miniTeams:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.text },
  miniVs:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.muted },
  miniTime:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.cyan },
  miniScore:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.green },
  miniFinished:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:1 },

  // Empty state
  emptyBox:{ alignItems:'center', paddingTop:60, paddingBottom:40 },
  emptyIcon:{ fontSize:48, marginBottom:12 },
  emptyTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:2, marginBottom:6 },
  emptySub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted, textAlign:'center' },
});