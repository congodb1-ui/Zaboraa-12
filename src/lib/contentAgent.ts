import { supabase, isSupabaseConfigured } from './supabase';

export interface ContentIdea {
  id?: string;
  title: string;
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  topic: 'AVS' | 'hyperscaler migration' | 'cloud sizing' | string;
  status?: 'idea' | 'drafted' | 'discarded';
  created_at?: string;
}

export interface ContentDraft {
  id: string;
  idea_id?: string;
  title: string;
  hook?: string;
  body: string;
  hashtags: string[];
  cta: string;
  topic: string;
  status: 'Draft' | 'Approved' | 'Rejected';
  created_at?: string;
  updated_at?: string;
}

export interface ContentQueueItem {
  id: string;
  draft_id: string;
  scheduled_day: string; // e.g. 'Mon', 'Wed', 'Fri'
  scheduled_time: string; // e.g. '09:30 AM IST'
  status: 'Queued' | 'Posted';
  created_at?: string;
  draft?: ContentDraft;
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
  }
};

const STORAGE_KEYS = {
  IDEAS: 'zaboraa_content_ideas',
  DRAFTS: 'zaboraa_content_drafts',
  QUEUE: 'zaboraa_content_queue',
};

/**
 * Generate 3 LinkedIn content ideas using Vertex AI serverless endpoint (§16.2.5)
 */
export async function generateContentIdeas(topic?: string): Promise<ContentIdea[]> {
  try {
    const prompt =
      typeof topic === 'string' && topic.trim()
        ? topic.trim()
        : 'Generate 3 LinkedIn posts for Zaboraa, VMware Cloud Architecture company, topics: AVS, hyperscaler migration, cloud sizing';

    const resp = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, topic: prompt }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      const errorMsg =
        errData?.error || `Generation failed with HTTP status ${resp.status}.`;
      throw new Error(errorMsg);
    }

    const data = await resp.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate content ideas.');
    }

    const rawList = data.posts || data.ideas;
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
      topic:
        item.topic ||
        (index === 0
          ? 'AVS'
          : index === 1
          ? 'hyperscaler migration'
          : 'cloud sizing'),
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

    return ideas;
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
      if (!error && data) {
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
    const drafts = await getContentDrafts();
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
        body: draft.body,
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
      if (!error && data) {
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
