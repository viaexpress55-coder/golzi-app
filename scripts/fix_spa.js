const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const spaScript = `<script>
  (function() {
    var p = window.location.pathname;
    if (p && p !== '/' && p !== '/index.html') {
      localStorage.setItem('golzi_redirect_path', p);
      window.history.replaceState(null, null, '/');
    }
    var redirect = sessionStorage.getItem('spa_redirect');
    if (redirect) {
      sessionStorage.removeItem('spa_redirect');
      window.history.replaceState(null, null, redirect);
    }
  })();
</script>`;

if (!html.includes('golzi_redirect_path')) {
  html = html.replace('<head>', '<head>' + spaScript);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ fix_spa.js aplicado con deep link support');
} else {
  console.log('ℹ️  SPA script ya presente');
}