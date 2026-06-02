const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

home = home.replace(
  `{ val:matches.filter(m => m.status !== 'finished').length, lbl:t('home_matches') },
            { val:104, lbl:t('home_total') },`,
  `{ val:matches.filter(m => m.status !== 'finished').length, lbl:t('home_matches') },
            { val:Math.max(0, 104 - matches.filter(m => m.status === 'finished').length), lbl:t('home_total') },`
);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK');