const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

// Agregar el View de paymentSection que falta
payment = payment.replace(
  `        {/* Métodos de pago */}
        <View style={s.paymentSection}>
          {Platform.OS !== 'android' && <Text style={s.paymentTitle}>MÉTODO DE PAGO</Text>}`,
  `        {/* Métodos de pago */}
        <View style={s.paymentSection}>`
);

// Buscar si existe paymentSection
const idx = payment.indexOf('paymentSection}>');
console.log('paymentSection en:', idx);
console.log('contexto:', payment.substring(idx-20, idx+200));

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);