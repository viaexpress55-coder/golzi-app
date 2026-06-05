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
  red:'#E8003D', purple:'#9B59B6', blue:'#60BFFF',
};

const B2C_PLANS = [
  {
    id:'free', emoji:'🎯', name:'FREE', price:'GRATIS', originalPrice:null,
    users:null, perUser:null, saving:null, color:C.muted, popular:false,
    features:['Cuenta activa con perfil propio','Predecir y guardar los 72 partidos','Calendario completo y partidos en vivo','Estadísticas de equipos y grupos','Participar en ligas si te invitan'],
    noFeatures:['Ranking GOLZI (requiere liga creada)','Chat de liga (requiere liga)','Crear tu propia liga privada','Retos diarios · Con anuncios'],
    cta:'EMPEZAR GRATIS',
  },
  {
    id:'liga', emoji:'⚡', name:'LIGA', price:'$9.99', originalPrice:'$12.99',
    users:5, perUser:'$1.99', saving:'23%', color:C.gold, popular:false,
    features:['Todo lo del plan FREE','Crear 1 liga privada','Hasta 5 participantes en tu liga','Chat en tu liga','Retos diarios · puntos extra','Sin anuncios','Link de invitación para tu liga'],
    noFeatures:[],
    cta:'CREAR LIGA',
  },
  {
    id:'pro', emoji:'🚀', name:'PRO', price:'$18.99', originalPrice:'$24.99',
    users:10, perUser:'$1.90', saving:'24%', color:C.cyan, popular:false,
    features:['Todo lo del plan LIGA','Crear 1 liga privada','Hasta 10 participantes en tu liga','Chat en tu liga','Retos diarios · puntos extra','Sin anuncios','Link de invitación para tu liga'],
    noFeatures:[],
    cta:'CREAR LIGA',
  },
  {
    id:'master', emoji:'⭐', name:'MASTER', price:'$39.99', originalPrice:'$49.99',
    users:25, perUser:'$1.60', saving:'20%', color:C.green, popular:true,
    features:['Todo lo del plan PRO','Crear 1 liga privada','Hasta 25 participantes en tu liga','Chat en tu liga','Retos diarios · puntos extra','Link de invitación para tu liga','Sin anuncios'],
    noFeatures:[],
    cta:'CREAR LIGA',
  },
  {
    id:'golzair', emoji:'🏢', name:'GOLZAIR', price:'$99.99', originalPrice:'$129.99',
    users:100, perUser:'$1.00', saving:'23%', color:C.blue, popular:false, isNew:true,
    features:['Todo lo del plan MASTER','Hasta 100 participantes','Multiligas (1 pool de 100 cupos)','Estadísticas del grupo','QR + Token de invitación (código generado)','Link de invitación para tu liga','Chat en cada liga','Sin anuncios · Soporte prioritario'],
    noFeatures:[],
    cta:'CREAR LIGAS',
  },
];

