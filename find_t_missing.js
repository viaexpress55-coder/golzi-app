const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const c = fs.readFileSync(filePath, 'utf8');
  const funcs = [...c.matchAll(/function (\w+)\s*\(/g)];
  
  for (const match of funcs) {
    const name = match[1];
    if (['if', 'for', 'while', 'switch', 'catch'].includes(name)) continue;
    
    const start = match.index;
    // Encontrar el cierre de la función
    let depth = 0;
    let i = c.indexOf('{', start);
    const funcStart = i;
    if (i === -1) continue;
    
    while (i < start + 2000 && i < c.length) {
      if (c[i] === '{') depth++;
      if (c[i] === '}') { depth--; if (depth === 0) break; }
      i++;
    }
    const body = c.substring(funcStart, i);
    
    const usesT = /[^a-zA-Z]t\('[a-z]/.test(body);
    const hasTrans = body.includes('useTranslation') || body.includes('const { t }') || body.includes('const {t}');
    
    if (usesT && !hasTrans) {
      console.log(`❌ ${path.basename(filePath)} → ${name}() usa t() sin useTranslation`);
      const tIdx = body.search(/[^a-zA-Z]t\('[a-z]/);
      console.log('  Contexto:', JSON.stringify(body.substring(tIdx, tIdx+60)));
    }
  }
}

function walkDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory() && !file.includes('node_modules')) {
      walkDir(full);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(full);
    }
  }
}

walkDir('src');
console.log('✅ Scan completo');