import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { RootStackParams } from '../../navigation/AppNavigator';

const C = {
  bg:'#020408', surface:'#0A0F1A', surface2:'#0F1520',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF',
  red:'#E8003D', purple:'#9B59B6',
};

const B2C_PLANS = [
  {
    id:'free', name:'FREE', price:'GRATIS', originalPrice:null, period:'Para siempre · Por todo el torneo', emoji:'🎯',
    desc:'Acceso básico al ecosistema GOLZI', color:C.muted, popular:false,
    features:[
      { text:'Predicciones del Mundial desde el 11 jun', included:true },
      { text:'Ranking global GOLZI', included:true },
      { text:'Calendario y resultados en vivo', included:true },
      { text:'Participar en ligas públicas de GOLZI', included:true },
      { text:'Ligas privadas', included:false },
      { text:'Chat de liga', included:false },
      { text:'Retos diarios', included:false },
      { text:'Con anuncios', included:false },
    ],
    ideal:'Únete y prueba GOLZI gratis. Ideal para conocer la plataforma.',
    legal:'Acceso gratuito permanente. Sin compromisos.',
  },
  {
    id:'golzair', name:'GOLZAIR', price:'$1.99', originalPrice:'$3.99', period:'Precio de lanzamiento · Por el torneo completo', emoji:'🔥',
    desc:'Crea tu liga con amigos. Perfecto para grupos pequeños, familia y amigos cercanos.', color:C.gold, popular:true,
    features:[
      { text:'Todo lo del plan Free', included:true },
      { text:'Crear 1 liga privada propia', included:true },
      { text:'Hasta 20 participantes', included:true },
      { text:'Participar en hasta 3 ligas privadas', included:true },
      { text:'Chat en tu liga', included:true },
      { text:'Retos diarios · puntos extra', included:true },
      { text:'Sin anuncios', included:true },
    ],
    ideal:'Crea tu liga con amigos 🔥 Perfecto para grupos pequeños, familia y amigos cercanos.',
    legal:'Precio promo hasta 10 jun. Pago único por torneo. Sin renovación automática.',
  },
  {
    id:'liga', name:'LIGA', price:'$4.99', originalPrice:'$9.99', period:'Precio de lanzamiento · Por el torneo completo', emoji:'🏆',
    desc:'Domina múltiples ligas. Para grupos de trabajo, WhatsApp y comunidades activas.', color:C.gold, popular:false, badge:'RECOMENDADO 👀',
    features:[
      { text:'Todo lo del plan GOLZAIR', included:true },
      { text:'Crear hasta 3 ligas privadas', included:true },
      { text:'Hasta 25 participantes por liga', included:true },
      { text:'Participación ilimitada en ligas', included:true },
      { text:'Chat en cada liga', included:true },
      { text:'Retos diarios · puntos extra', included:true },
      { text:'Sin anuncios', included:true },
    ],
    ideal:'Domina múltiples ligas 👀 Para grupos de trabajo, WhatsApp y comunidades activas.',
    legal:'Precio promo hasta 10 jun. Pago único por torneo. Sin renovación automática.',
  },
  {
    id:'pro', name:'PRO FLEX', price:'$9.99', originalPrice:'$19.99', period:'Precio de lanzamiento · Por el torneo completo', emoji:'💣',
    desc:'200 cupos flexibles. Arma torneos grandes para empresas, comunidades y grupos.', color:C.green, popular:false, badge:'MEJOR VALOR 💰',
    flexConcept:{
      title:'🎯 200 Cupos Flexibles — Tú decides',
      options:['1× liga de 200 participantes','2× ligas de 100 participantes','4× ligas de 50 participantes','8× ligas de 25 participantes'],
    },
    features:[
      { text:'Todo lo del plan LIGA', included:true },
      { text:'200 cupos flexibles distribuibles', included:true },
      { text:'Participación ilimitada en ligas', included:true },
      { text:'Estadísticas avanzadas', included:true },
      { text:'Historial de predicciones', included:true },
      { text:'% de aciertos y comparativa', included:true },
      { text:'QR + Token de acceso a tu liga', included:true },
      { text:'Dashboard de gestión básico', included:true },
    ],
    targets:['👥 Comunidades','💼 Oficinas','🎮 Grupos WhatsApp','🏫 Colegios'],
    ideal:'Arma torneos grandes 💣 Ideal para empresas pequeñas, comunidades y grupos grandes.',
    legal:'Precio promo hasta 10 jun. Pago único por torneo. Sin renovación automática.',
  },
];

