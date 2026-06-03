const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

const start = payment.indexOf('<Text style={s.securityTxt}>');
const end = payment.indexOf('</Text>', start) + '</Text>'.length;

console.log('Bloque:', payment.substring(start, end));

const newText = `<Text style={s.securityTxt}>
            {Platform.OS === 'android' 
              ? 'Pago seguro procesado por Google Play. Los puntos no tienen valor monetario. Sin apuestas. 100% legal.' 
              : 'Procesado por Mercado Pago o Wompi. GOLZI no almacena datos de tarjeta. Los puntos no tienen valor monetario. Sin apuestas. 100% legal.'}
          </Text>`;

payment = payment.slice(0, start) + newText + payment.slice(end);

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK');