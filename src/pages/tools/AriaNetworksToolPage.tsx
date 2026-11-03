import React from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Shield,
  Layers,
  ArrowRight,
  HardDrive,
  Cpu,
  FileSpreadsheet,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { AriaNetworkDeepDiveSection } from '../../components/AriaNetworkDeepDiveSection';

export const AriaNetworksToolPage: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/tools" className="hover:text-cyan-300 transition-colors">
          Workbench
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-400 font-semibold">
          VMware Aria Operations for Networks (vRNI) Engine
        </span>
      </nav>

      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between gap-2">
        <span>Product: VMware Aria Operations for Networks (vRNI)</span>
        <span className="text-cyan-300">Notice: Broadcom has rebranded Aria under VCF Operations and Automation.</span>
      </div>

      {/* Main Aria Deep Dive Section with sample data & file ingestion */}
      <AriaNetworkDeepDiveSection />

      {/* Inter-Tool Architecture Workflows Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase font-semibold">
              End-to-End Migration & Sizing Pipeline
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Connected Architecture Workbenches
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Synchronize discovered East-West application tiers, microsegmentation policies, and RVTools capacity metrics into target cloud sizing.
            </p>
          </div>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
          >
            <span>View All Engineering Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <Link
            to="/tools/rvtools-analyzer"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-white mt-3 group-hover:text-emerald-300">
              RVTools Ingestion Engine
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Parse vInfo/vDisk sheets, inspect legacy vNICs &amp; RDMs, and calculate migration readiness.
            </p>
          </Link>

          <Link
            to="/tools/sizing"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-white mt-3 group-hover:text-cyan-300">
              Node &amp; Storage Sizer
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Compute true usable capacity with RAID/FTT policies and external NFS decoupling.
            </p>
          </Link>

          <Link
            to="/tools/dr-planner"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-rose-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-white mt-3 group-hover:text-rose-300">
              DR &amp; WAN Calculator
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Model vSphere Replication delta sync throughput, RPO windows, and test failover networks.
            </p>
          </Link>

          <Link
            to="/tools/design-generator"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <Layers className="w-5 h-5 text-indigo-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-white mt-3 group-hover:text-indigo-300">
              Hybrid Blueprint Generator
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Synthesize sizing, DFW rules, and topologies into verified bill of materials deliverables.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
