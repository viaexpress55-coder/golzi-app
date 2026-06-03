const fs = require('fs');
let c = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

// Eliminar la segunda declaración duplicada
c = c.replace(
  `const [showCountryModal, setShowCountryModal] = useState(false);\r\n  const [countrySearch, setCountrySearch] = useState('');\r\n  const [countrySearch, setCountrySearch] = useState('');`,
  `const [showCountryModal, setShowCountryModal] = useState(false);\r\n  const [countrySearch, setCountrySearch] = useState('');`
);

c = c.replace(
  `const [showCountryModal, setShowCountryModal] = useState(false);\n  const [countrySearch, setCountrySearch] = useState('');\n  const [countrySearch, setCountrySearch] = useState('');`,
  `const [showCountryModal, setShowCountryModal] = useState(false);\n  const [countrySearch, setCountrySearch] = useState('');`
);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', c);
const count = (c.match(/countrySearch, setCountrySearch/g)||[]).length;
console.log('OK - declaraciones:', count);