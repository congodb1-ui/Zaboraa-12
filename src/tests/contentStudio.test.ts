import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  processGenerateCaptions,
  processGenerateVideoScript,
  processGenerateKB,
  processGeneratePoster,
  processGenerateAll,
} from '../../api/content-studio.js';
import {
  generateCaptions,
  generateVideoScript,
  generateKB,
  generatePoster,
  generateAll
} from '../lib/contentAgent';

// Mock Studio Helpers
vi.mock('../../api/_lib/studioHelpers.js', async () => {
  const actual = await vi.importActual('../../api/_lib/studioHelpers.js');
  return {
    ...actual,
    fetchDraftById: vi.fn(async (draftId: string) => {
      if (draftId === 'forbidden-draft') {
        return {
          id: 'forbidden-draft',
          title: 'Clean title',
          body: '12+ years experience in VMware cloud',
          topic: 'AVS Migrations',
          hashtags: ['#VMware', '#AVS'],
          status: 'Approved'
        };
      }
      if (draftId === 'valid-draft') {
        return {
          id: 'valid-draft',
          title: 'Enterprise VMware Cloud Sizing & AVS Architecture',
          body: 'Optimize host CPU and RAM requirements with 100% runbook-driven cutovers.\nKey host CPU balance.\nHeadroom buffer calculations.\nStorage policy mapping.',
          topic: 'AVS Migrations',
          hashtags: ['#VMware', '#AVS'],
          status: 'Approved'
        };
      }
      throw new Error(`Draft with ID ${draftId} not found`);
    }),
    saveGeneratedAsset: vi.fn(async () => {})
  };
});

// Mock @google/genai & fetch for Vertex calls
vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: any) => {
  if (typeof url === 'string' && url.includes('aiplatform.googleapis.com')) {
    const reqBody = JSON.parse(opts?.body || '{}');
    const promptText = reqBody.contents?.[0]?.parts?.[0]?.text || '';

    if (promptText.includes('12+ years experience')) {
      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      linkedin_caption: '12+ years experience in VMware cloud',
                      instagram_caption: '12+ years experience in VMware cloud',
                      youtube_title: '12+ years experience',
                      youtube_description: '12+ years experience',
                      briefing_cta: 'Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing',
                    })
                  }
                ]
              }
            }
          ]
        })
      } as Response;
    }

    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    linkedin_caption: 'LinkedIn post caption here without emojis.',
                    instagram_caption: 'Insta caption <= 150 chars',
                    youtube_title: 'YT Title',
                    youtube_description: 'YT Desc',
                    briefing_cta: 'Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing',
                    script: {
                      hook: 'HOOK (5s): VMware sizing strategy for enterprise cloud.',
                      problem: 'PROBLEM (10s): Host RAM overcommit creates risk.',
                      point1: 'POINT 1 (8s): Calculate 20% headroom buffer.',
                      point2: 'POINT 2 (8s): Map storage policies correctly.',
                      point3: 'POINT 3 (9s): Execute 100% runbook-driven cutover.',
                      cta: 'CTA (5s): Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing'
                    },
                    shot_list: [
                      { second_mark: '0-5s', action: 'Screen record: https://zaboraa.com/tools/sizing' },
                      { second_mark: '5-15s', action: 'Text overlay on dark background: Host Memory Sizing' },
                      { second_mark: '15-30s', action: 'Screen record: https://zaboraa.com' },
                      { second_mark: '30-45s', action: 'Text overlay on dark background: Book briefing' }
                    ],
                    duration_estimate: 45,
                    slug: 'enterprise-vmware-cloud-sizing-avs-architecture',
                    meta_title: 'Enterprise VMware Sizing Runbook',
                    meta_description: 'Learn enterprise sizing strategies at zaboraa.com',
                    outline: [{ h2: '1. Sizing', summary: 'Overview' }],
                    body: '## 1. Overview\nComprehensive sizing guidelines for enterprise cloud migrations using [AVS Sizing Estimator](https://zaboraa.com/tools/sizing).\n\n> **Briefing**\n> Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing',
                    frontmatter: 'meta_title: Enterprise VMware Sizing Runbook',
                    full_markdown: '## 1. Overview\nComprehensive sizing guidelines for enterprise cloud migrations using [AVS Sizing Estimator](https://zaboraa.com/tools/sizing).\n\nRunning VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing'
                  })
                }
              ]
            }
          }
        ]
      })
    } as Response;
  }
  return { ok: false, json: async () => ({ error: 'Not found' }) } as Response;
}));

