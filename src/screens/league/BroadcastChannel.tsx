import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Image, StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  collection, addDoc, query, orderBy,
  onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db, storage } from '../../services/firebase';

interface Broadcast {
  id: string;
  message: string;
  mediaUrl?: string;
  mediaType?: string;
  authorId: string;
  authorName: string;
  pinned: boolean;
  createdAt: any;
}

interface Props {
  ligaId: string;
  userPlan: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
}

const BROADCAST_PLANS = ['PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
const C = { bg:'#020408', surface:'#0A0F1A', gold:'#FFD700', gold2:'#FFA500', muted:'#6B7A99', text:'#FFFFFF', green:'#00FF87', red:'#FF3355' };

export default function BroadcastChannel({ ligaId, userPlan, userId, userName, isAdmin }: Props) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [message, setMessage] = useState('');
  const [mediaUri, setMediaUri] = useState<string|null>(null);
  const [mediaType, setMediaType] = useState('text');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const canBroadcast = isAdmin && BROADCAST_PLANS.includes((userPlan||'').toUpperCase());

  useEffect(() => {
    const q = query(collection(db, 'leagues', ligaId, 'broadcasts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setBroadcasts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Broadcast)));
      setLoading(false);
    });
  }, [ligaId]);

  const pickMedia = async (type: 'image' | 'video') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso requerido', 'Permite acceso a la galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      videoMaxDuration: 30,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
    }
  };

  const uploadMedia = async (uri: string, type: string): Promise<string> => {
    const ext = type === 'video' ? 'mp4' : type === 'document' ? 'pdf' : 'jpg';
    const storageRef = ref(storage, `broadcasts/${ligaId}/${Date.now()}.${ext}`);
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, blob);
      task.on('state_changed',
        s => setUploadProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });
  };


  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType('document');
      }
    } catch(e) {
      Alert.alert('Error', 'No se pudo seleccionar el documento.');
    }
  };

  const handlePublish = async () => {
    if (!message.trim() && !mediaUri) return;
    setUploading(true);
    try {
      let mediaUrl: string | undefined;
      let finalType = 'text';
      if (mediaUri) { mediaUrl = await uploadMedia(mediaUri, mediaType); finalType = mediaType; }
      await addDoc(collection(db, 'leagues', ligaId, 'broadcasts'), {
        ligaId, message: message.trim(), mediaUrl: mediaUrl || null,
        mediaType: finalType, authorId: userId, authorName: userName,
        pinned: false, createdAt: serverTimestamp(),
      });
      setMessage(''); setMediaUri(null); setMediaType('text');
    } catch(e) {
      Alert.alert('Error', 'No se pudo publicar.');
    } finally {
      setUploading(false); setUploadProgress(0);
    }
  };

  const deleteBroadcast = async (id: string) => {
    await deleteDoc(doc(db, 'leagues', ligaId, 'broadcasts', id));
  };

  const togglePin = async (id: string, pinned: boolean) => {
    await updateDoc(doc(db, 'leagues', ligaId, 'broadcasts', id), { pinned: !pinned });
  };

  const renderItem = ({ item }: { item: Broadcast }) => (
    <View style={[s.card, item.pinned && s.cardPinned]}>
      {item.pinned && <View style={s.pinnedBadge}><Text style={s.pinnedTxt}>📌 FIJADO</Text></View>}
      <View style={s.cardHeader}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{(item.authorName||'A').slice(0,1).toUpperCase()}</Text></View>
        <View style={{flex:1}}>
          <Text style={s.authorName}>{item.authorName}</Text>
          <Text style={s.timestamp}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString('es-CO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</Text>
        </View>
        {isAdmin && canBroadcast && (
          <View style={{flexDirection:'row',gap:4}}>
            <TouchableOpacity onPress={() => togglePin(item.id, item.pinned)} style={{padding:6}}>
              <Text style={{fontSize:18}}>{item.pinned ? '📌' : '📍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteBroadcast(item.id)} style={{padding:6}}>
              <Text style={{fontSize:16}}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {item.message ? <Text style={s.msgTxt}>{item.message}</Text> : null}
      {item.mediaUrl && item.mediaType === 'document' && (
        <TouchableOpacity onPress={() => { if (typeof window !== 'undefined') window.open(item.mediaUrl, '_blank'); }} style={{backgroundColor:'rgba(255,215,0,0.1)',borderRadius:8,padding:12,marginTop:4,flexDirection:'row',alignItems:'center',gap:8}}>
          <Text style={{fontSize:20}}>📄</Text>
          <Text style={{color:C.gold,fontFamily:'BarlowCondensed_700Bold',fontSize:13}}>Ver documento</Text>
        </TouchableOpacity>
      )}
      {item.mediaUrl && item.mediaType === 'image' && (
        <Image source={{uri:item.mediaUrl}} style={s.mediaImg} resizeMode="contain"/>
      )}
    </View>
  );

  if (loading) return <View style={s.loading}><ActivityIndicator color={C.gold} size="large"/></View>;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':undefined}>
      <FlatList
        data={broadcasts}
        keyExtractor={i=>i.id}
        renderItem={renderItem}
        contentContainerStyle={{padding:12, paddingBottom:20}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{fontSize:48}}>📢</Text>
            <Text style={s.emptyTitle}>Sin anuncios aún</Text>
            <Text style={s.emptySub}>{canBroadcast ? 'Publica el primer anuncio para tu liga.' : 'El administrador publicará anuncios aquí.'}</Text>
          </View>
        }
      />
      {canBroadcast && (
        <View style={s.composer}>
          {mediaUri && (
            <View style={s.mediaPreview}>
              {mediaType === 'image' ? <Image source={{uri:mediaUri}} style={s.previewImg}/> : mediaType === 'video' ? <Text style={{color:C.gold}}>🎬 Video adjunto</Text> : <Text style={{color:C.gold}}>📄 Documento adjunto</Text>}
              <TouchableOpacity onPress={()=>{setMediaUri(null);setMediaType('text');}} style={s.removeBtn}>
                <Text style={{color:'#fff',fontWeight:'800'}}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={s.composerRow}>
            <TextInput
              style={s.input}
              placeholder="Escribe un anuncio…"
              placeholderTextColor={C.muted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <View style={{gap:6,alignItems:'center'}}>
              <TouchableOpacity onPress={()=>pickMedia('image')} style={s.mediaBtn}><Text style={{fontSize:20}}>🖼️</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>pickMedia('video')} style={s.mediaBtn}><Text style={{fontSize:20}}>🎬</Text></TouchableOpacity>
              <TouchableOpacity onPress={pickDocument} style={s.mediaBtn}><Text style={{fontSize:20}}>📄</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={handlePublish}
                disabled={uploading||(!message.trim()&&!mediaUri)}
                style={[s.publishBtn, (uploading||(!message.trim()&&!mediaUri))&&{backgroundColor:'#333'}]}
              >
                <Text style={s.publishTxt}>{uploading ? uploadProgress+'%' : 'Publicar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  loading:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.bg},
  card:{backgroundColor:C.surface,borderRadius:12,padding:14,marginBottom:12,borderWidth:1,borderColor:'rgba(255,255,255,0.06)'},
  cardPinned:{borderColor:C.gold,borderWidth:1.5},
  pinnedBadge:{backgroundColor:'rgba(255,215,0,0.1)',borderRadius:6,paddingHorizontal:8,paddingVertical:3,alignSelf:'flex-start',marginBottom:8},
  pinnedTxt:{color:C.gold,fontSize:10,fontWeight:'700',letterSpacing:1},
  cardHeader:{flexDirection:'row',alignItems:'center',marginBottom:10,gap:10},
  avatar:{width:36,height:36,borderRadius:18,backgroundColor:'rgba(255,215,0,0.2)',justifyContent:'center',alignItems:'center'},
  avatarTxt:{color:C.gold,fontWeight:'800',fontSize:16},
  authorName:{color:C.text,fontWeight:'700',fontSize:14},
  timestamp:{color:C.muted,fontSize:11,marginTop:1},
  msgTxt:{color:'#E8E8E8',fontSize:15,lineHeight:22,marginBottom:10},
  mediaImg:{width:'100%',height:220,borderRadius:8,marginTop:4},
  empty:{alignItems:'center',paddingTop:60,paddingHorizontal:30,gap:10},
  emptyTitle:{color:C.text,fontSize:18,fontWeight:'700'},
  emptySub:{color:C.muted,fontSize:14,textAlign:'center',lineHeight:20},
  composer:{borderTopWidth:1,borderTopColor:'rgba(255,255,255,0.08)',backgroundColor:'#05080F',padding:10},
  composerRow:{flexDirection:'row',alignItems:'flex-end',gap:8},
  input:{flex:1,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:10,paddingHorizontal:12,paddingVertical:10,color:C.text,fontSize:14,maxHeight:100,borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  mediaBtn:{padding:6},
  publishBtn:{backgroundColor:C.gold,borderRadius:8,paddingHorizontal:14,paddingVertical:8},
  publishTxt:{color:'#000',fontWeight:'800',fontSize:13},
  mediaPreview:{flexDirection:'row',alignItems:'center',marginBottom:8,backgroundColor:'rgba(255,255,255,0.04)',borderRadius:8,padding:8,gap:8},
  previewImg:{width:60,height:60,borderRadius:6},
  removeBtn:{marginLeft:'auto',backgroundColor:'rgba(255,255,255,0.1)',borderRadius:12,width:24,height:24,justifyContent:'center',alignItems:'center'},
});
