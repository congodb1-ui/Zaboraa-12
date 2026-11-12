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

// Mock Supabase to guarantee no live network calls during tests
vi.mock('../lib/supabase', () => {
  return {
    isSupabaseConfigured: true,
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              access_token: 'mock-jwt-token',
              user: { id: 'mock-admin-uuid', email: 'wasim.sayyed@zaboraa.com' },
            },
          },
        }),
      },
      from: vi.fn((table: string) => {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }),
    },
  };
});

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
  formatLinkedInPost,
  validateLinkedInUrl,
  markQueueItemAsPosted,
  PILLARS,
  ContentDraft,
  ContentQueueItem
} from '../lib/contentAgent';

// Import backend pillar and vertex helpers directly for unit testing
// @ts-ignore
import {
  PILLARS as BACKEND_PILLARS,
  validateTopics,
  allocatePosts,
  pickSuggestedTopics,
  normalizeTopicToPillar,
  RANKED_PILLARS
} from '../../api/_lib/contentPillars.js';
// @ts-ignore
import {
  validateModel,
  deriveVertexHost,
  sanitizeErrorMessage,
  callVertex
} from '../../api/generate-content.js';

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

  describe('6. Phase 2b: LinkedIn Copy Formatter, URL Validator & Manual Posting', () => {
    describe('formatLinkedInPost', () => {
      it('formats hook, body, CTA, and hashtags with double linebreaks', () => {
        const draft: ContentDraft = {
          id: 'draft-1',
          title: 'This Title Should Never Appear in Formatted Post',
          hook: 'Why do 70% of VMware migrations stall?',
          body: 'Here is the detailed body copy explaining why migrations stall.',
          cta: '👉 Assess your clusters at zaboraa.com/tools/sizing',
          hashtags: ['#AVS', 'VMware', 'Cloud Migration'],
          topic: 'AVS Migrations',
          status: 'Approved',
        };

        const result = formatLinkedInPost(draft);

        // Title must not appear
        expect(result.text).not.toContain('This Title Should Never Appear');
        // Sections properly separated
        expect(result.text).toContain(
          'Why do 70% of VMware migrations stall?\n\nHere is the detailed body copy explaining why migrations stall.\n\n👉 Assess your clusters at zaboraa.com/tools/sizing\n\n#AVS #VMware #CloudMigration'
        );
        expect(result.overLimit).toBe(false);
        expect(result.length).toBe(Array.from(result.text).length);
      });

      it('prefers edited_body over original body', () => {
        const draft: ContentDraft = {
          id: 'draft-2',
          title: 'Custom Title',
          hook: 'Hook text',
          body: 'Original unedited body',
          edited_body: 'Executive edited body text',
          cta: 'CTA link',
          hashtags: ['#FinOps'],
          topic: 'Cloud Sizing / FinOps',
          status: 'Approved',
        };

        const result = formatLinkedInPost(draft);
        expect(result.text).toContain('Executive edited body text');
        expect(result.text).not.toContain('Original unedited body');
      });

      it('normalizes hashtags: prefixes #, strips internal spaces, caps at 6 tags', () => {
        const draft: ContentDraft = {
          id: 'draft-3',
          title: 'Hashtag Test',
          hook: 'Hook',
          body: 'Body',
          cta: 'CTA',
          hashtags: [
            '#AVS',
            'Broadcom VMware',
            '##DoubleHash',
            'FinOps',
            'Hyperscaler',
            'Multi Cloud',
            'ExtraTag7',
            'ExtraTag8',
          ],
          topic: 'AVS Migrations',
          status: 'Draft',
        };

        const result = formatLinkedInPost(draft);
        expect(result.text).toContain(
          '#AVS #BroadcomVMware #DoubleHash #FinOps #Hyperscaler #MultiCloud'
        );
        expect(result.text).not.toContain('#ExtraTag7');
        expect(result.text).not.toContain('#ExtraTag8');
      });

      it('does NOT apply HTML or URL escaping to characters (plain text copy)', () => {
        const draft: ContentDraft = {
          id: 'draft-4',
          title: 'Special Chars',
          hook: 'Quotes & "Ampersands" <Tags> & \'Apostrophes\'',
          body: 'Lines with \\ backslashes, *asterisks*, and _underscores_.',
          cta: 'Visit https://zaboraa.com/tools?id=1&type=avs',
          hashtags: ['#Cloud_Ops'],
          topic: 'AVS Migrations',
          status: 'Approved',
        };

        const result = formatLinkedInPost(draft);
        expect(result.text).toContain('Quotes & "Ampersands" <Tags> & \'Apostrophes\'');
        expect(result.text).toContain('Lines with \\ backslashes, *asterisks*, and _underscores_.');
        expect(result.text).toContain('https://zaboraa.com/tools?id=1&type=avs');
      });

      it('accurately counts Unicode emojis by code points and flags overLimit > 3000', () => {
        const emojiHook = '🚀⚡🎯🔥💡🏆'; // 6 code points
        const baseDraft: ContentDraft = {
          id: 'draft-5',
          title: 'Emoji test',
          hook: emojiHook,
          body: 'Short body',
          cta: 'CTA',
          hashtags: ['#Test'],
          topic: 'AVS Migrations',
          status: 'Approved',
        };

        const shortResult = formatLinkedInPost(baseDraft);
        expect(shortResult.overLimit).toBe(false);

        // Build a long text draft exceeding 3000 code points
        const longBody = 'A'.repeat(3100);
        const longDraft: ContentDraft = {
          ...baseDraft,
          body: longBody,
        };

        const longResult = formatLinkedInPost(longDraft);
        expect(longResult.overLimit).toBe(true);
        expect(longResult.length).toBeGreaterThan(3000);
        // Does not silently truncate
        expect(longResult.text.length).toBeGreaterThanOrEqual(3100);
      });
    });

    describe('validateLinkedInUrl', () => {
      it('validates activity, share, ugcPost, and /posts/ LinkedIn URLs correctly', () => {
        const validUrls = [
          'https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678/',
          'https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678',
          'https://www.linkedin.com/feed/update/urn:li:share:7123456789012345678',
          'https://www.linkedin.com/feed/update/urn:li:ugcPost:7123456789012345678/',
          'https://linkedin.com/feed/update/urn:li:activity:7123456789012345678',
          'https://www.linkedin.com/posts/zaboraa_enterprise-vmware-cloud-migration-activity-7123456789012345678-abcd',
          'https://linkedin.com/posts/wasim-sayyed_broadcom-licensing-analysis',
          'https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678?updateEntityUrn=urn%3Ali%3Afs_feedUpdate',
        ];

        for (const url of validUrls) {
          expect(validateLinkedInUrl(url), `Expected ${url} to be valid`).toBe(true);
        }
      });

      it('rejects invalid domains, schemes, malformed URNs, and non-post URLs', () => {
        const invalidUrls = [
          'http://www.linkedin.com/feed/update/urn:li:activity:7123456789', // http instead of https
          'https://twitter.com/zaboraa/status/123456', // wrong domain
          'https://www.linkedin.com/in/wasim-sayyed', // profile URL
          'https://www.linkedin.com/company/zaboraa/', // company page URL
          'https://www.linkedin.com/feed/update/urn:li:unknown:7123456789', // invalid URN type
          'https://www.linkedin.com/feed/update/', // missing URN
          'https://www.linkedin.com/posts/', // empty post slug
          'not a url',
          '',
          null as any,
          undefined as any,
        ];

        for (const url of invalidUrls) {
          expect(validateLinkedInUrl(url), `Expected ${url} to be invalid`).toBe(false);
        }
      });
    });

    describe('markQueueItemAsPosted & Lifecycle Gating', () => {
      it('updates queue item to Posted, records posted_at & linkedin_url, and draft remains Approved', async () => {
        const draft: ContentDraft = {
          id: 'draft-posted-test',
          title: 'Manual Posting Test Draft',
          hook: 'Hook',
          body: 'Body',
          cta: 'CTA',
          hashtags: ['#AVS'],
          topic: 'AVS Migrations',
          status: 'Approved',
        };
        await saveContentDraft(draft);

        const queueItem = await approveDraftToQueue(draft);
        expect(queueItem.status).toBe('Queued');

        const validLinkedinUrl =
          'https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678/';

        await markQueueItemAsPosted(queueItem.id, validLinkedinUrl, 'wasim.sayyed@zaboraa.com');

        const updatedQueue = await getContentQueue();
        const found = updatedQueue.find((q) => q.id === queueItem.id);
        expect(found).toBeDefined();
        expect(found?.status).toBe('Posted');
        expect(found?.linkedin_url).toBe(validLinkedinUrl);
        expect(found?.posted_at).toBeDefined();

        // Linked draft status must remain 'Approved'
        const drafts = await getContentDrafts();
        const linkedDraft = drafts.find((d) => d.id === draft.id);
        expect(linkedDraft?.status).toBe('Approved');
      });

      it('rejects markQueueItemAsPosted when URL is invalid', async () => {
        const draft: ContentDraft = {
          id: 'draft-invalid-url',
          title: 'Invalid URL Test',
          hook: 'Hook',
          body: 'Body',
          cta: 'CTA',
          hashtags: ['#AVS'],
          topic: 'AVS Migrations',
          status: 'Approved',
        };
        await saveContentDraft(draft);
        const queueItem = await approveDraftToQueue(draft);

        await expect(
          markQueueItemAsPosted(queueItem.id, 'https://invalid-domain.com/post/123')
        ).rejects.toThrow('valid LinkedIn post URL');
      });

      it('surfaces database error and leaves local queue untouched when Supabase update fails', async () => {
        const draft: ContentDraft = {
          id: 'draft-db-failure',
          title: 'DB Failure Test',
          hook: 'Hook',
          body: 'Body',
          cta: 'CTA',
          hashtags: ['#AVS'],
          topic: 'AVS Migrations',
          status: 'Approved',
        };
        await saveContentDraft(draft);
        const queueItem = await approveDraftToQueue(draft);

        // Temporarily override supabase.from('content_queue').update to return an error
        const { supabase } = await import('../lib/supabase');
        if (supabase) {
          const originalFrom = (supabase as any).from;
          (supabase as any).from = vi.fn().mockImplementation((table: string) => {
            if (table === 'content_queue') {
              return {
                update: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database connection timeout' },
                  }),
                }),
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              };
            }
            return originalFrom(table);
          });

          await expect(
            markQueueItemAsPosted(
              queueItem.id,
              'https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678/'
            )
          ).rejects.toThrow('Database connection timeout');

          // Confirm local storage queue was NOT marked as Posted
          const queue = await getContentQueue();
          const item = queue.find((q) => q.id === queueItem.id);
          expect(item?.status).toBe('Queued');

          (supabase as any).from = originalFrom;
        }
      });
    });
  });

  describe('8. Vertex AI Location, Model Validation & Error Redaction Suite', () => {
    describe('Model Name Validation & Security Guardrails', () => {
      it('accepts valid gemini model identifiers', () => {
        expect(validateModel('gemini-3.7-flash')).toEqual({
          valid: true,
          model: 'gemini-3.7-flash',
        });
        expect(validateModel('gemini-2.5-pro')).toEqual({
          valid: true,
          model: 'gemini-2.5-pro',
        });
        expect(validateModel('gemini-1.5-flash-8b')).toEqual({
          valid: true,
          model: 'gemini-1.5-flash-8b',
        });
      });

      it('hard-rejects forbidden model gemini-4-argon', () => {
        const res = validateModel('gemini-4-argon');
        expect(res.valid).toBe(false);
        expect(res.error).toBe('Model gemini-4-argon is not supported.');
      });

      it('rejects invalid model name formats and non-gemini models', () => {
        expect(validateModel('gpt-4').valid).toBe(false);
        expect(validateModel('claude-3-5-sonnet').valid).toBe(false);
        expect(validateModel('gemini_flash').valid).toBe(false);
        expect(validateModel('').valid).toBe(false);
        // @ts-ignore
        expect(validateModel(null).valid).toBe(false);
      });
    });

    describe('Location to Vertex AI Host Mapping', () => {
      it('maps global location to aiplatform.googleapis.com', () => {
        expect(deriveVertexHost('global')).toBe('aiplatform.googleapis.com');
        expect(deriveVertexHost('')).toBe('aiplatform.googleapis.com');
        // @ts-ignore
        expect(deriveVertexHost(null)).toBe('aiplatform.googleapis.com');
      });

      it('maps regional and multi-region locations to prefixed hostnames', () => {
        expect(deriveVertexHost('us-central1')).toBe('us-central1-aiplatform.googleapis.com');
        expect(deriveVertexHost('europe-west1')).toBe('europe-west1-aiplatform.googleapis.com');
        expect(deriveVertexHost('asia-northeast1')).toBe('asia-northeast1-aiplatform.googleapis.com');
      });
    });

    describe('Error Message Sanitization & Redaction', () => {
      it('redacts sensitive API keys and project IDs from error messages', () => {
        const secretKey = 'AIzaSySecretApiKey12345';
        const secretProject = 'prime-bridge-511404-a3';
        const rawMessage = `Error 404 from Vertex at projects/${secretProject}/locations/global with key ${secretKey}`;

        const sanitized = sanitizeErrorMessage(rawMessage, [secretKey, secretProject]);
        expect(sanitized).not.toContain(secretKey);
        expect(sanitized).not.toContain(secretProject);
        expect(sanitized).toContain('[REDACTED]');
      });
    });

    describe('callVertex() Mock Invariant & Error Surfacing', () => {
      it('surfaces upstream 404 error with correct upstreamStatus and sanitized message', async () => {
        const originalFetch = global.fetch;
        const fakeKey = 'test-fake-key-999';
        const fakeProject = 'secret-proj-123';

        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({
            error: {
              code: 404,
              message: `Publisher model projects/${fakeProject}/locations/us-central1/publishers/google/models/gemini-3.7-flash was not found`,
            },
          }),
        });

        await expect(
          callVertex({
            prompt: 'Reply OK',
            apiKey: fakeKey,
            projectId: fakeProject,
            location: 'us-central1',
            model: 'gemini-3.7-flash',
          })
        ).rejects.toMatchObject({
          upstreamStatus: 404,
          statusText: 'Not Found',
        });

        // Ensure fake project was redacted from the error message
        try {
          await callVertex({
            prompt: 'Reply OK',
            apiKey: fakeKey,
            projectId: fakeProject,
            location: 'us-central1',
            model: 'gemini-3.7-flash',
          });
        } catch (err: any) {
          expect(err.message).toContain('Vertex request failed (HTTP 404 Not Found)');
          expect(err.message).not.toContain(fakeProject);
          expect(err.message).not.toContain(fakeKey);
        }

        global.fetch = originalFetch;
      });

      it('correctly passes x-goog-api-key header and formats v1 endpoint URL', async () => {
        const originalFetch = global.fetch;
        let capturedUrl = '';
        let capturedHeaders: any = {};

        global.fetch = vi.fn().mockImplementation(async (url: string, init: any) => {
          capturedUrl = url;
          capturedHeaders = init?.headers;
          return {
            ok: true,
            status: 200,
            json: async () => ({
              candidates: [
                {
                  content: {
                    parts: [{ text: JSON.stringify([{ title: 'A', hook: 'B', body: 'C', hashtags: ['#D'], cta: 'E', topic: 'F' }]) }],
                  },
                },
              ],
            }),
          };
        });

        const result = await callVertex({
          prompt: 'Generate post',
          apiKey: 'test-api-key',
          projectId: 'my-project',
          location: 'global',
          model: 'gemini-3.7-flash',
        });

        expect(capturedUrl).toBe(
          'https://aiplatform.googleapis.com/v1/projects/my-project/locations/global/publishers/google/models/gemini-3.7-flash:generateContent'
        );
        expect(capturedHeaders['x-goog-api-key']).toBe('test-api-key');
        expect(capturedHeaders['Content-Type']).toBe('application/json');
        expect(result.candidates).toBeDefined();

        global.fetch = originalFetch;
      });
    });
  });
});
