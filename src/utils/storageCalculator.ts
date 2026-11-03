/**
 * Enterprise VMware Storage Policy & Usable Capacity Sizing Engine
 * Supports vSAN RAID/FTT policies, slack factors, and external SAN (NFS) capacity tiers.
 * This module is technical-only (capacity, parity, node density). Indicative pricing, where shown,
 * lives in the Node Sizing page presets and is labelled and dated there.
 */

export type StoragePolicyId =
  | 'raid1_ftt1'
  | 'raid5_ftt1'
  | 'raid6_ftt2'
  | 'nutanix_rf2'
  | 'nutanix_rf3'
  | 'nutanix_rf2_ecx'
  | 'nutanix_rf3_ecx';

export interface StoragePolicyDefinition {
  id: StoragePolicyId;
  name: string;
  shortLabel: string;
  overheadMultiplier: number;
  parityEfficiencyPercent: number; // e.g. 50% for RAID 1 / RF2, 75% for RAID 5, 66.7% for RAID 6, 80% for RF2+EC-X
  minHosts: number;
  faultTolerance: string;
  description: string;
  technicalTradeoff: string;
}

export const ENTERPRISE_STORAGE_POLICIES: Record<StoragePolicyId, StoragePolicyDefinition> = {
  raid1_ftt1: {
    id: 'raid1_ftt1',
    name: 'RAID-1 (Mirroring) - FTT=1',
    shortLabel: 'RAID 1 (2x Overhead)',
    overheadMultiplier: 2.0, // 2x raw capacity overhead factor
    parityEfficiencyPercent: 50,
    minHosts: 3,
    faultTolerance: '1 Host Failure',
    description: 'Classic 2-way host mirroring. Highest random write IOPS efficiency with 100% capacity overhead.',
    technicalTradeoff: 'Fastest commit latency; requires 200 GB raw for every 100 GB usable data.'
  },
  raid5_ftt1: {
    id: 'raid5_ftt1',
    name: 'RAID-5 (Erasure Coding) - FTT=1',
    shortLabel: 'RAID 5 (~1.33x Overhead)',
    overheadMultiplier: 1.33333333, // ~1.33x overhead
    parityEfficiencyPercent: 75,
    minHosts: 4,
    faultTolerance: '1 Host Failure',
    description: '3+1 parity erasure coding stripe across 4+ nodes. Balances enterprise capacity savings with resilience.',
    technicalTradeoff: 'Saves 33% raw capacity vs RAID-1; small CPU parity calculation overhead during write spikes.'
  },
  raid6_ftt2: {
    id: 'raid6_ftt2',
    name: 'RAID-6 (Erasure Coding) - FTT=2',
    shortLabel: 'RAID 6 (~1.50x Overhead)',
    overheadMultiplier: 1.5, // ~1.50x overhead
    parityEfficiencyPercent: 66.7,
    minHosts: 6,
    faultTolerance: '2 Simultaneous Host Failures',
    description: '4+2 dual parity erasure coding stripe across 6+ nodes. Maximum resilience for tier-0 production.',
    technicalTradeoff: 'Tolerates 2 concurrent host crashes; requires minimum 6 hosts in the target cluster.'
  },
  nutanix_rf2: {
    id: 'nutanix_rf2',
    name: 'Nutanix DSF Replication Factor 2 (RF2)',
    shortLabel: 'Nutanix RF2 (2x Overhead)',
    overheadMultiplier: 2.0,
    parityEfficiencyPercent: 50,
    minHosts: 3,
    faultTolerance: '1 Node or Disk Failure',
    description: 'Nutanix Distributed Storage Fabric 2-copy replication across Azure bare-metal nodes.',
    technicalTradeoff: 'High write throughput; requires minimum 3 physical nodes.'
  },
  nutanix_rf3: {
    id: 'nutanix_rf3',
    name: 'Nutanix DSF Replication Factor 3 (RF3)',
    shortLabel: 'Nutanix RF3 (3x Overhead)',
    overheadMultiplier: 3.0,
    parityEfficiencyPercent: 33.3,
    minHosts: 5,
    faultTolerance: '2 Simultaneous Node Failures',
    description: 'Nutanix DSF 3-copy replication across Azure bare-metal nodes for mission-critical resiliency.',
    technicalTradeoff: 'Maximum failure resilience; requires minimum 5 physical nodes and 300 GB raw per 100 GB usable.'
  },
  nutanix_rf2_ecx: {
    id: 'nutanix_rf2_ecx',
    name: 'Nutanix DSF RF2 with EC-X Erasure Coding',
    shortLabel: 'Nutanix RF2 + EC-X (1.5x / 1.33x / 1.25x by cluster size)',
    overheadMultiplier: 1.25, // best case, only reached at 6+ nodes; see getOverheadForClusterSize()
    parityEfficiencyPercent: 80,
    minHosts: 4,
    faultTolerance: '1 Node or Disk Failure',
    description: 'RF2 with post-process EC-X striping on write-cold data. Strip is 2/1 at 4 nodes, 3/1 at 5 nodes, 4/1 at 6+ nodes.',
    technicalTradeoff: 'Efficiency depends on cluster size: 1.5x overhead at 3-4 nodes, 1.33x at 5 nodes, 1.25x (80%) only at 6+ nodes. Recommended minimum 4 nodes.'
  },
  nutanix_rf3_ecx: {
    id: 'nutanix_rf3_ecx',
    name: 'Nutanix DSF RF3 with EC-X Erasure Coding',
    shortLabel: 'Nutanix RF3 + EC-X (~1.50x Overhead)',
    overheadMultiplier: 1.5,
    parityEfficiencyPercent: 66.7,
    minHosts: 6,
    faultTolerance: '2 Simultaneous Node Failures',
    description: 'Inline RF3 with background dual-parity EC-X stripe (4+2) for mission-critical cold data blocks.',
    technicalTradeoff: 'Tolerates 2 concurrent host crashes while saving 50% capacity over raw RF3; requires 6 nodes.'
  }
};

