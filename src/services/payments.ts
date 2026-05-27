// src/services/payments.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const PLANS = {
  golzair:  { id: 'golzair',  name: 'GOLZAIR',      price: 1.99  },
  liga:     { id: 'liga',     name: 'LIGA',          price: 4.99  },
  pro:      { id: 'pro',      name: 'PRO FLEX',      price: 9.99  },
  business: { id: 'business', name: 'BUSINESS',      price: 49.99 },
  golzigold:{ id: 'golzigold',name: 'GOLZI GOLD',    price: 999   },
};

export async function createPaymentPreference(planId: string) {
  try {
    const createPreference = httpsCallable(functions, 'createPaymentPreference');
    const result = await createPreference({ planId });
    const data = result.data as any;
    return { success: true, preferenceId: data.preferenceId, initPoint: data.initPoint };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createWompiPaymentSession(planId: string, userId: string, userEmail: string) {
  try {
    const createWompi = httpsCallable(functions, 'createWompiPayment');
    const result = await createWompi({ planId, userId, userEmail });
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
    return { success: false, error: error.message };
  }
}