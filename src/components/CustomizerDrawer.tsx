import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { CloudProvider, ArchitectureDiagram, VideoItem, TutorialArticle } from '../types/siteData';
import { ZaboraaLogoMark } from './ZaboraaLogo';
import { AdminParameterControlStudio } from './AdminParameterControlStudio';
import {
  X,
  Sliders,
  Layers,
  Film,
  BookOpen,
  User,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Save,
  AlertCircle,
  Camera,
  Star,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  Eye,
  EyeOff,
  Palette,
  Layout,
  Server,
  CheckCircle2,
  Zap,
  Shield,
  FileText,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export const CustomizerDrawer: React.FC = () => {
  const {
    siteConfig,
    brandName,
    brandLogoUrl,
    updateBranding,
    theme,
    toggleTheme,
    isCustomizerOpen,
    setIsCustomizerOpen,
    setIsPhotoEditorOpen,
    setIsWatermarkModalOpen,
    updateWatermarkConfig,
    updateEnableHotspots,
    updateAdminSettings,
    setActiveEditPlatformId,
    setFeaturedVideoId,
    updateGeneralInfo,
    togglePlatformEnabled,
    reorderPlatformShowcases,
    movePlatformShowcase,
    pinPlatformShowcaseToTop,
    toggleDesignEnabled,
    updateHero,
    addDiagram,
    deleteDiagram,
    addVideo,
    deleteVideo,
    addTutorial,
    deleteTutorial,
    setIsTrackRecordModalOpen,
    setActiveEditCaseStudy,
    deleteCaseStudy,
    reorderCaseStudies,
    setIsFounderModalOpen,
    setIsHeroStatsModalOpen,
    resetToDefaults,
    exportConfigJson,
    importConfigJson,
    featureControls,
    updateFeatureControls
  } = useCustomization();

  const [activeTab, setActiveTab] = useState<'appearance' | 'blueprint-studio' | 'feature-controls' | 'track-records' | 'general' | 'hero' | 'platforms' | 'videos' | 'tutorials' | 'backup'>('appearance');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [importText, setImportText] = useState<string>('');
  const [importError, setImportError] = useState<string>('');

  // Disciplines drag and drop sequence state
  const [draggedDisciplineIndex, setDraggedDisciplineIndex] = useState<number | null>(null);
  const [dragOverDisciplineIndex, setDragOverDisciplineIndex] = useState<number | null>(null);

  // General state & White-Label Branding
  const [brand, setBrand] = useState(siteConfig.brand || brandName);
  const [tagline, setTagline] = useState(siteConfig.brandTagline);
  const [brandLogo, setBrandLogo] = useState(siteConfig.brandLogoUrl || brandLogoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [founderName, setFounderName] = useState(siteConfig.founder.name);
  const [founderRole, setFounderRole] = useState(siteConfig.founder.role);
  const [founderBio, setFounderBio] = useState(siteConfig.founder.bio);
  const [founderPhone, setFounderPhone] = useState(siteConfig.founder.phone);
  const [founderEmail, setFounderEmail] = useState(siteConfig.founder.email);
  const [founderLocation, setFounderLocation] = useState(siteConfig.founder.location);

  // Hero state
  const [heroEyebrow, setHeroEyebrow] = useState(siteConfig.hero.eyebrow);
  const [heroHeadline, setHeroHeadline] = useState(siteConfig.hero.headline);
  const [heroSubheadline, setHeroSubheadline] = useState(siteConfig.hero.subheadline);

  // New Diagram Form State
  const [newDiagTitle, setNewDiagTitle] = useState('');
  const [newDiagSubtitle, setNewDiagSubtitle] = useState('');
  const [newDiagProvider, setNewDiagProvider] = useState<CloudProvider>('Azure AVS');
  const [newDiagCategory, setNewDiagCategory] = useState<'Hybrid Migration' | 'Disaster Recovery' | 'Zero-Trust Networking' | 'Storage Decoupling'>('Hybrid Migration');
  const [newDiagDesc, setNewDiagDesc] = useState('');
  const [newDiagIacCode, setNewDiagIacCode] = useState('');

  // New Video Form State
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoProvider, setNewVideoProvider] = useState<CloudProvider>('Azure AVS');
  const [newVideoDuration, setNewVideoDuration] = useState('15:00');
  const [newVideoCategory, setNewVideoCategory] = useState<'Migration Runbook' | 'Network Architecture' | 'Storage Sizing' | 'Hands-on Labs'>('Migration Runbook');
  const [newVideoUrl, setNewVideoUrl] = useState('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  const [newVideoSummary, setNewVideoSummary] = useState('');
  const [newVideoTakeaway, setNewVideoTakeaway] = useState('');

  // New Tutorial Form State
  const [newTutTitle, setNewTutTitle] = useState('');
  const [newTutType, setNewTutType] = useState<'tutorial' | 'article'>('tutorial');
  const [newTutProvider, setNewTutProvider] = useState<CloudProvider>('Azure AVS');
  const [newTutReadTime, setNewTutReadTime] = useState('10 min read');
  const [newTutSummary, setNewTutSummary] = useState('');
  const [newTutSectionHeading, setNewTutSectionHeading] = useState('1. Implementation Steps');
  const [newTutSectionContent, setNewTutSectionContent] = useState('');
  const [newTutSectionCode, setNewTutSectionCode] = useState('');

  if (!isCustomizerOpen) return null;

  const showNotification = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo image should be under 5MB.');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = typeof uploadEvent.target?.result === 'string' ? uploadEvent.target.result : '';
        if (base64Url) {
          setBrandLogo(base64Url);
          showNotification('Logo uploaded and preview ready!');
        }
        setIsUploadingLogo(false);
      };
      reader.onerror = () => {
        setIsUploadingLogo(false);
        alert('Failed to read logo file.');
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingLogo(false);
    }
  };

  const handleUpdateBranding = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanBrand = brand.trim() || 'Zaboraa Technologies';
    updateBranding({
      brandName: cleanBrand,
      brandLogoUrl: brandLogo.trim() || undefined,
      brandTagline: tagline.trim()
    });
    showNotification('White-label branding updated and saved!');
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBrand = brand.trim() || 'Zaboraa Technologies';
    updateGeneralInfo({
      brand: cleanBrand,
      brandTagline: tagline,
      brandLogoUrl: brandLogo.trim() || undefined,
      founder: {
        ...siteConfig.founder,
        name: founderName,
        role: founderRole,
        bio: founderBio,
        phone: founderPhone,
        email: founderEmail,
        location: founderLocation
      }
    });
    showNotification('General information & branding updated!');
  };

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateHero({
      ...siteConfig.hero,
      eyebrow: heroEyebrow,
      headline: heroHeadline,
      subheadline: heroSubheadline
    });
    showNotification('Hero section updated!');
  };

  const handleCreateDiagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagTitle) return;

    const created: ArchitectureDiagram = {
      id: `diag-${Date.now()}`,
      title: newDiagTitle,
      subtitle: newDiagSubtitle || 'Enterprise Custom Reference Blueprint',
      provider: newDiagProvider,
      category: newDiagCategory,
      description: newDiagDesc || 'Custom verified cloud architecture topology.',
      nodes: [
        {
          id: `node-${Date.now()}-1`,
          name: 'On-Premises Infrastructure',
          layer: 'On-Premises',
          status: 'Active',
          description: 'Production datacenter environment with enterprise workloads.',
          specs: 'Standard ESXi Cluster · 10Gbps Uplink',
          iconType: 'datacenter'
        },
        {
          id: `node-${Date.now()}-2`,
          name: `${newDiagProvider} Dedicated SDDC`,
          layer: 'Cloud SDDC Core',
          status: 'Active',
          description: `Target ${newDiagProvider} private cloud instances with automated clustering.`,
          specs: 'Bare-Metal Clustered Nodes · vSAN',
          iconType: 'server'
        }
      ],
      links: [
        {
          from: `node-${Date.now()}-1`,
          to: `node-${Date.now()}-2`,
          label: 'Secure Cloud Transit Link',
          speed: 'Private Peering',
          type: 'fiber'
        }
      ],
      bestPractices: [
        `Ensure dedicated non-overlapping IP address spaces when deploying ${newDiagProvider}.`,
        'Enable high-availability redundant connections across separate failure domains.'
      ],
      iacSnippet: {
        language: 'terraform',
        title: 'Terraform Resource Block',
        code: newDiagIacCode || `# Example Terraform definition\nresource "provider_resource" "example" {\n  name = "${newDiagTitle}"\n}`
      }
    };

    addDiagram(created);
    setNewDiagTitle('');
    setNewDiagSubtitle('');
    setNewDiagDesc('');
    setNewDiagIacCode('');
    showNotification('Architecture Diagram added to repository!');
  };

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle) return;

    const created: VideoItem = {
      id: `video-${Date.now()}`,
      title: newVideoTitle,
      provider: newVideoProvider,
      duration: newVideoDuration,
      category: newVideoCategory,
      embedUrl: newVideoUrl,
      summary: newVideoSummary || 'Technical deep dive and architectural walkthrough.',
      chapters: [
        { time: '00:00', title: 'Introduction & Scope' },
        { time: '05:00', title: 'Deep-Dive Execution' }
      ],
      takeaways: newVideoTakeaway
        ? [newVideoTakeaway]
        : ['Verify all network routing and MTU settings before live cutover.'],
      tags: [newVideoProvider, newVideoCategory],
      publishedDate: 'Recently Published'
    };

    addVideo(created);
    setNewVideoTitle('');
    setNewVideoSummary('');
    setNewVideoTakeaway('');
    showNotification('Video Masterclass published!');
  };

  const handleCreateTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutTitle) return;

    const created: TutorialArticle = {
      id: `tut-${Date.now()}`,
      slug: newTutTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newTutTitle,
      type: newTutType,
      provider: newTutProvider,
      category: 'Cloud Migration',
      readTime: newTutReadTime,
      publishedDate: 'October 2026',
      difficulty: 'Enterprise Architect',
      summary: newTutSummary || 'Step-by-step implementation guide for enterprise cloud architects.',
      tags: [newTutProvider, 'Automation', 'CLI'],
      author: {
        name: siteConfig.founder.name,
        title: siteConfig.founder.role
      },
      prerequisites: ['Valid cloud tenancy credentials', 'Administrator role assigned'],
      sections: [
        {
          heading: newTutSectionHeading,
          content: newTutSectionContent || 'Follow the configuration procedure below.',
          codeBlock: newTutSectionCode
            ? {
                language: 'bash',
                code: newTutSectionCode,
                description: 'Command line script'
              }
            : undefined
        }
      ]
    };

    addTutorial(created);
    setNewTutTitle('');
    setNewTutSummary('');
    setNewTutSectionContent('');
    setNewTutSectionCode('');
    showNotification('Tutorial guide published!');
  };

  const handleImport = () => {
    setImportError('');
    if (!importText.trim()) return;
    const success = importConfigJson(importText);
    if (success) {
      showNotification('Configuration imported successfully!');
      setImportText('');
    } else {
      setImportError('Invalid JSON format. Please verify configuration structure.');
    }
  };

  const handleExportDownload = () => {
    const jsonStr = exportConfigJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zaboraa_site_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Config JSON downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Site Customizer Studio</h2>
              <p className="text-xs text-slate-400">Live editor for content, diagrams, tutorials & videos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                {saveStatus}
              </span>
            )}
            <button
              onClick={() => setIsCustomizerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1 text-xs">
          {[
            { id: 'appearance', label: 'UI Designs & Themes', icon: Palette },
            { id: 'blueprint-studio', label: 'Blueprint Studio & Templates', icon: Layout },
            { id: 'feature-controls', label: 'Feature Controls', icon: Sliders },
            { id: 'track-records', label: 'Track Records & Credentials', icon: Shield },
            { id: 'general', label: 'General & Founder', icon: User },
            { id: 'hero', label: 'Hero Copy', icon: Sliders },
            { id: 'platforms', label: 'Dedicated Architectures', icon: Layers },
            { id: 'videos', label: 'Videos', icon: Film },
            { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
            { id: 'backup', label: 'Export / Import', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Display Controls: Watermark Option & Hotspot Option */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  Site Overlays & Display Controls
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                Edit Site
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Hotspot Option (Hotspot On or Off) */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {siteConfig.enableHotspots ? (
                        <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-bold text-white text-xs">Hotspot Option</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      siteConfig.enableHotspots
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {siteConfig.enableHotspots ? 'Hotspots: ON' : 'Hotspots: OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Turn diagram interactive inspection hotspot pins on or off across the site.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !siteConfig.enableHotspots;
                    updateEnableHotspots(nextVal);
                    showNotification(nextVal ? 'Hotspots globally enabled!' : 'Hotspots globally disabled!');
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    siteConfig.enableHotspots
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {siteConfig.enableHotspots ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hotspots: ON (Click to Turn Off)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hotspots: OFF (Click to Turn On)</span>
                    </>
                  )}
                </button>
              </div>

              {/* 2. Watermark Option */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-bold text-white text-xs">Watermark Option</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      siteConfig.watermark?.enabled
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {siteConfig.watermark?.enabled ? 'Watermark: ON' : 'Watermark: OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug truncate">
                    {siteConfig.watermark?.text || 'Custom enterprise blueprint overlay'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentEnabled = siteConfig.watermark?.enabled ?? true;
                      updateWatermarkConfig({
                        enabled: !currentEnabled,
                        type: siteConfig.watermark?.type || 'text',
                        text: siteConfig.watermark?.text || `${(brandName || siteConfig.brand || 'ENTERPRISE').toUpperCase()} · HYBRID CLOUD BLUEPRINT`,
                        position: siteConfig.watermark?.position || 'bottom-right',
                        opacity: siteConfig.watermark?.opacity ?? 0.35,
                        imageUrl: siteConfig.watermark?.imageUrl
                      });
                      showNotification(!currentEnabled ? 'Watermark turned ON!' : 'Watermark turned OFF!');
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      siteConfig.watermark?.enabled
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{siteConfig.watermark?.enabled ? 'Watermark: ON' : 'Watermark: OFF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWatermarkModalOpen(true)}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Configure watermark text, position, opacity and logo"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 0: UI DESIGNS & APPEARANCE SYSTEM */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">4 Distinct UI Design Architectures</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Admin Exclusive
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Switch between 4 completely different production-grade UI design themes tailored for multi-cloud demonstrations,
                  Nutanix HCI reviews, and Azure briefings. By default, the original UI remains intact until changed by an admin here.
                </p>
              </div>

              {/* 4 Theme Cards Grid */}
              <div className="space-y-3">
                <label className="font-bold text-slate-200 block text-xs uppercase tracking-wider">
                  Select Visual UI Theme Architecture:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Theme 1: Default Midnight */}
                  <div
                    onClick={() => {
                      updateAdminSettings({ themePreset: 'default' });
                      showNotification('Applied: Hyper-Cloud Midnight (Default)');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      (siteConfig.adminSettings?.themePreset || 'default') === 'default'
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                          Theme 01 · Original
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">Hyper-Cloud Midnight (Default)</h4>
                      </div>
                      {(siteConfig.adminSettings?.themePreset || 'default') === 'default' && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Original sleek enterprise aesthetic with glowing cyan & indigo borders, deep obsidian slate backgrounds, and glassmorphism.
                    </p>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-5 h-5 rounded bg-cyan-400 border border-cyan-200/40" title="Cyan #06b6d4" />
                      <span className="w-5 h-5 rounded bg-indigo-500 border border-indigo-200/40" title="Indigo #6366f1" />
                      <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700" title="Slate #0f172a" />
                      <span className="w-5 h-5 rounded bg-slate-950 border border-slate-800" title="Obsidian #020617" />
                    </div>
                  </div>

                  {/* Theme 2: Nutanix Cloud Prism */}
                  <div
                    onClick={() => {
                      updateAdminSettings({ themePreset: 'nutanix' });
                      showNotification('Applied: Nutanix Cloud Prism (Teal & Graphite)');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      siteConfig.adminSettings?.themePreset === 'nutanix'
                        ? 'bg-emerald-950/50 border-emerald-400 ring-1 ring-emerald-400/50 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          Theme 02 · Nutanix
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">Nutanix Cloud Prism (Teal & Graphite)</h4>
                      </div>
                      {siteConfig.adminSettings?.themePreset === 'nutanix' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Nutanix HCI console design featuring vibrant emerald-teal accents, deep graphite surfaces, squared tactical borders, and Prism indicators.
                    </p>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-5 h-5 rounded bg-emerald-400 border border-emerald-200/40" title="Nutanix Teal #00d2aa" />
                      <span className="w-5 h-5 rounded bg-emerald-600 border border-emerald-400/40" title="Dark Emerald #059669" />
                      <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700" title="Graphite #10161c" />
                      <span className="w-5 h-5 rounded bg-slate-950 border border-slate-800" title="Carbon #070a0d" />
                    </div>
                  </div>

                  {/* Theme 3: Azure Enterprise Cobalt */}
                  <div
                    onClick={() => {
                      updateAdminSettings({ themePreset: 'azure' });
                      showNotification('Applied: Azure Enterprise Cobalt (Royal Blue & Slate)');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      siteConfig.adminSettings?.themePreset === 'azure'
                        ? 'bg-blue-950/50 border-blue-400 ring-1 ring-blue-400/50 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                          Theme 03 · Azure
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">Azure Enterprise Cobalt (Royal Blue & Slate)</h4>
                      </div>
                      {siteConfig.adminSettings?.themePreset === 'azure' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Microsoft Azure architectural console aesthetic with royal cobalt blue highlights, frosted slate panels, and clean telemetry framing.
                    </p>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-5 h-5 rounded bg-blue-500 border border-blue-200/40" title="Azure Cobalt #0078d4" />
                      <span className="w-5 h-5 rounded bg-sky-400 border border-sky-200/40" title="Sky #38bdf8" />
                      <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700" title="Navy Slate #0a1320" />
                      <span className="w-5 h-5 rounded bg-slate-950 border border-slate-800" title="Deep Navy #03060b" />
                    </div>
                  </div>

                  {/* Theme 4: Obsidian Matrix Terminal */}
                  <div
                    onClick={() => {
                      updateAdminSettings({ themePreset: 'terminal' });
                      showNotification('Applied: Obsidian Matrix Terminal (Cyber High-Density)');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      siteConfig.adminSettings?.themePreset === 'terminal'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          Theme 04 · Cyber Ops
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">Obsidian Matrix Terminal (Cyber High-Density)</h4>
                      </div>
                      {siteConfig.adminSettings?.themePreset === 'terminal' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Pitch-black AMOLED obsidian backdrop with electric phosphor green accents, amber warnings, sharp monospace meters, and tactical borders.
                    </p>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-5 h-5 rounded bg-emerald-500 border border-emerald-200/40" title="Phosphor Green #10b981" />
                      <span className="w-5 h-5 rounded bg-amber-500 border border-amber-200/40" title="Amber #f59e0b" />
                      <span className="w-5 h-5 rounded bg-slate-950 border border-slate-700" title="Pure Black #020304" />
                      <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800" title="Dark Obsidian #080a0e" />
                    </div>
                  </div>

                  {/* Theme 5: Enterprise Titanium */}
                  <div
                    onClick={() => {
                      updateAdminSettings({ themePreset: 'titanium' });
                      showNotification('Applied: Enterprise Titanium (Metallic Graphite & Cobalt)');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      siteConfig.adminSettings?.themePreset === 'titanium'
                        ? 'bg-blue-950/50 border-blue-400 ring-1 ring-blue-400/50 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                          Theme 05 · Titanium
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">Enterprise Titanium (Metallic & Cobalt)</h4>
                      </div>
                      {siteConfig.adminSettings?.themePreset === 'titanium' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Aerospace-grade metallic graphite canvas with ice-white typography, brushed steel surfaces, and executive royal cobalt highlights.
                    </p>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-5 h-5 rounded bg-blue-600 border border-blue-300/40" title="Cobalt #2563eb" />
                      <span className="w-5 h-5 rounded bg-slate-400 border border-slate-200/40" title="Titanium #94a3b8" />
                      <span className="w-5 h-5 rounded bg-[#162030] border border-slate-600" title="Steel #162030" />
                      <span className="w-5 h-5 rounded bg-[#0b0f17] border border-slate-800" title="Graphite #0b0f17" />
                    </div>
                  </div>

                  {/* Theme 6: Nordic Clean */}
                  <div
                    onClick={() => {
                      updateAdminSettings({ themePreset: 'nordic' });
                      showNotification('Applied: Nordic Clean (Minimalist Architectural Light)');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      siteConfig.adminSettings?.themePreset === 'nordic'
                        ? 'bg-sky-950/40 border-sky-400 ring-1 ring-sky-400/50 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                          Theme 06 · Nordic Light
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">Nordic Clean (Architectural Light)</h4>
                      </div>
                      {siteConfig.adminSettings?.themePreset === 'nordic' && (
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      High-clarity Scandinavian daylight design with crisp chalk white panels, charcoal slate typography, and sky-blue architectural borders.
                    </p>
                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-5 h-5 rounded bg-sky-500 border border-sky-200/40" title="Sky #0284c7" />
                      <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700" title="Charcoal #0f172a" />
                      <span className="w-5 h-5 rounded bg-slate-100 border border-slate-300" title="Chalk #f8fafc" />
                      <span className="w-5 h-5 rounded bg-white border border-slate-200" title="Pure White #ffffff" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Density & Spacing */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Layout Density Mode</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {siteConfig.adminSettings?.layoutDensity || 'balanced'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced (Standard)', desc: 'Standard production spacing' },
                    { id: 'compact', label: 'Compact (NOC War-Room)', desc: 'High-density tight cards' },
                    { id: 'executive', label: 'Executive (Expansive)', desc: 'Larger cards for presentations' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        updateAdminSettings({ layoutDensity: d.id as any });
                        showNotification(`Layout density set to ${d.label}`);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        (siteConfig.adminSettings?.layoutDensity || 'balanced') === d.id
                          ? 'bg-cyan-950/80 border-cyan-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{d.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Canvas Pattern */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Visual Canvas Pattern</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {siteConfig.adminSettings?.backgroundPattern || 'tech-grid'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'tech-grid', label: 'Subtle Tech Grid (Default)' },
                    { id: 'dot-matrix', label: 'Radar Dot Matrix' },
                    { id: 'clean-minimal', label: 'Clean Pure Minimal (No Grid)' },
                    { id: 'blueprint-glow', label: 'Radial Blueprint Glow' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        updateAdminSettings({ backgroundPattern: p.id as any });
                        showNotification(`Background pattern set to ${p.label}`);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        (siteConfig.adminSettings?.backgroundPattern || 'tech-grid') === p.id
                          ? 'bg-cyan-950/80 border-cyan-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-[11px]">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image & Diagram Animation Suite */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Image & Diagram Animation Engine</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hardware-accelerated Ken Burns cinematic pan, holographic scanline beam, and hover zoom.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = siteConfig.adminSettings?.imageAnimationsEnabled ?? true;
                      updateAdminSettings({ imageAnimationsEnabled: !current });
                      showNotification(!current ? 'Image animations enabled' : 'Image animations paused');
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                      (siteConfig.adminSettings?.imageAnimationsEnabled ?? true)
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {(siteConfig.adminSettings?.imageAnimationsEnabled ?? true) ? 'Animations: ON' : 'Animations: OFF'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-center">
                    <span className="text-white block font-sans font-semibold">Ken Burns</span>
                    <span>22s Slow Drift</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-center">
                    <span className="text-white block font-sans font-semibold">Scanline Beam</span>
                    <span>Packet Sweep</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-center">
                    <span className="text-white block font-sans font-semibold">Hover Zoom</span>
                    <span>Lens Focus</span>
                  </div>
                </div>
              </div>

              {/* Site-Wide Migration Alert / Announcement Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Migration Alert / Announcement Banner
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Displays a prominent ribbon across top of the site with link to new tools or assessments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !(siteConfig.adminSettings?.announcementBannerEnabled);
                      updateAdminSettings({ announcementBannerEnabled: next });
                      showNotification(next ? 'Announcement banner enabled' : 'Announcement banner disabled');
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                      siteConfig.adminSettings?.announcementBannerEnabled
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {siteConfig.adminSettings?.announcementBannerEnabled ? 'Banner: ON' : 'Banner: OFF'}
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-slate-400 text-[11px] font-medium block mb-1">Banner Announcement Text:</label>
                    <input
                      type="text"
                      value={siteConfig.adminSettings?.announcementText || ''}
                      onChange={e => updateAdminSettings({ announcementText: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-cyan-500"
                      placeholder="e.g. New: VMware SDDC to Nutanix NC2 on Azure Migration Assessment Engine is Live!"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] font-medium block mb-1">Target Action Link:</label>
                    <input
                      type="text"
                      value={siteConfig.adminSettings?.announcementLink || ''}
                      onChange={e => updateAdminSettings({ announcementLink: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-cyan-500"
                      placeholder="e.g. /tools/nutanix-nc2-assessment"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment Report Branding & Confidentiality Classification */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs uppercase tracking-wider block">
                  Export Deliverable & Assessment Branding
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[11px] font-medium block mb-1">Default Client / Project Name:</label>
                    <input
                      type="text"
                      value={siteConfig.adminSettings?.clientName || ''}
                      onChange={e => updateAdminSettings({ clientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-cyan-500"
                      placeholder="e.g. Enterprise Global Cloud Migration"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] font-medium block mb-1">Confidentiality Classification:</label>
                    <select
                      value={siteConfig.adminSettings?.confidentialityClassification || 'CONFIDENTIAL // ARCHITECTURAL ASSESSMENT'}
                      onChange={e => updateAdminSettings({ confidentialityClassification: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-cyan-500"
                    >
                      <option value="CONFIDENTIAL // ARCHITECTURAL ASSESSMENT">CONFIDENTIAL // ARCHITECTURAL ASSESSMENT</option>
                      <option value="STRICTLY RESTRICTED // INTERNAL USE ONLY">STRICTLY RESTRICTED // INTERNAL USE ONLY</option>
                      <option value="OFFICIAL ADVISORY DOSSIER">OFFICIAL ADVISORY DOSSIER</option>
                      <option value="DRAFT // FOR TECHNICAL REVIEW ONLY">DRAFT // FOR TECHNICAL REVIEW ONLY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Public-First Access & Admin Security Toggles */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs uppercase tracking-wider block">
                  Access Governance & Security Controls
                </span>
                <p className="text-[11px] text-slate-400">
                  Manage public-first accessibility for cloud migration calculators, topology visualizers, and migration runbooks.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-white font-semibold text-xs block">Public Platform Access</span>
                      <span className="text-[11px] text-slate-400 block">Allow anonymous enterprise visitors to explore platforms & articles</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !(siteConfig.adminSettings?.publicAccessEnabled ?? true);
                        updateAdminSettings({ publicAccessEnabled: next });
                        showNotification(next ? 'Public access enabled' : 'Public access restricted');
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                        (siteConfig.adminSettings?.publicAccessEnabled ?? true)
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {(siteConfig.adminSettings?.publicAccessEnabled ?? true) ? 'Public: ON' : 'Public: OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-white font-semibold text-xs block">Require Auth for Architecture Tools</span>
                      <span className="text-[11px] text-slate-400 block">Require user sign-in before accessing calculators & sizing tools</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !(siteConfig.adminSettings?.authRequiredForTools ?? false);
                        updateAdminSettings({ authRequiredForTools: next });
                        showNotification(next ? 'Authentication required for tools' : 'Tools are open to public');
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                        (siteConfig.adminSettings?.authRequiredForTools ?? false)
                          ? 'bg-amber-950 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {(siteConfig.adminSettings?.authRequiredForTools ?? false) ? 'Auth Required: ON' : 'Auth Required: OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Action Reset */}
              <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    updateAdminSettings({
                      themePreset: 'default',
                      layoutDensity: 'balanced',
                      headerStyle: 'glass',
                      backgroundPattern: 'tech-grid',
                      imageAnimationsEnabled: true,
                      publicAccessEnabled: true,
                      authRequiredForTools: false
                    });
                    showNotification('Reverted appearance to factory default settings');
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Appearance to Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset ALL website customization, diagrams, and themes back to factory defaults?')) {
                      resetToDefaults();
                      showNotification('All customizations reset to factory defaults.');
                    }
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-200 font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>One-Click Full Factory Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: BLUEPRINT PARAMETERS & TEMPLATES STUDIO */}
          {activeTab === 'blueprint-studio' && (
            <AdminParameterControlStudio />
          )}

          {/* TAB: FEATURE CONTROLS */}
          {activeTab === 'feature-controls' && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Administrator Feature Controls</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Admin Exclusive
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Govern the availability of blueprint generation and export engines. When disabled, the corresponding feature is blocked from execution across all user workflows and tools. All features default to enabled.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'exportDossier' as const,
                    title: 'Export Dossier',
                    desc: 'Executive architecture deliverable with BOM breakdown, storage decoupling metrics, and disaster recovery profiles.',
                    enabled: featureControls.exportDossier
                  },
                  {
                    key: 'exportExecutiveSummary' as const,
                    title: 'Export Executive Summary',
                    desc: 'High-level executive briefing summary and architecture deck export for stakeholder presentations.',
                    enabled: featureControls.exportExecutiveSummary
                  },
                  {
                    key: 'export4k' as const,
                    title: 'Export 4K',
                    desc: 'Ultra-high-definition 3840×2160 (4K) canvas vector architecture blueprint downloads.',
                    enabled: featureControls.export4k
                  },
                  {
                    key: 'generateBlueprint' as const,
                    title: 'Generate Blueprint',
                    desc: '3D isometric AI cloud architecture blueprint rendering engine with glowing neon transit paths.',
                    enabled: featureControls.generateBlueprint
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.title}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                            item.enabled
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                          }`}
                        >
                          {item.enabled ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Enabled
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" /> Disabled
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !item.enabled;
                          updateFeatureControls({ [item.key]: nextState });
                          showNotification(`${item.title} has been ${nextState ? 'enabled' : 'disabled'}.`);
                        }}
                        aria-pressed={item.enabled}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          item.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            item.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset Controls Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateFeatureControls({
                      exportDossier: true,
                      exportExecutiveSummary: true,
                      export4k: true,
                      generateBlueprint: true
                    });
                    showNotification('All 4 feature controls reset to Enabled.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Enabled</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: TRACK RECORDS & HOMEPAGE CREDENTIALS */}
          {activeTab === 'track-records' && (
            <div className="space-y-6 text-xs">
              {/* Informational Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Verified Enterprise Track Record Studio</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Admin Exclusive
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Create, edit, reorder, or delete verified production case studies. Changes reflect instantly on the homepage and case studies portal with full persistence.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEditCaseStudy(null);
                      setIsTrackRecordModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Enterprise Case Study</span>
                  </button>
                </div>
              </div>

              {/* Case Studies List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                    Current Track Records ({(siteConfig.caseStudies || []).length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Reorder or Edit Full Case Study
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(siteConfig.caseStudies || []).map((study, idx) => (
                    <div
                      key={study.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
                              {study.sector}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{study.verifiedBadge || 'VERIFIED'}</span>
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-xs leading-snug">
                            {study.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {study.summary}
                          </p>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderCaseStudies(idx, idx - 1)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            disabled={idx === (siteConfig.caseStudies || []).length - 1}
                            onClick={() => reorderCaseStudies(idx, idx + 1)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveEditCaseStudy(study);
                              setIsTrackRecordModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                            title="Edit Case Study"
                          >
                            <span>Edit</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete track record "${study.title}"?`)) {
                                deleteCaseStudy(study.id);
                                showNotification('Track record deleted.');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-300 hover:text-white cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quantitative Metrics Summary Strip */}
                      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/70 text-[10px] font-mono text-slate-300">
                        <div className="p-1.5 rounded bg-slate-900">
                          <span className="text-slate-500 block uppercase">Workloads</span>
                          <span className="font-bold text-white truncate block">{study.metrics.vms}</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900">
                          <span className="text-slate-500 block uppercase">Downtime</span>
                          <span className="font-bold text-emerald-400 truncate block">{study.metrics.downtime}</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900">
                          <span className="text-slate-500 block uppercase">Cost</span>
                          <span className="font-bold text-cyan-300 truncate block">{study.metrics.costReduction}</span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-900">
                          <span className="text-slate-500 block uppercase">Timeline</span>
                          <span className="font-bold text-white truncate block">{study.metrics.timeline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homepage Field Quick Triggers */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <span className="font-bold text-white text-xs uppercase tracking-wider block">
                  Homepage Credentials & Specialization Studios
                </span>

                <div className="space-y-3">
                  {/* Founder Profile Studio */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-white font-semibold text-xs">
                        Lead Architect Credentials & Certifications
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {siteConfig.founder.name} · {siteConfig.founder.certifications.length} verified badges (VCDX, Multi-Cloud)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFounderModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Edit Credentials
                    </button>
                  </div>

                  {/* Hero Proof Metrics Studio */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-white font-semibold text-xs">
                        Executive Social Proof Numbers (Hero Stats)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {siteConfig.hero.stats.map(s => s.value).join(' · ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHeroStatsModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Edit Metrics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: GENERAL & FOUNDER */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
              {/* Theme Mode Selector */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">Global Color Theme</div>
                  <div className="text-[11px] text-slate-400">
                    Switch between Default Dark Mode and High-Contrast Light Mode
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch to Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Switch to Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Interactive Architecture Hotspots Global Admin Setting */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Interactive Diagram Hotspots</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        siteConfig.enableHotspots
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {siteConfig.enableHotspots ? 'Enabled Globally' : 'Disabled Everywhere'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      Control interactive hotspot display across all architecture diagrams. If disabled here from top settings, hotspots will not be shown anywhere on the site. If enabled, diagrams provide discrete inspection pins that are hidden by default until toggled on by viewers.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !siteConfig.enableHotspots;
                      updateEnableHotspots(nextVal);
                      showNotification(nextVal ? 'Hotspots globally enabled!' : 'Hotspots globally hidden across entire site!');
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      siteConfig.enableHotspots
                        ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600/80 text-emerald-300'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {siteConfig.enableHotspots ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hotspots Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hotspots Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Watermark Configuration Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-white">Architecture Image Watermark</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      siteConfig.watermark?.enabled
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {siteConfig.watermark?.enabled ? 'Watermark On' : 'Watermark Off'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Customize text or upload image logo watermark overlaid on diagrams.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWatermarkModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Configure Watermark</span>
                </button>
              </div>

              {/* White-Label Firm Branding & Logo Studio */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">White-Label Branding & Firm Identity</h3>
                      <p className="text-[11px] text-slate-400">Manage company name, slogan, and custom logo across entire site</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold uppercase">
                    Live System
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold text-xs flex items-center justify-between">
                    <span>Company / Firm Name</span>
                    <span className="text-[10px] font-mono text-cyan-400">Replaces all hardcoded branding</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Acme Cloud Technologies"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold text-xs">Firm Tagline / Proposition</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="e.g. Enterprise VMware & Multi-Cloud Architecture"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                {/* Company Logo Upload & Real-Time Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <label className="text-slate-300 font-semibold text-xs block">Company Logo</label>
                  
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    {/* Live Logo Preview Box */}
                    <div className="w-14 h-14 rounded-xl border border-cyan-500/40 bg-slate-950 flex items-center justify-center p-1.5 shrink-0 shadow-inner overflow-hidden">
                      {brandLogo ? (
                        <img
                          src={brandLogo}
                          alt="Company Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ZaboraaLogoMark sizeClass="w-9 h-9" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 text-xs">
                      <div className="text-white font-medium text-[11px]">
                        {brandLogo ? 'Custom Logo Active' : 'Default Isometric Architectural Mark Active'}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-semibold text-xs cursor-pointer transition-colors shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingLogo ? 'Processing...' : 'Upload Logo File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>

                        {brandLogo && (
                          <button
                            type="button"
                            onClick={() => {
                              setBrandLogo('');
                              showNotification('Logo cleared; using default mark');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fallback Direct Image URL or Data URL Input */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Or paste custom image URL / Base64:</span>
                    <input
                      type="text"
                      value={brandLogo}
                      onChange={e => setBrandLogo(e.target.value)}
                      placeholder="https://... or data:image/png;base64,..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleUpdateBranding()}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Branding & Logo</span>
                  </button>
                </div>
              </div>

              {/* Founder Profile Photo Section */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/50 bg-slate-800 shrink-0">
                    <img
                      src={siteConfig.founder.portraitImage || '/assets/images/wasim_sayyed_executive_1791473154875.jpg'}
                      alt="Wasim Portrait"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('/src/assets/images/')) {
                          target.src = target.src.replace('/src/assets/images/', '/assets/images/');
                        } else if (target.src.includes('/assets/images/')) {
                          target.src = target.src.replace('/assets/images/', '/src/assets/images/');
                        }
                      }}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: siteConfig.founder.photoStyle?.objectPosition || 'top',
                        transform: `scale(${siteConfig.founder.photoStyle?.zoom || 1.05})`
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Executive Profile Photo</div>
                    <div className="text-[11px] text-slate-400">Upload Wasim-Pic-4.png, adjust zoom & glow</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPhotoEditorOpen(true)}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Edit Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Lead Architect Name</label>
                  <input
                    type="text"
                    value={founderName}
                    onChange={e => setFounderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Role Title</label>
                  <input
                    type="text"
                    value={founderRole}
                    onChange={e => setFounderRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Direct Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={founderPhone}
                    onChange={e => setFounderPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={founderEmail}
                    onChange={e => setFounderEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Location / Coverage</label>
                <input
                  type="text"
                  value={founderLocation}
                  onChange={e => setFounderLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Founder Executive Bio</label>
                <textarea
                  rows={4}
                  value={founderBio}
                  onChange={e => setFounderBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save General Settings</span>
              </button>
            </form>
          )}

          {/* TAB 2: HERO COPY */}
          {activeTab === 'hero' && (
            <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Eyebrow Kicker</label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={e => setHeroEyebrow(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Main Headline</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={e => setHeroHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Subheadline Description</label>
                <textarea
                  rows={4}
                  value={heroSubheadline}
                  onChange={e => setHeroSubheadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Hero Copy</span>
              </button>
            </form>
          )}

          {/* TAB 3: DEDICATED ARCHITECTURES & DISCIPLINES SEQUENCE */}
          {activeTab === 'platforms' && (
            <div className="space-y-6 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-semibold text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Disciplines & Skills Sequence Manager ({siteConfig.platformShowcases?.length || 6})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    Admin Drag & Priority
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Drag the handles or click the sequence arrows to arrange priority. <strong className="text-emerald-400 font-semibold">Primary skills (#1)</strong> are highlighted at the top of the homepage and in navigation, followed by secondary platforms, with least-privileged skills placed last.
                </p>
              </div>

              <div className="space-y-3">
                {(siteConfig.platformShowcases || []).map((p, idx, arr) => {
                  const isPrimary = idx === 0;
                  const isSecondary = idx === 1 || idx === 2;
                  const isLeast = idx === arr.length - 1;
                  const isDragging = draggedDisciplineIndex === idx;
                  const isDragOver = dragOverDisciplineIndex === idx;

                  return (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedDisciplineIndex(idx);
                        e.dataTransfer.setData('text/plain', String(idx));
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverDisciplineIndex !== idx) {
                          setDragOverDisciplineIndex(idx);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverDisciplineIndex === idx) {
                          setDragOverDisciplineIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedDisciplineIndex !== null && draggedDisciplineIndex !== idx) {
                          reorderPlatformShowcases(draggedDisciplineIndex, idx);
                          showNotification(`Moved ${p.platform} to position #${idx + 1}`);
                        }
                        setDraggedDisciplineIndex(null);
                        setDragOverDisciplineIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedDisciplineIndex(null);
                        setDragOverDisciplineIndex(null);
                      }}
                      className={`p-4 bg-slate-950 rounded-xl border transition-all duration-200 space-y-3 relative ${
                        isDragging ? 'opacity-40 scale-[0.98] border-cyan-400/60' : ''
                      } ${
                        isDragOver ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                      } ${
                        isPrimary ? 'ring-1 ring-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-950 to-slate-950' : ''
                      }`}
                    >
                      {/* Priority Tag Header & Sequence Reorder Controls */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-900/80">
                        <div className="flex items-center gap-2">
                          {/* Drag Handle */}
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-cyan-400 hover:bg-slate-900 rounded transition"
                            title="Drag to reposition discipline sequence"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Skill Sequence / Privilege Badge */}
                          {isPrimary ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20">
                              <Star className="w-3 h-3 text-emerald-400 fill-current" />
                              #1 PRIMARY SKILL
                            </span>
                          ) : isSecondary ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                              #{idx + 1} SECONDARY SKILL
                            </span>
                          ) : isLeast ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                              #{idx + 1} LEAST PRIVILEGE / TERTIARY
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-900/70 border border-slate-800">
                              #{idx + 1} CORE DISCIPLINE
                            </span>
                          )}
                        </div>

                        {/* Move Up / Down Arrow & Pin to Top Buttons */}
                        <div className="flex items-center gap-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                pinPlatformShowcaseToTop(p.id);
                                showNotification(`Set ${p.platform} as #1 Primary Skill!`);
                              }}
                              className="px-2 py-1 text-[10px] font-mono rounded bg-slate-900 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                              title="Pin this discipline to position #1 Primary"
                            >
                              <Star className="w-3 h-3 text-amber-400" />
                              <span className="hidden sm:inline">Make #1</span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              movePlatformShowcase(p.id, 'up');
                              showNotification(`Moved ${p.platform} up`);
                            }}
                            className={`p-1 rounded border transition cursor-pointer ${
                              idx === 0
                                ? 'opacity-30 border-slate-900 text-slate-600 cursor-not-allowed'
                                : 'border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
                            }`}
                            title="Move up in sequence"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => {
                              movePlatformShowcase(p.id, 'down');
                              showNotification(`Moved ${p.platform} down`);
                            }}
                            className={`p-1 rounded border transition cursor-pointer ${
                              idx === arr.length - 1
                                ? 'opacity-30 border-slate-900 text-slate-600 cursor-not-allowed'
                                : 'border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
                            }`}
                            title="Move down in sequence"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs">{p.platform}</span>
                              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                                {p.badge}
                              </span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                p.enabled !== false
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}>
                                {p.enabled !== false ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {p.title}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              togglePlatformEnabled(p.id);
                              showNotification(`Discipline ${p.platform} ${p.enabled === false ? 'enabled' : 'disabled'}!`);
                            }}
                            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                              p.enabled !== false
                                ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
                                : 'bg-rose-950 border-rose-500/50 text-rose-300 hover:bg-rose-900'
                            }`}
                            title={p.enabled !== false ? 'Click to disable discipline' : 'Click to enable discipline'}
                          >
                            {p.enabled !== false ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveEditPlatformId(p.id)}
                            className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Subsections: <span className="text-cyan-400 font-mono font-semibold">{p.designs?.length || 0} Modules</span></span>
                        <span>{p.keyDeliverables?.length || 0} Key Deliverables</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-6 text-xs">
              {/* Featured Video Selector */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                  <span>Main Page Featured Masterclass Video</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Choose which masterclass video is highlighted prominently on the homepage cinema screen.
                </p>
                <select
                  value={siteConfig.featuredVideoId || siteConfig.videos[0]?.id}
                  onChange={e => {
                    setFeaturedVideoId(e.target.value);
                    showNotification('Main page featured video updated!');
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
                >
                  {siteConfig.videos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.title} ({v.provider} · {v.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Published Video Sessions ({siteConfig.videos.length})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {siteConfig.videos.map(v => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{v.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {v.provider} · {v.duration} · {v.category}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteVideo(v.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-950/40 rounded transition-colors"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Video Form */}
              <form onSubmit={handleCreateVideo} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Publish New Video Session</span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Video Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Live Migration of 1,000+ VMs on AVS"
                    value={newVideoTitle}
                    onChange={e => setNewVideoTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Platform</label>
                    <select
                      value={newVideoProvider}
                      onChange={e => setNewVideoProvider(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="Azure AVS">Azure AVS</option>
                      <option value="AWS VMC">AWS VMC</option>
                      <option value="Google Cloud GCVE">Google Cloud GCVE</option>
                      <option value="NSX-T SDN">NSX-T SDN</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Duration (MM:SS)</label>
                    <input
                      type="text"
                      value={newVideoDuration}
                      onChange={e => setNewVideoDuration(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Embed Player URL (YouTube/Vimeo/MP4)</label>
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={e => setNewVideoUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Summary</label>
                  <textarea
                    rows={2}
                    value={newVideoSummary}
                    onChange={e => setNewVideoSummary(e.target.value)}
                    placeholder="What does this masterclass cover?"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Key Architectural Takeaway</label>
                  <input
                    type="text"
                    value={newVideoTakeaway}
                    onChange={e => setNewVideoTakeaway(e.target.value)}
                    placeholder="e.g. Always configure ExpressRoute FastPath before migrating"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Publish Video
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: TUTORIALS */}
          {activeTab === 'tutorials' && (
            <div className="space-y-6 text-xs">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Published Articles ({siteConfig.tutorials.length})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {siteConfig.tutorials.map(tut => (
                    <div
                      key={tut.id}
                      className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{tut.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tut.type.toUpperCase()} · {tut.provider} · {tut.readTime}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTutorial(tut.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-950/40 rounded transition-colors"
                        title="Delete Tutorial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Tutorial Form */}
              <form onSubmit={handleCreateTutorial} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Publish New Tutorial or Article</span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Configuring HCX Bulk Replication via PowerCLI"
                    value={newTutTitle}
                    onChange={e => setNewTutTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Type</label>
                    <select
                      value={newTutType}
                      onChange={e => setNewTutType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="tutorial">Tutorial</option>
                      <option value="article">Article</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Provider</label>
                    <select
                      value={newTutProvider}
                      onChange={e => setNewTutProvider(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="Azure AVS">Azure AVS</option>
                      <option value="AWS VMC">AWS VMC</option>
                      <option value="Google Cloud GCVE">Google Cloud GCVE</option>
                      <option value="NSX-T SDN">NSX-T SDN</option>
                      <option value="Multi-Cloud">Multi-Cloud</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">Read Time</label>
                    <input
                      type="text"
                      value={newTutReadTime}
                      onChange={e => setNewTutReadTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Summary Overview</label>
                  <textarea
                    rows={2}
                    value={newTutSummary}
                    onChange={e => setNewTutSummary(e.target.value)}
                    placeholder="Brief executive summary"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Step Content</label>
                  <textarea
                    rows={3}
                    value={newTutSectionContent}
                    onChange={e => setNewTutSectionContent(e.target.value)}
                    placeholder="Explain the technical procedure step-by-step..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Code Snippet (Optional)</label>
                  <textarea
                    rows={3}
                    value={newTutSectionCode}
                    onChange={e => setNewTutSectionCode(e.target.value)}
                    placeholder="# PowerShell or Bash commands..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Publish Guide
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: BACKUP / IMPORT / EXPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Export Site Configuration (JSON)</span>
                </div>
                <p className="text-slate-400">
                  Export all your customized diagrams, tutorials, videos, and branding into a backup JSON file.
                </p>
                <button
                  onClick={handleExportDownload}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Import / Restore Configuration</span>
                </div>
                <p className="text-slate-400">
                  Paste previously exported JSON to load your custom website configuration.
                </p>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="Paste JSON config string here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                />
                {importError && (
                  <div className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{importError}</span>
                  </div>
                )}
                <button
                  onClick={handleImport}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Apply Imported Configuration</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <div className="font-bold text-rose-300 text-sm flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Factory Defaults</span>
                </div>
                <p className="text-rose-200/70">
                  Revert all content, diagrams, tutorials, and videos back to original factory defaults.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all modifications to defaults?')) {
                      resetToDefaults();
                      showNotification('Site reset to factory defaults.');
                    }
                  }}
                  className="w-full py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-100 font-semibold rounded-lg border border-rose-700/60 transition-colors"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
