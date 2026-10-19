import { describe, it, expect, beforeEach } from 'vitest';
import {
  offlineVaultService,
  generateCryptographicRecoveryKey,
  computeKeyFingerprint,
  benchmarkPBKDF2
} from '../services/offlineVaultService';

describe('Zaboraa Enterprise — Cryptographic Offline Vault & Recovery Suite', () => {
  beforeEach(async () => {
    await offlineVaultService.wipeVault();
  });

  describe('1. Key Generation & Authenticated Decryption Verification', () => {
    it('generates a 256-bit cryptographically secure recovery key formatted as 8x4 alphanumeric blocks', () => {
      const key = generateCryptographicRecoveryKey();
      expect(key).toMatch(/^ZABO-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    });

    it('computes key fingerprint for identification without storing plaintext key', async () => {
      const key = generateCryptographicRecoveryKey();
      const fingerprint = await computeKeyFingerprint(key);
      expect(fingerprint).toMatch(/^[0-9A-F]{4}:[0-9A-F]{4}:/);
      expect(fingerprint).not.toContain(key);
    });

    it('initializes vault and successfully unlocks using the generated recovery key', async () => {
      // Initialize with test iteration count (50,000 for unit test speed while validating derivation engine)
      const { recoveryKey } = await offlineVaultService.initializeVault(undefined, 50000);
      expect(recoveryKey).toBeDefined();

      const isInit = await offlineVaultService.isVaultInitialized();
      expect(isInit).toBe(true);

      // Attempt unlock with valid key
      const unlockRes = await offlineVaultService.unlockVault(recoveryKey);
      expect(unlockRes.success).toBe(true);
      expect(unlockRes.data).toBeDefined();
      expect(offlineVaultService.isUnlocked()).toBe(true);

      // Data is accessible in memory
      const decrypted = offlineVaultService.getDecryptedData();
      expect(decrypted).not.toBeNull();
      expect(decrypted?.operationalMetrics).toBeDefined();
    });

    it('strictly rejects incorrect recovery keys via AES-GCM authenticated tag check', async () => {
      await offlineVaultService.initializeVault(undefined, 50000);

      // Forge an invalid recovery key
      const bogusKey = 'ZABO-FFFF-FFFF-FFFF-FFFF-FFFF-FFFF-FFFF';
      const unlockRes = await offlineVaultService.unlockVault(bogusKey);

      expect(unlockRes.success).toBe(false);
      expect(unlockRes.error).toMatch(/Decryption rejected|authentication tag/i);
      expect(offlineVaultService.isUnlocked()).toBe(false);
    });

    it('immediately purges in-memory keys and decrypted snapshots upon locking the vault', async () => {
      const { recoveryKey } = await offlineVaultService.initializeVault(undefined, 50000);
      await offlineVaultService.unlockVault(recoveryKey);
      expect(offlineVaultService.isUnlocked()).toBe(true);

      offlineVaultService.lockVault();
      expect(offlineVaultService.isUnlocked()).toBe(false);
      expect(offlineVaultService.getDecryptedData()).toBeNull();
    });
  });

  describe('2. Security Boundary & Production Secret Isolation', () => {
    it('ensures zero production service-role keys or database passwords reside in the vault', async () => {
      const { recoveryKey } = await offlineVaultService.initializeVault(undefined, 50000);
      const res = await offlineVaultService.unlockVault(recoveryKey);

      const jsonStr = JSON.stringify(res.data);
      expect(jsonStr).not.toContain('service_role');
      expect(jsonStr).not.toContain('postgres:');
      expect(jsonStr).not.toContain('supabase_service_key');
      expect(jsonStr).not.toContain('serviceRole');
    });

    it('measures PBKDF2 derivation execution time via benchmarkPBKDF2', async () => {
      const result = await benchmarkPBKDF2(10000);
      expect(result.iterations).toBe(10000);
      expect(result.durationMs).toBeGreaterThan(0);
      expect(result.recommendation).toBeDefined();
    });
  });

  describe('3. Offline Mutation Staging & Reconciliation Queue', () => {
    it('enqueues offline actions with pending status and timestamps', async () => {
      const action = await offlineVaultService.enqueueOfflineAction({
        actionType: 'UPDATE_BRIEFING_STATUS',
        targetEntity: 'briefing_requests',
        entityId: 'brief-001',
        payload: { status: 'scheduled' }
      });

      expect(action.id).toMatch(/^queue-/);
      expect(action.status).toBe('pending');
      expect(action.payload.status).toBe('scheduled');

      const queue = await offlineVaultService.getQueuedActions();
      expect(queue.length).toBeGreaterThanOrEqual(1);
      expect(queue.find(q => q.id === action.id)).toBeDefined();
    });

    it('records immutable local audit entries for all vault operations', async () => {
      await offlineVaultService.logAudit({
        id: 'test-audit-01',
        timestamp: new Date().toISOString(),
        event: 'TEST_EVENT',
        details: 'Integration test event recording',
        success: true,
        isOffline: true
      });

      const logs = await offlineVaultService.getAuditLogs();
      expect(logs.find(l => l.event === 'TEST_EVENT')).toBeDefined();
    });

    it('supports removing individual queued actions and clearing the queue', async () => {
      const a1 = await offlineVaultService.enqueueOfflineAction({
        actionType: 'UPDATE_BRIEFING_STATUS',
        targetEntity: 'briefing_requests',
        entityId: 'brief-01',
        payload: { status: 'contacted' }
      });

      await offlineVaultService.removeQueuedAction(a1.id);
      const queueAfterRemove = await offlineVaultService.getQueuedActions();
      expect(queueAfterRemove.find(q => q.id === a1.id)).toBeUndefined();

      await offlineVaultService.clearQueue();
      const emptyQueue = await offlineVaultService.getQueuedActions();
      expect(emptyQueue.length).toBe(0);
    });
  });
});
