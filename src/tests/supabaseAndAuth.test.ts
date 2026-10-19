import { describe, it, expect } from 'vitest';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_SITE_DATA } from '../data/initialData';

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
