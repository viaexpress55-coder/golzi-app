import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Pressable, Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { useAppFonts } from '../../hooks/useFontsLoaded';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';

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

const LANGS = [
  { code:'ES', flag:'🇪🇸', i18n:'es', name:'Español'   },
  { code:'US', flag:'🇺🇸', i18n:'en', name:'English'   },
  { code:'BR', flag:'🇧🇷', i18n:'pt', name:'Português' },
  { code:'FR', flag:'🇫🇷', i18n:'fr', name:'Français'  },
  { code:'DE', flag:'🇩🇪', i18n:'de', name:'Deutsch'   },
  { code:'IT', flag:'🇮🇹', i18n:'it', name:'Italiano'  },
  { code:'CN', flag:'🇨🇳', i18n:'zh', name:'中文'       },
  { code:'JP', flag:'🇯🇵', i18n:'ja', name:'日本語'     },
  { code:'KR', flag:'🇰🇷', i18n:'ko', name:'한국어'     },
  { code:'SA', flag:'🇸🇦', i18n:'ar', name:'العربية'   },
  { code:'IN', flag:'🇮🇳', i18n:'hi', name:'हिन्दी'     },
  { code:'RU', flag:'🇷🇺', i18n:'ru', name:'Русский'   },
];

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  const [cd, setCD] = useState(getCD());
  const [selectedLang, setSelectedLang] = useState<string>('MX');

  const floatAnim    = useRef(new Animated.Value(0)).current;
  const shineAnim    = useRef(new Animated.Value(-1)).current;
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const stadiumFade  = useRef(new Animated.Value(0)).current;
  const stadiumScale = useRef(new Animated.Value(1.08)).current;

  const fontsLoaded = useAppFonts();

  useEffect(() => {
    const timer = setInterval(() => setCD(getCD()), 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue:1, duration:1500, useNativeDriver:false }),
        Animated.timing(floatAnim, { toValue:0, duration:1500, useNativeDriver:false }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(shineAnim, { toValue:1, duration:3000, useNativeDriver:false })
    ).start();

    Animated.timing(fadeAnim, { toValue:1, duration:800, useNativeDriver:false }).start();

    Animated.parallel([
      Animated.timing(stadiumFade,  { toValue:1, duration:2000, useNativeDriver:false }),
      Animated.timing(stadiumScale, { toValue:1, duration:2500, useNativeDriver:false }),
    ]).start();

    return () => clearInterval(timer);
  }, []);

  if (!fontsLoaded) return null;

  const trophyY = floatAnim.interpolate({ inputRange:[0,1], outputRange:[0,-7] });
  const shineX  = shineAnim.interpolate({ inputRange:[-1,1], outputRange:[-width, width] });

  function changeLang(lang: typeof LANGS[0]) {
    i18n.changeLanguage(lang.i18n);
    setSelectedLang(lang.code);
  }

  return (
    <View style={s.root}>
      <View style={s.bgGlowGold} />
      <View style={s.bgGlowCyan} />
      <Animated.Image
        source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/splash-bg.png?alt=media&token=ea49a7a6-bb16-4a0f-9763-9cfd23695bab' }}
        style={[s.bgStadium, { opacity: stadiumFade, transform:[{ scale: stadiumScale }] }]}
        resizeMode="contain"
      />

      <Animated.View style={[s.inner, { opacity: fadeAnim }]}>

        

        <Text style={s.tagline}>MUNDIAL 2026</Text>

        {/* Fechas */}
        <Text style={s.dateRange}>11 JUN – 19 JUL 2026</Text>

        {/* Countdown */}
        <View style={s.cdRow}>
          {[
            { v:cd.d, l:t('splash_days') },
            { v:cd.h, l:t('splash_hours') },
            { v:cd.m, l:t('splash_mins') },
            { v:cd.s, l:t('splash_secs') },
          ].map((item, i) => (
            <View key={i} style={s.cdUnit}>
              <Text style={s.cdNum}>{item.v}</Text>
              <Text style={s.cdLbl}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* Selector de idioma con banderas */}
        <Text style={s.langTitle}>SELECCIONA TU IDIOMA</Text>
        <View style={s.langRow}>
          {LANGS.map(l => {
            const isSelected = selectedLang === l.code;
            return (
              <Pressable
                key={l.code}
                onPress={() => changeLang(l)}
                style={[s.langBtn, isSelected && s.langBtnOn]}
              >
                <Image
                  source={{ uri: `https://flagcdn.com/w40/${l.code.toLowerCase()}.png` }}
                  style={[s.langFlagImg, isSelected && { opacity:1, transform:[{ scale:1.2 }] }]}
                  resizeMode="contain"
                />
                <Text style={[s.langName, !isSelected && s.langNameOff]}>
                  {l.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={s.infoTxt}>16 CIUDADES SEDE · 48 EQUIPOS</Text>

        <TouchableOpacity
          style={s.btnWrap}
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FFD700','#E8A000']}
            start={{ x:0, y:0 }} end={{ x:1, y:0 }}
            style={s.btnMain}
          >
            <Animated.View style={[s.shine, { transform:[{ translateX: shineX }] }]} />
            <Text style={s.btnMainTxt}>⚡  {t('splash_enter')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={s.fine}>
          {t('splash_subtitle')}{'\n'}
          {t('splash_languages')}
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginBtn}>
          <Text style={s.loginTxt}>{t('splash_have_account')}</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
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
    position:'absolute', top:0, left:0, right:0, bottom:0,
    opacity:0.1,
  },
  inner:{
    flex:1, alignItems:'center', justifyContent:'center',
    paddingHorizontal:24, paddingVertical:40,
  },
  trophy:{ width:180, height:180, marginBottom:8 },
  tagline:{
    fontFamily:'BarlowCondensed_600SemiBold',
    fontSize:11, letterSpacing:5, color:C.muted,
    textTransform:'uppercase', marginBottom:14,
  },
  dateRange:{
    fontFamily:'BarlowCondensed_600SemiBold',
    fontSize:11, color:C.cyan, letterSpacing:3,
    marginBottom:6, textTransform:'uppercase',
    backgroundColor:'rgba(0,0,0,0.4)',
    paddingHorizontal:10, paddingVertical:3, borderRadius:6,
  },
  cdRow:{ flexDirection:'row', gap:8, marginBottom:14 },
  cdUnit:{
    alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)',
    borderWidth:1, borderColor:'rgba(255,215,0,0.2)',
    borderRadius:8, paddingVertical:6, paddingHorizontal:10, minWidth:50,
  },
  cdNum:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, lineHeight:30 },
  cdLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2, marginTop:1 },
  langTitle:{ fontFamily:'BarlowCondensed_700Bold', fontSize:8, color:C.muted, letterSpacing:3, marginBottom:8 },
  langRow:{ flexDirection:'row', gap:6, flexWrap:'wrap', justifyContent:'center', marginBottom:10 },
  langBtn:{ padding:4, alignItems:'center', borderRadius:8, borderWidth:1, borderColor:'transparent' },
  langBtnOn:{ borderColor:'rgba(255,215,0,0.4)', backgroundColor:'rgba(255,215,0,0.08)' },
  langFlag:{ fontSize:22, opacity:0.4 },
  langFlagOn:{ opacity:1, transform:[{ scale:1.2 }] },
  langFlagImg:{ width:32, height:22, borderRadius:3, opacity:0.5 },
  langName:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.gold, letterSpacing:0.5, marginTop:2 },
  langNameOff:{ color:C.muted, opacity:0.6 },
  infoTxt:{
    fontFamily:'BarlowCondensed_700Bold',
    fontSize:11, color:C.gold, letterSpacing:2,
    marginBottom:16, textTransform:'uppercase',
  },
  btnWrap:{ width:'100%', marginBottom:10, overflow:'hidden', borderRadius:13 },
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
  fine:{
    fontFamily:'BarlowCondensed_400Regular',
    fontSize:9, color:C.muted, textAlign:'center',
    letterSpacing:0.5, lineHeight:15, marginBottom:8,
  },
  loginBtn:{ paddingVertical:8 },
  loginTxt:{
    fontFamily:'BarlowCondensed_600SemiBold',
    fontSize:13, color:C.gold, letterSpacing:0.5,
  },
  golziTitle:{
    fontFamily:'BebasNeue_400Regular',
    fontSize:52, color:C.gold, letterSpacing:8,
    textShadowColor:'rgba(255,215,0,0.8)',
    textShadowOffset:{ width:0, height:0 },
    textShadowRadius:20,
    marginBottom:2,
  },
});
