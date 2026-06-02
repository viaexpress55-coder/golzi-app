const fs = require('fs');
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');

// Fix 1: Agregar estado isInLeague
home = home.replace(
  `const [retoAnswers, setRetoAnswers]   = useState<Record<string,Record<string,string>>>({});`,
  `const [retoAnswers, setRetoAnswers]   = useState<Record<string,Record<string,string>>>({});
  const [isInLeague, setIsInLeague]     = useState(false);`
);

// Fix 2: Verificar si el usuario está en alguna liga al cargar
home = home.replace(
  `console.log('Plan cargado:', planValue, 'UID:', user.uid, 'time:', Date.now());`,
  `console.log('Plan cargado:', planValue, 'UID:', user.uid, 'time:', Date.now());
        // Verificar si está en alguna liga
        try {
          const { getDocs: gd, query: q2, collection: col, where: wh } = require('firebase/firestore');
          const leagueSnap = await getDocs(query(collection(db, 'leagues'), where('memberIds', 'array-contains', user.uid)));
          setIsInLeague(!leagueSnap.empty);
        } catch(e) { setIsInLeague(false); }`
);

// Fix 3: isPaid = plan pagado O en liga
home = home.replace(
  `const isPaid = userPlan !== 'free';`,
  `const isPaid = userPlan !== 'free' || isInLeague;`
);

// Fix 4: Texto "solo para GOLZAIR+"
home = home.replace(
  `>⚡ Retos Rápidos solo para GOLZAIR+</Text>`,
  `>{t('home_retos_info') || '⚡ Retos disponibles para miembros de liga'}</Text>`
);

// Fix 5: Días dinámicos
home = home.replace(
  `{ val:35, lbl:t('home_days') },`,
  `{ val:Math.max(0, Math.ceil((new Date('2026-07-19').getTime() - Date.now()) / 86400000)), lbl:t('home_days') },`
);

fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK');