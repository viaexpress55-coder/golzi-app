const fs = require('fs');
const c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');
const i = c.indexOf('setLoading(true)');
console.log(JSON.stringify(c.substring(i-30, i+80)));