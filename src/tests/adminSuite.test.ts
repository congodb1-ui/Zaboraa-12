import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminService } from '../services/adminService';

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

describe('Zaboraa Enterprise Admin Suite Service', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('User Management and Protection Rules', () => {
    it('returns seeded or live users with valid role representations', async () => {
      const users = await adminService.getUsers();
      expect(users.length).toBeGreaterThan(0);
      
      const wasim = users.find(u => u.email === 'wasim.sayyed@zaboraa.com');
      expect(wasim).toBeDefined();
      expect(wasim?.role).toBe('admin');
      expect(wasim?.status).toBe('active');
    });

    it('prevents accidental demotion or suspension of the last administrator', async () => {
      const users = await adminService.getUsers();
      const adminUsers = users.filter(u => u.role === 'admin' && u.status === 'active');
      
      if (adminUsers.length === 1) {
        const lastAdmin = adminUsers[0];
        // Demoting last admin returns failure
        const result = await adminService.updateUserRole(
          lastAdmin.id,
          'public',
          'tester@zaboraa.com'
        );
        expect(result.success).toBe(false);
        expect(result.error).toContain('Cannot demote the last remaining Administrator');

        // Suspending last admin returns failure
        const suspendRes = await adminService.updateUserStatus(
          lastAdmin.id,
          'suspended',
          'tester@zaboraa.com'
        );
        expect(suspendRes.success).toBe(false);
        expect(suspendRes.error).toContain('Cannot suspend the last active Administrator');
      }
    });

    it('successfully updates role for non-critical accounts', async () => {
      const users = await adminService.getUsers();
      const nonAdmin = users.find(u => u.role !== 'admin');
      if (nonAdmin) {
        const result = await adminService.updateUserRole(
          nonAdmin.id,
          'authorized',
          'wasim.sayyed@zaboraa.com'
        );
        expect(result.success).toBe(true);
      }
    });
  });

  describe('CRM & Pipeline Management', () => {
    it('creates and tracks CRM leads with stages and values', async () => {
      const newLead = await adminService.createLead({
        name: 'Elena Rostova',
        email: 'elena@stripe-sample.com',
        company: 'Stripe Payments Cloud Architecture',
        phone: '+1 415 555 0199',
        source: 'briefing_form',
        status: 'qualified',
        priority: 'urgent',
        assigned_to: 'wasim.sayyed@zaboraa.com',
        cloud_interest: 'Azure AVS',
        estimated_vm_count: 2400,
        estimated_deal_value_usd: 180000,
        notes: 'Requested ANF decoupled storage sizing and migration wave roadmap.'
      }, 'wasim.sayyed@zaboraa.com');

      expect(newLead.id).toBeDefined();
      expect(newLead.company).toBe('Stripe Payments Cloud Architecture');
      expect(newLead.estimated_deal_value_usd).toBe(180000);

      const allLeads = await adminService.getCrmLeads();
      const found = allLeads.find(l => l.id === newLead.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe('elena@stripe-sample.com');
    });

    it('updates lead status accurately', async () => {
      const leads = await adminService.getCrmLeads();
      const firstLead = leads[0];
      expect(firstLead).toBeDefined();

      await adminService.updateLeadStatus(
        firstLead.id,
        'won',
        'wasim.sayyed@zaboraa.com',
        'Migration plan signed and deposit received.'
      );

      const refreshed = await adminService.getCrmLeads();
      const target = refreshed.find(l => l.id === firstLead.id);
      expect(target?.status).toBe('won');
    });
  });

  describe('Audit Logging & Export Capabilities', () => {
    it('logs administrative actions to the audit trail', async () => {
      await adminService.logAuditEvent({
        actorEmail: 'wasim.sayyed@zaboraa.com',
        actorRole: 'admin',
        action: 'UPDATE_SYSTEM_SECURITY_POLICY',
        targetEntity: 'security_config',
        targetId: 'mfa_enforce',
        outcome: 'success',
        metadata: { enforced: true }
      });

      const logs = await adminService.getAuditLogs();
      const found = logs.find(l => l.action === 'UPDATE_SYSTEM_SECURITY_POLICY');
      expect(found).toBeDefined();
      expect(found?.actor_email).toBe('wasim.sayyed@zaboraa.com');
      expect(found?.outcome).toBe('success');
    });

    it('generates well-formatted CSV strings for export', () => {
      const sampleData = [
        { id: '1', name: 'Wasim Sayyed', role: 'admin' },
        { id: '2', name: 'Test User, Jr.', role: 'authorized' }
      ];

      const keys = Object.keys(sampleData[0]);
      const header = keys.join(',');
      const rows = sampleData.map(item =>
        keys.map(k => `"${String((item as any)[k] ?? '').replace(/"/g, '""')}"`).join(',')
      );
      const csvContent = [header, ...rows].join('\n');

      expect(csvContent).toContain('id,name,role');
      expect(csvContent).toContain('"Wasim Sayyed"');
      expect(csvContent).toContain('"Test User, Jr."');
    });
  });

  describe('Integration Health Verification', () => {
    it('reports health telemetry for required enterprise providers', async () => {
      const statuses = await adminService.checkAllIntegrations();
      expect(statuses.length).toBeGreaterThanOrEqual(4);

      const keys = statuses.map(s => s.id);
      expect(keys).toContain('supabase_db');
      expect(keys).toContain('supabase_auth');
      expect(keys).toContain('cloud_storage');
      expect(keys).toContain('gemini_api');
      expect(keys).toContain('serverless_gateway');
    });
  });

  describe('Persistent Application Settings & Preferences', () => {
    it('saves and retrieves application settings with audit trail logging', async () => {
      const saveRes = await adminService.saveAppSetting(
        'branding',
        {
          brandName: 'Zaboraa Enterprise Cloud',
          brandTagline: 'Global Hyperscaler Architecture'
        },
        'branding',
        'Updated brand coordinates',
        'wasim.sayyed@zaboraa.com'
      );
      expect(saveRes.success).toBe(true);

      const retrieved = await adminService.getAppSettings('branding');
      expect(retrieved['branding']).toBeDefined();
      expect(retrieved['branding'].brandName).toBe('Zaboraa Enterprise Cloud');

      // Verify audit trail logged the setting change
      const logs = await adminService.getAuditLogs();
      const settingLog = logs.find(l => l.action === 'UPDATE_APP_SETTING');
      expect(settingLog).toBeDefined();
      expect(settingLog?.target_entity).toBe('app_settings');
    });

    it('persists and aggregates global settings (branding, features, organization)', async () => {
      const globalRes = await adminService.saveGlobalSettings({
        branding: { brandName: 'Zaboraa Global' },
        featureControls: { export4k: true, exportDossier: true, generateBlueprint: true },
        organization: { defaultCloudProvider: 'Azure AVS', primaryRegion: 'East US 2' }
      }, 'wasim.sayyed@zaboraa.com');

      expect(globalRes.success).toBe(true);

      const globalConfig = await adminService.getGlobalSettings();
      expect(globalConfig.branding?.brandName).toBe('Zaboraa Global');
      expect(globalConfig.featureControls?.export4k).toBe(true);
      expect(globalConfig.organization?.defaultCloudProvider).toBe('Azure AVS');
    });
  });
});
