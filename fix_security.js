const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

const oldCreate = `async function handleCreate() {
    if (!ligaName.trim()) { setCreateError('Ingresa un nombre'); return; }
    if (!user) { setCreateError('Debes iniciar sesion'); return; }
    try {
      setCreating(true);
      setCreateError('');
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const freshPlan = userSnap.data()?.plan || 'liga';`;

const newCreate = `async function handleCreate() {
    if (!ligaName.trim()) { setCreateError('Ingresa un nombre'); return; }
    if (!user) { setCreateError('Debes iniciar sesion'); return; }
    try {
      setCreating(true);
      setCreateError('');
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const freshPlan = (userSnap.data()?.plan || 'free').toUpperCase();
      // Validar plan
      if (freshPlan === 'FREE' || !userSnap.data()?.plan) {
        setCreateError('Necesitas un plan de pago para crear una liga');
        setCreating(false);
        return;
      }
      // Validar que no tenga ya una liga creada como owner
      const ownerSnap = await getDocs(
        query(collection(db, 'leagues'), where('ownerId', '==', user.uid))
      );
      if (!ownerSnap.empty) {
        setCreateError('Ya tienes una liga creada. Un usuario solo puede crear 1 liga.');
        setCreating(false);
        return;
      }`;

liga = liga.replace(oldCreate, newCreate);

// Tambien fix plan variable (ya no necesita toUpperCase de nuevo)
liga = liga.replace(
  `plan: freshPlan.toUpperCase(),
        maxMembers: getMaxMembersByPlan(freshPlan),`,
  `plan: freshPlan,
        maxMembers: getMaxMembersByPlan(freshPlan),`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK - Seguridad aplicada');