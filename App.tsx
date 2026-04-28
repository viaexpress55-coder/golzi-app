import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/splash/SplashScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <SplashScreen />
    </>
  );
}