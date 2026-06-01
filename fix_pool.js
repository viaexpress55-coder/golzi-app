const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Reemplazar el texto del selector de cupos para calcular poolUsed en tiempo real desde myLeagues
liga = liga.replace(
  `<Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#6B7A99' }}>
                    Pool total: {getMaxMembersByPlan(userData.plan)} | Usados: {poolUsed} | Disponibles: {getMaxMembersByPlan(userData.plan) - poolUsed}
                  </Text>`,
  `<Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#6B7A99' }}>
                    {(() => {
                      const total = getMaxMembersByPlan(userData.plan);
                      const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0);
                      const avail = total - used;
                      return 'Pool total: ' + total + ' | Usados: ' + used + ' | Disponibles: ' + avail;
                    })()}
                  </Text>`
);

// También fix en los botones de cupos disponibles
liga = liga.replace(
  `{[...new Set([
                      getMaxMembersByPlan(userData.plan) - poolUsed,
                      Math.floor((getMaxMembersByPlan(userData.plan) - poolUsed) / 2),
                      25, 20, 10
                    ].filter(n => n >= 10 && n <= getMaxMembersByPlan(userData.plan) - poolUsed))].map(size => (`,
  `{[...new Set([
                      (() => { const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0); return getMaxMembersByPlan(userData.plan) - used; })(),
                      (() => { const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0); return Math.floor((getMaxMembersByPlan(userData.plan) - used) / 2); })(),
                      25, 20, 10
                    ].filter(n => { const used = myLeagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0); return n >= 10 && n <= getMaxMembersByPlan(userData.plan) - used; }))].map(size => (`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');