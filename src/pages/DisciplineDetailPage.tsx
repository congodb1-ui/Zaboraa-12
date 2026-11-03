import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import {
  Layers,
  CheckCircle2,
  Calendar,
  ArrowRight,
  HardDrive,
  Cpu,
  ShieldCheck,
  Server,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sliders
} from 'lucide-react';
import { resolveMediaUrl } from '../data/mediaAssets';
import { InteractiveHotspotImage } from '../components/InteractiveHotspotImage';
import { SubsectionDiagramCardsGallery } from '../components/SubsectionDiagramCardsGallery';

export const DisciplineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    siteConfig,
    setIsBriefingModalOpen,
    isAdmin,
    setActiveEditPlatformId,
    setIsCustomizerOpen,
    togglePlatformEnabled
  } = useCustomization();

  // Dynamically find discipline from siteConfig.platformShowcases without hardcoding
  const platform = (siteConfig.platformShowcases || []).find(p => p.id.toLowerCase() === id?.toLowerCase());

  const [activeDesignIndex, setActiveDesignIndex] = useState<number>(0);

  if (!platform) {
    return (
      <div className="py-20 px-4 max-w-4xl mx-auto text-center space-y-6">
        <div className="text-rose-400 font-mono text-sm">404: DISCIPLINE NOT FOUND</div>
        <h1 className="text-3xl font-bold text-white">Platform Architecture Not Found</h1>
        <p className="text-slate-400 text-sm">
          No architectural discipline was found matching the identifier "{id}". Explore our verified platforms below:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-6">
          {(siteConfig.platformShowcases || []).map(p => (
            <Link
              key={p.id}
              to={`/disciplines/${p.id}`}
              className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left transition-colors"
            >
              <div className="text-xs font-mono text-cyan-400">{p.platform}</div>
              <div className="text-sm font-bold text-white mt-1">{p.title}</div>
            </Link>
          ))}
        </div>
        <div className="pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            <span>Return to Home Overview</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handle disabled discipline for regular users
  if (platform.enabled === false && !isAdmin) {
    return (
      <div className="py-20 px-4 max-w-2xl mx-auto text-center space-y-6">
        <div className="p-3 w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold text-white">Discipline Offline</h1>
        <p className="text-slate-400 text-sm">
          The <span className="text-cyan-300 font-semibold">{platform.title}</span> architecture discipline has been temporarily taken offline by site administrators for maintenance.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs"
        >
          <span>Browse Available Disciplines</span>
        </Link>
      </div>
    );
  }

  const designs = platform.designs && platform.designs.length > 0 ? platform.designs : [
    {
      id: `${platform.id}-main`,
      title: platform.title,
      description: platform.description,
      imageUrl: platform.imageUrl,
      detailedSpecs: platform.keyDeliverables,
      components: [
        { name: 'Core Compute SDDC', role: 'Compute & Hypervisor', details: 'Enterprise VMware ESXi bare-metal cluster' },
        { name: 'SDN & Edge Routing', role: 'Network Tier', details: 'NSX-T Tier-0 Active-Active ECMP Gateway' },
        { name: 'Data Layer', role: 'Storage Tier', details: 'Decoupled Cloud Storage & High-IOPS Datastores' }
      ]
    }
  ];

  const currentDesign = designs[Math.min(activeDesignIndex, designs.length - 1)];
  const resolvedImageUrl = resolveMediaUrl(currentDesign.imageUrl || platform.imageUrl);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-500">Disciplines</span>
        <span>/</span>
        <span className="text-cyan-300 font-semibold">{platform.platform}</span>
      </div>

      {/* Admin Notice if Discipline is Disabled */}
      {isAdmin && platform.enabled === false && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-between text-amber-200 shadow-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold">ADMIN NOTICE: This discipline is currently DISABLED and hidden from regular visitors.</span>
          </div>
          <button
            type="button"
            onClick={() => togglePlatformEnabled(platform.id)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold cursor-pointer transition-colors shadow-md"
          >
            Enable Discipline Now
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              {platform.badge}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {platform.platform}
            </span>
            {platform.enabled === false && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-bold">
                [DISABLED]
              </span>
            )}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveEditPlatformId(platform.id);
                  setIsCustomizerOpen(true);
                }}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer ml-2"
                title="Edit this platform in Customizer"
              >
                <Sliders className="w-3 h-3" />
                <span>[Edit Platform]</span>
              </button>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {platform.title}
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            {platform.description}
          </p>
          {platform.id === 'aria' && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
              Notice: Broadcom has rebranded VMware Aria under VCF Operations and Automation.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <button
            onClick={() => setIsBriefingModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Technical Briefing for {platform.badge}</span>
          </button>
          {platform.id === 'nutanix-nc2-azure' && (
            <Link
              to="/tools/nutanix-nc2-assessment"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Dedicated Nutanix NC2 Assessment</span>
            </Link>
          )}
          <Link
            to="/tools"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <span>Model Sizing in Workbench</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Multi-Design Switcher Tabs (if discipline has multiple architecture designs) */}
      {designs.length > 1 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Architecture Design Variations ({designs.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {designs.map((design, idx) => (
              <button
                key={design.id || idx}
                onClick={() => setActiveDesignIndex(idx)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeDesignIndex === idx
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {design.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Architecture Showcase Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Architecture Image (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <InteractiveHotspotImage
            key={`${platform.id}-${currentDesign.id}`}
            imageUrl={resolvedImageUrl}
            designId={currentDesign.id}
            title={currentDesign.title}
            subtitle={platform.platform}
            description={currentDesign.description}
          />

          <p className="text-sm text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            {currentDesign.description}
          </p>
        </div>

        {/* Specifications & Component Roles (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Detailed Specs */}
          {currentDesign.detailedSpecs && currentDesign.detailedSpecs.length > 0 && (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider text-cyan-400">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Architecture Specifications</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {currentDesign.detailedSpecs.map((spec, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Component Roles Matrix */}
          {currentDesign.components && currentDesign.components.length > 0 && (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
                Component Infrastructure Roles
              </h3>
              <div className="space-y-3">
                {currentDesign.components.map((comp, cIdx) => (
                  <div key={cIdx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{comp.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {comp.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      {comp.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables Checklist */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-slate-300">
              Production Deliverables
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              {platform.keyDeliverables.map((del, dIdx) => (
                <div key={dIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{del}</span>
                </div>
              ))}
            </div>

            {/* Tech Tags */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-400 mb-2">Technical Standards:</div>
              <div className="flex flex-wrap gap-1.5">
                {platform.techTags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsection Diagrams & Architecture Variations Gallery */}
      <SubsectionDiagramCardsGallery
        platformId={platform.id}
        platformName={platform.platform}
        designs={designs}
        activeDesignId={currentDesign.id}
        onSelectDesign={(designId) => {
          const foundIdx = designs.findIndex(d => d.id === designId);
          if (foundIdx >= 0) setActiveDesignIndex(foundIdx);
        }}
        onEditDesign={isAdmin ? () => {
          setActiveEditPlatformId(platform.id);
          setIsCustomizerOpen(true);
        } : undefined}
      />
    </div>
  );
};
