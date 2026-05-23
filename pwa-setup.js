const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((res, rej) => {
    const f = fs.createWriteStream(dest);
    https.get(url, r => r.pipe(f).on('finish', res).on('error', rej));
  });
}

const iconUrl = 'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5';

Promise.all([
  download(iconUrl, 'dist/icon-512.png'),
  download(iconUrl, 'dist/icon-192.png'),
]).then(() => {
  console.log('Iconos descargados');

  fs.writeFileSync('dist/manifest.json', JSON.stringify({
    name: 'GOLZI — Mundial 2026',
    short_name: 'GOLZI',
    start_url: '/',
    display: 'standalone',
    background_color: '#020408',
    theme_color: '#FFD700',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }, null, 2));

  let html = fs.readFileSync('dist/index.html', 'utf8');
  const pwa = '<link rel="manifest" href="/manifest.json" /><meta name="theme-color" content="#FFD700" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-title" content="GOLZI" /><link rel="apple-touch-icon" href="/icon-192.png" /><script>window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__pwaInstallPrompt=e;});</script>';
  html = html.replace('</head>', pwa + '</head>');
  html = html.replace('<meta name="viewport"', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><meta name="x-old"');
  fs.writeFileSync('dist/index.html', html);
  console.log('PWA setup completo');
});