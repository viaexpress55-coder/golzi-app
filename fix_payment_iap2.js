const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

// Encontrar el catch del IAP y modificarlo
const catchIdx = payment.indexOf("console.log('IAP no disponible, usando Wompi...'");
const catchEnd = payment.indexOf('}', catchIdx) + 1;

console.log('catch encontrado:', payment.substring(catchIdx - 20, catchEnd + 20));

// Reemplazar solo el contenido del catch
const oldCatch = payment.substring(catchIdx, catchEnd);
const newCatch = `console.log('IAP error:', iapError);
            const errMsg = (iapError as any)?.message || '';
            if (!errMsg.includes('cancel')) {
              setError('Error con Google Play. Verifica tu cuenta e intenta de nuevo.');
            }
            setLoading(false);
            return;
          }`;

payment = payment.slice(0, catchIdx) + newCatch + payment.slice(catchEnd);

// Agregar return al bloque android para no continuar con Wompi
const androidEnd = payment.indexOf('// B2B', payment.indexOf('Platform.OS'));
console.log('Android block end:', androidEnd);

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK:', payment.includes('Error con Google Play'));