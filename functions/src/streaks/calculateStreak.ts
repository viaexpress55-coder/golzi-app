// functions/src/streaks/calculateStreak.ts
// ─────────────────────────────────────────────────────────────────────────────
// Calcula la racha real de días consecutivos con predicciones correctas
// Se dispara cada vez que se actualiza totalPoints de un usuario
// FIX: usa el timezone del usuario para calcular días correctamente en LATAM
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();

// ── Normaliza una fecha al día local según timezone del usuario ───────────────
// Ejemplo: 2026-06-11T23:00:00Z en America/Bogota → "2026-06-11" (no "2026-06-12")
function toLocalDay(date: Date, timezone: string): string {
  try {
    // Usar Intl.DateTimeFormat para obtener la fecha en el timezone correcto
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year:     'numeric',
      month:    '2-digit',
      day:      '2-digit',
    });
    return formatter.format(date); // "2026-06-11"
  } catch {
    // Fallback a UTC si el timezone es inválido
    return date.toISOString().split('T')[0];
  }
}

// ── "Hoy" según el timezone del usuario ──────────────────────────────────────
function getTodayInTimezone(timezone: string): string {
  return toLocalDay(new Date(), timezone);
}

// ── Diferencia en días entre dos strings "YYYY-MM-DD" ────────────────────────
function daysDiff(dayA: string, dayB: string): number {
  const a = new Date(dayA + 'T00:00:00Z');
  const b = new Date(dayB + 'T00:00:00Z');
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Timezones por defecto por país ────────────────────────────────────────────
const COUNTRY_TIMEZONES: Record<string, string> = {
  '🇨🇴': 'America/Bogota',
  '🇲🇽': 'America/Mexico_City',
  '🇦🇷': 'America/Argentina/Buenos_Aires',
  '🇧🇷': 'America/Sao_Paulo',
  '🇨🇱': 'America/Santiago',
  '🇵🇪': 'America/Lima',
  '🇻🇪': 'America/Caracas',
  '🇪🇨': 'America/Guayaquil',
  '🇺🇾': 'America/Montevideo',
  '🇵🇾': 'America/Asuncion',
  '🇧🇴': 'America/La_Paz',
  '🇺🇸': 'America/New_York',
  '🇪🇸': 'Europe/Madrid',
  '🇫🇷': 'Europe/Paris',
  '🇩🇪': 'Europe/Berlin',
};

// ── Trigger: se activa cuando cambia el documento de un usuario ───────────────
export const calculateStreak = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const before = event.data?.before.data();
    const after  = event.data?.after.data();

    if (!before || !after) return;

    // Solo procesar si totalPoints aumentó
    const pointsBefore: number = before.totalPoints ?? 0;
    const pointsAfter:  number = after.totalPoints  ?? 0;
    if (pointsAfter <= pointsBefore) return;

    const userId = event.params.userId;

    // ── Obtener timezone del usuario ──────────────────────────────────────────
    // Prioridad: timezone guardado > timezone por país > fallback Colombia
    const userTimezone: string =
      after.timezone ||
      COUNTRY_TIMEZONES[after.country] ||
      'America/Bogota';

    console.log(`Usuario ${userId}: timezone=${userTimezone}`);

    // ── Obtener predicciones correctas ordenadas por fecha ────────────────────
    const predictionsSnap = await db
      .collection('predictions')
      .where('userId', '==', userId)
      .where('status', 'in', ['correct_exact', 'correct_result', 'correct_draw'])
      .orderBy('calculatedAt', 'desc')
      .limit(100)
      .get();

    if (predictionsSnap.empty) {
      await db.collection('users').doc(userId).update({
        currentStreak: 0,
        maxStreak:     after.maxStreak ?? 0,
      });
      return;
    }

    // ── Obtener días únicos con predicciones correctas (en timezone del usuario)
    const correctDays: Set<string> = new Set();
    for (const doc of predictionsSnap.docs) {
      const data        = doc.data();
      const calculatedAt = data.calculatedAt?.toDate?.();
      if (calculatedAt) {
        // Convertir a día local del usuario, no UTC
        correctDays.add(toLocalDay(calculatedAt, userTimezone));
      }
    }

    // Ordenar días de más reciente a más antiguo
    const sortedDays = Array.from(correctDays).sort((a, b) => b.localeCompare(a));

    if (sortedDays.length === 0) {
      await db.collection('users').doc(userId).update({
        currentStreak: 0,
        maxStreak:     after.maxStreak ?? 0,
      });
      return;
    }

    // ── Calcular racha actual ─────────────────────────────────────────────────
    // La racha solo cuenta si el día más reciente es HOY o AYER (en timezone local)
    const today      = getTodayInTimezone(userTimezone);
    const mostRecent = sortedDays[0];
    const diffFromToday = daysDiff(today, mostRecent);

    console.log(`Usuario ${userId}: hoy=${today}, últimoAcierto=${mostRecent}, diff=${diffFromToday}`);

    // Si la última predicción correcta fue hace más de 1 día, racha = 0
    if (diffFromToday > 1) {
      const currentMaxStreak = after.maxStreak ?? 0;
      await db.collection('users').doc(userId).update({
        currentStreak:  0,
        maxStreak:      currentMaxStreak,
        lastStreakDate: mostRecent,
      });
      console.log(`Usuario ${userId}: racha rota (último acierto: ${mostRecent}, hoy: ${today})`);
      return;
    }

    // Contar días consecutivos hacia atrás
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const diff = daysDiff(sortedDays[i - 1], sortedDays[i]);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    // ── Actualizar maxStreak si se superó ─────────────────────────────────────
    const prevMax     = after.maxStreak ?? 0;
    const newMax      = Math.max(prevMax, streak);
    const isNewRecord = streak > prevMax;

    await db.collection('users').doc(userId).update({
      currentStreak:   streak,
      maxStreak:       newMax,
      lastStreakDate:  mostRecent,
      streakUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Usuario ${userId}: racha=${streak} | max=${newMax}${isNewRecord ? ' 🏆 NUEVO RECORD' : ''}`);

    // ── Notificación en hitos de racha con mensajes multiidioma ──────────────
    const STREAK_MILESTONES = [3, 5, 7, 10, 15, 20];
    if (STREAK_MILESTONES.includes(streak)) {
      const userDoc  = await db.collection('users').doc(userId).get();
      const fcmToken = userDoc.data()?.fcmToken;
      const userLang = userDoc.data()?.language ?? 'es';

      if (fcmToken) {
        const MESSAGES: Record<string, Record<number, { title: string; body: string }>> = {
          es: {
            3:  { title: '🔥 ¡Racha de 3!',       body: '3 días seguidos acertando. ¡Sigue así!' },
            5:  { title: '🔥 ¡Racha de 5!',       body: '5 días en racha. ¡Eres un crack!' },
            7:  { title: '⚡ ¡Semana perfecta!',   body: '7 días seguidos. ¡Leyenda en construcción!' },
            10: { title: '👑 ¡Racha de 10!',       body: '10 días. Vas camino al Golzair Elite.' },
            15: { title: '👑 ¡Racha de 15!',       body: '15 días seguidos. ¡Increíble!' },
            20: { title: '🏆 ¡Racha de 20!',       body: '20 días. Eres el mejor Golzair del torneo.' },
          },
          en: {
            3:  { title: '🔥 3-day streak!',       body: '3 days in a row! Keep it up!' },
            5:  { title: '🔥 5-day streak!',       body: '5 days in a row. You are on fire!' },
            7:  { title: '⚡ Perfect week!',        body: '7 days straight. Legend in the making!' },
            10: { title: '👑 10-day streak!',      body: '10 days. Almost Golzair Elite level.' },
            15: { title: '👑 15-day streak!',      body: '15 days in a row. Incredible!' },
            20: { title: '🏆 20-day streak!',      body: '20 days. You are the best Golzair!' },
          },
          pt: {
            3:  { title: '🔥 Sequência de 3!',     body: '3 dias seguidos! Continue assim!' },
            5:  { title: '🔥 Sequência de 5!',     body: '5 dias seguidos. Você é incrível!' },
            7:  { title: '⚡ Semana perfeita!',     body: '7 dias seguidos. Lenda em construção!' },
            10: { title: '👑 Sequência de 10!',    body: '10 dias. Quase Golzair Elite!' },
            15: { title: '👑 Sequência de 15!',    body: '15 dias seguidos. Incrível!' },
            20: { title: '🏆 Sequência de 20!',    body: '20 dias. Você é o melhor Golzair!' },
          },
          fr: {
            3:  { title: '🔥 Série de 3 jours!',   body: '3 jours de suite! Continue!' },
            5:  { title: '🔥 Série de 5 jours!',   body: '5 jours de suite. Tu es en feu!' },
            7:  { title: '⚡ Semaine parfaite!',    body: '7 jours de suite. Légende en construction!' },
            10: { title: '👑 Série de 10 jours!',  body: '10 jours. Presque Golzair Elite!' },
            15: { title: '👑 Série de 15 jours!',  body: '15 jours de suite. Incroyable!' },
            20: { title: '🏆 Série de 20 jours!',  body: '20 jours. Tu es le meilleur Golzair!' },
          },
        };

        const langMessages = MESSAGES[userLang] ?? MESSAGES.es;
        const msg = langMessages[streak];

        if (msg) {
          await admin.messaging().send({
            token:        fcmToken,
            notification: { title: msg.title, body: msg.body },
            data:         { type: 'streak_milestone', streak: String(streak) },
          });
          console.log(`Notificación racha enviada a ${userId}: ${streak} días (lang: ${userLang})`);
        }
      }
    }
  }
);