const B2B_PLANS = [
  {
    id:'business', name:'BUSINESS', price:'$49.99', originalPrice:'$99.99', period:'/torneo', emoji:'🚀',
    desc:'Activa tu comunidad. Sports bars, restaurantes, empresas y marcas.', color:'#60BFFF', popular:false, badge:'EMPRESAS 🚀',
    features:[
      { text:'1,000 cupos flexibles', included:true },
      { text:'Ligas grandes para clientes o equipo', included:true },
      { text:'Chat en cada liga', included:true },
      { text:'Retos diarios · puntos extra', included:true },
      { text:'Estadísticas avanzadas completas', included:true },
      { text:'QR + Token de liga', included:true },
      { text:'Dashboard avanzado de gestión', included:true },
      { text:'Ranking en pantallas del local', included:true },
      { text:'Sin anuncios · Soporte prioritario', included:true },
    ],
    targets:['🍺 Sports Bars','🍕 Restaurantes','🏢 Empresas','📺 Pantallas en local'],
    ideal:'Activa tu comunidad 🚀 Sports bars, restaurantes, empresas y marcas.',
    note:'El negocio crea la liga y comparte el QR. Los clientes se registran en GOLZAIR para acceder.',
  },
  {
    id:'golzigold', name:'GOLZI GOLD', price:'Custom', originalPrice:null, period:'', emoji:'👑',
    desc:'Nivel profesional. Influencers, empresas grandes, marcas y eventos masivos.', color:'#FFD700', popular:true, badge:'ELITE 👑',
    features:[
      { text:'2,500 cupos flexibles', included:true },
      { text:'Todo lo del plan Business', included:true },
      { text:'Dashboard completo + API', included:true },
      { text:'Branding propio en tu liga', included:true },
      { text:'Torneos públicos propios', included:true },
      { text:'Soporte dedicado 24/7', included:true },
      { text:'Integraciones personalizadas', included:true },
      { text:'Eventos masivos y activaciones', included:true },
    ],
    targets:['🎤 Influencers','🏟️ Eventos','📡 Marcas','🌍 Torneos públicos'],
    ideal:'Nivel profesional 👑 Influencers, empresas grandes, marcas y eventos masivos.',
    note:'Plan personalizado · 2,500 cupos. Precio según alcance y necesidades.',
  },
];

