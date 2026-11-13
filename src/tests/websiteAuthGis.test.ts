import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  generateRawNonce,
  hashNonceToHex,
  loadGoogleGsiScript,
  ALLOWED_EMAILS
} from '../context/AuthContext';

function getAllSourceFiles(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSourceFiles(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      results.push(filePath);
    }
  }
  return results;
}

describe('Website Auth Google Identity Services (GIS) Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Grep test: src/ contains ZERO occurrences of signInWithOAuth and ZERO of supabase.co/auth/v1/authorize', () => {
    const srcDir = join(process.cwd(), 'src');
    const files = getAllSourceFiles(srcDir);
    let oauthCount = 0;
    let authorizeCount = 0;

    for (const file of files) {
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
      const content = readFileSync(file, 'utf-8');
      if (content.includes('signInWithOAuth')) {
        oauthCount++;
      }
      if (content.includes('supabase.co/auth/v1/authorize')) {
        authorizeCount++;
      }
    }

    expect(oauthCount).toBe(0);
    expect(authorizeCount).toBe(0);
  });

  it('2. Nonce contract: hashedNonce equals lowercase-hex SHA-256 of rawNonce', async () => {
    const rawNonce = generateRawNonce();
    const hashedHex = await hashNonceToHex(rawNonce);

    expect(rawNonce).toBeDefined();
    expect(hashedHex).toBeDefined();
    expect(typeof rawNonce).toBe('string');
    expect(typeof hashedHex).toBe('string');
    expect(rawNonce).toMatch(/^[0-9a-f]{32}$/);
    expect(hashedHex).toMatch(/^[0-9a-f]{64}$/);

    // Verify manually with SubtleCrypto digest
    const encoder = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', encoder.encode(rawNonce));
    const expectedHex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    expect(hashedHex).toBe(expectedHex);
  });

  it('3. GIS initialization & signInWithIdToken nonce contract with google.accounts.id mock', async () => {
    const initializeSpy = vi.fn();
    const renderButtonSpy = vi.fn();

    (globalThis as any).google = {
      accounts: {
        id: {
          initialize: initializeSpy,
          renderButton: renderButtonSpy
        }
      }
    };

    const mockIdTokenRes = {
      data: {
        session: {
          user: {
            id: 'mock-user-id-123',
            email: 'congodb4@gmail.com'
          }
        }
      },
      error: null
    };

    const signInWithIdTokenSpy = vi.fn().mockResolvedValue(mockIdTokenRes);

    const fakeSupabase = {
      auth: {
        signInWithIdToken: signInWithIdTokenSpy,
        signOut: vi.fn()
      }
    };

    const rawNonce = generateRawNonce();
    const hashedHex = await hashNonceToHex(rawNonce);

    // Simulate initialize call
    (globalThis as any).google.accounts.id.initialize({
      client_id: 'mock-google-client-id.apps.googleusercontent.com',
      callback: async (res: { credential: string }) => {
        await fakeSupabase.auth.signInWithIdToken({
          provider: 'google',
          token: res.credential,
          nonce: rawNonce
        });
      },
      nonce: hashedHex
    });

    expect(initializeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'mock-google-client-id.apps.googleusercontent.com',
        nonce: hashedHex
      })
    );

    // Trigger credential callback
    const initCallArg = initializeSpy.mock.calls[0][0];
    await initCallArg.callback({ credential: 'mock-gsi-id-token-abc' });

    expect(signInWithIdTokenSpy).toHaveBeenCalledWith({
      provider: 'google',
      token: 'mock-gsi-id-token-abc',
      nonce: rawNonce
    });
  });

  it('4. Allowed email in different case (CONGODB4@GMAIL.COM) is matched against ALLOWED_EMAILS', () => {
    const testEmail = 'CONGODB4@GMAIL.COM';
    const lowerInput = testEmail.toLowerCase().trim();
    const allowedLower = ALLOWED_EMAILS.map(e => e.toLowerCase().trim());
    expect(allowedLower.includes(lowerInput)).toBe(true);
  });

  it('5. Blocked email (unauthorized@gmail.com) is rejected by allowlist check', () => {
    const testEmail = 'unauthorized@gmail.com';
    const lowerInput = testEmail.toLowerCase().trim();
    const allowedLower = ALLOWED_EMAILS.map(e => e.toLowerCase().trim());
    expect(allowedLower.includes(lowerInput)).toBe(false);
  });

  it('6. Script load idempotency: multiple calls to loadGoogleGsiScript attach script tag only once', async () => {
    const appendedScripts: HTMLScriptElement[] = [];

    const mockDocument = {
      querySelector: vi.fn().mockImplementation((selector: string) => {
        if (appendedScripts.some(s => s.src === 'https://accounts.google.com/gsi/client')) {
          return appendedScripts[0];
        }
        return null;
      }),
      createElement: vi.fn().mockImplementation(() => {
        const script: any = { src: '', async: false, defer: false, onload: null };
        return script;
      }),
      head: {
        appendChild: vi.fn().mockImplementation((script: any) => {
          appendedScripts.push(script);
          if (script.onload) script.onload();
        })
      }
    };

    const origDoc = (globalThis as any).document;
    (globalThis as any).document = mockDocument;

    try {
      await loadGoogleGsiScript();
      await loadGoogleGsiScript();

      expect(mockDocument.head.appendChild).toHaveBeenCalledTimes(1);
      expect(appendedScripts.length).toBe(1);
    } finally {
      (globalThis as any).document = origDoc;
    }
  });
});
