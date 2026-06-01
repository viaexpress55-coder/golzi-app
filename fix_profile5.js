const fs = require('fs');
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

// Fix totalPredictions - solo predictions, no challenges
profile = profile.replace(
  'totalPredictions = history.length + challenges.length;',
  'totalPredictions = history.length;'
);

// Fix stats row - reemplazar el primer stat de predicciones con dos stats separados
profile = profile.replace(
  `{ val: String(totalPredictions), lbl: t('profile_predictions'), c: C.gold  },`,
  `{ val: String(totalPredictions), lbl: t('profile_predictions'), c: C.gold  },
            { val: String(challenges.length), lbl: 'RETOS', c: C.cyan },`
);

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK');