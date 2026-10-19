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

  // Get local cached workspaces
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

  // Fetch or initialize workspaces for a user
  async fetchUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
    let remoteWorkspaces: UserWorkspace[] = [];
    let fetchSucceeded = false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_workspaces')
          .select('*')
          .eq('user_id', userId)
          .eq('is_archived', false)
          .order('last_accessed_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          remoteWorkspaces = data.map((d: any) => ({
            id: d.id,
            user_id: d.user_id,
            name: d.name,
            description: d.description || '',
            is_default: Boolean(d.is_default),
            is_archived: Boolean(d.is_archived),
            configuration: d.configuration || INITIAL_WORKSPACE_CONFIG,
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

    // Check local cache
    const local = this.getLocalWorkspaces(userId);
    if (local.length > 0) {
      return local;
    }

    // First time user: create default workspace
    const defaultWorkspace: UserWorkspace = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      name: 'Default Cloud Workspace',
      description: 'Primary private workspace for multi-cloud migration and sizing models.',
      is_default: true,
      is_archived: false,
      configuration: INITIAL_WORKSPACE_CONFIG,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      version: 1
    };

    const newWorkspaces = [defaultWorkspace];
    this.saveLocalWorkspaces(userId, newWorkspaces);
    this.setActiveWorkspaceId(userId, defaultWorkspace.id);

    // Try persisting default workspace to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_workspaces').insert({
          id: defaultWorkspace.id,
          user_id: defaultWorkspace.user_id,
          name: defaultWorkspace.name,
          description: defaultWorkspace.description,
          is_default: defaultWorkspace.is_default,
          is_archived: defaultWorkspace.is_archived,
          configuration: defaultWorkspace.configuration,
          created_at: defaultWorkspace.created_at,
          updated_at: defaultWorkspace.updated_at,
          last_accessed_at: defaultWorkspace.last_accessed_at,
          version: defaultWorkspace.version
        });
      } catch (e) {
        console.warn('Notice syncing initial workspace to database:', e);
      }
    }

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
    const newWs: UserWorkspace = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      name: name.trim() || 'New Cloud Project',
      description: description.trim(),
      is_default: false,
      is_archived: false,
      configuration: { ...INITIAL_WORKSPACE_CONFIG, version: 1 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      version: 1
    };

    const current = this.getLocalWorkspaces(userId);
    const updated = [newWs, ...current];
    this.saveLocalWorkspaces(userId, updated);
    this.setActiveWorkspaceId(userId, newWs.id);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_workspaces').insert({
          id: newWs.id,
          user_id: newWs.user_id,
          name: newWs.name,
          description: newWs.description,
          is_default: newWs.is_default,
          is_archived: newWs.is_archived,
          configuration: newWs.configuration,
          created_at: newWs.created_at,
          updated_at: newWs.updated_at,
          last_accessed_at: newWs.last_accessed_at,
          version: newWs.version
        });
      } catch (err) {
        console.warn('Notice creating workspace in database:', err);
      }
    }

    return newWs;
  }

  // Save workspace configuration changes
  async saveWorkspaceConfiguration(
    userId: string,
    workspaceId: string,
    newConfig: Partial<WorkspaceConfiguration>
  ): Promise<{ success: boolean; status: WorkspaceSaveStatus; error?: string }> {
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

    const updatedWorkspace: UserWorkspace = {
      ...target,
      configuration: updatedConfig,
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      version: target.version + 1
    };

    currentList[index] = updatedWorkspace;
    this.saveLocalWorkspaces(userId, currentList);

    // Save to Supabase
    if (isSupabaseConfigured && supabase && navigator.onLine) {
      try {
        const { error } = await supabase
          .from('user_workspaces')
          .update({
            configuration: updatedWorkspace.configuration,
            updated_at: updatedWorkspace.updated_at,
            last_accessed_at: updatedWorkspace.last_accessed_at,
            version: updatedWorkspace.version
          })
          .eq('id', workspaceId)
          .eq('user_id', userId);

        if (error) {
          console.warn('Supabase workspace update notice:', error.message);
          return { success: true, status: 'offline' };
        }
        return { success: true, status: 'saved' };
      } catch (err) {
        return { success: true, status: 'offline' };
      }
    }

    return { success: true, status: 'offline' };
  }

  // Duplicate workspace
  async duplicateWorkspace(userId: string, workspaceId: string): Promise<UserWorkspace | null> {
    const list = this.getLocalWorkspaces(userId);
    const target = list.find(w => w.id === workspaceId);
    if (!target) return null;

    const cloned: UserWorkspace = {
      ...target,
      id: crypto.randomUUID ? crypto.randomUUID() : `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `${target.name} (Copy)`,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      version: 1
    };

    const updatedList = [cloned, ...list];
    this.saveLocalWorkspaces(userId, updatedList);
    this.setActiveWorkspaceId(userId, cloned.id);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_workspaces').insert({
          id: cloned.id,
          user_id: cloned.user_id,
          name: cloned.name,
          description: cloned.description,
          is_default: cloned.is_default,
          is_archived: cloned.is_archived,
          configuration: cloned.configuration,
          created_at: cloned.created_at,
          updated_at: cloned.updated_at,
          last_accessed_at: cloned.last_accessed_at,
          version: cloned.version
        });
      } catch (e) {
        console.warn('Notice duplicating workspace in database:', e);
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('user_workspaces')
          .update({ name: target.name, updated_at: target.updated_at })
          .eq('id', workspaceId)
          .eq('user_id', userId);
      } catch {}
    }

    return true;
  }

  // Delete workspace
  async deleteWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    let list = this.getLocalWorkspaces(userId);
    if (list.length <= 1) {
      throw new Error('Cannot delete your only workspace.');
    }

    list = list.filter(w => w.id !== workspaceId);
    this.saveLocalWorkspaces(userId, list);

    const activeId = this.getActiveWorkspaceId(userId);
    if (activeId === workspaceId) {
      this.setActiveWorkspaceId(userId, list[0].id);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('user_workspaces')
          .delete()
          .eq('id', workspaceId)
          .eq('user_id', userId);
      } catch {}
    }

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
      id: crypto.randomUUID ? crypto.randomUUID() : `snap-${Date.now()}`,
      workspace_id: workspaceId,
      user_id: userId,
      snapshot_label: label.trim() || `Snapshot ${new Date().toLocaleTimeString()}`,
      snapshot_data: JSON.parse(JSON.stringify(config)),
      created_at: new Date().toISOString()
    };

    try {
      const existingRaw = localStorage.getItem(this.getSnapshotsKey(workspaceId));
      const list: WorkspaceSnapshot[] = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(snapshot);
      localStorage.setItem(this.getSnapshotsKey(workspaceId), JSON.stringify(list.slice(0, 20)));
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('workspace_snapshots').insert({
          id: snapshot.id,
          workspace_id: snapshot.workspace_id,
          user_id: snapshot.user_id,
          snapshot_label: snapshot.snapshot_label,
          snapshot_data: snapshot.snapshot_data,
          created_at: snapshot.created_at
        });
      } catch {}
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

        if (!error && Array.isArray(data)) {
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

    const imported: UserWorkspace = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      name: `${parsed.name || 'Imported Workspace'} (Imported)`,
      description: parsed.description || 'Imported from backup JSON',
      is_default: false,
      is_archived: false,
      configuration: parsed.configuration,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      version: 1
    };

    const current = this.getLocalWorkspaces(userId);
    const updated = [imported, ...current];
    this.saveLocalWorkspaces(userId, updated);
    this.setActiveWorkspaceId(userId, imported.id);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_workspaces').insert({
          id: imported.id,
          user_id: imported.user_id,
          name: imported.name,
          description: imported.description,
          is_default: imported.is_default,
          is_archived: imported.is_archived,
          configuration: imported.configuration,
          created_at: imported.created_at,
          updated_at: imported.updated_at,
          last_accessed_at: imported.last_accessed_at,
          version: imported.version
        });
      } catch (e) {
        console.warn('Notice syncing imported workspace to Supabase:', e);
      }
    }

    return imported;
  }
}

export const userWorkspaceService = new UserWorkspaceService();
