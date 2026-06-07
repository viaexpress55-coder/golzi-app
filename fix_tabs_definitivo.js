const fs = require('fs');
const path = 'src/screens/league/LigaScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const old = /const isOwner = selectedLeague\?\.ownerId === user\?\.uid;\r?\n\s+const ligaPlan = \(selectedLeague\?\.plan\|\|''\)\.toUpperCase\(\);\r?\n\s+const hasTabla = TABLA_PLANS\.includes\(ligaPlan\);\r?\n\s+const hasBroadcast = BROADCAST_PLANS\.includes\(ligaPlan\);\r?\n\s+const hasDashboard = DASHBOARD_PLANS\.includes\(ligaPlan\) && isOwner;\r?\n\s+const hasBranding = BRANDING_PLANS\.includes\(ligaPlan\) && isOwner;\r?\n\s+const hasTournament = TOURNAMENT_PLANS\.includes\(ligaPlan\);/;

const nuevo = `const isOwner = selectedLeague?.ownerId === user?.uid;
  const ligaPlan = (selectedLeague?.plan||'').toUpperCase();
  const hasTabla = TABLA_PLANS.includes(ligaPlan);
  const hasBroadcast = BROADCAST_PLANS.includes(ligaPlan) && isOwner;
  const hasDashboard = DASHBOARD_PLANS.includes(ligaPlan) && isOwner;
  const hasBranding = BRANDING_PLANS.includes(ligaPlan) && isOwner;
  const hasTournament = TOURNAMENT_PLANS.includes(ligaPlan) && isOwner;`;

if (old.test(content)) {
  content = content.replace(old, nuevo);
  console.log('✅ Tabs definitivos aplicados correctamente');
} else {
  console.log('❌ Patrón no encontrado');
  const idx = content.indexOf('isOwner');
  console.log('Contexto:', JSON.stringify(content.substring(idx, idx + 300)));
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');