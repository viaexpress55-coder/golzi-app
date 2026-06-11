const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/viaex/Downloads/golzi-2026-0792853b8968.json');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'golzi-2026.firebasestorage.app'
});

async function main() {
  const bucket = admin.storage().bucket();
  await bucket.upload('assets/og-image.png', {
    destination: 'og-image.png',
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
    },
  });
  
  const file = bucket.file('og-image.png');
  await file.makePublic();
  const url = `https://storage.googleapis.com/golzi-2026.firebasestorage.app/og-image.png`;
  console.log('✅ Imagen subida:', url);
}

main().catch(console.error);