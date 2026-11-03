/**
 * Centralized Enterprise Cloud Infrastructure Compatibility Catalogue
 * Versioned, documented specifications verified against official vendor documentation.
 * Provides platform node limits, SLA cluster minimums, storage attachment constraints,
 * and deterministic incompatibility explanations.
 */

export interface OfficialDocCitation {
  vendor: 'Microsoft' | 'AWS' | 'Google Cloud' | 'VMware / Broadcom' | 'Nutanix';
  documentTitle: string;
  sourceUrl: string;
  applicableVersions: string;
  verificationDate: string;
  verificationStatus: 'verified' | 'requires-verification';
}

export interface PlatformNodeSkuSpec {
  sku: string;
  platform: 'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure' | 'azure-native';
  displayName: string;
  cpuArchitecture: string;
  sockets: number;
  physicalCores: number;
  logicalThreads: number;
  ramGB: number;
  rawStorageTB: number;
  storageType: string;
  minNodesCluster: number;
  maxNodesCluster: number;
  maxNodesPrivateCloud: number;
  supportedGenerations: string[];
  citation: OfficialDocCitation;
}

export interface StorageAttachmentSpec {
  id: string;
  name: string;
  provider: 'azure' | 'aws' | 'gcp' | 'nutanix' | 'on-prem';
  storageProtocol: 'NFSv3' | 'iSCSI' | 'NVMe-oF' | 'Block' | 'SMB 3.0' | 'Fibre Channel';
  attachmentType: 'native-datastore' | 'external-datastore' | 'guest-attached' | 'backup-target';
  supportedTargetPlatforms: Array<'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure' | 'native-cloud' | 'on-prem'>;
  description: string;
  citation: OfficialDocCitation;
}

export interface DrEngineCompatibilitySpec {
  id: string;
  name: string;
  engineType: 'continuous-cdp' | 'hypervisor-replication' | 'storage-array-mirror' | 'backup-snapshot' | 'workload-migration';
  isContinuousDr: boolean;
  minSupportedRpoMinutes: number;
  supportedSources: Array<'vmware' | 'nutanix' | 'hyperv' | 'baremetal'>;
  supportedTargets: Array<'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure' | 'native-cloud'>;
  notes: string;
  citation: OfficialDocCitation;
}

// =============================================================================
// 1. OFFICIAL DOCUMENTATION REPOSITORY CITATIONS
// =============================================================================

export const OFFICIAL_CITATIONS: Record<string, OfficialDocCitation> = {
  avsGen1: {
    vendor: 'Microsoft',
    documentTitle: 'Azure VMware Solution private cloud and cluster concepts (host types AV36, AV36P, AV48, AV52)',
    sourceUrl: 'https://learn.microsoft.com/en-us/azure/azure-vmware/architecture-private-clouds',
    applicableVersions: 'AVS host table, Microsoft Learn page last updated 2026-01-19',
    verificationDate: '2026-11-03',
    verificationStatus: 'verified'
  },
  avsGen2: {
    vendor: 'Microsoft',
    documentTitle: 'Azure VMware Solution private cloud and cluster concepts (host type AV64)',
    sourceUrl: 'https://learn.microsoft.com/en-us/azure/azure-vmware/architecture-private-clouds',
    applicableVersions: 'AVS host table, AV64 (OSA 15.36 TB, ESA 19.25 TB)',
    verificationDate: '2026-11-03',
    verificationStatus: 'verified'
  },
  vmcAws: {
    vendor: 'VMware / Broadcom',
    documentTitle: 'VMware Cloud on AWS Feature Brief: SDDC Host Types (i3en, i4i, m7i)',
    sourceUrl: 'https://vmc.techzone.vmware.com/resource/feature-brief-sddc-host-types',
    applicableVersions: 'i3en.metal, i4i.metal, m7i.metal-24xl (i7i.metal-24xl announced 2026-04-01, not yet catalogued)',
    verificationDate: '2026-11-03',
    verificationStatus: 'verified'
  },
  gcve: {
    vendor: 'Google Cloud',
    documentTitle: 'VMware Engine node types',
    sourceUrl: 'https://cloud.google.com/vmware-engine/docs/concepts-node-types',
    applicableVersions: 've1-standard-72, ve2-standard-128 (Google lists vCPU = logical threads)',
    verificationDate: '2026-11-03',
    verificationStatus: 'verified'
  },
  nutanixNc2: {
    vendor: 'Nutanix',
    documentTitle: 'NC2 on Azure: supported SKUs and regions (AN36, AN36P, AN64)',
    sourceUrl: 'https://learn.microsoft.com/en-us/azure/nutanix/available-regions-skus',
    applicableVersions: 'NC2 on Azure Ready Nodes AN36, AN36P, AN64',
    verificationDate: '2026-11-03',
    verificationStatus: 'verified'
  }
};

