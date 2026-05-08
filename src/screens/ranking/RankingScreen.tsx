import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';

const C = {
  bg:        '#000000',
  surface:   '#0A0A0A',
  surface2:  '#111111',
  gold:      '#FFD700',
  gold2:     '#FFA500',
  goldBorder:'rgba(255,215,0,0.3)',
  text:      '#FFFFFF',
  muted:     '#888888',
  muted2:    '#AAAAAA',
  green:     '#00FF87',
  red:       '#FF3355',
  silver:    '#C0C0C0',
  bronze:    '#CD7F32',
};

const MOCK_PLAYERS = [
  { id:'1', username:'Rafa_Predictor', country:'🇧🇷', pts:487, exact:12, plan:'PRO',   streak:8  },
  { id:'2', username:'CarlosGol',      country:'🇨🇴', pts:421, exact:9,  plan:'LIGA',  streak:5  },
  { id:'3', username:'FutbolRey',      country:'🇲🇽', pts:398, exact:8,  plan:'LIGA',  streak:3  },
  { id:'4', username:'SambaBR',        country:'🇧🇷', pts:312, exact:6,  plan:'PLAYER',streak:2  },
  { id:'5', username:'TigreCol',       country:'🇨🇴', pts:287, exact:5,  plan:'PLAYER',streak:1  },
  { id:'6', username:'EagleMX',        country:'🇲🇽', pts:201, exact:4,  plan:'PLAYER',streak:0  },
  { id:'7', username:'GoalKing',       country:'🇦🇷', pts:189, exact:3,  plan:'FREE',  streak:0  },
  { id:'8', username:'viaexpress',     country:'🇨🇴', pts:421, exact:9,  plan:'PLAYER',streak:5, isMe:true },
];

const TABS = ['GLOBAL', 'LIGA', 'PAÍS'];

