const fs = require('fs');
const path = 'src/screens/league/LigaScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const old = /<TournamentScreen\r?\n\s+ligaId=\{selectedLeague\.id\}\r?\n\s+ligaPlan=/;
const nuevo = `<TournamentScreen\r\n            ligaId={selectedLeague.id}\r\n            ligaName={selectedLeague.name}\r\n            ligaPlan=`;

if (old.test(content)) {
  content = content.replace(old, nuevo);
  console.log('✅ Fix: ligaName prop agregado a TournamentScreen');
} else {
  console.log('❌ Patrón no encontrado');
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');