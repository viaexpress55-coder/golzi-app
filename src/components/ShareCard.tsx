// src/components/ShareCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Tarjeta visual que se captura como imagen y se comparte por WhatsApp/Instagram
// Uso: <ShareCard ref={cardRef} ... />
// ─────────────────────────────────────────────────────────────────────────────

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const C = {
  bg:    '#020408',
  gold:  '#FFD700',
  gold2: '#FFA500',
  green: '#00FF87',
  muted: '#6B7A99',
  text:  '#FFFFFF',
  red:   '#FF3355',
};

export interface ShareCardProps {
  username:    string;
  homeTeam:    string;
  awayTeam:    string;
  homeFlagUrl: string;
  awayFlagUrl: string;
  homeScore:   number;
  awayScore:   number;
  pointsEarned?: number;   // si ya se calcularon (post-partido)
  isExact?:    boolean;
  leagueName?: string;
  rank?:       number;
  mode:        'prediction' | 'result';  // prediction = antes, result = después
}

const ShareCard = forwardRef<View, ShareCardProps>((props, ref) => {
  const {
    username, homeTeam, awayTeam,
    homeFlagUrl, awayFlagUrl,
    homeScore, awayScore,
    pointsEarned, isExact,
    leagueName, rank, mode,
  } = props;

  const isResult = mode === 'result';

  return (
    <View ref={ref} style={sc.root} collapsable={false}>

      {/* Fondo degradado */}
      <LinearGradient
        colors={['#050810', '#0A0F1A', '#020408']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Línea superior dorada */}
      <LinearGradient
        colors={[C.gold, C.gold2, C.gold]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={sc.topLine}
      />

      {/* Logo + marca */}
      <View style={sc.header}>
        <Image
          source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
          style={sc.logo}
          resizeMode="contain"
        />
        <View>
          <Text style={sc.brandName}>GOLZI</Text>
          <Text style={sc.brandSub}>MUNDIAL 2026</Text>
        </View>
        {rank && (
          <View style={sc.rankBadge}>
            <Text style={sc.rankTxt}>#{rank}</Text>
            <Text style={sc.rankLbl}>GLOBAL</Text>
          </View>
        )}
      </View>

      {/* Username */}
      <Text style={sc.username}>@{username.toLowerCase()}</Text>

      {/* Label */}
      <Text style={sc.label}>
        {isResult ? '🎯 MI PREDICCIÓN FUE:' : '⚡ MI PREDICCIÓN:'}
      </Text>

      {/* Equipos + marcador */}
      <View style={sc.matchRow}>
        {/* Local */}
        <View style={sc.teamCol}>
          <Image source={{ uri: homeFlagUrl }} style={sc.flag} resizeMode="contain" />
          <Text style={sc.teamCode}>{homeTeam.slice(0, 3).toUpperCase()}</Text>
          <Text style={sc.teamName} numberOfLines={1}>{homeTeam}</Text>
        </View>

        {/* Score */}
        <View style={sc.scoreCol}>
          <LinearGradient
            colors={
              isResult && isExact
                ? ['rgba(255,215,0,0.2)', 'rgba(255,215,0,0.08)']
                : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']
            }
            style={sc.scoreBox}
          >
            <Text style={[sc.scoreNum, isResult && isExact && { color: C.gold }]}>
              {homeScore}
            </Text>
            <Text style={sc.scoreDash}>-</Text>
            <Text style={[sc.scoreNum, isResult && isExact && { color: C.gold }]}>
              {awayScore}
            </Text>
          </LinearGradient>
          {isResult && isExact && (
            <View style={sc.exactBadge}>
              <Text style={sc.exactTxt}>⭐ EXACTO</Text>
            </View>
          )}
        </View>

        {/* Visita */}
        <View style={sc.teamCol}>
          <Image source={{ uri: awayFlagUrl }} style={sc.flag} resizeMode="contain" />
          <Text style={sc.teamCode}>{awayTeam.slice(0, 3).toUpperCase()}</Text>
          <Text style={sc.teamName} numberOfLines={1}>{awayTeam}</Text>
        </View>
      </View>

      {/* Puntos (solo en mode result) */}
      {isResult && pointsEarned !== undefined && (
        <LinearGradient
          colors={pointsEarned > 0
            ? ['rgba(0,255,135,0.15)', 'rgba(0,255,135,0.05)']
            : ['rgba(136,136,136,0.1)', 'rgba(136,136,136,0.03)']
          }
          style={sc.pointsBox}
        >
          <Text style={[sc.pointsVal, { color: pointsEarned > 0 ? C.green : C.muted }]}>
            {pointsEarned > 0 ? `+${pointsEarned}` : '0'} PTS
          </Text>
          <Text style={sc.pointsLbl}>
            {pointsEarned === 10 ? '¡MARCADOR EXACTO! 🏆'
              : pointsEarned === 5 ? '¡GANADOR CORRECTO! ✓'
              : pointsEarned === 2 ? '¡EMPATE CORRECTO! ✓'
              : 'Sin puntos esta vez'}
          </Text>
        </LinearGradient>
      )}

      {/* Liga */}
      {leagueName && (
        <View style={sc.leagueRow}>
          <Text style={sc.leagueTxt}>🏆 {leagueName}</Text>
        </View>
      )}

      {/* CTA */}
      <View style={sc.footer}>
        <Text style={sc.footerCta}>¿Puedes superarme?</Text>
        <Text style={sc.footerUrl}>golzi.app</Text>
      </View>

      {/* Línea inferior */}
      <LinearGradient
        colors={[C.gold, C.gold2, C.gold]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={sc.bottomLine}
      />
    </View>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;

const sc = StyleSheet.create({
  root:{ width:340, backgroundColor:C.bg, borderRadius:20, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  topLine:{ height:3 },
  bottomLine:{ height:3 },
  header:{ flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:20, paddingTop:16, paddingBottom:8 },
  logo:{ width:32, height:32 },
  brandName:{ fontSize:18, fontWeight:'900', color:C.gold, letterSpacing:3 },
  brandSub:{ fontSize:8, color:C.muted, letterSpacing:2 },
  rankBadge:{ marginLeft:'auto', backgroundColor:'rgba(0,255,135,0.1)', borderRadius:8, borderWidth:1, borderColor:'rgba(0,255,135,0.25)', paddingHorizontal:10, paddingVertical:5, alignItems:'center' },
  rankTxt:{ fontSize:16, fontWeight:'900', color:'#00FF87' },
  rankLbl:{ fontSize:7, color:C.muted, letterSpacing:2 },
  username:{ fontSize:13, color:C.muted, paddingHorizontal:20, marginBottom:4, letterSpacing:1 },
  label:{ fontSize:10, color:C.muted, paddingHorizontal:20, marginBottom:16, letterSpacing:2, fontWeight:'700' },
  matchRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, marginBottom:16 },
  teamCol:{ flex:1, alignItems:'center', gap:6 },
  flag:{ width:52, height:36, borderRadius:4 },
  teamCode:{ fontSize:16, fontWeight:'900', color:C.gold, letterSpacing:2 },
  teamName:{ fontSize:9, color:C.muted, textAlign:'center' },
  scoreCol:{ alignItems:'center', paddingHorizontal:8, gap:6 },
  scoreBox:{ flexDirection:'row', alignItems:'center', gap:6, borderRadius:14, paddingHorizontal:16, paddingVertical:12, borderWidth:1, borderColor:'rgba(255,215,0,0.2)' },
  scoreNum:{ fontSize:44, fontWeight:'900', color:C.text, lineHeight:48 },
  scoreDash:{ fontSize:28, color:C.muted, fontWeight:'300' },
  exactBadge:{ backgroundColor:'rgba(255,215,0,0.15)', borderRadius:20, paddingHorizontal:12, paddingVertical:4, borderWidth:1, borderColor:'rgba(255,215,0,0.4)' },
  exactTxt:{ fontSize:10, fontWeight:'800', color:C.gold, letterSpacing:1 },
  pointsBox:{ marginHorizontal:20, borderRadius:12, padding:14, alignItems:'center', marginBottom:12, borderWidth:1, borderColor:'rgba(0,255,135,0.2)' },
  pointsVal:{ fontSize:36, fontWeight:'900', letterSpacing:2 },
  pointsLbl:{ fontSize:11, color:C.muted, marginTop:2, letterSpacing:1 },
  leagueRow:{ marginHorizontal:20, marginBottom:12, alignItems:'center' },
  leagueTxt:{ fontSize:11, color:C.muted, letterSpacing:1 },
  footer:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14 },
  footerCta:{ fontSize:12, color:C.muted, fontStyle:'italic' },
  footerUrl:{ fontSize:13, fontWeight:'900', color:C.gold, letterSpacing:1 },
});