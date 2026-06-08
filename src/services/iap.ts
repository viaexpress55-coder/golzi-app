import * as IAP from 'expo-iap';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';

export const PRODUCT_IDS: Record<string, string> = {
  liga:     'golzi_liga_5',
  pro:      'golzi_pro_10',
  master:   'golzi_master_25',
  golzair:  'golzi_golzair_100',
  partner:  'golzi_partner_500',
  business: 'golzi_business_1000',
  gold:     'golzi_gold_2500',
};

// Mapa de productId → planId
const PRODUCT_TO_PLAN: Record<string, string> = {
  golzi_liga_5:        'liga',
  golzi_pro_10:        'pro',
  golzi_master_25:     'master',
  golzi_golzair_100:   'golzair',
  golzi_partner_500:   'partner',
  golzi_business_1000: 'business',
  golzi_gold_2500:     'gold',
};

// Mapa de planId → cupos
const PLAN_SLOTS: Record<string, number> = {
  liga: 5, pro: 10, master: 25, golzair: 100,
  partner: 500, business: 1000, gold: 2500,
};

let purchaseSubscription: any = null;
let errorSubscription: any = null;

export async function initIAP() {
  try {
    await IAP.initConnection();
    console.log('✅ IAP conectado');

    // Listener de compras exitosas
    purchaseSubscription = IAP.purchaseUpdatedListener(async (purchase: any) => {
      console.log('🛒 Compra recibida:', purchase);
      try {
        const productId = purchase.productId;
        const planId = PRODUCT_TO_PLAN[productId];
        if (!planId) {
          console.error('Plan no encontrado para:', productId);
          return;
        }

        const user = getAuth().currentUser;
        if (!user) {
          console.error('Usuario no autenticado');
          return;
        }

        // Activar plan en Firestore
        const planExpiry = new Date('2027-01-19T00:00:00.000Z');
        await updateDoc(doc(db, 'users', user.uid), {
          plan:             planId,
          planSlots:        PLAN_SLOTS[planId] ?? 5,
          planActivatedAt:  serverTimestamp(),
          planExpiry:       planExpiry,
          planProvider:     'google_play',
          purchaseToken:    purchase.purchaseToken || '',
          transactionId:    purchase.transactionId || '',
        });

        console.log(`✅ Plan ${planId} activado para ${user.uid}`);

        // Confirmar la compra a Google Play (obligatorio)
        if (purchase.purchaseToken) {
          await IAP.finishTransaction({ purchase, isConsumable: false });
          console.log('✅ Compra confirmada a Google Play');
        }
      } catch (e) {
        console.error('❌ Error activando plan:', e);
      }
    });

    // Listener de errores
    errorSubscription = IAP.purchaseErrorListener((error: any) => {
      console.log('❌ Error IAP:', error);
    });

  } catch (e) {
    console.log('❌ IAP init error:', e);
    throw e;
  }
}

export async function getProducts() {
  try {
    const products = await IAP.getProducts({ skus: Object.values(PRODUCT_IDS) });
    return products;
  } catch (e) {
    console.log('❌ Error obteniendo productos:', e);
    return [];
  }
}

export async function purchaseProduct(productId: string) {
  try {
    await IAP.requestPurchase({ sku: productId });
  } catch (e) {
    console.log('❌ Error en compra:', e);
    throw e;
  }
}

export async function endIAP() {
  if (purchaseSubscription) {
    purchaseSubscription.remove();
    purchaseSubscription = null;
  }
  if (errorSubscription) {
    errorSubscription.remove();
    errorSubscription = null;
  }
  await IAP.endConnection();
}
