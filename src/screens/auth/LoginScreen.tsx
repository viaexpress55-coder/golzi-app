import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular } from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { loginWithEmail } from '../../services/auth';

const C = {
  dark:'#05080F', surface:'#0D1117', surface2:'#161B26',
  text:'#F0F4FF', muted:'#6B7A99',
  gold:'#FFD700', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,255,255,0.07)', borderG:'rgba(255,215,0,0.2)',
};

export default function LoginScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular,
  });

  if (!fontsLoaded) return <View style={s.root} />;

  async function handleLogin() {
    if (!email || !email.includes('@')) {
      setError('Ingresa un email valido');
      return;
    }
    if (!password || password.length < 6) {
      setError('Ingresa tu contrasena');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await loginWithEmail(email, password);
      navigation.navigate('Main');
    } catch (e: any) {
      setError('Email o contrasena incorrectos');
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
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.title}>BIENVENIDO</Text>
          <Text style={s.subtitle}>Inicia sesion en tu cuenta</Text>
        </View>

        <Text style={s.label}>EMAIL</Text>
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
            placeholder="tu contrasena"
            placeholderTextColor={C.muted}
            value={password}
            onChangeText={v => { setPassword(v); setError(''); }}
            secureTextEntry
          />
        </View>

        {error ? <Text style={s.errorTxt}>{error}</Text> : null}

        <TouchableOpacity style={s.btnWrap} onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
          <LinearGradient colors={['#FFD700','#E8A000']} start={{ x:0, y:0 }} end={{ x:1, y:1 }} style={s.btnMain}>
            <Text style={s.btnMainTxt}>{loading ? 'ENTRANDO...' : 'INICIAR SESION'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.registerBtn}>
          <Text style={s.registerTxt}>No tienes cuenta? Registrate →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={s.anonBtn}>
          <Text style={s.anonTxt}>Continuar sin cuenta →</Text>
        </TouchableOpacity>
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
  input:{ flex:1, fontFamily:'Barlow_400Regular', fontSize:15, color:C.text } as any,
  errorTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.red, marginBottom:4, letterSpacing:0.3 },
  btnWrap:{ width:'100%', marginBottom:16 },
  btnMain:{ borderRadius:12, paddingVertical:14, alignItems:'center' },
  btnMainTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:18, letterSpacing:2, color:'#000' },
  registerBtn:{ alignItems:'center', paddingVertical:10, marginBottom:8 },
  registerTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.gold, letterSpacing:0.5 },
  anonBtn:{ alignItems:'center', paddingVertical:10 },
  anonTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.cyan, letterSpacing:0.5 },
});