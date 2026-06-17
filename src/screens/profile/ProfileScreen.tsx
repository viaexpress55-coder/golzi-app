import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { logout, onAuthChange } from '../../services/auth';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { COUNTRY_FLAGS } from '../../locales/i18n';
import { sendLocalNotification, GOLZI_NOTIFICATIONS } from '../../services/notifications';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import SettingsScreen from './SettingsScreen';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', gold3:'#FFF8DC',
  goldBorder:'rgba(255,215,0,0.25)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
};

// ─── XP / NIVELES ─────────────────────────────────────────────────────────────
const LEVELS = [
  { name:'NOVATO',        key:'level_novato',  min:0,    max:50,   icon:'⚡', color:'#6B7A99' },
  { name:'ANALISTA',      key:'level_analyst', min:51,   max:200,  icon:'🎯', color:'#00C6FF' },
  { name:'CRACK',         key:'level_crack',   min:201,  max:500,  icon:'⚡', color:'#00FF87' },
  { name:'LEYENDA',       key:'level_legend',  min:501,  max:1000, icon:'🏆', color:'#FFD700' },
  { name:'GOLZAIR ELITE', key:'level_elite',   min:1001, max:9999, icon:'👑', color:'#FF6B35' },
];

function getLevel(pts: number) {
  return LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[LEVELS.length - 1];
}
function getNextLevel(pts: number) {
  const idx = LEVELS.findIndex(l => pts >= l.min && pts <= l.max);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}
function getLevelProgress(pts: number): number {
  const lv = getLevel(pts);
  if (lv.name === 'GOLZAIR ELITE') return 1;
  const range = lv.max - lv.min;
  return Math.min((pts - lv.min) / range, 1);
}

// ─── XP BAR ───────────────────────────────────────────────────────────────────
function XPBar({ pts, t }: { pts: number; t: (k: string) => string }) {
  const level    = getLevel(pts);
  const nextLv   = getNextLevel(pts);
  const progress = getLevelProgress(pts);
  const pctWidth = `${Math.round(progress * 100)}%` as any;

  return (
    <View style={xp.container}>
      <View style={xp.labelRow}>
        <View style={[xp.levelBadge, { borderColor: level.color + '55', backgroundColor: level.color + '18' }]}>
          <Text style={xp.levelIcon}>{level.icon}</Text>
          <Text style={[xp.levelName, { color: level.color }]}>{t((level as any).key) || level.name}</Text>
        </View>
        {nextLv ? (
          <Text style={xp.nextLabel}>{nextLv.min - pts > 0 ? `${nextLv.min - pts} pts → ${nextLv.icon} ${t((nextLv as any).key) || nextLv.name}` : ''}</Text>
        ) : (
          <Text style={[xp.nextLabel, { color: C.gold }]}>NIVEL MAXIMO 👑</Text>
        )}
      </View>
      <View style={xp.barTrack}>
        <LinearGradient
          colors={[level.color, level.color + 'AA']}
          start={{ x:0, y:0 }} end={{ x:1, y:0 }}
          style={[xp.barFill, { width: pctWidth }]}
        />
        <View style={[xp.barDot, { left: pctWidth, backgroundColor: level.color }]} />
      </View>
      <View style={xp.rangeRow}>
        <Text style={xp.rangeMin}>{level.min} pts</Text>
        <Text style={xp.rangeMax}>{nextLv ? nextLv.min - 1 : '∞'} pts</Text>
      </View>
    </View>
  );
}

const xp = StyleSheet.create({
  container:{ marginTop:12, gap:6 },
  labelRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  levelBadge:{ flexDirection:'row', alignItems:'center', gap:5, borderRadius:8, borderWidth:StyleSheet.hairlineWidth, paddingHorizontal:10, paddingVertical:4 },
  levelIcon:{ fontSize:13 },
  levelName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, letterSpacing:1 },
  nextLabel:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },
  barTrack:{ height:6, borderRadius:3, backgroundColor:'rgba(255,255,255,0.07)', overflow:'visible', position:'relative' },
  barFill:{ height:6, borderRadius:3, position:'absolute', left:0, top:0 },
  barDot:{ width:10, height:10, borderRadius:5, position:'absolute', top:-2, marginLeft:-5, borderWidth:2, borderColor:'#020408' },
  rangeRow:{ flexDirection:'row', justifyContent:'space-between' },
  rangeMin:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },
  rangeMax:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },
});

