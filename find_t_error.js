const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      searchDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const c = fs.readFileSync(fullPath, 'utf8');
      // Buscar t() fuera de componentes (antes del primer useState o useEffect)
      const componentIdx = c.indexOf('export default function');
      if (componentIdx === -1) continue;
      const beforeComponent = c.substring(0, componentIdx);
      if (beforeComponent.includes("t('") || beforeComponent.includes('t("')) {
        console.log('⚠️ t() FUERA DE COMPONENTE:', fullPath);
        const idx = beforeComponent.lastIndexOf("t('");
        console.log(JSON.stringify(beforeComponent.substring(idx-20, idx+60)));
      }
    }
  }
}

searchDir('src');
console.log('✅ Búsqueda completa');