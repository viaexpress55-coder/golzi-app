import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Linking, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_700Bold, BarlowCondensed_400Regular, BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { createPaymentPreference, createWompiPaymentSession } from '../../services/payments';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { initIAP, purchaseProduct, getProducts, endIAP, PRODUCT_IDS } from '../../services/iap';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';

const C = {
  bg: '#020408', surface: '#0A0F1A', surface2: '#0F1520',
  text: '#F0F4FF', muted: '#6B7A99', muted2: '#9AAABB',
  gold: '#FFD700', gold2: '#FFA500', green: '#00FF87',
  red: '#E8003D', border: 'rgba(255,255,255,0.07)',
};

type PaymentRouteProp = RouteProp<RootStackParams, 'Payment'>;

const FEATURES: Record<string, string[]> = {
  liga:      ['Crea tu liga privada','Hasta 5 jugadores','Chat en tu liga','Retos diarios y puntos extra','Sin anuncios'],
  pro:       ['Todo lo de LIGA','Hasta 10 jugadores','Mejor experiencia grupal','Sin anuncios'],
  master:    ['Todo lo de PRO','Hasta 25 jugadores','Historial de liga','Métricas básicas','Sin anuncios'],
  golzair:   ['Multiligas (ilimitadas)','Hasta 100 usuarios','Dashboard básico','Chat y comunicación','Reportes básicos','Soporte prioritario'],
  partner:   ['Multiligas','Hasta 500 usuarios','Dashboard básico','Panel de estadísticas','Branding básico'],
  business:  ['Multiligas','Hasta 1,000 usuarios','Dashboard avanzado','Reportes y métricas','Exportación de datos','Soporte prioritario'],
  gold:      ['Multiligas','Hasta 2,500 usuarios','Branding personalizado','Eventos y activaciones','Soporte VIP 24/7'],
  golziplus: ['Todo ilimitado','White label','Integraciones avanzadas','SLA personalizado','Soporte dedicado','Escalabilidad total'],
};

const PLAN_USERS: Record<string, string> = {
  liga: '5 jugadores', pro: '10 jugadores', master: '25 jugadores',
  golzair: '100 usuarios', partner: '500 usuarios', business: '1,000 usuarios',
  gold: '2,500 usuarios', golziplus: '5,000+ usuarios',
};

