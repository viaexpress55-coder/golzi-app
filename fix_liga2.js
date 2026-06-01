const fs = require('fs');
let content = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Revertir el array roto y reemplazar con version correcta
const oldArray = `{[
                  'Hasta ' + getMaxMembersByPlan(userData?.plan || 'liga') + ' jugadores',
                  ...((['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((userData?.plan||'').toUpperCase())) ? ['QR de invitación'] : []),
                  'Ranking privado en tiempo real',
                  'Chat de liga',
                  ...((['MASTER','GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((userData?.plan||'').toUpperCase())) ? ['Tabla de predicciones del grupo'] : []),
                ].map((f,i) => (`;

const newArray = `{['Hasta ' + getMaxMembersByPlan(userData?.plan || 'liga') + ' jugadores','Ranking privado en tiempo real','Chat de liga'].map((f,i) => (`;

content = content.replace(oldArray, newArray);
fs.writeFileSync('src/screens/league/LigaScreen.tsx', content);
console.log('OK');