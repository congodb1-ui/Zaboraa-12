import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  UserWorkspace,
  WorkspaceConfiguration,
  WorkspaceSnapshot,
  WorkspaceSaveStatus
} from '../types/userWorkspace';

export const INITIAL_WORKSPACE_CONFIG: WorkspaceConfiguration = {
  nodeSizing: {
    cloudProvider: 'Azure AVS',
    presetKey: 'nc2-an36',
    targetVmCount: 750,
    avgVcpuPerVm: 4,
    avgRamPerVmGB: 16,
    avgStoragePerVmGB: 120,
    vcpuOvercommit: 2.5,
    ramBufferPercent: 20,
    storagePolicy: 'raid-1',
    externalNfsOffloadPercent: 40,
    anfPerformanceTier: 'Premium',
    notes: 'Primary enterprise workload migration cluster sizing',
    updatedAt: new Date().toISOString()
  },
  rvtoolsAssessment: {
    clusterName: 'Production-vSphere-DC1',
    vmCount: 750,
    readinessScore: 88,
    hcxBulkCount: 520,
    hcxRavCount: 190,
    coldMigrationCount: 40,
    identifiedRisks: ['34 VMs with active snapshots > 7 days', '12 VMs with obsolete VMware Tools'],
    lastAnalyzedAt: new Date().toISOString()
  },
  nutanixNC2: {
    selectedNode: 'AN36 (Intel Xeon Scalable)',
    nodeCount: 16,
    dsfReplicationFactor: 'RF2',
    dedupCompressionRatio: 1.8,
    ahvVirtioReadyPercent: 94,
    lastAssessedAt: new Date().toISOString()
  },
  ariaNetworks: {
    tierCount: 3,
    identifiedFlows: 1420,
    crossTierLatencyMs: 1.8,
    dfwZeroTrustRules: 84,
    lastCalculatedAt: new Date().toISOString()
  },
  drPlanner: {
    rpoMinutes: 15,
    targetRtoHours: 2,
    deltaChangeRatePercent: 8,
    wanBandwidthMbps: 500,
    replicationEngine: 'vSphere Replication + SRM',
    lastPlannedAt: new Date().toISOString()
  },
  blueprintGenerator: {
    selectedPlatform: 'azure-avs',
    targetTopology: 'Dual-Region Hub-Spoke with ExpressRoute Global Reach',
    bomComponents: ['AV36P Nodes (x16)', 'Azure NetApp Files 50TB', 'Azure Virtual WAN Hub', 'HCX Enterprise'],
    lastGeneratedAt: new Date().toISOString()
  },
  layoutPreferences: {
    themePreset: 'default',
    layoutDensity: 'balanced',
    sidebarCollapsed: false,
    favoriteTools: ['sizing', 'rvtools-analyzer', 'nutanix-nc2-assessment']
  },
  projectNotes: 'Enterprise cloud migration architecture blueprint project workspace.',
  version: 1
};

const GUEST_USER_ID = 'guest-public-session';
const MAX_LOCAL_SNAPSHOTS = 50;

// Supabase user ids are UUIDs. Anything else (guest id, a non-Supabase uid) cannot be written to the cloud tables.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const generateId = (prefix = 'ws'): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Deep copy so nested objects are never shared between workspaces, snapshots and React state
const deepClone = <T>(value: T): T =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

export class UserWorkspaceService {
  private getStorageKey(userId: string): string {
    return `zaboraa_workspaces_${userId}`;
  }

  private getActiveWorkspaceIdKey(userId: string): string {
    return `zaboraa_active_workspace_${userId}`;
  }

  private getSnapshotsKey(workspaceId: string): string {
    return `zaboraa_snapshots_${workspaceId}`;
  }

  // True only when a cloud write can actually succeed for this user
  private canSyncToCloud(userId: string): boolean {
    return Boolean(isSupabaseConfigured && supabase && UUID_RE.test(userId));
  }

  private toRow(ws: UserWorkspace) {
    return {
      id: ws.id,
      user_id: ws.user_id,
      name: ws.name,
      description: ws.description,
      is_default: ws.is_default,
      is_archived: ws.is_archived,
      configuration: ws.configuration,
      created_at: ws.created_at,
      updated_at: ws.updated_at,
      last_accessed_at: ws.last_accessed_at,
      version: ws.version
    };
  }

