import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Info,
  RotateCcw,
  Layers,
  AlertTriangle,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
  HardDrive,
  Cpu,
  Plus,
  X,
  Check,
  ExternalLink
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

  // ---- UI-only derived values (display helpers; no sizing or pricing logic lives here) ----
  const monthlyA = monthlyCost(preset, calculations.nodesWithDecoupled);
  const monthlyB = monthlyCost(presetB, cloudBCalculations.nodesWithDecoupled);
  const bothPriced = preset.monthlyPriceEst != null && presetB.monthlyPriceEst != null;
  const cheaper: 'A' | 'B' | 'tie' | null = !bothPriced ? null : monthlyA < monthlyB ? 'A' : monthlyB < monthlyA ? 'B' : 'tie';
  const fewerHosts: 'A' | 'B' | 'tie' =
    calculations.nodesWithDecoupled < cloudBCalculations.nodesWithDecoupled
      ? 'A'
      : calculations.nodesWithDecoupled > cloudBCalculations.nodesWithDecoupled
      ? 'B'
      : 'tie';
  const limitKey = calculations.limitingResource.startsWith('Compute')
    ? 'compute'
    : calculations.limitingResource.startsWith('Memory')
    ? 'memory'
    : calculations.limitingResource.startsWith('Storage')
    ? 'storage'
    : 'minimum';
  const maxDimension = Math.max(
    1,
    calculations.computeNodesNeeded,
    calculations.memoryNodesNeeded,
    calculations.vsanNodesNeededPure,
    calculations.vsanNodesNeededDecoupled
  );
  const dimensionRows = [
    { key: 'compute', label: 'Compute Bound (vCPU Cores)', value: calculations.computeNodesNeeded, bar: 'bg-cyan-400' },
    { key: 'memory', label: 'Memory Bound (RAM Buffered)', value: calculations.memoryNodesNeeded, bar: 'bg-indigo-400' },
    { key: 'pure', label: 'Pure vSAN Storage (No NFS)', value: calculations.vsanNodesNeededPure, bar: 'bg-rose-400' },
    { key: 'storage', label: 'Decoupled vSAN Storage (Remaining)', value: calculations.vsanNodesNeededDecoupled, bar: 'bg-emerald-400' }
  ];
  const resetInputs = () => {
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
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pb-16">
      {/* ───────────── Header ───────────── */}
      <header className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/tools" className="hover:text-cyan-400 transition-colors">Engineering Workbench</Link>
          <span aria-hidden="true">/</span>
          <span className="text-cyan-300">Node Sizing & Decoupled Storage Estimator</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Zero-Cost Technical Architecture
          </span>
          <span className="text-xs text-slate-400">Enterprise Hyperscaler Sizing Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Multi-Cloud Node & Usable Storage Policy Estimator
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          Compute true bare-metal host density across AVS, AWS VMC, and GCVE. Size net usable capacity with enterprise RAID/FTT policies, 25% slack factor, and decoupled external NFS datastores.
        </p>
      </header>

      {/* ───────────── Mobile live summary (desktop uses the sticky result panel) ───────────── */}
      <div
        className="lg:hidden sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-slate-950/90 backdrop-blur border-y border-slate-800 flex items-center justify-between gap-3"
        aria-live="polite"
      >
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
            Cloud A · {shortModel(preset)}
          </div>
          <div className="text-sm text-white">
            <span className="font-mono text-xl font-black text-cyan-300">{calculations.nodesWithDecoupled}</span>{' '}
            <span className="text-slate-300">hosts</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Est. monthly</div>
          <div className="text-sm font-mono font-bold text-white">
            {preset.monthlyPriceEst == null ? 'Price not set' : `$${monthlyA.toLocaleString()}`}
          </div>
        </div>
        <button
          type="button"
          onClick={handleExportToGenerator}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
        >
          <span>Blueprint</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ───────────── Workbench: inputs (left) + live result (right) ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ===== Inputs ===== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: platform */}
          <StepCard
            step={1}
            title="Choose platform & host type"
            description="Pick your baseline (Cloud A). Add a second platform to compare cost and host count side by side."
          >
            <PlatformStep
              cloudAKey={selectedCloudKey}
              cloudBKey={compareCloudKey}
              compareOn={showCompareMode}
              onChangeA={setSelectedCloudKey}
              onChangeB={setCompareCloudKey}
              onCompareChange={setShowCompareMode}
            />
          </StepCard>

          {/* Step 2: workload */}
          <StepCard
            step={2}
            title="Describe the workload"
            description="Type an exact value or drag the slider. The result updates as you change anything."
            action={
              <button
                type="button"
                onClick={resetInputs}
                className="shrink-0 text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer rounded px-1.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset inputs</span>
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SliderField
                label="Total Workload VMs"
                unit="VMs"
                value={vmCount}
                min={20}
                max={2000}
                step={10}
                onChange={setVmCount}
                ticks={['20', '500', '1000', '2000']}
              />
              <SliderField
                label="Aggregate Workload Data Footprint"
                unit="TB"
                value={totalStorageTB}
                min={10}
                max={800}
                step={5}
                onChange={setTotalStorageTB}
                ticks={['10', '200', '400', '800']}
              />
              <SliderField
                label="Avg vCPU per VM"
                unit="vCPUs"
                value={avgVcpu}
                min={1}
                max={16}
                step={1}
                onChange={setAvgVcpu}
                ticks={['1', '8', '16']}
              />
              <SliderField
                label="Avg RAM per VM"
                unit="GB"
                value={avgRamGB}
                min={4}
                max={64}
                step={2}
                onChange={setAvgRamGB}
                ticks={['4', '32', '64']}
              />
            </div>
          </StepCard>

          {/* Step 3: assumptions & storage */}
          <StepCard
            step={3}
            title="Sizing assumptions & storage"
            description="Defaults follow common enterprise guidance. Change them only if your design differs."
          >
            <div className="space-y-6">
              {/* Compute & memory */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Compute & memory</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold text-slate-200">vCPU Overcommit Ratio</span>
                      <span className="font-mono font-bold text-cyan-300">{vCpuOvercommit}:1</span>
                    </div>
                    <Segmented
                      label="vCPU overcommit ratio"
                      value={vCpuOvercommit}
                      onChange={setVCpuOvercommit}
                      options={[
                        { value: 1.0, label: '1:1', desc: '1:1 Ratio (Dedicated 1:1 Cores - Tier 0 DBs)' },
                        { value: 2.0, label: '2:1', desc: '2:1 Ratio (Balanced Enterprise Production)' },
                        { value: 3.0, label: '3:1', desc: '3:1 Ratio (Standard Production & Middleware)' },
                        { value: 4.0, label: '4:1', desc: '4:1 Ratio (Aggressive Non-Prod & Dev Density)' }
                      ]}
                    />
                    <p className="text-[11px] text-slate-500">
                      {calculations.totalRequiredVcpu} vCPUs requires {calculations.effectiveCoresNeeded} physical cores
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold text-slate-200">RAM Overhead Buffer</span>
                      <span className="font-mono font-bold text-indigo-300">+{ramBufferPercent}%</span>
                    </div>
                    <Segmented
                      label="RAM overhead buffer"
                      value={ramBufferPercent}
                      onChange={setRamBufferPercent}
                      options={[
                        { value: 10, label: '10%', desc: '10% Buffer (Hypervisor Baseline)' },
                        { value: 15, label: '15%', desc: '15% Buffer (hypervisor, management & growth)' },
                        { value: 20, label: '20%', desc: '20% Buffer (extra growth headroom)' }
                      ]}
                    />
                    <p className="text-[11px] text-slate-500">
                      {calculations.totalRamGB} GiB allocated expands to {calculations.totalRamWithBuffer} GiB
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <div className="font-bold text-white">Reserve one spare host (N+1 HA)</div>
                    Microsoft configures every AVS cluster for n+1 availability, so one host of compute and memory is held back for failover. Applied to the compute and memory sizing.
                  </div>
                  <Switch checked={includeNPlus1} onChange={setIncludeNPlus1} label="Reserve one spare host (N+1 HA)" />
                </div>
              </div>

              {/* Storage */}
              <div className="space-y-4 pt-5 border-t border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enterprise storage policy & parity multiplier</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Overhead Factor: {selectedPolicy.id === 'nutanix_rf2_ecx' ? '1.25x to 1.50x (by node count)' : `${selectedPolicy.overheadMultiplier.toFixed(2)}x`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="storage-policy" className="text-xs font-semibold text-slate-200 block">
                      Storage Policy (RAID/FTT)
                    </label>
                    <select
                      id="storage-policy"
                      value={policyIdA}
                      onChange={e => setStoragePolicyId(e.target.value as StoragePolicyId)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-mono text-white cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                    >
                      {policiesForFamily(policyFamilyA).map(id => (
                        <option key={id} value={id}>{ENTERPRISE_STORAGE_POLICIES[id].shortLabel}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {selectedPolicy.description} (Min {selectedPolicy.minHosts} hosts).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold text-slate-200">vSAN Operational Slack Factor</span>
                      <span className="font-mono font-bold text-cyan-300">{slackFactorPercent}%</span>
                    </div>
                    <Segmented
                      label="vSAN operational slack factor"
                      value={slackFactorPercent}
                      onChange={setSlackFactorPercent}
                      options={[
                        { value: 20, label: '20%', desc: '20% Slack (below Microsoft AVS 25% guidance)' },
                        { value: 25, label: '25%', desc: '25% Slack (matches AVS 75% capacity limit)' },
                        { value: 30, label: '30%', desc: '30% Slack (High Snapshot / Resync Headroom)' }
                      ]}
                    />
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Reserves {slackFactorPercent}% raw headroom for maintenance mode evacuations and snapshot merges.
                    </p>
                  </div>
                </div>

                {/* Storage tier split */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-cyan-400" />
                        <span>Storage Tier Allocation Split</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {preset.hasLocalStorage ? (
                          <>Distribute total used storage between high-performance local vSAN and External NFS ({preset.externalStorageName}).</>
                        ) : (
                          <>This host has no local storage, so 100% of workload data is placed on external storage ({preset.externalStorageName}).</>
                        )}
                      </p>
                    </div>
                    {preset.hasLocalStorage && (
                      <Switch
                        checked={enableDecoupledStorage}
                        onChange={setEnableDecoupledStorage}
                        label="Decouple storage to external NFS"
                      />
                    )}
                  </div>

                  {preset.hasLocalStorage && enableDecoupledStorage ? (
                    <div className="space-y-3 pt-3 border-t border-cyan-500/20">
                      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs font-mono">
                        <span className="text-cyan-300 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-cyan-400" />
                          Local vSAN: {effectiveVsanPercent}% ({storageAnalysis.vsanUsedDataTB} TB)
                        </span>
                        <span className="text-emerald-300 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          External SAN: {100 - effectiveVsanPercent}% ({storageAnalysis.externalUsedStorageTB} TB)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-800" aria-hidden="true">
                        <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${effectiveVsanPercent}%` }} />
                        <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${100 - effectiveVsanPercent}%` }} />
                      </div>
                      <RangeInput
                        ariaLabel="Share of data kept on local vSAN"
                        value={vsanPercentage}
                        min={10}
                        max={90}
                        step={5}
                        onChange={setVsanPercentage}
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>10% vSAN (Maximum NFS Offload)</span>
                        <span>50% Balanced</span>
                        <span>90% vSAN Heavy</span>
                      </div>
                    </div>
                  ) : preset.hasLocalStorage ? (
                    <div className="text-xs text-slate-400 pt-3 border-t border-slate-800">
                      Decoupled storage disabled. 100% of workload data ({totalStorageTB} TB) is mapped to local cluster vSAN.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </StepCard>
        </div>

        {/* ===== Live result (sticky on desktop) ===== */}
        <aside id="result" aria-label="Live sizing result" className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl lg:max-h-[calc(100vh-7rem)] overflow-y-auto">
            {/* Headline */}
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Sizing Outcome & Host Footprint
                  </div>
                  <div className="text-sm text-slate-300 mt-1 truncate">
                    {preset.name} · <span className="font-mono text-slate-200">{shortModel(preset)}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[11px] px-2.5 py-0.5 rounded-full border font-mono ${
                    includeNPlus1
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                      : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  {includeNPlus1 ? 'N+1 HA Resilient' : 'No HA spare'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3" aria-live="polite">
                <div className="rounded-xl bg-cyan-950/40 border border-cyan-500/40 p-4">
                  <div className="text-[11px] font-mono text-cyan-300">Cluster hosts required</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-5xl font-black text-cyan-300 font-mono leading-none">{calculations.nodesWithDecoupled}</span>
                    <span className="text-xs text-slate-400">hosts</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${calculations.exceedsClusterLimit ? 'bg-amber-400' : 'bg-cyan-400'}`}
                      style={{ width: `${Math.min(100, (calculations.nodesWithDecoupled / preset.maxNodesCluster) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 font-mono">max {preset.maxNodesCluster} per cluster</div>
                </div>
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
                  <div className="text-[11px] font-mono text-slate-400">Est. monthly (hosts)</div>
                  {preset.monthlyPriceEst == null ? (
                    <div className="mt-2 text-sm font-semibold text-amber-300 leading-snug">Price not set for this SKU</div>
                  ) : (
                    <div className="mt-1 text-2xl font-black text-white font-mono leading-tight">${monthlyA.toLocaleString()}</div>
                  )}
                  <div className="mt-2 text-[10px] text-slate-500 leading-snug">Indicative, hosts only. See pricing basis below.</div>
                </div>
              </div>

              {/* Pure vs decoupled */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs">
                <div className="text-center">
                  <div className="text-[10px] font-mono text-slate-400">Traditional Pure vSAN</div>
                  <div className="text-xl font-black font-mono text-rose-400">{calculations.nodesWithoutDecoupled}</div>
                  <div className="text-[10px] text-slate-500">Nodes (Storage Bound)</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
                <div className="text-center">
                  <div className="text-[10px] font-mono text-cyan-300">With Decoupled Storage</div>
                  <div className="text-xl font-black font-mono text-cyan-300">{calculations.nodesWithDecoupled}</div>
                  <div className="text-[10px] text-cyan-400 font-semibold">
                    {calculations.nodeReduction > 0 ? `-${calculations.nodeReduction} Nodes (-${calculations.percentReduction}%)` : 'Optimized'}
                  </div>
                </div>
              </div>

              {calculations.exceedsClusterLimit && (
                <div role="alert" className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {calculations.nodesWithDecoupled} hosts exceeds the {preset.maxNodesCluster}-host cluster limit for {preset.name}. Split the design across multiple clusters; per-cluster management and HA overhead then applies to each one.
                  </span>
                </div>
              )}

              {/* What drives the host count */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Host Requirements by Dimension</span>
                  <span className="text-[11px]">
                    <span className="text-slate-400">Limiting: </span>
                    <span className="font-bold text-amber-300 font-mono">{calculations.limitingResource}</span>
                  </span>
                </div>
                <ul className="space-y-2">
                  {dimensionRows.map(row => {
                    const isLimit = row.key === limitKey;
                    return (
                      <li key={row.key} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className={isLimit ? 'text-amber-200 font-bold' : 'text-slate-300'}>
                            {row.label}
                            {isLimit && <span className="ml-1.5 text-[9px] uppercase text-amber-300">limiting</span>}
                          </span>
                          <span className={isLimit ? 'text-amber-200 font-bold' : 'text-slate-200'}>{row.value} hosts</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${row.bar} ${isLimit ? '' : 'opacity-60'}`}
                            style={{ width: `${Math.max(3, (row.value / maxDimension) * 100)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {calculations.haSpare > 0 && (
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Compute and memory rows exclude the N+1 spare; one extra host is added to each when the final count is taken.
                  </p>
                )}
              </div>
            </div>

            {/* Storage breakdown */}
            <details open className="group border-t border-slate-800">
              <summary className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 cursor-pointer list-none text-xs font-semibold text-slate-200 hover:text-white">
                <span>Net Usable Capacity & Parity Breakdown</span>
                <span className="text-[10px] font-mono text-cyan-400">{selectedPolicy.shortLabel}</span>
              </summary>
              <div className="px-5 sm:px-6 pb-5 space-y-2 text-xs font-mono">
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
                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                  <span>Raw vSAN Capacity Required:</span>
                  <span className="text-cyan-300 font-bold">{storageAnalysis.vsanRawRequiredTB} TB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>External SAN Capacity Provisioned:</span>
                  <span className="text-emerald-300 font-bold">{storageAnalysis.externalProvisionedTB} TB</span>
                </div>
              </div>
            </details>

            {/* Spec note + CTAs */}
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 space-y-4 border-t border-slate-800">
              {preset.specNote && (
                <p className="pt-4 text-[11px] text-slate-500 leading-snug">
                  Spec note ({preset.nodeModel.split(' (')[0]}): {preset.specNote} Specs checked against vendor documentation on {preset.specVerifiedOn}.
                </p>
              )}
              <a
                href={preset.specSource}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <span>Vendor spec source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleExportToGenerator}
                  className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                >
                  <span>Apply Sizing to Hybrid Blueprint Generator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#compare"
                  className="w-full py-2.5 rounded-lg border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <GitCompare className="w-4 h-4 text-cyan-400" />
                  <span>{showCompareMode ? 'Jump to cloud comparison' : 'Compare with another platform'}</span>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ───────────── Side-by-side comparison ───────────── */}
      <section
        id="compare"
        aria-labelledby="compare-title"
        className="scroll-mt-24 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Side-by-Side Benchmark & TCO Analysis
              </div>
              <h2 id="compare-title" className="text-lg font-bold text-white leading-snug">
                {showCompareMode ? (
                  <>
                    <span className="text-cyan-300">{preset.name} {shortModel(preset)}</span>
                    <span className="text-slate-500 font-normal"> vs </span>
                    <span className="text-indigo-300">{presetB.name} {shortModel(presetB)}</span>
                  </>
                ) : (
                  'Compare two platforms on the same workload'
                )}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {showCompareMode ? (
              <button
                type="button"
                onClick={() => setShowCompareMode(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Hide comparison</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCompareMode(true)}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Show Side-by-Side Comparison</span>
              </button>
            )}
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

        {showCompareMode && (
          <>
            {/* Verdict */}
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 px-4 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              <span className="text-sm font-bold text-emerald-300">{savingsComparisonText}</span>
              <span className="text-xs font-mono text-slate-300">
                {fewerHosts === 'A'
                  ? `Cloud A requires ${cloudBCalculations.nodesWithDecoupled - calculations.nodesWithDecoupled} fewer hosts`
                  : fewerHosts === 'B'
                  ? `Cloud B requires ${calculations.nodesWithDecoupled - cloudBCalculations.nodesWithDecoupled} fewer hosts`
                  : 'Identical host count'}
              </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CloudCompareCard
                slot="A"
                badge="Primary Baseline (Cloud A)"
                preset={preset}
                nodes={calculations.nodesWithDecoupled}
                monthly={monthlyA}
                exceeds={calculations.exceedsClusterLimit}
                isBest={cheaper === 'A'}
                accent="cyan"
              />
              <CloudCompareCard
                slot="B"
                badge="Comparator Target (Cloud B)"
                preset={presetB}
                nodes={cloudBCalculations.nodesWithDecoupled}
                monthly={monthlyB}
                exceeds={cloudBCalculations.exceedsClusterLimit}
                isBest={cheaper === 'B'}
                accent="indigo"
              />
            </div>

            {/* Visual spectrum */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Visual TCO Cost Difference Spectrum</span>
              </div>

              <CompareBars
                title="Monthly Opex"
                unavailable={!bothPriced}
                unavailableText="Add a price for both SKUs to chart monthly cost"
                a={{ value: monthlyA, label: `$${monthlyA.toLocaleString()}` }}
                b={{ value: monthlyB, label: `$${monthlyB.toLocaleString()}` }}
              />
              <CompareBars
                title="Cluster Host Count"
                a={{ value: calculations.nodesWithDecoupled, label: `${calculations.nodesWithDecoupled} hosts` }}
                b={{ value: cloudBCalculations.nodesWithDecoupled, label: `${cloudBCalculations.nodesWithDecoupled} hosts` }}
              />
            </div>
          </>
        )}

        <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{PRICING_META.notice}</span>
        </p>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Presentation-only building blocks. Nothing below performs sizing, storage
 * or pricing maths: every number is passed in already calculated.
 * ═══════════════════════════════════════════════════════════════════════════ */

type Tone = 'cyan' | 'emerald' | 'blue' | 'amber';

interface ProviderGroup {
  id: string;
  label: string;
  short: string;
  tone: Tone;
  keys: string[];
}

const PROVIDER_GROUPS: ProviderGroup[] = [
  { id: 'avs', label: 'Azure VMware Solution (AVS)', short: 'AVS', tone: 'cyan', keys: ['avs-av36p', 'avs-av36', 'avs-av48', 'avs-av52', 'avs-av64'] },
  { id: 'nc2', label: 'Nutanix NC2 on Azure (bare-metal)', short: 'NC2', tone: 'emerald', keys: ['nc2-an36', 'nc2-an36p', 'nc2-an64'] },
  { id: 'gcve', label: 'Google Cloud VMware Engine (GCVE)', short: 'GCVE', tone: 'blue', keys: ['gcve-ve1', 'gcve-ve2'] },
  { id: 'vmc', label: 'VMware Cloud on AWS (VMC)', short: 'VMC', tone: 'amber', keys: ['vmc-i4i', 'vmc-i3en', 'vmc-m7i'] }
];

const TONE: Record<Tone, { dot: string; tabActive: string; cardActive: string; check: string }> = {
  cyan: { dot: 'bg-cyan-400', tabActive: 'border-cyan-400/60 bg-cyan-500/10 text-cyan-200', cardActive: 'border-cyan-400 bg-cyan-500/10', check: 'text-cyan-300' },
  emerald: { dot: 'bg-emerald-400', tabActive: 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200', cardActive: 'border-emerald-400 bg-emerald-500/10', check: 'text-emerald-300' },
  blue: { dot: 'bg-blue-400', tabActive: 'border-blue-400/60 bg-blue-500/10 text-blue-200', cardActive: 'border-blue-400 bg-blue-500/10', check: 'text-blue-300' },
  amber: { dot: 'bg-amber-400', tabActive: 'border-amber-400/60 bg-amber-500/10 text-amber-200', cardActive: 'border-amber-400 bg-amber-500/10', check: 'text-amber-300' }
};

const groupOfKey = (key: string): ProviderGroup =>
  PROVIDER_GROUPS.find(g => g.keys.includes(key)) ?? PROVIDER_GROUPS[0];
const shortModel = (p: CloudPreset): string => p.nodeModel.split(' (')[0];
const modelDetail = (p: CloudPreset): string => {
  const i = p.nodeModel.indexOf(' (');
  return i === -1 ? '' : p.nodeModel.slice(i + 2).replace(/\)$/, '');
};
const specLine = (p: CloudPreset): string =>
  `${p.nodeCores} cores · ${p.nodeRamGB} GiB · ${p.hasLocalStorage ? `${p.rawStoragePerNodeTB} TB` : 'no local storage'}`;
const priceLine = (p: CloudPreset): string =>
  p.monthlyPriceEst != null ? `$${p.monthlyPriceEst.toLocaleString()}/host/mo` : 'No price set';

/* ───────── Step container ───────── */
const StepCard: React.FC<{
  step: number;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ step, title, description, action, children }) => (
  <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300">
          {step}
        </span>
        <div>
          <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

/* ───────── Step 1: pick Cloud A / Cloud B ───────── */
const PlatformStep: React.FC<{
  cloudAKey: string;
  cloudBKey: string;
  compareOn: boolean;
  onChangeA: (key: string) => void;
  onChangeB: (key: string) => void;
  onCompareChange: (on: boolean) => void;
}> = ({ cloudAKey, cloudBKey, compareOn, onChangeA, onChangeB, onCompareChange }) => {
  const [slot, setSlot] = useState<'A' | 'B'>('A');
  const [groupA, setGroupA] = useState<string>(groupOfKey(cloudAKey).id);
  const [groupB, setGroupB] = useState<string>(groupOfKey(cloudBKey).id);

  const activeSlot: 'A' | 'B' = compareOn ? slot : 'A';
  const presetA = CLOUD_PRESETS[cloudAKey];
  const presetB = CLOUD_PRESETS[cloudBKey];

  const tileBase = 'relative rounded-xl border p-3 transition-colors';
  const tileA = activeSlot === 'A' ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700';
  const tileB = activeSlot === 'B' ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700';

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Platform slot" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={`${tileBase} ${tileA}`}>
          <button
            type="button"
            role="tab"
            aria-selected={activeSlot === 'A'}
            onClick={() => setSlot('A')}
            className="w-full text-left cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          >
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">Cloud A · Baseline</div>
            <div className="mt-1 text-sm font-bold text-white">{presetA.name}</div>
            <div className="font-mono text-xs text-cyan-200">{shortModel(presetA)}</div>
            <div className="mt-1 text-[11px] text-slate-400">{specLine(presetA)}</div>
          </button>
        </div>

        {compareOn ? (
          <div className={`${tileBase} ${tileB}`}>
            <button
              type="button"
              role="tab"
              aria-selected={activeSlot === 'B'}
              onClick={() => setSlot('B')}
              className="w-full text-left cursor-pointer rounded pr-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300"
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">Cloud B · Comparator</div>
              <div className="mt-1 text-sm font-bold text-white">{presetB.name}</div>
              <div className="font-mono text-xs text-indigo-200">{shortModel(presetB)}</div>
              <div className="mt-1 text-[11px] text-slate-400">{specLine(presetB)}</div>
            </button>
            <button
              type="button"
              onClick={() => {
                onCompareChange(false);
                setSlot('A');
              }}
              aria-label="Remove Cloud B comparison"
              title="Remove comparison"
              className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onCompareChange(true);
              setSlot('B');
            }}
            className="rounded-xl border border-dashed border-slate-700 hover:border-indigo-400/70 hover:bg-indigo-500/5 p-3 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-200 transition-colors cursor-pointer min-h-[92px]"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-semibold">Compare with another platform</span>
            <span className="text-[11px] text-slate-500">Add Cloud B for cost and host-count benchmarking</span>
          </button>
        )}
      </div>

      <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-4 space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          {activeSlot === 'A' ? 'Select Cloud A host type' : 'Select Cloud B host type'}
        </div>
        {activeSlot === 'A' ? (
          <SkuPicker value={cloudAKey} groupId={groupA} onGroupChange={setGroupA} onChange={onChangeA} />
        ) : (
          <SkuPicker value={cloudBKey} groupId={groupB} onGroupChange={setGroupB} onChange={onChangeB} />
        )}
      </div>
    </div>
  );
};

const SkuPicker: React.FC<{
  value: string;
  groupId: string;
  onGroupChange: (id: string) => void;
  onChange: (key: string) => void;
}> = ({ value, groupId, onGroupChange, onChange }) => {
  const group = PROVIDER_GROUPS.find(g => g.id === groupId) ?? PROVIDER_GROUPS[0];
  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Cloud platform" className="flex flex-wrap gap-1.5">
        {PROVIDER_GROUPS.map(g => {
          const active = g.id === group.id;
          const t = TONE[g.tone];
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onGroupChange(g.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                active ? t.tabActive : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${t.dot}`} aria-hidden="true" />
              <span>{g.short}</span>
              {g.keys.includes(value) && <Check className="w-3 h-3" aria-label="selected platform" />}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-slate-400">{group.label}</div>
      <div role="radiogroup" aria-label={`${group.label} host types`} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.keys.map(k => {
          const p = CLOUD_PRESETS[k];
          const selected = k === value;
          const t = TONE[group.tone];
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(k)}
              className={`text-left rounded-lg border p-3 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                selected ? t.cardActive : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`font-mono text-xs font-bold ${selected ? 'text-white' : 'text-slate-200'}`}>{shortModel(p)}</span>
                {selected && <Check className={`w-4 h-4 shrink-0 ${t.check}`} aria-hidden="true" />}
              </div>
              {modelDetail(p) && <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{modelDetail(p)}</div>}
              <div className="text-[11px] text-slate-400 mt-1.5 font-mono">{specLine(p)}</div>
              <div className={`text-[11px] mt-0.5 font-mono ${p.monthlyPriceEst != null ? 'text-emerald-300' : 'text-amber-300'}`}>
                {priceLine(p)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ───────── Inputs ───────── */
const railStyle = (value: number, min: number, max: number): React.CSSProperties => {
  const pct = ((value - min) / (max - min)) * 100;
  return {
    background: `linear-gradient(to right, rgb(34 211 238) ${pct}%, rgb(30 41 59) ${pct}%)`,
    backgroundSize: '100% 6px',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
};

const RANGE_CLASS =
  'w-full h-5 appearance-none bg-transparent cursor-pointer focus-visible:outline-none ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-950 [&::-webkit-slider-thumb]:shadow-md ' +
  '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-300 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-950 ' +
  'focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-cyan-200';

const RangeInput: React.FC<{
  ariaLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({ ariaLabel, value, min, max, step, onChange }) => (
  <input
    type="range"
    aria-label={ariaLabel}
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={e => onChange(Number(e.target.value))}
    className={RANGE_CLASS}
    style={railStyle(value, min, max)}
  />
);

/** Slider with a typed-value box. Out-of-range or half-typed text is never sent to the calculator. */
const SliderField: React.FC<{
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  ticks: string[];
}> = ({ label, unit, value, min, max, step, onChange, ticks }) => {
  const [draft, setDraft] = useState<string | null>(null);
  const id = React.useId();

  const snap = (n: number) => Math.round((Math.min(max, Math.max(min, n)) - min) / step) * step + min;

  return (
    <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-semibold text-slate-200">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={draft ?? String(value)}
            onChange={e => {
              setDraft(e.target.value);
              const n = Number(e.target.value);
              if (e.target.value.trim() !== '' && Number.isFinite(n) && n >= min && n <= max) onChange(n);
            }}
            onBlur={e => {
              const n = Number(e.target.value);
              if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(snap(n));
              setDraft(null);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            className="w-20 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-slate-600 text-right text-sm font-mono font-bold text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
          />
          <span className="text-xs text-slate-400 font-mono w-10">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => {
          setDraft(null);
          onChange(Number(e.target.value));
        }}
        className={RANGE_CLASS}
        style={railStyle(value, min, max)}
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono" aria-hidden="true">
        {ticks.map(t => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
};

function Segmented<T extends number | string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: { value: T; label: string; desc: string }[];
  onChange: (v: T) => void;
}) {
  const current = options.find(o => o.value === value);
  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map(o => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                active ? 'bg-cyan-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {current && <p className="text-[11px] text-slate-400 leading-snug">{current.desc}</p>}
    </div>
  );
}

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
      checked ? 'bg-cyan-500' : 'bg-slate-700'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

/* ───────── Comparison ───────── */
const ACCENT = {
  cyan: { border: 'border-cyan-500/40', badge: 'bg-cyan-950 text-cyan-300 border-cyan-800', model: 'text-cyan-400', big: 'text-cyan-300' },
  indigo: { border: 'border-indigo-500/40', badge: 'bg-indigo-950 text-indigo-300 border-indigo-800', model: 'text-indigo-400', big: 'text-indigo-300' }
} as const;

const CloudCompareCard: React.FC<{
  slot: 'A' | 'B';
  badge: string;
  preset: CloudPreset;
  nodes: number;
  monthly: number;
  exceeds: boolean;
  isBest: boolean;
  accent: keyof typeof ACCENT;
}> = ({ slot, badge, preset, nodes, monthly, exceeds, isBest, accent }) => {
  const a = ACCENT[accent];
  const priced = preset.monthlyPriceEst != null;
  return (
    <div className={`relative p-5 rounded-xl bg-slate-950/80 border ${a.border} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${a.badge}`}>{badge}</span>
          <h3 className="text-base font-bold text-white mt-2">{preset.name}</h3>
          <p className={`text-xs font-mono ${a.model}`}>{preset.nodeModel}</p>
        </div>
        {isBest && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
            <Check className="w-3 h-3" />
            Lower cost
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
          <div className="text-[10px] font-mono text-slate-400">Hosts Required</div>
          <div className={`text-3xl font-black font-mono leading-tight ${a.big}`}>
            {nodes} <span className="text-xs font-normal text-slate-400">Nodes</span>
          </div>
        </div>
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
          <div className="text-[10px] font-mono text-slate-400">Est. Monthly Opex</div>
          {priced ? (
            <div className={`text-2xl font-black font-mono leading-tight ${a.big}`}>${monthly.toLocaleString()}</div>
          ) : (
            <div className="text-sm font-semibold text-amber-300 mt-1">Price not set</div>
          )}
        </div>
      </div>

      <dl className="space-y-0 text-xs font-mono">
        <div className="flex justify-between gap-4 text-slate-300 py-1.5 border-b border-slate-900">
          <dt>Total Cores:</dt>
          <dd className="text-white">{nodes * preset.nodeCores} Cores</dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-300 py-1.5 border-b border-slate-900">
          <dt>Total RAM:</dt>
          <dd className="text-white">{nodes * preset.nodeRamGB} GiB</dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-300 py-1.5 border-b border-slate-900">
          <dt className="shrink-0">Storage Tier:</dt>
          <dd className={`text-right ${a.model}`}>{preset.externalStorageName}</dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-300 py-1.5">
          <dt>36-Month Indicative Cost (hosts only):</dt>
          <dd className="text-emerald-400 font-bold shrink-0">{priced ? `$${(monthly * 36).toLocaleString()}` : 'Price not set'}</dd>
        </div>
      </dl>

      {exceeds && (
        <div role="alert" className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {nodes} hosts exceeds the {preset.maxNodesCluster}-host cluster limit for Cloud {slot}. Split across multiple clusters.
          </span>
        </div>
      )}
    </div>
  );
};

/** Two horizontal bars scaled to the larger value, so length differences read at a glance. */
const CompareBars: React.FC<{
  title: string;
  a: { value: number; label: string };
  b: { value: number; label: string };
  unavailable?: boolean;
  unavailableText?: string;
}> = ({ title, a, b, unavailable, unavailableText }) => {
  const max = Math.max(1, a.value, b.value);
  const row = (name: string, bar: string, text: string, item: { value: number; label: string }) => (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-[10px] font-mono font-bold uppercase text-slate-400">{name}</span>
      <div className="flex-1 h-6 rounded-md bg-slate-900 border border-slate-800 overflow-hidden">
        <div
          className={`h-full flex items-center px-2 text-[11px] font-bold font-mono whitespace-nowrap transition-all duration-500 ${bar} ${text}`}
          style={{ width: `${Math.max(item.value > 0 ? 14 : 0, (item.value / max) * 100)}%` }}
        >
          {item.label}
        </div>
      </div>
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono text-slate-300">{title}</div>
      {unavailable ? (
        <div className="text-[11px] text-amber-300">{unavailableText}</div>
      ) : (
        <div className="space-y-1.5">
          {row('Cloud A', 'bg-cyan-500', 'text-slate-950', a)}
          {row('Cloud B', 'bg-indigo-500', 'text-white', b)}
        </div>
      )}
    </div>
  );
};
