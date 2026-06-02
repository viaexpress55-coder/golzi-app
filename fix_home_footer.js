const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Fix +53 → +15 (suma de retos: 5+3+3+4=15)
home = home.replace(
  `<Text style={[s.ptsVal, { color:C.purple }]}>+53</Text>`,
  `<Text style={[s.ptsVal, { color:C.purple }]}>+15</Text>`
);

// Fix RETOS MAX → texto i18n
home = home.replace(
  `<Text style={s.ptsLbl}>RETOS MAX</Text>`,
  `<Text style={s.ptsLbl}>{t('home_retos_rapidos')}</Text>`
);

// Fix texto footer "para miembros de liga"
home = home.replace(
  `>{t('home_retos_rapidos')} · para miembros de liga</Text>`,
  `>{t('home_retos_info') || t('home_retos_rapidos')}</Text>`
);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK:', home.includes('+15'));