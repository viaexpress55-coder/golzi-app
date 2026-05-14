// functions/src/streaks/calculateStreak.ts
// ─────────────────────────────────────────────────────────────────────────────
// Calcula la racha real de días consecutivos con predicciones correctas
// Se dispara cada vez que se actualiza totalPoints de un usuario
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();

// Normaliza una fecha a medianoche UTC (para comparar solo días)
function toUTCDay(date: Date): string {
  return date.toISOString().split('T')[0]; // "2026-06-11"
}

// Devuelve la diferencia en días entre dos fechas (solo día, sin hora)
function daysDiff(dateA: Date, dateB: Date): number {
  const a = new Date(toUTCDay(dateA));
  const b = new Date(toUTCDay(dateB));
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Trigger: se activa cuando cambia el documento de un usuario ──────────────
export const calculateStreak = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const before = event.data?.before.data();
    const after  = event.data?.after.data();

    if (!before || !after) return;

    // Solo procesar si totalPoints aumentó (significa que ganó puntos hoy)
    const pointsBefore: number = before.totalPoints ?? 0;
    const pointsAfter:  number = after.totalPoints  ?? 0;
    if (pointsAfter <= pointsBefore) return;

    const userId = event.params.userId;

    // ── Obtener predicciones correctas del usuario ordenadas por fecha ────────
    const predictionsSnap = await db
      .collection('predictions')
      .where('userId', '==', userId)
      .where('status', 'in', ['correct_exact', 'correct_result', 'correct_draw'])
      .orderBy('calculatedAt', 'desc')
      .limit(100) // suficiente para calcular racha
      .get();

    if (predictionsSnap.empty) {
      await db.collection('users').doc(userId).update({
        currentStreak: 0,
        maxStreak: after.maxStreak ?? 0,
      });
      return;
    }

    // ── Obtener días únicos con predicciones correctas ────────────────────────
    const correctDays: Set<string> = new Set();
    for (const doc of predictionsSnap.docs) {
      const data = doc.data();
      const calculatedAt = data.calculatedAt?.toDate?.();
      if (calculatedAt) {
        correctDays.add(toUTCDay(calculatedAt));
      }
    }

    // Ordenar días de más reciente a más antiguo
    const sortedDays = Array.from(correctDays).sort((a, b) =>
      b.localeCompare(a)
    );

    if (sortedDays.length === 0) {
      await db.collection('users').doc(userId).update({
        currentStreak: 0,
        maxStreak: after.maxStreak ?? 0,
      });
      return;
    }

    // ── Calcular racha actual ─────────────────────────────────────────────────
    // La racha solo cuenta si el día más reciente es HOY o AYER
    // (si fue hace 2+ días, la racha se rompió)
    const today     = toUTCDay(new Date());
    const mostRecent = sortedDays[0];
    const diffFromToday = daysDiff(new Date(today), new Date(mostRecent));

    // Si la última predicción correcta fue hace más de 1 día, racha = 0
    if (diffFromToday > 1) {
      const currentMaxStreak = after.maxStreak ?? 0;
      await db.collection('users').doc(userId).update({
        currentStreak: 0,
        maxStreak: currentMaxStreak,
        lastStreakDate: mostRecent,
      });
      console.log(`Usuario ${userId}: racha rota (último acierto: ${mostRecent})`);
      return;
    }

    // Contar días consecutivos hacia atrás
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const diff = daysDiff(
        new Date(sortedDays[i - 1]),
        new Date(sortedDays[i])
      );
      if (diff === 1) {
        streak++;
      } else {
        break; // se rompió la consecutividad
      }
    }

    // ── Actualizar maxStreak si se superó ─────────────────────────────────────
    const prevMax    = after.maxStreak ?? 0;
    const newMax     = Math.max(prevMax, streak);
    const isNewRecord = streak > prevMax;

    await db.collection('users').doc(userId).update({
      currentStreak:  streak,
      maxStreak:      newMax,
      lastStreakDate: mostRecent,
      streakUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(
      `Usuario ${userId}: racha=${streak} | max=${newMax}${isNewRecord ? ' 🏆 NUEVO RECORD' : ''}`
    );

    // ── Notificación si alcanza hitos de racha ────────────────────────────────
    const STREAK_MILESTONES = [3, 5, 7, 10, 15, 20];
    if (STREAK_MILESTONES.includes(streak)) {
      const userDoc = await db.collection('users').doc(userId).get();
      const fcmToken = userDoc.data()?.fcmToken;

      if (fcmToken) {
        const messages: Record<number, { title: string; body: string }> = {
          3:  { title: '🔥 ¡Racha de 3!',  body: '3 días seguidos acertando. ¡Sigue así Golzair!' },
          5:  { title: '🔥 ¡Racha de 5!',  body: '5 días en racha. ¡Eres un crack!' },
          7:  { title: '⚡ ¡Semana perfecta!', body: '7 días seguidos. ¡Leyenda en construcción!' },
          10: { title: '👑 ¡Racha de 10!', body: '10 días. Vas camino al Golzair Elite.' },
          15: { title: '👑 ¡Racha de 15!', body: '15 días seguidos. ¡Increíble!' },
          20: { title: '🏆 ¡Racha de 20!', body: '20 días. Eres el mejor Golzair del torneo.' },
        };

        const msg = messages[streak];
        if (msg) {
          await admin.messaging().send({
            token: fcmToken,
            notification: { title: msg.title, body: msg.body },
            data: { type: 'streak_milestone', streak: String(streak) },
          });
          console.log(`Notificación de racha enviada a ${userId}: ${streak} días`);
        }
      }
    }
  }
);