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
  calculateStorageCapacity,
  equivalentPolicyId,
  policiesForFamily
} from '../../utils/storageCalculator';
import { exportDualCloudComparisonExcel } from '../../utils/excelFormatter';

interface CloudPreset {
  name: string;
  provider: 'Azure AVS' | 'AWS VMC' | 'Google Cloud GCVE' | 'Azure NC2';
  nodeModel: string;
  /** PHYSICAL cores per host. Never logical threads (Google lists vCPU = threads; that is converted here). */
  nodeCores: number;
  nodeRamGB: number;
  /** Local capacity tier per host in decimal TB, EXCLUDING cache tier. 0 = diskless host (external storage only). */
  rawStoragePerNodeTB: number;
  hasLocalStorage: boolean;
  /** Smallest cluster the vendor will provision for production. */
  minNodes: number;
  /** Largest cluster the vendor supports. */
  maxNodesCluster: number;
  externalStorageName: string;
  /** Indicative flat monthly host price in USD. null = no figure entered. NOT a vendor list price. */
  monthlyPriceEst: number | null;
  specSource: string;
  specVerifiedOn: string;
  specNote?: string;
}

/**
 * Pricing metadata. Figures below are indicative planning numbers, not vendor list prices.
 * Vendors publish node prices per region and per term (pay-as-you-go, 1-year, 3-year), so a single
 * flat figure cannot match an official price. Update priceFixedOn when the numbers are re-quoted.
 */
export const PRICING_META = {
  status: 'indicative-unverified',
  priceFixedOn: null as string | null, // original entry date was not recorded in the repository
  reviewedOn: '2026-11-03',
  notice:
    'Prices are indicative planning figures, not vendor list prices (original entry date not recorded; last reviewed 3 Nov 2026). Host infrastructure only: excludes Broadcom VCF and Nutanix licences, external storage (ANF / FSx / GCNV), egress, support and tax. Validate in the vendor pricing calculator for your region and term.'
};

const SPEC_DATE = '2026-11-03';
const SRC_AVS = 'https://learn.microsoft.com/en-us/azure/azure-vmware/architecture-private-clouds';
const SRC_VMC = 'https://vmc.techzone.vmware.com/resource/feature-brief-sddc-host-types';
const SRC_GCVE = 'https://cloud.google.com/vmware-engine/docs/concepts-node-types';
const SRC_NC2 = 'https://learn.microsoft.com/en-us/azure/nutanix/available-regions-skus';

