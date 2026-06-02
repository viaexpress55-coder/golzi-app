const fs = require('fs');
let ranking = fs.readFileSync('src/screens/ranking/RankingScreen.tsx', 'utf8');

// Fix: ejecutar query de ranking sin depender del usuario
// Buscar el useEffect de ranking query
const oldEffect = `  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    getDocs(query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(500)))`;

const newEffect = `  useEffect(() => {
    getDocs(query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(500)))`;

ranking = ranking.replace(oldEffect, newEffect);

// Fix: el isMe no depende del user siendo requerido
ranking = ranking.replace(
  `isMe: d.id === user.uid,`,
  `isMe: d.id === (getAuth().currentUser?.uid || ''),`
);

// Eliminar el if (!user) return que ya no aplica
ranking = ranking.replace(
  `    const user = getAuth().currentUser;\r\n    if (!user) return;\r\n    getDocs(query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(500)))`,
  `    getDocs(query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(500)))`
);

fs.writeFileSync('src/screens/ranking/RankingScreen.tsx', ranking);
console.log('OK');
console.log('sin user check:', !ranking.includes("if (!user) return;\r\n    getDocs"));