export type PolicyFamily = 'vmware' | 'nutanix';

/** Overhead multiplier for a policy at a given cluster size. Only RF2 + EC-X varies with node count. */
export function getOverheadForClusterSize(policy: StoragePolicyDefinition, nodeCount: number): number {
  if (policy.id === 'nutanix_rf2_ecx') {
    if (nodeCount >= 6) return 1.25; // 4/1 strip
    if (nodeCount === 5) return 1.33333333; // 3/1 strip
    return 1.5; // 2/1 strip (3-4 nodes)
  }
  return policy.overheadMultiplier;
}

export function policiesForFamily(family: PolicyFamily): StoragePolicyId[] {
  return family === 'nutanix'
    ? ['nutanix_rf2', 'nutanix_rf2_ecx', 'nutanix_rf3', 'nutanix_rf3_ecx']
    : ['raid1_ftt1', 'raid5_ftt1', 'raid6_ftt2'];
}

/** Closest equivalent policy when comparing a VMware (vSAN) platform with Nutanix, and vice versa. */
export function equivalentPolicyId(id: StoragePolicyId, family: PolicyFamily): StoragePolicyId {
  if (policiesForFamily(family).includes(id)) return id;
  const toNutanix: Record<string, StoragePolicyId> = {
    raid1_ftt1: 'nutanix_rf2',
    raid5_ftt1: 'nutanix_rf2_ecx',
    raid6_ftt2: 'nutanix_rf3_ecx'
  };
  const toVmware: Record<string, StoragePolicyId> = {
    nutanix_rf2: 'raid1_ftt1',
    nutanix_rf2_ecx: 'raid5_ftt1',
    nutanix_rf3: 'raid1_ftt1',
    nutanix_rf3_ecx: 'raid6_ftt2'
  };
  return (family === 'nutanix' ? toNutanix[id] : toVmware[id]) ?? policiesForFamily(family)[0];
}

export interface StorageSizingInput {
  totalUsedStorageTB: number;
  totalProvisionedStorageTB: number;
  vsanPercentage: number; // 0 to 100% (Remainder goes to External Storage)
  storagePolicyId: StoragePolicyId;
  slackFactorPercent: number; // typically 20% to 30%, default 25%
  nodeRawStorageTB: number;
}

export interface StorageSizingResult {
  policy: StoragePolicyDefinition;
  totalUsedStorageTB: number;
  totalProvisionedStorageTB: number;
  vsanPercentage: number;
  externalPercentage: number;

  // vSAN Capacity Breakdown
  vsanUsedDataTB: number;
  vsanPolicyOverheadTB: number;
  vsanNetDataAndParityTB: number;
  vsanSlackTB: number;
  vsanRawRequiredTB: number;
  vsanUsablePerNodeTB: number;
  vsanStorageNodesRequired: number;

  // External SAN (NFS) Breakdown (e.g. ANF, FSx ONTAP, GCNV)
  externalUsedStorageTB: number;
  externalProvisionedTB: number;
  externalSlackTB: number;

  // Global Combined Usable & Raw Footprint
  totalRawStorageRequiredTB: number;
  totalUsableCapacityDeliveredTB: number;
  storageEfficiencyRatio: number;
}

/**
 * Calculates net usable storage, parity overhead, vSAN slack factor, and required node footprint.
 */
