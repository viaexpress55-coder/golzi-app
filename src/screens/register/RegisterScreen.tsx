import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular, Barlow_500Medium } from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { registerWithEmail } from '../../services/auth';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.14)', border2:'rgba(255,255,255,0.07)',
};

const COUNTRIES = [
  { flag:'🇨🇴', name:'Colombia', code:'CO' },
  { flag:'🇲🇽', name:'Mexico',   code:'MX' },
  { flag:'🇧🇷', name:'Brasil',   code:'BR' },
  { flag:'🇦🇷', name:'Argentina',code:'AR' },
  { flag:'🇺🇸', name:'USA',      code:'US' },
  { flag:'🇻🇪', name:'Venezuela',code:'VE' },
  { flag:'🇵🇪', name:'Peru',     code:'PE' },
  { flag:'🇨🇱', name:'Chile',    code:'CL' },
  { flag:'🌍',  name:'Otro',     code:'OT' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [country,  setCountry]  = useState(0);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular, Barlow_500Medium,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  async function handleContinue() {
    if (username.trim().length < 3) { setError('Minimo 3 caracteres'); return; }
    if (!email.includes('@')) { setError('Email invalido'); return; }
    if (password.length < 6) { setError('Minimo 6 caracteres'); return; }
    try {
      setLoading(true); setError('');
      await registerWithEmail(email, password, username, COUNTRIES[country].code);
      navigation.navigate('Plans');
    } catch (e: any) {
      setError(e.message || 'Error al registrar');
    } finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <View style={s.bgGlow} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerLogo}>GOLZI</Text>
        <View style={{ width:30 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Text style={s.title}>UNETE</Text>
        <Text style={s.subtitle}>Crea tu perfil Golzair</Text>

        {/* Username */}
        <Text style={s.label}>NOMBRE DE USUARIO</Text>
        <View style={s.inputWrap}>
          <Text style={s.prefix}>@</Text>
          <TextInput style={s.input} placeholder="tu_nombre" placeholderTextColor={C.muted}
            value={username} onChangeText={v => { setUsername(v); setError(''); }}
            autoCapitalize="none" autoCorrect={false} maxLength={24} />
        </View>

        {/* Email */}
        <Text style={[s.label, { marginTop:10 }]}>EMAIL</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="tu@email.com" placeholderTextColor={C.muted}
            value={email} onChangeText={v => { setEmail(v); setError(''); }}
            autoCapitalize="none" keyboardType="email-address" />
        </View>

        {/* Password */}
        <Text style={[s.label, { marginTop:10 }]}>CONTRASENA</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="min. 6 caracteres" placeholderTextColor={C.muted}
            value={password} onChangeText={v => { setPassword(v); setError(''); }}
            secureTextEntry />
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {/* Pais */}
        <Text style={[s.label, { marginTop:14 }]}>TU PAIS</Text>
        <View style={s.countryGrid}>
          {COUNTRIES.map((c, i) => (
            <Pressable key={i} style={[s.countryBtn, country === i && s.countryBtnOn]} onPress={() => setCountry(i)}>
              <Text style={s.countryFlag}>{c.flag}</Text>
              <Text style={[s.countryName, country === i && s.countryNameOn]}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Boton */}
        <TouchableOpacity style={s.btnWrap} onPress={handleContinue} activeOpacity={0.85} disabled={loading}>
          <LinearGradient colors={['#FFD700','#E8A000']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.btn}>
            <Text style={s.btnTxt}>{loading ? 'CREANDO CUENTA...' : 'CONTINUAR'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.divRow}>
          <View style={s.divLine} />
          <Text style={s.divTxt}>o entrar con</Text>
          <View style={s.divLine} />
        </View>

        {/* Social */}
        <View style={s.socialRow}>
          <TouchableOpacity style={s.socialBtn}><Text style={s.socialTxt}>G  Google</Text></TouchableOpacity>
          <TouchableOpacity style={s.socialBtn}><Text style={s.socialTxt}>  Apple</Text></TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginBtn}>
          <Text style={s.loginTxt}>Ya tengo cuenta? Iniciar sesion →</Text>
        </TouchableOpacity>

        <Text style={s.fine}>Al registrarte aceptas los Terminos de Uso.{'\n'}GOLZI es un juego de predicciones · Sin apuestas.</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  bgGlow:{ position:'absolute', width:300, height:300, borderRadius:150, top:-60, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.08)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:C.border2 },
  back:{ fontSize:20, color:C.muted, width:30 },
  headerLogo:{ fontFamily:'BebasNeue_400Regular', fontSize:22, color:C.gold, letterSpacing:3 },
  scroll:{ paddingHorizontal:16, paddingTop:24, paddingBottom:40 },
  title:{ fontFamily:'BebasNeue_400Regular', fontSize:44, color:C.gold, letterSpacing:2, lineHeight:48 },
  subtitle:{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:C.muted, marginBottom:20 },
  label:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, letterSpacing:2, color:C.muted, textTransform:'uppercase', marginBottom:6 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:C.surface2, borderWidth:1, borderColor:C.border2, borderRadius:10, paddingHorizontal:14, height:48, marginBottom:4 },
  prefix:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:18, color:C.muted, marginRight:6 },
  input:{ flex:1, fontFamily:'Barlow_400Regular', fontSize:15, color:C.text } as any,
  error:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.red, marginBottom:8, letterSpacing:0.3 },
  countryGrid:{ flexDirection:'row', flexWrap:'wrap', gap:7, marginBottom:20 },
  countryBtn:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:C.surface, borderWidth:1, borderColor:C.border2, borderRadius:8, paddingVertical:7, paddingHorizontal:10 },
  countryBtnOn:{ borderColor:C.border, backgroundColor:'rgba(255,215,0,0.06)' },
  countryFlag:{ fontSize:15 },
  countryName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2 },
  countryNameOn:{ color:C.gold },
  btnWrap:{ width:'100%', marginBottom:16, borderRadius:12, overflow:'hidden' },
  btn:{ borderRadius:12, paddingVertical:14, alignItems:'center' },
  btnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, letterSpacing:2, color:'#000' },
  divRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12 },
  divLine:{ flex:1, height:1, backgroundColor:C.border2 },
  divTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, letterSpacing:1 },
  socialRow:{ flexDirection:'row', gap:10, marginBottom:12 },
  socialBtn:{ flex:1, borderWidth:1, borderColor:C.border2, borderRadius:10, paddingVertical:11, alignItems:'center', backgroundColor:C.surface },
  socialTxt:{ fontFamily:'Barlow_500Medium', fontSize:13, color:C.text },
  loginBtn:{ alignItems:'center', paddingVertical:10, marginBottom:12 },
  loginTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.gold, letterSpacing:0.5 },
  fine:{ fontFamily:'Barlow_400Regular', fontSize:10, color:C.muted, textAlign:'center', lineHeight:16 },
});