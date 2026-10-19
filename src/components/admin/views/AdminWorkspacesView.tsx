import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  Layers,
  User,
  HardDrive,
  RefreshCw,
  X
} from 'lucide-react';
import { userWorkspaceService } from '../../../services/userWorkspaceService';
import { UserWorkspace } from '../../../types/userWorkspace';
import { AdminUserProfile, adminService } from '../../../services/adminService';

interface AdminWorkspacesViewProps {
  users: AdminUserProfile[];
  currentUserEmail: string;
}

export const AdminWorkspacesView: React.FC<AdminWorkspacesViewProps> = ({
  users,
  currentUserEmail
}) => {
  const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWs, setSelectedWs] = useState<UserWorkspace | null>(null);
  const [orphanedCount, setOrphanedCount] = useState<number>(0);

  const loadWorkspaces = () => {
    // Collect local workspaces across stored users + fallback mock projects
    const allWs: UserWorkspace[] = [];

    users.forEach((u) => {
      const userWorkspaces = userWorkspaceService.getLocalWorkspaces(u.id);
      allWs.push(...userWorkspaces);
    });

    // If empty or standalone, provide enterprise baseline projects for review
    if (allWs.length === 0) {
      allWs.push(
        {
          id: 'ws-prod-avs-01',
          user_id: 'usr-wasim-admin',
          name: 'Global Financial - Azure AVS Decoupled ANF Cluster',
          description: 'Production migration blueprint moving 1,800 VMs with NetApp NFS storage decoupling.',
          is_default: true,
          is_archived: false,
          created_at: '2026-03-01T10:00:00Z',
          updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          last_accessed_at: new Date().toISOString(),
          version: 2,
          configuration: {
            nodeSizing: {
              cloudProvider: 'Azure AVS',
              presetKey: 'av36',
              targetVmCount: 1800,
              avgVcpuPerVm: 4,
              avgRamPerVmGB: 16,
              avgStoragePerVmGB: 100,
              vcpuOvercommit: 3.0,
              ramBufferPercent: 20,
              storagePolicy: 'raid-1',
              externalNfsOffloadPercent: 50,
              anfPerformanceTier: 'Premium',
              notes: 'Evaluated 48 to 16 compute node reduction.',
              updatedAt: new Date().toISOString()
            },
            version: 1
          } as any
        },
        {
          id: 'ws-nc2-aws-02',
          user_id: 'usr-demo-arch',
          name: 'HealthCore Systems - Epic NC2 on AWS Disaster Recovery',
          description: 'Nutanix NC2 assessment with Nutanix Move replication waves and WAN sizing.',
          is_default: false,
          is_archived: false,
          created_at: '2026-03-12T14:30:00Z',
          updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
          last_accessed_at: new Date(Date.now() - 3600000 * 12).toISOString(),
          version: 1,
          configuration: {
            nutanixNC2: {
              selectedNode: 'i3en.metal (AWS EC2)',
              nodeCount: 12,
              dsfReplicationFactor: 'RF2',
              dedupCompressionRatio: 1.6,
              ahvVirtioReadyPercent: 96,
              lastAssessedAt: new Date().toISOString()
            },
            version: 1
          } as any
        }
      );
    }

    setWorkspaces(allWs);

    // Audit orphaned workspaces (user_id not in existing users list)
    const validUserIds = new Set(users.map((u) => u.id));
    const orphans = allWs.filter((ws) => !validUserIds.has(ws.user_id));
    setOrphanedCount(orphans.length);
  };

  useEffect(() => {
    loadWorkspaces();
  }, [users]);

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      !searchTerm ||
      ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOwnerEmail = (userId: string) => {
    const owner = users.find((u) => u.id === userId);
    return owner?.email || `User: ${userId.substring(0, 10)}...`;
  };

  const handleExportCsv = () => {
    const rows = filteredWorkspaces.map((w) => ({
      id: w.id,
      name: w.name,
      owner_email: getOwnerEmail(w.user_id),
      created_at: w.created_at,
      updated_at: w.updated_at,
      version: w.version
    }));
    adminService.exportToCsv('zaboraa_client_workspaces', rows);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_CLIENT_WORKSPACES_CSV',
      targetEntity: 'user_workspaces',
      outcome: 'success',
      metadata: { count: rows.length }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>CLIENT PROJECT WORKSPACES & ISOLATION</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Client Workspaces & Sizing Snapshots
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Audit customer sizing projects, verify strict user isolation, check autosave synchronization status, and detect orphaned records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Workspaces CSV</span>
          </button>
        </div>
      </div>

      {/* Orphaned Records Notice if any */}
      {orphanedCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Orphaned Records Detected: </span>
              {orphanedCount} workspace(s) belong to deleted or unlinked user accounts.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-900/80 font-mono text-[10px] uppercase font-bold text-amber-100">
            Review Needed
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search workspace title, owner, description..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Workspaces: <span className="text-white font-bold">{workspaces.length}</span>
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkspaces.map((ws) => {
          const ownerEmail = getOwnerEmail(ws.user_id);
          const hasSizing = Boolean(ws.configuration?.nodeSizing);
          const hasRvTools = Boolean(ws.configuration?.rvtoolsAssessment);
          const hasNc2 = Boolean(ws.configuration?.nutanixNC2);

          return (
            <div
              key={ws.id}
              onClick={() => setSelectedWs(ws)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer shadow-sm hover:shadow-md space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                      {ws.name}
                    </span>
                    {ws.is_default && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{ws.description}</div>
                </div>
                <span className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
                  <FolderKanban className="w-4 h-4" />
                </span>
              </div>

              {/* Module Badges */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {hasSizing && (
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                    Node Sizing ({ws.configuration.nodeSizing?.targetVmCount || 0} VMs)
                  </span>
                )}
                {hasRvTools && (
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800">
                    RVTools Ingestion
                  </span>
                )}
                {hasNc2 && (
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">
                    Nutanix NC2 Sizer
                  </span>
                )}
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[150px]">{ownerEmail}</span>
                </div>
                <div>Updated {new Date(ws.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Workspace Modal */}
      {selectedWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  CLIENT WORKSPACE INSPECTOR
                </span>
                <h2 className="text-base font-bold text-white">{selectedWs.name}</h2>
              </div>
              <button
                onClick={() => setSelectedWs(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
              <div>Owner: <span className="text-white font-bold">{getOwnerEmail(selectedWs.user_id)}</span></div>
              <div>Workspace ID: <span className="text-slate-400">{selectedWs.id}</span></div>
              <div>Created: <span className="text-slate-400">{new Date(selectedWs.created_at).toLocaleString()}</span></div>
              <div>Last Synced: <span className="text-cyan-300 font-bold">{new Date(selectedWs.updated_at).toLocaleString()}</span></div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Configuration Payload JSON:</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-72">
                {JSON.stringify(selectedWs.configuration, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedWs(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
