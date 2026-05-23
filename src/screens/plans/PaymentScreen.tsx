import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_700Bold, BarlowCondensed_400Regular } from '@expo-google-fonts/barlow-condensed';
import { createPaymentPreference, createWompiPaymentSession, PLANS } from '../../services/payments';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { initIAP, purchaseSubscription, PRODUCT_IDS } from '../../services/iap';

const C = {
  dark: '#05080F', surface: '#0D1117', surface2: '#161B26',
  text: '#F0F4FF', muted: '#6B7A99',
  gold: '#FFD700', green: '#00FF87', red: '#E8003D',
  border: 'rgba(255,255,255,0.07)',
};

export default function PaymentScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    BarlowCondensed_700Bold,
    BarlowCondensed_400Regular,
  });

  if (!fontsLoaded) {
    console.log('⏳ fonts not loaded yet');
    return <View style={s.root} />;
  }
  console.log('✅ fonts loaded, rendering PaymentScreen');

  // ✅ FUNCIÓN ACTUALIZADA
  async function handleBuy(planId: string) {
    console.log('🔑 handleBuy called', planId);
    try {
      setLoading(planId);
      setError('');

      const user = getAuth().currentUser;
      const email = user?.email || 'test@golzi.app';
      const userId = user?.uid || 'anonymous';

      // 🥇 Android — Google Play Billing
      if (Platform.OS === 'android') {
        const productId = PRODUCT_IDS[planId as keyof typeof PRODUCT_IDS];
        if (productId) {
          await initIAP();
          await purchaseSubscription(productId);
          return;
        }
      }

      // 🥈 Web/iOS — Plan A: Mercado Pago
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

      // 🥉 Web/iOS — Plan B: Wompi (fallback)
      const wompiResult = await createWompiPaymentSession(planId, userId, email);
      if (wompiResult.success) {
        const wompiUrl = `https://checkout.wompi.co/p/?public-key=${wompiResult.publicKey}&currency=${wompiResult.currency}&amount-in-cents=${wompiResult.amountCents}&reference=${wompiResult.reference}&signature:integrity=${wompiResult.signature}&redirect-url=${encodeURIComponent('https://golzi.app')}`;
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
      setLoading(null);
    }
  }

  const plans = [
    {
      key: 'GOLZAIR',
      emoji: '⚡',
      color: ['#FFD700', '#E8A000'] as [string, string],
      features: ['1 liga × 20 personas', 'Ligas privadas ilimitadas', 'Sin publicidad', 'Por torneo completo'],
    },
    {
      key: 'LIGA',
      emoji: '🏆',
      color: ['#00C6FF', '#0072FF'] as [string, string],
      features: ['3 ligas × 25 personas', 'Estadísticas avanzadas', 'QR code', 'Historial permanente'],
    },
    {
      key: 'PRO',
      emoji: '🔥',
      color: ['#FF416C', '#FF4B2B'] as [string, string],
      features: ['5 ligas × 30 personas', 'Todos los deportes', 'IA GOLZI avanzada', 'Badge PRO exclusivo'],
    },
    {
      key: 'STARTER',
      emoji: '🏢',
      color: ['#11998e', '#38ef7d'] as [string, string],
      features: ['Ligas ilimitadas', '1 sucursal', 'Pantalla TV', 'Dashboard métricas'],
    },
  ];

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>PLANES GOLZI</Text>
        <Text style={s.subtitle}>Sin apuestas · Sin riesgo · 100% legal</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.freeCard}>
          <Text style={s.freeTitle}>FREE</Text>
          <Text style={s.freePrice}>$0 <Text style={s.freeSub}>siempre</Text></Text>
          <Text style={s.freeDesc}>Únete a 5 ligas públicas · Ranking global</Text>
        </View>

        {plans.map(plan => {
          const planData = PLANS[plan.key as keyof typeof PLANS];
          return (
            <View key={plan.key} style={s.planCard}>
              <LinearGradient
                colors={plan.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.planHeader}
              >
                <Text style={s.planEmoji}>{plan.emoji}</Text>
                <Text style={s.planName}>{planData.name}</Text>
                <Text style={s.planPrice}>${planData.price}</Text>
                <Text style={s.planPer}>
                  {plan.key === 'PRO' || plan.key === 'STARTER' || plan.key === 'BUSINESS'
                    ? '/mes' : '/torneo'}
                </Text>
              </LinearGradient>

              <View style={s.planBody}>
                {plan.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Text style={s.featureCheck}>✓</Text>
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={s.buyBtn}
                  onPress={() => handleBuy(plan.key)}
                  disabled={loading === plan.key}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={plan.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.buyBtnInner}
                  >
                    {loading === plan.key ? (
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <Text style={s.buyBtnTxt}>OBTENER {planData.name}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {error ? <Text style={s.errorTxt}>{error}</Text> : null}

        <Text style={s.legal}>
          Los pagos son procesados de forma segura. GOLZI no almacena datos de tarjeta.
          Los puntos no tienen valor monetario.
        </Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05080F' },
  header: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: 'BebasNeue_400Regular', fontSize: 36, color: '#FFD700', letterSpacing: 3 },
  subtitle: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, color: '#6B7A99', marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  freeCard: { backgroundColor: '#0D1117', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  freeTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 24, color: '#6B7A99', letterSpacing: 2 },
  freePrice: { fontFamily: 'BebasNeue_400Regular', fontSize: 32, color: '#F0F4FF', marginTop: 4 },
  freeSub: { fontSize: 16, color: '#6B7A99' },
  freeDesc: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, color: '#6B7A99', marginTop: 6 },
  planCard: { backgroundColor: '#0D1117', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  planHeader: { padding: 20, alignItems: 'center' },
  planEmoji: { fontSize: 32, marginBottom: 8 },
  planName: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, color: '#000', letterSpacing: 3 },
  planPrice: { fontFamily: 'BebasNeue_400Regular', fontSize: 40, color: '#000', marginTop: 4 },
  planPer: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 12, color: '#000', opacity: 0.7 },
  planBody: { padding: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureCheck: { color: '#00FF87', fontSize: 14, marginRight: 8, fontFamily: 'BarlowCondensed_700Bold' },
  featureText: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 13, color: '#F0F4FF' },
  buyBtn: { marginTop: 12 },
  buyBtnInner: { borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  buyBtnTxt: { fontFamily: 'BebasNeue_400Regular', fontSize: 16, letterSpacing: 2, color: '#000' },
  errorTxt: { color: '#E8003D', fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, textAlign: 'center', marginTop: 8 },
  legal: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 10, color: '#6B7A99', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});