const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Fix 1: Mover isPaid de RetoCard a HomeScreen — en RetoCard usar prop
home = home.replace(
  `const isPaid = userPlan !== 'free' || isInLeague;`,
  `const isPaid = userPlan !== 'free';`
);

// Fix 2: Agregar isInLeague como prop en RetoCard
home = home.replace(
  `function RetoCard({ reto, match, userPlan, answer, onAnswer, saved, navigation }: any) {`,
  `function RetoCard({ reto, match, userPlan, isInLeague, answer, onAnswer, saved, navigation }: any) {`
);

// Fix 3: isPaid en RetoCard usa la prop isInLeague
home = home.replace(
  `const isPaid = userPlan !== 'free';`,
  `const isPaid = userPlan !== 'free' || isInLeague;`
);

// Fix 4: Pasar isInLeague como prop al llamar RetoCard
home = home.replace(
  `reto={{...reto, label: t(reto.label)}} match={m} userPlan={userPlan}`,
  `reto={{...reto, label: t(reto.label)}} match={m} userPlan={userPlan} isInLeague={isInLeague}`
);

// Fix 5: Agregar estado isInLeague en HomeScreen si no existe
if (!home.includes('const [isInLeague, setIsInLeague]')) {
  home = home.replace(
    `const [retosSaved, setRetosSaved]     = useState<Record<string,boolean>>({});`,
    `const [retosSaved, setRetosSaved]     = useState<Record<string,boolean>>({});
  const [isInLeague, setIsInLeague]     = useState(false);`
  );
}

// Fix 6: Query de liga si no existe
if (!home.includes('setIsInLeague')) {
  home = home.replace(
    `console.log('Plan cargado:', planValue, 'UID:', user.uid, 'time:', Date.now());`,
    `console.log('Plan cargado:', planValue, 'UID:', user.uid, 'time:', Date.now());
        getDocs(query(collection(db, 'leagues'), where('memberIds', 'array-contains', user.uid)))
          .then(snap => setIsInLeague(!snap.empty)).catch(() => setIsInLeague(false));`
  );
}

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK');
console.log('isInLeague en HomeScreen:', home.indexOf('const [isInLeague') !== -1);
console.log('isInLeague prop en RetoCard:', home.includes('isInLeague, answer'));