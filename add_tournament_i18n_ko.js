const fs = require('fs');
const filePath = 'src/locales/i18n.ts';
let content = fs.readFileSync(filePath, 'utf8');

const koTranslation = `      tourn_title: '\ud1a0\ub108\uba3c\ud2b8', tourn_sub: '\uc6d4\ub4dc\ucef42026', tourn_support: '\uc9c0\uc6d0: golziapp@gmail.com', tourn_create_btn: '\ud1a0\ub108\uba3c\ud2b8 \ub9cc\ub4e4\uae30', tourn_join_btn: '\ucc38\uac00\ud558\uae30', tourn_ranking_btn: '\uc21c\uc704 \ubcf4\uae30', tourn_close_form: '\ub2eb\uae30', tourn_create_action: '\ub9cc\ub4e4\uae30', tourn_creating: '\uc0dd\uc131 \uc911...', tourn_close: '\ub2eb\uae30', tourn_empty_title: '\ud1a0\ub108\uba3c\ud2b8 \uc5c6\uc74c', tourn_empty_admin: '\ub9ac\uadf8\uc758 \uccab \ubc88\uc9f8 \ud1a0\ub108\uba3c\ud2b8\ub97c \ub9cc\ub4dc\uc138\uc694.', tourn_empty_member: '\uad00\ub9ac\uc790\uac00 \uc5ec\uae30\uc5d0 \ud1a0\ub108\uba3c\ud2b8\ub97c \ub9cc\ub4e4 \uac83\uc785\ub2c8\ub2e4.', tourn_status_active: '\uc9c4\ud589 \uc911', tourn_status_upcoming: '\uc608\uc815', tourn_status_finished: '\uc885\ub8cc', tourn_public_badge: '\uacf5\uac1c', tourn_label_start: '\uc2dc\uc791', tourn_label_end: '\uc885\ub8cc', tourn_label_matches: '\uacbd\uae30', tourn_label_members: '\ucc38\uac00\uc790', tourn_joined: '\ucc38\uac00\ub428', tourn_form_name: '\ud1a0\ub108\uba3c\ud2b8 \uc774\ub984 *', tourn_form_desc: '\uc124\uba85 (\uc120\ud0dd)', tourn_form_prize1: '1\uc704 \uc0c1\ud488 *', tourn_form_prize2: '2\uc704 \uc0c1\ud488 (\uc120\ud0dd)', tourn_form_prize3: '3\uc704 \uc0c1\ud488 (\uc120\ud0dd)', tourn_form_start: '\uc2dc\uc791\uc77c * (YYYY-MM-DD)', tourn_form_end: '\uc885\ub8cc\uc77c * (YYYY-MM-DD)', tourn_form_city: '\ub3c4\uc2dc *', tourn_form_country: '\uad6d\uac00 *', tourn_form_web: '\uc6f9\uc0ac\uc774\ud2b8 (\uc120\ud0dd)', tourn_form_max: '\ucd5c\ub300 \ucc38\uac00\uc790 \uc218 *', tourn_form_category: '\ube44\uc988\ub2c8\uc2a4 \uce74\ud14c\uace0\ub9ac', tourn_form_public: '\uacf5\uac1c \ud1a0\ub108\uba3c\ud2b8', tourn_form_private: '\ube44\uacf5\uac1c \ud1a0\ub108\uba3c\ud2b8', tourn_form_public_hint: '\ubaa8\ub4e0 GOLZI \uc0ac\uc6a9\uc790\uc5d0\uac8c \ud45c\uc2dc', tourn_form_private_hint: '\ub9ac\uadf8 \uba64\ubc84\ub9cc', tourn_form_error: '*\ub85c \ud45c\uc2dc\ub41c \ud544\uc218 \ud56d\ubaa9\uc744 \ubaa8\ub450 \uc785\ub825\ud558\uc138\uc694', tourn_no_preds: '\uc544\uc9c1 \uc608\uce21 \uc5c6\uc74c', tourn_already_joined: '\uc774\ubbf8 \ucc38\uac00\ud568', tourn_already_joined_msg: '\uc774\ubbf8 \uc774 \ud1a0\ub108\uba3c\ud2b8\uc5d0 \ucc38\uac00\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4', tourn_error_create: '\ud1a0\ub108\uba3c\ud2b8\ub97c \ub9cc\ub4e4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4', tourn_ph_name: '\uc608: 8\uac15 \ud1a0\ub108\uba3c\ud2b8', tourn_ph_desc: '\ud1a0\ub108\uba3c\ud2b8 \uc124\uba85...', tourn_ph_prize1: '\uc608: 2\uc778 \uc800\ub141 \uc2dd\uc0ac', tourn_ph_prize2: '\uc608: 30% \ud560\uc778 \ucfe0\ud3f0', tourn_ph_prize3: '\uc608: \ubb34\ub8cc \uc74c\ub8cc', tourn_ph_city: '\uc608: \uc11c\uc6b8', tourn_ph_country: '\uc608: \ud55c\uad6d', tourn_ph_web: 'https://www.yourbusiness.kr', tourn_ph_max: '\uc608: 100',`;

// Insertar antes de la línea 2662 usando split por líneas
const lines = content.split('\n');
// Línea 2662 en el archivo original — ahora puede ser diferente por inserciones previas
// Buscar la línea que contiene ranking_share del bloque ko
let koLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ranking_share') && lines[i].includes('Ùª¼ÛÀ©') && !lines[i].includes('tourn_title')) {
    koLineIdx = i;
    break;
  }
}

if (koLineIdx === -1) {
  // Buscar por contenido único de ko ranking
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ranking_no_league') && lines[i].includes('ýûñ Ùª¼ÛÀ©')) {
      koLineIdx = i;
      break;
    }
  }
}

if (koLineIdx >= 0) {
  lines.splice(koLineIdx, 0, koTranslation);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`✅ ko: claves agregadas en línea ${koLineIdx + 1}`);
} else {
  console.log('⚠️  ko: no se encontró la posición. Intentando con índice fijo...');
  // Buscar cualquier línea con contenido ko único
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("ranking_share: '\uC0C1\uD5A8'") || lines[i].includes('Û│Áý£á')) {
      lines.splice(i, 0, koTranslation);
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`✅ ko: claves agregadas en línea ${i + 1}`);
      break;
    }
  }
}
