import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import {
  Barlow_300Light,
  Barlow_400Regular,
} from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
// ─── Paleta idéntica al HTML de referencia ──────────────
const C = {
  dark:    '#05080F',
  text:    '#F0F4FF',
  muted:   '#6B7A99',
  gold:    '#FFD700',
  gold2:   '#E8A000',
  border:  'rgba(255,215,0,0.2)',
};

// ─── Countdown hasta el 11 Jun 2026 17:00 hora LA ───────
function getCD() {
  const diff = new Date('2026-06-11T17:00:00-07:00').getTime() - Date.now();
  if (diff <= 0) return { d: '00', h: '00', m: '00', s: '00' };
  const p = (n: number) => String(Math.floor(n)).padStart(2, '0');
  return {
    d: p(diff / 86400000),
    h: p((diff % 86400000) / 3600000),
    m: p((diff % 3600000) / 60000),
    s: p((diff % 60000) / 1000),
  };
}

const LANGS = ['🇪🇸', '🇺🇸', '🇧🇷', '🇫🇷', '🇩🇪', '🇸🇦', '🇯🇵'];

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [cd, setCD]     = useState(getCD());
  const [lang, setLang] = useState(0);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Barlow_300Light,
    Barlow_400Regular,
  });

  useEffect(() => {
    const t = setInterval(() => setCD(getCD()), 1000);
    return () => clearInterval(t);
  }, []);

  // Muestra fondo negro mientras cargan las fuentes
  if (!fontsLoaded) return <View style={s.root} />;

  return (
    <View style={s.root}>
      {/* Glow dorado arriba */}
      <View style={s.glow1} />
      {/* Glow rojo abajo derecha */}
      <View style={s.glow2} />

      <View style={s.inner}>

        {/* ── Logo ── */}
        <Text style={s.logo}>GOLZI</Text>
        <Text style={s.tagline}>PREDICT · COMPETE · WIN</Text>

        {/* ── Countdown ── */}
        <View style={s.cdBox}>
          <Text style={s.cdLabel}>MUNDIAL FIFA 2026</Text>
          <View style={s.cdRow}>
            {[
              { v: cd.d, l: 'DÍAS' },
              { v: cd.h, l: 'HRS'  },
              { v: cd.m, l: 'MIN'  },
              { v: cd.s, l: 'SEG'  },
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={s.cdSep}>:</Text>}
                <View style={s.cdUnit}>
                  <Text style={s.cdNum}>{item.v}</Text>
                  <Text style={s.cdUnitLbl}>{item.l}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Banderas de idioma ── */}
        <View style={s.langRow}>
          {LANGS.map((flag, i) => (
            <Pressable key={i} onPress={() => setLang(i)} style={s.langBtn}>
              <Text style={[s.flag, lang === i && s.flagOn]}>{flag}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.disclaimer}>Predicciones deportivas · Sin apuestas</Text>

        {/* ── Botón principal con degradado dorado ── */}
        <TouchableOpacity
          style={s.btnWrap}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FFD700', '#E8A000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.btnMain}
          >
            <Text style={s.btnMainTxt}>⚽  ENTRAR COMO GOLZAIR</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Botón ghost ── */}
        <TouchableOpacity
          style={s.btnGhost}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={s.btnGhostTxt}>Explorar gratis</Text>
        </TouchableOpacity>

        <Text style={s.fine}>
          Juego de predicciones deportivas · Sin apuestas · Sin azar{'\n'}
          Disponible en 12 idiomas
        </Text>

      </View>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.dark,
  },

  // Glows de fondo
  glow1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -80,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,215,0,0.07)',
  },
  glow2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 80,
    right: -60,
    backgroundColor: 'rgba(232,0,61,0.06)',
  },

  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // Logo
  logo: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 84,
    letterSpacing: 8,
    lineHeight: 92,
    color: C.gold,
  },
  tagline: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 11,
    letterSpacing: 4,
    color: C.muted,
    textTransform: 'uppercase',
    marginBottom: 22,
  },

  // Countdown
  cdBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cdLabel: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 9,
    letterSpacing: 3,
    color: C.muted,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cdRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  cdUnit: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 50,
  },
  cdNum: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 30,
    color: C.gold,
    lineHeight: 34,
  },
  cdUnitLbl: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: 7,
    letterSpacing: 2,
    color: C.muted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cdSep: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    color: 'rgba(255,215,0,0.3)',
    paddingBottom: 16,
  },

  // Idiomas
  langRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  langBtn: {
    padding: 4,
  },
  flag: {
    fontSize: 22,
    opacity: 0.35,
  },
  flagOn: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },

  // Disclaimer
  disclaimer: {
    fontFamily: 'BarlowCondensed_400Regular',
    fontSize: 11,
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  // Botón principal
  btnWrap: {
    width: '100%',
    marginBottom: 10,
  },
  btnMain: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnMainTxt: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    letterSpacing: 2,
    color: '#000000',
  },

  // Botón ghost
  btnGhost: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnGhostTxt: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    letterSpacing: 2,
    color: C.gold,
  },

  // Fine print
  fine: {
    fontFamily: 'Barlow_300Light',
    fontSize: 10,
    color: C.muted,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 16,
    marginTop: 10,
  },
});