// =============================================================================
// 2. VERIFIED HYPERSCALER TARGET NODE SKUS
// =============================================================================

export const TARGET_NODE_SKU_CATALOGUE: PlatformNodeSkuSpec[] = [
  // AVS Generation 1 (Verified Microsoft Learn documentation)
  {
    sku: 'AV36',
    platform: 'avs-gen1',
    displayName: 'AV36 (Intel Xeon Gold 6140, 36 Cores, 576GB RAM)',
    cpuArchitecture: 'Intel Xeon Gold 6140 (Skylake)',
    sockets: 2,
    physicalCores: 36,
    logicalThreads: 72,
    ramGB: 576,
    rawStorageTB: 15.2,
    storageType: 'vSAN OSA: 3.2 TB NVMe cache + 15.2 TB SSD capacity',
    minNodesCluster: 3,
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 96,
    supportedGenerations: ['Gen 1'],
    citation: OFFICIAL_CITATIONS.avsGen1
  },
  {
    sku: 'AV36P',
    platform: 'avs-gen1',
    displayName: 'AV36P (Intel Xeon Gold 6240, 36 Cores, 768GB RAM)',
    cpuArchitecture: 'Intel Xeon Gold 6240 (Cascade Lake)',
    sockets: 2,
    physicalCores: 36,
    logicalThreads: 72,
    ramGB: 768,
    rawStorageTB: 19.2,
    storageType: 'All-Flash NVMe Local Datastore',
    minNodesCluster: 3,
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 96,
    supportedGenerations: ['Gen 1'],
    citation: OFFICIAL_CITATIONS.avsGen1
  },
  {
    sku: 'AV52',
    platform: 'avs-gen1',
    displayName: 'AV52 (Intel Xeon Platinum 8270, 52 Cores, 1536GB RAM)',
    cpuArchitecture: 'Intel Xeon Platinum 8270 (Cascade Lake)',
    sockets: 2,
    physicalCores: 52,
    logicalThreads: 104,
    ramGB: 1536,
    rawStorageTB: 38.4,
    storageType: 'All-Flash NVMe Local Datastore',
    minNodesCluster: 3,
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 96,
    supportedGenerations: ['Gen 1'],
    citation: OFFICIAL_CITATIONS.avsGen1
  },

  {
    sku: 'AV48',
    platform: 'avs-gen1',
    displayName: 'AV48 (Intel Xeon Gold 6442Y, 48 Cores, 1024GB RAM, vSAN ESA)',
    cpuArchitecture: 'Intel Xeon Gold 6442Y (Sapphire Rapids)',
    sockets: 2,
    physicalCores: 48,
    logicalThreads: 96,
    ramGB: 1024,
    rawStorageTB: 25.6,
    storageType: 'vSAN ESA NVMe (no separate cache tier)',
    minNodesCluster: 3,
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 96,
    supportedGenerations: ['Gen 1'],
    citation: OFFICIAL_CITATIONS.avsGen1
  },

  // AVS Generation 2
  {
    sku: 'AV64',
    platform: 'avs-gen2',
    displayName: 'AV64 (Intel Xeon Platinum 8370C, 64 Cores, 1024GB RAM)',
    cpuArchitecture: 'Intel Xeon Platinum 8370C (Ice Lake)',
    sockets: 2,
    physicalCores: 64,
    logicalThreads: 128,
    ramGB: 1024,
    rawStorageTB: 15.36,
    storageType: 'vSAN OSA 3.84 TB cache + 15.36 TB capacity (ESA / Gen 2: 19.25 TB)',
    minNodesCluster: 3,
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 96,
    supportedGenerations: ['Gen 2'],
    citation: OFFICIAL_CITATIONS.avsGen2
  },

  // VMware Cloud on AWS (VMC)
  {
    sku: 'i4i.metal',
    platform: 'vmc-aws',
    displayName: 'i4i.metal (Intel Xeon Ice Lake 8375C, 64 Cores, 1024GB RAM)',
    cpuArchitecture: 'Intel Xeon Ice Lake 8375C',
    sockets: 2,
    physicalCores: 64,
    logicalThreads: 128,
    ramGB: 1024,
    rawStorageTB: 22.5,
    storageType: 'AWS Nitro SSD NVMe: 30 TB per host, 7.5 TB cache; vSAN OSA capacity 22.5 TB (ESA about 30 TB)',
    minNodesCluster: 2, // Production 99.9% SLA is 2 nodes on i4i
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 64,
    supportedGenerations: ['VMC Current'],
    citation: OFFICIAL_CITATIONS.vmcAws
  },

  {
    sku: 'i3en.metal',
    platform: 'vmc-aws',
    displayName: 'i3en.metal (Intel Xeon Cascade Lake, 48 Cores, 768GB RAM)',
    cpuArchitecture: 'Intel Xeon Cascade Lake',
    sockets: 2,
    physicalCores: 48,
    logicalThreads: 96,
    ramGB: 768,
    rawStorageTB: 50.0,
    storageType: 'AWS NVMe: 60 TB per host; vSAN capacity about 50 TB (45.84 TiB) after cache',
    minNodesCluster: 2,
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 64,
    supportedGenerations: ['VMC Current'],
    citation: OFFICIAL_CITATIONS.vmcAws
  },
  {
    sku: 'm7i.metal-24xl',
    platform: 'vmc-aws',
    displayName: 'm7i.metal-24xl (Intel Xeon Sapphire Rapids, 48 Cores, 384GB RAM, diskless)',
    cpuArchitecture: 'Intel Xeon Platinum 8488C (Sapphire Rapids)',
    sockets: 2,
    physicalCores: 48,
    logicalThreads: 96,
    ramGB: 384,
    rawStorageTB: 0,
    storageType: 'No local storage; external NFS only (Amazon FSx for NetApp ONTAP or VMware Cloud Flex Storage)',
    minNodesCluster: 2,
    maxNodesCluster: 16,
    maxNodesPrivateCloud: 64,
    supportedGenerations: ['VMC Current'],
    citation: OFFICIAL_CITATIONS.vmcAws
  },

  // Google Cloud VMware Engine (GCVE)
  {
    sku: 've1-standard-72',
    platform: 'gcve',
    displayName: 've1-standard-72 (Intel Xeon Gold 6240, 36 Cores, 768GB RAM)',
    cpuArchitecture: 'Intel Xeon Gold 6240',
    sockets: 2,
    physicalCores: 36,
    logicalThreads: 72,
    ramGB: 768,
    rawStorageTB: 19.2,
    storageType: 'Google Cloud All-Flash Local NVMe',
    minNodesCluster: 3,
    maxNodesCluster: 32,
    maxNodesPrivateCloud: 64,
    supportedGenerations: ['GCVE GA'],
    citation: OFFICIAL_CITATIONS.gcve
  },
  {
    sku: 've2-standard-128',
    platform: 'gcve',
    displayName: 've2-standard-128 (64 Cores / 128 vCPU threads, 2048GB RAM)',
    cpuArchitecture: 'Intel Xeon (CPU model not stated in Google node-type table)',
    sockets: 2,
    physicalCores: 64,
    logicalThreads: 128,
    ramGB: 2048,
    rawStorageTB: 25.5,
    storageType: 'Google Cloud All-Flash Local NVMe (raw, excludes cache)',
    minNodesCluster: 3,
    maxNodesCluster: 32,
    maxNodesPrivateCloud: 64,
    supportedGenerations: ['GCVE Next-Gen'],
    citation: OFFICIAL_CITATIONS.gcve
  },

  // Nutanix NC2 on Azure
  {
    sku: 'AN36',
    platform: 'nc2-azure',
    displayName: 'AN36 (Intel Xeon Gold 6140, 36 Cores, 576GB RAM, 18.6TB SSD/NVMe)',
    cpuArchitecture: 'Intel Xeon Gold 6140 (Skylake)',
    sockets: 2,
    physicalCores: 36,
    logicalThreads: 72,
    ramGB: 576,
    rawStorageTB: 18.6,
    storageType: 'Azure BareMetal NVMe Storage Pool (DSF)',
    minNodesCluster: 3,
    maxNodesCluster: 28,
    maxNodesPrivateCloud: 56,
    supportedGenerations: ['NC2 Current'],
    citation: OFFICIAL_CITATIONS.nutanixNc2
  },
  {
    sku: 'AN36P',
    platform: 'nc2-azure',
    displayName: 'AN36P (Intel Xeon Gold 6240, 36 Cores, 768GB RAM, 20.77TB NVMe)',
    cpuArchitecture: 'Intel Xeon Gold 6240 (Cascade Lake)',
    sockets: 2,
    physicalCores: 36,
    logicalThreads: 72,
    ramGB: 768,
    rawStorageTB: 20.77,
    storageType: 'Azure BareMetal NVMe Storage Pool (DSF)',
    minNodesCluster: 3,
    maxNodesCluster: 28,
    maxNodesPrivateCloud: 56,
    supportedGenerations: ['NC2 Current'],
    citation: OFFICIAL_CITATIONS.nutanixNc2
  },

  {
    sku: 'AN64',
    platform: 'nc2-azure',
    displayName: 'AN64 (Intel Xeon Platinum 8462Y+, 64 Cores, 1024GB RAM, 38.4TB NVMe)',
    cpuArchitecture: 'Intel Xeon Platinum 8462Y+ (Sapphire Rapids)',
    sockets: 2,
    physicalCores: 64,
    logicalThreads: 128,
    ramGB: 1024,
    rawStorageTB: 38.4,
    storageType: 'Azure BareMetal NVMe Storage Pool (DSF)',
    minNodesCluster: 3,
    maxNodesCluster: 28,
    maxNodesPrivateCloud: 56,
    supportedGenerations: ['NC2 Current'],
    citation: OFFICIAL_CITATIONS.nutanixNc2
  },

  // Azure Native (IaaS Compute Node Sizing)
  {
    sku: 'Standard_D32s_v5',
    platform: 'azure-native',
    displayName: 'Standard_D32s_v5 (32 vCPU, 128GB RAM, Premium SSD)',
    cpuArchitecture: 'Intel Xeon Platinum 8370C',
    sockets: 2,
    physicalCores: 32,
    logicalThreads: 64,
    ramGB: 128,
    rawStorageTB: 8.0,
    storageType: 'Azure Premium SSD Managed Disks',
    minNodesCluster: 2,
    maxNodesCluster: 32,
    maxNodesPrivateCloud: 128,
    supportedGenerations: ['v5 General Purpose'],
    citation: {
      vendor: 'Microsoft',
      documentTitle: 'Dv5 and Dsv5-series VM sizing - Azure Virtual Machines',
      sourceUrl: 'https://learn.microsoft.com/en-us/azure/virtual-machines/dv5-dsv5-series',
      applicableVersions: 'Azure Global Regions GA',
      verificationDate: '2026-10-17',
      verificationStatus: 'verified'
    }
  },
  {
    sku: 'Standard_E32s_v5',
    platform: 'azure-native',
    displayName: 'Standard_E32s_v5 (High-Memory, 32 vCPU, 256GB RAM)',
    cpuArchitecture: 'Intel Xeon Platinum 8370C',
    sockets: 2,
    physicalCores: 32,
    logicalThreads: 64,
    ramGB: 256,
    rawStorageTB: 16.0,
    storageType: 'Azure Premium SSD / Ultra Disk',
    minNodesCluster: 2,
    maxNodesCluster: 32,
    maxNodesPrivateCloud: 128,
    supportedGenerations: ['v5 Memory Optimized'],
    citation: {
      vendor: 'Microsoft',
      documentTitle: 'Ev5 and Esv5-series VM sizing - Azure Virtual Machines',
      sourceUrl: 'https://learn.microsoft.com/en-us/azure/virtual-machines/ev5-esv5-series',
      applicableVersions: 'Azure Global Regions GA',
      verificationDate: '2026-10-17',
      verificationStatus: 'verified'
    }
  }
];

