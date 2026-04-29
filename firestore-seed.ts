// functions/src/seeds/firestore-seed.ts
// ─────────────────────────────────────────────────────────────────
// Script de seed de Firestore para GOLZI
// Crea documentos de ejemplo con la estructura exacta del doc técnico
// Ejecutar: npx ts-node firestore-seed.ts (desde /functions/src/seeds/)
// ─────────────────────────────────────────────────────────────────
//
// IMPORTANTE: Este script usa Admin SDK — ejecutar solo localmente
// con el emulador de Firestore o con credenciales de admin privadas.
// NUNCA subir credenciales de admin al repositorio.
//
// Para conectar al emulador local:
//   export FIRESTORE_EMULATOR_HOST="localhost:8080"
//   export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"

import admin from 'firebase-admin';
import { Timestamp, GeoPoint } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./service-account.json');

const app = admin.apps.length === 0
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'golzi-2026',
    })
  : admin.apps[0]!;

const db = admin.firestore(app);

// ═══════════════════════════════════════════════════════════════════
// COLECCIÓN: users
// ═══════════════════════════════════════════════════════════════════
const usersData = [
  {
    // userId es el ID del documento (= Firebase Auth UID)
    userId: 'user_golzair_001',
    username: 'Cafetero_Pro',
    country: 'CO',
    language: 'es',
    plan: 'player',            // free | player | liga | pro
    planExpiry: Timestamp.fromDate(new Date('2026-07-20')),
    totalPoints: 128,          // puntos del torneo activo
    reputationPoints: 350,     // puntos de reputación permanentes
    referralCode: 'GOLZ-CAF001',
    referredBy: null,          // userId de quien lo refirió
    fcmToken: null,            // se actualiza al iniciar sesión
    createdAt: Timestamp.now(),
    lastActive: Timestamp.now(),
  },
  {
    userId: 'user_golzair_002',
    username: 'Rafa_Predictor',
    country: 'BR',
    language: 'pt',
    plan: 'pro',
    planExpiry: Timestamp.fromDate(new Date('2026-08-01')),
    totalPoints: 487,
    reputationPoints: 1200,
    referralCode: 'GOLZ-RAF002',
    referredBy: null,
    fcmToken: null,
    createdAt: Timestamp.now(),
    lastActive: Timestamp.now(),
  },
];

// ═══════════════════════════════════════════════════════════════════
// COLECCIÓN: matches
// Partidos del Mundial FIFA 2026 — datos de la API deportiva
// ═══════════════════════════════════════════════════════════════════
const matchesData = [
  {
    matchId: 'WC2026_001',
    tournamentId: 'FIFA_WC_2026',
    homeTeam: 'México',
    awayTeam: 'Canadá',
    homeFlag: '🇲🇽',
    awayFlag: '🇨🇦',
    homeScore: null,           // null hasta que empieza
    awayScore: null,
    status: 'scheduled',       // scheduled | live | finished
    kickoffTime: Timestamp.fromDate(new Date('2026-06-11T17:00:00-07:00')),
    stadium: 'SoFi Stadium',
    city: 'Los Ángeles',
    group: 'Grupo A',
    round: 'group_stage',      // group_stage | round_of_16 | quarter | semi | final
  },
  {
    matchId: 'WC2026_002',
    tournamentId: 'FIFA_WC_2026',
    homeTeam: 'USA',
    awayTeam: 'Gales',
    homeFlag: '🇺🇸',
    awayFlag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: Timestamp.fromDate(new Date('2026-06-12T20:00:00-07:00')),
    stadium: 'Rose Bowl',
    city: 'Los Ángeles',
    group: 'Grupo B',
    round: 'group_stage',
  },
  {
    matchId: 'WC2026_003',
    tournamentId: 'FIFA_WC_2026',
    homeTeam: 'Brasil',
    awayTeam: 'Costa Rica',
    homeFlag: '🇧🇷',
    awayFlag: '🇨🇷',
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: Timestamp.fromDate(new Date('2026-06-12T14:00:00-07:00')),
    stadium: 'MetLife Stadium',
    city: 'Nueva York',
    group: 'Grupo C',
    round: 'group_stage',
  },
  {
    matchId: 'WC2026_004',
    tournamentId: 'FIFA_WC_2026',
    homeTeam: 'Argentina',
    awayTeam: 'Perú',
    homeFlag: '🇦🇷',
    awayFlag: '🇵🇪',
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    kickoffTime: Timestamp.fromDate(new Date('2026-06-13T17:00:00-05:00')),
    stadium: 'AT&T Stadium',
    city: 'Dallas',
    group: 'Grupo D',
    round: 'group_stage',
  },
];

// ═══════════════════════════════════════════════════════════════════
// COLECCIÓN: predictions
// ═══════════════════════════════════════════════════════════════════
const predictionsData = [
  {
    predictionId: 'pred_001',
    userId: 'user_golzair_001',
    matchId: 'WC2026_001',
    tournamentId: 'FIFA_WC_2026',
    homeScore: 2,              // predicción: México 2
    awayScore: 0,              // predicción: Canadá 0
    pointsEarned: 0,           // 0 hasta que termine el partido
    // pending | correct_exact | correct_result | correct_draw | incorrect
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2026-06-11T10:00:00-07:00')),
    lockedAt: Timestamp.fromDate(new Date('2026-06-11T17:00:00-07:00')),
  },
  {
    predictionId: 'pred_002',
    userId: 'user_golzair_002',
    matchId: 'WC2026_001',
    tournamentId: 'FIFA_WC_2026',
    homeScore: 1,
    awayScore: 1,
    pointsEarned: 0,
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2026-06-11T09:30:00-07:00')),
    lockedAt: Timestamp.fromDate(new Date('2026-06-11T17:00:00-07:00')),
  },
];

