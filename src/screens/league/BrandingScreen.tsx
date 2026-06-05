import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';

const C = {
  bg:'#020408', surface:'#0A0F1A', gold:'#FFD700', gold2:'#FFA500',
  green:'#00FF87', cyan:'#00C6FF', red:'#FF3355', muted:'#6B7A99', text:'#FFFFFF',
};

const PRESET_COLORS = [
  '#FFD700', '#00C6FF', '#00FF87', '#FF3355', '#A78BFA',
  '#F97316', '#EC4899', '#10B981', '#3B82F6', '#FFFFFF',
];

const BRANDING_PLANS = ['BUSINESS','GOLD','GOLZI PREMIUM'];

interface Props {
  ligaId: string;
  ligaPlan: string;
  ownerId: string;
  userId: string;
}

export default function BrandingScreen({ ligaId, ligaPlan, ownerId, userId }: Props) {
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#FFD700');
  const [brandLogo, setBrandLogo] = useState<string|null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isAdmin = ownerId === userId;
  const canBrand = BRANDING_PLANS.includes((ligaPlan||'').toUpperCase());

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'leagues', ligaId), snap => {
      const data = snap.data();
      if (data?.brandName) setBrandName(data.brandName);
      if (data?.brandColor) setBrandColor(data.brandColor);
      if (data?.brandLogo) setBrandLogo(data.brandLogo);
    });
    return unsub;
  }, [ligaId]);

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso requerido', 'Permite acceso a la galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      await uploadLogo(result.assets[0].uri);
    }
  };

  const uploadLogo = async (uri: string) => {
    setUploading(true);
    try {
      const storageRef = ref(storage, `branding/${ligaId}/logo.jpg`);
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
      const task = uploadBytesResumable(storageRef, blob);
      task.on('state_changed',
        s => setUploadProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
        e => { Alert.alert('Error', 'No se pudo subir el logo.'); setUploading(false); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setBrandLogo(url);
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch(e) {
      Alert.alert('Error', 'No se pudo subir el logo.');
      setUploading(false);
    }
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'leagues', ligaId), {
        brandName: brandName.trim() || null,
        brandColor: brandColor,
        brandLogo: brandLogo || null,
      });
      Alert.alert('✅ Branding guardado', 'Los cambios se aplicaron a tu liga.');
    } catch(e) {
      Alert.alert('Error', 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (!canBrand) return (
    <View style={s.locked}>
      <Text style={{fontSize:48}}>🔒</Text>
      <Text style={s.lockedTxt}>BUSINESS+ requerido</Text>
      <Text style={s.lockedSub}>Actualiza tu plan para personalizar el branding de tu liga</Text>
    </View>
  );

  if (!isAdmin) return (
    <View style={s.locked}>
      <Text style={{fontSize:48}}>🎨</Text>
      <Text style={s.lockedTxt}>BRANDING DE LIGA</Text>
      <Text style={s.lockedSub}>Solo el administrador puede editar el branding</Text>
      {brandLogo && <Image source={{uri:brandLogo}} style={{width:80,height:80,borderRadius:40,marginTop:20,borderWidth:2,borderColor:brandColor}}/>}
      {brandName && <Text style={{color:brandColor,fontSize:18,fontWeight:'800',marginTop:10}}>{brandName}</Text>}
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      
      <Text style={s.title}>🎨 BRANDING DE LIGA</Text>
      <Text style={s.sub}>Personaliza la identidad visual de tu liga empresarial</Text>

      {/* Preview */}
      <View style={[s.preview, {borderColor: brandColor}]}>
        <LinearGradient colors={[brandColor+'20', 'transparent']} style={StyleSheet.absoluteFill}/>
        <View style={[s.previewTopLine, {backgroundColor: brandColor}]}/>
        <View style={{flexDirection:'row', alignItems:'center', gap:12}}>
          {brandLogo ? (
            <Image source={{uri:brandLogo}} style={[s.previewLogo, {borderColor: brandColor}]}/>
          ) : (
            <View style={[s.previewLogoPlaceholder, {borderColor: brandColor}]}>
              <Text style={{fontSize:24}}>🏢</Text>
            </View>
          )}
          <View>
            <Text style={[s.previewName, {color: brandColor}]}>{brandName || 'Nombre del negocio'}</Text>
            <Text style={s.previewSub}>Liga GOLZI · Mundial 2026</Text>
          </View>
        </View>
      </View>

      {/* Logo */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>LOGO DEL NEGOCIO</Text>
        <TouchableOpacity onPress={pickLogo} disabled={uploading} style={[s.logoBtn, {borderColor: brandColor}]}>
          {uploading ? (
            <View style={{alignItems:'center', gap:8}}>
              <ActivityIndicator color={brandColor}/>
              <Text style={{color:brandColor, fontSize:12}}>{uploadProgress}%</Text>
            </View>
          ) : brandLogo ? (
            <View style={{alignItems:'center', gap:8}}>
              <Image source={{uri:brandLogo}} style={{width:80,height:80,borderRadius:40}}/>
              <Text style={{color:brandColor, fontSize:11, fontWeight:'700'}}>CAMBIAR LOGO</Text>
            </View>
          ) : (
            <View style={{alignItems:'center', gap:8}}>
              <Text style={{fontSize:40}}>📸</Text>
              <Text style={{color:C.muted, fontSize:12}}>Toca para subir tu logo</Text>
              <Text style={{color:C.muted, fontSize:10}}>Recomendado: 512x512px</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Nombre del negocio */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>NOMBRE DEL NEGOCIO</Text>
        <View style={[s.input, {borderColor: brandName ? brandColor+'60' : 'rgba(255,255,255,0.1)'}]}>
          <TextInput
            style={{flex:1, color:C.text, fontSize:15}}
            placeholder="Ej: Bar El Estadio"
            placeholderTextColor={C.muted}
            value={brandName}
            onChangeText={setBrandName}
            maxLength={30}
          />
        </View>
      </View>

      {/* Color de marca */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>COLOR DE MARCA</Text>
        <View style={s.colorsGrid}>
          {PRESET_COLORS.map(color => (
            <TouchableOpacity
              key={color}
              onPress={() => setBrandColor(color)}
              style={[s.colorBtn, {backgroundColor: color}, brandColor === color && s.colorBtnOn]}
            >
              {brandColor === color && <Text style={{fontSize:14}}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Guardar */}
      <TouchableOpacity onPress={saveBranding} disabled={saving} style={s.saveBtn}>
        <LinearGradient colors={[brandColor, brandColor+'AA']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.saveBtnInner}>
          <Text style={s.saveBtnTxt}>{saving ? 'GUARDANDO...' : '💾 GUARDAR BRANDING'}</Text>
        </LinearGradient>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#020408'},
  scroll:{padding:16,paddingBottom:40},
  locked:{flex:1,justifyContent:'center',alignItems:'center',padding:30,gap:10,backgroundColor:'#020408'},
  lockedTxt:{color:'#FFD700',fontSize:20,fontWeight:'800',letterSpacing:2},
  lockedSub:{color:'#6B7A99',fontSize:13,textAlign:'center'},
  title:{color:'#FFD700',fontSize:22,fontWeight:'800',letterSpacing:2,marginBottom:4},
  sub:{color:'#6B7A99',fontSize:12,marginBottom:20},
  preview:{borderRadius:16,borderWidth:1.5,padding:16,marginBottom:20,overflow:'hidden'},
  previewTopLine:{height:3,position:'absolute',top:0,left:0,right:0},
  previewLogo:{width:56,height:56,borderRadius:28,borderWidth:2},
  previewLogoPlaceholder:{width:56,height:56,borderRadius:28,borderWidth:2,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(255,255,255,0.05)'},
  previewName:{fontSize:18,fontWeight:'800',letterSpacing:1},
  previewSub:{color:'#6B7A99',fontSize:11,marginTop:2},
  section:{backgroundColor:'#0A0F1A',borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,0.06)',padding:14,marginBottom:14},
  sectionTitle:{color:'#6B7A99',fontSize:9,letterSpacing:3,fontWeight:'700',marginBottom:12},
  logoBtn:{borderRadius:14,borderWidth:2,borderStyle:'dashed',padding:24,alignItems:'center',justifyContent:'center',minHeight:120},
  input:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderRadius:12,paddingHorizontal:14,height:50},
  colorsGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  colorBtn:{width:40,height:40,borderRadius:20,justifyContent:'center',alignItems:'center'},
  colorBtnOn:{borderWidth:3,borderColor:'#fff'},
  saveBtn:{borderRadius:14,overflow:'hidden',marginTop:4},
  saveBtnInner:{paddingVertical:16,alignItems:'center'},
  saveBtnTxt:{color:'#000',fontSize:16,fontWeight:'800',letterSpacing:2},
});
