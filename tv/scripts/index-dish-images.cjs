const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const recipes = JSON.parse(fs.readFileSync(path.join(root, 'missing-dish-photos.json'), 'utf8'));
const assetRoot = path.join(root, 'assets/meals/generated');
const complete = recipes.filter(recipe => fs.existsSync(path.join(assetRoot, recipe.id + '.jpg')));
const missing = recipes.filter(recipe => !complete.includes(recipe));
const hashes = new Set();
for (const recipe of complete) {
  const bytes = fs.readFileSync(path.join(assetRoot, recipe.id + '.jpg'));
  if (bytes.length < 10000 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error(`Invalid JPEG: ${recipe.id}`);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hashes.has(hash)) throw new Error(`Duplicate image content: ${recipe.id}`);
  hashes.add(hash);
}
if (process.argv.includes('--check') && missing.length) {
  console.error(`${missing.length} recipe images remain missing.`);
  process.exit(1);
}
const mapping = complete.map(recipe => `  ${JSON.stringify(recipe.id)}: require('../assets/meals/generated/${recipe.id}.jpg'),`).join('\n');
fs.writeFileSync(path.join(root, 'src/generatedMealPhotos.ts'), '// AI-generated recipe illustrations. Rebuild with scripts/index-dish-images.cjs.\nexport const generatedMealPhotos: Record<string, any> = {\n' + mapping + '\n};\n');
console.log(`${complete.length}/${recipes.length} distinct recipe image files indexed.`);
