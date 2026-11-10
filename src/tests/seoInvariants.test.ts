import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ROUTE_MANIFEST } from '../seo/routes';

describe('SEO Invariants & Regression Test Suite (P2-11)', () => {
  it('every manifest route has a unique title', () => {
    const titles = ROUTE_MANIFEST.map((r) => r.title.trim());
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  it('every manifest route has a unique description', () => {
    const descriptions = ROUTE_MANIFEST.map((r) => r.description.trim());
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(descriptions.length);
  });

  it('every manifest route title length is <= 60 characters', () => {
    for (const route of ROUTE_MANIFEST) {
      expect(
        route.title.length,
        `Route ${route.path} title exceeds 60 chars ("${route.title}", len: ${route.title.length})`
      ).toBeLessThanOrEqual(60);
    }
  });

  it('every manifest route description length is between 110 and 160 characters (inclusive)', () => {
    for (const route of ROUTE_MANIFEST) {
      expect(
        route.description.length,
        `Route ${route.path} description length ${route.description.length} not in [110, 160] ("${route.description}")`
      ).toBeGreaterThanOrEqual(110);
      expect(
        route.description.length,
        `Route ${route.path} description length ${route.description.length} not in [110, 160] ("${route.description}")`
      ).toBeLessThanOrEqual(160);
    }
  });

  it('every manifest route has a non-empty h1', () => {
    for (const route of ROUTE_MANIFEST) {
      expect(route.h1).toBeDefined();
      expect(route.h1.trim().length, `Route ${route.path} has empty h1`).toBeGreaterThan(0);
    }
  });

  it('every manifest route path starts with / and adheres to canonical format without trailing slash', () => {
    for (const route of ROUTE_MANIFEST) {
      expect(route.path.startsWith('/')).toBe(true);
      if (route.path !== '/') {
        expect(route.path.endsWith('/')).toBe(false);
      }
      const canonical = `https://zaboraa.com${route.path === '/' ? '' : route.path}`;
      expect(canonical).toMatch(/^https:\/\/zaboraa\.com(\/[a-z0-9\-_]+)*$/);
    }
  });

  it('sitemap.xml contains exactly the manifest routes minus noindex entries', () => {
    const sitemapPath = path.resolve('public/sitemap.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    const indexableRoutes = ROUTE_MANIFEST.filter((r) => !r.noindex);

    // Verify each indexable route is in sitemap.xml
    for (const route of indexableRoutes) {
      const canonical = `https://zaboraa.com${route.path === '/' ? '' : route.path}`;
      expect(
        sitemapContent.includes(`<loc>${canonical}</loc>`),
        `Sitemap missing loc: ${canonical}`
      ).toBe(true);
    }

    // Verify noindex routes are excluded from sitemap.xml
    const noindexRoutes = ROUTE_MANIFEST.filter((r) => r.noindex);
    for (const route of noindexRoutes) {
      const canonical = `https://zaboraa.com${route.path === '/' ? '' : route.path}`;
      expect(
        sitemapContent.includes(`<loc>${canonical}</loc>`),
        `Sitemap should not include noindex route: ${canonical}`
      ).toBe(false);
    }

    // Count <loc> entries in sitemap
    const locMatches = sitemapContent.match(/<loc>/g) || [];
    expect(locMatches.length).toBe(indexableRoutes.length);
  });

  it('every case-study, tool, and discipline URL appears in public/llms.txt', () => {
    const llmsPath = path.resolve('public/llms.txt');
    expect(fs.existsSync(llmsPath)).toBe(true);

    const llmsContent = fs.readFileSync(llmsPath, 'utf-8');

    const targetedRoutes = ROUTE_MANIFEST.filter(
      (r) =>
        !r.noindex &&
        (r.path.startsWith('/case-studies/') ||
          r.path.startsWith('/tools/') ||
          r.path.startsWith('/disciplines/'))
    );

    for (const route of targetedRoutes) {
      const fullUrl = `https://zaboraa.com${route.path}`;
      expect(
        llmsContent.includes(fullUrl),
        `llms.txt missing link to ${fullUrl}`
      ).toBe(true);
    }
  });

  it('zero retired claim strings (§19.2b) exist in core SEO/content files', () => {
    const targetFiles = [
      'src/seo/routes.ts',
      'public/llms.txt',
      'index.html',
      'src/data/initialData.ts',
      'scripts/prerender.mjs'
    ];

    const retiredPatterns: { name: string; regex: RegExp }[] = [
      { name: '12+ years experience', regex: /\b12\+\s*years\b/i },
      { name: '40+ migrations', regex: /\b40\+\s*migrations\b/i },
      { name: '8x certifications/disciplines metric', regex: /\b8[x×]\b(?!\d)/i },
      { name: 'Principal Cloud Architect title', regex: /Principal Cloud Architect/i },
      { name: 'Zaboraa Technologies brand name', regex: /Zaboraa Technologies/i },
      { name: '100% Zero-Downtime claim', regex: /100%\s*Zero-Downtime/i },
      { name: 'Legacy outcome 1,240 VMs', regex: /1[,.]?240\s*(?:VMs?|virtual machines?)/i },
      { name: 'Legacy outcome 4,500 VMs', regex: /4[,.]?500\s*(?:VMs?|virtual machines?)/i },
      { name: 'Legacy outcome 820 VMs', regex: /820\s*(?:VMs?|virtual machines?)/i },
      { name: 'Legacy outcome $1.4M', regex: /\$1\.4\s*M(?:illion)?/i },
      { name: 'Legacy outcome 38% TCO', regex: /38%\s*TCO/i },
      { name: 'Legacy outcome 24% Capex', regex: /24%\s*Capex/i }
    ];

    for (const relPath of targetFiles) {
      const fullPath = path.resolve(relPath);
      expect(fs.existsSync(fullPath), `Target file ${relPath} must exist`).toBe(true);

      const content = fs.readFileSync(fullPath, 'utf-8');

      for (const pattern of retiredPatterns) {
        const match = content.match(pattern.regex);
        expect(
          match,
          `File ${relPath} contains retired claim "${pattern.name}": "${match ? match[0] : ''}"`
        ).toBeNull();
      }
    }
  });
});
