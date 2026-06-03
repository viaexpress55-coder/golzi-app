const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Reemplazar la segunda referencia a BADGES.map
profile = profile.replace(
  '{BADGES.map((b,i) => (',
  '{getBadges(exactPredictions, maxStreak, totalPredictions, rankPosition).map((b,i) => ('
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK:', !profile.includes('{BADGES.map'));