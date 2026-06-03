const fs = require('fs');
let plans = fs.readFileSync('src/screens/plans/PlansScreen.tsx', 'utf8');

plans = plans.replace(
  `id:'business', emoji:'🏢', name:'BUSINESS', price:'$499.99', originalPrice:null,\r\n    users:1000, perUser:'$0.50', saving:'75%'`,
  `id:'business', emoji:'🏢', name:'BUSINESS', price:'$499.99', originalPrice:'$649.99',\r\n    users:1000, perUser:'$0.50', saving:'23%'`
);

plans = plans.replace(
  `id:'business', emoji:'🏢', name:'BUSINESS', price:'$499.99', originalPrice:null,\n    users:1000, perUser:'$0.50', saving:'75%'`,
  `id:'business', emoji:'🏢', name:'BUSINESS', price:'$499.99', originalPrice:'$649.99',\n    users:1000, perUser:'$0.50', saving:'23%'`
);

// Gold
plans = plans.replace(
  `originalPrice:null,\r\n    users:2500`,
  `originalPrice:'$1,299.99',\r\n    users:2500`
);
plans = plans.replace(
  `originalPrice:null,\n    users:2500`,
  `originalPrice:'$1,299.99',\n    users:2500`
);

fs.writeFileSync('src/screens/plans/PlansScreen.tsx', plans);
console.log('OK business:', plans.includes("originalPrice:'$649.99'"));
console.log('OK gold:', plans.includes("originalPrice:'$1,299.99'"));