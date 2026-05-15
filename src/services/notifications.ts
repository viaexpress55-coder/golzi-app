import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// ── Configuración de cómo mostrar las notificaciones ─────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

// ── Registrar dispositivo y obtener token ─────────────────────────────────────
export async function registerForPushNotifications(userId?: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications solo funcionan en dispositivo físico');
    return null;
  }

  // Pedir permisos
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Permisos de notificación denegados');
    return null;
  }

  // Obtener token
  let token: string | null = null;
  try {
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'f7350587-b45a-4b28-bb33-c0a6a732daa8',
    })).data;
    console.log('Push token:', token);
  } catch (e) {
    console.log('Error obteniendo push token:', e);
    return null;
  }

  // Guardar token en Firestore — campo fcmToken (consistente con Cloud Functions)
  if (userId && token) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmToken:        token,
        fcmTokenUpdated: new Date(),
      });
    } catch (e) {
      console.error('Error guardando fcmToken:', e);
    }
  }

  // Config especial Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('golzi_default', {
      name:             'GOLZI Notificaciones',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#FFD700',
      sound:            'default',
    });

    await Notifications.setNotificationChannelAsync('golzi_rivalry', {
      name:             'GOLZI Rivalidad',
      importance:       Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor:       '#FF3355',
      sound:            'default',
    });
  }

  return token;
}

// ── Enviar notificación local (para pruebas) ──────────────────────────────────
export async function sendLocalNotification(title: string, body: string, data?: object) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data:  (data || {}) as Record<string, unknown>,
      sound: 'default',
    },
    trigger: null, // inmediata
  });
}

// ── Notificaciones predefinidas GOLZI ────────────────────────────────────────
export const GOLZI_NOTIFICATIONS = {
  matchStarting: (homeTeam: string, awayTeam: string) => ({
    title: '⚽ PARTIDO POR COMENZAR',
    body:  `${homeTeam} vs ${awayTeam} empieza en 15 minutos`,
  }),
  predictionCorrect: (pts: number) => ({
    title: '🎯 ¡PREDICCIÓN CORRECTA!',
    body:  `¡Ganaste +${pts} puntos! Sigue así Golzair 🔥`,
  }),
  rankingUp: (position: number) => ({
    title: '📈 ¡SUBISTE EN EL RANKING!',
    body:  `Ahora eres #${position} en el ranking global`,
  }),
  leagueInvite: (leagueName: string) => ({
    title: '🏆 INVITACIÓN A LIGA',
    body:  `Te han invitado a unirte a "${leagueName}"`,
  }),
  matchReminder: (homeTeam: string, awayTeam: string) => ({
    title: '⏰ ¡NO OLVIDES PREDECIR!',
    body:  `${homeTeam} vs ${awayTeam} — Haz tu predicción ahora`,
  }),
  streakMilestone: (days: number) => ({
    title: `🔥 ¡Racha de ${days} días!`,
    body:  `${days} días seguidos acertando. ¡Eres increíble!`,
  }),
  rivalrySurpassed: (rivalName: string, leagueName: string) => ({
    title: `⚡ ¡${rivalName} te superó!`,
    body:  `Ahora está por encima de ti en "${leagueName}". ¡Reacciona!`,
  }),
};