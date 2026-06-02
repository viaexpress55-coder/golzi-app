const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

const tabState = `const [tab, setTab]           = useState(0);`;
const tabIdx = ranking.indexOf(tabState) + tabState.length;
ranking = ranking.slice(0, tabIdx) + 
  `\r\n  const [globalData, setGlobalData] = useState<any[]>([]);\r\n  const [loadingRanking, setLoadingRanking] = useState(true);` + 
  ranking.slice(tabIdx);

const rankingFnIdx = ranking.indexOf('export default function RankingScreen');
const firstUseEffect = ranking.indexOf('useEffect', rankingFnIdx);
const firstUseEffectEnd = ranking.indexOf('  }, []);\r\n', firstUseEffect) + '  }, []);\r\n'.length;

const newUseEffect = `\r\n  useEffect(() => {\r\n    const user = getAuth().currentUser;\r\n    if (!user) return;\r\n    getDocs(query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(500)))\r\n      .then(snap => {\r\n        const users = snap.docs.map(d => ({\r\n          id: d.id,\r\n          username: d.data().username || 'Golzaire',\r\n          country: d.data().country || '🌍',\r\n          pts: d.data().totalPoints || 0,\r\n          exact: 0,\r\n          plan: d.data().plan || 'free',\r\n          streak: d.data().currentStreak || 0,\r\n          isMe: d.id === user.uid,\r\n        }));\r\n        setGlobalData(users);\r\n        setLoadingRanking(false);\r\n      })\r\n      .catch(() => setLoadingRanking(false));\r\n  }, []);\r\n`;

ranking = ranking.slice(0, firstUseEffectEnd) + newUseEffect + ranking.slice(firstUseEffectEnd);

ranking = ranking.replace(
  `const globalSorted = [...MOCK_GLOBAL].sort((a,b) => b.pts - a.pts);`,
  `const globalSorted = (globalData.length > 0 ? globalData : MOCK_GLOBAL).sort((a,b) => b.pts - a.pts);`
);

ranking = ranking.replace(`const FREE_RANK_LIMIT = 20;`, `const FREE_RANK_LIMIT = 5;`);

ranking = ranking.replace(
  `Desbloquea el ranking completo con{'\n'}<Text style={{ color:C.purple, fontWeight:'800' }}>GOLZAIR — $1.99</Text>`,
  `Unete a una liga activa para ver el ranking completo`
);
ranking = ranking.replace(
  `<Text style={pw.btnTxt}>⚡ VER RANKING COMPLETO — $1.99</Text>`,
  `<Text style={pw.btnTxt}>⚡ VER RANKING — UNETE A UNA LIGA</Text>`
);
ranking = ranking.replace(
  `También desbloquea Retos Rápidos y más funciones premium`,
  `Los miembros de liga ven el ranking completo`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');
console.log('globalData:', ranking.includes('const [globalData'));
console.log('query:', ranking.includes('getDocs(query'));
console.log('globalSorted:', ranking.includes('globalData.length'));