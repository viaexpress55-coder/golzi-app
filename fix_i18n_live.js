const fs = require('fs');
let live = fs.readFileSync('src/screens/live/LiveScreen.tsx', 'utf8');

live = live.replace(`'ESTADIO'`, `t('live_estadio')`);
live = live.replace(`'PRIMER TIEMPO'`, `t('live_first_half')`);
live = live.replace(`'SEGUNDO TIEMPO'`, `t('live_second_half')`);
live = live.replace(`'POSESIÓN'`, `t('live_possession')`);
live = live.replace(`'TIROS AL ARCO'`, `t('live_shots')`);
live = live.replace(`'FALTAS'`, `t('live_fouls')`);
live = live.replace(`'TARJETAS'`, `t('live_cards')`);
live = live.replace(`'TIROS DE ESQUINA'`, `t('live_corners')`);
live = live.replace(`'GOAL'`, `'GOAL'`); // evento API — no traducir
live = live.replace(/label:\s*'PRIMER TIEMPO'/, `label: t('live_first_half')`);
live = live.replace(/label:\s*'SEGUNDO TIEMPO'/, `label: t('live_second_half')`);

fs.writeFileSync('src/screens/live/LiveScreen.tsx', live);
console.log('OK');