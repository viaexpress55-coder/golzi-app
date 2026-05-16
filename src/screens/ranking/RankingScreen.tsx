import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Share, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', gold3:'#FFF8DC',
  goldBorder:'rgba(255,215,0,0.25)', goldBorderLight:'rgba(255,215,0,0.12)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
  silver:'#C0C0C0', bronze:'#CD7F32',
  purple:'#A855F7',
};

const FREE_RANK_LIMIT = 20;

// ── Datos mock para liga (mientras no hay liga real conectada) ─────────────────
const MOCK_LEAGUE = [
  { id:'l1', username:'CarlosGol',   country:'🇨🇴', pts:847, exact:9,  plan:'LIGA',   streak:5, isMe:false },
  { id:'l2', username:'viaexpress',  country:'🇨🇴', pts:421, exact:9,  plan:'PLAYER', streak:5, isMe:true  },
  { id:'l3', username:'FutbolRey',   country:'🇲🇽', pts:398, exact:8,  plan:'LIGA',   streak:3, isMe:false },
  { id:'l4', username:'SambaBR',     country:'🇧🇷', pts:312, exact:6,  plan:'PLAYER', streak:2, isMe:false },
  { id:'l5', username:'TigreCol',    country:'🇨🇴', pts:287, exact:5,  plan:'PLAYER', streak:1, isMe:false },
];

// ── Datos mock global ─────────────────────────────────────────────────────────
const MOCK_GLOBAL = [
  { id:'1',  username:'Rafa_Predictor', country:'🇧🇷', pts:487, exact:12, plan:'PRO',    streak:8 },
  { id:'2',  username:'CarlosGol',      country:'🇨🇴', pts:421, exact:9,  plan:'LIGA',   streak:5 },
  { id:'3',  username:'FutbolRey',      country:'🇲🇽', pts:398, exact:8,  plan:'LIGA',   streak:3 },
  { id:'4',  username:'SambaBR',        country:'🇧🇷', pts:312, exact:6,  plan:'PLAYER', streak:2 },
  { id:'5',  username:'TigreCol',       country:'🇨🇴', pts:287, exact:5,  plan:'PLAYER', streak:1 },
  { id:'6',  username:'EagleMX',        country:'🇲🇽', pts:201, exact:4,  plan:'PLAYER', streak:0 },
  { id:'7',  username:'GoalKing',       country:'🇦🇷', pts:189, exact:3,  plan:'FREE',   streak:0 },
  { id:'8',  username:'viaexpress',     country:'🇨🇴', pts:421, exact:9,  plan:'PLAYER', streak:5, isMe:true },
  { id:'9',  username:'PredictorX',     country:'🇲🇽', pts:175, exact:3,  plan:'FREE',   streak:0 },
  { id:'10', username:'GolzairPro',     country:'🇦🇷', pts:162, exact:2,  plan:'FREE',   streak:0 },
  { id:'11', username:'FutFan11',       country:'🇧🇷', pts:155, exact:2,  plan:'FREE',   streak:0 },
  { id:'12', username:'MundialFan',     country:'🇨🇴', pts:148, exact:2,  plan:'FREE',   streak:0 },
  { id:'13', username:'CrackTotal',     country:'🇲🇽', pts:140, exact:1,  plan:'FREE',   streak:0 },
  { id:'14', username:'GolNeto',        country:'🇦🇷', pts:132, exact:1,  plan:'FREE',   streak:0 },
  { id:'15', username:'Predictor15',    country:'🇧🇷', pts:125, exact:1,  plan:'FREE',   streak:0 },
  { id:'16', username:'FutbolMX',       country:'🇲🇽', pts:118, exact:1,  plan:'FREE',   streak:0 },
  { id:'17', username:'GoalMaster',     country:'🇨🇴', pts:110, exact:1,  plan:'FREE',   streak:0 },
  { id:'18', username:'LigaPro',        country:'🇦🇷', pts:102, exact:0,  plan:'FREE',   streak:0 },
  { id:'19', username:'CrackBR',        country:'🇧🇷', pts:95,  exact:0,  plan:'FREE',   streak:0 },
  { id:'20', username:'PredMaster',     country:'🇲🇽', pts:88,  exact:0,  plan:'FREE',   streak:0 },
  { id:'21', username:'GolzairFan',     country:'🇨🇴', pts:81,  exact:0,  plan:'FREE',   streak:0 },
  { id:'22', username:'MundialPred',    country:'🇦🇷', pts:74,  exact:0,  plan:'FREE',   streak:0 },
  { id:'23', username:'FutCrack',       country:'🇧🇷', pts:67,  exact:0,  plan:'FREE',   streak:0 },
];

