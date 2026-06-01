const fs = require('fs');
let content = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Agregar useState de userData si no existe
if (!content.includes('setUserData')) {
  content = content.replace(
    'const [user, setUser] = useState(auth.currentUser);',
    'const [user, setUser] = useState(auth.currentUser);\n  const [userData, setUserData] = useState(null);'
  );
}

// Fix useEffect auth si no carga userData
content = content.replace(
  'const unsub = auth.onAuthStateChanged(async u => {\n      setUser(u);\n    });',
  `const unsub = auth.onAuthStateChanged(async u => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setUserData(snap.data());
      }
    });`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', content);
console.log('OK');