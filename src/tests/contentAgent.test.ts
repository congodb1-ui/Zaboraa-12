import { describe, it, expect, vi, beforeEach } from 'vitest';

// Node test environment in-memory localStorage polyfill
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] || null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  }
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = localStorageMock;
}

import {
  generateContentIdeas,
  fetchSuggestedTopics,
  getContentDrafts,
  saveContentDraft,
  getContentQueue,
  approveDraftToQueue,
  unapproveQueueItem,
  deleteQueueItem,
  getNextQueueSlot,
  PILLARS,
  ContentDraft,
  ContentQueueItem
} from '../lib/contentAgent';

// Import backend pillar helpers directly for unit testing
// @ts-ignore
import {
  PILLARS as BACKEND_PILLARS,
  validateTopics,
  allocatePosts,
  pickSuggestedTopics,
  normalizeTopicToPillar,
  RANKED_PILLARS
} from '../../api/_lib/contentPillars.js';

describe('§16.2 Content & Growth Agent — Phase 1 Test Suite', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. generateContentIdeas() Error Handling & Resilience (§16.2.5)', () => {
    it('gracefully throws error message when serverless API returns error response', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation(async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Vertex AI authentication failed',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      });

      await expect(generateContentIdeas()).rejects.toThrow(
        'Vertex AI authentication failed'
      );

      global.fetch = originalFetch;
    });

    it('returns structured JSON ideas when Vertex AI responds with valid posts array', async () => {
      const mockIdeas = [
        {
          title: 'Unlocking 40% Node Savings with Azure NetApp Files in AVS',
          hook: 'Is your Azure VMware Solution cluster compute-bound or storage-bound?',
          body: 'Most enterprise VMware architects over-provision ESXi nodes just for vSAN storage.\nDecoupling storage with ANF reduces node count dramatically.',
          hashtags: ['#VMware', '#AzureAVS', '#NetApp', '#CloudEconomics'],
          cta: 'Evaluate your node requirements with our free sizing tool at zaboraa.com/tools/sizing',
          topic: 'AVS',
        },
        {
          title: '6 Migration Blockers That Kill HCX Live Waves',
          hook: 'Why do 70% of enterprise VMware migrations stall on Wave 1?',
          body: 'From RDMs to shared SCSI multi-writer disks, discover the key architectural hurdles before scheduling maintenance windows.',
          hashtags: ['#HCX', '#Migration', '#EnterpriseIT', '#CloudArchitecture'],
          cta: 'Analyze your cluster with RVTools Analyzer at zaboraa.com/tools/rvtools-analyzer',
          topic: 'hyperscaler migration',
        },
        {
          title: 'Decoupled Storage Economics for VMware Cloud',
          hook: 'Are you paying $8,000/month per node just for disk space?',
          body: 'Learn how decoupled NFS and Google Cloud NetApp Volumes slash enterprise TCO across multi-cloud deployments.',
          hashtags: ['#CloudSizing', '#StorageArchitecture', '#FinOps'],
          cta: 'Download the comprehensive multi-cloud architectural runbook at zaboraa.com',
          topic: 'cloud sizing',
        },
      ];

      // Mock global fetch
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation(async () => {
        return new Response(
          JSON.stringify({
            success: true,
            posts: mockIdeas,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      });

      const ideas = await generateContentIdeas();
      expect(ideas).toHaveLength(3);
      expect(ideas[0].title).toContain('Azure NetApp Files in AVS');
      expect(ideas[0].topic).toBe('AVS');
      expect(ideas[1].topic).toBe('hyperscaler migration');
      expect(ideas[2].topic).toBe('cloud sizing');

      global.fetch = originalFetch;
    });
  });

  describe('2. Drafts Lifecycle & Approval Pipeline (§16.2.4 & §16.2.6)', () => {
    it('saves drafts to local store and retrieves them accurately', async () => {
      const draft: ContentDraft = {
        id: 'draft-test-1',
        title: 'Evaluating Nutanix NC2 on AWS vs Azure AVS',
        body: 'A deep architectural comparison of bare-metal hypervisor models in hyperscaler clouds.',
        hashtags: ['#Nutanix', '#NC2', '#AVS', '#VMware'],
        cta: 'Run a migration assessment at zaboraa.com/tools/nutanix-nc2-assessment',
        topic: 'hyperscaler migration',
        status: 'Draft',
        created_at: new Date().toISOString()
      };

      await saveContentDraft(draft);
      const drafts = await getContentDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].id).toBe('draft-test-1');
      expect(drafts[0].status).toBe('Draft');
    });

    it('supports inline editing of title, body, hashtags, and CTA', async () => {
      const draft: ContentDraft = {
        id: 'draft-test-edit',
        title: 'Original Title',
        body: 'Original Body',
        hashtags: ['#Initial'],
        cta: 'Original CTA',
        topic: 'AVS',
        status: 'Draft',
        created_at: new Date().toISOString()
      };

      await saveContentDraft(draft);

      const updatedDraft: ContentDraft = {
        ...draft,
        title: 'Updated Architectural Title',
        body: 'Updated body text with technical depth.',
        hashtags: ['#Updated', '#AVS'],
        cta: 'Updated CTA link'
      };

      await saveContentDraft(updatedDraft);
      const drafts = await getContentDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].title).toBe('Updated Architectural Title');
      expect(drafts[0].body).toBe('Updated body text with technical depth.');
      expect(drafts[0].hashtags).toEqual(['#Updated', '#AVS']);
    });

    it('approving a draft moves it to the queue with Mon / Wed / Fri 09:30 AM IST slot', async () => {
      const draft: ContentDraft = {
        id: 'draft-to-approve',
        title: 'HCX Network Extension Best Practices',
        body: 'Best practices for MON traffic routing and MTU 1500 vs 9000 jumbo frames.',
        hashtags: ['#HCX', '#Networking'],
        cta: 'Check runbook at zaboraa.com',
        topic: 'hyperscaler migration',
        status: 'Draft',
        created_at: new Date().toISOString()
      };

      await saveContentDraft(draft);
      const queueItem = await approveDraftToQueue(draft);

      expect(queueItem.draft_id).toBe('draft-to-approve');
      expect(queueItem.scheduled_day).toBe('Mon');
      expect(queueItem.scheduled_time).toBe('09:30 AM IST');
      expect(queueItem.status).toBe('Queued');

      // Verify draft status in storage changed to Approved
      const drafts = await getContentDrafts();
      expect(drafts[0].status).toBe('Approved');

      // Verify queue in storage has the item
      const queue = await getContentQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(queueItem.id);
    });

    it('rejecting a draft keeps it in drafts with Rejected status', async () => {
      const draft: ContentDraft = {
        id: 'draft-to-reject',
        title: 'Incomplete Post Draft',
        body: 'Draft content that needs more polish.',
        hashtags: ['#Draft'],
        cta: 'CTA',
        topic: 'cloud sizing',
        status: 'Draft',
        created_at: new Date().toISOString()
      };

      await saveContentDraft(draft);
      await saveContentDraft({ ...draft, status: 'Rejected' });

      const drafts = await getContentDrafts();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].status).toBe('Rejected');

      // Ensure it was not added to queue
      const queue = await getContentQueue();
      expect(queue).toHaveLength(0);
    });

    it('unapproving a queue item removes it from queue and restores draft status to Draft', async () => {
      const draft: ContentDraft = {
        id: 'draft-to-unapprove',
        title: 'AVS Stretched Cluster Architecture',
        body: 'Dual-AZ resilience with 99.99% SLA availability.',
        hashtags: ['#AVS', '#HighAvailability'],
        cta: 'Read architecture note',
        topic: 'AVS',
        status: 'Draft',
        created_at: new Date().toISOString()
      };

      await saveContentDraft(draft);
      const queueItem = await approveDraftToQueue(draft);

      // Verify queued
      let queue = await getContentQueue();
      expect(queue).toHaveLength(1);

      // Unapprove
      await unapproveQueueItem(queueItem.id, draft.id);

      // Verify removed from queue
      queue = await getContentQueue();
      expect(queue).toHaveLength(0);

      // Verify draft status reverted to Draft
      const drafts = await getContentDrafts();
      expect(drafts[0].status).toBe('Draft');
    });

    it('deleting a queue item removes it from queue', async () => {
      const draft: ContentDraft = {
        id: 'draft-to-delete',
        title: 'Post to delete',
        body: 'Some body text',
        hashtags: ['#Test'],
        cta: 'CTA',
        topic: 'AVS',
        status: 'Draft',
        created_at: new Date().toISOString()
      };

      await saveContentDraft(draft);
      const queueItem = await approveDraftToQueue(draft);

      let queue = await getContentQueue();
      expect(queue).toHaveLength(1);

      await deleteQueueItem(queueItem.id);

      queue = await getContentQueue();
      expect(queue).toHaveLength(0);
    });
  });

  describe('3. Queue Slot Distribution (§16.2.4 & §16.2.6)', () => {
    it('cycles sequentially through Mon, Wed, Fri at 09:30 AM IST', () => {
      expect(getNextQueueSlot(0)).toEqual({ day: 'Mon', time: '09:30 AM IST' });
      expect(getNextQueueSlot(1)).toEqual({ day: 'Wed', time: '09:30 AM IST' });
      expect(getNextQueueSlot(2)).toEqual({ day: 'Fri', time: '09:30 AM IST' });
      expect(getNextQueueSlot(3)).toEqual({ day: 'Mon', time: '09:30 AM IST' });
      expect(getNextQueueSlot(4)).toEqual({ day: 'Wed', time: '09:30 AM IST' });
    });
  });

  describe('4. Phase 2a Topic Validation & Allocation Logic', () => {
    it('validates and matches standard 6 content pillars', () => {
      expect(PILLARS).toHaveLength(6);
      expect(BACKEND_PILLARS).toEqual(PILLARS);
      expect(PILLARS).toContain('AVS Migrations');
      expect(PILLARS).toContain('Broadcom / VMware Licensing');
      expect(PILLARS).toContain('Multi-Hyperscaler Strategy');
      expect(PILLARS).toContain('Cloud Sizing / FinOps');
      expect(PILLARS).toContain('Modernization Without Rewrite');
      expect(PILLARS).toContain('Zaboraa Proof / Case Studies');
    });

    it('normalizes legacy aliases to standard pillars', () => {
      expect(normalizeTopicToPillar('avs')).toBe('AVS Migrations');
      expect(normalizeTopicToPillar('broadcom')).toBe('Broadcom / VMware Licensing');
      expect(normalizeTopicToPillar('hyperscaler migration')).toBe('Multi-Hyperscaler Strategy');
      expect(normalizeTopicToPillar('cloud sizing')).toBe('Cloud Sizing / FinOps');
    });

    it('validateTopics rejects empty input or non-array with valid=false', () => {
      expect(validateTopics(null).valid).toBe(false);
      expect(validateTopics([]).valid).toBe(false);
      expect(validateTopics('').valid).toBe(false);
      expect(validateTopics(123).valid).toBe(false);
    });

    it('validateTopics trims, strips control chars, dedupes, and accepts valid 1-3 topics', () => {
      const input = [
        '  AVS Migrations  ',
        'avs migrations', // duplicate
        'Custom Cloud Topic\u0000\u001F',
        'Cloud Sizing / FinOps',
      ];
      const result = validateTopics(input);
      expect(result.valid).toBe(true);
      expect(result.topics).toHaveLength(3);
      expect(result.topics[0]).toBe('AVS Migrations');
      expect(result.topics[1]).toBe('Custom Cloud Topic');
      expect(result.topics[2]).toBe('Cloud Sizing / FinOps');
    });

    it('validateTopics rejects topics longer than 120 chars', () => {
      const longTopic = 'A'.repeat(150);
      const result = validateTopics([longTopic]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed length of 120 characters');
    });

    it('allocates posts accurately per Prompt 2a allocation rules', () => {
      // 1 topic -> 3 posts
      const alloc1 = allocatePosts(['AVS Migrations']);
      expect(alloc1).toEqual([{ topic: 'AVS Migrations', count: 3 }]);

      // 2 topics -> 2 posts topic #1, 1 post topic #2
      const alloc2 = allocatePosts(['AVS Migrations', 'Broadcom / VMware Licensing']);
      expect(alloc2).toEqual([
        { topic: 'AVS Migrations', count: 2 },
        { topic: 'Broadcom / VMware Licensing', count: 1 }
      ]);

      // 3 topics -> 1 post each
      const alloc3 = allocatePosts([
        'AVS Migrations',
        'Broadcom / VMware Licensing',
        'Cloud Sizing / FinOps'
      ]);
      expect(alloc3).toEqual([
        { topic: 'AVS Migrations', count: 1 },
        { topic: 'Broadcom / VMware Licensing', count: 1 },
        { topic: 'Cloud Sizing / FinOps', count: 1 }
      ]);
    });

    it('pickSuggestedTopics prioritizes pillars not recently used in drafts/queue', () => {
      // If AVS and Broadcom were used recently, suggest the remaining top 3
      const recent = [
        { topic: 'AVS Migrations', created_at: '2026-11-10T10:00:00Z' },
        { topic: 'Broadcom / VMware Licensing', created_at: '2026-11-09T10:00:00Z' }
      ];
      const suggestion = pickSuggestedTopics(recent);
      expect(suggestion.topics).toHaveLength(3);
      expect(suggestion.topics).not.toContain('AVS Migrations');
      expect(suggestion.topics).not.toContain('Broadcom / VMware Licensing');
      expect(suggestion.topics).toContain('Cloud Sizing / FinOps');
      expect(suggestion.topics).toContain('Multi-Hyperscaler Strategy');
      expect(suggestion.topics).toContain('Modernization Without Rewrite');
      expect(suggestion.reason).toContain('Prioritized');
    });

    it('pickSuggestedTopics returns top 3 ranked pillars when history is empty', () => {
      const suggestion = pickSuggestedTopics([]);
      expect(suggestion.topics).toHaveLength(3);
      expect(suggestion.topics).toEqual([
        'Broadcom / VMware Licensing',
        'AVS Migrations',
        'Cloud Sizing / FinOps'
      ]);
      expect(suggestion.reason).toContain('Recommended top 3 strategic growth pillars');
    });
  });

  describe('5. Client API Integration with Topics & Auth Header', () => {
    it('generateContentIdeas sends topics array in POST body to /api/generate-content', async () => {
      const originalFetch = global.fetch;
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url: string, options: any) => {
        if (url === '/api/generate-content') {
          capturedBody = JSON.parse(options.body);
          return new Response(
            JSON.stringify({
              success: true,
              posts: [
                {
                  title: 'AVS Post 1',
                  hook: 'Hook 1',
                  body: 'Body 1',
                  hashtags: ['#AVS'],
                  cta: 'CTA 1',
                  topic: 'AVS Migrations'
                },
                {
                  title: 'AVS Post 2',
                  hook: 'Hook 2',
                  body: 'Body 2',
                  hashtags: ['#AVS'],
                  cta: 'CTA 2',
                  topic: 'AVS Migrations'
                },
                {
                  title: 'FinOps Post 1',
                  hook: 'Hook 3',
                  body: 'Body 3',
                  hashtags: ['#FinOps'],
                  cta: 'CTA 3',
                  topic: 'Cloud Sizing / FinOps'
                }
              ]
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not found', { status: 404 });
      });

      const ideas = await generateContentIdeas(['AVS Migrations', 'Cloud Sizing / FinOps']);
      expect(ideas).toHaveLength(3);
      expect(capturedBody).toBeDefined();
      expect(capturedBody.topics).toEqual(['AVS Migrations', 'Cloud Sizing / FinOps']);

      global.fetch = originalFetch;
    });

    it('fetchSuggestedTopics calls GET /api/suggest-topics and returns suggestions', async () => {
      const originalFetch = global.fetch;
      let requestedUrl = '';

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return new Response(
          JSON.stringify({
            success: true,
            suggestedTopics: [
              'Multi-Hyperscaler Strategy',
              'Cloud Sizing / FinOps',
              'Modernization Without Rewrite'
            ],
            reason: 'Least recently covered across 7 days'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      });

      const result = await fetchSuggestedTopics();
      expect(requestedUrl).toBe('/api/suggest-topics');
      expect(result.success).toBe(true);
      expect(result.suggestedTopics).toHaveLength(3);
      expect(result.suggestedTopics[0]).toBe('Multi-Hyperscaler Strategy');

      global.fetch = originalFetch;
    });
  });
});