// ── Ranking de países calculado desde MOCK_GLOBAL ────────────────────────────
function calcCountryRanking(players: any[]) {
  const map: Record<string, { country: string; total: number; count: number; exact: number }> = {};
  for (const p of players) {
    if (!map[p.country]) map[p.country] = { country: p.country, total: 0, count: 0, exact: 0 };
    map[p.country].total += p.pts;
    map[p.country].count += 1;
    map[p.country].exact += p.exact ?? 0;
  }
  return Object.values(map)
    .map(c => ({ ...c, avg: Math.round(c.total / c.count) }))
    .sort((a, b) => b.avg - a.avg);
}

// ── PodiumCard ────────────────────────────────────────────────────────────────
function PodiumCard({ player, rank }: { player: any; rank: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue:1, delay:rank*150, useNativeDriver:true, tension:50, friction:7 }).start();
  }, []);
  const isFirst   = rank === 1;
  const isSecond  = rank === 2;
  const medalColor = isFirst ? C.gold : isSecond ? C.silver : C.bronze;
  const podiumH    = ({ 1:140, 2:110, 3:90 } as any)[rank] || 80;
  return (
    <Animated.View style={[s.podiumPlayer, isFirst && s.podiumFirst, { transform:[{ scale: scaleAnim }] }]}>
      {isFirst && <Text style={s.crown}>👑</Text>}
      <LinearGradient
        colors={isFirst ? [C.gold,C.gold2] : isSecond ? ['#E8E8E8','#A0A0A0'] : ['#CD7F32','#8B4513']}
        style={[s.podiumAvatar, isFirst && s.podiumAvatarFirst]}
      >
        <Text style={s.podiumAvatarTxt}>{player.username.slice(0,1).toUpperCase()}</Text>
      </LinearGradient>
      {player.plan === 'PRO' && (
        <LinearGradient colors={[C.gold,C.gold2]} style={s.proBadge}><Text style={s.proBadgeTxt}>PRO</Text></LinearGradient>
      )}
      <Text style={s.podiumFlag}>{player.country}</Text>
      <Text style={s.podiumName} numberOfLines={1}>{player.username}</Text>
      <Text style={[s.podiumPts,{ color:medalColor }]}>{player.pts}</Text>
      <Text style={s.podiumPtsLbl}>PTS</Text>
      <LinearGradient colors={[medalColor,`${medalColor}66`]} style={[s.podiumBase,{ height:podiumH }]}>
        <Text style={s.podiumRank}>{rank}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ── PaywallBanner ─────────────────────────────────────────────────────────────
function PaywallBanner({ hiddenCount, onUnlock }: { hiddenCount:number; onUnlock:()=>void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim,{ toValue:1.02, duration:1000, useNativeDriver:true }),
      Animated.timing(pulseAnim,{ toValue:1,    duration:1000, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[pw.wrap,{ transform:[{ scale:pulseAnim }] }]}>
      <LinearGradient colors={['rgba(168,85,247,0.15)','rgba(168,85,247,0.05)']} style={pw.inner}>
        <View style={pw.topLine} />
        <View style={pw.blurredRow}>
          {[...Array(5)].map((_,i) => (
            <View key={i} style={[pw.blurredAvatar,{ opacity:1-i*0.15 }]}>
              <Text style={pw.blurredAvatarTxt}>?</Text>
            </View>
          ))}
          <Text style={pw.blurredMore}>+{hiddenCount-5}</Text>
        </View>
        <Text style={pw.lockIcon}>🔒</Text>
        <Text style={pw.title}>{hiddenCount} GOLZAIRES OCULTOS</Text>
        <Text style={pw.sub}>Desbloquea el ranking completo con{'\n'}<Text style={{ color:C.purple, fontWeight:'800' }}>GOLZAIR — $1.99</Text></Text>
        <TouchableOpacity style={pw.btn} onPress={onUnlock} activeOpacity={0.85}>
          <LinearGradient colors={[C.purple,'#7C3AED']} start={{x:0,y:0}} end={{x:1,y:0}} style={pw.btnInner}>
            <Text style={pw.btnTxt}>⚡ VER RANKING COMPLETO — $1.99</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={pw.hint}>También desbloquea Retos Rápidos y más funciones premium</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const pw = StyleSheet.create({
  wrap:{ marginHorizontal:12, marginTop:8, marginBottom:16, borderRadius:20, overflow:'hidden' },
  inner:{ padding:20, alignItems:'center', gap:10, borderWidth:1, borderColor:'rgba(168,85,247,0.3)', borderRadius:20 },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:C.purple },
  blurredRow:{ flexDirection:'row', alignItems:'center', marginBottom:4 },
  blurredAvatar:{ width:36, height:36, borderRadius:18, backgroundColor:'rgba(168,85,247,0.2)', borderWidth:2, borderColor:'rgba(168,85,247,0.4)', alignItems:'center', justifyContent:'center', marginLeft:-8 },
  blurredAvatarTxt:{ fontSize:14, color:'rgba(168,85,247,0.5)' },
  blurredMore:{ fontSize:12, color:C.muted, marginLeft:8, fontFamily:'BarlowCondensed_700Bold' } as any,
  lockIcon:{ fontSize:32 },
  title:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.text, letterSpacing:3 } as any,
  sub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, textAlign:'center', lineHeight:20 } as any,
  btn:{ width:'100%', borderRadius:14, overflow:'hidden' },
  btnInner:{ paddingVertical:14, alignItems:'center', borderRadius:14 },
  btnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:'#fff', letterSpacing:2 } as any,
  hint:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, textAlign:'center' } as any,
});

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
export default function RankingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const TABS = [t('ranking_global'), t('ranking_league'), t('ranking_country'), '🌍 PAÍSES'];
  const [tab, setTab]           = useState(0);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [userData, setUserData] = useState<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        setUserPlan(snap.data()?.plan ?? 'free');
        setUserData(snap.data());
      }
    });
  }, []);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim,{ toValue:1.03, duration:1200, useNativeDriver:true }),
      Animated.timing(pulseAnim,{ toValue:1,    duration:1200, useNativeDriver:true }),
    ])).start();
  }, []);

  if (!fontsLoaded) return <View style={s.root} />;

  const isPaid = userPlan !== 'free';
  const myCountry = userData?.country ?? '';

  // ── Datos según tab ───────────────────────────────────────────────────────
  const globalSorted = [...MOCK_GLOBAL].sort((a,b) => b.pts - a.pts);

  // Tab 0 — Global
  const globalTop3   = globalSorted.slice(0,3);
  const globalRest   = globalSorted.slice(3);
  const globalVisible = isPaid ? globalRest : globalRest.slice(0, FREE_RANK_LIMIT - 3);
  const globalHidden  = isPaid ? [] : globalRest.slice(FREE_RANK_LIMIT - 3);

  // Tab 1 — Liga privada
  const leagueSorted  = [...MOCK_LEAGUE].sort((a,b) => b.pts - a.pts);
  const leagueTop3    = leagueSorted.slice(0,3);
  const leagueRest    = leagueSorted.slice(3);

  // Tab 2 — Mi país
  const countrySorted = globalSorted.filter(p => p.country === myCountry || p.isMe);
  const countryTop3   = countrySorted.slice(0,3);
  const countryRest   = countrySorted.slice(3);

  // Tab 3 — Ranking de países
  const countryRanking = calcCountryRanking(MOCK_GLOBAL);

  // Me
  const me     = globalSorted.find(p => p.isMe);
  const meRank = globalSorted.findIndex(p => p.isMe) + 1;

  // Datos del tab actual
  const currentTop3 = tab === 0 ? globalTop3 : tab === 1 ? leagueTop3 : countryTop3;
  const currentRest = tab === 0 ? globalVisible : tab === 1 ? leagueRest : countryRest;

  async function shareRanking() {
    if (!me) return;
    try {
      await Share.share({
        message:
          `🏆 GOLZI — MUNDIAL 2026\n\n` +
          `⚽ Estoy en el puesto #${meRank} del ranking global\n` +
          `🎯 ${me.pts} puntos · ${me.exact} predicciones exactas\n\n` +
          `¿Puedes superarme? Descarga GOLZI 👉 golzi.app`,
      });
    } catch {}
  }

  return (
    <View style={s.root}>

      {/* HEADER */}
      <LinearGradient colors={['#020408','#05080F']} style={s.header}>
        <View style={s.topLine} />
        <View style={s.headerLeft}>
          <Image source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }} style={s.headerLogo} resizeMode="contain" />
          <View>
            <Text style={s.headerTitle}>RANKING</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        <View style={s.playerCount}>
          <Text style={s.playerCountTxt}>{MOCK_GLOBAL.length}</Text>
          <Text style={s.playerCountLbl}>GOLZAIRES</Text>
        </View>
      </LinearGradient>

      {/* MY POSITION */}
      {me && (
        <Animated.View style={{ transform:[{ scale:pulseAnim }] }}>
          <LinearGradient colors={['rgba(255,215,0,0.14)','rgba(255,215,0,0.04)']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.myPosBanner}>
            <View style={s.myPosLeft}>
              <Text style={s.myPosRank}>#{meRank}</Text>
              <View>
                <Text style={s.myPosLabel}>{t('ranking_position')}</Text>
                <Text style={s.myPosUser}>{me.username}</Text>
              </View>
            </View>
            <View style={s.myPosRight}>
              <Text style={s.myPosPts}>{me.pts}</Text>
              <Text style={s.myPosPtsLbl}>PTS</Text>
              <TouchableOpacity style={s.shareBtn} onPress={shareRanking}>
                <Text style={s.shareBtnTxt}>📤 COMPARTIR</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* TABS — scroll horizontal para los 4 */}
      <View style={s.tabRow}>
        {TABS.map((tabName,i) => (
          <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tabName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TAB 3: RANKING DE PAÍSES ── */}
        {tab === 3 && (
          <View style={{ paddingHorizontal:12, marginTop:8 }}>
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerTxt}>🌍 RANKING DE PAÍSES</Text>
              <View style={s.dividerLine} />
            </View>
            <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, textAlign:'center', marginBottom:12 }}>
              Puntos promedio por usuario de cada país
            </Text>
            {countryRanking.map((c, idx) => {
              const medals = ['🥇','🥈','🥉'];
              const isTop3 = idx < 3;
              const isMyCountry = c.country === myCountry;
              return (
                <LinearGradient
                  key={c.country}
                  colors={isMyCountry
                    ? ['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)']
                    : isTop3
                    ? ['rgba(255,255,255,0.05)','rgba(255,255,255,0.02)']
                    : ['rgba(255,255,255,0.02)','rgba(255,255,255,0.01)']
                  }
                  style={[s.playerRow, isMyCountry && s.playerRowMe]}
                >
                  <Text style={[s.rankNum, { fontSize:18 }]}>{medals[idx] || idx+1}</Text>
                  <Text style={{ fontSize:32 }}>{c.country}</Text>
                  <View style={s.playerInfo}>
                    <Text style={[s.playerName, isMyCountry && { color:C.gold }]}>
                      {c.country} {isMyCountry ? '← TÚ' : ''}
                    </Text>
                    <Text style={s.playerExact}>{c.count} Golzaires · {c.exact} exactas</Text>
                  </View>
                  <View style={s.playerPtsBox}>
                    <Text style={[s.playerPts, isTop3 && { color:C.gold }]}>{c.avg}</Text>
                    <Text style={s.playerPtsLbl}>PROM</Text>
                  </View>
                </LinearGradient>
              );
            })}
            <View style={s.footer}>
              <Text style={s.footerTxt}>⚡ Invita amigos de tu país para subir el ranking 🇨🇴</Text>
            </View>
          </View>
        )}

        {/* ── TABS 0, 1, 2: PODIUM + LISTA ── */}
        {tab !== 3 && (
          <>
            {/* PODIUM */}
            {currentTop3.length >= 3 && (
              <View style={s.podiumWrap}>
                <LinearGradient colors={['rgba(255,215,0,0.06)','transparent']} start={{x:0.5,y:0}} end={{x:0.5,y:1}} style={s.podiumBg} />
                <View style={s.podiumRow}>
                  <PodiumCard player={currentTop3[1]} rank={2} />
                  <PodiumCard player={currentTop3[0]} rank={1} />
                  <PodiumCard player={currentTop3[2]} rank={3} />
                </View>
                <LinearGradient colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.02)']} start={{x:0.5,y:0}} end={{x:0.5,y:1}} style={s.podiumStage} />
              </View>
            )}

            {/* Label tab Liga */}
            {tab === 1 && (
              <View style={[s.divider, { marginTop:8 }]}>
                <View style={s.dividerLine} />
                <Text style={s.dividerTxt}>🏆 LOS GOLZAIRES</Text>
                <View style={s.dividerLine} />
              </View>
            )}

            {/* Label tab País */}
            {tab === 2 && (
              <View style={[s.divider, { marginTop:8 }]}>
                <View style={s.dividerLine} />
                <Text style={s.dividerTxt}>{myCountry} MI PAÍS</Text>
                <View style={s.dividerLine} />
              </View>
            )}

            {/* Label tab Global */}
            {tab === 0 && (
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerTxt}>{t('ranking_classification')}</Text>
                <View style={s.dividerLine} />
              </View>
            )}

            {/* LISTA DE JUGADORES */}
            {currentRest.map((player:any, idx:number) => {
              const rank   = idx + 4;
              const isMe   = player.isMe;
              return (
                <LinearGradient
                  key={player.id}
                  colors={isMe ? ['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={[s.playerRow, isMe && s.playerRowMe]}
                >
                  <Text style={[s.rankNum, isMe && { color:C.gold }]}>{rank}</Text>
                  <LinearGradient colors={isMe ? [C.gold,C.gold2] : ['#1A1F2E','#141824']} style={s.playerAvatar}>
                    <Text style={[s.playerAvatarTxt, isMe && { color:'#000' }]}>
                      {player.username.slice(0,1).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={s.playerInfo}>
                    <View style={s.playerNameRow}>
                      <Text style={[s.playerName, isMe && { color:C.gold }]}>{player.username}</Text>
                      {isMe && <View style={s.youBadge}><Text style={s.youBadgeTxt}>TÚ</Text></View>}
                      {player.plan === 'PRO' && <LinearGradient colors={[C.gold,C.gold2]} style={s.proBadgeSmall}><Text style={s.proBadgeSmallTxt}>PRO</Text></LinearGradient>}
                    </View>
                    <View style={s.playerSubRow}>
                      <Text style={s.playerFlag}>{player.country}</Text>
                      <Text style={s.playerExact}>{player.exact} {t('profile_exact')}</Text>
                      {player.streak > 0 && <Text style={s.playerStreak}>🔥 {player.streak}</Text>}
                    </View>
                  </View>
                  <View style={s.playerPtsBox}>
                    <Text style={[s.playerPts, isMe && { color:C.gold }]}>{player.pts}</Text>
                    <Text style={s.playerPtsLbl}>PTS</Text>
                  </View>
                </LinearGradient>
              );
            })}

            {/* PAYWALL — solo en tab Global */}
            {tab === 0 && !isPaid && globalHidden.length > 0 && (
              <PaywallBanner hiddenCount={globalHidden.length} onUnlock={() => navigation.navigate('Plans')} />
            )}

            {/* Empty state para tab país */}
            {tab === 2 && countrySorted.length === 0 && (
              <View style={{ alignItems:'center', paddingVertical:40, gap:10 }}>
                <Text style={{ fontSize:40 }}>🌍</Text>
                <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.muted }}>
                  Sin usuarios de tu país aún
                </Text>
                <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, textAlign:'center' }}>
                  Invita amigos de {myCountry} para aparecer aquí
                </Text>
              </View>
            )}

            <View style={s.footer}>
              <Text style={s.footerTxt}>⚡ {t('ranking_updated')} · {MOCK_GLOBAL.length} {t('ranking_participants')}</Text>
            </View>
          </>
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
  playerCount:{ alignItems:'center' },
  playerCountTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold },
  playerCountLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },
  myPosBanner:{ marginHorizontal:12, marginTop:10, borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', padding:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  myPosLeft:{ flexDirection:'row', alignItems:'center', gap:12 },
  myPosRank:{ fontFamily:'BebasNeue_400Regular', fontSize:44, color:C.gold, lineHeight:46 },
  myPosLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },
  myPosUser:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:15, color:C.text },
  myPosRight:{ alignItems:'center' },
  myPosPts:{ fontFamily:'BebasNeue_400Regular', fontSize:34, color:C.gold },
  myPosPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },
  shareBtn:{ marginTop:6, backgroundColor:'rgba(255,215,0,0.1)', borderRadius:8, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:10, paddingVertical:5 },
  shareBtnTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.gold, letterSpacing:1 },
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:6, paddingVertical:10 },
  tab:{ flex:1, paddingVertical:8, paddingHorizontal:4, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  scroll:{ paddingBottom:40 },
  podiumWrap:{ marginTop:8, marginBottom:4, position:'relative' },
  podiumBg:{ position:'absolute', top:0, left:0, right:0, bottom:0 },
  podiumRow:{ flexDirection:'row', alignItems:'flex-end', justifyContent:'center', paddingHorizontal:16, gap:8, paddingTop:20 },
  podiumStage:{ height:24, marginHorizontal:12, borderRadius:8 },
  podiumPlayer:{ flex:1, alignItems:'center', gap:4, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:10, elevation:8 },
  podiumFirst:{ marginBottom:0 },
  crown:{ fontSize:26, marginBottom:2 },
  podiumAvatar:{ width:56, height:56, borderRadius:28, alignItems:'center', justifyContent:'center' },
  podiumAvatarFirst:{ width:68, height:68, borderRadius:34 },
  podiumAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:'#000' },
  proBadge:{ borderRadius:6, paddingHorizontal:6, paddingVertical:2, marginTop:-4 },
  proBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:'#000', letterSpacing:1 },
  podiumFlag:{ fontSize:18 },
  podiumName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.text, textAlign:'center' },
  podiumPts:{ fontFamily:'BebasNeue_400Regular', fontSize:22 },
  podiumPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2, marginTop:-4 },
  podiumBase:{ width:'100%', borderTopLeftRadius:10, borderTopRightRadius:10, alignItems:'center', justifyContent:'flex-start', paddingTop:8, marginTop:4 },
  podiumRank:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:'rgba(0,0,0,0.4)' },
  divider:{ flexDirection:'row', alignItems:'center', paddingHorizontal:12, marginVertical:12, gap:10 },
  dividerLine:{ flex:1, height:1, backgroundColor:'rgba(255,215,0,0.15)' },
  dividerTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:3 },
  playerRow:{ flexDirection:'row', alignItems:'center', marginHorizontal:12, marginBottom:6, borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:12, gap:12, shadowColor:'#FFD700', shadowOffset:{width:0,height:3}, shadowOpacity:0.15, shadowRadius:6, elevation:3 },
  playerRowMe:{ borderColor:'rgba(255,215,0,0.5)', shadowColor:'#FFD700', shadowOpacity:0.4, elevation:8 },
  rankNum:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.muted, width:28, textAlign:'center' },
  playerAvatar:{ width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  playerAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.muted2 },
  playerInfo:{ flex:1, gap:4 },
  playerNameRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  playerName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.text },
  youBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:6, paddingHorizontal:6, paddingVertical:1, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  youBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.gold, letterSpacing:1 },
  proBadgeSmall:{ borderRadius:5, paddingHorizontal:5, paddingVertical:1 },
  proBadgeSmallTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:'#000', letterSpacing:1 },
  playerSubRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  playerFlag:{ fontSize:14 },
  playerExact:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  playerStreak:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.gold2 },
  playerPtsBox:{ alignItems:'center' },
  playerPts:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.text },
  playerPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },
  footer:{ alignItems:'center', paddingVertical:16 },
  footerTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, letterSpacing:0.5 },
});