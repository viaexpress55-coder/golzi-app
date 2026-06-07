const fs = require('fs');
const path = 'src/screens/torneos/TorneosPublicosScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// FIX 1: Premios con medallas — buscar y reemplazar por partes
content = content.replace(
  `<Text style={s.prizeTxt}>{t.prize1}</Text>\n            {t.prize2 ? <Text style={[s.prizeTxt, {marginTop:4, color: C.muted}]}>{t.prize2}</Text> : null}`,
  `{t.prize1 ? <Text style={s.prizeTxt}>🥇 {t.prize1}</Text> : null}\n            {t.prize2 ? <Text style={[s.prizeTxt, {marginTop:4, color:'#C0C0C0'}]}>🥈 {t.prize2}</Text> : null}\n            {t.prize3 ? <Text style={[s.prizeTxt, {marginTop:4, color:'#CD7F32'}]}>🥉 {t.prize3}</Text> : null}`
);
console.log('✅ Fix premios con medallas aplicado');

// FIX 2: Orden — nuevos arriba, SOEMEX fijo primero
content = content.replace(
  `{/* Torneo SOEMEX REAL primero */}`,
  `{/* Torneos reales ordenados — más recientes arriba */}`
);

content = content.replace(
  `{soemexTorneo && renderTorneoCard({...soemexTorneo, flag:'🇨🇴', ciudad:'Barranquilla', pais:'Colombia', tags:['Empresas','Colombia'], isPublic:true}, true)}\n\n        {/* Torneos públicos reales de clientes — más reciente arriba */}\n        {publicTournaments.filter(t => t.torneoId !== SOEMEX_TORNEO_ID).map(t => renderTorneoCard(t, true))}`,
  `{[\n          ...(soemexTorneo ? [{...soemexTorneo, flag:'🇨🇴', ciudad:'Barranquilla', pais:'Colombia', tags:['Empresas','Colombia'], isPublic:true, _pin: true}] : []),\n          ...publicTournaments.filter(t => t.torneoId !== SOEMEX_TORNEO_ID),\n        ].map(t => renderTorneoCard(t, true))}`
);
console.log('✅ Fix orden aplicado');

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Script completado.');