const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

const idx = home.indexOf('function RetoCard');
const insertPoint = home.indexOf("const isPaid = userPlan !== 'free';", idx);

home = home.slice(0, insertPoint) + 
  "const { t } = useTranslation();\r\n  " + 
  home.slice(insertPoint);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK:', home.includes("const { t } = useTranslation();\r\n  const isPaid"));