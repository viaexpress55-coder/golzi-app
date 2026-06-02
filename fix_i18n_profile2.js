const fs = require('fs');
let i18n = fs.readFileSync('src/locales/i18n.ts', 'utf8');

const profileKeys = {
  es: {
    profile_streak_current: 'RACHA ACTUAL', profile_streak_best: 'MEJOR RACHA',
    profile_levels: 'NIVELES XP', profile_your_level: 'TU NIVEL',
    profile_badges_earned: 'OBTENIDO', profile_badges_locked: 'BLOQUEADO',
    profile_test_notif_btn: 'PROBAR NOTIFICACION',
    profile_pending: 'Pendiente', profile_no_predictions: 'Aun no tienes predicciones',
  },
  en: {
    profile_streak_current: 'CURRENT STREAK', profile_streak_best: 'BEST STREAK',
    profile_levels: 'XP LEVELS', profile_your_level: 'YOUR LEVEL',
    profile_badges_earned: 'EARNED', profile_badges_locked: 'LOCKED',
    profile_test_notif_btn: 'TEST NOTIFICATION',
    profile_pending: 'Pending', profile_no_predictions: 'No predictions yet',
  },
  pt: {
    profile_streak_current: 'SEQUENCIA ATUAL', profile_streak_best: 'MELHOR SEQUENCIA',
    profile_levels: 'NIVEIS XP', profile_your_level: 'SEU NIVEL',
    profile_badges_earned: 'OBTIDO', profile_badges_locked: 'BLOQUEADO',
    profile_test_notif_btn: 'TESTAR NOTIFICACAO',
    profile_pending: 'Pendente', profile_no_predictions: 'Sem predicoes ainda',
  },
  fr: {
    profile_streak_current: 'SERIE ACTUELLE', profile_streak_best: 'MEILLEURE SERIE',
    profile_levels: 'NIVEAUX XP', profile_your_level: 'VOTRE NIVEAU',
    profile_badges_earned: 'OBTENU', profile_badges_locked: 'BLOQUE',
    profile_test_notif_btn: 'TESTER NOTIFICATION',
    profile_pending: 'En attente', profile_no_predictions: 'Pas encore de pronostics',
  },
  de: {
    profile_streak_current: 'AKTUELLE SERIE', profile_streak_best: 'BESTE SERIE',
    profile_levels: 'XP LEVEL', profile_your_level: 'IHR LEVEL',
    profile_badges_earned: 'ERHALTEN', profile_badges_locked: 'GESPERRT',
    profile_test_notif_btn: 'BENACHRICHTIGUNG TESTEN',
    profile_pending: 'Ausstehend', profile_no_predictions: 'Noch keine Vorhersagen',
  },
  it: {
    profile_streak_current: 'SERIE ATTUALE', profile_streak_best: 'MIGLIORE SERIE',
    profile_levels: 'LIVELLI XP', profile_your_level: 'IL TUO LIVELLO',
    profile_badges_earned: 'OTTENUTO', profile_badges_locked: 'BLOCCATO',
    profile_test_notif_btn: 'TESTA NOTIFICA',
    profile_pending: 'In attesa', profile_no_predictions: 'Nessuna previsione ancora',
  },
  ru: {
    profile_streak_current: 'ТЕКУЩАЯ СЕРИЯ', profile_streak_best: 'ЛУЧШАЯ СЕРИЯ',
    profile_levels: 'УРОВНИ XP', profile_your_level: 'ВАШ УРОВЕНЬ',
    profile_badges_earned: 'ПОЛУЧЕНО', profile_badges_locked: 'ЗАБЛОКИРОВАНО',
    profile_test_notif_btn: 'ТЕСТ УВЕДОМЛЕНИЯ',
    profile_pending: 'Ожидание', profile_no_predictions: 'Нет прогнозов пока',
  },
  ar: {
    profile_streak_current: 'السلسلة الحالية', profile_streak_best: 'افضل سلسلة',
    profile_levels: 'مستويات XP', profile_your_level: 'مستواك',
    profile_badges_earned: 'محصل عليه', profile_badges_locked: 'مقفل',
    profile_test_notif_btn: 'اختبار الاشعار',
    profile_pending: 'معلق', profile_no_predictions: 'لا توجد تنبؤات بعد',
  },
  zh: {
    profile_streak_current: '当前连胜', profile_streak_best: '最佳连胜',
    profile_levels: 'XP等级', profile_your_level: '您的等级',
    profile_badges_earned: '已获得', profile_badges_locked: '已锁定',
    profile_test_notif_btn: '测试通知',
    profile_pending: '待定', profile_no_predictions: '还没有预测',
  },
  ja: {
    profile_streak_current: '現在の連勝', profile_streak_best: '最高連勝',
    profile_levels: 'XPレベル', profile_your_level: 'あなたのレベル',
    profile_badges_earned: '取得済み', profile_badges_locked: 'ロック中',
    profile_test_notif_btn: '通知テスト',
    profile_pending: '保留中', profile_no_predictions: 'まだ予測なし',
  },
  ko: {
    profile_streak_current: '현재 연승', profile_streak_best: '최고 연승',
    profile_levels: 'XP 레벨', profile_your_level: '내 레벨',
    profile_badges_earned: '획득', profile_badges_locked: '잠김',
    profile_test_notif_btn: '알림 테스트',
    profile_pending: '대기중', profile_no_predictions: '아직 예측 없음',
  },
  hi: {
    profile_streak_current: 'वर्तमान स्ट्रीक', profile_streak_best: 'सर्वश्रेष्ठ स्ट्रीक',
    profile_levels: 'XP स्तर', profile_your_level: 'आपका स्तर',
    profile_badges_earned: 'प्राप्त', profile_badges_locked: 'लॉक्ड',
    profile_test_notif_btn: 'नोटिफिकेशन टेस्ट',
    profile_pending: 'लंबित', profile_no_predictions: 'अभी तक कोई भविष्यवाणी नहीं',
  },
};

Object.keys(profileKeys).forEach(lang => {
  const keys = profileKeys[lang];
  const searchStr = `${lang}: {\r\n    translation: {`;
  const insertStr = Object.entries(keys).map(([k,v]) => `      ${k}: '${v}',`).join('\n');
  i18n = i18n.replace(searchStr, `${searchStr}\n${insertStr}`);
});
fs.writeFileSync('src/locales/i18n.ts', i18n);
console.log('OK i18n');

// Actualizar ProfileScreen
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');

profile = profile.replace(/>RACHA ACTUAL</g, `>{t('profile_streak_current')}<`);
profile = profile.replace(/>MEJOR RACHA</g, `>{t('profile_streak_best')}<`);
profile = profile.replace(/>NIVELES XP</g, `>{t('profile_levels')}<`);
profile = profile.replace(/>OBTENIDO</g, `>{t('profile_badges_earned')}<`);  
profile = profile.replace(/>BLOQUEADO</g, `>{t('profile_badges_locked')}<`);
profile = profile.replace(/>Aun no tienes predicciones</g, `>{t('profile_no_predictions')}<`);
profile = profile.replace(/>Pendiente</g, `>{t('profile_pending')}<`);

// Fix NIVELFS XP typo
profile = profile.replace('NIVELFS XP', 'NIVELES XP');

fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK ProfileScreen');