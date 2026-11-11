import { requireAdmin } from './_lib/requireAdmin.js';
import { pickSuggestedTopics, RANKED_PILLARS } from './_lib/contentPillars.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  // Enforce Admin Authentication
  const auth = await requireAdmin(req, res);
  if (!auth.authorized) {
    return;
  }

  try {
    const supabase = auth.supabase;
    let recentTopicEntries = [];

    if (supabase) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      try {
        // Query recent content_ideas
        const { data: ideasData } = await supabase
          .from('content_ideas')
          .select('topic, created_at, status')
          .gte('created_at', sevenDaysAgo)
          .in('status', ['idea', 'drafted'])
          .order('created_at', { ascending: false })
          .limit(50);

        // Query recent content_drafts
        const { data: draftsData } = await supabase
          .from('content_drafts')
          .select('topic, created_at, status')
          .gte('created_at', sevenDaysAgo)
          .order('created_at', { ascending: false })
          .limit(50);

        if (Array.isArray(ideasData)) {
          recentTopicEntries.push(...ideasData);
        }
        if (Array.isArray(draftsData)) {
          recentTopicEntries.push(...draftsData);
        }
      } catch (dbErr) {
        console.warn('Notice querying recent topics from Supabase:', dbErr);
      }
    }

    const { topics, excluded, reason } = pickSuggestedTopics(recentTopicEntries);

    return res.status(200).json({
      success: true,
      suggestedTopics: topics,
      topics,
      excluded,
      reason,
      fallback: false,
    });
  } catch (err) {
    console.error('Suggest topics error:', err);
    // Safe fallback without exposing DB error details
    const fallbackTopics = RANKED_PILLARS.slice(0, 3);
    return res.status(200).json({
      success: true,
      suggestedTopics: fallbackTopics,
      topics: fallbackTopics,
      excluded: [],
      reason: 'Recommended top 3 strategic growth pillars (offline fallback).',
      fallback: true,
    });
  }
}
