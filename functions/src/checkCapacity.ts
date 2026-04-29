// functions/src/leagues/checkCapacity.ts
// Alerta automática al 70% y 90% del cupo de cada liga

import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db = admin.firestore();
const messaging = admin.messaging();

export const onLeagueMemberAdded = onDocumentUpdated(
  'leagues/{leagueId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // Solo si cambió la cantidad de miembros
    if (before.membersCount === after.membersCount) return;

    const { membersCount, maxMembers, creatorId, name } = after;
    const fillPercent = (membersCount / maxMembers) * 100;

    // Obtener FCM token del creador
    const creatorDoc = await db.collection('users').doc(creatorId).get();
    const fcmToken = creatorDoc.data()?.fcmToken;
    if (!fcmToken) return;

    let notification = null;

    // Alerta 70% — solo una vez
    if (fillPercent >= 70 && fillPercent < 90 && !after.capacityAlert70Sent) {
      notification = {
        title: `⚠️ Liga "${name}" al 70%`,
        body: `${membersCount}/${maxMembers} miembros. ¡Comparte el QR antes de que se llene!`,
      };
      await db.collection('leagues').doc(event.params.leagueId).update({
        capacityAlert70Sent: true,
      });
    }

    // Alerta 90% — solo una vez
    if (fillPercent >= 90 && !after.capacityAlert90Sent) {
      notification = {
        title: `🔴 Liga "${name}" al 90%`,
        body: `${membersCount}/${maxMembers} miembros. Solo quedan ${maxMembers - membersCount} lugares.`,
      };
      await db.collection('leagues').doc(event.params.leagueId).update({
        capacityAlert90Sent: true,
      });
    }

    if (notification) {
      await messaging.send({
        token: fcmToken,
        notification,
        data: {
          type: 'league_capacity',
          leagueId: event.params.leagueId,
        },
      });
    }
  }
);
