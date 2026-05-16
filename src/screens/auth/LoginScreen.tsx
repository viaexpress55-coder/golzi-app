import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { loginWithEmail } from '../../services/auth';
import { useTranslation } from 'react-i18next';

const C = {
  dark:'#020408', dark2:'#05080F', surface:'#0D1117', surface2:'#0F1420',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#E8A000', gold3:'#FFF8DC',
  green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,255,255,0.06)', borderG:'rgba(255,215,0,0.25)',
};

export default function LoginScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,    setPassFocus]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:10, duration:60, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:-10, duration:60, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:6, duration:60, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:0, duration:60, useNativeDriver:true }),
    ]).start();
  }

  async function handleLogin() {
    if (!email || !email.includes('@')) { setError('Ingresa un email válido'); shake(); return; }
    if (!password || password.length < 6) { setError('Mínimo 6 caracteres'); shake(); return; }
    try {
      setLoading(true); setError('');
      await loginWithEmail(email, password);
      navigation.navigate('Main');
    } catch {
      setError('Email o contraseña incorrectos'); shake();
    } finally { setLoading(false); }
  }

  return (
    <View style={s.root}>

      {/* Fondos */}
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />
      <View style={s.glowTop} />
      <View style={s.glowBottom} />

      {/* Línea dorada superior */}
      <View style={s.topLine} />

      {/* TOP BAR */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← {t('back')}</Text>
        </TouchableOpacity>
        <Image
          source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
          style={s.topLogo}
          resizeMode="contain"
        />
        <View style={{ width:60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.eyebrow}>GOLZI · MUNDIAL 2026</Text>
          <Text style={s.title}>{t('login_welcome')}</Text>
          <View style={s.titleLine} />
          <Text style={s.subtitle}>{t('login_subtitle')}</Text>
        </View>

        {/* Form card */}
        <Animated.View style={[s.formCard, { transform:[{ translateX: shakeAnim }] }]}>
          <LinearGradient
            colors={['rgba(255,215,0,0.06)','rgba(255,215,0,0.02)','transparent']}
            start={{x:0,y:0}} end={{x:1,y:1}}
            style={s.formCardGlow}
          />

          {/* Email */}
          <Text style={s.label}>{t('login_email')}</Text>
          <View style={[s.inputWrap, emailFocus && s.inputWrapFocus]}>
            <Text style={s.inputIcon}>✉️</Text>
            <TextInput
              style={s.input}
              placeholder="tu@email.com"
              placeholderTextColor={C.muted}
              value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <Text style={s.label}>{t('login_password')}</Text>
          <View style={[s.inputWrap, passFocus && s.inputWrapFocus]}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={C.muted}
              value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={{ padding:4 }}>
              <Text style={{ fontSize:18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorTxt}>⚠️  {error}</Text>
            </View>
          ) : null}

        </Animated.View>

        {/* Botón login */}
        <TouchableOpacity style={s.btnWrap} onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
          <LinearGradient
            colors={loading ? ['#555','#333'] : ['#FFD700','#FFA500','#E8A000']}
            start={{ x:0, y:0 }} end={{ x:1, y:0 }}
            style={s.btnMain}
          >
            <Text style={s.btnMainTxt}>
              {loading ? `${t('login_loading')}` : `⚡  ${t('login_btn')}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divisor */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTxt}>O</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Links */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.linkBtn}>
          <LinearGradient
            colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.03)']}
            style={s.linkBtnInner}
          >
            <Text style={s.linkTxt}>{t('login_register')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={s.anonBtn}>
          <Text style={s.anonTxt}>{t('login_guest')}</Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={s.bottomLine} />
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.dark },

  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)', zIndex:10 },
  bottomLine:{ position:'absolute', bottom:0, left:0, right:0, height:1, backgroundColor:'rgba(255,215,0,0.15)' },

  glowTop:{ position:'absolute', width:350, height:350, borderRadius:175, top:-100, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.07)' },
  glowBottom:{ position:'absolute', width:250, height:250, borderRadius:125, bottom:-80, right:-80, backgroundColor:'rgba(0,198,255,0.04)' },

  topBar:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted, letterSpacing:0.5 },
  topLogo:{ width:36, height:36 },

  scroll:{ paddingHorizontal:20, paddingTop:24, paddingBottom:20, flexGrow:1 },

  header:{ marginBottom:24 },
  eyebrow:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'rgba(255,215,0,0.5)', letterSpacing:3, marginBottom:4 },
  title:{ fontFamily:'BebasNeue_400Regular', fontSize:48, color:C.gold, letterSpacing:2, lineHeight:52 },
  titleLine:{ width:48, height:3, backgroundColor:C.gold, borderRadius:2, marginVertical:8 },
  subtitle:{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:C.muted },

  formCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.12)', padding:20, marginBottom:16, overflow:'hidden' },
  formCardGlow:{ position:'absolute', top:0, left:0, right:0, bottom:0 },

  label:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, letterSpacing:2, color:C.muted, textTransform:'uppercase', marginBottom:8, marginTop:4 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingHorizontal:14, height:52, marginBottom:12 },
  inputWrapFocus:{ borderColor:'rgba(255,215,0,0.5)', backgroundColor:'rgba(255,215,0,0.05)' },
  inputIcon:{ fontSize:16, marginRight:10 },
  input:{ flex:1, fontFamily:'Barlow_400Regular', fontSize:15, color:C.text } as any,

  errorBox:{ backgroundColor:'rgba(232,0,61,0.1)', borderWidth:1, borderColor:'rgba(232,0,61,0.3)', borderRadius:10, padding:10, marginTop:4 },
  errorTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.red, letterSpacing:0.3 },

  btnWrap:{ width:'100%', marginBottom:16, borderRadius:14, overflow:'hidden', shadowColor:C.gold, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:16 },
  btnMain:{ borderRadius:14, paddingVertical:16, alignItems:'center' },
  btnMainTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:20, letterSpacing:3, color:'#000' },

  divider:{ flexDirection:'row', alignItems:'center', marginBottom:16, gap:12 },
  dividerLine:{ flex:1, height:1, backgroundColor:'rgba(255,255,255,0.06)' },
  dividerTxt:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, color:C.muted, letterSpacing:2 },

  linkBtn:{ marginBottom:10, borderRadius:12, overflow:'hidden' },
  linkBtnInner:{ borderRadius:12, paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  linkTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:14, color:C.gold, letterSpacing:0.5 },

  anonBtn:{ alignItems:'center', paddingVertical:10 },
  anonTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.cyan, letterSpacing:0.5 },
});
