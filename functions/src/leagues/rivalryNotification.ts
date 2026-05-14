// functions/src/leagues/rivalryNotification.ts
// ─────────────────────────────────────────────────────────────────────────────
// Se dispara cuando totalPoints de un usuario aumenta.
// Detecta si subió posiciones en alguna liga y notifica a los superados.
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db        = admin.firestore();
const messaging = admin.messaging();

export const rivalryNotification = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const before = event.data?.before.data();
    const after  = event.data?.after.data();

    if (!before || !after) return;

    // Solo procesar si totalPoints aumentó
    const pointsBefore: number = before.totalPoints ?? 0;
    const pointsAfter:  number = after.totalPoints  ?? 0;
    if (pointsAfter <= pointsBefore) return;

    const userId   = event.params.userId;
    const username = after.username ?? 'Un Golzair';

    // ── Buscar todas las ligas donde está este usuario ────────────────────────
    const leagueMembersSnap = await db
      .collection('league_members')
      .where('userId', '==', userId)
      .get();

    if (leagueMembersSnap.empty) {
      console.log(`Usuario ${userId} no tiene ligas — sin notificaciones de rivalidad`);
      return;
    }

    const leagueIds = leagueMembersSnap.docs.map(d => d.data().leagueId);
    console.log(`Usuario ${userId} está en ${leagueIds.length} liga(s)`);

    // ── Procesar cada liga ────────────────────────────────────────────────────
    for (const leagueId of leagueIds) {

      // Obtener todos los miembros de la liga con sus puntos
      const membersSnap = await db
        .collection('league_members')
        .where('leagueId', '==', leagueId)
        .orderBy('totalPoints', 'desc')
        .get();

      if (membersSnap.empty) continue;

      // Construir ranking actual
      const ranking = membersSnap.docs.map((d, idx) => ({
        userId:      d.data().userId,
        username:    d.data().username ?? 'Golzair',
        totalPoints: d.data().totalPoints ?? 0,
        position:    idx + 1,
      }));

      // Posición actual del usuario que ganó puntos
      const myPosition = ranking.findIndex(r => r.userId === userId);
      if (myPosition === -1) continue;

      // Calcular posición anterior (con puntos anteriores)
      const rankingBefore = [...ranking]
        .map(r => r.userId === userId ? { ...r, totalPoints: pointsBefore } : r)
        .sort((a, b) => b.totalPoints - a.totalPoints);

      const myPositionBefore = rankingBefore.findIndex(r => r.userId === userId);

      // Si no subió posiciones, no hay nada que notificar
      if (myPosition >= myPositionBefore) continue;

      console.log(`Liga ${leagueId}: ${username} subió de #${myPositionBefore + 1} a #${myPosition + 1}`);

      // ── Notificar a los usuarios que fueron superados ─────────────────────
      // Son los que estaban ANTES de mi posición anterior y ahora están después
      const superados = ranking.filter((r, idx) =>
        idx > myPosition &&           // ahora están por debajo de mí
        idx <= myPositionBefore &&    // antes estaban por encima o igual
        r.userId !== userId
      );

      // Obtener nombre de la liga
      const leagueDoc = await db.collection('leagues').doc(leagueId).get();
      const leagueName = leagueDoc.data()?.name ?? 'tu liga';

      for (const superado of superados) {
        // Evitar spam — verificar si ya se notificó en las últimas 2 horas
        const cooldownKey = `rivalry_${leagueId}_${userId}_${superado.userId}`;
        const cooldownDoc = await db.collection('notification_cooldowns').doc(cooldownKey).get();

        if (cooldownDoc.exists) {
          const lastSent = cooldownDoc.data()?.sentAt?.toDate?.();
          if (lastSent) {
            const hoursAgo = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
            if (hoursAgo < 2) {
              console.log(`Cooldown activo para ${superado.userId} — saltando`);
              continue;
            }
          }
        }

        // Obtener FCM token del superado
        const superadoDoc = await db.collection('users').doc(superado.userId).get();
        const fcmToken = superadoDoc.data()?.fcmToken;

        if (!fcmToken) continue;

        // Calcular diferencia de puntos
        const myPoints    = pointsAfter;
        const theirPoints = superado.totalPoints;
        const diff        = myPoints - theirPoints;

        // Mensaje de rivalidad
        const messages = [
          {
            title: `⚡ ¡${username} te superó!`,
            body:  `Está ${diff} punto${diff === 1 ? '' : 's'} por encima en "${leagueName}". ¡Reacciona!`,
          },
          {
            title: `🔥 ¡Te alcanzaron en "${leagueName}"!`,
            body:  `${username} acaba de superarte. ¿Vas a dejar que se aleje?`,
          },
          {
            title: `😤 ¡${username} te pasó por encima!`,
            body:  `Ahora es #${myPosition + 1} en "${leagueName}". Tú eres #${superado.position}.`,
          },
        ];

        // Rotar mensajes para no ser repetitivo
        const msgIndex = Math.floor(Math.random() * messages.length);
        const msg = messages[msgIndex];

        try {
          await messaging.send({
            token: fcmToken,
            notification: { title: msg.title, body: msg.body },
            data: {
              type:     'rivalry',
              leagueId: leagueId,
              rivalId:  userId,
              screen:   'Ranking',
            },
            android: {
              priority: 'high',
              notification: { channelId: 'golzi_rivalry' },
            },
            apns: {
              payload: { aps: { sound: 'default', badge: 1 } },
            },
          });

          // Registrar cooldown
          await db.collection('notification_cooldowns').doc(cooldownKey).set({
            sentAt:   admin.firestore.FieldValue.serverTimestamp(),
            leagueId, fromUserId: userId, toUserId: superado.userId,
          });

          console.log(`Rivalidad notificada: ${username} superó a ${superado.username} en ${leagueName}`);

        } catch (err) {
          console.error(`Error enviando notificación a ${superado.userId}:`, err);
        }
      }

      // ── Notificar al usuario que subió (si llegó al Top 3) ────────────────
      const newPosition = myPosition + 1;
      if (newPosition <= 3 && myPositionBefore + 1 > 3) {
        const myFcmToken = after.fcmToken;
        if (myFcmToken) {
          const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
          await messaging.send({
            token: myFcmToken,
            notification: {
              title: `${medals[newPosition]} ¡Entraste al Top ${newPosition}!`,
              body:  `Eres #${newPosition} en "${leagueName}". ¡Sigue así!`,
            },
            data: { type: 'top3_entry', leagueId, position: String(newPosition) },
          });
          console.log(`Top 3 notificado a ${userId}: posición ${newPosition} en ${leagueName}`);
        }
      }
    }
  }
);