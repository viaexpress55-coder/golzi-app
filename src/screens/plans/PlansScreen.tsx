import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { RootStackParams } from '../../navigation/AppNavigator';

const C = {
  bg:'#020408', dark:'#05080F', surface:'#0A0F1A', surface2:'#0F1520',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF',
  red:'#E8003D', purple:'#9B59B6',
  border:'rgba(255,215,0,0.15)', border2:'rgba(255,255,255,0.06)',
};

// ─── B2C PLANS ────────────────────────────────────────────────────────────────
// Precios promo válidos hasta 10 jun 2026. Post-mundial cambiar a precios lista.
const B2C_PLANS = [
  {
    id:'free', name:'FREE', price:'$0', originalPrice: null, period:'', emoji:'👁️',
    desc:'Acceso básico al ecosistema GOLZI',
    color:C.muted,
    popular:false,
    features:[
      'Entrada básica al ecosistema',
      'Exploración inicial',
      'Acceso reducido',
    ],
    addons:[],
    legal:'Acceso gratuito permanente. Sin compromisos.',
  },
  {
    id:'golzair', name:'GOLZAIR', price:'$1.99', originalPrice:'$3.99', period:'/torneo', emoji:'⚽',
    desc:'Acceso completo a ligas',
    color:C.gold,
    popular:true,
    features:[
      'Unirse a ligas públicas o privadas',
      'Pago individual por usuario',
      'Acceso principal al ecosistema',
      'Sin publicidad',
    ],
    addons:[
      '+1 Liga adicional — $1.99',
      '+10 personas/liga — $0.99',
    ],
    legal:'Precio promo hasta 10 jun. Pago único por torneo. Sin renovación automática.',
  },
  {
    id:'liga', name:'LIGA', price:'$4.99', originalPrice:'$9.99', period:'/torneo', emoji:'🏆',
    desc:'Crea y administra tus ligas',
    color:C.cyan,
    popular:false,
    features:[
      'Crear ligas propias',
      'Configuración personalizada',
      'QR de invitación',
      'Ranking en tiempo real',
    ],
    addons:[
      '+1 Liga adicional — $2.99',
      '+10 personas/liga — $1.99',
    ],
    legal:'Precio promo hasta 10 jun. Pago único por torneo. Sin renovación automática.',
  },
  {
    // PRO FLEX: suscripción mensual durante el torneo.
    // TODO post-mundial (11 jun+): revisar modelo de precio.
    id:'pro', name:'PRO FLEX', price:'$9.99', originalPrice:'$19.99', period:'/torneo', emoji:'👑',
    desc:'Experiencia competitiva avanzada',
    color:C.green,
    popular:false,
    features:[
      'Multi ligas',
      'Herramientas premium',
      'Perfil competitivo',
      'Funciones avanzadas',
    ],
    addons:[
      '+1 Liga adicional — $2.99',
      '+10 personas/liga — $1.99',
    ],
    legal:'Precio promo hasta 10 jun. Pago único por torneo. Sin renovación automática.',
  },
];

