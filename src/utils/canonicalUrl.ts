/**
 * Canonical domain configuration and URL management utility for Zaboraa Technologies.
 * 
 * Canonical production domain: https://zaboraa.com
 */

export const CANONICAL_PRODUCTION_DOMAIN = 'https://zaboraa.com';

/**
 * Checks whether the specified or current hostname represents a local development
 * or ephemeral preview environment (such as Google Cloud Run preview, localhost,
 * or branch preview deployments).
 */
export function isDevelopmentOrPreviewHost(hostname?: string): boolean {
  if (typeof window === 'undefined' && !hostname) {
    return false;
  }
  const host = (hostname || (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();

  // Localhost / Loopback
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local')) {
    return true;
  }

  // Google Cloud Run / AI Studio Development & Preview URLs (*.run.app)
  if (host.endsWith('.run.app')) {
    return true;
  }

  // Vercel Preview Deployments (e.g. zaboraa-git-feature-*.vercel.app), excluding legacy production alias
  if (host.includes('-git-') && host.endsWith('.vercel.app')) {
    return true;
  }

  return false;
}

/**
 * Returns the active domain for canonical referencing and SEO tags.
 * In preview/development environments, returns the active window.location.origin.
 * In production (or when accessed via legacy aliases), strictly returns https://zaboraa.com.
 */
export function getCanonicalDomain(): string {
  if (typeof window === 'undefined') {
    return CANONICAL_PRODUCTION_DOMAIN;
  }

  const hostname = window.location.hostname;
  if (isDevelopmentOrPreviewHost(hostname)) {
    return window.location.origin;
  }

  return CANONICAL_PRODUCTION_DOMAIN;
}

/**
 * Constructs an absolute authentication redirect URL for Supabase OAuth callbacks,
 * email verification links, and password-reset recovery.
 *
 * - In preview/development environments: returns `${window.location.origin}${pathAndQuery}`
 * - In production environments: returns `${CANONICAL_PRODUCTION_DOMAIN}${pathAndQuery}`
 *
 * Preserves query strings, callback codes, and URL hash fragments (e.g., #reset-password).
 */
export function getAuthRedirectUrl(pathAndQuery: string = ''): string {
  const base = getCanonicalDomain();
  if (!pathAndQuery) {
    return base;
  }
  if (pathAndQuery.startsWith('#') || pathAndQuery.startsWith('?')) {
    return `${base}/${pathAndQuery}`;
  }
  const normalizedPath = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;

  return `${base}${normalizedPath}`;
}

/**
 * Enforces canonical domain redirect in production.
 * If a visitor or administrator accesses the site via the legacy production alias (zaboraa-12.vercel.app),
 * they are immediately redirected to the matching path on https://zaboraa.com using window.location.replace,
 * fully preserving pathname, query string parameters, and hash fragments.
 *
 * Does not interfere with local development (localhost) or preview environments (*.run.app).
 */
export function enforceCanonicalProductionDomain(): void {
  if (typeof window === 'undefined') return;

  const host = window.location.hostname.toLowerCase();

  // Redirect legacy production hosts to the canonical production domain
  if (host === 'zaboraa-12.vercel.app' || host === 'www.zaboraa-12.vercel.app') {
    const targetUrl = `${CANONICAL_PRODUCTION_DOMAIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
    console.warn(`[Zaboraa Canonical Router] Redirecting legacy production host (${host}) to canonical domain (${targetUrl})`);
    window.location.replace(targetUrl);
  }
}
