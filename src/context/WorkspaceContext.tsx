import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  UserWorkspace,
  WorkspaceConfiguration,
  WorkspaceSnapshot,
  WorkspaceSaveStatus
} from '../types/userWorkspace';
import { userWorkspaceService, INITIAL_WORKSPACE_CONFIG } from '../services/userWorkspaceService';

const AUTOSAVE_DELAY_MS = 1200;
const UNDO_WINDOW_MS = 10000;

interface WorkspaceContextType {
  currentWorkspace: UserWorkspace | null;
  workspaces: UserWorkspace[];
  activeConfig: WorkspaceConfiguration;
  saveStatus: WorkspaceSaveStatus;
  isWorkspaceDrawerOpen: boolean;
  setIsWorkspaceDrawerOpen: (open: boolean) => void;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createNewWorkspace: (name: string, description?: string) => Promise<UserWorkspace>;
  updateConfig: (patch: Partial<WorkspaceConfiguration>) => void;
  manualSave: () => Promise<void>;
  duplicateCurrentWorkspace: () => Promise<void>;
  renameCurrentWorkspace: (newName: string) => Promise<void>;
  deleteCurrentWorkspace: () => Promise<void>;
  createSnapshot: (label: string) => Promise<WorkspaceSnapshot | null>;
  restoreSnapshot: (snapshot: WorkspaceSnapshot) => Promise<void>;
  exportCurrentWorkspace: () => void;
  importWorkspaceFromFile: (file: File) => Promise<boolean>;
  snapshots: WorkspaceSnapshot[];
  reloadSnapshots: () => Promise<void>;
  // New: undo for delete
  recentlyDeleted: UserWorkspace | null;
  undoDelete: () => Promise<void>;
  dismissDeleteUndo: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const effectiveUserId = user?.uid || 'guest-public-session';

  const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<UserWorkspace | null>(null);
  const [activeConfig, setActiveConfig] = useState<WorkspaceConfiguration>(INITIAL_WORKSPACE_CONFIG);
  const [saveStatus, setSaveStatus] = useState<WorkspaceSaveStatus>('saved');
  const [isWorkspaceDrawerOpen, setIsWorkspaceDrawerOpen] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>([]);
  const [recentlyDeleted, setRecentlyDeleted] = useState<UserWorkspace | null>(null);

