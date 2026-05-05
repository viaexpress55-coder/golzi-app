// src/services/payments.ts
// Integración Mercado Pago para GOLZI

const MP_PUBLIC_KEY = process.env.EXPO_PUBLIC_MP_PUBLIC_KEY;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// Precios de planes GOLZI
export const PLANS = {
  GOLZAIR: {
    id: 'golzair',
    name: 'GOLZAIR',
    price: 1.99,
    currency: 'USD',
    description: '1 liga × 20 personas · Por torneo',
  },
  LIGA: {
    id: 'liga',
    name: 'LIGA',
    price: 4.99,
    currency: 'USD',
    description: '3 ligas × 25 personas · Por torneo',
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    price: 9.99,
    currency: 'USD',
    description: '5 ligas × 30 personas · Por mes',
  },
  STARTER: {
    id: 'starter',
    name: 'STARTER',
    price: 29.99,
    currency: 'USD',
    description: 'Ligas ilimitadas · 1 sucursal · Por mes',
  },
  BUSINESS: {
    id: 'business',
    name: 'BUSINESS',
    price: 79.99,
    currency: 'USD',
    description: 'Ligas ilimitadas · 3 sucursales · Por mes',
  },
};

// Crear preferencia de pago en Mercado Pago
export async function createPaymentPreference(
  planId: string,
  userId: string,
  userEmail: string,
) {
  try {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) throw new Error('Plan no válido');

    const response = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [
            {
              id: plan.id,
              title: `GOLZI ${plan.name}`,
              description: plan.description,
              quantity: 1,
              unit_price: plan.price,
              currency_id: plan.currency,
            },
          ],
          payer: {
            email: userEmail,
          },
          external_reference: `${userId}_${plan.id}_${Date.now()}`,
          back_urls: {
            success: 'golzi://payment/success',
            failure: 'golzi://payment/failure',
            pending: 'golzi://payment/pending',
          },
          auto_return: 'approved',
          statement_descriptor: 'GOLZI APP',
          metadata: {
            userId,
            planId: plan.id,
          },
        }),
      },
    );

    const data = await response.json();

    if (data.id) {
      return {
        success: true,
        preferenceId: data.id,
        initPoint: data.sandbox_init_point, // URL de pago en sandbox
      };
    } else {
      throw new Error('Error creando preferencia');
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Verificar estado de un pago
export async function verifyPayment(paymentId: string) {
  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
      },
    );

    const data = await response.json();

    return {
      success: true,
      status: data.status, // approved, pending, rejected
      planId: data.metadata?.planId,
      userId: data.metadata?.userId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}