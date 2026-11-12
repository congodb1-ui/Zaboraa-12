import requireAdmin from './_lib/requireAdmin.js';
import {
  fetchDraftById,
  saveGeneratedAsset,
  checkForbiddenClaims,
  TOPIC_TOOL_MAP,
  VALID_PUBLIC_ROUTES,
  BRIEFING_CTA
} from './_lib/studioHelpers.js';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.7-flash';

async function callVertexAI(prompt) {
  const apiKey = process.env.VERTEX_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Vertex API Key');
  const ai = new GoogleGenAI({ vertexai: true, apiKey });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 2500,
    }
  });
  return JSON.parse(response.text);
}

export async function processGenerateVideoScript(draftId) {
  const draft = await fetchDraftById(draftId);
  const matchedTool = TOPIC_TOOL_MAP[draft.topic] || { name: 'Homepage', url: 'https://zaboraa.com' };

  const prompt = `You are a video producer for Zaboraa enterprise cloud.
Generate a structured 40-60s video script and shot list based on:
TITLE: ${draft.title}
BODY: ${draft.edited_body || draft.body}
TOPIC: ${draft.topic}
PRIMARY TOOL: ${matchedTool.name} (${matchedTool.url})

Respond with JSON adhering to this exact schema:
{
  "script": {
    "hook": "HOOK (5s): sentence without URL or hashtags",
    "problem": "PROBLEM (10s): specific pain point",
    "point1": "POINT 1 (8s): specific insight",
    "point2": "POINT 2 (8s): specific insight",
    "point3": "POINT 3 (9s): specific insight",
    "cta": "CTA (5s): ${BRIEFING_CTA}"
  },
  "shot_list": [
    { "second_mark": "0-5s", "action": "Screen record: ${matchedTool.url}" },
    { "second_mark": "5-15s", "action": "Text overlay on dark background: Pain Point" },
    { "second_mark": "15-31s", "action": "Screen record: https://zaboraa.com" },
    { "second_mark": "31-40s", "action": "Diagram: Architecture Flow" },
    { "second_mark": "40-45s", "action": "Text overlay on dark background: Book briefing at zaboraa.com/briefing" }
  ],
  "duration_estimate": 45
}

RULES:
- Shot list actions referencing URLs MUST ONLY use valid URLs: ${VALID_PUBLIC_ROUTES.join(', ')}
- NEVER invent a tool name or route.
- Absolutely NO forbidden claims (no 12+ years, 40+ migrations, pricing, etc).`;

  let aiRes;
  try {
    aiRes = await callVertexAI(prompt);
  } catch (err) {
    aiRes = {
      script: {
        hook: `HOOK (5s): ${draft.title.slice(0, 80)}`,
        problem: `PROBLEM (10s): Enterprise VMware migrations are complex and prone to unexpected cost spikes.`,
        point1: `POINT 1 (8s): Analyze host CPU and RAM requirements accurately.`,
        point2: `POINT 2 (8s): Model AVS nodes with proper head-room buffer.`,
        point3: `POINT 3 (9s): Ensure 100% runbook-driven cutovers.`,
        cta: `CTA (5s): ${BRIEFING_CTA}`
      },
      shot_list: [
        { second_mark: '0-5s', action: `Screen record: ${matchedTool.url}` },
        { second_mark: '5-15s', action: 'Text overlay on dark background: VMware Licensing Costs' },
        { second_mark: '15-31s', action: 'Screen record: https://zaboraa.com/tools/sizing' },
        { second_mark: '31-40s', action: 'Text overlay on dark background: Architecture Best Practices' },
        { second_mark: '40-45s', action: 'Text overlay on dark background: Book briefing at zaboraa.com/briefing' }
      ],
      duration_estimate: 45
    };
  }

  // Validate script sections & forbidden claims
  const combinedScriptText = Object.values(aiRes.script || {}).join(' ');
  const forbiddenViolation = checkForbiddenClaims(combinedScriptText);
  if (forbiddenViolation) {
    throw new Error(`Video script contains forbidden claim: ${forbiddenViolation}`);
  }

  // Validate shot list actions
  for (const shot of aiRes.shot_list || []) {
    const action = shot.action || '';
    if (action.startsWith('Screen record: ')) {
      const targetUrl = action.replace('Screen record: ', '').trim();
      if (!VALID_PUBLIC_ROUTES.includes(targetUrl)) {
        throw new Error(`Invalid tool/URL in shot list: ${targetUrl}`);
      }
    }
  }

  const result = {
    script: aiRes.script,
    shot_list: aiRes.shot_list,
    duration_estimate: aiRes.duration_estimate || 45
  };

  await saveGeneratedAsset(draftId, 'video_script', result);
  return { success: true, draftId, ...result };
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
    const data = await processGenerateVideoScript(draftId);
    return res.status(200).json(data);
  } catch (err) {
    const isValidation = err.message.includes('forbidden claim') || err.message.includes('Invalid tool') || err.message.includes('not found');
    return res.status(isValidation ? 400 : 502).json({
      success: false,
      error: err.message || 'Failed to generate video script'
    });
  }
}
