// src/services/payments.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const PLANS = {
  GOLZAIR:  { id: 'golzair',  name: 'GOLZAIR',  price: 1.99  },
  LIGA:     { id: 'liga',     name: 'LIGA',      price: 4.99  },
  PRO:      { id: 'pro',      name: 'PRO',       price: 9.99  },
  STARTER:  { id: 'starter',  name: 'STARTER',   price: 29.99 },
  BUSINESS: { id: 'business', name: 'BUSINESS',  price: 79.99 },
};

export async function createPaymentPreference(
  planId: string,
  _userId: string,
  _userEmail: string,
) {
  try {
    const createPreference = httpsCallable(functions, 'createPaymentPreference');
    const result = await createPreference({ planId });
    const data = result.data as any;

    return {
      success: true,
      preferenceId: data.preferenceId,
      initPoint: data.initPoint,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// 👇 NUEVA FUNCIÓN WOMPI
export async function createWompiPaymentSession(
  planId: string,
  _userId: string,
  _userEmail: string,
) {
  try {
    const createWompi = httpsCallable(functions, 'createWompiPayment');
    const result = await createWompi({ planId });
    const data = result.data as any;

    return {
      success: true,
      reference: data.reference,
      amountCents: data.amountCents,
      currency: data.currency,
      signature: data.signature,
      publicKey: data.publicKey,
      redirectUrl: data.redirectUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}