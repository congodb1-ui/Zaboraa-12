import { supabase, isSupabaseConfigured } from './supabase';

export const PILLARS = [
  'AVS Migrations',
  'Broadcom / VMware Licensing',
  'Multi-Hyperscaler Strategy',
  'Cloud Sizing / FinOps',
  'Modernization Without Rewrite',
  'Zaboraa Proof / Case Studies',
] as const;

export type ContentPillar =
  | 'AVS Migrations'
  | 'Broadcom / VMware Licensing'
  | 'Multi-Hyperscaler Strategy'
  | 'Cloud Sizing / FinOps'
  | 'Modernization Without Rewrite'
  | 'Zaboraa Proof / Case Studies'
  | string;

export interface ContentIdea {
  id?: string;
  title: string;
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  topic: ContentPillar;
  status?: 'idea' | 'drafted' | 'discarded';
  created_at?: string;
}

export interface ContentDraft {
  id: string;
  idea_id?: string;
  title: string;
  hook?: string;
  body: string;
  edited_body?: string;
  hashtags: string[];
  cta: string;
  topic: ContentPillar;
  status: 'Draft' | 'Approved' | 'Rejected';
  scheduled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentQueueItem {
  id: string;
  draft_id: string;
  scheduled_day: string; // e.g. 'Mon', 'Wed', 'Fri'
  scheduled_time: string; // e.g. '09:30 AM IST'
  scheduled_at?: string;
  platform?: string;
  status: 'Queued' | 'Posted' | 'Cancelled';
  posted_at?: string;
  linkedin_url?: string;
  created_at?: string;
  updated_at?: string;
  draft?: ContentDraft;
}

export interface CaptionsResult {
  success: boolean;
  draftId: string;
  linkedin_caption: string;
  instagram_caption: string;
  youtube_title: string;
  youtube_description: string;
  briefing_cta: string;
}

export interface VideoScriptResult {
  success: boolean;
  draftId: string;
  script: {
    hook: string;
    problem: string;
    point1: string;
    point2: string;
    point3: string;
    cta: string;
  };
  shot_list: { second_mark: string; action: string }[];
  duration_estimate: number;
}

export interface KBResult {
  success: boolean;
  draftId: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  outline: { h2: string; summary: string }[];
  body: string;
  frontmatter: string;
  full_markdown: string;
}

export interface PosterResult {
  success: boolean;
  draftId: string;
  linkedin: string; // base64 PNG
  instagram: string; // base64 PNG
}

export interface TrackStatus<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface GenerateAllResult {
  success: boolean;
  partial?: boolean;
  results: {
    captions: TrackStatus<CaptionsResult>;
    video_script: TrackStatus<VideoScriptResult>;
    kb: TrackStatus<KBResult>;
    poster: TrackStatus<PosterResult>;
  };
}

export interface GeneratedAssetRow {
  id: string;
  draft_id: string;
  asset_type: 'poster_linkedin' | 'poster_instagram' | 'video_script' | 'kb_draft' | 'captions';
  content: string;
  created_at?: string;
}

export interface SuggestedTopicsResponse {
  success: boolean;
  suggestedTopics: string[];
  topics?: string[];
  excluded?: { pillar: string; lastUsed?: string | null }[];
  reason: string;
  fallback?: boolean;
}

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        return globalThis.localStorage.getItem(key);
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.setItem(key, value);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {}
  },
};

const STORAGE_KEYS = {
  IDEAS: 'zaboraa_content_ideas',
  DRAFTS: 'zaboraa_content_drafts',
  QUEUE: 'zaboraa_content_queue',
};

/**
 * Retrieves the active Supabase session token if available.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Notice reading Supabase session token:', e);
    }
  }

  return headers;
}

/**
 * Fetch suggested topics from /api/suggest-topics with offline fallback.
 */
export async function fetchSuggestedTopics(): Promise<SuggestedTopicsResponse> {
  try {
    const headers = await getAuthHeaders();
    const resp = await fetch('/api/suggest-topics', {
      method: 'GET',
      headers,
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.success && Array.isArray(data.suggestedTopics)) {
        return data as SuggestedTopicsResponse;
      }
    }
  } catch (e) {
    console.warn('Notice fetching suggested topics:', e);
  }

  // Pure client fallback
  return {
    success: true,
    suggestedTopics: [
      'Broadcom / VMware Licensing',
      'AVS Migrations',
      'Cloud Sizing / FinOps',
    ],
    topics: [
      'Broadcom / VMware Licensing',
      'AVS Migrations',
      'Cloud Sizing / FinOps',
    ],
    excluded: [],
    reason: 'Recommended top 3 strategic growth pillars based on enterprise cloud priorities.',
    fallback: true,
  };
}

