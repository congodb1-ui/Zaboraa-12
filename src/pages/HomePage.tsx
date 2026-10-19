import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { Hero } from '../components/Hero';
import { CloudMigrationArchitectureShowcase } from '../components/CloudMigrationArchitectureShowcase';
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
  Calendar
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setIsBriefingModalOpen
  } = useCustomization();

  return (
    <div className="space-y-16">
      {/* 1. Hero Executive Overview */}
      <Hero />

      {/* 2. Signature Architecture Experience: 2D Cloud Migration & Architecture Pipeline */}
      <CloudMigrationArchitectureShowcase />

      {/* 3. Interactive Layered Architecture Showcase (AVS, GCVE, VMC on AWS, NC2, NSX-T, SRM & HCX) */}
      <LayeredArchitectureShowcase />

      {/* 4. 4-Stage Enterprise Delivery Methodology */}
      <EngagementMethodology />

      {/* 5. Interactive Engineering Workbench Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-sky-700 dark:text-cyan-400">
              <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              <span>SELF-SERVICE ENGINEERING WORKBENCH</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 dark:text-slate-400">CALCULATION & SIZING SUITE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Model Capacity & Economics Before Procuring Hyperscaler Hardware
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Eliminate vendor sizing guesswork. Parse real RVTools spreadsheets, discover East-West application flows, calculate WAN replication bandwidth, and generate validated multi-cloud BOMs.
            </p>
          </div>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-sm shrink-0 cursor-pointer"
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
            className="lg:col-span-2 group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-cyan-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all shadow-sm hover:shadow-md overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-cyan-400 transition-colors">
                  <HardDrive className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-sky-50 dark:bg-cyan-950/80 text-sky-800 dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30 uppercase">
                  DECOUPLED STORAGE SIZER
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-cyan-300 transition-colors">
                  Multi-Cloud Node & External Storage Sizing Engine
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Model compute node counts across Azure AVS (AV36/AV64), AWS VMC (i3en/i4i), and Google GCVE (ve1/ve2). Decouple storage with Azure NetApp Files (ANF) and Amazon FSx ONTAP to prevent buying redundant compute nodes.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 block">vCPU:pCore</span>
                  <span className="text-slate-900 dark:text-white font-bold">1:1 to 5:1</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 block">Storage Fabric</span>
                  <span className="text-slate-900 dark:text-white font-bold">vSAN & NFS</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 block">HA Headroom</span>
                  <span className="text-slate-900 dark:text-white font-bold">N+1 & N+2</span>
                </div>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-cyan-400 group-hover:text-sky-800 dark:group-hover:text-cyan-300">
              <span>Launch Node Sizing Calculator</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: RVTools Analyzer (Col-Span-1) */}
          <Link
            to="/tools/rvtools-analyzer"
            className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 transition-colors">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 uppercase">
                  XLSX INGESTION
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  RVTools Spreadsheet Analyzer
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Upload client inventory exports. Instantly calculates vCPU:pCore ratios, zombie VMDKs, stale snapshots &gt;3 days old, and oversized memory allocations.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>vInfo, vCPU, vDisk parsing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Snapshot risk checklist</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800">
              <span>Parse RVTools Sheet</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Nutanix NC2 Assessment (Col-Span-1) */}
          <Link
            to="/tools/nutanix-nc2-assessment"
            className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 transition-colors">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 uppercase">
                  NC2 ON AZURE
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                  Nutanix NC2 on Azure Sizer
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Evaluate cross-hypervisor migration from VMware ESXi to Nutanix AHV. Sizes Azure bare-metal AN36/AN64 nodes with Flow Virtual Networking and DSF RF2/RF3 storage.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Nutanix Move CBT cutover</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>DSF dedupe/compression</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:text-teal-800">
              <span>Run NC2 Assessment</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Aria Networks & DFW Flow Analyzer (Col-Span-1) */}
          <Link
            to="/tools/aria-networks"
            className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-cyan-400 transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-cyan-950/80 text-sky-800 dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30 uppercase">
                  FLOW DISCOVERY
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-cyan-300 transition-colors">
                  Aria Networks & DFW Flow Analyzer
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Discover East-West application coupling across distributed switches. Generates recommended zero-trust NSX Distributed Firewall (DFW) L4/L7 rules.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
                  <span>IPFIX & NetFlow parser</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
                  <span>App-ID policy generator</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-cyan-400 group-hover:text-sky-800">
              <span>Analyze Network Flows</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 5: DR Planner & WAN Sizer (Col-Span-1) */}
          <Link
            to="/tools/dr-planner"
            className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 uppercase">
                  RPO / RTO CALCULATOR
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                  Disaster Recovery WAN Calculator
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Calculate required replication WAN bandwidth and journal staging storage to meet 5-minute to 15-minute RPO targets without dropping replication packets.
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Change rate bandwidth math</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>SRM journal capacity sizing</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400 group-hover:text-rose-800">
              <span>Open DR Planner</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 6: 4-Step Architecture Blueprint Generator (Col-Span-2 on LG) */}
          <Link
            to="/tools/design-generator"
            className="lg:col-span-2 group relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-800 p-6 sm:p-8 flex flex-col justify-between transition-all shadow-md hover:shadow-lg"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800 uppercase">
                  ENTERPRISE BLUEPRINT WIZARD
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                  Self-Service Hybrid Architecture Blueprint Generator
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Step through our guided 4-step wizard (Scope & Source → Transit & Routing → Security & WAF → Target SDDC & DR). Generates an exhaustive Bill of Materials, network CIDR map, and 4K vector topology ready for executive sign-off.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-300 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Step 1: Scope & Source
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Step 2: Transit & FastPath
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Step 3: Multi-Vendor Firewalls & WAF
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Step 4: Target SDDC & 4K Export
                </span>
              </div>
            </div>
            <div className="relative z-10 pt-6 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
              <span>Start 4-Step Blueprint Wizard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* 6. Verified Case Studies & Enterprise Track Record */}
      <CaseStudiesSection />

      {/* 8. Executive Advisory CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white border border-slate-800 text-center space-y-4 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Plan Your Enterprise Cloud Architecture with Lead Principal Architect Wasim Sayyed
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Direct executive briefing covering VMware license optimization, decoupled storage economics, HCX zero-downtime cutover windows, and hyperscaler networking.
          </p>
          <div className="pt-3">
            <button
              onClick={() => setIsBriefingModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all shadow-md cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-700" />
              <span>Schedule Architecture Briefing</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
