import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FolderKanban,
  Search,
  AlertTriangle,
  Download,
  User,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { UserWorkspace } from '../../../types/userWorkspace';
import { AdminUserProfile, adminService } from '../../../services/adminService';

interface AdminWorkspacesViewProps {
  users: AdminUserProfile[];
  currentUserEmail: string;
}

// Lightweight row used for the list. The full configuration is only loaded when a workspace is opened.
interface WorkspaceListRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  sizing_vms: string | null;
  rvtools_vms: string | null;
  nc2_nodes: string | null;
}

const PAGE_SIZE = 12;
const EXPORT_LIMIT = 5000;

const LIST_COLUMNS =
  'id,user_id,name,description,is_default,is_archived,created_at,updated_at,version,' +
  'sizing_vms:configuration->nodeSizing->>targetVmCount,' +
  'rvtools_vms:configuration->rvtoolsAssessment->>vmCount,' +
  'nc2_nodes:configuration->nutanixNC2->>nodeCount';

// Remove characters that have a special meaning inside a PostgREST filter string
const cleanSearch = (raw: string): string => raw.replace(/[,()%_*\\]/g, ' ').trim();

export const AdminWorkspacesView: React.FC<AdminWorkspacesViewProps> = ({ users, currentUserEmail }) => {
  const [rows, setRows] = useState<WorkspaceListRow[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<WorkspaceListRow | null>(null);
  const [selectedFull, setSelectedFull] = useState<UserWorkspace | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState<string | null>(null);

  const loadRequestRef = useRef(0);

  const getOwnerEmail = useCallback(
    (userId: string) => {
      const owner = users.find((u) => u.id === userId);
      return owner?.email || `User: ${userId.substring(0, 10)}...`;
    },
    [users]
  );

  // Debounce the search box so we do not query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(cleanSearch(searchInput));
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Build the query shared by the list and the CSV export
  const buildQuery = useCallback(
    (columns: string, withCount: boolean) => {
      if (!supabase) return null;
      let query = supabase
        .from('user_workspaces')
        .select(columns, withCount ? { count: 'exact' } : undefined)
        .eq('is_archived', showArchived)
        .order('updated_at', { ascending: false });

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const ownerIds = users
          .filter((u) => (u.email || '').toLowerCase().includes(q))
          .map((u) => u.id)
          .slice(0, 50);
        const parts = [`name.ilike.%${searchTerm}%`, `description.ilike.%${searchTerm}%`];
        if (ownerIds.length > 0) parts.push(`user_id.in.(${ownerIds.join(',')})`);
        query = query.or(parts.join(','));
      }
      return query;
    },
    [searchTerm, showArchived, users]
  );

  const loadWorkspaces = useCallback(async () => {
    const requestId = ++loadRequestRef.current;

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured, so client workspaces cannot be loaded.');
      setRows([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    const query = buildQuery(LIST_COLUMNS, true);
    if (!query) return;

    const from = page * PAGE_SIZE;
    const { data, error: queryError, count } = await query.range(from, from + PAGE_SIZE - 1);

    // Ignore results from an older request that finished late
    if (requestId !== loadRequestRef.current) return;

    if (queryError) {
      setError(`Could not load workspaces: ${queryError.message}`);
      setRows([]);
      setTotalCount(0);
    } else {
      setRows((data as unknown as WorkspaceListRow[]) || []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [buildQuery, page]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  // Reset to the first page when the archive filter changes
  useEffect(() => {
    setPage(0);
  }, [showArchived]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Rows on this page whose owner is not in the loaded user list
  const validUserIds = new Set(users.map((u) => u.id));
  const orphanedCount = rows.filter((ws) => !validUserIds.has(ws.user_id)).length;

  const openWorkspace = async (ws: WorkspaceListRow) => {
    setSelected(ws);
    setSelectedFull(null);
    setSelectedError(null);
    setSelectedLoading(true);

    if (!supabase) {
      setSelectedError('Supabase is not configured.');
      setSelectedLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('user_workspaces')
      .select('*')
      .eq('id', ws.id)
      .maybeSingle();

    if (fetchError || !data) {
      setSelectedError(fetchError?.message || 'Workspace not found.');
      setSelectedLoading(false);
      void adminService.logAuditEvent({
        actorEmail: currentUserEmail,
        actorRole: 'admin',
        action: 'VIEW_CLIENT_WORKSPACE_CONFIG',
        targetEntity: 'user_workspaces',
        outcome: 'failure',
        metadata: { workspace_id: ws.id, owner_user_id: ws.user_id }
      });
      return;
    }

    setSelectedFull(data as UserWorkspace);
    setSelectedLoading(false);

    // Viewing a client's configuration is recorded
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'VIEW_CLIENT_WORKSPACE_CONFIG',
      targetEntity: 'user_workspaces',
      outcome: 'success',
      metadata: { workspace_id: ws.id, owner_user_id: ws.user_id }
    });
  };

  const closeInspector = useCallback(() => {
    setSelected(null);
    setSelectedFull(null);
    setSelectedError(null);
  }, []);

  // Esc closes the inspector
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeInspector();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, closeInspector]);

  const handleExportCsv = async () => {
    const query = buildQuery('id,user_id,name,created_at,updated_at,version,is_archived', false);
    if (!query) return;
    const { data, error: exportError } = await query.limit(EXPORT_LIMIT);

    if (exportError) {
      setError(`Export failed: ${exportError.message}`);
      return;
    }

    const exportRows = ((data as unknown as WorkspaceListRow[]) || []).map((w) => ({
      id: w.id,
      name: w.name,
      owner_email: getOwnerEmail(w.user_id),
      created_at: w.created_at,
      updated_at: w.updated_at,
      version: w.version,
      archived: w.is_archived
    }));

    adminService.exportToCsv('zaboraa_client_workspaces', exportRows);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_CLIENT_WORKSPACES_CSV',
      targetEntity: 'user_workspaces',
      outcome: 'success',
      metadata: { count: exportRows.length, search: searchTerm || null, archived: showArchived }
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
          <h1 className="text-xl font-bold text-white tracking-tight">Client Workspaces & Sizing Snapshots</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Live data from the database. Opening a workspace is recorded in the audit log.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void loadWorkspaces()}
            aria-label="Refresh workspaces"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => void handleExportCsv()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Workspaces CSV</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orphaned Records Notice */}
      {orphanedCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Unmatched owners on this page: </span>
              {orphanedCount} workspace(s) belong to a user who is not in the loaded user list.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-900/80 font-mono text-[10px] uppercase font-bold text-amber-100">
            Review Needed
          </span>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search workspace title, owner email, description..."
            aria-label="Search workspaces"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-cyan-500"
          />
          Show deleted (archived)
        </label>
        <div className="text-xs font-mono text-slate-400">
          Matching: <span className="text-white font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Workspaces Grid */}
      {!loading && !error && rows.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          No workspaces found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((ws) => (
          <div
            key={ws.id}
            role="button"
            tabIndex={0}
            onClick={() => void openWorkspace(ws)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                void openWorkspace(ws);
              }
            }}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer shadow-sm hover:shadow-md space-y-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                    {ws.name}
                  </span>
                  {ws.is_default && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono">
                      DEFAULT
                    </span>
                  )}
                  {ws.is_archived && (
                    <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 text-[9px] font-mono">
                      DELETED
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{ws.description}</div>
              </div>
              <span className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
                <FolderKanban className="w-4 h-4" />
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              {ws.sizing_vms !== null && (
                <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                  Node Sizing ({ws.sizing_vms} VMs)
                </span>
              )}
              {ws.rvtools_vms !== null && (
                <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800">
                  RVTools Ingestion
                </span>
              )}
              {ws.nc2_nodes !== null && (
                <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">
                  Nutanix NC2 Sizer
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[150px]">{getOwnerEmail(ws.user_id)}</span>
              </div>
              <div>Updated {new Date(ws.updated_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between text-xs text-slate-300">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <span className="font-mono">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Workspace Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={closeInspector}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Client workspace inspector"
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  CLIENT WORKSPACE INSPECTOR
                </span>
                <h2 className="text-base font-bold text-white">{selected.name}</h2>
              </div>
              <button
                onClick={closeInspector}
                aria-label="Close inspector"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
              <div>
                Owner: <span className="text-white font-bold">{getOwnerEmail(selected.user_id)}</span>
              </div>
              <div>
                Workspace ID: <span className="text-slate-400">{selected.id}</span>
              </div>
              <div>
                Created: <span className="text-slate-400">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div>
                Last Synced:{' '}
                <span className="text-cyan-300 font-bold">{new Date(selected.updated_at).toLocaleString()}</span>
              </div>
              <div>
                Version: <span className="text-slate-400">{selected.version}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                Configuration Payload JSON:
              </span>
              {selectedLoading && <div className="text-xs text-slate-400 py-6 text-center">Loading configuration...</div>}
              {selectedError && (
                <div className="text-xs text-red-300 py-3">Could not load configuration: {selectedError}</div>
              )}
              {selectedFull && (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-72">
                  {JSON.stringify(selectedFull.configuration, null, 2)}
                </pre>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={closeInspector}
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
