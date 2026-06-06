const fs = require('fs');
const filePath = 'src/screens/league/LigaScreen.tsx';
let liga = fs.readFileSync(filePath, 'utf8');

// Import
if (!liga.includes('TournamentScreen')) {
  liga = liga.replace(
    `import BrandingScreen from './BrandingScreen';`,
    `import BrandingScreen from './BrandingScreen';\nimport TournamentScreen from './TournamentScreen';`
  );
  console.log('✅ Import TournamentScreen agregado');
}

// Constante
if (!liga.includes('TOURNAMENT_PLANS')) {
  liga = liga.replace(
    `const BRANDING_PLANS = ['BUSINESS','GOLD','GOLZI PREMIUM'];`,
    `const BRANDING_PLANS = ['BUSINESS','GOLD','GOLZI PREMIUM'];\nconst TOURNAMENT_PLANS = ['BUSINESS','GOLD','GOLZI PREMIUM'];`
  );
  console.log('✅ TOURNAMENT_PLANS agregado');
}

// hasTournament
if (!liga.includes('hasTournament')) {
  liga = liga.replace(
    `  const hasBranding = BRANDING_PLANS.includes((selectedLeague?.plan||'').toUpperCase()) && selectedLeague?.ownerId === user?.uid;`,
    `  const hasBranding = BRANDING_PLANS.includes((selectedLeague?.plan||'').toUpperCase()) && selectedLeague?.ownerId === user?.uid;
  const hasTournament = TOURNAMENT_PLANS.includes((selectedLeague?.plan||'').toUpperCase());`
  );
  console.log('✅ hasTournament agregado');
}

// Tab en TABS array
if (!liga.includes("base.push('TORNEOS')")) {
  liga = liga.replace(
    `    if (hasBranding) base.push('BRANDING');`,
    `    if (hasBranding) base.push('BRANDING');
    if (hasTournament) base.push('TORNEOS');`
  );
  console.log('✅ TORNEOS tab agregado');
}

// Render tab
if (!liga.includes('TAB TORNEOS')) {
  liga = liga.replace(
    `        {/* TAB CANAL — Canal de Difusión PARTNER+ */}`,
    `        {/* TAB TORNEOS — Torneos BUSINESS+ */}
        {tab === TABS.indexOf('TORNEOS') && TABS.includes('TORNEOS') && selectedLeague && (
          <TournamentScreen
            ligaId={selectedLeague.id}
            ligaPlan={selectedLeague.plan || 'free'}
            ownerId={selectedLeague.ownerId}
            userId={user?.uid || ''}
            userName={user?.displayName || user?.email?.split('@')[0] || 'Jugador'}
            members={members}
          />
        )}

        {/* TAB CANAL — Canal de Difusión PARTNER+ */}`
  );
  console.log('✅ Render tab TORNEOS agregado');
}

fs.writeFileSync(filePath, liga, 'utf8');
console.log('\n🚀 Torneos re-aplicados');