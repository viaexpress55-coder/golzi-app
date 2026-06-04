// functions/src/matches/syncMatchResults.ts
// Scheduled function: sincroniza resultados de football-data.org → Firestore
// Se ejecuta cada 5 minutos durante el Mundial

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineString } from 'firebase-functions/params';

const db = admin.firestore();
const FOOTBALL_API_KEY = defineString('FOOTBALL_API_KEY');
const WC2026_COMPETITION = 'WC'; // football-data.org competition code

export const syncMatchResults = onSchedule({
  schedule: 'every 5 minutes',
  timeZone: 'America/New_York',
  region: 'us-central1',
}, async () => {
  try {
    const apiKey = FOOTBALL_API_KEY.value();
    const url = `https://api.football-data.org/v4/competitions/${WC2026_COMPETITION}/matches?season=2026`;

    const response = await fetch(url, {
      headers: { 'X-Auth-Token': apiKey },
    });

    if (!response.ok) {
      console.error('API error:', response.status, await response.text());
      return;
    }

    const data: any = await response.json();
    const matches = data.matches || [];

    console.log(`Procesando ${matches.length} partidos de la API`);

    let updated = 0;
    const batch = db.batch();

    for (const match of matches) {
      // Buscar partido en Firestore por matchId o por equipos + fecha
      const homeTeam = match.homeTeam?.name || '';
      const awayTeam = match.awayTeam?.name || '';
      const status = match.status; // SCHEDULED, IN_PLAY, FINISHED, etc.
      const homeScore = match.score?.fullTime?.home ?? null;
      const awayScore = match.score?.fullTime?.away ?? null;
      const kickoff = match.utcDate ? new Date(match.utcDate) : null;

      // Buscar en Firestore por homeTeam + awayTeam
      const snap = await db.collection('matches')
        .where('homeTeam', '==', homeTeam)
        .where('awayTeam', '==', awayTeam)
        .limit(1)
        .get();

      if (snap.empty) {
        // Intentar búsqueda por nombres alternativos (abreviados)
        continue;
      }

      const matchDoc = snap.docs[0];
      const current = matchDoc.data();

      // Solo actualizar si hay cambios
      const newStatus = mapStatus(status);
      if (
        current.status === newStatus &&
        current.homeScore === homeScore &&
        current.awayScore === awayScore
      ) continue;

      const update: any = { status: newStatus };
      if (homeScore !== null) update.homeScore = homeScore;
      if (awayScore !== null) update.awayScore = awayScore;
      if (kickoff) update.kickoffTime = admin.firestore.Timestamp.fromDate(kickoff);

      batch.update(matchDoc.ref, update);
      updated++;
      console.log(`Actualizando: ${homeTeam} vs ${awayTeam} → ${newStatus} ${homeScore}-${awayScore}`);
    }

    await batch.commit();
    console.log(`✅ ${updated} partidos actualizados`);

  } catch (e) {
    console.error('Error syncMatchResults:', e);
  }
});

function mapStatus(apiStatus: string): string {
  switch (apiStatus) {
    case 'FINISHED': return 'finished';
    case 'IN_PLAY':
    case 'PAUSED':   return 'live';
    case 'SCHEDULED':
    case 'TIMED':    return 'scheduled';
    default:         return apiStatus.toLowerCase();
  }
}