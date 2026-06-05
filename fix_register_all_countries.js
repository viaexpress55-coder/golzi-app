const fs = require('fs');
const filePath = 'src/screens/register/RegisterScreen.tsx';
let src = fs.readFileSync(filePath, 'utf8');

// Encontrar inicio y fin de ALL_COUNTRIES
const start = src.indexOf('const ALL_COUNTRIES = [');
const end = src.indexOf('];', start) + 2;

console.log('ALL_COUNTRIES encontrado:', start > 0);

const newList = `const ALL_COUNTRIES = [
  {name:'Afghanistan',code:'AF'},{name:'Albania',code:'AL'},{name:'Algeria',code:'DZ'},
  {name:'Andorra',code:'AD'},{name:'Angola',code:'AO'},{name:'Antigua y Barbuda',code:'AG'},
  {name:'Arabia Saudita',code:'SA'},{name:'Argentina',code:'AR'},{name:'Armenia',code:'AM'},
  {name:'Australia',code:'AU'},{name:'Austria',code:'AT'},{name:'Azerbaiyán',code:'AZ'},
  {name:'Bahamas',code:'BS'},{name:'Bahréin',code:'BH'},{name:'Bangladesh',code:'BD'},
  {name:'Barbados',code:'BB'},{name:'Bélgica',code:'BE'},{name:'Belice',code:'BZ'},
  {name:'Benín',code:'BJ'},{name:'Bielorrusia',code:'BY'},{name:'Bolivia',code:'BO'},
  {name:'Bosnia y Herzegovina',code:'BA'},{name:'Botsuana',code:'BW'},{name:'Brasil',code:'BR'},
  {name:'Brunéi',code:'BN'},{name:'Bulgaria',code:'BG'},{name:'Burkina Faso',code:'BF'},
  {name:'Burundi',code:'BI'},{name:'Bután',code:'BT'},{name:'Cabo Verde',code:'CV'},
  {name:'Camboya',code:'KH'},{name:'Camerún',code:'CM'},{name:'Canadá',code:'CA'},
  {name:'Chad',code:'TD'},{name:'Chile',code:'CL'},{name:'China',code:'CN'},
  {name:'Chipre',code:'CY'},{name:'Colombia',code:'CO'},{name:'Comoras',code:'KM'},
  {name:'Congo',code:'CG'},{name:'Congo DR',code:'CD'},{name:'Corea del Norte',code:'KP'},
  {name:'Corea del Sur',code:'KR'},{name:'Costa Rica',code:'CR'},{name:'Croacia',code:'HR'},
  {name:'Cuba',code:'CU'},{name:'Dinamarca',code:'DK'},{name:'Djibouti',code:'DJ'},
  {name:'Ecuador',code:'EC'},{name:'Egipto',code:'EG'},{name:'El Salvador',code:'SV'},
  {name:'Emiratos Árabes',code:'AE'},{name:'Eritrea',code:'ER'},{name:'Eslovaquia',code:'SK'},
  {name:'Eslovenia',code:'SI'},{name:'España',code:'ES'},{name:'Estonia',code:'EE'},
  {name:'Etiopía',code:'ET'},{name:'Filipinas',code:'PH'},{name:'Finlandia',code:'FI'},
  {name:'Fiyi',code:'FJ'},{name:'Francia',code:'FR'},{name:'Gabón',code:'GA'},
  {name:'Gambia',code:'GM'},{name:'Georgia',code:'GE'},{name:'Ghana',code:'GH'},
  {name:'Granada',code:'GD'},{name:'Grecia',code:'GR'},{name:'Guatemala',code:'GT'},
  {name:'Guinea',code:'GN'},{name:'Guinea Ecuatorial',code:'GQ'},{name:'Guinea-Bisáu',code:'GW'},
  {name:'Guyana',code:'GY'},{name:'Haití',code:'HT'},{name:'Honduras',code:'HN'},
  {name:'Hungría',code:'HU'},{name:'India',code:'IN'},{name:'Indonesia',code:'ID'},
  {name:'Irak',code:'IQ'},{name:'Irán',code:'IR'},{name:'Irlanda',code:'IE'},
  {name:'Islandia',code:'IS'},{name:'Islas Salomón',code:'SB'},{name:'Israel',code:'IL'},
  {name:'Italia',code:'IT'},{name:'Jamaica',code:'JM'},{name:'Japón',code:'JP'},
  {name:'Jordania',code:'JO'},{name:'Kazajistán',code:'KZ'},{name:'Kenia',code:'KE'},
  {name:'Kirguistán',code:'KG'},{name:'Kiribati',code:'KI'},{name:'Kuwait',code:'KW'},
  {name:'Laos',code:'LA'},{name:'Lesoto',code:'LS'},{name:'Letonia',code:'LV'},
  {name:'Líbano',code:'LB'},{name:'Liberia',code:'LR'},{name:'Libia',code:'LY'},
  {name:'Liechtenstein',code:'LI'},{name:'Lituania',code:'LT'},{name:'Luxemburgo',code:'LU'},
  {name:'Macedonia del Norte',code:'MK'},{name:'Madagascar',code:'MG'},{name:'Malaui',code:'MW'},
  {name:'Malasia',code:'MY'},{name:'Maldivas',code:'MV'},{name:'Malí',code:'ML'},
  {name:'Malta',code:'MT'},{name:'Marruecos',code:'MA'},{name:'Mauricio',code:'MU'},
  {name:'Mauritania',code:'MR'},{name:'México',code:'MX'},{name:'Micronesia',code:'FM'},
  {name:'Moldavia',code:'MD'},{name:'Mónaco',code:'MC'},{name:'Mongolia',code:'MN'},
  {name:'Montenegro',code:'ME'},{name:'Mozambique',code:'MZ'},{name:'Myanmar',code:'MM'},
  {name:'Namibia',code:'NA'},{name:'Nauru',code:'NR'},{name:'Nepal',code:'NP'},
  {name:'Nicaragua',code:'NI'},{name:'Níger',code:'NE'},{name:'Nigeria',code:'NG'},
  {name:'Noruega',code:'NO'},{name:'Nueva Zelanda',code:'NZ'},{name:'Omán',code:'OM'},
  {name:'Países Bajos',code:'NL'},{name:'Pakistán',code:'PK'},{name:'Palaos',code:'PW'},
  {name:'Panamá',code:'PA'},{name:'Papúa Nueva Guinea',code:'PG'},{name:'Paraguay',code:'PY'},
  {name:'Perú',code:'PE'},{name:'Polonia',code:'PL'},{name:'Portugal',code:'PT'},
  {name:'Qatar',code:'QA'},{name:'Reino Unido',code:'GB'},{name:'Rep. Centroafricana',code:'CF'},
  {name:'Rep. Checa',code:'CZ'},{name:'Rep. Dominicana',code:'DO'},{name:'Ruanda',code:'RW'},
  {name:'Rumanía',code:'RO'},{name:'Rusia',code:'RU'},{name:'Samoa',code:'WS'},
  {name:'San Cristóbal y Nieves',code:'KN'},{name:'San Marino',code:'SM'},{name:'San Vicente',code:'VC'},
  {name:'Santa Lucía',code:'LC'},{name:'Santo Tomé y Príncipe',code:'ST'},{name:'Senegal',code:'SN'},
  {name:'Serbia',code:'RS'},{name:'Seychelles',code:'SC'},{name:'Sierra Leona',code:'SL'},
  {name:'Singapur',code:'SG'},{name:'Somalia',code:'SO'},{name:'Sri Lanka',code:'LK'},
  {name:'Suazilandia',code:'SZ'},{name:'Sudáfrica',code:'ZA'},{name:'Sudán',code:'SD'},
  {name:'Sudán del Sur',code:'SS'},{name:'Suecia',code:'SE'},{name:'Suiza',code:'CH'},
  {name:'Surinam',code:'SR'},{name:'Siria',code:'SY'},{name:'Tayikistán',code:'TJ'},
  {name:'Tailandia',code:'TH'},{name:'Taiwán',code:'TW'},{name:'Tanzania',code:'TZ'},
  {name:'Timor Oriental',code:'TL'},{name:'Togo',code:'TG'},{name:'Tonga',code:'TO'},
  {name:'Trinidad y Tobago',code:'TT'},{name:'Túnez',code:'TN'},{name:'Turkmenistán',code:'TM'},
  {name:'Turquía',code:'TR'},{name:'Ucrania',code:'UA'},{name:'Uganda',code:'UG'},
  {name:'Uruguay',code:'UY'},{name:'USA',code:'US'},{name:'Uzbekistán',code:'UZ'},
  {name:'Vanuatu',code:'VU'},{name:'Vaticano',code:'VA'},{name:'Venezuela',code:'VE'},
  {name:'Vietnam',code:'VN'},{name:'Yemen',code:'YE'},{name:'Yibuti',code:'DJ'},
  {name:'Zambia',code:'ZM'},{name:'Zimbabue',code:'ZW'},
].map(c => ({ ...c, flag: '' }))`;

src = src.slice(0, start) + newList + src.slice(end);
fs.writeFileSync(filePath, src, 'utf8');
console.log('✅ ALL_COUNTRIES actualizado con', (newList.match(/code:/g)||[]).length, 'países');