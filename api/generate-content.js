import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.7-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.VERTEX_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'VERTEX_API_KEY is not configured on server.',
    });
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'prime-bridge-511404-a3';
  const configuredLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  try {
    const topic = req.body?.topic || req.body?.prompt;
    const prompt =
      typeof topic === 'string' && topic.trim()
        ? topic.trim()
        : 'Generate 3 LinkedIn posts for Zaboraa, VMware Cloud Architecture company, topics: AVS, hyperscaler migration, cloud sizing';

    const systemInstruction = `You are the Lead Technical Content Architect for Zaboraa (zaboraa.com), a premier VMware Cloud Architecture and Hyperscaler Migration consultancy specializing in Azure VMware Solution (AVS), AWS VMC, Google Cloud VMware Engine (GCVE), and Nutanix NC2.
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

    let ai = new GoogleGenAI({
      vertexai: true,
      apiKey,
      project: projectId,
      location: configuredLocation,
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: MODEL,
        contents: `${systemInstruction}\n\nUser Request: ${prompt}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
    } catch (regionalErr) {
      // If regional endpoint fails (e.g. 404 publisher model not in region), fallback to global
      console.warn(
        `Vertex AI Express request in ${configuredLocation} failed (${regionalErr.message}), falling back to global location.`
      );
      ai = new GoogleGenAI({
        vertexai: true,
        apiKey,
        project: projectId,
        location: 'global',
      });
      response = await ai.models.generateContent({
        model: MODEL,
        contents: `${systemInstruction}\n\nUser Request: ${prompt}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
    }

    const parts =
      response.candidates?.flatMap(
        (candidate) => candidate.content?.parts || []
      ) || [];

    let jsonText = parts.map((p) => p.text || '').join('');
    if (!jsonText && response.text) {
      jsonText = response.text;
    }

    if (!jsonText) {
      return res.status(502).json({
        success: false,
        error: 'Vertex AI returned an empty response.',
        details: 'No text or content parts received in response.',
      });
    }

    const cleaned = jsonText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(502).json({
        success: false,
        error: 'Vertex AI response was not an array.',
        details: jsonText,
      });
    }

    const posts = parsed.map((item, index) => ({
      id: item.id || `post-${Date.now()}-${index}`,
      title: item.title || 'Enterprise Cloud Architecture Insight',
      hook: item.hook || '',
      body: item.body || '',
      hashtags: Array.isArray(item.hashtags)
        ? item.hashtags
        : ['#VMware', '#AzureAVS', '#CloudMigration'],
      cta: item.cta || 'Explore enterprise migration runbooks at zaboraa.com',
      topic:
        item.topic ||
        (index === 0
          ? 'AVS'
          : index === 1
          ? 'hyperscaler migration'
          : 'cloud sizing'),
      status: 'idea',
      created_at: new Date().toISOString(),
    }));

    return res.status(200).json({
      success: true,
      posts,
      ideas: posts,
      model: MODEL,
      project: projectId,
    });
  } catch (err) {
    console.error('Vertex AI Express generate-content error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal Server Error during Vertex AI generation',
      details: String(err?.stack || err),
    });
  }
}
