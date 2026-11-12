import requireAdmin from './requireAdmin.js';
import {
  fetchDraftById,
  checkForbiddenClaims,
  saveGeneratedAsset,
  TOPIC_TOOL_MAP,
  VALID_PUBLIC_ROUTES,
  BRIEFING_CTA,
} from './studioHelpers.js';

const VERTEX_LOCATION = 'global';
const GEMINI_MODEL = 'gemini-3.7-flash';

async function callVertexGemini(prompt, systemInstruction, timeoutMs = 25000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_CLOUD_PROJECT || 'prime-bridge-511404-a3'}/locations/${VERTEX_LOCATION}/publishers/google/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4000,
      responseMimeType: 'application/json',
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI call failed (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();
    const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response from Vertex AI');
    }

    return rawText;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Vertex AI call timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

function buildPosterSvg(title, subtitle, size) {
  const isSquare = size === '1080x1080';
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 627;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)" />

  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="16" fill="url(#cardBg)" stroke="#38BDF8" stroke-width="2" />

  <text x="80" y="110" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" letter-spacing="2">ZABORAA ARCHITECTURE</text>

  <text x="80" y="${isSquare ? 240 : 200}" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="${isSquare ? '48' : '40'}" font-weight="800" width="${width - 160}">
    ${escapeXml(title)}
  </text>

  <text x="80" y="${isSquare ? 360 : 280}" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="${isSquare ? '28' : '22'}" font-weight="400">
    ${escapeXml(subtitle)}
  </text>

  <rect x="80" y="${height - 140}" width="${width - 160}" height="60" rx="8" fill="#0284C7" />
  <text x="110" y="${height - 102}" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700">
    ${escapeXml(BRIEFING_CTA)}
  </text>
</svg>`;
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function safeSaveGeneratedAsset(draftId, assetType, subtype, content) {
  try {
    await saveGeneratedAsset(draftId, assetType, subtype, content);
  } catch (err) {
    console.error(`[content-studio] Failed to save generated asset (${assetType}) to DB:`, err?.message || err);
  }
}

export async function processGenerateCaptions(draftId, timeoutMs = 20000) {
  const draft = await fetchDraftById(draftId);
  const systemInstruction = `You are a social media manager for Zaboraa, a VMware-to-cloud migration consulting practice.
Generate multi-platform captions based on a content draft.
Return ONLY a JSON object matching this schema:
{
  "linkedin_caption": "string",
  "instagram_caption": "string <= 150 chars",
  "youtube_title": "string",
  "youtube_description": "string",
  "briefing_cta": "string"
}

HARD RULES:
- No emojis anywhere in any field.
- instagram_caption MUST be <= 150 characters total.
- briefing_cta MUST be EXACTLY: "${BRIEFING_CTA}"
- Approved claims: 13+ years, 25+ migrations, 6 certifications, 100% Runbook-Driven Cutovers, Principal VMware Architect, Zaboraa, 6 tools, 8 disciplines, 7 anonymised case studies.
- Forbidden claims: 12+ years, 40+ migrations, 1240 TB, 4500 TB, 820 TB, $1.4M, Zaboraa Technologies, 100% zero-downtime, pricing, client names, masterclass.`;

  const prompt = `Draft Title: ${draft.title}
Draft Hook: ${draft.hook || ''}
Draft Body: ${draft.body}
Topic: ${draft.topic}`;

  const rawJson = await callVertexGemini(prompt, systemInstruction, timeoutMs);
  const parsed = JSON.parse(rawJson);

  checkForbiddenClaims(parsed.linkedin_caption);
  checkForbiddenClaims(parsed.instagram_caption);
  checkForbiddenClaims(parsed.youtube_title);
  checkForbiddenClaims(parsed.youtube_description);

  parsed.briefing_cta = BRIEFING_CTA;

  if (parsed.instagram_caption.length > 150) {
    parsed.instagram_caption = parsed.instagram_caption.slice(0, 147) + '...';
  }

  await safeSaveGeneratedAsset(draftId, 'captions', 'captions', JSON.stringify(parsed));

  return {
    success: true,
    draftId,
    ...parsed,
  };
}

export async function processGenerateVideoScript(draftId, timeoutMs = 25000) {
  const draft = await fetchDraftById(draftId);

  const matchedToolObj = TOPIC_TOOL_MAP[draft.topic] || TOPIC_TOOL_MAP['AVS Migrations'];
  const matchedTools = Array.isArray(matchedToolObj)
    ? matchedToolObj
    : matchedToolObj?.name
    ? [matchedToolObj.name]
    : ['AVS Sizing Estimator'];
  const toolContext = `Real Zaboraa tools to reference if relevant: ${matchedTools.join(', ')}. Do NOT invent tools.`;

  const systemInstruction = `You are a video script writer for Zaboraa enterprise cloud migration guides.
Generate a 60-second video script based on a content draft.
Return ONLY a JSON object matching this schema:
{
  "script": {
    "hook": "string (>= 6 words, no emojis, no URL, no hashtag, do not start with I)",
    "problem": "string",
    "point1": "string",
    "point2": "string",
    "point3": "string",
    "cta": "string (MUST be verbatim: '${BRIEFING_CTA}')"
  },
  "shot_list": [
    { "second_mark": "0-10s", "action": "string" },
    { "second_mark": "10-25s", "action": "string" },
    { "second_mark": "25-40s", "action": "string" },
    { "second_mark": "40-50s", "action": "string" },
    { "second_mark": "50-60s", "action": "string" }
  ],
  "duration_estimate": 60
}