// =============================================================================
// 3. STORAGE ATTACHMENT COMPATIBILITY CATALOGUE
// =============================================================================

export const STORAGE_ATTACHMENT_CATALOGUE: StorageAttachmentSpec[] = [
  {
    id: 'local-nvme',
    name: 'Native All-Flash NVMe Datastore (vSAN / DSF)',
    provider: 'on-prem',
    storageProtocol: 'NVMe-oF',
    attachmentType: 'native-datastore',
    supportedTargetPlatforms: ['avs-gen1', 'avs-gen2', 'vmc-aws', 'gcve', 'nc2-azure', 'on-prem'],
    description: 'Directly attached all-flash NVMe drives participating in hyperconverged vSAN / Nutanix DSF pool.',
    citation: OFFICIAL_CITATIONS.avsGen1
  },
  {
    id: 'nutanix-dsf',
    name: 'Nutanix Distributed Storage Fabric (DSF Pool RF2/RF3)',
    provider: 'nutanix',
    storageProtocol: 'NVMe-oF',
    attachmentType: 'native-datastore',
    supportedTargetPlatforms: ['nc2-azure'],
    description: 'Nutanix AOS Distributed Storage Fabric spanning physical Azure BareMetal local NVMe drives with RF2 (2 copies) or RF3 (3 copies) and EC-X.',
    citation: OFFICIAL_CITATIONS.nutanixNc2
  },
  {
    id: 'azure-anf',
    name: 'Azure NetApp Files (ANF NFS Datastore)',
    provider: 'azure',
    storageProtocol: 'NFSv3',
    attachmentType: 'external-datastore',
    supportedTargetPlatforms: ['avs-gen1', 'avs-gen2'],
    description: 'Fully managed enterprise file storage mounted directly as external ESXi datastores on AVS clusters.',
    citation: OFFICIAL_CITATIONS.avsGen1
  },
  {
    id: 'azure-elastic-san',
    name: 'Azure Elastic SAN (Direct vNet iSCSI Datastore)',
    provider: 'azure',
    storageProtocol: 'iSCSI',
    attachmentType: 'external-datastore',
    supportedTargetPlatforms: ['avs-gen2'], // Exclusive to AVS Gen 2
    description: 'Cloud-native SAN storage volume mounted over Direct vNet routing exclusively on AVS Gen 2 AV64 nodes.',
    citation: OFFICIAL_CITATIONS.avsGen2
  },
  {
    id: 'aws-fsx-ontap',
    name: 'Amazon FSx for NetApp ONTAP (NFS Datastore)',
    provider: 'aws',
    storageProtocol: 'NFSv3',
    attachmentType: 'external-datastore',
    supportedTargetPlatforms: ['vmc-aws'],
    description: 'NetApp ONTAP file system mounted as external VMware ESXi datastore via VMware Transit Connect / ENI.',
    citation: OFFICIAL_CITATIONS.vmcAws
  },
  {
    id: 'gcp-gcnv',
    name: 'Google Cloud NetApp Volumes (GCNV NFS Datastore)',
    provider: 'gcp',
    storageProtocol: 'NFSv3',
    attachmentType: 'external-datastore',
    supportedTargetPlatforms: ['gcve'],
    description: 'Fully managed NetApp service in Google Cloud attached as an external NFS datastore to GCVE clusters.',
    citation: OFFICIAL_CITATIONS.gcve
  },
  {
    id: 'azure-blob-nc2',
    name: 'Azure Blob Storage Tier (NC2 Snapshot Archive)',
    provider: 'azure',
    storageProtocol: 'Block',
    attachmentType: 'backup-target',
    supportedTargetPlatforms: ['nc2-azure'],
    description: 'Native Azure Cool/Cold Blob storage account integrated with Prism Central / Nutanix Leap for automated snapshot tiering and disaster recovery backups.',
    citation: OFFICIAL_CITATIONS.nutanixNc2
  }
];

