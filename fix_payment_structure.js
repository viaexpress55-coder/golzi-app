const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

// Eliminar el </View> extra en línea 219
payment = payment.replace(
  `          </View>}\r\n          </View>\r\n\r\n          <TouchableOpacity`,
  `          </View>}\r\n          <TouchableOpacity`
);

// También con \n solo
payment = payment.replace(
  `          </View>}\n          </View>\n\n          <TouchableOpacity`,
  `          </View>}\n          <TouchableOpacity`
);

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);

// Verificar líneas 215-225
const lines = payment.split('\n');
for(let i=210;i<235;i++) console.log(i+1+':', lines[i]);