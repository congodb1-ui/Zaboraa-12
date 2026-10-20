import React, { useState } from 'react';
import { useCustomization } from '../../../context/CustomizationContext';
import { adminService } from '../../../services/adminService';
import { BlueprintAccessMode } from '../../../types/siteData';
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
  RefreshCw
} from 'lucide-react';

interface AdminSettingsViewProps {
  currentUserEmail: string;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ currentUserEmail }) => {
  const {
    siteConfig,
    savePersistentAdminSettings,
    resetToDefaults
  } = useCustomization();

  // Local Form States initialized from existing siteConfig
  const [brandName, setBrandName] = useState(siteConfig.brand || 'Zaboraa Technologies');
  const [brandTagline, setBrandTagline] = useState(
    siteConfig.brandTagline || 'Enterprise VMware Cloud Architecture'
  );
  const [brandLogoUrl, setBrandLogoUrl] = useState(siteConfig.brandLogoUrl || '');
  const [supportEmail, setSupportEmail] = useState(
    siteConfig.adminSettings?.supportEmail || 'support@zaboraa.com'
  );
  const [executiveContact, setExecutiveContact] = useState(
    siteConfig.adminSettings?.executiveContact || 'wasim.sayyed@zaboraa.com'
  );

  // Organization Architecture Defaults
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

  // Platform Feature Gating Toggles
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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const result = await savePersistentAdminSettings(
        {
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
          metadata: { brandName, defaultCloud, authRequiredForTools }
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

  const handleExportJson = () => {
    const configData = {
      branding: { brandName, brandTagline, brandLogoUrl, supportEmail, executiveContact },
      organization: { defaultCloud, defaultOvercommit, defaultRamBuffer, defaultRpoMinutes, defaultRtoHours, primaryRegion },
      featureControls: { export4k, exportDossier, exportExecutiveSummary, generateBlueprint, authRequiredForTools, publicAccessEnabled },
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Platform Settings & Branding</h1>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              Supabase Persistent
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure application branding, organization SLAs, access gating, and admin defaults. All modifications persist across redeployments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            title="Download settings backup JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Backup</span>
          </button>
          <button
            type="submit"
            form="admin-settings-form"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Persisting to Cloud...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast / Alert */}
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

      {/* Form Grid */}
      <form id="admin-settings-form" onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Application Branding */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Application Branding & Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Zaboraa Technologies"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
              <p className="text-[11px] text-slate-400 mt-1">Appears in header, browser titles, and exported architectural documents.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                placeholder="Enterprise VMware Cloud Architecture"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
              <p className="text-[11px] text-slate-400 mt-1">Used in metadata descriptions and OpenGraph preview cards.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Custom Wordmark / Logo URL (Optional)
              </label>
              <input
                type="url"
                value={brandLogoUrl}
                onChange={(e) => setBrandLogoUrl(e.target.value)}
                placeholder="https://your-domain.com/logo.svg"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Leave empty to use the default crisp Zaboraa geometric emblem.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Executive Architect Contact
              </label>
              <input
                type="email"
                value={executiveContact}
                onChange={(e) => setExecutiveContact(e.target.value)}
                placeholder="wasim.sayyed@zaboraa.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Target recipient for architectural briefing escalations.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Organization Architecture Preferences & Sizing SLAs */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
            <Globe className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Organization Architecture Defaults & SLAs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Target Cloud Platform
              </label>
              <select
                value={defaultCloud}
                onChange={(e) => setDefaultCloud(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Azure AVS">Azure VMware Solution (AVS)</option>
                <option value="AWS VMC">VMware Cloud on AWS (VMC)</option>
                <option value="Google GCVE">Google Cloud VMware Engine (GCVE)</option>
                <option value="Nutanix NC2">Nutanix Cloud Clusters (NC2)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Preset platform when launching multi-cloud sizing calculators.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default vCPU Overcommit Ratio
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={defaultOvercommit}
                onChange={(e) => setDefaultOvercommit(parseFloat(e.target.value) || 2.5)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Standard ratio (2.5:1 recommended for general enterprise workloads).</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default RAM Buffer Margin (%)
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={defaultRamBuffer}
                onChange={(e) => setDefaultRamBuffer(parseInt(e.target.value, 10) || 20)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Memory headroom reserved for HA failover and ESXi virtualization overhead.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target RPO (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={defaultRpoMinutes}
                onChange={(e) => setDefaultRpoMinutes(parseInt(e.target.value, 10) || 15)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default Recovery Point Objective SLA for DR Planner.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target RTO (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="72"
                value={defaultRtoHours}
                onChange={(e) => setDefaultRtoHours(parseFloat(e.target.value) || 2)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Target Recovery Time Objective for disaster recovery runbooks.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Cloud Region
              </label>
              <input
                type="text"
                value={primaryRegion}
                onChange={(e) => setPrimaryRegion(e.target.value)}
                placeholder="East US 2 (Virginia)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default region for landing zone and network transit topologies.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Feature Controls & Access Gating */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Platform Feature Gating & Access Control</h2>
          </div>

          {/* Blueprint Access Switch: 3 modes */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Blueprint Generation Access Switch</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Controls who is permitted to trigger server-side 3D architecture blueprint generations. Enforced server-side.
                </div>
              </div>
              <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 uppercase">
                Active Mode: {blueprintAccessMode.replace('_', ' ')}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Option 1: Everyone */}
              <button
                type="button"
                onClick={() => setBlueprintAccessMode('everyone')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  blueprintAccessMode === 'everyone'
                    ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Everyone</span>
                  {blueprintAccessMode === 'everyone' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Public open access. All visitors (including anonymous) can generate blueprints.
                </p>
              </button>

              {/* Option 2: Signed-in users only */}
              <button
                type="button"
                onClick={() => setBlueprintAccessMode('signed_in')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  blueprintAccessMode === 'signed_in'
                    ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Signed-in users only</span>
                  {blueprintAccessMode === 'signed_in' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Authenticated only. Requires a verified Google, Microsoft, or email account.
                </p>
              </button>

              {/* Option 3: Nobody */}
              <button
                type="button"
                onClick={() => setBlueprintAccessMode('nobody')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                  blueprintAccessMode === 'nobody'
                    ? 'bg-rose-950/60 border-rose-400 text-white shadow-md ring-1 ring-rose-500/40'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Nobody</span>
                  {blueprintAccessMode === 'nobody' && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Emergency off-switch. Blocks all generations server-side with 403 Forbidden.
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">4K Vector Blueprint Export</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Allows users to export high-fidelity vector diagrams and SVG topologies.
                </div>
              </div>
              <input
                type="checkbox"
                checked={export4k}
                onChange={(e) => setExport4k(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Technical Architecture Dossier PDF</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Enables multi-page PDF generation with node Bill of Materials and storage breakdowns.
                </div>
              </div>
              <input
                type="checkbox"
                checked={exportDossier}
                onChange={(e) => setExportDossier(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">AI 3D Blueprint Generation</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Orchestrates server-side Gemini image rendering with high-resolution enterprise fallbacks.
                </div>
              </div>
              <input
                type="checkbox"
                checked={generateBlueprint}
                onChange={(e) => setGenerateBlueprint(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Executive Summary Briefing Sheet</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Generates concise 1-page financial and compute summaries for CIO/CTO leadership.
                </div>
              </div>
              <input
                type="checkbox"
                checked={exportExecutiveSummary}
                onChange={(e) => setExportExecutiveSummary(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Require Sign-In for Sizing Calculators</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  When enabled, unauthenticated visitors will be prompted to sign in before running sizing models.
                </div>
              </div>
              <input
                type="checkbox"
                checked={authRequiredForTools}
                onChange={(e) => setAuthRequiredForTools(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Public Platform Access</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Allows public traffic to view marketing masterclasses, runbooks, and interactive diagrams.
                </div>
              </div>
              <input
                type="checkbox"
                checked={publicAccessEnabled}
                onChange={(e) => setPublicAccessEnabled(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 mt-0.5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all platform settings to original factory defaults? This will clear saved branding.')) {
                resetToDefaults();
                setBrandName('Zaboraa Technologies');
                setBrandTagline('Enterprise VMware Cloud Architecture');
                setBrandLogoUrl('');
                setFeedback({ type: 'success', message: 'Platform settings reset to factory defaults.' });
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
            <span>{isSaving ? 'Persisting to Cloud...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
