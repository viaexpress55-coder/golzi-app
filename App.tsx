import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import SplashScreen from './src/screens/splash/SplashScreen';
import RegisterScreen from './src/screens/register/RegisterScreen';
import PlansScreen from './src/screens/plans/PlansScreen';

type Screen = 'splash' | 'register' | 'plans';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  return (
    <>
      <StatusBar style="light" />
      {screen === 'splash' && (
        <SplashScreen
          onEnter={() => setScreen('register')}
          onExplore={() => setScreen('register')}
        />
      )}
      {screen === 'register' && (
        <RegisterScreen
          onBack={() => setScreen('splash')}
          onContinue={() => setScreen('plans')}
        />
      )}
      {screen === 'plans' && (
        <PlansScreen
          onBack={() => setScreen('register')}
          onSelect={(plan) => console.log('Plan elegido:', plan)}
        />
      )}
    </>
  );
}