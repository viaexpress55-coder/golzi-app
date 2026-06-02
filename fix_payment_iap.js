const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

payment = payment.replace(
  `      // Android — Google Play Billing
      if (Platform.OS === 'android') {
        const productId = PRODUCT_IDS[planId as keyof typeof PRODUCT_IDS];
        if (productId) {
          try {
            await initIAP();
            await purchaseProduct(productId);
            return;
          } catch (iapError) {
            console.log('IAP no disponible, usando Wompi...', iapError);
          }
        }
      }`,
  `      // Android — Google Play Billing
      if (Platform.OS === 'android') {
        const productId = PRODUCT_IDS[planId as keyof typeof PRODUCT_IDS];
        if (productId) {
          try {
            await initIAP();
            await purchaseProduct(productId);
            return;
          } catch (iapError: any) {
            console.log('IAP error:', iapError);
            const errMsg = iapError?.message || '';
            if (!errMsg.includes('cancel') && !errMsg.includes('E_USER_CANCELLED')) {
              setError('Error al procesar el pago con Google Play. Intenta de nuevo.');
            }
            setLoading(false);
            return;
          }
        }
        // Plan B2B sin IAP — usar Wompi via Linking
        if (!PRODUCT_IDS[planId as keyof typeof PRODUCT_IDS]) {
          const wompiResult = await createWompiPaymentSession(planId, userId, email);
          if (wompiResult.success && wompiResult.publicKey) {
            const wompiUrl = \`https://checkout.wompi.co/p/?public-key=\${wompiResult.publicKey}&currency=\${wompiResult.currency}&amount-in-cents=\${wompiResult.amountCents}&reference=\${wompiResult.reference}&signature%3Aintegrity=\${wompiResult.signature}&redirect-url=\${encodeURIComponent('https://golzi.app')}\`;
            await Linking.openURL(wompiUrl);
            setLoading(false);
            return;
          }
        }
        setLoading(false);
        return;
      }`
);

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK');