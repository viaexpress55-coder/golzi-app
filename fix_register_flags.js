const fs = require('fs');
let c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

const idx = c.indexOf('<Text style={s.countryFlag}>');
const end = c.indexOf('</Text>', idx) + '</Text>'.length;

const newFlag = `<Image 
                  source={{ uri: \`https://flagcdn.com/w40/\${(i === 8 && country === 8 && selectedCountry ? selectedCountry.code : cc.code).toLowerCase()}.png\` }}
                  style={{ width:28, height:20, borderRadius:2 }}
                  resizeMode="cover"
                />`;

c = c.slice(0, idx) + newFlag + c.slice(end);

// El map usa 'c' como variable — renombrar para evitar conflicto con fs
c = c.replace(
  `{COUNTRIES.map((c, i) => (`,
  `{COUNTRIES.map((cc, i) => (`
);
c = c.replace(
  `style={[s.countryBtn, country === i && s.countryBtnOn]}`,
  `style={[s.countryBtn, country === i && s.countryBtnOn]}`
);
c = c.replace(
  `if (c.code === 'OT')`,
  `if (cc.code === 'OT')`
);
c = c.replace(
  `[s.countryName, country === i && s.countryNameOn]}>
                  {i === 8 && country === 8 && selectedCountry ? selectedCountry.name : c.name}`,
  `[s.countryName, country === i && s.countryNameOn]}>
                  {i === 8 && country === 8 && selectedCountry ? selectedCountry.name : cc.name}`
);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', c);
console.log('OK flagcdn:', c.includes('flagcdn.com'));
console.log('OK map cc:', c.includes('map((cc, i)'));