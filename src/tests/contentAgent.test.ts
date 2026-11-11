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
  getContentDrafts,
  saveContentDraft,
  getContentQueue,
  approveDraftToQueue,
  unapproveQueueItem,
  deleteQueueItem,
  getNextQueueSlot,
  ContentDraft,
  ContentQueueItem
} from '../lib/contentAgent';

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
});
