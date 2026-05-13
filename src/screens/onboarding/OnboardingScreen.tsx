import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, FlatList, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const C = {
  darker:'#020408', dark:'#05080F',
  gold:'#FFD700', gold2:'#E8A000', gold3:'#FFF8DC',
  text:'#F0F4FF', muted:'#6B7A99', cyan:'#00C6FF', green:'#00FF87',
};

const STEPS = [
  {
    emoji: '⚽',
    titleKey: 'onboard_1_title',
    descKey:  'onboard_1_desc',
    color:    C.gold,
    gradient: ['rgba(255,215,0,0.15)', 'rgba(255,215,0,0.02)'] as const,
  },
  {
    emoji: '🏆',
    titleKey: 'onboard_2_title',
    descKey:  'onboard_2_desc',
    color:    C.cyan,
    gradient: ['rgba(0,198,255,0.15)', 'rgba(0,198,255,0.02)'] as const,
  },
  {
    emoji: '🎯',
    titleKey: 'onboard_3_title',
    descKey:  'onboard_3_desc',
    color:    C.green,
    gradient: ['rgba(0,255,135,0.15)', 'rgba(0,255,135,0.02)'] as const,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function goTo(index: number) {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue:0, duration:150, useNativeDriver:true }),
        Animated.timing(scaleAnim, { toValue:0.92, duration:150, useNativeDriver:true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue:1, duration:300, useNativeDriver:true }),
        Animated.spring(scaleAnim, { toValue:1, friction:6, tension:80, useNativeDriver:true }),
      ]),
    ]).start();
    flatRef.current?.scrollToIndex({ index, animated: true });
    setCurrent(index);
  }

  function next() {
    if (current < STEPS.length - 1) goTo(current + 1);
    else navigation.navigate('Register');
  }

  function skip() { navigation.navigate('Register'); }

  const step = STEPS[current];

  return (
    <View style={s.root}>

      {/* Fondo degradado dinámico */}
      <LinearGradient
        colors={['#020408', '#05080F', '#020408']}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow superior */}
      <Animated.View style={[
        s.bgGlow,
        { backgroundColor: step.color + '20' }
      ]} />

      {/* Línea dorada superior */}
      <View style={s.topLine} />

      {/* SKIP */}
      <TouchableOpacity style={s.skipBtn} onPress={skip}>
        <Text style={s.skipTxt}>OMITIR</Text>
      </TouchableOpacity>

      {/* Logo pequeño */}
      <Image
        source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
        style={s.logoSmall}
        resizeMode="contain"
      />

      <FlatList
        ref={flatRef}
        data={STEPS}
        horizontal pagingEnabled scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={() => <View style={{ width }} />}
        style={{ position:'absolute', opacity:0 }}
      />

      {/* Contenido animado */}
      <Animated.View style={[s.content, { opacity: fadeAnim, transform:[{ scale: scaleAnim }] }]}>

        {/* Card de icono */}
        <LinearGradient
          colors={step.gradient}
          style={[s.iconCard, { borderColor: step.color + '40' }]}
        >
          <Text style={s.emoji}>{step.emoji}</Text>
          <View style={[s.iconGlow, { backgroundColor: step.color + '15' }]} />
        </LinearGradient>

        {/* Número de paso */}
        <Text style={[s.stepNum, { color: step.color + '60' }]}>
          0{current + 1} / 03
        </Text>

        <Text style={[s.title, { color: step.color }]}>
          {t(step.titleKey)}
        </Text>

        {/* Línea decorativa */}
        <View style={[s.titleLine, { backgroundColor: step.color }]} />

        <Text style={s.desc}>{t(step.descKey)}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={s.dots}>
        {STEPS.map((st, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View style={[
              s.dot,
              i === current && { backgroundColor: step.color, width: 24, borderRadius: 4 }
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón */}
      <TouchableOpacity style={s.btnWrap} onPress={next} activeOpacity={0.9}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#E8A000']}
          start={{ x:0, y:0 }} end={{ x:1, y:0 }}
          style={s.btn}
        >
          <Text style={s.btnTxt}>
            {current < STEPS.length - 1 ? `SIGUIENTE  →` : `¡EMPEZAR!  ⚡`}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginBtn}>
        <Text style={s.loginTxt}>Ya tengo cuenta →</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Main')} style={s.guestBtn}>
        <Text style={s.guestTxt}>Explorar sin cuenta →</Text>
      </TouchableOpacity>

      {/* Línea dorada inferior */}
      <View style={s.bottomLine} />

    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker, alignItems:'center', justifyContent:'space-between', paddingHorizontal:28, paddingTop:56, paddingBottom:32 },

  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.4)' },
  bottomLine:{ position:'absolute', bottom:0, left:0, right:0, height:1, backgroundColor:'rgba(255,215,0,0.15)' },

  bgGlow:{ position:'absolute', width:400, height:400, borderRadius:200, top:-80, alignSelf:'center' },

  skipBtn:{ position:'absolute', top:58, right:24, zIndex:10 },
  skipTxt:{ color:C.muted, fontSize:10, letterSpacing:3, textTransform:'uppercase' },

  logoSmall:{ width:36, height:36, marginBottom:8, opacity:0.7 },

  content:{ alignItems:'center', flex:1, justifyContent:'center', width:'100%' },

  iconCard:{
    width:140, height:140, borderRadius:28, alignItems:'center', justifyContent:'center',
    marginBottom:20, borderWidth:1, position:'relative', overflow:'hidden',
    shadowColor:C.gold, shadowOffset:{width:0,height:8}, shadowOpacity:0.3, shadowRadius:20,
  },
  iconGlow:{ position:'absolute', width:100, height:100, borderRadius:50 },
  emoji:{ fontSize:72, zIndex:2 },

  stepNum:{ fontSize:10, letterSpacing:4, marginBottom:10, fontWeight:'700' },

  title:{
    fontSize:28, fontWeight:'900', letterSpacing:2,
    textAlign:'center', marginBottom:10, textTransform:'uppercase',
  },
  titleLine:{ width:40, height:3, borderRadius:2, marginBottom:14 },
  desc:{ fontSize:15, color:C.muted, textAlign:'center', lineHeight:24, maxWidth:300 },

  dots:{ flexDirection:'row', gap:8, marginBottom:20 },
  dot:{ width:8, height:8, borderRadius:4, backgroundColor:'rgba(255,255,255,0.15)' },

  btnWrap:{ width:'100%', borderRadius:14, overflow:'hidden', marginBottom:10,
    shadowColor:C.gold, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:16,
  },
  btn:{ borderRadius:14, paddingVertical:17, alignItems:'center' },
  btnTxt:{ fontSize:18, fontWeight:'900', letterSpacing:3, color:'#000' },

  loginBtn:{ paddingVertical:6 },
  loginTxt:{ color:C.gold, fontSize:13, letterSpacing:0.5, opacity:0.8 },
  guestBtn:{ paddingVertical:6 },
  guestTxt:{ color:C.muted, fontSize:12, letterSpacing:0.5 },
});