import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIRS = [
  path.resolve('src/assets/images'),
  path.resolve('public/assets/images')
];

// Preserved brand assets that must remain as PNG/SVG
const PRESERVED_FILES = new Set([
  'zaboraa-logo.png',
  'zaboraa-logo-standalone.svg'
]);

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (PRESERVED_FILES.has(file)) continue;

    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const baseName = path.basename(file, ext);
    const webpFileName = `${baseName}.webp`;
    const inputPath = path.join(dirPath, file);
    const outputPath = path.join(dirPath, webpFileName);

    const isHero = file.includes('hero');
    const maxWidth = isHero ? 1920 : 1600;
    const quality = isHero ? 80 : 75;

    console.log(`[WebP Convert] Processing ${file} -> ${webpFileName} (max ${maxWidth}px, q=${quality})...`);

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    let transform = image;
    if (metadata.width && metadata.width > maxWidth) {
      transform = transform.resize({ width: maxWidth, withoutEnlargement: true });
    }

    await transform.webp({ quality, effort: 6 }).toFile(outputPath);

    const oldSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`  -> Size: ${(oldSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (${Math.round((1 - newSize / oldSize) * 100)}% reduction)`);

    // Remove original uncompressed file from repo
    fs.unlinkSync(inputPath);
  }
}

async function run() {
  console.log('[WebP Converter] Starting image compression and WebP conversion...');
  for (const dir of DIRS) {
    console.log(`\n[Directory] ${dir}`);
    await processDirectory(dir);
  }

  // Calculate new total size
  const srcDir = path.resolve('src/assets/images');
  const files = fs.readdirSync(srcDir);
  let totalBytes = 0;
  for (const f of files) {
    totalBytes += fs.statSync(path.join(srcDir, f)).size;
  }
  console.log(`\n[Complete] Total src/assets/images size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB (Target: < 5 MB)`);
}

run().catch((err) => {
  console.error('[WebP Error]', err);
  process.exit(1);
});
