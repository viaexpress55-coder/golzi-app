// src/components/GlowCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Card con efecto 3D premium — bordes dorados brillantes + sombra + glow
// Uso: <GlowCard> ... </GlowCard>
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlowCardProps {
  children:    React.ReactNode;
  style?:      ViewStyle;
  color?:      'gold' | 'green' | 'red' | 'purple' | 'cyan';
  intensity?:  'low' | 'medium' | 'high';
  radius?:     number;
}

const COLORS = {
  gold:   { border: '#FFD700', glow: 'rgba(255,215,0,{a})',   shadow: '#FFD700' },
  green:  { border: '#00FF87', glow: 'rgba(0,255,135,{a})',   shadow: '#00FF87' },
  red:    { border: '#FF3355', glow: 'rgba(255,51,85,{a})',    shadow: '#FF3355' },
  purple: { border: '#A855F7', glow: 'rgba(168,85,247,{a})',   shadow: '#A855F7' },
  cyan:   { border: '#00C6FF', glow: 'rgba(0,198,255,{a})',    shadow: '#00C6FF' },
};

const INTENSITY = {
  low:    { borderOpacity: 0.2, glowOpacity: 0.06, shadowOpacity: 0.25, elevation: 4  },
  medium: { borderOpacity: 0.4, glowOpacity: 0.10, shadowOpacity: 0.40, elevation: 8  },
  high:   { borderOpacity: 0.7, glowOpacity: 0.18, shadowOpacity: 0.60, elevation: 16 },
};

export default function GlowCard({
  children,
  style,
  color     = 'gold',
  intensity = 'medium',
  radius    = 18,
}: GlowCardProps) {
  const c = COLORS[color];
  const i = INTENSITY[intensity];

  const borderColor  = c.border + Math.round(i.borderOpacity * 255).toString(16).padStart(2, '0');
  const glowColor    = c.glow.replace('{a}', String(i.glowOpacity));
  const glowColor2   = c.glow.replace('{a}', '0.02');

  return (
    <View style={[
      gc.wrapper,
      {
        borderRadius:   radius,
        borderColor,
        shadowColor:    c.shadow,
        shadowOpacity:  i.shadowOpacity,
        elevation:      i.elevation,
      },
      style,
    ]}>
      {/* Glow interno */}
      <LinearGradient
        colors={[glowColor, glowColor2, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />

      {/* Línea superior brillante */}
      <LinearGradient
        colors={[c.border + '00', c.border, c.border + 'AA', c.border + '00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[gc.topLine, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]}
      />

      {/* Contenido */}
      <View style={gc.content}>
        {children}
      </View>
    </View>
  );
}

const gc = StyleSheet.create({
  wrapper: {
    borderWidth:    1,
    backgroundColor: '#0A0F1A',
    shadowOffset:   { width: 0, height: 4 },
    shadowRadius:   12,
    overflow:       'visible',
  },
  topLine: {
    position:  'absolute',
    top:       0,
    left:      0,
    right:     0,
    height:    2,
    zIndex:    1,
  },
  content: {
    borderRadius: 18,
    overflow:     'hidden',
  },
});