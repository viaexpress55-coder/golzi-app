import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { logout } from '../../services/auth';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
};

const STATS = [
  { label:'Predicciones', value:'47', color:C.gold  },
  { label:'Exactas',      value:'4',  color:C.green },
  { label:'Puntos',       value:'421',color:C.cyan  },
  { label:'Racha',        value:'3',  color:C.gold  },
];

const HISTORY = [
  { match:'Mexico vs Canada',    pred:'2-0', result:'3-1', pts:'+5',  type:'winner'  },
  { match:'Brasil vs Costa Rica',pred:'2-1', result:'2-1', pts:'+10', type:'exact'   },
  { match:'USA vs Gales',        pred:'1-0', result:'?',   pts:'--',  type:'pending' },
  { match:'Argentina vs Peru',   pred:'2-0', result:'?',   pts:'--',  type:'pending' },
];

const BADGES = [
  { icon:'🎯', name:'Primer Exacto',  desc:'Primera prediccion exacta',  earned:true  },
  { icon:'🔥', name:'Racha x3',       desc:'3 correctas seguidas',        earned:true  },
  { icon:'⚽', name:'Goleador',       desc:'10 predicciones exactas',     earned:false },
  { icon:'🏆', name:'Campeon',        desc:'Gana una liga privada',       earned:false },
  { icon:'🌍', name:'Mundial',        desc:'Predice todos los partidos',  earned:false },
  { icon:'👑', name:'GOLZI Elite',    desc:'Top 10 global',               earned:false },
];

