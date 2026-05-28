import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const wompiIntegrityKey = defineSecret('WOMPI_INTEGRITY_KEY');

// PLANES ACTUALIZADOS - Modelo "1 paga, todos juegan"
// Precios en COP (1 USD ≈ 4,000 COP)
const PLANS: Record<string, { id: string; name: string; amountCents: number; description: string }> = {
  // B2C Personal
  LIGA:        { id: 'liga',        name: 'LIGA',        amountCents: 5996000,   description: '5 jugadores · Pago único' },
  PRO:         { id: 'pro',         name: 'PRO',         amountCents: 11996000,  description: '10 jugadores · Pago único' },
  MASTER:      { id: 'master',      name: 'MASTER',      amountCents: 23996000,  description: '25 jugadores · Pago único' },
  GOLZAIR:     { id: 'golzair',     name: 'GOLZAIR',     amountCents: 39996000,  description: '100 usuarios · Multiligas' },
  // B2B Empresas
  PARTNER:     { id: 'partner',     name: 'PARTNER',     amountCents: 139996000, description: '500 usuarios · Pago único' },
  BUSINESS:    { id: 'business',    name: 'BUSINESS',    amountCents: 199996000, description: '1,000 usuarios · Pago único' },
  GOLD:        { id: 'gold',        name: 'GOLD',        amountCents: 399996000, description: '2,500 usuarios · Pago único' },
  GOLZIPLUS:   { id: 'golziplus',   name: 'GOLZI+',      amountCents: 1,         description: 'Enterprise · A medida' },
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
        publicKey: 'pub_test_xgcvZVpkIav8qbwBp0NpjPXda3G3FoPP',
        redirectUrl: 'golzi://payment/success',
      };
    } catch (error: any) {
      console.error('Wompi Error:', error.message);
      throw new HttpsError('internal', error.message || 'Unknown error');
    }
  }
);