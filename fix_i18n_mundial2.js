const fs = require('fs');
let mundial = fs.readFileSync('src/screens/mundial/MundialScreen.tsx', 'utf8');

mundial = mundial.replace(/>EQUIPO</g, `>{t('mundial_equipo')}<`);
mundial = mundial.replace(/>PT</g, `>{t('mundial_pt')}<`);
mundial = mundial.replace(/>GD</g, `>{t('mundial_gd')}<`);
mundial = mundial.replace(/>PTS</g, `>{t('mundial_pts')}<`);
mundial = mundial.replace(/>Clasifica a octavos de final</g, `>{t('mundial_classifies')}<`);
mundial = mundial.replace(/>Sin partidos encontrados</g, `>{t('mundial_no_matches')}<`);
mundial = mundial.replace(/>PARTIDOS</g, `>{t('mundial_matches')}<`);

// G, E, P — cuidado con otros usos
mundial = mundial.replace(/>G<\/Text>/g, `>{t('mundial_g')}</Text>`);
mundial = mundial.replace(/>E<\/Text>/g, `>{t('mundial_e')}</Text>`);
mundial = mundial.replace(/>P<\/Text>/g, `>{t('mundial_p')}</Text>`);

fs.writeFileSync('src/screens/mundial/MundialScreen.tsx', mundial);
console.log('OK:', mundial.includes("t('mundial_equipo')"));