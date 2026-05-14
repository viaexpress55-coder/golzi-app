import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// @ts-ignore
import { C, F } from '../theme';

const TABS = [
  { key: 'Predictor', icon: '⚽', label: 'Predecir' },
  { key: 'Live',      icon: '📡', label: 'En Vivo'  },
  { key: 'Ranking',   icon: '🏆', label: 'Ranking'  },
  { key: 'Mundial',   icon: '🌍', label: 'Mundial'  },
  { key: 'Liga',      icon: '🔗', label: 'Liga'     },
  { key: 'Perfil',    icon: '👤', label: 'Perfil'   },
];

interface Props {
  active: string;
  onPress: (key: string) => void;
}

export default function TabBar({ active, onPress }: Props) {
  return (
    <View style={s.bar}>
      {TABS.map(t => (
        <TouchableOpacity
          key={t.key}
          style={s.item}
          onPress={() => onPress(t.key)}
          activeOpacity={0.7}
        >
          <Text style={[s.icon, active === t.key && s.iconOn]}>{t.icon}</Text>
          <Text style={[s.label, active === t.key && s.labelOn]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  bar:{
    height: 54,
    backgroundColor: 'rgba(8,10,16,0.98)',
    borderTopWidth: 1,
    borderTopColor: C.border2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item:{ flex:1, alignItems:'center', justifyContent:'center', gap:2 },
  icon:{ fontSize:17, opacity:0.35 },
  iconOn:{ opacity:1 },
  label:{ fontSize:8, letterSpacing:1, textTransform:'uppercase', color:C.muted, fontFamily:F.barlowC6 },
  labelOn:{ color:C.gold },
});