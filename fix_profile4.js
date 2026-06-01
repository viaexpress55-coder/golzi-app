const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

profile = profile.replace(
  'totalPredictions = history.length;',
  'totalPredictions = history.length + challenges.length;'
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK:', profile.includes('challenges.length'));