// functions/src/leagues/generateLeagueAssets.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cloud Function callable que genera:
// 1. Token único para la liga
// 2. Link de invitación: https://golzi.app/liga/[TOKEN]
// 3. QR en base64 PNG listo para mostrar/descargar
// ─────────────────────────────────────────────────────────────────────────────

import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

const db = admin.firestore();

export const generateLeagueAssets = onCall(
  { region: 'us-central1' },
  async (request) => {

    // ── Verificar autenticación ──────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión');
    }

    const userId   = request.auth.uid;
    const leagueId = request.data?.leagueId as string;

    if (!leagueId) {
      throw new HttpsError('invalid-argument', 'leagueId es requerido');
    }

    // ── Verificar que el usuario es el creador de la liga ────────────────────
    const leagueDoc = await db.collection('leagues').doc(leagueId).get();
    if (!leagueDoc.exists) {
      throw new HttpsError('not-found', 'Liga no encontrada');
    }

    const leagueData = leagueDoc.data()!;
    if (leagueData.creatorId !== userId) {
      throw new HttpsError('permission-denied', 'Solo el creador puede generar el QR');
    }

    // ── Generar token único ──────────────────────────────────────────────────
    // Si ya tiene token, reutilizarlo (idempotente)
    let token = leagueData.inviteToken;
    if (!token) {
      token = crypto.randomBytes(8).toString('hex').toUpperCase();
      // Formato: GOLZ-XXXX-XXXX
      token = `GOLZ-${token.slice(0,4)}-${token.slice(4,8)}`;
    }

    // ── Generar link de invitación ───────────────────────────────────────────
    const inviteLink = `https://golzi.app/liga/${token}`;
    const deepLink   = `golzi://liga/${token}`;

    // ── Generar QR en base64 ─────────────────────────────────────────────────
    let qrBase64: string;
    try {
      qrBase64 = await QRCode.toDataURL(inviteLink, {
        width:           400,
        margin:          2,
        color: {
          dark:  '#FFD700', // dorado GOLZI
          light: '#020408', // fondo oscuro GOLZI
        },
        errorCorrectionLevel: 'H',
      });
    } catch (err) {
      console.error('Error generando QR:', err);
      throw new HttpsError('internal', 'Error generando QR');
    }

    // ── Guardar token y link en Firestore ────────────────────────────────────
    await db.collection('leagues').doc(leagueId).update({
      inviteToken:    token,
      inviteLink,
      deepLink,
      assetsGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Liga ${leagueId}: token=${token}, link=${inviteLink}`);

    // ── Retornar al cliente ──────────────────────────────────────────────────
    return {
      success:    true,
      token,
      inviteLink,
      deepLink,
      qrBase64,   // data:image/png;base64,... — listo para <Image source={{ uri: qrBase64 }} />
    };
  }
);