// ─── B2B PLANS ────────────────────────────────────────────────────────────────
const B2B_PLANS = [
  {
    id:'partners', name:'PARTNERS', price:'$49.99', originalPrice:'$99.99', period:'/torneo', emoji:'🏪',
    desc:'Bares · Restaurantes · Comunidades',
    color:C.cyan,
    popular:false,
    features:[
      'El negocio crea la liga',
      'Cada participante activa su acceso GOLZAIR ($1.99)',
      'Ideal para comunidades sin pago centralizado',
      'Baja barrera de entrada',
      'Badge GOLZI activo',
    ],
    addons:[
      '+100 usuarios — $9.99',
      '+1 Sucursal — $29.99',
    ],
    note: 'Cada participante activa su acceso GOLZAIR desde $1.99.',
  },
  {
    id:'businessfull', name:'BUSINESS FULL', price:'$499', originalPrice: null, period:'', emoji:'🏢',
    desc:'Torneos · Empresas · Comunidades activas',
    color:C.gold,
    popular:true,
    features:[
      '1,000 accesos incluidos',
      '$0.49 por jugador',
      'Usuarios ingresan con QR o link',
      'Sin pago individual por usuario',
      'Dashboard B2B completo',
    ],
    addons:[
      'Upgrade disponible al superar 1,000 accesos',
    ],
    note: 'Accesos no acumulables. Upgrade disponible al superar 1,000.',
  },
  {
    id:'golzigold', name:'GOLZI GOLD', price:'$999', originalPrice: null, period:'', emoji:'🥇',
    desc:'Marcas · Eventos · Comunidades masivas',
    color:'#FFD700',
    popular:false,
    features:[
      '2,500 accesos incluidos',
      '$0.39 por jugador',
      'Activaciones de alto volumen',
      'Ideal para eventos, marcas y comunidades grandes',
      'Badge "Plan Oficial Mundial"',
    ],
    addons:[],
    note: 'Si superas 2,500 accesos → Enterprise.',
  },
  {
    id:'enterprise', name:'ENTERPRISE', price:'Custom', originalPrice: null, period:'', emoji:'🌐',
    desc:'Solución a medida',
    color:C.purple,
    popular:false,
    features:[
      'Todo ilimitado',
      'Sucursales ilimitadas',
      'Integración API personalizada',
      'Contrato dedicado',
      'SLA garantizado',
    ],
    addons:[],
    note: null,
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

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />
      <View style={s.glowTop} />
      <View style={s.topLine} />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Image
          source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
          style={s.headerLogo} resizeMode="contain"
        />
        <View style={{ width:60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.eyebrow}>GOLZI · MUNDIAL 2026</Text>
          <Text style={s.heroTitle}>ELIGE TU PLAN</Text>
          <View style={s.titleLine} />
          <Text style={s.heroSub}>Precios en USD · Sin apuestas · Sin dinero en juego</Text>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeTxt}>⚡ Regla del Primer Pitazo — las predicciones cierran al inicio de cada partido</Text>
          </View>
        </View>

        {/* Tabs B2C / B2B */}
        <View style={s.tabRow}>
          {['PERSONAL', 'NEGOCIOS'].map((t,i) => (
            <TouchableOpacity key={i} style={[s.tab, tab===i && s.tabOn]} onPress={() => setTab(i)}>
              <Text style={[s.tabTxt, tab===i && s.tabTxtOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── B2C PLANS ── */}
        {tab === 0 && (
          <View style={s.plansGrid}>

            <View style={s.promoBanner}>
              <Text style={s.promoTxt}>🎯 Precio promo · Válido hasta el 10 de junio de 2026</Text>
            </View>

            {B2C_PLANS.map(plan => (
              <Pressable
                key={plan.id}
                style={[s.planCard, selected === plan.id && { borderColor: plan.color, borderWidth:1.5 }]}
                onPress={() => setSelected(plan.id)}
              >
                {plan.popular && (
                  <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.popularBadge}>
                    <Text style={s.popularTxt}>⭐ POPULAR</Text>
                  </LinearGradient>
                )}

                <LinearGradient
                  colors={selected === plan.id ? [`${plan.color}15`,'transparent'] : ['rgba(255,255,255,0.02)','transparent']}
                  style={s.planCardGlow}
                />

                <View style={[s.planTopLine, { backgroundColor: plan.color }]} />

                <View style={s.planTop}>
                  <Text style={s.planEmoji}>{plan.emoji}</Text>
                  <View style={s.planInfo}>
                    <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                    <Text style={s.planDesc}>{plan.desc}</Text>
                  </View>
                  <View style={s.planPriceBox}>
                    {plan.originalPrice && (
                      <Text style={s.originalPrice}>{plan.originalPrice}</Text>
                    )}
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

                {plan.addons.length > 0 && (
                  <View style={s.addonSection}>
                    <Text style={s.addonTitle}>ADD-ONS OPCIONALES</Text>
                    {plan.addons.map((a, i) => (
                      <View key={i} style={s.addonRow}>
                        <Text style={s.addonDot}>+</Text>
                        <Text style={s.addonTxt}>{a}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={s.legalTxt}>ℹ️ {plan.legal}</Text>

                {selected === plan.id && (
                  <TouchableOpacity
                    style={s.selectBtn}
                    onPress={() => {
                      if (plan.id === 'free') {
                        navigation.navigate('Main');
                      } else {
                        navigation.navigate('Payment');
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={plan.id === 'free' ? ['#333','#222'] : [C.gold, C.gold2]}
                      start={{x:0,y:0}} end={{x:1,y:0}}
                      style={s.selectBtnInner}
                    >
                      <Text style={[s.selectBtnTxt, { color: plan.id === 'free' ? '#ccc' : '#000' }]}>
                        {plan.id === 'free' ? '⚡ ENTRAR GRATIS' : `⚡ ELEGIR ${plan.name}`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </Pressable>
            ))}

            {/* Disclaimer legal B2C */}
            <View style={s.disclaimerBox}>
              <Text style={s.disclaimerTxt}>
                🔒 GOLZI es un juego de predicciones deportivas. Los pagos son por acceso a funcionalidades, no por participación en apuestas. Los puntos no tienen valor monetario. Sin reembolsos una vez iniciado el torneo.
              </Text>
            </View>
          </View>
        )}

        {/* ── B2B PLANS ── */}
        {tab === 1 && (
          <View style={s.plansGrid}>

            <View style={s.promoBanner}>
              <Text style={s.promoTxt}>🎯 Precio fundador 50% OFF · Válido hasta el 11 de junio de 2026</Text>
            </View>

            {B2B_PLANS.map(plan => (
              <View key={plan.id} style={[s.planCard, plan.popular && { borderColor:`${plan.color}50`, borderWidth:1.5 }, !plan.popular && { borderColor:`${plan.color}30` }]}>

                {plan.popular && (
                  <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.popularBadge}>
                    <Text style={s.popularTxt}>⭐ MÁS POPULAR</Text>
                  </LinearGradient>
                )}

                <LinearGradient
                  colors={[`${plan.color}10`,'transparent']}
                  style={s.planCardGlow}
                />
                <View style={[s.planTopLine, { backgroundColor: plan.color }]} />

                <View style={s.planTop}>
                  <Text style={s.planEmoji}>{plan.emoji}</Text>
                  <View style={s.planInfo}>
                    <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                    <Text style={s.planDesc}>{plan.desc}</Text>
                  </View>
                  <View style={s.planPriceBox}>
                    {plan.originalPrice && (
                      <Text style={s.originalPrice}>{plan.originalPrice}</Text>
                    )}
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

                {plan.addons.length > 0 && (
                  <View style={s.addonSection}>
                    <Text style={s.addonTitle}>ADD-ONS OPCIONALES</Text>
                    {plan.addons.map((a, i) => (
                      <View key={i} style={s.addonRow}>
                        <Text style={s.addonDot}>+</Text>
                        <Text style={s.addonTxt}>{a}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {plan.note && (
                  <Text style={s.legalTxt}>ℹ️ {plan.note}</Text>
                )}

                <TouchableOpacity style={[s.b2bBtn, { borderColor:`${plan.color}40` }]}>
                  <Text style={[s.b2bBtnTxt, { color: plan.color }]}>
                    {plan.id === 'enterprise' ? '📞 CONTACTAR VENTAS' : '💬 HABLAR CON UN ASESOR'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* ── GOLZI GROUP — sección diferenciada ── */}
            <View style={s.groupSection}>
              <View style={s.groupHeader}>
                <LinearGradient
                  colors={['rgba(255,215,0,0.12)', 'rgba(255,165,0,0.06)']}
                  start={{x:0,y:0}} end={{x:1,y:1}}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.groupBadgeRow}>
                  <View style={s.groupBadge}>
                    <Text style={s.groupBadgeTxt}>💳 MÉTODO DE PAGO GRUPAL</Text>
                  </View>
                </View>
                <Text style={s.groupTitle}>🔥 GOLZI GROUP</Text>
                <Text style={s.groupSubtitle}>Un solo pago. Todos dentro.</Text>
                <Text style={s.groupDesc}>
                  El administrador cubre el acceso de todos los jugadores en una sola transacción. Los participantes ingresan directo, sin pagar individualmente.
                </Text>
              </View>

              <View style={s.groupBody}>
                {/* Cómo funciona */}
                <Text style={s.groupSectionLabel}>¿CÓMO FUNCIONA?</Text>
                <View style={s.groupSteps}>
                  {[
                    { n:'1', txt:'Define cuántos jugadores participan (mínimo 11)' },
                    { n:'2', txt:'El sistema calcula: jugadores × $1.99' },
                    { n:'3', txt:'Un solo pago del administrador' },
                    { n:'4', txt:'Se genera QR + link de acceso automáticamente' },
                    { n:'5', txt:'Los jugadores entran sin pagar nada' },
                  ].map(step => (
                    <View key={step.n} style={s.groupStep}>
                      <View style={s.groupStepNum}>
                        <Text style={s.groupStepNumTxt}>{step.n}</Text>
                      </View>
                      <Text style={s.groupStepTxt}>{step.txt}</Text>
                    </View>
                  ))}
                </View>

                {/* Ejemplos de precio */}
                <Text style={s.groupSectionLabel}>EJEMPLOS</Text>
                <View style={s.groupExamples}>
                  {[
                    { n:'11', total:'$21.89' },
                    { n:'33', total:'$65.67' },
                    { n:'100', total:'$199' },
                  ].map(ex => (
                    <View key={ex.n} style={s.groupExRow}>
                      <Text style={s.groupExPlayers}>👥 {ex.n} jugadores</Text>
                      <Text style={s.groupExArrow}>→</Text>
                      <Text style={s.groupExTotal}>{ex.total}</Text>
                    </View>
                  ))}
                </View>

                {/* Casos de uso */}
                <Text style={s.groupSectionLabel}>IDEAL PARA</Text>
                <View style={s.groupUseCases}>
                  {['Equipos amateur', 'Torneos rápidos', 'Empresas y colegios', 'Comunidades con baja bancarización'].map(u => (
                    <View key={u} style={s.groupUseTag}>
                      <Text style={s.groupUseTagTxt}>{u}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={s.groupBtn}>
                  <LinearGradient
                    colors={[C.gold, C.gold2]}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.groupBtnInner}
                  >
                    <Text style={s.groupBtnTxt}>🔥 ACTIVAR GOLZI GROUP</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={s.groupLegal}>
                  ⚠️ El acceso de todos los jugadores es cubierto en un solo pago por el administrador. No aplica como plan mensual.
                </Text>
              </View>
            </View>

            {/* Disclaimer legal B2B */}
            <View style={s.disclaimerBox}>
              <Text style={s.disclaimerTxt}>
                🔒 Los planes B2B están sujetos a contrato de servicio. GOLZI no se responsabiliza por el uso que terceros hagan de la plataforma. Los precios pueden variar. ENTERPRISE sujeto a negociación y contrato formal. Puedes cancelar con 30 días de aviso.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
      <View style={s.bottomLine} />
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)', zIndex:10 },
  bottomLine:{ position:'absolute', bottom:0, left:0, right:0, height:1, backgroundColor:'rgba(255,215,0,0.15)' },
  glowTop:{ position:'absolute', width:350, height:350, borderRadius:175, top:-100, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.07)' },

  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted },
  headerLogo:{ width:36, height:36 },

  scroll:{ paddingHorizontal:14, paddingTop:16, paddingBottom:40 },

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
  planCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderColor:'rgba(255,255,255,0.15)', borderRadius:16, overflow:'hidden', shadowColor:'#FFD700', shadowOffset:{width:0,height:6}, shadowOpacity:0.2, shadowRadius:10, elevation:6 },
  planCardGlow:{ position:'absolute', top:0, left:0, right:0, bottom:0 },
  planTopLine:{ height:2 },
  popularBadge:{ paddingHorizontal:12, paddingVertical:4, alignSelf:'flex-end', borderBottomLeftRadius:8 },
  popularTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'#000', letterSpacing:2 },

  planTop:{ flexDirection:'row', alignItems:'center', gap:10, padding:14, paddingBottom:0 },
  planEmoji:{ fontSize:24 },
  planInfo:{ flex:1 },
  planName:{ fontFamily:'BebasNeue_400Regular', fontSize:24, letterSpacing:1, lineHeight:28 },
  planDesc:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted },
  planPriceBox:{ alignItems:'flex-end' },
  planPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:28, lineHeight:32 },
  planPeriod:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  originalPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:16, color:C.red, textDecorationLine:'line-through', textAlign:'right' },

  divider:{ height:1, backgroundColor:'rgba(255,255,255,0.06)', margin:14, marginBottom:10 },

  featureList:{ gap:6, paddingHorizontal:14 },
  featureRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  featureDot:{ fontFamily:'BarlowCondensed_700Bold', fontSize:13 },
  featureTxt:{ fontFamily:'Barlow_400Regular', fontSize:12, color:C.muted2, flex:1 },

  addonSection:{ marginHorizontal:14, marginTop:10, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:10, padding:10, borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  addonTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:3, marginBottom:6 },
  addonRow:{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 },
  addonDot:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.gold2 },
  addonTxt:{ fontFamily:'Barlow_400Regular', fontSize:11, color:C.muted2 },

  legalTxt:{ fontFamily:'Barlow_400Regular', fontSize:9, color:C.muted, margin:14, marginTop:8, lineHeight:14 },

  selectBtn:{ margin:14, marginTop:8, borderRadius:12, overflow:'hidden' },
  selectBtnInner:{ paddingVertical:13, alignItems:'center' },
  selectBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:17, letterSpacing:2 },

  b2bBtn:{ margin:14, marginTop:8, borderWidth:1, borderRadius:12, paddingVertical:12, alignItems:'center' },
  b2bBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:15, letterSpacing:2 },

  promoBanner:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', borderRadius:10, padding:12, alignItems:'center', shadowColor:'#FFD700', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:6 },
  promoTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.gold, letterSpacing:0.5 },

  disclaimerBox:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:14 },
  disclaimerTxt:{ fontFamily:'Barlow_400Regular', fontSize:10, color:C.muted, lineHeight:16, textAlign:'center' },

  // ── GOLZI GROUP ──────────────────────────────────────────────────────────────
  groupSection:{ borderRadius:16, overflow:'hidden', borderWidth:1.5, borderColor:'rgba(255,215,0,0.35)', shadowColor:'#FFD700', shadowOffset:{width:0,height:8}, shadowOpacity:0.3, shadowRadius:16, elevation:10 },

  groupHeader:{ overflow:'hidden', padding:16, paddingBottom:14 },
  groupBadgeRow:{ flexDirection:'row', marginBottom:8 },
  groupBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  groupBadgeTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.gold, letterSpacing:2 },
  groupTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.gold, letterSpacing:2, lineHeight:36 },
  groupSubtitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:14, color:C.text, letterSpacing:0.5, marginBottom:6 },
  groupDesc:{ fontFamily:'Barlow_400Regular', fontSize:12, color:C.muted2, lineHeight:18 },

  groupBody:{ backgroundColor:'rgba(255,255,255,0.02)', padding:16, gap:12 },
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