const fs = require('fs');
let content = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

content = content.replace(
  'const [user, setUser] = useState(auth.currentUser);',
  'const [user, setUser] = useState(auth.currentUser);\n  const [userData, setUserData] = useState(null);'
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', content);
console.log('OK');