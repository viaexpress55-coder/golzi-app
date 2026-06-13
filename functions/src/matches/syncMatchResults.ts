// functions/src/matches/syncMatchResults.ts
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';

const db = admin.firestore();
const API_FOOTBALL_KEY = defineSecret('API_FOOTBALL_KEY');

const NAME_MAP: Record<string, string[]> = {
  'Mexico':         ['México', 'Mexico'],
  'South Africa':   ['Sudáfrica', 'Sud Africa', 'South Africa'],
  'United States':  ['USA', 'Estados Unidos', 'United States'],
  'South Korea':    ['Korea Republic', 'Corea del Sur', 'South Korea'],
  'Ivory Coast':    ["Côte d'Ivoire", 'Costa de Marfil', 'Ivory Coast'],
  'DR Congo':       ['Congo DR', 'RD Congo'],
  'Turkiye':        ['Turkey', 'Turquía', 'Türkiye', 'Turkiye'],
  'Bosnia':         ['Bosnia y Herz.', 'Bosnia and Herzegovina', 'Bosnia-Herzegovina', 'Bosnia y Herzegovina', 'Bosnia & Herzegovina'],
  'Saudi Arabia':   ['Arabia Saudita', 'Saudi Arabia'],
  'Czech Republic': ['Chequia', 'Czechia', 'Czech Republic'],
  'Curacao':        ['Curazao', 'Curaçao', 'Curacao'],
  'Colombia':       ['Colombia'], 'England': ['Inglaterra', 'England'],
  'France':         ['Francia', 'France'], 'Germany': ['Alemania', 'Germany'],
  'Spain':          ['España', 'Spain'], 'Portugal': ['Portugal'],
  'Japan':          ['Japón', 'Japan'], 'Argentina': ['Argentina'],
  'Brazil':         ['Brasil', 'Brazil'], 'Netherlands': ['Países Bajos', 'Netherlands', 'Holland'],
  'Uruguay':        ['Uruguay'], 'Australia': ['Australia'],
  'Croatia':        ['Croacia', 'Croatia'], 'Morocco': ['Marruecos', 'Morocco'],
  'Senegal':        ['Senegal'], 'Ghana': ['Ghana'], 'Ecuador': ['Ecuador'],
  'Norway':         ['Noruega', 'Norway'], 'Belgium': ['Bélgica', 'Belgium'],
  'Sweden':         ['Suecia', 'Sweden'], 'Switzerland': ['Suiza', 'Switzerland'],
  'Austria':        ['Austria'], 'Algeria': ['Argelia', 'Algeria'],
  'Canada':         ['Canadá', 'Canada'], 'Tunisia': ['Túnez', 'Tunisia'],
  'Paraguay':       ['Paraguay'], 'Panama': ['Panamá', 'Panama'],
  'Iraq':           ['Iraq'], 'Jordan': ['Jordania', 'Jordan'],
  'Haiti':          ['Haití', 'Haiti'], 'Uzbekistan': ['Uzbekistán', 'Uzbekistan'],
  'Cape Verde':     ['Cabo Verde', 'Cape Verde Islands'],
  'New Zealand':    ['Nueva Zelanda', 'New Zealand'],
  'Egypt':          ['Egipto', 'Egypt'], 'Iran': ['Irán', 'Iran'],
  'Scotland':       ['Escocia', 'Scotland'], 'Qatar': ['Qatar'],
};

function findVariants(apiName: string): string[] {
  for (const [key, variants] of Object.entries(NAME_MAP)) {
    if (key === apiName || variants.includes(apiName)) return [key, ...variants];
  }
  return [apiName];
}

function mapStatus(s: string): string {
  switch (s) {
    case 'FT': case 'AET': case 'PEN': return 'finished';
    case '1H': case '2H': case 'ET': case 'BT': case 'P': case 'LIVE': case 'HT': return 'live';
    case 'NS': case 'TBD': return 'scheduled';
    default: return 'scheduled';
  }
}

export const syncMatchResults = onSchedule({
  schedule: 'every 5 minutes',
  timeZone: 'America/New_York',
  region: 'us-central1',
  secrets: [API_FOOTBALL_KEY],
}, async () => {
  try {
    const apiKey = API_FOOTBALL_KEY.value();
    const url = 'https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=2026-06-11&to=2026-07-19';
    const response = await fetch(url, { headers: { 'x-apisports-key': apiKey } });
    if (!response.ok) { console.error('API error:', response.status); return; }
    const data: any = await response.json();
    if (data.errors && Object.keys(data.errors).length > 0) { console.error('API errors:', JSON.stringify(data.errors)); return; }
    const fixtures = data.response || [];
    console.log('Procesando ' + fixtures.length + ' partidos');
    let updated = 0;
    const batch = db.batch();
    for (const fixture of fixtures) {
      const homeApi   = fixture.teams?.home?.name || '';
      const awayApi   = fixture.teams?.away?.name || '';
      const status    = fixture.fixture?.status?.short || 'NS';
      const minute    = fixture.fixture?.status?.elapsed ?? null;
      const homeGoal  = fixture.goals?.home ?? null;
      const awayGoal  = fixture.goals?.away ?? null;
      const kickoff   = fixture.fixture?.date ? new Date(fixture.fixture.date) : null;
      const fixtureId = fixture.fixture?.id ?? null;
      const newStatus = mapStatus(status);
      const homeV = findVariants(homeApi);
      const awayV = findVariants(awayApi);
      let snap: any = { empty: true };
      outer: for (const hv of homeV) {
        for (const av of awayV) {
          snap = await db.collection('matches').where('homeTeam','==',hv).where('awayTeam','==',av).limit(1).get();
          if (!snap.empty) break outer;
          // Buscar también con equipos invertidos
          snap = await db.collection('matches').where('homeTeam','==',av).where('awayTeam','==',hv).limit(1).get();
          if (!snap.empty) break outer;
        }
      }
      if (snap.empty) { console.log('No encontrado: ' + homeApi + ' vs ' + awayApi); continue; }
      const doc = snap.docs[0];
      const cur = doc.data();
      if (cur.manualOverride === true) continue;
      if (cur.status === newStatus && cur.homeScore === homeGoal && cur.awayScore === awayGoal && cur.minute === minute) continue;
      const upd: any = { status: newStatus };
      if (homeGoal  !== null) upd.homeScore  = homeGoal;
      if (awayGoal  !== null) upd.awayScore  = awayGoal;
      if (minute    !== null) upd.minute     = minute;
      if (fixtureId !== null) upd.fixtureId  = fixtureId;
      if (kickoff) upd.kickoffTime = admin.firestore.Timestamp.fromDate(kickoff);
      batch.update(doc.ref, upd);
      updated++;
      console.log('Actualizando: ' + homeApi + ' vs ' + awayApi + ' -> ' + newStatus + ' ' + homeGoal + '-' + awayGoal + ' min:' + minute);
    }
    await batch.commit();
    console.log('✅ ' + updated + ' partidos actualizados');
  } catch (e) { console.error('Error syncMatchResults:', e); }
});