const fs = require('fs');
const path = require('path');

// ── 1. TorneosPublicosScreen.tsx ─────────────────────────────
fs.mkdirSync('src/screens/torneos', { recursive: true });
fs.writeFileSync('src/screens/torneos/TorneosPublicosScreen.tsx', `import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const C = {
  bg:'#020408', surface:'#0A0F1A', gold:'#FFD700', gold2:'#FFA500',
  green:'#00FF87', cyan:'#00C6FF', red:'#FF3355', muted:'#6B7A99', text:'#FFFFFF',
};

// Torneos demo para marketing
const DEMO_TOURNAMENTS = [
  {
    id:'demo1', name:'Copa Bar El Estadio', ligaName:'Bar El Estadio · Bogotá',
    brandLogo:null, brandColor:'#FF3355',
    description:'Torneo oficial de predicciones del Mundial 2026',
    prize:'$500.000 en consumo + 2 entradas al partido',
    startDate:'2026-06-11', endDate:'2026-07-19',
    participants:847, maxParticipants:1000,
    status:'active', isDemo:true,
    tags:['Sports Bar','Restaurante'],
  },
  {
    id:'demo2', name:'Torneo Empleados Davivienda', ligaName:'Corporativo Davivienda',
    brandLogo:null, brandColor:'#FF0000',
    description:'Competencia interna para empleados y sus familias',
    prize:'Bono $1.000.000 + día libre',
    startDate:'2026-06-11', endDate:'2026-07-19',
    participants:2341, maxParticipants:2500,
    status:'active', isDemo:true,
    tags:['Corporativo','Empresas'],
  },
  {
    id:'demo3', name:'Final del Mundial · La Leña', ligaName:'Restaurante La Leña · Medellín',
    brandLogo:null, brandColor:'#F97316',
    description:'Torneo especial para la final del Mundial',
    prize:'Cena para 4 personas + botella de vino',
    startDate:'2026-07-14', endDate:'2026-07-19',
    participants:23, maxParticipants:50,
    status:'upcoming', isDemo:true,
    tags:['Restaurante','Eventos'],
  },
];

export default function TorneosPublicosScreen() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string|null>(null);
  const navigation = useNavigation<StackNavigationProp<any>>();

  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (u) setUserId(u.uid);
  }, []);

  useEffect(() => {
    // Cargar torneos públicos reales de Firestore
    // Por ahora mostrar demos hasta que haya torneos reales
    setLoading(false);
    setTournaments([]);
  }, []);

  const allTournaments = [...tournaments, ...DEMO_TOURNAMENTS];
  const statusColor = (s: string) => s === 'active' ? C.red : s === 'upcoming' ? C.cyan : C.muted;
  const statusLabel = (s: string) => s === 'active' ? '🔴 EN VIVO' : s === 'upcoming' ? '⏳ PRÓXIMO' : '🏁 FINALIZADO';

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill}/>

      {/* Header */}
      <LinearGradient colors={['#020408','#05080F']} style={s.header}>
        <View style={s.topLine}/>
        <View style={s.headerLeft}>
          <Image source={{uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5'}} style={s.headerLogo} resizeMode="contain"/>
          <View>
            <Text style={s.headerTitle}>TORNEOS</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        <View style={s.liveBadge}>
          <View style={s.liveDot}/>
          <Text style={s.liveTxt}>{allTournaments.filter(t => t.status==='active').length} ACTIVOS</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Banner intro */}
        <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']} style={s.introBanner}>
          <Text style={s.introBannerTitle}>🏆 TORNEOS PÚBLICOS</Text>
          <Text style={s.introBannerSub}>Únete a torneos creados por negocios y organizaciones · Compite y gana premios reales</Text>
        </LinearGradient>

        {/* Lista de torneos */}
        {loading ? (
          <ActivityIndicator color={C.gold} style={{marginTop:40}}/>
        ) : allTournaments.map(t => {
          const pct = Math.round((t.participants / t.maxParticipants) * 100);
          const isFull = t.participants >= t.maxParticipants;
          const isLast = t.maxParticipants - t.participants <= 10;

          return (
            <View key={t.id} style={[s.card, {borderTopColor: t.brandColor || C.gold}]}>
              <View style={[s.cardTopLine, {backgroundColor: t.brandColor || C.gold}]}/>
              
              {/* Header del torneo */}
              <View style={s.cardHeader}>
                <View style={[s.brandAvatar, {backgroundColor: (t.brandColor||C.gold)+'20', borderColor: t.brandColor||C.gold}]}>
                  <Text style={{fontSize:20}}>🏢</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={s.cardName}>{t.name}</Text>
                  <Text style={s.cardLiga}>{t.ligaName}</Text>
                </View>
                <View style={[s.statusBadge, {backgroundColor: statusColor(t.status)+'15', borderColor: statusColor(t.status)+'40'}]}>
                  <Text style={[s.statusTxt, {color: statusColor(t.status)}]}>{statusLabel(t.status)}</Text>
                </View>
              </View>

              {t.description && <Text style={s.cardDesc}>{t.description}</Text>}

              {/* Tags */}
              <View style={s.tagsRow}>
                {(t.tags||[]).map((tag:string) => (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagTxt}>{tag}</Text>
                  </View>
                ))}
                <View style={s.tag}>
                  <Text style={s.tagTxt}>{t.startDate} → {t.endDate}</Text>
                </View>
              </View>

              {/* Premio */}
              {t.prize && (
                <View style={s.prizeBox}>
                  <Text style={s.prizeTxt}>🎁 {t.prize}</Text>
                </View>
              )}

              {/* Barra de participantes */}
              <View style={s.participantsRow}>
                <Text style={s.participantsTxt}>
                  {isFull ? '🔴 LLENO' : isLast ? \`⚡ ¡Solo quedan \${t.maxParticipants - t.participants} cupos!\` : \`👥 \${t.participants.toLocaleString()} / \${t.maxParticipants.toLocaleString()} inscritos\`}
                </Text>
                <Text style={s.participantsPct}>{pct}%</Text>
              </View>
              <View style={s.progressBar}>
                <View style={[s.progressFill, {width:\`\${Math.min(pct,100)}%\`, backgroundColor: isFull ? C.red : t.brandColor || C.gold}]}/>
              </View>

              {/* Botón */}
              {t.isDemo ? (
                <TouchableOpacity onPress={() => navigation.navigate('Main', {screen:'Liga'})} style={[s.joinBtn, {backgroundColor:(t.brandColor||C.gold)+'15', borderColor:(t.brandColor||C.gold)+'40'}]}>
                  <Text style={[s.joinBtnTxt, {color: t.brandColor||C.gold}]}>
                    {isFull ? '🔴 TORNEO LLENO · Ver mi liga' : '⚡ INSCRIBIRME · Requiere plan empresarial'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[s.joinBtn, {backgroundColor:(t.brandColor||C.gold)+'15', borderColor:(t.brandColor||C.gold)+'40'}]}>
                  <Text style={[s.joinBtnTxt, {color: t.brandColor||C.gold}]}>⚡ INSCRIBIRME</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* CTA Empresarial */}
        <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.ctaBanner}>
          <Text style={s.ctaTitle}>¿Quieres crear tu propio torneo?</Text>
          <Text style={s.ctaSub}>Con los planes empresariales de GOLZI puedes crear torneos para tus clientes, empleados o comunidad con premios reales.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Plans')} style={s.ctaBtn}>
            <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.ctaBtnInner}>
              <Text style={s.ctaBtnTxt}>⚡ VER PLANES EMPRESARIALES</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Disclaimer legal */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerTxt}>
            ⚠️ GOLZI no es responsable por los premios, promociones u ofertas publicadas por terceros. Los torneos y sus premios son responsabilidad exclusiva de cada organizador. GOLZI es un juego de predicciones deportivas sin apuestas ni dinero real.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  topLine:{position:'absolute',top:0,left:0,right:0,height:2,backgroundColor:'rgba(255,215,0,0.5)'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:52,paddingBottom:14,borderBottomWidth:1,borderBottomColor:'rgba(255,215,0,0.15)'},
  headerLeft:{flexDirection:'row',alignItems:'center',gap:10},
  headerLogo:{width:36,height:36},
  headerTitle:{fontFamily:'BebasNeue_400Regular',fontSize:22,color:C.gold,letterSpacing:3},
  headerSub:{fontFamily:'BarlowCondensed_400Regular',fontSize:9,color:C.muted,letterSpacing:2},
  liveBadge:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(255,51,85,0.12)',borderRadius:10,borderWidth:1,borderColor:'rgba(255,51,85,0.4)',paddingHorizontal:10,paddingVertical:6},
  liveDot:{width:6,height:6,borderRadius:3,backgroundColor:C.red},
  liveTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:10,color:C.red,letterSpacing:1},
  scroll:{paddingHorizontal:12,paddingBottom:40},
  introBanner:{borderRadius:14,borderWidth:1,borderColor:'rgba(255,215,0,0.2)',padding:16,marginVertical:12,alignItems:'center'},
  introBannerTitle:{fontFamily:'BebasNeue_400Regular',fontSize:22,color:C.gold,letterSpacing:3,marginBottom:6},
  introBannerSub:{fontFamily:'BarlowCondensed_400Regular',fontSize:12,color:C.muted,textAlign:'center',lineHeight:18},
  card:{backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,0.06)',marginBottom:14,overflow:'hidden'},
  cardTopLine:{height:3},
  cardHeader:{flexDirection:'row',alignItems:'center',padding:14,paddingBottom:8,gap:10},
  brandAvatar:{width:44,height:44,borderRadius:22,borderWidth:1.5,justifyContent:'center',alignItems:'center'},
  cardName:{fontFamily:'BarlowCondensed_700Bold',fontSize:16,color:C.text,letterSpacing:0.5},
  cardLiga:{fontFamily:'BarlowCondensed_400Regular',fontSize:11,color:C.muted,marginTop:1},
  statusBadge:{borderRadius:8,paddingHorizontal:8,paddingVertical:3,borderWidth:1},
  statusTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:9,letterSpacing:1},
  cardDesc:{fontFamily:'BarlowCondensed_400Regular',fontSize:12,color:C.muted,paddingHorizontal:14,marginBottom:8},
  tagsRow:{flexDirection:'row',flexWrap:'wrap',gap:6,paddingHorizontal:14,marginBottom:8},
  tag:{backgroundColor:'rgba(255,255,255,0.05)',borderRadius:6,paddingHorizontal:8,paddingVertical:3,borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  tagTxt:{fontFamily:'BarlowCondensed_400Regular',fontSize:10,color:C.muted},
  prizeBox:{marginHorizontal:14,marginBottom:10,backgroundColor:'rgba(255,215,0,0.06)',borderRadius:8,padding:10,borderWidth:1,borderColor:'rgba(255,215,0,0.2)'},
  prizeTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:12,color:C.gold},
  participantsRow:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:14,marginBottom:4},
  participantsTxt:{fontFamily:'BarlowCondensed_600SemiBold',fontSize:11,color:C.muted},
  participantsPct:{fontFamily:'BarlowCondensed_700Bold',fontSize:11,color:C.muted},
  progressBar:{height:6,backgroundColor:'rgba(255,255,255,0.06)',marginHorizontal:14,borderRadius:3,overflow:'hidden',marginBottom:12},
  progressFill:{height:6,borderRadius:3},
  joinBtn:{margin:14,marginTop:0,borderRadius:10,paddingVertical:12,alignItems:'center',borderWidth:1},
  joinBtnTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:13,letterSpacing:1},
  ctaBanner:{borderRadius:14,borderWidth:1,borderColor:'rgba(255,215,0,0.2)',padding:20,marginBottom:16,alignItems:'center',gap:10},
  ctaTitle:{fontFamily:'BebasNeue_400Regular',fontSize:20,color:C.gold,letterSpacing:2,textAlign:'center'},
  ctaSub:{fontFamily:'BarlowCondensed_400Regular',fontSize:12,color:C.muted,textAlign:'center',lineHeight:18},
  ctaBtn:{borderRadius:12,overflow:'hidden',width:'100%'},
  ctaBtnInner:{paddingVertical:14,alignItems:'center',borderRadius:12},
  ctaBtnTxt:{fontFamily:'BebasNeue_400Regular',fontSize:16,color:'#000',letterSpacing:2},
  disclaimer:{backgroundColor:'rgba(255,163,0,0.06)',borderRadius:10,borderWidth:1,borderColor:'rgba(255,163,0,0.2)',padding:12,marginBottom:8},
  disclaimerTxt:{fontFamily:'BarlowCondensed_400Regular',fontSize:10,color:C.muted,lineHeight:16,textAlign:'center'},
});
`);
console.log('✅ TorneosPublicosScreen creada');

// ── 2. Patch AppNavigator ────────────────────────────────────
const navPath = 'src/navigation/AppNavigator.tsx';
let nav = fs.readFileSync(navPath, 'utf8');

// Import
nav = nav.replace(
  `import ProfileScreen from '../screens/profile/ProfileScreen';`,
  `import ProfileScreen from '../screens/profile/ProfileScreen';\nimport TorneosPublicosScreen from '../screens/torneos/TorneosPublicosScreen';`
);

// Type
nav = nav.replace(
  `  Ranking:   undefined;
  Mundial:   undefined;`,
  `  Ranking:   undefined;
  Torneos:   undefined;
  Mundial:   undefined;`
);

// Tab screen — insertar entre Ranking y Mundial
nav = nav.replace(
  `      <Tab.Screen name="Mundial"`,
  `      <Tab.Screen name="Torneos" options={{ tabBarLabel: 'TORNEOS', tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} /> }}>
        {() => <TorneosPublicosScreen />}
      </Tab.Screen>
      <Tab.Screen name="Mundial"`
);

fs.writeFileSync(navPath, nav, 'utf8');
console.log('✅ AppNavigator actualizado con tab TORNEOS');
console.log('\n🚀 Script completado.');