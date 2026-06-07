const fs = require('fs');

// Fix TournamentScreen — agregar props ligaBrandLogo y ligaBrandColor + usarlos en addDoc
let content = fs.readFileSync('src/screens/league/TournamentScreen.tsx', 'utf8');

// 1. Agregar props a interface
content = content.replace(
  'interface Props {\r\n  ligaId: string;\r\n  ligaName?: string;\r\n  ligaPlan: string;',
  'interface Props {\r\n  ligaId: string;\r\n  ligaName?: string;\r\n  ligaBrandLogo?: string;\r\n  ligaBrandColor?: string;\r\n  ligaPlan: string;'
);

// 2. Agregar al destructuring
content = content.replace(
  'export default function TournamentScreen({ ligaId, ligaName, ligaPlan, ownerId, userId, userName, members }: Props) {',
  'export default function TournamentScreen({ ligaId, ligaName, ligaBrandLogo, ligaBrandColor, ligaPlan, ownerId, userId, userName, members }: Props) {'
);

// 3. Usar en addDoc
content = content.replace(
  'tags: tCategoria ? [tCategoria] : [],\r\n        createdAt: serverTimestamp(),\r\n      });\r\n      // Publicar en tor',
  'tags: tCategoria ? [tCategoria] : [],\r\n        ligaName: ligaName || \'\',\r\n        brandLogo: ligaBrandLogo || null,\r\n        brandColor: ligaBrandColor || null,\r\n        createdAt: serverTimestamp(),\r\n      });\r\n      // Publicar en tor'
);

// 4. Usar en setDoc público
content = content.replace(
  'tags: tCategoria ? [tCategoria] : [],\r\n          createdAt: serverTimestamp(),',
  'tags: tCategoria ? [tCategoria] : [],\r\n          ligaName: ligaName || \'\',\r\n          brandLogo: ligaBrandLogo || null,\r\n          brandColor: ligaBrandColor || null,\r\n          createdAt: serverTimestamp(),'
);

fs.writeFileSync('src/screens/league/TournamentScreen.tsx', content, 'utf8');
console.log('✅ TournamentScreen props actualizados');

// Fix LigaScreen — pasar brandLogo y brandColor a TournamentScreen
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

liga = liga.replace(
  '<TournamentScreen\r\n            ligaId={selectedLeague.id}\r\n            ligaName={selectedLeague.name}\r\n            ligaPlan={selectedLeague.plan || \'free\'}',
  '<TournamentScreen\r\n            ligaId={selectedLeague.id}\r\n            ligaName={selectedLeague.name}\r\n            ligaBrandLogo={selectedLeague.brandLogo}\r\n            ligaBrandColor={selectedLeague.brandColor}\r\n            ligaPlan={selectedLeague.plan || \'free\'}'
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga, 'utf8');
console.log('✅ LigaScreen props actualizados');
console.log('\n✅ Script completado.');