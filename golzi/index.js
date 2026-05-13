const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function sendPush(token, title, body, data = {}) {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: token, title, body, sound: 'default', data }),
    });
  } catch (e) {
    console.error('Push error:', e);
  }
}

// FUNCIÓN 1: Recordatorio 1 hora antes del partido
exports.matchReminder = onSchedule('every 60 minutes', async () => {
  const now = new Date();
  const in60min = new Date(now.getTime() + 60 * 60 * 1000);
  const in75min = new Date(now.getTime() + 75 * 60 * 1000);

  const matchesSnap = await db.collection('matches')
    .where('kickoffTime', '>=', in60min)
    .where('kickoffTime', '<=', in75min)
    .get();

  if (matchesSnap.empty) return;

  const usersSnap = await db.collection('users')
    .where('pushToken', '!=', null)
    .get();

  const tokens = usersSnap.docs.map(d => d.data().pushToken).filter(Boolean);
  if (tokens.length === 0) return;

  for (const match of matchesSnap.docs) {
    const m = match.data();
    for (const token of tokens) {
      await sendPush(
        token,
        '⏱ ¡PARTIDO EN 1 HORA!',
        `${m.homeTeam} vs ${m.awayTeam} — ¡Haz tu predicción ahora!`,
        { matchId: match.id, type: 'matchReminder' }
      );
    }
  }
});

// FUNCIÓN 2: Subida en el ranking
exports.rankingUp = onDocumentUpdated('users/{userId}', async (event) => {
  const before = event.data.before.data();
  const after  = event.data.after.data();

  if (!after.pushToken) return;
  if (!before.globalRank || !after.globalRank) return;
  if (after.globalRank >= before.globalRank) return;

  await sendPush(
    after.pushToken,
    '📈 ¡SUBISTE EN EL RANKING!',
    `Ahora eres #${after.globalRank} global 🔥 ¡Sigue prediciendo!`,
    { type: 'rankingUp', rank: after.globalRank }
  );
});

// FUNCIÓN 3: Resultado de predicción
exports.predictionResult = onDocumentUpdated('predictions/{predId}', async (event) => {
  const before = event.data.before.data();
  const after  = event.data.after.data();

  if (before.result === after.result) return;
  if (!after.result || after.result === 'pending') return;

  const userDoc = await db.collection('users').doc(after.userId).get();
  const user = userDoc.data();
  if (!user?.pushToken) return;

  let title = '';
  let body  = '';

  if (after.result === 'exact') {
    title = '🎯 ¡PREDICCIÓN EXACTA!';
    body  = '¡Acertaste el marcador! +10 puntos 🔥';
  } else if (after.result === 'winner') {
    title = '✅ ¡GANADOR CORRECTO!';
    body  = 'Acertaste el ganador. +5 puntos ⚽';
  } else {
    title = '❌ Esta vez no fue';
    body  = 'Sigue intentando, Golzair 💪';
  }

  await sendPush(user.pushToken, title, body, {
    type: 'predictionResult',
    predId: event.params.predId,
  });
});

// FUNCIÓN 4: Invitación a liga
exports.leagueInvite = onDocumentCreated('leagues/{leagueId}/members/{userId}', async (event) => {
  const leagueDoc = await db.collection('leagues').doc(event.params.leagueId).get();
  const league = leagueDoc.data();

  const userDoc = await db.collection('users').doc(event.params.userId).get();
  const user = userDoc.data();
  if (!user?.pushToken) return;

  await sendPush(
    user.pushToken,
    '🏆 ¡INVITACIÓN A LIGA!',
    `Te han invitado a "${league?.name}" ¡Únete ahora!`,
    { type: 'leagueInvite', leagueId: event.params.leagueId }
  );
});

