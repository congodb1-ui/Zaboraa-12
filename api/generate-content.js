import { GoogleGenAI } from '@google/genai';
import { requireAdmin } from './_lib/requireAdmin.js';
import { validateTopics, allocatePosts } from './_lib/contentPillars.js';

const MODEL = 'gemini-3.7-flash';
const REQUEST_TIMEOUT_MS = 25000;

const SYSTEM_INSTRUCTION = `You are the Lead Technical Content Architect for Zaboraa (zaboraa.com), a premier founder-led enterprise VMware Cloud Architecture and Hyperscaler Migration consultancy.

ZABORAA FOUNDATIONAL FACTS (STRICT GROUNDING - USE ONLY THESE FACTS):
- Founder-led enterprise VMware and multi-hyperscaler advisory.
- 13+ years of specialized enterprise virtualization and cloud infrastructure experience.
- 25+ successful enterprise hyperscaler migrations delivered across Azure VMware Solution (AVS), AWS VMware Cloud (VMC), and Google Cloud VMware Engine (GCVE).
- 6 verified enterprise cloud and virtualization certifications held.
- 100% runbook-driven cutovers with zero unplanned rollback.
- 6 free enterprise architecture engineering tools and calculators on zaboraa.com.

STRICT CONTENT RESTRICTIONS (NEVER INCLUDE ANY OF THE FOLLOWING):
- DO NOT invent or quote specific client names or confidential company names.
- DO NOT quote synthetic pricing, license rates, or monetary figures.
- DO NOT mention videos, YouTube, masterclasses, or webinars.
- DO NOT include testimonials or fabricated customer quotes.
- DO NOT refer to "Zaboraa Technologies" (use "Zaboraa" or "Zaboraa Cloud Architecture").
- DO NOT invent unverified metrics or case-study statistics.

TARGET AUDIENCE:
Enterprise IT Directors, VP Infrastructure, Principal Enterprise Architects, and Cloud Infrastructure Leads.

OUTPUT REQUIREMENTS:
Generate high-impact, actionable, technically rigorous LinkedIn posts matching the requested topics and exact post allocation.
Return ONLY a valid JSON array of objects conforming to the response schema.`;

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      hook: { type: 'STRING' },
      body: { type: 'STRING' },
      hashtags: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      cta: { type: 'STRING' },
      topic: { type: 'STRING' },
    },
    required: ['title', 'hook', 'body', 'hashtags', 'cta', 'topic'],
  },
};

/**
 * Validates and normalizes Gemini post items.
 */
function validateAndNormalizePosts(items, topics, allocation) {
  if (!Array.isArray(items) || items.length !== 3) {
    return { valid: false, error: 'Model did not return exactly 3 posts.' };
  }

  const topicCountMap = new Map();
  topics.forEach((t) => topicCountMap.set(t.toLowerCase(), 0));

  const normalized = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Item ${i} is not a valid object.` };
    }

    const title = typeof item.title === 'string' ? item.title.trim() : 'Enterprise Cloud Architecture Insight';
    let hook = typeof item.hook === 'string' ? item.hook.trim() : '';
    let body = typeof item.body === 'string' ? item.body.trim() : '';
    let cta = typeof item.cta === 'string' ? item.cta.trim() : 'Explore enterprise cloud architecture at zaboraa.com';
    const rawTopic = typeof item.topic === 'string' ? item.topic.trim() : '';

    // Validate topic matches one of the input topics
    const matchingTopic = topics.find(
      (t) => t.toLowerCase() === rawTopic.toLowerCase()
    );

    if (!matchingTopic) {
      return {
        valid: false,
        error: `Post topic "${rawTopic}" does not match any requested input topics.`,
      };
    }

    topicCountMap.set(
      matchingTopic.toLowerCase(),
      (topicCountMap.get(matchingTopic.toLowerCase()) || 0) + 1
    );

    // Normalize and clean hashtags: 3 to 6 hashtags, start with #, no whitespace
    const rawHashtags = Array.isArray(item.hashtags) ? item.hashtags : [];
    const cleanedHashtags = [];
    const seenTags = new Set();

    for (const tag of rawHashtags) {
      if (typeof tag !== 'string') continue;
      const stripped = tag.replace(/[\s\r\n]+/g, '').replace(/^#+/, '');
      if (stripped.length > 0) {
        const fullTag = `#${stripped}`;
        if (!seenTags.has(fullTag.toLowerCase())) {
          seenTags.add(fullTag.toLowerCase());
          cleanedHashtags.push(fullTag);
        }
      }
    }

    // Default fallback hashtags if too few
    if (cleanedHashtags.length < 3) {
      const defaults = ['#VMware', '#AzureAVS', '#CloudMigration', '#FinOps'];
      for (const d of defaults) {
        if (!seenTags.has(d.toLowerCase())) {
          cleanedHashtags.push(d);
          seenTags.add(d.toLowerCase());
          if (cleanedHashtags.length >= 3) break;
        }
      }
    }
    const finalHashtags = cleanedHashtags.slice(0, 6);

    // Validate lengths
    if (hook.length > 200) hook = hook.slice(0, 197) + '...';
    if (body.length > 2200) body = body.slice(0, 2197) + '...';
    if (cta.length > 200) cta = cta.slice(0, 197) + '...';

    normalized.push({
      id: `post-${Date.now()}-${i}`,
      title,
      hook,
      body,
      hashtags: finalHashtags,
      cta,
      topic: matchingTopic,
      status: 'idea',
      created_at: new Date().toISOString(),
    });
  }

  // Validate allocation matches
  for (const alloc of allocation) {
    const actualCount = topicCountMap.get(alloc.topic.toLowerCase()) || 0;
    if (actualCount !== alloc.count) {
      return {
        valid: false,
        error: `Allocation mismatch for topic "${alloc.topic}". Expected ${alloc.count}, got ${actualCount}.`,
      };
    }
  }

  return { valid: true, posts: normalized };
}

