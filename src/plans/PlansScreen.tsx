import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular, Barlow_500Medium } from '@expo-google-fonts/barlow';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#E8A000', green:'#00FF87',
  cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.22)',
};

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    period: '',
    desc: 'Solo observar',
    features: ['Ranking con delay 5 min', 'Con publicidad', 'Sin predicciones', 'Sin ligas'],
    color: C.muted,
    popular: false,
    cta: 'ENTRAR GRATIS',
  },
  {
    id: 'player',
    name: 'PLAYER',
    price: '$1.99',
    period: '/torneo',
    desc: 'Predice todos los partidos',
    features: ['Predecir los 64 partidos', 'Unirse a max 3 ligas', 'Sin crear ligas propias', 'Ranking en tiempo real'],
    color: C.gold,
    popular: true,
    cta: 'ELEGIR PLAYER',
  },
  {
    id: 'liga',
    name: 'LIGA',
    price: '$4.99',
    period: '/torneo',
    desc: 'Crea tu propia liga',
    features: ['Todo lo de PLAYER', 'Crear hasta 3 ligas', 'Max 12 participantes c/u', 'QR único de invitación'],
    color: C.cyan,
    popular: false,
    cta: 'ELEGIR LIGA',
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '$9.99',
    period: '/mes',
    desc: 'Todo incluido + IA avanzada',
    features: ['Todos los torneos activos', 'Crear hasta 5 ligas de 50', 'IA avanzada de predicción', 'Badge PRO exclusivo'],
    color: C.green,
    popular: false,
    cta: 'ELEGIR PRO',
  },
];

interface Props {
  onBack?:   () => void;
  onSelect?: (plan: string) => void;
}

