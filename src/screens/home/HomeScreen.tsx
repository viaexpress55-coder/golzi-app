import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Animated, Image, Modal,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, orderBy, query, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { savePrediction } from '../../services/auth';
import { getAuth } from 'firebase/auth';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular, Barlow_500Medium } from '@expo-google-fonts/barlow';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import { getUpcomingMatches, getLiveMatches, formatApiMatch, refreshMatches } from '../../services/footballApi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import ShareCard from '../../components/ShareCard';
import GlowCard from '../../components/GlowCard';
import { useShareCard } from '../../hooks/useShareCard';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', gold3:'#FFF8DC',
  goldBorder:'rgba(255,215,0,0.25)', goldBorderLight:'rgba(255,215,0,0.12)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
  purple:'#A855F7',
};

// ─── RETOS RÁPIDOS ────────────────────────────────────────────────────────────
const RETOS_GRUPOS = [
  { id:'first_goal', label:'¿Quién marca primero?',  type:'team', pts:15, icon:'⚽' },
  { id:'over_goals', label:'¿Más de 2.5 goles?',    type:'yn',   pts:8,  icon:'🎯' },
  { id:'red_card',   label:'¿Habrá tarjeta roja?',  type:'yn',   pts:8,  icon:'🟥' },
  { id:'ht_result',  label:'¿Resultado al descanso?',type:'1x2',  pts:12, icon:'⏱' },
];
const RETOS_ELIMINATORIA = [
  ...RETOS_GRUPOS,
  { id:'penalty', label:'¿Habrá penalti?', type:'yn', pts:10, icon:'🎽' },
];

function getRetosForMatch(phase?: string) {
  const elim = ['round_of_16','quarterfinal','semifinal','final','third_place'];
  return elim.includes(phase ?? '') ? RETOS_ELIMINATORIA : RETOS_GRUPOS;
}

