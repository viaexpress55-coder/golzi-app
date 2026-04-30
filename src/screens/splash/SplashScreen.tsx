import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Pressable, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_300Light, Barlow_400Regular } from '@expo-google-fonts/barlow';
import { RootStackParams } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', gold3:'#FF6B00',
  green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
};

function getCD() {
  const diff = new Date('2026-06-11T17:00:00-07:00').getTime() - Date.now();
  if (diff <= 0) return { d:'00', h:'00', m:'00', s:'00' };
  const p = (n: number) => String(Math.floor(n)).padStart(2,'0');
  return {
    d: p(diff / 86400000),
    h: p((diff % 86400000) / 3600000),
    m: p((diff % 3600000) / 60000),
    s: p((diff % 60000) / 1000),
  };
}

const LANGS = ['MX','US','BR','FR','DE','SA','JP'];
const LANG_FLAGS: Record<string,string> = {
  MX:'🇲🇽', US:'🇺🇸', BR:'🇧🇷', FR:'🇫🇷', DE:'🇩🇪', SA:'🇸🇦', JP:'🇯🇵',
};

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [cd, setCD]     = useState(getCD());
  const [lang, setLang] = useState('MX');

  // Animacion trofeo flotando
  const floatAnim = useRef(new Animated.Value(0)).current;
  // Animacion shine en boton
  const shineAnim = useRef(new Animated.Value(-1)).current;
  // Fade in general
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_300Light, Barlow_400Regular,
  });

  useEffect(() => {
    // Countdown
    const t = setInterval(() => setCD(getCD()), 1000);

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue:1, duration:1500, useNativeDriver:true }),
        Animated.timing(floatAnim, { toValue:0, duration:1500, useNativeDriver:true }),
      ])
    ).start();

    // Shine animation
    Animated.loop(
      Animated.timing(shineAnim, { toValue:1, duration:3000, useNativeDriver:true })
    ).start();

    // Fade in
    Animated.timing(fadeAnim, { toValue:1, duration:800, useNativeDriver:true }).start();

    return () => clearInterval(t);
  }, []);

  if (!fontsLoaded) return <View style={s.root} />;

  const trophyY = floatAnim.interpolate({ inputRange:[0,1], outputRange:[0,-7] });
  const shineX  = shineAnim.interpolate({ inputRange:[-1,1], outputRange:[-width, width] });

  return (
    <View style={s.root}>
      {/* Fondo radial dorado arriba */}
      <View style={s.bgGlowGold} />
      {/* Fondo radial cyan derecha */}
      <View style={s.bgGlowCyan} />
      {/* Estadio gradiente abajo */}
      <View style={s.bgStadium} />

      <Animated.View style={[s.inner, { opacity: fadeAnim }]}>

        {/* Trofeo animado */}
        <Animated.Text style={[s.trophy, { transform:[{ translateY: trophyY }] }]}>
          🏆
        </Animated.Text>

        {/* Logo */}
        <Text style={s.logo}>GOLZI</Text>
        <Text style={s.tagline}>FIFA WORLD CUP 2026</Text>

        {/* Countdown */}
        <View style={s.cdRow}>
          {[
            { v:cd.d, l:'DIAS' },
            { v:cd.h, l:'HRS'  },
            { v:cd.m, l:'MIN'  },
            { v:cd.s, l:'SEG'  },
          ].map((item, i) => (
            <View key={i} style={s.cdUnit}>
              <Text style={s.cdNum}>{item.v}</Text>
              <Text style={s.cdLbl}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* Selector de idioma */}
        <View style={s.langRow}>
          {LANGS.map(l => (
            <Pressable key={l} onPress={() => setLang(l)} style={s.langBtn}>
              <Text style={[s.langFlag, lang === l && s.langFlagOn]}>
                {LANG_FLAGS[l]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Info */}
        <Text style={s.infoTxt}>16 CIUDADES SEDE · 48 EQUIPOS</Text>

        {/* Boton principal con shine */}
        <TouchableOpacity
          style={s.btnWrap}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FFD700','#E8A000']}
            start={{ x:0, y:0 }} end={{ x:1, y:0 }}
            style={s.btnMain}
          >
            {/* Shine effect */}
            <Animated.View style={[s.shine, { transform:[{ translateX: shineX }] }]} />
            <Text style={s.btnMainTxt}>⚽  ENTRAR COMO GOLZAIR</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Fine print */}
        <Text style={s.fine}>
          Juego de predicciones deportivas · Sin apuestas · Sin azar{'\n'}
          Disponible en 12 idiomas
        </Text>

        {/* Ya tengo cuenta */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginBtn}>
          <Text style={s.loginTxt}>Ya tengo cuenta →</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },

  // Fondos
  bgGlowGold:{
    position:'absolute', width:400, height:400, borderRadius:200,
    top:-100, alignSelf:'center',
    backgroundColor:'rgba(255,215,0,0.12)',
  },
  bgGlowCyan:{
    position:'absolute', width:300, height:300, borderRadius:150,
    top:200, right:-100,
    backgroundColor:'rgba(0,198,255,0.06)',
  },
  bgStadium:{
    position:'absolute', bottom:0, left:0, right:0, height:160,
    backgroundColor:'rgba(0,48,135,0.3)',
  },

  inner:{
    flex:1, alignItems:'center', justifyContent:'center',
    paddingHorizontal:24, paddingVertical:40,
  },

  // Trofeo
  trophy:{
    fontSize:58,
    marginBottom:8,
    textShadowColor:'rgba(255,215,0,0.6)',
    textShadowOffset:{ width:0, height:0 },
    textShadowRadius:24,
  },

  // Logo
  logo:{
    fontFamily:'BebasNeue_400Regular',
    fontSize:52, letterSpacing:3, lineHeight:56,
    color:C.gold,
    marginBottom:4,
  },
  tagline:{
    fontFamily:'BarlowCondensed_600SemiBold',
    fontSize:11, letterSpacing:5, color:C.muted,
    textTransform:'uppercase', marginBottom:18,
  },

  // Countdown
  cdRow:{ flexDirection:'row', gap:8, marginBottom:16 },
  cdUnit:{
    alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)',
    borderWidth:1, borderColor:'rgba(255,215,0,0.2)',
    borderRadius:8, paddingVertical:6, paddingHorizontal:10, minWidth:50,
  },
  cdNum:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, lineHeight:30 },
  cdLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2, marginTop:1 },

  // Idiomas
  langRow:{ flexDirection:'row', gap:8, flexWrap:'wrap', justifyContent:'center', marginBottom:8 },
  langBtn:{ padding:4 },
  langFlag:{ fontSize:22, opacity:0.4 },
  langFlagOn:{ opacity:1, transform:[{ scale:1.15 }] },

  // Info
  infoTxt:{
    fontFamily:'BarlowCondensed_700Bold',
    fontSize:11, color:C.gold, letterSpacing:2,
    marginBottom:20, textTransform:'uppercase',
  },

  // Boton
  btnWrap:{ width:'100%', marginBottom:12, overflow:'hidden', borderRadius:13 },
  btnMain:{
    borderRadius:13, paddingVertical:14,
    alignItems:'center', overflow:'hidden',
  },
  shine:{
    position:'absolute', top:0, bottom:0, width:60,
    backgroundColor:'rgba(255,255,255,0.25)',
    transform:[{ skewX:'-20deg' }],
  },
  btnMainTxt:{
    fontFamily:'BebasNeue_400Regular',
    fontSize:19, letterSpacing:2, color:'#000',
  },

  // Fine print
  fine:{
    fontFamily:'Barlow_300Light',
    fontSize:9, color:C.muted, textAlign:'center',
    letterSpacing:0.5, lineHeight:15, marginBottom:10,
  },

  // Login
  loginBtn:{ paddingVertical:8 },
  loginTxt:{
    fontFamily:'BarlowCondensed_600SemiBold',
    fontSize:13, color:C.gold, letterSpacing:0.5,
  },
});