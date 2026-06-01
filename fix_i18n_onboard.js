const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

const onboardKeys = {
  en: {
    onboard_1_title: 'PREDICT THE MATCHES',
    onboard_1_desc: 'Choose the exact score for each World Cup 2026 match and earn points for every correct prediction.',
    onboard_2_title: 'COMPETE IN YOUR LEAGUE',
    onboard_2_desc: 'Create or join private leagues with friends, family or coworkers.',
    onboard_3_title: 'NO BETTING, JUST SKILL',
    onboard_3_desc: 'GOLZI is a sports prediction game. No money involved, just your football knowledge.',
  },
  pt: {
    onboard_1_title: 'PREVEJA OS JOGOS',
    onboard_1_desc: 'Escolha o placar exato de cada jogo da Copa do Mundo 2026 e ganhe pontos por cada acerto.',
    onboard_2_title: 'COMPITA NA SUA LIGA',
    onboard_2_desc: 'Crie ou entre em ligas privadas com amigos, familia ou colegas de trabalho.',
    onboard_3_title: 'SEM APOSTAS, SO HABILIDADE',
    onboard_3_desc: 'GOLZI e um jogo de previsoes esportivas. Sem dinheiro envolvido, apenas seu conhecimento de futebol.',
  },
  fr: {
    onboard_1_title: 'PREDISEZ LES MATCHS',
    onboard_1_desc: 'Choisissez le score exact de chaque match de la Coupe du Monde 2026 et gagnez des points.',
    onboard_2_title: 'COMPETEZ DANS VOTRE LIGUE',
    onboard_2_desc: 'Creez ou rejoignez des ligues privees avec des amis, la famille ou des collegues.',
    onboard_3_title: 'PAS DE PARIS, JUSTE DU TALENT',
    onboard_3_desc: 'GOLZI est un jeu de pronostics sportifs. Pas d argent en jeu, juste votre connaissance du football.',
  },
  de: {
    onboard_1_title: 'SAGEN SIE DIE SPIELE VORAUS',
    onboard_1_desc: 'Waehlen Sie das genaue Ergebnis fuer jedes WM-2026-Spiel und sammeln Sie Punkte.',
    onboard_2_title: 'IN IHRER LIGA ANTRETEN',
    onboard_2_desc: 'Erstellen oder treten Sie privaten Ligen mit Freunden, Familie oder Kollegen bei.',
    onboard_3_title: 'KEIN WETTEN, NUR KÖNNEN',
    onboard_3_desc: 'GOLZI ist ein Sportvorhersagespiel. Kein Geld involviert, nur Ihr Fussballwissen.',
  },
  it: {
    onboard_1_title: 'PREVEDI LE PARTITE',
    onboard_1_desc: 'Scegli il punteggio esatto di ogni partita del Mondiale 2026 e guadagna punti.',
    onboard_2_title: 'COMPETE NELLA TUA LEGA',
    onboard_2_desc: 'Crea o unisciti a leghe private con amici, famiglia o colleghi.',
    onboard_3_title: 'NESSUNA SCOMMESSA, SOLO ABILITA',
    onboard_3_desc: 'GOLZI e un gioco di previsioni sportive. Nessun soldo in gioco, solo la tua conoscenza del calcio.',
  },
  ru: {
    onboard_1_title: 'ПРЕДСКАЗЫВАЙТЕ МАТЧИ',
    onboard_1_desc: 'Выбирайте точный счет каждого матча ЧМ-2026 и зарабатывайте очки за правильные прогнозы.',
    onboard_2_title: 'СОРЕВНУЙТЕСЬ В ЛИГЕ',
    onboard_2_desc: 'Создавайте или вступайте в частные лиги с друзьями, семьей или коллегами.',
    onboard_3_title: 'НИКАКИХ СТАВОК, ТОЛЬКО НАВЫК',
    onboard_3_desc: 'GOLZI — это игра спортивных прогнозов. Без денег, только ваши знания футбола.',
  },
  ar: {
    onboard_1_title: 'توقع المباريات',
    onboard_1_desc: 'اختر النتيجة الدقيقة لكل مباراة في كأس العالم 2026 واكسب نقاطاً.',
    onboard_2_title: 'تنافس في دوريك',
    onboard_2_desc: 'أنشئ أو انضم إلى دوريات خاصة مع الأصدقاء والعائلة والزملاء.',
    onboard_3_title: 'لا رهانات فقط مهارة',
    onboard_3_desc: 'GOLZI لعبة توقعات رياضية. لا أموال على المحك فقط معرفتك بكرة القدم.',
  },
  zh: {
    onboard_1_title: '预测比赛',
    onboard_1_desc: '预测2026年世界杯每场比赛的准确比分，每次正确预测即可获得积分。',
    onboard_2_title: '在联赛中竞争',
    onboard_2_desc: '与朋友、家人或同事创建或加入私人联赛。',
    onboard_3_title: '无赌博，只有技巧',
    onboard_3_desc: 'GOLZI是一款体育预测游戏。没有金钱参与，只有您的足球知识。',
  },
  ja: {
    onboard_1_title: '試合を予測しよう',
    onboard_1_desc: '2026年ワールドカップの各試合の正確なスコアを選んでポイントを獲得しよう。',
    onboard_2_title: 'リーグで競おう',
    onboard_2_desc: '友人、家族、同僚とプライベートリーグを作成または参加しよう。',
    onboard_3_title: '賭けなし、スキルだけ',
    onboard_3_desc: 'GOLZIはスポーツ予測ゲームです。お金は関係なく、サッカーの知識だけです。',
  },
  ko: {
    onboard_1_title: '경기를 예측하세요',
    onboard_1_desc: '2026 월드컵 각 경기의 정확한 점수를 선택하고 적중할 때마다 포인트를 획득하세요.',
    onboard_2_title: '리그에서 경쟁하세요',
    onboard_2_desc: '친구, 가족 또는 동료와 프라이빗 리그를 만들거나 참여하세요.',
    onboard_3_title: '도박 없음, 오직 실력',
    onboard_3_desc: 'GOLZI는 스포츠 예측 게임입니다. 돈은 없고 오직 축구 지식만 있습니다.',
  },
  hi: {
    onboard_1_title: 'मैच की भविष्यवाणी करें',
    onboard_1_desc: '2026 विश्व कप के प्रत्येक मैच का सटीक स्कोर चुनें और हर सही भविष्यवाणी पर अंक अर्जित करें।',
    onboard_2_title: 'अपनी लीग में प्रतिस्पर्धा करें',
    onboard_2_desc: 'दोस्तों, परिवार या सहकर्मियों के साथ निजी लीग बनाएं या उनमें शामिल हों।',
    onboard_3_title: 'कोई सट्टा नहीं, सिर्फ कौशल',
    onboard_3_desc: 'GOLZI एक खेल भविष्यवाणी खेल है। कोई पैसा नहीं, सिर्फ आपका फुटबॉल ज्ञान।',
  },
};

const langs = Object.keys(onboardKeys);
langs.forEach(lang => {
  const keys = onboardKeys[lang];
  const searchStr = `${lang}: {\r\n    translation: {`;
  const insertStr = Object.entries(keys).map(([k,v]) => `      ${k}: '${v}',`).join('\n');
  i18n = i18n.replace(searchStr, `${searchStr}\n${insertStr}`);
});

fs.writeFileSync('src/locales/i18n.ts', i18n);

// Verificar
const c = fs.readFileSync('src/locales/i18n.ts', 'utf8');
const langs2 = ['es','en','pt','fr','de','it','ru','ar','zh','ja','ko','hi'];
langs2.forEach(l => {
  const i = c.indexOf(l+': {');
  const block = c.substring(i, i+2000);
  console.log(l+':', block.includes('onboard_1_title'));
});