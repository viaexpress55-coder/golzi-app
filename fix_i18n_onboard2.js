const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

const onboardBtnKeys = {
  es: { onboard_next: 'SIGUIENTE  →', onboard_start: '¡EMPEZAR!  ⚡', onboard_have_account: 'Ya tengo cuenta →', onboard_guest: 'Explorar sin cuenta →' },
  en: { onboard_next: 'NEXT  →', onboard_start: 'START!  ⚡', onboard_have_account: 'I already have an account →', onboard_guest: 'Explore without account →' },
  pt: { onboard_next: 'PRÓXIMO  →', onboard_start: 'COMEÇAR!  ⚡', onboard_have_account: 'Já tenho conta →', onboard_guest: 'Explorar sem conta →' },
  fr: { onboard_next: 'SUIVANT  →', onboard_start: 'COMMENCER!  ⚡', onboard_have_account: 'J\'ai déjà un compte →', onboard_guest: 'Explorer sans compte →' },
  de: { onboard_next: 'WEITER  →', onboard_start: 'LOSLEGEN!  ⚡', onboard_have_account: 'Ich habe bereits ein Konto →', onboard_guest: 'Ohne Konto erkunden →' },
  it: { onboard_next: 'AVANTI  →', onboard_start: 'INIZIA!  ⚡', onboard_have_account: 'Ho già un account →', onboard_guest: 'Esplora senza account →' },
  ru: { onboard_next: 'ДАЛЕЕ  →', onboard_start: 'НАЧАТЬ!  ⚡', onboard_have_account: 'У меня уже есть аккаунт →', onboard_guest: 'Изучить без аккаунта →' },
  ar: { onboard_next: 'التالي  →', onboard_start: 'ابدأ!  ⚡', onboard_have_account: 'لدي حساب بالفعل →', onboard_guest: 'استكشف بدون حساب →' },
  zh: { onboard_next: '下一步  →', onboard_start: '开始!  ⚡', onboard_have_account: '我已有账户 →', onboard_guest: '无需账户探索 →' },
  ja: { onboard_next: '次へ  →', onboard_start: '始める!  ⚡', onboard_have_account: 'すでにアカウントがある →', onboard_guest: 'アカウントなしで探索 →' },
  ko: { onboard_next: '다음  →', onboard_start: '시작!  ⚡', onboard_have_account: '이미 계정이 있습니다 →', onboard_guest: '계정 없이 탐색 →' },
  hi: { onboard_next: 'अगला  →', onboard_start: 'शुरू करें!  ⚡', onboard_have_account: 'मेरे पास पहले से खाता है →', onboard_guest: 'बिना खाते के एक्सप्लोर करें →' },
};

const langs = Object.keys(onboardBtnKeys);
langs.forEach(lang => {
  const keys = onboardBtnKeys[lang];
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
  const block = c.substring(i, i+3000);
  console.log(l+':', block.includes('onboard_next'));
});