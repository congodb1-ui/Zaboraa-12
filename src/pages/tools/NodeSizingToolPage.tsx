import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cpu,
  HardDrive,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Server,
  Layers,
  AlertTriangle,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
  Download,
  Sparkles
} from 'lucide-react';
import {
  StoragePolicyId,
  ENTERPRISE_STORAGE_POLICIES,
  calculateStorageCapacity
} from '../../utils/storageCalculator';
import { exportDualCloudComparisonExcel } from '../../utils/excelFormatter';

interface CloudPreset {
  name: string;
  provider: 'Azure AVS' | 'AWS VMC' | 'Google Cloud GCVE' | 'Azure NC2';
  nodeModel: string;
  nodeCores: number;
  nodeRamGB: number;
  rawStoragePerNodeTB: number;
  externalStorageName: string;
  monthlyPriceEst: number;
}

const CLOUD_PRESETS: Record<string, CloudPreset> = {
  'nc2-an36': {
    name: 'Nutanix NC2 on Azure',
    provider: 'Azure NC2',
    nodeModel: 'AN36 (Intel Xeon Scalable)',
    nodeCores: 36,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 19.2,
    externalStorageName: 'Nutanix DSF + Azure Blob Tier',
    monthlyPriceEst: 4450
  },
  'nc2-an64': {
    name: 'Nutanix NC2 on Azure',
    provider: 'Azure NC2',
    nodeModel: 'AN64 (Intel Xeon Performance)',
    nodeCores: 64,
    nodeRamGB: 1536,
    rawStoragePerNodeTB: 38.4,
    externalStorageName: 'Nutanix DSF + Azure Blob Tier',
    monthlyPriceEst: 7200
  },
  'nc2-an100': {
    name: 'Nutanix NC2 on Azure',
    provider: 'Azure NC2',
    nodeModel: 'AN100 (Intel Xeon Ultra-Dense)',
    nodeCores: 104,
    nodeRamGB: 2048,
    rawStoragePerNodeTB: 76.8,
    externalStorageName: 'Nutanix DSF + Azure Blob Tier',
    monthlyPriceEst: 11500
  },
  'avs-av36p': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV36P (Intel Xeon Gold 6354)',
    nodeCores: 36,
    nodeRamGB: 576,
    rawStoragePerNodeTB: 15.4,
    externalStorageName: 'Azure NetApp Files (ANF Standard/Premium)',
    monthlyPriceEst: 4850
  },
  'avs-av36': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV36 (Intel Xeon Gold 6140)',
    nodeCores: 36,
    nodeRamGB: 576,
    rawStoragePerNodeTB: 15.4,
    externalStorageName: 'Azure NetApp Files (ANF)',
    monthlyPriceEst: 4600
  },
  'avs-av48': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV48 (Intel Xeon Platinum 8368)',
    nodeCores: 48,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 23.0,
    externalStorageName: 'Azure NetApp Files (ANF)',
    monthlyPriceEst: 6200
  },
  'avs-av52': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV52 (Intel Xeon Platinum 8470Q)',
    nodeCores: 52,
    nodeRamGB: 1536,
    rawStoragePerNodeTB: 38.4,
    externalStorageName: 'Azure NetApp Files (ANF)',
    monthlyPriceEst: 7500
  },
  'avs-av64': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV64 (Intel Xeon Platinum 8470)',
    nodeCores: 64,
    nodeRamGB: 1024,
    rawStoragePerNodeTB: 30.7,
    externalStorageName: 'Azure NetApp Files (ANF)',
    monthlyPriceEst: 8400
  },
  'vmc-i4i': {
    name: 'VMware Cloud on AWS',
    provider: 'AWS VMC',
    nodeModel: 'i4i.metal (Intel Xeon Ice Lake)',
    nodeCores: 64,
    nodeRamGB: 1024,
    rawStoragePerNodeTB: 30.0,
    externalStorageName: 'Amazon FSx for NetApp ONTAP (Multi-AZ)',
    monthlyPriceEst: 5400
  },
  'vmc-i3en': {
    name: 'VMware Cloud on AWS',
    provider: 'AWS VMC',
    nodeModel: 'i3en.metal (Storage-Optimized)',
    nodeCores: 48,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 60.0,
    externalStorageName: 'Amazon FSx for NetApp ONTAP',
    monthlyPriceEst: 6800
  },
  'vmc-m7i': {
    name: 'VMware Cloud on AWS',
    provider: 'AWS VMC',
    nodeModel: 'm7i.metal-24xl (Compute-Intensive)',
    nodeCores: 96,
    nodeRamGB: 384,
    rawStoragePerNodeTB: 15.0,
    externalStorageName: 'Amazon FSx for NetApp ONTAP',
    monthlyPriceEst: 6100
  },
  'gcve-ve1': {
    name: 'Google Cloud VMware Engine',
    provider: 'Google Cloud GCVE',
    nodeModel: 've1-standard-72 (Intel Xeon 6240)',
    nodeCores: 72,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 19.2,
    externalStorageName: 'Google Cloud NetApp Volumes (GCNV)',
    monthlyPriceEst: 5100
  },
  'gcve-ve2': {
    name: 'Google Cloud VMware Engine',
    provider: 'Google Cloud GCVE',
    nodeModel: 've2-standard-128 (Emerald Rapids)',
    nodeCores: 128,
    nodeRamGB: 2048,
    rawStoragePerNodeTB: 51.2,
    externalStorageName: 'Google Cloud NetApp Volumes (GCNV)',
    monthlyPriceEst: 8900
  }
};