const B2B_PLANS = [
  {
    id:'partner', emoji:'🤝', name:'PARTNER', price:'$349.99', originalPrice:'$449.99',
    users:500, perUser:'$0.70', saving:'22%', color:C.gold, popular:false,
    features:['Todo lo del plan GOLZAIR+','Hasta 500 participantes','Múltiples ligas privadas','QR + Token de invitación','Link de invitación','Canal de difusión · Promociones y anuncios a toda tu comunidad','Dashboard de gestión completo','Estadísticas avanzadas','Pantalla TV · golzi.app/tv/tu-liga en tiempo real','Sin anuncios · Soporte prioritario'],
    cta:'CREAR LIGAS',
  },
  {
    id:'business', emoji:'🏢', name:'BUSINESS', price:'$499.99', originalPrice:'$649.99',
    users:1000, perUser:'$0.50', saving:'23%', color:C.cyan, popular:true,
    features:['Todo lo del plan PARTNER+','Hasta 1,000 participantes','Múltiples ligas privadas','QR + Token de invitación','Link de invitación','Canal de difusión · Promociones y anuncios a toda tu comunidad','Branding de empresa en la liga','Soporte dedicado','Torneos internos personalizados','Pantalla TV · Ranking en múltiples pantallas del negocio','Sin anuncios · Soporte prioritario'],
    cta:'CREAR LIGAS',
  },
  {
    id:'gold', emoji:'👑', name:'GOLD', price:'$999.99', originalPrice:'$1,299.99',
    users:2500, perUser:'$0.40', saving:'80%', color:C.gold, popular:false,
    features:['Todo lo del plan BUSINESS+','Hasta 2,500 participantes','Múltiples ligas privadas','QR + Token de invitación','Link de invitación','Canal de difusión · Promociones y anuncios a toda tu comunidad','Branding propio completo','Torneos públicos propios','Soporte prioritario','Pantalla TV · Ranking + En vivo en tus pantallas','Eventos masivos y activaciones'],
    cta:'HABLAR CON VENTAS',
  },
  {
    id:'golziplus', emoji:'💎', name:'GOLZI PREMIUM', price:'Custom', originalPrice:null,
    users:5000, perUser:'~$0.30', saving:'85%', color:C.purple, popular:false,
    features:['Todo lo del plan GOLD+','5,000+ participantes','Múltiples ligas privadas','QR + Token de invitación','Link de invitación','Canal de difusión · Promociones y anuncios a toda tu comunidad','Precio según volumen y necesidades','Implementación personalizada','Pantalla TV personalizada · Branding completo','Atención prioritaria sin límite de tiempo','Contrato y facturación empresarial'],
    cta:'HABLAR CON VENTAS',
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
    if (plan.id === 'gold' || plan.id === 'golziplus') {
      const msg = encodeURIComponent(`Hola, estoy interesado en el plan ${plan.name} de GOLZI para el Mundial 2026. ¿Pueden darme más información y una cotización?`);
      if (typeof window !== 'undefined') {
        window.open(`https://wa.me/573054325588?text=${msg}`, '_blank');
      } else {
        import('react-native').then(({ Linking }) => Linking.openURL(`https://wa.me/573054325588?text=${msg}`));
      }
      return;
    }
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
        <Text style={s.heroTitle}>1 PAGA, TODOS JUEGAN</Text>
        <Text style={s.heroSub}>Crea tu liga · Invita a quien quieras · Todos compiten</Text>
        <View style={s.heroRow}>
          <View style={s.heroPill}><Text style={s.heroPillTxt}>$1.99 POR JUGADOR</Text></View>
          <View style={s.heroPill}><Text style={s.heroPillTxt}>1 SOLO PAGO</Text></View>
          <View style={s.heroPill}><Text style={s.heroPillTxt}>TODOS JUEGAN</Text></View>
        </View>
      </View>

      {/* TABS */}
      <View style={s.tabs}>
        {['PERSONAL', 'EMPRESAS'].map((t, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={[s.tabTxt, tab === i && s.tabTxtOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* B2C */}
      {tab === 0 && (
        <ScrollView style={{ flex:1 }} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {B2C_PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[s.planCard, { borderColor:`${plan.color}50` }, plan.popular && { borderColor:plan.color, borderWidth:1.5 }]}
              onPress={() => handleB2CSelect(plan)}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <View style={[s.badge, { backgroundColor:plan.color }]}>
                  <Text style={s.badgeTxt}>⭐ MÁS POPULAR</Text>
                </View>
              )}
              {(plan as any).isNew && (
                <View style={[s.badge, { backgroundColor:C.blue }]}>
                  <Text style={s.badgeTxt}>✨ NUEVO</Text>
                </View>
              )}
              <View style={[s.cardTopLine, { backgroundColor:plan.color }]} />

              <View style={s.cardHeader}>
                <View style={s.cardHeaderLeft}>
                  <Text style={s.cardEmoji}>{plan.emoji}</Text>
                  <View>
                    <Text style={[s.cardName, { color:plan.color }]}>{plan.name}</Text>
                    {plan.users && <Text style={s.cardUsers}>{plan.users} JUGADORES</Text>}
                  </View>
                </View>
                <View style={s.cardPriceBox}>
                  {plan.originalPrice && <Text style={s.originalPrice}>{plan.originalPrice}</Text>}
                  <Text style={[s.cardPrice, { color:plan.color }]}>{plan.price}</Text>
                  {plan.users && <Text style={s.cardPeriod}>pago único</Text>}
                </View>
              </View>

              {plan.perUser && (
                <View style={s.perUserRow}>
                  <Text style={[s.perUserPrice, { color:plan.color }]}>{plan.perUser}</Text>
                  <Text style={s.perUserLabel}> por jugador</Text>
                  {plan.saving !== '0%' && plan.saving && (
                    <View style={[s.savingBadge, { backgroundColor:`${plan.color}20` }]}>
                      <Text style={[s.savingTxt, { color:plan.color }]}>Ahorra {plan.saving}</Text>
                    </View>
                  )}
                </View>
              )}

              {plan.users && (
                <View style={s.playersNote}>
                  <Text style={s.playersNoteTxt}>👥 Tú + {plan.users - 1} jugadores juegan juntos</Text>
                </View>
              )}

              <View style={s.divider} />

              <View style={s.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Text style={[s.featureDot, { color:C.green }]}>✓</Text>
                    <Text style={s.featureTxt}>{f}</Text>
                  </View>
                ))}
                {plan.noFeatures.map((f, i) => (
                  <View key={`no-${i}`} style={s.featureRow}>
                    <Text style={[s.featureDot, { color:C.red }]}>✗</Text>
                    <Text style={[s.featureTxt, { color:C.muted }]}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={[s.cta, { backgroundColor: plan.id === 'free' ? 'rgba(255,255,255,0.05)' : plan.color }]}>
                <Text style={[s.ctaTxt, { color: plan.id === 'free' ? C.muted : '#000' }]}>⚡ {plan.cta}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Tabla de ahorro */}
          <View style={s.savingsTable}>
            <Text style={s.savingsTitleTxt}>COMPARA TU AHORRO</Text>
            <Text style={s.savingsSubTxt}>Precio base: $1.99 por jugador</Text>
            <View style={s.savingsRow}>
              {[
                { name:'LIGA', price:'$1.99', saving:'0%' },
                { name:'PRO', price:'$1.90', saving:'5%' },
                { name:'MASTER', price:'$1.60', saving:'20%' },
                { name:'GOLZAIR', price:'$1.00', saving:'50%' },
              ].map((item, i) => (
                <View key={i} style={s.savingsItem}>
                  <Text style={s.savingsItemName}>{item.name}</Text>
                  <Text style={s.savingsItemPrice}>{item.price}</Text>
                  <Text style={s.savingsItemSaving}>{item.saving}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Cómo funciona */}
          <View style={s.howItWorks}>
            <Text style={s.howTitle}>¿CÓMO FUNCIONA?</Text>
            {[
              { n:'1', txt:'Elige tu plan y cuántos jugadores quieres' },
              { n:'2', txt:'Pagas una sola vez — tu liga queda creada' },
              { n:'3', txt:'Invitas por link, código QR o redes sociales' },
              { n:'4', txt:'Todos entran gratis y compiten contigo' },
            ].map(step => (
              <View key={step.n} style={s.howRow}>
                <View style={s.howNum}><Text style={s.howNumTxt}>{step.n}</Text></View>
                <Text style={s.howTxt}>{step.txt}</Text>
              </View>
            ))}
          </View>

          <View style={s.legalBox}>
            <Text style={s.legalTxt}>🔒 Sin apuestas · Pago único por torneo · Sin renovación automática · Mundial 2026</Text>
          </View>
        </ScrollView>
      )}

      {/* B2B */}
      {tab === 1 && (
        <ScrollView style={{ flex:1 }} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          <View style={s.promoBanner}>
            <Text style={s.promoTxt}>🏢 Planes para empresas, organizaciones y comunidades grandes</Text>
            <Text style={s.promoSubTxt}>Precio base: $1.99 · Mientras más usuarios, menos pagas</Text>
          </View>

          {B2B_PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[s.planCard, { borderColor:`${plan.color}50` }, plan.popular && { borderColor:plan.color, borderWidth:1.5 }]}
              onPress={() => handleB2BSelect(plan)}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <View style={[s.badge, { backgroundColor:plan.color }]}>
                  <Text style={s.badgeTxt}>⭐ MÁS POPULAR</Text>
                </View>
              )}
              <View style={[s.cardTopLine, { backgroundColor:plan.color }]} />

              <View style={s.cardHeader}>
                <View style={s.cardHeaderLeft}>
                  <Text style={s.cardEmoji}>{plan.emoji}</Text>
                  <View>
                    <Text style={[s.cardName, { color:plan.color }]}>{plan.name}</Text>
                    <Text style={s.cardUsers}>{plan.users.toLocaleString()} USUARIOS</Text>
                  </View>
                </View>
                <View style={s.cardPriceBox}>
                  <Text style={[s.cardPrice, { color:plan.color }]}>{plan.price}</Text>
                  <Text style={s.cardPeriod}>pago único</Text>
                </View>
              </View>

              <View style={s.perUserRow}>
                <Text style={[s.perUserPrice, { color:plan.color }]}>{plan.perUser}</Text>
                <Text style={s.perUserLabel}> por usuario</Text>
                <View style={[s.savingBadge, { backgroundColor:`${plan.color}20` }]}>
                  <Text style={[s.savingTxt, { color:plan.color }]}>Ahorra {plan.saving}</Text>
                </View>
              </View>

              <View style={s.playersNote}>
                <Text style={s.playersNoteTxt}>👥 {plan.users.toLocaleString()} usuarios en todas tus ligas</Text>
              </View>

              <View style={s.divider} />

              <View style={s.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Text style={[s.featureDot, { color:C.green }]}>✓</Text>
                    <Text style={s.featureTxt}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={[s.cta, { backgroundColor: plan.id === 'golziplus' ? `${plan.color}20` : plan.color }]}>
                <Text style={[s.ctaTxt, { color: plan.id === 'golziplus' ? plan.color : '#000' }]}>⚡ {plan.cta}</Text>
              </View>
              {(plan.id === 'gold' || plan.id === 'golziplus') && (
                <TouchableOpacity
                  style={{ marginHorizontal:14, marginBottom:14, padding:10, alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', borderRadius:10 }}
                  onPress={() => {
                    if (typeof window !== 'undefined') {
                      window.open('mailto:golziapp@gmail.com?subject=Plan ' + plan.name + ' GOLZI Mundial 2026', '_blank');
                    }
                  }}
                >
                  <Text style={{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.muted }}>📧 golziapp@gmail.com</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}

          {/* Tabla de ahorro B2B */}
          <View style={s.savingsTable}>
            <Text style={s.savingsTitleTxt}>COMPARA TU AHORRO</Text>
            <Text style={s.savingsSubTxt}>Precio base: $1.99 por usuario</Text>
            <View style={s.savingsRow}>
              {[
                { name:'PARTNER', price:'$0.70', saving:'65%' },
                { name:'BUSINESS', price:'$0.50', saving:'75%' },
                { name:'GOLD', price:'$0.40', saving:'80%' },
                { name:'GOLZI+', price:'$0.30', saving:'85%' },
              ].map((item, i) => (
                <View key={i} style={s.savingsItem}>
                  <Text style={s.savingsItemName}>{item.name}</Text>
                  <Text style={s.savingsItemPrice}>{item.price}</Text>
                  <Text style={s.savingsItemSaving}>{item.saving}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.legalBox}>
            <Text style={s.legalTxt}>🔒 Planes B2B sujetos a contrato. Sin apuestas. GOLZI no almacena datos de tarjeta.</Text>
          </View>
        </ScrollView>
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
  hero:{ alignItems:'center', paddingVertical:10, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.08)' },
  heroTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, letterSpacing:2, textAlign:'center' },
  heroSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted2, textAlign:'center', marginTop:4 },
  heroRow:{ flexDirection:'row', gap:6, marginTop:8, flexWrap:'wrap', justifyContent:'center' },
  heroPill:{ backgroundColor:'rgba(255,215,0,0.08)', borderRadius:20, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  heroPillTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.gold, letterSpacing:1 },
  tabs:{ flexDirection:'row', gap:8, paddingHorizontal:16, paddingVertical:10 },
  tab:{ flex:1, paddingVertical:8, borderRadius:8, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  list:{ paddingHorizontal:14, gap:10, paddingBottom:30 },
  planCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderRadius:16 },
  cardTopLine:{ height:2, borderTopLeftRadius:16, borderTopRightRadius:16 },
  badge:{ position:'absolute', top:0, right:0, paddingHorizontal:8, paddingVertical:3, borderBottomLeftRadius:8, zIndex:1 },
  badgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:'#000', letterSpacing:1 },
  cardHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14, paddingBottom:8 },
  cardHeaderLeft:{ flexDirection:'row', alignItems:'center', gap:10 },
  cardEmoji:{ fontSize:24 },
  cardName:{ fontFamily:'BebasNeue_400Regular', fontSize:22, letterSpacing:1 },
  cardUsers:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:2 },
  cardPriceBox:{ alignItems:'flex-end' },
  originalPrice:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.red, textDecorationLine:'line-through' },
  cardPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:26, lineHeight:30 },
  cardPeriod:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted },
  perUserRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingBottom:6, flexWrap:'wrap', gap:6 },
  perUserPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:18 },
  perUserLabel:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },
  savingBadge:{ borderRadius:20, paddingHorizontal:8, paddingVertical:2 },
  savingTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, letterSpacing:1 },
  playersNote:{ marginHorizontal:14, marginBottom:8, backgroundColor:'rgba(255,215,0,0.05)', borderRadius:8, padding:8, borderLeftWidth:2, borderLeftColor:'rgba(255,215,0,0.3)' },
  playersNoteTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:'rgba(255,215,0,0.7)' },
  divider:{ height:1, backgroundColor:'rgba(255,255,255,0.06)', marginHorizontal:14, marginBottom:8 },
  featureList:{ gap:5, paddingHorizontal:14, paddingBottom:4 },
  featureRow:{ flexDirection:'row', alignItems:'center', gap:6 },
  featureDot:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, width:14 },
  featureTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted2, flex:1 },
  cta:{ margin:14, marginTop:10, borderRadius:10, paddingVertical:12, alignItems:'center' },
  ctaTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:16, letterSpacing:2 },
  promoBanner:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.3)', borderRadius:10, padding:12, alignItems:'center' },
  promoTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.gold, textAlign:'center' },
  promoSubTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, marginTop:3 },
  savingsTable:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.08)', padding:14 },
  savingsTitleTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:3, marginBottom:4 },
  savingsSubTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, marginBottom:10 },
  savingsRow:{ flexDirection:'row', justifyContent:'space-between' },
  savingsItem:{ alignItems:'center', flex:1 },
  savingsItemName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:C.muted2, letterSpacing:1 },
  savingsItemPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.gold },
  savingsItemSaving:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.green },
  howItWorks:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.08)', padding:14, gap:10 },
  howTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:3, marginBottom:4 },
  howRow:{ flexDirection:'row', alignItems:'center', gap:10 },
  howNum:{ width:24, height:24, borderRadius:12, backgroundColor:'rgba(255,215,0,0.15)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', alignItems:'center', justifyContent:'center' },
  howNumTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color:C.gold },
  howTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:12, color:C.muted2, flex:1 },
  legalBox:{ paddingVertical:8 },
  legalTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, textAlign:'center' },
});