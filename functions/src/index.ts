// functions/src/index.ts
// Punto de entrada de todas las Firebase Cloud Functions de GOLZI

import * as admin from 'firebase-admin';

// Inicializar Admin SDK (una sola vez)
if (!admin.apps.length) {
  admin.initializeApp();
}

// ── Predicciones ──
export { onMatchFinish } from './predictions/onMatchFinish';
export { submitPrediction } from './predictions/validatePrediction';

// ── Ligas ──
export { onLeagueMemberAdded } from './leagues/checkCapacity';

// ── Pagos ── (implementar en Bloque 2)
// export { webhookDLocal } from './payments/webhookDLocal';
// export { webhookPaddle } from './payments/webhookPaddle';
