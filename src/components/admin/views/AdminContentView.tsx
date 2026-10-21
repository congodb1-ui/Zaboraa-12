import React, { useState } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  Globe,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useCustomization } from '../../../context/CustomizationContext';
import { adminService } from '../../../services/adminService';

interface AdminContentViewProps {
  currentUserEmail: string;
}

export const AdminContentView: React.FC<AdminContentViewProps> = ({
  currentUserEmail
}) => {
  const { siteConfig, updateAdminSettings, updateGeneralInfo, updateHeroContent, syncAllContentToCloud } = useCustomization();

  // Announcement Banner
  const [announcementText, setAnnouncementText] = useState(
    siteConfig.adminSettings?.announcementText ||
      'Executive multi-cloud migration runbooks updated for VMware vSphere 8.0U3 & Azure AVS Gen 2.'
  );
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    siteConfig.adminSettings?.announcementBannerEnabled ?? true
  );
  const [announcementLink, setAnnouncementLink] = useState(
    siteConfig.adminSettings?.announcementLink || '/tools/design-generator'
  );

  // Hero Section Headline & Subtitle
  const [heroHeadline, setHeroHeadline] = useState(
    siteConfig.hero?.headline ||
      'Enterprise Multi-Cloud Infrastructure Architecture & Hyperscaler Migration'
  );
  const [heroSubheadline, setHeroSubheadline] = useState(
    siteConfig.hero?.subheadline ||
      'Architecting resilient VMware environments across Azure AVS, AWS VMC, Google GCVE, and Nutanix NC2 with verified SLA benchmarks and decoupled storage economics.'
  );

  // Brand Info
  const [brandName, setBrandName] = useState(siteConfig.brand || 'Zaboraa Technologies');
  const [brandTagline, setBrandTagline] = useState(
    siteConfig.brandTagline || 'Enterprise VMware Cloud & Hyperscaler Architecture'
  );
  const [contactEmail, setContactEmail] = useState(
    siteConfig.founder?.email || 'wasim.sayyed@zaboraa.com'
  );

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSyncAll = async () => {
    setIsPublishing(true);
    setStatusMsg(null);
    try {
      const res = await syncAllContentToCloud();
      setStatusMsg({
        type: res.persistedToCloud ? 'success' : 'warning',
        text: res.message
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to sync content to Supabase cloud.'
      });
    } finally {
      setIsPublishing(false);
      setTimeout(() => setStatusMsg(null), 6000);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setStatusMsg(null);

    try {
      // 1. Update React Context state
      updateAdminSettings({
        announcementBannerEnabled: announcementEnabled,
        announcementText,
        announcementLink
      });

      updateGeneralInfo({
        brand: brandName,
        brandTagline,
        founder: {
          ...siteConfig.founder,
          email: contactEmail
        }
      });

      updateHeroContent({
        headline: heroHeadline,
        subheadline: heroSubheadline
      });

      // 2. Persist to Supabase app_settings and site_content
      const res = await adminService.saveGlobalSettings({
        branding: {
          brandName,
          brandTagline
        },
        announcement: {
          announcementBannerEnabled: announcementEnabled,
          announcementText,
          announcementLink
        },
        siteContent: {
          hero: {
            ...siteConfig.hero,
            headline: heroHeadline,
            subheadline: heroSubheadline
          },
          founder: {
            ...siteConfig.founder,
            email: contactEmail
          },
          platformShowcases: siteConfig.platformShowcases,
          diagrams: siteConfig.diagrams,
          videos: siteConfig.videos,
          tutorials: siteConfig.tutorials,
          caseStudies: siteConfig.caseStudies,
          services: siteConfig.services,
          knowledgeBase: siteConfig.knowledgeBase
        }
      }, currentUserEmail);

      await adminService.logAuditEvent({
        actorEmail: currentUserEmail,
        actorRole: 'admin',
        action: 'UPDATE_WEBSITE_CMS_CONTENT',
        targetEntity: 'site_content',
        outcome: res.success ? 'success' : 'failure',
        metadata: { announcementEnabled, brandName, heroHeadline, persistedToCloud: res.persistedToCloud, error: res.error }
      });

      if (res.persistedToCloud) {
        setStatusMsg({
          type: 'success',
          text: 'Website content & settings updated and published successfully to Supabase cloud.'
        });
      } else {
        setStatusMsg({
          type: 'warning',
          text: `Settings updated in local cache: ${res.cloudError || 'Cloud write did not complete'}.`
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to save website content.'
      });
    } finally {
      setIsPublishing(false);
      setTimeout(() => setStatusMsg(null), 6000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <FileText className="w-3.5 h-3.5" />
            <span>CONTENT MANAGEMENT SYSTEM (CMS)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Website Content & Global Announcements
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Configure live homepage messaging, emergency advisory banners, executive brand identity, and published copy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAll}
            disabled={isPublishing}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700 hover:border-slate-600 shadow-sm"
            title="Synchronize all active diagrams, videos, tutorials, case studies, and showcases to Supabase Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>Sync All Content</span>
          </button>
          <button
            onClick={handleSaveContent}
            disabled={isPublishing}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 shadow-sm animate-in fade-in ${
          statusMsg.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
            : statusMsg.type === 'warning'
            ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
            : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSaveContent} className="space-y-6">
        {/* Module 1: Emergency & Announcement Banner */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Announcement & Advisory Banner</h2>
                <p className="text-[11px] text-slate-400">
                  Global notification displayed at the absolute top of every page.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700"
              />
              <span className="text-xs font-mono font-semibold text-slate-300">
                {announcementEnabled ? 'Active (Live)' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold font-mono">Banner Headline Text:</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Announcement message..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold font-mono">Target Route / Link URL:</label>
              <input
                type="text"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                placeholder="/tools/design-generator"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Module 2: Hero Section Messaging */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Homepage Executive Hero Messaging</h2>
            <p className="text-[11px] text-slate-400">
              Value proposition and positioning copy rendered directly below the navigation bar.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold font-mono">Primary Headline:</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold font-mono">Executive Subheadline Narrative:</label>
              <textarea
                rows={3}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Module 3: Enterprise Brand & Identity */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Brand & Communication Channels</h2>
            <p className="text-[11px] text-slate-400">
              Organization name, executive tagline, and official inquiry contact email.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold font-mono">Organization Name:</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-300 font-semibold font-mono">Executive Brand Tagline:</label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-slate-300 font-semibold font-mono">Contact & Advisory Email:</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full max-w-md px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
