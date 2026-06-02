const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

const idx = payment.indexOf("if (Platform.OS === 'android') {");
const insertPoint = payment.indexOf('\r\n', idx) + 2;

const insert = `        // PREMIUM — solo por WhatsApp\r\n        if (planId === 'golziplus') {\r\n          await Linking.openURL('https://wa.me/573054325588?text=Hola%2C%20me%20interesa%20el%20plan%20GOLZI%20PREMIUM');\r\n          setLoading(false);\r\n          return;\r\n        }\r\n`;

payment = payment.slice(0, insertPoint) + insert + payment.slice(insertPoint);
fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK:', payment.includes('golziplus'));