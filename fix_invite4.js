const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

const startMarker = '<View style={s.codeRow}>';
const endMarker = '</View>';

const startIdx = liga.indexOf(startMarker);
const endIdx = liga.indexOf(endMarker, startIdx) + endMarker.length;

console.log('startIdx:', startIdx, 'endIdx:', endIdx);
console.log('Bloque encontrado:', liga.slice(startIdx, endIdx));

const newBlock = `{(user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())) && (
                      <View style={s.codeRow}>
                        <Text style={s.codeLabel}>CODIGO INVITACION</Text>
                        <LinearGradient colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.08)']} style={s.codePill}>
                          <Text style={s.codeTxt}>{selectedLeague.code}</Text>
                        </LinearGradient>
                      </View>
                    )}`;

liga = liga.slice(0, startIdx) + newBlock + liga.slice(endIdx);
fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');