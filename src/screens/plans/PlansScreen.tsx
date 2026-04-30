import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { RootStackParams } from '../../navigation/AppNavigator';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
};

const PLANS = [
  {
    id:'free', name:'FREE', price:'$0', period:'', emoji:'👁',
    desc:'Solo observar el ranking',
    features:['Ranking con delay 5 min','Con publicidad','Sin predicciones','Sin ligas'],
    color:C.muted, popular:false,
  },
  {
    id:'player', name:'PLAYER', price:'$1.99', period:'/torneo', emoji:'⚽',
    desc:'Predice todos los partidos',
    features:['Predecir los 64 partidos','Unirse a max 3 ligas','Ranking en tiempo real','Sin crear ligas'],
    color:C.gold, popular:true,
  },
  {
    id:'liga', name:'LIGA', price:'$4.99', period:'/torneo', emoji:'🔗',
    desc:'Crea tu propia liga',
    features:['Todo lo de PLAYER','Crear hasta 3 ligas','Max 12 participantes','QR de invitacion'],
    color:C.cyan, popular:false,
  },
  {
    id:'pro', name:'PRO', price:'$9.99', period:'/mes', emoji:'👑',
    desc:'Todo incluido + IA avanzada',
    features:['Todos los torneos','Hasta 5 ligas de 50','IA avanzada GOLZI','Badge PRO exclusivo'],
    color:C.green, popular:false,
  },
];

