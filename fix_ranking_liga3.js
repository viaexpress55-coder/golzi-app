const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Insertar estado leagueData después de globalData
const insertAfter = `const [globalData, setGlobalData] = useState<any[]>([]);`;
const idx = ranking.indexOf(insertAfter) + insertAfter.length;
ranking = ranking.slice(0, idx) + 
  `\r\n  const [leagueData, setLeagueData] = useState<any[]>([]);` + 
  ranking.slice(idx);

// Usar leagueData en leagueSorted
ranking = ranking.replace(
  `leagueSorted  = [...(leagueData.length > 0 ? leagueData : [])].sort((a,b) => b.pts - a.pts);`,
  `leagueSorted  = [...(leagueData.length > 0 ? leagueData : [])].sort((a,b) => b.pts - a.pts);`
);

// Verificar si ya existe el replace de MOCK_LEAGUE
if (ranking.includes('[...MOCK_LEAGUE]')) {
  ranking = ranking.replace(
    `leagueSorted  = [...MOCK_LEAGUE].sort((a,b) => b.pts - a.pts);`,
    `leagueSorted  = [...(leagueData.length > 0 ? leagueData : [])].sort((a,b) => b.pts - a.pts);`
  );
}

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK leagueData estado:', ranking.includes('const [leagueData'));
console.log('OK leagueSorted:', ranking.includes('leagueData.length > 0'));