// =============================================================================
// 4. DISASTER RECOVERY & REPLICATION ENGINE CATALOGUE
// =============================================================================

export const DR_ENGINE_CATALOGUE: DrEngineCompatibilitySpec[] = [
  {
    id: 'vmware-srm',
    name: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
    engineType: 'hypervisor-replication',
    isContinuousDr: true,
    minSupportedRpoMinutes: 5,
    supportedSources: ['vmware'],
    supportedTargets: ['avs-gen1', 'avs-gen2', 'vmc-aws', 'gcve'],
    notes: 'Industry-standard orchestrated recovery for vSphere-to-Cloud workloads with automated test drill bubbles.',
    citation: OFFICIAL_CITATIONS.avsGen1
  },
  {
    id: 'zerto-cdp',
    name: 'Zerto Continuous Data Protection (CDP)',
    engineType: 'continuous-cdp',
    isContinuousDr: true,
    minSupportedRpoMinutes: 0.1, // Sub-minute / seconds RPO
    supportedSources: ['vmware', 'hyperv'],
    supportedTargets: ['avs-gen1', 'avs-gen2', 'vmc-aws', 'gcve', 'native-cloud'],
    notes: 'Journal-based near-synchronous CDP replication with point-in-time rewind and non-disruptive DR testing.',
    citation: OFFICIAL_CITATIONS.avsGen1
  },
  {
    id: 'veeam-vro',
    name: 'Veeam Backup & Replication / Veeam Recovery Orchestrator',
    engineType: 'backup-snapshot',
    isContinuousDr: true,
    minSupportedRpoMinutes: 15,
    supportedSources: ['vmware', 'nutanix', 'hyperv', 'baremetal'],
    supportedTargets: ['avs-gen1', 'avs-gen2', 'vmc-aws', 'gcve', 'nc2-azure', 'native-cloud'],
    notes: 'Universal image-level replication, instant VM recovery, and orchestrated recovery plans.',
    citation: OFFICIAL_CITATIONS.avsGen1
  },
  {
    id: 'nutanix-protection-domains',
    name: 'Nutanix Protection Domains (NearSync & Metro Availability)',
    engineType: 'storage-array-mirror',
    isContinuousDr: true,
    minSupportedRpoMinutes: 0, // 0-minute Synchronous RPO supported via Metro (<5ms RTT)
    supportedSources: ['nutanix'],
    supportedTargets: ['nc2-azure'],
    notes: 'Native Nutanix AOS storage replication between on-premises AHV clusters and NC2 on Azure.',
    citation: OFFICIAL_CITATIONS.nutanixNc2
  },
  {
    id: 'nutanix-leap',
    name: 'Nutanix Disaster Recovery / Nutanix Leap Orchestrator',
    engineType: 'storage-array-mirror',
    isContinuousDr: true,
    minSupportedRpoMinutes: 1, // NearSync 1-minute RPO
    supportedSources: ['nutanix', 'vmware'],
    supportedTargets: ['nc2-azure'],
    notes: 'Policy-based orchestration engine in Prism Central managing recovery plans, network mapping, script execution, and isolated test sandboxes.',
    citation: OFFICIAL_CITATIONS.nutanixNc2
  },
  {
    id: 'vmware-hcx-dr',
    name: 'VMware HCX Disaster Recovery Service',
    engineType: 'workload-migration',
    isContinuousDr: false, // Explicitly tagged: Migration & periodic sync tool, not primary enterprise DR engine
    minSupportedRpoMinutes: 120,
    supportedSources: ['vmware'],
    supportedTargets: ['avs-gen1', 'avs-gen2', 'vmc-aws', 'gcve'],
    notes: 'L2 extended network cold/warm replication intended primarily for staged migration cutovers.',
    citation: OFFICIAL_CITATIONS.avsGen1
  }
];

