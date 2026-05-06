// firestore-seed-mundial.ts
// Script para cargar todos los partidos del Mundial 2026
// Ejecutar desde Firebase Console o con Admin SDK

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8p-figRsYJNLh2KEHeJBIauoqrR8pVk0",
  authDomain: "golzi-2026.firebaseapp.com",
  projectId: "golzi-2026",
  storageBucket: "golzi-2026.firebasestorage.app",
  messagingSenderId: "466137327410",
  appId: "1:466137327410:web:4fbc9e9aa9df73ee52192b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MATCHES = [
  // ═══ GRUPO A ═══
  { matchId:'WC2026_A01', group:'Grupo A', homeTeam:'México', awayTeam:'Sudáfrica', homeFlag:'🇲🇽', awayFlag:'🇿🇦', stadium:'Estadio Azteca', city:'Ciudad de México', kickoff:'2026-06-11T19:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_A02', group:'Grupo A', homeTeam:'Corea del Sur', awayTeam:'Chequia', homeFlag:'🇰🇷', awayFlag:'🇨🇿', stadium:'Estadio Akron', city:'Guadalajara', kickoff:'2026-06-12T02:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_A03', group:'Grupo A', homeTeam:'Chequia', awayTeam:'Sudáfrica', homeFlag:'🇨🇿', awayFlag:'🇿🇦', stadium:'Mercedes-Benz Stadium', city:'Atlanta', kickoff:'2026-06-18T16:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_A04', group:'Grupo A', homeTeam:'México', awayTeam:'Corea del Sur', homeFlag:'🇲🇽', awayFlag:'🇰🇷', stadium:'Estadio Akron', city:'Guadalajara', kickoff:'2026-06-19T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_A05', group:'Grupo A', homeTeam:'Chequia', awayTeam:'México', homeFlag:'🇨🇿', awayFlag:'🇲🇽', stadium:'Estadio Azteca', city:'Ciudad de México', kickoff:'2026-06-25T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_A06', group:'Grupo A', homeTeam:'Sudáfrica', awayTeam:'Corea del Sur', homeFlag:'🇿🇦', awayFlag:'🇰🇷', stadium:'Estadio BBVA', city:'Monterrey', kickoff:'2026-06-25T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO B ═══
  { matchId:'WC2026_B01', group:'Grupo B', homeTeam:'Canadá', awayTeam:'Bosnia y Herzegovina', homeFlag:'🇨🇦', awayFlag:'🇧🇦', stadium:'BMO Field', city:'Toronto', kickoff:'2026-06-12T19:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_B02', group:'Grupo B', homeTeam:'Qatar', awayTeam:'Suiza', homeFlag:'🇶🇦', awayFlag:'🇨🇭', stadium:"Levi's Stadium", city:'Santa Clara', kickoff:'2026-06-13T19:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_B03', group:'Grupo B', homeTeam:'Suiza', awayTeam:'Bosnia y Herzegovina', homeFlag:'🇨🇭', awayFlag:'🇧🇦', stadium:'BMO Field', city:'Toronto', kickoff:'2026-06-18T19:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_B04', group:'Grupo B', homeTeam:'Canadá', awayTeam:'Qatar', homeFlag:'🇨🇦', awayFlag:'🇶🇦', stadium:'BC Place', city:'Vancouver', kickoff:'2026-06-18T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_B05', group:'Grupo B', homeTeam:'Bosnia y Herzegovina', awayTeam:'Qatar', homeFlag:'🇧🇦', awayFlag:'🇶🇦', stadium:'BC Place', city:'Vancouver', kickoff:'2026-06-24T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_B06', group:'Grupo B', homeTeam:'Suiza', awayTeam:'Canadá', homeFlag:'🇨🇭', awayFlag:'🇨🇦', stadium:'BC Place', city:'Vancouver', kickoff:'2026-06-24T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO C ═══
  { matchId:'WC2026_C01', group:'Grupo C', homeTeam:'Brasil', awayTeam:'Marruecos', homeFlag:'🇧🇷', awayFlag:'🇲🇦', stadium:'MetLife Stadium', city:'Nueva York/Nueva Jersey', kickoff:'2026-06-13T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_C02', group:'Grupo C', homeTeam:'Haití', awayTeam:'Escocia', homeFlag:'🇭🇹', awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', stadium:'Arrowhead Stadium', city:'Kansas City', kickoff:'2026-06-13T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_C03', group:'Grupo C', homeTeam:'Marruecos', awayTeam:'Haití', homeFlag:'🇲🇦', awayFlag:'🇭🇹', stadium:'Mercedes-Benz Stadium', city:'Atlanta', kickoff:'2026-06-24T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_C04', group:'Grupo C', homeTeam:'Brasil', awayTeam:'Escocia', homeFlag:'🇧🇷', awayFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', stadium:'Lincoln Financial Field', city:'Filadelfia', kickoff:'2026-06-19T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_C05', group:'Grupo C', homeTeam:'Brasil', awayTeam:'Haití', homeFlag:'🇧🇷', awayFlag:'🇭🇹', stadium:'Hard Rock Stadium', city:'Miami', kickoff:'2026-06-25T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_C06', group:'Grupo C', homeTeam:'Escocia', awayTeam:'Marruecos', homeFlag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', awayFlag:'🇲🇦', stadium:'Arrowhead Stadium', city:'Kansas City', kickoff:'2026-06-25T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO D ═══
  { matchId:'WC2026_D01', group:'Grupo D', homeTeam:'USA', awayTeam:'Paraguay', homeFlag:'🇺🇸', awayFlag:'🇵🇾', stadium:'SoFi Stadium', city:'Los Ángeles', kickoff:'2026-06-13T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_D02', group:'Grupo D', homeTeam:'Australia', awayTeam:'Türkiye', homeFlag:'🇦🇺', awayFlag:'🇹🇷', stadium:'BC Place', city:'Vancouver', kickoff:'2026-06-13T05:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_D03', group:'Grupo D', homeTeam:'USA', awayTeam:'Australia', homeFlag:'🇺🇸', awayFlag:'🇦🇺', stadium:'Lumen Field', city:'Seattle', kickoff:'2026-06-19T19:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_D04', group:'Grupo D', homeTeam:'Türkiye', awayTeam:'Paraguay', homeFlag:'🇹🇷', awayFlag:'🇵🇾', stadium:"Levi's Stadium", city:'Santa Clara', kickoff:'2026-06-20T03:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_D05', group:'Grupo D', homeTeam:'Türkiye', awayTeam:'USA', homeFlag:'🇹🇷', awayFlag:'🇺🇸', stadium:'SoFi Stadium', city:'Los Ángeles', kickoff:'2026-06-26T02:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_D06', group:'Grupo D', homeTeam:'Paraguay', awayTeam:'Australia', homeFlag:'🇵🇾', awayFlag:'🇦🇺', stadium:"Levi's Stadium", city:'Santa Clara', kickoff:'2026-06-26T02:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO E ═══
  { matchId:'WC2026_E01', group:'Grupo E', homeTeam:'Alemania', awayTeam:'Curaçao', homeFlag:'🇩🇪', awayFlag:'🇨🇼', stadium:'NRG Stadium', city:'Houston', kickoff:'2026-06-14T17:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_E02', group:'Grupo E', homeTeam:'Costa de Marfil', awayTeam:'Ecuador', homeFlag:'🇨🇮', awayFlag:'🇪🇨', stadium:'Lincoln Financial Field', city:'Filadelfia', kickoff:'2026-06-14T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_E03', group:'Grupo E', homeTeam:'Alemania', awayTeam:'Costa de Marfil', homeFlag:'🇩🇪', awayFlag:'🇨🇮', stadium:'BMO Field', city:'Toronto', kickoff:'2026-06-20T20:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_E04', group:'Grupo E', homeTeam:'Ecuador', awayTeam:'Curaçao', homeFlag:'🇪🇨', awayFlag:'🇨🇼', stadium:'Lincoln Financial Field', city:'Filadelfia', kickoff:'2026-06-21T00:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_E05', group:'Grupo E', homeTeam:'Ecuador', awayTeam:'Alemania', homeFlag:'🇪🇨', awayFlag:'🇩🇪', stadium:'MetLife Stadium', city:'Nueva York/Nueva Jersey', kickoff:'2026-06-25T21:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_E06', group:'Grupo E', homeTeam:'Curaçao', awayTeam:'Costa de Marfil', homeFlag:'🇨🇼', awayFlag:'🇨🇮', stadium:'Arrowhead Stadium', city:'Kansas City', kickoff:'2026-06-25T21:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO F ═══
  { matchId:'WC2026_F01', group:'Grupo F', homeTeam:'Países Bajos', awayTeam:'Japón', homeFlag:'🇳🇱', awayFlag:'🇯🇵', stadium:'NRG Stadium', city:'Houston', kickoff:'2026-06-14T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_F02', group:'Grupo F', homeTeam:'Suecia', awayTeam:'Túnez', homeFlag:'🇸🇪', awayFlag:'🇹🇳', stadium:"Levi's Stadium", city:'Santa Clara', kickoff:'2026-06-14T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_F03', group:'Grupo F', homeTeam:'Países Bajos', awayTeam:'Suecia', homeFlag:'🇳🇱', awayFlag:'🇸🇪', stadium:'Lumen Field', city:'Seattle', kickoff:'2026-06-20T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_F04', group:'Grupo F', homeTeam:'Túnez', awayTeam:'Japón', homeFlag:'🇹🇳', awayFlag:'🇯🇵', stadium:'Estadio BBVA', city:'Monterrey', kickoff:'2026-06-20T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_F05', group:'Grupo F', homeTeam:'Japón', awayTeam:'Suecia', homeFlag:'🇯🇵', awayFlag:'🇸🇪', stadium:'Estadio BBVA', city:'Monterrey', kickoff:'2026-06-26T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_F06', group:'Grupo F', homeTeam:'Túnez', awayTeam:'Países Bajos', homeFlag:'🇹🇳', awayFlag:'🇳🇱', stadium:'Estadio Akron', city:'Guadalajara', kickoff:'2026-06-26T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO G ═══
  { matchId:'WC2026_G01', group:'Grupo G', homeTeam:'Bélgica', awayTeam:'Egipto', homeFlag:'🇧🇪', awayFlag:'🇪🇬', stadium:'Lumen Field', city:'Seattle', kickoff:'2026-06-15T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_G02', group:'Grupo G', homeTeam:'Irán', awayTeam:'Nueva Zelanda', homeFlag:'🇮🇷', awayFlag:'🇳🇿', stadium:'SoFi Stadium', city:'Los Ángeles', kickoff:'2026-06-15T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_G03', group:'Grupo G', homeTeam:'Bélgica', awayTeam:'Irán', homeFlag:'🇧🇪', awayFlag:'🇮🇷', stadium:'SoFi Stadium', city:'Los Ángeles', kickoff:'2026-06-21T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_G04', group:'Grupo G', homeTeam:'Egipto', awayTeam:'Nueva Zelanda', homeFlag:'🇪🇬', awayFlag:'🇳🇿', stadium:'Lumen Field', city:'Seattle', kickoff:'2026-06-21T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_G05', group:'Grupo G', homeTeam:'Egipto', awayTeam:'Irán', homeFlag:'🇪🇬', awayFlag:'🇮🇷', stadium:'Lumen Field', city:'Seattle', kickoff:'2026-06-26T03:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_G06', group:'Grupo G', homeTeam:'Nueva Zelanda', awayTeam:'Bélgica', homeFlag:'🇳🇿', awayFlag:'🇧🇪', stadium:'BC Place', city:'Vancouver', kickoff:'2026-06-26T03:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO H ═══
  { matchId:'WC2026_H01', group:'Grupo H', homeTeam:'España', awayTeam:'Cabo Verde', homeFlag:'🇪🇸', awayFlag:'🇨🇻', stadium:'Mercedes-Benz Stadium', city:'Atlanta', kickoff:'2026-06-15T16:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_H02', group:'Grupo H', homeTeam:'Arabia Saudita', awayTeam:'Uruguay', homeFlag:'🇸🇦', awayFlag:'🇺🇾', stadium:'Hard Rock Stadium', city:'Miami', kickoff:'2026-06-15T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_H03', group:'Grupo H', homeTeam:'España', awayTeam:'Arabia Saudita', homeFlag:'🇪🇸', awayFlag:'🇸🇦', stadium:'Mercedes-Benz Stadium', city:'Atlanta', kickoff:'2026-06-21T16:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_H04', group:'Grupo H', homeTeam:'Uruguay', awayTeam:'Cabo Verde', homeFlag:'🇺🇾', awayFlag:'🇨🇻', stadium:'Hard Rock Stadium', city:'Miami', kickoff:'2026-06-21T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_H05', group:'Grupo H', homeTeam:'Cabo Verde', awayTeam:'Arabia Saudita', homeFlag:'🇨🇻', awayFlag:'🇸🇦', stadium:'NRG Stadium', city:'Houston', kickoff:'2026-06-27T00:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_H06', group:'Grupo H', homeTeam:'Uruguay', awayTeam:'España', homeFlag:'🇺🇾', awayFlag:'🇪🇸', stadium:'Estadio Akron', city:'Guadalajara', kickoff:'2026-06-27T00:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO I ═══
  { matchId:'WC2026_I01', group:'Grupo I', homeTeam:'Francia', awayTeam:'Senegal', homeFlag:'🇫🇷', awayFlag:'🇸🇳', stadium:'MetLife Stadium', city:'Nueva York/Nueva Jersey', kickoff:'2026-06-16T19:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_I02', group:'Grupo I', homeTeam:'Iraq', awayTeam:'Noruega', homeFlag:'🇮🇶', awayFlag:'🇳🇴', stadium:'Gillette Stadium', city:'Boston', kickoff:'2026-06-16T22:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_I03', group:'Grupo I', homeTeam:'Francia', awayTeam:'Iraq', homeFlag:'🇫🇷', awayFlag:'🇮🇶', stadium:'Lincoln Financial Field', city:'Filadelfia', kickoff:'2026-06-22T21:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_I04', group:'Grupo I', homeTeam:'Noruega', awayTeam:'Senegal', homeFlag:'🇳🇴', awayFlag:'🇸🇳', stadium:'MetLife Stadium', city:'Nueva York/Nueva Jersey', kickoff:'2026-06-23T00:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_I05', group:'Grupo I', homeTeam:'Francia', awayTeam:'Noruega', homeFlag:'🇫🇷', awayFlag:'🇳🇴', stadium:'Hard Rock Stadium', city:'Miami', kickoff:'2026-06-27T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_I06', group:'Grupo I', homeTeam:'Senegal', awayTeam:'Iraq', homeFlag:'🇸🇳', awayFlag:'🇮🇶', stadium:'Gillette Stadium', city:'Boston', kickoff:'2026-06-27T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO J ═══
  { matchId:'WC2026_J01', group:'Grupo J', homeTeam:'Argentina', awayTeam:'Argelia', homeFlag:'🇦🇷', awayFlag:'🇩🇿', stadium:'Arrowhead Stadium', city:'Kansas City', kickoff:'2026-06-17T01:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_J02', group:'Grupo J', homeTeam:'Austria', awayTeam:'Jordania', homeFlag:'🇦🇹', awayFlag:'🇯🇴', stadium:"Levi's Stadium", city:'Santa Clara', kickoff:'2026-06-17T04:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_J03', group:'Grupo J', homeTeam:'Argentina', awayTeam:'Austria', homeFlag:'🇦🇷', awayFlag:'🇦🇹', stadium:'AT&T Stadium', city:'Dallas', kickoff:'2026-06-22T17:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_J04', group:'Grupo J', homeTeam:'Jordania', awayTeam:'Argelia', homeFlag:'🇯🇴', awayFlag:'🇩🇿', stadium:"Levi's Stadium", city:'Santa Clara', kickoff:'2026-06-23T03:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_J05', group:'Grupo J', homeTeam:'Jordania', awayTeam:'Argentina', homeFlag:'🇯🇴', awayFlag:'🇦🇷', stadium:'AT&T Stadium', city:'Dallas', kickoff:'2026-06-28T02:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_J06', group:'Grupo J', homeTeam:'Argelia', awayTeam:'Austria', homeFlag:'🇩🇿', awayFlag:'🇦🇹', stadium:'Arrowhead Stadium', city:'Kansas City', kickoff:'2026-06-28T02:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO K ═══
  { matchId:'WC2026_K01', group:'Grupo K', homeTeam:'Portugal', awayTeam:'Congo DR', homeFlag:'🇵🇹', awayFlag:'🇨🇩', stadium:'NRG Stadium', city:'Houston', kickoff:'2026-06-17T17:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_K02', group:'Grupo K', homeTeam:'Uzbekistán', awayTeam:'Colombia', homeFlag:'🇺🇿', awayFlag:'🇨🇴', stadium:'Estadio Azteca', city:'Ciudad de México', kickoff:'2026-06-18T02:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_K03', group:'Grupo K', homeTeam:'Portugal', awayTeam:'Uzbekistán', homeFlag:'🇵🇹', awayFlag:'🇺🇿', stadium:'NRG Stadium', city:'Houston', kickoff:'2026-06-23T17:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_K04', group:'Grupo K', homeTeam:'Colombia', awayTeam:'Congo DR', homeFlag:'🇨🇴', awayFlag:'🇨🇩', stadium:'Estadio Akron', city:'Guadalajara', kickoff:'2026-06-24T02:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_K05', group:'Grupo K', homeTeam:'Colombia', awayTeam:'Portugal', homeFlag:'🇨🇴', awayFlag:'🇵🇹', stadium:'Hard Rock Stadium', city:'Miami', kickoff:'2026-06-27T23:30:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_K06', group:'Grupo K', homeTeam:'Congo DR', awayTeam:'Uzbekistán', homeFlag:'🇨🇩', awayFlag:'🇺🇿', stadium:'Mercedes-Benz Stadium', city:'Atlanta', kickoff:'2026-06-27T23:30:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },

  // ═══ GRUPO L ═══
  { matchId:'WC2026_L01', group:'Grupo L', homeTeam:'Inglaterra', awayTeam:'Croacia', homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇭🇷', stadium:'AT&T Stadium', city:'Dallas', kickoff:'2026-06-17T20:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_L02', group:'Grupo L', homeTeam:'Ghana', awayTeam:'Panamá', homeFlag:'🇬🇭', awayFlag:'🇵🇦', stadium:'BMO Field', city:'Toronto', kickoff:'2026-06-17T23:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_L03', group:'Grupo L', homeTeam:'Inglaterra', awayTeam:'Ghana', homeFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag:'🇬🇭', stadium:'Gillette Stadium', city:'Boston', kickoff:'2026-06-23T20:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_L04', group:'Grupo L', homeTeam:'Croacia', awayTeam:'Panamá', homeFlag:'🇭🇷', awayFlag:'🇵🇦', stadium:'Gillette Stadium', city:'Boston', kickoff:'2026-06-24T00:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_L05', group:'Grupo L', homeTeam:'Panamá', awayTeam:'Inglaterra', homeFlag:'🇵🇦', awayFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', stadium:'MetLife Stadium', city:'Nueva York/Nueva Jersey', kickoff:'2026-06-27T21:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
  { matchId:'WC2026_L06', group:'Grupo L', homeTeam:'Croacia', awayTeam:'Ghana', homeFlag:'🇭🇷', awayFlag:'🇬🇭', stadium:'Lincoln Financial Field', city:'Filadelfia', kickoff:'2026-06-27T21:00:00Z', round:'group_stage', tournamentId:'FIFA_WC_2026' },
];

async function seedMatches() {
  console.log('🌍 Cargando partidos del Mundial 2026...\n');
  let count = 0;

  for (const match of MATCHES) {
    try {
      await setDoc(doc(db, 'matches', match.matchId), {
        ...match,
        homeScore: null,
        awayScore: null,
        status: 'scheduled',
        kickoffTime: new Date(match.kickoff),
        createdAt: new Date(),
      });
      console.log(`✅ ${match.matchId}: ${match.homeTeam} vs ${match.awayTeam}`);
      count++;
    } catch (e) {
      console.error(`❌ Error en ${match.matchId}:`, e);
    }
  }

  console.log(`\n🏆 Completado: ${count}/${MATCHES.length} partidos cargados`);
}

seedMatches();