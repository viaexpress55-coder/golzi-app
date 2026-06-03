const fs = require('fs');
let reg = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

const mapStart = reg.indexOf('COUNTRIES.map((cc, i)');
const mapEnd = reg.indexOf(')}', mapStart) + 2;
let mapBlock = reg.substring(mapStart, mapEnd);

mapBlock = mapBlock.replace(/([^a-zA-Z])c\.code/g, '$1cc.code');
mapBlock = mapBlock.replace(/([^a-zA-Z])c\.flag/g, '$1cc.flag');
mapBlock = mapBlock.replace(/([^a-zA-Z])c\.name/g, '$1cc.name');

reg = reg.slice(0, mapStart) + mapBlock + reg.slice(mapEnd);
fs.writeFileSync('src/screens/register/RegisterScreen.tsx', reg);
console.log('OK');