import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { PlatformShowcase, ArchitectureDesignItem } from '../types/siteData';
import { InteractiveHotspotImage } from './InteractiveHotspotImage';
import {
  Server,
  Cloud,
  Layers,
  Shield,
  Activity,
  Repeat,
  Network,
  Image as ImageIcon,
  Film,
  Maximize2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit3,
  Info
} from 'lucide-react';
import { resolveMediaUrl } from '../data/mediaAssets';
import { SubsectionDiagramCardsGallery } from './SubsectionDiagramCardsGallery';
import { isDummyVideoUrl } from '../utils/videoUtils';

export const DedicatedPlatformsShowcase: React.FC = () => {
  const {
    siteConfig,
    setActiveEditPlatformId,
    setIsBriefingModalOpen,
    isAdmin,
    togglePlatformEnabled
  } = useCustomization();
  const [mediaModes, setMediaModes] = useState<Record<string, 'image' | 'video'>>({});
  
  // Track selected active subsection design per platform showcase
  const [activeDesignMap, setActiveDesignMap] = useState<Record<string, string>>({});

  const showcases = (siteConfig.platformShowcases || []).filter(item => isAdmin || item.enabled !== false);

  const platformMeta: Record<string, {
    icon: React.ReactNode;
    colorBadge: string;
    borderColor: string;
    gradientBg: string;
    sectionTag: string;
    accentColor: string;
    accentHex: string;
  }> = {
    'Azure VMware Solution': {
      icon: <Server className="w-5 h-5 text-cyan-400" />,
      colorBadge: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/60',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
      gradientBg: 'from-cyan-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 01',
      accentColor: 'text-cyan-400',
      accentHex: '#22d3ee'
    },
    'GCVE': {
      icon: <Cloud className="w-5 h-5 text-blue-400" />,
      colorBadge: 'border-blue-500/40 text-blue-300 bg-blue-950/60',
      borderColor: 'border-blue-500/20 hover:border-blue-500/40',
      gradientBg: 'from-blue-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 02',
      accentColor: 'text-blue-400',
      accentHex: '#60a5fa'
    },
    'VMC on AWS Migration & DR': {
      icon: <Layers className="w-5 h-5 text-amber-400" />,
      colorBadge: 'border-amber-500/40 text-amber-300 bg-amber-950/60',
      borderColor: 'border-amber-500/20 hover:border-amber-500/40',
      gradientBg: 'from-amber-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 03',
      accentColor: 'text-amber-400',
      accentHex: '#fbbf24'
    },
    'NSX': {
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      colorBadge: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/60',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
      gradientBg: 'from-emerald-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 04',
      accentColor: 'text-emerald-400',
      accentHex: '#34d399'
    },
    'VMware HCX': {
      icon: <Activity className="w-5 h-5 text-teal-400" />,
      colorBadge: 'border-teal-500/40 text-teal-300 bg-teal-950/60',
      borderColor: 'border-teal-500/20 hover:border-teal-500/40',
      gradientBg: 'from-teal-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 05',
      accentColor: 'text-teal-400',
      accentHex: '#2dd4bf'
    },
    'VMware Site Recovery Manager': {
      icon: <Repeat className="w-5 h-5 text-rose-400" />,
      colorBadge: 'border-rose-500/40 text-rose-300 bg-rose-950/60',
      borderColor: 'border-rose-500/20 hover:border-rose-500/40',
      gradientBg: 'from-rose-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 06',
      accentColor: 'text-rose-400',
      accentHex: '#fb7185'
    },
    'VMware Aria Operations for Networks': {
      icon: <Network className="w-5 h-5 text-indigo-400" />,
      colorBadge: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/60',
      borderColor: 'border-indigo-500/20 hover:border-indigo-500/40',
      gradientBg: 'from-indigo-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 07',
      accentColor: 'text-indigo-400',
      accentHex: '#818cf8'
    },
    'VMware SDDC to Nutanix NC2 on Azure': {
      icon: <Server className="w-5 h-5 text-emerald-400" />,
      colorBadge: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/60',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
      gradientBg: 'from-emerald-950/20 via-slate-900/60 to-slate-900/40',
      sectionTag: 'DEDICATED SECTION 08',
      accentColor: 'text-emerald-400',
      accentHex: '#10b981'
    }
  };

  const getMediaMode = (item: PlatformShowcase) => {
    return mediaModes[item.id] || item.mediaType || 'image';
  };

  const toggleMediaMode = (id: string, mode: 'image' | 'video') => {
    setMediaModes(prev => ({ ...prev, [id]: mode }));
  };

  const getActiveDesign = (item: PlatformShowcase): ArchitectureDesignItem | undefined => {
    const designs = item.designs || [];
    if (designs.length === 0) return undefined;
    const activeId = activeDesignMap[item.id];
    return designs.find(d => d.id === activeId) || designs[0];
  };

  const handleSelectDesign = (platformId: string, designId: string) => {
    setActiveDesignMap(prev => ({ ...prev, [platformId]: designId }));
    setMediaModes(prev => ({ ...prev, [platformId]: 'image' }));
  };

  return (
    <div id="platforms-container" className="bg-slate-950">
      {/* Platform Navigation Anchor Bar */}
      <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-md border-y border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dedicated Sections:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showcases.map(item => {
              const meta = platformMeta[item.platform] || platformMeta['Azure VMware Solution'];
              return (
                <a
                  key={item.id}
                  href={`#section-${item.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="shrink-0">{meta.icon}</span>
                  <span>{item.platform}</span>
                </a>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span>Select any blueprint below to inspect specs or view detailed schematics</span>
          </div>
        </div>
      </div>

      {/* Render Each Dedicated Section Independently with the Clean Classic Layout */}
      <div className="divide-y divide-slate-800/80">
        {showcases.map((item, index) => {
          const meta = platformMeta[item.platform] || {
            icon: <Server className="w-5 h-5 text-cyan-400" />,
            colorBadge: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/60',
            borderColor: 'border-slate-800',
            gradientBg: 'from-slate-900/60 to-slate-900/40',
            sectionTag: `DEDICATED SECTION 0${index + 1}`,
            accentColor: 'text-cyan-400',
            accentHex: '#22d3ee'
          };

          const currentMode = getMediaMode(item);
          const hasVideo = Boolean(item.videoUrl && !isDummyVideoUrl(item.videoUrl));
          const effectiveMode = hasVideo && currentMode === 'video' ? 'video' : 'image';
          const activeDesign = getActiveDesign(item);
          const designs = item.designs || [];

          // Image and descriptions based on active subsection design or fallback to platform defaults
          const displayImageUrl = activeDesign?.imageUrl || item.imageUrl;
          const displayTitle = activeDesign?.title || item.title;
          const displayBadge = activeDesign?.badge || item.badge;
          const displayDescription = activeDesign?.description || item.description;

          return (
            <section
              key={item.id}
              id={`section-${item.id}`}
              className="py-16 sm:py-24 scroll-mt-28 relative overflow-hidden"
            >
              {/* Subtle Ambient Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${meta.gradientBg} opacity-20 pointer-events-none`} />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
                {/* Section Top Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className={`font-mono ${meta.accentColor} tracking-wider font-bold`}>
                        {meta.sectionTag}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-mono ${meta.colorBadge}`}>
                        {displayBadge}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300 font-medium">{item.platform}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {item.title}
                    </h2>
                  </div>

                  {/* Header Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
                    {/* Media Type Toggle - only rendered if platform has a real, non-dummy video */}
                    {hasVideo && (
                      <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => toggleMediaMode(item.id, 'image')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                            effectiveMode === 'image'
                              ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Show architecture diagram image"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Diagrams ({designs.length || 1})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleMediaMode(item.id, 'video')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                            effectiveMode === 'video'
                              ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Show video walkthrough"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>Video</span>
                        </button>
                      </div>
                    )}

                    {/* Section Edit Modal Trigger (Visible to Admin Only) */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => togglePlatformEnabled(item.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-sm ${
                            item.enabled !== false
                              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-rose-950/80 border-rose-500/40 text-rose-300 hover:bg-rose-900'
                          }`}
                          title={item.enabled !== false ? 'Click to disable discipline' : 'Click to enable discipline'}
                        >
                          <span>{item.enabled !== false ? 'Active' : 'Disabled'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveEditPlatformId(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors shadow-sm"
                          title="Edit general section settings"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Edit Discipline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subsections Selector Strip: Clean, Uncluttered, Elegant Tab Bar */}
                {designs.length > 0 && effectiveMode === 'image' && (
                  <div className="flex flex-wrap items-center gap-2 py-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sub-Section Designs:</span>
                    </span>
                    {designs.map((design, dIdx) => {
                      const isSelected = activeDesign?.id === design.id;
                      return (
                        <button
                          key={design.id}
                          type="button"
                          onClick={() => handleSelectDesign(item.id, design.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-slate-900 border-cyan-400 text-cyan-300 font-semibold shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-cyan-400/80 font-bold">{`0${dIdx + 1}`}</span>
                          <span className="truncate max-w-[220px] sm:max-w-none">{design.title}</span>
                          {design.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hidden sm:inline-block border border-slate-700/60">
                              {design.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                  {/* Left Column: Visual Media Box (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    {effectiveMode === 'image' ? (
                      <InteractiveHotspotImage
                        key={`${item.id}-${activeDesign?.id || displayImageUrl}`}
                        imageUrl={displayImageUrl}
                        designId={activeDesign?.id}
                        title={displayTitle}
                        subtitle={item.platform}
                        description={displayDescription}
                      />
                    ) : hasVideo ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                        <iframe
                          src={item.videoUrl}
                          title={item.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : null}

                    {/* Media Footer Strip */}
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>High-Resolution Engineering Asset · Click image to expand</span>
                      </div>
                      {effectiveMode === 'video' && item.videoDuration && (
                        <span className="font-mono text-cyan-400">Duration: {item.videoDuration}</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Architectural Deep Dive (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Architectural Description Box */}
                    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 shadow-lg">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        {meta.icon}
                        <span>{displayTitle}</span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {displayDescription}
                      </p>
                    </div>

                    {/* Active Design Specific Specs */}
                    {activeDesign?.detailedSpecs && activeDesign.detailedSpecs.length > 0 && (
                      <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Technical Architecture Specifications</span>
                        </div>
                        <ul className="space-y-2">
                          {activeDesign.detailedSpecs.map((spec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="text-cyan-400 font-bold">•</span>
                              <span className="leading-snug">{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Active Design Components Breakdown */}
                    {activeDesign?.components && activeDesign.components.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Key Component Roles
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {activeDesign.components.map((comp, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">{comp.name}</span>
                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                                  {comp.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                {comp.details}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Engineering Deliverables for Platform */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Key Engineering Deliverables
                      </div>
                      <ul className="space-y-2.5">
                        {item.keyDeliverables.map((deliv, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                            <span className="leading-snug">{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technology Stack Tags */}
                    <div className="pt-2">
                      <div className="text-xs font-semibold text-slate-400 mb-2">
                        Validated Technology Stack
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.techTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Direct Action Bottom CTA */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsBriefingModalOpen(true)}
                        className="w-full sm:w-auto py-2.5 px-5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/15"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule {item.platform} Technical Briefing</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subsection Diagrams & Architecture Variations Gallery */}
                {designs.length > 0 && (
                  <div className="pt-6 border-t border-slate-800/80">
                    <SubsectionDiagramCardsGallery
                      platformId={item.id}
                      platformName={item.platform}
                      designs={designs}
                      activeDesignId={activeDesign?.id}
                      onSelectDesign={(designId) => handleSelectDesign(item.id, designId)}
                      onEditDesign={isAdmin ? () => {
                        setActiveEditPlatformId(item.id);
                      } : undefined}
                    />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