// ============================================
// FUNCIÓN 5: REGLA DEL PRIMER PITAZO
// Cierra predicciones automáticamente al inicio del partido
// Se ejecuta cada minuto
// ============================================
exports.primerPitazo = onSchedule('every 1 minutes', async () => {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

  // Buscar partidos que acaban de empezar
  const matchesSnap = await db.collection('matches')
    .where('kickoffTime', '>=', fiveMinAgo)
    .where('kickoffTime', '<=', now)
    .where('predictionsOpen', '==', true)
    .get();

  if (matchesSnap.empty) return;

  const batch = db.batch();

  for (const match of matchesSnap.docs) {
    // Cerrar predicciones
    batch.update(match.ref, {
      predictionsOpen: false,
      closedAt: now,
    });
  }

  await batch.commit();
});

// ============================================
// FUNCIÓN 6: CÁLCULO DE PUNTOS EN BACKEND
// Se activa cuando se actualiza el resultado de un partido
// ============================================
exports.calcularPuntos = onDocumentUpdated('matches/{matchId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  // Solo procesar cuando el partido termina
  if (before.status === after.status) return;
  if (after.status !== 'FINISHED') return;

  const homeScore = after.homeScore;
  const awayScore = after.awayScore;

  if (homeScore === null || awayScore === null) return;

  // Obtener todas las predicciones de este partido
  const predsSnap = await db.collection('predictions')
    .where('matchId', '==', event.params.matchId)
    .get();

  if (predsSnap.empty) return;

  const batch = db.batch();

  for (const pred of predsSnap.docs) {
    const p = pred.data();
    let points = 0;
    let result = 'wrong';

    // Marcador exacto → +10 pts
    if (p.homeScore === homeScore && p.awayScore === awayScore) {
      points = 10;
      result = 'exact';
    }
    // Ganador correcto → +5 pts
    else if (
      (p.homeScore > p.awayScore && homeScore > awayScore) ||
      (p.homeScore < p.awayScore && homeScore < awayScore)
    ) {
      points = 5;
      result = 'winner';
    }
    // Empate acertado → +2 pts
    else if (p.homeScore === p.awayScore && homeScore === awayScore) {
      points = 2;
      result = 'draw';
    }

    // Actualizar predicción con resultado y puntos
    batch.update(pred.ref, {
      result,
      points,
      calculatedAt: new Date(),
    });

    // Actualizar puntos del usuario
    if (points > 0) {
      const userRef = db.collection('users').doc(p.userId);
      const userSnap = await userRef.get();
      const currentPoints = userSnap.data()?.totalPoints || 0;

      batch.update(userRef, {
        totalPoints: currentPoints + points,
        lastUpdated: new Date(),
      });
    }
  }

  await batch.commit();
  console.log(`✅ Puntos calculados para partido ${event.params.matchId}`);
});

// ============================================
// FUNCIÓN 7: PROXY ANTHROPIC API
// Protege la API Key de Anthropic en el backend
// ============================================
const { onRequest } = require('firebase-functions/v2/https');

exports.claudeProxy = onRequest({
  cors: ['https://golzi.app', 'https://golzi-2026.web.app'],
}, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch(e) {
    console.error('Claude proxy error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// FUNCIÓN 8: RATE LIMITING — 1 predicción por partido por usuario
// Se activa cuando se crea una predicción
// ============================================
exports.validarPrediccion = onDocumentCreated('predictions/{predId}', async (event) => {
  const pred = event.data.data();
  const { userId, matchId } = pred;

  if (!userId || !matchId) {
    await event.data.ref.delete();
    return;
  }

  // Verificar si ya existe predicción para este partido
  const existingSnap = await db.collection('predictions')
    .where('userId', '==', userId)
    .where('matchId', '==', matchId)
    .get();

  // Si hay más de 1 (incluyendo la que acaba de crearse) → eliminar la nueva
  if (existingSnap.size > 1) {
    await event.data.ref.delete();
    console.log(`⚠️ Rate limit: ${userId} ya predijo partido ${matchId}`);
    return;
  }

  // Verificar que el partido aún acepta predicciones
  const matchSnap = await db.collection('matches').doc(matchId).get();
  if (!matchSnap.exists) return;

  const match = matchSnap.data();
  if (match.predictionsOpen === false) {
    await event.data.ref.delete();
    console.log(`⚠️ Predicciones cerradas para partido ${matchId}`);
    return;
  }

  console.log(`✅ Predicción válida: ${userId} → ${matchId}`);
});