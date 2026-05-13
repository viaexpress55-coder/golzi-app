import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const API_KEY = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

const headers = {
  'X-Auth-Token': API_KEY || '',
};

const WC_2026_ID = 2000;

export async function getLiveMatches() {
  try {
    const response = await fetch(`${BASE_URL}/competitions/${WC_2026_ID}/matches?status=LIVE`, { headers });
    const data = await response.json();
    return data.matches || [];
  } catch (e) { return []; }
}

export async function getTodayMatches() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/competitions/${WC_2026_ID}/matches?dateFrom=${today}&dateTo=${today}`, { headers });
    const data = await response.json();
    return data.matches || [];
  } catch (e) { return []; }
}

export async function getUpcomingMatches(limit = 10) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/competitions/${WC_2026_ID}/matches?status=SCHEDULED&dateFrom=${today}`, { headers });
    const data = await response.json();
    return (data.matches || []).slice(0, limit);
  } catch (e) { return []; }
}

export async function getGroupStandings() {
  try {
    const response = await fetch(`${BASE_URL}/competitions/${WC_2026_ID}/standings`, { headers });
    const data = await response.json();
    return data.standings || [];
  } catch (e) { return []; }
}

export async function syncMatchResults() {
  try {
    const response = await fetch(`${BASE_URL}/competitions/${WC_2026_ID}/matches?status=FINISHED`, { headers });
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
    return matches;
  } catch (e) { return []; }
}

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
    'Ivory Coast': '🇨🇮', 'Costa de Marfil': '🇨🇮',
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

let syncInterval: any = null;

export function startAutoSync() {
  if (syncInterval) return;
  syncInterval = setInterval(() => {}, 2 * 60 * 1000);
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}