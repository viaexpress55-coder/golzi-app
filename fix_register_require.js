const fs = require('fs');
// Buscar en todos los archivos tsx el require de firebase
const path = require('path');
const { execSync } = require('child_process');
const result = execSync('findstr /r /s "require.*firebase" src\\*.tsx src\\**\\*.tsx').toString();
console.log(result);