export function calculateStorageCapacity(input: StorageSizingInput): StorageSizingResult {
  const policy = ENTERPRISE_STORAGE_POLICIES[input.storagePolicyId] || ENTERPRISE_STORAGE_POLICIES.raid1_ftt1;
  const clampedVsanPercent = Math.max(0, Math.min(100, input.vsanPercentage));
  const externalPercent = 100 - clampedVsanPercent;
  const slackPercent = Math.max(10, Math.min(40, input.slackFactorPercent || 25));

  // Partition used storage between vSAN and External SAN
  const vsanUsedDataTB = Math.round(input.totalUsedStorageTB * (clampedVsanPercent / 100) * 100) / 100;
  const externalUsedStorageTB = Math.round(input.totalUsedStorageTB * (externalPercent / 100) * 100) / 100;

  // vSAN Math (iterates cluster size so size-dependent overhead, e.g. RF2 + EC-X, is applied correctly):
  //   Net data + parity = UsedData * overhead(nodeCount)
  //   Raw required      = NetDataAndParity / (1 - slack)
  const rawPerNode = input.nodeRawStorageTB > 0 ? input.nodeRawStorageTB : 0;
  let vsanStorageNodesRequired = 0;
  let appliedOverhead = policy.overheadMultiplier;
  if (clampedVsanPercent > 0 && rawPerNode > 0) {
    for (let n = policy.minHosts; n <= 512; n++) {
      const ovh = getOverheadForClusterSize(policy, n);
      const raw = (vsanUsedDataTB * ovh) / (1 - slackPercent / 100);
      vsanStorageNodesRequired = n;
      appliedOverhead = ovh;
      if (Math.ceil(raw / rawPerNode) <= n) break;
    }
  } else if (clampedVsanPercent > 0) {
    appliedOverhead = policy.overheadMultiplier;
  }

  const vsanNetDataAndParityTB = Math.round(vsanUsedDataTB * appliedOverhead * 100) / 100;
  const vsanPolicyOverheadTB = Math.round((vsanNetDataAndParityTB - vsanUsedDataTB) * 100) / 100;
  const vsanRawRequiredTB =
    clampedVsanPercent > 0
      ? Math.round((vsanNetDataAndParityTB / (1 - slackPercent / 100)) * 100) / 100
      : 0;
  const vsanSlackTB = Math.round((vsanRawRequiredTB - vsanNetDataAndParityTB) * 100) / 100;

  // Usable capacity delivered per node under this policy and slack factor:
  const vsanUsablePerNodeTB =
    rawPerNode > 0
      ? Math.round(((rawPerNode * (1 - slackPercent / 100)) / appliedOverhead) * 10) / 10
      : 0;

  // External SAN (NFS Datastores) Sizing:
  // Decoupled storage does not consume host disks. Includes 15% operational buffer.
  const externalSlackTB = Math.round(externalUsedStorageTB * 0.15 * 100) / 100;
  const externalProvisionedTB = Math.round((externalUsedStorageTB + externalSlackTB) * 100) / 100;

  // Global totals
  const totalRawStorageRequiredTB = Math.round((vsanRawRequiredTB + externalProvisionedTB) * 100) / 100;
  const totalUsableCapacityDeliveredTB = Math.round((vsanUsedDataTB + externalUsedStorageTB) * 100) / 100;
  const storageEfficiencyRatio =
    totalUsableCapacityDeliveredTB > 0
      ? Math.round((totalRawStorageRequiredTB / totalUsableCapacityDeliveredTB) * 100) / 100
      : 1;

  return {
    policy,
    totalUsedStorageTB: input.totalUsedStorageTB,
    totalProvisionedStorageTB: input.totalProvisionedStorageTB,
    vsanPercentage: clampedVsanPercent,
    externalPercentage: externalPercent,
    vsanUsedDataTB,
    vsanPolicyOverheadTB,
    vsanNetDataAndParityTB,
    vsanSlackTB,
    vsanRawRequiredTB,
    vsanUsablePerNodeTB,
    vsanStorageNodesRequired,
    externalUsedStorageTB,
    externalProvisionedTB,
    externalSlackTB,
    totalRawStorageRequiredTB,
    totalUsableCapacityDeliveredTB,
    storageEfficiencyRatio
  };
}

/**
 * Pure calculation of usable capacity from gross raw storage, storage policy, and slack space.
 */
export function calculateUsableStorage(
  rawStorageTB: number,
  policyId: StoragePolicyId,
  slackFactor: number = 0.20,
  efficiencyRatio: number = 1.0
): { usableCapacityTB: number; rawStorageTB: number; policy: StoragePolicyDefinition } {
  const policy = ENTERPRISE_STORAGE_POLICIES[policyId] || ENTERPRISE_STORAGE_POLICIES.raid1_ftt1;
  const usable = Math.max(0, (rawStorageTB * (1 - slackFactor) * efficiencyRatio) / policy.overheadMultiplier);
  return {
    usableCapacityTB: usable,
    rawStorageTB,
    policy
  };
}

/**
 * Converts storage between decimal (TB, GB) and binary (TiB, GiB) units.
 */
export function convertStorageUnit(
  value: number,
  fromUnit: 'TB' | 'GB' | 'TiB' | 'GiB',
  toUnit: 'TB' | 'GB' | 'TiB' | 'GiB'
): number {
  const bytesMap: Record<string, number> = {
    TB: 1e12,
    GB: 1e9,
    TiB: Math.pow(1024, 4),
    GiB: Math.pow(1024, 3)
  };
  const bytes = value * (bytesMap[fromUnit] || 1e12);
  return bytes / (bytesMap[toUnit] || 1e12);
}

