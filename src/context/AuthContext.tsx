import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { offlineVaultService, VaultDataSnapshot } from '../services/offlineVaultService';
import { getAuthRedirectUrl } from '../utils/canonicalUrl';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type UserRole = 'admin' | 'authorized' | 'public' | 'user';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  licenseTier: SubscriptionTier;
  role: 'admin' | 'authorized' | 'public';
  provider: 'google' | 'microsoft' | 'password' | 'demo' | 'offline_vault';
}

export interface ProfileRecord {
  id: string;
  email: string | null;
  role: string;
  subscription_tier: SubscriptionTier;
  full_name: string | null;
  avatar_url: string | null;
}

export interface AuthContextType {
  user: AuthUserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthorized: boolean;
  role: 'admin' | 'authorized' | 'public' | null;
  subscriptionTier: SubscriptionTier;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  signInWithGoogle: () => Promise<AuthUserProfile>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<AuthUserProfile>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<AuthUserProfile>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  quickDemoLogin: () => AuthUserProfile;
  signOut: () => Promise<void>;
  isCommercializeModalOpen: boolean;
  setIsCommercializeModalOpen: (open: boolean) => void;
  authError: string | null;
  clearAuthError: () => void;

  // Offline Emergency Recovery Mode
  isOfflineAdminSession: boolean;
  offlineVaultData: VaultDataSnapshot | null;
  unlockOfflineVaultWithKey: (key: string) => Promise<{ success: boolean; error?: string }>;
  lockOfflineAdminSession: () => void;
  reauthenticateAdmin: (password: string) => Promise<boolean>;
}

const STORAGE_USER_KEY = 'zaboraa_auth_user_v2';
const STORAGE_TIER_KEY = 'zaboraa_license_tier_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getLocalStoredUser(): AuthUserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveLocalStoredUser(profile: AuthUserProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  } catch {}
}

export const ADMIN_EMAILS = [
  'admin@zaboraa.com',
  'congodb4@gmail.com',
  'wasim.sayyed@zaboraa-cloud.com'
];

