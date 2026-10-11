const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/data/destinations.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox);
const { initialDestinations, refreshDestinationImages } = sandbox.exports;
assert.equal(initialDestinations.length, 68);
assert.equal(new Set(initialDestinations.map(item => item.image)).size, 68);
const missing = [];
for (const item of initialDestinations) {
  assert.equal(item.image, item.thumbnail);
  assert.equal(item.image, item.secondaryImage);
  assert.equal(item.gallery.length, 1);
  assert.equal(item.gallery[0], item.image);
  assert.ok(item.image.startsWith('/images/destinations/'));
  if (!fs.existsSync(path.join(root, 'public', item.image))) missing.push(item.id);
}

const original = initialDestinations[0];
const saved = { ...original, image: 'https://picsum.photos/old', thumbnail: 'old', secondaryImage: 'old', gallery: ['old'], rawVotes: 12345, votes: '12.345', isVisible: false };
const custom = { ...saved, id: 'custom', name: 'Custom destination', image: '/custom.webp' };
const [updated, unchanged] = refreshDestinationImages([saved, custom]);
assert.equal(updated.image, original.image);
assert.equal(updated.rawVotes, 12345);
assert.equal(updated.votes, '12.345');
assert.equal(updated.isVisible, false);
assert.equal(saved.image, 'https://picsum.photos/old');
assert.equal(unchanged, custom);
assert.equal(refreshDestinationImages([{ ...custom, id: original.id }])[0].image, '/custom.webp');
console.log('PASS: 68 distinct image mappings; cached images migrate while votes, visibility and custom entries remain intact.');
assert.equal(missing.length, 0, `Missing image files: ${missing.join(', ')}`);
console.log('PASS: all 68 destination image files exist.');
