const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

const mundialKeys = {
  es: {
    mundial_equipo: 'EQUIPO', mundial_pt: 'PT', mundial_g: 'G', mundial_e: 'E',
    mundial_p: 'P', mundial_gd: 'GD', mundial_pts: 'PTS',
    mundial_classifies: 'Clasifica a octavos de final',
    mundial_no_matches: 'Sin partidos encontrados',
    mundial_matches: 'PARTIDOS',
    mundial_group: 'GRUPO',
  },
  en: {
    mundial_equipo: 'TEAM', mundial_pt: 'MP', mundial_g: 'W', mundial_e: 'D',
    mundial_p: 'L', mundial_gd: 'GD', mundial_pts: 'PTS',
    mundial_classifies: 'Advances to round of 16',
    mundial_no_matches: 'No matches found',
    mundial_matches: 'MATCHES',
    mundial_group: 'GROUP',
  },
  pt: {
    mundial_equipo: 'TIME', mundial_pt: 'J', mundial_g: 'V', mundial_e: 'E',
    mundial_p: 'D', mundial_gd: 'SG', mundial_pts: 'PTS',
    mundial_classifies: 'Avanca para as oitavas de final',
    mundial_no_matches: 'Nenhuma partida encontrada',
    mundial_matches: 'PARTIDAS',
    mundial_group: 'GRUPO',
  },
  fr: {
    mundial_equipo: 'EQUIPE', mundial_pt: 'MJ', mundial_g: 'V', mundial_e: 'N',
    mundial_p: 'D', mundial_gd: 'DB', mundial_pts: 'PTS',
    mundial_classifies: 'Qualifie pour les huitiemes de finale',
    mundial_no_matches: 'Aucun match trouve',
    mundial_matches: 'MATCHS',
    mundial_group: 'GROUPE',
  },
  de: {
    mundial_equipo: 'TEAM', mundial_pt: 'SP', mundial_g: 'S', mundial_e: 'U',
    mundial_p: 'N', mundial_gd: 'TD', mundial_pts: 'PKT',
    mundial_classifies: 'Qualifiziert fuer Achtelfinale',
    mundial_no_matches: 'Keine Spiele gefunden',
    mundial_matches: 'SPIELE',
    mundial_group: 'GRUPPE',
  },
  it: {
    mundial_equipo: 'SQUADRA', mundial_pt: 'G', mundial_g: 'V', mundial_e: 'P',
    mundial_p: 'S', mundial_gd: 'DR', mundial_pts: 'PTS',
    mundial_classifies: 'Si qualifica agli ottavi di finale',
    mundial_no_matches: 'Nessuna partita trovata',
    mundial_matches: 'PARTITE',
    mundial_group: 'GRUPPO',
  },
  ru: {
    mundial_equipo: 'КОМАНДА', mundial_pt: 'И', mundial_g: 'В', mundial_e: 'Н',
    mundial_p: 'П', mundial_gd: 'РМ', mundial_pts: 'О',
    mundial_classifies: 'Выходит в 1/8 финала',
    mundial_no_matches: 'Матчи не найдены',
    mundial_matches: 'МАТЧИ',
    mundial_group: 'ГРУППА',
  },
  ar: {
    mundial_equipo: 'فريق', mundial_pt: 'لعب', mundial_g: 'فاز', mundial_e: 'تعادل',
    mundial_p: 'خسر', mundial_gd: 'فارق', mundial_pts: 'نقاط',
    mundial_classifies: 'يتأهل لدور الـ16',
    mundial_no_matches: 'لا توجد مباريات',
    mundial_matches: 'مباريات',
    mundial_group: 'مجموعة',
  },
  zh: {
    mundial_equipo: '球队', mundial_pt: '场', mundial_g: '胜', mundial_e: '平',
    mundial_p: '负', mundial_gd: '净胜球', mundial_pts: '积分',
    mundial_classifies: '晋级16强',
    mundial_no_matches: '未找到比赛',
    mundial_matches: '比赛',
    mundial_group: '小组',
  },
  ja: {
    mundial_equipo: 'チーム', mundial_pt: '試合', mundial_g: '勝', mundial_e: '分',
    mundial_p: '負', mundial_gd: '得失点差', mundial_pts: '勝点',
    mundial_classifies: 'ラウンド16に進出',
    mundial_no_matches: '試合が見つかりません',
    mundial_matches: '試合',
    mundial_group: 'グループ',
  },
  ko: {
    mundial_equipo: '팀', mundial_pt: '경기', mundial_g: '승', mundial_e: '무',
    mundial_p: '패', mundial_gd: '득실차', mundial_pts: '승점',
    mundial_classifies: '16강 진출',
    mundial_no_matches: '경기를 찾을 수 없습니다',
    mundial_matches: '경기',
    mundial_group: '그룹',
  },
  hi: {
    mundial_equipo: 'टीम', mundial_pt: 'खेले', mundial_g: 'जीत', mundial_e: 'ड्रॉ',
    mundial_p: 'हार', mundial_gd: 'गोल अंतर', mundial_pts: 'अंक',
    mundial_classifies: 'राउंड ऑफ 16 में प्रवेश',
    mundial_no_matches: 'कोई मैच नहीं मिला',
    mundial_matches: 'मैच',
    mundial_group: 'ग्रुप',
  },
};

Object.keys(mundialKeys).forEach(lang => {
  const keys = mundialKeys[lang];
  const searchStr = `${lang}: {\r\n    translation: {`;
  const insertStr = Object.entries(keys).map(([k,v]) => `      ${k}: '${v}',`).join('\n');
  i18n = i18n.replace(searchStr, `${searchStr}\n${insertStr}`);
});
fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK i18n');

// Actualizar MundialScreen
let mundial = fs.readFileSync('src/screens/mundial/MundialScreen.tsx', 'utf8');

mundial = mundial.replace(/'EQUIPO'/g, `t('mundial_equipo')`);
mundial = mundial.replace(/'PT'/g, `t('mundial_pt')`);
mundial = mundial.replace(/'GD'/g, `t('mundial_gd')`);
mundial = mundial.replace(/'PTS'/g, `t('mundial_pts')`);
mundial = mundial.replace(/'Clasifica a octavos de final'/g, `t('mundial_classifies')`);
mundial = mundial.replace(/'Sin partidos encontrados'/g, `t('mundial_no_matches')`);
mundial = mundial.replace(/'PARTIDOS'/g, `t('mundial_matches')`);

// GRUPO A, GRUPO B etc — usar t('mundial_group') + letter
mundial = mundial.replace(/`GRUPO \$\{/g, `\`\${t('mundial_group')} \${`);

fs.writeFileSync('src/screens/mundial/MundialScreen.tsx', mundial);
console.log('OK MundialScreen');