// ═══════════════════════════════════════════════════════════════════
// COLECCIÓN: leagues
// ═══════════════════════════════════════════════════════════════════
const leaguesData = [
  {
    leagueId: 'league_001',
    name: 'Los Parceros',
    creatorId: 'user_golzair_001',
    type: 'private',           // private | business
    maxMembers: 12,            // según plan del creador
    members: ['user_golzair_001', 'user_golzair_002'],
    membersCount: 2,           // campo denormalizado para queries
    capacityAlert70Sent: false,
    capacityAlert90Sent: false,
    qrToken: 'GOLZI_user_golzair_001_league_001_1748000000_hash',
    businessId: null,          // null si es liga privada
    tournamentId: 'FIFA_WC_2026',
    createdAt: Timestamp.now(),
  },
];

// ═══════════════════════════════════════════════════════════════════
// COLECCIÓN: businesses
// ═══════════════════════════════════════════════════════════════════
const businessesData = [
  {
    businessId: 'business_001',
    name: 'Bar El Estadio',
    plan: 'pro',               // starter | pro | elite | elite_multi
    planExpiry: Timestamp.fromDate(new Date('2026-07-31')),
    location: new GeoPoint(4.6097, -74.0817),  // Bogotá ejemplo
    address: 'Calle 93 #15-40',
    city: 'Bogotá',
    country: 'CO',
    contactEmail: 'barestadio@example.com',
    qrToken: 'GOLZI_BIZ_business_001_1748000000_hash',
    geofenceRadius: 500,       // metros — fijo para todos
    badgeLevel: 'activo',      // nuevo | activo | premium | elite | observado
    reputationScore: 67,       // 0-100, combinado de 3 pilares
    // Desglose reputationScore:
    // volumeScore (40%): usuarios generados en últimos 30 días
    // reputationPillar (40%): calificaciones de usuarios
    // activityScore (20%): promociones activas
    totalUsersGenerated: 87,
    activeLeaguesCount: 3,
    branches: [],              // solo para planes elite_multi
    masterToken: null,         // solo para planes elite_multi
    founderPricing: true,      // precio fundador activo
    founderPricingExpiry: Timestamp.fromDate(new Date('2026-06-11')),
    createdAt: Timestamp.now(),
  },
];

// ═══════════════════════════════════════════════════════════════════
// COLECCIÓN: tournaments (extra — necesaria para queries globales)
// ═══════════════════════════════════════════════════════════════════
const tournamentsData = [
  {
    tournamentId: 'FIFA_WC_2026',
    name: 'Mundial FIFA 2026',
    shortName: 'WC 2026',
    sport: 'football',
    startDate: Timestamp.fromDate(new Date('2026-06-11')),
    endDate: Timestamp.fromDate(new Date('2026-07-19')),
    totalMatches: 104,
    groups: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    status: 'upcoming',        // upcoming | active | finished
    apiCompetitionId: 'WC',    // ID en football-data.org
    isActive: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL — Ejecuta el seed
// ═══════════════════════════════════════════════════════════════════
async function seedFirestore() {
  console.log('🌱 Iniciando seed de Firestore para GOLZI...\n');

  const batch = db.batch();

  // ── users ──
  console.log('📁 Colección: users');
  for (const user of usersData) {
    const ref = db.collection('users').doc(user.userId);
    batch.set(ref, user);
    console.log(`   ✅ ${user.userId} — @${user.username}`);
  }

  // ── matches ──
  console.log('\n📁 Colección: matches');
  for (const match of matchesData) {
    const ref = db.collection('matches').doc(match.matchId);
    batch.set(ref, match);
    console.log(`   ✅ ${match.matchId} — ${match.homeTeam} vs ${match.awayTeam}`);
  }

  // ── predictions ──
  console.log('\n📁 Colección: predictions');
  for (const pred of predictionsData) {
    const ref = db.collection('predictions').doc(pred.predictionId);
    batch.set(ref, pred);
    console.log(`   ✅ ${pred.predictionId} — userId: ${pred.userId}`);
  }

  // ── leagues ──
  console.log('\n📁 Colección: leagues');
  for (const league of leaguesData) {
    const ref = db.collection('leagues').doc(league.leagueId);
    batch.set(ref, league);
    console.log(`   ✅ ${league.leagueId} — "${league.name}"`);
  }

  // ── businesses ──
  console.log('\n📁 Colección: businesses');
  for (const biz of businessesData) {
    const ref = db.collection('businesses').doc(biz.businessId);
    batch.set(ref, biz);
    console.log(`   ✅ ${biz.businessId} — "${biz.name}"`);
  }

  // ── tournaments ──
  console.log('\n📁 Colección: tournaments');
  for (const tournament of tournamentsData) {
    const ref = db.collection('tournaments').doc(tournament.tournamentId);
    batch.set(ref, tournament);
    console.log(`   ✅ ${tournament.tournamentId} — "${tournament.name}"`);
  }

  // ── Commit ──
  await batch.commit();
  console.log('\n🎉 Seed completado exitosamente');
  console.log('   Colecciones creadas: users, matches, predictions, leagues, businesses, tournaments');
}

seedFirestore().catch(console.error);