/**
 * Calls Vertex AI Express model with fallback and structured output schema.
 */
async function callGeminiVertex(prompt, apiKey, projectId, location) {
  let ai = new GoogleGenAI({
    vertexai: true,
    apiKey,
    project: projectId,
    location,
  });

  const generateWithTimeout = async (clientInstance) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Vertex AI request timed out after 25 seconds.')),
        REQUEST_TIMEOUT_MS
      )
    );

    const callPromise = clientInstance.models.generateContent({
      model: MODEL,
      contents: `${SYSTEM_INSTRUCTION}\n\n${prompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    return Promise.race([callPromise, timeoutPromise]);
  };

  try {
    return await generateWithTimeout(ai);
  } catch (regionalErr) {
    console.warn(
      `Vertex AI Express request in ${location} failed (${regionalErr.message}), falling back to global location.`
    );
    const globalAi = new GoogleGenAI({
      vertexai: true,
      apiKey,
      project: projectId,
      location: 'global',
    });
    return await generateWithTimeout(globalAi);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  // Enforce Admin Authentication
  const auth = await requireAdmin(req, res);
  if (!auth.authorized) {
    return;
  }

  const apiKey = process.env.VERTEX_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'VERTEX_API_KEY is not configured on server.',
    });
  }

  // Validate Topics input
  const rawTopics = req.body?.topics;
  const validation = validateTopics(rawTopics);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error || 'topics is required, pick 1 to 3 topics.',
    });
  }

  const topics = validation.topics;
  const allocation = allocatePosts(topics);

  // Rate Limiting: Max 20 generations per user per hour
  if (auth.supabase && auth.user?.id) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error: countErr } = await auth.supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('actor_id', auth.user.id)
        .eq('action', 'GENERATE_CONTENT_IDEAS')
        .gte('created_at', oneHourAgo);

      if (!countErr && typeof count === 'number' && count >= 20) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded: Maximum 20 generations per hour. Please try again later.',
        });
      }
    } catch (e) {
      console.warn('Notice checking rate limit:', e);
    }
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'prime-bridge-511404-a3';
  const configuredLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  // Construct structured data prompt
  const allocationDesc = allocation
    .map((a) => `- Topic: "${a.topic}" -> Generate exactly ${a.count} post${a.count > 1 ? 's' : ''}`)
    .join('\n');

  const userPrompt = `=== REQUESTED TOPICS DATA ===
${topics.map((t, idx) => `Topic ${idx + 1}: "${t}"`).join('\n')}

=== ALLOCATION REQUIREMENT ===
${allocationDesc}

Total posts required: 3.
Ensure each post has its "topic" property set EXACTLY to the matching requested topic.`;

  // Attempt generation with single retry on schema/parsing validation failure
  let attempt = 0;
  let finalPosts = null;

  while (attempt < 2 && !finalPosts) {
    attempt++;
    try {
      const response = await callGeminiVertex(
        userPrompt,
        apiKey,
        projectId,
        configuredLocation
      );

      const parts =
        response.candidates?.flatMap(
          (candidate) => candidate.content?.parts || []
        ) || [];

      let jsonText = parts.map((p) => p.text || '').join('');
      if (!jsonText && response.text) {
        jsonText = response.text;
      }

      if (!jsonText) {
        throw new Error('Empty response from model.');
      }

      const cleaned = jsonText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const postValidation = validateAndNormalizePosts(parsed, topics, allocation);

      if (postValidation.valid) {
        finalPosts = postValidation.posts;
        break;
      } else {
        console.warn(`Attempt ${attempt} output validation error:`, postValidation.error);
        if (attempt >= 2) {
          return res.status(502).json({
            success: false,
            error: 'AI model returned an unexpected output format. Please retry.',
          });
        }
      }
    } catch (err) {
      console.error(`Attempt ${attempt} generation error:`, err?.message || err);
      if (err?.message?.includes('timed out')) {
        return res.status(504).json({
          success: false,
          error: 'Content generation timed out after 25 seconds. Please try again.',
        });
      }
      if (attempt >= 2) {
        return res.status(502).json({
          success: false,
          error: 'Failed to generate content ideas. Please try again.',
        });
      }
    }
  }

  if (!finalPosts) {
    return res.status(502).json({
      success: false,
      error: 'Failed to generate content ideas after retry.',
    });
  }

  // Audit Logging
  if (auth.supabase) {
    try {
      await auth.supabase.from('audit_logs').insert([
        {
          actor_id: auth.user?.id || null,
          actor_email: auth.email || 'admin',
          actor_role: 'admin',
          action: 'GENERATE_CONTENT_IDEAS',
          target_entity: 'content_ideas',
          outcome: 'success',
          metadata: {
            topics,
            postCount: finalPosts.length,
            model: MODEL,
          },
        },
      ]);
    } catch (auditErr) {
      console.warn('Notice writing audit log:', auditErr);
    }
  }

  return res.status(200).json({
    success: true,
    posts: finalPosts,
    ideas: finalPosts,
    model: MODEL,
  });
}
