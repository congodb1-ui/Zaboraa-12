import React, { useState, useEffect } from 'react';
import { useCustomization } from '../../../context/CustomizationContext';
import { adminService } from '../../../services/adminService';
import {
  BlueprintAccessMode,
  ThemePreset,
  LayoutDensity,
  HeaderStyle,
  BackgroundPattern,
  ImageAnimationType,
  WatermarkConfig
} from '../../../types/siteData';
import { CASE_STUDIES } from '../../../data/caseStudies';
import {
  SlidersHorizontal,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ShieldCheck,
  Globe,
  Lock,
  Layers,
  Download,
  Upload,
  RefreshCw,
  Palette,
  Layout,
  Server,
  Eye,
  EyeOff,
  Sliders,
  FileText,
  UserCheck,
  Briefcase,
  Camera,
  ExternalLink,
  Plus,
  Shield,
  Sun,
  Moon
} from 'lucide-react';

interface AdminSettingsViewProps {
  currentUserEmail: string;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ currentUserEmail }) => {
  const {
    siteConfig,
    savePersistentAdminSettings,
    resetToDefaults,
    setIsCustomizerOpen,
    setIsWatermarkModalOpen,
    setIsPhotoEditorOpen,
    setIsTrackRecordModalOpen,
    setActiveEditCaseStudy,
    syncAllContentToCloud
  } = useCustomization();

  const [activeSettingsTab, setActiveSettingsTab] = useState<
    'appearance' | 'branding' | 'founder-hero' | 'architecture' | 'features' | 'case-studies'
  >('appearance');

  // Appearance & Theme States
  const [themePreset, setThemePreset] = useState<ThemePreset>(
    siteConfig.adminSettings?.themePreset || 'default'
  );
  const [layoutDensity, setLayoutDensity] = useState<LayoutDensity>(
    siteConfig.adminSettings?.layoutDensity || 'balanced'
  );
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>(
    siteConfig.adminSettings?.headerStyle || 'glass'
  );
  const [backgroundPattern, setBackgroundPattern] = useState<BackgroundPattern>(
    siteConfig.adminSettings?.backgroundPattern || 'tech-grid'
  );
  const [imageAnimationsEnabled, setImageAnimationsEnabled] = useState<boolean>(
    siteConfig.adminSettings?.imageAnimationsEnabled ?? true
  );
  const [imageAnimationType, setImageAnimationType] = useState<ImageAnimationType>(
    siteConfig.adminSettings?.imageAnimationType || 'ken-burns'
  );
  const [enableHotspots, setEnableHotspots] = useState<boolean>(
    siteConfig.enableHotspots ?? true
  );

  // Watermark States
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(
    siteConfig.watermark?.enabled ?? true
  );
  const [watermarkText, setWatermarkText] = useState<string>(
    siteConfig.watermark?.text || 'ZABORAA · HYBRID CLOUD BLUEPRINT'
  );
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkConfig['position']>(
    siteConfig.watermark?.position || 'bottom-right'
  );
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(
    siteConfig.watermark?.opacity ?? 0.35
  );

  // Branding States
  const [brandName, setBrandName] = useState(siteConfig.brand || 'Zaboraa');
  const [brandTagline, setBrandTagline] = useState(
    siteConfig.brandTagline || 'Enterprise VMware Cloud & Hyperscaler Architecture'
  );
  const [brandLogoUrl, setBrandLogoUrl] = useState(siteConfig.brandLogoUrl || '');
  const [supportEmail, setSupportEmail] = useState(
    siteConfig.adminSettings?.supportEmail || 'support@zaboraa.com'
  );
  const [executiveContact, setExecutiveContact] = useState(
    siteConfig.adminSettings?.executiveContact || 'wasim.sayyed@zaboraa.com'
  );

  // Founder & Hero States
  const [founderName, setFounderName] = useState(siteConfig.founder?.name || 'Wasim Sayyed');
  const [founderRole, setFounderRole] = useState(
    siteConfig.founder?.role || 'Lead Principal Hybrid Cloud Architect'
  );
  const [founderLocation, setFounderLocation] = useState(
    siteConfig.founder?.location || 'Pune & Global Advisory'
  );
  const [founderPhone, setFounderPhone] = useState(
    siteConfig.founder?.phone || '+91 7497624807'
  );
  const [founderEmail, setFounderEmail] = useState(
    siteConfig.founder?.email || 'wasim.sayyed@zaboraa.com'
  );
  const [founderBio, setFounderBio] = useState(
    siteConfig.founder?.bio ||
      'Over 14 years architecting mission-critical virtualization and cloud foundations across EMEA and APAC.'
  );
  const [heroEyebrow, setHeroEyebrow] = useState(
    siteConfig.hero?.eyebrow || 'Enterprise Multi-Cloud Infrastructure Architecture'
  );
  const [heroHeadline, setHeroHeadline] = useState(
    siteConfig.hero?.headline ||
      'Enterprise Multi-Cloud Infrastructure Architecture & Hyperscaler Migration'
  );
  const [heroSubheadline, setHeroSubheadline] = useState(
    siteConfig.hero?.subheadline ||
      'Architecting resilient VMware environments across Azure AVS, AWS VMC, Google GCVE, and Nutanix NC2 with verified SLA benchmarks and decoupled storage economics.'
  );

  // Architecture & Sizing Calculation Defaults
  const [defaultCloud, setDefaultCloud] = useState(
    siteConfig.adminSettings?.defaultCloudPlatform || 'Azure AVS'
  );
  const [defaultOvercommit, setDefaultOvercommit] = useState(
    siteConfig.adminSettings?.defaultVcpuOvercommit ?? 2.5
  );
  const [defaultRamBuffer, setDefaultRamBuffer] = useState(
    siteConfig.adminSettings?.defaultRamBufferPercent ?? 20
  );
  const [defaultRpoMinutes, setDefaultRpoMinutes] = useState(
    siteConfig.adminSettings?.defaultTargetRpoMinutes ?? 15
  );
  const [defaultRtoHours, setDefaultRtoHours] = useState(
    siteConfig.adminSettings?.defaultTargetRtoHours ?? 2
  );
  const [primaryRegion, setPrimaryRegion] = useState(
    siteConfig.adminSettings?.primaryRegion || 'East US 2 (Virginia)'
  );

  // Feature Governance Toggles
  const [export4k, setExport4k] = useState(
    siteConfig.adminSettings?.featureControls?.export4k ?? true
  );
  const [exportDossier, setExportDossier] = useState(
    siteConfig.adminSettings?.featureControls?.exportDossier ?? true
  );
  const [exportExecutiveSummary, setExportExecutiveSummary] = useState(
    siteConfig.adminSettings?.featureControls?.exportExecutiveSummary ?? true
  );
  const [generateBlueprint, setGenerateBlueprint] = useState(
    siteConfig.adminSettings?.featureControls?.generateBlueprint ?? true
  );
  const [blueprintAccessMode, setBlueprintAccessMode] = useState<BlueprintAccessMode>(
    siteConfig.adminSettings?.blueprintAccessMode ||
    siteConfig.adminSettings?.featureControls?.blueprintAccessMode ||
    'everyone'
  );
  const [authRequiredForTools, setAuthRequiredForTools] = useState(
    siteConfig.adminSettings?.authRequiredForTools ?? false
  );
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(
    siteConfig.adminSettings?.publicAccessEnabled ?? true
  );

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Synchronize local states when siteConfig changes
  useEffect(() => {
    if (siteConfig.brand) setBrandName(siteConfig.brand);
    if (siteConfig.brandTagline) setBrandTagline(siteConfig.brandTagline);
    if (siteConfig.brandLogoUrl !== undefined) setBrandLogoUrl(siteConfig.brandLogoUrl || '');

    if (siteConfig.founder) {
      if (siteConfig.founder.name) setFounderName(siteConfig.founder.name);
      if (siteConfig.founder.role) setFounderRole(siteConfig.founder.role);
      if (siteConfig.founder.location) setFounderLocation(siteConfig.founder.location);
      if (siteConfig.founder.phone) setFounderPhone(siteConfig.founder.phone);
      if (siteConfig.founder.email) setFounderEmail(siteConfig.founder.email);
      if (siteConfig.founder.bio) setFounderBio(siteConfig.founder.bio);
    }

    if (siteConfig.hero) {
      if (siteConfig.hero.eyebrow) setHeroEyebrow(siteConfig.hero.eyebrow);
      if (siteConfig.hero.headline) setHeroHeadline(siteConfig.hero.headline);
      if (siteConfig.hero.subheadline) setHeroSubheadline(siteConfig.hero.subheadline);
    }

    if (siteConfig.watermark) {
      if (siteConfig.watermark.enabled !== undefined) setWatermarkEnabled(siteConfig.watermark.enabled);
      if (siteConfig.watermark.text) setWatermarkText(siteConfig.watermark.text);
      if (siteConfig.watermark.position) setWatermarkPosition(siteConfig.watermark.position);
      if (siteConfig.watermark.opacity !== undefined) setWatermarkOpacity(siteConfig.watermark.opacity);
    }

    if (siteConfig.enableHotspots !== undefined) {
      setEnableHotspots(siteConfig.enableHotspots);
    }

    const admin = siteConfig.adminSettings;
    if (admin) {
      if (admin.themePreset) setThemePreset(admin.themePreset);
      if (admin.layoutDensity) setLayoutDensity(admin.layoutDensity);
      if (admin.headerStyle) setHeaderStyle(admin.headerStyle);
      if (admin.backgroundPattern) setBackgroundPattern(admin.backgroundPattern);
      if (admin.imageAnimationsEnabled !== undefined) setImageAnimationsEnabled(admin.imageAnimationsEnabled);
      if (admin.imageAnimationType) setImageAnimationType(admin.imageAnimationType);

      if (admin.supportEmail) setSupportEmail(admin.supportEmail);
      if (admin.executiveContact) setExecutiveContact(admin.executiveContact);
      if (admin.defaultCloudPlatform) setDefaultCloud(admin.defaultCloudPlatform);
      if (admin.defaultVcpuOvercommit !== undefined) setDefaultOvercommit(admin.defaultVcpuOvercommit);
      if (admin.defaultRamBufferPercent !== undefined) setDefaultRamBuffer(admin.defaultRamBufferPercent);
      if (admin.defaultTargetRpoMinutes !== undefined) setDefaultRpoMinutes(admin.defaultTargetRpoMinutes);
      if (admin.defaultTargetRtoHours !== undefined) setDefaultRtoHours(admin.defaultTargetRtoHours);
      if (admin.primaryRegion) setPrimaryRegion(admin.primaryRegion);
      if (admin.authRequiredForTools !== undefined) setAuthRequiredForTools(admin.authRequiredForTools);
      if (admin.publicAccessEnabled !== undefined) setPublicAccessEnabled(admin.publicAccessEnabled);

      const mode = admin.blueprintAccessMode || admin.featureControls?.blueprintAccessMode || 'signed_in';
      setBlueprintAccessMode(mode);

      if (admin.featureControls) {
        if (admin.featureControls.export4k !== undefined) setExport4k(admin.featureControls.export4k);
        if (admin.featureControls.exportDossier !== undefined) setExportDossier(admin.featureControls.exportDossier);
        if (admin.featureControls.exportExecutiveSummary !== undefined) setExportExecutiveSummary(admin.featureControls.exportExecutiveSummary);
        if (admin.featureControls.generateBlueprint !== undefined) setGenerateBlueprint(admin.featureControls.generateBlueprint);
      }
    }
  }, [siteConfig]);

  const activeCaseStudies = (siteConfig.caseStudies && siteConfig.caseStudies.length > 0)
    ? siteConfig.caseStudies
    : CASE_STUDIES;

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const result = await savePersistentAdminSettings(
        {
          themePreset,
          layoutDensity,
          headerStyle,
          backgroundPattern,
          imageAnimationsEnabled,
          imageAnimationType,
          supportEmail,
          executiveContact,
          defaultCloudPlatform: defaultCloud,
          defaultVcpuOvercommit: Number(defaultOvercommit),
          defaultRamBufferPercent: Number(defaultRamBuffer),
          defaultTargetRpoMinutes: Number(defaultRpoMinutes),
          defaultTargetRtoHours: Number(defaultRtoHours),
          primaryRegion,
          authRequiredForTools,
          publicAccessEnabled,
          blueprintAccessMode,
          featureControls: {
            export4k,
            exportDossier,
            exportExecutiveSummary,
            generateBlueprint,
            blueprintAccessMode
          }
        },
        {
          brandName: brandName.trim(),
          brandTagline: brandTagline.trim(),
          brandLogoUrl: brandLogoUrl.trim() || undefined
        },
        {
          watermark: {
            enabled: watermarkEnabled,
            type: 'text',
            text: watermarkText.trim(),
            position: watermarkPosition,
            opacity: watermarkOpacity
          },
          enableHotspots,
          founder: {
            ...siteConfig.founder,
            name: founderName.trim(),
            role: founderRole.trim(),
            location: founderLocation.trim(),
            phone: founderPhone.trim(),
            email: founderEmail.trim(),
            bio: founderBio.trim()
          },
          hero: {
            ...siteConfig.hero,
            eyebrow: heroEyebrow.trim(),
            headline: heroHeadline.trim(),
            subheadline: heroSubheadline.trim()
          }
        }
      );

      if (result.success) {
        setFeedback({
          type: 'success',
          message: result.message
        });
        await adminService.logAuditEvent({
          actorEmail: currentUserEmail,
          actorRole: 'admin',
          action: 'UPDATE_PLATFORM_SETTINGS',
          targetEntity: 'app_settings',
          targetId: 'global',
          outcome: 'success',
          metadata: {
            brandName,
            themePreset,
            defaultCloud,
            watermarkEnabled,
            enableHotspots
          }
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.message
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save configuration.'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const res = await syncAllContentToCloud();
      setFeedback({
        type: res.persistedToCloud ? 'success' : 'error',
        message: res.message
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Cloud synchronization failed.'
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleExportJson = () => {
    const configData = {
      branding: { brandName, brandTagline, brandLogoUrl, supportEmail, executiveContact },
      theme: { themePreset, layoutDensity, headerStyle, backgroundPattern, imageAnimationsEnabled, imageAnimationType, enableHotspots },
      watermark: { watermarkEnabled, watermarkText, watermarkPosition, watermarkOpacity },
      founder: { founderName, founderRole, founderLocation, founderPhone, founderEmail, founderBio },
      hero: { heroEyebrow, heroHeadline, heroSubheadline },
      organization: { defaultCloud, defaultOvercommit, defaultRamBuffer, defaultRpoMinutes, defaultRtoHours, primaryRegion },
      featureControls: { export4k, exportDossier, exportExecutiveSummary, generateBlueprint, authRequiredForTools, publicAccessEnabled, blueprintAccessMode },
      caseStudiesCount: activeCaseStudies.length,
      exportedAt: new Date().toISOString(),
      author: currentUserEmail
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zaboraa-admin-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Admin & Site Settings Studio</h1>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              Full Control Plane
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Customize every visual, architectural, and operational parameter across the entire portal. All changes apply live and synchronize to Supabase cloud.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCloudSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            title="Sync all site content and settings to Supabase cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            title="Export full administrative configuration JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition cursor-pointer shadow-sm"
            title="Open interactive side drawer customizer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Edit Site Drawer</span>
          </button>
        </div>
      </div>

      {/* Status & Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono font-semibold">
        {[
          { id: 'appearance', label: 'Theme & UX Styling', icon: Palette },
          { id: 'branding', label: 'Branding & Identity', icon: Building2 },
          { id: 'founder-hero', label: 'Founder & Hero Copy', icon: UserCheck },
          { id: 'architecture', label: 'Architecture Sizing Defaults', icon: Server },
          { id: 'features', label: 'Feature Access Gates', icon: Lock },
          { id: 'case-studies', label: `Case Studies (${activeCaseStudies.length})`, icon: Briefcase }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSettingsTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSettingsTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        {/* TAB 1: THEME, STYLING & WATERMARK */}
        {activeSettingsTab === 'appearance' && (
          <div className="space-y-6">
            {/* Visual Theme Presets */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white">Visual UI Theme Presets</h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Current: {themePreset.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'default' as ThemePreset,
                    title: 'Hyper-Cloud Midnight (Default)',
                    desc: 'Original sleek enterprise aesthetic with glowing cyan & indigo accents and deep slate surfaces.',
                    colors: ['#06b6d4', '#6366f1', '#0f172a', '#020617']
                  },
                  {
                    id: 'nutanix' as ThemePreset,
                    title: 'Nutanix Cloud Prism',
                    desc: 'Tactical Nutanix HCI console design featuring vibrant emerald-teal accents and graphite surfaces.',
                    colors: ['#00d2aa', '#10b981', '#181e29', '#0d1117']
                  },
                  {
                    id: 'azure' as ThemePreset,
                    title: 'Azure Cloud Enterprise',
                    desc: 'Corporate Microsoft Azure enterprise portal aesthetic with deep royal blue & azure accents.',
                    colors: ['#0078d4', '#2563eb', '#0b192c', '#030816']
                  },
                  {
                    id: 'terminal' as ThemePreset,
                    title: 'Linux Terminal High-Contrast',
                    desc: 'Developer & operator terminal console with phosphor amber/green fonts and jet-black backdrop.',
                    colors: ['#22c55e', '#eab308', '#111827', '#000000']
                  },
                  {
                    id: 'titanium' as ThemePreset,
                    title: 'Titanium Executive',
                    desc: 'Ultra-refined executive silver, slate chrome, and subdued platinum highlights.',
                    colors: ['#94a3b8', '#cbd5e1', '#1e293b', '#0f172a']
                  },
                  {
                    id: 'nordic' as ThemePreset,
                    title: 'Nordic Minimalist',
                    desc: 'Clean, spacious Scandinavian cloud studio with ice-blue accents and minimal ornamentation.',
                    colors: ['#38bdf8', '#7dd3fc', '#1e293b', '#0c1322']
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setThemePreset(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      themePreset === item.id
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-white text-xs">{item.title}</h4>
                      {themePreset === item.id && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      {item.colors.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Density & Header Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Layout className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Layout Density
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['balanced', 'compact', 'executive'] as LayoutDensity[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setLayoutDensity(d)}
                      className={`p-3 rounded-xl border text-xs font-bold capitalize transition cursor-pointer ${
                        layoutDensity === d
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Header Style
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['glass', 'solid', 'blueprint'] as HeaderStyle[]).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHeaderStyle(h)}
                      className={`p-3 rounded-xl border text-xs font-bold capitalize transition cursor-pointer ${
                        headerStyle === h
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Background Pattern & Diagram Hotspots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Ambient Background Pattern
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'tech-grid' as BackgroundPattern, label: 'Tech Grid' },
                    { id: 'dot-matrix' as BackgroundPattern, label: 'Dot Matrix' },
                    { id: 'clean-minimal' as BackgroundPattern, label: 'Clean Minimal' },
                    { id: 'blueprint-glow' as BackgroundPattern, label: 'Blueprint Glow' }
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setBackgroundPattern(pat.id)}
                      className={`p-2.5 rounded-xl border font-semibold transition cursor-pointer text-left ${
                        backgroundPattern === pat.id
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagram Hotspots Global Switch */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Diagram Interactive Hotspots
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Globally enable or disable interactive pulsing inspection pins across all architectural topologies.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">
                    Hotspots Status: {enableHotspots ? 'Active (Pulsing Pins Enabled)' : 'Disabled (Clean Diagrams)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEnableHotspots(!enableHotspots)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      enableHotspots
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {enableHotspots ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Watermark Configuration */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Security Watermark Overlay</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watermarkEnabled}
                    onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {watermarkEnabled ? 'Watermark Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold font-mono">Watermark Text:</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Position:</label>
                  <select
                    value={watermarkPosition}
                    onChange={(e) => setWatermarkPosition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Center Stamp</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold font-mono">Opacity Level:</label>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING & IDENTITY */}
        {activeSettingsTab === 'branding' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">White-Label Branding & Identity</h2>
              <p className="text-[11px] text-slate-400">
                Configure primary enterprise wordmarks, executive slogans, and official inquiry routing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Brand Name:</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Brand Logo URL (Optional):</label>
                <input
                  type="text"
                  value={brandLogoUrl}
                  onChange={(e) => setBrandLogoUrl(e.target.value)}
                  placeholder="https://... or /assets/images/logo.png"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold font-mono">Executive Brand Tagline:</label>
                <input
                  type="text"
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Technical Support Email:</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Executive Principal Contact:</label>
                <input
                  type="email"
                  value={executiveContact}
                  onChange={(e) => setExecutiveContact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOUNDER & HERO COPY */}
        {activeSettingsTab === 'founder-hero' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white">Executive Founder Credentials</h2>
                  <p className="text-[11px] text-slate-400">
                    Lead Principal Architect profile displayed on the About page and case study disclosures.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoEditorOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Portrait Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Founder Full Name:</label>
                  <input
                    type="text"
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Architectural Role / Title:</label>
                  <input
                    type="text"
                    value={founderRole}
                    onChange={(e) => setFounderRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Location Base:</label>
                  <input
                    type="text"
                    value={founderLocation}
                    onChange={(e) => setFounderLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Direct Contact Phone:</label>
                  <input
                    type="text"
                    value={founderPhone}
                    onChange={(e) => setFounderPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold font-mono">Direct Email Address:</label>
                  <input
                    type="email"
                    value={founderEmail}
                    onChange={(e) => setFounderEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold font-mono">Executive Biography:</label>
                  <textarea
                    rows={3}
                    value={founderBio}
                    onChange={(e) => setFounderBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Hero Copy */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white">Homepage Hero Positioning</h2>
                <p className="text-[11px] text-slate-400">
                  Headline, eyebrow, and introductory text displayed immediately upon visiting the platform.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Eyebrow Badge Text:</label>
                  <input
                    type="text"
                    value={heroEyebrow}
                    onChange={(e) => setHeroEyebrow(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Primary Headline:</label>
                  <input
                    type="text"
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Subheadline Narrative:</label>
                  <textarea
                    rows={3}
                    value={heroSubheadline}
                    onChange={(e) => setHeroSubheadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ARCHITECTURE SIZING DEFAULTS */}
        {activeSettingsTab === 'architecture' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Enterprise Architecture & Calculation Defaults</h2>
              <p className="text-[11px] text-slate-400">
                Baseline mathematical models applied across the Node Sizer, RVTools Analyzer, and DR Planner.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Default Cloud Target:</label>
                <select
                  value={defaultCloud}
                  onChange={(e) => setDefaultCloud(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Azure AVS">Azure VMware Solution (AVS)</option>
                  <option value="Nutanix NC2 on Azure">Nutanix NC2 on Azure</option>
                  <option value="VMC on AWS">VMware Cloud on AWS (VMC)</option>
                  <option value="Google Cloud VMware Engine (GCVE)">Google Cloud VMware Engine (GCVE)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Default vCPU:pCPU Overcommit:</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="8"
                  value={defaultOvercommit}
                  onChange={(e) => setDefaultOvercommit(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Default RAM Buffer (%):</label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="50"
                  value={defaultRamBuffer}
                  onChange={(e) => setDefaultRamBuffer(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Target RPO Minutes:</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="1440"
                  value={defaultRpoMinutes}
                  onChange={(e) => setDefaultRpoMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Target RTO Hours:</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="48"
                  value={defaultRtoHours}
                  onChange={(e) => setDefaultRtoHours(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Primary Hyperscaler Region:</label>
                <input
                  type="text"
                  value={primaryRegion}
                  onChange={(e) => setPrimaryRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FEATURE ACCESS GATES */}
        {activeSettingsTab === 'features' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Feature Governance & Blueprint Access Gates</h2>
              <p className="text-[11px] text-slate-400">
                Govern which features are available to public vs authenticated users.
              </p>
            </div>

            {/* Blueprint Access Mode */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-300">
                AI Blueprint Generator Access Policy:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'everyone' as BlueprintAccessMode, label: 'Everyone', desc: 'Public visitors can generate 4K blueprints without signing in.' },
                  { id: 'signed_in' as BlueprintAccessMode, label: 'Signed-In Only', desc: 'Requires authenticated session to invoke blueprint generation.' },
                  { id: 'nobody' as BlueprintAccessMode, label: 'Nobody (Lockdown)', desc: 'Emergency shutoff. Blocks all generations server-side.' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setBlueprintAccessMode(mode.id)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                      blueprintAccessMode === mode.id
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{mode.label}</span>
                      {blueprintAccessMode === mode.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              {[
                { label: '4K Vector Blueprint Export', desc: 'Allows download of ultra-high-definition 3840×2160 vector deliverables.', checked: export4k, onChange: setExport4k },
                { label: 'Technical Architecture Dossier PDF', desc: 'Enables multi-page PDF generation with node Bill of Materials.', checked: exportDossier, onChange: setExportDossier },
                { label: 'AI 3D Isometric Blueprints', desc: 'Orchestrates Gemini 3D blueprint rendering with enterprise fallback.', checked: generateBlueprint, onChange: setGenerateBlueprint },
                { label: 'Executive Summary Briefing Sheet', desc: 'Generates concise 1-page financial and compute summaries for CIO/CTO leadership.', checked: exportExecutiveSummary, onChange: setExportExecutiveSummary },
                { label: 'Require Sign-In for Sizing Calculators', desc: 'When enabled, unauthenticated visitors will be prompted to sign in before running sizing models.', checked: authRequiredForTools, onChange: setAuthRequiredForTools },
                { label: 'Public Platform Access', desc: 'Allows public visitors to view marketing runbooks, tutorials, and case studies.', checked: publicAccessEnabled, onChange: setPublicAccessEnabled }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 mt-0.5 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CASE STUDIES & TRACK RECORDS QUICK EDIT */}
        {activeSettingsTab === 'case-studies' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white">
                    Verified Enterprise Case Studies ({activeCaseStudies.length})
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All 7 verified case studies with complete facts, multi-tier migration runbooks, and diagrams.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveEditCaseStudy(null);
                  setIsTrackRecordModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Author New Case Study</span>
              </button>
            </div>

            <div className="space-y-3">
              {activeCaseStudies.map((study, idx) => (
                <div
                  key={study.slug || study.id || idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
                        {study.facts?.sector || study.sector}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                        {study.facts?.scale || study.metrics?.vms || '50-300 VMs'}
                      </span>
                      {study.facts?.connectivity && (
                        <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {study.facts.connectivity}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-xs leading-snug">{study.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{study.summary}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                    {study.slug && (
                      <a
                        href={`/case-studies/${study.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 cursor-pointer transition"
                        title="View Live Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEditCaseStudy(study);
                        setIsTrackRecordModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
                      title="Edit Case Study"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit Case Study</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all platform settings to factory defaults? This clears custom themes and settings.')) {
                resetToDefaults();
                setBrandName('Zaboraa');
                setBrandTagline('Enterprise VMware Cloud & Hyperscaler Architecture');
                setBrandLogoUrl('');
                setThemePreset('default');
                setLayoutDensity('balanced');
                setHeaderStyle('glass');
                setBackgroundPattern('tech-grid');
                setEnableHotspots(true);
                setFeedback({ type: 'success', message: 'All platform settings reset to factory defaults.' });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Persisting to Cloud...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
