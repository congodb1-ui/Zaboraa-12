import React, { useState, useEffect } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { useAuth } from '../context/AuthContext';
import {
  offlineVaultService,
  benchmarkPBKDF2,
  BenchmarkResult,
  DEFAULT_PBKDF2_ITERATIONS
} from '../services/offlineVaultService';
import {
  Lock,
  Unlock,
  ShieldCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Sliders,
  LogOut,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  HardDrive,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Sparkles,
  WifiOff
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    setIsAdminDashboardOpen,
    setIsCustomizerOpen,
    setIsWatermarkModalOpen
  } = useCustomization();

  const {
    user,
    isAdmin,
    loginWithEmail,
    signInWithGoogle,
    signInWithMicrosoft,
    requestPasswordReset,
    signOut,
    isOfflineAdminSession,
    unlockOfflineVaultWithKey,
    lockOfflineAdminSession
  } = useAuth();

  // Mode: 'online' | 'offline_emergency' | 'setup_vault' | 'reset_password'
  const [activeTab, setActiveTab] = useState<'online' | 'offline_emergency' | 'setup_vault' | 'reset_password'>('online');

  // Online credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Offline recovery key
  const [recoveryKey, setRecoveryKey] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNotice, setResetNotice] = useState('');

  // Benchmark
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [isVaultInitialized, setIsVaultInitialized] = useState<boolean>(false);

  useEffect(() => {
    async function checkVault() {
      try {
        const init = await offlineVaultService.isVaultInitialized();
        setIsVaultInitialized(init);
        if (!navigator.onLine && init) {
          setActiveTab('offline_emergency');
        }
      } catch {
        // ignore
      }
    }
    if (isAdminLoginModalOpen) {
      checkVault();
    }
  }, [isAdminLoginModalOpen]);

  if (!isAdminLoginModalOpen) return null;

  // 1. Online Admin Sign In (Google / Microsoft / Email)
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please provide a valid administrator email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your administrator account password.');
      return;
    }

    setIsLoading(true);

    try {
      const authenticatedProfile = await loginWithEmail(cleanEmail, password);
      const isAuthAdmin = authenticatedProfile.role === 'admin' || authenticatedProfile.email?.toLowerCase() === 'admin@zaboraa.com';

      if (!isAuthAdmin) {
        await signOut();
        setErrorMsg('Access Denied: The authenticated credentials do not possess Enterprise Administrator authorization.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Administrator credentials verified. Welcome, ${authenticatedProfile.displayName || authenticatedProfile.email}!`);
      setTimeout(() => {
        setIsAdminLoginModalOpen(false);
        setIsAdminDashboardOpen(true);
        setSuccessMsg('');
        setPassword('');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please verify your administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithMicrosoft();
      }
      setIsAdminLoginModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || `${provider} sign-in failed. Please check network and configuration.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Offline Emergency Unlock with Cryptographic Key
  const handleUnlockOfflineVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanKey = recoveryKey.trim();
    if (!cleanKey) {
      setErrorMsg('Please input your 256-bit emergency recovery key.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await unlockOfflineVaultWithKey(cleanKey);
      if (!res.success) {
        setErrorMsg(res.error || 'Decryption rejected: Invalid recovery key or corrupted authentication tag.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg('Offline Vault Unlocked! Authenticated AES-GCM canary verification passed.');
      setTimeout(() => {
        setIsAdminLoginModalOpen(false);
        setIsAdminDashboardOpen(true);
        setSuccessMsg('');
        setRecoveryKey('');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Cryptographic decryption error.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Vault Setup: Generate New Emergency Recovery Key
  const handleGenerateRecoveryKey = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const { recoveryKey: newKey } = await offlineVaultService.initializeVault(undefined, DEFAULT_PBKDF2_ITERATIONS);
      setGeneratedKey(newKey);
      setIsVaultInitialized(true);
      setSuccessMsg('Cryptographic vault initialized. Save this key offline in a secure physical location.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize encrypted vault.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Benchmark PBKDF2 on Device
  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const result = await benchmarkPBKDF2(DEFAULT_PBKDF2_ITERATIONS);
      setBenchmarkResult(result);
    } catch (err: any) {
      setErrorMsg('Benchmark failed: ' + err.message);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetNotice('');

    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setErrorMsg('Please enter your administrator email to receive reset instructions.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(targetEmail);
      setResetNotice(res.message || `Password reset instructions sent to ${targetEmail}. Please check your inbox.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAnyAdminSessionActive = isAdmin || isOfflineAdminSession;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        data-theme-container="dark"
        className="dark-card relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isAnyAdminSessionActive
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                  : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
              }`}
            >
              {isAnyAdminSessionActive ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isAnyAdminSessionActive ? 'Administrator Portal' : 'Enterprise Administrative Access'}</span>
                {isOfflineAdminSession && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300">
                    OFFLINE
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAnyAdminSessionActive
                  ? isOfflineAdminSession
                    ? 'Decrypted Local On-Device Vault Active'
                    : 'Supabase Authenticated Server Session Active'
                  : 'Role-Governed Enterprise Cloud Management & Disconnected Continuity'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAdminLoginModalOpen(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection (When not logged in) */}
        {!isAnyAdminSessionActive && (
          <div className="flex border-b border-slate-800 pb-1 gap-2">
            <button
              onClick={() => { setActiveTab('online'); setErrorMsg(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'online'
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Online Sign-In</span>
            </button>

            <button
              onClick={() => { setActiveTab('offline_emergency'); setErrorMsg(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'offline_emergency'
                  ? 'bg-amber-950 border border-amber-500/50 text-amber-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Emergency Offline Vault</span>
            </button>

            <button
              onClick={() => { setActiveTab('setup_vault'); setErrorMsg(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'setup_vault'
                  ? 'bg-slate-800 border border-slate-600 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Recovery Key</span>
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-mono">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* ALREADY LOGGED IN VIEW */}
        {isAnyAdminSessionActive ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Authenticated Identity</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  {isOfflineAdminSession ? 'OFFLINE RECOVERY ACTIVE' : 'LIVE ENTERPRISE ADMIN'}
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                {user?.displayName || user?.email || 'Enterprise Administrator'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {user?.email || 'Offline Decrypted Memory Context'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsAdminLoginModalOpen(false);
                  setIsAdminDashboardOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Open Admin Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setIsAdminLoginModalOpen(false);
                  setIsCustomizerOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <span>Edit Site Design</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              {isOfflineAdminSession && (
                <button
                  onClick={lockOfflineAdminSession}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock Vault</span>
                </button>
              )}
              <button
                onClick={async () => {
                  await signOut();
                  setIsAdminLoginModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: ONLINE SIGN IN */}
            {activeTab === 'online' && (
              <div className="space-y-4">
                {/* 3P OAuth Buttons: Google & Microsoft */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('microsoft')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span>Microsoft</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-2 text-[10px] font-mono uppercase text-slate-500 shrink-0">
                    Or Corporate Email
                  </span>
                  <div className="border-t border-slate-800 w-full" />
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleAdminSignIn} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Administrator Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@zaboraa.com"
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-semibold">Master Password</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('reset_password')}
                        className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        Reset password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-2 pl-9 pr-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/25 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isLoading ? 'Verifying Authorization...' : 'Authenticate Live Administrator'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: EMERGENCY OFFLINE RECOVERY VAULT */}
            {activeTab === 'offline_emergency' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Cryptographic Offline Vault Unlock</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80">
                    Uses PBKDF2-HMAC-SHA-256 (600,000 iterations) and authenticated AES-256-GCM canary verification.
                    Decrypts local cached snapshots on this device.
                  </p>
                </div>

                <form onSubmit={handleUnlockOfflineVault} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Emergency Recovery Key</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={recoveryKey}
                        onChange={(e) => setRecoveryKey(e.target.value)}
                        placeholder="ZABO-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono text-xs uppercase"
                        required
                      />
                    </div>
                  </div>

                  {/* Benchmark Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleRunBenchmark}
                      disabled={isBenchmarking}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isBenchmarking ? 'Benchmarking PBKDF2...' : 'Benchmark Derivation on this Device'}</span>
                    </button>
                    {benchmarkResult && (
                      <span className="text-[10px] font-mono text-cyan-300">
                        {benchmarkResult.durationMs}ms ({benchmarkResult.iterations.toLocaleString()} iter)
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                    <span>{isLoading ? 'Decrypting Vault...' : 'Unlock Encrypted Vault'}</span>
                  </button>
                </form>

                {/* Honest Security Disclaimer */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">Security Notice & Boundaries:</div>
                  <p>
                    • This key unlocks only this device's on-device encrypted cache. It does NOT grant live production admin rights.
                  </p>
                  <p>
                    • Client-side attempt throttling is a best-effort device deterrent, not a tamper-proof hardware enclave.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: SETUP / GENERATE RECOVERY KEY */}
            {activeTab === 'setup_vault' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Generate Emergency Recovery Key</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Generates a cryptographically random 256-bit key from Web Crypto getRandomValues.
                    The key is never transmitted or saved in plaintext.
                  </p>
                </div>

                {generatedKey ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/50 space-y-2">
                      <div className="text-[11px] text-cyan-300 font-semibold">Your Emergency Recovery Key:</div>
                      <div className="font-mono text-xs text-white bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all select-all">
                        {generatedKey}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? 'Key Copied to Clipboard!' : 'Copy Emergency Key'}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-200">
                      <strong>Critical:</strong> Store this key offline in a secure vault. It will NOT be shown again.
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateRecoveryKey}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span>Initialize New Vault & Key</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB 4: PASSWORD RESET */}
            {activeTab === 'reset_password' && (
              <form onSubmit={handlePasswordReset} className="space-y-3.5 text-xs">
                {resetNotice && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs">
                    {resetNotice}
                  </div>
                )}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Corporate Email Address</label>
                  <input
                    type="email"
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@zaboraa.com"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('online')}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                  >
                    Back to Sign-In
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
