import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const wompiIntegrityKey = defineSecret('WOMPI_INTEGRITY_KEY');

// PLANES v3 - Modelo "1 paga, todos juegan" - Precio base $1.99/jugador
// Precios en COP (1 USD ≈ 4,000 COP)
const PLANS: Record<string, { id: string; name: string; amountCents: number; description: string }> = {
  LIGA:      { id: 'liga',      name: 'LIGA',      amountCents: 3996000,   description: '5 jugadores · $1.99/jugador' },
  PRO:       { id: 'pro',       name: 'PRO',        amountCents: 7596000,   description: '10 jugadores · $1.90/jugador · 5% ahorro' },
  MASTER:    { id: 'master',    name: 'MASTER',     amountCents: 15996000,  description: '25 jugadores · $1.60/jugador · 20% ahorro' },
  GOLZAIR:   { id: 'golzair',   name: 'GOLZAIR',    amountCents: 39996000,  description: '100 usuarios · $1.00/usuario · 50% ahorro' },
  PARTNER:   { id: 'partner',   name: 'PARTNER',    amountCents: 139996000, description: '500 usuarios · $0.70/usuario · 65% ahorro' },
  BUSINESS:  { id: 'business',  name: 'BUSINESS',   amountCents: 199996000, description: '1,000 usuarios · $0.50/usuario · 75% ahorro' },
  GOLD:      { id: 'gold',      name: 'GOLD',       amountCents: 399996000, description: '2,500 usuarios · $0.40/usuario · 80% ahorro' },
  // TODO: definir precio real de GOLZIPLUS antes del lanzamiento
  GOLZIPLUS: { id: 'golziplus', name: 'GOLZI+',     amountCents: 399996000, description: 'Enterprise · A medida · 85% ahorro' },
};

export const createWompiPayment = onCall(
  { secrets: ['WOMPI_INTEGRITY_KEY'] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Usuario no autenticado');
    }

    const planId = request.data.planId;
    const userId = request.auth.uid;
    const plan = PLANS[planId];

    if (!plan) {
      throw new HttpsError('invalid-argument', 'Plan no válido');
    }

    try {
      const reference = `GOLZI_${userId}_${plan.id}_${Date.now()}`;
      const amountCents = plan.amountCents;
      const currency = 'COP';
      const expirationTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // Generar firma de integridad
      const integrityString = `${reference}${amountCents}${currency}${wompiIntegrityKey.value()}`;
      const signature = crypto.createHash('sha256').update(integrityString).digest('hex');

      // Guardar en Firestore
      await admin.firestore().collection('paymentPreferences').doc(reference).set({
        userId,
        planId: plan.id,
        reference,
        amountCents,
        currency,
        status: 'pending',
        provider: 'wompi',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        reference,
        amountCents,
        currency,
        signature,
        expirationTime,
        // TODO: cambiar a pub_prod_... antes del lanzamiento en Wompi producción
        publicKey: 'pub_prod_0AcAYIM169cWh7oHnlileBnsubQafOfs',
        redirectUrl: 'https://golzi.app/payment/success',
      };
    } catch (error: any) {
      console.error('Wompi Error:', error.message);
      throw new HttpsError('internal', error.message || 'Unknown error');
    }
  }
);