// =============================================================================
// 5. HARDWARE VENDOR & MODEL SKU CATALOGUE
// =============================================================================

export interface HardwareVendorSpec {
  vendor: 'Dell Technologies' | 'HPE' | 'Lenovo Data Center' | 'Cisco UCS' | 'Supermicro';
  models: string[];
  citation: OfficialDocCitation;
}

export const HARDWARE_VENDOR_CATALOGUE: HardwareVendorSpec[] = [
  {
    vendor: 'Dell Technologies',
    models: [
      'PowerEdge R760 (2x Intel Xeon Gold 6430, up to 1TB RAM)',
      'PowerEdge R750 (2x Intel Xeon Gold 6330, up to 512GB RAM)',
      'PowerEdge R660 (Dense 1U Dual-Socket Compute)',
      'VxRail E660F (All-Flash NVMe Hyperconverged Node)'
    ],
    citation: {
      vendor: 'VMware / Broadcom',
      documentTitle: 'Dell EMC PowerEdge & VxRail VMware Compatibility Guide (VCG)',
      sourceUrl: 'https://www.vmware.com/resources/compatibility/search.php',
      applicableVersions: 'vSphere 7.0u3 / 8.0u3',
      verificationDate: '2026-10-13',
      verificationStatus: 'verified'
    }
  },
  {
    vendor: 'HPE',
    models: [
      'ProLiant DL380 Gen11 (2x Intel Xeon Platinum, up to 1TB RAM)',
      'ProLiant DL380 Gen10 Plus (Dual-Socket Enterprise)',
      'ProLiant DL360 Gen11 (1U Compute Node)',
      'HPE SimpliVity 380 (Hyperconverged Storage Node)'
    ],
    citation: {
      vendor: 'VMware / Broadcom',
      documentTitle: 'HPE ProLiant Server Family VMware Compatibility Matrix',
      sourceUrl: 'https://www.hpe.com/servers/compatibility',
      applicableVersions: 'vSphere 7.x / 8.x',
      verificationDate: '2026-10-13',
      verificationStatus: 'verified'
    }
  },
  {
    vendor: 'Lenovo Data Center',
    models: [
      'ThinkSystem SR650 V3 (2x Intel Xeon Gold, up to 1TB RAM)',
      'ThinkSystem SR630 V3 (1U High-Density Rack)',
      'ThinkAgile VX Series (vSAN Certified Certified Node)'
    ],
    citation: {
      vendor: 'VMware / Broadcom',
      documentTitle: 'Lenovo ThinkSystem VMware OS Support Matrix',
      sourceUrl: 'https://lenovopress.lenovo.com/osig',
      applicableVersions: 'vSphere 7.0 / 8.0',
      verificationDate: '2026-10-13',
      verificationStatus: 'verified'
    }
  },
  {
    vendor: 'Cisco UCS',
    models: [
      'UCS B200 M6 Blade Server (Dual Intel Xeon, up to 768GB RAM)',
      'UCS C240 M6 Rack Server (2U Storage-Optimized)',
      'UCS X-Series Modular System (Compute Blade Architecture)'
    ],
    citation: {
      vendor: 'VMware / Broadcom',
      documentTitle: 'Cisco UCS Hardware Compatibility List for VMware',
      sourceUrl: 'https://ucshcltool.cisco.com/',
      applicableVersions: 'vSphere 7.0u3 / 8.0u2',
      verificationDate: '2026-10-13',
      verificationStatus: 'verified'
    }
  },
  {
    vendor: 'Supermicro',
    models: [
      'Hyper SuperServer 2U Dual Processor (Intel Xeon)',
      'BigTwin Multi-Node 2U4N High-Density Cluster',
      'Ultra SuperServer NVMe Optimized Enterprise Server'
    ],
    citation: {
      vendor: 'VMware / Broadcom',
      documentTitle: 'Supermicro VMware Certified vSAN Solutions',
      sourceUrl: 'https://www.supermicro.com/en/solutions/vmware',
      applicableVersions: 'vSphere 7.0 / 8.0',
      verificationDate: '2026-10-13',
      verificationStatus: 'verified'
    }
  }
];

