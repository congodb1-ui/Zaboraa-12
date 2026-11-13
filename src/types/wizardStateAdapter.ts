/**
 * Wizard State & Legacy Storage Adapter
 * Bridges the 4-step wizard UI with DynamicTopologyModel and historical localStorage schemas.
 * Guarantees zero data loss for unknown legacy fields, enforces active payload pruning for
 * inactive DR settings, and provides deterministic bidirectional round-trip stability.
 */

import {
  DynamicTopologyModel,
  ArchitectureTemplateId,
  CloudPlatformType,
  EnvironmentNode,
  InterconnectLink,
  ImportedLegacyContext
} from './multiCloudBlueprint';

import {
  DEFAULT_ENGINEERING_ASSUMPTIONS,
  EngineeringAssumptions
} from '../utils/architectureCalculator';

export const CHOICE_TO_TEMPLATE_ID_MAP: Record<ArchitectureTemplateChoice, ArchitectureTemplateId> = {
  'vmware-to-avs': 'avs',
  'vmware-to-nc2': 'vmware-to-nc2',
  'nutanix-to-nc2': 'nutanix-to-nc2',
  'vmware-to-gcve': 'gcve',
  'vmware-to-vmc': 'vmc-aws',
  'custom-path': 'multi-cloud'
};

export interface WizardClusterSpec {
  id: string;
  name: string;
  hostCount: number;
  sockets: number;
  coresPerSocket: number;
  hyperthreading: boolean;
  ramGB: number;
  storageTB: number;
}

export type ArchitectureObjective =
  | 'migration-only'
  | 'extend-dc'
  | 'setup-dr'
  | 'migrate-and-dr';

export type ArchitectureTemplateChoice =
  | 'vmware-to-avs'
  | 'vmware-to-nc2'
  | 'nutanix-to-nc2'
  | 'vmware-to-gcve'
  | 'vmware-to-vmc'
  | 'custom-path';

export interface SourceInfrastructureItem {
  id: string;
  name: string;
  platform: 'vmware-onprem' | 'nutanix-onprem' | 'azure' | 'vmc-aws' | 'avs' | 'gcve' | 'nc2-azure';
  hypervisorVersion?: string;
  hardwareVendor?: string;
  hardwareSku?: string;
  mgmtCidr: string;
  clusters: WizardClusterSpec[];
  workloadVmsCount?: number;
  vcenterFqdn?: string;
  notes?: string;
}

export interface TargetInfrastructureItem {
  id: string;
  name: string;
  platform: 'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure' | 'azure-native';
  role: 'Production' | 'Disaster Recovery';
  region?: string;
  nodeSku: string;
  nodeCount: number;
  sddcMgmtCidr: string;
  decoupledStorageEnabled: boolean;
  decoupledStorageTB: number;
  decoupledStorageProvider?: string;
  // Conditional Migration & DR
  migrationRequired?: boolean;
  migrationTool?: 'VMware HCX Enterprise' | 'Nutanix Move' | 'AWS MGN' | 'Azure Migrate' | 'None';
  drRequired?: boolean;
  drEngine?: string;
  drRpoMinutes?: number;
  drRtoMinutes?: number;
  drStrategy?: string;
  // Interconnect & Connectivity
  connectivitySelection?: 'dedicated' | 'vpn' | 'vpn-and-dedicated';
  interconnectCircuitType?: string;
  circuitBandwidth?: '100 Mbps' | '200 Mbps' | '300 Mbps' | '500 Mbps' | '1 Gbps' | '10 Gbps';
  layer2Extension?: boolean;
}

export interface TargetConstraints {
  maxTargets: number;
  minTargets: number;
  allowMultiple: boolean;
  requiredRole?: 'Production' | 'Disaster Recovery';
  allowedRoles: Array<'Production' | 'Disaster Recovery'>;
  ruleTitle: string;
  ruleDescription: string;
}

export function getTargetConstraintsForObjective(objective: ArchitectureObjective): TargetConstraints {
  switch (objective) {
    case 'migration-only':
      return {
        maxTargets: 1,
        minTargets: 1,
        allowMultiple: false,
        requiredRole: 'Production',
        allowedRoles: ['Production'],
        ruleTitle: 'Exactly 1 Target (Production Migration)',
        ruleDescription: 'Migration-only architectural objective requires exactly one production target environment.'
      };
    case 'setup-dr':
      return {
        maxTargets: 1,
        minTargets: 1,
        allowMultiple: false,
        requiredRole: 'Disaster Recovery',
        allowedRoles: ['Disaster Recovery'],
        ruleTitle: 'Exactly 1 Target (Disaster Recovery)',
        ruleDescription: 'Dedicated DR infrastructure requires exactly one standby / disaster recovery target.'
      };
    case 'migrate-and-dr':
      return {
        maxTargets: 10,
        minTargets: 1,
        allowMultiple: true,
        allowedRoles: ['Production', 'Disaster Recovery'],
        ruleTitle: 'Multiple Targets Allowed (Production & DR)',
        ruleDescription: 'Full modernization allows configuring primary production SDDCs and secondary disaster recovery target clusters.'
      };
    case 'extend-dc':
      return {
        maxTargets: 10,
        minTargets: 1,
        allowMultiple: true,
        allowedRoles: ['Production'],
        ruleTitle: 'Multiple Targets Allowed (Hybrid Cloud Burst)',
        ruleDescription: 'Datacenter extension permits multiple hybrid cloud clusters across regions for elastic capacity burst.'
      };
  }
}

