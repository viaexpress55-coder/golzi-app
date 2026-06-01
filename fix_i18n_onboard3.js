const fs = require('fs');
let onboard = fs.readFileSync('src/screens/onboarding/OnboardingScreen.tsx', 'utf8');

// Agregar useTranslation si no existe
if (!onboard.includes('useTranslation')) {
  onboard = onboard.replace(
    `import { useNavigation } from '@react-navigation/native';`,
    `import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';`
  );
  // Agregar t en el componente
  onboard = onboard.replace(
    `const navigation = useNavigation`,
    `const { t } = useTranslation();
  const navigation = useNavigation`
  );
}

// Reemplazar textos hardcodeados
onboard = onboard.replace(
  '`SIGUIENTE  →`',
  't(\'onboard_next\')'
);
onboard = onboard.replace(
  '`¡EMPEZAR!  ⚡`',
  't(\'onboard_start\')'
);
onboard = onboard.replace(
  'Ya tengo cuenta →',
  '{t(\'onboard_have_account\')}'
);
onboard = onboard.replace(
  'Explorar sin cuenta →',
  '{t(\'onboard_guest\')}'
);

fs.writeFileSync('src/screens/onboarding/OnboardingScreen.tsx', onboard);
console.log('OK:', onboard.includes('onboard_next'));