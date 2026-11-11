import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the Lead Technical Content Architect for Zaboraa (zaboraa.com), a premier VMware Cloud Architecture and Hyperscaler Migration consultancy specializing in Azure VMware Solution (AVS), AWS VMC, Google Cloud VMware Engine (GCVE), and Nutanix NC2.
Generate exactly 3 high-impact, professional LinkedIn posts tailored for Enterprise IT Directors, VP Infrastructure, and Lead Cloud Architects.

Strict output requirements:
Return ONLY a valid JSON array of 3 objects with no markdown fences, no explanation, conforming exactly to this structure:
[
  {
    "title": "string",
    "hook": "string",
    "body": "string",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "cta": "string",
    "topic": "AVS | hyperscaler migration | cloud sizing"
  }
]`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate. Check GEMINI_API_KEY and try again.',
    });
  }

  const prompt = req.body?.prompt || 'Generate 3 LinkedIn posts for Zaboraa, VMware Cloud Architecture company, topics: AVS, hyperscaler migration, cloud sizing';

  try {
    let jsonText = '';

    // 1. Try GoogleGenAI SDK
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${SYSTEM_INSTRUCTION}\n\nUser Request: ${prompt}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const parts = response.candidates?.flatMap((c) => c.content?.parts || []) || [];
      jsonText = parts.map((p) => p.text || '').join('');
      if (!jsonText && response.text) {
        jsonText = response.text;
      }
    } catch (sdkErr) {
      console.warn('GoogleGenAI SDK call notice in api/generate-content, trying direct REST fallback:', sdkErr?.message || sdkErr);

      // 2. Direct REST Fallback
      const restResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nUser Request: ${prompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
        }
      );

      if (restResp.ok) {
        const data = await restResp.json();
        const parts = data.candidates?.flatMap((c) => c.content?.parts || []) || [];
        jsonText = parts.map((p) => p.text || '').join('');
      } else {
        // Fallback to gemini-1.5-flash
        const fallbackResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nUser Request: ${prompt}` }],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
              },
            }),
          }
        );

        if (!fallbackResp.ok) {
          const errData = await fallbackResp.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${fallbackResp.status}`);
        }

        const data = await fallbackResp.json();
        const parts = data.candidates?.flatMap((c) => c.content?.parts || []) || [];
        jsonText = parts.map((p) => p.text || '').join('');
      }
    }

    // Clean JSON output (strip accidental markdown code fences)
    let cleaned = (jsonText || '').trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const ideas = JSON.parse(cleaned);

    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new Error('Malformed AI response: expected array of content ideas.');
    }

    return res.status(200).json({
      success: true,
      ideas,
    });
  } catch (err) {
    console.error('Content generation serverless function error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate. Check GEMINI_API_KEY and try again.',
      details: err?.message || String(err),
    });
  }
}
