const fs = require('fs');
const path = require('path');

const results = [];

function checkFile(filePath) {
  const c = fs.readFileSync(filePath, 'utf8');
  // Buscar todas las funciones/componentes
  const funcRegex = /(?:function|const)\s+([A-Z][a-zA-Z]+)\s*[=(]/g;
  let match;
  while ((match = funcRegex.exec(c)) !== null) {
    const name = match[1];
    const start = match.index;
    // Obtener cuerpo aproximado
    let depth = 0, i = c.indexOf('{', start);
    if (i === -1) continue;
    const bodyStart = i;
    let chars = 0;
    while (i < c.length && chars < 3000) {
      if (c[i] === '{') depth++;
      if (c[i] === '}') { depth--; if (depth === 0) break; }
      i++; chars++;
    }
    const body = c.substring(bodyStart, i);
    const usesT = body.includes("t('") || body.includes('t("');
    const hasT = body.includes('useTranslation') || 
                 body.includes('const { t }') ||
                 body.includes('{ t }:') ||
                 body.includes('t: (') ||
                 body.includes('t: string') ||
                 body.includes(', t)') ||
                 body.includes(', t }');
    if (usesT && !hasT) {
      results.push({ file: path.basename(filePath), name, sample: body.substring(body.indexOf("t('"), body.indexOf("t('") + 50) });
    }
  }
}

function walkDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      walkDir(full);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(full);
    }
  }
}

walkDir('src');
if (results.length === 0) {
  console.log('✅ No se encontraron componentes con t() sin useTranslation');
} else {
  results.forEach(r => console.log(`❌ ${r.file} → ${r.name}: ${r.sample}`));
}