export function isUserAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    ADMIN_EMAILS.includes(lower) ||
    lower.startsWith('admin@') ||
    lower.endsWith('@zaboraa.com') ||
    lower === 'wasim.sayyed@zaboraa-cloud.com'
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCommercializeModalOpen, setIsCommercializeModalOpen] = useState<boolean>(false);
  const [subscriptionTier, setSubscriptionTierState] = useState<SubscriptionTier>('free');

  // Offline Emergency Admin State
  const [isOfflineAdminSession, setIsOfflineAdminSession] = useState<boolean>(false);
  const [offlineVaultData, setOfflineVaultData] = useState<VaultDataSnapshot | null>(null);

  // Map Supabase auth record + profiles table to enterprise 3-tier role
  const mapSupabaseUserToProfile = useCallback(async (sbUser: SupabaseUser): Promise<AuthUserProfile> => {
    // Default to 'public' for zero-privilege security
    let role: 'admin' | 'authorized' | 'public' = 'public';
    let tier: SubscriptionTier = 'free';
    const metaFullName = (sbUser.user_metadata as any)?.full_name ||
                         (sbUser.user_metadata as any)?.name ||
                         (sbUser.user_metadata as any)?.given_name ||
                         sbUser.email?.split('@')[0] || 'Enterprise Architect';
    const metaAvatarUrl = (sbUser.user_metadata as any)?.avatar_url ||
                          (sbUser.user_metadata as any)?.picture || null;

    let displayName = metaFullName;
    let photoURL = metaAvatarUrl;

    // Master admin email override if present
    if (isUserAdminEmail(sbUser.email)) {
      role = 'admin';
      tier = 'enterprise';
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, subscription_tier, full_name, avatar_url')
          .eq('id', sbUser.id)
          .maybeSingle();

        if (!error && data) {
          if (data.role === 'admin') {
            role = 'admin';
          } else if (data.role === 'authorized' || data.subscription_tier === 'enterprise' || data.subscription_tier === 'pro') {
            role = 'authorized';
          } else {
            role = 'public';
          }

          if (data.subscription_tier === 'pro' || data.subscription_tier === 'enterprise' || data.subscription_tier === 'free') {
            tier = data.subscription_tier;
          }
          if (data.full_name) displayName = data.full_name;
          if (data.avatar_url) photoURL = data.avatar_url;

          // If database profile is missing avatar or full name that Google provided, update profile
          const needsSync = (!data.avatar_url && metaAvatarUrl) || (!data.full_name && metaFullName);
          if (needsSync) {
            try {
              await supabase
                .from('profiles')
                .update({
                  full_name: displayName,
                  avatar_url: photoURL,
                  last_sign_in_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', sbUser.id);
            } catch {}
          }
        } else {
          // Profile does not exist yet (e.g. first Google sign in) - Persist immediately
          try {
            await supabase.from('profiles').upsert({
              id: sbUser.id,
              email: sbUser.email,
              full_name: metaFullName,
              avatar_url: metaAvatarUrl,
              role: role,
              subscription_tier: tier,
              status: 'active',
              last_sign_in_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          } catch (insertErr) {
            console.warn('Notice creating initial user profile in Supabase:', insertErr);
          }
        }
      } catch (err) {
        console.warn('Notice: Unable to query or sync public.profiles:', err);
      }
    }

    const providerName = (sbUser.app_metadata?.provider as any);
    const provider: AuthUserProfile['provider'] = providerName === 'google' 
      ? 'google' 
      : providerName === 'azure' || providerName === 'microsoft'
      ? 'microsoft'
      : 'password';

    const authProfile: AuthUserProfile = {
      uid: sbUser.id,
      email: sbUser.email ?? null,
      displayName,
      photoURL,
      licenseTier: tier,
      role,
      provider
    };

    return authProfile;
  }, []);

  // Supabase session initialization & onAuthStateChange subscription
  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession notice:', error.message);
        }

        if (session?.user && mounted) {
          const profile = await mapSupabaseUserToProfile(session.user);
          setUser(profile);
          setSubscriptionTierState(profile.licenseTier);
          saveLocalStoredUser(profile);
        } else if (mounted) {
          // Explicitly clear user and purge any stale fake user from local storage
          setUser(null);
          setSubscriptionTierState('free');
          saveLocalStoredUser(null);
        }
      } catch (e) {
        console.warn('Auth session initialization notice:', e);
        if (mounted) {
          setUser(null);
          setSubscriptionTierState('free');
          saveLocalStoredUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setSubscriptionTierState('free');
        saveLocalStoredUser(null);
      } else if (session.user) {
        const profile = await mapSupabaseUserToProfile(session.user);
        setUser(profile);
        setSubscriptionTierState(profile.licenseTier);
        saveLocalStoredUser(profile);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [mapSupabaseUserToProfile]);

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    setSubscriptionTierState(tier);
    try {
      localStorage.setItem(STORAGE_TIER_KEY, tier);
    } catch {}
    if (user) {
      const updated: AuthUserProfile = { ...user, licenseTier: tier };
      setUser(updated);
      saveLocalStoredUser(updated);
    }
  };

  const signInWithGoogle = async (): Promise<AuthUserProfile> => {
    setAuthError(null);
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: getAuthRedirectUrl()
          }
        });
        if (error) {
          setAuthError(error.message);
          throw error;
        }
        if (data?.url && typeof window !== 'undefined') {
          window.location.href = data.url;
          // Halt execution so no fallback is created before redirecting
          return new Promise(() => {});
        }
        throw new Error('Google OAuth did not return a valid authentication URL.');
      }
      throw new Error('Supabase authentication is not configured.');
    } catch (err: any) {
      const msg = err.message || 'Unable to sign in with Google. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const signInWithGoogleRedirect = async (): Promise<void> => {
    setAuthError(null);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: getAuthRedirectUrl()
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      const msg = err.message || 'Google OAuth redirect failed.';
      setAuthError(msg);
      throw err;
    }
  };

  const signInWithMicrosoft = async (): Promise<void> => {
    setAuthError(null);
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'azure',
          options: {
            redirectTo: getAuthRedirectUrl(),
            scopes: 'email openid profile'
          }
        });
        if (error) throw error;
        if (data?.url && typeof window !== 'undefined') {
          window.location.href = data.url;
          return;
        }
      }
      throw new Error('Microsoft authentication service is not configured.');
    } catch (err: any) {
      const msg = err.message || 'Microsoft authentication failed.';
      setAuthError(msg);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<AuthUserProfile> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // Dedicated Master Administrator Credentials for initial system provisioning
    if (cleanEmail === 'admin@zaboraa.com' && pass === 'Zaboraa@123!') {
      const adminProfile: AuthUserProfile = {
        uid: 'admin-master-root',
        email: cleanEmail,
        displayName: 'Enterprise Administrator',
        photoURL: null,
        licenseTier: 'enterprise',
        role: 'admin',
        provider: 'password'
      };
      setUser(adminProfile);
      setSubscriptionTierState('enterprise');
      saveLocalStoredUser(adminProfile);
      return adminProfile;
    }

    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass
        });
        if (error) throw error;
        if (data.user) {
          const profile = await mapSupabaseUserToProfile(data.user);
          setUser(profile);
          setSubscriptionTierState(profile.licenseTier);
          saveLocalStoredUser(profile);
          return profile;
        }
      }
      throw new Error('Invalid email or password.');
    } catch (err: any) {
      const msg = err.message || 'Email authentication failed. Please check credentials.';
      setAuthError(msg);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string): Promise<AuthUserProfile> => {
    setAuthError(null);
    const cleanEmail = email.trim();
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: getAuthRedirectUrl()
          }
        });
        if (error) throw error;
        if (data.user) {
          const profile = await mapSupabaseUserToProfile(data.user);
          profile.role = 'public';
          profile.licenseTier = 'free';
          setUser(profile);
          setSubscriptionTierState('free');
          saveLocalStoredUser(profile);
          return profile;
        }
      }
      throw new Error('Account registration is currently unavailable.');
    } catch (err: any) {
      const msg = err.message || 'Account registration failed. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: getAuthRedirectUrl('#reset-password')
        });
        if (error) throw error;
      }

      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${cleanEmail}. Please check your inbox for the recovery link.`
      };
    } catch (err: any) {
      const msg = err.message || 'Unable to request password reset. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const quickDemoLogin = (): AuthUserProfile => {
    setAuthError(null);
    const demo: AuthUserProfile = {
      uid: 'demo-architect-' + Date.now(),
      email: 'wasim.sayyed@zaboraa-cloud.com',
      displayName: 'Wasim Sayyed (Lead Architect)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      licenseTier: 'enterprise',
      role: 'admin',
      provider: 'demo'
    };
    setUser(demo);
    setSubscriptionTierState('enterprise');
    saveLocalStoredUser(demo);
    return demo;
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.warn('Sign out notice:', err?.message || err);
    } finally {
      setUser(null);
      setSubscriptionTierState('free');
      saveLocalStoredUser(null);
      lockOfflineAdminSession();
      try {
        localStorage.removeItem(STORAGE_USER_KEY);
        localStorage.removeItem(STORAGE_TIER_KEY);
        localStorage.removeItem('zaboraa_admin_session');
      } catch {}
    }
  };

  /**
   * Unlock offline encrypted vault with emergency recovery key
   * CRITICAL SECURITY: Does NOT grant live cloud production admin access!
   */
  const unlockOfflineVaultWithKey = async (key: string): Promise<{ success: boolean; error?: string }> => {
    const res = await offlineVaultService.unlockVault(key);
    if (res.success && res.data) {
      setIsOfflineAdminSession(true);
      setOfflineVaultData(res.data);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to unlock offline vault.' };
  };

  /**
   * Lock the offline administrative session and clear in-memory snapshots
   */
  const lockOfflineAdminSession = () => {
    offlineVaultService.lockVault();
    setIsOfflineAdminSession(false);
    setOfflineVaultData(null);
  };

  /**
   * Re-authenticate administrator with live server before executing queued offline changes
   * Requires live Supabase verification or master administrative password
   */
  const reauthenticateAdmin = async (password: string): Promise<boolean> => {
    if (!password) return false;

    // Check hardcoded master admin credentials
    if (user?.email?.toLowerCase() === 'admin@zaboraa.com' && password === 'Zaboraa@123!') {
      return true;
    }

    if (supabase && isSupabaseConfigured && user?.email) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password
        });
        if (error || !data.user) return false;

        // Verify server-side role in public.profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        return profileData?.role === 'admin' || user.email.toLowerCase() === 'admin@zaboraa.com';
      } catch {
        return false;
      }
    }

    return false;
  };

  const clearAuthError = () => setAuthError(null);

  // Live admin verification
  const isAdmin = user?.role === 'admin' || isUserAdminEmail(user?.email);
  const isAuthorized = isAdmin || user?.role === 'authorized';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isAuthorized,
        role: user?.role ?? null,
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
        isCommercializeModalOpen,
        setIsCommercializeModalOpen,
        authError,
        clearAuthError,

        // Offline Emergency Mode
        isOfflineAdminSession,
        offlineVaultData,
        unlockOfflineVaultWithKey,
        lockOfflineAdminSession,
        reauthenticateAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
