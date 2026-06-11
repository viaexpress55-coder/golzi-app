const fs = require('fs');
let c = fs.readFileSync('firestore.rules', 'utf8');

const newRules = `
    // WHITE LABEL CLIENTS
    match /clients/{clientId} {
      allow read: if true;
      allow write: if false;
      match /users/{userId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && userId == request.auth.uid;
        allow update: if request.auth != null && userId == request.auth.uid;
        allow delete: if false;
      }
      match /predictions/{predId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null &&
          request.resource.data.userId == request.auth.uid &&
          request.resource.data.homeScore is int &&
          request.resource.data.awayScore is int;
        allow update: if false;
        allow delete: if false;
      }
      match /leagues/{leagueId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }`;

c = c.replace(
  `    match /businesses/{businessId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}`,
  `    match /businesses/{businessId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
${newRules}
  }
}`
);

fs.writeFileSync('firestore.rules', c);
console.log('✅ Reglas clients agregadas:', c.includes('WHITE LABEL CLIENTS'));