import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { startAutoSync, stopAutoSync } from '../../services/footballApi';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', goldBorder:'rgba(255,215,0,0.25)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
};

function LiveBadge({ minute, label }: { minute?: number | null; label: string }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue:0.2, duration:600, useNativeDriver:true }),
      Animated.timing(pulse, { toValue:1, duration:600, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <View style={s.liveBadge}>
      <Animated.View style={[s.liveDot, { opacity:pulse }]} />
      <Text style={s.liveTxt}>{label}{minute ? ` · ${minute}'` : ''}</Text>
    </View>
  );
}

function Scoreboard({ match, t }: { match: any; t: (k: string) => string }) {
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef({ home:match.homeScore, away:match.awayScore });

  useEffect(() => {
    if (prevScore.current.home !== match.homeScore || prevScore.current.away !== match.awayScore) {
      Animated.sequence([
        Animated.timing(scoreAnim, { toValue:1.4, duration:200, useNativeDriver:true }),
        Animated.timing(scoreAnim, { toValue:0.9, duration:100, useNativeDriver:true }),
        Animated.timing(scoreAnim, { toValue:1, duration:150, useNativeDriver:true }),
      ]).start();
      prevScore.current = { home:match.homeScore, away:match.awayScore };
    }
  }, [match.homeScore, match.awayScore]);

  const isLive     = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  return (
    <View style={s.scoreCard}>
      <LinearGradient
        colors={isLive ? ['rgba(255,51,85,0.15)','transparent'] : ['rgba(255,215,0,0.08)','transparent']}
        start={{x:0.5,y:0}} end={{x:0.5,y:1}}
        style={s.scoreCardGlow}
      />
      <View style={[s.scoreTopLine, { backgroundColor: isLive ? C.red : C.gold }]} />
      <Text style={s.scoreVenue}>{match.venue || match.stadium || 'ESTADIO'} · MUNDIAL 2026</Text>
      {isLive && <LiveBadge minute={match.minute} label={t('live_badge')} />}
      {isFinished && (
        <View style={s.finishedBadge}>
          <Text style={s.finishedTxt}>FINAL</Text>
        </View>
      )}
      <View style={s.scoreRow}>
        <View style={s.scoreTeam}>
          <Image source={{ uri: `https://flagcdn.com/w80/${getFlagCode(match.homeFlag)}.png` }} style={s.scoreFlagImg} resizeMode="contain" />
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
            <LinearGradient colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)']} style={s.vsCircle}>
              <Text style={s.vsTxt}>VS</Text>
            </LinearGradient>
          )}
          {isLive && (
            <View style={{ width:'100%', paddingHorizontal:8, marginTop:8 }}>
              {/* Barra de progreso del partido */}
              <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:6 }}>
                <View style={s.minDot} />
                <Text style={s.minTxt}>{match.minute || '0'}'</Text>
                <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted }}>
                  {(match.minute || 0) <= 45 ? 'PRIMER TIEMPO' : 'SEGUNDO TIEMPO'}
                </Text>
              </View>
              {/* Barra progreso */}
              <View style={{ height:4, backgroundColor:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
                <Animated.View style={{
                  height:4,
                  width:`${Math.min(((match.minute || 0) / 90) * 100, 100)}%`,
                  backgroundColor:C.red,
                  borderRadius:2,
                  shadowColor:C.red,
                  shadowOffset:{width:0,height:0},
                  shadowOpacity:0.8,
                  shadowRadius:4,
                }} />
              </View>
              {/* Marcadores de tiempo */}
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:3 }}>
                <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted }}>0'</Text>
                <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted }}>45'</Text>
                <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted }}>90'</Text>
              </View>
            </View>
          )}
        </View>
        <View style={s.scoreTeam}>
          <Image source={{ uri: `https://flagcdn.com/w80/${getFlagCode(match.awayFlag)}.png` }} style={s.scoreFlagImg} resizeMode="contain" />
          <Text style={s.scoreCode}>{(match.awayTeam||'').slice(0,3).toUpperCase()}</Text>
          <Text style={s.scoreName}>{match.awayTeam}</Text>
        </View>
      </View>
      {match.events && match.events.length > 0 && (
        <View style={s.eventFeed}>
          {match.events.map((e: any, i: number) => (
            <View key={i} style={s.eventRow}>
              <Text style={s.eventMin}>{e.minute}'</Text>
              <Text style={s.eventEmoji}>
                {e.type === 'GOAL' ? '⚽' :
                 e.type === 'YELLOW_CARD' ? '🟨' :
                 e.type === 'RED_CARD' ? '🟥' :
                 e.type === 'SUBSTITUTION' ? '🔄' :
                 e.type === 'PENALTY' ? '🎯' :
                 e.type === 'VAR' ? '📺' : '⚡'}
              </Text>
              <Text style={s.eventTxt} numberOfLines={1}>{e.player}{e.detail ? ` — ${e.detail}` : ''}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function getFlagCode(flag: string): string {
  const codes: Record<string, string> = {
    '🇲🇽':'mx', '🇿🇦':'za', '🇰🇷':'kr', '🇨🇿':'cz',
    '🇨🇦':'ca', '🇧🇦':'ba', '🇶🇦':'qa', '🇨🇭':'ch',
    '🇧🇷':'br', '🇲🇦':'ma', '🇭🇹':'ht', '🇺🇸':'us',
    '🇵🇾':'py', '🇦🇺':'au', '🇹🇷':'tr', '🇩🇪':'de',
    '🇨🇼':'cw', '🇨🇮':'ci', '🇪🇨':'ec', '🇳🇱':'nl',
    '🇯🇵':'jp', '🇹🇳':'tn', '🇸🇪':'se', '🇧🇪':'be',
    '🇪🇬':'eg', '🇮🇷':'ir', '🇳🇿':'nz', '🇪🇸':'es',
    '🇨🇻':'cv', '🇸🇦':'sa', '🇺🇾':'uy', '🇫🇷':'fr',
    '🇸🇳':'sn', '🇳🇴':'no', '🇮🇶':'iq', '🇦🇷':'ar',
    '🇩🇿':'dz', '🇦🇹':'at', '🇯🇴':'jo', '🇵🇹':'pt',
    '🇨🇩':'cd', '🇺🇿':'uz', '🇨🇴':'co', '🇭🇷':'hr',
    '🇬🇭':'gh', '🇵🇦':'pa', '🏴󠁧󠁢󠁳󠁣󠁴󠁿':'gb-sct', '🏴󠁧󠁢󠁥󠁮󠁧󠁿':'gb-eng',
    '🌍':'un',
  };
  return codes[flag] || 'un';
}

export default function LiveScreen() {
  const { t } = useTranslation();
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    return () => { unsub(); stopAutoSync(); };
  }, []);

  if (!fontsLoaded) return <View style={s.root} />;

  const live     = liveMatches.filter(m => m.status==='IN_PLAY' || m.status==='PAUSED');
  const today    = liveMatches.filter(m => m.status==='SCHEDULED' || m.status==='TIMED');
  const finished = liveMatches.filter(m => m.status==='FINISHED').slice(-3);
  const isEmpty  = liveMatches.length === 0;

  const UPCOMING = [
    { home:'🇲🇽', homeCode:'MEX', away:'🇿🇦', awayCode:'RSA', time:'11 Jun · 14:00', stadium:'Estadio Azteca' },
    { home:'🇫🇷', homeCode:'FRA', away:'🇩🇪', awayCode:'GER', time:'11 Jun · 17:00', stadium:'AT&T Stadium' },
    { home:'🇧🇷', homeCode:'BRA', away:'🇦🇷', awayCode:'ARG', time:'11 Jun · 20:00', stadium:'MetLife Stadium' },
    { home:'🇪🇸', homeCode:'ESP', away:'🇵🇹', awayCode:'POR', time:'12 Jun · 15:00', stadium:'Rose Bowl' },
  ];

  return (
    <View style={s.root}>

      {/* HEADER */}
      <LinearGradient colors={['#020408','#05080F']} style={s.header}>
        <View style={s.topLine} />
        <View style={s.headerLeft}>
          <Image
            source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
            style={s.headerLogo} resizeMode="contain"
          />
          <View>
            <Text style={s.headerTitle}>{t('live_title')}</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        {live.length > 0 && (
          <View style={s.liveCountBadge}>
            <Text style={s.liveCountNum}>{live.length}</Text>
            <Text style={s.liveCountLbl}>{t('live_badge')}</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {live.length > 0 && (
          <View>
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={s.sectionLabel}>{t('live_now')}</Text>
            </View>
            {live.map(m => <Scoreboard key={m.id} match={m} t={t} />)}
          </View>
        )}

        {today.length > 0 && (
          <View>
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>{t('live_other_matches')}</Text>
            </View>
            {today.map((m,i) => (
              <LinearGradient key={i} colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']} style={s.miniCard}>
                <View style={s.miniTeamBox}>
                  <Text style={s.miniFlag}>{m.homeFlag || '🌍'}</Text>
                  <Text style={s.miniName}>{m.homeTeam}</Text>
                </View>
                <View style={s.miniCenter}>
                  <Text style={s.miniVs}>VS</Text>
                  <Text style={s.miniTime}>{m.utcDate ? new Date(m.utcDate).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</Text>
                </View>
                <View style={[s.miniTeamBox, { alignItems:'flex-end' }]}>
                  <Text style={s.miniFlag}>{m.awayFlag || '🌍'}</Text>
                  <Text style={s.miniName}>{m.awayTeam}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

        {finished.length > 0 && (
          <View>
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>{t('live_recent')}</Text>
            </View>
            {finished.map((m,i) => (
              <LinearGradient key={i} colors={['rgba(0,255,135,0.06)','rgba(0,255,135,0.01)']} style={[s.miniCard, { borderColor:'rgba(0,255,135,0.15)' }]}>
                <View style={s.miniTeamBox}>
                  <Text style={s.miniFlag}>{m.homeFlag || '🌍'}</Text>
                  <Text style={s.miniName}>{m.homeTeam}</Text>
                </View>
                <View style={s.miniCenter}>
                  <Text style={s.miniScore}>{m.homeScore} - {m.awayScore}</Text>
                  <Text style={s.miniFinal}>FINAL</Text>
                </View>
                <View style={[s.miniTeamBox, { alignItems:'flex-end' }]}>
                  <Text style={s.miniFlag}>{m.awayFlag || '🌍'}</Text>
                  <Text style={s.miniName}>{m.awayTeam}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* EMPTY STATE */}
        {isEmpty && (
          <View style={s.emptyBox}>
            <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.emptyCard}>
              <Image
                source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
                style={s.emptyLogo} resizeMode="contain"
              />
              <Text style={s.emptyTitle}>{t('live_empty_title')}</Text>
              <Text style={s.emptySub}>{t('live_empty_sub')}</Text>
              <View style={s.emptyDivider} />
              <Text style={s.emptyDate}>⚡ {t('live_empty_date')}</Text>
            </LinearGradient>

            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>{t('live_upcoming')}</Text>
            </View>
            {UPCOMING.map((m, i) => (
              <LinearGradient key={i} colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']} style={s.miniCard}>
                <View style={s.miniTeamBox}>
                  <Text style={s.miniFlag}>{m.home}</Text>
                  <Text style={s.miniName}>{m.homeCode}</Text>
                </View>
                <View style={s.miniCenter}>
                  <Text style={s.miniVs}>VS</Text>
                  <Text style={s.miniTime}>{m.time}</Text>
                  <Text style={s.miniStadium}>{m.stadium}</Text>
                </View>
                <View style={[s.miniTeamBox, { alignItems:'flex-end' }]}>
                  <Text style={s.miniFlag}>{m.away}</Text>
                  <Text style={s.miniName}>{m.awayCode}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)' },

  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.15)', position:'relative' },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:10 },
  headerLogo:{ width:36, height:36 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  headerSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, letterSpacing:2 },
  liveCountBadge:{ backgroundColor:'rgba(255,51,85,0.12)', borderRadius:10, borderWidth:1, borderColor:'rgba(255,51,85,0.5)', padding:10, alignItems:'center', shadowColor:'#FF3355', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:6 },
  liveCountNum:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.red },
  liveCountLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.red, letterSpacing:2 },

  scroll:{ paddingHorizontal:12, paddingBottom:40 },

  sectionHeader:{ flexDirection:'row', alignItems:'center', gap:8, marginTop:14, marginBottom:8 },
  sectionDot:{ width:8, height:8, borderRadius:4, backgroundColor:C.red },
  sectionLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3 },

  scoreCard:{ backgroundColor:C.surface2, borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.35)', marginBottom:12, overflow:'hidden', shadowColor:'#FFD700', shadowOffset:{width:0,height:6}, shadowOpacity:0.3, shadowRadius:12, elevation:8 },
  scoreCardGlow:{ position:'absolute', top:0, left:0, right:0, height:80 },
  scoreTopLine:{ height:2 },
  scoreVenue:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, textAlign:'center', paddingTop:10, paddingBottom:6 },

  liveBadge:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,51,85,0.12)', borderWidth:1, borderColor:'rgba(255,51,85,0.3)', borderRadius:20, alignSelf:'center', paddingHorizontal:12, paddingVertical:4, marginBottom:6 },
  liveDot:{ width:8, height:8, borderRadius:4, backgroundColor:C.red },
  liveTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.red, letterSpacing:1 },

  finishedBadge:{ backgroundColor:'rgba(136,136,136,0.1)', borderRadius:20, alignSelf:'center', paddingHorizontal:12, paddingVertical:4, marginBottom:6, borderWidth:1, borderColor:'rgba(136,136,136,0.2)' },
  finishedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:2 },

  scoreRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingBottom:14, paddingTop:4 },
  scoreTeam:{ flex:1, alignItems:'center', gap:6 },
  scoreFlag:{ fontSize:44 },
  scoreCode:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.gold, letterSpacing:2 },
  scoreName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted, textAlign:'center' },
  scoreCenter:{ alignItems:'center', paddingHorizontal:8 },
  scoreBox:{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(255,215,0,0.06)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', paddingHorizontal:16, paddingVertical:10 },
  scoreNum:{ fontFamily:'BebasNeue_400Regular', fontSize:52, color:C.text, lineHeight:56 },
  scoreDash:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.muted },
  vsCircle:{ width:72, height:72, borderRadius:36, borderWidth:2, borderColor:C.goldBorder, alignItems:'center', justifyContent:'center' },
  vsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold },
  minRow:{ flexDirection:'row', alignItems:'center', gap:5, marginTop:6 },
  minDot:{ width:8, height:8, borderRadius:4, backgroundColor:C.red },
  minTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.red, letterSpacing:1 },

  eventFeed:{ borderTopWidth:1, borderTopColor:'rgba(255,215,0,0.1)', padding:12, gap:6 },
  eventRow:{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(255,255,255,0.02)', borderRadius:8, paddingHorizontal:8, paddingVertical:6 },
  eventMin:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.gold, width:28 },
  eventEmoji:{ fontSize:14, width:20, textAlign:'center' },
  eventTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2, flex:1 },

  miniCard:{ borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:14, flexDirection:'row', alignItems:'center', marginBottom:8 },
  miniTeamBox:{ flex:1, alignItems:'flex-start', gap:4 },
  miniFlag:{ fontSize:22 },
  miniName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.text },
  miniCenter:{ alignItems:'center', paddingHorizontal:12 },
  miniVs:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.muted },
  miniTime:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.cyan },
  miniStadium:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, marginTop:2 },
  miniScore:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.green },
  miniFinal:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },

  emptyBox:{ marginTop:20, paddingHorizontal:4 },
  emptyCard:{ borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.35)', padding:32, alignItems:'center', marginBottom:8, shadowColor:'#FFD700', shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:8, elevation:5 },
  emptyLogo:{ width:70, height:70, marginBottom:16 },
  emptyTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold, letterSpacing:3, marginBottom:10 },
  emptySub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, textAlign:'center' },
  emptyDivider:{ width:40, height:1, backgroundColor:'rgba(255,215,0,0.2)', marginVertical:16 },
  emptyDate:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.gold2 },

  scoreFlagImg:{ width:44, height:30 },
});