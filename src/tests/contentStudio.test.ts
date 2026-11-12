import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import contentStudioHandler from '../../api/content-studio.js';
import {
  processGenerateCaptions,
  processGenerateVideoScript,
  processGenerateKB,
  processGeneratePoster,
} from '../../api/_lib/studioProcessors.js';
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
          title: 'Architecting Nutanix NC2 on Azure Bare-Metal for VMware Workloads',
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

// Mock requireAdmin to pass in tests
vi.mock('../../api/_lib/requireAdmin.js', () => {
  return {
    default: vi.fn(async (req: any, res: any) => {
      const authHeader = req.headers?.authorization || req.headers?.Authorization;
      if (!authHeader || authHeader.includes('unauthorized')) {
        res.setHeader('Content-Type', 'application/json');
        res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
        return { authorized: false, status: 401 };
      }
      return { authorized: true, user: { email: 'congodb1@gmail.com' } };
    }),
    requireAdmin: vi.fn(async (req: any, res: any) => {
      const authHeader = req.headers?.authorization || req.headers?.Authorization;
      if (!authHeader || authHeader.includes('unauthorized')) {
        res.setHeader('Content-Type', 'application/json');
        res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid authentication token.' });
        return { authorized: false, status: 401 };
      }
      return { authorized: true, user: { email: 'congodb1@gmail.com' } };
    }),
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

    const sectionBlock = `
## TL;DR
- Complete migration path from on-prem VMware to Nutanix NC2 on Azure bare-metal.
- Zero-downtime cutover strategy utilizing Flow Overlay and ExpressRoute.
- Reduced TCO with DSF NVMe tiering and automated host scaling.

## Prerequisites
- [ ] Azure bare-metal quota confirmed
- [ ] ExpressRoute circuit >= 1 Gbps
- [ ] Prism Central 2023.x active
- [ ] AHV version validated against matrix

Estimated time: 2.5 hours | Risk level: Medium — test in non-prod first

## Contents
- [1. Architecture Overview](#1-architecture-overview)
- [2. Network Fabric](#2-network-fabric)
- [3. MTU & ExpressRoute Configuration](#3-mtu--expressroute-configuration)
- [4. Storage Tiering Strategy](#4-storage-tiering-strategy)
- [5. Step-by-Step Migration Execution](#5-step-by-step-migration-execution)
- [6. Validation Checklist](#6-validation-checklist)
- [7. Troubleshooting](#7-troubleshooting)
- [8. Next Steps](#8-next-steps)

## 1. Architecture Overview
Deploying Nutanix NC2 on Azure bare-metal provides native integration with Azure VNet while maintaining VMware VM compatibility.

\`\`\`
[On-Prem vSphere] ---> [ExpressRoute] ---> [Azure Bare-Metal NC2 (AHV)] ---> [Azure VNet / PaaS]
\`\`\`

## 2. Network Fabric
| Feature | Flow Overlay | Native VNet |
| --- | --- | --- |
| IP Preservation | Supported | Requires Subnet Mapping |
| Microsegmentation | Flow Security | Azure NSG |

## 3. MTU & ExpressRoute Configuration
1. Verify MTU 1500 for internet routes.
2. Enable MTU 9000 for ExpressRoute Jumbo Frames.
3. Test packet sizes with \`ping -f -l 8972\`.

## 4. Storage Tiering Strategy
| Workload | Recommended Tier | Notes |
| --- | --- | --- |
| OS Disks | DSF NVMe Tier | Low latency |
| Archives | Azure Blob Cold Tier | Cost optimized |

## 5. Step-by-Step Migration Execution
1. Provision NC2 Cluster in Azure portal.
2. Register AHV hosts with Prism Central.
3. Configure Flow VPC overlay subnets.
4. Execute test VM migration via Nutanix Move.
5. Perform cutover verification.

## 6. Validation Checklist
- [ ] Ping test between AHV host and Azure VM
- [ ] MTU 8972 byte payload verification
- [ ] DSF replication lag within threshold
- [ ] Failover test executed via Prism

## 7. Troubleshooting
| Symptom | Cause | Fix |
| --- | --- | --- |
| Packet Loss | MTU Mismatch | Set MTU 1500 on vNIC |
| Route Drop | BGP Down | Restart Route Server |

## 8. Next Steps
> Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing
`;

    const kbLongBody = sectionBlock + "\n\n" + "Enterprise cloud migration deep dive text paragraph. ".repeat(150);

    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    linkedin_caption: 'Architecting Nutanix NC2 on Azure Bare-Metal requires careful MTU matching and storage tiering. Here are 3 key technical insights for enterprise migration: 1. Maintain MTU parity across ExpressRoute. 2. Leverage Nutanix DSF NVMe tiering. 3. Automate cutovers with Prism. Book a free 30-min architecture briefing → https://zaboraa.com/briefing #Nutanix #Azure #VMware #NC2 #CloudMigration',
                    instagram_caption: 'Nutanix NC2 on Azure migration guide <= 150 chars',
                    instagram_hooks: [
                      'Most NC2 migrations fail due to MTU misconfiguration',
                      'The #1 mistake when migrating VMware to Nutanix NC2'
                    ],
                    youtube_title: 'Architecting Nutanix NC2 on Azure Bare-Metal',
                    youtube_description: 'Complete architecture guide for Nutanix NC2 on Azure bare-metal.',
                    youtube_chapters: [
                      '0:00 Hook',
                      '0:08 Topic Overview',
                      '0:20 Technical Strategy',
                      '0:32 Deep Dive',
                      '0:44 MTU & Cutover Validation',
                      '0:54 Briefing CTA'
                    ],
                    hashtags: ['#Nutanix', '#Azure', '#VMware', '#NC2', '#CloudMigration'],
                    briefing_cta: 'Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing',
                    hook: 'Most enterprise cloud migrations fail because of MTU misconfigurations.',
                    hook_options: [
                      'Most enterprise cloud migrations fail because of MTU misconfigurations.',
                      'The #1 mistake when migrating VMware to NC2...',
                      'After 25+ VMware-to-cloud cutovers, here is what changed...'
                    ],
                    script: {
                      hook: 'HOOK (5s): VMware sizing strategy for enterprise cloud.',
                      problem: 'PROBLEM (10s): Host RAM overcommit creates risk.',
                      point1: 'POINT 1 (8s): Calculate 20% headroom buffer.',
                      point2: 'POINT 2 (8s): Map storage policies correctly.',
                      point3: 'POINT 3 (9s): Execute 100% runbook-driven cutover.',
                      cta: 'Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing'
                    },
                    shot_list: [
                      { second_mark: '0-8s', action: 'Screen record: https://zaboraa.com/tools/sizing', on_screen_text: 'MTU Parity No Fragmentation', voiceover_hint: 'Verify MTU settings before cutover.' },
                      { second_mark: '8-20s', action: 'Text overlay on dark background', on_screen_text: 'Host Memory Sizing', voiceover_hint: 'Ensure headroom allocation.' },
                      { second_mark: '20-32s', action: 'Screen record: https://zaboraa.com', on_screen_text: 'NC2 VNet Integration', voiceover_hint: 'Configure Flow Overlay.' },
                      { second_mark: '32-44s', action: 'Text overlay: Storage Tiering', on_screen_text: 'DSF NVMe Tiering', voiceover_hint: 'Tier cold data to Blob.' },
                      { second_mark: '44-54s', action: 'Validation terminal', on_screen_text: 'Ping Payload Test', voiceover_hint: 'Test 8972 byte payload.' },
                      { second_mark: '54-60s', action: 'CTA Screen', on_screen_text: 'Book Briefing Now', voiceover_hint: 'Book 30-min briefing.' }
                    ],
                    b_roll_notes: [
                      'Architecture topology diagram showing ExpressRoute and VNet Flow overlay',
                      'Prism Central terminal showing AHV host memory allocation',
                      'Nutanix DSF storage tiering panel showing NVMe to Blob migration'
                    ],
                    duration_estimate: '60s',
                    slug: 'architecting-nutanix-nc2-azure-bare-metal',
                    meta_title: 'Architecting Nutanix NC2 on Azure Bare-Metal',
                    meta_description: 'Enterprise guide for Nutanix NC2 on Azure bare-metal migrations.',
                    outline: [{ h2: '1. Architecture Overview', summary: 'Overview' }],
                    body: kbLongBody,
                    frontmatter: 'meta_title: Architecting Nutanix NC2 on Azure',
                    full_markdown: kbLongBody
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
    process.env.GEMINI_API_KEY = 'mock-vertex-key';
  });

  describe('0. Poster Font & PNG Render Verification', () => {
    it('verifies TTF font files exist in repo for build embedding', () => {
      const regPath = path.join(process.cwd(), 'api', '_lib', 'fonts', 'DejaVuSans.ttf');
      const boldPath = path.join(process.cwd(), 'api', '_lib', 'fonts', 'DejaVuSans-Bold.ttf');
      expect(fs.existsSync(regPath)).toBe(true);
      expect(fs.existsSync(boldPath)).toBe(true);
      expect(fs.statSync(regPath).size).toBeGreaterThan(100000);
    });

    it('generates un-mocked Sharp PNG poster with correct metadata and size > 10KB', async () => {
      const res = await processGeneratePoster('valid-draft');
      expect(res.success).toBe(true);
      expect(res.linkedin).toBeDefined();
      expect(res.instagram).toBeDefined();

      const linkedinBuf = Buffer.from(res.linkedin, 'base64');
      const linkedinMeta = await sharp(linkedinBuf).metadata();
      expect(linkedinMeta.format).toBe('png');
      expect(linkedinMeta.width).toBe(1200);
      expect(linkedinMeta.height).toBe(627);
      expect(linkedinBuf.length).toBeGreaterThan(10000);

      const instaBuf = Buffer.from(res.instagram, 'base64');
      const instaMeta = await sharp(instaBuf).metadata();
      expect(instaMeta.format).toBe('png');
      expect(instaMeta.width).toBe(1080);
      expect(instaMeta.height).toBe(1080);
      expect(instaBuf.length).toBeGreaterThan(10000);
    });
  });

  describe('1. Enhanced Captions Track', () => {
    it('generates enhanced captions with linkedin_caption, instagram_hooks, youtube_chapters, hashtags', async () => {
      const res = await processGenerateCaptions('valid-draft');
      expect(res.success).toBe(true);
      expect(res.linkedin_caption.length).toBeGreaterThanOrEqual(100);
      expect(res.instagram_hooks.length).toBe(2);
      expect(res.youtube_chapters.length).toBeGreaterThanOrEqual(4);
      expect(res.hashtags.length).toBeGreaterThanOrEqual(5);
      expect(res.hashtags[0].startsWith('#')).toBe(true);
    });
  });

  describe('2. Enhanced Video Script Track', () => {
    it('generates structured video script with hook_options, sub-fields in shot_list, and b_roll_notes', async () => {
      const res = await processGenerateVideoScript('valid-draft');
      expect(res.success).toBe(true);
      expect(res.hook_options.length).toBe(3);
      expect(res.shot_list[0].on_screen_text).toBeDefined();
      expect(res.shot_list[0].voiceover_hint).toBeDefined();
      expect(res.b_roll_notes.length).toBe(3);
      expect(res.script.hook).toBeDefined();
      expect(res.script.cta).toContain('Running VMware on-prem or evaluating AVS?');
    });
  });

  describe('3. Enhanced Knowledge Base Track', () => {
    it('generates detailed Markdown KB article with required section headers and word count >= 900', async () => {
      const res = await processGenerateKB('valid-draft');
      expect(res.success).toBe(true);
      expect(res.body).toContain('## TL;DR');
      expect(res.body).toContain('## Prerequisites');
      expect(res.body).toContain('## Contents');
      expect(res.body).toContain('## 6. Validation Checklist');
      expect(res.body).toContain('## 7. Troubleshooting');

      const wordCount = res.body.split(/\s+/).filter(Boolean).length;
      expect(wordCount).toBeGreaterThanOrEqual(900);
    });
  });

  describe('4. Handler & Wrapper Integrations', () => {
    it('handles GET requests cleanly with 405 JSON', async () => {
      const req = { method: 'GET', query: {}, body: {} };
      let statusCode = 0;
      let jsonBody: any = null;
      const res = {
        setHeader: () => {},
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonBody = data; return res; }
      };

      await contentStudioHandler(req, res);
      expect(statusCode).toBe(405);
      expect(jsonBody.success).toBe(false);
    });
  });
});
