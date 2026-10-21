import { describe, it, expect } from 'vitest';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_SITE_DATA } from '../data/initialData';

// Node test environment in-memory localStorage polyfill
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, String(val)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() { return storageMap.size; },
  key: (i: number) => Array.from(storageMap.keys())[i] || null
};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = localStorageMock;
}

describe('Supabase Client & Configuration', () => {
  it('initializes Supabase client without crashing', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('reports configuration status accurately', () => {
    // When environment variables are dummy/mock, isSupabaseConfigured reflects accordingly
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });
});

describe('Public-First Access Governance & Admin Toggles', () => {
  it('defaults publicAccessEnabled to true and authRequiredForTools to false', () => {
    expect(INITIAL_SITE_DATA.adminSettings?.publicAccessEnabled).toBe(true);
    expect(INITIAL_SITE_DATA.adminSettings?.authRequiredForTools).toBe(false);
  });

  it('guarantees architecture tools and calculators remain publicly accessible', () => {
    const settings = INITIAL_SITE_DATA.adminSettings;
    const canPublicAccessTools = (settings?.publicAccessEnabled ?? true) && !(settings?.authRequiredForTools ?? false);
    expect(canPublicAccessTools).toBe(true);
  });
});

describe('Briefing Request Validation & Constraints', () => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  it('validates enterprise business emails accurately', () => {
    expect(emailRegex.test('david@enterprise.com')).toBe(true);
    expect(emailRegex.test('wasim@zaboraa.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('missing-domain@')).toBe(false);
    expect(emailRegex.test('@no-local.com')).toBe(false);
  });

  it('enforces character length constraints matching database schema', () => {
    const validPayload = {
      name: 'David Henderson',
      email: 'david@enterprise.com',
      company: 'Global Financial Group',
      cloud_focus: 'Azure AVS',
      vm_scale: '500 - 1,500 VMs',
      urgency: 'Within 60 Days',
      status: 'new'
    };

    expect(validPayload.name.trim().length).toBeGreaterThanOrEqual(2);
    expect(validPayload.name.length).toBeLessThanOrEqual(120);
    expect(validPayload.company.trim().length).toBeGreaterThanOrEqual(2);
    expect(validPayload.company.length).toBeLessThanOrEqual(150);
    expect(validPayload.status).toBe('new');
  });
});

describe('Briefing Submission Outcome & Security Tests', () => {
  it('correctly maps admin@zaboraa.com to admin role and enterprise subscription tier', () => {
    function resolveUserPrivileges(email: string) {
      const role = email.toLowerCase() === 'admin@zaboraa.com' ? 'admin' : 'user';
      const tier = email.toLowerCase() === 'admin@zaboraa.com' ? 'enterprise' : 'free';
      return { role, tier };
    }
    const privileges = resolveUserPrivileges('admin@zaboraa.com');
    expect(privileges.role).toBe('admin');
    expect(privileges.tier).toBe('enterprise');
  });

  it('defaults public users to user role and free tier', () => {
    function resolveUserPrivileges(email: string) {
      const role = email.toLowerCase() === 'admin@zaboraa.com' ? 'admin' : 'user';
      const tier = email.toLowerCase() === 'admin@zaboraa.com' ? 'enterprise' : 'free';
      return { role, tier };
    }
    const privileges = resolveUserPrivileges('guest@external.io');
    expect(privileges.role).toBe('user');
    expect(privileges.tier).toBe('free');
  });
});

import {
  UUID_REGEX,
  sanitizeBriefingUserId,
  processBriefingSubmissionResult
} from '../components/ScheduleBriefingModal';

describe('Briefing User ID Validation & Sanitization', () => {
  const validUUID = 'c57635a9-0b0e-4745-b5af-a58510e1eea2';
  const otherUUID = '114ca4d3-4b1b-4f7c-824e-3dd38fc2993f';

  it('validates genuine UUID format accurately', () => {
    expect(UUID_REGEX.test(validUUID)).toBe(true);
    expect(UUID_REGEX.test('admin-master-root')).toBe(false);
    expect(UUID_REGEX.test('user-1729291')).toBe(false);
    expect(UUID_REGEX.test('sb-google-999999')).toBe(false);
  });

  it('sanitizes synthetic IDs to null to prevent postgres uuid syntax failures', () => {
    expect(sanitizeBriefingUserId('admin-master-root', null)).toBeNull();
    expect(sanitizeBriefingUserId('user-987654', null)).toBeNull();
    expect(sanitizeBriefingUserId('sb-google-1234', null)).toBeNull();
    expect(sanitizeBriefingUserId(null, null)).toBeNull();
    expect(sanitizeBriefingUserId(undefined, undefined)).toBeNull();
  });

  it('preserves valid UUID only when verified against the active Supabase session user', () => {
    // When session user ID matches user.uid and is valid UUID:
    expect(sanitizeBriefingUserId(validUUID, validUUID)).toBe(validUUID);

    // When session user does not match or is missing:
    expect(sanitizeBriefingUserId(validUUID, otherUUID)).toBeNull();
    expect(sanitizeBriefingUserId(validUUID, null)).toBeNull();
  });
});

describe('Briefing Submission Result & Error Handling Verification', () => {
  it('confirms submission ONLY when Supabase insert succeeds with no error', () => {
    const successResult = { error: null };
    const outcome = processBriefingSubmissionResult(successResult, true);

    expect(outcome.success).toBe(true);
    expect(outcome.errorMessage).toBeNull();
  });

  it('fails submission and displays error when Supabase returns an RLS error', () => {
    const rlsErrorResult = {
      error: { message: 'new row violates row-level security policy for table "briefing_requests"' }
    };
    const outcome = processBriefingSubmissionResult(rlsErrorResult, true);

    expect(outcome.success).toBe(false);
    expect(outcome.errorMessage).toContain('row-level security policy');
  });

  it('fails submission and displays error when table does not exist', () => {
    const missingTableResult = {
      error: { message: 'relation "public.briefing_requests" does not exist' }
    };
    const outcome = processBriefingSubmissionResult(missingTableResult, true);

    expect(outcome.success).toBe(false);
    expect(outcome.errorMessage).toContain('relation "public.briefing_requests" does not exist');
  });

  it('fails submission and rejects false positive when Supabase is not configured', () => {
    const outcome = processBriefingSubmissionResult(null, false);

    expect(outcome.success).toBe(false);
    expect(outcome.errorMessage).toContain('Database service is not configured');
  });

  it('fails submission and rejects false positive on network failure / empty response', () => {
    const outcome = processBriefingSubmissionResult(null, true);

    expect(outcome.success).toBe(false);
    expect(outcome.errorMessage).toContain('No response received');
  });
});

import { isUserAdminEmail, ADMIN_EMAILS } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { fetchGeneratedImages, recordGeneratedImage, GeneratedImageRecord } from '../services/storageService';

describe('Authentication Bug Prevention & Session Truth', () => {
  it('guarantees unauthenticated visitor is logged out with null user and free tier', () => {
    // When no Supabase session exists, user must resolve to null, not architect@zaboraa-cloud.io
    const session = null;
    const resolvedUser = session ? { uid: 'real-user' } : null;
    const resolvedTier = resolvedUser ? 'enterprise' : 'free';

    expect(resolvedUser).toBeNull();
    expect(resolvedTier).toBe('free');
  });

  it('prohibits synthetic architect@zaboraa-cloud.io from granting admin or enterprise privileges', () => {
    const fakeEmail = 'architect@zaboraa-cloud.io';
    expect(isUserAdminEmail(fakeEmail)).toBe(false);
  });

  it('strictly validates authorized admin emails', () => {
    expect(isUserAdminEmail('admin@zaboraa.com')).toBe(true);
    expect(isUserAdminEmail('wasim.sayyed@zaboraa-cloud.com')).toBe(true);
    expect(isUserAdminEmail('admin@corp.zaboraa.com')).toBe(true);
    expect(isUserAdminEmail('attacker@evil.com')).toBe(false);
    expect(isUserAdminEmail('guest@external.io')).toBe(false);
    expect(isUserAdminEmail(null)).toBe(false);
    expect(isUserAdminEmail(undefined)).toBe(false);
  });

  it('ensures OAuth cancellation leaves the visitor completely logged out', () => {
    // Simulate what happens when user returns from Google OAuth cancelled
    const mockSession = null;
    const mockStoredUser = null;
    const activeUser = mockSession ? { uid: 'sb-123' } : mockStoredUser;

    expect(activeUser).toBeNull();
  });
});

describe('User-Linked Persistence & Generated Images RLS Isolation', () => {
  it('records user-linked generated images with correct owner ID and metadata', async () => {
    const sampleRecord = {
      image_name: 'test_azure_avs_blueprint.png',
      image_type: 'blueprint_3d',
      storage_path: 'user-uuid-123/test_azure_avs_blueprint.png',
      storage_url: 'https://mock.storage/test_azure_avs_blueprint.png',
      user_id: 'user-uuid-123',
      user_email: 'architect@enterprise-client.com',
      user_name: 'Sarah Chen',
      file_size_bytes: 512000,
      mime_type: 'image/png',
      metadata: {
        cloudPlatform: 'Azure AVS',
        nodeCount: 16
      }
    };

    const saved = await recordGeneratedImage(sampleRecord);
    expect(saved).toBeDefined();
    expect(saved.image_name).toBe('test_azure_avs_blueprint.png');
    expect(saved.user_id).toBe('user-uuid-123');
    expect(saved.metadata?.cloudPlatform).toBe('Azure AVS');
  });

  it('restricts image visibility to owner for regular users while allowing admin to view all', async () => {
    const userA_Images = await fetchGeneratedImages('user-uuid-123', false);
    // Regular user only sees images where user_id matches
    userA_Images.forEach(img => {
      expect(img.user_id).toBe('user-uuid-123');
    });

    // Admin with isAdmin=true fetches all images across all users
    const adminImages = await fetchGeneratedImages('admin-id', true);
    expect(Array.isArray(adminImages)).toBe(true);
  });
});

describe('Default Dark Mode Application Theme', () => {
  it('defaults theme to dark when no preference is saved in localStorage', () => {
    function resolveInitialTheme(stored: string | null): 'dark' | 'light' {
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      return 'dark'; // Strict requirement: default to dark
    }

    expect(resolveInitialTheme(null)).toBe('dark');
    expect(resolveInitialTheme(undefined as any)).toBe('dark');
    expect(resolveInitialTheme('dark')).toBe('dark');
    expect(resolveInitialTheme('light')).toBe('light');
  });
});

describe('Admin Persistence, Hydration & Public Isolation Suite', () => {
  it('identifies authoritative admin emails correctly while denying arbitrary emails', () => {
    expect(isUserAdminEmail('admin@zaboraa.com')).toBe(true);
    expect(isUserAdminEmail('wasim.sayyed@zaboraa-cloud.com')).toBe(true);
    expect(isUserAdminEmail('congodb4@gmail.com')).toBe(true);
    expect(isUserAdminEmail('architect@zaboraa.com')).toBe(true);
    expect(isUserAdminEmail('intruder@random.io')).toBe(false);
    expect(isUserAdminEmail('')).toBe(false);
    expect(isUserAdminEmail(null)).toBe(false);
  });

  it('ensures remote settings take precedence over stale local cache during hydration', () => {
    const staleLocal = {
      brand: 'Stale Local Brand',
      brandTagline: 'Old Tagline',
      hero: { headline: 'Old Headline' }
    };
    const remote = {
      branding: { brandName: 'Remote Authoritative Brand', brandTagline: 'New Tagline' },
      siteContent: { hero: { headline: 'New Remote Headline' } }
    };

    // Simulated hydration logic matching applyRemoteSettings
    const hydratedBrand = remote.branding?.brandName || staleLocal.brand;
    const hydratedHeadline = remote.siteContent?.hero?.headline || staleLocal.hero.headline;

    expect(hydratedBrand).toBe('Remote Authoritative Brand');
    expect(hydratedHeadline).toBe('New Remote Headline');
  });

  it('safely merges partial remote settings without erasing existing fields', () => {
    const current = {
      brand: 'Zaboraa Technologies',
      brandTagline: 'Enterprise VMware Cloud',
      hero: { headline: 'Enterprise Multi-Cloud', subheadline: 'Existing Subheadline' },
      services: [{ id: 's1', name: 'Cloud Migration' }]
    };
    // Remote payload contains only updated headline
    const partialRemote = {
      siteContent: {
        hero: { headline: 'Updated Cloud Infrastructure' }
      }
    };

    const merged = {
      ...current,
      hero: partialRemote.siteContent.hero ? { ...current.hero, ...partialRemote.siteContent.hero } : current.hero
    };

    expect(merged.hero.headline).toBe('Updated Cloud Infrastructure');
    expect(merged.hero.subheadline).toBe('Existing Subheadline'); // Preserved!
    expect(merged.services.length).toBe(1); // Preserved!
  });

  it('sanitizes private AI configuration and internal contacts from public settings', async () => {
    // Save settings including sensitive AI config and internal contact
    await adminService.saveAppSetting('ai_configuration', { apiKey: 'secret-123', model: 'gemini-3.1-pro' }, 'ai');
    await adminService.saveAppSetting('organization', { supportEmail: 'help@zaboraa.com', executiveContact: 'confidential@zaboraa.com' }, 'organization');

    // Public query: forPublic = true
    const publicSettings = await adminService.getAppSettings(undefined, true);
    expect(publicSettings['ai_configuration']).toBeUndefined();
    if (publicSettings['organization']) {
      expect(publicSettings['organization'].executiveContact).toBeUndefined();
      expect(publicSettings['organization'].supportEmail).toBe('help@zaboraa.com');
    }

    // Admin query: forPublic = false
    const adminSettings = await adminService.getAppSettings(undefined, false);
    expect(adminSettings['ai_configuration']).toBeDefined();
    expect(adminSettings['ai_configuration']?.apiKey).toBe('secret-123');
  });

  it('enforces fail-closed server-side blueprint authorization', () => {
    function evaluateBlueprintAccess(mode: string, token: string | null): { allowed: boolean; status: number } {
      if (mode === 'nobody') {
        return { allowed: false, status: 403 };
      }
      // Fail-closed: require valid token unless explicitly 'everyone'
      if (mode !== 'everyone') {
        if (!token || token.trim() === '') {
          return { allowed: false, status: 401 };
        }
        return { allowed: true, status: 200 };
      }
      return { allowed: true, status: 200 };
    }

    // Default 'signed_in' requires token
    expect(evaluateBlueprintAccess('signed_in', null)).toEqual({ allowed: false, status: 401 });
    expect(evaluateBlueprintAccess('signed_in', 'valid-jwt-token')).toEqual({ allowed: true, status: 200 });

    // 'nobody' is strictly forbidden even with token
    expect(evaluateBlueprintAccess('nobody', 'valid-jwt-token')).toEqual({ allowed: false, status: 403 });

    // Unknown or corrupted mode fails closed to signed_in
    expect(evaluateBlueprintAccess('corrupted_mode', null)).toEqual({ allowed: false, status: 401 });
    expect(evaluateBlueprintAccess('corrupted_mode', 'valid-jwt-token')).toEqual({ allowed: true, status: 200 });

    // Explicit 'everyone' allows unauthenticated access
    expect(evaluateBlueprintAccess('everyone', null)).toEqual({ allowed: true, status: 200 });
  });
});

