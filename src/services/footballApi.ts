import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

const headers = {
  'X-Auth-Token': API_KEY || '',
};

// FIFA World Cup 2026 — Competition ID: 2000
const WC_2026_ID = 2000;

// Obtener partidos del Mundial en vivo o del día
export async function getLiveMatches() {
  try {
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?status=LIVE`,
      { headers }
    );
    const data = await response.json();
    return data.matches || [];
  } catch (e) {
    console.error('Error getLiveMatches:', e);
    return [];
  }
}

// Obtener partidos de hoy
export async function getTodayMatches() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?dateFrom=${today}&dateTo=${today}`,
      { headers }
    );
    const data = await response.json();
    return data.matches || [];
  } catch (e) {
    console.error('Error getTodayMatches:', e);
    return [];
  }
}

// Obtener próximos partidos
export async function getUpcomingMatches(limit = 10) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?status=SCHEDULED&dateFrom=${today}`,
      { headers }
    );
    const data = await response.json();
    return (data.matches || []).slice(0, limit);
  } catch (e) {
    console.error('Error getUpcomingMatches:', e);
    return [];
  }
}

// Obtener standings/tabla de grupos
export async function getGroupStandings() {
  try {
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/standings`,
      { headers }
    );
    const data = await response.json();
    return data.standings || [];
  } catch (e) {
    console.error('Error getGroupStandings:', e);
    return [];
  }
}

// Sincronizar resultados reales con Firestore
export async function syncMatchResults() {
  try {
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?status=FINISHED`,
      { headers }
    );
    const data = await response.json();
    const matches = data.matches || [];

    for (const match of matches) {
      const matchRef = doc(db, 'matches_live', `WC2026_LIVE_${match.id}`);
      await setDoc(matchRef, {
        apiId: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        status: match.status,
        utcDate: match.utcDate,
        updatedAt: new Date(),
      }, { merge: true });
    }

    console.log(`✅ ${matches.length} resultados sincronizados`);
    return matches;
  } catch (e) {
    console.error('Error syncMatchResults:', e);
    return [];
  }
}

// Formatear partido de la API al formato GOLZI
export function formatApiMatch(apiMatch: any) {
  return {
    id: `WC2026_LIVE_${apiMatch.id}`,
    homeTeam: apiMatch.homeTeam?.shortName || apiMatch.homeTeam?.name,
    awayTeam: apiMatch.awayTeam?.shortName || apiMatch.awayTeam?.name,
    homeFlag: getCountryFlag(apiMatch.homeTeam?.name),
    awayFlag: getCountryFlag(apiMatch.awayTeam?.name),
    homeScore: apiMatch.score?.fullTime?.home ?? null,
    awayScore: apiMatch.score?.fullTime?.away ?? null,
    status: apiMatch.status,
    kickoffTime: new Date(apiMatch.utcDate),
    group: apiMatch.group || 'GRUPO',
    stadium: apiMatch.venue || 'ESTADIO',
  };
}

// Mapeo de banderas por nombre de equipo
export function getCountryFlag(teamName: string): string {
  const flags: Record<string, string> = {
    'Mexico': '🇲🇽', 'México': '🇲🇽',
    'South Africa': '🇿🇦', 'Sudáfrica': '🇿🇦',
    'South Korea': '🇰🇷', 'Korea Republic': '🇰🇷',
    'Czechia': '🇨🇿', 'Czech Republic': '🇨🇿',
    'Canada': '🇨🇦', 'Canadá': '🇨🇦',
    'Bosnia and Herzegovina': '🇧🇦',
    'Qatar': '🇶🇦',
    'Switzerland': '🇨🇭', 'Suiza': '🇨🇭',
    'Brazil': '🇧🇷', 'Brasil': '🇧🇷',
    'Morocco': '🇲🇦', 'Marruecos': '🇲🇦',
    'Haiti': '🇭🇹', 'Haití': '🇭🇹',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'USA': '🇺🇸', 'United States': '🇺🇸',
    'Paraguay': '🇵🇾',
    'Australia': '🇦🇺',
    'Turkey': '🇹🇷', 'Türkiye': '🇹🇷',
    'Germany': '🇩🇪', 'Alemania': '🇩🇪',
    'Curaçao': '🇨🇼',
    "Ivory Coast": '🇨🇮', 'Costa de Marfil': '🇨🇮',
    'Ecuador': '🇪🇨',
    'Netherlands': '🇳🇱', 'Países Bajos': '🇳🇱',
    'Japan': '🇯🇵', 'Japón': '🇯🇵',
    'Tunisia': '🇹🇳', 'Túnez': '🇹🇳',
    'Sweden': '🇸🇪', 'Suecia': '🇸🇪',
    'Belgium': '🇧🇪', 'Bélgica': '🇧🇪',
    'Egypt': '🇪🇬', 'Egipto': '🇪🇬',
    'Iran': '🇮🇷',
    'New Zealand': '🇳🇿', 'Nueva Zelanda': '🇳🇿',
    'Spain': '🇪🇸', 'España': '🇪🇸',
    'Cape Verde': '🇨🇻', 'Cabo Verde': '🇨🇻',
    'Saudi Arabia': '🇸🇦', 'Arabia Saudita': '🇸🇦',
    'Uruguay': '🇺🇾',
    'France': '🇫🇷', 'Francia': '🇫🇷',
    'Senegal': '🇸🇳',
    'Norway': '🇳🇴', 'Noruega': '🇳🇴',
    'Iraq': '🇮🇶',
    'Argentina': '🇦🇷',
    'Algeria': '🇩🇿', 'Argelia': '🇩🇿',
    'Austria': '🇦🇹',
    'Jordan': '🇯🇴', 'Jordania': '🇯🇴',
    'Portugal': '🇵🇹',
    'DR Congo': '🇨🇩', 'Congo DR': '🇨🇩',
    'Uzbekistan': '🇺🇿', 'Uzbekistán': '🇺🇿',
    'Colombia': '🇨🇴',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Croatia': '🇭🇷', 'Croacia': '🇭🇷',
    'Ghana': '🇬🇭',
    'Panama': '🇵🇦', 'Panamá': '🇵🇦',
  };
  return flags[teamName] || '🌍';
}