// ─── BADGES MOCK (se conectan a Firestore en siguiente iteración) ──────────────
function getBadges(exactPredictions: number, maxStreak: number, totalPredictions: number, rankPosition: number | null, t: (k: string) => string) {
  return [
    { icon:'🎯', name: t('badge_first_exact'),  desc: t('badge_first_exact_desc'),  earned: exactPredictions >= 1 },
    { icon:'🔥', name: t('badge_streak_3'),     desc: t('badge_streak_3_desc'),     earned: maxStreak >= 3 },
    { icon:'⚡',       name: t('badge_scorer'),       desc: t('badge_scorer_desc'),       earned: exactPredictions >= 10 },
    { icon:'🏆', name: t('badge_champion'),     desc: t('badge_champion_desc'),     earned: false },
    { icon:'🌍', name: t('badge_mundial'),      desc: t('badge_mundial_desc'),      earned: totalPredictions >= 104 },
    { icon:'👑', name: t('badge_elite'),        desc: t('badge_elite_desc'),        earned: rankPosition !== null && rankPosition <= 10 },
  ];
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { t } = useTranslation();
  const TABS = [t('profile_tab'), t('history_tab'), t('badges_tab')];
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [tab, setTab] = useState(0);

  // ── Estado real de Firestore ──
  const [userId, setUserId]         = useState<string | null>(null);
  const [userData, setUserData]     = useState<any>(null);
  const [history, setHistory]       = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [rankPosition, setRankPosition] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  // ── Escuchar auth ──
  useEffect(() => {
    const unsub = onAuthChange(user => {
      setUserId(user?.uid ?? null);
      if (!user) setLoadingUser(false);
    });
    return unsub;
  }, []);

  // ── Escuchar documento del usuario en tiempo real ──
  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, 'users', userId);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
      setLoadingUser(false);
    });
    return unsub;
  }, [userId]);

  // ── Cargar quick_challenges ──
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'quick_challenges'),
      where('userId', '==', userId),
      orderBy('savedAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userId]);

  // ── Cargar historial de predicciones ──
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'predictions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userId]);

  if (!fontsLoaded) return <View style={s.root} />;

  async function handleLogout() {
    try {
      await logout();
      navigation.reset({ index:0, routes:[{ name:'Splash' }] });
    } catch (e) { console.error(e); }
  }

  // ── Datos del usuario (reales o fallback) ──
  const username     = userData?.username     ?? 'GOLZAIR';
  const country      = userData?.country      ?? '🌍';
  const plan         = userData?.plan         ?? 'free';
  const totalPoints  = userData?.totalPoints  ?? 0;
  const currentStreak = userData?.currentStreak ?? 0;
  const maxStreak    = userData?.maxStreak    ?? 0;
  const getMemberSince = () => {
    try {
      const ca = userData?.createdAt;
      if (!ca) return '—';
      // Firestore Timestamp
      if (ca?.toDate) return new Date(ca.toDate()).toLocaleDateString(undefined, { month:'short', year:'numeric' });
      // Número (seconds)
      if (ca?.seconds) return new Date(ca.seconds * 1000).toLocaleDateString(undefined, { month:'short', year:'numeric' });
      // String o Date
      const d = new Date(ca);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('es', { month:'short', year:'numeric' });
      return '—';
    } catch { return '—'; }
  };
  const memberSince = getMemberSince();

  // Calcular stats del historial
  const totalPredictions = history.length;
  const exactPredictions = history.filter(h => h.status === 'correct_exact').length;

  // Avatar inicial
  const avatarLetter = username.slice(0,1).toUpperCase();

  if (loadingUser) {
    return (
      <View style={[s.root, { alignItems:'center', justifyContent:'center' }]}>
        <ActivityIndicator color={C.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <LinearGradient colors={['#020408','#05080F']} style={s.header}>
        <View style={s.topLine} />
        <View style={s.headerLeft}>
          <Image
            source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
            style={s.headerLogo} resizeMode="contain"
          />
          <View>
            <Text style={s.headerTitle}>{t('profile_tab')}</Text>
            <Text style={s.headerSub}>{t('mundial_title')}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.settingsBtn} onPress={() => setShowSettings(true)}>
          <Text style={{ fontSize:20 }}>⚙️</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* HERO CARD */}
        <View style={s.heroCard}>
          <LinearGradient
            colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.04)']}
            start={{x:0,y:0}} end={{x:1,y:1}}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.heroTopLine} />
          <View style={s.heroCardInner}>
            <LinearGradient colors={[C.gold, C.gold2]} style={s.avatar}>
              <Text style={s.avatarTxt}>{avatarLetter}</Text>
            </LinearGradient>
            <View style={s.heroInfo}>
              <Text style={s.username}>{username.toUpperCase()}</Text>
              <View style={s.heroRow}>
                <LinearGradient colors={['rgba(255,215,0,0.2)','rgba(255,215,0,0.08)']} style={s.planBadge}>
                  <Text style={s.planTxt}>⚽ {plan.toUpperCase()}</Text>
                </LinearGradient>
                {rankPosition && (
                  <View style={s.rankBadge}>
                    <Text style={s.rankTxt}>#{rankPosition} Global</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* XP BAR REAL */}
          <View style={s.xpWrap}>
            <XPBar pts={totalPoints} t={t} />
          </View>
        </View>

        {/* STATS ROW — datos reales */}
        <View style={s.statsRow}>
          {[
            { val: String(totalPredictions), lbl: t('profile_predictions'), c: C.gold  },
            { val: String(challenges.length), lbl: t('profile_challenges'), c: C.cyan },
            { val: String(exactPredictions), lbl: t('profile_exact'),        c: C.green },
            { val: String(totalPoints),      lbl: t('profile_points'),       c: C.gold  },
            { val: String(currentStreak),    lbl: t('profile_streak'),       c: C.gold2 },
          ].map((st,i) => (
            <LinearGradient
              key={i}
              colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']}
              style={s.statCard}
            >
              <Text style={[s.statVal, { color:st.c }]}>{st.val}</Text>
              <Text style={s.statLbl}>{st.lbl}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* TABS */}
        <View style={s.tabRow}>
          {TABS.map((tabName,i) => (
            <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
              <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tabName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB 0 — PERFIL */}
        {tab === 0 && (
          <View style={s.tabContent}>

            {/* NIVELES */}
            <View style={s.infoCard}>
              <Text style={s.cardTitle}>{t('profile_levels')}</Text>
              {LEVELS.map((lv, i) => {
                const isActive = getLevel(totalPoints).name === lv.name;
                return (
                  <View key={i} style={[s.lvRow, i === LEVELS.length - 1 && { borderBottomWidth:0 }]}>
                    <Text style={s.lvIcon}>{lv.icon}</Text>
                    <View style={s.lvInfo}>
                      <Text style={[s.lvName, { color: isActive ? lv.color : C.muted }]}>
                      {t((lv as any).key) || lv.name}{isActive ? ' → ' + t('profile_tu_nivel') : ''}
                    </Text>
                      <Text style={s.lvRange}>{lv.min} – {lv.name === 'GOLZAIR ELITE' ? '∞' : lv.max} pts</Text>
                    </View>
                    {isActive && <View style={[s.activeDot, { backgroundColor: lv.color }]} />}
                  </View>
                );
              })}
            </View>

            {/* RACHA */}
            {(currentStreak > 0 || maxStreak > 0) && (
              <View style={s.infoCard}>
                <Text style={s.cardTitle}>{t('profile_racha')}</Text>
                <View style={s.streakRow}>
                  <View style={s.streakBox}>
                    <Text style={s.streakNum}>🔥 {currentStreak}</Text>
                    <Text style={s.streakLbl}>{t('profile_streak_current')}</Text>
                  </View>
                  <View style={s.streakDivider} />
                  <View style={s.streakBox}>
                    <Text style={s.streakNum}>⭐ {maxStreak}</Text>
                    <Text style={s.streakLbl}>{t('profile_streak_best')}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* INFO */}
            <View style={s.infoCard}>
              <Text style={s.cardTitle}>{t('profile_info')}</Text>
              {[
                { lbl: t('profile_user'),   val: `@${username.toLowerCase()}` },
                { lbl: t('profile_country'), val: (COUNTRY_FLAGS[country] || '') + ' ' + country },
                { lbl: t('profile_plan'),   val: plan.toUpperCase(), gold: true },
                { lbl: t('profile_member'), val: memberSince },
              ].map((row,i,arr) => (
                <View key={i} style={[s.infoRow, i===arr.length-1 && { borderBottomWidth:0 }]}>
                  <Text style={s.infoLbl}>{row.lbl}</Text>
                  <Text style={[s.infoVal, (row as any).gold && { color:C.gold }]}>{row.val}</Text>
                </View>
              ))}
            </View>

            <View style={s.infoCard}>
              <Text style={s.cardTitle}>{t('profile_language')}</Text>
              <LanguageSelector />
            </View>

            <TouchableOpacity style={s.upgradeBtn} onPress={() => Platform.OS === 'web' ? (typeof window !== 'undefined' && (window.location.href = 'https://golzi.app/planes')) : navigation.navigate('Plans')} activeOpacity={0.85}>
              <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.upgradeBtnInner}>
                <Text style={s.upgradeTxt}>⚡ {t('profile_upgrade_btn')}</Text>
                <Text style={s.upgradeSub}>{t('profile_upgrade_sub')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Text style={s.logoutTxt}>🚪 {t('profile_logout')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 1 — HISTORIAL REAL */}
        {tab === 1 && (
          <View style={s.tabContent}>
            {history.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>⚽</Text>
                <Text style={s.emptyTxt}>{t('profile_no_predictions')}</Text>
              </View>
            )}
            {history.map((h, i) => {
              const isExact   = h.status === 'correct_exact';
              const isWinner  = h.status === 'correct_result' || h.status === 'correct_draw';
              const isPending = h.status === 'pending';
              const type = isExact ? 'exact' : isWinner ? 'winner' : isPending ? 'pending' : 'incorrect';

              return (
                <LinearGradient
                  key={h.id}
                  colors={
                    isExact  ? ['rgba(0,255,135,0.08)','rgba(0,255,135,0.02)'] :
                    isWinner ? ['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)'] :
                    ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']
                  }
                  style={s.histRow}
                >
                  <View style={[s.histTypeLine, {
                    backgroundColor: isExact ? C.green : isWinner ? C.gold : C.muted
                  }]} />
                  <View style={s.histLeft}>
                    <Text style={s.histMatch}>{h.matchId}</Text>
                    <Text style={s.histDetail}>
                      {t('profile_pred')}: <Text style={{ color:C.muted2 }}>{h.homeScore} - {h.awayScore}</Text>
                      {isPending
                        ? <Text style={{ color:C.muted }}> · Pendiente</Text>
                        : <Text style={{ color: isExact ? C.green : isWinner ? C.gold : C.red }}> · {h.pointsEarned > 0 ? `+${h.pointsEarned} pts` : t('profile_no_points')}</Text>
                      }
                    </Text>
                  </View>
                  <View style={[
                    s.ptsBadge,
                    isExact   && { backgroundColor:'rgba(0,255,135,0.15)',  borderColor:'rgba(0,255,135,0.3)' },
                    isWinner  && { backgroundColor:'rgba(255,215,0,0.12)',  borderColor:'rgba(255,215,0,0.3)' },
                    isPending && { backgroundColor:'rgba(136,136,136,0.06)', borderColor:'rgba(136,136,136,0.15)' },
                  ]}>
                    <Text style={[
                      s.ptsTxt,
                      isExact   && { color:C.green },
                      isWinner  && { color:C.gold },
                      isPending && { color:C.muted },
                    ]}>
                      {isPending ? '--' : h.pointsEarned > 0 ? `+${h.pointsEarned}` : '0'}
                    </Text>
                  </View>
                </LinearGradient>
              );
            })}
          </View>
        )}

        {/* TAB 2 — BADGES */}
        {tab === 2 && (
          <View style={s.badgesGrid}>
            {getBadges(exactPredictions, maxStreak, totalPredictions, rankPosition, t).map((b,i) => (
              <LinearGradient
                key={i}
                colors={b.earned
                  ? ['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)']
                  : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']
                }
                style={[s.badgeCard, !b.earned && s.badgeCardLocked]}
              >
                {b.earned && <View style={s.badgeTopLine} />}
                <Text style={[s.badgeIcon, !b.earned && { opacity:0.25 }]}>{b.icon}</Text>
                <Text style={[s.badgeName, !b.earned && { color:C.muted }]}>{b.name}</Text>
                <Text style={s.badgeDesc}>{b.desc}</Text>
                {b.earned ? (
                  <View style={s.earnedPill}><Text style={s.earnedTxt}>✓ {t('profile_badges_earned')}</Text></View>
                ) : (
                  <View style={s.lockedPill}><Text style={s.lockedTxt}>🔒 {t('profile_badges_locked')}</Text></View>
                )}
              </LinearGradient>
            ))}
          </View>
        )}

      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal animationType="none" visible={showSettings} statusBarTranslucent>
        <SettingsScreen
          userData={userData}
          onClose={() => setShowSettings(false)}
          onLogout={() => { setShowSettings(false); handleLogout(); }}
        />
      </Modal>

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
  settingsBtn:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.05)', alignItems:'center', justifyContent:'center' },
  scroll:{ paddingBottom:40 },
  heroCard:{ margin:12, borderRadius:20, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,215,0,0.4)', overflow:'hidden', position:'relative', shadowColor:'#FFD700', shadowOffset:{width:0,height:8}, shadowOpacity:0.15, shadowRadius:16, elevation:3 },
  heroTopLine:{ height:2, backgroundColor:C.gold },
  heroCardInner:{ flexDirection:'row', alignItems:'center', gap:16, padding:18, paddingBottom:8 },
  avatar:{ width:70, height:70, borderRadius:35, alignItems:'center', justifyContent:'center' },
  avatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:36, color:'#000' },
  heroInfo:{ flex:1, gap:10 },
  heroRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  username:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.text, letterSpacing:2 },
  planBadge:{ borderRadius:8, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:10, paddingVertical:5 },
  planTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.gold, letterSpacing:1 },
  rankBadge:{ backgroundColor:'rgba(0,255,135,0.1)', borderRadius:8, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(0,255,135,0.25)', paddingHorizontal:10, paddingVertical:5 },
  rankTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.green },
  xpWrap:{ paddingHorizontal:18, paddingBottom:16 },
  statsRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginBottom:12 },
  statCard:{ flex:1, borderRadius:14, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,215,0,0.3)', padding:10, alignItems:'center', shadowColor:'#FFD700', shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:8, elevation:3 },
  statVal:{ fontFamily:'BebasNeue_400Regular', fontSize:26, lineHeight:28 },
  statLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:7, color:C.muted, marginTop:2, letterSpacing:0.5, textAlign:'center' },
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginBottom:12 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  tabContent:{ paddingHorizontal:12, gap:10 },
  lvRow:{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  lvIcon:{ fontSize:20, width:28, textAlign:'center' },
  lvInfo:{ flex:1, gap:2 },
  lvName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, letterSpacing:1 },
  lvRange:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },
  activeDot:{ width:8, height:8, borderRadius:4 },
  streakRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-around', paddingVertical:8 },
  streakBox:{ alignItems:'center', gap:4 },
  streakNum:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold },
  streakLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },
  streakDivider:{ width:1, height:40, backgroundColor:'rgba(255,215,0,0.2)' },
  infoCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:16, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,215,0,0.25)', padding:16, shadowColor:'#FFD700', shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:8, elevation:3 },
  cardTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:12 },
  infoRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:11, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  infoLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted },
  infoVal:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.text },
  upgradeBtn:{ borderRadius:14, overflow:'hidden' },
  upgradeBtnInner:{ borderRadius:14, paddingVertical:16, alignItems:'center' },
  upgradeTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:'#000', letterSpacing:2 },
  upgradeSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'rgba(0,0,0,0.6)', marginTop:3 },
  notifBtn:{ backgroundColor:'rgba(255,215,0,0.06)', borderRadius:14, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,215,0,0.2)', padding:14, alignItems:'center' },
  notifTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.gold, letterSpacing:1 },
  logoutBtn:{ backgroundColor:'rgba(255,51,85,0.06)', borderRadius:14, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,51,85,0.2)', padding:14, alignItems:'center' },
  logoutTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.red, letterSpacing:1 },
  histRow:{ borderRadius:14, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,255,255,0.06)', flexDirection:'row', alignItems:'center', gap:12, overflow:'hidden' },
  histTypeLine:{ width:3, alignSelf:'stretch' },
  histLeft:{ flex:1, gap:4, paddingVertical:12 },
  histMatch:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.text },
  histDetail:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  ptsBadge:{ borderWidth:StyleSheet.hairlineWidth, borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginRight:12 },
  ptsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16 },
  emptyState:{ alignItems:'center', paddingVertical:40, gap:10 },
  emptyIcon:{ fontSize:48 },
  emptyTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:C.muted },
  badgesGrid:{ flexDirection:'row', flexWrap:'wrap', gap:10, paddingHorizontal:12 },
  badgeCard:{ borderRadius:16, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(255,215,0,0.2)', padding:14, width:'47%', alignItems:'center', gap:6, overflow:'hidden' },
  badgeCardLocked:{ borderColor:'rgba(255,255,255,0.06)' },
  badgeTopLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:C.gold },
  badgeIcon:{ fontSize:36 },
  badgeName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.gold, textAlign:'center' },
  badgeDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, textAlign:'center', lineHeight:14 },
  earnedPill:{ backgroundColor:'rgba(0,255,135,0.12)', borderRadius:20, paddingHorizontal:10, paddingVertical:3, borderWidth:StyleSheet.hairlineWidth, borderColor:'rgba(0,255,135,0.25)' },
  earnedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.green, letterSpacing:1 },
  lockedPill:{ backgroundColor:'rgba(136,136,136,0.08)', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  lockedTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },
});