import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { logout } from '../../services/auth';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { sendLocalNotification, GOLZI_NOTIFICATIONS } from '../../services/notifications';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', gold3:'#FFF8DC',
  goldBorder:'rgba(255,215,0,0.25)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#FF3355', cyan:'#00C6FF',
};

// ─── XP / NIVELES ────────────────────────────────────────────────────────────
const LEVELS = [
  { name:'NOVATO',        min:0,    max:50,   icon:'⚽', color:'#6B7A99' },
  { name:'ANALISTA',      min:51,   max:200,  icon:'🎯', color:'#00C6FF' },
  { name:'CRACK',         min:201,  max:500,  icon:'⚡', color:'#00FF87' },
  { name:'LEYENDA',       min:501,  max:1000, icon:'🏆', color:'#FFD700' },
  { name:'GOLZAIR ELITE', min:1001, max:9999, icon:'👑', color:'#FF6B35' },
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
  const progress = pts - lv.min;
  return Math.min(progress / range, 1);
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const HISTORY = [
  { match:'Mexico vs Canada',     pred:'2-0', result:'3-1', pts:'+5',  type:'winner'  },
  { match:'Brasil vs Costa Rica', pred:'2-1', result:'2-1', pts:'+10', type:'exact'   },
  { match:'USA vs Gales',         pred:'1-0', result:'?',   pts:'--',  type:'pending' },
  { match:'Argentina vs Peru',    pred:'2-0', result:'?',   pts:'--',  type:'pending' },
];

const BADGES = [
  { icon:'🎯', name:'Primer Exacto',  desc:'Primera prediccion exacta',  earned:true  },
  { icon:'🔥', name:'Racha x3',       desc:'3 correctas seguidas',        earned:true  },
  { icon:'⚡', name:'Goleador',       desc:'10 predicciones exactas',     earned:false },
  { icon:'🏆', name:'Campeon',        desc:'Gana una liga privada',       earned:false },
  { icon:'🌍', name:'Mundial',        desc:'Predice todos los partidos',  earned:false },
  { icon:'👑', name:'GOLZI Elite',    desc:'Top 10 global',               earned:false },
];

// ─── XP BAR COMPONENT ─────────────────────────────────────────────────────────
function XPBar({ pts }: { pts: number }) {
  const level    = getLevel(pts);
  const nextLv   = getNextLevel(pts);
  const progress = getLevelProgress(pts);
  const pctWidth = `${Math.round(progress * 100)}%` as any;

  return (
    <View style={xp.container}>
      {/* Level badge + next */}
      <View style={xp.labelRow}>
        <View style={[xp.levelBadge, { borderColor: level.color + '55', backgroundColor: level.color + '18' }]}>
          <Text style={xp.levelIcon}>{level.icon}</Text>
          <Text style={[xp.levelName, { color: level.color }]}>{level.name}</Text>
        </View>
        {nextLv && (
          <Text style={xp.nextLabel}>
            {nextLv.max - pts > 0 ? `${nextLv.max - pts} pts → ${nextLv.icon} ${nextLv.name}` : ''}
          </Text>
        )}
        {!nextLv && (
          <Text style={[xp.nextLabel, { color: C.gold }]}>NIVEL MAXIMO 👑</Text>
        )}
      </View>

      {/* Progress bar */}
      <View style={xp.barTrack}>
        <LinearGradient
          colors={[level.color, level.color + 'AA']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[xp.barFill, { width: pctWidth }]}
        />
        {/* Glow dot at end */}
        <View style={[xp.barDot, { left: pctWidth, backgroundColor: level.color }]} />
      </View>

      {/* pts range */}
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
  levelBadge:{ flexDirection:'row', alignItems:'center', gap:5, borderRadius:8, borderWidth:1, paddingHorizontal:10, paddingVertical:4 },
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

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { t } = useTranslation();
  const TABS = [t('profile_tab'), t('history_tab'), t('badges_tab')];
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [tab, setTab] = useState(0);

  // Mock pts — reemplazar con dato real de Firestore
  const userPts = 421;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  async function handleLogout() {
    try {
      await logout();
      navigation.reset({ index:0, routes:[{ name:'Splash' }] });
    } catch (e) { console.error(e); }
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
            <Text style={s.headerTitle}>PERFIL</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        <TouchableOpacity style={s.settingsBtn}>
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
              <Text style={s.avatarTxt}>V</Text>
            </LinearGradient>
            <View style={s.heroInfo}>
              <Text style={s.username}>VIAEXPRESS</Text>
              <View style={s.heroRow}>
                <LinearGradient colors={['rgba(255,215,0,0.2)','rgba(255,215,0,0.08)']} style={s.planBadge}>
                  <Text style={s.planTxt}>⚽ PLAYER</Text>
                </LinearGradient>
                <View style={s.rankBadge}>
                  <Text style={s.rankTxt}>#2 Global</Text>
                </View>
              </View>
            </View>
          </View>

          {/* XP BAR */}
          <View style={s.xpWrap}>
            <XPBar pts={userPts} />
          </View>
        </View>

        {/* STATS ROW */}
        <View style={s.statsRow}>
          {[
            { val:'47',  lbl:t('profile_predictions'), c:C.gold  },
            { val:'4',   lbl:t('profile_exact'),        c:C.green },
            { val:'421', lbl:t('profile_points'),       c:C.gold  },
            { val:'3',   lbl:t('profile_streak'),       c:C.gold2 },
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

            {/* NIVELES INFO CARD */}
            <View style={s.infoCard}>
              <Text style={s.cardTitle}>NIVELES XP</Text>
              {LEVELS.map((lv, i) => {
                const isActive = getLevel(userPts).name === lv.name;
                return (
                  <View key={i} style={[s.lvRow, i === LEVELS.length - 1 && { borderBottomWidth:0 }]}>
                    <Text style={s.lvIcon}>{lv.icon}</Text>
                    <View style={s.lvInfo}>
                      <Text style={[s.lvName, { color: isActive ? lv.color : C.muted }]}>
                        {lv.name}
                        {isActive && <Text style={{ fontSize:9 }}> ← TU NIVEL</Text>}
                      </Text>
                      <Text style={s.lvRange}>{lv.min} – {lv.name === 'GOLZAIR ELITE' ? '∞' : lv.max} pts</Text>
                    </View>
                    {isActive && (
                      <View style={[s.activeDot, { backgroundColor: lv.color }]} />
                    )}
                  </View>
                );
              })}
            </View>

            <View style={s.infoCard}>
              <Text style={s.cardTitle}>{t('profile_info')}</Text>
              {[
                { lbl:t('profile_user'),    val:'@viaexpress'     },
                { lbl:t('profile_country'), val:'🇨🇴 Colombia'    },
                { lbl:t('profile_plan'),    val:'PLAYER', gold:true },
                { lbl:t('profile_member'),  val:'Abr 2026'        },
                { lbl:t('profile_league'),  val:'Los Golzaires'   },
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

            <TouchableOpacity style={s.upgradeBtn} onPress={() => navigation.navigate('Plans')} activeOpacity={0.85}>
              <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.upgradeBtnInner}>
                <Text style={s.upgradeTxt}>⚡ {t('profile_upgrade')}</Text>
                <Text style={s.upgradeSub}>{t('profile_upgrade_sub')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => sendLocalNotification(
                GOLZI_NOTIFICATIONS.predictionCorrect(10).title,
                GOLZI_NOTIFICATIONS.predictionCorrect(10).body
              )}
            >
              <Text style={s.notifTxt}>🔔 {t('profile_test_notif')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Text style={s.logoutTxt}>🚪 {t('profile_logout')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 1 — HISTORIAL */}
        {tab === 1 && (
          <View style={s.tabContent}>
            {HISTORY.map((h,i) => (
              <LinearGradient
                key={i}
                colors={
                  h.type==='exact'   ? ['rgba(0,255,135,0.08)','rgba(0,255,135,0.02)'] :
                  h.type==='winner'  ? ['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)'] :
                  ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']
                }
                style={s.histRow}
              >
                <View style={[s.histTypeLine, {
                  backgroundColor: h.type==='exact' ? C.green : h.type==='winner' ? C.gold : C.muted
                }]} />
                <View style={s.histLeft}>
                  <Text style={s.histMatch}>{h.match}</Text>
                  <Text style={s.histDetail}>
                    Tu pred: <Text style={{ color:C.muted2 }}>{h.pred}</Text>
                    {h.result !== '?' && <Text> · Resultado: <Text style={{ color:C.text }}>{h.result}</Text></Text>}
                    {h.result === '?' && <Text style={{ color:C.muted }}> · Pendiente</Text>}
                  </Text>
                </View>
                <View style={[
                  s.ptsBadge,
                  h.type==='exact'   && { backgroundColor:'rgba(0,255,135,0.15)', borderColor:'rgba(0,255,135,0.3)' },
                  h.type==='winner'  && { backgroundColor:'rgba(255,215,0,0.12)',  borderColor:'rgba(255,215,0,0.3)' },
                  h.type==='pending' && { backgroundColor:'rgba(136,136,136,0.06)', borderColor:'rgba(136,136,136,0.15)' },
                ]}>
                  <Text style={[
                    s.ptsTxt,
                    h.type==='exact'   && { color:C.green },
                    h.type==='winner'  && { color:C.gold },
                    h.type==='pending' && { color:C.muted },
                  ]}>{h.pts}</Text>
                </View>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* TAB 2 — BADGES */}
        {tab === 2 && (
          <View style={s.badgesGrid}>
            {BADGES.map((b,i) => (
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
                  <View style={s.earnedPill}>
                    <Text style={s.earnedTxt}>✓ OBTENIDO</Text>
                  </View>
                ) : (
                  <View style={s.lockedPill}>
                    <Text style={s.lockedTxt}>🔒 BLOQUEADO</Text>
                  </View>
                )}
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
  settingsBtn:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.05)', alignItems:'center', justifyContent:'center' },

  scroll:{ paddingBottom:40 },

  heroCard:{ margin:12, borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', overflow:'hidden', position:'relative' },
  heroTopLine:{ height:2, backgroundColor:C.gold },
  heroCardInner:{ flexDirection:'row', alignItems:'center', gap:16, padding:18, paddingBottom:8 },
  avatar:{ width:70, height:70, borderRadius:35, alignItems:'center', justifyContent:'center' },
  avatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:36, color:'#000' },
  heroInfo:{ flex:1, gap:10 },
  heroRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  username:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.text, letterSpacing:2 },
  planBadge:{ borderRadius:8, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:10, paddingVertical:5 },
  planTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.gold, letterSpacing:1 },
  rankBadge:{ backgroundColor:'rgba(0,255,135,0.1)', borderRadius:8, borderWidth:1, borderColor:'rgba(0,255,135,0.25)', paddingHorizontal:10, paddingVertical:5 },
  rankTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.green },
  xpWrap:{ paddingHorizontal:18, paddingBottom:16 },

  statsRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginBottom:12 },
  statCard:{ flex:1, borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:10, alignItems:'center' },
  statVal:{ fontFamily:'BebasNeue_400Regular', fontSize:26, lineHeight:28 },
  statLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:7, color:C.muted, marginTop:2, letterSpacing:0.5, textAlign:'center' },

  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginBottom:12 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },

  tabContent:{ paddingHorizontal:12, gap:10 },

  // Niveles
  lvRow:{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  lvIcon:{ fontSize:20, width:28, textAlign:'center' },
  lvInfo:{ flex:1, gap:2 },
  lvName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, letterSpacing:1 },
  lvRange:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },
  activeDot:{ width:8, height:8, borderRadius:4 },

  infoCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.1)', padding:16 },
  cardTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:12 },
  infoRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:11, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  infoLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted },
  infoVal:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.text },

  upgradeBtn:{ borderRadius:14, overflow:'hidden' },
  upgradeBtnInner:{ borderRadius:14, paddingVertical:16, alignItems:'center' },
  upgradeTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:'#000', letterSpacing:2 },
  upgradeSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'rgba(0,0,0,0.6)', marginTop:3 },

  notifBtn:{ backgroundColor:'rgba(255,215,0,0.06)', borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:14, alignItems:'center' },
  notifTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.gold, letterSpacing:1 },

  logoutBtn:{ backgroundColor:'rgba(255,51,85,0.06)', borderRadius:14, borderWidth:1, borderColor:'rgba(255,51,85,0.2)', padding:14, alignItems:'center' },
  logoutTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.red, letterSpacing:1 },

  histRow:{ borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', flexDirection:'row', alignItems:'center', gap:12, overflow:'hidden' },
  histTypeLine:{ width:3, alignSelf:'stretch' },
  histLeft:{ flex:1, gap:4, paddingVertical:12 },
  histMatch:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.text },
  histDetail:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  ptsBadge:{ borderWidth:1, borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginRight:12 },
  ptsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16 },

  badgesGrid:{ flexDirection:'row', flexWrap:'wrap', gap:10, paddingHorizontal:12 },
  badgeCard:{ borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:14, width:'47%', alignItems:'center', gap:6, overflow:'hidden' },
  badgeCardLocked:{ borderColor:'rgba(255,255,255,0.06)' },
  badgeTopLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:C.gold },
  badgeIcon:{ fontSize:36 },
  badgeName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.gold, textAlign:'center' },
  badgeDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, textAlign:'center', lineHeight:14 },
  earnedPill:{ backgroundColor:'rgba(0,255,135,0.12)', borderRadius:20, paddingHorizontal:10, paddingVertical:3, borderWidth:1, borderColor:'rgba(0,255,135,0.25)' },
  earnedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.green, letterSpacing:1 },
  lockedPill:{ backgroundColor:'rgba(136,136,136,0.08)', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  lockedTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },
});