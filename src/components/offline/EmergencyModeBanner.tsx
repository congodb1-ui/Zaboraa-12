import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCustomization } from '../../context/CustomizationContext';
import { offlineVaultService, QueuedOfflineAction } from '../../services/offlineVaultService';
import {
  WifiOff,
  Wifi,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  Sliders,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';

export const EmergencyModeBanner: React.FC = () => {
  const {
    user,
    isAdmin,
    isOfflineAdminSession,
    lockOfflineAdminSession,
    offlineVaultData
  } = useAuth();

  const {
    setIsAdminDashboardOpen,
    setIsAdminLoginModalOpen,
    setIsReconciliationOpen
  } = useCustomization();

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queuedActions, setQueuedActions] = useState<QueuedOfflineAction[]>([]);
  const [isVaultInitialized, setIsVaultInitialized] = useState<boolean>(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll sync queue & check if vault exists
  useEffect(() => {
    let mounted = true;
    async function checkState() {
      try {
        const initialized = await offlineVaultService.isVaultInitialized();
        if (mounted) setIsVaultInitialized(initialized);

        const queue = await offlineVaultService.getQueuedActions();
        if (mounted) setQueuedActions(queue.filter(a => a.status === 'pending'));
      } catch {
        // ignore
      }
    }
    checkState();
    const interval = setInterval(checkState, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isOfflineAdminSession]);

  // Only render banner if:
  // 1. Device is offline
  // 2. An offline admin session is active
  // 3. There are pending offline sync actions
  const shouldShow = !isOnline || isOfflineAdminSession || queuedActions.length > 0;

  if (!shouldShow) return null;

  const snapshotAgeText = offlineVaultData?.syncedAt
    ? `Snapshot: ${new Date(offlineVaultData.syncedAt).toLocaleTimeString()}`
    : 'Local Vault Active';

  return (
    <aside
      aria-label="Offline and emergency administration status"
      className={`w-full border-b text-xs transition-colors py-2 px-4 shadow-md ${
        !isOnline
          ? 'bg-amber-950/95 border-amber-500/50 text-amber-200'
          : isOfflineAdminSession
          ? 'bg-slate-900/95 border-cyan-500/50 text-cyan-200'
          : 'bg-slate-900/90 border-slate-700/60 text-slate-300'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Connection & Mode Status */}
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-md border ${
              !isOnline
                ? 'bg-amber-900/80 border-amber-500/60 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
            }`}
          >
            {!isOnline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide">
              {!isOnline ? 'NETWORK DISCONNECTED' : 'NETWORK RESTORED'}
            </span>
            <span className="text-slate-400">·</span>
            {isOfflineAdminSession ? (
              <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded">
                <Unlock className="w-3 h-3 text-cyan-400" />
                OFFLINE ADMIN VAULT ACTIVE ({snapshotAgeText})
              </span>
            ) : (
              <span className="text-[11px] text-slate-300">
                {!isOnline
                  ? 'Running in disconnected mode. Local operations remain active.'
                  : 'Connected to live cloud services.'}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Pending Sync Queue Button */}
          {queuedActions.length > 0 && (
            <button
              onClick={() => setIsReconciliationOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-900/90 hover:bg-amber-800 border border-amber-500/70 text-amber-100 font-semibold text-[11px] transition-colors cursor-pointer"
              title="Review queued changes before syncing with production"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Review Sync Queue ({queuedActions.length})</span>
            </button>
          )}

          {/* If offline admin session is active */}
          {isOfflineAdminSession ? (
            <>
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-200 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Admin Console</span>
              </button>

              <button
                onClick={lockOfflineAdminSession}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-[11px] transition-colors cursor-pointer"
                title="Lock local vault and purge decrypted memory"
              >
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Lock Vault</span>
              </button>
            </>
          ) : (
            /* If not yet unlocked offline */
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isVaultInitialized ? 'Unlock Offline Vault' : 'Emergency Recovery'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}

          {/* If online and offline admin is active: prompt re-auth */}
          {isOnline && isOfflineAdminSession && !isAdmin && (
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/70 text-emerald-200 font-semibold text-[11px] transition-colors cursor-pointer"
              title="Authenticate with live cloud to execute verified changes"
            >
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span>Re-Authenticate Live</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
