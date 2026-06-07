const fs = require('fs');

// ── 1. Patch TournamentScreen — escribir en public_tournaments al crear público
const tournamentPath = 'src/screens/league/TournamentScreen.tsx';
let src = fs.readFileSync(tournamentPath, 'utf8');

// Agregar import addDoc y setDoc
src = src.replace(
  `import {\n  collection, addDoc, onSnapshot, query, orderBy,\n  serverTimestamp, doc, updateDoc, getDocs, where,\n} from 'firebase/firestore';`,
  `import {\n  collection, addDoc, onSnapshot, query, orderBy,\n  serverTimestamp, doc, updateDoc, getDocs, where, setDoc,\n} from 'firebase/firestore';`
);

// Después de crear el torneo en la liga, si isPublic también escribir en public_tournaments
src = src.replace(
  `      setTName(''); setTDesc(''); setTPrize('');
      setTStart(''); setTEnd(''); setTPublic(false);
      setShowCreate(false);
      Alert.alert('✅ Torneo creado', \`\${matchIds.length} partidos incluidos\`);`,
  `      // Si es público, publicar en colección raíz para todos los usuarios
      if (tPublic && canPublic) {
        await setDoc(doc(db, 'public_tournaments', torneoRef.id), {
          torneoId: torneoRef.id,
          ligaId,
          name: tName.trim(),
          description: tDesc.trim() || null,
          prize: tPrize.trim() || null,
          startDate: tStart,
          endDate: tEnd,
          matchIds,
          participants: [userId],
          maxParticipants: getMaxParticipants(),
          status: new Date(tStart) > new Date() ? 'upcoming' : 'active',
          isPublic: true,
          ownerId: userId,
          ligaName: null,
          brandColor: null,
          brandLogo: null,
          ciudad: null,
          pais: null,
          flag: null,
          allowedCountries: [],
          createdAt: serverTimestamp(),
        });
      }
      setTName(''); setTDesc(''); setTPrize('');
      setTStart(''); setTEnd(''); setTPublic(false);
      setShowCreate(false);
      Alert.alert('✅ Torneo creado', \`\${matchIds.length} partidos incluidos\`);`
);

// Agregar función helper getMaxParticipants antes del return
src = src.replace(
  `  const statusColor = (s: string)`,
  `  const getMaxParticipants = () => {
    const p = (ligaPlan||'').toUpperCase();
    if (p === 'GOLD') return 5000;
    if (p === 'GOLZI PREMIUM') return 999999;
    return 1000;
  };
  const statusColor = (s: string)`
);

fs.writeFileSync(tournamentPath, src, 'utf8');
console.log('✅ TournamentScreen actualizado');

// ── 2. Patch TorneosPublicosScreen — leer public_tournaments en tiempo real
const torneosPath = 'src/screens/torneos/TorneosPublicosScreen.tsx';
let torneos = fs.readFileSync(torneosPath, 'utf8');

// Agregar orderBy al import
torneos = torneos.replace(
  `import { collection, onSnapshot, query, getDocs, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';`,
  `import { collection, onSnapshot, query, getDocs, doc, updateDoc, arrayUnion, getDoc, setDoc, orderBy } from 'firebase/firestore';`
);

// Agregar estado para torneos reales
torneos = torneos.replace(
  `  const [soemexTorneo, setSoemexTorneo] = useState<any>(null);`,
  `  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [soemexTorneo, setSoemexTorneo] = useState<any>(null);`
);

// Cargar public_tournaments en tiempo real
torneos = torneos.replace(
  `    // Cargar torneo SOEMEX real
    const unsub = onSnapshot(`,
  `    // Cargar torneos públicos reales
    const unsubPublic = onSnapshot(
      query(collection(db, 'public_tournaments'), orderBy('createdAt', 'desc')),
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data(), isReal: true }));
        setPublicTournaments(data);
      }
    );

    // Cargar torneo SOEMEX real
    const unsub = onSnapshot(`
);

// Actualizar return del useEffect
torneos = torneos.replace(
  `    return unsub;`,
  `    return () => { unsub(); unsubPublic(); };`
);

// Mostrar torneos reales antes de los demos
torneos = torneos.replace(
  `        {/* Torneo SOEMEX REAL primero */}
        {soemexTorneo && renderTorneoCard({...soemexTorneo, flag:'🇨🇴', ciudad:'Barranquilla', pais:'Colombia', tags:['Empresas','Colombia'], isPublic:true}, true)}

        {/* Torneos demo */}
        {DEMO_TOURNAMENTS.map(t => renderTorneoCard(t, false))}`,
  `        {/* Torneo SOEMEX REAL primero */}
        {soemexTorneo && renderTorneoCard({...soemexTorneo, flag:'🇨🇴', ciudad:'Barranquilla', pais:'Colombia', tags:['Empresas','Colombia'], isPublic:true}, true)}

        {/* Torneos públicos reales de clientes — más reciente arriba */}
        {publicTournaments.filter(t => t.torneoId !== SOEMEX_TORNEO_ID).map(t => renderTorneoCard(t, false))}

        {/* Torneos demo siempre al final */}
        {DEMO_TOURNAMENTS.map(t => renderTorneoCard(t, false))}`
);

fs.writeFileSync(torneosPath, torneos, 'utf8');
console.log('✅ TorneosPublicosScreen actualizado');
console.log('\n⚠️  Agregar en Firestore rules:');
console.log('match /public_tournaments/{torneoId} {');
console.log('  allow read: if true;');
console.log('  allow write: if request.auth != null;');
console.log('}');