  // Insert-or-update the whole row. Returns true only if the database confirms a row was written.
  private async pushWorkspace(ws: UserWorkspace): Promise<boolean> {
    if (!this.canSyncToCloud(ws.user_id) || !supabase) return false;
    try {
      const { data, error } = await supabase
        .from('user_workspaces')
        .upsert(this.toRow(ws), { onConflict: 'id' })
        .select('id');

      if (error) {
        console.warn('Workspace cloud save failed:', error.message);
        return false;
      }
      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      console.warn('Workspace cloud save failed:', err);
      return false;
    }
  }

  // Update a few columns. If no row matched (never uploaded), fall back to uploading the whole workspace.
  private async updateWorkspaceFields(ws: UserWorkspace, fields: Record<string, unknown>): Promise<boolean> {
    if (!this.canSyncToCloud(ws.user_id) || !supabase) return false;
    try {
      const { data, error } = await supabase
        .from('user_workspaces')
        .update(fields)
        .eq('id', ws.id)
        .eq('user_id', ws.user_id)
        .select('id');

      if (error) {
        console.warn('Workspace cloud update failed:', error.message);
        return false;
      }
      if (Array.isArray(data) && data.length > 0) return true;
      return this.pushWorkspace(ws);
    } catch (err) {
      console.warn('Workspace cloud update failed:', err);
      return false;
    }
  }

