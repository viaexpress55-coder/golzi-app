const fs = require('fs');
const c = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');
const i = c.indexOf('function PodiumCard');
console.log(c.substring(i, i+600));