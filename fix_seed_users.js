const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const names = [
  'CarlosMX','LuisCO','PedroAR','JuanBR','MiguelES','AndresCL','DiegoVE','RobertoMX',
  'SergioBO','FernandoPE','AlejandroUY','RicardoEC','ManuelCR','JosePA','FranciscoPY',
  'AntonioCO','EdgarMX','OscarAR','HectorBR','MarcosMX','CristianCL','EmilianoAR',
  'FabioUS','MateoMX','SebastianCO','GabrielBR','NicolasCL','FelipeAR','LeonardoCO',
  'DanielMX','JavierES','PabloAR','EnriqueVE','AlbertoMX','RaulCO','CesarPE',
  'GustavoMX','AlfredoAR','EduardoBR','VictorCO','RolandoMX','ArmandoCL','ErnestoVE',
  'IsmaelMX','GerardoAR','HugoBR','AdolfoCO','OctavioMX','SalvadorES','RubénCL',
  'MarcoIT','LucaIT','GiovanniIT','FrancescoIT','AlessioIT','DavideIT',
  'ThomasFR','LouisFR','NoahFR','LucasFR','HugoBE','NathanFR',
  'LeventeHU','AdamPL','KacperPL','MichalPL','PiotrPL','MarekCZ',
  'YukiJP','HiroshiJP','TakeshiJP','KenjiJP','RyuJP','ShinJP',
  'MinhoKR','JiwonKR','SeojunKR','DohyunKR','HansolKR','YunhoKR',
  'WeiCN','LiangCN','FengCN','JianCN','HaoCN','PengCN',
  'RahulIN','ArjunIN','VikramIN','RohanIN','AaravIN','KavyaIN',
  'AhmedEG','OmarEG','KhalidSA','FaisalSA','YoussefMA','TarikMA',
  'KofiBJ','SeunNG','ChukwuNG','TundeNG','KwameGH','AmoahGH',
  'JohnUS','MikeUS','ChrisUS','BryanUS','KevinUS','TylerUS',
  'LiamCA','NoahCA','OliverCA','EthanCA','MasonCA','LoganCA',
  'JackGB','OliverGB','HarryGB','GeorgeGB','CharlesGB','WilliamGB',
  'MaxDE','LeonDE','PaulDE','JonasDE','FinnDE','EliasDE',
  'MateoMEX2','SantiagoARG','ValentinaARG','IsabelCOL','SofiaBRA','CamilaVEN',
  'LuciaPER','ValeriaECU','NataliaCHI','PaulaURU','AnaparaguAY','KarenCR',
  'DiegoMX2','CarlosAR2','JuanCO2','PedroBR2','MiguelCL2','AndresVE2',
  'FutbolFan1','GolzairPro','MundialFan','PredictorX','CrackTotal','GoalMaster',
  'LigaPro','FutFan11','CrackBR','PredMaster','GolzairFan','MundialPred',
  'ElClasico','CopaMundo','GoldenBoot','WorldCupFan','FutbolWorld','SoccerKing',
  'Ronaldinho10','Messi2026','Mbappe7','Haaland9','VinJr7','Bellingham8',
];

const countries = [
  {code:'CO',flag:'🇨🇴'},{code:'MX',flag:'🇲🇽'},{code:'AR',flag:'🇦🇷'},
  {code:'BR',flag:'🇧🇷'},{code:'CL',flag:'🇨🇱'},{code:'VE',flag:'🇻🇪'},
  {code:'PE',flag:'🇵🇪'},{code:'EC',flag:'🇪🇨'},{code:'UY',flag:'🇺🇾'},
  {code:'US',flag:'🇺🇸'},{code:'ES',flag:'🇪🇸'},{code:'IT',flag:'🇮🇹'},
  {code:'FR',flag:'🇫🇷'},{code:'DE',flag:'🇩🇪'},{code:'GB',flag:'🇬🇧'},
  {code:'JP',flag:'🇯🇵'},{code:'KR',flag:'🇰🇷'},{code:'CN',flag:'🇨🇳'},
  {code:'IN',flag:'🇮🇳'},{code:'NG',flag:'🇳🇬'},{code:'MA',flag:'🇲🇦'},
  {code:'GH',flag:'🇬🇭'},{code:'CA',flag:'🇨🇦'},{code:'PY',flag:'🇵🇾'},
];

async function seed() {
  const batch = db.batch();
  let count = 0;

  for (let i = 0; i < 200; i++) {
    const name = names[i % names.length] + (i >= names.length ? '_' + Math.floor(i/names.length) : '');
    const country = countries[i % countries.length];
    const uid = 'fake_user_' + String(i+1).padStart(3,'0');
    
    const ref = db.collection('users').doc(uid);
    batch.set(ref, {
      userId: uid,
      username: name,
      country: country.code,
      plan: 'free',
      totalPoints: 0,
      currentStreak: 0,
      maxStreak: 0,
      language: 'es',
      createdAt: new Date(),
      isFake: true,
    });
    count++;
    if (count % 500 === 0) await batch.commit();
  }
  
  await batch.commit();
  console.log('OK - 200 usuarios creados');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });