import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';

export default function PlansScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  return (
    <View style={{ flex: 1, backgroundColor: '#05080F', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFD700', fontSize: 32, letterSpacing: 2 }}>PLANES</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Main')}
        style={{ marginTop: 24, backgroundColor: '#FFD700', padding: 16, borderRadius: 12 }}
      >
        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>CONTINUAR →</Text>
      </TouchableOpacity>
    </View>
  );
}