function AnimatedBorder({ children, style }: { children: React.ReactNode; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue:1, duration:3000, useNativeDriver:false })
    ).start();
  }, []);
  const translateX = anim.interpolate({ inputRange:[0,1], outputRange:[-400, 400] });
  return (
    <View style={[style, { position:'relative' }]}>
      {/* Línea animada top */}
      <View style={{ position:'absolute', top:0, left:0, right:0, height:2, overflow:'hidden', zIndex:10, borderTopLeftRadius:18, borderTopRightRadius:18 }}>
        <Animated.View style={{ position:'absolute', top:0, height:2, width:200, transform:[{ translateX }] }}>
          <LinearGradient colors={['transparent','#FFD700','#FF3355','#FFD700','transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={{ height:2, width:200 }} />
        </Animated.View>
      </View>
      {/* Línea animada bottom */}
      <View style={{ position:'absolute', bottom:0, left:0, right:0, height:2, overflow:'hidden', zIndex:10, borderBottomLeftRadius:18, borderBottomRightRadius:18 }}>
        <Animated.View style={{ position:'absolute', bottom:0, height:2, width:200, transform:[{ translateX }] }}>
          <LinearGradient colors={['transparent','#FFD700','#FF3355','#FFD700','transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={{ height:2, width:200 }} />
        </Animated.View>
      </View>
      {/* Línea animada left */}
      <View style={{ position:'absolute', top:0, left:0, bottom:0, width:2, overflow:'hidden', zIndex:10, borderTopLeftRadius:18, borderBottomLeftRadius:18 }}>
        <Animated.View style={{ position:'absolute', left:0, width:2, height:200, transform:[{ translateY: translateX }] }}>
          <LinearGradient colors={['transparent','#FFD700','#FF3355','#FFD700','transparent']} start={{x:0,y:0}} end={{x:0,y:1}} style={{ width:2, height:200 }} />
        </Animated.View>
      </View>
      {/* Línea animada right */}
      <View style={{ position:'absolute', top:0, right:0, bottom:0, width:2, overflow:'hidden', zIndex:10, borderTopRightRadius:18, borderBottomRightRadius:18 }}>
        <Animated.View style={{ position:'absolute', right:0, width:2, height:200, transform:[{ translateY: translateX }] }}>
          <LinearGradient colors={['transparent','#FFD700','#FF3355','#FFD700','transparent']} start={{x:0,y:0}} end={{x:0,y:1}} style={{ width:2, height:200 }} />
        </Animated.View>
      </View>
      {children}
    </View>
  );
}

function RetoCard({ reto, match, userPlan, answer, onAnswer, saved, navigation }: any) {
  const isPaid = userPlan !== 'free';
  const options = reto.type === 'yn'
    ? [{ val:'yes', label:'SÍ' }, { val:'no', label:'NO' }]
    : reto.type === '1x2'
    ? [{ val:'1', label:'LOCAL' }, { val:'x', label:'EMPATE' }, { val:'2', label:'VISITA' }]
    : [
        { val:'home', label:(match.homeTeam||'LOC').slice(0,3).toUpperCase() },
        { val:'none', label:'NINGUNO' },
        { val:'away', label:(match.awayTeam||'VIS').slice(0,3).toUpperCase() },
      ];

  return (
    <View style={rs.retoCard}>
      <View style={rs.retoHeader}>
        <Text style={rs.retoIcon}>{reto.icon}</Text>
        <Text style={rs.retoLabel}>{reto.label}</Text>
        <View style={rs.retoPtsBadge}><Text style={rs.retoPtsTxt}>+{reto.pts}</Text></View>
      </View>
      {!isPaid ? (
        <TouchableOpacity style={rs.paywall} onPress={() => navigation.navigate('Plans')} activeOpacity={0.85}>
          <LinearGradient colors={[C.purple+'22', C.purple+'08']} style={rs.paywallInner}>
            <Text style={rs.paywallLock}>🔒</Text>
            <Text style={rs.paywallTxt}>GOLZAIR+ para participar</Text>
            <View style={rs.paywallBtn}><Text style={rs.paywallBtnTxt}>DESBLOQUEAR — $1.99</Text></View>
          </LinearGradient>
        </TouchableOpacity>
      ) : saved && answer ? (
        <View style={rs.savedRow}>
          <Text style={rs.savedCheck}>✓</Text>
          <Text style={rs.savedTxt}>{options.find(o => o.val === answer)?.label ?? answer}</Text>
          <Text style={rs.savedPts}>+{reto.pts} pts si aciertas</Text>
        </View>
      ) : (
        <View style={rs.optionsRow}>
          {options.map(opt => (
            <TouchableOpacity key={opt.val} style={[rs.optionBtn, answer === opt.val && rs.optionBtnSelected]} onPress={() => onAnswer(reto.id, opt.val)} activeOpacity={0.8}>
              <Text style={[rs.optionTxt, answer === opt.val && rs.optionTxtSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const rs = StyleSheet.create({
  retoCard:{ backgroundColor:'rgba(168,85,247,0.06)', borderRadius:12, borderWidth:1, borderColor:'rgba(168,85,247,0.2)', padding:12, marginBottom:8 },
  retoHeader:{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
  retoIcon:{ fontSize:16 }, retoLabel:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:'#E9D5FF', flex:1 },
  retoPtsBadge:{ backgroundColor:'rgba(168,85,247,0.2)', borderRadius:20, paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:'rgba(168,85,247,0.4)' },
  retoPtsTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:'#C084FC' },
  paywall:{ borderRadius:10, overflow:'hidden' },
  paywallInner:{ padding:12, alignItems:'center', gap:6, borderRadius:10, borderWidth:1, borderColor:'rgba(168,85,247,0.25)' },
  paywallLock:{ fontSize:20 }, paywallTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#C084FC' },
  paywallBtn:{ backgroundColor:'rgba(168,85,247,0.3)', borderRadius:20, paddingHorizontal:16, paddingVertical:6, borderWidth:1, borderColor:'rgba(168,85,247,0.5)' },
  paywallBtnTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:'#E9D5FF', letterSpacing:1 },
  optionsRow:{ flexDirection:'row', gap:8 },
  optionBtn:{ flex:1, paddingVertical:10, borderRadius:10, backgroundColor:'rgba(255,255,255,0.05)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  optionBtnSelected:{ backgroundColor:'rgba(168,85,247,0.25)', borderColor:'rgba(168,85,247,0.6)' },
  optionTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:'#9B7AC4', letterSpacing:1 },
  optionTxtSelected:{ color:'#E9D5FF' },
  savedRow:{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:8 },
  savedCheck:{ fontSize:18, color:'#00FF87' }, savedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#E9D5FF', flex:1 },
  savedPts:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:'#A855F7' },
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getMatchCountdown(kickoffTime: any, status?: string): { text: string; isLive: boolean; isToday: boolean } {
  if (status === 'live' || status === 'IN_PLAY' || status === 'PAUSED') return { text:'EN VIVO', isLive:true, isToday:true };
  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const diff = kickoff.getTime() - Date.now();
  if (diff <= 0 && diff > -7200000) return { text:'EN VIVO', isLive:true, isToday:true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  // Es hoy si faltan menos de 24 horas
  const isToday = diff > 0 && diff < 86400000;
  if (days > 0) return { text:`${days}d ${hours}h`, isLive:false, isToday:false };
  if (hours > 0) return { text:`${hours}h ${minutes}m`, isLive:false, isToday };
  return { text:`${minutes}m`, isLive:false, isToday:true };
}

function getMatchDate(kickoffTime: any, language: string): string {
  const kickoff = new Date(kickoffTime?.seconds ? kickoffTime.seconds * 1000 : kickoffTime);
  const locale: Record<string,string> = { es:'es-CO', en:'en-US', pt:'pt-BR', fr:'fr-FR', de:'de-DE', it:'it-IT', ru:'ru-RU', ar:'ar-SA', zh:'zh-CN', ja:'ja-JP', ko:'ko-KR', hi:'hi-IN' };
  return kickoff.toLocaleDateString(locale[language] || 'es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
}

function getFlagCode(flag: string): string {
  const codes: Record<string, string> = {
    '🇲🇽':'mx','🇿🇦':'za','🇰🇷':'kr','🇨🇿':'cz','🇨🇦':'ca','🇧🇦':'ba',
    '🇶🇦':'qa','🇨🇭':'ch','🇧🇷':'br','🇲🇦':'ma','🇭🇹':'ht','🇺🇸':'us',
    '🇵🇾':'py','🇦🇺':'au','🇹🇷':'tr','🇩🇪':'de','🇨🇼':'cw','🇨🇮':'ci',
    '🇪🇨':'ec','🇳🇱':'nl','🇯🇵':'jp','🇹🇳':'tn','🇸🇪':'se','🇧🇪':'be',
    '🇪🇬':'eg','🇮🇷':'ir','🇳🇿':'nz','🇪🇸':'es','🇨🇻':'cv','🇸🇦':'sa',
    '🇺🇾':'uy','🇫🇷':'fr','🇸🇳':'sn','🇳🇴':'no','🇮🇶':'iq','🇦🇷':'ar',
    '🇩🇿':'dz','🇦🇹':'at','🇯🇴':'jo','🇵🇹':'pt','🇨🇩':'cd','🇺🇿':'uz',
    '🇨🇴':'co','🇭🇷':'hr','🇬🇭':'gh','🇵🇦':'pa','🏴󠁧󠁢󠁳󠁣󠁴󠁿':'gb-sct','🏴󠁧󠁢󠁥󠁮󠁧󠁿':'gb-eng','🌍':'un',
  };
  return codes[flag] || 'un';
}

function getMatchStats(teamName: string) {
  const stats: Record<string, any> = {
    'México':{ win:52, draw:18, form:'G G E G P', goals:'1.8', clean:'42%' },
    'Brasil':{ win:64, draw:18, form:'G G G E G', goals:'2.4', clean:'52%' },
    'Argentina':{ win:62, draw:20, form:'G G G G E', goals:'2.2', clean:'48%' },
    'Francia':{ win:60, draw:20, form:'G G E G G', goals:'2.1', clean:'45%' },
    'España':{ win:58, draw:22, form:'G G G E G', goals:'2.0', clean:'46%' },
    'Alemania':{ win:56, draw:20, form:'G E G G P', goals:'1.9', clean:'44%' },
    'Portugal':{ win:57, draw:19, form:'G G G P G', goals:'2.0', clean:'43%' },
    'Inglaterra':{ win:54, draw:22, form:'G G E G G', goals:'1.8', clean:'44%' },
    'Colombia':{ win:46, draw:22, form:'G G E G P', goals:'1.7', clean:'38%' },
    'USA':{ win:44, draw:20, form:'G E G G P', goals:'1.5', clean:'36%' },
  };
  const def = { win:Math.floor(Math.random()*20)+30, draw:Math.floor(Math.random()*10)+18, form:'G E P G E', goals:(Math.random()*0.8+1.0).toFixed(1), clean:Math.floor(Math.random()*15+25)+'%' };
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

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();

  const [matches, setMatches]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState<string|null>(null);
  const [scores, setScores]         = useState<Record<string,[string,string]>>({});
  const [confirmed, setConfirmed]   = useState<Record<string,boolean>>({});
  const [, forceUpdate]             = useState(0);
  const [showGoal, setShowGoal]     = useState(false);
  const [showExact, setShowExact]   = useState(false);
  const [userPlan, setUserPlan]     = useState<string>('free');
  const [userData, setUserData]     = useState<any>(null);

  // Retos
  const [showRetos, setShowRetos]       = useState<Record<string,boolean>>({});
  const [retoAnswers, setRetoAnswers]   = useState<Record<string,Record<string,string>>>({});
  const [retosSaved, setRetosSaved]     = useState<Record<string,boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMatch, setConfirmMatch]         = useState<any>(null);

  // ShareCard
  const { cardRef, shareCard }          = useShareCard();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareMatch, setShareMatch]     = useState<any>(null);

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
    const user = getAuth().currentUser;
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const planValue = snap.data()?.plan ?? 'free';
console.log('Plan cargado:', planValue, 'UID:', user.uid);
setUserPlan(planValue);
        setUserData(snap.data());
      }
    });
  }, []);

  useEffect(() => {
    loadMatches();
    const timer = setInterval(() => forceUpdate(n => n+1), 60000);
    return () => clearInterval(timer);
  }, []);

  async function loadMatches(forceRefresh = false) {
    try {
      if (forceRefresh) await refreshMatches();

      // PASO 1: Cargar Firestore primero — instantáneo
      try {
        const q = query(collection(db, 'matches'), orderBy('kickoffTime'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setMatches(snap.docs.map(d => ({ id:d.id, ...d.data() })));
          setLoading(false); // mostrar UI inmediatamente

          // Cargar predicciones después de matches
          const user = getAuth().currentUser;
          if (user) {
            try {
              const predSnap = await getDocs(
                query(collection(db, 'predictions'), where('userId', '==', user.uid))
              );
              console.log('📦 Predicciones encontradas:', predSnap.docs.length);
              const savedScores: Record<string, [string, string]> = {};
              const savedConfirmed: Record<string, boolean> = {};
              predSnap.docs.forEach(d => {
                const data = d.data();
                savedScores[data.matchId] = [String(data.homeScore), String(data.awayScore)];
                savedConfirmed[data.matchId] = true;
              });
              setScores(prev => ({ ...prev, ...savedScores }));
              setConfirmed(prev => ({ ...prev, ...savedConfirmed }));
            } catch (e) {
              console.error('Error cargando predicciones:', e);
            }
          }
        }
      } catch {}

      // PASO 2: Actualizar con API en background
      try {
        const [live, upcoming] = await Promise.all([getLiveMatches(), getUpcomingMatches(8)]);
        const api = [...live, ...upcoming];
        if (api.length > 0) {
          setMatches(api.map(formatApiMatch));
        }
      } catch {}

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadMatches(true);
  }

  function getScore(id:string):[string,string] { return scores[id]||['','']; }
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
    const match = matches.find(m => m.id === id);
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
    if (home !== '' && away !== '' && home === away) {
      triggerExactAnimation();
    } else {
      triggerGoalAnimation();
    }
    playGoalSound();
    // Mostrar modal de compartir después de 1.5s
    if (match) {
      setTimeout(() => {
        setShareMatch(match);
        setShareModalVisible(true);
      }, 1800);
    }
  }

  async function saveRetos(matchId: string) {
    const user = getAuth().currentUser;
    if (!user) return;
    const answers = retoAnswers[matchId] ?? {};
    if (Object.keys(answers).length === 0) return;
    // Verificar que el partido no haya comenzado
    const match = matches.find(m => m.id === matchId);
    if (match?.kickoffTime) {
      const kickoff = new Date(match.kickoffTime?.seconds ? match.kickoffTime.seconds * 1000 : match.kickoffTime);
      if (new Date() >= kickoff) {
        console.log('Retos bloqueados - partido ya inició');
        return;
      }
    }

    try {
      await setDoc(doc(db, 'quick_challenges', `${user.uid}_${matchId}`), {
        userId: user.uid, matchId, answers,
        savedAt: new Date(), status: 'pending', pointsEarned: 0,
      });
      setRetosSaved(prev => ({ ...prev, [matchId]: true }));
    } catch (e) { console.error('Error guardando retos:', e); }
  }

  function handleRetoAnswer(matchId: string, retoId: string, value: string) {
    setRetoAnswers(prev => ({ ...prev, [matchId]: { ...(prev[matchId] ?? {}), [retoId]: value } }));
  }

  // Compartir tarjeta
  async function handleShare() {
    await shareCard({
      message: `⚽ ¡Mira mi predicción GOLZI — Mundial 2026!\n¿Puedes superarme? 👉 golzi.app`,
    });
    setShareModalVisible(false);
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
      {/* Fondo imagen estadio */}
      <Image
        source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/home-bg.png?alt=media&token=03237c0b-eb6d-4534-a21e-ae59da366365' }}
        style={{ position:'absolute', top:0, left:0, right:0, bottom:0, width:'100%', height:'100%', opacity:0.08 }}
        resizeMode="cover"
      />

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

      {/* ── MODAL COMPARTIR ── */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <LinearGradient colors={['#0A0F1A','#020408']} style={StyleSheet.absoluteFill} />
            <View style={s.modalTopLine} />

            <Text style={s.modalTitle}>¡PREDICCIÓN CONFIRMADA!</Text>
            <Text style={s.modalSub}>Comparte tu predicción y desafía a tus amigos</Text>

            {/* ShareCard preview */}
            {shareMatch && (
              <View style={s.cardPreviewWrap}>
                <ShareCard
                  ref={cardRef}
                  mode="prediction"
                  username={userData?.username ?? 'golzair'}
                  homeTeam={shareMatch.homeTeam ?? ''}
                  awayTeam={shareMatch.awayTeam ?? ''}
                  homeFlagUrl={`https://flagcdn.com/w80/${getFlagCode(shareMatch.homeFlag)}.png`}
                  awayFlagUrl={`https://flagcdn.com/w80/${getFlagCode(shareMatch.awayFlag)}.png`}
                  homeScore={parseInt(getScore(shareMatch.id)[0]) || 0}
                  awayScore={parseInt(getScore(shareMatch.id)[1]) || 0}
                  leagueName={userData?.activeLeague ?? undefined}
                />
              </View>
            )}

            {/* Botones */}
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.shareBtnInner}>
                  <Text style={s.shareBtnTxt}>📤 COMPARTIR EN WHATSAPP</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={s.skipBtn} onPress={() => setShareModalVisible(false)}>
                <Text style={s.skipTxt}>Ahora no</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CONFIRMACIÓN PREDICCIÓN */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.85)', alignItems:'center', justifyContent:'center', padding:24 }}>
          <View style={{ backgroundColor:'#0A0F1A', borderRadius:20, padding:24, width:'100%', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', gap:16 }}>
            <View style={{ height:2, backgroundColor:'#FFD700', borderRadius:1 }} />
            <Text style={{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:'#FFD700', letterSpacing:3, textAlign:'center' }}>
              ¿CONFIRMAS TU PREDICCIÓN?
            </Text>
            {confirmMatch && (
              <View style={{ alignItems:'center', gap:8 }}>
                <Text style={{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:16, color:'#9AAABB', textAlign:'center' }}>
                  {confirmMatch.homeTeam} vs {confirmMatch.awayTeam}
                </Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap:16, backgroundColor:'rgba(255,215,0,0.1)', borderRadius:14, paddingHorizontal:24, paddingVertical:14, borderWidth:1, borderColor:'rgba(255,215,0,0.25)' }}>
                  <Text style={{ fontFamily:'BebasNeue_400Regular', fontSize:52, color:'#FFD700' }}>{getScore(confirmMatch.id)[0] || '0'}</Text>
                  <Text style={{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:'#6B7A99' }}>-</Text>
                  <Text style={{ fontFamily:'BebasNeue_400Regular', fontSize:52, color:'#FFD700' }}>{getScore(confirmMatch.id)[1] || '0'}</Text>
                </View>
                <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:'#6B7A99' }}>
                  Esta predicción no se puede cambiar después
                </Text>
              </View>
            )}
            <View style={{ flexDirection:'row', gap:10 }}>
              <TouchableOpacity 
                style={{ flex:1, borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.1)', paddingVertical:14, alignItems:'center' }}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:'#6B7A99', letterSpacing:1 }}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex:2, borderRadius:12, overflow:'hidden' }}
                onPress={() => {
                  setShowConfirmModal(false);
                  if (confirmMatch) confirm(confirmMatch.id);
                }}
              >
                <LinearGradient colors={['#FFD700','#FFA500']} start={{x:0,y:0}} end={{x:1,y:0}} style={{ paddingVertical:14, alignItems:'center', borderRadius:12 }}>
                  <Text style={{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:'#000', letterSpacing:2 }}>⚡ CONFIRMAR</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} colors={[C.gold]} />
        }
      >

        {/* STATS BANNER */}
        <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.statsBanner}>
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
          const cd           = getMatchCountdown(m.kickoffTime, m.status);
          const isSelected   = selected === m.id;
          const isConfirmed  = confirmed[m.id];
          const retosVisible = showRetos[m.id] ?? false;
          const retos        = getRetosForMatch(m.phase);
          const savedRetos   = retosSaved[m.id] ?? false;
          const matchAnswers = retoAnswers[m.id] ?? {};
          const answeredCount = Object.keys(matchAnswers).length;

          const CardWrapper = cd.isToday ? AnimatedBorder : View;
          return (
            <CardWrapper key={m.id} style={s.card}>
              <LinearGradient
                colors={isConfirmed ? ['#00FF87','#00C853'] : cd.isLive ? ['#FF3355','#FF0040'] : ['#FFD700','#FFA500']}
                start={{x:0,y:0}} end={{x:1,y:0}} style={s.cardTopLine}
              />
              <LinearGradient colors={['rgba(255,215,0,0.06)','transparent']} start={{x:0.5,y:0}} end={{x:0.5,y:1}} style={s.cardGlow} />

              <View style={s.cardHeader}>
                <View style={s.cardHeaderLeft}>
                  <View style={s.groupPill}><Text style={s.groupPillTxt}>{m.group || 'GRUPO'}</Text></View>
                  <Text style={s.stadiumTxt} numberOfLines={1}>{m.stadium || 'ESTADIO'}</Text>
                </View>
                {cd.isLive ? <LiveBadge /> : <View style={s.countdownPill}><Text style={s.countdownTxt}>⏱ {cd.text}</Text></View>}
              </View>

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
                </View>
              )}

              {m.kickoffTime && (
                <View style={s.dateRow}>
                  <Text style={s.dateTxt}>🕐 {getMatchDate(m.kickoffTime, i18n.language)}</Text>
                  {isConfirmed && (
                    <View style={s.confirmedActions}>
                      <View style={s.ptsPill}><Text style={s.ptsPillTxt}>+10 PTS ✓</Text></View>
                      <TouchableOpacity
                        style={s.shareSmallBtn}
                        onPress={() => { setShareMatch(m); setShareModalVisible(true); }}
                      >
                        <Text style={s.shareSmallTxt}>📤</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {m.status !== 'finished' && (
                <TouchableOpacity 
  style={[s.predictBtn, isSelected && !getScore(m.id)[0] && !getScore(m.id)[1] && { opacity: 0.4 }]} 
  onPress={() => {
    if (isSelected) {
      const [h, a] = getScore(m.id);
      if (!h && !a) return; // no hace nada si está vacío
      setConfirmMatch(m);
      setShowConfirmModal(true);
    } else {
      setSelected(m.id);
    }
  }} 
  activeOpacity={0.85}
>
                  <LinearGradient
                    colors={isConfirmed ? ['#00FF87','#00C853'] : isSelected ? [C.gold, C.gold2] : ['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)']}
                    start={{x:0,y:0}} end={{x:1,y:0}} style={s.predictBtnInner}
                  >
                    <Text style={[s.predictBtnTxt, { color: isConfirmed || isSelected ? '#000' : C.gold }]}>
                      {isConfirmed ? `✓  ${t('home_sent')}` : isSelected ? `⚡  ${t('home_confirm')}` : `⚡  ${t('home_predict')}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* RETOS RÁPIDOS */}
              {m.status !== 'finished' && !cd.isLive && (() => {
                const kickoff = m.kickoffTime ? new Date(m.kickoffTime?.seconds ? m.kickoffTime.seconds * 1000 : m.kickoffTime) : null;
                const isLocked = kickoff ? new Date() >= kickoff : false;
                return !isLocked;
              })() && (
                <View style={s.retosSection}>
                  <TouchableOpacity style={s.retosToggle} onPress={() => setShowRetos(prev => ({ ...prev, [m.id]: !prev[m.id] }))} activeOpacity={0.8}>
                    <LinearGradient colors={['rgba(168,85,247,0.12)','rgba(168,85,247,0.04)']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.retosToggleInner}>
                      <Text style={s.retosToggleIcon}>⚡</Text>
                      <View style={s.retosToggleLeft}>
                        <Text style={s.retosToggleTitle}>RETOS RÁPIDOS</Text>
                        <Text style={s.retosToggleSub}>{retos.length} retos · hasta +{retos.reduce((a,r) => a + r.pts, 0)} pts extra</Text>
                      </View>
                      {answeredCount > 0 && !savedRetos && (
                        <View style={s.retosAnsweredBadge}><Text style={s.retosAnsweredTxt}>{answeredCount}/{retos.length}</Text></View>
                      )}
                      {savedRetos && (
                        <View style={s.retosSavedBadge}><Text style={s.retosSavedTxt}>✓ GUARDADO</Text></View>
                      )}
                      <Text style={s.retosChevron}>{retosVisible ? '▲' : '▼'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {retosVisible && (
                    <View style={s.retosContent}>
                      {retos.map(reto => (
                        <RetoCard key={reto.id} reto={reto} match={m} userPlan={userPlan} navigation={navigation}
                          answer={matchAnswers[reto.id] ?? null}
                          onAnswer={(retoId: string, val: string) => handleRetoAnswer(m.id, retoId, val)}
                          saved={savedRetos}
                        />
                      ))}
                      {userPlan !== 'free' && !savedRetos && answeredCount > 0 && (
                        <TouchableOpacity style={s.retosGuardarBtn} onPress={() => saveRetos(m.id)} activeOpacity={0.85}>
                          <LinearGradient colors={[C.purple,'#7C3AED']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.retosGuardarInner}>
                            <Text style={s.retosGuardarTxt}>CONFIRMAR {answeredCount} RETO{answeredCount > 1 ? 'S' : ''} ⚡</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                      {savedRetos && (
                        <View style={s.retosDoneBox}>
                          <Text style={s.retosDoneTxt}>✓ Retos confirmados — los puntos se suman si aciertas</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </CardWrapper>
          );
        })}

        {/* POINTS GUIDE */}
        <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.ptsGuide}>
          <Text style={s.ptsGuideTitle}>{t('home_points')}</Text>
          <View style={s.ptsRow}>
            {[
              { v:'+10', l:t('home_exact'),  c:C.gold  },
              { v:'+5',  l:t('home_winner'), c:C.gold2 },
              { v:'+2',  l:t('home_draw'),   c:C.muted2 },
            ].map((p,i) => (
              <LinearGradient key={i} colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']} style={s.ptsCard}>
                <Text style={[s.ptsVal,{ color:p.c }]}>{p.v}</Text>
                <Text style={s.ptsLbl}>{p.l}</Text>
              </LinearGradient>
            ))}
          </View>
          <View style={[s.ptsRow, { marginTop:8 }]}>
            <LinearGradient colors={['rgba(168,85,247,0.1)','rgba(168,85,247,0.03)']} style={[s.ptsCard, { borderColor:'rgba(168,85,247,0.2)' }]}>
              <Text style={[s.ptsVal, { color:C.purple }]}>+53</Text>
              <Text style={s.ptsLbl}>RETOS MAX</Text>
            </LinearGradient>
            <LinearGradient colors={['rgba(168,85,247,0.1)','rgba(168,85,247,0.03)']} style={[s.ptsCard, { flex:2, borderColor:'rgba(168,85,247,0.2)' }]}>
              <Text style={[s.ptsLbl, { color:'#C084FC', fontSize:9 }]}>⚡ Retos Rápidos solo para GOLZAIR+</Text>
            </LinearGradient>
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

  // Modal compartir
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.85)', alignItems:'center', justifyContent:'flex-end' },
  modalCard:{ width:'100%', borderTopLeftRadius:24, borderTopRightRadius:24, overflow:'hidden', padding:24, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  modalTopLine:{ position:'absolute', top:0, left:0, right:0, height:3, backgroundColor:C.gold },
  modalTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, letterSpacing:3, marginBottom:6 },
  modalSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, marginBottom:20, textAlign:'center' },
  cardPreviewWrap:{ alignItems:'center', marginBottom:20 },
  modalBtns:{ width:'100%', gap:10 },
  shareBtn:{ borderRadius:14, overflow:'hidden' },
  shareBtnInner:{ paddingVertical:16, alignItems:'center', borderRadius:14 },
  shareBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:'#000', letterSpacing:2 },
  skipBtn:{ alignItems:'center', paddingVertical:12 },
  skipTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted },

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

  card:{ marginHorizontal:12, marginBottom:10, backgroundColor:C.surface2, borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.35)', overflow:'hidden', shadowColor:'#FFD700', shadowOffset:{width:0,height:6}, shadowOpacity:0.35, shadowRadius:12, elevation:10 },
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
  teamFlagImg:{ width:56, height:40, borderRadius:4 },
  teamCode:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.gold, letterSpacing:2 },
  teamName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2, textAlign:'center' },

  centerBox:{ alignItems:'center', justifyContent:'center', paddingHorizontal:8, width:84 },
  vsCircle:{ width:68, height:68, borderRadius:34, borderWidth:2, borderColor:C.goldBorder, alignItems:'center', justifyContent:'center' },
  vsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold },
  inputRow:{ flexDirection:'row', alignItems:'center', gap:4 },
  scoreInput:{ width:58, height:58, backgroundColor:'rgba(255,215,0,0.1)', borderWidth:2, borderColor:C.gold, borderRadius:10, color:C.gold, fontFamily:'BebasNeue_400Regular', fontSize:28, textAlign:'center' } as any,
  inputDash:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted },
  confirmedBox:{ flexDirection:'row', alignItems:'center', gap:6, borderRadius:12, paddingHorizontal:14, paddingVertical:12, borderWidth:1, borderColor:'rgba(0,255,135,0.25)' },
  confirmedNum:{ fontFamily:'BebasNeue_400Regular', fontSize:34, color:C.green },
  confirmedDash:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.green },

  dateRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingBottom:10, zIndex:1 },
  dateTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted },
  confirmedActions:{ flexDirection:'row', alignItems:'center', gap:8 },
  ptsPill:{ backgroundColor:'rgba(0,255,135,0.1)', borderWidth:1, borderColor:'rgba(0,255,135,0.3)', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  ptsPillTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.green, letterSpacing:1 },
  shareSmallBtn:{ width:32, height:32, borderRadius:16, backgroundColor:'rgba(255,215,0,0.1)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  shareSmallTxt:{ fontSize:14 },

  predictBtn:{ marginHorizontal:14, marginBottom:14, zIndex:1, borderRadius:12, overflow:'hidden' },
  predictBtnInner:{ borderRadius:12, paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  predictBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:3 },

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

  retosSection:{ marginHorizontal:14, marginBottom:14 },
  retosToggle:{ borderRadius:12, overflow:'hidden' },
  retosToggleInner:{ flexDirection:'row', alignItems:'center', gap:10, padding:12, borderRadius:12, borderWidth:1, borderColor:'rgba(168,85,247,0.25)' },
  retosToggleIcon:{ fontSize:16 },
  retosToggleLeft:{ flex:1 },
  retosToggleTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:'#C084FC', letterSpacing:2 },
  retosToggleSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:'#9B7AC4', marginTop:1 },
  retosChevron:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:'#9B7AC4' },
  retosAnsweredBadge:{ backgroundColor:'rgba(168,85,247,0.3)', borderRadius:20, paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:'rgba(168,85,247,0.5)' },
  retosAnsweredTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'#E9D5FF' },
  retosSavedBadge:{ backgroundColor:'rgba(0,255,135,0.15)', borderRadius:20, paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:'rgba(0,255,135,0.3)' },
  retosSavedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'#00FF87' },
  retosContent:{ paddingTop:8 },
  retosGuardarBtn:{ borderRadius:12, overflow:'hidden', marginTop:4 },
  retosGuardarInner:{ paddingVertical:13, alignItems:'center', borderRadius:12 },
  retosGuardarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:'#fff', letterSpacing:2 },
  retosDoneBox:{ backgroundColor:'rgba(0,255,135,0.06)', borderRadius:10, padding:12, borderWidth:1, borderColor:'rgba(0,255,135,0.2)', marginTop:4 },
  retosDoneTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#00FF87', textAlign:'center' },

  ptsGuide:{ marginHorizontal:12, marginTop:4, borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:14 },
  ptsGuideTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:10 },
  ptsRow:{ flexDirection:'row', gap:8 },
  ptsCard:{ flex:1, borderRadius:10, padding:10, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.1)' },
  ptsVal:{ fontFamily:'BebasNeue_400Regular', fontSize:22 },
  ptsLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted, textAlign:'center', marginTop:2 },
});