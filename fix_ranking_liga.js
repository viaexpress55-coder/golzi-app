const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// 1. Agregar estado leagueData
ranking = ranking.replace(
  `const [globalData, setGlobalData] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);`,
  `const [globalData, setGlobalData] = useState<any[]>([]);
  const [leagueData, setLeagueData] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);`
);

// 2. Cargar liga del usuario
const insertAfter = `getDocs(query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(500)))`;
ranking = ranking.replace(
  insertAfter,
  `getDocs(query(collection(db, 'leagues'), where('memberIds', 'array-contains', user.uid)))
      .then(async leagueSnap => {
        if (!leagueSnap.empty) {
          const league = leagueSnap.docs[0].data();
          const memberIds: string[] = league.memberIds || [];
          const memberSnaps = await Promise.all(memberIds.map((uid: string) => 
            getDocs(query(collection(db, 'users'), where('userId', '==', uid)))
          ));
          const members = memberSnaps.flatMap(snap => snap.docs.map(d => ({
            id: d.id, username: d.data().username || 'Golzaire',
            country: d.data().country || 'CO', pts: d.data().totalPoints || 0,
            exact: 0, plan: d.data().plan || 'free',
            streak: d.data().currentStreak || 0, isMe: d.id === user.uid,
          })));
          setLeagueData(members);
        }
      }).catch(() => {});
    ${insertAfter}`
);

// 3. leagueSorted usa leagueData
ranking = ranking.replace(
  `leagueSorted  = [...MOCK_LEAGUE].sort((a,b) => b.pts - a.pts);`,
  `leagueSorted  = [...(leagueData.length > 0 ? leagueData : [])].sort((a,b) => b.pts - a.pts);`
);

// 4. getCountryName helper
ranking = ranking.replace(
  `const myCountry = userData?.country ?? '';`,
  `const myCountry = userData?.country ?? '';
  const getCountryName = (code: string) => {
    const names: Record<string,string> = {
      CO:'Colombia',MX:'México',AR:'Argentina',BR:'Brasil',CL:'Chile',
      VE:'Venezuela',PE:'Perú',EC:'Ecuador',UY:'Uruguay',US:'USA',
      ES:'España',FR:'Francia',DE:'Alemania',IT:'Italia',GB:'Reino Unido',
      JP:'Japón',KR:'Corea',CN:'China',IN:'India',NG:'Nigeria',CA:'Canadá',
    };
    return names[code] || code;
  };`
);

// 5. Usar getCountryName en tab PAÍSES
ranking = ranking.replace(
  `{c.country}`,
  `{getCountryName(c.country)}`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK leagueData:', ranking.includes('leagueData'));
console.log('OK getCountryName:', ranking.includes('getCountryName'));