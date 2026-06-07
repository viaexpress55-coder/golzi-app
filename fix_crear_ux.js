const fs = require('fs');
const path = 'src/screens/league/LigaScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix: borde rojo en inputWrap cuando hay error
const old = /(<View style=\{s\.inputWrap\}>(\r?\n\s+)<Text style=\{s\.inputIcon\}>🏆<\/Text>(\r?\n\s+)<TextInput(\r?\n\s+)style=\{s\.input\}(\r?\n\s+)placeholder="Ej: Los Campeones 2026")/;

if (old.test(content)) {
  content = content.replace(old, (match, full, nl1, nl2, nl3, nl4) => {
    return `<View style={[s.inputWrap, createError && !ligaName.trim() && {borderColor:'#FF3355', borderWidth:1.5}]}>${nl1}<Text style={s.inputIcon}>🏆</Text>${nl2}<TextInput${nl3}style={s.input}${nl4}placeholder="Ej: Los Campeones 2026"`;
  });
  console.log('✅ Borde rojo aplicado');
} else {
  console.log('❌ Patrón no encontrado — debug:');
  const idx = content.indexOf('Los Campeones 2026');
  console.log(JSON.stringify(content.substring(idx - 150, idx + 50)));
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');