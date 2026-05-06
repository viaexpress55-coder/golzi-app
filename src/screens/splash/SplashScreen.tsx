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
  const { t } = useTranslation();
  const [cd, setCD]     = useState(getCD());
  const [lang, setLang] = useState('MX');

  const floatAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const fontsLoaded = useAppFonts();

  useEffect(() => {
    const t = setInterval(() => setCD(getCD()), 1000);

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

    return () => clearInterval(t);
  }, []);

  if (!fontsLoaded) return null;

  const trophyY = floatAnim.interpolate({ inputRange:[0,1], outputRange:[0,-7] });
  const shineX  = shineAnim.interpolate({ inputRange:[-1,1], outputRange:[-width, width] });

  return (
    <View style={s.root}>
      <View style={s.bgGlowGold} />
      <View style={s.bgGlowCyan} />
      <View style={s.bgStadium} />

      <Animated.View style={[s.inner, { opacity: fadeAnim }]}>

        <Animated.View style={{ transform:[{ translateY: trophyY }] }}>
          <Image
            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
            style={s.trophy}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={s.tagline}>FIFA WORLD CUP 2026</Text>

        {/* Countdown con i18n */}
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

        <View style={s.langRow}>
          {LANGS.map(l => (
            <Pressable key={l} onPress={() => setLang(l)} style={s.langBtn}>
              <Text style={[s.langFlag, lang === l && s.langFlagOn]}>
                {LANG_FLAGS[l]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.infoTxt}>16 CIUDADES SEDE · 48 EQUIPOS</Text>

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
            <Animated.View style={[s.shine, { transform:[{ translateX: shineX }] }]} />
            <Text style={s.btnMainTxt}>⚡  ENTRAR COMO GOLZAIR</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Fine print con i18n */}
        <Text style={s.fine}>
          {t('splash_subtitle')}{'\n'}
          {t('splash_languages')}
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginBtn}>
          <Text style={s.loginTxt}>Ya tengo cuenta →</Text>
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
    position:'absolute', bottom:0, left:0, right:0, height:160,
    backgroundColor:'rgba(0,48,135,0.3)',
  },
  inner:{
    flex:1, alignItems:'center', justifyContent:'center',
    paddingHorizontal:24, paddingVertical:40,
  },
  trophy:{ width:220, height:220, marginBottom:8 },
  tagline:{
    fontFamily:'BarlowCondensed_600SemiBold',
    fontSize:11, letterSpacing:5, color:C.muted,
    textTransform:'uppercase', marginBottom:18,
  },
  cdRow:{ flexDirection:'row', gap:8, marginBottom:16 },
  cdUnit:{
    alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)',
    borderWidth:1, borderColor:'rgba(255,215,0,0.2)',
    borderRadius:8, paddingVertical:6, paddingHorizontal:10, minWidth:50,
  },
  cdNum:{ fontFamily:'BebasNeue_400Regular', fontSize:26, color:C.gold, lineHeight:30 },
  cdLbl:{ fontFamily:'BarlowCondensed_700Bold', fontSize:7, color:C.muted, letterSpacing:2, marginTop:1 },
  langRow:{ flexDirection:'row', gap:8, flexWrap:'wrap', justifyContent:'center', marginBottom:8 },
  langBtn:{ padding:4 },
  langFlag:{ fontSize:22, opacity:0.4 },
  langFlagOn:{ opacity:1, transform:[{ scale:1.15 }] },
  infoTxt:{
    fontFamily:'BarlowCondensed_700Bold',
    fontSize:11, color:C.gold, letterSpacing:2,
    marginBottom:20, textTransform:'uppercase',
  },
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
  fine:{
    fontFamily:'BarlowCondensed_400Regular',
    fontSize:9, color:C.muted, textAlign:'center',
    letterSpacing:0.5, lineHeight:15, marginBottom:10,
  },
  loginBtn:{ paddingVertical:8 },
  loginTxt:{
    fontFamily:'BarlowCondensed_600SemiBold',
    fontSize:13, color:C.gold, letterSpacing:0.5,
  },
});