export default function PaymentScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const route = useRoute<PaymentRouteProp>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializar IAP una sola vez al montar (solo Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      initIAP().catch(e => console.log('IAP init error:', e));
    }
    return () => {
      if (Platform.OS === 'android') endIAP();
    };
  }, []);

  const { planId, planName, price, emoji } = route.params ?? {
    planId: 'liga', planName: 'LIGA', price: 14.99, emoji: '⚡',
  };

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    BarlowCondensed_700Bold,
    BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold,
    Barlow_400Regular,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  const b2bPlans = ['partner', 'business', 'gold', 'golziplus'];

  async function handleBuy() {
    try {
      setLoading(true);
      setError('');

     const user = getAuth().currentUser;
if (!user) { setError('Debes iniciar sesión para continuar.'); setLoading(false); return; }
const email = user.email || '';
const userId = user.uid;

            // Android — Google Play Billing
      if (Platform.OS === 'android') {
        if (planId === 'golziplus') {
          await Linking.openURL('https://wa.me/573054325588?text=Hola%2C%20me%20interesa%20el%20plan%20GOLZI%20PREMIUM');
          setLoading(false);
          return;
        }
        const productId = PRODUCT_IDS[planId as keyof typeof PRODUCT_IDS];
        if (productId) {
          try {
            const products = await getProducts();
            if (!products || products.length === 0) {
              setError('No se pudo conectar con Google Play. Verifica tu conexión e intenta de nuevo.');
              setLoading(false);
              return;
            }
            await purchaseProduct(productId);
            setLoading(false);
            return;
          } catch (iapError: any) {
            const errMsg = iapError?.message || iapError?.code || '';
            if (!errMsg.includes('cancel') && !errMsg.includes('E_USER_CANCELLED')) {
              setError('Error al procesar el pago. Intenta de nuevo.');
            }
            setLoading(false);
            return;
          }
        }
      }

      // B2B — directo a Wompi
      if (b2bPlans.includes(planId)) {
        const wompiResult = await createWompiPaymentSession(planId, userId, email);
        if (wompiResult.success && wompiResult.publicKey) {
          const wompiUrl = `https://checkout.wompi.co/p/?public-key=${wompiResult.publicKey}&currency=${wompiResult.currency}&amount-in-cents=${wompiResult.amountCents}&reference=${wompiResult.reference}&signature%3Aintegrity=${wompiResult.signature}&redirect-url=${encodeURIComponent('https://golzi.app')}`;
          if (typeof window !== 'undefined') { window.location.href = wompiUrl; }
          else { await Linking.openURL(wompiUrl); }
        } else {
          setError('Error procesando el pago. Intenta de nuevo.');
        }
        return;
      }

      // Web/iOS — Plan A: Mercado Pago
      try {
        const mpResult = await createPaymentPreference(planId);
        if (mpResult.success && mpResult.initPoint) {
          if (typeof window !== 'undefined') {
            window.location.href = mpResult.initPoint;
          } else {
            await Linking.openURL(mpResult.initPoint);
          }
          return;
        }
      } catch (mpError) {
        console.log('MP falló, intentando Wompi...', mpError);
      }

      // Plan B: Wompi fallback
      const wompiResult = await createWompiPaymentSession(planId, userId, email);
      if (wompiResult.success && wompiResult.publicKey) {
        const wompiUrl = `https://checkout.wompi.co/p/?public-key=${wompiResult.publicKey}&currency=${wompiResult.currency}&amount-in-cents=${wompiResult.amountCents}&reference=${wompiResult.reference}&signature%3Aintegrity=${wompiResult.signature}&redirect-url=${encodeURIComponent('https://golzi.app')}`;
        if (typeof window !== 'undefined') {
          window.location.href = wompiUrl;
        } else {
          await Linking.openURL(wompiUrl);
        }
      } else {
        setError('Error procesando el pago. Intenta de nuevo.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const features = FEATURES[planId] ?? FEATURES['liga'];
  const planUsers = PLAN_USERS[planId] ?? '';

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />
      <View style={s.topLine} />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Plans')} style={s.backBtn}>
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
        <View style={s.heroBox}>
          <Text style={s.heroTitle}>1 PAGA, TODOS JUEGAN</Text>
          <Text style={s.heroSub}>Tú pagas · Invitas por link · Todos entran gratis</Text>
        </View>

        {/* Plan card */}
        <View style={s.planCard}>
          <LinearGradient colors={[C.gold+'22', 'transparent']} style={StyleSheet.absoluteFill} />
          <View style={s.planTopLine} />
          <View style={s.planTop}>
            <Text style={s.planEmoji}>{emoji}</Text>
            <View style={s.planInfo}>
              <Text style={s.planName}>{planName}</Text>
              {planUsers ? <Text style={s.planUsers}>👥 {planUsers}</Text> : null}
            </View>
            <View style={s.planPriceBox}>
              <Text style={s.planPrice}>${price}</Text>
              <Text style={s.planPeriod}>pago único</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.featureList}>
            {features.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <Text style={s.featureCheck}>✓</Text>
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Promo banner */}
        <View style={s.promoBanner}>
          <Text style={s.promoTxt}>🔥 Oferta de lanzamiento · Primeras 500 ligas</Text>
        </View>

        {/* Métodos de pago */}
        <View style={s.paymentSection}>
          {Platform.OS !== 'android' && <Text style={s.paymentTitle}>MÉTODO DE PAGO</Text>}
          {Platform.OS !== 'android' && <View style={s.methodsRow}>
            <View style={s.methodPill}><Text style={s.methodTxt}>💳 Tarjeta</Text></View>
            <View style={s.methodPill}><Text style={s.methodTxt}>🏦 PSE</Text></View>
            <View style={s.methodPill}><Text style={s.methodTxt}>📱 Nequi</Text></View>
            <View style={s.methodPill}><Text style={s.methodTxt}>💵 Efecty</Text></View>
          </View>}
          <TouchableOpacity style={s.buyBtn} onPress={handleBuy} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={[C.gold, C.gold2]} start={{ x:0, y:0 }} end={{ x:1, y:0 }} style={s.buyBtnInner}>
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={s.buyBtnTxt}>⚡ {t('plans_activate')} {planName} — ${price}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {error ? <Text style={s.errorTxt}>{error}</Text> : null}
        </View>

        {/* Seguridad */}
        <View style={s.securityBox}>
          <Text style={s.securityTitle}>🔒 PAGO 100% SEGURO</Text>
          <Text style={s.securityTxt}>
            {Platform.OS === 'android' 
              ? 'Pago seguro procesado por Google Play. Los puntos no tienen valor monetario. Sin apuestas. 100% legal.' 
              : 'Procesado por Mercado Pago o Wompi. GOLZI no almacena datos de tarjeta. Los puntos no tienen valor monetario. Sin apuestas. 100% legal.'}
          </Text>
        </View>

        <Text style={s.legal}>
          ℹ️ Precio promo hasta 10 jun. Pago único por torneo. Sin renovación automática. Sin reembolsos una vez iniciado el torneo.
        </Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.bg },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)', zIndex:10 },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted },
  headerLogo:{ width:36, height:36 },
  scroll:{ paddingHorizontal:16, paddingTop:16, paddingBottom:40 },

  heroBox:{ alignItems:'center', marginBottom:16, backgroundColor:'rgba(255,215,0,0.05)', borderRadius:12, padding:14, borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  heroTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold, letterSpacing:2, textAlign:'center' },
  heroSub:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted2, textAlign:'center', marginTop:4 },

  planCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1.5, borderColor:'rgba(255,215,0,0.35)', borderRadius:16, overflow:'hidden', marginBottom:14 },
  planTopLine:{ height:2, backgroundColor:C.gold },
  planTop:{ flexDirection:'row', alignItems:'center', gap:10, padding:16, paddingBottom:0 },
  planEmoji:{ fontSize:28 },
  planInfo:{ flex:1 },
  planName:{ fontFamily:'BebasNeue_400Regular', fontSize:28, color:C.gold, letterSpacing:1 },
  planUsers:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2, marginTop:2 },
  planPriceBox:{ alignItems:'flex-end' },
  planPrice:{ fontFamily:'BebasNeue_400Regular', fontSize:32, color:C.gold },
  planPeriod:{ fontFamily:'BarlowCondensed_400Regular', fontSize:10, color:C.muted },
  divider:{ height:1, backgroundColor:'rgba(255,255,255,0.06)', margin:16, marginBottom:10 },
  featureList:{ gap:8, paddingHorizontal:16, paddingBottom:16 },
  featureRow:{ flexDirection:'row', alignItems:'center', gap:8 },
  featureCheck:{ color:C.green, fontSize:13, fontFamily:'BarlowCondensed_700Bold', width:14 },
  featureText:{ fontFamily:'Barlow_400Regular', fontSize:12, color:C.muted2, flex:1 },

  promoBanner:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.4)', borderRadius:10, padding:12, alignItems:'center', marginBottom:14 },
  promoTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.gold, letterSpacing:0.5 },

  paymentSection:{ backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:16, padding:16, marginBottom:14 },
  paymentTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:C.muted2, letterSpacing:2, marginBottom:12 },
  methodsRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 },
  methodPill:{ backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', borderRadius:20, paddingHorizontal:12, paddingVertical:6 },
  methodTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2 },

  buyBtn:{ borderRadius:12, overflow:'hidden' },
  buyBtnInner:{ paddingVertical:16, alignItems:'center', borderRadius:12 },
  buyBtnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, color:'#000', letterSpacing:2 },
  errorTxt:{ color:C.red, fontFamily:'BarlowCondensed_400Regular', fontSize:12, textAlign:'center', marginTop:10 },

  securityBox:{ backgroundColor:'rgba(0,255,135,0.05)', borderWidth:1, borderColor:'rgba(0,255,135,0.2)', borderRadius:12, padding:14, marginBottom:14 },
  securityTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:11, color:C.green, letterSpacing:2, marginBottom:6 },
  securityTxt:{ fontFamily:'Barlow_400Regular', fontSize:11, color:C.muted2, lineHeight:16 },

  legal:{ fontFamily:'Barlow_400Regular', fontSize:9, color:C.muted, textAlign:'center', lineHeight:14 },
});