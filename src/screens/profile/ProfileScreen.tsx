import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', green:'#00C853', red:'#E8003D',
  cyan:'#00C6FF', border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const STATS = [
  { label:'Predicciones', value:'47' },
  { label:'Exactas',      value:'4'  },
  { label:'Puntos',       value:'421'},
  { label:'Racha',        value:'3'  },
];

const HISTORY = [
  { match:'🇲🇽 Mexico vs Canada 🇨🇦', pred:'2-0', result:'3-1', pts:'+5',  type:'winner' },
  { match:'🇧🇷 Brasil vs Mexico 🇲🇽',  pred:'2-1', result:'2-1', pts:'+10', type:'exact'  },
  { match:'🇺🇸 USA vs Panama 🇵🇦',     pred:'1-0', result:'?',   pts:'--',  type:'pending'},
  { match:'🇦🇷 Argentina vs Polonia 🇵🇱',pred:'2-0',result:'?',  pts:'--',  type:'pending'},
];

const BADGES = [
  { icon:'🎯', name:'Primer Exacto',  desc:'Primera prediccion exacta',     earned:true  },
  { icon:'🔥', name:'Racha x3',       desc:'3 predicciones correctas',       earned:true  },
  { icon:'⚽', name:'Goleador',       desc:'10 predicciones exactas',        earned:false },
  { icon:'🏆', name:'Campeon',        desc:'Gana una liga privada',          earned:false },
  { icon:'🌍', name:'Mundial',        desc:'Predice todos los partidos',     earned:false },
  { icon:'👑', name:'GOLZI Elite',    desc:'Alcanza el top 10 global',       earned:false },
];

const TABS = ['PERFIL', 'HISTORIAL', 'BADGES'];

