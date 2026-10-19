import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  offlineVaultService,
  benchmarkPBKDF2,
  BenchmarkResult,
  QueuedOfflineAction,
  DEFAULT_PBKDF2_ITERATIONS
} from '../../../services/offlineVaultService';
import { adminService } from '../../../services/adminService';

interface AdminVaultViewProps {
  isOfflineAdminSession: boolean;
  onLockVault: () => void;
  currentUserEmail: string;
}

export const AdminVaultView: React.FC<AdminVaultViewProps> = ({
  isOfflineAdminSession,
  onLockVault,
  currentUserEmail
}) => {
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [queuedActions, setQueuedActions] = useState<QueuedOfflineAction[]>([]);
  const [canaryStatus, setCanaryStatus] = useState<string>('Vault Initialized & Ready');

  const loadVaultData = async () => {
    const queue = await offlineVaultService.getQueuedActions();
    setQueuedActions(queue);
    const hasData = await offlineVaultService.isVaultInitialized();
    setCanaryStatus(hasData ? 'Active Encrypted Blob in Local Storage' : 'Uninitialized (Using Master Passphrase)');
  };

  useEffect(() => {
    loadVaultData();
  }, []);

  const runBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await benchmarkPBKDF2(DEFAULT_PBKDF2_ITERATIONS);
      setBenchmarkResult(res);

      await adminService.logAuditEvent({
        actorEmail: currentUserEmail,
        actorRole: 'admin',
        action: 'RUN_PBKDF2_VAULT_BENCHMARK',
        targetEntity: 'offline_vault',
        outcome: 'success',
        metadata: { iterations: res.iterations, durationMs: res.durationMs }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>DISASTER RECOVERY OFFLINE CRYPTOGRAPHIC VAULT</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Emergency Recovery Key & Offline Vault
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Provides disaster recovery administration when cloud connectivity is unavailable. Hardened with 600,000 PBKDF2-HMAC-SHA-256 iterations and AES-GCM canary decryption.
          </p>
        </div>

        {isOfflineAdminSession && (
          <button
            onClick={onLockVault}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Vault Session</span>
          </button>
        )}
      </div>

      {/* Vault Status Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Cryptographic Hardening
          </div>
          <div className="text-lg font-bold text-white font-mono">
            600,000 Iterations
          </div>
          <p className="text-[11px] text-slate-400">
            PBKDF2-HMAC-SHA-256 key derivation exceeds OWASP 2026 security benchmarks.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Vault Session State
          </div>
          <div className="text-lg font-bold text-cyan-300 font-mono">
            {isOfflineAdminSession ? 'UNLOCKED (ACTIVE)' : 'LOCKED (STANDBY)'}
          </div>
          <p className="text-[11px] text-slate-400">{canaryStatus}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Offline Queued Mutations
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {queuedActions.filter((q) => q.status === 'pending').length} Actions
          </div>
          <p className="text-[11px] text-slate-400">
            Queued actions will automatically reconcile upon reconnection to Supabase.
          </p>
        </div>
      </div>

      {/* PBKDF2 Benchmarking Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Dynamic Cryptographic PBKDF2 Benchmark</h2>
            <p className="text-[11px] text-slate-400">
              Measures CPU performance for derivation of 600,000 iterations in current browser environment.
            </p>
          </div>

          <button
            onClick={runBenchmark}
            disabled={isBenchmarking}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Cpu className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin' : ''}`} />
            <span>{isBenchmarking ? 'Benchmarking...' : 'Run Performance Benchmark'}</span>
          </button>
        </div>

        {benchmarkResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Benchmark Completed: {benchmarkResult.durationMs}ms</span>
            </div>
            <div className="text-slate-300">
              Evaluated {benchmarkResult.iterations.toLocaleString()} iterations on {navigator.hardwareConcurrency || 8} CPU cores. Throughput:{' '}
              <span className="text-cyan-300 font-bold">
                {Math.round(benchmarkResult.iterations / (benchmarkResult.durationMs / 1000)).toLocaleString()} iterations/sec
              </span>.
            </div>
          </div>
        )}
      </div>

      {/* Queued Actions List */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800">
          <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Offline Mutation Action Queue ({queuedActions.length})
          </h2>
        </div>

        {queuedActions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No offline actions queued. All administrative changes are synchronized with the cloud.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 text-xs">
            {queuedActions.map((act) => (
              <div key={act.id} className="p-3.5 flex items-center justify-between text-slate-300">
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-cyan-300">{act.actionType}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Target: {act.targetEntity} ({act.entityId})
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 uppercase font-bold text-[10px]">
                    {act.status}
                  </span>
                  <div className="text-slate-500 text-[10px] mt-1">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
