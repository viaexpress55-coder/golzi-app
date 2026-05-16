// functions/src/index.ts
// Punto de entrada de todas las Firebase Cloud Functions de GOLZI
import * as admin from 'firebase-admin';

// Inicializar Admin SDK (una sola vez)
if (!admin.apps.length) {
  admin.initializeApp();
}

// ── Predicciones ──
export { onMatchFinish }    from './predictions/onMatchFinish';
export { submitPrediction } from './predictions/validatePrediction';

// ── Ligas ──
export { onLeagueMemberAdded }  from './leagues/checkCapacity';
export { rivalryNotification }  from './leagues/rivalryNotification';
export { generateLeagueAssets }  from './leagues/generateLeagueAssets';

// ── Streaks ──
export { calculateStreak } from './streaks/calculateStreak';

// ── Rankings pre-calculados ──
export { calculateRanking } from './rankings/calculateRanking';

// ── Pagos ── (implementar en Bloque 2)
// export { webhookDLocal }  from './payments/webhookDLocal';
// export { webhookPaddle }  from './payments/webhookPaddle';