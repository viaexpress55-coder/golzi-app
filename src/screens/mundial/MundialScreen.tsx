import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  gold:'#FFD700', gold2:'#FFA500', goldBorder:'rgba(255,215,0,0.25)',
  text:'#FFFFFF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', cyan:'#00C6FF', red:'#FF3355',
};

const GROUPS = [
  { name:'A', teams:[
    { flag:'🇲🇽', name:'México' },
    { flag:'🇿🇦', name:'Sudáfrica' },
    { flag:'🇰🇷', name:'Corea del Sur' },
    { flag:'🇨🇿', name:'Chequia' },
  ]},
  { name:'B', teams:[
    { flag:'🇨🇦', name:'Canadá' },
    { flag:'🇧🇦', name:'Bosnia y Herz.' },
    { flag:'🇶🇦', name:'Qatar' },
    { flag:'🇨🇭', name:'Suiza' },
  ]},
  { name:'C', teams:[
    { flag:'🇧🇷', name:'Brasil' },
    { flag:'🇲🇦', name:'Marruecos' },
    { flag:'🇭🇹', name:'Haití' },
    { flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', name:'Escocia' },
  ]},
  { name:'D', teams:[
    { flag:'🇺🇸', name:'USA' },
    { flag:'🇵🇾', name:'Paraguay' },
    { flag:'🇦🇺', name:'Australia' },
    { flag:'🇹🇷', name:'Türkiye' },
  ]},
  { name:'E', teams:[
    { flag:'🇩🇪', name:'Alemania' },
    { flag:'🇨🇼', name:'Curaçao' },
    { flag:'🇨🇮', name:'Costa de Marfil' },
    { flag:'🇪🇨', name:'Ecuador' },
  ]},
  { name:'F', teams:[
    { flag:'🇳🇱', name:'Países Bajos' },
    { flag:'🇯🇵', name:'Japón' },
    { flag:'🇹🇳', name:'Túnez' },
    { flag:'🇸🇪', name:'Suecia' },
  ]},
  { name:'G', teams:[
    { flag:'🇧🇪', name:'Bélgica' },
    { flag:'🇪🇬', name:'Egipto' },
    { flag:'🇮🇷', name:'Irán' },
    { flag:'🇳🇿', name:'Nueva Zelanda' },
  ]},
  { name:'H', teams:[
    { flag:'🇪🇸', name:'España' },
    { flag:'🇨🇻', name:'Cabo Verde' },
    { flag:'🇸🇦', name:'Arabia Saudita' },
    { flag:'🇺🇾', name:'Uruguay' },
  ]},
  { name:'I', teams:[
    { flag:'🇫🇷', name:'Francia' },
    { flag:'🇸🇳', name:'Senegal' },
    { flag:'🇳🇴', name:'Noruega' },
    { flag:'🇮🇶', name:'Iraq' },
  ]},
  { name:'J', teams:[
    { flag:'🇦🇷', name:'Argentina' },
    { flag:'🇩🇿', name:'Argelia' },
    { flag:'🇦🇹', name:'Austria' },
    { flag:'🇯🇴', name:'Jordania' },
  ]},
  { name:'K', teams:[
    { flag:'🇵🇹', name:'Portugal' },
    { flag:'🇨🇩', name:'Congo DR' },
    { flag:'🇺🇿', name:'Uzbekistán' },
    { flag:'🇨🇴', name:'Colombia' },
  ]},
  { name:'L', teams:[
    { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Inglaterra' },
    { flag:'🇭🇷', name:'Croacia' },
    { flag:'🇬🇭', name:'Ghana' },
    { flag:'🇵🇦', name:'Panamá' },
  ]},
];

const GROUP_COLORS = [
  C.gold, C.cyan, C.green, '#FF6B6B',
  '#9B59B6', '#E67E22', '#1ABC9C', '#E74C3C',
  C.gold2, '#3498DB', '#2ECC71', '#E91E63',
];

export default function MundialScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [selGroup, setSelGroup] = useState<string|null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    async function loadMatches() {
      setLoadingMatches(true);
      try {
        const q = query(collection(db, 'matches'), orderBy('kickoffTime', 'asc'));
        const snap = await getDocs(q);
        setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) { console.error(e); }
      finally { setLoadingMatches(false); }
    }
    loadMatches();
  }, []);

  const TABS = [t('mundial_groups'), t('mundial_fixture'), t('mundial_teams')];

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  if (!fontsLoaded) return <View style={s.root} />;

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
            <Text style={s.headerTitle}>{t('mundial_title')}</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        <View style={s.teamCountBadge}>
          <Text style={s.teamCountNum}>48</Text>
          <Text style={s.teamCountLbl}>{t('mundial_teams')}</Text>
        </View>
      </LinearGradient>

      {/* TABS */}
      <View style={s.tabRow}>
        {TABS.map((tabName,i) => (
          <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{tabName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* GRUPOS */}
        {tab === 0 && GROUPS.map((g, gi) => {
          const color = GROUP_COLORS[gi % GROUP_COLORS.length];
          const isOpen = selGroup === g.name;
          return (
            <View key={g.name} style={[s.groupCard, isOpen && { borderColor: `${color}50` }]}>
              <LinearGradient
                colors={[`${color}10`,'transparent']}
                start={{x:0,y:0}} end={{x:1,y:1}}
                style={s.groupCardGlow}
              />
              <View style={[s.groupTopLine, { backgroundColor: color }]} />

              <TouchableOpacity
                style={s.groupHeader}
                onPress={() => setSelGroup(isOpen ? null : g.name)}
              >
                <View style={s.groupHeaderLeft}>
                  <LinearGradient colors={[color, `${color}99`]} style={s.groupLetterBox}>
                    <Text style={s.groupLetter}>{g.name}</Text>
                  </LinearGradient>
                  <Text style={[s.groupName, { color }]}>GRUPO {g.name}</Text>
                </View>
                <Text style={[s.groupArrow, { color }]}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              <View style={s.groupPreview}>
                {g.teams.map((team,i) => (
                  <View key={i} style={s.previewTeam}>
                    <Text style={s.previewFlag}>{team.flag}</Text>
                    <Text style={s.previewName}>{team.name}</Text>
                  </View>
                ))}
              </View>

              {isOpen && (
                <View style={s.table}>
                  <View style={s.tableHeader}>
                    <Text style={[s.th, { flex:2, textAlign:'left' }]}>EQUIPO</Text>
                    <Text style={s.th}>PJ</Text>
                    <Text style={s.th}>G</Text>
                    <Text style={s.th}>E</Text>
                    <Text style={s.th}>P</Text>
                    <Text style={s.th}>GD</Text>
                    <Text style={[s.th, { color }]}>PTS</Text>
                  </View>
                  {g.teams.map((team,i) => (
                    <View key={i} style={[
                      s.tableRow,
                      i < 2 && { borderLeftWidth:2, borderLeftColor:C.green },
                      i === g.teams.length-1 && { borderBottomWidth:0 }
                    ]}>
                      <View style={[s.tdTeam, { flex:2 }]}>
                        <Text style={s.tdFlag}>{team.flag}</Text>
                        <Text style={s.tdName}>{team.name}</Text>
                      </View>
                      <Text style={s.td}>0</Text>
                      <Text style={s.td}>0</Text>
                      <Text style={s.td}>0</Text>
                      <Text style={s.td}>0</Text>
                      <Text style={s.td}>0</Text>
                      <Text style={[s.td, { color, fontFamily:'BebasNeue_400Regular', fontSize:14 }]}>0</Text>
                    </View>
                  ))}
                  <View style={s.classifyLegend}>
                    <View style={s.classifyDot} />
                    <Text style={s.classifyTxt}>Clasifica a octavos de final</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* FIXTURE */}
        {tab === 1 && (
          <View>
            {loadingMatches ? (
              <ActivityIndicator color="#FFD700" style={{ marginTop: 40 }} />
            ) : (
              (() => {
                const grouped: Record<string, any[]> = {};
                matches.forEach(m => {
                  const key = m.group || m.round || 'Otros';
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(m);
                });
                return Object.entries(grouped).map(([group, groupMatches]) => (
                  <View key={group} style={{ marginBottom: 16 }}>
                    <View style={s.divider}>
                      <View style={s.dividerLine} />
                      <Text style={s.dividerTxt}>{group}</Text>
                      <View style={s.dividerLine} />
                    </View>
                    {groupMatches.map((m, i) => {
                      const kickoff = m.kickoffTime ? new Date(m.kickoffTime.seconds * 1000) : null;
                      const dateStr = kickoff ? kickoff.toLocaleDateString('es', { day:'numeric', month:'short' }) : '';
                      const timeStr = kickoff ? kickoff.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' }) : '';
                      const isFinished = m.status === 'FINISHED' || m.status === 'finished';
                      const isLive = m.status === 'IN_PLAY' || m.status === 'live';
                      return (
                        <LinearGradient
                          key={i}
                          colors={isLive ? ['rgba(255,51,85,0.1)','rgba(255,51,85,0.03)'] : isFinished ? ['rgba(0,255,135,0.06)','rgba(0,255,135,0.01)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
                          style={s.fixtureCard}
                        >
                          <View style={{ flex:1, alignItems:'center' }}>
                            <Text style={s.fixtureFlag}>{m.homeFlag || '🌍'}</Text>
                            <Text style={s.fixtureName}>{(m.homeTeam||'').slice(0,3).toUpperCase()}</Text>
                          </View>
                          <View style={s.fixtureCenter}>
                            {isLive ? (
                              <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:'#FF3355' }}>EN VIVO</Text>
                            ) : isFinished ? (
                              <Text style={s.fixtureScore}>{m.homeScore} - {m.awayScore}</Text>
                            ) : (
                              <>
                                <Text style={s.fixtureDate}>{dateStr}</Text>
                                <Text style={s.fixtureTime}>{timeStr}</Text>
                              </>
                            )}
                            <Text style={s.fixtureStadium} numberOfLines={1}>{m.stadium || m.city || ''}</Text>
                          </View>
                          <View style={{ flex:1, alignItems:'center' }}>
                            <Text style={s.fixtureFlag}>{m.awayFlag || '🌍'}</Text>
                            <Text style={s.fixtureName}>{(m.awayTeam||'').slice(0,3).toUpperCase()}</Text>
                          </View>
                        </LinearGradient>
                      );
                    })}
                  </View>
                ));
              })()
            )}
          </View>
        )}

        {/* EQUIPOS */}
        {tab === 2 && (
          <View style={s.teamsGrid}>
            {GROUPS.flatMap(g => g.teams).map((team,i) => (
              <LinearGradient
                key={i}
                colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']}
                style={s.teamCard}
              >
                <Text style={s.teamCardFlag}>{team.flag}</Text>
                <Text style={s.teamCardName}>{team.name}</Text>
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
  teamCountBadge:{ alignItems:'center' },
  teamCountNum:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold },
  teamCountLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },

  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginVertical:10 },
  tab:{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },

  scroll:{ paddingHorizontal:12, paddingBottom:40 },

  groupCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', marginBottom:10, overflow:'hidden', shadowColor:'#FFD700', shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:8, elevation:5 },
  groupCardGlow:{ position:'absolute', top:0, left:0, right:0, bottom:0 },
  groupTopLine:{ height:2 },
  groupHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14 },
  groupHeaderLeft:{ flexDirection:'row', alignItems:'center', gap:10 },
  groupLetterBox:{ width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center' },
  groupLetter:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:'#000' },
  groupName:{ fontFamily:'BebasNeue_400Regular', fontSize:18, letterSpacing:2 },
  groupArrow:{ fontSize:10 },

  groupPreview:{ flexDirection:'row', paddingHorizontal:14, paddingBottom:12, gap:12, flexWrap:'wrap' },
  previewTeam:{ flexDirection:'row', alignItems:'center', gap:5 },
  previewFlag:{ fontSize:16 },
  previewName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2 },

  table:{ borderTopWidth:1, borderTopColor:'rgba(255,215,0,0.1)', padding:12 },
  tableHeader:{ flexDirection:'row', paddingBottom:8, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.05)' },
  th:{ flex:1, fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, textAlign:'center', letterSpacing:0.5 },
  tableRow:{ flexDirection:'row', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.04)', alignItems:'center', paddingLeft:4 },
  tdTeam:{ flexDirection:'row', alignItems:'center', gap:6 },
  tdFlag:{ fontSize:16 },
  tdName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.text },
  td:{ flex:1, fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted2, textAlign:'center' },
  classifyLegend:{ flexDirection:'row', alignItems:'center', gap:6, marginTop:10 },
  classifyDot:{ width:8, height:8, borderRadius:2, backgroundColor:C.green },
  classifyTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },

  comingSoon:{ borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.2)', padding:40, alignItems:'center', marginTop:8 },
  comingSoonLogo:{ width:70, height:70, marginBottom:16 },
  comingSoonTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:3, marginBottom:8 },
  comingSoonSub:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted2, letterSpacing:1, marginBottom:12 },
  comingSoonBadge:{ backgroundColor:'rgba(255,215,0,0.1)', borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', paddingHorizontal:16, paddingVertical:6 },
  comingSoonBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.gold, letterSpacing:1 },

  divider:{ flexDirection:'row', alignItems:'center', marginVertical:8, gap:10 },
  dividerLine:{ flex:1, height:1, backgroundColor:'rgba(255,215,0,0.15)' },
  dividerTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:3 },
  fixtureCard:{ flexDirection:'row', alignItems:'center', borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', padding:10, marginBottom:6 },
  fixtureFlag:{ fontSize:24, marginBottom:4 },
  fixtureName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.text },
  fixtureCenter:{ flex:1, alignItems:'center', gap:2 },
  fixtureDate:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.gold },
  fixtureTime:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  fixtureScore:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.green },
  fixtureStadium:{ fontFamily:'BarlowCondensed_400Regular', fontSize:8, color:C.muted, textAlign:'center' },
  teamsGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  teamCard:{ borderRadius:12, borderWidth:1, borderColor:'rgba(255,215,0,0.3)', padding:12, alignItems:'center', width:'31%', shadowColor:'#FFD700', shadowOffset:{width:0,height:3}, shadowOpacity:0.2, shadowRadius:6, elevation:4 },
  teamCardFlag:{ fontSize:28, marginBottom:6 },
  teamCardName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:9, color:C.text, textAlign:'center' },
});