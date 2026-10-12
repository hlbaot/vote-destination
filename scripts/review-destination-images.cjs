const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const records = require('./destination-images.json');
  const root = path.resolve(__dirname, '..');
  const directory = path.join(root, 'public/images/destinations');
  const available = records.filter(record => fs.existsSync(path.join(directory, `${record.id}.webp`)));
  const review = path.join(root, 'scripts/output');
  fs.mkdirSync(review, { recursive: true });
  for (let offset = 0; offset < available.length; offset += 12) {
    const group = available.slice(offset, offset + 12);
    const tiles = await Promise.all(group.map(async (record, index) => ({
      input: await sharp(path.join(directory, `${record.id}.webp`)).resize(320, 213).png().toBuffer(),
      left: (index % 3) * 320,
      top: Math.floor(index / 3) * 240,
    })));
    const height = Math.ceil(group.length / 3) * 240;
    const labels = group.map((record, index) => `<text x="${(index % 3) * 320 + 10}" y="${Math.floor(index / 3) * 240 + 230}" font-size="15" font-family="Arial">${record.id}. ${record.name.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</text>`).join('');
    tiles.push({ input: Buffer.from(`<svg width="960" height="${height}">${labels}</svg>`), left: 0, top: 0 });
    await sharp({ create: { width: 960, height, channels: 3, background: '#ffffff' } }).composite(tiles).png().toFile(path.join(review, `${offset + 1}-${offset + group.length}.png`));
  }
  console.log(`${available.length}/${records.length} images available; review sheets in scripts/output`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