function PodiumCard({ player, rank }: { player: any; rank: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, delay: rank * 150,
      useNativeDriver: true,
      tension: 50, friction: 7,
    }).start();
  }, []);

  const isFirst  = rank === 1;
  const isSecond = rank === 2;
  const isThird  = rank === 3;

  const medalColor = isFirst ? C.gold : isSecond ? C.silver : C.bronze;
  const medalEmoji = isFirst ? '🥇' : isSecond ? '🥈' : '🥉';
  const heights    = { 1:140, 2:110, 3:90 };
  const podiumH    = heights[rank as keyof typeof heights] || 80;

  return (
    <Animated.View style={[
      s.podiumPlayer,
      isFirst && s.podiumFirst,
      { transform:[{ scale: scaleAnim }] }
    ]}>
      {/* Crown for #1 */}
      {isFirst && <Text style={s.crown}>👑</Text>}

      {/* Avatar */}
      <LinearGradient
        colors={isFirst
          ? [C.gold, C.gold2]
          : isSecond
            ? ['#E8E8E8','#A0A0A0']
            : ['#CD7F32','#8B4513']
        }
        style={s.podiumAvatar}
      >
        <Text style={s.podiumAvatarTxt}>{player.username.slice(0,1).toUpperCase()}</Text>
      </LinearGradient>

      {/* Badge PRO */}
      {player.plan === 'PRO' && (
        <View style={s.proBadge}>
          <Text style={s.proBadgeTxt}>PRO</Text>
        </View>
      )}

      <Text style={s.podiumFlag}>{player.country}</Text>
      <Text style={s.podiumName} numberOfLines={1}>{player.username}</Text>
      <Text style={s.podiumPts}>{player.pts}</Text>
      <Text style={s.podiumPtsLbl}>PTS</Text>

      {/* Podium base */}
      <LinearGradient
        colors={[medalColor, `${medalColor}88`]}
        style={[s.podiumBase, { height: podiumH }]}
      >
        <Text style={s.podiumRank}>{rank}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function RankingScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue:1.05, duration:1000, useNativeDriver:true }),
        Animated.timing(pulseAnim, { toValue:1,    duration:1000, useNativeDriver:true }),
      ])
    ).start();
  }, []);

  if (!fontsLoaded) return <View style={s.root} />;

  const sorted  = [...players].sort((a,b) => b.pts - a.pts);
  const top3    = sorted.slice(0,3);
  const rest    = sorted.slice(3);
  const meRank  = sorted.findIndex(p => p.isMe) + 1;
  const me      = sorted.find(p => p.isMe);

  return (
    <View style={s.root}>

      {/* HEADER */}
      <LinearGradient colors={['#000','#0A0A0A']} style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconBox}>
            <Text style={{ fontSize:20 }}>🏆</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>RANKING</Text>
            <Text style={s.headerSub}>FIFA WORLD CUP 2026</Text>
          </View>
        </View>
        <View style={s.playerCount}>
          <Text style={s.playerCountTxt}>{players.length}</Text>
          <Text style={s.playerCountLbl}>GOLZAIRES</Text>
        </View>
      </LinearGradient>

      {/* MY POSITION BANNER */}
      {me && (
        <Animated.View style={{ transform:[{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={['rgba(255,215,0,0.12)','rgba(255,215,0,0.04)']}
            start={{x:0,y:0}} end={{x:1,y:0}}
            style={s.myPosBanner}
          >
            <View style={s.myPosLeft}>
              <Text style={s.myPosRank}>#{meRank}</Text>
              <View>
                <Text style={s.myPosName}>TU POSICIÓN</Text>
                <Text style={s.myPosUser}>{me.username}</Text>
              </View>
            </View>
            <View style={s.myPosRight}>
              <Text style={s.myPosPts}>{me.pts}</Text>
              <Text style={s.myPosPtsLbl}>PTS</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

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

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* PODIUM */}
        <View style={s.podiumWrap}>
          <View style={s.podiumRow}>
            {/* 2nd */}
            <PodiumCard player={top3[1]} rank={2} />
            {/* 1st */}
            <PodiumCard player={top3[0]} rank={1} />
            {/* 3rd */}
            <PodiumCard player={top3[2]} rank={3} />
          </View>
          <View style={s.podiumStage}>
            <LinearGradient
              colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.02)']}
              start={{x:0.5,y:0}} end={{x:0.5,y:1}}
              style={s.podiumStageFill}
            />
          </View>
        </View>

        {/* DIVIDER */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTxt}>CLASIFICACIÓN</Text>
          <View style={s.dividerLine} />
        </View>

        {/* REST OF PLAYERS */}
        {rest.map((player, idx) => {
          const rank = idx + 4;
          const isMe = player.isMe;
          return (
            <LinearGradient
              key={player.id}
              colors={isMe
                ? ['rgba(255,215,0,0.1)','rgba(255,215,0,0.04)']
                : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']
              }
              start={{x:0,y:0}} end={{x:1,y:0}}
              style={[s.playerRow, isMe && s.playerRowMe]}
            >
              {/* Rank */}
              <Text style={[s.rankNum, isMe && { color:C.gold }]}>{rank}</Text>

              {/* Avatar */}
              <LinearGradient
                colors={isMe ? [C.gold, C.gold2] : ['#2A2A2A','#1A1A1A']}
                style={s.playerAvatar}
              >
                <Text style={[s.playerAvatarTxt, isMe && { color:'#000' }]}>
                  {player.username.slice(0,1).toUpperCase()}
                </Text>
              </LinearGradient>

              {/* Info */}
              <View style={s.playerInfo}>
                <View style={s.playerNameRow}>
                  <Text style={[s.playerName, isMe && { color:C.gold }]}>
                    {player.username}
                  </Text>
                  {isMe && <View style={s.youBadge}><Text style={s.youBadgeTxt}>TÚ</Text></View>}
                  {player.plan === 'PRO' && <View style={s.proBadgeSmall}><Text style={s.proBadgeSmallTxt}>PRO</Text></View>}
                </View>
                <View style={s.playerSubRow}>
                  <Text style={s.playerFlag}>{player.country}</Text>
                  <Text style={s.playerExact}>{player.exact} exactas</Text>
                  {player.streak > 0 && (
                    <Text style={s.playerStreak}>🔥 {player.streak}</Text>
                  )}
                </View>
              </View>

              {/* Points */}
              <View style={s.playerPtsBox}>
                <Text style={[s.playerPts, isMe && { color:C.gold }]}>{player.pts}</Text>
                <Text style={s.playerPtsLbl}>PTS</Text>
              </View>
            </LinearGradient>
          );
        })}

        {/* FOOTER */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>⚡ Actualizado en tiempo real · {players.length} participantes</Text>
        </View>

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
  playerCount:{ alignItems:'center' },
  playerCountTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold },
  playerCountLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },

  // My position banner
  myPosBanner:{ marginHorizontal:12, marginTop:10, borderRadius:14, borderWidth:1, borderColor:'rgba(255,215,0,0.25)', padding:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  myPosLeft:{ flexDirection:'row', alignItems:'center', gap:12 },
  myPosRank:{ fontFamily:'BebasNeue_400Regular', fontSize:42, color:C.gold, lineHeight:44 },
  myPosName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },
  myPosUser:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:14, color:C.text },
  myPosRight:{ alignItems:'center' },
  myPosPts:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.gold },
  myPosPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:2 },

  // Tabs
  tabRow:{ flexDirection:'row', paddingHorizontal:12, gap:8, marginTop:12, marginBottom:4 },
  tab:{ flex:1, paddingVertical:8, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },

  scroll:{ paddingBottom:40 },

  // Podium
  podiumWrap:{ marginTop:8, marginBottom:4, position:'relative' },
  podiumRow:{ flexDirection:'row', alignItems:'flex-end', justifyContent:'center', paddingHorizontal:16, gap:8, paddingTop:20 },
  podiumStage:{ height:20, marginHorizontal:12 },
  podiumStageFill:{ flex:1, borderRadius:8 },

  podiumPlayer:{ flex:1, alignItems:'center', gap:4 },
  podiumFirst:{ marginBottom:0 },
  crown:{ fontSize:24, marginBottom:2 },
  podiumAvatar:{ width:56, height:56, borderRadius:28, alignItems:'center', justifyContent:'center' },
  podiumAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:'#000' },
  proBadge:{ backgroundColor:C.gold, borderRadius:6, paddingHorizontal:6, paddingVertical:1, marginTop:-4 },
  proBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:'#000', letterSpacing:1 },
  podiumFlag:{ fontSize:18 },
  podiumName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.text, letterSpacing:0.5, textAlign:'center' },
  podiumPts:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.gold },
  podiumPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2, marginTop:-4 },
  podiumBase:{ width:'100%', borderTopLeftRadius:8, borderTopRightRadius:8, alignItems:'center', justifyContent:'flex-start', paddingTop:8, marginTop:4 },
  podiumRank:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:'rgba(0,0,0,0.5)' },

  // Divider
  divider:{ flexDirection:'row', alignItems:'center', paddingHorizontal:12, marginVertical:12, gap:10 },
  dividerLine:{ flex:1, height:1, backgroundColor:'rgba(255,215,0,0.15)' },
  dividerTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:3 },

  // Player rows
  playerRow:{ flexDirection:'row', alignItems:'center', marginHorizontal:12, marginBottom:6, borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:12, gap:12 },
  playerRowMe:{ borderColor:'rgba(255,215,0,0.3)' },
  rankNum:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.muted, width:28, textAlign:'center' },
  playerAvatar:{ width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
  playerAvatarTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.muted2 },
  playerInfo:{ flex:1, gap:4 },
  playerNameRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  playerName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.text },
  youBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:6, paddingHorizontal:6, paddingVertical:1, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  youBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.gold, letterSpacing:1 },
  proBadgeSmall:{ backgroundColor:C.gold, borderRadius:5, paddingHorizontal:5, paddingVertical:1 },
  proBadgeSmallTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:'#000', letterSpacing:1 },
  playerSubRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  playerFlag:{ fontSize:14 },
  playerExact:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  playerStreak:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.gold2 },
  playerPtsBox:{ alignItems:'center' },
  playerPts:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.text },
  playerPtsLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2 },

  // Footer
  footer:{ alignItems:'center', paddingVertical:16 },
  footerTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted, letterSpacing:0.5 },
});