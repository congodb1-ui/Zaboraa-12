import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="zabBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="zabGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="zabGradIndigo" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="zabGradViolet" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <radialGradient id="zabCoreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a5f3fc"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="104" fill="url(#zabBg)"/>
  <rect width="504" height="504" x="4" y="4" rx="100" fill="none" stroke="#06b6d4" stroke-width="4" stroke-opacity="0.35"/>
  <g transform="translate(48, 48) scale(9.4545)">
    <polygon points="22,3 39,12.5 39,31.5 22,41 5,31.5 5,12.5" stroke="url(#zabGradCyan)" stroke-width="1.5" stroke-opacity="0.6" fill="rgba(2, 6, 23, 0.7)"/>
    <line x1="22" y1="3" x2="22" y2="41" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.3" stroke-dasharray="2 2"/>
    <line x1="5" y1="22" x2="39" y2="22" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.3" stroke-dasharray="2 2"/>
    <path d="M12 12.5H32L27.5 17.5H16.5L12 12.5Z" fill="url(#zabGradCyan)"/>
    <path d="M29.5 15.5L14.5 28.5H19.5L34.5 15.5H29.5Z" fill="url(#zabGradIndigo)"/>
    <path d="M12 26.5L16.5 31.5H32L27.5 26.5H12Z" fill="url(#zabGradViolet)"/>
    <circle cx="22" cy="22" r="3.2" fill="url(#zabCoreGlow)"/>
    <circle cx="22" cy="22" r="5.5" stroke="#22d3ee" stroke-width="0.9" stroke-opacity="0.8"/>
    <circle cx="12" cy="12.5" r="1.5" fill="#38bdf8"/>
    <circle cx="32" cy="12.5" r="1.5" fill="#22d3ee"/>
    <circle cx="32" cy="31.5" r="1.5" fill="#818cf8"/>
    <circle cx="12" cy="31.5" r="1.5" fill="#06b6d4"/>
  </g>
</svg>`;

async function buildFavicons() {
  const svgBuffer = Buffer.from(SVG_CONTENT);
  
  // 1. Save standalone SVG
  const svgPath = path.resolve('public/assets/images/zaboraa-logo-standalone.svg');
  fs.mkdirSync(path.dirname(svgPath), { recursive: true });
  fs.writeFileSync(svgPath, SVG_CONTENT);
  console.log('Saved', svgPath);

  // 2. 512x512 logo PNG in public/assets/images/zaboraa-logo.png
  const logo512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.resolve('public/assets/images/zaboraa-logo.png'), logo512);
  console.log('Saved public/assets/images/zaboraa-logo.png (512x512)');

  // 3. 192x192 favicon for PWA manifest
  const icon192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.resolve('public/favicon-192x192.png'), icon192);
  console.log('Saved public/favicon-192x192.png (192x192)');

  // 4. 180x180 apple touch icon
  const icon180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), icon180);
  console.log('Saved public/apple-touch-icon.png (180x180)');

  // 5. 48x48 PNG favicon
  const icon48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.resolve('public/favicon-48x48.png'), icon48);
  console.log('Saved public/favicon-48x48.png (48x48)');

  // 6. Multi-resolution ICO (16, 32, 48)
  const icon16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const icon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

  const icoImages = [
    { size: 16, buffer: icon16 },
    { size: 32, buffer: icon32 },
    { size: 48, buffer: icon48 },
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(icoImages.length, 4); // count

  let currentOffset = 6 + icoImages.length * 16;
  const dirEntries = [];

  for (const img of icoImages) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size, 0); // width
    entry.writeUInt8(img.size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size
    entry.writeUInt32LE(currentOffset, 12); // image offset
    dirEntries.push(entry);
    currentOffset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...dirEntries,
    ...icoImages.map(img => img.buffer)
  ]);

  fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
  console.log('Saved public/favicon.ico (16, 32, 48 multi-res ICO)');
}

buildFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});
