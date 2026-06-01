const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  `match /matches/{matchId} {
      allow read: if true;
      allow write: if false;
    }`,
  `match /matches/{matchId} {
      allow read: if true;
      allow write: if request.auth != null;
    }`
);

fs.writeFileSync('firestore.rules', rules);
console.log('OK - reglas temporales aplicadas');