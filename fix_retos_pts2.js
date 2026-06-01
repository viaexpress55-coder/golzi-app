const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Usar regex para encontrar y reemplazar los pts por id
home = home.replace(/(\{ id:'first_goal'[^}]+pts:)\d+/g, '$15');
home = home.replace(/(\{ id:'over_goals'[^}]+pts:)\d+/g, '$13');
home = home.replace(/(\{ id:'red_card'[^}]+pts:)\d+/g, '$13');
home = home.replace(/(\{ id:'ht_result'[^}]+pts:)\d+/g, '$14');
home = home.replace(/(\{ id:'penalty'[^}]+pts:)\d+/g, '$14');

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);

// Verificar
const c = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');
const i = c.indexOf('first_goal');
console.log('Resultado:', c.substring(i, i+80));