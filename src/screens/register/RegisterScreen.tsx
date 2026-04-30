import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold } from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { registerWithEmail } from '../../services/auth';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#E8A000', green:'#00FF87',
  cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

const COUNTRIES = [
  { flag:'🇨🇴', name:'Colombia' }, { flag:'🇲🇽', name:'México' },
  { flag:'🇧🇷', name:'Brasil' },   { flag:'🇦🇷', name:'Argentina' },
  { flag:'🇺🇸', name:'USA' },      { flag:'🇻🇪', name:'Venezuela' },
  { flag:'🇵🇪', name:'Perú' },     { flag:'🇨🇱', name:'Chile' },
  { flag:'🌍',  name:'Otro' },
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
    Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  async function handleContinue() {
    if (username.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Ingresa un email valido');
      return;
    }
    if (!password || password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await registerWithEmail(email, password, username, COUNTRIES[country].name);
      navigation.navigate('Plans');
    } catch (e: any) {
      setError(e.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <View style={s.glow1} />
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← Atras</Text>
        </TouchableOpacity>
        <Text style={s.topLogo}>GOLZI</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>UNETE</Text>
          <Text style={s.subtitle}>Crea tu perfil Golzair</Text>
        </View>

        <Text style={s.label}>NOMBRE DE USUARIO</Text>
        <View style={s.inputWrap}>
          <Text style={s.inputPrefix}>@</Text>
          <TextInput
            style={s.input}
            placeholder="tu_nombre"
            placeholderTextColor={C.muted}
            value={username}
            onChangeText={v => { setUsername(v); setError(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={24}
          />
        </View>

        <Text style={[s.label, { marginTop: 12 }]}>EMAIL</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="tu@email.com"
            placeholderTextColor={C.muted}
            value={email}
            onChangeText={v => { setEmail(v); setError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={[s.label, { marginTop: 12 }]}>CONTRASENA</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="min. 6 caracteres"
            placeholderTextColor={C.muted}
            value={password}
            onChangeText={v => { setPassword(v); setError(''); }}
            secureTextEntry
          />
        </View>

        {error ? <Text style={s.errorTxt}>{error}</Text> : null}

        <Text style={[s.label, { marginTop: 18 }]}>TU PAIS</Text>
        <View style={s.countryGrid}>
          {COUNTRIES.map((c, i) => (
            <Pressable key={i} style={[s.countryBtn, country === i && s.countryBtnOn]} onPress={() => setCountry(i)}>
              <Text style={s.countryFlag}>{c.flag}</Text>
              <Text style={[s.countryName, country === i && s.countryNameOn]}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity style={s.btnWrap} onPress={handleContinue} activeOpacity={0.85} disabled={loading}>
          <LinearGradient colors={['#FFD700','#E8A000']} start={{ x:0, y:0 }} end={{ x:1, y:1 }} style={s.btnMain}>
            <Text style={s.btnMainTxt}>{loading ? 'CREANDO CUENTA...' : 'CONTINUAR'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTxt}>o entrar con</Text>
          <View style={s.dividerLine} />
        </View>
        <View style={s.socialRow}>
          <TouchableOpacity style={s.socialBtn}><Text style={s.socialTxt}>G  Google</Text></TouchableOpacity>
          <TouchableOpacity style={s.socialBtn}><Text style={s.socialTxt}>  Apple</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Plans')} style={s.anonBtn}>
          <Text style={s.anonTxt}>Continuar sin cuenta →</Text>
        </TouchableOpacity>
        <Text style={s.fine}>
          Al registrarte aceptas los Terminos de Uso.{'\n'}
          GOLZI es un juego de predicciones. Sin apuestas.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.dark },
  glow1:{ position:'absolute', width:300, height:300, borderRadius:150, top:-80, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.06)' },
  topBar:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:C.border },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:14, color:C.muted, letterSpacing:0.5 },
  topLogo:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold, letterSpacing:3 },
  scroll:{ paddingHorizontal:20, paddingTop:28, paddingBottom:40 },
  header:{ marginBottom:24 },
  title:{ fontFamily:'BebasNeue_400Regular', fontSize:44, color:C.gold, letterSpacing:2, lineHeight:48 },
  subtitle:{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:C.muted, marginTop:2 },
  label:{ fontFamily:'BarlowCondensed_700Bold', fontSize:10, letterSpacing:2, color:C.muted, textTransform:'uppercase', marginBottom:8 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:C.surface2, borderWidth:1, borderColor:C.border, borderRadius:10, paddingHorizontal:14, height:50, marginBottom:4 },
  inputPrefix:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:18, color:C.muted, marginRight:6 },
  input:{ flex:1, fontFamily:'Barlow_400Regular', fontSize:15, color:C.text } as any,
  errorTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.red, marginBottom:4, letterSpacing:0.3 },
  countryGrid:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:24 },
  countryBtn:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:C.surface, borderWidth:1, borderColor:C.border, borderRadius:8, paddingVertical:8, paddingHorizontal:12 },
  countryBtnOn:{ borderColor:C.borderG, backgroundColor:'rgba(255,215,0,0.06)' },
  countryFlag:{ fontSize:16 },
  countryName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.muted2, letterSpacing:0.3 },
  countryNameOn:{ color:C.gold },
  btnWrap:{ width:'100%', marginBottom:20 },
  btnMain:{ borderRadius:12, paddingVertical:14, alignItems:'center' },
  btnMainTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, letterSpacing:2, color:'#000' },
  dividerRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:14 },
  dividerLine:{ flex:1, height:1, backgroundColor:C.border },
  dividerTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, letterSpacing:1 },
  socialRow:{ flexDirection:'row', gap:10, marginBottom:14 },
  socialBtn:{ flex:1, borderWidth:1, borderColor:C.border, borderRadius:10, paddingVertical:12, alignItems:'center', backgroundColor:C.surface },
  socialTxt:{ fontFamily:'Barlow_500Medium', fontSize:13, color:C.text },
  anonBtn:{ alignItems:'center', paddingVertical:10, marginBottom:16 },
  anonTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.cyan, letterSpacing:0.5 },
  fine:{ fontFamily:'Barlow_400Regular', fontSize:10, color:C.muted, textAlign:'center', lineHeight:16, letterSpacing:0.2 },
});