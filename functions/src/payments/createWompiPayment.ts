import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const wompiIntegrityKey = defineSecret('WOMPI_INTEGRITY_KEY');

const PLANS: Record<string, { id: string; name: string; amountCents: number; description: string }> = {
  GOLZAIR: { id: 'golzair', name: 'GOLZAIR', amountCents: 800000, description: '1 liga × 20 personas · Por torneo' },
  LIGA:    { id: 'liga',    name: 'LIGA',    amountCents: 1990000, description: '3 ligas × 25 personas · Por torneo' },
  PRO:     { id: 'pro',     name: 'PRO',     amountCents: 3990000, description: '5 ligas × 30 personas · Por mes' },
  STARTER: { id: 'starter', name: 'STARTER', amountCents: 11900000, description: 'Ligas ilimitadas · 1 sucursal · Por mes' },
  BUSINESS:{ id: 'business',name: 'BUSINESS',amountCents: 31900000, description: 'Ligas ilimitadas · 3 sucursales · Por mes' },
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