const fs = require('fs');
const path = 'src/screens/league/LigaScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// FIX: Lógica de TABS con regex para manejar \r\n
const oldTabs = /const hasTabla = TABLA_PLANS\.includes\(\(selectedLeague\?\.plan \|\| ''\)\.toUpperCase\(\)\);\r?\n\s+const hasBroadcast = BROADCAST_PLANS\.includes\(\(selectedLeague\?\.plan\|\|''\)\.toUpperCase\(\)\);\r?\n\s+const hasDashboard = DASHBOARD_PLANS\.includes\(\(selectedLeague\?\.plan\|\|''\)\.toUpperCase\(\)\) && selectedLeague\?\.ownerId === user\?\.uid;\r?\n\s+const hasBranding = BRANDING_PLANS\.includes\(\(selectedLeague\?\.plan\|\|''\)\.toUpperCase\(\)\) && selectedLeague\?\.ownerId === user\?\.uid;\r?\n\s+const hasTournament = TOURNAMENT_PLANS\.includes\(\(selectedLeague\?\.plan\|\|''\)\.toUpperCase\(\)\);/;

const newTabs = `const isOwner = selectedLeague?.ownerId === user?.uid;
  const ligaPlan = (selectedLeague?.plan||'').toUpperCase();
  const hasTabla = TABLA_PLANS.includes(ligaPlan);
  const hasBroadcast = BROADCAST_PLANS.includes(ligaPlan);
  const hasDashboard = DASHBOARD_PLANS.includes(ligaPlan) && isOwner;
  const hasBranding = BRANDING_PLANS.includes(ligaPlan) && isOwner;
  const hasTournament = TOURNAMENT_PLANS.includes(ligaPlan);`;

if (oldTabs.test(content)) {
  content = content.replace(oldTabs, newTabs);
  console.log('✅ Lógica tabs corregida');
} else {
  console.log('❌ Patrón no encontrado');
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');