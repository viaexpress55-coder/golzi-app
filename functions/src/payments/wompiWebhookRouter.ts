import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const wompiEventsKey = defineSecret('WOMPI_EVENTS_KEY');

const JUMPSELLER_WEBHOOK = 'https://soemex.jumpseller.com/checkout/wompi/ipn';

export const wompiWebhookRouter = onRequest(
  { secrets: ['WOMPI_EVENTS_KEY'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const event = req.body;
      console.log('Wompi router event:', JSON.stringify(event));

      // Reenviar a Jumpseller en paralelo
      const jumpsellerForward = fetch(JUMPSELLER_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...req.headers as any,
        },
        body: JSON.stringify(event),
      }).catch(err => console.error('Jumpseller forward error:', err.message));

      // Verificar firma
      const signature = req.headers['x-event-checksum'] as string;
      if (!signature) {
        console.error('Missing signature');
        res.status(401).send('Unauthorized');
        return;
      }

      const properties = event.signature?.properties || [];
      const checksumData = properties.map((prop: string) => {
        const keys = prop.split('.');
        let value: any = event.data;
        for (const key of keys) value = value?.[key];
        return value;
      }).join('') + event.timestamp + wompiEventsKey.value();

      const expectedSignature = crypto
        .createHash('sha256')
        .update(checksumData)
        .digest('hex');

      console.log('Expected:', expectedSignature);
      console.log('Received:', signature);

      if (signature !== expectedSignature) {
        console.error('Invalid signature');
        res.status(401).send('Invalid signature');
        return;
      }

      // Procesar evento GOLZI
      if (event.event === 'transaction.updated') {
        const transaction = event.data?.transaction;
        if (transaction) {
          const reference = transaction.reference;
          const status = transaction.status;
          const transactionId = transaction.id;

          if (reference?.startsWith('GOLZI_')) {
            const prefDoc = await admin.firestore()
              .collection('paymentPreferences')
              .doc(reference)
              .get();

            if (prefDoc.exists) {
              const prefData = prefDoc.data()!;
              const userId = prefData.userId;
              const planId = prefData.planId;

              await prefDoc.ref.update({
                status: status === 'APPROVED' ? 'approved' : status.toLowerCase(),
                transactionId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              if (status === 'APPROVED') {
                const planExpiry = new Date('2027-01-19T00:00:00.000Z');
                await admin.firestore().collection('users').doc(userId).update({
                  plan: planId,
                  planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  planExpiry: planExpiry,
                  planProvider: 'wompi',
                  transactionId,
                });
                console.log(`✅ Plan ${planId} activated for user ${userId}`);
              }
            }
          }
        }
      }

      await jumpsellerForward;
      res.status(200).send('OK');

    } catch (error: any) {
      console.error('Router error:', error.message);
      res.status(200).send('OK');
    }
  }
);