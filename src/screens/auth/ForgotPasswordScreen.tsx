import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';

const C = {
  dark:'#020408', gold:'#FFD700', gold2:'#E8A000',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  green:'#00FF87', red:'#E8003D',
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (!email || !email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch {
      setError('No encontramos una cuenta con ese email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />
      <View style={s.topLine} />
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← Volver</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>RECUPERAR{'\n'}CONTRASEÑA</Text>
        <View style={s.titleLine} />
        {sent ? (
          <View style={s.successBox}>
            <Text style={s.successIcon}>✅</Text>
            <Text style={s.successTitle}>¡Correo enviado!</Text>
            <Text style={s.successTxt}>
              Revisa tu bandeja de entrada en {email} y sigue las instrucciones para restablecer tu contraseña.
            </Text>
            <TouchableOpacity style={s.btnWrap} onPress={() => navigation.navigate('Login')}>
              <LinearGradient colors={['#FFD700','#E8A000']} style={s.btn}>
                <Text style={s.btnTxt}>⚡ VOLVER AL LOGIN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={s.subtitle}>
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
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
            {error ? <Text style={s.errorTxt}>{error}</Text> : null}
            <TouchableOpacity style={s.btnWrap} onPress={handleReset} disabled={loading}>
              <LinearGradient colors={loading ? ['#555','#333'] : ['#FFD700','#E8A000']} style={s.btn}>
                <Text style={s.btnTxt}>{loading ? 'ENVIANDO...' : '⚡ ENVIAR ENLACE'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.dark },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)', zIndex:10 },
  topBar:{ paddingHorizontal:16, paddingTop:52, paddingBottom:14 },
  backBtn:{ width:60 },
  backTxt:{ fontSize:13, color:C.muted },
  scroll:{ paddingHorizontal:24, paddingTop:24, paddingBottom:40 },
  title:{ fontSize:42, color:C.gold, fontWeight:'900', letterSpacing:2, lineHeight:46 },
  titleLine:{ width:48, height:3, backgroundColor:C.gold, borderRadius:2, marginVertical:12 },
  subtitle:{ fontSize:14, color:C.muted2, marginBottom:24, lineHeight:20 },
  inputWrap:{ backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,215,0,0.2)', borderRadius:12, paddingHorizontal:16, height:52, justifyContent:'center', marginBottom:12 },
  input:{ fontSize:15, color:C.text } as any,
  errorTxt:{ color:C.red, fontSize:12, marginBottom:12 },
  btnWrap:{ borderRadius:12, overflow:'hidden', marginTop:8 },
  btn:{ paddingVertical:16, alignItems:'center', borderRadius:12 },
  btnTxt:{ fontSize:18, color:'#000', fontWeight:'900', letterSpacing:2 },
  successBox:{ alignItems:'center', paddingTop:40 },
  successIcon:{ fontSize:48, marginBottom:16 },
  successTitle:{ fontSize:24, color:C.green, fontWeight:'900', marginBottom:8 },
  successTxt:{ fontSize:14, color:C.muted2, textAlign:'center', lineHeight:20, marginBottom:32 },
});