export function createDefaultSourceItem(
  platform: 'vmware-onprem' | 'nutanix-onprem' | 'azure' | 'vmc-aws' | 'avs' | 'gcve' | 'nc2-azure' = 'vmware-onprem',
  customName?: string
): SourceInfrastructureItem {
  switch (platform) {
    case 'vmware-onprem':
      return {
        id: `src-vmware-${Date.now()}`,
        name: customName || 'Primary VMware vSphere On-Premises',
        platform: 'vmware-onprem',
        hypervisorVersion: 'vSphere 8.0u3',
        hardwareVendor: 'Dell Technologies',
        hardwareSku: 'PowerEdge R760 (2x Intel Xeon Gold 6430, up to 1TB RAM)',
        mgmtCidr: '10.10.0.0/16',
        vcenterFqdn: 'vcenter.corp.internal',
        workloadVmsCount: 380,
        clusters: [
          {
            id: `cluster-${Date.now()}-1`,
            name: 'Primary Management & Compute Cluster',
            hostCount: 16,
            sockets: 2,
            coresPerSocket: 32,
            hyperthreading: true,
            ramGB: 768,
            storageTB: 19.2
          }
        ],
        notes: 'Enterprise core production VMware cluster'
      };

    case 'nutanix-onprem':
      return {
        id: `src-nutanix-${Date.now()}`,
        name: customName || 'Primary Nutanix AHV On-Premises',
        platform: 'nutanix-onprem',
        hypervisorVersion: 'AOS 6.8 LTS (AHV)',
        hardwareVendor: 'Nutanix',
        hardwareSku: 'NX-8170-G9',
        mgmtCidr: '10.20.0.0/16',
        vcenterFqdn: 'prism-central.corp.internal:9440',
        workloadVmsCount: 240,
        clusters: [
          {
            id: `cluster-${Date.now()}-2`,
            name: 'Nutanix AOS AHV Block',
            hostCount: 8,
            sockets: 2,
            coresPerSocket: 32,
            hyperthreading: true,
            ramGB: 512,
            storageTB: 15.0
          }
        ],
        notes: 'On-premises Nutanix DSF storage cluster'
      };

    case 'azure':
      return {
        id: `src-azure-${Date.now()}`,
        name: customName || 'Microsoft Azure Native Infrastructure',
        platform: 'azure',
        hypervisorVersion: 'Azure Hyper-V / Azure ARM',
        hardwareVendor: 'Dell Technologies',
        hardwareSku: 'Azure Standard D32s_v5 Compute Pool',
        mgmtCidr: '10.100.0.0/16',
        vcenterFqdn: 'portal.azure.com (Primary Subscription)',
        workloadVmsCount: 150,
        clusters: [
          {
            id: `cluster-${Date.now()}-3`,
            name: 'Azure vNet Workload Subnet',
            hostCount: 6,
            sockets: 2,
            coresPerSocket: 16,
            hyperthreading: true,
            ramGB: 128,
            storageTB: 8.0
          }
        ],
        notes: 'Native Azure IaaS VMs and Blob Storage'
      };

    case 'avs':
      return {
        id: `src-avs-${Date.now()}`,
        name: customName || 'Azure VMware Solution (AVS) Source',
        platform: 'avs',
        hypervisorVersion: 'vSphere 8.0u2 / AVS Private Cloud',
        hardwareVendor: 'Dell Technologies',
        hardwareSku: 'AV36P Cascade Lake',
        mgmtCidr: '10.240.0.0/22',
        vcenterFqdn: 'vcenter.eastus.avs.azure.com',
        workloadVmsCount: 220,
        clusters: [
          {
            id: `cluster-${Date.now()}-4`,
            name: 'AVS AV36P Cluster',
            hostCount: 4,
            sockets: 2,
            coresPerSocket: 18,
            hyperthreading: true,
            ramGB: 768,
            storageTB: 19.2
          }
        ],
        notes: 'Existing Azure VMware Solution SDDC private cloud'
      };

    case 'vmc-aws':
      return {
        id: `src-vmc-${Date.now()}`,
        name: customName || 'VMware Cloud on AWS (VMC)',
        platform: 'vmc-aws',
        hypervisorVersion: 'VMC SDDC 1.24+ / vSphere 8',
        hardwareVendor: 'Dell Technologies',
        hardwareSku: 'i4i.metal (Nitro SSD All-Flash)',
        mgmtCidr: '10.120.0.0/20',
        vcenterFqdn: 'vcenter.sddc-us-east-1.vmc.vmware.com',
        workloadVmsCount: 280,
        clusters: [
          {
            id: `cluster-${Date.now()}-5`,
            name: 'VMC i4i.metal Production Cluster',
            hostCount: 4,
            sockets: 2,
            coresPerSocket: 32,
            hyperthreading: true,
            ramGB: 1024,
            storageTB: 30.0
          }
        ],
        notes: 'Existing AWS VMC SDDC connected via ENI'
      };

    case 'gcve':
      return {
        id: `src-gcve-${Date.now()}`,
        name: customName || 'Google Cloud VMware Engine (GCVE)',
        platform: 'gcve',
        hypervisorVersion: 'vSphere 8.0 / Google Cloud VMware Engine',
        hardwareVendor: 'Dell Technologies',
        hardwareSku: 've1-standard-72 Intel Gold',
        mgmtCidr: '10.140.0.0/20',
        vcenterFqdn: 'vcenter.us-central1.gcp.vmwareengine.google.com',
        workloadVmsCount: 200,
        clusters: [
          {
            id: `cluster-${Date.now()}-6`,
            name: 'GCVE ve1 Cluster',
            hostCount: 3,
            sockets: 2,
            coresPerSocket: 36,
            hyperthreading: true,
            ramGB: 768,
            storageTB: 19.2
          }
        ],
        notes: 'Existing Google Cloud VMware Engine private cloud'
      };

    case 'nc2-azure':
      return {
        id: `src-nc2-${Date.now()}`,
        name: customName || 'Nutanix Cloud Clusters (NC2) on Azure',
        platform: 'nc2-azure',
        hypervisorVersion: 'AOS 6.8 / Nutanix Prism Central on Azure',
        hardwareVendor: 'Supermicro',
        hardwareSku: 'AN36P Azure BareMetal',
        mgmtCidr: '10.160.0.0/20',
        vcenterFqdn: 'prism-azure.corp.internal:9440',
        workloadVmsCount: 180,
        clusters: [
          {
            id: `cluster-${Date.now()}-7`,
            name: 'NC2 AN36P Azure BareMetal Cluster',
            hostCount: 4,
            sockets: 2,
            coresPerSocket: 36,
            hyperthreading: true,
            ramGB: 1536,
            storageTB: 38.4
          }
        ],
        notes: 'Nutanix NC2 baremetal cluster deployed in Azure'
      };
  }
}

