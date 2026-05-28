import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const C = {
  bg:'#020408', surface:'#0A0F1A',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF',
  red:'#E8003D', purple:'#9B59B6',
};

const B2C_PLANS = [
  {
    id:'free', emoji:'🎯', name:'FREE', price:'GRATIS', originalPrice:null, color:C.muted,
    features:['Predicciones Mundial', 'Ranking global', 'Liga pública'],
    cta:'ENTRAR GRATIS',
  },
  {
    id:'golzair', emoji:'🔥', name:'GOLZAIR', price:'$1.99', originalPrice:'$3.99', color:C.gold, popular:true,
    features:['1 liga privada × 20', 'Sin publicidad', 'Chat de liga'],
    cta:'ELEGIR GOLZAIR',
  },
  {
    id:'liga', emoji:'🏆', name:'LIGA', price:'$4.99', originalPrice:'$9.99', color:C.cyan,
    features:['3 ligas × 25 personas', 'Estadísticas avanzadas', 'QR de invitación'],
    cta:'ELEGIR LIGA',
  },
  {
    id:'pro', emoji:'💣', name:'PRO FLEX', price:'$9.99', originalPrice:'$19.99', color:C.green,
    features:['200 cupos flexibles', 'Dashboard gestión', 'QR + Token acceso'],
    cta:'ELEGIR PRO FLEX',
  },
];

const B2B_PLANS = [
  {
    id:'partners', emoji:'🏪', name:'PARTNERS', price:'$49.99', originalPrice:'$99.99', color:'#60BFFF',
    desc:'Sports bars · Restaurantes · Empresas',
    features:['El negocio crea la liga + QR', 'Cada cliente paga su GOLZAIR', 'Dashboard avanzado de gestión', 'Ranking en pantallas del local'],
    note:'El negocio crea la liga y comparte el QR. Los clientes acceden con GOLZAIR ($1.99 c/u).',
    popular:false,
  },
  {
    id:'businessfull', emoji:'🏢', name:'BUSINESS FULL', price:'$499', originalPrice:null, color:C.gold,
    desc:'Torneos · Empresas · Comunidades activas',
    features:['1,000 accesos incluidos', '$0.49 por jugador', 'Usuarios ingresan con QR', 'Dashboard B2B completo'],
    note:'Accesos no acumulables. Upgrade disponible.',
    popular:true,
  },
  {
    id:'golzigold', emoji:'👑', name:'GOLZI GOLD', price:'$999', originalPrice:null, color:C.gold,
    desc:'Marcas · Eventos · Comunidades masivas',
    features:['2,500 accesos incluidos', '$0.39 por jugador', 'Badge Plan Oficial Mundial', 'API personalizada'],
    note:'Si superas 2,500 accesos → Enterprise',
    popular:false,
  },
  {
    id:'golzigroup', emoji:'🔥', name:'GOLZI GROUP', price:'$2.99', originalPrice:null, color:C.gold,
    desc:'Un solo pago. Todos dentro.',
    features:['El admin paga por todos', 'Mínimo 11 jugadores', 'jugadores × $2.99', 'QR + link automático', 'Sin pago individual'],
    note:'11 jugadores → $32.89 · 33 jugadores → $98.67 · 100 jugadores → $299',
    popular:false,
  },
  {
    id:'enterprise', emoji:'🌐', name:'ENTERPRISE', price:'Custom', originalPrice:null, color:C.purple,
    desc:'Solución a medida',
    features:['Todo ilimitado', 'Sucursales ilimitadas', 'Integración API', 'SLA garantizado'],
    note:null,
    popular:false,
  },
];

