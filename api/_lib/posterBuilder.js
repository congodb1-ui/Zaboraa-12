import fs from 'fs';
import path from 'path';
import { BRIEFING_CTA, saveGeneratedAsset, fetchDraftById } from './studioHelpers.js';

let fontStyleBlock = '';

try {
  const regPath = path.join(process.cwd(), 'api', '_lib', 'fonts', 'DejaVuSans.ttf');
  const boldPath = path.join(process.cwd(), 'api', '_lib', 'fonts', 'DejaVuSans-Bold.ttf');

  if (fs.existsSync(regPath) && fs.existsSync(boldPath)) {
    const regB64 = fs.readFileSync(regPath).toString('base64');
    const boldB64 = fs.readFileSync(boldPath).toString('base64');
    fontStyleBlock = `
    <style>
      @font-face {
        font-family: 'DejaVu Sans';
        src: url('data:font/ttf;charset=utf-8;base64,${regB64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'DejaVu Sans';
        src: url('data:font/ttf;charset=utf-8;base64,${boldB64}') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      text {
        font-family: 'DejaVu Sans', sans-serif;
      }
    </style>`;
  }
} catch (e) {
  console.warn('[posterBuilder] Failed to load local TTF fonts, falling back to system fonts:', e?.message);
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine, maxLines = 2) {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // If words remaining or lines truncated, add ellipsis to last line if needed
  if (lines.length === maxLines && words.length > 0) {
    const lastLine = lines[lines.length - 1];
    if (!lastLine.endsWith('…') && !lastLine.endsWith('...')) {
      if (lastLine.length + 1 > maxCharsPerLine) {
        lines[lines.length - 1] = lastLine.slice(0, maxCharsPerLine - 2) + '…';
      } else {
        lines[lines.length - 1] = lastLine + '…';
      }
    }
  }

  return lines;
}

export function buildPosterSvg(title, subtitle, size, topic = 'AVS Migrations') {
  const isSquare = size === '1080x1080';
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 627;
  const scale = isSquare ? 0.9 : 1.0;

  const eyebrow = (topic || 'VMWARE CLOUD MIGRATION').toUpperCase().slice(0, 32);

  const titleMaxChars = isSquare ? 35 : 42;
  const titleLines = wrapText(title, titleMaxChars, 2);
  const titleFontSize = (title || '').length > 60 ? Math.round(36 * scale) : Math.round(44 * scale);

  const subMaxChars = isSquare ? 45 : 55;
  const subLines = wrapText(subtitle, subMaxChars, 2);
  const subFontSize = Math.round(22 * scale);

  const shortCta = "Book a free 30-min architecture briefing → zaboraa.com/briefing";

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${fontStyleBlock}
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
    <pattern id="diagonalPattern" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 0 20 L 20 0 M -5 5 L 5 -5 M 15 25 L 25 15" stroke="#FFFFFF" stroke-width="1" opacity="0.04" />
    </pattern>
  </defs>

  <!-- Background with subtle texture -->
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect width="${width}" height="${height}" fill="url(#diagonalPattern)" />

  <!-- Main Card Container -->
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="16" fill="url(#cardBg)" stroke="#38BDF8" stroke-width="2" />

  <!-- Header Branding Bar -->
  <text x="80" y="90" fill="#38BDF8" font-size="${Math.round(18 * scale)}" font-weight="bold" letter-spacing="2">ZABORAA</text>
  <text x="${width - 80}" y="90" fill="#94A3B8" font-size="${Math.round(14 * scale)}" font-weight="bold" text-anchor="end" letter-spacing="1">ARCHITECT BRIEFING</text>

  <!-- Eyebrow Category -->
  <text x="80" y="${isSquare ? 170 : 150}" fill="#38BDF8" font-size="${Math.round(16 * scale)}" font-weight="bold" letter-spacing="1.5">${escapeXml(eyebrow)}</text>

  <!-- Title (Wrapped 1-2 lines) -->
  ${titleLines.map((line, idx) => `
    <text x="80" y="${(isSquare ? 230 : 210) + idx * (titleFontSize + 8)}" fill="#F8FAFC" font-size="${titleFontSize}" font-weight="bold">
      ${escapeXml(line)}
    </text>
  `).join('')}

  <!-- Subtitle (Wrapped 1-2 lines) -->
  ${subLines.map((line, idx) => `
    <text x="80" y="${(isSquare ? 380 : 330) + idx * (subFontSize + 6)}" fill="#94A3B8" font-size="${subFontSize}" font-weight="normal">
      ${escapeXml(line)}
    </text>
  `).join('')}

  <!-- Divider Line -->
  <line x1="80" y1="${height - 180}" x2="${width - 80}" y2="${height - 180}" stroke="#2D3F55" stroke-width="1" />

  <!-- CTA Bar -->
  <rect x="80" y="${height - 150}" width="${width - 160}" height="${Math.round(54 * scale)}" rx="8" fill="#0284C7" />
  <text x="${width / 2}" y="${height - 116}" fill="#FFFFFF" font-size="${Math.round(17 * scale)}" font-weight="bold" text-anchor="middle">
    ${escapeXml(shortCta)}
  </text>

  <!-- Footer Info -->
  <text x="80" y="${height - 60}" fill="#64748B" font-size="${Math.round(14 * scale)}">zaboraa.com</text>
  <text x="${width - 80}" y="${height - 60}" fill="#64748B" font-size="${Math.round(14 * scale)}" text-anchor="end">Enterprise Migration Practice</text>
</svg>`;
}

async function safeSaveGeneratedAsset(draftId, assetType, subtype, content) {
  try {
    await saveGeneratedAsset(draftId, assetType, subtype, content);
  } catch (err) {
    console.error(`[content-studio] Failed to save generated asset (${assetType}) to DB:`, err?.message || err);
  }
}

export async function processGeneratePoster(draftId) {
  const draft = await fetchDraftById(draftId);

  const linkedinSvg = buildPosterSvg(draft.title, draft.hook || draft.body.slice(0, 100), '1200x627', draft.topic);
  const instagramSvg = buildPosterSvg(draft.title, draft.hook || draft.body.slice(0, 100), '1080x1080', draft.topic);

  const { default: sharp } = await import('sharp');

  const linkedinPngBuffer = await sharp(Buffer.from(linkedinSvg)).png().toBuffer();
  const instagramPngBuffer = await sharp(Buffer.from(instagramSvg)).png().toBuffer();

  const linkedinMeta = await sharp(linkedinPngBuffer).metadata();
  const instagramMeta = await sharp(instagramPngBuffer).metadata();

  console.log(`[posterBuilder] Rendered PNGs successfully. LinkedIn size=${linkedinMeta.size}B (${linkedinMeta.width}x${linkedinMeta.height}), Instagram size=${instagramMeta.size}B (${instagramMeta.width}x${instagramMeta.height})`);

  const linkedinBase64 = linkedinPngBuffer.toString('base64');
  const instagramBase64 = instagramPngBuffer.toString('base64');

  await safeSaveGeneratedAsset(draftId, 'poster_linkedin', 'poster_linkedin', linkedinBase64);
  await safeSaveGeneratedAsset(draftId, 'poster_instagram', 'poster_instagram', instagramBase64);

  return {
    success: true,
    draftId,
    linkedin: linkedinBase64,
    instagram: instagramBase64,
  };
}
