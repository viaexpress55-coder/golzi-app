const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Quitar limit(20) de predictions para contar todas
profile = profile.replace(
  `      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));`,
  `      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));`
);

// Quitar limit(20) de quick_challenges también
profile = profile.replace(
  `      where('userId', '==', userId),
      orderBy('savedAt', 'desc'),
      limit(20)`,
  `      where('userId', '==', userId),
      orderBy('savedAt', 'desc')`
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK');