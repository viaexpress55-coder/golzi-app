const fs = require('fs');

// Leer el index.html generado
let html = fs.readFileSync('dist/index.html', 'utf8');

// Agregar script de redirect SPA antes del cierre de </head>
const spaScript = `
  <script>
    // SPA redirect fix - handle deep links
    (function() {
      var path = window.location.pathname;
      if (path && path !== '/' && path !== '/index.html') {
        // Guardar el path para procesarlo después
        try { localStorage.setItem('golzi_redirect_path', path); } catch(e) {}
        // Redirigir a la raíz manteniendo la app
        window.history.replaceState(null, '', '/');
      }
    })();
  </script>`;

html = html.replace('</head>', spaScript + '\n</head>');

fs.writeFileSync('dist/index.html', html);
console.log('OK - SPA fix aplicado');