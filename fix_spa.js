const fs = require('fs');
let html = fs.readFileSync('dist/index.html', 'utf8');

const spaScript = `
  <script>
    (function() {
      var path = window.location.pathname;
      if (path && path !== '/' && path !== '/index.html') {
        try { localStorage.setItem('golzi_redirect_path', path); } catch(e) {}
        window.history.replaceState(null, '', '/');
      }
    })();
  </script>`;

html = html.replace('</head>', spaScript + '\n</head>');
fs.writeFileSync('dist/index.html', html);
console.log('OK - SPA fix aplicado');