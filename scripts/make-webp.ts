/**
 * 为 public/ 下的 PNG/JPG 生成同名 .webp（保留原图不动）。
 * 页面优先引用 .webp，点击放大才打开原图。用法：npm run images
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('public');
const SKIP = new Set(['favicon-32.png', 'favicon-512.png', 'apple-touch-icon.png']);

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let made = 0;
for (const file of walk(ROOT)) {
  if (!/\.(png|jpe?g)$/i.test(file) || SKIP.has(path.basename(file))) continue;
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(file).mtimeMs) continue;
  await sharp(file).webp({ quality: 88, effort: 5 }).toFile(out);
  const a = fs.statSync(file).size;
  const b = fs.statSync(out).size;
  console.log(`${path.relative(ROOT, file)}  ${(a / 1024).toFixed(0)}KB -> ${(b / 1024).toFixed(0)}KB (webp)`);
  made++;
}
console.log(made === 0 ? '没有需要转换的图片。' : `已生成 ${made} 个 WebP。`);
