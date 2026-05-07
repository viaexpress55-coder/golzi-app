import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';
import './src/locales/i18n';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from './src/services/notifications';

if (Platform.OS === 'web') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

export default function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Registrar para notificaciones
    registerForPushNotifications();

    // Listener cuando llega notificación con app abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
    });

    // Listener cuando usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notificación tocada:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}