const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Reemplazar labels hardcodeados con claves i18n en los arrays
home = home.replace(
  `{ id:'first_goal', label:'¿Quién marca primero?',  type:'team', pts:5, icon:'⚽' }`,
  `{ id:'first_goal', label:'reto_first_goal', type:'team', pts:5, icon:'⚽' }`
);
home = home.replace(
  `{ id:'over_goals', label:'¿Más de 2.5 goles?',    type:'yn',   pts:3,  icon:'🎯' }`,
  `{ id:'over_goals', label:'reto_over_goals', type:'yn', pts:3, icon:'🎯' }`
);
home = home.replace(
  `{ id:'red_card',   label:'¿Habrá tarjeta roja?',  type:'yn',   pts:3,  icon:'🟥' }`,
  `{ id:'red_card',   label:'reto_red_card', type:'yn', pts:3, icon:'🟥' }`
);
home = home.replace(
  `{ id:'ht_result',  label:'¿Resultado al descanso?',type:'1x2',  pts:4,  icon:'⏱' }`,
  `{ id:'ht_result',  label:'reto_ht_result', type:'1x2', pts:4, icon:'⏱' }`
);
home = home.replace(
  `{ id:'penalty', label:'¿Habrá penalti?', type:'yn', pts:4, icon:'🎽' }`,
  `{ id:'penalty', label:'reto_penalty', type:'yn', pts:4, icon:'🎽' }`
);

// Reemplazar donde se muestra el label — usar t(reto.label)
home = home.replace(
  `<Text style={s.retoLabel}>{reto.label}</Text>`,
  `<Text style={s.retoLabel}>{t(reto.label)}</Text>`
);

// Reemplazar LOCAL/EMPATE/VISITA/NINGUNO hardcodeados
home = home.replace(`'LOCAL'`,  `t('reto_local')`);
home = home.replace(`'EMPATE'`, `t('reto_empate')`);
home = home.replace(`'VISITA'`, `t('reto_visita')`);
home = home.replace(`'NINGUNO'`,`t('reto_ninguno')`);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK HomeScreen retos');