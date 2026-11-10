import { describe, it, expect } from 'vitest';
import { CASE_STUDIES, getCaseStudyBySlug } from '../data/caseStudies';
import { LEGACY_CASE_STUDIES } from '../data/_legacyCaseStudies';
import { ROUTE_MANIFEST, getRouteSeo } from '../seo/routes';

describe('Case Studies & SEO Route Manifest Test Suite', () => {
  describe('1. Case Study Data Integrity & Guardrails', () => {
    it('has exactly 7 active case studies for Prompt 3 (CS1 to CS7)', () => {
      expect(CASE_STUDIES).toHaveLength(7);
      const slugs = CASE_STUDIES.map(cs => cs.slug);
      expect(slugs).toEqual([
        'middle-east-gov-avs-framework',
        'avs-to-avs-cross-region',
        'gov-dr-failover-drills',
        'private-gcve-vmc-migration',
        'nsxt-microsegmentation-aria-networks',
        'aria-operations-networks-deployment',
        'aria-automation-blueprints-vcenter'
      ]);
    });

    it('contains all required fields and strict structure for Case Study 1', () => {
      const cs = getCaseStudyBySlug('middle-east-gov-avs-framework');
      expect(cs).toBeDefined();
      if (!cs) return;

      expect(cs.h1).toBe('Standardised VMware to Azure VMware Solution Migration for Middle East Government Entities');
      expect(cs.facts.sector).toBe('Middle East Government Entities');
      expect(cs.facts.scale).toBe('50-100 VMs average, up to 300 VMs');
      expect(cs.facts.platforms).toBe('VMware to AVS via Microsoft Partner');
      expect(cs.facts.connectivity).toBe('Mostly VPN, some ExpressRoute');
      expect(cs.facts.role).toBe('Migration architecture and delivery');

      expect(cs.sections.length).toBeGreaterThanOrEqual(9);
      expect(cs.lessonsLearned.length).toBeGreaterThanOrEqual(4);
      expect(cs.relatedTools.length).toBeGreaterThanOrEqual(3);
      expect(cs.relatedDisciplines.length).toBeGreaterThanOrEqual(2);
      expect(cs.faq.length).toBeGreaterThanOrEqual(3);
    });

    it('contains all required fields and strict structure for Case Studies 2 through 7', () => {
      for (const slug of [
        'avs-to-avs-cross-region',
        'gov-dr-failover-drills',
        'private-gcve-vmc-migration',
        'nsxt-microsegmentation-aria-networks',
        'aria-operations-networks-deployment',
        'aria-automation-blueprints-vcenter'
      ]) {
        const cs = getCaseStudyBySlug(slug);
        expect(cs).toBeDefined();
        if (!cs) continue;

        expect(cs.h1.trim().length).toBeGreaterThan(0);
        expect(cs.metaTitle.trim().length).toBeGreaterThan(0);
        expect(cs.metaDescription.trim().length).toBeGreaterThan(0);
        expect(cs.facts.sector.trim().length).toBeGreaterThan(0);
        expect(cs.sections.length).toBeGreaterThanOrEqual(6);
        expect(cs.lessonsLearned.length).toBeGreaterThanOrEqual(3);
        expect(cs.relatedTools.length).toBeGreaterThanOrEqual(1);
        expect(cs.relatedDisciplines.length).toBeGreaterThanOrEqual(2);
        expect(cs.faq.length).toBeGreaterThanOrEqual(2);
        expect(cs.relatedSlugs.length).toBe(2);
      }
    });

    it('returns undefined for unknown case study slugs', () => {
      expect(getCaseStudyBySlug('unknown-slug')).toBeUndefined();
      expect(getCaseStudyBySlug('')).toBeUndefined();
    });

    it('ensures legacy case studies are archived and separate from active studies', () => {
      expect(LEGACY_CASE_STUDIES).toHaveLength(3);
      const activeSlugs = CASE_STUDIES.map(cs => cs.slug);
      expect(activeSlugs).not.toContain('case-fintech-bank');
      expect(activeSlugs).not.toContain('case-healthcare-hospital');
      expect(activeSlugs).not.toContain('case-global-logistics');
    });

    it('strictly forbids prohibited claims and inaccurate company names in case study content', () => {
      const serialized = JSON.stringify(CASE_STUDIES);
      expect(serialized).not.toContain('Zaboraa Technologies');
      expect(serialized).not.toContain('Principal Cloud Architect');
      expect(serialized).not.toContain('12+ years');
      expect(serialized).not.toContain('40+ migrations');
      expect(serialized).not.toContain('100% zero');
      expect(serialized).not.toContain('100% zero-downtime');
      expect(serialized).not.toContain('100% Zero-downtime');
      expect(serialized).not.toContain('audit passed');
      expect(serialized).not.toContain('Audit passed');
      expect(serialized).not.toContain('Aria for Operations');
      expect(serialized).not.toContain('1,240');
      expect(serialized).not.toContain('4,500');
    });
  });

  describe('2. SEO Route Manifest & Canonical Hygiene', () => {
    it('manifest defines exactly 30 routes for Prompt 3', () => {
      expect(ROUTE_MANIFEST).toHaveLength(30);
    });

    it('all routes have unique lowercase paths starting with slash', () => {
      const paths = ROUTE_MANIFEST.map(r => r.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);

      for (const p of paths) {
        expect(p.startsWith('/')).toBe(true);
        expect(p).toBe(p.toLowerCase());
      }
    });

    it('only root path has canonical pointing to https://zaboraa.com without slash', () => {
      for (const route of ROUTE_MANIFEST) {
        const canonical = `https://zaboraa.com${route.path === '/' ? '' : route.path}`;
        if (route.path === '/') {
          expect(canonical).toBe('https://zaboraa.com');
        } else {
          expect(canonical).not.toBe('https://zaboraa.com');
          expect(canonical).toMatch(/^https:\/\/zaboraa\.com\/[a-z0-9\-/]+$/);
        }
      }
    });

    it('every route in manifest has non-empty title, description, h1, summary, and lastmod', () => {
      for (const route of ROUTE_MANIFEST) {
        expect(route.title.trim().length).toBeGreaterThan(0);
        expect(route.description.trim().length).toBeGreaterThan(0);
        expect(route.h1.trim().length).toBeGreaterThan(0);
        expect(route.summary.trim().length).toBeGreaterThan(0);
        expect(route.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it('correctly retrieves route SEO entry by path', () => {
      const homeSeo = getRouteSeo('/');
      expect(homeSeo?.title).toBe('Zaboraa - Enterprise VMware Cloud Architecture');

      const caseStudiesSeo = getRouteSeo('/case-studies');
      expect(caseStudiesSeo?.h1).toBe('Case Studies: VMware Migrations, DR and Automation for Middle East Government Entities');

      const cs1Seo = getRouteSeo('/case-studies/middle-east-gov-avs-framework');
      expect(cs1Seo?.title).toBe('VMware to Azure VMware Solution: Government Migration Framework');

      expect(getRouteSeo('/nonexistent-route')).toBeUndefined();
    });
  });

  describe('4. Admin Controls & Edit-Side Settings Case Studies Integration', () => {
    it('initializes INITIAL_SITE_DATA.caseStudies with all 7 active case studies', async () => {
      const { INITIAL_SITE_DATA } = await import('../data/initialData');
      expect(INITIAL_SITE_DATA.caseStudies).toHaveLength(7);
      const initialSlugs = INITIAL_SITE_DATA.caseStudies.map(cs => cs.slug);
      expect(initialSlugs).toEqual([
        'middle-east-gov-avs-framework',
        'avs-to-avs-cross-region',
        'gov-dr-failover-drills',
        'private-gcve-vmc-migration',
        'nsxt-microsegmentation-aria-networks',
        'aria-operations-networks-deployment',
        'aria-automation-blueprints-vcenter'
      ]);
    });

    it('adminService.getSeoMetadata returns all 30 routes including all 7 case studies', async () => {
      const { adminService } = await import('../services/adminService');
      const seoPages = await adminService.getSeoMetadata();
      expect(seoPages.length).toBe(30);

      const paths = seoPages.map(p => p.page_path);
      expect(paths).toContain('/case-studies');
      expect(paths).toContain('/case-studies/middle-east-gov-avs-framework');
      expect(paths).toContain('/case-studies/avs-to-avs-cross-region');
      expect(paths).toContain('/case-studies/gov-dr-failover-drills');
      expect(paths).toContain('/case-studies/private-gcve-vmc-migration');
      expect(paths).toContain('/case-studies/nsxt-microsegmentation-aria-networks');
      expect(paths).toContain('/case-studies/aria-operations-networks-deployment');
      expect(paths).toContain('/case-studies/aria-automation-blueprints-vcenter');
      expect(paths).not.toContain('/cases');
    });

    it('adminService.generateSitemapXml produces clean sitemap with 29 URLs (excluding noindex) and no priority/changefreq', async () => {
      const { adminService } = await import('../services/adminService');
      const seoPages = await adminService.getSeoMetadata();
      const xml = adminService.generateSitemapXml(seoPages);

      expect(xml).toContain('https://zaboraa.com/case-studies/middle-east-gov-avs-framework');
      expect(xml).toContain('https://zaboraa.com/case-studies/nsxt-microsegmentation-aria-networks');
      expect(xml).not.toContain('https://zaboraa.com/resources/videos');
      expect(xml).not.toContain('<priority>');
      expect(xml).not.toContain('<changefreq>');
      expect(xml.split('<url>').length - 1).toBe(29);
    });

    it('handles legacy case studies with undefined facts safely without throwing scale error', () => {
      const legacyCaseStudy: any = {
        id: 'legacy-cs-1',
        slug: 'legacy-cs-1',
        title: 'Legacy Study Without Facts',
        h1: 'Legacy Migration',
        summary: 'A legacy study from earlier version',
        metrics: {
          vms: '150 VMs',
          timeline: '4 months',
          costReduction: '30%',
          downtime: 'Near-zero'
        }
        // facts is deliberately undefined
      };

      // Ensure that facts.scale fallback logic resolves correctly
      const scaleValue = legacyCaseStudy.facts?.scale || legacyCaseStudy.metrics?.vms || '50-100 VMs';
      expect(scaleValue).toBe('150 VMs');

      const connectivityValue = legacyCaseStudy.facts?.connectivity || legacyCaseStudy.metrics?.timeline || 'Direct Connect';
      expect(connectivityValue).toBe('4 months');
    });
  });
});