export interface GenerateContentIdeasResult {
  success: boolean;
  posts: ContentIdea[];
  ideas: ContentIdea[];
  model?: string;
}

/**
 * Generate 3 LinkedIn content ideas using Vertex AI serverless endpoint (§16.2 / Phase 2a)
 */
export async function generateContentIdeas(
  topicsInput?: string[] | string
): Promise<ContentIdea[] & GenerateContentIdeasResult> {
  try {
    let topics: string[] = [];
    if (Array.isArray(topicsInput)) {
      topics = topicsInput;
    } else if (typeof topicsInput === 'string' && topicsInput.trim()) {
      topics = [topicsInput.trim()];
    } else {
      topics = ['AVS Migrations', 'Broadcom / VMware Licensing'];
    }

    const headers = await getAuthHeaders();
    const resp = await fetch('/api/generate-content', {
      method: 'POST',
      headers,
      body: JSON.stringify({ topics }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      const errorMsg =
        errData?.error || `Generation failed with HTTP status ${resp.status}.`;
      const errObj: any = new Error(errorMsg);
      if (errData?.retryable) errObj.retryable = true;
      if (errData?.upstreamStatus) errObj.upstreamStatus = errData.upstreamStatus;
      throw errObj;
    }

    const data = await resp.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate content ideas.');
    }

    const rawList = data.posts ?? data.ideas ?? [];
    if (!Array.isArray(rawList) || rawList.length === 0) {
      throw new Error('Invalid posts format received from server.');
    }

    const ideas: ContentIdea[] = rawList.map((item: any, index: number) => ({
      id: item.id || `idea-${Date.now()}-${index}`,
      title: item.title || 'Enterprise Cloud Architecture Insight',
      hook: item.hook || '',
      body: item.body || '',
      hashtags: Array.isArray(item.hashtags)
        ? item.hashtags
        : ['#VMware', '#AzureAVS', '#CloudMigration'],
      cta: item.cta || 'Explore enterprise migration runbooks at zaboraa.com',
      topic: item.topic || (topics[index % topics.length] || 'AVS Migrations'),
      status: 'idea',
      created_at: item.created_at || new Date().toISOString(),
    }));

    // Cache locally
    try {
      safeStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    } catch {}

    // Persist to Supabase content_ideas if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('content_ideas').upsert(
          ideas.map((idea) => ({
            id: idea.id,
            title: idea.title,
            hook: idea.hook,
            body: idea.body,
            hashtags: idea.hashtags,
            cta: idea.cta,
            topic: idea.topic,
            status: idea.status || 'idea',
            created_at: idea.created_at || new Date().toISOString(),
          }))
        );
      } catch (sbErr) {
        console.warn('Notice saving content_ideas to Supabase:', sbErr);
      }
    }

    // Attach posts and ideas properties to array for backwards compatibility with UI callers
    const resultObj = Object.assign(ideas, {
      success: true,
      posts: ideas,
      ideas: ideas,
      model: data.model,
    });

    return resultObj as ContentIdea[] & GenerateContentIdeasResult;
  } catch (err: any) {
    console.error('generateContentIdeas error:', err);
    throw new Error(err.message || 'Failed to generate. Please try again.');
  }
}

/**
 * Storage & Data Helpers for content_drafts and content_queue (§16.2.6)
 */

export async function getContentDrafts(): Promise<ContentDraft[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as ContentDraft[];
      }
    } catch (e) {
      console.warn('Notice querying content_drafts from Supabase:', e);
    }
  }

  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.DRAFTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveContentDraft(draft: ContentDraft): Promise<ContentDraft> {
  // Update local storage
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.DRAFTS);
    const drafts: ContentDraft[] = raw ? JSON.parse(raw) : [];
    const index = drafts.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      drafts[index] = { ...drafts[index], ...draft, updated_at: new Date().toISOString() };
    } else {
      drafts.unshift({
        ...draft,
        created_at: draft.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    safeStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  } catch {}

  // Update Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('content_drafts').upsert({
        id: draft.id,
        idea_id: draft.idea_id || null,
        title: draft.title,
        hook: draft.hook || '',
        body: draft.body,
        edited_body: draft.edited_body || null,
        hashtags: draft.hashtags,
        cta: draft.cta,
        topic: draft.topic,
        status: draft.status,
        created_at: draft.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Notice upserting content_drafts in Supabase:', e);
    }
  }

  return draft;
}

export async function getContentQueue(): Promise<ContentQueueItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('content_queue')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as ContentQueueItem[];
      }
    } catch (e) {
      console.warn('Notice querying content_queue from Supabase:', e);
    }
  }

  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Computes next scheduled Mon / Wed / Fri slot
 */
