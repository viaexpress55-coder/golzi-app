const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Cambiar condición del toggle para que aplique a TODOS los planes (no solo GOLZAIR+)
liga = liga.replace(
  `selectedLeague.ownerId === user.uid && ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase()) && (`,
  `selectedLeague.ownerId === user.uid && (`
);

// Cambiar condición de visibilidad de botones compartir para todos los planes
liga = liga.replace(
  `selectedLeague.ownerId === user.uid || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())`,
  `selectedLeague.ownerId === user.uid || selectedLeague.inviteOpen`
);

// Cambiar condición de mensaje "invitaciones cerradas" para todos los planes
liga = liga.replace(
  `selectedLeague.ownerId !== user.uid && ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase()) && !selectedLeague.inviteOpen`,
  `selectedLeague.ownerId !== user.uid && !selectedLeague.inviteOpen`
);

// Cambiar condición del código de invitación para todos los planes
liga = liga.replace(
  `user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())`,
  `user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen`
);

// Cambiar condición del QR en hero card para todos los planes
liga = liga.replace(
  `QR_PLANS.includes((selectedLeague.plan || '').toUpperCase()) && (user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())) ? (`,
  `QR_PLANS.includes((selectedLeague.plan || '').toUpperCase()) && (user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen) ? (`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');