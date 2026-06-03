const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

// Encontrar el índice del bloque
const start = payment.indexOf('MÉTODO DE PAGO</Text>');
const end = payment.indexOf('</View>', payment.indexOf('💵 Efecty')) + '</View>'.length;

console.log('Bloque encontrado:', payment.substring(start-20, end+20));

// Reemplazar por índices
const before = payment.slice(0, start - '<Text style={s.paymentTitle}>'.length);
const after = payment.slice(end);

const newBlock = `{Platform.OS !== 'android' && <Text style={s.paymentTitle}>MÉTODO DE PAGO</Text>}
          {Platform.OS !== 'android' && <View style={s.methodsRow}>
            <View style={s.methodPill}><Text style={s.methodTxt}>💳 Tarjeta</Text></View>
            <View style={s.methodPill}><Text style={s.methodTxt}>🏦 PSE</Text></View>
            <View style={s.methodPill}><Text style={s.methodTxt}>📱 Nequi</Text></View>
            <View style={s.methodPill}><Text style={s.methodTxt}>💵 Efecty</Text></View>
          </View>}`;

payment = before + newBlock + after;

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK:', payment.includes("Platform.OS !== 'android' && <Text style={s.paymentTitle}>"));