  // Get local cached workspaces (includes archived ones, which are hidden from the UI)
  getLocalWorkspaces(userId: string): UserWorkspace[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Notice reading local workspaces:', e);
    }
    return [];
  }

  // Save local cached workspaces
  saveLocalWorkspaces(userId: string, workspaces: UserWorkspace[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(workspaces));
    } catch (e) {
      console.warn('Notice saving local workspaces:', e);
    }
  }

  // Synchronous local-only write, used when the tab is being hidden or closed
  persistLocalDraft(userId: string, workspaceId: string, config: WorkspaceConfiguration): void {
    const list = this.getLocalWorkspaces(userId);
    const index = list.findIndex(w => w.id === workspaceId);
    if (index === -1) return;
    list[index] = { ...list[index], configuration: config, updated_at: new Date().toISOString() };
    this.saveLocalWorkspaces(userId, list);
  }

  // Fetch or initialize workspaces for a user
  async fetchUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
    let remoteWorkspaces: UserWorkspace[] = [];
    let fetchSucceeded = false;

    if (this.canSyncToCloud(userId) && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_workspaces')
          .select('*')
          .eq('user_id', userId)
          .eq('is_archived', false)
          .order('last_accessed_at', { ascending: false });

        if (error) {
          console.warn('Workspace cloud load failed (using local cache):', error.message);
        } else if (Array.isArray(data)) {
          remoteWorkspaces = data.map((d: any) => ({
            id: d.id,
            user_id: d.user_id,
            name: d.name,
            description: d.description || '',
            is_default: Boolean(d.is_default),
            is_archived: Boolean(d.is_archived),
            configuration: d.configuration || deepClone(INITIAL_WORKSPACE_CONFIG),
            created_at: d.created_at,
            updated_at: d.updated_at,
            last_accessed_at: d.last_accessed_at,
            version: d.version || 1
          }));
          fetchSucceeded = true;
        }
      } catch (err) {
        console.warn('Notice fetching user_workspaces from Supabase (falling back to local cache):', err);
      }
    }

    if (fetchSucceeded && remoteWorkspaces.length > 0) {
      this.saveLocalWorkspaces(userId, remoteWorkspaces);
      return remoteWorkspaces;
    }

    // Check local cache (archived workspaces stay hidden)
    const local = this.getLocalWorkspaces(userId).filter(w => !w.is_archived);
    if (local.length > 0) {
      return local;
    }

    // First time user: create default workspace
    const now = new Date().toISOString();
    const defaultWorkspace: UserWorkspace = {
      id: generateId(),
      user_id: userId,
      name: 'Default Cloud Workspace',
      description: 'Primary private workspace for multi-cloud migration and sizing models.',
      is_default: true,
      is_archived: false,
      configuration: deepClone(INITIAL_WORKSPACE_CONFIG),
      created_at: now,
      updated_at: now,
      last_accessed_at: now,
      version: 1
    };

    const newWorkspaces = [defaultWorkspace];
    this.saveLocalWorkspaces(userId, newWorkspaces);
    this.setActiveWorkspaceId(userId, defaultWorkspace.id);

    await this.pushWorkspace(defaultWorkspace);

    return newWorkspaces;
  }

  getActiveWorkspaceId(userId: string): string | null {
    try {
      return localStorage.getItem(this.getActiveWorkspaceIdKey(userId));
    } catch {
      return null;
    }
  }

  setActiveWorkspaceId(userId: string, workspaceId: string): void {
    try {
      localStorage.setItem(this.getActiveWorkspaceIdKey(userId), workspaceId);
    } catch {}
  }

  // Create a new named workspace
  async createWorkspace(userId: string, name: string, description = ''): Promise<UserWorkspace> {
    const now = new Date().toISOString();
    const newWs: UserWorkspace = {
      id: generateId(),
      user_id: userId,
      name: name.trim() || 'New Cloud Project',
      description: description.trim(),
      is_default: false,
      is_archived: false,
      configuration: { ...deepClone(INITIAL_WORKSPACE_CONFIG), version: 1 },
      created_at: now,
      updated_at: now,
      last_accessed_at: now,
      version: 1
    };

    const current = this.getLocalWorkspaces(userId);
    this.saveLocalWorkspaces(userId, [newWs, ...current]);
    this.setActiveWorkspaceId(userId, newWs.id);

    await this.pushWorkspace(newWs);

    return newWs;
  }

  // Save workspace configuration changes
  async saveWorkspaceConfiguration(
    userId: string,
    workspaceId: string,
    newConfig: Partial<WorkspaceConfiguration>
  ): Promise<{ success: boolean; status: WorkspaceSaveStatus; error?: string; workspace?: UserWorkspace }> {
    const currentList = this.getLocalWorkspaces(userId);
    const index = currentList.findIndex(w => w.id === workspaceId);

    if (index === -1) {
      return { success: false, status: 'failed', error: 'Workspace not found' };
    }

    const target = currentList[index];
    const updatedConfig: WorkspaceConfiguration = {
      ...target.configuration,
      ...newConfig,
      version: (target.configuration.version || 1) + 1
    };

    const now = new Date().toISOString();
    const updatedWorkspace: UserWorkspace = {
      ...target,
      configuration: updatedConfig,
      updated_at: now,
      last_accessed_at: now,
      version: target.version + 1
    };

    // Local copy is always written first and synchronously
    currentList[index] = updatedWorkspace;
    this.saveLocalWorkspaces(userId, currentList);

    // Guests are local-only by design, so "saved" is the truthful status for them
    if (userId === GUEST_USER_ID) {
      return { success: true, status: 'saved', workspace: updatedWorkspace };
    }

    if (this.canSyncToCloud(userId) && navigator.onLine) {
      const stored = await this.pushWorkspace(updatedWorkspace);
      return { success: true, status: stored ? 'saved' : 'offline', workspace: updatedWorkspace };
    }

    return { success: true, status: 'offline', workspace: updatedWorkspace };
  }

  // Duplicate workspace
  async duplicateWorkspace(userId: string, workspaceId: string): Promise<UserWorkspace | null> {
    const list = this.getLocalWorkspaces(userId);
    const target = list.find(w => w.id === workspaceId);
    if (!target) return null;

    const now = new Date().toISOString();
    const cloned: UserWorkspace = {
      ...target,
      id: generateId(),
      name: `${target.name} (Copy)`,
      is_default: false,
      is_archived: false,
      configuration: deepClone(target.configuration),
      created_at: now,
      updated_at: now,
      last_accessed_at: now,
      version: 1
    };

    this.saveLocalWorkspaces(userId, [cloned, ...list]);
    this.setActiveWorkspaceId(userId, cloned.id);

    await this.pushWorkspace(cloned);

    return cloned;
  }

  // Rename workspace
  async renameWorkspace(userId: string, workspaceId: string, newName: string): Promise<boolean> {
    const list = this.getLocalWorkspaces(userId);
    const target = list.find(w => w.id === workspaceId);
    if (!target) return false;

    target.name = newName.trim();
    target.updated_at = new Date().toISOString();
    this.saveLocalWorkspaces(userId, list);

    await this.updateWorkspaceFields(target, { name: target.name, updated_at: target.updated_at });

    return true;
  }

  // "Delete" is now a recoverable archive: the row stays in the database with is_archived = true.
  async archiveWorkspace(userId: string, workspaceId: string): Promise<UserWorkspace> {
    const list = this.getLocalWorkspaces(userId);
    const target = list.find(w => w.id === workspaceId);
    if (!target) {
      throw new Error('Workspace not found.');
    }

    const visible = list.filter(w => !w.is_archived);
    if (visible.length <= 1) {
      throw new Error('Cannot delete your only workspace.');
    }

    target.is_archived = true;
    target.updated_at = new Date().toISOString();
    this.saveLocalWorkspaces(userId, list);

    if (this.getActiveWorkspaceId(userId) === workspaceId) {
      const next = list.find(w => !w.is_archived && w.id !== workspaceId);
      if (next) this.setActiveWorkspaceId(userId, next.id);
    }

    await this.updateWorkspaceFields(target, { is_archived: true, updated_at: target.updated_at });

    return deepClone(target);
  }

  // Undo for archiveWorkspace
  async restoreWorkspace(userId: string, workspaceId: string): Promise<UserWorkspace | null> {
    const list = this.getLocalWorkspaces(userId);
    const target = list.find(w => w.id === workspaceId);
    if (!target) return null;

    target.is_archived = false;
    target.updated_at = new Date().toISOString();
    this.saveLocalWorkspaces(userId, list);
    this.setActiveWorkspaceId(userId, target.id);

    await this.updateWorkspaceFields(target, { is_archived: false, updated_at: target.updated_at });

    return deepClone(target);
  }

  // Kept for compatibility with existing callers. Now archives instead of permanently deleting.
  async deleteWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    await this.archiveWorkspace(userId, workspaceId);
    return true;
  }

  // Create Snapshot
  async createSnapshot(
    userId: string,
    workspaceId: string,
    label: string,
    config: WorkspaceConfiguration
  ): Promise<WorkspaceSnapshot> {
    const snapshot: WorkspaceSnapshot = {
      id: generateId('snap'),
      workspace_id: workspaceId,
      user_id: userId,
      snapshot_label: label.trim() || `Snapshot ${new Date().toLocaleTimeString()}`,
      snapshot_data: deepClone(config),
      created_at: new Date().toISOString()
    };

    try {
      const existingRaw = localStorage.getItem(this.getSnapshotsKey(workspaceId));
      const list: WorkspaceSnapshot[] = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(snapshot);
      localStorage.setItem(this.getSnapshotsKey(workspaceId), JSON.stringify(list.slice(0, MAX_LOCAL_SNAPSHOTS)));
    } catch (e) {
      console.warn('Notice saving local snapshot:', e);
    }

    if (this.canSyncToCloud(userId) && supabase) {
      try {
        const { error } = await supabase.from('workspace_snapshots').insert({
          id: snapshot.id,
          workspace_id: snapshot.workspace_id,
          user_id: snapshot.user_id,
          snapshot_label: snapshot.snapshot_label,
          snapshot_data: snapshot.snapshot_data,
          created_at: snapshot.created_at
        });
        if (error) console.warn('Snapshot cloud save failed:', error.message);
      } catch (e) {
        console.warn('Snapshot cloud save failed:', e);
      }
    }

    return snapshot;
  }

  // Get Snapshots for a workspace
  async getSnapshots(workspaceId: string): Promise<WorkspaceSnapshot[]> {
    try {
      const raw = localStorage.getItem(this.getSnapshotsKey(workspaceId));
      if (raw) return JSON.parse(raw);
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('workspace_snapshots')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Snapshot cloud load failed:', error.message);
        } else if (Array.isArray(data)) {
          return data;
        }
      } catch {}
    }

    return [];
  }

  // Export workspace to downloadable JSON
  exportWorkspaceToFile(workspace: UserWorkspace): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workspace, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `zaboraa-workspace-${workspace.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Import workspace from JSON
  async importWorkspace(userId: string, jsonContent: string): Promise<UserWorkspace> {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || !parsed.configuration) {
      throw new Error('Invalid Zaboraa workspace JSON structure.');
    }

    const now = new Date().toISOString();
    const imported: UserWorkspace = {
      id: generateId(),
      user_id: userId,
      name: `${parsed.name || 'Imported Workspace'} (Imported)`,
      description: parsed.description || 'Imported from backup JSON',
      is_default: false,
      is_archived: false,
      configuration: deepClone(parsed.configuration),
      created_at: now,
      updated_at: now,
      last_accessed_at: now,
      version: 1
    };

    const current = this.getLocalWorkspaces(userId);
    this.saveLocalWorkspaces(userId, [imported, ...current]);
    this.setActiveWorkspaceId(userId, imported.id);

    await this.pushWorkspace(imported);

    return imported;
  }
}

export const userWorkspaceService = new UserWorkspaceService();
