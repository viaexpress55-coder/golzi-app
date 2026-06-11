// functions/src/matches/syncMatchResults.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineString } from 'firebase-functions/params';

const db = admin.firestore();
const FOOTBALL_API_KEY = defineString('FOOTBALL_API_KEY');
const WC2026_COMPETITION = 'WC';

const NAME_MAP: Record<string, string[]> = {
  'Mexico': ['México', 'Mexico'],
  'United States': ['USA', 'United States', 'Estados Unidos'],
  'South Korea': ['Korea Republic', 'Corea del Sur', 'South Korea'],
  'Ivory Coast': ["Côte d'Ivoire", 'Costa de Marfil', 'Ivory Coast'],
  'DR Congo': ['Congo DR', 'RD Congo'],
  'Türkiye': ['Turkey', 'Turquía', 'Türkiye'],
  'Bosnia and Herzegovina': ['Bosnia y Herz.', 'Bosnia and Herzegovina'],
  'Saudi Arabia': ['Arabia Saudita', 'Saudi Arabia'],
  'Czechia': ['Czech Republic', 'Chequia', 'Czechia'],
  'South Africa': ['Sudáfrica', 'Sud Africa', 'South Africa'],
  'Curaçao': ['Curazao', 'Curaçao'],
  'Colombia': ['Colombia'],
  'England': ['Inglaterra', 'England'],
  'France': ['Francia', 'France'],
  'Germany': ['Alemania', 'Germany'],
  'Spain': ['España', 'Spain'],
  'Portugal': ['Portugal'],
  'Japan': ['Japón', 'Japan'],
  'Argentina': ['Argentina'],
  'Brazil': ['Brasil', 'Brazil'],
  'Netherlands': ['Países Bajos', 'Netherlands', 'Holland'],
  'Uruguay': ['Uruguay'],
  'Australia': ['Australia'],
  'Croatia': ['Croacia', 'Croatia'],
  'Morocco': ['Marruecos', 'Morocco'],
  'Senegal': ['Senegal'],
  'Ghana': ['Ghana'],
  'Ecuador': ['Ecuador'],
  'Norway': ['Noruega', 'Norway'],
  'Belgium': ['Bélgica', 'Belgium'],
  'Sweden': ['Suecia', 'Sweden'],
  'Switzerland': ['Suiza', 'Switzerland'],
  'Austria': ['Austria'],
  'Algeria': ['Argelia', 'Algeria'],
  'Canada': ['Canadá', 'Canada'],
  'Tunisia': ['Túnez', 'Tunisia'],
  'Paraguay': ['Paraguay'],
  'Panama': ['Panamá', 'Panama'],
  'Iraq': ['Iraq'],
  'Jordan': ['Jordania', 'Jordan'],
  'Haiti': ['Haití', 'Haiti'],
  'Uzbekistan': ['Uzbekistán', 'Uzbekistan'],
};

function getNameVariants(name: string): string[] {
  for (const [key, variants] of Object.entries(NAME_MAP)) {
    if (key === name || variants.includes(name)) return [key, ...variants];
  }
  return [name];
}

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
      const homeTeam = match.homeTeam?.name || '';
      const awayTeam = match.awayTeam?.name || '';
      const status = match.status;
      const homeScore = match.score?.fullTime?.home ?? null;
      const awayScore = match.score?.fullTime?.away ?? null;
      const kickoff = match.utcDate ? new Date(match.utcDate) : null;

      // Buscar con nombre exacto primero
      let snap = await db.collection('matches')
        .where('homeTeam', '==', homeTeam)
        .where('awayTeam', '==', awayTeam)
        .limit(1)
        .get();

      // Si no encontró, buscar con variantes de nombre
      if (snap.empty) {
        const homeVariants = getNameVariants(homeTeam);
        const awayVariants = getNameVariants(awayTeam);
        for (const hv of homeVariants) {
          for (const av of awayVariants) {
            if (hv === homeTeam && av === awayTeam) continue;
            snap = await db.collection('matches')
              .where('homeTeam', '==', hv)
              .where('awayTeam', '==', av)
              .limit(1)
              .get();
            if (!snap.empty) break;
          }
          if (!snap.empty) break;
        }
      }

      if (snap.empty) {
        if (homeTeam || awayTeam) {
          console.log(`No encontrado: ${homeTeam} vs ${awayTeam}`);
        }
        continue;
      }

      const matchDoc = snap.docs[0];
      const current = matchDoc.data();
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