const CLOUD_PRESETS: Record<string, CloudPreset> = {
  'nc2-an36': {
    name: 'Nutanix NC2 on Azure',
    provider: 'Azure NC2',
    nodeModel: 'AN36 (Intel Xeon Gold 6140)',
    nodeCores: 36,
    nodeRamGB: 576,
    rawStoragePerNodeTB: 18.6,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 28,
    externalStorageName: 'External NFS / Nutanix Files (confirm support for your design)',
    monthlyPriceEst: 4450,
    specSource: SRC_NC2,
    specVerifiedOn: SPEC_DATE,
    specNote: 'Cluster maximum of 28 nodes not re-verified in this review.'
  },
  'nc2-an36p': {
    name: 'Nutanix NC2 on Azure',
    provider: 'Azure NC2',
    nodeModel: 'AN36P (Intel Xeon Gold 6240)',
    nodeCores: 36,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 20.77,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 28,
    externalStorageName: 'External NFS / Nutanix Files (confirm support for your design)',
    monthlyPriceEst: null,
    specSource: SRC_NC2,
    specVerifiedOn: SPEC_DATE,
    specNote: 'No price entered. Add an indicative price to include this SKU in cost comparison.'
  },
  'nc2-an64': {
    name: 'Nutanix NC2 on Azure',
    provider: 'Azure NC2',
    nodeModel: 'AN64 (Intel Xeon Platinum 8462Y+)',
    nodeCores: 64,
    nodeRamGB: 1024,
    rawStoragePerNodeTB: 38.4,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 28,
    externalStorageName: 'External NFS / Nutanix Files (confirm support for your design)',
    monthlyPriceEst: 7200,
    specSource: SRC_NC2,
    specVerifiedOn: SPEC_DATE
  },
  'avs-av36p': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV36P (Intel Xeon Gold 6240)',
    nodeCores: 36,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 19.2,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 16,
    externalStorageName: 'Azure NetApp Files, Elastic SAN or Pure Cloud Block Store',
    monthlyPriceEst: 4850,
    specSource: SRC_AVS,
    specVerifiedOn: SPEC_DATE
  },
  'avs-av36': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV36 (Intel Xeon Gold 6140)',
    nodeCores: 36,
    nodeRamGB: 576,
    rawStoragePerNodeTB: 15.2,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 16,
    externalStorageName: 'Azure NetApp Files, Elastic SAN or Pure Cloud Block Store',
    monthlyPriceEst: 4600,
    specSource: SRC_AVS,
    specVerifiedOn: SPEC_DATE
  },
  'avs-av48': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV48 (Intel Xeon Gold 6442Y, vSAN ESA)',
    nodeCores: 48,
    nodeRamGB: 1024,
    rawStoragePerNodeTB: 25.6,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 16,
    externalStorageName: 'Azure NetApp Files, Elastic SAN or Pure Cloud Block Store',
    monthlyPriceEst: 6200,
    specSource: SRC_AVS,
    specVerifiedOn: SPEC_DATE,
    specNote: 'ESA host: RAID-5 overhead is 1.5x below 6 hosts and 1.25x at 6+ hosts, so the 1.33x OSA factor is conservative at 6+ hosts.'
  },
  'avs-av52': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV52 (Intel Xeon Platinum 8270)',
    nodeCores: 52,
    nodeRamGB: 1536,
    rawStoragePerNodeTB: 38.4,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 16,
    externalStorageName: 'Azure NetApp Files, Elastic SAN or Pure Cloud Block Store',
    monthlyPriceEst: 7500,
    specSource: SRC_AVS,
    specVerifiedOn: SPEC_DATE
  },
  'avs-av64': {
    name: 'Azure VMware Solution',
    provider: 'Azure AVS',
    nodeModel: 'AV64 (Intel Xeon Platinum 8370C)',
    nodeCores: 64,
    nodeRamGB: 1024,
    rawStoragePerNodeTB: 15.36,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 16,
    externalStorageName: 'Azure NetApp Files, Elastic SAN or Pure Cloud Block Store',
    monthlyPriceEst: 8400,
    specSource: SRC_AVS,
    specVerifiedOn: SPEC_DATE,
    specNote: 'OSA capacity shown (15.36 TB). Gen 2 / ESA deployments list 19.25 TB. AV64 needs an existing AV36/AV36P/AV48/AV52 private cloud in Gen 1.'
  },
  'vmc-i4i': {
    name: 'VMware Cloud on AWS',
    provider: 'AWS VMC',
    nodeModel: 'i4i.metal (Intel Xeon Ice Lake)',
    nodeCores: 64,
    nodeRamGB: 1024,
    rawStoragePerNodeTB: 22.5,
    hasLocalStorage: true,
    minNodes: 2,
    maxNodesCluster: 16,
    externalStorageName: 'Amazon FSx for NetApp ONTAP',
    monthlyPriceEst: 5400,
    specSource: SRC_VMC,
    specVerifiedOn: SPEC_DATE,
    specNote: '30 TB NVMe per host in total; 7.5 TB is cache. vSAN OSA capacity is 22.5 TB (20.46 TiB); vSAN ESA is about 30 TB (27.28 TiB).'
  },
  'vmc-i3en': {
    name: 'VMware Cloud on AWS',
    provider: 'AWS VMC',
    nodeModel: 'i3en.metal (Storage-Optimized)',
    nodeCores: 48,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 50.0,
    hasLocalStorage: true,
    minNodes: 2,
    maxNodesCluster: 16,
    externalStorageName: 'Amazon FSx for NetApp ONTAP',
    monthlyPriceEst: 6800,
    specSource: SRC_VMC,
    specVerifiedOn: SPEC_DATE,
    specNote: '60 TB NVMe per host in total; about 50 TB (45.84 TiB) is vSAN capacity tier after cache.'
  },
  'vmc-m7i': {
    name: 'VMware Cloud on AWS',
    provider: 'AWS VMC',
    nodeModel: 'm7i.metal-24xl (diskless, Sapphire Rapids)',
    nodeCores: 48,
    nodeRamGB: 384,
    rawStoragePerNodeTB: 0,
    hasLocalStorage: false,
    minNodes: 2,
    maxNodesCluster: 16,
    externalStorageName: 'Amazon FSx for NetApp ONTAP or VMware Cloud Flex Storage (required)',
    monthlyPriceEst: 6100,
    specSource: SRC_VMC,
    specVerifiedOn: SPEC_DATE,
    specNote: 'No local storage. 48 physical cores (96 logical threads). All workload data must sit on external NFS.'
  },
  'gcve-ve1': {
    name: 'Google Cloud VMware Engine',
    provider: 'Google Cloud GCVE',
    nodeModel: 've1-standard-72 (36 cores / 72 vCPU threads)',
    nodeCores: 36,
    nodeRamGB: 768,
    rawStoragePerNodeTB: 19.2,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 32,
    externalStorageName: 'Google Cloud NetApp Volumes (GCNV)',
    monthlyPriceEst: 5100,
    specSource: SRC_GCVE,
    specVerifiedOn: SPEC_DATE,
    specNote: 'Google lists 72 vCPUs per node; a vCPU is a logical thread, so physical cores = 36. Cluster maximum of 32 not re-verified.'
  },
  'gcve-ve2': {
    name: 'Google Cloud VMware Engine',
    provider: 'Google Cloud GCVE',
    nodeModel: 've2-standard-128 (64 cores / 128 vCPU threads)',
    nodeCores: 64,
    nodeRamGB: 2048,
    rawStoragePerNodeTB: 25.5,
    hasLocalStorage: true,
    minNodes: 3,
    maxNodesCluster: 32,
    externalStorageName: 'Google Cloud NetApp Volumes (GCNV)',
    monthlyPriceEst: 8900,
    specSource: SRC_GCVE,
    specVerifiedOn: SPEC_DATE,
    specNote: 'Google lists 128 vCPUs per node (threads), so physical cores = 64. 25.5 TB raw excludes cache; 51.2 TB belongs to ve2-mega. Core count is customisable per node type (64 to 128 vCPUs).'
  }
};

