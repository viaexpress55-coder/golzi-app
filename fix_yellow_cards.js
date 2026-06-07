const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Verificar estado actual
console.log('red_card existe:', home.includes("id:'red_card'"));
console.log('yellow_cards existe:', home.includes("id:'yellow_cards'"));

// Cambio 1: reto red_card → yellow_cards
home = home.replace(
  "{ id:'red_card',   label:'reto_red_card',  type:'yn',   pts:3,  icon:'",
  "{ id:'yellow_cards', label:'reto_yellow_cards', type:'range', pts:3, icon:'🟨' },\n  // REPLACED: { id:'red_card_OLD', label:'reto_red_card_OLD',  type:'yn',   pts:3,  icon:'"
);

// Cambio 2: agregar soporte tipo 'range' en opciones
if (!home.includes("type:'range'") && !home.includes('reto_yellow_cards_DONE')) {
  home = home.replace(
    `const options = reto.type === 'yn'
    ? [{ val:'yes', label:t('home_si') }, { val:'no', label:t('home_no') }]
    : reto.type === '1x2'`,
    `const options = reto.type === 'yn'
    ? [{ val:'yes', label:t('home_si') }, { val:'no', label:t('home_no') }]
    : reto.type === 'range'
    ? [{ val:'0-2', label:'0-2' }, { val:'3-4', label:'3-4' }, { val:'5-6', label:'5-6' }, { val:'7+', label:'7+' }]
    : reto.type === '1x2'`
  );
}

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home, 'utf8');
console.log('yellow_cards después:', home.includes('yellow_cards'));
console.log('range después:', home.includes("type:'range'"));
console.log('✅ Script completado.');