export default function PlansScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [selected, setSelected] = useState('player');

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      <View style={s.bgGlow} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerLogo}>GOLZI</Text>
        <View style={{ width:30 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>ELIGE TU PLAN</Text>
          <Text style={s.heroSub}>Mundial FIFA 2026 · Precios en USD</Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeTxt}>⚡ Regla del Primer Pitazo — predicciones cierran al inicio del partido</Text>
          </View>
        </View>

        {/* Plans grid */}
        <View style={s.plansGrid}>
          {PLANS.map(plan => (
            <Pressable
              key={plan.id}
              style={[s.planCard, selected === plan.id && { borderColor: plan.color, borderWidth:1.5 }]}
              onPress={() => setSelected(plan.id)}
            >
              {plan.popular && (
                <LinearGradient colors={['#FFD700','#E8A000']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.popularBadge}>
                  <Text style={s.popularTxt}>POPULAR</Text>
                </LinearGradient>
              )}
              <View style={s.planTop}>
                <Text style={s.planEmoji}>{plan.emoji}</Text>
                <View style={s.planInfo}>
                  <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={s.planDesc}>{plan.desc}</Text>
                </View>
                <View style={s.planPriceBox}>
                  <Text style={[s.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  {plan.period ? <Text style={s.planPeriod}>{plan.period}</Text> : null}
                </View>
              </View>
              <View style={s.divider} />
              <View style={s.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Text style={[s.featureDot, { color: plan.color }]}>✓</Text>
                    <Text style={s.featureTxt}>{f}</Text>
                  </View>
                ))}
              </View>
              {selected === plan.id && (
                <TouchableOpacity
                  style={s.selectBtn}
                  onPress={() => navigation.navigate('Main')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={plan.id === 'free' ? ['#444','#333'] : ['#FFD700','#E8A000']}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.selectBtnInner}
                  >
                    <Text style={[s.selectBtnTxt, { color: plan.id === 'free' ? '#ccc' : '#000' }]}>
                      {plan.id === 'free' ? 'ENTRAR GRATIS' : `ELEGIR ${plan.name}`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Pressable>
          ))}
        </View>

        {/* B2B separator */}
        <View style={s.sepRow}>
          <View style={s.sepLine} />
          <Text style={s.sepTxt}>PARA TU NEGOCIO</Text>
          <View style={s.sepLine} />
        </View>

        {/* Promo */}
        <View style={s.promoBanner}>
          <Text style={s.promoTxt}>🎯 Precio fundador 50% OFF — valido hasta el 11 de junio</Text>
        </View>

        {/* B2B Card */}
        <View style={[s.planCard, { borderColor:'rgba(0,198,255,0.24)' }]}>
          <View style={s.planTop}>
            <Text style={s.planEmoji}>🏢</Text>
            <View style={s.planInfo}>
              <Text style={[s.planName, { color:C.cyan }]}>STARTER</Text>
              <Text style={s.planDesc}>Bares · Restaurantes · Empresas</Text>
            </View>
            <View style={s.planPriceBox}>
              <Text style={[s.planPrice, { color:C.green }]}>$17</Text>
              <Text style={s.planPeriod}>/mes</Text>
            </View>
          </View>
          <View style={s.featureList}>
            {['QR con geofencing','Pantalla TV incluida','1 liga hasta 150 usuarios','Badge GOLZI activo'].map((f,i) => (
              <View key={i} style={s.featureRow}>
                <Text style={[s.featureDot, { color:C.cyan }]}>✓</Text>
                <Text style={s.featureTxt}>{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.b2bBtn}>
            <Text style={s.b2bBtnTxt}>HABLAR CON UN ASESOR</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.fine}>Upgrade parcial disponible · Solo pagas la diferencia al subir de plan</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  bgGlow:{ position:'absolute', width:300, height:300, borderRadius:150, top:-60, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.08)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:C.border2 },
  back:{ fontSize:20, color:C.muted, width:30 },
  headerLogo:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  scroll:{ paddingHorizontal:14, paddingTop:16, paddingBottom:40 },
  hero:{ marginBottom:16 },
  heroTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:40, color:C.gold, letterSpacing:2 },
  heroSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, marginBottom:10 },
  heroBadge:{ backgroundColor:'rgba(232,0,61,0.08)', borderWidth:1, borderColor:'rgba(232,0,61,0.2)', borderRadius:8, padding:8 },
  heroBadgeTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2, letterSpacing:0.3 },
  plansGrid:{ gap:8, marginBottom:16 },
  planCard:{ backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:12, padding:12, overflow:'hidden' },
  popularBadge:{ position:'absolute', top:0, right:10, borderBottomLeftRadius:5, borderBottomRightRadius:5, paddingHorizontal:8, paddingVertical:2 },
  popularTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:'#000', letterSpacing:2 },
  planTop:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  planEmoji:{ fontSize:22 },
  planInfo:{ flex:1 },
  planName:{ fontFamily:'BebasNeue_400Regular', fontSize:22, letterSpacing:1, lineHeight:26 },
  planDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },
  planPriceBox:{ alignItems:'flex-end' },
  planPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:26, lineHeight:30 },
  planPeriod:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  divider:{ height:1, backgroundColor:C.border2, marginBottom:8 },
  featureList:{ gap:4, marginBottom:4 },
  featureRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  featureDot:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, lineHeight:16 },
  featureTxt:{ fontFamily:'Barlow_400Regular', fontSize:11, color:C.muted2, flex:1 },
  selectBtn:{ marginTop:10, borderRadius:10, overflow:'hidden' },
  selectBtnInner:{ paddingVertical:11, alignItems:'center' },
  selectBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, letterSpacing:2 },
  sepRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  sepLine:{ flex:1, height:1, backgroundColor:C.border },
  sepTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.gold, letterSpacing:3 },
  promoBanner:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:C.border, borderRadius:8, padding:10, marginBottom:10, alignItems:'center' },
  promoTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.gold, letterSpacing:0.5 },
  b2bBtn:{ marginTop:10, borderWidth:1, borderColor:'rgba(0,198,255,0.3)', borderRadius:10, paddingVertical:10, alignItems:'center' },
  b2bBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:14, letterSpacing:2, color:C.cyan },
  fine:{ fontFamily:'Barlow_400Regular', fontSize:10, color:C.muted, textAlign:'center', marginTop:12, lineHeight:16 },
});