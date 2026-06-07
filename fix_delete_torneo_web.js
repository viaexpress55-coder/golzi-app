const fs = require('fs');
const path = 'src/screens/league/TournamentScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix: reemplazar Alert.alert por window.confirm para web
const old = /onPress=\{\(\) => Alert\.alert\(\s*'[^']*',\s*'[^']*',\s*\[\s*\{ text: 'Cancelar', style: 'cancel' \},\s*\{ text: 'Eliminar', style: 'destructive', onPress: async \(\) => \{\s*try \{\s*await deleteDoc\(doc\(db, 'leagues', ligaId, 'tournaments', t\.id\)\);\s*if \(t\.isPublic\) \{\s*await deleteDoc\(doc\(db, 'public_tournaments', t\.id\)\);\s*\}\s*\} catch\(e\) \{\s*Alert\.alert\('Error', 'No se pudo eliminar el torneo'\);\s*console\.error\(e\);\s*\}\s*\}\},\s*\]\s*\)\}/s;

if (old.test(content)) {
  content = content.replace(old, `onPress={async () => {
                const ok = typeof window !== 'undefined'
                  ? window.confirm('¿Eliminar torneo? Solo puedes eliminar si no hay otros inscritos.')
                  : await new Promise(resolve => Alert.alert('¿Eliminar torneo?', 'Solo puedes eliminar si no hay otros inscritos.', [{ text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) }, { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) }]));
                if (!ok) return;
                try {
                  await deleteDoc(doc(db, 'leagues', ligaId, 'tournaments', t.id));
                  if (t.isPublic) {
                    await deleteDoc(doc(db, 'public_tournaments', t.id));
                  }
                } catch(e) {
                  Alert.alert('Error', 'No se pudo eliminar el torneo');
                  console.error(e);
                }
              }}`);
  console.log('✅ Fix eliminar web aplicado');
} else {
  console.log('❌ Patrón no encontrado — buscando contexto...');
  const idx = content.indexOf('¿Eliminar torneo?');
  if (idx > -1) console.log(JSON.stringify(content.substring(idx - 50, idx + 200)));
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');