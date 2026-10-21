import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useCustomization } from '../../../context/CustomizationContext';
import { adminService } from '../../../services/adminService';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import {
  User,
  Shield,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Mail,
  Briefcase,
  Phone,
  Lock,
  Sparkles,
  RefreshCw,
  KeyRound
} from 'lucide-react';

interface AdminProfileViewProps {
  currentUserEmail: string;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ currentUserEmail }) => {
  const { user, refreshUserProfile } = useAuth();
  const { siteConfig, updateFounderPhoto, updateFounderCredentials } = useCustomization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [fullName, setFullName] = useState(
    user?.displayName || siteConfig.founder?.name || 'Wasim Sayyed'
  );
  const [roleTitle, setRoleTitle] = useState(
    siteConfig.founder?.role || 'Lead Cloud Infrastructure Architect'
  );
  const [phone, setPhone] = useState('+1 (415) 890-2100');
  const [department, setDepartment] = useState('Multi-Cloud Enterprise Solutions Practice');
  const [location, setLocation] = useState(siteConfig.founder?.location || 'San Francisco, CA & Global');
  const [bio, setBio] = useState(
    siteConfig.founder?.bio ||
      'Senior Infrastructure Architect specializing in enterprise VMware hyperscaler migrations across Azure AVS, AWS VMC, and Google Cloud GCVE.'
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(
    user?.photoURL || siteConfig.founder?.portraitImage || '/assets/images/Wasim-Pic-02.png'
  );

  // Preferences
  const [sessionTimeout, setSessionTimeout] = useState('4h');
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const [auditEmailsEnabled, setAuditEmailsEnabled] = useState(true);

  // Status & Feedback
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Synchronize form states when user profile or siteConfig updates from Supabase
  useEffect(() => {
    if (user?.displayName) {
      setFullName(user.displayName);
    } else if (siteConfig.founder?.name) {
      setFullName(siteConfig.founder.name);
    }

    if (user?.photoURL) {
      setAvatarUrl(user.photoURL);
    } else if (siteConfig.founder?.portraitImage) {
      setAvatarUrl(siteConfig.founder.portraitImage);
    }

    if (siteConfig.founder?.role) setRoleTitle(siteConfig.founder.role);
    if (siteConfig.founder?.phone) setPhone(siteConfig.founder.phone);
    if (siteConfig.founder?.location) setLocation(siteConfig.founder.location);
    if (siteConfig.founder?.bio) setBio(siteConfig.founder.bio);
  }, [user, siteConfig.founder]);

  // Handle Avatar Image File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Avatar image must be under 5MB.' });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Try uploading to Supabase Storage bucket 'avatars'
      if (isSupabaseConfigured && supabase) {
        try {
          const fileExt = file.name.split('.').pop() || 'png';
          const filePath = `admin-avatar-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
              setAvatarUrl(publicUrlData.publicUrl);
              updateFounderPhoto(publicUrlData.publicUrl);
              setFeedback({ type: 'success', message: 'Avatar successfully uploaded to Supabase Storage.' });
              setIsUploading(false);
              return;
            }
          }
        } catch (storageErr) {
          console.warn('Notice uploading to Supabase Storage bucket (falling back to base64 preview):', storageErr);
        }
      }

      // 2. Base64 fallback for local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setAvatarUrl(base64);
          updateFounderPhoto(base64);
          setFeedback({ type: 'success', message: 'Avatar loaded into active profile.' });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to process avatar image.' });
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      let persistedToCloud = false;
      let cloudError: string | undefined;

      // 1. Update Supabase public.profiles if configured and session exists
      if (isSupabaseConfigured && supabase && user?.uid) {
        try {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.uid,
              email: user.email,
              full_name: fullName.trim(),
              avatar_url: avatarUrl.trim() || null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

          if (error) {
            cloudError = error.message;
          } else {
            persistedToCloud = true;
            try {
              await refreshUserProfile();
            } catch {}
          }
        } catch (e: any) {
          cloudError = e?.message || 'Database update failed';
        }
      }

      // 2. Sync to siteConfig and persistent site_content
      const updatedFounder = {
        name: fullName.trim(),
        role: roleTitle.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        portraitImage: avatarUrl.trim() || undefined
      };
      updateFounderCredentials(updatedFounder);

      const contentSaveResult = await adminService.saveSiteContent(
        'founder',
        updatedFounder,
        'Executive Founder Profile',
        currentUserEmail
      );

      if (contentSaveResult.persistedToCloud) {
        persistedToCloud = true;
      }

      // 3. Mirror into local users cache so Admin Console updates immediately
      const existingUsers = adminService.getLocalUsers();
      const updatedLocal = existingUsers.map((u) =>
        u.id === user?.uid || u.email === currentUserEmail
          ? {
              ...u,
              full_name: fullName.trim(),
              avatar_url: avatarUrl.trim() || null,
              updated_at: new Date().toISOString()
            }
          : u
      );
      adminService.saveLocalUsers(updatedLocal);

      await adminService.logAuditEvent({
        actorEmail: currentUserEmail,
        actorRole: 'admin',
        action: 'UPDATE_ADMIN_PROFILE',
        targetEntity: 'profiles',
        targetId: user?.uid || 'admin',
        outcome: persistedToCloud ? 'success' : (isSupabaseConfigured ? 'failure' : 'success'),
        metadata: { fullName, roleTitle, department, persistedToCloud, cloudError }
      });

      if (isSupabaseConfigured && !persistedToCloud) {
        setFeedback({
          type: 'error',
          message: `Failed to persist profile to Supabase: ${cloudError || 'Cloud write did not complete'}. Changes saved to local preview only.`
        });
      } else if (isSupabaseConfigured && persistedToCloud) {
        setFeedback({
          type: 'success',
          message: 'Profile details and account preferences successfully persisted to Supabase.'
        });
      } else {
        setFeedback({
          type: 'success',
          message: 'Profile details saved to local storage (Supabase is not configured).'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save profile changes.'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Administrator Profile & Security</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your executive credentials, avatar portrait, session security, and communication coordinates.
          </p>
        </div>

        <button
          type="submit"
          form="profile-settings-form"
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaving ? 'Updating...' : 'Save Profile'}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Profile Form */}
      <form id="profile-settings-form" onSubmit={handleSaveProfile} className="space-y-6">
        {/* Card 1: Avatar & Identity Header */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Picture with Upload Overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 p-0.5 shadow-xl overflow-hidden">
              <img
                src={avatarUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                onError={() => setAvatarUrl('/assets/images/Wasim-Pic-02.png')}
                className="w-full h-full object-cover object-top rounded-[14px]"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Upload profile photo"
              className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-cyan-400" />
              <span>{isUploading ? 'Uploading...' : 'Change'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg font-bold text-white">{fullName}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 self-center sm:self-auto">
                <Shield className="w-3 h-3" />
                <span>Enterprise Administrator</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{currentUserEmail}</p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl('/assets/images/Wasim-Pic-02.png');
                  updateFounderPhoto('/assets/images/Wasim-Pic-02.png');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Personal & Professional Details */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Professional Coordinates</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Executive Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUserEmail}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 font-mono cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">Managed via Supabase Authentication identity provider.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Direct Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Practice / Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Executive Bio & Credentials</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Card 3: Security & Session Preferences */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Security & Session Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Session Idle Timeout
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours (Recommended)</option>
                <option value="8h">8 Hours (Full Shift)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Security Incident Notifications</div>
                <div className="text-[11px] text-slate-400">Receive alerts when audit warning events occur</div>
              </div>
              <input
                type="checkbox"
                checked={securityAlertsEnabled}
                onChange={(e) => setSecurityAlertsEnabled(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
