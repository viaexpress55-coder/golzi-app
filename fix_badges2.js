const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Encontrar el array BADGES
const badgesStart = profile.indexOf('const BADGES = [');
const badgesEnd = profile.indexOf('];', badgesStart) + 2;
console.log('BADGES encontrado:', badgesStart, badgesEnd);

const newBadges = `function getBadges(exactPredictions: number, maxStreak: number, totalPredictions: number, rankPosition: number | null) {
  return [
    { icon:'🎯', name:'Primer Exacto',  desc:'Primera prediccion exacta',  earned: exactPredictions >= 1 },
    { icon:'🔥', name:'Racha x3',       desc:'3 correctas seguidas',        earned: maxStreak >= 3 },
    { icon:'⚡', name:'Goleador',       desc:'10 predicciones exactas',     earned: exactPredictions >= 10 },
    { icon:'🏆', name:'Campeon',        desc:'Gana una liga privada',       earned: false },
    { icon:'🌍', name:'Mundial',        desc:'Predice todos los partidos',  earned: totalPredictions >= 104 },
    { icon:'👑', name:'GOLZI Elite',    desc:'Top 10 global',               earned: rankPosition !== null && rankPosition <= 10 },
  ];
}`;

profile = profile.slice(0, badgesStart) + newBadges + profile.slice(badgesEnd);

// Reemplazar BADGES.map por getBadges()
profile = profile.replace(
  '{BADGES.map((badge, i) => (',
  '{getBadges(exactPredictions, maxStreak, totalPredictions, rankPosition).map((badge, i) => ('
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK getBadges:', profile.includes('getBadges'));
console.log('OK render:', profile.includes('getBadges(exactPredictions'));