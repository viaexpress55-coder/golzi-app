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

const B2C_PLANS = [
  {
    id:'free', name:'FREE', price:'$0', period:'', emoji:'👁️',
    desc:'Participa en ligas públicas',
    color:C.muted,
    popular:false,
    features:[
      'Únete a ligas públicas',
      'Máximo 5 ligas simultáneas',
      'Ranking global en tiempo real',
      'Sin pagos requeridos',
    ],
    addons:[],
    legal:'Acceso gratuito permanente. Sin compromisos.',
  },
  {
    id:'golzair', name:'GOLZAIR', price:'$1.99', period:'/torneo', emoji:'⚽',
    desc:'Crea tu primera liga',
    color:C.gold,
    popular:true,
    features:[
      'Crea 1 liga (hasta 20 personas)',
      'Únete a ligas ilimitadas',
      'Ranking en tiempo real',
      'Sin publicidad',
    ],
    addons:[
      '+1 Liga adicional — $1.99',
      '+10 personas/liga — $0.99',
    ],
    legal:'Pago único por torneo. Sin renovación automática.',
  },
  {
    id:'liga', name:'LIGA', price:'$4.99', period:'/torneo', emoji:'🏆',
    desc:'Crea hasta 3 ligas',
    color:C.cyan,
    popular:false,
    features:[
      'Crea hasta 3 ligas (25 personas c/u)',
      'Únete a ligas ilimitadas',
      'Ranking en tiempo real',
      'QR de invitación',
    ],
    addons:[
      '+1 Liga adicional — $2.99',
      '+10 personas/liga — $1.99',
    ],
    legal:'Pago único por torneo. Sin renovación automática.',
  },
  {
    id:'pro', name:'PRO', price:'$9.99', period:'/mes', emoji:'👑',
    desc:'Crea hasta 5 ligas',
    color:C.green,
    popular:false,
    features:[
      'Crea hasta 5 ligas (30 personas c/u)',
      'Todos los torneos incluidos',
      'Badge PRO exclusivo',
      'Soporte prioritario',
    ],
    addons:[
      '+1 Liga adicional — $2.99/mes',
      '+10 personas/liga — $1.99/mes',
      '+100 usuarios — $4.99/mes',
    ],
    legal:'Suscripción mensual. Cancela cuando quieras.',
  },
];

const B2B_PLANS = [
  {
    id:'starter', name:'STARTER', price:'$14.99', originalPrice:'$29.99', period:'/mes', emoji:'🏪',
    desc:'Bares · Restaurantes · Empresas',
    color:C.cyan,
    features:[
      'Ligas ilimitadas (1 sucursal)',
      'Hasta 180 usuarios',
      'QR con geofencing',
      'Pantalla TV incluida',
      'Badge GOLZI activo',
    ],
    addons:[
      '+100 usuarios — $9.99/mes',
      '+1 Sucursal — $29.99/mes',
    ],
  },
  {
    id:'business', name:'BUSINESS', price:'$39.99', originalPrice:'$79.99', period:'/mes', emoji:'🏢',
    desc:'Cadenas · Franquicias · Corporativos',
    color:C.gold,
    features:[
      'Ligas ilimitadas (3 sucursales)',
      'Hasta 500 usuarios por sucursal',
      'Dashboard B2B completo',
      'Soporte dedicado',
      'Reportes en tiempo real',
    ],
    addons:[
      '+100 usuarios/sucursal — $9.99/mes',
      '+1 Sucursal — $79.99/mes',
    ],
  },
  {
    id:'enterprise', name:'ENTERPRISE', price:'Custom', period:'', emoji:'🌐',
    desc:'Solución a medida',
    color:C.purple,
    features:[
      'Todo ilimitado',
      'Sucursales ilimitadas',
      'Integración API personalizada',
      'Contrato dedicado',
      'SLA garantizado',
    ],
    addons:[],
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

        {/* B2C Plans */}
        {tab === 0 && (
          <View style={s.plansGrid}>
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
                    {(plan as any).originalPrice && (
                      <Text style={s.originalPrice}>{(plan as any).originalPrice}</Text>
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
                    onPress={() => navigation.navigate('Main')}
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
                🔒 GOLZI es un juego de predicciones deportivas. Los pagos son por acceso a funcionalidades, no por participación en apuestas. Los puntos no tienen valor monetario. Sin reembolsos una vez iniciado el torneo. Puedes cancelar suscripciones en cualquier momento.
              </Text>
            </View>
          </View>
        )}

        {/* B2B Plans */}
        {tab === 1 && (
          <View style={s.plansGrid}>

            <View style={s.promoBanner}>
              <Text style={s.promoTxt}>🎯 Precio fundador 50% OFF · Válido hasta el 11 de junio de 2026</Text>
            </View>

            {B2B_PLANS.map(plan => (
              <View key={plan.id} style={[s.planCard, { borderColor:`${plan.color}30` }]}>
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
                    {(plan as any).originalPrice && (
                      <Text style={s.originalPrice}>{(plan as any).originalPrice}</Text>
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

                <TouchableOpacity style={[s.b2bBtn, { borderColor:`${plan.color}40` }]}>
                  <Text style={[s.b2bBtnTxt, { color: plan.color }]}>
                    {plan.id === 'enterprise' ? '📞 CONTACTAR VENTAS' : '💬 HABLAR CON UN ASESOR'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Disclaimer legal B2B */}
            <View style={s.disclaimerBox}>
              <Text style={s.disclaimerTxt}>
                🔒 Los planes B2B están sujetos a contrato de servicio. GOLZI no se responsabiliza por el uso que terceros hagan de la plataforma. Los precios pueden variar. ENTERPRISE sujeto a negociación y contrato formal. Puedes cancelar suscripciones en cualquier momento con 30 días de aviso.
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
});