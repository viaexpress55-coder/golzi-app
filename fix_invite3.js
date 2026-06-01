const fs = require('fs');
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

// Ocultar codeRow para miembros cuando invitación está cerrada
liga = liga.replace(
  `<View style={s.codeRow}>
                      <Text style={s.codeLabel}>CÓDIGO DE INVITACIÓN</Text>
                      <LinearGradient colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.08)']} style={s.codePill}>
                        <Text style={s.codeTxt}>🏆 {selectedLeague.code}</Text>
                      </LinearGradient>
                    </View>`,
  `{(user?.uid === selectedLeague.ownerId || selectedLeague.inviteOpen || !['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'].includes((selectedLeague.plan||'').toUpperCase())) && (
                      <View style={s.codeRow}>
                        <Text style={s.codeLabel}>CODIGO DE INVITACION</Text>
                        <LinearGradient colors={['rgba(255,215,0,0.15)','rgba(255,215,0,0.08)']} style={s.codePill}>
                          <Text style={s.codeTxt}>{selectedLeague.code}</Text>
                        </LinearGradient>
                      </View>
                    )}`
);

fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK');