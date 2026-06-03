const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

// Fix: eliminar el </View> extra después del bloque condicional
payment = payment.replace(
  `          </View>}
          </View>
          <TouchableOpacity`,
  `          </View>}
          <TouchableOpacity`
);

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK');