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
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div
        data-theme-container="dark"
        className="w-full max-w-xl h-full bg-[#0f172a] border-l-2 border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-5 border-b-2 border-slate-700 flex items-center justify-between shrink-0 bg-[#0a0f1d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/60 text-amber-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Reconnection Reconciliation Review</h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Staged Offline Operations Queue ({queue.length} items)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReconciliationOpen(false)}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {/* Security Gate Notice */}
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border-2 border-slate-700 space-y-2 text-slate-200 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Privilege Decoupling & Server Verification</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Offline recovery keys authorize <strong>only</strong> on-device decryption. Reconnecting to production
              strictly requires fresh live administrator credentials and server-side authorization.
            </p>
          </div>

          {/* Verification Challenge if not pre-verified */}
          {!isReauthenticated && (
            <form onSubmit={handleVerifyAdmin} className="p-5 rounded-2xl bg-[#131d31] border-2 border-amber-500/70 space-y-3.5 shadow-md">
              <div className="flex items-center gap-2 font-extrabold text-amber-200 text-sm">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Confirm Live Master Password to Authorize Sync</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Master Administrator Password"
                className="w-full bg-[#0a0f1d] border-2 border-slate-600 rounded-xl p-3 text-white placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all"
              >
                Verify Live Privileges
              </button>
            </form>
          )}

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950 border border-rose-500 text-rose-100 flex items-start gap-2.5 font-medium shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-100 flex items-start gap-2.5 font-medium shadow-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Queued Items List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-700 text-white font-mono text-xs font-bold uppercase tracking-wider">
              <span>Staged Operations ({queue.length})</span>
              {queue.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-rose-300 hover:text-rose-200 hover:underline flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Discard All</span>
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="p-8 text-center text-slate-300 font-mono bg-[#0a0f1d] rounded-2xl border-2 border-slate-700 text-sm">
                No offline actions currently queued for sync.
              </div>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#0a0f1d] border-2 border-slate-700 space-y-2.5 font-mono shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-cyan-300 text-sm">{item.actionType}</span>
                    <span className="text-xs text-slate-300 font-bold">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-200 font-medium">
                    Target: <span className="text-white font-bold">{item.targetEntity}</span> [{item.entityId}]
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-cyan-200 overflow-x-auto">
                    <pre>{JSON.stringify(item.payload, null, 2)}</pre>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      onClick={() => handleDiscardAction(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Discard
                    </button>

                    <button
                      onClick={() => handleApplyAction(item)}
                      disabled={isApplying || !isReauthenticated}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
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