export default function ProfileScreen() {
  const [tab, setTab] = useState(0);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.logo}>GOLZI</Text>
        <Text style={s.headerTitle}>PERFIL</Text>
        <TouchableOpacity style={s.settingsBtn}>
          <Text style={s.settingsTxt}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar y nombre */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarFlag}>🇨🇴</Text>
          </View>
          <Text style={s.username}>viaexpress</Text>
          <View style={s.planRow}>
            <View style={s.planBadge}>
              <Text style={s.planTxt}>PLAYER</Text>
            </View>
            <Text style={s.rankTxt}>#12 Global</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={s.statsGrid}>
          {STATS.map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {TABS.map((t, i) => (
            <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabActive]} onPress={() => setTab(i)}>
              <Text style={[s.tabTxt, tab === i && s.tabTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PERFIL */}
        {tab === 0 && (
          <View>
            <View style={s.infoCard}>
              <Text style={s.infoTitle}>INFORMACION</Text>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Usuario</Text>
                <Text style={s.infoValue}>@viaexpress</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Pais</Text>
                <Text style={s.infoValue}>🇨🇴 Colombia</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Plan</Text>
                <Text style={[s.infoValue, { color: C.gold }]}>PLAYER</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Miembro desde</Text>
                <Text style={s.infoValue}>Abr 2026</Text>
              </View>
              <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={s.infoLabel}>Ligas activas</Text>
                <Text style={s.infoValue}>Los Golzaires</Text>
              </View>
            </View>

            <TouchableOpacity style={s.upgradeBtn}>
              <Text style={s.upgradeTxt}>MEJORAR A LIGA — $4.99/torneo</Text>
              <Text style={s.upgradeSubTxt}>Crea tus propias ligas privadas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.logoutBtn}>
              <Text style={s.logoutTxt}>Cerrar sesion</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HISTORIAL */}
        {tab === 1 && (
          <View>
            {HISTORY.map((h, i) => (
              <View key={i} style={s.histRow}>
                <View style={s.histLeft}>
                  <Text style={s.histMatch}>{h.match}</Text>
                  <Text style={s.histPred}>Tu pred: {h.pred}  {h.result !== '?' ? `Resultado: ${h.result}` : 'En espera'}</Text>
                </View>
                <View style={[
                  s.ptsBadge,
                  h.type === 'exact'   && s.ptsExact,
                  h.type === 'winner'  && s.ptsWinner,
                  h.type === 'pending' && s.ptsPending,
                ]}>
                  <Text style={[
                    s.ptsText,
                    h.type === 'exact'   && { color: C.green },
                    h.type === 'winner'  && { color: C.gold  },
                    h.type === 'pending' && { color: C.muted },
                  ]}>{h.pts}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* BADGES */}
        {tab === 2 && (
          <View style={s.badgesGrid}>
            {BADGES.map((b, i) => (
              <View key={i} style={[s.badgeCard, !b.earned && s.badgeCardLocked]}>
                <Text style={[s.badgeIcon, !b.earned && { opacity: 0.3 }]}>{b.icon}</Text>
                <Text style={[s.badgeName, !b.earned && { color: C.muted }]}>{b.name}</Text>
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
  root:{ flex:1, backgroundColor:C.dark },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:48, paddingBottom:12, borderBottomWidth:1, borderBottomColor:C.border },
  logo:{ fontSize:18, color:C.gold, fontWeight:'900', letterSpacing:3, width:60 },
  headerTitle:{ fontSize:15, color:C.text, fontWeight:'700', letterSpacing:2 },
  settingsBtn:{ width:60, alignItems:'flex-end' },
  settingsTxt:{ fontSize:20, color:C.muted },
  avatarSection:{ alignItems:'center', paddingVertical:24 },
  avatar:{ width:80, height:80, borderRadius:40, backgroundColor:'rgba(0,200,83,0.12)', borderWidth:2, borderColor:C.green, alignItems:'center', justifyContent:'center', marginBottom:10 },
  avatarFlag:{ fontSize:36 },
  username:{ fontSize:22, color:C.text, fontWeight:'900', letterSpacing:1, marginBottom:8 },
  planRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  planBadge:{ backgroundColor:'rgba(255,215,0,0.1)', borderWidth:1, borderColor:C.borderG, borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  planTxt:{ fontSize:11, color:C.gold, fontWeight:'700', letterSpacing:1 },
  rankTxt:{ fontSize:12, color:C.muted },
  statsGrid:{ flexDirection:'row', paddingHorizontal:16, gap:8, marginBottom:16 },
  statCard:{ flex:1, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:10, padding:10, alignItems:'center' },
  statValue:{ fontSize:22, color:C.green, fontWeight:'900' },
  statLabel:{ fontSize:9, color:C.muted, marginTop:2, letterSpacing:0.5 },
  tabRow:{ flexDirection:'row', paddingHorizontal:16, gap:8, marginBottom:16 },
  tab:{ flex:1, paddingVertical:7, borderRadius:8, backgroundColor:C.surface, alignItems:'center', borderWidth:1, borderColor:C.border },
  tabActive:{ backgroundColor:'rgba(0,200,83,0.12)', borderColor:'rgba(0,200,83,0.4)' },
  tabTxt:{ fontSize:11, color:C.muted, fontWeight:'600', letterSpacing:0.5 },
  tabTxtActive:{ color:C.green },
  scroll:{ paddingBottom:40 },
  infoCard:{ marginHorizontal:16, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:12, padding:14, marginBottom:12 },
  infoTitle:{ fontSize:10, color:C.muted, fontWeight:'700', letterSpacing:2, marginBottom:10 },
  infoRow:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border },
  infoLabel:{ fontSize:13, color:C.muted },
  infoValue:{ fontSize:13, color:C.text, fontWeight:'600' },
  upgradeBtn:{ marginHorizontal:16, backgroundColor:'rgba(255,215,0,0.08)', borderWidth:1, borderColor:C.borderG, borderRadius:12, padding:14, alignItems:'center', marginBottom:10 },
  upgradeTxt:{ fontSize:13, color:C.gold, fontWeight:'700', letterSpacing:0.5 },
  upgradeSubTxt:{ fontSize:11, color:C.muted, marginTop:3 },
  logoutBtn:{ marginHorizontal:16, borderWidth:1, borderColor:'rgba(232,0,61,0.2)', borderRadius:12, padding:12, alignItems:'center' },
  logoutTxt:{ fontSize:13, color:C.red, fontWeight:'600' },
  histRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:C.border, gap:10 },
  histLeft:{ flex:1 },
  histMatch:{ fontSize:12, color:C.text, fontWeight:'600', marginBottom:3 },
  histPred:{ fontSize:11, color:C.muted },
  ptsBadge:{ borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  ptsExact:{ backgroundColor:'rgba(0,200,83,0.15)' },
  ptsWinner:{ backgroundColor:'rgba(255,215,0,0.15)' },
  ptsPending:{ backgroundColor:'rgba(136,136,136,0.1)' },
  ptsText:{ fontSize:13, fontWeight:'900' },
  badgesGrid:{ flexDirection:'row', flexWrap:'wrap', paddingHorizontal:16, gap:10 },
  badgeCard:{ backgroundColor:C.surface, borderWidth:1, borderColor:C.borderG, borderRadius:12, padding:12, width:'47%', alignItems:'center' },
  badgeCardLocked:{ borderColor:C.border, opacity:0.7 },
  badgeIcon:{ fontSize:32, marginBottom:6 },
  badgeName:{ fontSize:12, color:C.gold, fontWeight:'700', textAlign:'center', marginBottom:2 },
  badgeDesc:{ fontSize:10, color:C.muted, textAlign:'center', lineHeight:14 },
  earnedBadge:{ marginTop:6, backgroundColor:'rgba(0,200,83,0.15)', borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  earnedTxt:{ fontSize:9, color:C.green, fontWeight:'700', letterSpacing:1 },
});