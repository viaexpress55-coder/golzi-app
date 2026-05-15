// functions/src/leagues/rivalryNotification.ts
// ─────────────────────────────────────────────────────────────────────────────
// Se dispara cuando totalPoints de un usuario aumenta.
// Detecta si subió posiciones en alguna liga y notifica a los superados.
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

const db        = admin.firestore();
const messaging = admin.messaging();

export const rivalryNotification = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const before = event.data?.before.data();
    const after  = event.data?.after.data();

    if (!before || !after) return;

    // Solo procesar si totalPoints aumentó
    const pointsBefore: number = before.totalPoints ?? 0;
    const pointsAfter:  number = after.totalPoints  ?? 0;
    if (pointsAfter <= pointsBefore) return;

    const userId   = event.params.userId;
    const username = after.username ?? 'Un Golzair';

    // ── Buscar todas las ligas donde está este usuario ────────────────────────
    const leagueMembersSnap = await db
      .collection('league_members')
      .where('userId', '==', userId)
      .get();

    if (leagueMembersSnap.empty) {
      console.log(`Usuario ${userId} no tiene ligas — sin notificaciones de rivalidad`);
      return;
    }

    const leagueIds = leagueMembersSnap.docs.map(d => d.data().leagueId);
    console.log(`Usuario ${userId} está en ${leagueIds.length} liga(s)`);

    // ── Procesar cada liga ────────────────────────────────────────────────────
    for (const leagueId of leagueIds) {

      // Obtener todos los miembros de la liga con sus puntos
      const membersSnap = await db
        .collection('league_members')
        .where('leagueId', '==', leagueId)
        .orderBy('totalPoints', 'desc')
        .get();

      if (membersSnap.empty) continue;

      // Construir ranking actual
      const ranking = membersSnap.docs.map((d, idx) => ({
        userId:      d.data().userId,
        username:    d.data().username ?? 'Golzair',
        totalPoints: d.data().totalPoints ?? 0,
        position:    idx + 1,
      }));

      // Posición actual del usuario que ganó puntos
      const myPosition = ranking.findIndex(r => r.userId === userId);
      if (myPosition === -1) continue;

      // Calcular posición anterior (con puntos anteriores)
      const rankingBefore = [...ranking]
        .map(r => r.userId === userId ? { ...r, totalPoints: pointsBefore } : r)
        .sort((a, b) => b.totalPoints - a.totalPoints);

      const myPositionBefore = rankingBefore.findIndex(r => r.userId === userId);

      // Si no subió posiciones, no hay nada que notificar
      if (myPosition >= myPositionBefore) continue;

      console.log(`Liga ${leagueId}: ${username} subió de #${myPositionBefore + 1} a #${myPosition + 1}`);

      // ── Notificar a los usuarios que fueron superados ─────────────────────
      // Son los que estaban ANTES de mi posición anterior y ahora están después
      const superados = ranking.filter((r, idx) =>
        idx > myPosition &&           // ahora están por debajo de mí
        idx <= myPositionBefore &&    // antes estaban por encima o igual
        r.userId !== userId
      );

      // Obtener nombre de la liga
      const leagueDoc = await db.collection('leagues').doc(leagueId).get();
      const leagueName = leagueDoc.data()?.name ?? 'tu liga';

      for (const superado of superados) {
        // Evitar spam — verificar si ya se notificó en las últimas 2 horas
        const cooldownKey = `rivalry_${leagueId}_${userId}_${superado.userId}`;
        const cooldownDoc = await db.collection('notification_cooldowns').doc(cooldownKey).get();

        if (cooldownDoc.exists) {
          const lastSent = cooldownDoc.data()?.sentAt?.toDate?.();
          if (lastSent) {
            const hoursAgo = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
            if (hoursAgo < 2) {
              console.log(`Cooldown activo para ${superado.userId} — saltando`);
              continue;
            }
          }
        }

        // Obtener FCM token del superado
        const superadoDoc = await db.collection('users').doc(superado.userId).get();
        const fcmToken = superadoDoc.data()?.fcmToken;

        if (!fcmToken) continue;

        // Calcular diferencia de puntos
        const myPoints    = pointsAfter;
        const theirPoints = superado.totalPoints;
        const diff        = myPoints - theirPoints;

        // Mensaje de rivalidad — multiidioma
        const superadoLang = superadoDoc.data()?.language ?? 'es';
        const RIVALRY_MESSAGES: Record<string, Array<{title:string; body:string}>> = {
          es: [
            { title: `⚡ ¡${username} te superó!`,         body: `Está ${diff} punto${diff===1?'':'s'} por encima en "${leagueName}". ¡Reacciona!` },
            { title: `🔥 ¡Te alcanzaron en la liga!`,       body: `${username} acaba de superarte. ¿Vas a dejar que se aleje?` },
            { title: `😤 ¡${username} te pasó por encima!`, body: `Ahora es #${myPosition+1} en "${leagueName}". Tú eres #${superado.position}.` },
          ],
          en: [
            { title: `⚡ ${username} just passed you!`,     body: `They are ${diff} point${diff===1?'':'s'} ahead in "${leagueName}". React!` },
            { title: `🔥 Someone caught up in the league!`, body: `${username} just surpassed you. Will you let them pull away?` },
            { title: `😤 ${username} overtook you!`,        body: `Now #${myPosition+1} in "${leagueName}". You are #${superado.position}.` },
          ],
          pt: [
            { title: `⚡ ${username} te ultrapassou!`,      body: `Está ${diff} ponto${diff===1?'':'s'} à frente em "${leagueName}". Reaja!` },
            { title: `🔥 Te alcançaram na liga!`,           body: `${username} acabou de te superar. Vai deixar escapar?` },
            { title: `😤 ${username} passou por cima!`,     body: `Agora é #${myPosition+1} em "${leagueName}". Você é #${superado.position}.` },
          ],
          fr: [
            { title: `⚡ ${username} t'a dépassé!`,         body: `Il est ${diff} point${diff===1?'':'s'} devant dans "${leagueName}". Réagis!` },
            { title: `🔥 Quelqu'un t'a rattrapé!`,          body: `${username} vient de te dépasser. Tu vas le laisser s'échapper?` },
            { title: `😤 ${username} t'a doublé!`,          body: `Maintenant #${myPosition+1} dans "${leagueName}". Tu es #${superado.position}.` },
          ],
          de: [
            { title: `⚡ ${username} hat dich überholt!`,   body: `${diff} Punkt${diff===1?'':'e'} vor dir in "${leagueName}". Reagiere!` },
            { title: `🔥 Jemand hat dich eingeholt!`,       body: `${username} hat dich gerade überholt. Willst du das zulassen?` },
            { title: `😤 ${username} ist vorbeigezogen!`,   body: `Jetzt #${myPosition+1} in "${leagueName}". Du bist #${superado.position}.` },
          ],
          it: [
            { title: `⚡ ${username} ti ha superato!`,      body: `È ${diff} punto${diff===1?'':'i'} avanti in "${leagueName}". Reagisci!` },
            { title: `🔥 Ti hanno raggiunto in lega!`,      body: `${username} ti ha appena superato. Lo lasci andare?` },
            { title: `😤 ${username} ti ha sorpassato!`,    body: `Ora è #${myPosition+1} in "${leagueName}". Tu sei #${superado.position}.` },
          ],
          ru: [
            { title: `⚡ ${username} обогнал тебя!`,        body: `На ${diff} очк${diff===1?'о':'ов'} впереди в "${leagueName}". Реагируй!` },
            { title: `🔥 Тебя догнали в лиге!`,             body: `${username} только что обогнал тебя. Ты позволишь ему уйти?` },
            { title: `😤 ${username} прошёл мимо!`,         body: `Теперь #${myPosition+1} в "${leagueName}". Ты #${superado.position}.` },
          ],
          zh: [
            { title: `⚡ ${username}超过你了!`,              body: `在"${leagueName}"中领先${diff}分。反击！` },
            { title: `🔥 有人追上你了!`,                     body: `${username}刚刚超过了你。你要让他跑掉吗？` },
            { title: `😤 ${username}把你甩在后面!`,          body: `现在在"${leagueName}"中排名第${myPosition+1}。你是第${superado.position}。` },
          ],
          ja: [
            { title: `⚡ ${username}に追い抜かれた!`,        body: `"${leagueName}"で${diff}ポイント先行。反撃して！` },
            { title: `🔥 リーグで追いつかれた!`,             body: `${username}にたった今抜かれた。逃がすの？` },
            { title: `😤 ${username}に追い越された!`,        body: `"${leagueName}"で${myPosition+1}位。あなたは${superado.position}位。` },
          ],
          ko: [
            { title: `⚡ ${username}이 추월했어!`,           body: `"${leagueName}"에서 ${diff}점 앞서 있어. 반격해!` },
            { title: `🔥 누군가 따라잡았어!`,                body: `${username}이 방금 너를 추월했어. 놔둘 거야?` },
            { title: `😤 ${username}이 앞질렀어!`,           body: `"${leagueName}"에서 ${myPosition+1}위야. 너는 ${superado.position}위.` },
          ],
          ar: [
            { title: `⚡ ${username} تجاوزك!`,              body: `يتقدم بـ${diff} نقطة في "${leagueName}". تفاعل!` },
            { title: `🔥 لحق بك شخص ما!`,                   body: `${username} تجاوزك للتو. ستتركه يبتعد؟` },
            { title: `😤 ${username} تخطاك!`,               body: `الآن #${myPosition+1} في "${leagueName}". أنت #${superado.position}.` },
          ],
          hi: [
            { title: `⚡ ${username} ने तुम्हें पीछे छोड़ा!`, body: `"${leagueName}" में ${diff} अंक आगे है। प्रतिक्रिया करो!` },
            { title: `🔥 किसी ने तुम्हें पकड़ लिया!`,        body: `${username} ने अभी तुम्हें पीछे छोड़ा। उसे जाने दोगे?` },
            { title: `😤 ${username} आगे निकल गया!`,         body: `अब "${leagueName}" में #${myPosition+1}। तुम #${superado.position} हो।` },
          ],
        };

        const langMessages = RIVALRY_MESSAGES[superadoLang] ?? RIVALRY_MESSAGES.es;
        const msgIndex = Math.floor(Math.random() * langMessages.length);
        const msg = langMessages[msgIndex];

        try {
          await messaging.send({
            token: fcmToken,
            notification: { title: msg.title, body: msg.body },
            data: {
              type:     'rivalry',
              leagueId: leagueId,
              rivalId:  userId,
              screen:   'Ranking',
            },
            android: {
              priority: 'high',
              notification: { channelId: 'golzi_rivalry' },
            },
            apns: {
              payload: { aps: { sound: 'default', badge: 1 } },
            },
          });

          // Registrar cooldown
          await db.collection('notification_cooldowns').doc(cooldownKey).set({
            sentAt:   admin.firestore.FieldValue.serverTimestamp(),
            leagueId, fromUserId: userId, toUserId: superado.userId,
          });

          console.log(`Rivalidad notificada: ${username} superó a ${superado.username} en ${leagueName}`);

        } catch (err) {
          console.error(`Error enviando notificación a ${superado.userId}:`, err);
        }
      }

      // ── Notificar al usuario que subió (si llegó al Top 3) ────────────────
      const newPosition = myPosition + 1;
      if (newPosition <= 3 && myPositionBefore + 1 > 3) {
        const myFcmToken = after.fcmToken;
        if (myFcmToken) {
          const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
          await messaging.send({
            token: myFcmToken,
            notification: {
              title: `${medals[newPosition]} ¡Entraste al Top ${newPosition}!`,
              body:  `Eres #${newPosition} en "${leagueName}". ¡Sigue así!`,
            },
            data: { type: 'top3_entry', leagueId, position: String(newPosition) },
          });
          console.log(`Top 3 notificado a ${userId}: posición ${newPosition} en ${leagueName}`);
        }
      }
    }
  }
);