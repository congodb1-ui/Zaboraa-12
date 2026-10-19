import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCustomization } from '../../context/CustomizationContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  offlineVaultService,
  QueuedOfflineAction
} from '../../services/offlineVaultService';
import {
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Lock,
  Trash2,
  Check,
  RotateCcw
} from 'lucide-react';

export const ReconciliationDrawer: React.FC = () => {
  const {
    isReconciliationOpen,
    setIsReconciliationOpen
  } = useCustomization();

  const {
    user,
    isAdmin,
    reauthenticateAdmin
  } = useAuth();

  const [queue, setQueue] = useState<QueuedOfflineAction[]>([]);
  const [password, setPassword] = useState('');
  const [isReauthenticated, setIsReauthenticated] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadQueue = async () => {
    try {
      const items = await offlineVaultService.getQueuedActions();
      setQueue(items);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isReconciliationOpen) {
      loadQueue();
      setErrorMsg('');
      setSuccessMsg('');
      setPassword('');
      // If already live admin, pre-verify
      if (isAdmin) {
        setIsReauthenticated(true);
      }
    }
  }, [isReconciliationOpen, isAdmin]);

  if (!isReconciliationOpen) return null;

  // Re-authenticate Live Admin
  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const verified = await reauthenticateAdmin(password);
    if (verified) {
      setIsReauthenticated(true);
      setSuccessMsg('Live administrator identity verified. You may now reconcile queued changes.');
    } else {
      setErrorMsg('Verification failed: Live administrator credentials required to modify production.');
    }
  };

  // Apply Single Action to Supabase
  const handleApplyAction = async (action: QueuedOfflineAction) => {
    if (!isReauthenticated) {
      setErrorMsg('Live administrator authentication is strictly required before applying changes.');
      return;
    }

    setIsApplying(true);
    setErrorMsg('');

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase client is not configured for live cloud mutations.');
      }

      if (action.actionType === 'UPDATE_BRIEFING_STATUS') {
        const { error } = await supabase
          .from('briefing_requests')
          .update(action.payload)
          .eq('id', action.entityId);

        if (error) throw error;
      } else if (action.actionType === 'APPROVE_ROLE_REQUEST') {
        const { error } = await supabase
          .from('profiles')
          .update(action.payload)
          .eq('id', action.entityId);

        if (error) throw error;
      }

      // Remove from queue on success
      await offlineVaultService.removeQueuedAction(action.id);
      await loadQueue();
      setSuccessMsg(`Action ${action.actionType} applied successfully to production.`);
    } catch (err: any) {
      setErrorMsg(`Failed to apply ${action.actionType}: ` + (err?.message || 'Database error'));
    } finally {
      setIsApplying(false);
    }
  };

  // Discard Single Action
  const handleDiscardAction = async (id: string) => {
    await offlineVaultService.removeQueuedAction(id);
    await loadQueue();
  };

  // Discard All
  const handleClearAll = async () => {
    if (confirm('Discard all staged offline actions without applying to production?')) {
      await offlineVaultService.clearQueue();
      await loadQueue();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        data-theme-container="dark"
        className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Reconnection Reconciliation Review</h3>
              <p className="text-[11px] text-slate-400">
                Staged Offline Operations Queue ({queue.length} items)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReconciliationOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Security Gate Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Privilege Decoupling & Server Verification</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Offline recovery keys authorize <strong>only</strong> on-device decryption. Reconnecting to production
              strictly requires fresh live administrator credentials and server-side authorization.
            </p>
          </div>

          {/* Verification Challenge if not pre-verified */}
          {!isReauthenticated && (
            <form onSubmit={handleVerifyAdmin} className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Lock className="w-4 h-4" />
                <span>Confirm Live Administrator Password to Authorize Sync</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Master Administrator Password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Verify Live Privileges
              </button>
            </form>
          )}

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950 border border-rose-500/50 text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Queued Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <span>STAGED OPERATIONS ({queue.length})</span>
              {queue.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Discard All</span>
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono">
                No offline actions currently queued for sync.
              </div>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-xs">{item.actionType}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Target: <span className="text-white">{item.targetEntity}</span> [{item.entityId}]
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto">
                    <pre>{JSON.stringify(item.payload, null, 2)}</pre>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleDiscardAction(item.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                    >
                      Discard
                    </button>

                    <button
                      onClick={() => handleApplyAction(item)}
                      disabled={isApplying || !isReauthenticated}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />
                      <span>Apply to Supabase</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
