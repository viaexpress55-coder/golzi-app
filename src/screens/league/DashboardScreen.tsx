import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection, getDocs, query, where,
  doc, updateDoc, onSnapshot, orderBy,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

const C = {
  bg:'#020408', surface:'#0A0F1A', surface2:'#0F1420',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87',
  cyan:'#00C6FF', red:'#FF3355', muted:'#6B7A99', text:'#FFFFFF',
};

const DASHBOARD_PLANS = ['PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];

interface Props {
  ligaId: string;
  ligaName: string;
  ligaCode: string;
  ligaPlan: string;
  ownerId: string;
  userId: string;
  onClose?: () => void;
}

export default function DashboardScreen({ ligaId, ligaName, ligaCode, ligaPlan, ownerId, userId, onClose }: Props) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPredictions: 0,
    avgPoints: 0,
    topPlayers: [] as any[],
    activeMembers: 0,
    participationRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [ligaStatus, setLigaStatus] = useState('active');

  const isAdmin = ownerId === userId;
  const canSeeAdvanced = ['BUSINESS','GOLD','GOLZI PREMIUM'].includes((ligaPlan||'').toUpperCase());

  useEffect(() => {
    loadStats();
    // Escuchar status de la liga
    const unsub = onSnapshot(doc(db, 'leagues', ligaId), snap => {
      setLigaStatus(snap.data()?.status || 'active');
    });
    return unsub;
  }, [ligaId]);

  async function loadStats() {
    setLoading(true);
    try {
      // Miembros
      const membersSnap = await getDocs(collection(db, 'leagues', ligaId, 'members'));
      const members = membersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      const totalMembers = members.length;
      const totalPoints = members.reduce((acc, m) => acc + (m.totalPoints || 0), 0);
      const avgPoints = totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;
      const activeMembers = members.filter(m => (m.totalPoints || 0) > 0).length;
      const participationRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
      const topPlayers = [...members].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 5);

      // Predicciones
      const predsSnap = await getDocs(
        query(collection(db, 'predictions'), where('ligaId', '==', ligaId))
      );

      setStats({
        totalMembers,
        totalPredictions: predsSnap.size,
        avgPoints,
        topPlayers,
        activeMembers,
        participationRate,
      });
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseLeague() {
    Alert.alert(
      '🔒 Cerrar liga',
      'El ranking quedará congelado. Los miembros no podrán hacer más predicciones en esta liga. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar liga',
          style: 'destructive',
          onPress: async () => {
            setClosing(true);
            await updateDoc(doc(db, 'leagues', ligaId), { status: 'closed' });
            setClosing(false);
            Alert.alert('✅ Liga cerrada', 'El ranking final ha sido congelado.');
          }
        }
      ]
    );
  }

  async function handleReopenLeague() {
    await updateDoc(doc(db, 'leagues', ligaId), { status: 'active' });
    Alert.alert('✅ Liga reactivada', 'La liga está activa nuevamente.');
  }

  if (loading) return (
    <View style={s.loading}><ActivityIndicator color={C.gold} size="large"/></View>
  );

  const isClosed = ligaStatus === 'closed';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>📊 DASHBOARD</Text>
        <Text style={s.headerSub}>{ligaName} · {ligaCode}</Text>
        {isClosed && (
          <View style={s.closedBadge}>
            <Text style={s.closedBadgeTxt}>🔒 LIGA CERRADA · RANKING FINAL</Text>
          </View>
        )}
      </View>

      {/* Métricas principales */}
      <View style={s.metricsGrid}>
        <View style={[s.metricCard, {borderColor:'rgba(255,215,0,0.3)'}]}>
          <Text style={s.metricIcon}>👥</Text>
          <Text style={[s.metricValue, {color:C.gold}]}>{stats.totalMembers}</Text>
          <Text style={s.metricLabel}>MIEMBROS</Text>
        </View>
        <View style={[s.metricCard, {borderColor:'rgba(0,255,135,0.3)'}]}>
          <Text style={s.metricIcon}>⚽</Text>
          <Text style={[s.metricValue, {color:C.green}]}>{stats.totalPredictions}</Text>
          <Text style={s.metricLabel}>PREDICCIONES</Text>
        </View>
        <View style={[s.metricCard, {borderColor:'rgba(0,198,255,0.3)'}]}>
          <Text style={s.metricIcon}>⭐</Text>
          <Text style={[s.metricValue, {color:C.cyan}]}>{stats.avgPoints}</Text>
          <Text style={s.metricLabel}>PROMEDIO PTS</Text>
        </View>
        <View style={[s.metricCard, {borderColor:'rgba(255,163,0,0.3)'}]}>
          <Text style={s.metricIcon}>🔥</Text>
          <Text style={[s.metricValue, {color:C.gold2}]}>{stats.participationRate}%</Text>
          <Text style={s.metricLabel}>PARTICIPACIÓN</Text>
        </View>
      </View>

      {/* Top 5 jugadores */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🏆 TOP JUGADORES</Text>
        {stats.topPlayers.map((p, i) => (
          <View key={p.id} style={s.playerRow}>
            <Text style={s.playerPos}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</Text>
            <Text style={s.playerName}>{p.username || p.displayName || p.id.slice(0,8)}</Text>
            <Text style={[s.playerPts, {color: i===0 ? C.gold : C.text}]}>{p.totalPoints || 0} pts</Text>
          </View>
        ))}
        {stats.topPlayers.length === 0 && (
          <Text style={s.emptyTxt}>Sin jugadores con puntos aún</Text>
        )}
      </View>

      {/* Estadísticas avanzadas — BUSINESS+ */}
      {canSeeAdvanced && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>📈 ESTADÍSTICAS AVANZADAS</Text>
          <View style={s.advancedRow}>
            <Text style={s.advLabel}>Miembros activos</Text>
            <Text style={s.advValue}>{stats.activeMembers} / {stats.totalMembers}</Text>
          </View>
          <View style={s.progressWrap}>
            <View style={[s.progressBar, {width: `${stats.participationRate}%`}]}/>
          </View>
          <View style={s.advancedRow}>
            <Text style={s.advLabel}>Total puntos acumulados</Text>
            <Text style={s.advValue}>{stats.avgPoints * stats.totalMembers} pts</Text>
          </View>
          <View style={s.advancedRow}>
            <Text style={s.advLabel}>Predicciones por miembro</Text>
            <Text style={s.advValue}>
              {stats.totalMembers > 0 ? Math.round(stats.totalPredictions / stats.totalMembers) : 0}
            </Text>
          </View>
        </View>
      )}

      {/* Acciones admin */}
      {isAdmin && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚙️ GESTIÓN DE LIGA</Text>
          {!isClosed ? (
            <TouchableOpacity
              onPress={handleCloseLeague}
              disabled={closing}
              style={s.closeBtn}
            >
              <LinearGradient colors={['rgba(255,51,85,0.2)','rgba(255,51,85,0.08)']} style={s.closeBtnInner}>
                <Text style={s.closeBtnTxt}>{closing ? 'Cerrando...' : '🔒 CERRAR LIGA · CONGELAR RANKING'}</Text>
                <Text style={s.closeBtnSub}>El ranking final quedará guardado permanentemente</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleReopenLeague} style={s.reopenBtn}>
              <Text style={s.reopenBtnTxt}>🔓 REACTIVAR LIGA</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity onPress={loadStats} style={s.refreshBtn}>
        <Text style={s.refreshTxt}>🔄 ACTUALIZAR DATOS</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  scroll:{padding:16,paddingBottom:40},
  loading:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.bg},
  header:{marginBottom:20},
  headerTitle:{fontFamily:'BebasNeue_400Regular',fontSize:28,color:C.gold,letterSpacing:3},
  headerSub:{fontSize:12,color:C.muted,letterSpacing:1,marginTop:2},
  closedBadge:{backgroundColor:'rgba(255,51,85,0.1)',borderWidth:1,borderColor:'rgba(255,51,85,0.3)',borderRadius:8,padding:8,marginTop:10,alignItems:'center'},
  closedBadgeTxt:{color:'#FF3355',fontSize:11,fontWeight:'700',letterSpacing:1},
  metricsGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:20},
  metricCard:{flex:1,minWidth:'45%',backgroundColor:C.surface,borderRadius:14,borderWidth:1,padding:14,alignItems:'center',gap:4},
  metricIcon:{fontSize:24},
  metricValue:{fontSize:32,fontWeight:'800'},
  metricLabel:{fontSize:9,color:C.muted,letterSpacing:2,fontWeight:'700'},
  section:{backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,0.06)',padding:14,marginBottom:14},
  sectionTitle:{fontSize:10,color:C.muted,letterSpacing:3,fontWeight:'700',marginBottom:12},
  playerRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.04)'},
  playerPos:{fontSize:18,width:32},
  playerName:{flex:1,color:C.text,fontSize:14,fontWeight:'600'},
  playerPts:{fontSize:16,fontWeight:'800'},
  emptyTxt:{color:C.muted,fontSize:12,textAlign:'center',padding:10},
  advancedRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.04)'},
  advLabel:{color:C.muted,fontSize:12},
  advValue:{color:C.text,fontSize:14,fontWeight:'700'},
  progressWrap:{height:6,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:3,overflow:'hidden',marginVertical:8},
  progressBar:{height:6,backgroundColor:C.green,borderRadius:3},
  closeBtn:{borderRadius:12,overflow:'hidden'},
  closeBtnInner:{padding:16,borderWidth:1,borderColor:'rgba(255,51,85,0.3)',borderRadius:12,alignItems:'center'},
  closeBtnTxt:{color:'#FF3355',fontSize:14,fontWeight:'800',letterSpacing:1},
  closeBtnSub:{color:C.muted,fontSize:10,marginTop:4},
  reopenBtn:{backgroundColor:'rgba(0,255,135,0.1)',borderWidth:1,borderColor:'rgba(0,255,135,0.3)',borderRadius:12,padding:14,alignItems:'center'},
  reopenBtnTxt:{color:C.green,fontSize:14,fontWeight:'800',letterSpacing:1},
  refreshBtn:{alignItems:'center',padding:14},
  refreshTxt:{color:C.muted,fontSize:12,letterSpacing:1},
});
