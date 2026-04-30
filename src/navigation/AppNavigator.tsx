import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from '../screens/splash/SplashScreen';
import RegisterScreen from '../screens/register/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import PlansScreen from '../screens/plans/PlansScreen';
import RankingScreen from '../screens/ranking/RankingScreen';
import LiveScreen from '../screens/live/LiveScreen';
import MundialScreen from '../screens/mundial/MundialScreen';
import LigaScreen from '../screens/league/LigaScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';


export type RootStackParams = {
  Splash: undefined;
  Register: undefined;
  Plans: undefined;
  Main: undefined;
  Login: undefined;
};

export type MainTabParams = {
  Predictor: undefined;
  Live: undefined;
  Ranking: undefined;
  Mundial: undefined;
  Liga: undefined;
  Perfil: undefined;
};

const Stack = createStackNavigator<RootStackParams>();
const Tab = createBottomTabNavigator<MainTabParams>();

const C = {
  dark: '#05080F',
  surface: '#0D1117',
  gold: '#FFD700',
  muted: '#6B7A99',
  border: 'rgba(255,255,255,0.07)',
};

function Placeholder({ name }: { name: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, color: C.gold, letterSpacing: 2 }}>{name}</Text>
    </View>
  );
}

function Icon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 16, color: focused ? C.gold : C.muted }}>{label}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, height: 58 },
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 9, textTransform: 'uppercase' },
      }}
    >
      <Tab.Screen
        name="Predictor"
        options={{ tabBarLabel: 'Predecir', tabBarIcon: ({ focused }) => <Icon label="GOL" focused={focused} /> }}
      >
        {() => <HomeScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Live"
        options={{ tabBarLabel: 'En Vivo', tabBarIcon: ({ focused }) => <Icon label="LIVE" focused={focused} /> }}
      >
        {() => <LiveScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Ranking"
        options={{ tabBarLabel: 'Ranking', tabBarIcon: ({ focused }) => <Icon label="RNK" focused={focused} /> }}
      >
        {() => <RankingScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Mundial"
        options={{ tabBarLabel: 'Mundial', tabBarIcon: ({ focused }) => <Icon label="MUN" focused={focused} /> }}
      >
        {() => <MundialScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Liga"
        options={{ tabBarLabel: 'Liga', tabBarIcon: ({ focused }) => <Icon label="LIG" focused={focused} /> }}
      >
        {() => <LigaScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Perfil"
        options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ focused }) => <Icon label="PRF" focused={focused} /> }}
      >
        {() => <ProfileScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Plans" component={PlansScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}