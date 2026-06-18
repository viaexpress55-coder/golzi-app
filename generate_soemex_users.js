const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const LEAGUE_ID = 'EMNGKyhHwDMbD8Da3bkZ';
const TOURNAMENT_ID = 'AjWDEeAmswbDSXV1HkBs';
const COUNTRY = 'CO';
const TARGET_TOTAL = 1000;

const FIRST_NAMES = ['Carlos','Andrés','Juan','Luis','Miguel','Daniel','Camilo','Felipe','Santiago','Sebastián','David','Diego','Jorge','Alejandro','Mateo','Nicolás','Samuel','Tomás','Esteban','Julián','María','Laura','Camila','Valentina','Daniela','Sofía','Andrea','Paula','Natalia','Catalina','Carolina','Juliana','Mariana','Gabriela','Isabella','Valeria','Manuela','Alejandra','Fernanda','Lucía'];
const LAST_NAMES = ['García','Rodríguez','Martínez','López','González','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Reyes','Morales','Cruz','Ortiz','Gutiérrez','Castro','Jiménez','Vargas','Romero','Suárez','Rojas','Mendoza','Ruiz','Herrera','Medina','Aguilar','Castillo'];

const SCORES = [
  { h:1, a:0, w:18 }, { h:2, a:0, w:14 }, { h:1, a:1, w:13 },
  { h:2, a:1, w:12 }, { h:0, a:1, w:11 }, { h:3, a:0, w:8 },
  { h:0, a:2, w:7 },  { h:2, a:2, w:6 },  { h:3, a:1, w:5 },
  { h:0, a:0, w:5 },  { h:1, a:2, w:4 },  { h:3, a:2, w:3 },
];

function randomScore() {
  const total = SCORES.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const s of SCORES) {
    r -= s.w;
    if (r <= 0) return { home: s.h, away: s.a };
  }
  return { home: 1, away: 0 };
}

function randomName() {
  const first = FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)];
  return first + ' ' + last;
}

async function main() {
  const tournamentRef = db.collection('leagues').doc(LEAGUE_ID).collection('tournaments').doc(TOURNAMENT_ID);
  const tSnap = await tournamentRef.get();
  const tData = tSnap.data();
  const matchIds = tData.matchIds;
  const existingParticipants = tData.participants || [];
  
  const needed = TARGET_TOTAL - existingParticipants.length;
  console.log('Usuarios actuales:', existingParticipants.length);
  console.log('Usuarios a crear:', needed);

  const newUserIds = [];
  let batch = db.batch();
  let batchCount = 0;
  let totalPredictions = 0;

  for (let i = 0; i < needed; i++) {
    const uid = 'fake_soemex_' + String(i+1).padStart(4, '0');
    newUserIds.push(uid);
    const username = randomName();

    // Crear usuario en users/ (global, igual que otros fake users)
    const userRef = db.collection('users').doc(uid);
    batch.set(userRef, {
      userId: uid,
      username: username,
      country: COUNTRY,
      plan: 'free',
      totalPoints: 0,
      currentStreak: 0,
      maxStreak: 0,
      language: 'es',
      isFake: true,
      totalPredictions: 0,
      exactPredictions: 0,
      rankPosition: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    batchCount++;

    // Predicciones para TODOS los 72 partidos del torneo
    for (const matchId of matchIds) {
      const score = randomScore();
      const predRef = db.collection('predictions').doc(`${uid}_${matchId}`);
      batch.set(predRef, {
        userId: uid,
        matchId,
        homeScore: score.home,
        awayScore: score.away,
        isFake: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batchCount++;
      totalPredictions++;

      if (batchCount >= 450) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
        console.log(`Progreso: usuario ${i+1}/${needed}, predicciones: ${totalPredictions}`);
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  // Actualizar el torneo con todos los participantes nuevos + status closed
  const allParticipants = [...existingParticipants, ...newUserIds];
  await tournamentRef.update({
    participants: allParticipants,
    status: 'closed',
    closedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`\n✅ ${needed} usuarios ficticios creados`);
  console.log(`✅ ${totalPredictions} predicciones generadas`);
  console.log(`✅ Torneo cerrado con ${allParticipants.length} participantes totales`);
}

main().catch(console.error);
