const fs = require('fs');
const files = [
  'src/screens/ranking/RankingScreen.tsx',
  'src/screens/mundial/MundialScreen.tsx',
  'src/screens/live/LiveScreen.tsx',
  'src/screens/plans/PlansScreen.tsx',
  'src/screens/plans/PaymentScreen.tsx',
];

const skip = ['rgba','fontFamily','Barlow','Bebas','center','absolute','flex','hidden','users','firebase','react','require','import','export','string','number','boolean','Record','Array','Object','Query','where','query','collection','orderBy','limit','onSnapshot','getDocs','getDoc','updateDoc','setDoc','doc','null','true','false','undefined'];

files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/'[A-Za-zÀ-ÿА-я][^']{3,80}'/g);
  if (m) {
    const filtered = [...new Set(m)].filter(x => !skip.some(s => x.includes(s)));
    if (filtered.length) {
      console.log('\n---', f, '---');
      filtered.forEach(x => console.log(x));
    }
  }
});