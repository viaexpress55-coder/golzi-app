const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Reemplazar el pending_invite actual con uno que tenga delay
liga = liga.replace(
  `if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const pending = localStorage.getItem('golzi_pending_invite');
          if (pending) {
            localStorage.removeItem('golzi_pending_invite');
            setJoinCode(pending);
            setTab(2);
          }
        }`,
  `if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const pending = localStorage.getItem('golzi_pending_invite');
          if (pending) {
            localStorage.removeItem('golzi_pending_invite');
            setTimeout(() => {
              setJoinCode(pending);
              setTab(2);
            }, 800);
          }
        }`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK:', liga.includes('setTimeout'));