export default function PlansScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [tab, setTab] = useState(0);

  function handleB2CSelect(plan: typeof B2C_PLANS[0]) {
    if (plan.id === 'free') {
      navigation.navigate('Main');
    } else {
      navigation.navigate('Payment', {
        planId: plan.id,
        planName: plan.name,
        price: parseFloat(plan.price.replace('$', '')) || 0,
        emoji: plan.emoji,
      });
    }
  }

  function handleB2BSelect(plan: typeof B2B_PLANS[0]) {
    navigation.navigate('Payment', {
      planId: plan.id,
      planName: plan.name,
      price: parseFloat(plan.price.replace('$', '')) || 0,
      emoji: plan.emoji,
    });
  }

  return (
    <View style={s.root}>
      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerTopLine} />
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')}
          style={s.backBtn}
        >
          <Text style={s.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Image
          source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
          style={s.logo} resizeMode="contain"
        />
        <View style={{ width:60 }} />
      </View>

      {/* HERO */}
      <View style={s.hero}>
        <Text style={s.heroEyebrow}>GOLZI · MUNDIAL 2026</Text>
        <Text style={s.heroTitle}>ELIGE TU PLAN</Text>
        <View style={s.heroLine} />
        <Text style={s.heroPromo}>🎯 Precio promo hasta el 10 jun · Pago único por torneo</Text>
      </View>

      {/* TABS */}
      <View style={s.tabs}>
        {['PERSONAL', 'NEGOCIOS'].map((t, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab === i && s.tabTxtOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* B2C GRID */}
      {tab === 0 && (
        <View style={s.grid}>
          {B2C_PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[s.card, { borderColor: `${plan.color}60` }]}
              onPress={() => handleB2CSelect(plan)}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <View style={[s.badge, { backgroundColor: plan.color }]}>
                  <Text style={s.badgeTxt}>🔥 POPULAR</Text>
                </View>
              )}
              <View style={[s.cardTopLine, { backgroundColor: plan.color }]} />
              <View style={s.cardTop}>
                <Text style={s.cardEmoji}>{plan.emoji}</Text>
                <Text style={[s.cardName, { color: plan.color }]}>{plan.name}</Text>
                {plan.originalPrice && (
                  <Text style={s.originalPrice}>{plan.originalPrice}</Text>
                )}
                <Text style={[s.cardPrice, { color: plan.color }]}>{plan.price}</Text>
              </View>
              <View style={s.cardDivider} />
              {plan.features.map((f, i) => (
                <View key={i} style={s.featureRow}>
                  <Text style={[s.featureDot, { color: plan.color }]}>✓</Text>
                  <Text style={s.featureTxt}>{f}</Text>
                </View>
              ))}
              <View style={[s.cta, { backgroundColor: plan.id === 'free' ? 'rgba(255,255,255,0.05)' : plan.color }]}>
                <Text style={[s.ctaTxt, { color: plan.id === 'free' ? C.muted : '#000' }]}>⚡ {plan.cta}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* B2B LIST */}
      {tab === 1 && (
        <ScrollView
          style={{ flex:1 }}
          contentContainerStyle={s.b2bList}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.promoBanner}>
            <Text style={s.promoTxt}>🎯 Precio fundador 50% OFF · Válido hasta el 11 de junio de 2026</Text>
          </View>

          {B2B_PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[s.b2bCard, { borderColor: `${plan.color}40` }, plan.popular && { borderColor:`${plan.color}80`, borderWidth:1.5 }]}
              onPress={() => handleB2BSelect(plan)}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <View style={[s.badge, { backgroundColor: plan.color }]}>
                  <Text style={s.badgeTxt}>⭐ MÁS POPULAR</Text>
                </View>
              )}
              <View style={[s.cardTopLine, { backgroundColor: plan.color }]} />
              <View style={s.b2bTop}>
                <Text style={s.b2bEmoji}>{plan.emoji}</Text>
                <View style={{ flex:1 }}>
                  <Text style={[s.b2bName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={s.b2bDesc}>{plan.desc}</Text>
                </View>
                <View style={{ alignItems:'flex-end' }}>
                  {plan.originalPrice && (
                    <Text style={s.originalPrice}>{plan.originalPrice}</Text>
                  )}
                  <Text style={[s.b2bPrice, { color: plan.color }]}>{plan.price}</Text>
                </View>
              </View>
              <View style={s.cardDivider} />
              <View style={s.b2bFeatures}>
                {plan.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Text style={[s.featureDot, { color: plan.color }]}>✓</Text>
                    <Text style={s.featureTxt}>{f}</Text>
                  </View>
                ))}
              </View>
              {plan.note && (
                <Text style={[s.noteText, { color:`${plan.color}90` }]}>ℹ️ {plan.note}</Text>
              )}
              <View style={s.b2bBtns}>
                <View style={[s.cta, { backgroundColor: plan.color, flex:1, margin:0 }]}>
                  <Text style={[s.ctaTxt, { color:'#000' }]}>
                    ⚡ {plan.id === 'enterprise' ? 'CONTACTAR VENTAS' : `ACTIVAR ${plan.name}`}
                  </Text>
                </View>
                {plan.id !== 'enterprise' && (
                  <View style={[s.asesorBtn, { borderColor:`${plan.color}40` }]}>
                    <Text style={[s.asesorTxt, { color: plan.color }]}>💬</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <View style={s.legalBox}>
            <Text style={s.legalTxt}>🔒 Los planes B2B están sujetos a contrato. GOLZI no almacena datos de tarjeta. Sin apuestas.</Text>
          </View>
        </ScrollView>
      )}

      {/* LEGAL B2C */}
      {tab === 0 && (
        <View style={s.legalBox}>
          <Text style={s.legalTxt}>🔒 Sin apuestas · Los puntos no tienen valor monetario · Pago único por torneo</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:12, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)', backgroundColor:C.bg },
  headerTopLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)' },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted },
  logo:{ width:32, height:32 },
  hero:{ alignItems:'center', paddingVertical:10, paddingHorizontal:16 },
  heroEyebrow:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'rgba(255,215,0,0.5)', letterSpacing:3, marginBottom:2 },
  heroTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:34, color:C.gold, letterSpacing:2 },
  heroLine:{ width:40, height:2, backgroundColor:C.gold, borderRadius:1, marginVertical:5 },
  heroPromo:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:'rgba(255,215,0,0.7)', textAlign:'center' },
  tabs:{ flexDirection:'row', gap:8, paddingHorizontal:16, marginBottom:10 },
  tab:{ flex:1, paddingVertical:8, borderRadius:8, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  grid:{ flexDirection:'row', flexWrap:'wrap', paddingHorizontal:10, gap:8 },
  card:{ width:(width - 36) / 2, backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderRadius:14 },
  cardTopLine:{ height:2, borderTopLeftRadius:14, borderTopRightRadius:14 },
  badge:{ position:'absolute', top:0, right:0, paddingHorizontal:6, paddingVertical:2, borderBottomLeftRadius:8, zIndex:1 },
  badgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:'#000', letterSpacing:1 },
  cardTop:{ alignItems:'center', paddingVertical:8, paddingHorizontal:8, gap:1 },
  cardEmoji:{ fontSize:20 },
  cardName:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:1 },
  originalPrice:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.red, textDecorationLine:'line-through' },
  cardPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:20, lineHeight:24 },
  cardDivider:{ height:1, backgroundColor:'rgba(255,255,255,0.06)', marginHorizontal:8 },
  featureRow:{ flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:8, paddingTop:4 },
  featureDot:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11 },
  featureTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted2, flex:1 },
  cta:{ margin:8, borderRadius:8, paddingVertical:9, alignItems:'center' },
  ctaTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:12, letterSpacing:1 },
  b2bList:{ paddingHorizontal:14, gap:10, paddingBottom:20 },
  promoBanner:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', borderRadius:10, padding:10, alignItems:'center' },
  promoTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.gold, letterSpacing:0.5 },
  b2bCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderRadius:14 },
  b2bTop:{ flexDirection:'row', alignItems:'center', gap:10, padding:12, paddingBottom:8 },
  b2bEmoji:{ fontSize:26 },
  b2bName:{ fontFamily:'BebasNeue_400Regular', fontSize:20, letterSpacing:1 },
  b2bDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  b2bPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:22 },
  b2bFeatures:{ paddingHorizontal:4, paddingBottom:4 },
  noteText:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, paddingHorizontal:12, paddingBottom:6 },
  b2bBtns:{ flexDirection:'row', gap:8, margin:10, marginTop:4 },
  asesorBtn:{ borderWidth:1, borderRadius:8, paddingHorizontal:12, alignItems:'center', justifyContent:'center' },
  asesorTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:16 },
  legalBox:{ paddingHorizontal:16, paddingVertical:8 },
  legalTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, textAlign:'center' },
});