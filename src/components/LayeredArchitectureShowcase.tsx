import React, { useState, useEffect, useCallback, useId } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomization } from '../context/CustomizationContext';
import { PlatformShowcase, ArchitectureDesignItem } from '../types/siteData';
import { InteractiveHotspotImage } from './InteractiveHotspotImage';
import { resolveMediaUrl } from '../data/mediaAssets';
import {
  Server,
  Cloud,
  Layers,
  Shield,
  Activity,
  Repeat,
  Cpu,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  Sparkles,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Maximize2,
  Gauge,
  Workflow
} from 'lucide-react';

interface PlatformTheme {
  icon: React.ReactNode;
  accentColor: string;
  accentBorder: string;
  accentBg: string;
  accentGlow: string;
  accentHex: string;
  badgeLabel: string;
  benchmarkMetrics: {
    label: string;
    value: string;
    note: string;
  }[];
}

const PLATFORM_THEMES: Record<string, PlatformTheme> = {
  avs: {
    icon: <Server className="w-5 h-5 text-cyan-400" />,
    accentColor: 'text-cyan-400',
    accentBorder: 'border-cyan-500/40',
    accentBg: 'bg-cyan-950/40',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    accentHex: '#06b6d4',
    badgeLabel: 'AZURE VMWARE SOLUTION',
    benchmarkMetrics: [
      { label: 'Latency Boundary', value: '< 2.0 ms', note: 'ExpressRoute FastPath directly to ESXi kernel' },
      { label: 'Throughput Line-Rate', value: '10 Gbps', note: 'Wire-rate MSEE router interconnect' },
      { label: 'Decoupled Storage', value: '120 TB+', note: 'Azure NetApp Files NFSv3 external pool' },
      { label: 'High Availability', value: '99.99%', note: 'Multi-AZ synchronous vSAN stretched cluster' }
    ]
  },
  gcve: {
    icon: <Cloud className="w-5 h-5 text-blue-400" />,
    accentColor: 'text-blue-400',
    accentBorder: 'border-blue-500/40',
    accentBg: 'bg-blue-950/40',
    accentGlow: 'rgba(59, 130, 246, 0.25)',
    accentHex: '#3b82f6',
    badgeLabel: 'GOOGLE CLOUD VMWARE ENGINE',
    benchmarkMetrics: [
      { label: 'VPC Interconnect', value: '100 Gbps', note: 'Private Services Access private fiber peering' },
      { label: 'SLA Availability', value: '99.99%', note: 'Dedicated bare-metal ve1-standard-72 nodes' },
      { label: 'Analytics Pipeline', value: 'Direct PGA', note: 'Zero-NAT access to BigQuery & Vertex AI' },
      { label: 'Expansion Speed', value: '< 30 min', note: 'On-demand dynamic cluster host scaling' }
    ]
  },
  'vmc-dr': {
    icon: <Layers className="w-5 h-5 text-amber-400" />,
    accentColor: 'text-amber-400',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-950/40',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    accentHex: '#f59e0b',
    badgeLabel: 'VMWARE CLOUD ON AWS',
    benchmarkMetrics: [
      { label: 'RPO Target', value: '0 sec', note: 'Synchronous cross-AZ write mirroring' },
      { label: 'Cross-VPC Link', value: '25 Gbps', note: 'Direct Connected VPC Elastic Network Interface' },
      { label: 'External Storage', value: 'Multi-AZ', note: 'Amazon FSx for NetApp ONTAP over NFS' },
      { label: 'Auto-Scaling', value: 'Elastic DRS', note: 'Automated host scaling during workload surges' }
    ]
  },
  nsx: {
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    accentColor: 'text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-950/40',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    accentHex: '#10b981',
    badgeLabel: 'NSX-T SDN & DISTRIBUTED FIREWALL',
    benchmarkMetrics: [
      { label: 'Inspection Latency', value: '0 ms wire', note: 'Kernel-level hypervisor vNIC microsegmentation' },
      { label: 'Edge Topology', value: 'Active-Active', note: 'Tier-0 ECMP multi-path routing across edges' },
      { label: 'ADC Architecture', value: 'VMware Avi', note: 'Elastic software load balancing & WAF' },
      { label: 'Policy Model', value: 'Tag-Based', note: 'Dynamic metadata grouping without static IPs' }
    ]
  },
  srm: {
    icon: <Repeat className="w-5 h-5 text-rose-400" />,
    accentColor: 'text-rose-400',
    accentBorder: 'border-rose-500/40',
    accentBg: 'bg-rose-950/40',
    accentGlow: 'rgba(244, 63, 94, 0.25)',
    accentHex: '#f43f5e',
    badgeLabel: 'SITE RECOVERY MANAGER & HCX',
    benchmarkMetrics: [
      { label: 'Granular RPO', value: '5 min - 0s', note: 'vSphere Replication & Array-Based SRA' },
      { label: 'Test Isolation', value: '100% Non-Disruptive', note: 'Private sandbox test bubble without IP clash' },
      { label: 'Live Cutover', value: '< 1.0s stun', note: 'HCX Replication-Assisted vMotion (RAV)' },
      { label: 'Failback Workflow', value: 'Automated Reprotect', note: 'Bi-directional reverse delta synchronization' }
    ]
  },
  'nutanix-nc2-azure': {
    icon: <Cpu className="w-5 h-5 text-teal-400" />,
    accentColor: 'text-teal-400',
    accentBorder: 'border-teal-500/40',
    accentBg: 'bg-teal-950/40',
    accentGlow: 'rgba(45, 212, 191, 0.25)',
    accentHex: '#2dd4bf',
    badgeLabel: 'NUTANIX NC2 ON AZURE',
    benchmarkMetrics: [
      { label: 'Bare-Metal Node SKUs', value: 'AN36 - AN100', note: 'Native AHV without nested virtualization penalty' },
      { label: 'SDN Integration', value: 'Flow VNet', note: 'Direct Azure VNet IP assignment to guest VMs' },
      { label: 'Storage Resilience', value: 'DSF RF2 / RF3', note: 'Distributed Storage Fabric with inline dedupe' },
      { label: 'Migration Engine', value: 'Nutanix Move', note: 'Agentless CBT cross-hypervisor automated cutover' }
    ]
  }
};

