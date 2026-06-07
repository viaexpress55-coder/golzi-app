import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, updateDoc, getDocs, where,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

const C = {
  bg:'#020408', surface:'#0A0F1A', gold:'#FFD700', gold2:'#FFA500',
  green:'#00FF87', cyan:'#00C6FF', red:'#FF3355', muted:'#6B7A99', text:'#FFFFFF',
};

const TOURNAMENT_PLANS = ['BUSINESS','GOLD','GOLZI PREMIUM'];
const PUBLIC_TOURNAMENT_PLANS = ['GOLD','GOLZI PREMIUM'];

interface Tournament {
  id: string;
  name: string;
  description?: string;
  prize?: string;
  startDate: string;
  endDate: string;
  matchIds: string[];
  participants: string[];
  status: 'upcoming' | 'active' | 'finished';
  isPublic: boolean;
  ownerId: string;
  createdAt: any;
}

interface Props {
  ligaId: string;
  ligaPlan: string;
  ownerId: string;
  userId: string;
  userName: string;
  members: any[];
}

export default function TournamentScreen({ ligaId, ligaPlan, ownerId, userId, userName, members }: Props) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Form states
  const [tName, setTName] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tPrize1, setTPrize1] = useState('');
  const [tPrize2, setTPrize2] = useState('');
  const [tPrize3, setTPrize3] = useState('');
  const [tCiudad, setTCiudad] = useState('');
  const [tPais, setTPais] = useState('');
  const [tWeb, setTWeb] = useState('');
  const [tMaxPart, setTMaxPart] = useState('');
  const [tStart, setTStart] = useState('');
  const [tEnd, setTEnd] = useState('');
  const [tPublic, setTPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const isAdmin = ownerId === userId;
  const canCreate = TOURNAMENT_PLANS.includes((ligaPlan||'').toUpperCase()) && isAdmin;
  const canPublic = PUBLIC_TOURNAMENT_PLANS.includes((ligaPlan||'').toUpperCase());

  useEffect(() => {
    const q = query(collection(db, 'leagues', ligaId, 'tournaments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setTournaments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Tournament)));
      setLoading(false);
    });
  }, [ligaId]);

  async function handleCreate() {
    if (!tName.trim()) { Alert.alert('Error', 'Ingresa el nombre del torneo'); return; }
    if (!tStart || !tEnd) { Alert.alert('Error', 'Ingresa las fechas del torneo'); return; }
    setCreating(true);
    try {
      // Obtener partidos en el rango de fechas
      const matchesSnap = await getDocs(collection(db, 'matches'));
      const matchIds = matchesSnap.docs.filter(d => {
        if (!tStart || !tEnd) return true;
        const date = (d.data().kickoff || '').substring(0, 10);
        return date >= tStart && date <= tEnd;
      }).map(d => d.id);

      const torneoRef = await addDoc(collection(db, 'leagues', ligaId, 'tournaments'), {
        name: tName.trim(),
        description: tDesc.trim() || null,
        prize1: tPrize1.trim() || null,
        prize2: tPrize2.trim() || null,
        prize3: tPrize3.trim() || null,
        startDate: tStart,
        endDate: tEnd,
        ciudad: tCiudad.trim() || null,
        pais: tPais.trim() || null,
        website: tWeb.trim() || null,
        maxParticipants: parseInt(tMaxPart) || 100,
        matchIds,
        participants: [userId],
        status: new Date(tStart) > new Date() ? 'upcoming' : 'active',
        isPublic: tPublic && canPublic,
        ownerId: userId,
        ligaId,
        createdAt: serverTimestamp(),
      });
      // Publicar en torneos públicos si aplica
      if (tPublic && canPublic) {
        await setDoc(doc(db, 'public_tournaments', torneoRef.id), {
          torneoId: torneoRef.id, ligaId,
          name: tName.trim(),
          description: tDesc.trim() || null,
          prize1: tPrize1.trim() || null,
          prize2: tPrize2.trim() || null,
          prize3: tPrize3.trim() || null,
          startDate: tStart, endDate: tEnd,
          ciudad: tCiudad.trim() || null,
          pais: tPais.trim() || null,
          website: tWeb.trim() || null,
          matchIds, participants: [userId],
          maxParticipants: parseInt(tMaxPart) || 100,
          status: new Date(tStart) > new Date() ? 'upcoming' : 'active',
          isPublic: true, ownerId: userId,
          createdAt: serverTimestamp(),
        });
      }
      setTName(''); setTDesc('');
      setTPrize1(''); setTPrize2(''); setTPrize3('');
      setTStart(''); setTEnd('');
      setTCiudad(''); setTPais(''); setTWeb('');
      setTMaxPart(''); setTPublic(false);
    } catch(e) {
      Alert.alert('Error', 'No se pudo crear el torneo');
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  async function joinTournament(t: Tournament) {
    if (t.participants.includes(userId)) {
      Alert.alert('Ya inscrito', 'Ya estás participando en este torneo');
      return;
    }
    await updateDoc(doc(db, 'leagues', ligaId, 'tournaments', t.id), {
      participants: [...t.participants, userId],
    });
    Alert.alert('✅ Inscrito', `Te uniste al torneo ${t.name}`);
  }

  async function loadRanking(t: Tournament) {
    setSelectedTournament(t);
    setRankingLoading(true);
    try {
      // Obtener predicciones de los partidos del torneo
      const chunks: string[][] = [];
      for (let i = 0; i < t.matchIds.length; i += 10) chunks.push(t.matchIds.slice(i, i + 10));

      const matchesSnap = await getDocs(query(collection(db, 'matches'), where('status', '==', 'FINISHED')));
      const finishedMatches: Record<string, any> = {};
      matchesSnap.docs.forEach(d => {
        if (t.matchIds.includes(d.id)) finishedMatches[d.id] = d.data();
      });

      const allPreds: any[] = [];
      for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        const pSnap = await getDocs(query(collection(db, 'predictions'), where('matchId', 'in', chunk)));
        pSnap.docs.forEach(d => allPreds.push({ id: d.id, ...d.data() }));
      }

      // Calcular puntos por participante
      const ptsMap: Record<string, number> = {};
      t.participants.forEach(uid => ptsMap[uid] = 0);

      allPreds.forEach(pred => {
        if (!t.participants.includes(pred.userId)) return;
        const match = finishedMatches[pred.matchId];
        if (!match) return;
        const h = pred.homeScore; const a = pred.awayScore;
        const rh = match.homeScore; const ra = match.awayScore;
        if (h === rh && a === ra) ptsMap[pred.userId] = (ptsMap[pred.userId] || 0) + 10;
        else if ((h > a && rh > ra) || (h < a && rh < ra) || (h === a && rh === ra))
          ptsMap[pred.userId] = (ptsMap[pred.userId] || 0) + 5;
      });

      const rankData = t.participants.map(uid => {
        const member = members.find(m => m.id === uid);
        return {
          uid,
          username: member?.username || member?.displayName || uid.slice(0, 8),
          country: member?.country || '',
          pts: ptsMap[uid] || 0,
        };
      }).sort((a, b) => b.pts - a.pts);

      setRanking(rankData);
    } catch(e) {
      console.error(e);
    } finally {
      setRankingLoading(false);
    }
  }

  const getMaxParticipants = () => {
    const p = (ligaPlan||'').toUpperCase();
    if (p === 'GOLD') return 5000;
    if (p === 'GOLZI PREMIUM') return 999999;
    return 1000;
  };
  const statusColor = (s: string) => s === 'active' ? C.green : s === 'upcoming' ? C.cyan : C.muted;
  const statusLabel = (s: string) => s === 'active' ? '🟢 ACTIVO' : s === 'upcoming' ? '⏳ PRÓXIMO' : '🏁 FINALIZADO';
  const medals = ['🥇','🥈','🥉'];

  if (loading) return <View style={s.loading}><ActivityIndicator color={C.gold} size="large"/></View>;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>🏆 TORNEOS</Text>
        <Text style={s.headerSub}>Mundial 2026</Text>
        {isAdmin && (
          <View style={{backgroundColor:'rgba(255,215,0,0.06)',borderRadius:8,paddingHorizontal:10,paddingVertical:6,borderWidth:1,borderColor:'rgba(255,215,0,0.15)',marginTop:4}}>
            <Text style={{color:'rgba(255,215,0,0.6)',fontSize:9,fontWeight:'700',letterSpacing:1}}>✉️ SOPORTE: golziapp@gmail.com</Text>
          </View>
        )}
        
        </View>

        {/* Botón crear torneo — solo admin BUSINESS+ */}
        {canCreate && (
          <TouchableOpacity onPress={() => setShowCreate(true)} style={s.createBtn}>
            <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.createBtnInner}>
              <Text style={s.createBtnTxt}>⚡ CREAR NUEVO TORNEO</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Lista de torneos */}
        {tournaments.length === 0 ? (
          <View style={s.empty}>
            <Text style={{fontSize:48}}>🏆</Text>
            <Text style={s.emptyTitle}>SIN TORNEOS AÚN</Text>
            <Text style={s.emptySub}>{canCreate ? 'Crea el primer torneo para tu liga.' : 'El administrador creará torneos aquí.'}</Text>
          </View>
        ) : tournaments.map(t => (
          <View key={t.id} style={s.card}>
            <View style={[s.cardTopLine, {backgroundColor: statusColor(t.status)}]}/>
            <View style={s.cardHeader}>
              <View style={{flex:1}}>
                <Text style={s.cardName}>{t.name}</Text>
                {t.description && <Text style={s.cardDesc}>{t.description}</Text>}
                <Text style={[s.cardStatus, {color: statusColor(t.status)}]}>{statusLabel(t.status)}</Text>
              </View>
              {t.isPublic && (
                <View style={s.publicBadge}>
                  <Text style={s.publicBadgeTxt}>🌍 PÚBLICO</Text>
                </View>
              )}
            </View>

            <View style={s.cardInfo}>
              <View style={s.cardInfoItem}>
                <Text style={s.cardInfoLabel}>INICIO</Text>
                <Text style={s.cardInfoValue}>{t.startDate}</Text>
              </View>
              <View style={s.cardInfoItem}>
                <Text style={s.cardInfoLabel}>FIN</Text>
                <Text style={s.cardInfoValue}>{t.endDate}</Text>
              </View>
              <View style={s.cardInfoItem}>
                <Text style={s.cardInfoLabel}>PARTIDOS</Text>
                <Text style={s.cardInfoValue}>{t.matchIds?.length || 0}</Text>
              </View>
              <View style={s.cardInfoItem}>
                <Text style={s.cardInfoLabel}>INSCRITOS</Text>
                <Text style={s.cardInfoValue}>{t.participants?.length || 0}</Text>
              </View>
            </View>

            {t.prize && (
              <View style={s.prizeBox}>
                <Text style={s.prizeTxt}>🎁 PREMIO: {t.prize}</Text>
              </View>
            )}

            {/* Botón eliminar — solo admin, solo si 1 inscrito */}
            {isAdmin && (t.participants?.length || 0) <= 1 && (
              <TouchableOpacity
                onPress={() => Alert.alert(
                  '¿Eliminar torneo?',
                  'Solo puedes eliminar el torneo si no hay otros inscritos.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: async () => {
                      await deleteDoc(doc(db, 'leagues', ligaId, 'tournaments', t.id));
                    }},
                  ]
                )}
                style={{alignSelf:'flex-end', marginRight:14, marginBottom:4, flexDirection:'row', alignItems:'center', gap:4}}
              >
                <Text style={{color:'rgba(255,51,85,0.6)', fontSize:11, fontFamily:'BarlowCondensed_700Bold', letterSpacing:1}}>🗑️ ELIMINAR</Text>
              </TouchableOpacity>
            )}
            <View style={s.cardActions}>
              {!t.participants?.includes(userId) ? (
                <TouchableOpacity onPress={() => joinTournament(t)} style={s.joinBtn}>
                  <Text style={s.joinBtnTxt}>⚡ INSCRIBIRME</Text>
                </TouchableOpacity>
              ) : (
                <View style={s.joinedBadge}>
                  <Text style={s.joinedTxt}>✅ INSCRITO</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => loadRanking(t)} style={s.rankingBtn}>
                <Text style={s.rankingBtnTxt}>📊 VER RANKING</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal crear torneo */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <ScrollView contentContainerStyle={{padding:20, gap:14}}>
              <Text style={s.modalTitle}>⚡ NUEVO TORNEO</Text>

              <Text style={s.inputLabel}>NOMBRE DEL TORNEO</Text>
              <TextInput style={s.input} placeholder="Ej: Torneo Cuartos de Final" placeholderTextColor={C.muted} value={tName} onChangeText={setTName} maxLength={40}/>

              <Text style={s.inputLabel}>DESCRIPCIÓN (opcional)</Text>
              <TextInput style={[s.input,{height:70}]} placeholder="Describe el torneo..." placeholderTextColor={C.muted} value={tDesc} onChangeText={setTDesc} multiline maxLength={150}/>

              <Text style={s.inputLabel}>🥇 PREMIO 1ER LUGAR</Text>
              <TextInput style={s.input} placeholder="Ej: Cena para 2 + botella de vino" placeholderTextColor={C.muted} value={tPrize1} onChangeText={setTPrize1} maxLength={80}/>

              <Text style={s.inputLabel}>🥈 PREMIO 2DO LUGAR (opcional)</Text>
              <TextInput style={s.input} placeholder="Ej: Cupón 30% descuento" placeholderTextColor={C.muted} value={tPrize2} onChangeText={setTPrize2} maxLength={80}/>

              <Text style={s.inputLabel}>🥉 PREMIO 3ER LUGAR (opcional)</Text>
              <TextInput style={s.input} placeholder="Ej: Consumo gratis una noche" placeholderTextColor={C.muted} value={tPrize3} onChangeText={setTPrize3} maxLength={80}/>

              <Text style={s.inputLabel}>📅 FECHA INICIO (YYYY-MM-DD)</Text>
              <TextInput style={s.input} placeholder="2026-06-11" placeholderTextColor={C.muted} value={tStart} onChangeText={setTStart} maxLength={10}/>

              <Text style={s.inputLabel}>📅 FECHA FIN (YYYY-MM-DD)</Text>
              <TextInput style={s.input} placeholder="2026-07-19" placeholderTextColor={C.muted} value={tEnd} onChangeText={setTEnd} maxLength={10}/>

              <Text style={s.inputLabel}>📍 CIUDAD</Text>
              <TextInput style={s.input} placeholder="Ej: Bogotá" placeholderTextColor={C.muted} value={tCiudad} onChangeText={setTCiudad} maxLength={40}/>

              <Text style={s.inputLabel}>🌍 PAÍS</Text>
              <TextInput style={s.input} placeholder="Ej: Colombia" placeholderTextColor={C.muted} value={tPais} onChangeText={setTPais} maxLength={40}/>

              <Text style={s.inputLabel}>🌐 PÁGINA WEB (opcional)</Text>
              <TextInput style={s.input} placeholder="https://www.tunegocio.com" placeholderTextColor={C.muted} value={tWeb} onChangeText={setTWeb} maxLength={100} autoCapitalize="none"/>

              <Text style={s.inputLabel}>👥 MÁXIMO DE PARTICIPANTES (opcional)</Text>
              <TextInput style={s.input} placeholder="Máx según tu plan" placeholderTextColor={C.muted} value={tMaxPart} onChangeText={setTMaxPart} maxLength={6} keyboardType="numeric"/>

              {canPublic && (
                <TouchableOpacity onPress={() => setTPublic(!tPublic)} style={[s.publicToggle, tPublic && {borderColor:C.cyan}]}>
                  <Text style={{color: tPublic ? C.cyan : C.muted, fontWeight:'700'}}>
                    {tPublic ? '🌍 TORNEO PÚBLICO' : '🔒 TORNEO PRIVADO'}
                  </Text>
                  <Text style={{color:C.muted, fontSize:10, marginTop:2}}>
                    {tPublic ? 'Visible para todos los usuarios de GOLZI' : 'Solo para miembros de tu liga'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleCreate} disabled={creating} style={s.createBtnModal}>
                <LinearGradient colors={[C.gold, C.gold2]} style={s.createBtnInner}>
                  <Text style={s.createBtnTxt}>{creating ? '⏳ CREANDO TORNEO...' : '⚡ CREAR TORNEO'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowCreate(false)} style={{alignItems:'center', padding:12, backgroundColor:'rgba(255,51,85,0.08)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,51,85,0.3)', marginTop:4}}>
                <Text style={{color:'#FF3355', fontSize:13, fontWeight:'700', letterSpacing:1}}>✕ CERRAR FORMULARIO</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal ranking torneo */}
      <Modal visible={!!selectedTournament} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={{padding:20}}>
              <Text style={s.modalTitle}>🏆 {selectedTournament?.name}</Text>
              <Text style={{color:C.muted, fontSize:12, marginBottom:16}}>{selectedTournament?.matchIds?.length || 0} partidos · {selectedTournament?.participants?.length || 0} inscritos</Text>
              
              {rankingLoading ? (
                <ActivityIndicator color={C.gold} style={{marginTop:20}}/>
              ) : ranking.length === 0 ? (
                <Text style={{color:C.muted, textAlign:'center', padding:20}}>Sin predicciones aún</Text>
              ) : ranking.map((p, i) => (
                <View key={p.uid} style={[s.rankRow, i===0 && {borderColor:C.gold, borderWidth:1.5}]}>
                  <Text style={{fontSize:20, width:32}}>{i < 3 ? medals[i] : i+1}</Text>
                  <Text style={{flex:1, color:C.text, fontWeight:'700', fontSize:14}}>{p.username}</Text>
                  <Text style={{color: i===0 ? C.gold : C.text, fontWeight:'800', fontSize:18}}>{p.pts}</Text>
                  <Text style={{color:C.muted, fontSize:10, marginLeft:2}}>pts</Text>
                </View>
              ))}

              <TouchableOpacity onPress={() => { setSelectedTournament(null); setRanking([]); }} style={{alignItems:'center', padding:16, marginTop:8}}>
                <Text style={{color:C.muted}}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  loading:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.bg},
  scroll:{padding:16,paddingBottom:40},
  header:{marginBottom:16},
  headerTitle:{color:C.gold,fontSize:22,fontWeight:'800',letterSpacing:2},
  headerSub:{color:C.muted,fontSize:11,marginTop:2},
  createBtn:{borderRadius:14,overflow:'hidden',marginBottom:16},
  createBtnModal:{borderRadius:14,overflow:'hidden'},
  createBtnInner:{paddingVertical:14,alignItems:'center',borderRadius:14},
  createBtnTxt:{color:'#000',fontSize:15,fontWeight:'800',letterSpacing:2},
  empty:{alignItems:'center',paddingTop:60,gap:10},
  emptyTitle:{color:C.text,fontSize:18,fontWeight:'800'},
  emptySub:{color:C.muted,fontSize:13,textAlign:'center'},
  card:{backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,0.06)',marginBottom:14,overflow:'hidden'},
  cardTopLine:{height:3},
  cardHeader:{flexDirection:'row',alignItems:'flex-start',padding:14,paddingBottom:8,gap:10},
  cardName:{color:C.text,fontSize:16,fontWeight:'800',letterSpacing:0.5},
  cardDesc:{color:C.muted,fontSize:12,marginTop:2},
  cardStatus:{fontSize:10,fontWeight:'700',letterSpacing:1,marginTop:4},
  publicBadge:{backgroundColor:'rgba(0,198,255,0.1)',borderRadius:8,paddingHorizontal:8,paddingVertical:4,borderWidth:1,borderColor:'rgba(0,198,255,0.3)'},
  publicBadgeTxt:{color:C.cyan,fontSize:9,fontWeight:'700',letterSpacing:1},
  cardInfo:{flexDirection:'row',paddingHorizontal:14,paddingBottom:10,gap:8},
  cardInfoItem:{flex:1,backgroundColor:'rgba(255,255,255,0.03)',borderRadius:8,padding:8,alignItems:'center'},
  cardInfoLabel:{color:C.muted,fontSize:8,letterSpacing:1,fontWeight:'700'},
  cardInfoValue:{color:C.text,fontSize:14,fontWeight:'800',marginTop:2},
  prizeBox:{marginHorizontal:14,marginBottom:10,backgroundColor:'rgba(255,215,0,0.06)',borderRadius:8,padding:10,borderWidth:1,borderColor:'rgba(255,215,0,0.2)'},
  prizeTxt:{color:C.gold,fontSize:12,fontWeight:'700'},
  cardActions:{flexDirection:'row',gap:8,padding:14,paddingTop:4},
  joinBtn:{flex:1,backgroundColor:'rgba(255,215,0,0.15)',borderRadius:10,paddingVertical:10,alignItems:'center',borderWidth:1,borderColor:'rgba(255,215,0,0.3)'},
  joinBtnTxt:{color:C.gold,fontSize:12,fontWeight:'800',letterSpacing:1},
  joinedBadge:{flex:1,backgroundColor:'rgba(0,255,135,0.08)',borderRadius:10,paddingVertical:10,alignItems:'center',borderWidth:1,borderColor:'rgba(0,255,135,0.2)'},
  joinedTxt:{color:C.green,fontSize:12,fontWeight:'800',letterSpacing:1},
  rankingBtn:{flex:1,backgroundColor:'rgba(0,198,255,0.08)',borderRadius:10,paddingVertical:10,alignItems:'center',borderWidth:1,borderColor:'rgba(0,198,255,0.2)'},
  rankingBtnTxt:{color:C.cyan,fontSize:12,fontWeight:'800',letterSpacing:1},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.85)',justifyContent:'flex-end'},
  modalContent:{backgroundColor:'#0A0F1A',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'85%'},
  modalTitle:{color:C.gold,fontSize:20,fontWeight:'800',letterSpacing:2,marginBottom:4},
  inputLabel:{color:C.muted,fontSize:9,letterSpacing:2,fontWeight:'700',marginBottom:4},
  input:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:10,paddingHorizontal:14,paddingVertical:10,color:C.text,fontSize:14},
  publicToggle:{borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:10,padding:14},
  rankRow:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.04)',borderRadius:8,paddingHorizontal:8,marginBottom:4},
});
