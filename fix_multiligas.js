const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// 1. Agregar estado para multiligas
liga = liga.replace(
  `const [togglingInvite, setTogglingInvite] = useState(false);`,
  `const [togglingInvite, setTogglingInvite] = useState(false);
  const [poolUsed, setPoolUsed] = useState(0);
  const [ligaSize, setLigaSize] = useState(0); // cupos para la nueva liga`
);

// 2. Calcular pool usado cuando se cargan las ligas
liga = liga.replace(
  `setMyLeagues(leagues);
      if (leagues.length > 0 && !selectedLeague) setSelectedLeague(leagues[0]);
      setLoading(false);`,
  `setMyLeagues(leagues);
      if (leagues.length > 0 && !selectedLeague) setSelectedLeague(leagues[0]);
      // Calcular cupos usados
      const used = leagues.filter(l => l.ownerId === user?.uid).reduce((acc, l) => acc + (l.maxMembers || 0), 0);
      setPoolUsed(used);
      setLoading(false);`
);

// 3. Reemplazar validación de 1 liga por validación de pool
liga = liga.replace(
  `// Validar que no tenga ya una liga creada como owner
      const ownerSnap = await getDocs(
        query(collection(db, 'leagues'), where('ownerId', '==', user.uid))
      );
      if (!ownerSnap.empty) {
        setCreateError('Ya tienes una liga creada. Un usuario solo puede crear 1 liga.');
        setCreating(false);
        return;
      }`,
  `// Validar pool de cupos
      const MULTILIGA_PLANS = ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
      const isMultiliga = MULTILIGA_PLANS.includes(freshPlan);
      const ownerSnap = await getDocs(
        query(collection(db, 'leagues'), where('ownerId', '==', user.uid))
      );
      if (!isMultiliga && !ownerSnap.empty) {
        setCreateError('Ya tienes una liga creada. Un usuario solo puede crear 1 liga.');
        setCreating(false);
        return;
      }
      if (isMultiliga) {
        const totalUsed = ownerSnap.docs.reduce((acc, d) => acc + (d.data().maxMembers || 0), 0);
        const planMax = getMaxMembersByPlan(freshPlan);
        const newSize = ligaSize || getDefaultLigaSize(freshPlan, ownerSnap.docs.length);
        if (totalUsed + newSize > planMax) {
          setCreateError('No tienes suficientes cupos disponibles. Pool: ' + planMax + ' | Usados: ' + totalUsed + ' | Disponibles: ' + (planMax - totalUsed));
          setCreating(false);
          return;
        }
        // Usar el tamaño seleccionado
        (window as any).__newLigaSize = newSize;
      }`
);

// 4. Usar tamaño correcto en setDoc
liga = liga.replace(
  `plan: freshPlan,
        maxMembers: getMaxMembersByPlan(freshPlan),`,
  `plan: freshPlan,
        maxMembers: (() => {
          const MULTILIGA_PLANS = ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
          if (MULTILIGA_PLANS.includes(freshPlan)) {
            return (typeof window !== 'undefined' && (window as any).__newLigaSize) || ligaSize || 10;
          }
          return getMaxMembersByPlan(freshPlan);
        })(),`
);

// 5. Agregar función helper getDefaultLigaSize antes de handleCreate
liga = liga.replace(
  `async function handleCreate()`,
  `function getDefaultLigaSize(plan: string, existingCount: number): number {
    const total = getMaxMembersByPlan(plan);
    if (existingCount === 0) return total;
    return Math.max(10, Math.floor(total / (existingCount + 1)));
  }

  async function handleCreate()`
);

// 6. Agregar selector de cupos en TAB 3 CREAR — después del input de nombre
liga = liga.replace(
  `{createError ? <Text style={s.errorTxt}>{createError}</Text> : null}`,
  `{createError ? <Text style={s.errorTxt}>{createError}</Text> : null}
              {/* Selector de cupos para GOLZAIR+ */}
              {userData && ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((userData.plan||'').toUpperCase()) && (
                <View style={{ gap:8 }}>
                  <Text style={s.inputLabel}>CUPOS PARA ESTA LIGA</Text>
                  <Text style={{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:'#6B7A99' }}>
                    Pool total: {getMaxMembersByPlan(userData.plan)} | Usados: {poolUsed} | Disponibles: {getMaxMembersByPlan(userData.plan) - poolUsed}
                  </Text>
                  <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
                    {[...new Set([
                      getMaxMembersByPlan(userData.plan) - poolUsed,
                      Math.floor((getMaxMembersByPlan(userData.plan) - poolUsed) / 2),
                      25, 20, 10
                    ].filter(n => n >= 10 && n <= getMaxMembersByPlan(userData.plan) - poolUsed))].map(size => (
                      <TouchableOpacity
                        key={size}
                        onPress={() => setLigaSize(size)}
                        style={{
                          paddingHorizontal:14, paddingVertical:8, borderRadius:20,
                          backgroundColor: ligaSize === size ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                          borderWidth:1,
                          borderColor: ligaSize === size ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <Text style={{ fontFamily:'BarlowCondensed_700Bold', fontSize:12, color: ligaSize === size ? '#FFD700' : '#6B7A99' }}>
                          {size} cupos
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');