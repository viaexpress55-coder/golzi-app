const sharp = require('sharp');
const fs = require('fs');

async function compress(file) {
  const before = fs.statSync(`assets/${file}`).size;
  await sharp(`assets/${file}`)
    .resize(1080, null, { withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toFile(`assets/${file}.compressed.jpg`);
  
  fs.unlinkSync(`assets/${file}`);
  fs.renameSync(`assets/${file}.compressed.jpg`, `assets/${file}`);
  
  const after = fs.statSync(`assets/${file}`).size;
  console.log(`✅ ${file}: ${(before/1024/1024).toFixed(2)}MB → ${(after/1024/1024).toFixed(2)}MB`);
}

async function main() {
  await compress('onboarding1.jpg');
  await compress('onboarding2.jpg');
  await compress('onboarding3.jpg');
}

main().catch(console.error);