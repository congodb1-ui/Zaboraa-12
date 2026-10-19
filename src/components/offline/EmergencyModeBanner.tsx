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
      className={`w-full border-b text-xs transition-colors py-2.5 px-4 shadow-md font-sans ${
        !isOnline
          ? 'bg-amber-950 border-amber-500/80 text-amber-100'
          : isOfflineAdminSession
          ? 'bg-[#0a0f1d] border-cyan-500/70 text-cyan-200'
          : 'bg-[#0f172a] border-slate-700 text-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Connection & Mode Status */}
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg border ${
              !isOnline
                ? 'bg-amber-900 border-amber-400 text-amber-200'
                : 'bg-emerald-950 border-emerald-400 text-emerald-300'
            }`}
          >
            {!isOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black tracking-wider uppercase text-xs">
              {!isOnline ? 'NETWORK DISCONNECTED' : 'NETWORK RESTORED'}
            </span>
            <span className="text-slate-400 font-bold">·</span>
            {isOfflineAdminSession ? (
              <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-200 bg-cyan-950 border border-cyan-400/60 px-2.5 py-0.5 rounded-md">
                <Unlock className="w-3.5 h-3.5 text-cyan-300" />
                OFFLINE ADMIN VAULT ACTIVE ({snapshotAgeText})
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-200">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
              title="Review queued changes before syncing with production"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
              <span>Review Sync Queue ({queuedActions.length})</span>
            </button>
          )}

          {/* If offline admin session is active */}
          {isOfflineAdminSession ? (
            <>
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-950" />
                <span>Admin Console</span>
              </button>

              <button
                onClick={lockOfflineAdminSession}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs transition-colors cursor-pointer"
                title="Lock local vault and purge decrypted memory"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Lock Vault</span>
              </button>
            </>
          ) : (
            /* If not yet unlocked offline */
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
            >
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>{isVaultInitialized ? 'Unlock Offline Vault' : 'Emergency Recovery'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
          )}

          {/* If online and offline admin is active: prompt re-auth */}
          {isOnline && isOfflineAdminSession && !isAdmin && (
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
              title="Authenticate with live cloud to execute verified changes"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              <span>Re-Authenticate Live</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
