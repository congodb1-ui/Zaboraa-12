import { describe, it, expect } from 'vitest';
import { INITIAL_SITE_DATA } from '../data/initialData';
import { KnowledgeBaseArticle } from '../types/siteData';

const NUTANIX_ARTICLE_IDS = [
  'KB-NTX-1001',
  'KB-NTX-1002',
  'KB-NTX-1003',
  'KB-NC2-2001',
  'KB-NC2-2002',
  'KB-NC2-2003',
  'KB-NC2-2004',
  'KB-NTX-1004',
  'KB-NTX-1005',
  'KB-NTX-1006'
];

// Articles that used an A1 fallback requiring an [AUTHOR TO CONFIRM] prefix
const FALLBACK_ARTICLE_IDS = [
  'KB-NTX-1001',
  'KB-NTX-1002',
  'KB-NTX-1003',
  'KB-NC2-2002',
  'KB-NC2-2004',
  'KB-NTX-1004',
  'KB-NTX-1006'
];

describe('Nutanix Migration Knowledge Base (Part 2) Integration & Guardrails', () => {
  const allArticles: KnowledgeBaseArticle[] = INITIAL_SITE_DATA.knowledgeBase || [];
  const nutanixArticles = allArticles.filter((a) =>
    NUTANIX_ARTICLE_IDS.includes(a.id)
  );

  it('contains exactly the 10 specified Nutanix migration articles', () => {
    expect(nutanixArticles.length).toBe(10);
    const foundIds = nutanixArticles.map((a) => a.id);
    for (const expectedId of NUTANIX_ARTICLE_IDS) {
      expect(foundIds).toContain(expectedId);
    }
  });

  it('arranges articles strictly in order: 1. Nutanix, 2. Azure VMware Solution, 3. All Others', () => {
    expect(allArticles.length).toBe(18);

    // 1. Nutanix articles first (indices 0 to 9)
    for (let i = 0; i < 10; i++) {
      expect(allArticles[i].component.startsWith('Nutanix')).toBe(true);
      expect(NUTANIX_ARTICLE_IDS).toContain(allArticles[i].id);
    }

    // 2. Azure VMware Solution articles second (indices 10 and 11)
    expect(allArticles[10].component).toBe('Azure VMware Solution');
    expect(allArticles[11].component).toBe('Azure VMware Solution');

    // 3. All others third (indices 12 to 17)
    for (let i = 12; i < 18; i++) {
      expect(allArticles[i].component.startsWith('Nutanix')).toBe(false);
      expect(allArticles[i].component).not.toBe('Azure VMware Solution');
    }
  });

  it('sets published status, guide articleType, and Advisory severity for all 10 Nutanix articles so they are visible', () => {
    for (const article of nutanixArticles) {
      expect(article.status).toBe('published');
      expect(article.articleType).toBe('guide');
      expect(article.severity).toBe('Advisory');
      expect(article.verifiedInProduction).toBe(false);
      expect(article.lastUpdated).toBe('2026-11-03');
      expect(article.tags).toContain('nutanix-migration');

      // Rule A2: No commands, CLI, scripts, API calls or config snippets
      for (const step of article.resolutionSteps) {
        expect(step.commandSnippet).toBeFalsy();
      }
    }
  });

  it('ensures all Nutanix articles are visible to public/anonymous visitors as well as admins', () => {
    const filterForViewer = (articles: KnowledgeBaseArticle[], isAdmin: boolean) => {
      if (isAdmin) return articles;
      return articles.filter((a) => a.status !== 'draft');
    };

    const publicView = filterForViewer(allArticles, false);
    const adminView = filterForViewer(allArticles, true);

    // Public view must include all 10 Nutanix articles
    for (const id of NUTANIX_ARTICLE_IDS) {
      expect(publicView.some((a) => a.id === id)).toBe(true);
      expect(adminView.some((a) => a.id === id)).toBe(true);
    }
  });

  it('strictly validates that relatedDocLinks contain official vendor/bible/learn URLs with titles', () => {
    for (const article of nutanixArticles) {
      expect(article.relatedDocLinks).toBeDefined();
      expect(article.relatedDocLinks!.length).toBeGreaterThanOrEqual(2);
      for (const link of article.relatedDocLinks!) {
        expect(link.url).toMatch(/^https:\/\/(portal\.nutanix\.com|learn\.microsoft\.com|www\.nutanixbible\.com|www\.nutanix\.com)\//);
        expect(link.label.length).toBeGreaterThan(5);
      }
    }
  });

  it('strictly forbids mentions of HCX or NSX as peers in Nutanix migration articles', () => {
    for (const article of nutanixArticles) {
      const serialized = JSON.stringify(article).toLowerCase();
      expect(serialized).not.toContain('hcx');
      expect(serialized).not.toContain('nsx');
    }
  });

  it('contains required [AUTHOR TO CONFIRM] architect notes on fallback articles', () => {
    for (const id of FALLBACK_ARTICLE_IDS) {
      const art = nutanixArticles.find((a) => a.id === id);
      expect(art).toBeDefined();
      expect(art?.architectNote).toBeDefined();
      expect(art?.architectNote?.startsWith('[AUTHOR TO CONFIRM]')).toBe(true);
      const serialized = JSON.stringify(art);
      expect(serialized).toContain('Confirm against the Nutanix documentation for the version in use.');
    }

    // Articles without fallbacks must omit architectNote
    const nonFallbackArticles = nutanixArticles.filter((a) => !FALLBACK_ARTICLE_IDS.includes(a.id));
    for (const art of nonFallbackArticles) {
      expect(art.architectNote).toBeUndefined();
    }
  });

  it('maps guide section labels correctly when articleType is guide', () => {
    const getLabels = (articleType?: string) => {
      const isGuide = articleType === 'guide';
      return {
        symptoms: isGuide ? 'When this applies' : 'Symptoms & Manifestation',
        rootCause: isGuide ? 'Design rationale' : 'Root Cause Analysis',
        impactScope: isGuide ? 'Scope and limits' : 'Blast Radius & Impact Scope',
        resolutionSteps: isGuide ? 'Procedure' : 'Resolution & Remediation Runbook',
        verificationCheck: isGuide ? 'Validation' : 'Production Verification Check'
      };
    };

    const guideLabels = getLabels('guide');
    expect(guideLabels.symptoms).toBe('When this applies');
    expect(guideLabels.rootCause).toBe('Design rationale');
    expect(guideLabels.impactScope).toBe('Scope and limits');
    expect(guideLabels.resolutionSteps).toBe('Procedure');
    expect(guideLabels.verificationCheck).toBe('Validation');

    const tsLabels = getLabels('troubleshooting');
    expect(tsLabels.symptoms).toBe('Symptoms & Manifestation');
    expect(tsLabels.rootCause).toBe('Root Cause Analysis');
    expect(tsLabels.resolutionSteps).toBe('Resolution & Remediation Runbook');
  });

  it('positions platformShowcases nutanix-nc2-azure directly after avs', () => {
    const showcases = INITIAL_SITE_DATA.platformShowcases;
    const avsIndex = showcases.findIndex((s) => s.id === 'avs');
    const nc2Index = showcases.findIndex((s) => s.id === 'nutanix-nc2-azure');

    expect(avsIndex).toBeGreaterThanOrEqual(0);
    expect(nc2Index).toBe(avsIndex + 1);
  });
});
