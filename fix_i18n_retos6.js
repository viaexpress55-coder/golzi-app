const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Fix SI/NO
home = home.replace(
  `? [{ val:'yes', label:t('home_si') || 'SI' }, { val:'no', label:'NO' }]`,
  `? [{ val:'yes', label:t('home_si') }, { val:'no', label:t('home_no') }]`
);

// Fix RETOS RAPIDOS title
home = home.replace(
  `'RETOS RAPIDOS'`,
  `t('home_retos_rapidos')`
);

// También buscar con tildes
home = home.replace(
  `'RETOS RÁPIDOS'`,
  `t('home_retos_rapidos')`
);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK:', home.includes("t('home_no')"));