export default function PlansScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [selected, setSelected] = useState('golzair');
  const [tab, setTab] = useState(0);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  return (
    <View style={s.root}>

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerTopLine} />
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} style={s.backBtn}>
          <Text style={s.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Image source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }} style={s.headerLogo} resizeMode="contain" />
        <View style={{ width:60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.eyebrow}>GOLZI · MUNDIAL 2026</Text>
          <Text style={s.heroTitle}>ELIGE TU NIVEL</Text>
          <View style={s.titleLine} />
          <Text style={s.heroSub}>Precio de lanzamiento válido para todo el torneo del Mundial 2026. Sin mensualidades. Solo hasta el 10 de junio.</Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeTxt}>⚡ Regla del Primer Pitazo — las predicciones cierran al inicio de cada partido</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {['PERSONAL', 'NEGOCIOS'].map((t,i) => (
            <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
              <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* B2C */}
        {tab === 0 && (
          <View style={s.plansGrid}>
            <View style={s.promoBanner}>
              <Text style={s.promoTxt}>🎯 Precio promo · Válido hasta el 10 de junio de 2026</Text>
            </View>

            {B2C_PLANS.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={[s.planCard, selected === plan.id && { borderColor: plan.color, borderWidth:1.5 }]}
                onPress={() => setSelected(plan.id)}
                activeOpacity={0.95}
              >
                {plan.popular && (
                  <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.popularBadge}>
                    <Text style={s.popularTxt}>🔥 MÁS POPULAR</Text>
                  </LinearGradient>
                )}
                {(plan as any).badge && !plan.popular && (
                  <View style={[s.popularBadge, { backgroundColor:`${plan.color}20` }]}>
                    <Text style={[s.popularTxt, { color: plan.color }]}>{(plan as any).badge}</Text>
                  </View>
                )}

                <View style={[s.planTopLine, { backgroundColor: plan.color }]} />

                <View style={s.planTop}>
                  <Text style={s.planEmoji}>{plan.emoji}</Text>
                  <View style={s.planInfo}>
                    <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                    <Text style={s.planDesc}>{plan.desc}</Text>
                  </View>
                  <View style={s.planPriceBox}>
                    {plan.originalPrice && <Text style={s.originalPrice}>{plan.originalPrice}</Text>}
                    <Text style={[s.planPrice, { color: plan.color }]}>{plan.price}</Text>
                    {plan.period ? <Text style={s.planPeriod}>{plan.period}</Text> : null}
                  </View>
                </View>

                <View style={s.divider} />

                {(plan as any).flexConcept && (
                  <View style={s.flexBox}>
                    <Text style={[s.flexTitle, { color: plan.color }]}>{(plan as any).flexConcept.title}</Text>
                    {(plan as any).flexConcept.options.map((o: string, i: number) => (
                      <Text key={i} style={s.flexOption}>→ {o}</Text>
                    ))}
                  </View>
                )}

                <View style={s.featureList}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={s.featureRow}>
                      <Text style={[s.featureDot, { color: f.included ? C.green : C.red }]}>{f.included ? '✓' : '✗'}</Text>
                      <Text style={[s.featureTxt, { color: f.included ? C.muted2 : C.muted }]}>{f.text}</Text>
                    </View>
                  ))}
                </View>

                {(plan as any).targets && (
                  <View style={s.targetsRow}>
                    {(plan as any).targets.map((t: string, i: number) => (
                      <View key={i} style={s.targetPill}><Text style={s.targetPillTxt}>{t}</Text></View>
                    ))}
                  </View>
                )}

                <View style={s.idealBox}>
                  <Text style={s.idealTxt}>{plan.ideal}</Text>
                </View>

                <Text style={s.legalTxt}>ℹ️ {plan.legal}</Text>

                {selected === plan.id && (
                  <TouchableOpacity
                    style={s.selectBtn}
                    onPress={() => {
                      if (plan.id === 'free') {
                        navigation.navigate('Main');
                      } else {
                        navigation.navigate('Payment', {
                          planId: plan.id,
                          planName: plan.name,
                          price: parseFloat((plan.price as string).replace('$','')) || 0,
                          emoji: plan.emoji,
                        });
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <LinearGradient colors={plan.id === 'free' ? ['#333','#222'] : [plan.color, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.selectBtnInner}>
                      <Text style={[s.selectBtnTxt, { color: plan.id === 'free' ? '#ccc' : '#000' }]}>
                        {plan.id === 'free' ? '⚡ EMPEZAR GRATIS' : `⚡ ELEGIR ${plan.name}`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            <View style={s.disclaimerBox}>
              <Text style={s.disclaimerTxt}>🔒 GOLZI es un juego de predicciones deportivas. Los pagos son por acceso a funcionalidades, no por participación en apuestas. Los puntos no tienen valor monetario. Sin reembolsos una vez iniciado el torneo.</Text>
            </View>
          </View>
        )}

        {/* B2B */}
        {tab === 1 && (
          <View style={s.plansGrid}>
            <View style={s.promoBanner}>
              <Text style={s.promoTxt}>🎯 Precio fundador 50% OFF · Válido hasta el 11 de junio de 2026</Text>
            </View>

            {B2B_PLANS.map(plan => (
              <View key={plan.id} style={[s.planCard, { borderColor:`${plan.color}40`, borderWidth: plan.popular ? 1.5 : 1 }]}>
                {plan.badge && (
                  <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.popularBadge}>
                    <Text style={s.popularTxt}>{plan.badge}</Text>
                  </LinearGradient>
                )}
                <View style={[s.planTopLine, { backgroundColor: plan.color }]} />

                <View style={s.planTop}>
                  <Text style={s.planEmoji}>{plan.emoji}</Text>
                  <View style={s.planInfo}>
                    <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                    <Text style={s.planDesc}>{plan.desc}</Text>
                  </View>
                  <View style={s.planPriceBox}>
                    {plan.originalPrice && <Text style={s.originalPrice}>{plan.originalPrice}</Text>}
                    <Text style={[s.planPrice, { color: plan.color }]}>{plan.price}</Text>
                    {plan.period ? <Text style={s.planPeriod}>{plan.period}</Text> : null}
                  </View>
                </View>

                <View style={s.divider} />

                <View style={s.featureList}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={s.featureRow}>
                      <Text style={[s.featureDot, { color: C.green }]}>✓</Text>
                      <Text style={s.featureTxt}>{f.text}</Text>
                    </View>
                  ))}
                </View>

                {plan.targets && (
                  <View style={s.targetsRow}>
                    {plan.targets.map((t, i) => (
                      <View key={i} style={s.targetPill}><Text style={s.targetPillTxt}>{t}</Text></View>
                    ))}
                  </View>
                )}

                <View style={s.idealBox}>
                  <Text style={s.idealTxt}>{plan.ideal}</Text>
                </View>

                {plan.note && (
                  <View style={[s.noteBox, { borderColor:`${plan.color}25` }]}>
                    <Text style={[s.noteTxt, { color: plan.color }]}>ℹ️ {plan.note}</Text>
                  </View>
                )}

                <View style={{ gap:8, margin:14, marginTop:8 }}>
                  <TouchableOpacity
                    style={s.selectBtn}
                    onPress={() => navigation.navigate('Payment', {
                      planId: plan.id,
                      planName: plan.name,
                      price: parseFloat((plan.price as string).replace('$','')) || 0,
                      emoji: plan.emoji,
                    })}
                    activeOpacity={0.85}
                  >
                    <LinearGradient colors={[plan.color, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.selectBtnInner}>
                      <Text style={[s.selectBtnTxt, { color:'#000' }]}>⚡ ACTIVAR {plan.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.b2bBtn, { borderColor:`${plan.color}40` }]}>
                    <Text style={[s.b2bBtnTxt, { color: plan.color }]}>💬 HABLAR CON UN ASESOR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* GOLZI GROUP */}
            <View style={s.groupSection}>
              <View style={s.groupHeader}>
                <View style={s.groupBadgeRow}>
                  <View style={s.groupBadge}><Text style={s.groupBadgeTxt}>💳 MÉTODO DE ACTIVACIÓN GRUPAL</Text></View>
                </View>
                <Text style={s.groupTitle}>🔥 GOLZI GROUP</Text>
                <Text style={s.groupSubtitle}>Un solo pago. Todos dentro.</Text>
                <Text style={s.groupDesc}>El administrador cubre el acceso completo de todos los jugadores en una sola transacción. Los participantes ingresan directamente, sin pagar individualmente.</Text>
              </View>

              <View style={s.groupBody}>
                <Text style={s.groupSectionLabel}>¿CÓMO FUNCIONA?</Text>
                <View style={s.groupSteps}>
                  {[
                    { n:'1', txt:'Define cuántos jugadores participan (mínimo 11)' },
                    { n:'2', txt:'El sistema calcula: jugadores × $2.99' },
                    { n:'3', txt:'Un solo pago del administrador' },
                    { n:'4', txt:'Se genera QR + link de acceso automáticamente' },
                    { n:'5', txt:'El acceso de todos es cubierto por el administrador.' },
                  ].map(step => (
                    <View key={step.n} style={s.groupStep}>
                      <View style={s.groupStepNum}><Text style={s.groupStepNumTxt}>{step.n}</Text></View>
                      <Text style={s.groupStepTxt}>{step.txt}</Text>
                    </View>
                  ))}
                </View>

                <Text style={s.groupSectionLabel}>EJEMPLOS</Text>
                <View style={s.groupExamples}>
                  {[{ n:'11', total:'$32.89' },{ n:'33', total:'$98.67' },{ n:'100', total:'$299' }].map(ex => (
                    <View key={ex.n} style={s.groupExRow}>
                      <Text style={s.groupExPlayers}>👥 {ex.n} jugadores</Text>
                      <Text style={s.groupExArrow}>→</Text>
                      <Text style={s.groupExTotal}>{ex.total}</Text>
                    </View>
                  ))}
                </View>

                <Text style={s.groupSectionLabel}>IDEAL PARA</Text>
                <View style={s.groupUseCases}>
                  {['Equipos amateur','Torneos rápidos','Empresas y colegios','Venezuela y Argentina','Baja bancarización'].map(u => (
                    <View key={u} style={s.groupUseTag}><Text style={s.groupUseTagTxt}>{u}</Text></View>
                  ))}
                </View>

                <TouchableOpacity style={s.groupBtn}>
                  <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.groupBtnInner}>
                    <Text style={s.groupBtnTxt}>🔥 ACTIVAR GOLZI GROUP</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={s.groupLegal}>⚠️ El acceso de todos los jugadores es cubierto en un solo pago por el administrador. No aplica como plan mensual.</Text>
              </View>
            </View>

            <View style={s.disclaimerBox}>
              <Text style={s.disclaimerTxt}>🔒 Los planes B2B están sujetos a contrato de servicio. GOLZI no se responsabiliza por el uso que terceros hagan de la plataforma. Los precios pueden variar. Para volúmenes superiores contactar ventas.</Text>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)', backgroundColor:C.bg, position:'relative' },
  headerTopLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)' },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted },
  headerLogo:{ width:36, height:36 },
  scroll:{ paddingHorizontal:14, paddingTop:16, paddingBottom:60, backgroundColor:C.bg },
  hero:{ marginBottom:16 },
  eyebrow:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'rgba(255,215,0,0.5)', letterSpacing:3, marginBottom:4 },
  heroTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:44, color:C.gold, letterSpacing:2 },
  titleLine:{ width:48, height:3, backgroundColor:C.gold, borderRadius:2, marginVertical:8 },
  heroSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted, marginBottom:10 },
  heroBadge:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.2)', borderRadius:8, padding:10 },
  heroBadgeTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2, letterSpacing:0.3 },
  tabRow:{ flexDirection:'row', gap:8, marginBottom:16 },
  tab:{ flex:1, paddingVertical:10, borderRadius:10, backgroundColor:'rgba(255,255,255,0.04)', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  tabOn:{ backgroundColor:'rgba(255,215,0,0.1)', borderColor:'rgba(255,215,0,0.3)' },
  tabTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.muted, letterSpacing:1 },
  tabTxtOn:{ color:C.gold },
  plansGrid:{ gap:10, marginBottom:16 },
  planCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderColor:'rgba(255,255,255,0.15)', borderRadius:16 },
  planTopLine:{ height:2, borderTopLeftRadius:16, borderTopRightRadius:16 },
  popularBadge:{ paddingHorizontal:12, paddingVertical:4, alignSelf:'flex-end', borderBottomLeftRadius:8 },
  popularTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'#000', letterSpacing:2 },
  planTop:{ flexDirection:'row', alignItems:'center', gap:10, padding:14, paddingBottom:0 },
  planEmoji:{ fontSize:24 },
  planInfo:{ flex:1 },
  planName:{ fontFamily:'BebasNeue_400Regular', fontSize:24, letterSpacing:1, lineHeight:28 },
  planDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },
  planPriceBox:{ alignItems:'flex-end' },
  planPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:28, lineHeight:32 },
  planPeriod:{ fontFamily:'BarlowCondensed_400Regular', fontSize:9, color:C.muted, textAlign:'right', maxWidth:120 },
  originalPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.red, textDecorationLine:'line-through', textAlign:'right' },
  divider:{ height:1, backgroundColor:'rgba(255,255,255,0.06)', margin:14, marginBottom:10 },
  flexBox:{ marginHorizontal:14, marginBottom:10, backgroundColor:'rgba(255,215,0,0.06)', borderRadius:10, padding:10, borderWidth:1, borderColor:'rgba(255,215,0,0.15)' },
  flexTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, letterSpacing:1, marginBottom:6 },
  flexOption:{ fontFamily:'Barlow_400Regular', fontSize:11, color:C.muted2, paddingVertical:2 },
  featureList:{ gap:6, paddingHorizontal:14 },
  featureRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  featureDot:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13, width:14 },
  featureTxt:{ fontFamily:'Barlow_400Regular', fontSize:12, color:C.muted2, flex:1 },
  targetsRow:{ flexDirection:'row', flexWrap:'wrap', gap:6, paddingHorizontal:14, marginTop:10 },
  targetPill:{ backgroundColor:'rgba(255,255,255,0.05)', borderRadius:20, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  targetPillTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2 },
  idealBox:{ marginHorizontal:14, marginTop:10, backgroundColor:'rgba(255,215,0,0.05)', borderRadius:8, padding:10, borderLeftWidth:2, borderLeftColor:'rgba(255,215,0,0.3)' },
  idealTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:'rgba(255,215,0,0.7)' },
  noteBox:{ marginHorizontal:14, marginTop:6, borderRadius:8, padding:10, borderWidth:1, backgroundColor:'rgba(255,255,255,0.03)' },
  noteTxt:{ fontFamily:'Barlow_400Regular', fontSize:11, lineHeight:16 },
  legalTxt:{ fontFamily:'Barlow_400Regular', fontSize:9, color:C.muted, margin:14, marginTop:8, lineHeight:14 },
  selectBtn:{ margin:14, marginTop:8, borderRadius:12, overflow:'hidden' },
  selectBtnInner:{ paddingVertical:13, alignItems:'center' },
  selectBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:2 },
  b2bBtn:{ borderWidth:1, borderRadius:12, paddingVertical:12, alignItems:'center' },
  b2bBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:15, letterSpacing:2 },
  promoBanner:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', borderRadius:10, padding:12, alignItems:'center' },
  promoTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.gold, letterSpacing:0.5 },
  disclaimerBox:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:14 },
  disclaimerTxt:{ fontFamily:'Barlow_400Regular', fontSize:10, color:C.muted, lineHeight:16, textAlign:'center' },
  groupSection:{ borderRadius:16, borderWidth:1.5, borderColor:'rgba(255,215,0,0.35)' },
  groupHeader:{ padding:16, paddingBottom:14, backgroundColor:'rgba(255,215,0,0.04)', borderTopLeftRadius:16, borderTopRightRadius:16 },
  groupBadgeRow:{ flexDirection:'row', marginBottom:8 },
  groupBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  groupBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.gold, letterSpacing:2 },
  groupTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.gold, letterSpacing:2, lineHeight:36 },
  groupSubtitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.text, letterSpacing:0.5, marginBottom:6 },
  groupDesc:{ fontFamily:'Barlow_400Regular', fontSize:12, color:C.muted2, lineHeight:18 },
  groupBody:{ backgroundColor:'rgba(255,255,255,0.02)', padding:16, gap:12, borderBottomLeftRadius:16, borderBottomRightRadius:16 },
  groupSectionLabel:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:3, marginBottom:2 },
  groupSteps:{ gap:8 },
  groupStep:{ flexDirection:'row', alignItems:'center', gap:10 },
  groupStepNum:{ width:22, height:22, borderRadius:11, backgroundColor:'rgba(255,215,0,0.15)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', alignItems:'center', justifyContent:'center' },
  groupStepNumTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.gold },
  groupStepTxt:{ fontFamily:'Barlow_400Regular', fontSize:12, color:C.muted2, flex:1 },
  groupExamples:{ backgroundColor:'rgba(255,215,0,0.04)', borderRadius:10, borderWidth:1, borderColor:'rgba(255,215,0,0.12)', padding:12, gap:8 },
  groupExRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  groupExPlayers:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted2, flex:1 },
  groupExArrow:{ fontFamily:'BarlowCondensed_400Regular', fontSize:13, color:C.muted },
  groupExTotal:{ fontFamily:'BebasNeue_400Regular', fontSize:20, color:C.gold },
  groupUseCases:{ flexDirection:'row', flexWrap:'wrap', gap:6 },
  groupUseTag:{ backgroundColor:'rgba(255,255,255,0.05)', borderRadius:20, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  groupUseTagTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:10, color:C.muted2 },
  groupBtn:{ borderRadius:12, overflow:'hidden', marginTop:4 },
  groupBtnInner:{ paddingVertical:13, alignItems:'center' },
  groupBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, color:'#000', letterSpacing:2 },
  groupLegal:{ fontFamily:'Barlow_400Regular', fontSize:9, color:C.muted, lineHeight:14, textAlign:'center' },
});