const DEFAULT_THEME: PlatformTheme = {
  icon: <Server className="w-5 h-5 text-cyan-400" />,
  accentColor: 'text-cyan-400',
  accentBorder: 'border-cyan-500/40',
  accentBg: 'bg-cyan-950/40',
  accentGlow: 'rgba(6, 182, 212, 0.25)',
  accentHex: '#06b6d4',
  badgeLabel: 'ENTERPRISE ARCHITECTURE',
  benchmarkMetrics: [
    { label: 'Architecture SLA', value: '99.99%', note: 'Verified multi-cloud deployment pattern' },
    { label: 'Cutover Target', value: 'Zero-Downtime', note: 'Production tested migration runbook' },
    { label: 'Security Model', value: 'Zero-Trust', note: 'Microsegmented overlay isolation' },
    { label: 'Storage Optimization', value: 'Decoupled', note: 'Independent compute and capacity tiering' }
  ]
};

export const LayeredArchitectureShowcase: React.FC = () => {
  const {
    siteConfig,
    setIsBriefingModalOpen,
    isAdmin,
    setActiveEditPlatformId
  } = useCustomization();

  const showcases = (siteConfig.platformShowcases || []).filter(
    item => isAdmin || item.enabled !== false
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);

  // Active showcase item
  const currentShowcase = showcases[currentIndex] || showcases[0];
  const platformKey = currentShowcase?.id || 'avs';
  const theme = PLATFORM_THEMES[platformKey] || DEFAULT_THEME;

  const designs = currentShowcase?.designs || [];
  const activeDesign: ArchitectureDesignItem | undefined =
    designs[selectedDesignIndex] || designs[0];

  // Reset selected design when switching platform
  useEffect(() => {
    setSelectedDesignIndex(0);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (showcases.length === 0) return;
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % showcases.length);
  }, [showcases.length]);

  const handlePrev = useCallback(() => {
    if (showcases.length === 0) return;
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + showcases.length) % showcases.length);
  }, [showcases.length]);

  const handleSelectPlatform = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!currentShowcase) return null;

  const currentImage = resolveMediaUrl(
    activeDesign?.imageUrl || currentShowcase.imageUrl
  );

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <section
      id="architecture-showcase"
      role="region"
      aria-label="Multi-Cloud Architecture Solution Showcase"
      className="py-16 lg:py-24 bg-slate-950 border-b border-slate-800 relative overflow-hidden scroll-mt-14"
    >
      {/* Ambient Responsive Backdrop Glow responding to active platform palette */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: theme.accentHex }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Header & Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-800/80">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-cyan-400">
              <span>INTERACTIVE ARCHITECTURE SHOWCASE</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">LAYERED MULTI-CLOUD EXPLORER</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-semibold">PRODUCTION VERIFIED PATTERNS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Cloud Topologies & Migration Blueprints
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Inspect production-grade network paths, decoupled external storage pools, and zero-downtime cutover pipelines across major hyperscaler private clouds.
            </p>
          </div>

          {/* Navigation Controls: Pagination & Arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-white font-bold tabular-nums">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 tabular-nums">
                {String(showcases.length).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous architecture platform"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next architecture platform"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Platform Quick-Selector Strip (Nike Slider Style Horizontal Navigator) */}
        <div className="overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {showcases.map((platform, idx) => {
              const isActive = idx === currentIndex;
              const pTheme = PLATFORM_THEMES[platform.id] || DEFAULT_THEME;
              return (
                <button
                  key={platform.id}
                  onClick={() => handleSelectPlatform(idx)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? 'bg-slate-900 text-white border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/80 hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800/80'
                  }`}
                >
                  <span className="shrink-0">{pTheme.icon}</span>
                  <span>{platform.platform}</span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: pTheme.accentHex }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Choreographed Stage (Motion for React) */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentShowcase.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column (7 Cols): High-Resolution Architecture Canvas with Hotspots */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-2xl">
                {/* Top Diagram Toolbar */}
                <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 truncate">
                    <span className="p-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                      {theme.icon}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {activeDesign?.title || currentShowcase.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setActiveEditPlatformId(currentShowcase.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-mono flex items-center gap-1 border border-slate-700 cursor-pointer"
                        title="Edit platform content (Admin)"
                      >
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                        <span>Edit</span>
                      </button>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      VECTOR HOTSPOTS ACTIVE
                    </span>
                  </div>
                </div>

                {/* Diagram Viewport with Hotspots and Pan/Zoom */}
                <div className="relative aspect-[16/10] bg-slate-950">
                  <InteractiveHotspotImage
                    imageUrl={currentImage}
                    designId={activeDesign?.id || `${currentShowcase.id}-design-1`}
                    title={activeDesign?.title || currentShowcase.title}
                    subtitle={currentShowcase.platform}
                    description={activeDesign?.description || currentShowcase.description}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Sub-Design Selector Pills (if platform contains multiple architecture variants) */}
                {designs.length > 1 && (
                  <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1">
                      Architecture Variants:
                    </span>
                    {designs.map((design, dIdx) => (
                      <button
                        key={design.id}
                        onClick={() => setSelectedDesignIndex(dIdx)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                          dIdx === selectedDesignIndex
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {design.badge || `Variant ${dIdx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical Description Box */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <Workflow className="w-3.5 h-3.5" />
                  <span>Architecture Rationale & Flow</span>
                </div>
                <p>
                  {activeDesign?.description || currentShowcase.description}
                </p>
              </div>
            </div>

            {/* Right Column (5 Cols): Technical Specs, Honest Benchmarks & Action Center */}
            <div className="lg:col-span-5 space-y-6">
              {/* Platform Title & Badge */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${theme.accentBg} ${theme.accentBorder} ${theme.accentColor}`}
                  >
                    {theme.badgeLabel}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">
                    DISCIPLINE 0{currentIndex + 1}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {currentShowcase.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentShowcase.description}
                </p>
              </div>

              {/* Architectural Benchmark Baseline Strip (Honest Telemetry) */}
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Architectural Benchmark Baseline</span>
                  </span>
                  <span className="text-slate-500 font-normal">Design Targets</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {theme.benchmarkMetrics.map((metric, mIdx) => (
                    <div key={mIdx} className="space-y-0.5">
                      <div className="text-[11px] text-slate-400">
                        {metric.label}
                      </div>
                      <div className="text-sm font-bold text-white font-mono tabular-nums">
                        {metric.value}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate" title={metric.note}>
                        {metric.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Architecture Deliverables */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold block">
                  Core Architectural Deliverables
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentShowcase.keyDeliverables.slice(0, 4).map((deliv, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentShowcase.techTags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[11px] font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Center Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBriefingModalOpen(true)}
                  className="w-full px-4 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Architecture Briefing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/disciplines/${currentShowcase.id}`}
                    className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Full Discipline</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </Link>

                  <Link
                    to="/tools/design-generator"
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-slate-900 to-indigo-950 hover:to-indigo-900 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition text-center flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Run Blueprint</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
