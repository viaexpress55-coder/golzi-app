const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Eliminar el loading que está mal ubicado
ranking = ranking.replace(
  `if (loadingRanking) return <View style={s.root}><LinearGradient colors={['#020408','#05080F']} style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={'#FFD700'} size="large" /></LinearGradient></View>;\n  const globalTop3   = globalSorted.slice(0,3);`,
  `const globalTop3   = globalSorted.slice(0,3);`
);

// Insertar loading después de fontsLoaded check
ranking = ranking.replace(
  `if (!fontsLoaded) return <View style={s.root} />;`,
  `if (!fontsLoaded) return <View style={s.root} />;\n  if (loadingRanking) return <View style={s.root}><LinearGradient colors={['#020408','#05080F']} style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={'#FFD700'} size="large" /></LinearGradient></View>;`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');