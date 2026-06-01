const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// 1. Agregar estado para quick_challenges
profile = profile.replace(
  `const [history, setHistory]       = useState<any[]>([]);`,
  `const [history, setHistory]       = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);`
);

// 2. Agregar useEffect para cargar quick_challenges
profile = profile.replace(
  `  // ── Cargar historial de predicciones ──`,
  `  // ── Cargar quick_challenges ──
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'quick_challenges'),
      where('userId', '==', userId),
      orderBy('savedAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userId]);

  // ── Cargar historial de predicciones ──`
);

// 3. Fix totalPredictions para incluir challenges
profile = profile.replace(
  `const totalPredictions = history.length;
  const exactPredictions = history.filter(h => h.status === 'correct_exact').length;`,
  `const totalPredictions = history.length + challenges.length;
  const exactPredictions = history.filter(h => h.status === 'correct_exact').length;
  const challengePoints = challenges.reduce((acc, c) => acc + (c.pointsEarned || 0), 0);`
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK:', profile.includes('challenges'));