  const isDirtyRef = useRef<boolean>(false);
  const pendingConfigRef = useRef<WorkspaceConfiguration>(INITIAL_WORKSPACE_CONFIG);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always points at the workspace that edits belong to, so a delayed save never lands in the wrong one
  const currentWorkspaceRef = useRef<UserWorkspace | null>(null);
  // Saves run one after another, so an older save can never finish after a newer one
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const clearAutosaveTimer = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }, []);

  // Make a workspace the active one (state + refs together)
  const activate = useCallback((ws: UserWorkspace) => {
    currentWorkspaceRef.current = ws;
    pendingConfigRef.current = ws.configuration;
    isDirtyRef.current = false;
    setCurrentWorkspace(ws);
    setActiveConfig(ws.configuration);
    setSaveStatus('saved');
  }, []);

  // Load workspaces on user or session change
  useEffect(() => {
    let isMounted = true;
    clearAutosaveTimer();

    async function load() {
      try {
        const loadedWorkspaces = await userWorkspaceService.fetchUserWorkspaces(effectiveUserId);
        if (!isMounted) return;

        setWorkspaces(loadedWorkspaces);

        const activeId = userWorkspaceService.getActiveWorkspaceId(effectiveUserId);
        const initialActive = loadedWorkspaces.find(w => w.id === activeId) || loadedWorkspaces[0] || null;

        if (initialActive) {
          activate(initialActive);
          const loadedSnaps = await userWorkspaceService.getSnapshots(initialActive.id);
          if (isMounted) setSnapshots(loadedSnaps);
        } else {
          currentWorkspaceRef.current = null;
          setCurrentWorkspace(null);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.warn('Workspace load notice:', err);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId, activate, clearAutosaveTimer]);

  const reloadSnapshots = useCallback(async () => {
    const ws = currentWorkspaceRef.current;
    if (!ws) return;
    const s = await userWorkspaceService.getSnapshots(ws.id);
    setSnapshots(s);
  }, []);

  // Execute actual persistence save. Queued so saves never overlap.
  const executeSave = useCallback(
    (configToSave: WorkspaceConfiguration): Promise<void> => {
      const run = async () => {
        const ws = currentWorkspaceRef.current;
        if (!ws) return;

        setSaveStatus('saving');
        try {
          const res = await userWorkspaceService.saveWorkspaceConfiguration(effectiveUserId, ws.id, configToSave);
          const stillCurrent = currentWorkspaceRef.current?.id === ws.id;

          if (!res.success || !res.workspace) {
            if (stillCurrent) setSaveStatus('failed');
            return;
          }

          const saved = res.workspace;
          setWorkspaces(prevList =>
            prevList.map(w =>
              w.id === saved.id
                ? { ...w, configuration: saved.configuration, updated_at: saved.updated_at, version: saved.version }
                : w
            )
          );

          if (!stillCurrent) return;

          const merged = {
            ...(currentWorkspaceRef.current as UserWorkspace),
            configuration: saved.configuration,
            updated_at: saved.updated_at,
            version: saved.version
          };
          currentWorkspaceRef.current = merged;
          setCurrentWorkspace(merged);

          // Only mark clean if nothing newer was typed while this save was running
          if (pendingConfigRef.current === configToSave) {
            isDirtyRef.current = false;
            setSaveStatus(res.status);
          } else {
            setSaveStatus('dirty');
          }
        } catch (e) {
          console.warn('Save error:', e);
          if (currentWorkspaceRef.current?.id === ws.id) setSaveStatus('failed');
        }
      };

      const next = saveQueueRef.current.then(run, run);
      saveQueueRef.current = next;
      return next;
    },
    [effectiveUserId]
  );

  // Update configuration with debounced autosave. No side effects inside a state updater.
  const updateConfig = useCallback(
    (patch: Partial<WorkspaceConfiguration>) => {
      const next = { ...pendingConfigRef.current, ...patch };
      pendingConfigRef.current = next;
      isDirtyRef.current = true;
      setActiveConfig(next);
      setSaveStatus('dirty');

      clearAutosaveTimer();
      autosaveTimerRef.current = setTimeout(() => {
        autosaveTimerRef.current = null;
        if (isDirtyRef.current) {
          void executeSave(pendingConfigRef.current);
        }
      }, AUTOSAVE_DELAY_MS);
    },
    [executeSave, clearAutosaveTimer]
  );

  // Save when the tab is hidden or closed, and clean up the timer on unmount
  useEffect(() => {
    const flush = () => {
      const ws = currentWorkspaceRef.current;
      if (!ws || !isDirtyRef.current) return;
      clearAutosaveTimer();
      // Synchronous local write first: it is guaranteed to finish even if the page is closing
      userWorkspaceService.persistLocalDraft(effectiveUserId, ws.id, pendingConfigRef.current);
      void executeSave(pendingConfigRef.current);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
      clearAutosaveTimer();
    };
  }, [effectiveUserId, executeSave, clearAutosaveTimer]);

  // Manual save trigger
  const manualSave = useCallback(async () => {
    clearAutosaveTimer();
    await executeSave(pendingConfigRef.current);
  }, [executeSave, clearAutosaveTimer]);

  // Switch workspace
  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (currentWorkspaceRef.current?.id === workspaceId) return;
      if (isDirtyRef.current) {
        await manualSave();
      }
      const target = workspaces.find(w => w.id === workspaceId);
      if (!target) return;

      userWorkspaceService.setActiveWorkspaceId(effectiveUserId, target.id);
      activate(target);

      const snaps = await userWorkspaceService.getSnapshots(target.id);
      setSnapshots(snaps);
    },
    [workspaces, manualSave, effectiveUserId, activate]
  );

  // Create new workspace
  const createNewWorkspace = useCallback(
    async (name: string, description = '') => {
      if (isDirtyRef.current) {
        await manualSave();
      }
      const created = await userWorkspaceService.createWorkspace(effectiveUserId, name, description);
      setWorkspaces(prev => [created, ...prev]);
      activate(created);
      setSnapshots([]);
      return created;
    },
    [effectiveUserId, manualSave, activate]
  );

  // Duplicate current workspace
  const duplicateCurrentWorkspace = useCallback(async () => {
    const ws = currentWorkspaceRef.current;
    if (!ws) return;
    if (isDirtyRef.current) await manualSave();

    const cloned = await userWorkspaceService.duplicateWorkspace(effectiveUserId, ws.id);
    if (cloned) {
      setWorkspaces(prev => [cloned, ...prev]);
      activate(cloned);
      setSnapshots([]);
    }
  }, [effectiveUserId, manualSave, activate]);

  // Rename current workspace
  const renameCurrentWorkspace = useCallback(
    async (newName: string) => {
      const ws = currentWorkspaceRef.current;
      if (!ws) return;
      const ok = await userWorkspaceService.renameWorkspace(effectiveUserId, ws.id, newName);
      if (!ok) return;

      const trimmed = newName.trim();
      if (currentWorkspaceRef.current?.id === ws.id) {
        const renamed = { ...currentWorkspaceRef.current, name: trimmed };
        currentWorkspaceRef.current = renamed;
        setCurrentWorkspace(renamed);
      }
      setWorkspaces(prev => prev.map(w => (w.id === ws.id ? { ...w, name: trimmed } : w)));
    },
    [effectiveUserId]
  );

  // Delete current workspace: saved first, then archived (recoverable), with a short undo window
  const deleteCurrentWorkspace = useCallback(async () => {
    const ws = currentWorkspaceRef.current;
    if (!ws) return;
    try {
      // Save pending edits into the workspace being removed, so Undo brings back the latest state
      if (isDirtyRef.current) await manualSave();

      const archived = await userWorkspaceService.archiveWorkspace(effectiveUserId, ws.id);
      const remaining = workspaces.filter(w => w.id !== ws.id);
      setWorkspaces(remaining);
      setRecentlyDeleted(archived);

      if (remaining.length > 0) {
        const next = remaining[0];
        userWorkspaceService.setActiveWorkspaceId(effectiveUserId, next.id);
        activate(next);
        const snaps = await userWorkspaceService.getSnapshots(next.id);
        setSnapshots(snaps);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete workspace.');
    }
  }, [effectiveUserId, workspaces, manualSave, activate]);

  const dismissDeleteUndo = useCallback(() => setRecentlyDeleted(null), []);

  // Undo window closes by itself
  useEffect(() => {
    if (!recentlyDeleted) return;
    const t = setTimeout(() => setRecentlyDeleted(null), UNDO_WINDOW_MS);
    return () => clearTimeout(t);
  }, [recentlyDeleted]);

  const undoDelete = useCallback(async () => {
    const deleted = recentlyDeleted;
    if (!deleted) return;
    try {
      if (isDirtyRef.current) await manualSave();
      const restored = await userWorkspaceService.restoreWorkspace(effectiveUserId, deleted.id);
      if (!restored) return;

      setWorkspaces(prev => [restored, ...prev.filter(w => w.id !== restored.id)]);
      activate(restored);
      const snaps = await userWorkspaceService.getSnapshots(restored.id);
      setSnapshots(snaps);
      setRecentlyDeleted(null);
    } catch (err: any) {
      alert(err.message || 'Failed to restore workspace.');
    }
  }, [recentlyDeleted, effectiveUserId, manualSave, activate]);

  // Create Snapshot (always uses the latest edits, including ones not yet autosaved)
  const createSnapshot = useCallback(
    async (label: string) => {
      const ws = currentWorkspaceRef.current;
      if (!ws) return null;
      const snap = await userWorkspaceService.createSnapshot(
        effectiveUserId,
        ws.id,
        label,
        pendingConfigRef.current
      );
      if (currentWorkspaceRef.current?.id === ws.id) {
        setSnapshots(prev => [snap, ...prev]);
      }
      return snap;
    },
    [effectiveUserId]
  );

  // Restore Snapshot: backs up the current state first, then saves once
  const restoreSnapshot = useCallback(
    async (snapshot: WorkspaceSnapshot) => {
      const ws = currentWorkspaceRef.current;
      if (!ws) return;

      await createSnapshot(`Auto-backup before restoring "${snapshot.snapshot_label}"`);

      const restored: WorkspaceConfiguration = JSON.parse(JSON.stringify(snapshot.snapshot_data));
      clearAutosaveTimer();
      pendingConfigRef.current = restored;
      isDirtyRef.current = true;
      setActiveConfig(restored);
      setSaveStatus('dirty');
      await executeSave(restored);
    },
    [createSnapshot, executeSave, clearAutosaveTimer]
  );

  // Export current workspace
  const exportCurrentWorkspace = useCallback(() => {
    const ws = currentWorkspaceRef.current;
    if (!ws) return;
    userWorkspaceService.exportWorkspaceToFile({
      ...ws,
      configuration: pendingConfigRef.current
    });
  }, []);

  // Import workspace from JSON file
  const importWorkspaceFromFile = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        const text = await file.text();
        // Save pending edits first, otherwise they could end up in the imported workspace
        if (isDirtyRef.current) await manualSave();
        const imported = await userWorkspaceService.importWorkspace(effectiveUserId, text);
        setWorkspaces(prev => [imported, ...prev]);
        activate(imported);
        setSnapshots([]);
        return true;
      } catch (err: any) {
        alert(err.message || 'Failed to parse workspace JSON file.');
        return false;
      }
    },
    [effectiveUserId, manualSave, activate]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        activeConfig,
        saveStatus,
        isWorkspaceDrawerOpen,
        setIsWorkspaceDrawerOpen,
        switchWorkspace,
        createNewWorkspace,
        updateConfig,
        manualSave,
        duplicateCurrentWorkspace,
        renameCurrentWorkspace,
        deleteCurrentWorkspace,
        createSnapshot,
        restoreSnapshot,
        exportCurrentWorkspace,
        importWorkspaceFromFile,
        snapshots,
        reloadSnapshots,
        recentlyDeleted,
        undoDelete,
        dismissDeleteUndo
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
