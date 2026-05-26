import * as IAP from 'expo-iap';

export const PRODUCT_IDS = {
  GOLZAIR: 'golzi_golzair',
  LIGA: 'golzi_liga',
  PRO: 'golzi_pro',
};

export async function initIAP() {
  try {
    await IAP.initConnection();
    console.log('✅ IAP conectado');
  } catch (e) {
    console.log('❌ IAP error:', e);
  }
}

export async function getProducts() {
  try {
    const products = await IAP.getSubscriptions({
      skus: Object.values(PRODUCT_IDS),
    });
    return products;
  } catch (e) {
    console.log('❌ Error obteniendo productos:', e);
    return [];
  }
}

export async function purchaseSubscription(productId: string) {
  try {
    await IAP.requestSubscription({ sku: productId });
  } catch (e) {
    console.log('❌ Error en compra:', e);
    throw e;
  }
}

export async function endIAP() {
  await IAP.endConnection();
}