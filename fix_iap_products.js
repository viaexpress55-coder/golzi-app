const fs = require('fs');
let iap = fs.readFileSync('src/services/iap.ts', 'utf8');

const start = iap.indexOf('export const PRODUCT_IDS');
const end = iap.indexOf('};', start) + 2;

const newProducts = `export const PRODUCT_IDS: Record<string, string> = {
  liga:     'golzi_liga_5',
  pro:      'golzi_pro_10',
  master:   'golzi_master_25',
  golzair:  'golzi_golzair_100',
  partner:  'golzi_partner_500',
  business: 'golzi_business_1000',
  gold:     'golzi_gold_2500',
};`;

iap = iap.slice(0, start) + newProducts + iap.slice(end);
fs.writeFileSync('src/services/iap.ts', iap);
console.log('OK:', iap.includes('golzi_partner_500'));