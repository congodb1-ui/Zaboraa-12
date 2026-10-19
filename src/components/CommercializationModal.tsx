import React, { useState } from 'react';
import { useAuth, SubscriptionTier } from '../context/AuthContext';
import { useCustomization } from '../context/CustomizationContext';
import {
  X,
  CheckCircle2,
  Sparkles,
  CreditCard,
  LogOut,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface CommercializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBriefing?: () => void;
}

export const CommercializationModal: React.FC<CommercializationModalProps> = ({
  isOpen,
  onClose,
  onOpenBriefing
}) => {
  const { brandName } = useCustomization();
  const {
    user,
    isAdmin,
    subscriptionTier,
    setSubscriptionTier,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInWithMicrosoft,
    loginWithEmail,
    registerWithEmail,
    requestPasswordReset,
    quickDemoLogin,
    signOut,
    authError,
    clearAuthError
  } = useAuth();

  // Collapsible email form state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailMode, setEmailMode] = useState<'signin' | 'register'>('signin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Forgot password state
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    clearAuthError();
    try {
      await signInWithGoogle();
      setActionSuccess('Successfully authenticated via Google OAuth!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setIsSubmitting(true);
    clearAuthError();
    try {
      await signInWithGoogleRedirect();
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsSubmitting(true);
    clearAuthError();
    try {
      await signInWithMicrosoft();
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) return;

    setIsSubmitting(true);
    clearAuthError();
    try {
      if (emailMode === 'register') {
        await registerWithEmail(emailInput.trim(), passwordInput, nameInput.trim() || emailInput.split('@')[0]);
        setActionSuccess('Account successfully registered! Logged in.');
      } else {
        await loginWithEmail(emailInput.trim(), passwordInput);
        setActionSuccess('Signed in successfully!');
      }
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resetEmailInput.trim() || emailInput.trim();
    if (!targetEmail) {
      setResetFeedback({
        text: 'Please enter a valid email address to request a reset link.',
        success: false
      });
      return;
    }

    setIsResetSubmitting(true);
    setResetFeedback(null);
    clearAuthError();

    try {
      const res = await requestPasswordReset(targetEmail);
      setResetFeedback({
        text: res.message,
        success: res.success
      });
      if (res.success) {
        setActionSuccess(`Password reset email triggered for ${targetEmail}`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      setResetFeedback({
        text: err?.message || 'Unable to request password reset. Please try again.',
        success: false
      });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    quickDemoLogin();
    setActionSuccess('Demo Architect Mode activated with Enterprise access!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSubscriptionTier(tier);
    setActionSuccess(`Switched tier preference to ${tier.toUpperCase()}`);
    setTimeout(() => setActionSuccess(null), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto text-xs text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Architect Authentication & Access
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                  {user ? 'VERIFIED ARCHITECT' : 'ENTERPRISE SSO'}
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Verified enterprise session management with Google OAuth and single sign-on access.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banners */}
        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearAuthError}
              className="text-xs text-rose-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* User Status Card (when signed in) */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Architect'}
                    className="w-11 h-11 rounded-full border border-cyan-500/60 object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-base">
                    {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{user.displayName || 'Enterprise Architect'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>SSO Active</span>
                    </span>
                    {user.role === 'admin' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-bold">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5 font-mono">{user.email || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setActionSuccess('Signed out successfully.');
                    setTimeout(() => setActionSuccess(null), 2000);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Enterprise Security & Access Overview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs tracking-wider uppercase font-mono">
                  Enterprise Architecture Access
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Sizing Calculators & Blueprints Unlocked</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are authenticated with single sign-on enterprise credentials. Sizing engines, RVTools migration wave parsers, Nutanix NC2 assessments, Aria flow analytics, and 4K blueprint generation are fully active.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Provider</div>
                  <div className="font-bold text-cyan-300 mt-0.5 capitalize">{user.provider}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Security Token</div>
                  <div className="font-bold text-emerald-400 mt-0.5">TLS 1.3 / PKCE</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Calculators</div>
                  <div className="font-bold text-white mt-0.5">6 Production Tools</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Session Status</div>
                  <div className="font-bold text-emerald-400 mt-0.5">Active</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Authentication Screen (when not signed in) */
          <div className="space-y-4">
            {/* Primary Single Sign-On Options: Google & Microsoft */}
            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-slate-700 space-y-3.5 shadow-inner">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-extrabold text-white text-base">Sign In to {brandName || 'Enterprise Architecture'}</h3>
                <p className="text-slate-300 text-xs font-medium">
                  Connect instantly using your enterprise credentials or single sign-on provider.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] border border-slate-300 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Microsoft Sign-In */}
                <button
                  type="button"
                  onClick={handleMicrosoftSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] border-2 border-slate-600 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Continue with Microsoft</span>
                </button>
              </div>
            </div>

            {/* Collapsible Email & Password Authentication Form */}
            <div className="rounded-2xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-md">
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(!showEmailForm);
                  setIsForgotPasswordMode(false);
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-white">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs sm:text-sm">Corporate Email & Password Access</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
                  <span>{showEmailForm ? 'Hide Form' : 'Show Form'}</span>
                  {showEmailForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showEmailForm && (
                <div className="p-5 pt-2 border-t border-slate-800 space-y-4 animate-in fade-in duration-100">
                  {/* Mode Selector */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode('signin');
                        setIsForgotPasswordMode(false);
                      }}
                      className={`text-xs font-bold py-2 px-3 rounded-lg transition-all ${
                        emailMode === 'signin' && !isForgotPasswordMode
                          ? 'bg-cyan-400 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode('register');
                        setIsForgotPasswordMode(false);
                      }}
                      className={`text-xs font-bold py-2 px-3 rounded-lg transition-all ${
                        emailMode === 'register' && !isForgotPasswordMode
                          ? 'bg-cyan-400 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Create Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordMode(true)}
                      className={`text-xs font-bold py-2 px-3 rounded-lg transition-all ${
                        isForgotPasswordMode
                          ? 'bg-cyan-400 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Reset Password
                    </button>
                  </div>

                  {isForgotPasswordMode ? (
                    /* Password Reset Form */
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-100 block mb-1.5 uppercase tracking-wide">
                          Work Email for Recovery Link
                        </label>
                        <input
                          type="email"
                          required
                          value={resetEmailInput}
                          onChange={(e) => setResetEmailInput(e.target.value)}
                          placeholder="architect@enterprise.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-600 text-white placeholder-slate-400 text-sm font-semibold outline-none focus:border-cyan-400"
                        />
                      </div>

                      {resetFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                            resetFeedback.success
                              ? 'bg-emerald-950 border border-emerald-500 text-emerald-100'
                              : 'bg-rose-950 border border-rose-500 text-rose-100'
                          }`}
                        >
                          {resetFeedback.success ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                          )}
                          <span>{resetFeedback.text}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isResetSubmitting}
                        className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-md uppercase tracking-wider"
                      >
                        {isResetSubmitting ? 'Sending Link...' : 'Send Password Reset Email'}
                      </button>
                    </form>
                  ) : (
                    /* Email & Password Sign In / Register Form */
                    <form onSubmit={handleEmailAuth} className="space-y-3.5">
                      {emailMode === 'register' && (
                        <div>
                          <label className="text-xs font-bold text-slate-100 block mb-1.5 uppercase tracking-wide">Full Name</label>
                          <input
                            type="text"
                            required
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="David Henderson"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-600 text-white placeholder-slate-400 text-sm font-semibold outline-none focus:border-cyan-400"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-slate-100 block mb-1.5 uppercase tracking-wide">Work Email</label>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="architect@enterprise.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-600 text-white placeholder-slate-400 text-sm font-semibold outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-100 block mb-1.5 uppercase tracking-wide">Password</label>
                        <input
                          type="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-600 text-white placeholder-slate-400 text-sm font-semibold outline-none focus:border-cyan-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
                      >
                        <span>{isSubmitting ? 'Processing...' : emailMode === 'register' ? 'Register Account' : 'Sign In with Email'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Public-first accessibility: sizing calculators & runbooks are open to all visitors.</span>
          </span>

          {onOpenBriefing && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBriefing();
              }}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium text-[11px] cursor-pointer"
            >
              Book Executive Architecture Briefing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
