import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

const mpAccessToken = defineSecret('MP_ACCESS_TOKEN');

const PLANS: Record<string, { id: string; name: string; price: number; currency: string; description: string }> = {
  GOLZAIR: { id: 'golzair', name: 'GOLZAIR', price: 1.99, currency: 'USD', description: '1 liga × 20 personas · Por torneo' },
  LIGA:    { id: 'liga',    name: 'LIGA',    price: 4.99, currency: 'USD', description: '3 ligas × 25 personas · Por torneo' },
  PRO:     { id: 'pro',     name: 'PRO',     price: 9.99, currency: 'USD', description: '5 ligas × 30 personas · Por mes' },
  STARTER: { id: 'starter', name: 'STARTER', price: 29.99, currency: 'USD', description: 'Ligas ilimitadas · 1 sucursal · Por mes' },
  BUSINESS:{ id: 'business',name: 'BUSINESS',price: 79.99, currency: 'USD', description: 'Ligas ilimitadas · 3 sucursales · Por mes' },
};

export const createPaymentPreference = onCall(
  { secrets: ['MP_ACCESS_TOKEN'] },
  async (request) => {

    // 👇 LOG 1: ver si llega auth
    console.log('Auth received:', JSON.stringify(request.auth));

    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Usuario no autenticado');
    }

    const planId = request.data.planId;
    const userId = request.auth.uid;
    const userEmail = 'TESTUSER6176683595540047590@testuser.com';
    const plan = PLANS[planId];

    if (!plan) {
      throw new HttpsError('invalid-argument', 'Plan no válido');
    }

    try {
      // 👇 LOG 2: validar token MP (parcial por seguridad)
      console.log('Calling MP with token:', mpAccessToken.value()?.substring(0, 20));

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mpAccessToken.value()}`,
        },
        body: JSON.stringify({
          items: [
            {
              id: plan.id,
              title: `GOLZI ${plan.name}`,
              description: plan.description,
              quantity: 1,
              unit_price: plan.price,
              currency_id: plan.currency
            }
          ],
          payer: { email: userEmail },
          external_reference: `${userId}_${plan.id}_${Date.now()}`,
          back_urls: {
            success: 'golzi://payment/success',
            failure: 'golzi://payment/failure',
            pending: 'golzi://payment/pending'
          },
          auto_return: 'approved',
          statement_descriptor: 'GOLZI APP',
          metadata: { userId, planId: plan.id },
        }),
      });

      const mpData = await response.json();

      // 👇 LOG 3: respuesta completa de MP
      console.log('MP Response:', JSON.stringify(mpData));

      if (mpData.id) {
        await admin.firestore().collection('paymentPreferences').doc(mpData.id).set({
          userId,
          planId: plan.id,
          preferenceId: mpData.id,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          preferenceId: mpData.id,
          initPoint: mpData.sandbox_init_point
        };
      } else {
        throw new HttpsError('internal', JSON.stringify(mpData));
      }

    } catch (error: any) {
      // 👇 LOG 4: error detallado
      console.error('MP Error:', JSON.stringify(error), error.message);

      throw new HttpsError(
        'internal',
        error.message || 'Unknown error'
      );
    }
  }
);