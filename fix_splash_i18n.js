const fs = require('fs');
let splash = fs.readFileSync('src/screens/splash/SplashScreen.tsx', 'utf8');

// Fix splash_info hardcodeado
splash = splash.replace(
  `>16 CIUDADES SEDE \xb7 48 EQUIPOS</Text>`,
  `>{t('splash_info') || '16 CIUDADES SEDE · 48 EQUIPOS'}</Text>`
);

// Verificar
if (splash.includes("splash_info")) {
  console.log('✅ splash_info actualizado');
} else {
  console.log('❌ No encontrado — buscando...');
  const idx = splash.indexOf('16 CIUDAD');
  console.log(JSON.stringify(splash.substring(idx-20, idx+60)));
}

fs.writeFileSync('src/screens/splash/SplashScreen.tsx', splash, 'utf8');
console.log('✅ Script completado.');