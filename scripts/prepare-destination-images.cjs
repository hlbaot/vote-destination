const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const records = require('./destination-images.json');
  const root = path.resolve(__dirname, '..');
  const output = path.resolve(__dirname, '../public/images/destinations');
  fs.mkdirSync(output, { recursive: true });
  for (const record of records) {
    if (!record.source) continue;
    const source = path.isAbsolute(record.source) ? record.source : path.join(root, record.source);
    if (!fs.existsSync(source)) continue;
    const target = path.join(output, `${record.id}.webp`);
    if (!fs.existsSync(target)) {
      await sharp(source).resize({ width: 1536, withoutEnlargement: true }).webp({ quality: 85 }).toFile(target);
    }
  }
  const ready = records.filter(record => fs.existsSync(path.join(output, `${record.id}.webp`)));
  console.log(`Destination images ready: ${ready.length}/${records.length}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
