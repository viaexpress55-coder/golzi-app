const fs = require('fs');
const c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');
console.log(c.substring(0, 800));