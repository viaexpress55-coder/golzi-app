// functions/src/rankings/calculateRanking.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cloud Function schedulada que pre-calcula el ranking global cada 5 minutos
// Los clientes leen UN documento en lugar de hacer queries costosas
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';

const db = admin.firestore();

export const calculateRanking = onSchedule(
  {
    schedule:        'every 5 minutes',
    timeZone:        'America/Bogota',
    timeoutSeconds:  120,
    memory:          '512MiB',
  },
  async () => {
    console.log('📊 Calculando rankings pre-cacheados...');

    try {
      // ── Ranking global top 100 ──────────────────────────────────────────────
      const usersSnap = await db
        .collection('users')
        .orderBy('totalPoints', 'desc')
        .limit(100)
        .get();

      const globalRanking = usersSnap.docs.map((doc, idx) => {
        const data = doc.data();
        return {
          position:    idx + 1,
          userId:      doc.id,
          username:    data.username    ?? 'Golzair',
          country:     data.country     ?? '🌍',
          totalPoints: data.totalPoints ?? 0,
          plan:        data.plan        ?? 'free',
          currentStreak: data.currentStreak ?? 0,
          exactPredictions: data.exactPredictions ?? 0,
        };
      });

      // Escribir ranking global
      await db.collection('rankings').doc('global_top100').set({
        players:     globalRanking,
        updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
        totalPlayers: usersSnap.size,
      });

      console.log(`✅ Ranking global: ${globalRanking.length} jugadores`);

      // ── Rankings por país (top 50 de cada país) ────────────────────────────
      // Obtener países únicos del top 100
      const countries = [...new Set(globalRanking.map(p => p.country))];

      for (const country of countries.slice(0, 20)) { // máx 20 países para evitar timeout
        const countrySnap = await db
          .collection('users')
          .where('country', '==', country)
          .orderBy('totalPoints', 'desc')
          .limit(50)
          .get();

        const countryRanking = countrySnap.docs.map((doc, idx) => {
          const data = doc.data();
          return {
            position:    idx + 1,
            userId:      doc.id,
            username:    data.username    ?? 'Golzair',
            country:     data.country     ?? '🌍',
            totalPoints: data.totalPoints ?? 0,
            plan:        data.plan        ?? 'free',
            currentStreak: data.currentStreak ?? 0,
          };
        });

        // Crear key segura para el documento (eliminar emojis y caracteres especiales)
        const countryKey = country
          .replace(/[^\w]/g, '_')
          .replace(/_+/g, '_')
          .toLowerCase()
          .slice(0, 20) || 'unknown';

        await db.collection('rankings').doc(`country_${countryKey}_top50`).set({
          country,
          players:   countryRanking,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`✅ Rankings por país: ${countries.length} países procesados`);

      // ── Metadata del ranking ───────────────────────────────────────────────
      await db.collection('rankings').doc('metadata').set({
        lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
        totalPlayers:   usersSnap.size,
        topScore:       globalRanking[0]?.totalPoints ?? 0,
        topPlayer:      globalRanking[0]?.username ?? '—',
      });

      console.log('✅ Rankings pre-calculados correctamente');

    } catch (err) {
      console.error('❌ Error calculando rankings:', err);
    }
  }
);