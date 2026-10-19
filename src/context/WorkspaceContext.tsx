import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  UserWorkspace,
  WorkspaceConfiguration,
  WorkspaceSnapshot,
  WorkspaceSaveStatus
} from '../types/userWorkspace';
import { userWorkspaceService, INITIAL_WORKSPACE_CONFIG } from '../services/userWorkspaceService';

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

  const isDirtyRef = useRef<boolean>(false);
  const pendingConfigRef = useRef<WorkspaceConfiguration>(INITIAL_WORKSPACE_CONFIG);
  const autosaveTimerRef = useRef<any>(null);

  // Load workspaces on user or session change
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const loadedWorkspaces = await userWorkspaceService.fetchUserWorkspaces(effectiveUserId);
        if (!isMounted) return;

        setWorkspaces(loadedWorkspaces);

        const activeId = userWorkspaceService.getActiveWorkspaceId(effectiveUserId);
        const initialActive = loadedWorkspaces.find(w => w.id === activeId) || loadedWorkspaces[0] || null;

        setCurrentWorkspace(initialActive);
        if (initialActive) {
          setActiveConfig(initialActive.configuration);
          pendingConfigRef.current = initialActive.configuration;
          const loadedSnaps = await userWorkspaceService.getSnapshots(initialActive.id);
          if (isMounted) setSnapshots(loadedSnaps);
        }
        setSaveStatus('saved');
      } catch (err) {
        console.warn('Workspace load notice:', err);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId]);

  const reloadSnapshots = useCallback(async () => {
    if (!currentWorkspace) return;
    const s = await userWorkspaceService.getSnapshots(currentWorkspace.id);
    setSnapshots(s);
  }, [currentWorkspace]);

  // Execute actual persistence save
  const executeSave = useCallback(async (configToSave: WorkspaceConfiguration) => {
    if (!currentWorkspace) return;

    setSaveStatus('saving');
    try {
      const res = await userWorkspaceService.saveWorkspaceConfiguration(
        effectiveUserId,
        currentWorkspace.id,
        configToSave
      );
      setSaveStatus(res.status);
      isDirtyRef.current = false;

      // Update in-memory workspace
      setCurrentWorkspace(prev => (prev ? { ...prev, configuration: configToSave, updated_at: new Date().toISOString() } : null));
      setWorkspaces(prevList =>
        prevList.map(w =>
          w.id === currentWorkspace.id ? { ...w, configuration: configToSave, updated_at: new Date().toISOString() } : w
        )
      );
    } catch (e) {
      console.warn('Save error:', e);
      setSaveStatus('failed');
    }
  }, [currentWorkspace, effectiveUserId]);

  // Update configuration with debounced autosave (1200ms)
  const updateConfig = useCallback(
    (patch: Partial<WorkspaceConfiguration>) => {
      setActiveConfig(prev => {
        const next = { ...prev, ...patch };
        pendingConfigRef.current = next;
        isDirtyRef.current = true;
        setSaveStatus('dirty');

        if (autosaveTimerRef.current) {
          clearTimeout(autosaveTimerRef.current);
        }

        autosaveTimerRef.current = setTimeout(() => {
          if (isDirtyRef.current) {
            executeSave(pendingConfigRef.current);
          }
        }, 1200);

        return next;
      });
    },
    [executeSave]
  );

  // Manual save trigger
  const manualSave = useCallback(async () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    await executeSave(pendingConfigRef.current);
  }, [executeSave]);

  // Switch workspace
  const switchWorkspace = useCallback(async (workspaceId: string) => {
    if (isDirtyRef.current) {
      await manualSave();
    }
    const target = workspaces.find(w => w.id === workspaceId);
    if (!target) return;

    userWorkspaceService.setActiveWorkspaceId(effectiveUserId, target.id);
    setCurrentWorkspace(target);
    setActiveConfig(target.configuration);
    pendingConfigRef.current = target.configuration;
    setSaveStatus('saved');

    const snaps = await userWorkspaceService.getSnapshots(target.id);
    setSnapshots(snaps);
  }, [workspaces, manualSave, effectiveUserId]);

  // Create new workspace
  const createNewWorkspace = useCallback(async (name: string, description = '') => {
    if (isDirtyRef.current) {
      await manualSave();
    }
    const created = await userWorkspaceService.createWorkspace(effectiveUserId, name, description);
    setWorkspaces(prev => [created, ...prev]);
    setCurrentWorkspace(created);
    setActiveConfig(created.configuration);
    pendingConfigRef.current = created.configuration;
    setSaveStatus('saved');
    setSnapshots([]);
    return created;
  }, [effectiveUserId, manualSave]);

  // Duplicate current workspace
  const duplicateCurrentWorkspace = useCallback(async () => {
    if (!currentWorkspace) return;
    if (isDirtyRef.current) await manualSave();

    const cloned = await userWorkspaceService.duplicateWorkspace(effectiveUserId, currentWorkspace.id);
    if (cloned) {
      setWorkspaces(prev => [cloned, ...prev]);
      setCurrentWorkspace(cloned);
      setActiveConfig(cloned.configuration);
      pendingConfigRef.current = cloned.configuration;
      setSaveStatus('saved');
      setSnapshots([]);
    }
  }, [currentWorkspace, effectiveUserId, manualSave]);

  // Rename current workspace
  const renameCurrentWorkspace = useCallback(async (newName: string) => {
    if (!currentWorkspace) return;
    await userWorkspaceService.renameWorkspace(effectiveUserId, currentWorkspace.id, newName);
    setCurrentWorkspace(prev => (prev ? { ...prev, name: newName } : null));
    setWorkspaces(prev => prev.map(w => (w.id === currentWorkspace.id ? { ...w, name: newName } : w)));
  }, [currentWorkspace, effectiveUserId]);

  // Delete current workspace
  const deleteCurrentWorkspace = useCallback(async () => {
    if (!currentWorkspace) return;
    try {
      await userWorkspaceService.deleteWorkspace(effectiveUserId, currentWorkspace.id);
      const remaining = workspaces.filter(w => w.id !== currentWorkspace.id);
      setWorkspaces(remaining);
      if (remaining.length > 0) {
        await switchWorkspace(remaining[0].id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete workspace.');
    }
  }, [currentWorkspace, effectiveUserId, workspaces, switchWorkspace]);

  // Create Snapshot
  const createSnapshot = useCallback(async (label: string) => {
    if (!currentWorkspace) return null;
    const snap = await userWorkspaceService.createSnapshot(
      effectiveUserId,
      currentWorkspace.id,
      label,
      activeConfig
    );
    setSnapshots(prev => [snap, ...prev]);
    return snap;
  }, [currentWorkspace, effectiveUserId, activeConfig]);

  // Restore Snapshot
  const restoreSnapshot = useCallback(async (snapshot: WorkspaceSnapshot) => {
    if (!currentWorkspace) return;
    updateConfig(snapshot.snapshot_data);
    await executeSave(snapshot.snapshot_data);
  }, [currentWorkspace, updateConfig, executeSave]);

  // Export current workspace
  const exportCurrentWorkspace = useCallback(() => {
    if (!currentWorkspace) return;
    userWorkspaceService.exportWorkspaceToFile({
      ...currentWorkspace,
      configuration: activeConfig
    });
  }, [currentWorkspace, activeConfig]);

  // Import workspace from JSON file
  const importWorkspaceFromFile = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const imported = await userWorkspaceService.importWorkspace(effectiveUserId, text);
      setWorkspaces(prev => [imported, ...prev]);
      setCurrentWorkspace(imported);
      setActiveConfig(imported.configuration);
      pendingConfigRef.current = imported.configuration;
      setSaveStatus('saved');
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to parse workspace JSON file.');
      return false;
    }
  }, [effectiveUserId]);

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
        reloadSnapshots
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
