import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { Hero } from '../components/Hero';
import { LayeredArchitectureShowcase } from '../components/LayeredArchitectureShowcase';
import { EngagementMethodology } from '../components/EngagementMethodology';
import { CaseStudiesSection } from '../components/CaseStudiesSection';
import {
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  FileSpreadsheet,
  Activity,
  Calendar,
  Sparkles,
  GripVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { resolveMediaUrl } from '../data/mediaAssets';

export const HomePage: React.FC = () => {
  const {
    siteConfig,
    setIsBriefingModalOpen,
    isAdmin,
    reorderPlatformShowcases,
    movePlatformShowcase,
    pinPlatformShowcaseToTop,
    setIsCustomizerOpen
  } = useCustomization();

  const [draggedPlatformIndex, setDraggedPlatformIndex] = useState<number | null>(null);
  const [dragOverPlatformIndex, setDragOverPlatformIndex] = useState<number | null>(null);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  const triggerOrderNotification = (msg: string) => {
    setOrderNotification(msg);
    setTimeout(() => setOrderNotification(null), 3000);
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Executive Overview */}
      <Hero />

      {/* 2. Interactive Layered Architecture Showcase (Nike-Slider Motion Choreography) */}
      <LayeredArchitectureShowcase />

      {/* 3. 4-Stage Enterprise Delivery Methodology (Atlas-Inspired) */}
      <EngagementMethodology />

      {/* 4. Interactive Engineering Workbench Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SELF-SERVICE ENGINEERING WORKBENCH</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">CALCULATION ENGINES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Model Capacity & Economics Before Procuring Hyperscaler Hardware
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Eliminate vendor sizing guesswork. Parse real RVTools spreadsheets, discover East-West application flows, calculate WAN replication bandwidth, and generate validated multi-cloud BOMs.
            </p>
          </div>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Open All Workbench Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Asymmetric Bento Grid for 6 Workbench Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Node Sizing Tool (Col-Span-2 on LG) */}
          <Link
            to="/tools/sizing"
            className="lg:col-span-2 group relative rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-6 sm:p-8 flex flex-col justify-between transition-all shadow-xl overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                  <HardDrive className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase">
                  DECOUPLED STORAGE SIZER
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Multi-Cloud Node & External Storage Sizing Engine
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Model compute node counts across Azure AVS (AV36/AV64), AWS VMC (i3en/i4i), and Google GCVE (ve1/ve2). Decouple storage with Azure NetApp Files (ANF) and Amazon FSx ONTAP to prevent buying redundant compute nodes.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] font-mono text-slate-400">
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-500 block">vCPU:pCore</span>
                  <span className="text-white font-bold">1:1 to 5:1</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-500 block">Storage Fabric</span>
                  <span className="text-white font-bold">vSAN & NFS</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-500 block">HA Headroom</span>
                  <span className="text-white font-bold">N+1 & N+2</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
              <span>Launch Node Sizing Calculator</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: RVTools Analyzer (Col-Span-1) */}
          <Link
            to="/tools/rvtools-analyzer"
            className="group relative rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-6 flex flex-col justify-between transition-all shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 uppercase">
                  XLSX INGESTION
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  RVTools Spreadsheet Analyzer
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload client inventory exports. Instantly calculates vCPU:pCore ratios, zombie VMDKs, stale snapshots &gt;3 days old, and oversized memory allocations.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>vInfo, vCPU, vDisk parsing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Snapshot risk checklist</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Parse RVTools Sheet</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Nutanix NC2 Assessment (Col-Span-1) */}
          <Link
            to="/tools/nutanix-nc2-assessment"
            className="group relative rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 p-6 flex flex-col justify-between transition-all shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 group-hover:border-teal-500/40 transition-colors">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-500/30 uppercase">
                  NC2 ON AZURE
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  Nutanix NC2 on Azure Sizer
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluate cross-hypervisor migration from VMware ESXi to Nutanix AHV. Sizes Azure bare-metal AN36/AN64 nodes with Flow Virtual Networking and DSF RF2/RF3 storage.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Nutanix Move CBT cutover</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>DSF dedupe/compression</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-400 group-hover:text-teal-300">
              <span>Run NC2 Assessment</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Aria Networks & DFW Flow Analyzer (Col-Span-1) */}
          <Link
            to="/tools/aria-networks"
            className="group relative rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-6 flex flex-col justify-between transition-all shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase">
                  FLOW DISCOVERY
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Aria Networks & DFW Flow Analyzer
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Discover East-West application coupling across distributed switches. Generates recommended zero-trust NSX Distributed Firewall (DFW) L4/L7 rules.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>IPFIX & NetFlow parser</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>App-ID policy generator</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
              <span>Analyze Network Flows</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 5: DR Planner & WAN Sizer (Col-Span-1) */}
          <Link
            to="/tools/dr-planner"
            className="group relative rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 p-6 flex flex-col justify-between transition-all shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 group-hover:border-rose-500/40 transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 uppercase">
                  RPO / RTO CALCULATOR
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                  Disaster Recovery WAN Calculator
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculate required replication WAN bandwidth and journal staging storage to meet 5-minute to 15-minute RPO targets without dropping replication packets.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Change rate bandwidth math</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>SRM journal capacity sizing</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-rose-400 group-hover:text-rose-300">
              <span>Open DR Planner</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 6: 4-Step Architecture Blueprint Generator (Col-Span-2 on LG) */}
          <Link
            to="/tools/design-generator"
            className="lg:col-span-2 group relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/50 p-6 sm:p-8 flex flex-col justify-between transition-all shadow-xl"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 uppercase">
                  ENTERPRISE BLUEPRINT WIZARD
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Self-Service Hybrid Architecture Blueprint Generator
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Step through our guided 4-step wizard (Scope & Source → Transit & Routing → Security & WAF → Target SDDC & DR). Generates an exhaustive Bill of Materials, network CIDR map, and 4K vector topology ready for executive sign-off.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-indigo-300 pt-1">
                <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                  Step 1: Scope & Source
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                  Step 2: Transit & FastPath
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                  Step 3: Multi-Vendor Firewalls & WAF
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                  Step 4: Target SDDC & 4K Export
                </span>
              </div>
            </div>
            <div className="relative z-10 pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Start 4-Step Blueprint Wizard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Dynamic Disciplines & Platform Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Hyperscaler & Software-Defined Platforms
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Architectural Disciplines & Validated Blueprints
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Production architectures engineered across Microsoft Azure, Amazon Web Services, Google Cloud, and VMware software-defined infrastructure.
            </p>
          </div>
          <Link
            to="/tools/design-generator"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Launch Hybrid Blueprint Generator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Admin Sequence Controls Banner (Only visible for Admin) */}
        {isAdmin && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Admin Privilege: Drag & Reorder Disciplines Sequence</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                    Active
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Drag any card or use the arrow controls (<ChevronLeft className="inline w-3 h-3 text-cyan-300" /> / <ChevronRight className="inline w-3 h-3 text-cyan-300" />) to reposition. <strong className="text-emerald-300 font-semibold">Primary skills (#1)</strong> are highlighted at the top, while secondary and least-privileged disciplines are arranged last.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                title="Open sequence manager drawer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Sequence Studio</span>
              </button>
            </div>
          </div>
        )}

        {/* Admin Order Confirmation Notification */}
        {orderNotification && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{orderNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-400/80">Saved to Cloud Site Config</span>
          </div>
        )}

        {/* Dynamic Cards Grid from siteConfig.platformShowcases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(siteConfig.platformShowcases || []).filter(item => isAdmin || item.enabled !== false).map((platform, idx, arr) => {
            const resolvedImg = resolveMediaUrl(platform.imageUrl);
            const isPrimary = idx === 0;
            const isSecondary = idx === 1 || idx === 2;
            const isLeast = idx === arr.length - 1;
            const isDragging = draggedPlatformIndex === idx;
            const isDragOver = dragOverPlatformIndex === idx;

            return (
              <div
                key={platform.id}
                draggable={isAdmin}
                onDragStart={(e) => {
                  if (!isAdmin) return;
                  setDraggedPlatformIndex(idx);
                  e.dataTransfer.setData('text/plain', String(idx));
                }}
                onDragOver={(e) => {
                  if (!isAdmin) return;
                  e.preventDefault();
                  if (dragOverPlatformIndex !== idx) {
                    setDragOverPlatformIndex(idx);
                  }
                }}
                onDragLeave={() => {
                  if (!isAdmin) return;
                  if (dragOverPlatformIndex === idx) {
                    setDragOverPlatformIndex(null);
                  }
                }}
                onDrop={(e) => {
                  if (!isAdmin) return;
                  e.preventDefault();
                  if (draggedPlatformIndex !== null && draggedPlatformIndex !== idx) {
                    reorderPlatformShowcases(draggedPlatformIndex, idx);
                    triggerOrderNotification(`Repositioned ${platform.platform} to sequence #${idx + 1}`);
                  }
                  setDraggedPlatformIndex(null);
                  setDragOverPlatformIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedPlatformIndex(null);
                  setDragOverPlatformIndex(null);
                }}
                className={`flex flex-col justify-between rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border transition-all duration-300 group overflow-hidden shadow-lg relative ${
                  isDragging ? 'opacity-40 scale-[0.98] border-cyan-400' : ''
                } ${
                  isDragOver ? 'border-cyan-400 ring-2 ring-cyan-500/50 bg-slate-900' : 'border-slate-800 hover:border-cyan-500/50'
                } ${
                  isPrimary && !isAdmin ? 'ring-1 ring-emerald-500/30' : ''
                }`}
              >
                {/* Admin Drag Handle & Priority Reorder Header */}
                {isAdmin && (
                  <div className="px-3 py-2 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded transition"
                        title="Drag card to reorder sequence"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20">
                          <Star className="w-3 h-3 text-emerald-400 fill-current" />
                          #1 PRIMARY SKILL
                        </span>
                      ) : isSecondary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                          #{idx + 1} SECONDARY
                        </span>
                      ) : isLeast ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                          #{idx + 1} LEAST PRIVILEGE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => {
                            pinPlatformShowcaseToTop(platform.id);
                            triggerOrderNotification(`Set ${platform.platform} as #1 Primary Skill!`);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-0.5"
                          title="Pin as #1 Primary Skill"
                        >
                          <Star className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline">Top</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          movePlatformShowcase(platform.id, 'up');
                          triggerOrderNotification(`Moved ${platform.platform} up`);
                        }}
                        className={`p-1 rounded border transition cursor-pointer ${
                          idx === 0
                            ? 'opacity-30 border-slate-900 text-slate-600 cursor-not-allowed'
                            : 'border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
                        }`}
                        title="Move left/up in sequence"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => {
                          movePlatformShowcase(platform.id, 'down');
                          triggerOrderNotification(`Moved ${platform.platform} down`);
                        }}
                        className={`p-1 rounded border transition cursor-pointer ${
                          idx === arr.length - 1
                            ? 'opacity-30 border-slate-900 text-slate-600 cursor-not-allowed'
                            : 'border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
                        }`}
                        title="Move right/down in sequence"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Header with Scrim */}
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={resolvedImg}
                    alt={platform.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/hero_cloud_datacenter_1791450064361.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-cyan-300 backdrop-blur-md">
                      {platform.badge}
                    </span>
                    {/* Primary Highlight Badge in Public View */}
                    {!isAdmin && isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 backdrop-blur-md shadow-md">
                        <Star className="w-3 h-3 text-emerald-400 fill-current" />
                        PRIMARY DISCIPLINE
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400">
                      {platform.platform}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {platform.techTags.slice(0, 3).map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800/80 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {platform.techTags.length > 3 && (
                      <span className="text-[10px] font-mono text-slate-500 px-1 py-0.5">
                        +{platform.techTags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Navigation CTA */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <Link
                      to={`/disciplines/${platform.id}`}
                      className="inline-flex items-center justify-between w-full text-xs font-semibold text-cyan-400 group-hover:text-cyan-300"
                    >
                      <span>Explore Architecture & Specs</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Verified Case Studies & Enterprise Track Record */}
      <CaseStudiesSection />

      {/* 5. Executive Advisory CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div
          data-theme-container="dark"
          className="dark-card dark-feature-container p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Plan Your Cloud Architecture with Lead Principal Architect Wasim Sayyed
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Direct executive briefing covering VMware license optimization, decoupled storage economics, HCX zero-downtime cutover windows, and hyperscaler networking.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsBriefingModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Architecture Briefing</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
