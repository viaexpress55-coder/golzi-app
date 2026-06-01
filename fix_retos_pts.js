const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Actualizar puntos de retos
home = home.replace(
  `{ id:'first_goal', label:'¿Quién marca primero?',  type:'team', pts:15, icon:'⚡' }`,
  `{ id:'first_goal', label:'¿Quién marca primero?',  type:'team', pts:5,  icon:'⚡' }`
);
home = home.replace(
  `{ id:'over_goals', label:'¿Más de 2.5 goles?',    type:'yn',   pts:8,  icon:'🎯' }`,
  `{ id:'over_goals', label:'¿Más de 2.5 goles?',    type:'yn',   pts:3,  icon:'🎯' }`
);
home = home.replace(
  `{ id:'red_card',   label:'¿Habrá tarjeta roja?',  type:'yn',   pts:8,  icon:'🟥' }`,
  `{ id:'red_card',   label:'¿Habrá tarjeta roja?',  type:'yn',   pts:3,  icon:'🟥' }`
);
home = home.replace(
  `{ id:'ht_result',  label:'¿Resultado al descanso?',type:'1x2',  pts:12, icon:'⏱' }`,
  `{ id:'ht_result',  label:'¿Resultado al descanso?',type:'1x2',  pts:4,  icon:'⏱' }`
);
home = home.replace(
  `{ id:'penalty', label:'¿Habrá penalti?', type:'yn', pts:10, icon:'🥅' }`,
  `{ id:'penalty', label:'¿Habrá penalti?', type:'yn', pts:4,  icon:'🥅' }`
);

// Actualizar también en onMatchFinishChallenges.ts
let challenges = fs.readFileSync('functions/src/predictions/onMatchFinishChallenges.ts', 'utf8');
challenges = challenges.replace(
  `const RETO_POINTS: Record<string, number> = {
  first_goal: 15,
  over_goals: 8,
  red_card:   8,
  ht_result:  12,
  penalty:    10,
};`,
  `const RETO_POINTS: Record<string, number> = {
  first_goal: 5,
  over_goals: 3,
  red_card:   3,
  ht_result:  4,
  penalty:    4,
};`
);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
fs.writeFileSync('functions/src/predictions/onMatchFinishChallenges.ts', challenges);
console.log('OK');