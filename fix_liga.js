const fs = require('fs');
let content = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Fix: mostrar plan real en pantalla CREAR
content = content.replace(
  `<Text style={s.formSub}>Necesitas plan LIGA o superior</Text>`,
  `<Text style={s.formSub}>Tu plan: {(userData?.plan || 'LIGA').toUpperCase()} · hasta {getMaxMembersByPlan(userData?.plan || 'liga')} jugadores</Text>`
);

// Fix: mostrar features correctos según plan
content = content.replace(
  `<Text style={s.featTitle}>⚡ PLAN LIGA</Text>`,
  `<Text style={s.featTitle}>⚡ PLAN {(userData?.plan || 'LIGA').toUpperCase()}</Text>`
);

content = content.replace(
  `{['Hasta 5 jugadores','Código QR de invitación','Ranking privado en tiempo real','Chat de liga'].map((f,i) => (`,
  `{[
                  'Hasta ' + getMaxMembersByPlan(userData?.plan || 'liga') + ' jugadores',
                  ...((['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((userData?.plan||'').toUpperCase())) ? ['QR de invitación'] : []),
                  'Ranking privado en tiempo real',
                  'Chat de liga',
                  ...((['MASTER','GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((userData?.plan||'').toUpperCase())) ? ['Tabla de predicciones del grupo'] : []),
                ].map((f,i) => (`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', content);
console.log('OK - pantalla CREAR actualizada');