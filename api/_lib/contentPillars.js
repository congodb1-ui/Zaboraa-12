/**
 * Content Pillars and Topic Allocation Logic for Zaboraa Content Agent (§16.2 / Phase 2a)
 */

export const PILLARS = [
  'AVS Migrations',
  'Broadcom / VMware Licensing',
  'Multi-Hyperscaler Strategy',
  'Cloud Sizing / FinOps',
  'Modernization Without Rewrite',
  'Zaboraa Proof / Case Studies',
];

export const LEGACY_ALIASES = {
  avs: 'AVS Migrations',
  'azure avs': 'AVS Migrations',
  broadcom: 'Broadcom / VMware Licensing',
  'broadcom licensing': 'Broadcom / VMware Licensing',
  'vmware licensing': 'Broadcom / VMware Licensing',
  'hyperscaler migration': 'Multi-Hyperscaler Strategy',
  'multi-hyperscaler': 'Multi-Hyperscaler Strategy',
  'cloud sizing': 'Cloud Sizing / FinOps',
  finops: 'Cloud Sizing / FinOps',
  modernization: 'Modernization Without Rewrite',
  'case studies': 'Zaboraa Proof / Case Studies',
  proof: 'Zaboraa Proof / Case Studies',
};

export const RANKED_PILLARS = [
  'Broadcom / VMware Licensing',
  'AVS Migrations',
  'Cloud Sizing / FinOps',
  'Multi-Hyperscaler Strategy',
  'Modernization Without Rewrite',
  'Zaboraa Proof / Case Studies',
];

/**
 * Normalizes a topic string to a standard pillar if it matches a known pillar or alias.
 */
export function normalizeTopicToPillar(topic) {
  if (typeof topic !== 'string') return null;
  const cleaned = topic.replace(/[\r\n\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!cleaned) return null;

  for (const p of PILLARS) {
    if (p.toLowerCase() === cleaned) return p;
  }
  if (LEGACY_ALIASES[cleaned]) {
    return LEGACY_ALIASES[cleaned];
  }
  return null;
}

/**
 * Validates and cleans topic input.
 * Must be array of strings; strip control chars/newlines, collapse whitespace, trim, drop empties, dedupe case-insensitively.
 * Max 120 chars per topic (reject, do not truncate).
 * Valid if 1-3 topics remain.
 */
export function validateTopics(input) {
  if (!Array.isArray(input)) {
    return {
      valid: false,
      error: 'topics is required, pick 1 to 3 topics.',
      topics: [],
    };
  }

  const cleanedList = [];
  const seenLower = new Set();

  for (const item of input) {
    if (typeof item !== 'string') {
      return {
        valid: false,
        error: 'Each topic must be a valid text string.',
        topics: [],
      };
    }

    // Strip control characters, newlines, collapse whitespace
    const cleaned = item
      .replace(/[\r\n\x00-\x1F\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) continue;

    if (cleaned.length > 120) {
      return {
        valid: false,
        error: `Topic "${cleaned.slice(0, 30)}..." exceeds maximum allowed length of 120 characters.`,
        topics: [],
      };
    }

    const lower = cleaned.toLowerCase();
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      cleanedList.push(cleaned);
    }
  }

  if (cleanedList.length < 1 || cleanedList.length > 3) {
    return {
      valid: false,
      error: 'topics is required, pick 1 to 3 topics.',
      topics: cleanedList,
    };
  }

  return {
    valid: true,
    error: null,
    topics: cleanedList,
  };
}

/**
 * Computes exact 3-post allocation across 1 to 3 topics.
 * 1 topic: [3]
 * 2 topics: [2, 1] (first gets 2)
 * 3 topics: [1, 1, 1]
 */
export function allocatePosts(topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return [];
  }
  if (topics.length === 1) {
    return [{ topic: topics[0], count: 3 }];
  }
  if (topics.length === 2) {
    return [
      { topic: topics[0], count: 2 },
      { topic: topics[1], count: 1 },
    ];
  }
  return [
    { topic: topics[0], count: 1 },
    { topic: topics[1], count: 1 },
    { topic: topics[2], count: 1 },
  ];
}

/**
 * Suggests 3 strategic topics based on recently used topics and priority ranking.
 * @param {Array<string | { topic: string, created_at?: string }>} recentTopics
 */
export function pickSuggestedTopics(recentTopics = []) {
  // Map recent topics to known pillars and track their most recent usage date
  const usedPillarsMap = new Map(); // pillar -> { lastUsed: string | null, order: number }

  const list = Array.isArray(recentTopics) ? recentTopics : [];
  list.forEach((entry, idx) => {
    const rawTopic = typeof entry === 'string' ? entry : entry?.topic;
    const createdAt = typeof entry === 'object' && entry?.created_at ? entry.created_at : null;
    const pillar = normalizeTopicToPillar(rawTopic);
    if (pillar) {
      if (!usedPillarsMap.has(pillar)) {
        usedPillarsMap.set(pillar, { lastUsed: createdAt, order: idx });
      }
    }
  });

  const excluded = [];
  for (const [pillar, info] of usedPillarsMap.entries()) {
    excluded.push({ pillar, lastUsed: info.lastUsed });
  }

  // Candidates = pillars not used
  const unusedCandidates = RANKED_PILLARS.filter((p) => !usedPillarsMap.has(p));

  let selected = [...unusedCandidates];

  if (selected.length >= 3) {
    selected = selected.slice(0, 3);
  } else {
    // Fill remaining slots with least recently used pillars among used ones
    const usedSortedByOldest = Array.from(usedPillarsMap.entries())
      .sort((a, b) => {
        // If timestamps available, sort ascending (oldest first)
        if (a[1].lastUsed && b[1].lastUsed) {
          return new Date(a[1].lastUsed).getTime() - new Date(b[1].lastUsed).getTime();
        }
        // Fallback to order (highest order = oldest in descending input list)
        return b[1].order - a[1].order;
      })
      .map(([pillar]) => pillar);

    for (const pillar of usedSortedByOldest) {
      if (!selected.includes(pillar)) {
        selected.push(pillar);
        if (selected.length === 3) break;
      }
    }
  }

  // Ensure 3 topics fallback to top ranked if still less than 3
  if (selected.length < 3) {
    for (const p of RANKED_PILLARS) {
      if (!selected.includes(p)) {
        selected.push(p);
        if (selected.length === 3) break;
      }
    }
  }

  const selectedList = selected.slice(0, 3);
  const excludedNames = excluded.map((e) => e.pillar);

  let reason = '';
  if (excludedNames.length > 0) {
    reason = `Prioritized "${selectedList.join('", "')}" to balance coverage, rotating away from recently drafted topics (${excludedNames.join(', ')}).`;
  } else {
    reason = `Recommended top 3 strategic growth pillars based on enterprise cloud architecture priorities.`;
  }

  return {
    topics: selectedList,
    excluded,
    reason,
  };
}
