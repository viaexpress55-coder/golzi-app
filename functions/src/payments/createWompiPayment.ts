import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const wompiIntegrityKey = defineSecret('WOMPI_INTEGRITY_KEY');

// PLANES v3 - Modelo "1 paga, todos juegan" - Precio base $1.99/jugador
// Precios en COP (1 USD ≈ 4,000 COP)
const PLANS: Record<string, { id: string; name: string; amountCents: number; description: string }> = {
  LIGA:      { id: 'liga',      name: 'LIGA',      amountCents: 3650000,   description: '5 jugadores · $9.99 USD' },
  PRO:       { id: 'pro',       name: 'PRO',        amountCents: 6930000,   description: '10 jugadores · $18.99 USD' },
  MASTER:    { id: 'master',    name: 'MASTER',     amountCents: 14590000,  description: '25 jugadores · $39.99 USD' },
  GOLZAIR:   { id: 'golzair',   name: 'GOLZAIR',    amountCents: 36490000,  description: '100 usuarios · $99.99 USD' },
  PARTNER:   { id: 'partner',   name: 'PARTNER',    amountCents: 127740000, description: '500 usuarios · $349.99 USD' },
  BUSINESS:  { id: 'business',  name: 'BUSINESS',   amountCents: 182490000, description: '1,000 usuarios · $499.99 USD' },
  GOLD:      { id: 'gold',      name: 'GOLD',       amountCents: 364990000, description: '2,500 usuarios · $999.99 USD' },
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

      console.log('Returning publicKey:', 'pub_prod_0AcAYIM169cWh7oHnlileBnsubQafOfs');
      return {
        success: true,
        reference,
        amountCents,
        currency,
        signature,
        expirationTime,
        publicKey: 'pub_prod_0AcAYIM169cWh7oHnlileBnsubQafOfs',
        redirectUrl: 'https://golzi.app/payment/success',
      };
    } catch (error: any) {
      console.error('Wompi Error:', error.message);
      throw new HttpsError('internal', error.message || 'Unknown error');
    }
  }
);