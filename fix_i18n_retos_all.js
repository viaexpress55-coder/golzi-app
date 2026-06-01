const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// 1. Labels de RETOS_GRUPOS
home = home.replace(
  /\{ id:'first_goal', label:'[^']+'/,
  "{ id:'first_goal', label:'reto_first_goal'"
);
home = home.replace(
  /\{ id:'over_goals', label:'[^']+'/,
  "{ id:'over_goals', label:'reto_over_goals'"
);
home = home.replace(
  /\{ id:'red_card',\s+label:'[^']+'/,
  "{ id:'red_card',   label:'reto_red_card'"
);
home = home.replace(
  /\{ id:'ht_result',\s+label:'[^']+'/,
  "{ id:'ht_result',  label:'reto_ht_result'"
);
home = home.replace(
  /\{ id:'penalty', label:'[^']+'/,
  "{ id:'penalty', label:'reto_penalty'"
);

// 2. t(reto.label) en RetoCard
home = home.replace(
  '<Text style={rs.retoLabel}>{reto.label}</Text>',
  '<Text style={rs.retoLabel}>{t(reto.label)}</Text>'
);

// 3. useTranslation en RetoCard
const retoCardIdx = home.indexOf('function RetoCard');
const isPaidIdx = home.indexOf("const isPaid = userPlan !== 'free';", retoCardIdx);
if (!home.includes("const { t } = useTranslation();\r\n  const isPaid")) {
  home = home.slice(0, isPaidIdx) + "const { t } = useTranslation();\r\n  " + home.slice(isPaidIdx);
}

// 4. Traducir reto en el map
home = home.replace(
  'reto={reto} match={m}',
  'reto={{...reto, label: t(reto.label)}} match={m}'
);

// 5. SI/NO
home = home.replace(
  /\[\{ val:'yes', label:'[^']+' \}, \{ val:'no', label:'NO' \}\]/,
  "[{ val:'yes', label:t('home_si') }, { val:'no', label:t('home_no') }]"
);

// 6. LOCAL/EMPATE/VISITA/NINGUNO en opciones
home = home.replace(/>LOCAL</g, ">{t('reto_local')}<");
home = home.replace(/>EMPATE</g, ">{t('reto_empate')}<");
home = home.replace(/>VISITA</g, ">{t('reto_visita')}<");
home = home.replace(/>NINGUNO</g, ">{t('reto_ninguno')}<");

// 7. RETOS RÁPIDOS en JSX — buscar con índice exacto
const retosToggleIdx = home.indexOf('retosToggleTitle');
const textStart = home.indexOf('>', retosToggleIdx) + 1;
const textEnd = home.indexOf('<', textStart);
const currentText = home.slice(textStart, textEnd);
console.log('Texto actual en retosToggleTitle:', currentText);
if (currentText.includes('RETOS')) {
  home = home.slice(0, textStart) + "{t('home_retos_rapidos')}" + home.slice(textEnd);
}

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK');
console.log('reto_first_goal:', home.includes('reto_first_goal'));
console.log('t(reto.label):', home.includes('t(reto.label)'));
console.log('home_retos_rapidos:', home.includes('home_retos_rapidos'));
console.log('home_si:', home.includes("t('home_si')"));