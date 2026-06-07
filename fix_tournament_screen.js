const fs = require('fs');
const path = 'src/screens/league/TournamentScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// FIX #1: deleteDoc con try/catch — usando regex para manejar \r\n de Windows
const oldDelete = /\{ text: 'Eliminar', style: 'destructive', onPress: async \(\) => \{\r?\n\s+await deleteDoc\(doc\(db, 'leagues', ligaId, 'tournaments', t\.id\)\);\r?\n\s+\}\},/;
const newDelete = `{ text: 'Eliminar', style: 'destructive', onPress: async () => {
                      try {
                        await deleteDoc(doc(db, 'leagues', ligaId, 'tournaments', t.id));
                        if (t.isPublic) {
                          await deleteDoc(doc(db, 'public_tournaments', t.id));
                        }
                      } catch(e) {
                        Alert.alert('Error', 'No se pudo eliminar el torneo');
                        console.error(e);
                      }
                    }},`;

if (oldDelete.test(content)) {
  content = content.replace(oldDelete, newDelete);
  console.log('✅ Fix #1: deleteDoc con public_tournaments aplicado');
} else {
  console.log('❌ Fix #1: patrón no encontrado');
}

// FIX #3a: ligaName en interface Props — también con regex
const oldProps = /interface Props \{\r?\n\s+ligaId: string;\r?\n\s+ligaPlan: string;/;
const newProps = `interface Props {\n  ligaId: string;\n  ligaName?: string;\n  ligaPlan: string;`;

if (oldProps.test(content)) {
  content = content.replace(oldProps, newProps);
  console.log('✅ Fix #3a: ligaName en Props aplicado');
} else {
  console.log('⚠️  Fix #3a: Props ya tiene ligaName o patrón no encontrado');
}

fs.writeFileSync(path, content, 'utf8');
console.log('\n✅ Script completado.');