const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

const find = "reto.type === 'yn'\r\n    ? [{ val:'yes', label:t('home_si') }, { val:'no', label:t('home_no') }]\r\n    : reto.type === '1x2'";
const replace = "reto.type === 'yn'\r\n    ? [{ val:'yes', label:t('home_si') }, { val:'no', label:t('home_no') }]\r\n    : reto.type === 'range'\r\n    ? [{ val:'0-2', label:'0-2' }, { val:'3-4', label:'3-4' }, { val:'5-6', label:'5-6' }, { val:'7+', label:'7+' }]\r\n    : reto.type === '1x2'";

if (home.includes(find)) {
  home = home.replace(find, replace);
  fs.writeFileSync('src/screens/home/HomeScreen.tsx', home, 'utf8');
  console.log('✅ range agregado correctamente');
} else {
  console.log('❌ texto no encontrado');
}