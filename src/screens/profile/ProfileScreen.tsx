import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
  bg:        '#000000',
  surface:   '#0A0A0A',
  surface2:  '#111111',
  surface3:  '#1A1A1A',
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

const HISTORY = [
  { match:'México vs Canadá',     pred:'2-0', result:'3-1', pts:'+5',  type:'winner'  },
  { match:'Brasil vs Costa Rica', pred:'2-1', result:'2-1', pts:'+10', type:'exact'   },
  { match:'USA vs Gales',         pred:'1-0', result:'?',   pts:'--',  type:'pending' },
  { match:'Argentina vs Perú',    pred:'2-0', result:'?',   pts:'--',  type:'pending' },
];

const BADGES = [
  { icon:'🎯', name:'Primer Exacto',  desc:'Primera predicción exacta',  earned:true  },
  { icon:'🔥', name:'Racha x3',       desc:'3 correctas seguidas',        earned:true  },
  { icon:'⚡', name:'Goleador',       desc:'10 predicciones exactas',     earned:false },
  { icon:'🏆', name:'Campeón',        desc:'Gana una liga privada',       earned:false },
  { icon:'🌍', name:'Mundial',        desc:'Predice todos los partidos',  earned:false },
  { icon:'💎', name:'GOLZI Elite',    desc:'Top 10 global',               earned:false },
];

