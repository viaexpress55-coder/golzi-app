// src/services/payments.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const PLANS = {
  liga:      { id: 'liga',      name: 'LIGA',      price: 9.95   },
  pro:       { id: 'pro',       name: 'PRO',        price: 18.99  },
  master:    { id: 'master',    name: 'MASTER',     price: 39.99  },
  golzair:   { id: 'golzair',   name: 'GOLZAIR',    price: 99.99  },
  partner:   { id: 'partner',   name: 'PARTNER',    price: 349.99 },
  business:  { id: 'business',  name: 'BUSINESS',   price: 499.99 },
  gold:      { id: 'gold',      name: 'GOLD',        price: 999.99 },
  golziplus: { id: 'golziplus', name: 'GOLZI+',     price: 1.00   },
};

export async function createPaymentPreference(planId: string) {
  try {
    const createPreference = httpsCallable(functions, 'createPaymentPreference');
    const result = await createPreference({ planId: planId.toUpperCase() });
    const data = result.data as any;
    return { success: true, preferenceId: data.preferenceId, initPoint: data.initPoint };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createWompiPaymentSession(planId: string, userId: string, userEmail: string) {
  try {
    const createWompi = httpsCallable(functions, 'createWompiPayment');
    const result = await createWompi({ planId: planId.toUpperCase(), userId, userEmail });
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