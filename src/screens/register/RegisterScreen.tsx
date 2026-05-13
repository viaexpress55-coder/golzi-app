import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Pressable, Animated, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular, Barlow_500Medium } from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { registerWithEmail } from '../../services/auth';
import { useTranslation } from 'react-i18next';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#0F1420',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.2)', border2:'rgba(255,255,255,0.06)',
};

const COUNTRIES = [
  { flag:'🇨🇴', name:'Colombia',  code:'CO' },
  { flag:'🇲🇽', name:'Mexico',    code:'MX' },
  { flag:'🇧🇷', name:'Brasil',    code:'BR' },
  { flag:'🇦🇷', name:'Argentina', code:'AR' },
  { flag:'🇺🇸', name:'USA',       code:'US' },
  { flag:'🇻🇪', name:'Venezuela', code:'VE' },
  { flag:'🇵🇪', name:'Peru',      code:'PE' },
  { flag:'🇨🇱', name:'Chile',     code:'CL' },
  { flag:'🌍',  name:'Otro',      code:'OT' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [country,  setCountry]  = useState(0);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focusField, setFocusField] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular, Barlow_500Medium,
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

  async function handleContinue() {
    if (username.trim().length < 3) { setError('Mínimo 3 caracteres para el usuario'); shake(); return; }
    if (!email.includes('@')) { setError('Email inválido'); shake(); return; }
    if (password.length < 6) { setError('Mínimo 6 caracteres para la contraseña'); shake(); return; }
    try {
      setLoading(true); setError('');
      await registerWithEmail(email, password, username, COUNTRIES[country].code);
      navigation.navigate('Plans');
    } catch (e: any) {
      setError(e.message || 'Error al registrar'); shake();
    } finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />
      <View style={s.glowTop} />
      <View style={s.glowBottom} />
      <View style={s.topLine} />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← {t('back')}</Text>
        </TouchableOpacity>
        <Image
          source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
          style={s.topLogo} resizeMode="contain"
        />
        <View style={{ width:60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Título */}
        <View style={s.titleWrap}>
          <Text style={s.eyebrow}>GOLZI · MUNDIAL 2026</Text>
          <Text style={s.title}>{t('register_title')}</Text>
          <View style={s.titleLine} />
          <Text style={s.subtitle}>{t('register_subtitle')}</Text>
        </View>

        {/* Form card */}
        <Animated.View style={[s.formCard, { transform:[{ translateX: shakeAnim }] }]}>
          <LinearGradient
            colors={['rgba(255,215,0,0.06)','rgba(255,215,0,0.02)','transparent']}
            start={{x:0,y:0}} end={{x:1,y:1}}
            style={s.formCardGlow}
          />

          {/* Username */}
          <Text style={s.label}>{t('register_username')}</Text>
          <View style={[s.inputWrap, focusField==='user' && s.inputFocus]}>
            <Text style={s.inputIcon}>👤</Text>
            <Text style={s.prefix}>@</Text>
            <TextInput style={s.input} placeholder="tu_nombre" placeholderTextColor={C.muted}
              value={username} onChangeText={v => { setUsername(v); setError(''); }}
              onFocus={() => setFocusField('user')} onBlur={() => setFocusField('')}
              autoCapitalize="none" autoCorrect={false} maxLength={24} />
          </View>

          {/* Email */}
          <Text style={s.label}>{t('login_email')}</Text>
          <View style={[s.inputWrap, focusField==='email' && s.inputFocus]}>
            <Text style={s.inputIcon}>✉️</Text>
            <TextInput style={s.input} placeholder="tu@email.com" placeholderTextColor={C.muted}
              value={email} onChangeText={v => { setEmail(v); setError(''); }}
              onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')}
              autoCapitalize="none" keyboardType="email-address" />
          </View>

          {/* Password */}
          <Text style={s.label}>{t('login_password')}</Text>
          <View style={[s.inputWrap, focusField==='pass' && s.inputFocus]}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="min. 6 caracteres" placeholderTextColor={C.muted}
              value={password} onChangeText={v => { setPassword(v); setError(''); }}
              onFocus={() => setFocusField('pass')} onBlur={() => setFocusField('')}
              secureTextEntry />
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorTxt}>⚠️  {error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* País */}
        <Text style={s.label}>{t('register_country')}</Text>
        <View style={s.countryGrid}>
          {COUNTRIES.map((c, i) => (
            <Pressable key={i}
              style={[s.countryBtn, country === i && s.countryBtnOn]}
              onPress={() => setCountry(i)}
            >
              <LinearGradient
                colors={country === i ? ['rgba(255,215,0,0.15)','rgba(255,215,0,0.05)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
                style={s.countryBtnGrad}
              >
                <Text style={s.countryFlag}>{c.flag}</Text>
                <Text style={[s.countryName, country === i && s.countryNameOn]}>{c.name}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* Botón */}
        <TouchableOpacity style={s.btnWrap} onPress={handleContinue} activeOpacity={0.85} disabled={loading}>
          <LinearGradient
            colors={loading ? ['#555','#333'] : ['#FFD700','#FFA500','#E8A000']}
            start={{x:0,y:0}} end={{x:1,y:0}} style={s.btn}
          >
            <Text style={s.btnTxt}>{loading ? t('loading') : `⚡  ${t('register_btn')}`}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divisor */}
        <View style={s.divRow}>
          <View style={s.divLine} />
          <Text style={s.divTxt}>{t('register_or')}</Text>
          <View style={s.divLine} />
        </View>

        {/* Social */}
        <View style={s.socialRow}>
          <TouchableOpacity style={s.socialBtn}>
            <Text style={s.socialTxt}>G  Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.socialBtn}>
            <Text style={s.socialTxt}>🍎  Apple</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginBtn}>
          <Text style={s.loginTxt}>{t('login_have_account')}</Text>
        </TouchableOpacity>

        <Text style={s.fine}>{t('register_terms')}</Text>
      </ScrollView>

      <View style={s.bottomLine} />
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)', zIndex:10 },
  bottomLine:{ position:'absolute', bottom:0, left:0, right:0, height:1, backgroundColor:'rgba(255,215,0,0.15)' },
  glowTop:{ position:'absolute', width:350, height:350, borderRadius:175, top:-100, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.07)' },
  glowBottom:{ position:'absolute', width:250, height:250, borderRadius:125, bottom:-80, right:-80, backgroundColor:'rgba(0,198,255,0.04)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted },
  topLogo:{ width:36, height:36 },
  scroll:{ paddingHorizontal:16, paddingTop:20, paddingBottom:40 },
  titleWrap:{ marginBottom:20 },
  eyebrow:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'rgba(255,215,0,0.5)', letterSpacing:3, marginBottom:4 },
  title:{ fontFamily:'BebasNeue_400Regular', fontSize:44, color:C.gold, letterSpacing:2, lineHeight:48 },
  titleLine:{ width:48, height:3, backgroundColor:C.gold, borderRadius:2, marginVertical:8 },
  subtitle:{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:C.muted },
  formCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.12)', padding:16, marginBottom:16, overflow:'hidden' },
  formCardGlow:{ position:'absolute', top:0, left:0, right:0, bottom:0 },
  label:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, letterSpacing:2, color:C.muted, textTransform:'uppercase', marginBottom:6, marginTop:4 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingHorizontal:12, height:50, marginBottom:10 },
  inputFocus:{ borderColor:'rgba(255,215,0,0.5)', backgroundColor:'rgba(255,215,0,0.05)' },
  inputIcon:{ fontSize:15, marginRight:8 },
  prefix:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:18, color:C.muted, marginRight:4 },
  input:{ flex:1, fontFamily:'Barlow_400Regular', fontSize:15, color:C.text } as any,
  errorBox:{ backgroundColor:'rgba(232,0,61,0.1)', borderWidth:1, borderColor:'rgba(232,0,61,0.3)', borderRadius:10, padding:10 },
  errorTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.red, letterSpacing:0.3 },
  countryGrid:{ flexDirection:'row', flexWrap:'wrap', gap:7, marginBottom:20 },
  countryBtn:{ borderRadius:10, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  countryBtnOn:{ borderColor:'rgba(255,215,0,0.4)' },
  countryBtnGrad:{ flexDirection:'row', alignItems:'center', gap:6, paddingVertical:8, paddingHorizontal:10 },
  countryFlag:{ fontSize:16 },
  countryName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2 },
  countryNameOn:{ color:C.gold },
  btnWrap:{ width:'100%', marginBottom:16, borderRadius:14, overflow:'hidden', shadowColor:C.gold, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:16 },
  btn:{ borderRadius:14, paddingVertical:16, alignItems:'center' },
  btnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:19, letterSpacing:3, color:'#000' },
  divRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12 },
  divLine:{ flex:1, height:1, backgroundColor:'rgba(255,255,255,0.06)' },
  divTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, letterSpacing:1 },
  socialRow:{ flexDirection:'row', gap:10, marginBottom:12 },
  socialBtn:{ flex:1, borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingVertical:12, alignItems:'center', backgroundColor:'rgba(255,255,255,0.04)' },
  socialTxt:{ fontFamily:'Barlow_500Medium', fontSize:13, color:C.text },
  loginBtn:{ alignItems:'center', paddingVertical:10, marginBottom:8 },
  loginTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.gold, letterSpacing:0.5 },
  fine:{ fontFamily:'Barlow_400Regular', fontSize:10, color:C.muted, textAlign:'center', lineHeight:16 },
});
