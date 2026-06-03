const fs = require('fs');
let plans = fs.readFileSync('src/screens/plans/PlansScreen.tsx', 'utf8');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

// B2C planes con originalPrice
plans = plans.replace(
  `id:'liga', emoji:'⚡', name:'LIGA', price:'$9.99', originalPrice:null,\r\n    users:5, perUser:'$1.99', saving:'0%'`,
  `id:'liga', emoji:'⚡', name:'LIGA', price:'$9.99', originalPrice:'$12.99',\r\n    users:5, perUser:'$1.99', saving:'23%'`
);
plans = plans.replace(
  `id:'pro', emoji:'🚀', name:'PRO', price:'$18.99', originalPrice:'$19.90',\r\n    users:10, perUser:'$1.90', saving:'5%'`,
  `id:'pro', emoji:'🚀', name:'PRO', price:'$18.99', originalPrice:'$24.99',\r\n    users:10, perUser:'$1.90', saving:'24%'`
);
plans = plans.replace(
  `id:'master', emoji:'⭐', name:'MASTER', price:'$39.99', originalPrice:null,\r\n    users:25, perUser:'$1.60', saving:'20%'`,
  `id:'master', emoji:'⭐', name:'MASTER', price:'$39.99', originalPrice:'$49.99',\r\n    users:25, perUser:'$1.60', saving:'20%'`
);
plans = plans.replace(
  `id:'golzair', emoji:'🏢', name:'GOLZAIR', price:'$99.99', originalPrice:null,\r\n    users:100, perUser:'$1.00', saving:'50%'`,
  `id:'golzair', emoji:'🏢', name:'GOLZAIR', price:'$99.99', originalPrice:'$129.99',\r\n    users:100, perUser:'$1.00', saving:'23%'`
);

// B2B planes con originalPrice
plans = plans.replace(
  `id:'partner', emoji:'🤝', name:'PARTNER', price:'$349.99', originalPrice:null,\r\n    users:500, perUser:'$0.70', saving:'65%'`,
  `id:'partner', emoji:'🤝', name:'PARTNER', price:'$349.99', originalPrice:'$449.99',\r\n    users:500, perUser:'$0.70', saving:'22%'`
);

// Fix banner promo en PaymentScreen
payment = payment.replace(
  `🎯 Precio promo · Válido hasta el 10 de junio de 2026`,
  `🔥 Oferta de lanzamiento · Primeras 500 ligas`
);

fs.writeFileSync('src/screens/plans/PlansScreen.tsx', plans);
fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK liga:', plans.includes("originalPrice:'$12.99'"));
console.log('OK pro:', plans.includes("originalPrice:'$24.99'"));
console.log('OK master:', plans.includes("originalPrice:'$49.99'"));
console.log('OK golzair:', plans.includes("originalPrice:'$129.99'"));
console.log('OK banner:', payment.includes('Primeras 500 ligas'));