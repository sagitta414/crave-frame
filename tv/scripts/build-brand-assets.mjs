import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('../../screen-to-supper-gallery-source/node_modules/sharp');
const root = path.resolve(import.meta.dirname, '..');
const brandDir = path.join(root, 'assets', 'brand');
const markSvg = await fs.readFile(path.join(brandDir, 'crave-frame-mark-v3.svg'));

await sharp(markSvg, { density: 384 })
  .resize(1024, 1024, { fit: 'contain' })
  .png()
  .toFile(path.join(brandDir, 'crave-frame-mark-v3.png'));

const iconSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="224" fill="#090B10"/>
  <g transform="translate(152 152) scale(3)">${markSvg.toString().replace(/<\/?svg[^>]*>/g, '')}</g>
</svg>`);
await sharp(iconSvg).png().toFile(path.join(brandDir, 'crave-frame-icon-v3.png'));

const bannerSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#090B10"/>
  <circle cx="286" cy="360" r="198" fill="#11182A"/>
  <g transform="translate(166 240) scale(1)">${markSvg.toString().replace(/<\/?svg[^>]*>/g, '')}</g>
  <text x="480" y="344" fill="#F4F6ED" font-family="Arial, Helvetica, sans-serif" font-size="102" font-weight="800" letter-spacing="-3">crave frame</text>
  <text x="486" y="406" fill="#AEB9CC" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="600" letter-spacing="5">A TASTE FOR GREAT STORIES</text>
</svg>`);
await sharp(bannerSvg).png().toFile(path.join(brandDir, 'crave-frame-banner-v3.png'));

console.log('Built Crave Frame v3 mark, icon, and TV banner.');