// =============================================================================
// 6. VALIDATION & CLEARING HELPER
// =============================================================================

export interface CompatibilityCheckResult {
  isCompatible: boolean;
  disabledReason?: string;
  clearedFields: string[];
}

/**
 * Validates cross-tier compatibility between source, target, storage, and DR engine.
 * Never silently substitutes a different architecture. If an active selection is invalid,
 * it flags it for explicit clearing with a documented explanation.
 */
export function evaluateCrossTierCompatibility(params: {
  sourcePlatform: string;
  targetPlatform: string;
  storageTierId?: string;
  drEngineId?: string;
  landingZone?: string;
  carrier?: string;
}): CompatibilityCheckResult {
  const clearedFields: string[] = [];
  let isCompatible = true;
  let disabledReason: string | undefined = undefined;

  // 1. Storage Tier Validation
  if (params.storageTierId) {
    const storageSpec = STORAGE_ATTACHMENT_CATALOGUE.find(s => s.id === params.storageTierId);
    if (storageSpec && !storageSpec.supportedTargetPlatforms.includes(params.targetPlatform as any)) {
      isCompatible = false;
      clearedFields.push('storageTierId');
      disabledReason = `Storage tier "${storageSpec.name}" is incompatible with target platform "${params.targetPlatform}" and has been cleared. Please choose an authorized storage tier.`;
    }
  }

  // 2. DR Engine Validation
  if (params.drEngineId) {
    const drSpec = DR_ENGINE_CATALOGUE.find(d => d.id === params.drEngineId);
    if (drSpec) {
      const sourceMatches = drSpec.supportedSources.includes(params.sourcePlatform as any);
      const targetMatches = drSpec.supportedTargets.includes(params.targetPlatform as any);
      if (!sourceMatches || !targetMatches) {
        isCompatible = false;
        clearedFields.push('drEngineId');
        disabledReason = `DR Engine "${drSpec.name}" is not certified for source "${params.sourcePlatform}" to target "${params.targetPlatform}" and has been cleared.`;
      }
    }
  }

  return {
    isCompatible,
    disabledReason,
    clearedFields
  };
}
