import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const wompiEventsKey = defineSecret('WOMPI_EVENTS_KEY');

export const wompiWebhook = onRequest(
  { secrets: ['WOMPI_EVENTS_KEY'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const event = req.body;
      console.log('Wompi event received:', JSON.stringify(event));

      // Verificar firma del evento
      const signature = req.headers['x-event-checksum'] as string;
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', wompiEventsKey.value())
          .update(JSON.stringify(event))
          .digest('hex');

        if (signature !== expectedSignature) {
          console.error('Invalid signature');
          res.status(401).send('Invalid signature');
          return;
        }
      }

      // Procesar evento de pago aprobado
      if (event.event === 'transaction.updated') {
        const transaction = event.data?.transaction;

        if (!transaction) {
          res.status(200).send('OK');
          return;
        }

        const reference = transaction.reference;
        const status = transaction.status;
        const transactionId = transaction.id;

        console.log(`Transaction ${transactionId} - Reference: ${reference} - Status: ${status}`);

        // Buscar la preferencia de pago
        const prefDoc = await admin.firestore()
          .collection('paymentPreferences')
          .doc(reference)
          .get();

        if (!prefDoc.exists) {
          console.error('Payment preference not found:', reference);
          res.status(200).send('OK');
          return;
        }

        const prefData = prefDoc.data()!;
        const userId = prefData.userId;
        const planId = prefData.planId;

        // Actualizar status en paymentPreferences
        await prefDoc.ref.update({
          status: status === 'APPROVED' ? 'approved' : status.toLowerCase(),
          transactionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Si el pago fue aprobado, activar el plan
        if (status === 'APPROVED') {
          await admin.firestore().collection('users').doc(userId).update({
            plan: planId,
            planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            planProvider: 'wompi',
            transactionId,
          });
          console.log(`Plan ${planId} activated for user ${userId}`);
        }
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(500).send('Internal Server Error');
    }
  }
);