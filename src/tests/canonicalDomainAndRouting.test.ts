import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CANONICAL_PRODUCTION_DOMAIN,
  isDevelopmentOrPreviewHost,
  getCanonicalDomain,
  getAuthRedirectUrl,
  enforceCanonicalProductionDomain
} from '../utils/canonicalUrl';
import { adminService } from '../services/adminService';

describe('Canonical Domain & Auth Routing Suite', () => {
  beforeEach(() => {
    // Setup window mock in Node test runner
    (globalThis as any).window = {
      location: {
        hostname: 'zaboraa.com',
        origin: 'https://zaboraa.com',
        pathname: '/',
        search: '',
        hash: '',
        replace: vi.fn()
      }
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  describe('1. Environment & Host Identification', () => {
    it('correctly identifies local development environments as preview hosts', () => {
      expect(isDevelopmentOrPreviewHost('localhost')).toBe(true);
      expect(isDevelopmentOrPreviewHost('127.0.0.1')).toBe(true);
      expect(isDevelopmentOrPreviewHost('0.0.0.0')).toBe(true);
    });

    it('correctly identifies Google Cloud Run / AI Studio preview URLs as preview hosts', () => {
      expect(isDevelopmentOrPreviewHost('ais-dev-dlmjlad24aylsjtlaooboj-39607792701.asia-northeast1.run.app')).toBe(true);
      expect(isDevelopmentOrPreviewHost('ais-pre-xyz.us-central1.run.app')).toBe(true);
    });

    it('correctly identifies Vercel branch preview URLs as preview hosts', () => {
      expect(isDevelopmentOrPreviewHost('zaboraa-git-feature-oauth-org.vercel.app')).toBe(true);
    });

    it('classifies production domain and legacy production aliases as non-preview hosts', () => {
      expect(isDevelopmentOrPreviewHost('zaboraa.com')).toBe(false);
      expect(isDevelopmentOrPreviewHost('www.zaboraa.com')).toBe(false);
      expect(isDevelopmentOrPreviewHost('zaboraa-12.vercel.app')).toBe(false);
    });
  });

  describe('2. Canonical Domain & Auth Redirect URL Generation', () => {
    it('returns CANONICAL_PRODUCTION_DOMAIN when on production host', () => {
      (globalThis as any).window.location = {
        hostname: 'zaboraa.com',
        origin: 'https://zaboraa.com',
        pathname: '/',
        search: '',
        hash: '',
        replace: vi.fn()
      };

      expect(getCanonicalDomain()).toBe('https://zaboraa.com');
      expect(getAuthRedirectUrl()).toBe('https://zaboraa.com');
      expect(getAuthRedirectUrl('#reset-password')).toBe('https://zaboraa.com/#reset-password');
      expect(getAuthRedirectUrl('/admin')).toBe('https://zaboraa.com/admin');
    });

    it('returns preview origin when running in preview/dev environment to support local testing', () => {
      (globalThis as any).window.location = {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
        pathname: '/tools',
        search: '',
        hash: '',
        replace: vi.fn()
      };

      expect(getCanonicalDomain()).toBe('http://localhost:3000');
      expect(getAuthRedirectUrl()).toBe('http://localhost:3000');
      expect(getAuthRedirectUrl('#reset-password')).toBe('http://localhost:3000/#reset-password');
    });

    it('preserves query parameters and callbacks when constructing redirect URLs', () => {
      (globalThis as any).window.location = {
        hostname: 'zaboraa.com',
        origin: 'https://zaboraa.com',
        pathname: '/',
        search: '',
        hash: '',
        replace: vi.fn()
      };

      expect(getAuthRedirectUrl('?source=briefing&tier=enterprise')).toBe('https://zaboraa.com/?source=briefing&tier=enterprise');
      expect(getAuthRedirectUrl('/auth/callback?code=12345')).toBe('https://zaboraa.com/auth/callback?code=12345');
    });
  });

  describe('3. Legacy Production Host Canonical Redirection', () => {
    it('redirects zaboraa-12.vercel.app to https://zaboraa.com while preserving path, query, and hash', () => {
      const replaceSpy = vi.fn();
      (globalThis as any).window.location = {
        hostname: 'zaboraa-12.vercel.app',
        origin: 'https://zaboraa-12.vercel.app',
        pathname: '/tools/sizing',
        search: '?cluster=avs&vms=200',
        hash: '#overview',
        replace: replaceSpy
      };

      enforceCanonicalProductionDomain();

      expect(replaceSpy).toHaveBeenCalledWith(
        'https://zaboraa.com/tools/sizing?cluster=avs&vms=200#overview'
      );
    });

    it('does not trigger a redirect when already on zaboraa.com', () => {
      const replaceSpy = vi.fn();
      (globalThis as any).window.location = {
        hostname: 'zaboraa.com',
        origin: 'https://zaboraa.com',
        pathname: '/admin',
        search: '',
        hash: '',
        replace: replaceSpy
      };

      enforceCanonicalProductionDomain();

      expect(replaceSpy).not.toHaveBeenCalled();
    });

    it('does not trigger a redirect in preview/localhost environments', () => {
      const replaceSpy = vi.fn();
      (globalThis as any).window.location = {
        hostname: 'localhost',
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        replace: replaceSpy
      };

      enforceCanonicalProductionDomain();

      expect(replaceSpy).not.toHaveBeenCalled();
    });
  });

  describe('4. Administrative Service & SEO Canonical Registries', () => {
    it('adminService.getSeoMetadata uses canonical production domain', async () => {
      const pages = await adminService.getSeoMetadata();
      for (const page of pages) {
        expect(page.canonical_url).toContain('https://zaboraa.com');
        expect(page.canonical_url).not.toContain('vercel.app');
        expect(page.og_image_url).toContain('https://zaboraa.com');
        expect(page.og_image_url).not.toContain('vercel.app');
      }
    });

    it('adminService.generateSitemapXml builds valid sitemap with canonical domain', async () => {
      (globalThis as any).window.location = {
        hostname: 'zaboraa.com',
        origin: 'https://zaboraa.com'
      };

      const pages = await adminService.getSeoMetadata();
      const sitemap = adminService.generateSitemapXml(pages);

      expect(sitemap).toContain('<loc>https://zaboraa.com</loc>');
      expect(sitemap).toContain('<loc>https://zaboraa.com/tools</loc>');
      expect(sitemap).not.toContain('vercel.app');
    });

    it('adminService.generateRobotsTxt outputs canonical sitemap declaration', () => {
      (globalThis as any).window.location = {
        hostname: 'zaboraa.com',
        origin: 'https://zaboraa.com'
      };

      const robots = adminService.generateRobotsTxt();
      expect(robots).toContain('Sitemap: https://zaboraa.com/sitemap.xml');
      expect(robots).not.toContain('vercel.app');
    });
  });
});
