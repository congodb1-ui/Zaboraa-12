import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Layers,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Server,
  Zap,
  Filter,
  ArrowRight,
  Sparkles,
  Info,
  FileSpreadsheet,
  Download,
  X,
  Network
} from 'lucide-react';
import {
  calculateMigrationWaves,
  WavePlannerConfig,
  VCpuOvercommitRatio,
  RamOverheadBuffer,
  MigrationWaveSummary
} from '../utils/migrationCalculator';
import { IngestedVM } from '../services/workloadAnalyzer';
import { exportColorCodedWavePlanExcel } from '../utils/excelWaveExport';

interface MigrationPlannerProps {
  workloads: IngestedVM[];
  onSelectVM?: (vm: IngestedVM) => void;
  className?: string;
}

export const MigrationPlanner: React.FC<MigrationPlannerProps> = ({
  workloads,
  onSelectVM,
  className = ''
}) => {
  // Global Configuration Controls
  const [vCpuOvercommit, setVCpuOvercommit] = useState<VCpuOvercommitRatio>(2);
  const [ramBufferPercent, setRamBufferPercent] = useState<RamOverheadBuffer>(15);
  const [migrationWanMbps, setMigrationWanMbps] = useState<number>(1000);
  const [expandedWave, setExpandedWave] = useState<number | null>(1); // Default expand Wave 1
  const [filterBlockersOnly, setFilterBlockersOnly] = useState<boolean>(false);

  // Customer Name and Export Modal State
  const [customerName, setCustomerName] = useState<string>('Global Financial Enterprises');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Synchronized Aria Networks state from localStorage
  const ariaSyncData = useMemo(() => {
    try {
      const raw = localStorage.getItem('zaboraa_aria_wave_state');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  // Compute wave analysis result
  const plannerConfig: WavePlannerConfig = useMemo(() => ({
    vCpuOvercommit,
    ramBufferPercent,
    migrationWanMbps,
    dataCompressionRatio: 0.35, // 65% reduction via dedupe/compression
    dailyChurnPercent: 15,
    concurrentMigrationsPerAppliance: 8
  }), [vCpuOvercommit, ramBufferPercent, migrationWanMbps]);

  const wavePlan = useMemo(() => {
    return calculateMigrationWaves(workloads, plannerConfig);
  }, [workloads, plannerConfig]);

  const inScopeCount = wavePlan.totalInScopeVMs;

  const handleTriggerExcelExport = () => {
    exportColorCodedWavePlanExcel({
      customerName: customerName.trim() || 'Global Financial Enterprises',
      architectName: 'Wasim Sayyed, Principal VMware Architect',
      targetCloud: 'Azure VMware Solution (AVS)',
      nodeSku: 'AV36P Bare-Metal Host',
      storagePolicy: 'RAID 5, FTT 1 (~1.33x Overhead)',
      totalNodes: Math.max(3, Math.ceil(wavePlan.totalEffectiveCores / 36)),
      vCpuOvercommit,
      ramBufferPercent,
      waves: wavePlan.waves,
      allWorkloads: workloads
    });
    setShowExportModal(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Global Wave Planning Configuration Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Enterprise Execution Engine
              </span>
              <span className="text-xs text-slate-400">Zero-Financial Engineering Analysis</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>Multi-Cloud Migration Wave Planner</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sequence in-scope workloads into dependency-aware migration waves with vCPU overcommit ratios, memory overhead buffers, and HCX transit modeling.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-mono text-slate-400">In-Scope VMs</div>
              <div className="text-lg font-bold text-cyan-300 font-mono">{inScopeCount}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-mono text-slate-400">Effective Cores</div>
              <div className="text-lg font-bold text-emerald-300 font-mono">{wavePlan.totalEffectiveCores}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-mono text-slate-400">Buffered RAM</div>
              <div className="text-lg font-bold text-indigo-300 font-mono">{wavePlan.totalBufferedRAMGiB} <span className="text-xs font-normal text-slate-400">GiB</span></div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-mono text-slate-400">Net Storage</div>
              <div className="text-lg font-bold text-amber-300 font-mono">{wavePlan.totalStorageTiB} <span className="text-xs font-normal text-slate-400">TiB</span></div>
            </div>
          </div>
        </div>

        {/* Global Parameter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-1">
          {/* vCPU Overcommit Ratio Dropdown */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>vCPU Overcommit Ratio</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">{vCpuOvercommit}:1</span>
            </div>
            <select
              value={vCpuOvercommit}
              onChange={e => setVCpuOvercommit(Number(e.target.value) as VCpuOvercommitRatio)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value={1}>1:1 Ratio (Dedicated 100% vCPU-to-Core)</option>
              <option value={2}>2:1 Ratio (Conservative Enterprise Tier-0)</option>
              <option value={3}>3:1 Ratio (Standard Balanced Enterprise)</option>
              <option value={4}>4:1 Ratio (Aggressive Non-Prod Density)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Raw {wavePlan.totalRawVCPUs} vCPUs maps to {wavePlan.totalEffectiveCores} physical cores.
            </p>
          </div>

          {/* RAM Overhead Buffer Dropdown */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>RAM Overhead Buffer</span>
              </label>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">+{ramBufferPercent}%</span>
            </div>
            <select
              value={ramBufferPercent}
              onChange={e => setRamBufferPercent(Number(e.target.value) as RamOverheadBuffer)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
            >
              <option value={10}>10% Buffer (ESXi Hypervisor Baseline)</option>
              <option value={15}>15% Buffer (Recommended HA & NSX-T)</option>
              <option value={20}>20% Buffer (High-Resilience N+1 Buffer)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Allocated {wavePlan.totalRawRAMGiB} GiB expands to {wavePlan.totalBufferedRAMGiB} GiB headroom.
            </p>
          </div>

          {/* Migration WAN Uplink Bandwidth */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>HCX Migration Uplink</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{migrationWanMbps} Mbps</span>
            </div>
            <select
              value={migrationWanMbps}
              onChange={e => setMigrationWanMbps(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
            >
              <option value={500}>500 Mbps (Standard IPsec VPN)</option>
              <option value={1000}>1 Gbps (DirectConnect / ExpressRoute / IC)</option>
              <option value={2000}>2 Gbps (Redundant 1G Links)</option>
              <option value={5000}>5 Gbps (High-Performance Dedicated Circuit)</option>
              <option value={10000}>10 Gbps (Dual 10G Cross-Connect Mesh)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Total baseline transfer window: ~{wavePlan.totalInitialSyncHours} hrs with dedupe.
            </p>
          </div>

          {/* Filter Toggles */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Blocker Filter</span>
              </label>
            </div>
            <button
              onClick={() => setFilterBlockersOnly(!filterBlockersOnly)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                filterBlockersOnly
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{filterBlockersOnly ? 'Showing Blockers Only' : 'Show All Workloads'}</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-1">
              Filter VMs with RDMs, Multi-Writer, or legacy drivers.
            </p>
          </div>
        </div>
      </div>

      {/* Aria Operations for Networks Active Link Ribbon */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Aria Operations for Networks (vRNI) Dependency Integration</span>
              {ariaSyncData && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Synchronized
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-0.5 text-[11px]">
              {ariaSyncData
                ? `Mapped ${ariaSyncData.applications.length} multi-tier application groups (${ariaSyncData.dfwRules.length} NSX DFW rules) into wave migration sequencing.`
                : 'Correlate wire-rate East-West flows, 3-tier application groups, and NSX DFW rules into this wave plan.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/tools/aria-networks"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors"
          >
            <span>{ariaSyncData ? 'Inspect Aria Rules' : 'Open Aria Flow Engine'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Migration Waves Grid */}
      <div className="space-y-4">
        {wavePlan.waves.map(wave => {
          const isExpanded = expandedWave === wave.waveIndex;
          const displayWorkloads = filterBlockersOnly
            ? wave.workloads.filter(w => w.blockers.length > 0)
            : wave.workloads;

          return (
            <div
              key={wave.waveCode}
              className={`bg-slate-900/80 border rounded-2xl transition-all duration-200 overflow-hidden shadow-lg ${
                wave.hasCriticalBlockers
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : isExpanded
                  ? 'border-cyan-500/40 ring-1 ring-cyan-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Wave Header Banner */}
              <div
                onClick={() => setExpandedWave(isExpanded ? null : wave.waveIndex)}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button className="mt-0.5 sm:mt-0 p-1 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                        {wave.waveCode}
                      </span>
                      <span className="font-bold text-white text-base">{wave.title}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          wave.targetRiskTier === 'Low'
                            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                            : wave.targetRiskTier === 'Medium'
                            ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
                            : wave.targetRiskTier === 'High'
                            ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                            : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {wave.targetRiskTier}
                      </span>
                      {wave.hasCriticalBlockers && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-200 border border-rose-600/50">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          <span>{wave.blockerCount} Blockers Flagged</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{wave.description}</p>
                  </div>
                </div>

                {/* Key Wave Metrics Pill Group */}
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap lg:flex-nowrap justify-between sm:justify-start">
                  <div className="text-left sm:text-right min-w-[70px]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Workloads</div>
                    <div className="text-sm font-bold text-white font-mono">{wave.workloadCount} VMs</div>
                  </div>
                  <div className="text-left sm:text-right min-w-[80px]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Cores / RAM</div>
                    <div className="text-sm font-bold text-cyan-300 font-mono">
                      {wave.effectiveCoresRequired}c / {wave.bufferedRAMGiB}G
                    </div>
                  </div>
                  <div className="text-left sm:text-right min-w-[80px]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Total Data</div>
                    <div className="text-sm font-bold text-amber-300 font-mono">{wave.totalStorageTiB} TiB</div>
                  </div>
                  <div className="text-left sm:text-right min-w-[90px]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Initial Sync</div>
                    <div className="text-sm font-bold text-emerald-300 font-mono">~{wave.initialSyncHours} hrs</div>
                  </div>
                </div>
              </div>

              {/* Expanded Wave Details */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/60 p-5 space-y-5">
                  {/* Row 1: Execution Cards & Transit Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Method Breakdown */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>HCX Migration Methods</span>
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>RAV (Live vMotion - Zero Downtime):</span>
                          </span>
                          <span className="font-bold text-white">{wave.ravCount} VMs</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <span>Bulk Migration (Scheduled Reboot):</span>
                          </span>
                          <span className="font-bold text-white">{wave.bulkCount} VMs</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>Cold Migration (Offline VMDK sync):</span>
                          </span>
                          <span className="font-bold text-white">{wave.coldCount} VMs</span>
                        </div>
                        {wave.rearchitectCount > 0 && (
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5 text-rose-400">
                              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                              <span>Re-architect Required (RDM-P):</span>
                            </span>
                            <span className="font-bold text-rose-300">{wave.rearchitectCount} VMs</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Storage Partitioning */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Target Storage Tier Partition</span>
                        <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-cyan-300">Local Cluster vSAN:</span>
                          <span className="font-bold text-white">{wave.vsanStorageTiB} TiB</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-emerald-300">External SAN (NFS Datastores):</span>
                          <span className="font-bold text-white">{wave.externalStorageTiB} TiB</span>
                        </div>
                        <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Deduplicated WAN Transfer:</span>
                          <span className="font-bold text-slate-200">{wave.compressedTransferGB} GB</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Cutover Window */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Cutover Execution Window</span>
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="text-xs text-slate-300">
                        <div className="font-semibold text-white mb-1">{wave.cutoverWindow}</div>
                        <div className="text-[11px] text-slate-400">
                          Daily Delta Churn: ~{wave.deltaSyncHours} hrs per cycle at {migrationWanMbps} Mbps.
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Recommended HCX-IX Fleet: <span className="font-bold text-cyan-300">{wave.recommendedHcxAppliances} Interconnect Pair(s)</span>.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workload Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Workloads Assigned to {wave.waveCode} ({displayWorkloads.length})</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        vCPU Overcommit: {vCpuOvercommit}:1 | RAM Buffer: +{ramBufferPercent}%
                      </span>
                    </div>

                    {displayWorkloads.length === 0 ? (
                      <div className="text-center py-8 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400">
                        No workloads matching the current filter in this wave.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">VM Name</th>
                              <th className="py-2.5 px-2">vCPUs</th>
                              <th className="py-2.5 px-2">RAM</th>
                              <th className="py-2.5 px-2">Disk Used</th>
                              <th className="py-2.5 px-2">Storage Tier</th>
                              <th className="py-2.5 px-2">vNIC</th>
                              <th className="py-2.5 px-2">Controller</th>
                              <th className="py-2.5 px-2">Method</th>
                              <th className="py-2.5 px-3 text-right">Readiness & Blockers</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/80">
                            {displayWorkloads.map(vm => {
                              const hasBlocker = vm.blockers.length > 0;
                              return (
                                <tr
                                  key={vm.vmName}
                                  onClick={() => onSelectVM?.(vm)}
                                  className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                                >
                                  <td className="py-2.5 px-3 font-semibold text-white">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          vm.powerState === 'poweredOn' ? 'bg-emerald-400' : 'bg-slate-500'
                                        }`}
                                      />
                                      <span className="group-hover:text-cyan-300 transition-colors">{vm.vmName}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{vm.os}</div>
                                  </td>
                                  <td className="py-2.5 px-2 text-slate-300 font-mono">
                                    {vm.cpus} vCPU
                                    <span className="text-[10px] text-slate-500 block">
                                      (~{Math.ceil(vm.cpus / vCpuOvercommit)} core)
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 text-slate-300 font-mono">
                                    {vm.memoryGiB} GiB
                                    <span className="text-[10px] text-slate-500 block">
                                      (+{Math.round(vm.memoryGiB * (ramBufferPercent / 100))}G)
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 text-slate-300 font-mono">
                                    {vm.storageTiB} TiB
                                    <span className="text-[10px] text-slate-500 block">{vm.inUseDiskGiB} GiB</span>
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                        vm.targetStorageTier === 'External NFS'
                                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                      }`}
                                    >
                                      {vm.targetStorageTier}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 font-mono text-[11px]">
                                    <span
                                      className={
                                        vm.hasLegacyVnic ? 'text-amber-400 font-bold' : 'text-slate-300'
                                      }
                                    >
                                      {vm.nics[0]?.adapterType || 'VMXNET3'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 font-mono text-[11px]">
                                    <span
                                      className={
                                        vm.hasLegacyController ? 'text-amber-400 font-bold' : 'text-slate-300'
                                      }
                                    >
                                      {vm.primaryController}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                        vm.recommendedMethod === 'HCX RAV (Live vMotion)'
                                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                                          : vm.recommendedMethod === 'HCX Bulk Migration'
                                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                                          : vm.recommendedMethod === 'HCX Cold Migration'
                                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                                          : 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                                      }`}
                                    >
                                      {vm.recommendedMethod.replace('HCX ', '')}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {hasBlocker ? (
                                      <div className="flex flex-col items-end gap-1">
                                        {vm.blockers.map(b => (
                                          <span
                                            key={b.id}
                                            className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 ${
                                              b.severity === 'CRITICAL'
                                                ? 'bg-rose-950/90 text-rose-200 border border-rose-700/80'
                                                : 'bg-amber-950/90 text-amber-200 border border-amber-700/80'
                                            }`}
                                            title={b.remediationAction}
                                          >
                                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                                            <span>{b.title}</span>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span>Ready ({vm.readinessScore}/100)</span>
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
