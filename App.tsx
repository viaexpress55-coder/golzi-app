import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';
import { initIAP, endIAP } from './src/services/iap';
import { initIAP, endIAP } from './src/services/iap';
import './src/locales/i18n';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from './src/services/notifications';
import i18n from './src/locales/i18n';

if (Platform.OS === 'web') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

export default function App() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // ✅ NUEVO (force update para cambio de idioma)
  const [, forceUpdate] = useState(0);

  // ✅ NUEVO (escuchar cambio de idioma)
  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);

  useEffect(() => {
    // Registrar para notificaciones
    if (Platform.OS === 'android') {
      initIAP().catch(e => console.log('IAP init error:', e));
    }
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
      // ✅ FIX APLICADO (REEMPLAZO EXACTO)
      notificationListener.current?.remove();
      responseListener.current?.remove();
      if (Platform.OS === 'android') endIAP();
    };
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AppNavigator />
    </SafeAreaProvider>
  );
}