const fs = require('fs');

// 1. Agregar claves al i18n
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

const registerKeys = {
  es: {
    reg_min_username: 'Minimo 3 caracteres para el usuario',
    reg_invalid_email: 'Email invalido',
    reg_min_password: 'Minimo 6 caracteres para la contrasena',
    reg_password_match: 'Las contrasenyas no coinciden',
    reg_select_country: 'Debes seleccionar tu pais de origen',
    reg_country_desc: 'Elige tu pais de origen. No tiene que participar en el Mundial — define tu ranking global y el emoji de tu bandera en el perfil. Es obligatorio para completar el registro.',
  },
  en: {
    reg_min_username: 'Minimum 3 characters for username',
    reg_invalid_email: 'Invalid email',
    reg_min_password: 'Minimum 6 characters for password',
    reg_password_match: 'Passwords do not match',
    reg_select_country: 'You must select your country of origin',
    reg_country_desc: 'Choose your country of origin. It does not have to participate in the World Cup — it defines your global ranking and your flag emoji in your profile. Required to complete registration.',
  },
  pt: {
    reg_min_username: 'Minimo 3 caracteres para o usuario',
    reg_invalid_email: 'Email invalido',
    reg_min_password: 'Minimo 6 caracteres para a senha',
    reg_password_match: 'As senhas nao coincidem',
    reg_select_country: 'Voce deve selecionar seu pais de origem',
    reg_country_desc: 'Escolha seu pais de origem. Nao precisa participar da Copa — define seu ranking global e o emoji da sua bandeira no perfil. Obrigatorio para completar o registro.',
  },
  fr: {
    reg_min_username: 'Minimum 3 caracteres pour le nom',
    reg_invalid_email: 'Email invalide',
    reg_min_password: 'Minimum 6 caracteres pour le mot de passe',
    reg_password_match: 'Les mots de passe ne correspondent pas',
    reg_select_country: 'Vous devez selectionner votre pays',
    reg_country_desc: 'Choisissez votre pays. Il ne doit pas participer a la Coupe — il definit votre classement mondial. Obligatoire.',
  },
  de: {
    reg_min_username: 'Mindestens 3 Zeichen fuer den Benutzernamen',
    reg_invalid_email: 'Ungueltige E-Mail',
    reg_min_password: 'Mindestens 6 Zeichen fuer das Passwort',
    reg_password_match: 'Passwoerter stimmen nicht ueberein',
    reg_select_country: 'Sie muessen Ihr Herkunftsland auswaehlen',
    reg_country_desc: 'Waehlen Sie Ihr Herkunftsland. Es muss nicht an der WM teilnehmen. Pflichtfeld.',
  },
  it: {
    reg_min_username: 'Minimo 3 caratteri per il nome utente',
    reg_invalid_email: 'Email non valida',
    reg_min_password: 'Minimo 6 caratteri per la password',
    reg_password_match: 'Le password non corrispondono',
    reg_select_country: 'Devi selezionare il tuo paese di origine',
    reg_country_desc: 'Scegli il tuo paese. Non deve partecipare al Mondiale. Obbligatorio.',
  },
  ru: {
    reg_min_username: 'Минимум 3 символа для имени',
    reg_invalid_email: 'Неверный email',
    reg_min_password: 'Минимум 6 символов для пароля',
    reg_password_match: 'Пароли не совпадают',
    reg_select_country: 'Необходимо выбрать страну',
    reg_country_desc: 'Выберите страну. Она не обязана участвовать в ЧМ. Обязательно.',
  },
  ar: {
    reg_min_username: '3 أحرف على الأقل للاسم',
    reg_invalid_email: 'بريد إلكتروني غير صالح',
    reg_min_password: '6 أحرف على الأقل لكلمة المرور',
    reg_password_match: 'كلمات المرور غير متطابقة',
    reg_select_country: 'يجب اختيار بلدك',
    reg_country_desc: 'اختر بلدك. لا يجب أن يشارك في كأس العالم. إلزامي.',
  },
  zh: {
    reg_min_username: '用户名至少3个字符',
    reg_invalid_email: '无效邮箱',
    reg_min_password: '密码至少6个字符',
    reg_password_match: '密码不匹配',
    reg_select_country: '您必须选择您的国家',
    reg_country_desc: '选择您的国家。不必参加世界杯 — 定义您的全球排名和个人资料中的旗帜表情。必填。',
  },
  ja: {
    reg_min_username: 'ユーザー名は3文字以上',
    reg_invalid_email: '無効なメール',
    reg_min_password: 'パスワードは6文字以上',
    reg_password_match: 'パスワードが一致しません',
    reg_select_country: '出身国を選択してください',
    reg_country_desc: '出身国を選択してください。W杯に参加する必要はありません。必須項目です。',
  },
  ko: {
    reg_min_username: '사용자 이름은 최소 3자',
    reg_invalid_email: '유효하지 않은 이메일',
    reg_min_password: '비밀번호는 최소 6자',
    reg_password_match: '비밀번호가 일치하지 않습니다',
    reg_select_country: '출신 국가를 선택해야 합니다',
    reg_country_desc: '출신 국가를 선택하세요. 월드컵에 참가할 필요는 없습니다. 필수 항목입니다.',
  },
  hi: {
    reg_min_username: 'उपयोगकर्ता नाम के लिए न्यूनतम 3 अक्षर',
    reg_invalid_email: 'अमान्य ईमेल',
    reg_min_password: 'पासवर्ड के लिए न्यूनतम 6 अक्षर',
    reg_password_match: 'पासवर्ड मेल नहीं खाते',
    reg_select_country: 'आपको अपना देश चुनना होगा',
    reg_country_desc: 'अपना मूल देश चुनें। विश्व कप में भाग लेना जरूरी नहीं। अनिवार्य।',
  },
};

const langs = Object.keys(registerKeys);
langs.forEach(lang => {
  const keys = registerKeys[lang];
  const searchStr = `${lang}: {\r\n    translation: {`;
  const insertStr = Object.entries(keys).map(([k,v]) => `      ${k}: '${v}',`).join('\n');
  i18n = i18n.replace(searchStr, `${searchStr}\n${insertStr}`);
});
fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK i18n');

// 2. Actualizar RegisterScreen
let reg = fs.readFileSync('src/screens/register/RegisterScreen.tsx', 'utf8');

reg = reg.replace(
  `if (username.trim().length < 3) { setError('Mínimo 3 caracteres para el usuario'); shake(); return; }`,
  `if (username.trim().length < 3) { setError(t('reg_min_username')); shake(); return; }`
);
reg = reg.replace(
  `if (!email.includes('@')) { setError('Email inválido'); shake(); return; }`,
  `if (!email.includes('@')) { setError(t('reg_invalid_email')); shake(); return; }`
);
reg = reg.replace(
  `if (password.length < 6) { setError('Mínimo 6 caracteres para la contraseña'); shake(); return; }`,
  `if (password.length < 6) { setError(t('reg_min_password')); shake(); return; }`
);
reg = reg.replace(
  `if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); shake(); return; }`,
  `if (password !== confirmPassword) { setError(t('reg_password_match')); shake(); return; }`
);
reg = reg.replace(
  `if (country === -1) { setError('Debes seleccionar tu país de origen'); shake(); return; }`,
  `if (country === -1) { setError(t('reg_select_country')); shake(); return; }`
);

fs.writeFileSync('src/screens/register/RegisterScreen.tsx', reg);
console.log('OK RegisterScreen');