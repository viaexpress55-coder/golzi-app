const fs=require('fs'); 
let c=fs.readFileSync('src/screens/league/LigaScreen.tsx','utf8'); 
c=c.replace('setTablaLoading(true);','setTablaLoading(true);\n    console.log("TABLA_DEBUG members:"+members.length+" league:"+selectedLeague?.id);'); 
fs.writeFileSync('src/screens/league/LigaScreen.tsx',c,'utf8'); 
console.log('OK:',c.includes('TABLA_DEBUG')); 
