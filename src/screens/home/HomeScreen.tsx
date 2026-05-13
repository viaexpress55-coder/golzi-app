import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Animated, Image
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
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', gold3:'#FFF8DC',
  goldBorder:'rgba(255,215,0,0.25)', goldBorderLight:'rgba(255,215,0,0.12)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
};

function getMatchCountdown(kickoffTime: any, status?: string): { text: string; isLive: boolean } {
  if (status === 'live' || status === 'IN_PLAY' || status === 'PAUSED') return { text:'EN VIVO', isLive:true };
  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const diff = kickoff.getTime() - Date.now();
  if (diff <= 0 && diff > -7200000) return { text:'EN VIVO', isLive:true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return { text:`${days}d ${hours}h`, isLive:false };
  if (hours > 0) return { text:`${hours}h ${minutes}m`, isLive:false };
  return { text:`${minutes}m`, isLive:false };
}

function getMatchDate(kickoffTime: any, language: string): string {
  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const locale: Record<string,string> = { es:'es-CO', en:'en-US', pt:'pt-BR', fr:'fr-FR', de:'de-DE', it:'it-IT', ru:'ru-RU', ar:'ar-SA', zh:'zh-CN', ja:'ja-JP', ko:'ko-KR', hi:'hi-IN' };
  return kickoff.toLocaleDateString(locale[language] || 'es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
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

function getMatchStats(teamName: string) {
  const stats: Record<string, any> = {
    'México': { win:52, draw:18, form:'G G E G P', goals:'1.8', clean:'42%' },
    'Sudáfrica': { win:28, draw:22, form:'P G P E G', goals:'1.2', clean:'31%' },
    'Corea del Sur': { win:44, draw:20, form:'G E G G P', goals:'1.6', clean:'38%' },
    'Chequia': { win:38, draw:24, form:'E G P G G', goals:'1.4', clean:'35%' },
    'Canadá': { win:42, draw:18, form:'G G E P G', goals:'1.7', clean:'40%' },
    'Brasil': { win:64, draw:18, form:'G G G E G', goals:'2.4', clean:'52%' },
    'Argentina': { win:62, draw:20, form:'G G G G E', goals:'2.2', clean:'48%' },
    'Francia': { win:60, draw:20, form:'G G E G G', goals:'2.1', clean:'45%' },
    'España': { win:58, draw:22, form:'G G G E G', goals:'2.0', clean:'46%' },
    'Alemania': { win:56, draw:20, form:'G E G G P', goals:'1.9', clean:'44%' },
    'Portugal': { win:57, draw:19, form:'G G G P G', goals:'2.0', clean:'43%' },
    'Inglaterra': { win:54, draw:22, form:'G G E G G', goals:'1.8', clean:'44%' },
    'Países Bajos': { win:52, draw:20, form:'G G P G E', goals:'1.9', clean:'41%' },
    'Uruguay': { win:48, draw:22, form:'G E G P G', goals:'1.6', clean:'39%' },
    'Colombia': { win:46, draw:22, form:'G G E G P', goals:'1.7', clean:'38%' },
    'USA': { win:44, draw:20, form:'G E G G P', goals:'1.5', clean:'36%' },
  };
  const def = {
    win: Math.floor(Math.random() * 20) + 30,
    draw: Math.floor(Math.random() * 10) + 18,
    form: 'G E P G E',
    goals: (Math.random() * 0.8 + 1.0).toFixed(1),
    clean: Math.floor(Math.random() * 15 + 25) + '%',
  };
  return stats[teamName] || def;
}

function LiveBadge() {
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
      <Text style={s.liveTxt}>EN VIVO</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string|null>(null);
  const [scores, setScores] = useState<Record<string,[string,string]>>({});
  const [confirmed, setConfirmed] = useState<Record<string,boolean>>({});
  const [, forceUpdate] = useState(0);
  const [showGoal, setShowGoal] = useState(false);
  const [showExact, setShowExact] = useState(false);
  const goalScale    = useRef(new Animated.Value(0)).current;
  const goalOpacity  = useRef(new Animated.Value(0)).current;
  const exactScale   = useRef(new Animated.Value(0)).current;
  const exactOpacity = useRef(new Animated.Value(0)).current;
  const exactShine   = useRef(new Animated.Value(0)).current;

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
        if (api.length > 0) { setMatches(api.map(formatApiMatch)); }
        else {
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
      } finally { setLoading(false); }
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

  function triggerGoalAnimation() {
    setShowGoal(true);
    goalScale.setValue(0); goalOpacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(goalScale, { toValue:1, friction:4, tension:80, useNativeDriver:true }),
        Animated.timing(goalOpacity, { toValue:1, duration:200, useNativeDriver:true }),
      ]),
      Animated.delay(1200),
      Animated.timing(goalOpacity, { toValue:0, duration:400, useNativeDriver:true }),
    ]).start(() => setShowGoal(false));
  }

  function triggerExactAnimation() {
    setShowExact(true);
    exactScale.setValue(0); exactOpacity.setValue(0); exactShine.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(exactScale, { toValue:1, friction:3, tension:100, useNativeDriver:true }),
        Animated.timing(exactOpacity, { toValue:1, duration:300, useNativeDriver:true }),
        Animated.timing(exactShine, { toValue:1, duration:800, useNativeDriver:true }),
      ]),
      Animated.delay(2000),
      Animated.timing(exactOpacity, { toValue:0, duration:500, useNativeDriver:true }),
    ]).start(() => setShowExact(false));
  }

  function playGoalSound() {
    try {
      if (typeof window !== 'undefined') {
        const audio = new (window as any).Audio('https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/assets%2FGol%20Golzi.mp4?alt=media&token=6cd1a1d5-c9a0-49ad-8318-fb21ecc38295');
        audio.volume = 1.0;
        const p = audio.play();
        if (p !== undefined) p.catch(() => {});
      }
    } catch {}
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
    const [home, away] = getScore(id);
    const isExact = home === away;
    if (isExact) {
      triggerExactAnimation();
    } else {
      triggerGoalAnimation();
    }
    playGoalSound();
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={[s.root, { justifyContent:'center', alignItems:'center' }]}>
        <Image source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }} style={{ width:60, height:60, marginBottom:16 }} resizeMode="contain" />
        <ActivityIndicator color={C.gold} size="large" />
        <Text style={{ color:C.muted, marginTop:16, fontSize:13, fontFamily:'BarlowCondensed_400Regular' }}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>

      {/* WOW Exact overlay */}
      {showExact && (
        <Animated.View style={[s.exactOverlay, { opacity: exactOpacity }]}>
          <Animated.Text style={[s.exactStar, { transform:[{ scale: exactScale }] }]}>⭐</Animated.Text>
          <Animated.Text style={[s.exactTitle, { transform:[{ scale: exactScale }] }]}>¡MARCADOR EXACTO!</Animated.Text>
          <Animated.Text style={[s.exactPts, { transform:[{ scale: exactScale }] }]}>+10 PTS</Animated.Text>
          <Animated.Text style={[s.exactSub, { transform:[{ scale: exactScale }] }]}>¡Eres un crack Golzair! 🔥</Animated.Text>
        </Animated.View>
      )}

      {/* Goal overlay */}
      {showGoal && (
        <Animated.View style={[s.goalOverlay, { opacity: goalOpacity }]}>
          <Animated.Text style={[s.goalEmoji, { transform:[{ scale: goalScale }] }]}>⚽</Animated.Text>
          <Animated.Text style={[s.goalTxt, { transform:[{ scale: goalScale }] }]}>¡PREDICCIÓN GUARDADA!</Animated.Text>
          <Animated.Text style={[s.goalPts, { transform:[{ scale: goalScale }] }]}>+10 PTS</Animated.Text>
        </Animated.View>
      )}

      {/* HEADER */}
      <LinearGradient colors={['#020408','#05080F']} style={s.header}>
        <View style={s.topLine} />
        <View style={s.headerLeft}>
          <Image source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }} style={s.headerLogo} resizeMode="contain" />
          <View>
            <Text style={s.headerTitle}>PREDICTOR</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        <TouchableOpacity style={s.bellBtn}>
          <Text style={{ fontSize:18 }}>🔔</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* STATS BANNER */}
        <LinearGradient
          colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']}
          start={{x:0,y:0}} end={{x:1,y:0}}
          style={s.statsBanner}
        >
          <View style={s.statsBannerGlow} />
          {[
            { val:matches.length, lbl:t('home_matches') },
            { val:104, lbl:t('home_total') },
            { val:35, lbl:t('home_days') },
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
          const cd = getMatchCountdown(m.kickoffTime, m.status);
          const isSelected  = selected === m.id;
          const isConfirmed = confirmed[m.id];

          return (
            <View key={m.id} style={s.card}>
              <LinearGradient
                colors={isConfirmed ? ['#00FF87','#00C853'] : cd.isLive ? ['#FF3355','#FF0040'] : ['#FFD700','#FFA500']}
                start={{x:0,y:0}} end={{x:1,y:0}}
                style={s.cardTopLine}
              />
              <LinearGradient
                colors={['rgba(255,215,0,0.06)','transparent']}
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

              {/* TEAMS */}
              <View style={s.teamsRow}>
                <View style={s.teamBox}>
                  <Image source={{ uri: `https://flagcdn.com/w80/${getFlagCode(m.homeFlag)}.png` }} style={s.teamFlagImg} resizeMode="contain" />
                  <Text style={s.teamCode}>{(m.homeTeam||'').slice(0,3).toUpperCase()}</Text>
                  <Text style={s.teamName} numberOfLines={1}>{m.homeTeam}</Text>
                </View>
                <View style={s.centerBox}>
                  {isConfirmed ? (
                    <LinearGradient colors={['rgba(0,255,135,0.15)','rgba(0,255,135,0.05)']} style={s.confirmedBox}>
                      <Text style={s.confirmedNum}>{getScore(m.id)[0]}</Text>
                      <Text style={s.confirmedDash}>-</Text>
                      <Text style={s.confirmedNum}>{getScore(m.id)[1]}</Text>
                    </LinearGradient>
                  ) : isSelected ? (
                    <View style={s.inputRow}>
                      <TextInput style={s.scoreInput} value={getScore(m.id)[0]} onChangeText={v => setScore(m.id, 0, v)} keyboardType="numeric" maxLength={2} />
                      <Text style={s.inputDash}>-</Text>
                      <TextInput style={s.scoreInput} value={getScore(m.id)[1]} onChangeText={v => setScore(m.id, 1, v)} keyboardType="numeric" maxLength={2} />
                    </View>
                  ) : (
                    <LinearGradient colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)']} style={s.vsCircle}>
                      <Text style={s.vsTxt}>VS</Text>
                    </LinearGradient>
                  )}
                </View>
                <View style={s.teamBox}>
                  <Image source={{ uri: `https://flagcdn.com/w80/${getFlagCode(m.awayFlag)}.png` }} style={s.teamFlagImg} resizeMode="contain" />
                  <Text style={s.teamCode}>{(m.awayTeam||'').slice(0,3).toUpperCase()}</Text>
                  <Text style={s.teamName} numberOfLines={1}>{m.awayTeam}</Text>
                </View>
              </View>

              {/* TRAZABILIDAD EN VIVO */}
              {cd.isLive && (
                <View style={s.timelineBox}>
                  <View style={s.timelineHeader}>
                    <Text style={s.timelineTitle}>⚡ EVENTOS DEL PARTIDO</Text>
                    <Text style={s.timelineMinute}>{m.minute || 0}'</Text>
                  </View>
                  <View style={s.timelineTrack}>
                    <View style={s.timelineBg} />
                    <View style={[s.timelineProgress, { flex: (m.minute || 0) / 90 }]} />
                  </View>
                  <View style={s.timelineLabels}>
                    {[0, 15, 30, 45, 60, 75, 90].map(min => (
                      <Text key={min} style={s.timelineLabel}>{min}'</Text>
                    ))}
                  </View>
                  <View style={s.timelineEventsRow}>
                    {[
                      { icon:'⚽', min:"23'" },
                      { icon:'🟨', min:"41'" },
                      { icon:'🔄', min:"58'" },
                    ].map((ev, i) => (
                      <View key={i} style={s.timelineEventItem}>
                        <Text style={s.timelineEventIcon}>{ev.icon}</Text>
                        <Text style={s.timelineEventMin}>{ev.min}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.timelineScoreRow}>
                    <Text style={s.timelineScore}>{m.homeScore ?? 0} - {m.awayScore ?? 0}</Text>
                    <Text style={s.timelineScoreLbl}>MARCADOR EN VIVO</Text>
                  </View>
                </View>
              )}

              {/* ANÁLISIS DEL PARTIDO */}
              {isSelected && (
                <View style={s.analysisBox}>
                  <View style={s.analysisHeader}>
                    <Text style={s.analysisTitleTxt}>📊 ANÁLISIS DEL PARTIDO</Text>
                    <Text style={s.analysisDisclaimer}>Datos históricos · No es predicción</Text>
                  </View>
                  <View style={s.analysisRow}>
                    <View style={s.analysisSide}>
                      <Text style={s.analysisTeam}>{(m.homeTeam||'').slice(0,3).toUpperCase()}</Text>
                      <Text style={s.analysisPct}>{getMatchStats(m.homeTeam).win}%</Text>
                      <Text style={s.analysisPctLbl}>VICTORIA</Text>
                    </View>
                    <View style={s.analysisCenter}>
                      <Text style={s.analysisDraw}>{getMatchStats(m.homeTeam).draw}%</Text>
                      <Text style={s.analysisPctLbl}>EMPATE</Text>
                    </View>
                    <View style={s.analysisSide}>
                      <Text style={s.analysisTeam}>{(m.awayTeam||'').slice(0,3).toUpperCase()}</Text>
                      <Text style={s.analysisPct}>{getMatchStats(m.awayTeam).win}%</Text>
                      <Text style={s.analysisPctLbl}>VICTORIA</Text>
                    </View>
                  </View>
                  <View style={s.analysisBars}>
                    <View style={[s.analysisBar, { width:`${getMatchStats(m.homeTeam).win}%`, backgroundColor:C.gold }]} />
                    <View style={[s.analysisBar, { width:`${getMatchStats(m.homeTeam).draw}%`, backgroundColor:C.muted }]} />
                    <View style={[s.analysisBar, { width:`${getMatchStats(m.awayTeam).win}%`, backgroundColor:C.cyan }]} />
                  </View>
                  <View style={s.analysisStats}>
                    {[
                      { lbl:'FORMA', home: getMatchStats(m.homeTeam).form, away: getMatchStats(m.awayTeam).form },
                      { lbl:'GOLES/PJ', home: getMatchStats(m.homeTeam).goals, away: getMatchStats(m.awayTeam).goals },
                      { lbl:'SIN GOLES', home: getMatchStats(m.homeTeam).clean, away: getMatchStats(m.awayTeam).clean },
                    ].map((st, i) => (
                      <View key={i} style={s.analysisStatRow}>
                        <Text style={s.analysisStatVal}>{st.home}</Text>
                        <Text style={s.analysisStatLbl}>{st.lbl}</Text>
                        <Text style={s.analysisStatVal}>{st.away}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Date */}
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

              {/* Button */}
              {m.status !== 'finished' && (
                <TouchableOpacity style={s.predictBtn} onPress={() => isSelected ? confirm(m.id) : setSelected(m.id)} activeOpacity={0.85}>
                  <LinearGradient
                    colors={isConfirmed ? ['#00FF87','#00C853'] : isSelected ? [C.gold, C.gold2] : ['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)']}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.predictBtnInner}
                  >
                    <Text style={[s.predictBtnTxt, { color: isConfirmed || isSelected ? '#000' : C.gold }]}>
                      {isConfirmed ? `✔  ${t('home_sent')}` : isSelected ? `⚡  ${t('home_confirm')}` : `⚡  ${t('home_predict')}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* POINTS GUIDE */}
        <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.ptsGuide}>
          <Text style={s.ptsGuideTitle}>{t('home_points')}</Text>
          <View style={s.ptsRow}>
            {[
              { v:'+10', l:t('home_exact'), c:C.gold },
              { v:'+5', l:t('home_winner'), c:C.gold2 },
              { v:'+2', l:t('home_draw'), c:C.muted2 },
            ].map((p,i) => (
              <LinearGradient key={i} colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']} style={s.ptsCard}>
                <Text style={[s.ptsVal,{ color:p.c }]}>{p.v}</Text>
                <Text style={s.ptsLbl}>{p.l}</Text>
              </LinearGradient>
            ))}
          </View>
        </LinearGradient>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)' },

  exactOverlay:{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(2,4,8,0.95)', alignItems:'center', justifyContent:'center', zIndex:1000 },
  exactStar:{ fontSize:80, marginBottom:10 },
  exactTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:36, color:C.gold, letterSpacing:4, marginBottom:8, textAlign:'center' },
  exactPts:{ fontFamily:'BebasNeue_400Regular', fontSize:72, color:C.gold, letterSpacing:4, lineHeight:76 },
  exactSub:{ fontFamily:'BarlowCondensed_700Bold', fontSize:18, color:C.green, letterSpacing:2, marginTop:8 },

  goalOverlay:{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.88)', alignItems:'center', justifyContent:'center', zIndex:999 },
  goalEmoji:{ fontSize:100, marginBottom:16 },
  goalTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:4, marginBottom:8 },
  goalPts:{ fontFamily:'BebasNeue_400Regular', fontSize:52, color:C.green, letterSpacing:4 },

  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.15)', position:'relative' },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:10 },
  headerLogo:{ width:36, height:36 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  headerSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, letterSpacing:2 },
  bellBtn:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.05)', alignItems:'center', justifyContent:'center' },

  statsBanner:{ flexDirection:'row', marginHorizontal:12, marginTop:12, marginBottom:8, borderRadius:16, borderWidth:1, borderColor:C.goldBorder, padding:14, alignItems:'center', justifyContent:'space-around', overflow:'hidden' },
  statsBannerGlow:{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(255,215,0,0.03)' },
  statItem:{ alignItems:'center' },
  statVal:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold },
  statLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, marginTop:2 },
  statDivider:{ width:1, height:36, backgroundColor:'rgba(255,215,0,0.2)' },
  scroll:{ paddingBottom:40 },

  card:{ marginHorizontal:12, marginBottom:10, backgroundColor:C.surface2, borderRadius:18, borderWidth:1, borderColor:C.goldBorderLight, overflow:'hidden' },
  cardTopLine:{ height:2 },
  cardGlow:{ position:'absolute', top:0, left:0, right:0, height:80, zIndex:0 },
  cardHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingTop:12, paddingBottom:6, zIndex:1 },
  cardHeaderLeft:{ flexDirection:'row', alignItems:'center', gap:8, flex:1 },
  groupPill:{ backgroundColor:'rgba(255,215,0,0.12)', borderRadius:6, borderWidth:1, borderColor:C.goldBorder, paddingHorizontal:8, paddingVertical:3 },
  groupPillTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:12, color:C.gold, letterSpacing:1 },
  stadiumTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, flex:1 },
  countdownPill:{ backgroundColor:'rgba(255,215,0,0.08)', borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', paddingHorizontal:10, paddingVertical:4 },
  countdownTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.gold },

  liveBadge:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(255,51,85,0.12)', borderWidth:1, borderColor:'rgba(255,51,85,0.35)', borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  liveDot:{ width:7, height:7, borderRadius:4, backgroundColor:C.red },
  liveTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.red, letterSpacing:1 },

  teamsRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:14, zIndex:1 },
  teamBox:{ flex:1, alignItems:'center', gap:6 },
  teamFlag:{ fontSize:44 },
  teamFlagImg:{ width:56, height:40, borderRadius:4 },
  teamCode:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.gold, letterSpacing:2 },
  teamName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2, textAlign:'center' },

  centerBox:{ alignItems:'center', justifyContent:'center', paddingHorizontal:8, width:84 },
  vsCircle:{ width:68, height:68, borderRadius:34, borderWidth:2, borderColor:C.goldBorder, alignItems:'center', justifyContent:'center' },
  vsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold },
  inputRow:{ flexDirection:'row', alignItems:'center', gap:4 },
  scoreInput:{ width:50, height:50, backgroundColor:'rgba(255,215,0,0.1)', borderWidth:2, borderColor:C.gold, borderRadius:10, color:C.gold, fontFamily:'BebasNeue_400Regular', fontSize:28, textAlign:'center' } as any,
  inputDash:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted },
  confirmedBox:{ flexDirection:'row', alignItems:'center', gap:6, borderRadius:12, paddingHorizontal:14, paddingVertical:12, borderWidth:1, borderColor:'rgba(0,255,135,0.25)' },
  confirmedNum:{ fontFamily:'BebasNeue_400Regular', fontSize:34, color:C.green },
  confirmedDash:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.green },

  dateRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingBottom:10, zIndex:1 },
  dateTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted },
  ptsPill:{ backgroundColor:'rgba(0,255,135,0.1)', borderWidth:1, borderColor:'rgba(0,255,135,0.3)', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  ptsPillTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.green, letterSpacing:1 },

  predictBtn:{ marginHorizontal:14, marginBottom:14, zIndex:1, borderRadius:12, overflow:'hidden' },
  predictBtnInner:{ borderRadius:12, paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  predictBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:3 },

  // Timeline
  timelineBox:{ marginHorizontal:14, marginBottom:10, backgroundColor:'rgba(255,51,85,0.05)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,51,85,0.2)', padding:12 },
  timelineHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  timelineTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.red, letterSpacing:1 },
  timelineMinute:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.red },
  timelineTrack:{ height:6, borderRadius:3, backgroundColor:'rgba(255,255,255,0.08)', flexDirection:'row', marginBottom:6, overflow:'hidden' },
  timelineBg:{ position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor:'rgba(255,255,255,0.06)' },
  timelineProgress:{ backgroundColor:C.red, borderRadius:3 },
  timelineLabels:{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  timelineLabel:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },
  timelineEventsRow:{ flexDirection:'row', gap:16, marginBottom:8 },
  timelineEventItem:{ alignItems:'center', gap:2 },
  timelineEventIcon:{ fontSize:16 },
  timelineEventMin:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },
  timelineScoreRow:{ flexDirection:'row', alignItems:'center', gap:10, marginTop:4 },
  timelineScore:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.red },
  timelineScoreLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },

  // Analysis
  analysisBox:{ marginHorizontal:14, marginBottom:10, backgroundColor:'rgba(0,198,255,0.05)', borderRadius:12, borderWidth:1, borderColor:'rgba(0,198,255,0.2)', padding:12 },
  analysisHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  analysisTitleTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.cyan, letterSpacing:1 },
  analysisDisclaimer:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },
  analysisRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  analysisSide:{ flex:1, alignItems:'center' },
  analysisCenter:{ alignItems:'center', paddingHorizontal:12 },
  analysisTeam:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.muted2, letterSpacing:1, marginBottom:2 },
  analysisPct:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, lineHeight:32 },
  analysisDraw:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.muted2, lineHeight:32 },
  analysisPctLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2, marginTop:2 },
  analysisBars:{ flexDirection:'row', height:4, borderRadius:2, overflow:'hidden', marginBottom:10, gap:2 },
  analysisBar:{ height:4, borderRadius:2 },
  analysisStats:{ gap:6 },
  analysisStatRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  analysisStatVal:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.muted2, width:60 },
  analysisStatLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2, textAlign:'center' },

  ptsGuide:{ marginHorizontal:12, marginTop:4, borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:14 },
  ptsGuideTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:10 },
  ptsRow:{ flexDirection:'row', gap:8 },
  ptsCard:{ flex:1, borderRadius:10, padding:10, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.1)' },
  ptsVal:{ fontFamily:'BebasNeue_400Regular', fontSize:22 },
  ptsLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted, textAlign:'center', marginTop:2 },
});