export function createDefaultTargetItem(
  role: 'Production' | 'Disaster Recovery' = 'Production',
  customName?: string,
  platform: 'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure' | 'azure-native' = 'avs-gen2',
  templateDefaults?: {
    nodeSku?: string;
    nodeCount?: number;
    decoupledStorageTB?: number;
    decoupledStorageProvider?: string;
    migrationTool?: 'VMware HCX Enterprise' | 'Nutanix Move' | 'AWS MGN' | 'Azure Migrate' | 'None';
    drEngine?: string;
    drRpoMinutes?: number;
    drRtoMinutes?: number;
    drStrategy?: string;
    interconnectCircuitType?: string;
    layer2Extension?: boolean;
    region?: string;
  }
): TargetInfrastructureItem {
  const isDr = role === 'Disaster Recovery';

  const defaultRegion = platform === 'vmc-aws'
    ? (isDr ? 'us-west-2 (Secondary DR)' : 'us-east-1 (Primary)')
    : platform === 'gcve'
    ? (isDr ? 'europe-west1 (Secondary DR)' : 'us-central1 (Primary)')
    : platform === 'nc2-azure'
    ? (isDr ? 'Azure West US 2 (Secondary)' : 'Azure East US (Primary)')
    : (isDr ? 'Azure East US 2 (Secondary)' : 'Azure East US (Primary)');

  const defaultSku = platform === 'avs-gen1' ? 'AV36P'
    : platform === 'avs-gen2' ? 'AV64'
    : platform === 'nc2-azure' ? 'AN36P'
    : platform === 'gcve' ? 've1-standard-72'
    : platform === 'vmc-aws' ? 'i4i.metal'
    : 'AV36P';

  const defaultStorageProvider = platform === 'vmc-aws'
    ? 'Amazon FSx for NetApp ONTAP (NFS Datastore)'
    : platform === 'gcve'
    ? 'Google Cloud NetApp Volumes (GCNV NFS Datastore)'
    : platform === 'nc2-azure'
    ? 'Native Nutanix Distributed Storage Fabric (DSF)'
    : 'Azure NetApp Files (ANF NFS Datastore)';

  const defaultMigrationTool = platform === 'nc2-azure'
    ? 'Nutanix Move'
    : 'VMware HCX Enterprise';

  const defaultDrEngine = platform === 'nc2-azure'
    ? 'Nutanix Protection Domains (NearSync & Metro Availability)'
    : platform === 'gcve'
    ? 'Zerto Continuous Data Protection (CDP)'
    : 'VMware Site Recovery Manager (SRM) + vSphere Replication';

  const defaultInterconnect = platform === 'vmc-aws'
    ? 'AWS Direct Connect (10 Gbps)'
    : platform === 'gcve'
    ? 'Google Cloud Dedicated Interconnect (10 Gbps)'
    : platform === 'nc2-azure'
    ? 'Azure ExpressRoute Dedicated Circuit (10 Gbps)'
    : 'Azure ExpressRoute FastPath (10 Gbps)';

  return {
    id: `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: customName || (isDr ? 'Secondary Disaster Recovery SDDC' : 'Primary Production SDDC'),
    platform,
    role,
    region: templateDefaults?.region || defaultRegion,
    nodeSku: templateDefaults?.nodeSku || defaultSku,
    nodeCount: templateDefaults?.nodeCount !== undefined ? templateDefaults.nodeCount : (isDr ? 3 : 4),
    sddcMgmtCidr: isDr ? '10.244.0.0/22' : '10.240.0.0/22',
    decoupledStorageEnabled: true,
    decoupledStorageTB: templateDefaults?.decoupledStorageTB !== undefined ? templateDefaults.decoupledStorageTB : (isDr ? 60 : 120),
    decoupledStorageProvider: templateDefaults?.decoupledStorageProvider || defaultStorageProvider,
    migrationRequired: !isDr,
    migrationTool: !isDr ? (templateDefaults?.migrationTool || defaultMigrationTool) : 'None',
    drRequired: isDr,
    drEngine: templateDefaults?.drEngine || defaultDrEngine,
    drRpoMinutes: templateDefaults?.drRpoMinutes !== undefined ? templateDefaults.drRpoMinutes : (isDr ? 5 : 15),
    drRtoMinutes: templateDefaults?.drRtoMinutes !== undefined ? templateDefaults.drRtoMinutes : (isDr ? 20 : 30),
    drStrategy: templateDefaults?.drStrategy || (isDr ? 'Pilot Light (3-Node Minimum)' : 'Pilot Light (3-Node Minimum)'),
    connectivitySelection: 'dedicated',
    interconnectCircuitType: templateDefaults?.interconnectCircuitType || defaultInterconnect,
    circuitBandwidth: '1 Gbps',
    layer2Extension: templateDefaults?.layer2Extension !== undefined ? templateDefaults.layer2Extension : true
  };
}

export function reconcileTargetsForObjective(
  objective: ArchitectureObjective,
  targets: TargetInfrastructureItem[]
): {
  reconciledTargets: TargetInfrastructureItem[];
  reconciliationNotice?: string;
  drEnabled: boolean;
} {
  let reconciled = targets.length > 0 ? [...targets] : [createDefaultTargetItem('Production')];
  let notice: string | undefined = undefined;
  let drEnabled = false;

  switch (objective) {
    case 'migration-only': {
      drEnabled = false;
      if (reconciled.length > 1) {
        notice = `Objective "Migration Only" permits exactly one target. Retained primary target "${reconciled[0].name}" and cleared additional targets.`;
        reconciled = [reconciled[0]];
      }
      reconciled[0] = {
        ...reconciled[0],
        role: 'Production',
        migrationRequired: true,
        drRequired: false
      };
      break;
    }

    case 'setup-dr': {
      drEnabled = true;
      if (reconciled.length > 1) {
        const drTarget = reconciled.find(t => t.role === 'Disaster Recovery') || reconciled[0];
        notice = `Objective "Setup DR" permits exactly one target. Configured "${drTarget.name}" as the dedicated DR target.`;
        reconciled = [drTarget];
      }
      reconciled[0] = {
        ...reconciled[0],
        role: 'Disaster Recovery',
        migrationRequired: false,
        drRequired: true
      };
      break;
    }

    case 'migrate-and-dr': {
      drEnabled = true;
      // Multiple targets allowed. If only one target and no secondary DR target, user can add one in Step 5.
      if (reconciled.length === 1 && reconciled[0].role === 'Disaster Recovery') {
        // Keep as is or add production
      }
      break;
    }

    case 'extend-dc': {
      drEnabled = false;
      // Multiple targets allowed. Ensure roles are Production or Hybrid extension
      reconciled = reconciled.map(t => ({
        ...t,
        role: 'Production' as const,
        drRequired: false
      }));
      break;
    }
  }

  return { reconciledTargets: reconciled, reconciliationNotice: notice, drEnabled };
}

export interface WizardState {
  // 4-Step Progressive Architecture Flow
  objective: ArchitectureObjective;
  templateChoice: ArchitectureTemplateChoice;
  migrationStrategy?: 'rehost' | 'replatform' | 'modernize' | 'mixed';
  workloadCriticality?: 'low' | 'medium' | 'high' | 'mission-critical';

  // Independent Infrastructure Sections
  interconnectEnabled: boolean;
  interconnectConfig: {
    type: string;
    bandwidthGbps: number;
    redundancy: 'dual' | 'single';
    layer2Extension: boolean;
    fastPathEnabled: boolean;
  };

  securityNvaEnabled: boolean;
  securityNvaConfig: {
    firewall: string;
    microsegmentation: boolean;
    wafEnabled: boolean;
    wafSolution: string;
    inspectionMode: 'centralized-nva' | 'distributed' | 'dual-layer';
  };

  // Dedicated Enterprise Multi-Vendor Security Tiers
  externalFirewall: {
    status: 'enabled' | 'existing' | 'not-applicable';
    vendor: string;
    model: string;
    isCustomModel?: boolean;
    customModelName?: string;
    customThroughputGbps?: number;
    deploymentMode: 'Active/Passive' | 'Active/Active ECMP' | 'Gateway Load Balancer (GWLB)' | 'Azure Route Server (ARS)' | 'Native Managed Fabric';
    haTopology: string;
    placement: string;
    throughputGbps: number;
    maxSessions: string;
    inspectionPolicy?: string;
  };

  internalFirewall: {
    status: 'enabled' | 'existing' | 'not-applicable';
    vendor: string;
    model: string;
    isCustomModel?: boolean;
    customModelName?: string;
    customThroughputGbps?: number;
    deploymentMode: 'Active/Passive' | 'Active/Active ECMP' | 'Gateway Load Balancer (GWLB)' | 'Azure Route Server (ARS)' | 'Native Managed Fabric';
    haTopology: string;
    placement: string;
    throughputGbps: number;
    maxSessions: string;
    inspectionPolicy?: string;
  };

  nsxDistributedFirewall: {
    enabled: boolean;
    version: string;
    policyMode: 'zero-trust-microsegmentation' | 'environment-isolation' | 'zone-based';
    loggingEnabled: boolean;
    idpsEnabled: boolean;
  };

  applicationPublishing: {
    enabled: boolean;
    platformName: string;
    isCustomProduct?: boolean;
    customProductName?: string;
    ingressMode: 'reverse-proxy' | 'zero-trust-tunnel' | 'ssl-offload' | 'dual-tier';
    publishingPort: number;
    protocol: 'HTTPS' | 'TCP' | 'Custom';
    authenticationIntegration: string;
  };

  loadBalancing: {
    enabled: boolean;
    platform: string;
    highAvailability: 'active-standby' | 'active-active-cluster' | 'managed-hyperscaler';
    sslOffloading: boolean;
    algorithm: 'round-robin' | 'least-connections' | 'ip-hash' | 'consistent-hashing';
    healthCheckIntervalSeconds: number;
  };

  trafficFlows: Array<{
    flowId: string;
    flowName: string;
    category: 'North-South' | 'East-West' | 'Hybrid Transit';
    description: string;
    inspectingControls: Array<'external-firewall' | 'internal-firewall' | 'nsx-dfw' | 'waf' | 'publishing-platform' | 'load-balancer'>;
    bypassInspection: boolean;
    notes?: string;
  }>;

  cloudNativeEnabled: boolean;
  cloudNativeConfig: {
    selectedServices: string[];
  };

  vdiEnabled: boolean;
  vdiConfig: {
    platform: 'Azure Virtual Desktop (AVD)' | 'VMware Horizon Cloud' | 'Citrix DaaS' | 'Nutanix Frame' | 'Amazon WorkSpaces';
    desktopCount: number;
    profileStorage: string;
  };

  otherServicesEnabled: boolean;
  otherServicesConfig: {
    decoupledStorageEnabled: boolean;
    decoupledStorageTB: number;
    decoupledStorageProvider: string;
    migrationAppliance: 'VMware HCX Enterprise' | 'Nutanix Move' | 'AWS MGN' | 'None';
    observabilitySuite: string[];
  };

  // 1. Step 1: Scope & Source Infrastructure
  customerName: string;
  architectName: string;
  projectDate: string;
  footprintScope: 'private-sddc' | 'native-cloud' | 'hybrid-multi';
  sourcePlatform: 'vmware' | 'nutanix' | 'hyperv' | 'baremetal';
  sourceHypervisorConfig: {
    vmwareType: 'traditional' | 'vcf';
    vcfVersion?: 'VCF 5.2.x' | 'VCF 5.1.x' | 'VCF 4.5.x';
    vSphereVersion?: '8.0u3' | '7.0u3';
    nsxEnabled: boolean;
    nsxVersion?: '4.2.x' | '3.2.x';
    ariaSuite: string[];
    hypervClustering?: 'SCVMM' | 'WSFC' | 'Standalone';
    nutanixAosVersion?: string;
  };
  hardwareVendor: 'Dell Technologies' | 'HPE' | 'Lenovo Data Center' | 'Cisco UCS' | 'Supermicro';
  hardwareSku: string;
  clusters: WizardClusterSpec[];
  failureReservedHosts: number;
  sourceMgmtCidr: string;
  assumptions: EngineeringAssumptions;

  // 2. Step 2: Cloud Connectivity & Security
  selectedPublicProviders: Array<'azure' | 'aws' | 'gcp'>;
  landingZonePattern: string;
  connectivityCarrier: string;
  firewallMode: 'native' | 'nva' | 'dual-layer';
  firewallProvider: string;
  dualLayerInspectionFlow?: 'sequential' | 'zero-trust-chaining' | 'asymmetric-specialized';
  wafEnabled: boolean;
  wafSolution?: string;

  // 3. Step 3: Target Platform & Capacity
  targetPlatform: 'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure' | 'azure-native';
  targetNodeSku: string;
  targetNodeCount: number;
  sddcMgmtCidr: string;
  decoupledStorageEnabled: boolean;
  decoupledStorageTB: number;
  decoupledStorageProvider?: string;

  // 4. Step 4: Disaster Recovery & Review
  drEnabled: boolean;
  drConfig: {
    engine: string;
    rpoMinutes: number;
    rtoMinutes: number;
    strategy: string;
  };

  // Multi-source and multi-target support
  sources?: SourceInfrastructureItem[];
  targets?: TargetInfrastructureItem[];

  // Preserved unrepresented legacy fields (e.g. vlans, auditClassification, corporateId)
  preservedLegacyFields: Record<string, unknown>;
  // Active template track id
  activeTemplate: ArchitectureTemplateId;
}

export function createDefaultWizardState(): WizardState {
  return {
    objective: 'migrate-and-dr',
    templateChoice: 'vmware-to-avs',

    interconnectEnabled: true,
    interconnectConfig: {
      type: 'Azure ExpressRoute FastPath (10 Gbps)',
      bandwidthGbps: 10,
      redundancy: 'dual',
      layer2Extension: true,
      fastPathEnabled: true
    },

    securityNvaEnabled: true,
    securityNvaConfig: {
      firewall: 'Palo Alto Networks VM-Series',
      microsegmentation: true,
      wafEnabled: true,
      wafSolution: 'Azure WAF on Application Gateway',
      inspectionMode: 'dual-layer'
    },

    externalFirewall: {
      status: 'enabled',
      vendor: 'Palo Alto Networks',
      model: 'VM-300',
      deploymentMode: 'Active/Active ECMP',
      haTopology: 'Active/Active Multi-Zone Cluster',
      placement: 'Perimeter Ingress/Egress Transit Hub',
      throughputGbps: 4.0,
      maxSessions: '800,000',
      inspectionPolicy: 'Full Layer 7 Threat Prevention & URL Filtering'
    },

    internalFirewall: {
      status: 'enabled',
      vendor: 'Fortinet',
      model: 'FortiGate-VM04',
      deploymentMode: 'Active/Passive',
      haTopology: 'Active/Passive Stateful Failover',
      placement: 'Internal Workload & Inter-Subnet Segmentation',
      throughputGbps: 7.5,
      maxSessions: '1,500,000',
      inspectionPolicy: 'East-West Inter-Tier Microsegmentation & IPS'
    },

    nsxDistributedFirewall: {
      enabled: true,
      version: 'NSX 4.2.x',
      policyMode: 'zero-trust-microsegmentation',
      loggingEnabled: true,
      idpsEnabled: true
    },

    applicationPublishing: {
      enabled: true,
      platformName: 'Customer VAP (Virtual Access Platform)',
      ingressMode: 'reverse-proxy',
      publishingPort: 443,
      protocol: 'HTTPS',
      authenticationIntegration: 'SAML 2.0 / Microsoft Entra ID'
    },

    loadBalancing: {
      enabled: true,
      platform: 'VMware NSX Advanced Load Balancer (Avi Networks)',
      highAvailability: 'active-standby',
      sslOffloading: true,
      algorithm: 'least-connections',
      healthCheckIntervalSeconds: 5
    },

    trafficFlows: [
      {
        flowId: 'internet-ingress-egress',
        flowName: 'Internet Ingress & Egress',
        category: 'North-South',
        description: 'Public inbound HTTPS traffic and outbound cloud egress.',
        inspectingControls: ['external-firewall', 'waf'],
        bypassInspection: false
      },
      {
        flowId: 'internal-app-to-app',
        flowName: 'Internal Application-to-Application',
        category: 'East-West',
        description: 'Inter-tier communication (Web to App, App to Database).',
        inspectingControls: ['internal-firewall', 'load-balancer'],
        bypassInspection: false
      },
      {
        flowId: 'east-west-workload',
        flowName: 'East-West Workload Microsegmentation',
        category: 'East-West',
        description: 'Intra-subnet host-to-host or VM-to-VM traffic within the same segment.',
        inspectingControls: ['nsx-dfw'],
        bypassInspection: false
      },
      {
        flowId: 'mgmt-shared-services',
        flowName: 'Management & Shared Services',
        category: 'Hybrid Transit',
        description: 'Administrative access, vCenter, Active Directory, DNS, NTP, and Backup.',
        inspectingControls: ['internal-firewall'],
        bypassInspection: false
      },
      {
        flowId: 'intercloud-hybrid',
        flowName: 'Inter-Cloud & Datacenter Transit',
        category: 'Hybrid Transit',
        description: 'Traffic between On-Premises HQ/DC and Cloud SDDC over ExpressRoute or Direct Connect.',
        inspectingControls: ['external-firewall', 'internal-firewall'],
        bypassInspection: false
      }
    ],

    cloudNativeEnabled: true,
    cloudNativeConfig: {
      selectedServices: [
        'Azure Virtual Network Peering & Transit',
        'Managed Azure Kubernetes (AKS)',
        'Azure SQL Managed Instance',
        'Azure Storage Accounts & Blob Data',
        'Azure Private Link & Private Endpoints'
      ]
    },

    vdiEnabled: false,
    vdiConfig: {
      platform: 'Azure Virtual Desktop (AVD)',
      desktopCount: 250,
      profileStorage: 'Azure Files Premium (FSLogix Profiles)'
    },

    otherServicesEnabled: true,
    otherServicesConfig: {
      decoupledStorageEnabled: true,
      decoupledStorageTB: 120,
      decoupledStorageProvider: 'Azure NetApp Files (ANF NFS Datastore)',
      migrationAppliance: 'VMware HCX Enterprise',
      observabilitySuite: ['Aria Operations for Networks (vRNI)', 'Azure Monitor & Log Analytics']
    },

    customerName: 'Global Financial Enterprises',
    architectName: 'Wasim Sayyed',
    projectDate: new Date().toISOString().split('T')[0],
    footprintScope: 'hybrid-multi',
    sourcePlatform: 'vmware',
    sourceHypervisorConfig: {
      vmwareType: 'traditional',
      vSphereVersion: '8.0u3',
      nsxEnabled: true,
      nsxVersion: '4.2.x',
      ariaSuite: ['Operations', 'Automation', 'Operations for Networks (vRNI)']
    },
    hardwareVendor: 'Dell Technologies',
    hardwareSku: 'PowerEdge R760 (2x Intel Xeon Gold 6430, up to 1TB RAM)',
    clusters: [
      {
        id: 'cluster-1',
        name: 'Primary Management & Compute Cluster',
        hostCount: 16,
        sockets: 2,
        coresPerSocket: 32,
        hyperthreading: true,
        ramGB: 768,
        storageTB: 19.2
      }
    ],
    failureReservedHosts: 1,
    sourceMgmtCidr: '10.10.0.0/16',
    assumptions: { ...DEFAULT_ENGINEERING_ASSUMPTIONS },

    selectedPublicProviders: ['azure'],
    landingZonePattern: 'Azure Virtual WAN Hub-and-Spoke',
    connectivityCarrier: 'Direct Circuits with FastPath / Global Reach',
    firewallMode: 'dual-layer',
    firewallProvider: 'Palo Alto Networks VM-Series',
    dualLayerInspectionFlow: 'sequential',
    wafEnabled: true,
    wafSolution: 'Azure WAF on Application Gateway',

    targetPlatform: 'avs-gen2',
    targetNodeSku: 'AV36P',
    targetNodeCount: 4,
    sddcMgmtCidr: '10.240.0.0/22',
    decoupledStorageEnabled: true,
    decoupledStorageTB: 120,
    decoupledStorageProvider: 'Azure NetApp Files (ANF NFS Datastore)',

    drEnabled: true,
    drConfig: {
      engine: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
      rpoMinutes: 5,
      rtoMinutes: 20,
      strategy: 'Pilot Light (3-Node Minimum)'
    },

    sources: [
      createDefaultSourceItem('vmware-onprem')
    ],

    targets: [
      createDefaultTargetItem('Production', 'Primary Production SDDC', 'avs-gen2'),
      createDefaultTargetItem('Disaster Recovery', 'Secondary Disaster Recovery SDDC', 'avs-gen2')
    ],

    preservedLegacyFields: {},
    activeTemplate: 'avs'
  };
}

/**
 * Maps a DynamicTopologyModel and legacy context into the typed WizardState.
 * Captures all unknown/custom attributes into preservedLegacyFields.
 */
export function mapLegacyToWizard(
  model: DynamicTopologyModel,
  legacyContext: ImportedLegacyContext = {}
): WizardState {
  const wizard = createDefaultWizardState();

  wizard.customerName = model.customerName || wizard.customerName;
  wizard.architectName = model.architectName || wizard.architectName;
  wizard.projectDate = model.projectDate || wizard.projectDate;
  wizard.activeTemplate = model.templateId || 'avs';

  // Map Source Environment
  const srcEnv = model.environments.find(e => e.tier === 'source') || model.environments[0];
  if (srcEnv) {
    if (srcEnv.platform.includes('Nutanix')) {
      wizard.sourcePlatform = 'nutanix';
    } else if (srcEnv.platform.includes('Co-Location')) {
      wizard.sourcePlatform = 'baremetal';
    } else {
      wizard.sourcePlatform = 'vmware';
    }

    wizard.sourceMgmtCidr = srcEnv.cidrBlock || wizard.sourceMgmtCidr;

    if (wizard.clusters[0]) {
      wizard.clusters[0].hostCount = srcEnv.hostCount || 16;
      wizard.clusters[0].ramGB = Math.round((srcEnv.totalRamGB || 12288) / Math.max(1, srcEnv.hostCount));
      wizard.clusters[0].storageTB = Math.round((srcEnv.storageTB || 200) / Math.max(1, srcEnv.hostCount));
    }
  }

  // Map Target Environment
  const tgtEnv = model.environments.find(e => e.tier === 'target') || model.environments[model.environments.length - 1];
  if (tgtEnv) {
    if (tgtEnv.platform.includes('AWS')) {
      wizard.targetPlatform = 'vmc-aws';
      wizard.targetNodeSku = tgtEnv.nodeSku || 'i4i.metal';
    } else if (tgtEnv.platform.includes('Google') || tgtEnv.platform.includes('GCVE')) {
      wizard.targetPlatform = 'gcve';
      wizard.targetNodeSku = tgtEnv.nodeSku || 've1-standard-72';
    } else if (tgtEnv.platform.includes('NC2')) {
      wizard.targetPlatform = 'nc2-azure';
      wizard.targetNodeSku = tgtEnv.nodeSku || 'AN36P';
    } else {
      wizard.targetPlatform = 'avs-gen1';
      wizard.targetNodeSku = tgtEnv.nodeSku || 'AV36P';
    }

    wizard.targetNodeCount = tgtEnv.hostCount || 4;
    wizard.sddcMgmtCidr = tgtEnv.cidrBlock || wizard.sddcMgmtCidr;
    wizard.decoupledStorageTB = tgtEnv.storageTB || wizard.decoupledStorageTB;
  }

  // Map Resilience / DR
  if (model.resilience) {
    wizard.drEnabled = true;
    wizard.drConfig = {
      engine: model.resilience.replicationEngine || wizard.drConfig.engine,
      rpoMinutes: model.resilience.targetRpoMinutes ?? 5,
      rtoMinutes: model.resilience.targetRtoMinutes ?? 20,
      strategy: model.resilience.drTopology || wizard.drConfig.strategy
    };
  }

  // Retain all unrepresented legacy context fields
  if (legacyContext.preservedExtraFields) {
    wizard.preservedLegacyFields = { ...legacyContext.preservedExtraFields };

    if (legacyContext.preservedExtraFields.externalFirewall) {
      wizard.externalFirewall = legacyContext.preservedExtraFields.externalFirewall as any;
    }
    if (legacyContext.preservedExtraFields.internalFirewall) {
      wizard.internalFirewall = legacyContext.preservedExtraFields.internalFirewall as any;
    }
    if (legacyContext.preservedExtraFields.nsxDistributedFirewall) {
      wizard.nsxDistributedFirewall = legacyContext.preservedExtraFields.nsxDistributedFirewall as any;
    }
    if (legacyContext.preservedExtraFields.applicationPublishing) {
      wizard.applicationPublishing = legacyContext.preservedExtraFields.applicationPublishing as any;
    }
    if (legacyContext.preservedExtraFields.loadBalancing) {
      wizard.loadBalancing = legacyContext.preservedExtraFields.loadBalancing as any;
    }
    if (legacyContext.preservedExtraFields.trafficFlows) {
      wizard.trafficFlows = legacyContext.preservedExtraFields.trafficFlows as any;
    }
  }

  return wizard;
}

/**
 * Maps the WizardState back into an authoritative DynamicTopologyModel and legacy storage payload.
 * Inactive DR fields are cleanly isolated while preserving historical storage records.
 */
export function mapWizardToLegacy(
  wizard: WizardState,
  existingModel?: DynamicTopologyModel
): { model: DynamicTopologyModel; legacyPatch: Record<string, unknown> } {
  // Update or create environments
  const baseEnvs: EnvironmentNode[] = existingModel?.environments && existingModel.environments.length > 0
    ? [...existingModel.environments]
    : [
        {
          id: 'env-source-onprem',
          name: 'Primary Enterprise Datacenter',
          platform: wizard.sourcePlatform === 'nutanix' ? 'Nutanix AHV' : 'VMware vSphere',
          role: 'Production',
          region: 'On-Premises HQ',
          hostCount: wizard.clusters.reduce((acc, c) => acc + c.hostCount, 0),
          nodeSku: wizard.hardwareSku,
          totalVcpu: wizard.clusters.reduce((acc, c) => acc + c.hostCount * c.sockets * c.coresPerSocket * 2, 0),
          totalRamGB: wizard.clusters.reduce((acc, c) => acc + c.hostCount * c.ramGB, 0),
          storageTB: wizard.clusters.reduce((acc, c) => acc + c.hostCount * c.storageTB, 0),
          cidrBlock: wizard.sourceMgmtCidr,
          connectedEnvironmentIds: [],
          tier: 'source',
          x: 80,
          y: 120
        },
        {
          id: 'env-transit-hub',
          name: 'Cloud Transit Hub & Perimeter Security',
          platform: 'Azure VMware Solution',
          role: 'Shared Services',
          region: 'Transit Hub',
          hostCount: 2,
          nodeSku: 'Managed Cloud Gateway',
          totalVcpu: 16,
          totalRamGB: 64,
          storageTB: 2,
          cidrBlock: '10.200.0.0/24',
          connectedEnvironmentIds: [],
          tier: 'transit',
          x: 430,
          y: 120
        },
        {
          id: 'env-target-cloud',
          name: 'Target Cloud SDDC',
          platform:
            wizard.targetPlatform === 'vmc-aws'
              ? 'VMware Cloud on AWS'
              : wizard.targetPlatform === 'gcve'
              ? 'Google Cloud VMware Engine'
              : wizard.targetPlatform === 'nc2-azure'
              ? 'Nutanix NC2 on Azure'
              : 'Azure VMware Solution',
          role: 'Disaster Recovery',
          region: 'Cloud Region',
          hostCount: wizard.targetNodeCount,
          nodeSku: wizard.targetNodeSku,
          totalVcpu: wizard.targetNodeCount * 72,
          totalRamGB: wizard.targetNodeCount * 768,
          storageTB: wizard.decoupledStorageTB,
          cidrBlock: wizard.sddcMgmtCidr,
          connectedEnvironmentIds: [],
          tier: 'target',
          x: 780,
          y: 120
        }
      ];

  // Update existing node properties
  if (baseEnvs[0]) {
    baseEnvs[0].hostCount = wizard.clusters.reduce((acc, c) => acc + c.hostCount, 0);
    baseEnvs[0].cidrBlock = wizard.sourceMgmtCidr;
    baseEnvs[0].nodeSku = wizard.hardwareSku;
  }
  const targetEnv = baseEnvs.find(e => e.tier === 'target') || baseEnvs[baseEnvs.length - 1];
  if (targetEnv) {
    targetEnv.hostCount = wizard.targetNodeCount;
    targetEnv.nodeSku = wizard.targetNodeSku;
    targetEnv.cidrBlock = wizard.sddcMgmtCidr;
    targetEnv.storageTB = wizard.decoupledStorageTB;
  }

  const model: DynamicTopologyModel = {
    templateId: wizard.activeTemplate,
    customerName: wizard.customerName,
    architectName: wizard.architectName,
    projectDate: wizard.projectDate,
    environments: baseEnvs,
    interconnectLinks: existingModel?.interconnectLinks || [],
    activeServiceIds: existingModel?.activeServiceIds || [],
    resilience: {
      drTopology: wizard.drConfig.strategy as any,
      targetRpoMinutes: wizard.drConfig.rpoMinutes,
      targetRtoMinutes: wizard.drConfig.rtoMinutes,
      replicationMode: wizard.drConfig.rpoMinutes === 0 ? 'Synchronous' : 'Asynchronous',
      replicationEngine: wizard.drConfig.engine,
      failoverMode: 'Orchestrated Runbook',
      failbackApproach: 'Reverse Delta Sync'
    },
    importedLegacyContext: {
      preservedExtraFields: { ...wizard.preservedLegacyFields }
    }
  };

  const legacyPatch: Record<string, unknown> = {
    customerName: wizard.customerName,
    architectName: wizard.architectName,
    projectDate: wizard.projectDate,
    totalVMCount: baseEnvs[0]?.vmCount || 380,
    cloudNodes: wizard.targetNodeCount,
    nodeSku: wizard.targetNodeSku,
    decoupledStorageTB: wizard.decoupledStorageTB,
    connectivity: wizard.connectivityCarrier,
    landingZone: wizard.landingZonePattern,
    nvaFirewall: wizard.firewallProvider,
    wafSolution: wizard.wafSolution || 'Azure WAF on Application Gateway',
    // Enterprise Multi-Vendor Security Tiers
    externalFirewall: wizard.externalFirewall,
    internalFirewall: wizard.internalFirewall,
    nsxDistributedFirewall: wizard.nsxDistributedFirewall,
    applicationPublishing: wizard.applicationPublishing,
    loadBalancing: wizard.loadBalancing,
    trafficFlows: wizard.trafficFlows,
    // Retain preserved legacy fields
    ...wizard.preservedLegacyFields
  };

  // Only include active DR fields in legacy patch if DR is enabled
  if (wizard.drEnabled) {
    legacyPatch.drEngine = wizard.drConfig.engine;
    legacyPatch.rpoMin = wizard.drConfig.rpoMinutes;
    legacyPatch.rtoMin = wizard.drConfig.rtoMinutes;
    legacyPatch.drStrategy = wizard.drConfig.strategy;
  }

  return { model, legacyPatch };
}

export type FocusedBlueprintTemplate =
  | 'standard'
  | 'carrier-interconnect'
  | 'transit-hub'
  | 'microseg-security'
  | 'storage-dr';

/**
 * Builds the deterministic prompt string for Gemini Imagen 3 with clutter-free topology precision.
 * Supports 4 focused infrastructure environment tracks:
 * 1. Physical Carrier Interconnects & Direct Peering Circuits
 * 2. Transit Hub-and-Spoke & Dynamic BGP Routing
 * 3. Zero-Trust Microsegmentation & Distributed Firewalling
 * 4. Decoupled Storage & Disaster Recovery Replication Flows
 */
export function buildActivePromptString(params: {
  trackTitle: string;
  customerName: string;
  architectName: string;
  projectDate: string;
  envDescriptions: string;
  linkDescriptions: string;
  connectivity: string;
  landingZone: string;
  nvaFirewall: string;
  wafSolution: string;
  storageNote: string;
  drEnabled: boolean;
  drEngine?: string;
  drRpoMinutes?: number;
  drRtoMinutes?: number;
  drStrategy?: string;
  blueprintTemplate?: FocusedBlueprintTemplate | string;
  // Dynamic component toggles & configs
  interconnectEnabled?: boolean;
  interconnectType?: string;
  layer2Extension?: boolean;
  securityNvaEnabled?: boolean;
  cloudNativeEnabled?: boolean;
  cloudNativeServices?: string[];
  vdiEnabled?: boolean;
  vdiPlatform?: string;
  objective?: string;
  // Multi-tier security architecture parameters
  externalFirewallDesc?: string;
  internalFirewallDesc?: string;
  nsxDistributedFirewallDesc?: string;
  applicationPublishingDesc?: string;
  loadBalancingDesc?: string;
  trafficFlowsSummary?: string;
}): string {
  const selectedElements: string[] = [];

  selectedElements.push('On-Premises Datacenter with enterprise compute racks and hypervisor nodes');

  if (params.interconnectEnabled !== false) {
    const l2Note = params.layer2Extension ? 'with Layer 2 Network Extension' : 'direct private circuit';
    selectedElements.push(`Physical Cloud Interconnect (${params.interconnectType || params.connectivity}, ${l2Note})`);
  }

  // Multi-Vendor Security Tiers
  if (params.externalFirewallDesc) {
    selectedElements.push(`External Perimeter Firewall: ${params.externalFirewallDesc}`);
  } else if (params.securityNvaEnabled !== false) {
    selectedElements.push(`Security Perimeter & NVA Hub (${params.nvaFirewall}, Web Application Firewall ${params.wafSolution})`);
  }

  if (params.internalFirewallDesc) {
    selectedElements.push(`Internal Segmentation Firewall: ${params.internalFirewallDesc}`);
  }

  if (params.nsxDistributedFirewallDesc) {
    selectedElements.push(`NSX Distributed Firewall: ${params.nsxDistributedFirewallDesc}`);
  }

  if (params.applicationPublishingDesc) {
    selectedElements.push(`Application Publishing & Ingress Gateway: ${params.applicationPublishingDesc}`);
  }

  if (params.loadBalancingDesc) {
    selectedElements.push(`Application Load Balancing Tier: ${params.loadBalancingDesc}`);
  }

  selectedElements.push(`Primary Cloud SDDC Platform (${params.trackTitle})`);

  if (params.cloudNativeEnabled) {
    const services = params.cloudNativeServices?.length
      ? params.cloudNativeServices.slice(0, 4).join(', ')
      : 'Cloud-Native PaaS, Managed DB, and Storage';
    selectedElements.push(`Cloud-Native Services platform tier (${services}) - distinctly separated from security perimeter`);
  }

  if (params.vdiEnabled) {
    selectedElements.push(`Virtual Desktops VDI cluster (${params.vdiPlatform || 'Azure Virtual Desktop'}) on dedicated platform pod`);
  }

  if (params.trafficFlowsSummary) {
    selectedElements.push(`Verified Traffic Flow Controls: ${params.trafficFlowsSummary}`);
  }

  const drClause = params.drEnabled
    ? `Business Continuity & Resilience: Replicated via ${params.drEngine || 'Automated DR'} with ${
        params.drRpoMinutes === 0 ? '0-minute Synchronous Zero Data Loss RPO' : `${params.drRpoMinutes}-minute RPO`
      }, ${params.drRtoMinutes || 15}-minute RTO, disaster recovery strategy "${params.drStrategy || 'Pilot Light'}".`
    : `Business Continuity: Disaster recovery not in scope for current architecture tier (standalone single-site topology).`;

  if (params.drEnabled) {
    selectedElements.push(`Secondary Disaster Recovery site (${params.drEngine || 'Automated DR'} with ${params.drRpoMinutes}-minute RPO)`);
  }

  if (params.storageNote && !params.storageNote.includes('No external')) {
    selectedElements.push(`Decoupled External Storage (${params.storageNote})`);
  }

  const componentsPrompt = selectedElements.map(e => `• ${e}`).join('\n');

  return `Professional 3D isometric cloud architecture illustration on a deep slate navy canvas (#020617) for ${params.customerName}.
Architecture Subject: ${params.trackTitle}.
${drClause}
Show ONLY these selected infrastructure components:
${componentsPrompt}

Strict Visual & Connectivity Rules:
- Render realistic, sleek 3D cloud and datacenter elements with clear component nameplate labels.
- Represent Layer 2 extensions, interconnects, external firewalls, internal segmentation firewalls, NSX DFW, publishing platforms, load balancers, cloud-native services, VDI, and Disaster Recovery distinctly.
- Keep external perimeter and internal segmentation firewalls on their own designated inspection planes.
- Draw clean, direct illuminated network tubes or connection paths connecting only the components where connections are actually required.
- Absolutely avoid decorative, unnecessary, duplicate, or tangled lines.
- Include component names and labels, but DO NOT display configuration details, IP addresses, CIDRs, routing tables, or lengthy technical text in the illustration.
- Orthographic 3D perspective, polished executive presentation grade clarity, balanced spacing, high-end technical enterprise illustration.`;
}