const TABS = ['PERFIL', 'HISTORIAL', 'BADGES'];

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [tab, setTab] = useState(0);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
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
      <View style={s.bgGlow} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerIcon}>👤</Text>
          <Text style={s.headerTitle}>PERFIL</Text>
        </View>
        <TouchableOpacity style={s.settingsBtn}>
          <Text style={s.settingsTxt}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar hero */}
        <LinearGradient
          colors={['rgba(255,215,0,0.1)','rgba(255,165,0,0.05)']}
          start={{x:0,y:0}} end={{x:1,y:1}}
          style={s.avatarHero}
        >
          <View style={s.avatar}>
            <Text style={s.avatarFlag}>🇨🇴</Text>
          </View>
          <View style={s.avatarInfo}>
            <Text style={s.username}>viaexpress</Text>
            <View style={s.planRow}>
              <View style={s.planBadge}>
                <Text style={s.planTxt}>PLAYER</Text>
              </View>
              <Text style={s.rankTxt}>#2 Global</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={s.statsRow}>
          {STATS.map((st,i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statVal, { color:st.color }]}>{st.value}</Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {TABS.map((t,i) => (
            <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
              <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PERFIL */}
        {tab === 0 && (
          <View>
            <View style={s.infoCard}>
              <Text style={s.infoTitle}>INFORMACION</Text>
              {[
                { label:'Usuario',      value:'@viaexpress'    },
                { label:'Pais',         value:'Colombia'       },
                { label:'Plan',         value:'PLAYER'         },
                { label:'Miembro desde',value:'Abr 2026'       },
                { label:'Liga activa',  value:'Los Golzaires'  },
              ].map((row,i) => (
                <View key={i} style={[s.infoRow, i===4 && {borderBottomWidth:0}]}>
                  <Text style={s.infoLbl}>{row.label}</Text>
                  <Text style={[s.infoVal, row.label==='Plan' && {color:C.gold}]}>{row.value}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.upgradeBtn}>
              <LinearGradient colors={['rgba(255,215,0,0.12)','rgba(255,165,0,0.06)']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.upgradeBtnInner}>
                <Text style={s.upgradeTxt}>MEJORAR A LIGA — $4.99/torneo</Text>
                <Text style={s.upgradeSub}>Crea tus propias ligas privadas</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Text style={s.logoutTxt}>Cerrar sesion</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HISTORIAL */}
        {tab === 1 && (
          <View>
            {HISTORY.map((h,i) => (
              <View key={i} style={s.histRow}>
                <View style={s.histLeft}>
                  <Text style={s.histMatch}>{h.match}</Text>
                  <Text style={s.histDetail}>
                    Tu: {h.pred} · {h.result !== '?' ? `Resultado: ${h.result}` : 'En espera'}
                  </Text>
                </View>
                <View style={[
                  s.ptsBadge,
                  h.type==='exact'   && {backgroundColor:'rgba(0,255,135,0.12)', borderColor:'rgba(0,255,135,0.28)'},
                  h.type==='winner'  && {backgroundColor:'rgba(255,215,0,0.1)',   borderColor:'rgba(255,215,0,0.25)'},
                  h.type==='pending' && {backgroundColor:'rgba(136,136,136,0.08)',borderColor:'rgba(136,136,136,0.15)'},
                ]}>
                  <Text style={[
                    s.ptsTxt,
                    h.type==='exact'  && {color:C.green},
                    h.type==='winner' && {color:C.gold},
                  ]}>{h.pts}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* BADGES */}
        {tab === 2 && (
          <View style={s.badgesGrid}>
            {BADGES.map((b,i) => (
              <View key={i} style={[s.badgeCard, !b.earned && s.badgeCardLocked]}>
                <Text style={[s.badgeIcon, !b.earned && {opacity:0.3}]}>{b.icon}</Text>
                <Text style={[s.badgeName, !b.earned && {color:C.muted}]}>{b.name}</Text>
                <Text style={s.badgeDesc}>{b.desc}</Text>
                {b.earned && (
                  <View style={s.earnedBadge}>
                    <Text style={s.earnedTxt}>OBTENIDO</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  bgGlow:{ position:'absolute', width:300, height:300, borderRadius:150, top:-60, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.08)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:13, paddingTop:48, paddingBottom:10 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  headerIcon:{ fontSize:17 },
  headerTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:17, color:C.gold, letterSpacing:2 },
  settingsBtn:{ width:32, alignItems:'flex-end' },
  settingsTxt:{ fontSize:18, color:C.muted },
  scroll:{ paddingHorizontal:13, paddingBottom:40 },
  avatarHero:{ borderWidth:1, borderColor:C.border, borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', gap:14, marginBottom:12 },
  avatar:{ width:56, height:56, borderRadius:28, backgroundColor:'rgba(0,255,135,0.12)', borderWidth:2, borderColor:C.green, alignItems:'center', justifyContent:'center' },
  avatarFlag:{ fontSize:28 },
  avatarInfo:{ flex:1 },
  username:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.text, letterSpacing:1, marginBottom:6 },
  planRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  planBadge:{ backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:C.border, borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  planTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.gold, letterSpacing:1 },
  rankTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted },
  statsRow:{ flexDirection:'row', gap:7, marginBottom:12 },
  statCard:{ flex:1, backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:10, padding:10, alignItems:'center' },
  statVal:{ fontFamily:'BebasNeue_400Regular', fontSize:22, lineHeight:26 },
  statLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted, marginTop:2, letterSpacing:0.5, textAlign:'center' },
  tabRow:{ flexDirection:'row', gap:6, marginBottom:12 },
  tab:{ flex:1, paddingVertical:6, borderRadius:7, backgroundColor:C.surface, alignItems:'center', borderWidth:1, borderColor:C.border2 },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:C.border },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  infoCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:12, padding:14, marginBottom:10 },
  infoTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted, letterSpacing:2, marginBottom:10 },
  infoRow:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:9, borderBottomWidth:1, borderBottomColor:C.border2 },
  infoLbl:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted },
  infoVal:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.text },
  upgradeBtn:{ borderRadius:12, overflow:'hidden', marginBottom:8 },
  upgradeBtnInner:{ borderWidth:1, borderColor:C.border, borderRadius:12, padding:14, alignItems:'center' },
  upgradeTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:15, color:C.gold, letterSpacing:1 },
  upgradeSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, marginTop:3 },
  logoutBtn:{ borderWidth:1, borderColor:'rgba(232,0,61,0.2)', borderRadius:12, padding:12, alignItems:'center' },
  logoutTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.red },
  histRow:{ flexDirection:'row', alignItems:'center', paddingVertical:11, borderBottomWidth:1, borderBottomColor:C.border2, gap:10 },
  histLeft:{ flex:1 },
  histMatch:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.text, marginBottom:2 },
  histDetail:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  ptsBadge:{ borderWidth:1, borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  ptsTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:14, color:C.muted },
  badgesGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  badgeCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:12, width:'47%', alignItems:'center' },
  badgeCardLocked:{ borderColor:C.border2, opacity:0.7 },
  badgeIcon:{ fontSize:30, marginBottom:6 },
  badgeName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.gold, textAlign:'center', marginBottom:2 },
  badgeDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, textAlign:'center', lineHeight:14 },
  earnedBadge:{ marginTop:6, backgroundColor:'rgba(0,255,135,0.12)', borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  earnedTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.green, letterSpacing:1 },
});