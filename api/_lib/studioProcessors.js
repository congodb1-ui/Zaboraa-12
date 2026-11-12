import requireAdmin from './requireAdmin.js';
import {
  fetchDraftById,
  checkForbiddenClaims,
  saveGeneratedAsset,
  TOPIC_TOOL_MAP,
  VALID_PUBLIC_ROUTES,
  BRIEFING_CTA,
} from './studioHelpers.js';
import { processGeneratePoster } from './posterBuilder.js';

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
  "linkedin_caption": "string (120-180 words, compelling first 2 line hook, 3 short technical bullets, close with Briefing CTA link, max 5 hashtags, max 1 emoji)",
  "instagram_caption": "string (<= 150 chars)",
  "instagram_hooks": ["string (hook A <= 100 chars)", "string (hook B <= 100 chars)"],
  "youtube_title": "string",
  "youtube_description": "string",
  "youtube_chapters": ["0:00 Hook", "0:08 Topic Overview", "0:20 Technical Strategy", "0:32 Deep Dive", "0:44 MTU & Cutover Validation", "0:54 Briefing CTA"],
  "hashtags": ["#Nutanix", "#Azure", "#VMware", "#NC2", "#CloudMigration"],
  "briefing_cta": "string"
}

HARD RULES:
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

  if (!parsed.instagram_hooks || !Array.isArray(parsed.instagram_hooks) || parsed.instagram_hooks.length < 2) {
    parsed.instagram_hooks = [
      (parsed.instagram_caption || draft.title).slice(0, 95),
      `The #1 mistake when migrating ${draft.topic || 'VMware workloads'} to cloud`.slice(0, 95)
    ];
  }

  if (!parsed.youtube_chapters || !Array.isArray(parsed.youtube_chapters) || parsed.youtube_chapters.length < 4) {
    parsed.youtube_chapters = [
      "0:00 Hook",
      "0:08 Problem Overview",
      "0:20 Architecture Strategy",
      "0:32 Network & Storage Configuration",
      "0:44 MTU & Runbook Validation",
      "0:54 Briefing CTA"
    ];
  }

  if (!parsed.hashtags || !Array.isArray(parsed.hashtags) || parsed.hashtags.length < 5) {
    parsed.hashtags = ["#Nutanix", "#Azure", "#VMware", "#NC2", "#CloudMigration"];
  }

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

  const systemInstruction = `You are an enterprise cloud architect and video script writer for Zaboraa.
Generate a 60-second technical video script based on a content draft.
Return ONLY a JSON object matching this schema:
{
  "hook": "string (Pain hook)",
  "hook_options": [
    "Most enterprise cloud migrations fail because...",
    "The #1 mistake when migrating VMware to NC2...",
    "After 25+ VMware-to-cloud cutovers, here is what changed..."
  ],
  "problem": "string (8-20s mark)",
  "point1": "string (20-32s mark: NC2/AHV + VNet fabric)",
  "point2": "string (32-44s mark: DSF tiering: NVMe vs Azure Blob/NetApp)",
  "point3": "string (44-54s mark: MTU + Geneve/VXLAN + runbook validation)",
  "cta": "string (MUST be verbatim: '${BRIEFING_CTA}')",
  "script": {
    "hook": "string",
    "problem": "string",
    "point1": "string",
    "point2": "string",
    "point3": "string",
    "cta": "string"
  },
  "shot_list": [
    { "second_mark": "0-8s", "action": "string", "on_screen_text": "3-6 words overlay", "voiceover_hint": "1 sentence hint" },
    { "second_mark": "8-20s", "action": "string", "on_screen_text": "3-6 words overlay", "voiceover_hint": "1 sentence hint" },
    { "second_mark": "20-32s", "action": "string", "on_screen_text": "3-6 words overlay", "voiceover_hint": "1 sentence hint" },
    { "second_mark": "32-44s", "action": "string", "on_screen_text": "3-6 words overlay", "voiceover_hint": "1 sentence hint" },
    { "second_mark": "44-54s", "action": "string", "on_screen_text": "3-6 words overlay", "voiceover_hint": "1 sentence hint" },
    { "second_mark": "54-60s", "action": "string", "on_screen_text": "3-6 words overlay", "voiceover_hint": "1 sentence hint" }
  ],
  "b_roll_notes": [
    "Architecture topology diagram showing ExpressRoute and VNet Flow overlay",
    "Prism Central terminal or CLI showing AHV host memory allocation",
    "Nutanix DSF storage tiering panel showing NVMe to Blob migration"
  ],
  "duration_estimate": "60s"
}

HARD RULES:
- No emojis anywhere in script or shot list.
- Architect-to-architect tone: no "Hey guys", no "game-changer", no "revolutionary".
- ${toolContext}
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
  parsed.cta = BRIEFING_CTA;

  if (!parsed.hook_options || !Array.isArray(parsed.hook_options) || parsed.hook_options.length < 3) {
    parsed.hook_options = [
      parsed.hook || parsed.script?.hook || "Most enterprise cloud migrations fail because...",
      `The #1 mistake when migrating ${draft.topic} to cloud...`,
      `After 25+ VMware-to-cloud cutovers, here is what changed...`
    ];
  }

  if (!parsed.b_roll_notes || !Array.isArray(parsed.b_roll_notes) || parsed.b_roll_notes.length < 3) {
    parsed.b_roll_notes = [
      "Architecture topology diagram showing ExpressRoute and VNet Flow overlay",
      "Prism Central terminal showing AHV host memory allocation",
      "Nutanix DSF storage tiering panel showing NVMe to Blob migration"
    ];
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

  const systemInstruction = `You are a principal technical documenter for Zaboraa Knowledge Base.
Generate a comprehensive, production-grade Knowledge Base article in Markdown format based on a content draft.

Required Sections (in exact order):
1. Frontmatter block (slug, title, meta_title, meta_description, tags, date, cta)
2. ## TL;DR (3 bullet points: what this covers, why it matters, concrete outcome)
3. ## Prerequisites ([ ] Azure bare-metal quota, [ ] ExpressRoute circuit >= 1 Gbps, [ ] Prism Central 2023.x, [ ] AHV version checked)
4. Time + Risk line: "Estimated time: 2.5 hours | Risk level: Medium — test in non-prod first"
5. ## Contents (TOC anchor links)
6. ## 1. Architecture Overview (text description + ASCII art diagram showing On-Prem VMware -> ExpressRoute -> Azure Bare-Metal NC2 Cluster -> VNet)
7. ## 2. Network Fabric (2-column markdown table: Flow Overlay vs Native VNet)
8. ## 3. MTU & ExpressRoute Configuration (Numbered checklist: MTU 1500 vs 9000, Geneve/VXLAN overhead, ping + DF bit test, Route Server BGP check)
9. ## 4. Storage Tiering Strategy (Table: DSF NVMe tier vs Azure Blob cold tier vs Azure NetApp Files)
10. ## 5. Step-by-Step Migration Execution (5-7 numbered steps, each with Step name, Command block \`\`\`bash, and Validate line)
11. ## 6. Validation Checklist ([ ] ping between NC2 AHV host and Azure VM, [ ] MTU 8972 test, [ ] DSF replication lag, [ ] failover test)
12. ## 7. Troubleshooting (Table covering Packet fragmentation, Route propagation failure, DSF over-provisioning)
13. ## 8. Next Steps (CTA blockquote: "${BRIEFING_CTA}", link to /tools/sizing, link to /briefing)

Return ONLY a JSON object matching this schema:
{
  "slug": "string (kebab-case <= 60 chars)",
  "meta_title": "string (<= 60 chars)",
  "meta_description": "string (<= 156 chars)",
  "outline": [
    { "h2": "string", "summary": "string" }
  ],
  "body": "string (Full Markdown content containing all 13 sections, 1000-1400 words)",
  "frontmatter": "string (YAML format)",
  "full_markdown": "string"
}

HARD RULES:
- Include at least ONE internal link to a real Zaboraa public route, e.g. ${matchedRoute}
- Must end with the Briefing CTA: "${BRIEFING_CTA}"
- Word count target: 1000-1400 words.
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

export { processGeneratePoster };

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
