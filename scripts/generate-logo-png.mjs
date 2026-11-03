import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal PNG generator for a crisp 512x512 brand mark
const width = 512;
const height = 512;

// Build RGBA pixel buffer with filter byte 0 at start of each scanline
const rawBytes = Buffer.alloc((width * 4 + 1) * height);
let offset = 0;

const cx = width / 2;
const cy = height / 2;
const r = 240;

for (let y = 0; y < height; y++) {
  rawBytes[offset++] = 0; // Filter: None
  for (let x = 0; x < width; x++) {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Deep slate background #020617
    let red = 2;
    let green = 6;
    let blue = 23;
    let alpha = 255;

    // Outer circle border
    if (dist <= r && dist >= r - 8) {
      red = 6;
      green = 182;
      blue = 212; // Cyan accent #06b6d4
    } else if (dist < r - 8 && dist >= r - 12) {
      red = 14;
      green = 116;
      blue = 144; // Dark cyan
    } else if (dist < r - 12) {
      // Inner gradient
      const grad = Math.min(1, Math.max(0, (y / height)));
      red = Math.round(15 + grad * 10);
      green = Math.round(23 + grad * 15);
      blue = Math.round(42 + grad * 20);

      // Draw stylized 'Z' architectural monogram
      // Top bar: y between 150..185, x between 150..362
      // Center diagonal: from (362, 185) down to (150, 327)
      // Bottom bar: y between 327..362, x between 150..362
      const inTopBar = y >= 150 && y <= 185 && x >= 150 && x <= 362;
      const inBottomBar = y >= 327 && y <= 362 && x >= 150 && x <= 362;
      
      // Diagonal blade equation: x(y) roughly interpolated
      const t = (y - 185) / (327 - 185);
      const targetX = 362 - t * (362 - 150);
      const inDiag = y >= 170 && y <= 342 && Math.abs(x - targetX) <= 28;

      if (inTopBar || inBottomBar || inDiag) {
        red = 34;
        green = 211;
        blue = 238; // Bright cyan #22d3ee
      }

      // Center core crystal dot at (256, 256)
      const coreDist = Math.hypot(x - 256, y - 256);
      if (coreDist <= 22) {
        red = 165;
        green = 243;
        blue = 252; // Electric cyan
      }
    } else {
      // Transparent outside outer circle
      red = 0;
      green = 0;
      blue = 0;
      alpha = 0;
    }

    rawBytes[offset++] = red;
    rawBytes[offset++] = green;
    rawBytes[offset++] = blue;
    rawBytes[offset++] = alpha;
  }
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, len + 8);
  const checksum = crc32(typeAndData);
  chunk.writeUInt32BE(checksum, len + 8);
  return chunk;
}

const compressed = zlib.deflateSync(rawBytes, { level: 9 });

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type: RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ihdrChunk = makeChunk('IHDR', ihdr);
const idatChunk = makeChunk('IDAT', compressed);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const pngBuffer = Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);

const outPath = path.resolve('public/assets/images/zaboraa-logo.png');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, pngBuffer);

console.log(`Generated 512x512 logo at ${outPath} (${pngBuffer.length} bytes)`);
