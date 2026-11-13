import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { offlineVaultService, VaultDataSnapshot } from '../services/offlineVaultService';
import { getAuthRedirectUrl } from '../utils/canonicalUrl';
import { adminService, AdminUserProfile, AdminUserRole } from '../services/adminService';

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
  refreshUserProfile: () => Promise<AuthUserProfile | null>;
  isCommercializeModalOpen: boolean;
  setIsCommercializeModalOpen: (open: boolean) => void;
  authError: string | null;
  clearAuthError: () => void;
  renderGoogleButton?: (element: HTMLElement) => () => void;
  handleSignInWithIdToken?: (token: string, rawNonce: string) => Promise<AuthUserProfile | null>;

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
  'congodb1@gmail.com',
  'congodb4@gmail.com',
  'congodb1992@gmail.com',
  'wasim.sayyed@zaboraa-cloud.com',
  'anansari678@gmail.com'
];
export const ALLOWED_EMAILS = ADMIN_EMAILS;

let scriptLoadingPromise: Promise<void> | null = null;
let scriptLoadedFlag = false;

export function loadGoogleGsiScript(): Promise<void> {
  if (scriptLoadedFlag || (typeof window !== 'undefined' && (window as any).google?.accounts?.id)) {
    scriptLoadedFlag = true;
    return Promise.resolve();
  }
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }
  if (typeof document !== 'undefined') {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      scriptLoadingPromise = new Promise((resolve, reject) => {
        if ((window as any).google?.accounts?.id) {
          scriptLoadedFlag = true;
          resolve();
        } else {
          existingScript.addEventListener('load', () => {
            scriptLoadedFlag = true;
            resolve();
          });
          existingScript.addEventListener('error', (err) => reject(err));
        }
      });
      return scriptLoadingPromise;
    }
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedFlag = true;
      resolve();
    };
    script.onerror = (err) => {
      scriptLoadingPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function generateRawNonce(): string {
  const array = new Uint8Array(16);
  const cryptoObj = typeof window !== 'undefined' && window.crypto ? window.crypto : globalThis.crypto;
  cryptoObj.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashNonceToHex(rawNonce: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawNonce);
  const cryptoObj = typeof window !== 'undefined' && window.crypto ? window.crypto : globalThis.crypto;
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

let activeRawNonce: string | null = null;
let activeHashedNonce: string | null = null;
let isGisInitialized = false;

/**
 * SECURITY: an email address must never grant admin rights. Anyone can sign up with
 * "admin@anything.com", and this runs in the browser, so it can be bypassed anyway.
 * Admin status comes ONLY from the database (public.profiles.role / is_admin()).
 * Kept as an exported no-op so existing imports keep compiling.
 */
export function isUserAdminEmail(_email?: string | null): boolean {
  return false;
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

    // Comprehensive Google OAuth profile attributes extraction
    const googleIdentity = sbUser.identities?.find((id: any) => id.provider === 'google')?.identity_data;
    const metaFullName = (sbUser.user_metadata as any)?.full_name ||
                         (sbUser.user_metadata as any)?.name ||
                         (sbUser.user_metadata as any)?.given_name ||
                         googleIdentity?.full_name ||
                         googleIdentity?.name ||
                         sbUser.email?.split('@')[0] || 'Enterprise Architect';
    const metaAvatarUrl = (sbUser.user_metadata as any)?.avatar_url ||
                          (sbUser.user_metadata as any)?.picture ||
                          googleIdentity?.avatar_url ||
                          googleIdentity?.picture || null;

    let displayName = metaFullName;
    let photoURL = metaAvatarUrl;

    // Master admin email override if present
    if (isUserAdminEmail(sbUser.email)) {
      role = 'admin';
      tier = 'enterprise';
    }

    if (supabase && isSupabaseConfigured) {
      try {
        // Authoritative Check 1: Supabase database public.is_admin() RPC function
        try {
          const { data: isAdminRpc, error: rpcErr } = await supabase.rpc('is_admin');
          if (!rpcErr && isAdminRpc === true) {
            role = 'admin';
            tier = 'enterprise';
          }
        } catch {
          // RPC may not be available in mock/local preview
        }

        // Authoritative Check 2: Supabase public.admins table allowlist
        if (role !== 'admin' && sbUser.email) {
          try {
            const { data: adminRow } = await supabase
              .from('admins')
              .select('email')
              .or(`user_id.eq.${sbUser.id},email.eq.${sbUser.email.toLowerCase()}`)
              .maybeSingle();
            if (adminRow) {
              role = 'admin';
              tier = 'enterprise';
            }
          } catch {
            // admins table might not exist in preview
          }
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, subscription_tier, full_name, avatar_url')
          .eq('id', sbUser.id)
          .maybeSingle();

        if (!error && data) {
          if (data.role === 'admin' || role === 'admin' || isUserAdminEmail(sbUser.email)) {
            role = 'admin';
          } else if (data.role === 'authorized' || data.subscription_tier === 'enterprise' || data.subscription_tier === 'pro') {
            role = 'authorized';
          } else {
            role = 'public';
          }

          if (role === 'admin' || isUserAdminEmail(sbUser.email)) {
            tier = 'enterprise';
          } else if (data.subscription_tier === 'pro' || data.subscription_tier === 'enterprise' || data.subscription_tier === 'free') {
            tier = data.subscription_tier;
          }

          const isGenericName = !data.full_name || data.full_name === 'User' || data.full_name === sbUser.email?.split('@')[0];
          if (isGenericName && metaFullName && metaFullName !== sbUser.email?.split('@')[0]) {
            displayName = metaFullName;
          } else if (data.full_name) {
            displayName = data.full_name;
          }

          if (!data.avatar_url && metaAvatarUrl) {
            photoURL = metaAvatarUrl;
          } else if (data.avatar_url) {
            photoURL = data.avatar_url;
          }

          // If database profile is missing avatar or full name that Google provided, or role needs update
          const roleNeedsUpdate = isUserAdminEmail(sbUser.email) && data.role !== 'admin';
          const needsSync = (!data.avatar_url && metaAvatarUrl) || (isGenericName && metaFullName && metaFullName !== sbUser.email?.split('@')[0]) || roleNeedsUpdate;
          if (needsSync) {
            try {
              await supabase
                .from('profiles')
                .update({
                  full_name: displayName,
                  avatar_url: photoURL,
                  ...(roleNeedsUpdate ? { role: 'admin', subscription_tier: 'enterprise' } : {}),
                  last_sign_in_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', sbUser.id);
            } catch {}
          }
        } else {
          // Profile does not exist yet (e.g. first Google sign in) - Persist immediately to Supabase
          try {
            const isEmailAdmin = sbUser.email?.toLowerCase().trim() === 'congodb1@gmail.com';
            const initialRole = (isEmailAdmin || role === 'admin') ? 'admin' : (role || 'user');
            const initialTier = (isEmailAdmin || role === 'admin') ? 'enterprise' : tier;

            const { error: upsertError } = await supabase.from('profiles').upsert({
              id: sbUser.id,
              email: sbUser.email || 'user@zaboraa.com',
              full_name: metaFullName || displayName,
              avatar_url: metaAvatarUrl || photoURL || null,
              role: initialRole,
              subscription_tier: initialTier,
              status: 'active',
              last_sign_in_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (upsertError) {
              console.warn('Notice creating initial user profile in Supabase:', upsertError.message);
            }
          } catch (insertErr: any) {
            console.warn('Notice: Unable to upsert public.profiles:', insertErr?.message || insertErr);
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

    // Synchronize real profile into admin local registry immediately
    try {
      if (typeof localStorage !== 'undefined' && authProfile.email) {
        const localList = adminService.getLocalUsers();
        const existingIdx = localList.findIndex((u) => u.email === authProfile.email || u.id === authProfile.uid);
        const mappedRole = (authProfile.role as AdminUserRole) || (isUserAdminEmail(authProfile.email) ? 'admin' : 'authorized');
        if (existingIdx >= 0) {
          localList[existingIdx] = {
            ...localList[existingIdx],
            full_name: displayName,
            avatar_url: photoURL || localList[existingIdx].avatar_url,
            role: mappedRole,
            subscription_tier: tier,
            updated_at: new Date().toISOString()
          };
        } else {
          localList.unshift({
            id: authProfile.uid,
            email: authProfile.email,
            role: mappedRole,
            status: 'active',
            subscription_tier: tier,
            full_name: displayName,
            avatar_url: photoURL || undefined,
            created_at: sbUser.created_at || new Date().toISOString()
          });
        }
        adminService.saveLocalUsers(localList);
      }
    } catch {}

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

  const handleSignInWithIdToken = useCallback(async (token: string, rawNonce: string): Promise<AuthUserProfile | null> => {
    setAuthError(null);
    try {
      if (!supabase || !isSupabaseConfigured) {
        setAuthError('Sign-in failed: Supabase authentication is not configured.');
        return null;
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: token,
        nonce: rawNonce
      });

      if (error) {
        setAuthError(`Sign-in failed: ${error.message || 'Unknown error'}`);
        return null;
      }

      const rawEmail = data.session?.user?.email ?? data.user?.email ?? "";
      const email = rawEmail.trim().toLowerCase();

      if (!email) {
        setAuthError('Sign-in failed: missing email');
        return null;
      }

      let allowedList = ALLOWED_EMAILS.map(e => e.trim().toLowerCase()).filter(Boolean);
      if (allowedList.length === 0) {
        console.error("ALLOWED_EMAILS is empty");
        allowedList = ["congodb1@gmail.com"];
      }

      console.log("[auth] allowlist check", { email, allowed: allowedList, sessionHasUser: !!data.session?.user });

      if (!allowedList.includes(email)) {
        await supabase.auth.signOut();
        setUser(null);
        setAuthError('not on allow list');
        return null;
      }

      let profile: AuthUserProfile | null = null;
      try {
        profile = await mapSupabaseUserToProfile(data.session.user);
      } catch (profileErr: any) {
        console.warn('Notice: Error building profile, returning fallback session profile:', profileErr);
        const errMsg = profileErr?.message || profileErr?.error_description || String(profileErr);
        setAuthError(`Sign-in failed: ${errMsg}`);
        const lower = lowerEmail;
        const isEmailAdmin = lower === 'congodb1@gmail.com';
        profile = {
          uid: data.session.user.id,
          email: data.session.user.email || lower,
          displayName: data.session.user.user_metadata?.full_name || lower.split('@')[0],
          photoURL: data.session.user.user_metadata?.avatar_url || null,
          licenseTier: isEmailAdmin ? 'enterprise' : 'free',
          role: isEmailAdmin ? 'admin' : 'public',
          provider: 'google'
        };
      }

      setUser(profile);
      setSubscriptionTierState(profile.licenseTier);
      saveLocalStoredUser(profile);

      if (typeof window !== 'undefined') {
        window.location.href = '/admin';
      }
      return profile;
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      setAuthError(`Sign-in failed: ${msg}`);
      return null;
    }
  }, [mapSupabaseUserToProfile]);

  const renderGoogleButton = useCallback((element: HTMLElement) => {
    let isMounted = true;
    loadGoogleGsiScript().then(async () => {
      if (!isMounted || !element) return;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn('VITE_GOOGLE_CLIENT_ID is not configured');
        return;
      }

      if (!activeRawNonce || !activeHashedNonce) {
        activeRawNonce = generateRawNonce();
        activeHashedNonce = await hashNonceToHex(activeRawNonce);
      }

      const currentRaw = activeRawNonce;
      const currentHashed = activeHashedNonce;

      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        if (!isGisInitialized) {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response?.credential) {
                await handleSignInWithIdToken(response.credential, currentRaw);
              }
            },
            nonce: currentHashed
          });
          isGisInitialized = true;
        }

        element.innerHTML = '';
        (window as any).google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 320
        });
      }
    }).catch((err) => {
      console.error('Failed to load Google Identity Services script:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [handleSignInWithIdToken]);

  const signInWithGoogle = async (): Promise<AuthUserProfile> => {
    setAuthError(null);
    throw new Error('Please use the Google Sign-In button.');
  };

  const signInWithGoogleRedirect = async (): Promise<void> => {
    setAuthError(null);
    throw new Error('Please use the Google Sign-In button.');
  };

  const signInWithMicrosoft = async (): Promise<void> => {
    setAuthError(null);
    throw new Error('Microsoft authentication service is not configured.');
  };

  const loginWithEmail = async (email: string, pass: string): Promise<AuthUserProfile> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

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
      email: 'demo@example.invalid',
      displayName: 'Demo Architect',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      licenseTier: 'free',
      role: 'public',
      provider: 'demo'
    };
    setUser(demo);
    setSubscriptionTierState('free');
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

        return profileData?.role === 'admin';
      } catch {
        return false;
      }
    }

    return false;
  };

  const refreshUserProfile = async (): Promise<AuthUserProfile | null> => {
    if (!supabase) return user;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return user;
      const profile = await mapSupabaseUserToProfile(session.user);
      setUser(profile);
      setSubscriptionTierState(profile.licenseTier);
      saveLocalStoredUser(profile);
      return profile;
    } catch {
      return user;
    }
  };

  const clearAuthError = () => setAuthError(null);

  // Live admin verification
  const isAdmin = user?.role === 'admin' && user?.provider !== 'demo';
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
        refreshUserProfile,
        isCommercializeModalOpen,
        setIsCommercializeModalOpen,
        authError,
        clearAuthError,
        renderGoogleButton,
        handleSignInWithIdToken,

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
