import requireAdmin from './_lib/requireAdmin.js';
import {
  fetchDraftById,
  saveGeneratedAsset,
  checkForbiddenClaims,
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
      maxOutputTokens: 2000,
    }
  });
  return JSON.parse(response.text);
}

export async function processGenerateCaptions(draftId) {
  const draft = await fetchDraftById(draftId);
  const prompt = `You are a B2B enterprise VMware & cloud architect writing social captions for Zaboraa.
Generate social captions for this post draft:
TITLE: ${draft.title}
BODY: ${draft.edited_body || draft.body}
HASHTAGS: ${(draft.hashtags || []).join(' ')}

Respond with JSON adhering to this exact schema:
{
  "instagram_caption": "max 150 chars, high hook value, space-separated hashtags (max 5), NO URL in body",
  "youtube_title": "max 70 chars, primary keyword, clear and direct",
  "youtube_description": "200-300 chars, summary, hashtags, and brief overview"
}

FORBIDDEN CLAIMS: Do NOT mention 12+ years, 40+ migrations, 8x certifications, pricing, or client names.`;

  let aiRes;
  try {
    aiRes = await callVertexAI(prompt);
  } catch (err) {
    // Fallback if AI call fails in mock/offline mode
    aiRes = {
      instagram_caption: `${draft.title.slice(0, 80)} #VMware #AVS #Cloud #FinOps #Zaboraa`,
      youtube_title: `Enterprise VMware & AVS Architecture: ${draft.title.slice(0, 45)}`,
      youtube_description: `Learn enterprise VMware and cloud architecture strategies. ${draft.body.slice(0, 150)}... #VMware #AVS #CloudArchitecture`
    };
  }

  const result = {
    instagram_caption: (aiRes.instagram_caption || '').slice(0, 160),
    youtube_title: (aiRes.youtube_title || '').slice(0, 75),
    youtube_description: aiRes.youtube_description || '',
    briefing_cta: BRIEFING_CTA
  };

  const forbiddenViolation = checkForbiddenClaims(result);
  if (forbiddenViolation) {
    throw new Error(`Caption contains forbidden claim: ${forbiddenViolation}`);
  }

  await saveGeneratedAsset(draftId, 'captions', result);
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
    const data = await processGenerateCaptions(draftId);
    return res.status(200).json(data);
  } catch (err) {
    const isValidation = err.message.includes('forbidden claim') || err.message.includes('not found');
    return res.status(isValidation ? 400 : 502).json({
      success: false,
      error: err.message || 'Failed to generate captions'
    });
  }
}