export const NodeSizingToolPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCloudKey, setSelectedCloudKey] = useState<string>('avs-av36p');
  const [vmCount, setVmCount] = useState<number>(300);
  const [avgVcpu, setAvgVcpu] = useState<number>(4);
  const [avgRamGB, setAvgRamGB] = useState<number>(16);
  const [totalStorageTB, setTotalStorageTB] = useState<number>(180);

  // Global Sizing Parameters
  const [vCpuOvercommit, setVCpuOvercommit] = useState<number>(2.0); // 1:1, 2:1, 3:1, 4:1
  const [ramBufferPercent, setRamBufferPercent] = useState<number>(15); // 10%, 15%, 20%
  const [storagePolicyId, setStoragePolicyId] = useState<StoragePolicyId>('raid5_ftt1');
  const [slackFactorPercent, setSlackFactorPercent] = useState<number>(25); // 25% default

  // Storage Allocation Split (vSAN % vs External SAN %)
  const [enableDecoupledStorage, setEnableDecoupledStorage] = useState<boolean>(true);
  const [vsanPercentage, setVsanPercentage] = useState<number>(35); // 35% vSAN, 65% External

  const preset = CLOUD_PRESETS[selectedCloudKey];
  const selectedPolicy = ENTERPRISE_STORAGE_POLICIES[storagePolicyId];

  // Storage Capacity Math
  const effectiveVsanPercent = enableDecoupledStorage ? vsanPercentage : 100;
  const storageAnalysis = useMemo(() => {
    return calculateStorageCapacity({
      totalUsedStorageTB: totalStorageTB,
      totalProvisionedStorageTB: totalStorageTB * 1.3,
      vsanPercentage: effectiveVsanPercent,
      storagePolicyId,
      slackFactorPercent,
      nodeRawStorageTB: preset.rawStoragePerNodeTB
    });
  }, [totalStorageTB, effectiveVsanPercent, storagePolicyId, slackFactorPercent, preset.rawStoragePerNodeTB]);

  // Compute and Node Calculations
  const calculations = useMemo(() => {
    const totalRequiredVcpu = vmCount * avgVcpu;
    const effectiveCoresNeeded = totalRequiredVcpu / vCpuOvercommit;
    const computeNodesNeeded = Math.ceil(effectiveCoresNeeded / preset.nodeCores);

    const totalRawRam = vmCount * avgRamGB;
    const totalRamWithBuffer = totalRawRam * (1 + ramBufferPercent / 100);
    const memoryNodesNeeded = Math.ceil(totalRamWithBuffer / preset.nodeRamGB);

    // Pure vSAN Sizing (if 100% of storage resided on local vSAN)
    const pureStorage = calculateStorageCapacity({
      totalUsedStorageTB: totalStorageTB,
      totalProvisionedStorageTB: totalStorageTB * 1.3,
      vsanPercentage: 100,
      storagePolicyId,
      slackFactorPercent,
      nodeRawStorageTB: preset.rawStoragePerNodeTB
    });
    const vsanNodesNeededPure = pureStorage.vsanStorageNodesRequired;
    const nodesWithoutDecoupled = Math.max(selectedPolicy.minHosts, computeNodesNeeded, memoryNodesNeeded, vsanNodesNeededPure);

    // With Decoupled External Storage
    const vsanNodesNeededDecoupled = storageAnalysis.vsanStorageNodesRequired;
    const nodesWithDecoupled = Math.max(selectedPolicy.minHosts, computeNodesNeeded, memoryNodesNeeded, vsanNodesNeededDecoupled);

    const nodeReduction = Math.max(0, nodesWithoutDecoupled - nodesWithDecoupled);
    const percentReduction = Math.round((nodeReduction / nodesWithoutDecoupled) * 100);

    // Identify Limiting Resource
    let limitingResource = 'Compute (vCPU Cores)';
    if (memoryNodesNeeded >= computeNodesNeeded && memoryNodesNeeded >= vsanNodesNeededDecoupled) {
      limitingResource = 'Memory (RAM Footprint)';
    } else if (vsanNodesNeededDecoupled >= computeNodesNeeded && vsanNodesNeededDecoupled >= memoryNodesNeeded) {
      limitingResource = 'Storage Capacity (vSAN Parity)';
    }

    return {
      totalRequiredVcpu,
      effectiveCoresNeeded: Math.ceil(effectiveCoresNeeded),
      totalRamGB: totalRawRam,
      totalRamWithBuffer: Math.round(totalRamWithBuffer),
      computeNodesNeeded,
      memoryNodesNeeded,
      vsanNodesNeededPure,
      vsanNodesNeededDecoupled,
      nodesWithoutDecoupled,
      nodesWithDecoupled,
      nodeReduction,
      percentReduction,
      limitingResource
    };
  }, [
    vmCount,
    avgVcpu,
    avgRamGB,
    totalStorageTB,
    vCpuOvercommit,
    ramBufferPercent,
    preset,
    selectedPolicy,
    storageAnalysis
  ]);

  // Comparison State & Calculations for Side-by-Side Comparator
  const [showCompareMode, setShowCompareMode] = useState<boolean>(true);
  const [compareCloudKey, setCompareCloudKey] = useState<string>('nc2-an36');

  const presetB = CLOUD_PRESETS[compareCloudKey];
  const cloudBStorageAnalysis = useMemo(() => {
    return calculateStorageCapacity({
      totalUsedStorageTB: totalStorageTB,
      totalProvisionedStorageTB: totalStorageTB * 1.3,
      vsanPercentage: effectiveVsanPercent,
      storagePolicyId,
      slackFactorPercent,
      nodeRawStorageTB: presetB.rawStoragePerNodeTB
    });
  }, [totalStorageTB, effectiveVsanPercent, storagePolicyId, slackFactorPercent, presetB.rawStoragePerNodeTB]);

  const cloudBCalculations = useMemo(() => {
    const totalRequiredVcpu = vmCount * avgVcpu;
    const effectiveCoresNeeded = totalRequiredVcpu / vCpuOvercommit;
    const computeNodesNeeded = Math.ceil(effectiveCoresNeeded / presetB.nodeCores);

    const totalRawRam = vmCount * avgRamGB;
    const totalRamWithBuffer = totalRawRam * (1 + ramBufferPercent / 100);
    const memoryNodesNeeded = Math.ceil(totalRamWithBuffer / presetB.nodeRamGB);

    const vsanNodesNeededDecoupled = cloudBStorageAnalysis.vsanStorageNodesRequired;
    const nodesWithDecoupled = Math.max(selectedPolicy.minHosts, computeNodesNeeded, memoryNodesNeeded, vsanNodesNeededDecoupled);

    return {
      computeNodesNeeded,
      memoryNodesNeeded,
      vsanNodesNeededDecoupled,
      nodesWithDecoupled
    };
  }, [vmCount, avgVcpu, avgRamGB, vCpuOvercommit, ramBufferPercent, presetB, selectedPolicy, cloudBStorageAnalysis]);

  const savingsComparisonText = useMemo(() => {
    const costA = calculations.nodesWithDecoupled * preset.monthlyPriceEst;
    const costB = cloudBCalculations.nodesWithDecoupled * presetB.monthlyPriceEst;
    const diff = Math.abs(costA - costB);
    const diffPct = Math.round((diff / Math.max(costA, costB)) * 100);
    if (costA < costB) {
      return `${preset.name} saves $${diff.toLocaleString()}/mo (${diffPct}%) vs ${presetB.name}`;
    } else if (costB < costA) {
      return `${presetB.name} saves $${diff.toLocaleString()}/mo (${diffPct}%) vs ${preset.name}`;
    }
    return 'Identical Estimated Monthly Run-Rate';
  }, [calculations.nodesWithDecoupled, cloudBCalculations.nodesWithDecoupled, preset, presetB]);

  const handleExportComparisonExcel = () => {
    const costA = calculations.nodesWithDecoupled * preset.monthlyPriceEst;
    const costB = cloudBCalculations.nodesWithDecoupled * presetB.monthlyPriceEst;
    exportDualCloudComparisonExcel({
      projectName: 'Hyperscaler Multi-Cloud Architecture Evaluation',
      architectName: 'Wasim Sayyed, Principal VMware Architect',
      cloudA: {
        name: preset.name,
        nodeSku: preset.nodeModel,
        nodeCount: calculations.nodesWithDecoupled,
        coresPerNode: preset.nodeCores,
        ramPerNodeGB: preset.nodeRamGB,
        rawStoragePerNodeTB: preset.rawStoragePerNodeTB,
        usableStorageTB: totalStorageTB,
        vCpuAllocation: calculations.totalRequiredVcpu,
        ramAllocationGB: calculations.totalRamGB,
        monthlyOpex: costA,
        threeYearTco: costA * 36,
        storageEfficiency: `${selectedPolicy.name} with ${preset.externalStorageName}`,
        features: [
          'Bare-metal architecture',
          'Enterprise hyperconverged storage',
          'Direct VNet / VPC cross-peering'
        ]
      },
      cloudB: {
        name: presetB.name,
        nodeSku: presetB.nodeModel,
        nodeCount: cloudBCalculations.nodesWithDecoupled,
        coresPerNode: presetB.nodeCores,
        ramPerNodeGB: presetB.nodeRamGB,
        rawStoragePerNodeTB: presetB.rawStoragePerNodeTB,
        usableStorageTB: totalStorageTB,
        vCpuAllocation: calculations.totalRequiredVcpu,
        ramAllocationGB: calculations.totalRamGB,
        monthlyOpex: costB,
        threeYearTco: costB * 36,
        storageEfficiency: `${selectedPolicy.name} with ${presetB.externalStorageName}`,
        features: [
          'Bare-metal architecture',
          'Enterprise hyperconverged storage',
          'Direct VNet / VPC cross-peering'
        ]
      }
    });
  };

  const handleExportToGenerator = () => {
    try {
      localStorage.setItem('zaboraa_sizing_export', JSON.stringify({
        cloud: selectedCloudKey,
        provider: preset.provider,
        vms: vmCount,
        storageTB: totalStorageTB,
        nodes: calculations.nodesWithDecoupled,
        decoupledStorageTB: storageAnalysis.externalUsedStorageTB,
        storagePolicy: selectedPolicy.name,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    navigate('/tools/design-generator');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/tools" className="hover:text-cyan-400 transition-colors">Engineering Workbench</Link>
          <span>/</span>
          <span className="text-cyan-300">Node Sizing & Decoupled Storage Estimator</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Zero-Cost Technical Architecture
              </span>
              <span className="text-xs text-slate-400">Enterprise Hyperscaler Sizing Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Multi-Cloud Node & Usable Storage Policy Estimator
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Compute true bare-metal host density across AVS, AWS VMC, and GCVE. Size net usable capacity with enterprise RAID/FTT policies, 25% slack factor, and decoupled external NFS datastores.
            </p>
          </div>
          <button
            onClick={handleExportToGenerator}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>Send to Blueprint Generator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cloud & SKU Selector Bar (4 Clouds including Nutanix NC2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nutanix NC2 */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center justify-between">
            <span>Nutanix NC2 on Azure</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Bare-Metal</span>
          </div>
          <div className="space-y-1.5">
            {(['nc2-an36', 'nc2-an64', 'nc2-an100'] as const).map(k => (
              <button
                key={k}
                onClick={() => setSelectedCloudKey(k)}
                className={`w-full p-2 rounded-lg text-left text-xs font-mono transition-all cursor-pointer border ${
                  selectedCloudKey === k
                    ? 'bg-emerald-950 border-emerald-400 text-white font-bold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>{CLOUD_PRESETS[k].nodeModel}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{CLOUD_PRESETS[k].nodeCores} Cores · {CLOUD_PRESETS[k].nodeRamGB} GiB · {CLOUD_PRESETS[k].rawStoragePerNodeTB} TiB NVMe</div>
              </button>
            ))}
          </div>
        </div>

        {/* AVS */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase">Azure VMware Solution (AVS)</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(['avs-av36p', 'avs-av36', 'avs-av48', 'avs-av64'] as const).map(k => (
              <button
                key={k}
                onClick={() => setSelectedCloudKey(k)}
                className={`p-2 rounded-lg text-left text-xs font-mono transition-all cursor-pointer border ${
                  selectedCloudKey === k
                    ? 'bg-cyan-950 border-cyan-400 text-white font-bold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>{k.replace('avs-', '').toUpperCase()}</div>
                <div className="text-[9px] text-slate-500">{CLOUD_PRESETS[k].nodeCores}c · {CLOUD_PRESETS[k].nodeRamGB}G</div>
              </button>
            ))}
          </div>
        </div>

        {/* GCVE */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-blue-400 uppercase">Google Cloud VMware (GCVE)</div>
          <div className="space-y-1.5">
            {(['gcve-ve1', 'gcve-ve2'] as const).map(k => (
              <button
                key={k}
                onClick={() => setSelectedCloudKey(k)}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-mono transition-all cursor-pointer border ${
                  selectedCloudKey === k
                    ? 'bg-blue-950 border-blue-400 text-white font-bold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>{CLOUD_PRESETS[k].nodeModel}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{CLOUD_PRESETS[k].nodeCores} Cores · {CLOUD_PRESETS[k].nodeRamGB} GiB · {CLOUD_PRESETS[k].rawStoragePerNodeTB} TiB Raw</div>
              </button>
            ))}
          </div>
        </div>

        {/* VMC */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase">VMware Cloud on AWS (VMC)</div>
          <div className="space-y-1.5">
            {(['vmc-i4i', 'vmc-i3en', 'vmc-m7i'] as const).map(k => (
              <button
                key={k}
                onClick={() => setSelectedCloudKey(k)}
                className={`w-full p-2 rounded-lg text-left text-xs font-mono transition-all cursor-pointer border ${
                  selectedCloudKey === k
                    ? 'bg-amber-950 border-amber-400 text-white font-bold shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>{CLOUD_PRESETS[k].nodeModel}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{CLOUD_PRESETS[k].nodeCores} Cores · {CLOUD_PRESETS[k].nodeRamGB} GiB · {CLOUD_PRESETS[k].rawStoragePerNodeTB} TiB Raw</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual-Cloud Comparator Mode Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Dual-Cloud Side-by-Side Cost & Architecture Comparator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Visual Chart & TCO
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Benchmark Nutanix NC2 vs Azure AVS / AWS VMC with side-by-side cost breakdown charts and color-coded Excel export.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCompareMode(!showCompareMode)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              showCompareMode
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{showCompareMode ? 'Hide Comparison Chart' : 'Show Side-by-Side Comparison'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportComparisonExcel}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Download Color-Coded XML/HTML Excel Comparison Sheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Styled Excel</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Tray (Rendered if showCompareMode is true) */}
      {showCompareMode && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                Side-by-Side Benchmark & TCO Analysis
              </span>
              <h3 className="text-lg font-bold text-white">
                Comparing Cloud A ({CLOUD_PRESETS[selectedCloudKey].name} - {CLOUD_PRESETS[selectedCloudKey].nodeModel}) vs Cloud B ({CLOUD_PRESETS[compareCloudKey].name} - {CLOUD_PRESETS[compareCloudKey].nodeModel})
              </h3>
            </div>

            {/* Cloud B Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Cloud B:</span>
              <select
                value={compareCloudKey}
                onChange={e => setCompareCloudKey(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white outline-none cursor-pointer"
              >
                {Object.entries(CLOUD_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name} - {item.nodeModel} (${item.monthlyPriceEst}/mo)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-Side Visual Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cloud A Card */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/40 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                    Primary Baseline (Cloud A)
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{CLOUD_PRESETS[selectedCloudKey].name}</h4>
                  <p className="text-xs text-cyan-400 font-mono">{CLOUD_PRESETS[selectedCloudKey].nodeModel}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-cyan-300 font-mono">
                    ${(calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].monthlyPriceEst).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Est. Monthly Opex</div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Hosts Required:</span>
                  <span className="text-white font-bold">{calculations.nodesWithDecoupled} Nodes</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Total Cores:</span>
                  <span className="text-white">{calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].nodeCores} Cores</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Total RAM:</span>
                  <span className="text-white">{calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].nodeRamGB} GiB</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Storage Tier:</span>
                  <span className="text-cyan-300 truncate max-w-[200px]">{CLOUD_PRESETS[selectedCloudKey].externalStorageName}</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1">
                  <span>3-Year TCO Estimate:</span>
                  <span className="text-emerald-400 font-bold">
                    ${(calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].monthlyPriceEst * 36).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cloud B Card */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">
                    Comparator Target (Cloud B)
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{CLOUD_PRESETS[compareCloudKey].name}</h4>
                  <p className="text-xs text-indigo-400 font-mono">{CLOUD_PRESETS[compareCloudKey].nodeModel}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-300 font-mono">
                    ${(cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].monthlyPriceEst).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Est. Monthly Opex</div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Hosts Required:</span>
                  <span className="text-white font-bold">{cloudBCalculations.nodesWithDecoupled} Nodes</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Total Cores:</span>
                  <span className="text-white">{cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].nodeCores} Cores</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Total RAM:</span>
                  <span className="text-white">{cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].nodeRamGB} GiB</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>Storage Tier:</span>
                  <span className="text-indigo-300 truncate max-w-[200px]">{CLOUD_PRESETS[compareCloudKey].externalStorageName}</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1">
                  <span>3-Year TCO Estimate:</span>
                  <span className="text-emerald-400 font-bold">
                    ${(cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].monthlyPriceEst * 36).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive SVG Comparison Chart (Monthly Opex & 3-Year TCO) */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Visual TCO Cost Difference Spectrum</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {savingsComparisonText}
              </span>
            </div>

            {/* SVG Bar Chart */}
            <div className="space-y-4 pt-2">
              {/* Monthly Opex Comparison Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Monthly Opex ({CLOUD_PRESETS[selectedCloudKey].nodeModel} vs {CLOUD_PRESETS[compareCloudKey].nodeModel})</span>
                  <span className="text-cyan-400">
                    ${(calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].monthlyPriceEst).toLocaleString()} vs ${(cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].monthlyPriceEst).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-5 rounded-lg bg-slate-900 flex overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 font-mono transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        ((calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].monthlyPriceEst) /
                          Math.max(1, (calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].monthlyPriceEst) + (cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].monthlyPriceEst))) * 100
                      )}%`
                    }}
                  >
                    Cloud A
                  </div>
                  <div
                    className="bg-indigo-500 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        ((cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].monthlyPriceEst) /
                          Math.max(1, (calculations.nodesWithDecoupled * CLOUD_PRESETS[selectedCloudKey].monthlyPriceEst) + (cloudBCalculations.nodesWithDecoupled * CLOUD_PRESETS[compareCloudKey].monthlyPriceEst))) * 100
                      )}%`
                    }}
                  >
                    Cloud B
                  </div>
                </div>
              </div>

              {/* Node Density Comparison Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Cluster Host Count ({calculations.nodesWithDecoupled} Hosts vs {cloudBCalculations.nodesWithDecoupled} Hosts)</span>
                  <span className="text-indigo-400 font-semibold">
                    {calculations.nodesWithDecoupled < cloudBCalculations.nodesWithDecoupled
                      ? `Cloud A requires ${cloudBCalculations.nodesWithDecoupled - calculations.nodesWithDecoupled} fewer hosts`
                      : calculations.nodesWithDecoupled > cloudBCalculations.nodesWithDecoupled
                      ? `Cloud B requires ${calculations.nodesWithDecoupled - cloudBCalculations.nodesWithDecoupled} fewer hosts`
                      : 'Identical host count'}
                  </span>
                </div>
                <div className="w-full h-5 rounded-lg bg-slate-900 flex overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-600 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (calculations.nodesWithDecoupled / Math.max(1, calculations.nodesWithDecoupled + cloudBCalculations.nodesWithDecoupled)) * 100
                      )}%`
                    }}
                  >
                    {calculations.nodesWithDecoupled} hosts
                  </div>
                  <div
                    className="bg-indigo-600 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (cloudBCalculations.nodesWithDecoupled / Math.max(1, calculations.nodesWithDecoupled + cloudBCalculations.nodesWithDecoupled)) * 100
                      )}%`
                    }}
                  >
                    {cloudBCalculations.nodesWithDecoupled} hosts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Sizing Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Workload Parameters & SLA Assumptions</span>
              </h2>
              <button
                onClick={() => {
                  setVmCount(300);
                  setAvgVcpu(4);
                  setAvgRamGB(16);
                  setTotalStorageTB(180);
                  setVCpuOvercommit(2.0);
                  setRamBufferPercent(15);
                  setStoragePolicyId('raid5_ftt1');
                  setSlackFactorPercent(25);
                  setEnableDecoupledStorage(true);
                  setVsanPercentage(35);
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Slider 1: VM Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Total Workload VMs</span>
                <span className="font-mono text-cyan-300 font-bold">{vmCount} VMs</span>
              </div>
              <input
                type="range"
                min="20"
                max="2000"
                step="10"
                value={vmCount}
                onChange={e => setVmCount(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20 VMs</span>
                <span>500 VMs</span>
                <span>1000 VMs</span>
                <span>2000 VMs</span>
              </div>
            </div>

            {/* Grid 2: vCPU & RAM per VM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Avg vCPU per VM</span>
                  <span className="font-mono text-cyan-300 font-bold">{avgVcpu} vCPUs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  value={avgVcpu}
                  onChange={e => setAvgVcpu(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Avg RAM per VM</span>
                  <span className="font-mono text-cyan-300 font-bold">{avgRamGB} GB</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  step="2"
                  value={avgRamGB}
                  onChange={e => setAvgRamGB(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Slider 3: Total Storage Footprint */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Aggregate Workload Data Footprint</span>
                <span className="font-mono text-cyan-300 font-bold">{totalStorageTB} TB</span>
              </div>
              <input
                type="range"
                min="10"
                max="800"
                step="5"
                value={totalStorageTB}
                onChange={e => setTotalStorageTB(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10 TB</span>
                <span>200 TB</span>
                <span>400 TB</span>
                <span>800 TB</span>
              </div>
            </div>

            {/* vCPU Overcommit & RAM Buffer Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>vCPU Overcommit Ratio</span>
                  <span className="text-cyan-400 font-mono font-bold">{vCpuOvercommit}:1</span>
                </label>
                <select
                  value={vCpuOvercommit}
                  onChange={e => setVCpuOvercommit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 cursor-pointer"
                >
                  <option value={1.0}>1:1 Ratio (Dedicated 1:1 Cores - Tier 0 DBs)</option>
                  <option value={2.0}>2:1 Ratio (Balanced Enterprise Production)</option>
                  <option value={3.0}>3:1 Ratio (Standard Production & Middleware)</option>
                  <option value={4.0}>4:1 Ratio (Aggressive Non-Prod & Dev Density)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">
                  {calculations.totalRequiredVcpu} vCPUs requires {calculations.effectiveCoresNeeded} physical cores
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>RAM Overhead Buffer</span>
                  <span className="text-indigo-400 font-mono font-bold">+{ramBufferPercent}%</span>
                </label>
                <select
                  value={ramBufferPercent}
                  onChange={e => setRamBufferPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 cursor-pointer"
                >
                  <option value={10}>10% Buffer (Hypervisor Baseline)</option>
                  <option value={15}>15% Buffer (Standard N+1 HA & NSX-T)</option>
                  <option value={20}>20% Buffer (High-Resilience N+2 Buffer)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">
                  {calculations.totalRamGB} GiB allocated expands to {calculations.totalRamWithBuffer} GiB
                </span>
              </div>
            </div>

            {/* Storage Policy Dropdown & Slack Factor Selector */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Enterprise Storage Policy & Parity Multiplier</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">
                  Overhead Factor: {selectedPolicy.overheadMultiplier.toFixed(2)}x
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Storage Policy Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Storage Policy (RAID/FTT)</label>
                  <select
                    value={storagePolicyId}
                    onChange={e => setStoragePolicyId(e.target.value as StoragePolicyId)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs font-mono text-white cursor-pointer"
                  >
                    <option value="raid1_ftt1">RAID 1, FTT 1 (2.0x raw capacity factor)</option>
                    <option value="raid5_ftt1">RAID 5, FTT 1 (~1.33x efficiency factor)</option>
                    <option value="raid6_ftt2">RAID 6, FTT 2 (~1.50x dual-parity factor)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block">
                    {selectedPolicy.description} (Min {selectedPolicy.minHosts} hosts).
                  </span>
                </div>

                {/* Slack Factor */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">vSAN Operational Slack Factor</label>
                  <select
                    value={slackFactorPercent}
                    onChange={e => setSlackFactorPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs font-mono text-white cursor-pointer"
                  >
                    <option value={20}>20% Slack (Minimum VMware Baseline)</option>
                    <option value={25}>25% Slack (Enterprise Standard Recommended)</option>
                    <option value={30}>30% Slack (High Snapshot / Resync Headroom)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block">
                    Reserves {slackFactorPercent}% raw headroom for maintenance mode evacuations and snapshot merges.
                  </span>
                </div>
              </div>
            </div>

            {/* Storage Allocation Split (vSAN % vs External SAN %) */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span>Storage Tier Allocation Split</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Distribute total used storage between high-performance local vSAN and External NFS ({preset.externalStorageName}).
                  </div>
                </div>
                <button
                  onClick={() => setEnableDecoupledStorage(!enableDecoupledStorage)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    enableDecoupledStorage ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      enableDecoupledStorage ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {enableDecoupledStorage ? (
                <div className="space-y-3 pt-2 border-t border-cyan-500/20">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-cyan-300">Local vSAN: {vsanPercentage}% ({storageAnalysis.vsanUsedDataTB} TB)</span>
                    <span className="text-emerald-300">External SAN: {100 - vsanPercentage}% ({storageAnalysis.externalUsedStorageTB} TB)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={vsanPercentage}
                    onChange={e => setVsanPercentage(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10% vSAN (Maximum NFS Offload)</span>
                    <span>50% Balanced</span>
                    <span>90% vSAN Heavy</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                  Decoupled storage disabled. 100% of workload data ({totalStorageTB} TB) is mapped to local cluster vSAN.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sizing Results & Technical Metrics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Node Reduction Outcome Card */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Sizing Outcome & Host Footprint
              </div>
              <h3 className="text-xl font-bold text-white flex items-center justify-between">
                <span>Cluster Hosts Required</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                  N+1 HA Resilient
                </span>
              </h3>
            </div>

            {/* Comparison Columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="text-[11px] text-slate-400 font-mono">Traditional Pure vSAN</div>
                <div className="text-3xl font-black text-rose-400 font-mono">
                  {calculations.nodesWithoutDecoupled}
                </div>
                <div className="text-[10px] text-slate-500">Nodes (Storage Bound)</div>
              </div>

              <div className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-center space-y-1">
                <div className="text-[11px] text-cyan-300 font-mono">With Decoupled Storage</div>
                <div className="text-3xl font-black text-cyan-300 font-mono">
                  {calculations.nodesWithDecoupled}
                </div>
                <div className="text-[10px] text-cyan-400 font-semibold">
                  {calculations.nodeReduction > 0 ? `-${calculations.nodeReduction} Nodes (-${calculations.percentReduction}%)` : 'Optimized'}
                </div>
              </div>
            </div>

            {/* Limiting Resource Badge */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Limiting Constraint:</span>
              <span className="font-bold text-amber-300 font-mono">{calculations.limitingResource}</span>
            </div>

            {/* Constraints Breakdown */}
            <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="text-slate-400 font-sans font-semibold">Host Requirements by Dimension:</div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                <span>Compute Bound (vCPU Cores):</span>
                <span>{calculations.computeNodesNeeded} hosts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                <span>Memory Bound (RAM Buffered):</span>
                <span>{calculations.memoryNodesNeeded} hosts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                <span>Pure vSAN Storage (No NFS):</span>
                <span className="text-rose-400 font-bold">{calculations.vsanNodesNeededPure} hosts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                <span>Decoupled vSAN Storage (Remaining):</span>
                <span className="text-cyan-300 font-bold">{calculations.vsanNodesNeededDecoupled} hosts</span>
              </div>
            </div>

            {/* Usable Storage & Parity Breakdown Panel */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="text-slate-300 font-semibold font-sans flex items-center justify-between">
                <span>Net Usable Capacity & Parity Breakdown</span>
                <span className="text-[10px] text-cyan-400">{selectedPolicy.shortLabel}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Local vSAN Usable Data:</span>
                <span className="text-white font-bold">{storageAnalysis.vsanUsedDataTB} TB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>vSAN RAID Parity Overhead:</span>
                <span className="text-amber-400 font-bold">+{storageAnalysis.vsanPolicyOverheadTB} TB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>vSAN Operational Slack ({slackFactorPercent}%):</span>
                <span className="text-indigo-400 font-bold">+{storageAnalysis.vsanSlackTB} TB</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1.5">
                <span>Raw vSAN Capacity Required:</span>
                <span className="text-cyan-300 font-bold">{storageAnalysis.vsanRawRequiredTB} TB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>External SAN Capacity Provisioned:</span>
                <span className="text-emerald-300 font-bold">{storageAnalysis.externalProvisionedTB} TB</span>
              </div>
            </div>

            {/* CTA action */}
            <button
              onClick={handleExportToGenerator}
              className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <span>Apply Sizing to Hybrid Blueprint Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
