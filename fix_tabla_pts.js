const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Reemplazar loadTabla completo para usar totalPoints del usuario
const oldLoadTabla = liga.substring(
  liga.indexOf('async function loadTabla()'),
  liga.indexOf('// Cargar tabla cuando se abre el tab')
);

const newLoadTabla = `async function loadTabla() {
    if (!selectedLeague || !members.length) return;
    if (tablaLoaded === selectedLeague.id) return;

    setTablaLoading(true);
    try {
      // Obtener predicciones para stats de exactas/resultados
      const memberIds = members.map(m => m.id);
      const chunks: string[][] = [];
      for (let i = 0; i < memberIds.length; i += 30) {
        chunks.push(memberIds.slice(i, i + 30));
      }

      // Partidos finalizados
      const matchesSnap = await getDocs(
        query(collection(db, 'matches'), where('status', 'in', ['FINISHED', 'finished']))
      );
      const finishedMatches: Record<string, any> = {};
      matchesSnap.docs.forEach(d => {
        finishedMatches[d.id] = { id: d.id, ...d.data() };
      });

      const allPredictions: any[] = [];
      for (const chunk of chunks) {
        const predSnap = await getDocs(
          query(collection(db, 'predictions'), where('userId', 'in', chunk))
        );
        predSnap.docs.forEach(d => allPredictions.push({ id: d.id, ...d.data() }));
      }

      // Calcular exactas y resultados por miembro
      const statsMap: Record<string, { exact: number; winner: number; draw: number; miss: number; total: number }> = {};
      memberIds.forEach(uid => {
        statsMap[uid] = { exact: 0, winner: 0, draw: 0, miss: 0, total: 0 };
      });

      allPredictions.forEach(pred => {
        const match = finishedMatches[pred.matchId];
        if (!match || pred.homeScore === undefined) return;
        if (match.homeScore === null || match.homeScore === undefined) return;
        if (!statsMap[pred.userId]) return;

        const result = calcPoints(
          { homeScore: pred.homeScore, awayScore: pred.awayScore },
          { homeScore: match.homeScore, awayScore: match.awayScore }
        );
        statsMap[pred.userId][result.type]++;
        statsMap[pred.userId].total++;
      });

      // Usar totalPoints real del usuario (predicciones + retos)
      const tabla = members.map(m => ({
        ...m,
        tablaStats: {
          ...statsMap[m.id],
          pts: m.totalPoints || 0, // totalPoints ya incluye predicciones + retos
        },
      })).sort((a, b) => b.tablaStats.pts - a.tablaStats.pts);

      setTablaData(tabla);
      setTablaLoaded(selectedLeague.id);
    } catch (e) {
      console.error('Error cargando tabla:', e);
    } finally {
      setTablaLoading(false);
    }
  }

  `;

liga = liga.replace(oldLoadTabla, newLoadTabla);
fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK:', liga.includes('totalPoints real'));