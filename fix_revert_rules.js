const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  `match /matches/{matchId} {
      allow read: if true;
      allow write: if request.auth != null;
    }`,
  `match /matches/{matchId} {
      allow read: if true;
      allow write: if false;
    }`
);

fs.writeFileSync('firestore.rules', rules);
console.log('OK - reglas revertidas');