type PolicyFamily = 'vmware' | 'nutanix';
const familyOf = (p: CloudPreset): PolicyFamily => (p.provider === 'Azure NC2' ? 'nutanix' : 'vmware');
const vsanShareFor = (p: CloudPreset, decoupled: boolean, vsanPct: number): number =>
  p.hasLocalStorage ? (decoupled ? vsanPct : 100) : 0;
const monthlyCost = (p: CloudPreset, nodes: number): number =>
  p.monthlyPriceEst == null ? 0 : nodes * p.monthlyPriceEst;

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
  const [includeNPlus1, setIncludeNPlus1] = useState<boolean>(true); // one spare host for HA

  // Storage Allocation Split (vSAN % vs External SAN %)
  const [enableDecoupledStorage, setEnableDecoupledStorage] = useState<boolean>(true);
  const [vsanPercentage, setVsanPercentage] = useState<number>(35); // 35% vSAN, 65% External

  const preset = CLOUD_PRESETS[selectedCloudKey];
  const policyFamilyA = familyOf(preset);
  const selectedPolicy = ENTERPRISE_STORAGE_POLICIES[equivalentPolicyId(storagePolicyId, policyFamilyA)];
  const policyIdA = selectedPolicy.id;

  // Storage Capacity Math
  const effectiveVsanPercent = vsanShareFor(preset, enableDecoupledStorage, vsanPercentage);
  const storageAnalysis = useMemo(() => {
    return calculateStorageCapacity({
      totalUsedStorageTB: totalStorageTB,
      totalProvisionedStorageTB: totalStorageTB * 1.3,
      vsanPercentage: effectiveVsanPercent,
      storagePolicyId: policyIdA,
      slackFactorPercent,
      nodeRawStorageTB: preset.rawStoragePerNodeTB
    });
  }, [totalStorageTB, effectiveVsanPercent, policyIdA, slackFactorPercent, preset.rawStoragePerNodeTB]);

  // Compute and Node Calculations
  const calculations = useMemo(() => {
    const totalRequiredVcpu = vmCount * avgVcpu;
    const effectiveCoresNeeded = totalRequiredVcpu / vCpuOvercommit;
    const computeNodesNeeded = Math.ceil(effectiveCoresNeeded / preset.nodeCores);
    const haSpare = includeNPlus1 ? 1 : 0;

    const totalRawRam = vmCount * avgRamGB;
    const totalRamWithBuffer = totalRawRam * (1 + ramBufferPercent / 100);
    const memoryNodesNeeded = Math.ceil(totalRamWithBuffer / preset.nodeRamGB);

    // Pure vSAN Sizing (if 100% of storage resided on local vSAN)
    const pureStorage = calculateStorageCapacity({
      totalUsedStorageTB: totalStorageTB,
      totalProvisionedStorageTB: totalStorageTB * 1.3,
      vsanPercentage: preset.hasLocalStorage ? 100 : 0,
      storagePolicyId: policyIdA,
      slackFactorPercent,
      nodeRawStorageTB: preset.rawStoragePerNodeTB
    });
    const vsanNodesNeededPure = pureStorage.vsanStorageNodesRequired;
    const nodesWithoutDecoupled = Math.max(preset.minNodes, computeNodesNeeded + haSpare, memoryNodesNeeded + haSpare, vsanNodesNeededPure);

    // With Decoupled External Storage
    const vsanNodesNeededDecoupled = storageAnalysis.vsanStorageNodesRequired;
    const nodesWithDecoupled = Math.max(preset.minNodes, computeNodesNeeded + haSpare, memoryNodesNeeded + haSpare, vsanNodesNeededDecoupled);

    const nodeReduction = Math.max(0, nodesWithoutDecoupled - nodesWithDecoupled);
    const percentReduction = nodesWithoutDecoupled > 0 ? Math.round((nodeReduction / nodesWithoutDecoupled) * 100) : 0;

    // Identify Limiting Resource
    let limitingResource = 'Compute (vCPU Cores)';
    if (nodesWithDecoupled === preset.minNodes && computeNodesNeeded + haSpare < preset.minNodes && memoryNodesNeeded + haSpare < preset.minNodes && vsanNodesNeededDecoupled < preset.minNodes) {
      limitingResource = `Platform minimum (${preset.minNodes} hosts)`;
    } else if (memoryNodesNeeded >= computeNodesNeeded && memoryNodesNeeded >= vsanNodesNeededDecoupled) {
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
      limitingResource,
      haSpare,
      exceedsClusterLimit: nodesWithDecoupled > preset.maxNodesCluster
    };
  }, [
    includeNPlus1,
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
  const selectedPolicyB = ENTERPRISE_STORAGE_POLICIES[equivalentPolicyId(storagePolicyId, familyOf(presetB))];
  const effectiveVsanPercentB = vsanShareFor(presetB, enableDecoupledStorage, vsanPercentage);
  const cloudBStorageAnalysis = useMemo(() => {
    return calculateStorageCapacity({
      totalUsedStorageTB: totalStorageTB,
      totalProvisionedStorageTB: totalStorageTB * 1.3,
      vsanPercentage: effectiveVsanPercentB,
      storagePolicyId: selectedPolicyB.id,
      slackFactorPercent,
      nodeRawStorageTB: presetB.rawStoragePerNodeTB
    });
  }, [totalStorageTB, effectiveVsanPercentB, selectedPolicyB.id, slackFactorPercent, presetB.rawStoragePerNodeTB]);

  const cloudBCalculations = useMemo(() => {
    const totalRequiredVcpu = vmCount * avgVcpu;
    const effectiveCoresNeeded = totalRequiredVcpu / vCpuOvercommit;
    const computeNodesNeeded = Math.ceil(effectiveCoresNeeded / presetB.nodeCores);

    const totalRawRam = vmCount * avgRamGB;
    const totalRamWithBuffer = totalRawRam * (1 + ramBufferPercent / 100);
    const memoryNodesNeeded = Math.ceil(totalRamWithBuffer / presetB.nodeRamGB);

    const vsanNodesNeededDecoupled = cloudBStorageAnalysis.vsanStorageNodesRequired;
    const haSpare = includeNPlus1 ? 1 : 0;
    const nodesWithDecoupled = Math.max(presetB.minNodes, computeNodesNeeded + haSpare, memoryNodesNeeded + haSpare, vsanNodesNeededDecoupled);

    return {
      computeNodesNeeded,
      memoryNodesNeeded,
      vsanNodesNeededDecoupled,
      nodesWithDecoupled,
      exceedsClusterLimit: nodesWithDecoupled > presetB.maxNodesCluster
    };
  }, [vmCount, avgVcpu, avgRamGB, vCpuOvercommit, ramBufferPercent, includeNPlus1, presetB, cloudBStorageAnalysis]);

  const savingsComparisonText = useMemo(() => {
    const costA = monthlyCost(preset, calculations.nodesWithDecoupled);
    const costB = monthlyCost(presetB, cloudBCalculations.nodesWithDecoupled);
    if (preset.monthlyPriceEst == null || presetB.monthlyPriceEst == null) {
      return 'Cost comparison unavailable: no indicative price entered for one of the selected SKUs';
    }
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
    const costA = monthlyCost(preset, calculations.nodesWithDecoupled);
    const costB = monthlyCost(presetB, cloudBCalculations.nodesWithDecoupled);
    exportDualCloudComparisonExcel({
      projectName: 'Hyperscaler Multi-Cloud Architecture Evaluation',
      architectName: 'Wasim Sayyed, Principal Cloud Architect',
      pricingNote: PRICING_META.notice,
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
            {(['nc2-an36', 'nc2-an36p', 'nc2-an64'] as const).map(k => (
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
                <div className="text-[9px] text-slate-500 mt-0.5">{CLOUD_PRESETS[k].nodeCores} Cores · {CLOUD_PRESETS[k].nodeRamGB} GiB · {CLOUD_PRESETS[k].rawStoragePerNodeTB} TB capacity tier</div>
              </button>
            ))}
          </div>
        </div>

        {/* AVS */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase">Azure VMware Solution (AVS)</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(['avs-av36p', 'avs-av36', 'avs-av48', 'avs-av52', 'avs-av64'] as const).map(k => (
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
                <div className="text-[9px] text-slate-500 mt-0.5">{CLOUD_PRESETS[k].nodeCores} Cores · {CLOUD_PRESETS[k].nodeRamGB} GiB · {CLOUD_PRESETS[k].hasLocalStorage ? `${CLOUD_PRESETS[k].rawStoragePerNodeTB} TB capacity tier` : 'no local storage'}</div>
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
                <div className="text-[9px] text-slate-500 mt-0.5">{CLOUD_PRESETS[k].nodeCores} Cores · {CLOUD_PRESETS[k].nodeRamGB} GiB · {CLOUD_PRESETS[k].hasLocalStorage ? `${CLOUD_PRESETS[k].rawStoragePerNodeTB} TB capacity tier` : 'no local storage'}</div>
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
              Benchmark Nutanix NC2 vs Azure AVS / AWS VMC with side-by-side host-count and indicative-cost charts and color-coded Excel export. {PRICING_META.notice}
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
                    {item.name} - {item.nodeModel} ({item.monthlyPriceEst != null ? `$${item.monthlyPriceEst.toLocaleString()}/mo` : 'price not set'})
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
                    ${(monthlyCost(CLOUD_PRESETS[selectedCloudKey], calculations.nodesWithDecoupled)).toLocaleString()}
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
                  <span>36-Month Indicative Cost (hosts only):</span>
                  <span className="text-emerald-400 font-bold">
                    ${(monthlyCost(CLOUD_PRESETS[selectedCloudKey], calculations.nodesWithDecoupled) * 36).toLocaleString()}
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
                    ${(monthlyCost(CLOUD_PRESETS[compareCloudKey], cloudBCalculations.nodesWithDecoupled)).toLocaleString()}
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
                  <span>36-Month Indicative Cost (hosts only):</span>
                  <span className="text-emerald-400 font-bold">
                    ${(monthlyCost(CLOUD_PRESETS[compareCloudKey], cloudBCalculations.nodesWithDecoupled) * 36).toLocaleString()}
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
                    ${(monthlyCost(CLOUD_PRESETS[selectedCloudKey], calculations.nodesWithDecoupled)).toLocaleString()} vs ${(monthlyCost(CLOUD_PRESETS[compareCloudKey], cloudBCalculations.nodesWithDecoupled)).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-5 rounded-lg bg-slate-900 flex overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 font-mono transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        ((monthlyCost(CLOUD_PRESETS[selectedCloudKey], calculations.nodesWithDecoupled)) /
                          Math.max(1, (monthlyCost(CLOUD_PRESETS[selectedCloudKey], calculations.nodesWithDecoupled)) + (monthlyCost(CLOUD_PRESETS[compareCloudKey], cloudBCalculations.nodesWithDecoupled)))) * 100
                      )}%`
                    }}
                  >
                    Cloud A
                  </div>
                  <div
                    className="bg-indigo-500 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        ((monthlyCost(CLOUD_PRESETS[compareCloudKey], cloudBCalculations.nodesWithDecoupled)) /
                          Math.max(1, (monthlyCost(CLOUD_PRESETS[selectedCloudKey], calculations.nodesWithDecoupled)) + (monthlyCost(CLOUD_PRESETS[compareCloudKey], cloudBCalculations.nodesWithDecoupled)))) * 100
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
                  setIncludeNPlus1(true);
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
                  <option value={15}>15% Buffer (hypervisor, management & growth)</option>
                  <option value={20}>20% Buffer (extra growth headroom)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">
                  {calculations.totalRamGB} GiB allocated expands to {calculations.totalRamWithBuffer} GiB
                </span>
              </div>
            </div>

            <label className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNPlus1}
                onChange={e => setIncludeNPlus1(e.target.checked)}
                className="mt-0.5 accent-cyan-400"
              />
              <span>
                <span className="font-bold text-white">Reserve one spare host (N+1 HA)</span>
                {' '}Microsoft configures every AVS cluster for n+1 availability, so one host of compute and memory is held back for failover. Applied to the compute and memory sizing.
              </span>
            </label>

            {/* Storage Policy Dropdown & Slack Factor Selector */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Enterprise Storage Policy & Parity Multiplier</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">
                  Overhead Factor: {selectedPolicy.id === 'nutanix_rf2_ecx' ? '1.25x to 1.50x (by node count)' : `${selectedPolicy.overheadMultiplier.toFixed(2)}x`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Storage Policy Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Storage Policy (RAID/FTT)</label>
                  <select
                    value={policyIdA}
                    onChange={e => setStoragePolicyId(e.target.value as StoragePolicyId)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-xs font-mono text-white cursor-pointer"
                  >
                    {policiesForFamily(policyFamilyA).map(id => (
                      <option key={id} value={id}>{ENTERPRISE_STORAGE_POLICIES[id].shortLabel}</option>
                    ))}
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
                    <option value={20}>20% Slack (below Microsoft AVS 25% guidance)</option>
                    <option value={25}>25% Slack (matches AVS 75% capacity limit)</option>
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
                    {preset.hasLocalStorage ? <>Distribute total used storage between high-performance local vSAN and External NFS ({preset.externalStorageName}).</> : <>This host has no local storage, so 100% of workload data is placed on external storage ({preset.externalStorageName}).</>}
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
                    <span className="text-cyan-300">Local vSAN: {effectiveVsanPercent}% ({storageAnalysis.vsanUsedDataTB} TB)</span>
                    <span className="text-emerald-300">External SAN: {100 - effectiveVsanPercent}% ({storageAnalysis.externalUsedStorageTB} TB)</span>
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

            {calculations.exceedsClusterLimit && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {calculations.nodesWithDecoupled} hosts exceeds the {preset.maxNodesCluster}-host cluster limit for {preset.name}. Split the design across multiple clusters; per-cluster management and HA overhead then applies to each one.
                </span>
              </div>
            )}
            {preset.specNote && (
              <div className="text-[10px] text-slate-500">
                Spec note ({preset.nodeModel.split(' (')[0]}): {preset.specNote} Specs checked against vendor documentation on {preset.specVerifiedOn}.
              </div>
            )}

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
