// src/components/PostMatchSummary.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal animado que aparece cuando termina un partido
// Muestra: resultado real, tu predicción, puntos ganados, movimiento en ranking
// Se activa via onSnapshot cuando prediction.status cambia de 'pending'
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Share, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

const C = {
  bg:    '#020408',
  dark:  '#05080F',
  gold:  '#FFD700',
  gold2: '#FFA500',
  green: '#00FF87',
  red:   '#FF3355',
  muted: '#6B7A99',
  text:  '#FFFFFF',
  cyan:  '#00C6FF',
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface MatchResult {
  matchId:      string;
  homeTeam:     string;
  awayTeam:     string;
  actualHome:   number;
  actualAway:   number;
  predHome:     number;
  predAway:     number;
  pointsEarned: number;
  status:       string;
  rankBefore?:  number;
  rankAfter?:   number;
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
function getResultLabel(status: string): { emoji: string; label: string; color: string } {
  switch (status) {
    case 'correct_exact':  return { emoji:'⭐', label:'¡MARCADOR EXACTO!',   color: C.gold  };
    case 'correct_result': return { emoji:'✓',  label:'¡GANADOR CORRECTO!',  color: C.green };
    case 'correct_draw':   return { emoji:'✓',  label:'¡EMPATE CORRECTO!',   color: C.cyan  };
    default:               return { emoji:'✗',  label:'SIN PUNTOS',          color: C.muted };
  }
}

// ─── Componente de resultado individual ───────────────────────────────────────
function ResultCard({ result, index }: { result: MatchResult; index: number }) {
  const slideAnim  = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0, delay: index * 150,
        tension: 60, friction: 8, useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, duration: 300, delay: index * 150, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, delay: index * 150,
        tension: 60, friction: 8, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { emoji, label, color } = getResultLabel(result.status);
  const isPositive = result.pointsEarned > 0;

  return (
    <Animated.View style={[
      rc.card,
      { transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: opacityAnim },
    ]}>
      <LinearGradient
        colors={isPositive
          ? ['rgba(255,215,0,0.1)', 'rgba(255,215,0,0.03)']
          : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']
        }
        style={StyleSheet.absoluteFill}
      />
      <View style={[rc.topLine, { backgroundColor: color }]} />

      {/* Equipos */}
      <View style={rc.teamsRow}>
        <Text style={rc.teamTxt}>{result.homeTeam.slice(0,3).toUpperCase()}</Text>
        <View style={rc.scoreCol}>
          {/* Resultado real */}
          <View style={rc.realScore}>
            <Text style={rc.realNum}>{result.actualHome}</Text>
            <Text style={rc.realDash}>-</Text>
            <Text style={rc.realNum}>{result.actualAway}</Text>
          </View>
          <Text style={rc.realLbl}>RESULTADO FINAL</Text>
          {/* Tu predicción */}
          <View style={rc.predRow}>
            <Text style={rc.predLbl}>Tu pred: </Text>
            <Text style={[rc.predScore, { color }]}>
              {result.predHome} - {result.predAway}
            </Text>
          </View>
        </View>
        <Text style={rc.teamTxt}>{result.awayTeam.slice(0,3).toUpperCase()}</Text>
      </View>

      {/* Resultado */}
      <View style={[rc.resultRow, { borderColor: color + '44' }]}>
        <Text style={rc.resultEmoji}>{emoji}</Text>
        <Text style={[rc.resultLabel, { color }]}>{label}</Text>
        <View style={[rc.ptsBadge, { backgroundColor: color + '20', borderColor: color + '55' }]}>
          <Text style={[rc.ptsVal, { color }]}>
            {isPositive ? `+${result.pointsEarned}` : '0'} pts
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const rc = StyleSheet.create({
  card:{ borderRadius:16, borderWidth:1, borderColor:'rgba(255,215,0,0.15)', overflow:'hidden', marginBottom:10 },
  topLine:{ height:2 },
  teamsRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14 },
  teamTxt:{ fontSize:16, fontWeight:'900', color:C.text, letterSpacing:2, width:40 },
  scoreCol:{ alignItems:'center', flex:1 },
  realScore:{ flexDirection:'row', alignItems:'center', gap:8 },
  realNum:{ fontSize:40, fontWeight:'900', color:C.text, lineHeight:44 },
  realDash:{ fontSize:24, color:C.muted },
  realLbl:{ fontSize:8, color:C.muted, letterSpacing:2, marginTop:2, fontWeight:'700' },
  predRow:{ flexDirection:'row', alignItems:'center', marginTop:4 },
  predLbl:{ fontSize:10, color:C.muted },
  predScore:{ fontSize:10, fontWeight:'800', letterSpacing:1 },
  resultRow:{ flexDirection:'row', alignItems:'center', gap:10, marginHorizontal:14, marginBottom:14, borderRadius:10, borderWidth:1, padding:10 },
  resultEmoji:{ fontSize:18 },
  resultLabel:{ flex:1, fontSize:13, fontWeight:'800', letterSpacing:1 },
  ptsBadge:{ borderRadius:20, paddingHorizontal:12, paddingVertical:4, borderWidth:1 },
  ptsVal:{ fontSize:14, fontWeight:'900' },
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PostMatchSummary() {
  const [visible, setVisible]     = useState(false);
  const [results, setResults]     = useState<MatchResult[]>([]);
  const [totalPts, setTotalPts]   = useState(0);
  const [userData, setUserData]   = useState<any>(null);

  const headerAnim  = useRef(new Animated.Value(-100)).current;
  const footerAnim  = useRef(new Animated.Value(100)).current;
  const ptsAnim     = useRef(new Animated.Value(0)).current;
  const ptsScale    = useRef(new Animated.Value(0)).current;

  // ── Escuchar predicciones recién calculadas ───────────────────────────────
  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    // Cargar datos del usuario
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setUserData(snap.data());
    });

    // Escuchar predicciones que acaban de ser calculadas (últimas 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const q = query(
      collection(db, 'predictions'),
      where('userId', '==', user.uid),
      where('status', 'in', ['correct_exact','correct_result','correct_draw','incorrect']),
      where('calculatedAt', '>=', since),
      orderBy('calculatedAt', 'desc'),
      limit(5)
    );

    // Flag para evitar mostrar al inicio (solo nuevos cambios)
    let initialized = false;
    let lastSeenIds = new Set<string>();

    const unsub = onSnapshot(q, async (snap) => {
      if (!initialized) {
        // Primera carga — solo registrar IDs existentes
        snap.docs.forEach(d => lastSeenIds.add(d.id));
        initialized = true;
        return;
      }

      // Detectar predicciones nuevamente calculadas
      const newResults: MatchResult[] = [];

      for (const docSnap of snap.docs) {
        if (lastSeenIds.has(docSnap.id)) continue; // ya la vimos
        lastSeenIds.add(docSnap.id);

        const pred = docSnap.data();

        // Obtener datos del partido
        let matchData: any = {};
        try {
          const matchDoc = await getDoc(doc(db, 'matches', pred.matchId));
          if (matchDoc.exists()) matchData = matchDoc.data();
        } catch {}

        newResults.push({
          matchId:      pred.matchId,
          homeTeam:     matchData.homeTeam ?? pred.matchId,
          awayTeam:     matchData.awayTeam ?? '',
          actualHome:   matchData.homeScore ?? 0,
          actualAway:   matchData.awayScore ?? 0,
          predHome:     pred.homeScore,
          predAway:     pred.awayScore,
          pointsEarned: pred.pointsEarned,
          status:       pred.status,
        });
      }

      if (newResults.length > 0) {
        const total = newResults.reduce((sum, r) => sum + r.pointsEarned, 0);
        setResults(newResults);
        setTotalPts(total);
        setVisible(true);
        startAnimations(total);
      }
    });

    return unsub;
  }, []);

  function startAnimations(pts: number) {
    headerAnim.setValue(-100);
    footerAnim.setValue(100);
    ptsAnim.setValue(0);
    ptsScale.setValue(0);

    Animated.parallel([
      Animated.spring(headerAnim, { toValue:0, tension:60, friction:8, useNativeDriver:true }),
      Animated.spring(footerAnim, { toValue:0, tension:60, friction:8, useNativeDriver:true }),
      Animated.spring(ptsScale,   { toValue:1, delay:400, tension:50, friction:6, useNativeDriver:true }),
      Animated.timing(ptsAnim,    { toValue:pts, duration:1200, delay:300, useNativeDriver:false }),
    ]).start();
  }

  async function handleShare() {
    const best = results.reduce((a, b) => a.pointsEarned > b.pointsEarned ? a : b, results[0]);
    if (!best) return;
    await Share.share({
      message:
        `⚽ GOLZI — MUNDIAL 2026\n\n` +
        `🎯 ${best.homeTeam} vs ${best.awayTeam}\n` +
        `Predije: ${best.predHome}-${best.predAway} · Real: ${best.actualHome}-${best.actualAway}\n` +
        (totalPts > 0 ? `✨ Gané +${totalPts} puntos\n\n` : '\n') +
        `¿Puedes superarme? 👉 golzi.app`,
    });
  }

  if (!visible || results.length === 0) return null;

  const username = userData?.username ?? 'GOLZAIR';
  const allCorrect = results.every(r => r.status !== 'incorrect');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={st.overlay}>
        <LinearGradient
          colors={['rgba(2,4,8,0.97)', 'rgba(5,8,15,0.97)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Header animado */}
        <Animated.View style={[st.header, { transform:[{ translateY: headerAnim }] }]}>
          <Image
            source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
            style={st.logo} resizeMode="contain"
          />
          <View>
            <Text style={st.headerTitle}>RESULTADO DEL PARTIDO</Text>
            <Text style={st.headerSub}>@{username.toLowerCase()} · MUNDIAL 2026</Text>
          </View>
        </Animated.View>

        {/* Puntos totales */}
        <Animated.View style={[st.ptsHero, { transform:[{ scale: ptsScale }] }]}>
          <LinearGradient
            colors={totalPts > 0
              ? ['rgba(255,215,0,0.15)','rgba(255,215,0,0.04)']
              : ['rgba(136,136,136,0.1)','rgba(136,136,136,0.03)']
            }
            style={st.ptsHeroInner}
          >
            <Text style={st.ptsHeroEmoji}>
              {totalPts >= 10 ? '⭐' : totalPts >= 5 ? '✓' : totalPts >= 2 ? '👍' : '💪'}
            </Text>
            <Animated.Text style={[st.ptsHeroVal, { color: totalPts > 0 ? C.gold : C.muted }]}>
              {totalPts > 0 ? `+${totalPts}` : '0'}
            </Animated.Text>
            <Text style={st.ptsHeroLbl}>PUNTOS GANADOS</Text>
            {allCorrect && totalPts > 0 && (
              <Text style={st.ptsHeroBonus}>🔥 ¡Sigue así, vas a subir en el ranking!</Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Resultados */}
        <View style={st.resultsScroll}>
          {results.map((r, i) => (
            <ResultCard key={r.matchId} result={r} index={i} />
          ))}
        </View>

        {/* Footer animado */}
        <Animated.View style={[st.footer, { transform:[{ translateY: footerAnim }] }]}>
          {totalPts > 0 && (
            <TouchableOpacity style={st.shareBtn} onPress={handleShare} activeOpacity={0.85}>
              <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={st.shareBtnInner}>
                <Text style={st.shareBtnTxt}>📤 COMPARTIR RESULTADO</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={st.closeBtn} onPress={() => setVisible(false)} activeOpacity={0.8}>
            <Text style={st.closeTxt}>Ver mi ranking</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay:{ flex:1, justifyContent:'center', paddingHorizontal:16, paddingVertical:40 },
  header:{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:20 },
  logo:{ width:40, height:40 },
  headerTitle:{ fontSize:18, fontWeight:'900', color:C.gold, letterSpacing:2 },
  headerSub:{ fontSize:10, color:C.muted, letterSpacing:1 },

  ptsHero:{ marginBottom:16 },
  ptsHeroInner:{ borderRadius:20, padding:20, alignItems:'center', borderWidth:1, borderColor:'rgba(255,215,0,0.25)' },
  ptsHeroEmoji:{ fontSize:40, marginBottom:8 },
  ptsHeroVal:{ fontSize:64, fontWeight:'900', letterSpacing:2, lineHeight:68 },
  ptsHeroLbl:{ fontSize:10, color:C.muted, letterSpacing:3, fontWeight:'700', marginTop:4 },
  ptsHeroBonus:{ fontSize:12, color:C.green, marginTop:8, fontStyle:'italic' },

  resultsScroll:{ flex:1 },

  footer:{ gap:10, marginTop:16 },
  shareBtn:{ borderRadius:14, overflow:'hidden' },
  shareBtnInner:{ paddingVertical:16, alignItems:'center', borderRadius:14 },
  shareBtnTxt:{ fontSize:16, fontWeight:'900', color:'#000', letterSpacing:2 },
  closeBtn:{ alignItems:'center', paddingVertical:14, borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  closeTxt:{ fontSize:14, color:C.muted, fontWeight:'600' },
});