export function getNextQueueSlot(existingQueueCount: number): { day: string; time: string } {
  const days = ['Mon', 'Wed', 'Fri'];
  const day = days[existingQueueCount % days.length];
  return {
    day,
    time: '09:30 AM IST',
  };
}

export async function approveDraftToQueue(draft: ContentDraft): Promise<ContentQueueItem> {
  const queue = await getContentQueue();
  const slot = getNextQueueSlot(queue.length);

  const queueItem: ContentQueueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    draft_id: draft.id,
    scheduled_day: slot.day,
    scheduled_time: slot.time,
    status: 'Queued',
    created_at: new Date().toISOString(),
    draft: { ...draft, status: 'Approved' },
  };

  // Update draft status to Approved
  await saveContentDraft({ ...draft, status: 'Approved' });

  // Update local storage queue
  queue.push(queueItem);
  try {
    safeStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  } catch {}

  // Update Supabase content_queue
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('content_queue').upsert({
        id: queueItem.id,
        draft_id: queueItem.draft_id,
        scheduled_day: queueItem.scheduled_day,
        scheduled_time: queueItem.scheduled_time,
        status: queueItem.status,
        created_at: queueItem.created_at,
      });
    } catch (e) {
      console.warn('Notice upserting content_queue in Supabase:', e);
    }
  }

  return queueItem;
}

export async function unapproveQueueItem(queueItemId: string, draftId: string): Promise<void> {
  // 1. Remove or update queue
  try {
    const queue = await getContentQueue();
    const filtered = queue.filter((q) => q.id !== queueItemId);
    safeStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(filtered));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('content_queue').delete().eq('id', queueItemId);
    } catch (e) {
      console.warn('Notice deleting from content_queue in Supabase:', e);
    }
  }

  // 2. Set draft status back to Draft
  const drafts = await getContentDrafts();
  const draft = drafts.find((d) => d.id === draftId);
  if (draft) {
    await saveContentDraft({ ...draft, status: 'Draft' });
  }
}

export async function deleteQueueItem(queueItemId: string): Promise<void> {
  try {
    const queue = await getContentQueue();
    const filtered = queue.filter((q) => q.id !== queueItemId);
    safeStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(filtered));
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('content_queue').delete().eq('id', queueItemId);
    } catch (e) {
      console.warn('Notice deleting item from content_queue in Supabase:', e);
    }
  }
}

// ============================================================================
// PHASE 2B: MANUAL LINKEDIN POSTING & VALIDATION HELPERS
// ============================================================================

export interface FormattedLinkedInPost {
  text: string;
  length: number;
  overLimit: boolean;
}

/**
 * Pure function to format a draft for LinkedIn publication.
 * Format: hook + blank line + (edited_body ?? body) + blank line + cta + blank line + hashtags.
 * The title is NOT included (LinkedIn text posts do not have titles).
 * Plain text, no escaping (for manual copy-paste).
 * Character length is measured in Unicode code points (Array.from).
 * overLimit is true when length > 3000.
 */
