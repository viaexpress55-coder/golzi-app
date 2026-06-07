import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from '../screens/splash/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import RegisterScreen from '../screens/register/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import PlansScreen from '../screens/plans/PlansScreen';
import RankingScreen from '../screens/ranking/RankingScreen';
import LiveScreen from '../screens/live/LiveScreen';
import MundialScreen from '../screens/mundial/MundialScreen';
import LigaScreen from '../screens/league/LigaScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TorneosPublicosScreen from '../screens/torneos/TorneosPublicosScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PaymentScreen from '../screens/plans/PaymentScreen';
import PostMatchSummary from '../components/PostMatchSummary';

export type RootStackParams = {
  Splash:      undefined;
  Onboarding:  undefined;
  Register:    undefined;
  Plans:       undefined;
  Main:        undefined;
  Login:           undefined;
ForgotPassword:  undefined;
  Payment:     { planId: string; planName: string; price: number; emoji: string };
};

export type MainTabParams = {
  Predictor: undefined;
  Live:      undefined;
  Ranking:   undefined;
  Mundial:   undefined;
  Liga:      undefined;
  Perfil:    undefined;
};

const Stack = createStackNavigator<RootStackParams>();
const Tab   = createBottomTabNavigator<MainTabParams>();

const C = {
  darker:  '#020408',
  surface: '#0D1117',
  gold:    '#FFD700',
  muted:   '#6B7A99',
  border2: 'rgba(255,255,255,0.07)',
};

const linking = {
  prefixes: ['golzi://','https://golzi.app','https://www.golzi.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Liga: 'liga/:inviteCode',
        },
      },
    },
  },
};

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize:17, opacity: focused ? 1 : 0.35 }}>{emoji}</Text>;
}

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(8,10,16,0.98)',
          borderTopWidth: 1,
          borderTopColor: C.border2,
          height: 80,
          paddingBottom: 20,
          paddingTop: 4,
        },
        tabBarActiveTintColor:   C.gold,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: {
          fontSize: 8,
          letterSpacing: 1,
          textTransform: 'uppercase',
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Predictor" options={{ tabBarLabel: t('home_predict'), tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} /> }}>
        {() => <HomeScreen />}
      </Tab.Screen>
      <Tab.Screen name="Live" options={{ tabBarLabel: t('live_title'), tabBarIcon: ({ focused }) => <TabIcon emoji="🔴" focused={focused} /> }}>
        {() => <LiveScreen />}
      </Tab.Screen>
      <Tab.Screen name="Ranking" options={{ tabBarLabel: t('ranking_title'), tabBarIcon: ({ focused }) => <TabIcon emoji="👑" focused={focused} /> }}>
        {() => <RankingScreen />}
      </Tab.Screen>
      <Tab.Screen name="Torneos" options={{ tabBarLabel: 'TORNEOS', tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} /> }}>
        {() => <TorneosPublicosScreen />}
      </Tab.Screen>
      <Tab.Screen name="Mundial" options={{ tabBarLabel: t('mundial_title'), tabBarIcon: ({ focused }) => <TabIcon emoji="🌐" focused={focused} /> }}>
        {() => <MundialScreen />}
      </Tab.Screen>
      <Tab.Screen name="Liga" options={{ tabBarLabel: t('liga_title'), tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} /> }}>
        {() => <LigaScreen />}
      </Tab.Screen>
      <Tab.Screen name="Perfil" options={{ tabBarLabel: t('profile_tab'), tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" focused={focused} /> }}>
        {() => <ProfileScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking as any}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"      component={SplashScreen}    />
        <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
        <Stack.Screen name="Register"    component={RegisterScreen}   />
        <Stack.Screen name="Plans"       component={PlansScreen}      />
        <Stack.Screen name="Login"           component={LoginScreen}           />
<Stack.Screen name="ForgotPassword"  component={ForgotPasswordScreen}  />
        <Stack.Screen name="Main"        component={MainTabs}         />
        <Stack.Screen name="Payment"     component={PaymentScreen}    />
      </Stack.Navigator>
      <PostMatchSummary />
    </NavigationContainer>
  );
}