const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// 1. Agregar estado isInLeague UNA SOLA VEZ
home = home.replace(
  `const [retosSaved, setRetosSaved]     = useState<Record<string,boolean>>({});`,
  `const [retosSaved, setRetosSaved]     = useState<Record<string,boolean>>({});
  const [isInLeague, setIsInLeague]     = useState(false);`
);

// 2. Query de liga al cargar usuario
home = home.replace(
  `console.log('Plan cargado:', planValue, 'UID:', user.uid, 'time:', Date.now());`,
  `console.log('Plan cargado:', planValue, 'UID:', user.uid, 'time:', Date.now());
        getDocs(query(collection(db, 'leagues'), where('memberIds', 'array-contains', user.uid)))
          .then(snap => setIsInLeague(!snap.empty)).catch(() => setIsInLeague(false));`
);

// 3. isPaid incluye usuarios en liga
home = home.replace(
  `const isPaid = userPlan !== 'free';`,
  `const isPaid = userPlan !== 'free' || isInLeague;`
);

// 4. Texto footer retos
home = home.replace(
  `>⚡ Retos Rápidos solo para GOLZAIR+</Text>`,
  `>⚡ {t('home_retos_rapidos')} · para miembros de liga</Text>`
);

// 5. Días dinámicos
home = home.replace(
  `{ val:35, lbl:t('home_days') },`,
  `{ val:Math.max(0, Math.ceil((new Date('2026-07-19').getTime() - Date.now()) / 86400000)), lbl:t('home_days') },`
);

// 6. Reaplicar fixes de retos (se perdieron con el revert)
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
home = home.replace(
  '<Text style={rs.retoLabel}>{reto.label}</Text>',
  '<Text style={rs.retoLabel}>{t(reto.label)}</Text>'
);

// useTranslation en RetoCard
const retoCardIdx = home.indexOf('function RetoCard');
const isPaidIdx = home.indexOf("const isPaid = userPlan !== 'free';", retoCardIdx);
if (!home.substring(retoCardIdx, isPaidIdx).includes('useTranslation')) {
  home = home.slice(0, isPaidIdx) + "const { t } = useTranslation();\r\n  " + home.slice(isPaidIdx);
}

// traducir reto en map
home = home.replace(
  'reto={reto} match={m}',
  'reto={{...reto, label: t(reto.label)}} match={m}'
);

// SI/NO
home = home.replace(
  /\[\{ val:'yes', label:'[^']+' \}, \{ val:'no', label:'NO' \}\]/,
  "[{ val:'yes', label:t('home_si') }, { val:'no', label:t('home_no') }]"
);

// LOCAL/EMPATE/VISITA/NINGUNO
home = home.replace(/>LOCAL</g, ">{t('reto_local')}<");
home = home.replace(/>EMPATE</g, ">{t('reto_empate')}<");
home = home.replace(/>VISITA</g, ">{t('reto_visita')}<");
home = home.replace(/>NINGUNO</g, ">{t('reto_ninguno')}<");

// RETOS RÁPIDOS title
const retosToggleIdx = home.indexOf('retosToggleTitle');
const textStart = home.indexOf('>', retosToggleIdx) + 1;
const textEnd = home.indexOf('<', textStart);
const currentText = home.slice(textStart, textEnd);
if (currentText.includes('RETOS')) {
  home = home.slice(0, textStart) + "{t('home_retos_rapidos')}" + home.slice(textEnd);
}

// Anon block
home = home.replace(
  `'Cuenta requerida'`,
  `t('home_account_required')`
);
home = home.replace(
  `'Debes crear una cuenta para predecir. Es gratis!'`,
  `t('home_need_account_predict')`
);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK');
console.log('isInLeague:', home.includes('isInLeague'));
console.log('reto_first_goal:', home.includes('reto_first_goal'));
console.log('dias dinamicos:', home.includes('2026-07-19'));