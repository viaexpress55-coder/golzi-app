const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix: usar getAuth().currentUser en lugar de user
ranking = ranking.replace(
  `getDocs(query(collection(db, 'leagues'), where('memberIds', 'array-contains', user.uid)))`,
  `getDocs(query(collection(db, 'leagues'), where('memberIds', 'array-contains', getAuth().currentUser?.uid || '')))`
);

ranking = ranking.replace(
  `isMe: d.id === user.uid,`,
  `isMe: d.id === (getAuth().currentUser?.uid || ''),`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');