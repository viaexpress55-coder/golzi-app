// functions/src/matches/syncMatchStats.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';

const db = admin.firestore();
const API_FOOTBALL_KEY = defineSecret('API_FOOTBALL_KEY');

export const syncMatchStats = onSchedule({
  schedule: 'every 5 minutes',
  timeZone: 'America/New_York',
  region: 'us-central1',
  secrets: [API_FOOTBALL_KEY],
}, async () => {
  try {
    const apiKey = API_FOOTBALL_KEY.value();

    // Solo partidos en vivo con fixtureId
    const liveSnap = await db.collection('matches')
      .where('status', '==', 'live')
      .get();

    if (liveSnap.empty) {
      console.log('No hay partidos en vivo');
      return;
    }

    for (const matchDoc of liveSnap.docs) {
      const match = matchDoc.data();
      const fixtureId = match.fixtureId;
      if (!fixtureId) { console.log('Sin fixtureId: ' + matchDoc.id); continue; }

      // Estadísticas
      const statsRes = await fetch(
        'https://v3.football.api-sports.io/fixtures/statistics?fixture=' + fixtureId,
        { headers: { 'x-apisports-key': apiKey } }
      );
      const statsData: any = await statsRes.json();
      const statsArr = statsData.response || [];

      // Eventos
      const eventsRes = await fetch(
        'https://v3.football.api-sports.io/fixtures/events?fixture=' + fixtureId,
        { headers: { 'x-apisports-key': apiKey } }
      );
      const eventsData: any = await eventsRes.json();
      const eventsArr = eventsData.response || [];

      const upd: any = {};

      // Procesar estadísticas
      if (statsArr.length >= 2) {
        const home = statsArr[0]?.statistics || [];
        const away = statsArr[1]?.statistics || [];
        const getStat = (arr: any[], type: string) => {
          const s = arr.find((s: any) => s.type === type);
          return s?.value ?? 0;
        };
        upd.stats = {
          home: {
            possession:  parseInt(getStat(home, 'Ball Possession')) || 50,
            shots:       getStat(home, 'Shots on Goal') || 0,
            fouls:       getStat(home, 'Fouls') || 0,
            yellowCards: getStat(home, 'Yellow Cards') || 0,
            corners:     getStat(home, 'Corner Kicks') || 0,
          },
          away: {
            possession:  parseInt(getStat(away, 'Ball Possession')) || 50,
            shots:       getStat(away, 'Shots on Goal') || 0,
            fouls:       getStat(away, 'Fouls') || 0,
            yellowCards: getStat(away, 'Yellow Cards') || 0,
            corners:     getStat(away, 'Corner Kicks') || 0,
          },
        };
      }

      // Procesar eventos
      if (eventsArr.length > 0) {
        upd.events = eventsArr.slice(0, 20).map((e: any) => ({
          minute: e.time?.elapsed || 0,
          type:   e.type === 'Goal' ? 'GOAL' :
                  e.detail === 'Yellow Card' ? 'YELLOW_CARD' :
                  e.detail === 'Red Card' ? 'RED_CARD' :
                  e.type === 'subst' ? 'SUBSTITUTION' :
                  e.type === 'Var' ? 'VAR' : 'OTHER',
          player: e.player?.name || '',
          detail: e.detail || '',
          team:   e.team?.name || '',
        }));
      }

      if (Object.keys(upd).length > 0) {
        await matchDoc.ref.update(upd);
        console.log('Stats/events actualizados: ' + matchDoc.id);
      }
    }

    console.log('✅ syncMatchStats completado');
  } catch (e) {
    console.error('Error syncMatchStats:', e);
  }
});