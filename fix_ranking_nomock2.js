const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix calcCountryRanking — usar globalData
ranking = ranking.replace(
  `calcCountryRanking(MOCK_GLOBAL)`,
  `calcCountryRanking(globalData.length > 0 ? globalData : [])`
);

// Mostrar loading mientras carga
ranking = ranking.replace(
  `const globalTop3   = globalSorted.slice(0,3);`,
  `if (loadingRanking) return <View style={s.root}><LinearGradient colors={['#020408','#05080F']} style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={'#FFD700'} size="large" /></LinearGradient></View>;\n  const globalTop3   = globalSorted.slice(0,3);`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');
console.log('MOCK_GLOBAL restante en calcCountry:', ranking.includes('calcCountryRanking(MOCK_GLOBAL)'));