import * as IAP from 'expo-iap';

export const PRODUCT_IDS: Record<string, string> = {
  liga:    'golzi_liga_5',
  pro:     'golzi_pro_10',
  master:  'golzi_master_25',
  golzair: 'golzi_golzair_100',
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
    const products = await IAP.getProducts({
      skus: Object.values(PRODUCT_IDS),
    });
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
  await IAP.endConnection();
}