HARD RULES:
- No emojis anywhere in script or shot list.
- ${toolContext}
- No face, no office photo, no fake team, no founder story, no webinar/live references.
- CTA MUST be verbatim: "${BRIEFING_CTA}"
- Forbidden claims: 12+ years, 40+ migrations, 1240 TB, 4500 TB, 820 TB, $1.4M, Zaboraa Technologies, 100% zero-downtime, pricing, client names, masterclass.`;

  const prompt = `Draft Title: ${draft.title}
Draft Hook: ${draft.hook || ''}
Draft Body: ${draft.body}
Topic: ${draft.topic}`;

  const rawJson = await callVertexGemini(prompt, systemInstruction, timeoutMs);
  const parsed = JSON.parse(rawJson);

  const scriptText = Object.values(parsed.script || {}).join(' ');
  checkForbiddenClaims(scriptText);

  if (parsed.script) {
    parsed.script.cta = BRIEFING_CTA;
  }

  await safeSaveGeneratedAsset(draftId, 'video_script', 'video_script', JSON.stringify(parsed));

  return {
    success: true,
    draftId,
    ...parsed,
  };
}

export async function processGenerateKB(draftId, timeoutMs = 35000) {
  const draft = await fetchDraftById(draftId);

  const matchedRoute = (typeof VALID_PUBLIC_ROUTES === 'object' && !Array.isArray(VALID_PUBLIC_ROUTES))
    ? (VALID_PUBLIC_ROUTES[draft.topic] || '/tools/sizing')
    : '/tools/sizing';

  const systemInstruction = `You are a technical documenter for Zaboraa Knowledge Base.
Generate a Knowledge Base article draft in Markdown format based on a content draft.
Return ONLY a JSON object matching this schema:
{
  "slug": "string (kebab-case)",
  "meta_title": "string (<= 60 chars)",
  "meta_description": "string (<= 155 chars)",
  "outline": [
    { "h2": "string", "summary": "string" }
  ],
  "body": "string (Markdown with H2/H3 headers)",
  "frontmatter": "string (YAML format)",
  "full_markdown": "string"
}

HARD RULES:
- Include at least ONE internal link to a real Zaboraa public route, e.g. ${matchedRoute}
- Must end with the Briefing CTA: "${BRIEFING_CTA}"
- Forbidden claims: 12+ years, 40+ migrations, 1240 TB, 4500 TB, 820 TB, $1.4M, Zaboraa Technologies, 100% zero-downtime, pricing, client names, masterclass.`;

  const prompt = `Draft Title: ${draft.title}
Draft Hook: ${draft.hook || ''}
Draft Body: ${draft.body}
Topic: ${draft.topic}`;

  const rawJson = await callVertexGemini(prompt, systemInstruction, timeoutMs);
  const parsed = JSON.parse(rawJson);

  checkForbiddenClaims(parsed.body || '');
  checkForbiddenClaims(parsed.full_markdown || '');

  if (parsed.full_markdown && !parsed.full_markdown.includes(BRIEFING_CTA)) {
    parsed.full_markdown += `\n\n---\n${BRIEFING_CTA}`;
  }

  await safeSaveGeneratedAsset(draftId, 'kb_draft', 'kb_draft', JSON.stringify(parsed));

  return {
    success: true,
    draftId,
    ...parsed,
  };
}

export async function processGeneratePoster(draftId) {
  const draft = await fetchDraftById(draftId);

  const linkedinSvg = buildPosterSvg(draft.title, draft.hook || draft.body.slice(0, 80), '1200x627');
  const instagramSvg = buildPosterSvg(draft.title, draft.hook || draft.body.slice(0, 80), '1080x1080');

  const { default: sharp } = await import('sharp');

  const linkedinPngBuffer = await sharp(Buffer.from(linkedinSvg)).png().toBuffer();
  const instagramPngBuffer = await sharp(Buffer.from(instagramSvg)).png().toBuffer();

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

export async function processGenerateAll(draftId) {
  const [captionsRes, videoRes, kbRes, posterRes] = await Promise.allSettled([
    processGenerateCaptions(draftId, 18000),
    processGenerateVideoScript(draftId, 22000),
    processGenerateKB(draftId, 32000),
    processGeneratePoster(draftId),
  ]);

  const results = {
    captions: captionsRes.status === 'fulfilled'
      ? { ok: true, data: captionsRes.value }
      : { ok: false, error: captionsRes.reason?.message || 'Failed' },
    video_script: videoRes.status === 'fulfilled'
      ? { ok: true, data: videoRes.value }
      : { ok: false, error: videoRes.reason?.message || 'Failed' },
    kb: kbRes.status === 'fulfilled'
      ? { ok: true, data: kbRes.value }
      : { ok: false, error: kbRes.reason?.message || 'Failed' },
    poster: posterRes.status === 'fulfilled'
      ? { ok: true, data: posterRes.value }
      : { ok: false, error: posterRes.reason?.message || 'Failed' },
  };

  const hasAnySuccess = Object.values(results).some((r) => r.ok);
  const failedTracks = Object.entries(results)
    .filter(([_, r]) => !r.ok)
    .map(([t]) => t);

  return {
    success: hasAnySuccess,
    partial: failedTracks.length > 0 && hasAnySuccess,
    draftId,
    results,
    failedTracks,
  };
}