export function formatLinkedInPost(
  draft: Pick<ContentDraft, 'hook' | 'body' | 'edited_body' | 'cta' | 'hashtags'>
): FormattedLinkedInPost {
  const unescapeStr = (str?: string | null) =>
    (str || '').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').trim();

  const hook = unescapeStr(draft.hook);
  const rawBody = draft.edited_body !== undefined && draft.edited_body !== null
    ? draft.edited_body
    : draft.body;
  const body = unescapeStr(rawBody);
  const cta = unescapeStr(draft.cta);

  // Normalize hashtags: split on commas, quotes, newlines, strip internal whitespace and leading #
  const tagTokens = (draft.hashtags || [])
    .flatMap((t) => (typeof t === 'string' ? t.split(/[,;'"\r\n]+/) : []))
    .map((tag) => tag.replace(/^#+/, '').replace(/\s+/g, '').trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const normalizedHashtags: string[] = [];
  for (const tag of tagTokens) {
    const full = `#${tag}`;
    if (!seen.has(full.toLowerCase())) {
      seen.add(full.toLowerCase());
      normalizedHashtags.push(full);
      if (normalizedHashtags.length >= 6) break;
    }
  }

  const hashtagsText = normalizedHashtags.join(' ');

  const sections: string[] = [];
  if (hook) sections.push(hook);
  if (body) sections.push(body);
  if (cta) sections.push(cta);
  if (hashtagsText) sections.push(hashtagsText);

  const text = sections.join('\n\n');
  const length = Array.from(text).length;
  const overLimit = length > 3000;

  return {
    text,
    length,
    overLimit,
  };
}

/**
 * Validates whether a given URL is a legitimate LinkedIn post URL.
 * Accepts:
 * - https://www.linkedin.com/feed/update/urn:li:(activity|share|ugcPost):<digits>
 * - https://www.linkedin.com/posts/<slug>
 * (also accepts apex https://linkedin.com/...)
 */
export function validateLinkedInUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== 'www.linkedin.com' && host !== 'linkedin.com') return false;

    const pathname = parsed.pathname;
    const feedPattern = /^\/feed\/update\/urn:li:(?:activity|share|ugcPost):\d+\/?$/i;
    const postsPattern = /^\/posts\/[a-zA-Z0-9_\-\.]+\/?$/i;

    return feedPattern.test(pathname) || postsPattern.test(pathname);
  } catch {
    return false;
  }
}

/**
 * Marks a queued post as 'Posted' with manual LinkedIn post URL verification.
 * Write order:
 * 1. Write to Supabase content_queue first.
 * 2. Insert audit_logs row.
 * 3. Update local cache only after DB writes succeed.
 * If Supabase fails, throws an error and does not update local state.
 */
export async function markQueueItemAsPosted(
  queueItemId: string,
  linkedinUrl: string,
  actorEmail?: string
): Promise<void> {
  const trimmedUrl = linkedinUrl.trim();
  if (!validateLinkedInUrl(trimmedUrl)) {
    throw new Error('Please provide a valid LinkedIn post URL.');
  }

  const postedAt = new Date().toISOString();

  // 1. Write to Supabase content_queue
  if (isSupabaseConfigured && supabase) {
    const { error: dbError } = await supabase
      .from('content_queue')
      .update({
        status: 'Posted',
        posted_at: postedAt,
        linkedin_url: trimmedUrl,
        updated_at: postedAt,
      })
      .eq('id', queueItemId);

    if (dbError) {
      throw new Error(`Database error marking post as posted: ${dbError.message}`);
    }

    // 2. Insert audit_logs row
    try {
      let actorId: string | null = null;
      let email = actorEmail;
      try {
        const { data: sess } = await supabase.auth.getSession();
        actorId = sess?.session?.user?.id || null;
        if (!email) email = sess?.session?.user?.email || 'admin@zaboraa.com';
      } catch {}

      await supabase.from('audit_logs').insert([
        {
          actor_id: actorId,
          actor_email: email || 'admin@zaboraa.com',
          actor_role: 'admin',
          action: 'MARK_POSTED_MANUAL',
          target_entity: 'content_queue',
          target_id: queueItemId,
          outcome: 'success',
          metadata: {
            linkedin_url: trimmedUrl,
            posted_at: postedAt,
            queue_id: queueItemId,
          },
        },
      ]);
    } catch (auditErr) {
      console.warn('Notice inserting audit_logs entry for mark posted:', auditErr);
    }
  }

  // 3. Update local storage cache only after DB operation succeeds
  try {
    const queue = await getContentQueue();
    const updated = queue.map((item) =>
      item.id === queueItemId
        ? {
            ...item,
            status: 'Posted' as const,
            posted_at: postedAt,
            linkedin_url: trimmedUrl,
            updated_at: postedAt,
          }
        : item
    );
    safeStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(updated));
  } catch (err) {
    console.warn('Notice updating local storage queue:', err);
  }
}

export async function fetchGeneratedAssets(draftId: string): Promise<GeneratedAssetRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('generated_assets')
      .select('*')
      .eq('draft_id', draftId);
    if (error || !data) return [];
    return data as GeneratedAssetRow[];
  } catch {
    return [];
  }
}

async function postStudioTrack<T>(endpoint: string, draftId: string): Promise<T> {
  let token: string | null = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token || null;
    } catch {}
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ draftId }),
  });

  const rawText = await res.text().catch(() => '');
  let body: any = {};
  try {
    body = JSON.parse(rawText);
  } catch {
    console.error(`Content Studio endpoint returned non-JSON response (${res.status}):`, rawText);
    throw new Error(`Server returned status ${res.status}. Please retry.`);
  }

  if (!res.ok) {
    throw new Error(body.error || `Failed request to ${endpoint}`);
  }
  return body as T;
}

export async function generateCaptions(draftId: string): Promise<CaptionsResult> {
  return postStudioTrack<CaptionsResult>('/api/content-studio?track=captions', draftId);
}

export async function generateVideoScript(draftId: string): Promise<VideoScriptResult> {
  return postStudioTrack<VideoScriptResult>('/api/content-studio?track=video-script', draftId);
}

export async function generateKB(draftId: string): Promise<KBResult> {
  return postStudioTrack<KBResult>('/api/content-studio?track=kb', draftId);
}

export async function generatePoster(draftId: string): Promise<PosterResult> {
  return postStudioTrack<PosterResult>('/api/content-studio?track=poster', draftId);
}

export async function generateAll(draftId: string): Promise<GenerateAllResult> {
  return postStudioTrack<GenerateAllResult>('/api/content-studio?track=all', draftId);
}
