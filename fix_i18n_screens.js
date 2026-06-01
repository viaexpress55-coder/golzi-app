const fs = require('fs');

// ─── LigaScreen ───
let liga = fs.readFileSync('src/screens/league/LigaScreen.tsx', 'utf8');

liga = liga.replace(`'Ingresa un nombre'`, `t('league_enter_name')`);
liga = liga.replace(`'Debes iniciar sesion'`, `t('league_login_required')`);
liga = liga.replace(`'Debes crear una cuenta para crear una liga'`, `t('league_need_account_create')`);
liga = liga.replace(`'Necesitas un plan de pago para crear una liga'`, `t('league_need_plan')`);
liga = liga.replace(`'Liga creada'`, `t('league_created')`);
liga = liga.replace(`'Error al crear la liga'`, `t('league_create_error')`);
liga = liga.replace(`'Ingresa el codigo'`, `t('league_enter_code')`);
liga = liga.replace(`'Debes crear una cuenta para unirte a una liga'`, `t('league_need_account_join')`);
liga = liga.replace(`'Codigo no encontrado'`, `t('league_code_not_found')`);
liga = liga.replace(`'Ya eres miembro de esta liga'`, `t('league_already_member')`);
liga = liga.replace(`'Liga llena'`, `t('league_full')`);
liga = liga.replace(`'Error al unirse a la liga'`, `t('league_join_error')`);
liga = liga.replace(`'Por favor manten un lenguaje respetuoso'`, `t('league_respect')`);
liga = liga.replace(`'INVITACION ABIERTA - TAP PARA CERRAR'`, `t('league_invite_open')`);
liga = liga.replace(`'INVITACION CERRADA - TAP PARA ABRIR'`, `t('league_invite_closed')`);
liga = liga.replace(`'Ranking privado en tiempo real'`, `t('league_ranking_realtime')`);
liga = liga.replace(`'Chat de liga'`, `t('league_chat')`);
liga = liga.replace(`'No se pudo cambiar el estado de invitacion'`, `t('league_invite_error') || 'Error'`);
fs.writeFileSync('src/screens/league/LigaScreen.tsx', liga);
console.log('OK LigaScreen');

// ─── HomeScreen ───
let home = fs.readFileSync('src/screens/home/HomeScreen.tsx', 'utf8');
home = home.replace(`'Cuenta requerida'`, `t('home_account_required')`);
home = home.replace(`'Debes crear una cuenta para predecir. Es gratis!'`, `t('home_need_account_predict')`);
home = home.replace(`'Cancelar'`, `t('home_cancel')`);
home = home.replace(`'Crear cuenta'`, `t('home_create_account')`);
home = home.replace(`'El partido ya inicio. Sin excepciones.'`, `t('home_match_started')`);
home = home.replace(`'Ya tienes una prediccion para este partido.'`, `t('home_already_predicted')`);
fs.writeFileSync('src/screens/home/HomeScreen.tsx', home);
console.log('OK HomeScreen');

// ─── ProfileScreen ───
let profile = fs.readFileSync('src/screens/profile/ProfileScreen.tsx', 'utf8');
profile = profile.replace(`lbl: 'RETOS'`, `lbl: t('profile_challenges')`);
profile = profile.replace(`'Sin puntos'`, `t('profile_no_points')`);
fs.writeFileSync('src/screens/profile/ProfileScreen.tsx', profile);
console.log('OK ProfileScreen');