export default function PlansScreen({ onBack, onSelect }: Props) {
  const [selected, setSelected] = useState('player');

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Barlow_400Regular,
    Barlow_500Medium,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      <View style={s.glow1} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backTxt}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={s.topLogo}>GOLZI</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>ELIGE TU PLAN</Text>
          <Text style={s.subtitle}>Mundial FIFA 2026 · Precios en USD</Text>
        </View>

        {/* Regla del primer pitazo */}
        <View style={s.ruleBadge}>
          <Text style={s.ruleIcon}>⚡</Text>
          <Text style={s.ruleTxt}>Regla del Primer Pitazo — predicciones cierran al inicio del partido. Sin excepciones.</Text>
        </View>

        {/* Cards de planes */}
        {PLANS.map(plan => (
          <Pressable
            key={plan.id}
            style={[s.card, selected === plan.id && { borderColor: plan.color, borderWidth: 1.5 }]}
            onPress={() => setSelected(plan.id)}
          >
            {plan.popular && (
              <View style={s.popularBadge}>
                <Text style={s.popularTxt}>⭐ MÁS POPULAR</Text>
              </View>
            )}

            <View style={s.cardTop}>
              <View style={s.cardLeft}>
                <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                <Text style={s.planDesc}>{plan.desc}</Text>
              </View>
              <View style={s.cardRight}>
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
                style={s.ctaWrap}
                onPress={() => onSelect?.(plan.id)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={plan.id === 'free' ? ['#444', '#333'] : ['#FFD700', '#E8A000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.ctaBtn}
                >
                  <Text style={s.ctaTxt}>{plan.cta}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Pressable>
        ))}

        {/* Separador B2B */}
        <View style={s.b2bSep}>
          <View style={s.sepLine} />
          <Text style={s.sepTxt}>PARA TU NEGOCIO</Text>
          <View style={s.sepLine} />
        </View>

        {/* Promo fundador */}
        <View style={s.promoBanner}>
          <Text style={s.promoTxt}>🎯 Precio fundador 50% OFF — válido hasta el 11 de junio</Text>
        </View>

        {/* Card B2B */}
        <View style={[s.card, { borderColor: C.borderG }]}>
          <View style={s.cardTop}>
            <View style={s.cardLeft}>
              <Text style={[s.planName, { color: C.gold, fontSize: 20 }]}>STARTER</Text>
              <Text style={s.planDesc}>Bares · Restaurantes · Empresas</Text>
              <Text style={[s.planDesc, { marginTop: 2 }]}>1 liga · hasta 150 usuarios</Text>
            </View>
            <View style={s.cardRight}>
              <Text style={[s.planPrice, { color: C.green, fontSize: 26 }]}>$17</Text>
              <Text style={s.planPeriod}>/mes</Text>
              <Text style={[s.planPeriod, { textDecorationLine: 'line-through', marginTop: 2 }]}>$29/mes</Text>
            </View>
          </View>
          <View style={s.featureList}>
            {['QR con geofencing', 'Pantalla TV incluida', 'Badge GOLZI Nuevo', 'Precio normal al 4° mes'].map((f, i) => (
              <View key={i} style={s.featureRow}>
                <Text style={[s.featureDot, { color: C.gold }]}>✓</Text>
                <Text style={s.featureTxt}>{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.b2bBtn}>
            <Text style={s.b2bBtnTxt}>💼 HABLAR CON UN ASESOR</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.fine}>
          Upgrade parcial disponible durante torneos activos.{'\n'}
          Solo pagas la diferencia al subir de plan.
        </Text>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.dark },
  glow1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, alignSelf: 'center', backgroundColor: 'rgba(255,215,0,0.06)' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 60 },
  backTxt: { fontFamily: 'BarlowCondensed_600SemiBold', fontSize: 14, color: C.muted, letterSpacing: 0.5 },
  topLogo: { fontFamily: 'BebasNeue_400Regular', fontSize: 24, color: C.gold, letterSpacing: 3 },

  scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },

  header: { marginBottom: 16 },
  title: { fontFamily: 'BebasNeue_400Regular', fontSize: 40, color: C.gold, letterSpacing: 2, lineHeight: 44 },
  subtitle: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 13, color: C.muted, marginTop: 2 },

  ruleBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(232,0,61,0.08)', borderWidth: 1, borderColor: 'rgba(232,0,61,0.2)', borderRadius: 10, padding: 10, marginBottom: 16 },
  ruleIcon: { fontSize: 14 },
  ruleTxt: { fontFamily: 'BarlowCondensed_600SemiBold', fontSize: 11, color: C.muted2, letterSpacing: 0.3, flex: 1, lineHeight: 16 },

  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  popularBadge: { backgroundColor: 'rgba(255,215,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', borderRadius: 20, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10 },
  popularTxt: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 9, color: C.gold, letterSpacing: 2 },

  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  planName: { fontFamily: 'BebasNeue_400Regular', fontSize: 26, letterSpacing: 1, lineHeight: 30 },
  planDesc: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, color: C.muted, marginTop: 2 },
  planPrice: { fontFamily: 'BebasNeue_400Regular', fontSize: 30, lineHeight: 34 },
  planPeriod: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 11, color: C.muted },

  divider: { height: 1, backgroundColor: C.border, marginBottom: 10 },

  featureList: { gap: 5 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureDot: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 12, lineHeight: 18 },
  featureTxt: { fontFamily: 'Barlow_400Regular', fontSize: 12, color: C.muted2, flex: 1, lineHeight: 18 },

  ctaWrap: { marginTop: 12 },
  ctaBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  ctaTxt: { fontFamily: 'BebasNeue_400Regular', fontSize: 16, letterSpacing: 2, color: '#000' },

  b2bSep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  sepLine: { flex: 1, height: 1, backgroundColor: C.borderG },
  sepTxt: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 11, color: C.gold, letterSpacing: 3 },

  promoBanner: { backgroundColor: 'rgba(255,215,0,0.06)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)', borderRadius: 8, padding: 10, marginBottom: 10, alignItems: 'center' },
  promoTxt: { fontFamily: 'BarlowCondensed_600SemiBold', fontSize: 11, color: C.gold, letterSpacing: 0.5 },

  b2bBtn: { marginTop: 12, borderWidth: 1, borderColor: C.borderG, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  b2bBtnTxt: { fontFamily: 'BebasNeue_400Regular', fontSize: 14, letterSpacing: 2, color: C.gold },

  fine: { fontFamily: 'Barlow_400Regular', fontSize: 10, color: C.muted, textAlign: 'center', lineHeight: 16, marginTop: 12 },
});