describe('Section 11: Content Studio (Phase 1) Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.VERTEX_API_KEY = 'mock-vertex-key';
  });

  describe('1. Captions Generation Track', () => {
    it('generates valid captions and includes verbatim Briefing CTA', async () => {
      const res = await processGenerateCaptions('valid-draft');
      expect(res.success).toBe(true);
      expect(res.briefing_cta).toBe(
        'Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing'
      );
      expect(res.instagram_caption.length).toBeLessThanOrEqual(160);
    });

    it('rejects captions if draft contains forbidden claims', async () => {
      await expect(processGenerateCaptions('forbidden-draft')).rejects.toThrow(
        /forbidden claim/i
      );
    });
  });

  describe('2. Video Script Track', () => {
    it('generates structured video script with 6 labelled sections and valid tool routes', async () => {
      const res = await processGenerateVideoScript('valid-draft');
      expect(res.success).toBe(true);
      expect(res.script.hook).toContain('HOOK');
      expect(res.script.problem).toContain('PROBLEM');
      expect(res.script.point1).toContain('POINT 1');
      expect(res.script.point2).toContain('POINT 2');
      expect(res.script.point3).toContain('POINT 3');
      expect(res.script.cta).toContain('Running VMware on-prem or evaluating AVS?');

      // Check shot_list URLs
      for (const shot of res.shot_list) {
        if (shot.action.startsWith('Screen record: ')) {
          const url = shot.action.replace('Screen record: ', '');
          expect(url.startsWith('https://zaboraa.com')).toBe(true);
        }
      }
    });
  });

  describe('3. Knowledge Base Track', () => {
    it('generates Markdown KB draft with frontmatter and verbatim CTA', async () => {
      const res = await processGenerateKB('valid-draft');
      expect(res.success).toBe(true);
      expect(res.slug).toBe('enterprise-vmware-cloud-sizing-avs-architecture');
      expect(res.frontmatter).toContain('meta_title:');
      expect(res.full_markdown).toContain('Running VMware on-prem or evaluating AVS?');
    });
  });

  describe('4. Poster Track & Sharp PNG Generation', () => {
    it('generates base64 PNG posters starting with PNG magic bytes (iVBOR)', async () => {
      const res = await processGeneratePoster('valid-draft');
      expect(res.success).toBe(true);
      expect(res.linkedin.startsWith('iVBOR')).toBe(true);
      expect(res.instagram.startsWith('iVBOR')).toBe(true);
    });
  });

  describe('5. Client Lib Studio Wrappers', () => {
    it('client lib functions dispatch to correct API endpoints', async () => {
      globalThis.fetch = vi.fn(async (url: string) => {
        if (url === '/api/content-studio?track=poster') {
          return {
            ok: true,
            json: async () => ({ success: true, draftId: 'valid-draft', linkedin: 'iVBOR123', instagram: 'iVBOR456' })
          } as Response;
        }
        if (url === '/api/content-studio?track=all') {
          return {
            ok: true,
            json: async () => ({
              success: true,
              results: {
                poster: { ok: true, data: { linkedin: 'iVBOR' } },
                captions: { ok: true, data: {} },
                video_script: { ok: true, data: {} },
                kb: { ok: true, data: {} }
              }
            })
          } as Response;
        }
        return { ok: false, json: async () => ({ error: 'Not found' }) } as Response;
      });

      const posterRes = await generatePoster('valid-draft');
      expect(posterRes.linkedin).toBe('iVBOR123');

      const allRes = await generateAll('valid-draft');
      expect(allRes.results.poster.ok).toBe(true);
    });
  });
});