const TABS = ['PERFIL', 'HISTORIAL', 'BADGES'];

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

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

      {/* HEADER */}
      <LinearGradient colors={['#000','#0A0A0A']} style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconBox}>
            <Text style={{ fontSize:20 }}>👤</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>PERFIL</Text>
            <Text style={s.headerSub}>FIFA WORLD CUP 2026</Text>
          </View>
        </View>
        <TouchableOpacity style={s.settingsBtn}>
          <Text style={{ fontSize:20 }}>⚙️</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* HERO CARD */}
        <LinearGradient
          colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.03)']}
          start={{x:0,y:0}} end={{x:1,y:1}}
          style={s.heroCard}
        >
          {/* Avatar */}
          <LinearGradient
            colors={[C.gold, C.gold2]}
            style={s.avatar}
          >
            <Text style={s.avatarTxt}>V</Text>
          </LinearGradient>

          <View style={s.heroInfo}>
            <Text style={s.username}>viaexpress</Text>
            <View style={s.heroRow}>
              <View style={s.planBadge}>
                <Text style={s.planTxt}>⚽ PLAYER</Text>
              </View>
              <View style={s.rankBadge}>
                <Text style={s.rankTxt}>#2 Global</Text>
              </View>
            </View>
          </View>

          {/* Gold glow */}
          <View style={s.heroGlow} />
        </LinearGradient>

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
              colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']}
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
            <TouchableOpacity
              key={i}
              style={[s.tab, tab===i && s.tabOn]}
              onPress={() => setTab(i)}
            >
              <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tabName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB 0 — PERFIL */}
        {tab === 0 && (
          <View style={s.tabContent}>

            {/* Info card */}
            <View style={s.infoCard}>
              <Text style={s.cardTitle}>{t('profile_info')}</Text>
              {[
                { lbl:t('profile_user'),    val:'@viaexpress'   },
                { lbl:t('profile_country'), val:'🇨🇴 Colombia'   },
                { lbl:t('profile_plan'),    val:'PLAYER', gold:true },
                { lbl:t('profile_member'),  val:'Abr 2026'      },
                { lbl:t('profile_league'),  val:'Los Golzaires' },
              ].map((row,i,arr) => (
                <View key={i} style={[s.infoRow, i===arr.length-1 && {borderBottomWidth:0}]}>
                  <Text style={s.infoLbl}>{row.lbl}</Text>
                  <Text style={[s.infoVal, row.gold && {color:C.gold}]}>{row.val}</Text>
                </View>
              ))}
            </View>

            {/* Language */}
            <View style={s.infoCard}>
              <Text style={s.cardTitle}>{t('profile_language')}</Text>
              <LanguageSelector />
            </View>

            {/* Upgrade button */}
            <TouchableOpacity
              style={s.upgradeBtn}
              onPress={() => navigation.navigate('Plans')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[C.gold, C.gold2]}
                start={{x:0,y:0}} end={{x:1,y:0}}
                style={s.upgradeBtnInner}
              >
                <Text style={s.upgradeTxt}>⚡ {t('profile_upgrade')}</Text>
                <Text style={s.upgradeSub}>{t('profile_upgrade_sub')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Test notification */}
            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => sendLocalNotification(
                GOLZI_NOTIFICATIONS.predictionCorrect(10).title,
                GOLZI_NOTIFICATIONS.predictionCorrect(10).body
              )}
            >
              <Text style={s.notifTxt}>🔔 PROBAR NOTIFICACIÓN</Text>
            </TouchableOpacity>

            {/* Logout */}
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
                <View style={s.histLeft}>
                  <Text style={s.histMatch}>{h.match}</Text>
                  <Text style={s.histDetail}>
                    Tu predicción: <Text style={{color:C.muted2}}>{h.pred}</Text>
                    {h.result !== '?' && <Text> · Resultado: <Text style={{color:C.text}}>{h.result}</Text></Text>}
                    {h.result === '?' && <Text style={{color:C.muted}}> · En espera</Text>}
                  </Text>
                </View>
                <View style={[
                  s.ptsBadge,
                  h.type==='exact'   && {backgroundColor:'rgba(0,255,135,0.15)', borderColor:'rgba(0,255,135,0.3)'},
                  h.type==='winner'  && {backgroundColor:'rgba(255,215,0,0.12)',  borderColor:'rgba(255,215,0,0.3)'},
                  h.type==='pending' && {backgroundColor:'rgba(136,136,136,0.06)',borderColor:'rgba(136,136,136,0.15)'},
                ]}>
                  <Text style={[
                    s.ptsTxt,
                    h.type==='exact'  && {color:C.green},
                    h.type==='winner' && {color:C.gold},
                    h.type==='pending'&& {color:C.muted},
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
                  ? ['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']
                  : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']
                }
                style={[s.badgeCard, !b.earned && s.badgeCardLocked]}
              >
                <Text style={[s.badgeIcon, !b.earned && {opacity:0.25}]}>{b.icon}</Text>
                <Text style={[s.badgeName, !b.earned && {color:C.muted}]}>{b.name}</Text>
                <Text style={s.badgeDesc}>{b.desc}</Text>
                {b.earned && (
                  <View style={s.earnedPill}>
                    <Text style={s.earnedTxt}>✓ OBTENIDO</Text>
                  </View>
                )}
                {!b.earned && (
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

  // Header
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:12 },
  headerIconBox:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', alignItems:'center', justifyContent:'center' },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  headerSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, letterSpacing:2 },
  settingsBtn:{ width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.05)', alignItems:'center', justifyContent:'center' },

  scroll:{ paddingBottom:40 },

  // Hero card
  heroCard:{ margin:12, borderRadius:18, borderWidth:1, borderColor:'rgba(255,215,0,0.25)', padding:18, flexDirection:'row', alignItems:'center', gap:16, overflow:'hidden' },
  avatar:{ width:64, height:64, borderRadius:32, alignItems:'center', justifyContent:'center' },
  avatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:'#000' },
  heroInfo:{ flex:1, gap:8 },
  heroRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  username:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.text, letterSpacing:1 },
  planBadge:{ backgroundColor:'rgba(255,215,0,0.12)', borderRadius:8, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:10, paddingVertical:4 },
  planTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.gold, letterSpacing:1 },
  rankBadge:{ backgroundColor:'rgba(0,255,135,0.1)', borderRadius:8, borderWidth:1, borderColor:'rgba(0,255,135,0.2)', paddingHorizontal:10, paddingVertical:4 },
  rankTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.green },
  heroGlow:{ position:'absolute', right:-30, top:-30, width:120, height:120, borderRadius:60, backgroundColor:'rgba(255,215,0,0.06)' },

  // Stats
  statsRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginBottom:12 },
  statCard:{ flex:1, borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:10, alignItems:'center' },
  statVal:{ fontFamily:'BebasNeue_400Regular', fontSize:24, lineHeight:26 },
  statLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:7, color:C.muted, marginTop:2, letterSpacing:0.5, textAlign:'center' },

  // Tabs
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginBottom:12 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },

  tabContent:{ paddingHorizontal:12, gap:10 },

  // Info card
  infoCard:{ backgroundColor:'#111', borderRadius:16, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:16 },
  cardTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:3, marginBottom:12 },
  infoRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:11, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  infoLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted },
  infoVal:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.text },

  // Upgrade button
  upgradeBtn:{ borderRadius:14, overflow:'hidden' },
  upgradeBtnInner:{ borderRadius:14, paddingVertical:16, alignItems:'center' },
  upgradeTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:'#000', letterSpacing:2 },
  upgradeSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'rgba(0,0,0,0.6)', marginTop:3 },

  // Notification button
  notifBtn:{ backgroundColor:'rgba(255,215,0,0.08)', borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.25)', padding:14, alignItems:'center' },
  notifTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.gold, letterSpacing:1 },

  // Logout
  logoutBtn:{ backgroundColor:'rgba(255,51,85,0.06)', borderRadius:14, borderWidth:1, borderColor:'rgba(255,51,85,0.2)', padding:14, alignItems:'center' },
  logoutTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.red, letterSpacing:1 },

  // History
  histRow:{ borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:14, flexDirection:'row', alignItems:'center', gap:12 },
  histLeft:{ flex:1, gap:4 },
  histMatch:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, color:C.text },
  histDetail:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  ptsBadge:{ borderWidth:1, borderRadius:20, paddingHorizontal:12, paddingVertical:4 },
  ptsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16 },

  // Badges
  badgesGrid:{ flexDirection:'row', flexWrap:'wrap', gap:10, paddingHorizontal:12 },
  badgeCard:{ borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:14, width:'47%', alignItems:'center', gap:6 },
  badgeCardLocked:{ borderColor:'rgba(255,255,255,0.06)' },
  badgeIcon:{ fontSize:36 },
  badgeName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.gold, textAlign:'center' },
  badgeDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, textAlign:'center', lineHeight:14 },
  earnedPill:{ backgroundColor:'rgba(0,255,135,0.12)', borderRadius:20, paddingHorizontal:10, paddingVertical:3, borderWidth:1, borderColor:'rgba(0,255,135,0.25)' },
  earnedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.green, letterSpacing:1 },
  lockedPill:{ backgroundColor:'rgba(136,136,136,0.08)', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  lockedTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted },
});