import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // SPLASH
      splash_days: 'DÍAS',
      splash_hours: 'HRS',
      splash_mins: 'MIN',
      splash_secs: 'SEG',
      splash_subtitle: 'Juego de predicciones deportivas · Sin apuestas · Sin azar',
      splash_languages: 'Disponible en 12 idiomas',
      // HOME
      home_matches: 'PARTIDOS PENDIENTES',
      home_predict: 'PREDECIR PARTIDO',
      home_confirm: 'CONFIRMAR PREDICCIÓN',
      home_sent: 'PREDICCIÓN ENVIADA',
      home_points: 'SISTEMA DE PUNTOS',
      home_exact: 'Marcador exacto',
      home_winner: 'Solo ganador',
      home_draw: 'Empate',
      // AUTH
      login_welcome: 'BIENVENIDO',
      login_subtitle: 'Inicia sesión en tu cuenta',
      login_email: 'EMAIL',
      login_password: 'CONTRASEÑA',
      login_btn: 'INICIAR SESIÓN',
      login_loading: 'ENTRANDO...',
      login_register: '¿No tienes cuenta? Regístrate →',
      login_guest: 'Continuar sin cuenta →',
      // REGISTER
      register_title: 'CREAR CUENTA',
      register_btn: 'REGISTRARME',
      // PLANS
      plan_free: 'GRATIS',
      plan_golzair: 'GOLZAIR',
      plan_liga: 'LIGA',
      plan_pro: 'PRO',
      // GENERAL
      back: 'Atrás',
      loading: 'Cargando...',
      error: 'Error',
      save: 'Guardar',
      cancel: 'Cancelar',
    }
  },
  en: {
    translation: {
      splash_days: 'DAYS',
      splash_hours: 'HRS',
      splash_mins: 'MIN',
      splash_secs: 'SEC',
      splash_subtitle: 'Sports prediction game · No betting · No gambling',
      splash_languages: 'Available in 12 languages',
      home_matches: 'PENDING MATCHES',
      home_predict: 'PREDICT MATCH',
      home_confirm: 'CONFIRM PREDICTION',
      home_sent: 'PREDICTION SENT',
      home_points: 'POINTS SYSTEM',
      home_exact: 'Exact score',
      home_winner: 'Winner only',
      home_draw: 'Draw',
      login_welcome: 'WELCOME',
      login_subtitle: 'Sign in to your account',
      login_email: 'EMAIL',
      login_password: 'PASSWORD',
      login_btn: 'SIGN IN',
      login_loading: 'SIGNING IN...',
      login_register: "Don't have an account? Register →",
      login_guest: 'Continue without account →',
      register_title: 'CREATE ACCOUNT',
      register_btn: 'REGISTER',
      plan_free: 'FREE',
      plan_golzair: 'GOLZAIR',
      plan_liga: 'LIGA',
      plan_pro: 'PRO',
      back: 'Back',
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
    }
  },
  pt: {
    translation: {
      splash_days: 'DIAS',
      splash_hours: 'HRS',
      splash_mins: 'MIN',
      splash_secs: 'SEG',
      splash_subtitle: 'Jogo de previsões esportivas · Sem apostas · Sem azar',
      splash_languages: 'Disponível em 12 idiomas',
      home_matches: 'PARTIDAS PENDENTES',
      home_predict: 'PREVER PARTIDA',
      home_confirm: 'CONFIRMAR PREVISÃO',
      home_sent: 'PREVISÃO ENVIADA',
      login_welcome: 'BEM-VINDO',
      login_subtitle: 'Entre na sua conta',
      login_email: 'EMAIL',
      login_password: 'SENHA',
      login_btn: 'ENTRAR',
      login_loading: 'ENTRANDO...',
      back: 'Voltar',
      loading: 'Carregando...',
    }
  },
  fr: {
    translation: {
      splash_days: 'JOURS',
      splash_hours: 'HRS',
      splash_mins: 'MIN',
      splash_secs: 'SEC',
      splash_subtitle: 'Jeu de pronostics sportifs · Sans paris · Sans hasard',
      splash_languages: 'Disponible en 12 langues',
      home_matches: 'MATCHS EN ATTENTE',
      home_predict: 'PRONOSTIQUER',
      home_confirm: 'CONFIRMER',
      home_sent: 'PRONOSTIC ENVOYÉ',
      login_welcome: 'BIENVENUE',
      login_subtitle: 'Connectez-vous à votre compte',
      login_email: 'EMAIL',
      login_password: 'MOT DE PASSE',
      login_btn: 'SE CONNECTER',
      login_loading: 'CONNEXION...',
      back: 'Retour',
      loading: 'Chargement...',
    }
  },
  de: {
    translation: {
      splash_days: 'TAGE',
      splash_hours: 'STD',
      splash_mins: 'MIN',
      splash_secs: 'SEK',
      splash_subtitle: 'Sport-Vorhersagespiel · Kein Wetten · Kein Glücksspiel',
      splash_languages: 'Verfügbar in 12 Sprachen',
      home_matches: 'AUSSTEHENDE SPIELE',
      login_welcome: 'WILLKOMMEN',
      login_btn: 'ANMELDEN',
      back: 'Zurück',
      loading: 'Laden...',
    }
  },
  it: {
    translation: {
      splash_days: 'GIORNI',
      splash_hours: 'ORE',
      splash_mins: 'MIN',
      splash_secs: 'SEC',
      login_welcome: 'BENVENUTO',
      login_btn: 'ACCEDI',
      back: 'Indietro',
      loading: 'Caricamento...',
    }
  },
  ru: {
    translation: {
      splash_days: 'ДНЕЙ',
      splash_hours: 'ЧАС',
      splash_mins: 'МИН',
      splash_secs: 'СЕК',
      login_welcome: 'ДОБРО ПОЖАЛОВАТЬ',
      login_btn: 'ВОЙТИ',
      back: 'Назад',
      loading: 'Загрузка...',
    }
  },
  ar: {
    translation: {
      splash_days: 'أيام',
      splash_hours: 'ساعة',
      splash_mins: 'دقيقة',
      splash_secs: 'ثانية',
      login_welcome: 'مرحباً',
      login_btn: 'تسجيل الدخول',
      back: 'رجوع',
      loading: 'جار التحميل...',
    }
  },
  zh: {
    translation: {
      splash_days: '天',
      splash_hours: '时',
      splash_mins: '分',
      splash_secs: '秒',
      login_welcome: '欢迎',
      login_btn: '登录',
      back: '返回',
      loading: '加载中...',
    }
  },
  ja: {
    translation: {
      splash_days: '日',
      splash_hours: '時間',
      splash_mins: '分',
      splash_secs: '秒',
      login_welcome: 'ようこそ',
      login_btn: 'ログイン',
      back: '戻る',
      loading: '読み込み中...',
    }
  },
  ko: {
    translation: {
      splash_days: '일',
      splash_hours: '시간',
      splash_mins: '분',
      splash_secs: '초',
      login_welcome: '환영합니다',
      login_btn: '로그인',
      back: '뒤로',
      loading: '로딩 중...',
    }
  },
  hi: {
    translation: {
      splash_days: 'दिन',
      splash_hours: 'घंटे',
      splash_mins: 'मिनट',
      splash_secs: 'सेकंड',
      login_welcome: 'स्वागत है',
      login_btn: 'लॉग इन करें',
      back: 'वापस',
      loading: 'लोड हो रहा है...',
    }
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;