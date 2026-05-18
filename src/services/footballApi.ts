import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY  = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';
const headers  = { 'X-Auth-Token': API_KEY || '' };
const WC_2026_ID = 2000;

// ─── Caché ────────────────────────────────────────────────────────────────────
const CACHE_KEY_UPCOMING = 'golzi_cache_upcoming';
const CACHE_KEY_LIVE     = 'golzi_cache_live';
const CACHE_TTL_UPCOMING = 10 * 60 * 1000;  // 10 minutos para partidos próximos
const CACHE_TTL_LIVE     = 60 * 1000;        // 1 minuto para partidos en vivo

interface CacheEntry {
  data: any[];
  timestamp: number;
}

async function getCache(key: string, ttl: number): Promise<any[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > ttl) return null; // expirado
    return entry.data;
  } catch {
    return null;
  }
}

async function setCache(key: string, data: any[]): Promise<void> {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

// ─── API calls con caché ──────────────────────────────────────────────────────

export async function getLiveMatches(): Promise<any[]> {
  // Partidos en vivo: caché de 1 minuto
  const cached = await getCache(CACHE_KEY_LIVE, CACHE_TTL_LIVE);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?status=LIVE`,
      { headers }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const matches = data.matches || [];
    await setCache(CACHE_KEY_LIVE, matches);
    return matches;
  } catch {
    return [];
  }
}

export async function getTodayMatches(): Promise<any[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?dateFrom=${today}&dateTo=${today}`,
      { headers }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.matches || [];
  } catch {
    return [];
  }
}

export async function getUpcomingMatches(limit = 10): Promise<any[]> {
  // Partidos próximos: caché de 10 minutos
  const cached = await getCache(CACHE_KEY_UPCOMING, CACHE_TTL_UPCOMING);
  if (cached) return cached.slice(0, limit);

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?status=SCHEDULED&dateFrom=${today}`,
      { headers }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const matches = data.matches || [];
    await setCache(CACHE_KEY_UPCOMING, matches);
    return matches.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getGroupStandings(): Promise<any[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/standings`,
      { headers }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.standings || [];
  } catch {
    return [];
  }
}

export async function syncMatchResults(): Promise<any[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/competitions/${WC_2026_ID}/matches?status=FINISHED`,
      { headers }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const matches = data.matches || [];

    for (const match of matches) {
      const matchRef = doc(db, 'matches_live', `WC2026_LIVE_${match.id}`);
      await setDoc(matchRef, {
        apiId:     match.id,
        homeTeam:  match.homeTeam.name,
        awayTeam:  match.awayTeam.name,
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        status:    match.status,
        utcDate:   match.utcDate,
        updatedAt: new Date(),
      }, { merge: true });
    }

    // Invalidar caché cuando hay resultados nuevos
    await clearCache(CACHE_KEY_UPCOMING);
    await clearCache(CACHE_KEY_LIVE);

    return matches;
  } catch {
    return [];
  }
}

// ─── Forzar refresh (pull-to-refresh) ────────────────────────────────────────
export async function refreshMatches(): Promise<void> {
  await clearCache(CACHE_KEY_UPCOMING);
  await clearCache(CACHE_KEY_LIVE);
}

// ─── Formatear partido de API → formato GOLZI ────────────────────────────────
export function formatApiMatch(apiMatch: any) {
  return {
    id:          `WC2026_LIVE_${apiMatch.id}`,
    homeTeam:    apiMatch.homeTeam?.shortName || apiMatch.homeTeam?.name,
    awayTeam:    apiMatch.awayTeam?.shortName || apiMatch.awayTeam?.name,
    homeFlag:    getCountryFlag(apiMatch.homeTeam?.name),
    awayFlag:    getCountryFlag(apiMatch.awayTeam?.name),
    homeScore:   apiMatch.score?.fullTime?.home ?? null,
    awayScore:   apiMatch.score?.fullTime?.away ?? null,
    status:      apiMatch.status,
    kickoffTime: new Date(apiMatch.utcDate),
    group:       apiMatch.group || 'GRUPO',
    stadium:     apiMatch.venue || 'ESTADIO',
  };
}

export function getCountryFlag(teamName: string): string {
  const flags: Record<string, string> = {
    'Mexico': '🇲🇽', 'México': '🇲🇽',
    'South Africa': '🇿🇦', 'Sudáfrica': '🇿🇦',
    'South Korea': '🇰🇷', 'Korea Republic': '🇰🇷', 'Corea del Sur': '🇰🇷',
    'Czechia': '🇨🇿', 'Czech Republic': '🇨🇿', 'Chequia': '🇨🇿',
    'Canada': '🇨🇦', 'Canadá': '🇨🇦',
    'Bosnia and Herzegovina': '🇧🇦', 'Bosnia y Herz.': '🇧🇦',
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

// ─── Auto sync ────────────────────────────────────────────────────────────────
let syncInterval: any = null;

export async function getMatchDetails(matchId: number): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/matches/${matchId}`,
      { headers }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      minute:  data.minute ?? null,
      status:  data.status,
      homeScore: data.score?.fullTime?.home ?? data.score?.halfTime?.home ?? null,
      awayScore: data.score?.fullTime?.away ?? data.score?.halfTime?.away ?? null,
      events: (data.goals || []).map((g: any) => ({
        minute: g.minute,
        type:   'GOAL',
        player: g.scorer?.name ?? 'Desconocido',
        detail: g.assist ? `Asistencia: ${g.assist.name}` : '',
        team:   g.team?.name,
      })).concat(
        (data.bookings || []).map((b: any) => ({
          minute: b.minute,
          type:   b.card === 'RED_CARD' ? 'RED_CARD' : 'YELLOW_CARD',
          player: b.player?.name ?? 'Desconocido',
          detail: b.card,
        }))
      ).concat(
        (data.substitutions || []).map((s: any) => ({
          minute:  s.minute,
          type:    'SUBSTITUTION',
          player:  s.playerIn?.name ?? 'Desconocido',
          detail:  `Entra por ${s.playerOut?.name ?? ''}`,
        }))
      ).sort((a: any, b: any) => a.minute - b.minute),
      stats: data.statistics ? {
        home: {
          possession:    data.statistics[0]?.ballPossession ?? 50,
          shots:         data.statistics[0]?.totalShots ?? 0,
          fouls:         data.statistics[0]?.fouls ?? 0,
          yellowCards:   data.statistics[0]?.yellowCards ?? 0,
          corners:       data.statistics[0]?.cornerKicks ?? 0,
        },
        away: {
          possession:    data.statistics[1]?.ballPossession ?? 50,
          shots:         data.statistics[1]?.totalShots ?? 0,
          fouls:         data.statistics[1]?.fouls ?? 0,
          yellowCards:   data.statistics[1]?.yellowCards ?? 0,
          corners:       data.statistics[1]?.cornerKicks ?? 0,
        },
      } : null,
    };
  } catch {
    return null;
  }
}

export function startAutoSync() {
  if (syncInterval) return;
  syncInterval = setInterval(async () => {
    try {
      const liveMatches = await getLiveMatches();
      for (const match of liveMatches) {
        const details = await getMatchDetails(match.id);
        if (details) {
          const matchRef = doc(db, 'live_matches', `WC2026_LIVE_${match.id}`);
          await setDoc(matchRef, {
            ...formatApiMatch(match),
            minute:  details.minute,
            events:  details.events,
            stats:   details.stats,
            updatedAt: new Date(),
          }, { merge: true });
        }
      }
    } catch {}
  }, 60 * 1000); // cada minuto
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}