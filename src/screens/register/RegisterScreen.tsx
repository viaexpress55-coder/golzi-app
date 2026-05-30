import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Pressable, Animated, Image, Modal, FlatList,
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

const ALL_COUNTRIES = [
  { flag:'🇦🇫', name:'Afghanistan', code:'AF' },
  { flag:'🇩🇿', name:'Algeria', code:'DZ' },
  { flag:'🇩🇪', name:'Alemania', code:'DE' },
  { flag:'🇸🇦', name:'Arabia Saudita', code:'SA' },
  { flag:'🇦🇺', name:'Australia', code:'AU' },
  { flag:'🇦🇹', name:'Austria', code:'AT' },
  { flag:'🇧🇪', name:'Bélgica', code:'BE' },
  { flag:'🇧🇴', name:'Bolivia', code:'BO' },
  { flag:'🇨🇦', name:'Canadá', code:'CA' },
  { flag:'🇨🇳', name:'China', code:'CN' },
  { flag:'🇰🇷', name:'Corea del Sur', code:'KR' },
  { flag:'🇨🇷', name:'Costa Rica', code:'CR' },
  { flag:'🇨🇺', name:'Cuba', code:'CU' },
  { flag:'🇩🇰', name:'Dinamarca', code:'DK' },
  { flag:'🇪🇨', name:'Ecuador', code:'EC' },
  { flag:'🇪🇬', name:'Egipto', code:'EG' },
  { flag:'🇸🇻', name:'El Salvador', code:'SV' },
  { flag:'🇦🇪', name:'Emiratos Árabes', code:'AE' },
  { flag:'🇪🇸', name:'España', code:'ES' },
  { flag:'🇫🇷', name:'Francia', code:'FR' },
  { flag:'🇬🇭', name:'Ghana', code:'GH' },
  { flag:'🇬🇷', name:'Grecia', code:'GR' },
  { flag:'🇬🇹', name:'Guatemala', code:'GT' },
  { flag:'🇭🇳', name:'Honduras', code:'HN' },
  { flag:'🇭🇺', name:'Hungría', code:'HU' },
  { flag:'🇮🇳', name:'India', code:'IN' },
  { flag:'🇮🇩', name:'Indonesia', code:'ID' },
  { flag:'🇮🇶', name:'Iraq', code:'IQ' },
  { flag:'🇮🇪', name:'Irlanda', code:'IE' },
  { flag:'🇮🇱', name:'Israel', code:'IL' },
  { flag:'🇮🇹', name:'Italia', code:'IT' },
  { flag:'🇯🇵', name:'Japón', code:'JP' },
  { flag:'🇲🇦', name:'Marruecos', code:'MA' },
  { flag:'🇳🇱', name:'Países Bajos', code:'NL' },
  { flag:'🇵🇦', name:'Panamá', code:'PA' },
  { flag:'🇵🇾', name:'Paraguay', code:'PY' },
  { flag:'🇵🇱', name:'Polonia', code:'PL' },
  { flag:'🇵🇹', name:'Portugal', code:'PT' },
  { flag:'🇵🇷', name:'Puerto Rico', code:'PR' },
  { flag:'🇬🇧', name:'Reino Unido', code:'GB' },
  { flag:'🇩🇴', name:'Rep. Dominicana', code:'DO' },
  { flag:'🇷🇺', name:'Rusia', code:'RU' },
  { flag:'🇸🇳', name:'Senegal', code:'SN' },
  { flag:'🇨🇭', name:'Suiza', code:'CH' },
  { flag:'🇹🇷', name:'Turquía', code:'TR' },
  { flag:'🇺🇾', name:'Uruguay', code:'UY' },
  { flag:'🇿🇦', name:'Sudáfrica', code:'ZA' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [country,  setCountry]  = useState(-1); // -1 = ninguno seleccionado
  const [selectedCountry, setSelectedCountry] = useState<{flag:string,name:string,code:string} | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
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
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); shake(); return; }
    if (country === -1) { setError('Debes seleccionar tu país de origen'); shake(); return; }

    try {
      setLoading(true); setError('');
      const countryCode = country === 8 && selectedCountry ? selectedCountry.code : COUNTRIES[country]?.code || 'OT';
      const { getAuth, EmailAuthProvider, linkWithCredential } = require('firebase/auth');
      const currentUser = getAuth().currentUser;
      if (currentUser && currentUser.isAnonymous) {
        try {
          const credential = EmailAuthProvider.credential(email, password);
          await linkWithCredential(currentUser, credential);
          const { updateProfile } = require('firebase/auth');
          const { doc, updateDoc, serverTimestamp } = require('firebase/firestore');
          const { db } = require('../../services/firebase');
          await updateProfile(currentUser, { displayName: username });
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
          await updateDoc(doc(db, 'users', currentUser.uid), {
            username, country: countryCode,
            language: 'es', timezone,
            plan: 'free', isAnonymous: false,
            updatedAt: serverTimestamp(),
          });
        } catch (linkError: any) {
          if (linkError.code !== 'auth/email-already-in-use') throw linkError;
          await registerWithEmail(email, password, username, countryCode);
        }
      } else {
        await registerWithEmail(email, password, username, countryCode);
      }
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

      {/* Modal países */}
      <Modal visible={showCountryModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>ELIGE TU PAÍS</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={ALL_COUNTRIES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.modalItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountry(8);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={s.modalFlag}>{item.flag}</Text>
                  <Text style={s.modalCountryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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

        <View style={s.titleWrap}>
          <Text style={s.eyebrow}>GOLZI · MUNDIAL 2026</Text>
          <Text style={s.title}>{t('register_title')}</Text>
          <View style={s.titleLine} />
          <Text style={s.subtitle}>{t('register_subtitle')}</Text>
        </View>

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
              secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirmar Password */}
          <Text style={s.label}>CONFIRMAR CONTRASEÑA</Text>
          <View style={[s.inputWrap, focusField==='confirm' && s.inputFocus]}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="repite tu contraseña" placeholderTextColor={C.muted}
              value={confirmPassword} onChangeText={v => { setConfirmPassword(v); setError(''); }}
              onFocus={() => setFocusField('confirm')} onBlur={() => setFocusField('')}
              secureTextEntry={!showConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorTxt}>⚠️  {error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* País */}
        <Text style={s.label}>{t('register_country')}</Text>
        <View style={s.countryNote}>
          <Text style={s.countryNoteTxt}>
            🌍 Elige tu país de origen. No tiene que participar en el Mundial — define tu ranking global y el emoji de tu bandera en el perfil. Es obligatorio para completar el registro.
          </Text>
        </View>

        <View style={s.countryGrid}>
          {COUNTRIES.map((c, i) => (
            <Pressable key={i}
              style={[s.countryBtn, country === i && s.countryBtnOn]}
              onPress={() => {
                if (c.code === 'OT') {
                  setShowCountryModal(true);
                } else {
                  setCountry(i);
                }
              }}
            >
              <LinearGradient
                colors={country === i ? ['rgba(255,215,0,0.15)','rgba(255,215,0,0.05)'] : ['rgba(255,255,255,0.03)','rgba(255,255,255,0.01)']}
                style={s.countryBtnGrad}
              >
                <Text style={s.countryFlag}>
                  {i === 8 && country === 8 && selectedCountry ? selectedCountry.flag : c.flag}
                </Text>
                <Text style={[s.countryName, country === i && s.countryNameOn]}>
                  {i === 8 && country === 8 && selectedCountry ? selectedCountry.name : c.name}
                </Text>
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

        {/* Social login — próximamente */}

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
  eyeBtn:{ padding:4 },
  eyeIcon:{ fontSize:16 },
  errorBox:{ backgroundColor:'rgba(232,0,61,0.1)', borderWidth:1, borderColor:'rgba(232,0,61,0.3)', borderRadius:10, padding:10 },
  errorTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.red, letterSpacing:0.3 },
  countryNote:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.15)', borderRadius:10, padding:10, marginBottom:12 },
  countryNoteTxt:{ fontFamily:'Barlow_400Regular', fontSize:11, color:C.muted2, lineHeight:16 },
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
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.8)', justifyContent:'flex-end' },
  modalContent:{ backgroundColor:'#0D1117', borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:'80%', paddingBottom:32 },
  modalHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.06)' },
  modalTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold, letterSpacing:2 },
  modalClose:{ fontSize:18, color:C.muted, padding:4 },
  modalItem:{ flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.04)' },
  modalFlag:{ fontSize:24, marginRight:14 },
  modalCountryName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:16, color:C.text },
});