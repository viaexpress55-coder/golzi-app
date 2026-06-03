const fs = require('fs');
let wompi = fs.readFileSync('functions/src/payments/createWompiPayment.ts', 'utf8');

wompi = wompi.replace(
  `LIGA:      { id: 'liga',      name: 'LIGA',      amountCents: 999000,   description: '5 jugadores · $1.99/jugador' },`,
  `LIGA:      { id: 'liga',      name: 'LIGA',      amountCents: 3650000,   description: '5 jugadores · $9.99 USD' },`
);
wompi = wompi.replace(
  `PRO:       { id: 'pro',       name: 'PRO',        amountCents: 7596000,   description: '10 jugadores · $1.90/jugador · 5% ahorro' },`,
  `PRO:       { id: 'pro',       name: 'PRO',        amountCents: 6930000,   description: '10 jugadores · $18.99 USD' },`
);
wompi = wompi.replace(
  `MASTER:    { id: 'master',    name: 'MASTER',     amountCents: 15996000,  description: '25 jugadores · $1.60/jugador · 20% ahorro' },`,
  `MASTER:    { id: 'master',    name: 'MASTER',     amountCents: 14590000,  description: '25 jugadores · $39.99 USD' },`
);
wompi = wompi.replace(
  `GOLZAIR:   { id: 'golzair',   name: 'GOLZAIR',    amountCents: 39996000,  description: '100 usuarios · $1.00/usuario · 50% ahorro' },`,
  `GOLZAIR:   { id: 'golzair',   name: 'GOLZAIR',    amountCents: 36490000,  description: '100 usuarios · $99.99 USD' },`
);
wompi = wompi.replace(
  `PARTNER:   { id: 'partner',   name: 'PARTNER',    amountCents: 139996000, description: '500 usuarios · $0.70/usuario · 65% ahorro' },`,
  `PARTNER:   { id: 'partner',   name: 'PARTNER',    amountCents: 127740000, description: '500 usuarios · $349.99 USD' },`
);
wompi = wompi.replace(
  `BUSINESS:  { id: 'business',  name: 'BUSINESS',   amountCents: 199996000, description: '1,000 usuarios · $0.50/usuario · 75% ahorro' },`,
  `BUSINESS:  { id: 'business',  name: 'BUSINESS',   amountCents: 182490000, description: '1,000 usuarios · $499.99 USD' },`
);
wompi = wompi.replace(
  `GOLD:      { id: 'gold',      name: 'GOLD',       amountCents: 399996000, description: '2,500 usuarios · $0.40/usuario · 80% ahorro' },`,
  `GOLD:      { id: 'gold',      name: 'GOLD',       amountCents: 364990000, description: '2,500 usuarios · $999.99 USD' },`
);

fs.writeFileSync('functions/src/payments/createWompiPayment.ts', wompi);
console.log('OK LIGA:', wompi.includes('3650000'));