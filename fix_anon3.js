const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

const joinIdx = liga.indexOf('async function handleJoin()');
const joinEnd = liga.indexOf('async function toggleInvite', joinIdx);
const joinBlock = liga.substring(joinIdx, joinEnd);

const userCheckIdx = joinBlock.indexOf('if (!user)');
const userCheckEnd = joinBlock.indexOf('return; }', userCheckIdx) + 'return; }'.length;

const newJoinBlock = joinBlock.substring(0, userCheckEnd) + 
  "\n    if (!user.email) { setJoinError('Debes crear una cuenta para unirte a una liga'); return; }" +
  joinBlock.substring(userCheckEnd);

liga = liga.substring(0, joinIdx) + newJoinBlock + liga.substring(joinEnd);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');