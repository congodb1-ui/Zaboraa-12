import React, { useState } from 'react';
import {
  FolderKanban,
  X,
  Plus,
  Save,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Copy,
  Trash2,
  Camera,
  RotateCcw,
  Layers,
  Cpu,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Cloud,
  FileJson
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceSnapshot } from '../../types/userWorkspace';

export const UserWorkspaceDrawer: React.FC = () => {
  const { user } = useAuth();
  const {
    currentWorkspace,
    workspaces,
    activeConfig,
    saveStatus,
    isWorkspaceDrawerOpen,
    setIsWorkspaceDrawerOpen,
    switchWorkspace,
    createNewWorkspace,
    manualSave,
    duplicateCurrentWorkspace,
    renameCurrentWorkspace,
    deleteCurrentWorkspace,
    createSnapshot,
    restoreSnapshot,
    exportCurrentWorkspace,
    importWorkspaceFromFile,
    snapshots
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'workspaces' | 'snapshots' | 'export_import'>('workspaces');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);

  if (!isWorkspaceDrawerOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    await createNewWorkspace(newWorkspaceName, newWorkspaceDesc);
    setNewWorkspaceName('');
    setNewWorkspaceDesc('');
    setIsCreating(false);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    await renameCurrentWorkspace(renameValue);
    setIsRenaming(false);
  };

  const handleTakeSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotLabel.trim()) return;
    await createSnapshot(snapshotLabel);
    setSnapshotLabel('');
    setIsTakingSnapshot(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importWorkspaceFromFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="absolute inset-0" onClick={() => setIsWorkspaceDrawerOpen(false)} />

      <div
        data-theme-container="dark"
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-xl bg-[#0b1120] border-l-2 border-slate-700 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-6 border-b-2 border-slate-700 bg-[#060a14] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>My Cloud Workspaces</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      saveStatus === 'saved'
                        ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                        : saveStatus === 'saving'
                        ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300 animate-pulse'
                        : saveStatus === 'dirty'
                        ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                        : 'bg-slate-800 border-slate-600 text-slate-300'
                    }`}
                  >
                    {saveStatus}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Persistent multi-cloud project workspaces & automatic state restoration.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsWorkspaceDrawerOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Workspace Bar */}
          {currentWorkspace && (
            <div className="px-6 py-3 bg-[#10192e] border-b border-slate-700 flex items-center justify-between">
              <div className="truncate pr-3">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Active Project
                </span>
                <span className="text-sm font-extrabold text-white truncate block">
                  {currentWorkspace.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={manualSave}
                  disabled={saveStatus === 'saving'}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  title="Force immediate save to cloud & local storage"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Now'}</span>
                </button>

                <button
                  onClick={() => {
                    setRenameValue(currentWorkspace.name);
                    setIsRenaming(true);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                  title="Rename workspace"
                >
                  Rename
                </button>
              </div>
            </div>
          )}

          {/* Segmented Tabs */}
          <div className="px-6 pt-4 pb-2 border-b border-slate-800 bg-[#060a14] flex gap-2">
            <button
              onClick={() => setActiveTab('workspaces')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'workspaces'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Workspaces ({workspaces.length})
            </button>
            <button
              onClick={() => setActiveTab('snapshots')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'snapshots'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Snapshots & Versions ({snapshots.length})
            </button>
            <button
              onClick={() => setActiveTab('export_import')}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'export_import'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Export / Import
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* TAB 1: WORKSPACES LIST */}
            {activeTab === 'workspaces' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Switch or Create Workspace
                  </span>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Project</span>
                  </button>
                </div>

                {isCreating && (
                  <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-[#131d31] border-2 border-cyan-500/60 space-y-3">
                    <span className="text-xs font-bold text-white uppercase block">Create New Cloud Project</span>
                    <input
                      type="text"
                      placeholder="Project Name (e.g. Nutanix NC2 Migration)"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="w-full bg-[#060a14] border-2 border-slate-600 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 font-semibold focus:outline-none focus:border-cyan-400"
                      required
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newWorkspaceDesc}
                      onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                      className="w-full bg-[#060a14] border-2 border-slate-600 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 font-medium focus:outline-none focus:border-cyan-400"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                      >
                        Create Workspace
                      </button>
                    </div>
                  </form>
                )}

                {isRenaming && (
                  <form onSubmit={handleRename} className="p-4 rounded-2xl bg-[#131d31] border-2 border-cyan-500/60 space-y-3">
                    <span className="text-xs font-bold text-white uppercase block">Rename Active Workspace</span>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="w-full bg-[#060a14] border-2 border-slate-600 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"
                      required
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRenaming(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                      >
                        Save Name
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {workspaces.map((ws) => {
                    const isActive = currentWorkspace?.id === ws.id;
                    return (
                      <div
                        key={ws.id}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#142340] border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                            : 'bg-[#10192e] border-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => switchWorkspace(ws.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white">{ws.name}</span>
                              {ws.is_default && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-300">
                                  DEFAULT
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            {ws.description && (
                              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                                {ws.description}
                              </p>
                            )}
                            <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-2">
                              <span>Updated {new Date(ws.updated_at).toLocaleDateString()}</span>
                              <span>·</span>
                              <span>v{ws.version}</span>
                            </div>
                          </div>

                          {isActive && (
                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={duplicateCurrentWorkspace}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200"
                                title="Duplicate workspace"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {workspaces.length > 1 && (
                                <button
                                  onClick={deleteCurrentWorkspace}
                                  className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300"
                                  title="Delete workspace"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SNAPSHOTS */}
            {activeTab === 'snapshots' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Configuration History & Milestones
                  </span>
                  <button
                    onClick={() => setIsTakingSnapshot(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Create Snapshot</span>
                  </button>
                </div>

                {isTakingSnapshot && (
                  <form onSubmit={handleTakeSnapshot} className="p-4 rounded-2xl bg-[#131d31] border-2 border-cyan-500/60 space-y-3">
                    <span className="text-xs font-bold text-white uppercase block">Snapshot Label</span>
                    <input
                      type="text"
                      placeholder="e.g. Prior to RVTools Bulk Wave Import"
                      value={snapshotLabel}
                      onChange={(e) => setSnapshotLabel(e.target.value)}
                      className="w-full bg-[#060a14] border-2 border-slate-600 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 font-semibold focus:outline-none focus:border-cyan-400"
                      required
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsTakingSnapshot(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                      >
                        Save Snapshot
                      </button>
                    </div>
                  </form>
                )}

                {snapshots.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#10192e] border-2 border-slate-800 text-slate-400 text-xs space-y-2">
                    <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="font-bold text-slate-300">No snapshots recorded yet.</p>
                    <p>Create snapshots before major sizing runs or RVTools imports to roll back anytime.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-4 rounded-2xl bg-[#10192e] border-2 border-slate-700 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-extrabold text-sm text-white">{snap.snapshot_label}</div>
                          <div className="text-[11px] font-mono text-cyan-300 mt-1">
                            {new Date(snap.created_at).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Restore snapshot "${snap.snapshot_label}"? Current workspace state will be replaced.`)) {
                              restoreSnapshot(snap);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Restore</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXPORT / IMPORT */}
            {activeTab === 'export_import' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[#10192e] border-2 border-slate-700 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Download className="w-5 h-5 text-cyan-400" />
                    <span className="font-extrabold text-sm text-white">Export Workspace Configuration</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Download the complete parameter state of "{currentWorkspace?.name}" as a portable, verified JSON file. Compatible across all browser sessions and offline environments.
                  </p>
                  <button
                    onClick={exportCurrentWorkspace}
                    className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Export</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-[#10192e] border-2 border-slate-700 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span className="font-extrabold text-sm text-white">Import Workspace Configuration</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Load a previously exported Zaboraa workspace JSON. It will be added as a new project without overwriting your current active configuration.
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md">
                    <FileJson className="w-4 h-4 text-emerald-400" />
                    <span>Select JSON File</span>
                    <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
