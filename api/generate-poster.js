import requireAdmin from './_lib/requireAdmin.js';
import {
  fetchDraftById,
  saveGeneratedAsset,
  checkForbiddenClaims,
  TOPIC_TOOL_MAP
} from './_lib/studioHelpers.js';
import sharp from 'sharp';

function escapeXml(unsafe) {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text, maxLen) {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1) + '…';
}

function extractBullets(body) {
  if (!body) return ['Key architectural consideration', 'Host CPU & RAM sizing balance', '100% runbook-driven cutover'];
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.toLowerCase().startsWith('http'));

  const bullets = lines.slice(1, 4).map((l) => truncateText(l, 55));
  while (bullets.length < 3) {
    bullets.push(bullets.length === 0 ? 'Enterprise VMware Cloud Sizing' : bullets.length === 1 ? 'Host CPU & RAM headroom buffer' : '100% Runbook-Driven Cutovers');
  }
  return bullets;
}

function createPosterSvg({ width, height, title, bullets, toolName }) {
  const safeTitle = escapeXml(truncateText(title, 80));
  const safeTool = escapeXml(toolName || 'Free engineering tools at zaboraa.com');
  const safeBullets = bullets.map((b) => escapeXml(b));

  const isSquare = height === 1080;
  const titleY = isSquare ? 220 : 160;
  const bulletStartY = isSquare ? 380 : 280;
  const bulletSpacing = isSquare ? 110 : 80;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect x="0" y="0" width="${width}" height="6" fill="url(#cyanGrad)" />

  <!-- Wordmark Header -->
  <text x="60" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#ffffff" letter-spacing="2">ZABORAA</text>
  <text x="180" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#06b6d4" letter-spacing="1">ENTERPRISE CLOUD ARCHITECTURE</text>

  <!-- Title -->
  <text x="60" y="${titleY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${isSquare ? 38 : 32}" font-weight="800" fill="#ffffff" width="${width - 120}">
    ${safeTitle}
  </text>

  <!-- Bullet 1 -->
  <g transform="translate(60, ${bulletStartY})">
    <circle cx="16" cy="-8" r="14" fill="#06b6d4" fill-opacity="0.2" stroke="#06b6d4" stroke-width="2" />
    <text x="11" y="-3" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#06b6d4">✓</text>
    <text x="45" y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${isSquare ? 26 : 22}" font-weight="600" fill="#94a3b8">${safeBullets[0] || ''}</text>
  </g>

  <!-- Bullet 2 -->
  <g transform="translate(60, ${bulletStartY + bulletSpacing})">
    <circle cx="16" cy="-8" r="14" fill="#06b6d4" fill-opacity="0.2" stroke="#06b6d4" stroke-width="2" />
    <text x="11" y="-3" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#06b6d4">✓</text>
    <text x="45" y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${isSquare ? 26 : 22}" font-weight="600" fill="#94a3b8">${safeBullets[1] || ''}</text>
  </g>

  <!-- Bullet 3 -->
  <g transform="translate(60, ${bulletStartY + bulletSpacing * 2})">
    <circle cx="16" cy="-8" r="14" fill="#06b6d4" fill-opacity="0.2" stroke="#06b6d4" stroke-width="2" />
    <text x="11" y="-3" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#06b6d4">✓</text>
    <text x="45" y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${isSquare ? 26 : 22}" font-weight="600" fill="#94a3b8">${safeBullets[2] || ''}</text>
  </g>

  <!-- Footer -->
  <line x1="60" y1="${height - 90}" x2="${width - 60}" y2="${height - 90}" stroke="#334155" stroke-width="1" />
  <text x="60" y="${height - 50}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="#64748b">zaboraa.com</text>
  <text x="${width - 60}" y="${height - 50}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="#06b6d4" text-anchor="end">${safeTool}</text>
</svg>`;
}

export async function processGeneratePoster(draftId) {
  const draft = await fetchDraftById(draftId);
  const matchedTool = TOPIC_TOOL_MAP[draft.topic] || { name: 'Cloud Sizing Calculator', url: 'https://zaboraa.com/tools/sizing' };
  const bullets = extractBullets(draft.body);

  // Forbidden claims check
  const textToCheck = `${draft.title} ${bullets.join(' ')}`;
  const forbiddenViolation = checkForbiddenClaims(textToCheck);
  if (forbiddenViolation) {
    throw new Error(`Poster content contains forbidden claim: ${forbiddenViolation}`);
  }

  // Generate SVG strings
  const linkedinSvg = createPosterSvg({
    width: 1200,
    height: 627,
    title: draft.title,
    bullets,
    toolName: matchedTool.name
  });

  const instagramSvg = createPosterSvg({
    width: 1080,
    height: 1080,
    title: draft.title,
    bullets,
    toolName: matchedTool.name
  });

  // Render PNG buffers via Sharp
  const linkedinPngBuffer = await sharp(Buffer.from(linkedinSvg)).png().toBuffer();
  const instagramPngBuffer = await sharp(Buffer.from(instagramSvg)).png().toBuffer();

  const linkedinBase64 = linkedinPngBuffer.toString('base64');
  const instagramBase64 = instagramPngBuffer.toString('base64');

  await saveGeneratedAsset(draftId, 'poster_linkedin', linkedinBase64);
  await saveGeneratedAsset(draftId, 'poster_instagram', instagramBase64);

  return {
    success: true,
    draftId,
    linkedin: linkedinBase64,
    instagram: instagramBase64
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await requireAdmin(req, res);
  } catch (authErr) {
    return res.status(authErr.status || 401).json({ success: false, error: authErr.message || 'Unauthorized' });
  }

  const { draftId } = req.body || {};
  if (!draftId) {
    return res.status(400).json({ success: false, error: 'draftId is required' });
  }

  try {
    const data = await processGeneratePoster(draftId);
    return res.status(200).json(data);
  } catch (err) {
    const isValidation = err.message.includes('forbidden claim') || err.message.includes('not found');
    return res.status(isValidation ? 400 : 502).json({
      success: false,
      error: err.message || 'Failed to generate poster'
    });
  }
}
