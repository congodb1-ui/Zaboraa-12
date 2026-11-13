import {
  ALLOWED_DR_ENGINES,
  ALLOWED_STORAGE_PROVIDERS,
  ALLOWED_FIREWALLS,
  ALLOWED_INTERCONNECTS,
  ALLOWED_LANDING_ZONES,
  ALLOWED_WAF_SOLUTIONS,
  ALLOWED_VDI_PLATFORMS,
  ALLOWED_MIGRATION_TOOLS,
  ALLOWED_NODE_SKUS
} from '../data/templateStrings';
import { CANONICAL_TEMPLATES, getCompatibilityForPlatform } from './architectureCompatibilityRules';

export type ParameterStatus = 'mandatory' | 'optional' | 'hidden';

export interface ParameterControlMeta {
  key: string;
  label: string;
  step: 1 | 2 | 3 | 4 | 5;
  stepName: string;
  category: 'Strategic Scope' | 'Source Infrastructure' | 'Landing Zone & VDI' | 'Security & Perimeter' | 'Target SDDC & DR' | string;
  description: string;
  impactIfHidden: string;
  defaultStatus: ParameterStatus;
  isCustom?: boolean;
  helpText?: string;
  defaultValue?: string;
  options?: string[];
}

export const BLUEPRINT_PARAMETERS_REGISTRY: ParameterControlMeta[] = [
  // Step 1: Scope & Strategy
  {
    key: 'projectObjective',
    label: 'Cloud Architecture Objective',
    step: 1,
    stepName: 'Objective',
    category: 'Strategic Scope',
    description: 'Datacenter Evacuation, Hybrid DC Extension, DR Target, or Migrate & DR.',
    impactIfHidden: 'Hides objective selector; defaults to Migrate & Setup DR.',
    defaultStatus: 'mandatory'
  },
  {
    key: 'footprintScope',
    label: 'Architecture Footprint Scope',
    step: 1,
    stepName: 'Objective',
    category: 'Strategic Scope',
    description: 'Private SDDC, Native Cloud Hub, or Hybrid Multi-Cloud.',
    impactIfHidden: 'Hides scope selector; defaults to Hybrid Multi-Cloud.',
    defaultStatus: 'optional'
  },

  // Step 2: Source Infrastructure Inventory
  {
    key: 'sourceInventoryMetrics',
    label: 'Source Workload Capacity Inventory (VMs, vCPU, RAM, TB)',
    step: 2,
    stepName: 'Source Inventory',
    category: 'Source Infrastructure',
    description: 'On-premises VM inventory, core allocation, and capacity footprint.',
    impactIfHidden: 'Hides cluster host sizing inputs and uses default baseline metrics.',
    defaultStatus: 'mandatory'
  },
  {
    key: 'hardwareSpecifications',
    label: 'Source Hardware OEM Vendor & Host Sizing (Dell, HPE, Cisco UCS)',
    step: 2,
    stepName: 'Source Inventory',
    category: 'Source Infrastructure',
    description: 'Hardware OEM vendor, generation, socket, and memory configurations.',
    impactIfHidden: 'Removes on-premises server OEM vendor and generation selectors.',
    defaultStatus: 'optional'
  },
  {
    key: 'workloadVlans',
    label: 'Workload VLANs & Layer 2 Subsegments Table',
    step: 2,
    stepName: 'Source Inventory',
    category: 'Source Infrastructure',
    description: 'Granular subnets and VLAN segmentation table for stretched layer-2 networks.',
    impactIfHidden: 'Hides granular VLAN table from Step 2.',
    defaultStatus: 'optional'
  },
  {
    key: 'sourceMgmtCidr',
    label: 'Source Datacenter Management CIDR Block',
    step: 2,
    stepName: 'Source Inventory',
    category: 'Source Infrastructure',
    description: 'Validates on-premises ESXi/vCenter management IP space.',
    impactIfHidden: 'Hides on-prem management subnet input.',
    defaultStatus: 'optional'
  },

  // Step 3: Landing Zone & VDI
  {
    key: 'landingZoneTransit',
    label: 'Cloud Landing Zone & Transit Fabric Architecture',
    step: 3,
    stepName: 'Landing Zone',
    category: 'Landing Zone & VDI',
    description: 'Azure Virtual WAN, AWS Transit Gateway, GCP NCC / Shared VPC Hub.',
    impactIfHidden: 'Applies target cloud default landing zone automatically.',
    defaultStatus: 'mandatory'
  },
  {
    key: 'sddcMgmtCidr',
    label: 'Target SDDC Management CIDR (/22 or /21)',
    step: 3,
    stepName: 'Landing Zone',
    category: 'Landing Zone & VDI',
    description: 'Strict non-overlapping private allocation for vCenter, NSX-T, HCX appliances.',
    impactIfHidden: 'Hides CIDR prompt and provisions default uncollided /22 range.',
    defaultStatus: 'mandatory'
  },
  {
    key: 'transitInterconnect',
    label: 'Dedicated Cloud Interconnect & Bandwidth (ExpressRoute / Direct Connect)',
    step: 3,
    stepName: 'Landing Zone',
    category: 'Landing Zone & VDI',
    description: 'Dedicated 10/100 Gbps dedicated cloud circuits and dynamic BGP peering.',
    impactIfHidden: 'Removes dedicated interconnect selector; uses template defaults.',
    defaultStatus: 'optional'
  },
  {
    key: 'vdiFleet',
    label: 'Virtual Desktop Infrastructure (AVD / Horizon / Citrix / Frame)',
    step: 3,
    stepName: 'Landing Zone',
    category: 'Landing Zone & VDI',
    description: 'Configures virtual desktop host pools, user seats, and profile shares.',
    impactIfHidden: 'Completely removes VDI configuration card from Step 3.',
    defaultStatus: 'optional'
  },
  {
    key: 'cloudNativeServices',
    label: 'Cloud-Native PaaS Services Tier (EKS/AKS/GKE, Cloud SQL, S3)',
    step: 3,
    stepName: 'Landing Zone',
    category: 'Landing Zone & VDI',
    description: 'Modern managed cloud PaaS services connected via Private Endpoints.',
    impactIfHidden: 'Removes Cloud-Native PaaS services card from Step 3.',
    defaultStatus: 'optional'
  },

  // Step 4: Security & Perimeter
  {
    key: 'externalFirewall',
    label: 'North-South Perimeter Next-Gen Firewall (Palo Alto, Fortinet, Azure FW)',
    step: 4,
    stepName: 'Security & WAF',
    category: 'Security & Perimeter',
    description: 'Edge security appliance, deployment mode (Active/Passive, GWLB, ARS), and inspection policy.',
    impactIfHidden: 'Removes external firewall selection card from Step 4.',
    defaultStatus: 'mandatory'
  },
  {
    key: 'internalFirewall',
    label: 'East-West Internal Segmentation Firewall (NVA)',
    step: 4,
    stepName: 'Security & WAF',
    category: 'Security & Perimeter',
    description: 'Dedicated internal firewall inspecting traffic between virtual networks and zones.',
    impactIfHidden: 'Removes internal segmentation firewall card from Step 4.',
    defaultStatus: 'optional'
  },
  {
    key: 'nsxDistributedFirewall',
    label: 'NSX Distributed Firewall (DFW) / Microsegmentation',
    step: 4,
    stepName: 'Security & WAF',
    category: 'Security & Perimeter',
    description: 'Kernel-level distributed microsegmentation, zero-trust policies, and IDPS.',
    impactIfHidden: 'Removes NSX Distributed Firewall card from Step 4.',
    defaultStatus: 'optional'
  },
  {
    key: 'wafSecurity',
    label: 'Web Application Firewall (Cloud Armor, AWS WAF, App Gateway)',
    step: 4,
    stepName: 'Security & WAF',
    category: 'Security & Perimeter',
    description: 'Layer 7 application protection, OWASP Top 10 mitigation, and bot management.',
    impactIfHidden: 'Removes WAF selection card from Step 4.',
    defaultStatus: 'optional'
  },
  {
    key: 'applicationPublishing',
    label: 'External Application Publishing Platform (VAP / Citrix / F5 / ZTNA)',
    step: 4,
    stepName: 'Security & WAF',
    category: 'Security & Perimeter',
    description: 'Reverse proxy, zero-trust network access, and SSL offload platforms.',
    impactIfHidden: 'Removes application publishing platform card from Step 4.',
    defaultStatus: 'optional'
  },
  {
    key: 'loadBalancing',
    label: 'Advanced Load Balancing (VMware Avi Vantage ALB / Hyperscaler ALB)',
    step: 4,
    stepName: 'Security & WAF',
    category: 'Security & Perimeter',
    description: 'Software-defined application delivery controller and load balancer.',
    impactIfHidden: 'Removes load balancing selection card from Step 4.',
    defaultStatus: 'optional'
  },
  {
    key: 'trafficFlowsMatrix',
    label: 'Interactive Traffic Flow Inspection Matrix (6-Path Routing)',
    step: 4,
    stepName: 'Security & WAF',
    category: 'Security & Perimeter',
    description: 'Configurable traffic paths (Internet Ingress/Egress, App-to-App, Microseg, Mgmt).',
    impactIfHidden: 'Removes the traffic flow routing matrix editor from Step 4.',
    defaultStatus: 'optional'
  },

  // Step 5: Target SDDC & Disaster Recovery
  {
    key: 'targetNodeSizing',
    label: 'Target Bare-Metal Node SKU & Node Count Sizing',
    step: 5,
    stepName: 'Target SDDC & DR',
    category: 'Target SDDC & DR',
    description: 'Cloud host instance types (AV64, AN36P, ve1, i4i.metal) and cluster quorum.',
    impactIfHidden: 'Uses template default node specifications automatically.',
    defaultStatus: 'mandatory'
  },
  {
    key: 'decoupledStorage',
    label: 'Decoupled External Storage (ANF, GCNV, FSx ONTAP, DSF)',
    step: 5,
    stepName: 'Target SDDC & DR',
    category: 'Target SDDC & DR',
    description: 'External elastic NFS datastores decoupling storage growth from host licensing.',
    impactIfHidden: 'Removes external decoupled storage configuration card from Step 5.',
    defaultStatus: 'optional'
  },
  {
    key: 'drReplication',
    label: 'Disaster Recovery Engine & RPO/RTO SLAs (SRM, Nutanix Metro, Zerto)',
    step: 5,
    stepName: 'Target SDDC & DR',
    category: 'Target SDDC & DR',
    description: 'Replication technology, automated runbooks, recovery time & point objectives.',
    impactIfHidden: 'Removes Disaster Recovery configuration section from Step 5.',
    defaultStatus: 'optional'
  },
  {
    key: 'aiIsometricBlueprint',
    label: 'AI 3D Isometric Architecture Blueprint Generator Engine',
    step: 5,
    stepName: 'Target SDDC & DR',
    category: 'Target SDDC & DR',
    description: 'Server-side generative AI 3D rendering with glowing neon transit corridors.',
    impactIfHidden: 'Hides AI generation controls; uses 4K vector blueprint preview and export.',
    defaultStatus: 'optional'
  }
];

export interface AdminTemplateDef {
  id: string;
  title: string;
  provider: 'Microsoft Azure' | 'Google Cloud' | 'Amazon Web Services' | 'Multi-Cloud' | string;
  badge: string;
  subtitle?: string;
  description: string;
  targetProvider: 'azure' | 'gcp' | 'aws' | 'hybrid';
  targetPlatform: 'avs-gen2' | 'nc2-azure' | 'gcve' | 'vmc-aws' | 'hybrid-mesh';
  sourcePlatform: 'vmware' | 'nutanix' | 'hyperv' | 'baremetal';
  sourceTech: string;
  targetTech: string;
  nodeSku: string;
  defaultSku?: string;
  recommendedNodes: number;
  defaultNodeCount?: number;
  interconnect: string;
  defaultInterconnect?: string;
  security: string;
  storage: string;
  defaultStorage?: string;
  storageTB: number;
  defaultStorageTB?: number;
  firewall: string;
  defaultFirewall?: string;
  landingZone: string;
  defaultLandingZone?: string;
  drEngine: string;
  defaultDrEngine?: string;
  drRpoMinutes?: number;
  drRtoMinutes?: number;
  drStrategy?: string;
  strategy?: string;
  recommendedMigrationTool: string;
  isCustom?: boolean;
  enabled?: boolean;
}

// Backward compatible constraints interface
export interface AdminParamConstraints {
  sddcMgmtCidr: 'mandatory' | 'optional';
  decoupledStorage: 'mandatory' | 'optional';
  firewallNva: 'mandatory' | 'optional';
  cloudNative: 'mandatory' | 'optional';
  vdiConfig: 'mandatory' | 'optional';
  drConfig: 'mandatory' | 'optional';
}

export type AdminBlueprintParameterMap = Record<string, ParameterStatus>;

export interface AdminControlStudioState {
  templates: AdminTemplateDef[];
  parameters?: ParameterControlMeta[];
  parameterControls: AdminBlueprintParameterMap;
  constraints: AdminParamConstraints; // Kept for backward compatibility
  lastUpdated: string;
}

export const STORAGE_KEY_ADMIN_PARAM_CONTROLS = 'zaboraa_admin_param_controls';

export const DEFAULT_PARAMETER_CONTROLS: AdminBlueprintParameterMap = {
  projectObjective: 'mandatory',
  footprintScope: 'optional',
  sourceInventoryMetrics: 'mandatory',
  hardwareSpecifications: 'optional',
  workloadVlans: 'optional',
  sourceMgmtCidr: 'optional',
  landingZoneTransit: 'mandatory',
  sddcMgmtCidr: 'mandatory',
  transitInterconnect: 'optional',
  vdiFleet: 'optional',
  cloudNativeServices: 'optional',
  externalFirewall: 'mandatory',
  internalFirewall: 'optional',
  nsxDistributedFirewall: 'optional',
  wafSecurity: 'optional',
  applicationPublishing: 'optional',
  loadBalancing: 'optional',
  trafficFlowsMatrix: 'optional',
  targetNodeSizing: 'mandatory',
  decoupledStorage: 'optional',
  drReplication: 'optional',
  aiIsometricBlueprint: 'optional'
};

export const DEFAULT_ADMIN_CONSTRAINTS: AdminParamConstraints = {
  sddcMgmtCidr: 'mandatory',
  decoupledStorage: 'optional',
  firewallNva: 'mandatory',
  cloudNative: 'optional',
  vdiConfig: 'optional',
  drConfig: 'optional'
};

export const DEFAULT_ADMIN_TEMPLATES: AdminTemplateDef[] = [
  {
    id: 'vmware-to-avs',
    title: 'VMware to AVS',
    provider: 'Microsoft Azure',
    badge: 'Azure VMware Solution',
    subtitle: 'AV64 + Direct vNet + ANF + HCX',
    description: 'On-premises VMware vSphere to Azure VMware Solution (AVS Gen 2 bare-metal AV64 nodes) with ExpressRoute FastPath and HCX.',
    targetProvider: 'azure',
    targetPlatform: 'avs-gen2',
    sourcePlatform: 'vmware',
    sourceTech: 'VMware vSphere 7.0/8.0 (ESXi)',
    targetTech: 'Azure VMware Solution (AVS Gen 2)',
    nodeSku: 'AV64',
    recommendedNodes: 4,
    interconnect: 'Azure ExpressRoute FastPath (10 Gbps)',
    security: 'Palo Alto Networks VM-Series',
    storage: 'Azure NetApp Files (ANF NFS Datastore)',
    storageTB: 120,
    firewall: 'Palo Alto Networks VM-Series',
    landingZone: 'Azure Virtual WAN Hub-and-Spoke',
    drEngine: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
    drRpoMinutes: 5,
    drRtoMinutes: 20,
    drStrategy: 'Pilot Light (3-Node Minimum)',
    recommendedMigrationTool: 'VMware HCX Enterprise',
    enabled: true
  },
  {
    id: 'vmware-to-nc2',
    title: 'VMware to NC2 on Azure',
    provider: 'Microsoft Azure',
    badge: 'Nutanix on Azure',
    subtitle: 'Nutanix AN36P + Move + Prism',
    description: 'Cross-hypervisor migration from VMware vSphere to Nutanix Cloud Clusters (NC2) running natively on Azure bare-metal AN36P nodes.',
    targetProvider: 'azure',
    targetPlatform: 'nc2-azure',
    sourcePlatform: 'vmware',
    sourceTech: 'VMware vSphere (ESXi Clusters)',
    targetTech: 'Nutanix NC2 on Azure Bare-Metal',
    nodeSku: 'AN36P',
    recommendedNodes: 4,
    interconnect: 'Azure ExpressRoute Dedicated Circuit (10 Gbps)',
    security: 'Azure Firewall Premium / Native',
    storage: 'Native Nutanix Distributed Storage Fabric (DSF)',
    storageTB: 80,
    firewall: 'Azure Firewall Premium / Native',
    landingZone: 'Azure Virtual WAN Hub-and-Spoke',
    drEngine: 'Nutanix Protection Domains (NearSync & Metro Availability)',
    drRpoMinutes: 15,
    drRtoMinutes: 60,
    drStrategy: 'Pilot Light (3-Node Minimum)',
    recommendedMigrationTool: 'Nutanix Move',
    enabled: true
  },
  {
    id: 'nutanix-to-nc2',
    title: 'Nutanix to NC2 on Azure',
    provider: 'Microsoft Azure',
    badge: 'Nutanix AOS / AHV Native',
    subtitle: 'AOS 6.8 + DSF + Metro Protection',
    description: 'Seamless on-premises Nutanix AOS/AHV estate extension to NC2 on Azure with native Prism Central orchestration and Nutanix Move.',
    targetProvider: 'azure',
    targetPlatform: 'nc2-azure',
    sourcePlatform: 'nutanix',
    sourceTech: 'On-Premises Nutanix AOS / AHV',
    targetTech: 'Nutanix NC2 on Azure (Prism Central)',
    nodeSku: 'AN36P',
    recommendedNodes: 4,
    interconnect: 'Azure ExpressRoute Dedicated Circuit (10 Gbps)',
    security: 'Azure Firewall Premium / Native',
    storage: 'Native Nutanix Distributed Storage Fabric (DSF)',
    storageTB: 80,
    firewall: 'Azure Firewall Premium / Native',
    landingZone: 'Azure Virtual WAN Hub-and-Spoke',
    drEngine: 'Nutanix Protection Domains (NearSync & Metro Availability)',
    drRpoMinutes: 15,
    drRtoMinutes: 60,
    drStrategy: 'Pilot Light (3-Node Minimum)',
    recommendedMigrationTool: 'Nutanix Move',
    enabled: true
  },
  {
    id: 'vmware-to-gcve',
    title: 'VMware to GCVE',
    provider: 'Google Cloud',
    badge: 'Google Cloud VMware Engine',
    subtitle: 've1-standard-72 + GCNV + HCX',
    description: 'Enterprise VMware workloads to Google Cloud VMware Engine (ve1-standard-72 nodes) with Cloud Interconnect and Google Cloud NetApp Volumes.',
    targetProvider: 'gcp',
    targetPlatform: 'gcve',
    sourcePlatform: 'vmware',
    sourceTech: 'VMware vSphere Private SDDC',
    targetTech: 'Google Cloud VMware Engine (GCVE)',
    nodeSku: 've1-standard-72',
    recommendedNodes: 4,
    interconnect: 'Google Cloud Dedicated Interconnect (10 Gbps)',
    security: 'Palo Alto Networks VM-Series',
    storage: 'Google Cloud NetApp Volumes (GCNV NFS Datastore)',
    storageTB: 100,
    firewall: 'Palo Alto Networks VM-Series',
    landingZone: 'Google Cloud Shared VPC + Cloud NCC',
    drEngine: 'Zerto Continuous Data Protection (CDP)',
    drRpoMinutes: 15,
    drRtoMinutes: 30,
    drStrategy: 'Pilot Light (3-Node Minimum)',
    recommendedMigrationTool: 'VMware HCX Enterprise',
    enabled: true
  },
  {
    id: 'vmware-to-vmc',
    title: 'VMware to VMC on AWS',
    provider: 'Amazon Web Services',
    badge: 'VMware Cloud on AWS',
    subtitle: 'i4i.metal + FSx ONTAP + TGW',
    description: 'VMware vSphere clusters to VMware Cloud on AWS (i4i.metal nodes) with AWS Direct Connect and Amazon FSx for NetApp ONTAP.',
    targetProvider: 'aws',
    targetPlatform: 'vmc-aws',
    sourcePlatform: 'vmware',
    sourceTech: 'Enterprise vCenter & vSphere',
    targetTech: 'VMware Cloud on AWS (VMC)',
    nodeSku: 'i4i.metal',
    recommendedNodes: 3,
    interconnect: 'AWS Direct Connect (10 Gbps)',
    security: 'Fortinet FortiGate-VM',
    storage: 'Amazon FSx for NetApp ONTAP (NFS Datastore)',
    storageTB: 150,
    firewall: 'Fortinet FortiGate-VM',
    landingZone: 'AWS Transit Gateway (TGW) Hub',
    drEngine: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
    drRpoMinutes: 15,
    drRtoMinutes: 30,
    drStrategy: 'Pilot Light (3-Node Minimum)',
    recommendedMigrationTool: 'VMware HCX Enterprise',
    enabled: true
  },
  {
    id: 'custom-path',
    title: 'Hybrid Extension & Burst',
    provider: 'Microsoft Azure',
    badge: 'Hybrid Mesh',
    subtitle: 'Datacenter Burst + L2 Network Stretch',
    description: 'Multi-datacenter hybrid mesh: dynamically burst workloads across on-premises clusters and hyperscaler landing zones with Layer 2 stretch.',
    targetProvider: 'azure',
    targetPlatform: 'avs-gen2',
    sourcePlatform: 'vmware',
    sourceTech: 'Hybrid Enterprise SDDC',
    targetTech: 'Multi-Cloud Stretched SDDC Fabric',
    nodeSku: 'AV64',
    recommendedNodes: 4,
    interconnect: 'Azure ExpressRoute FastPath (10 Gbps)',
    security: 'Palo Alto Networks VM-Series',
    storage: 'Azure NetApp Files (ANF NFS Datastore)',
    storageTB: 80,
    firewall: 'Palo Alto Networks VM-Series',
    landingZone: 'Azure Virtual WAN Hub-and-Spoke',
    drEngine: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
    drRpoMinutes: 15,
    drRtoMinutes: 45,
    drStrategy: 'Warm Standby (Full Cluster)',
    recommendedMigrationTool: 'VMware HCX Enterprise',
    enabled: true
  }
];

export function getAdminControlState(): AdminControlStudioState {
  if (typeof window === 'undefined') {
    return {
      templates: DEFAULT_ADMIN_TEMPLATES,
      parameterControls: DEFAULT_PARAMETER_CONTROLS,
      constraints: DEFAULT_ADMIN_CONSTRAINTS,
      lastUpdated: new Date().toISOString()
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_PARAM_CONTROLS);
    if (!raw) {
      return {
        templates: DEFAULT_ADMIN_TEMPLATES,
        parameterControls: DEFAULT_PARAMETER_CONTROLS,
        constraints: DEFAULT_ADMIN_CONSTRAINTS,
        lastUpdated: new Date().toISOString()
      };
    }
    const parsed = JSON.parse(raw);

    // Merge templates safely ensuring required fields exist and validating per-field options
    let templates: AdminTemplateDef[] = DEFAULT_ADMIN_TEMPLATES;
    if (Array.isArray(parsed.templates) && parsed.templates.length > 0) {
      templates = parsed.templates.map((tpl: any) => {
        const fallback = DEFAULT_ADMIN_TEMPLATES.find((t) => t.id === tpl.id) || DEFAULT_ADMIN_TEMPLATES[0];
        const merged = {
          enabled: true,
          ...fallback,
          ...tpl
        };

        const canonical = CANONICAL_TEMPLATES.find((c) => c.id === merged.id);
        const platform = merged.targetPlatform || (canonical?.targetPlatform) || 'avs-gen2';
        const compat = getCompatibilityForPlatform(platform);

        const corrections: string[] = [];

        // Validate targetPlatform
        const validPlatforms = ['avs-gen2', 'nc2-azure', 'gcve', 'vmc-aws'];
        if (!validPlatforms.includes(merged.targetPlatform)) {
          corrections.push(`targetPlatform (${merged.targetPlatform} -> ${canonical?.targetPlatform || 'avs-gen2'})`);
          merged.targetPlatform = (canonical?.targetPlatform || 'avs-gen2') as any;
        }

        const validCompat = getCompatibilityForPlatform(merged.targetPlatform);

        // Validate firewall
        if (merged.firewall && (!validCompat.allowedFirewalls || !validCompat.allowedFirewalls.includes(merged.firewall))) {
          corrections.push(`firewall (${merged.firewall} -> ${canonical?.defaultFirewall || 'Palo Alto Networks VM-Series'})`);
          merged.firewall = canonical?.defaultFirewall || 'Palo Alto Networks VM-Series';
        }

        // Validate landingZone against target platform compatibility allowed landing zones
        const allowedLzs = (validCompat as any).allowedLandingZones || (validCompat as any).landingZones || [];
        if (merged.landingZone && (!allowedLzs || !allowedLzs.includes(merged.landingZone))) {
          corrections.push(`landingZone (${merged.landingZone} -> ${canonical?.defaultLandingZone || ALLOWED_LANDING_ZONES[0]})`);
          merged.landingZone = canonical?.defaultLandingZone || ALLOWED_LANDING_ZONES[0];
        }

        // Validate drEngine
        if (merged.drEngine && (!validCompat.allowedDrEngines || !validCompat.allowedDrEngines.includes(merged.drEngine))) {
          corrections.push(`drEngine (${merged.drEngine} -> ${canonical?.defaultDrEngine || 'VMware Site Recovery Manager (SRM) + vSphere Replication'})`);
          merged.drEngine = canonical?.defaultDrEngine || 'VMware Site Recovery Manager (SRM) + vSphere Replication';
        }

        // Validate storage
        if (merged.storage && (!validCompat.allowedStorageProviders || !validCompat.allowedStorageProviders.includes(merged.storage))) {
          corrections.push(`storage (${merged.storage} -> ${canonical?.defaultStorage || 'Azure NetApp Files (ANF NFS Datastore)'})`);
          merged.storage = canonical?.defaultStorage || 'Azure NetApp Files (ANF NFS Datastore)';
        }

        // Validate recommendedMigrationTool
        if (merged.recommendedMigrationTool && (!validCompat.allowedMigrationTools || !validCompat.allowedMigrationTools.includes(merged.recommendedMigrationTool as any))) {
          corrections.push(`recommendedMigrationTool (${merged.recommendedMigrationTool} -> ${canonical?.recommendedMigrationTool || 'VMware HCX Enterprise'})`);
          merged.recommendedMigrationTool = canonical?.recommendedMigrationTool || 'VMware HCX Enterprise';
        }

        if (corrections.length > 0) {
          console.warn(`[getAdminControlState] Corrected invalid fields for template "${merged.id}": ${corrections.join(', ')}`);
        }

        return merged;
      });
    }

    // Merge parameter controls
    const parameterControls: AdminBlueprintParameterMap = {
      ...DEFAULT_PARAMETER_CONTROLS,
      ...(parsed.parameterControls || {})
    };

    // If legacy constraints exist, sync them
    if (parsed.constraints) {
      if (parsed.constraints.sddcMgmtCidr) parameterControls.sddcMgmtCidr = parsed.constraints.sddcMgmtCidr;
      if (parsed.constraints.decoupledStorage) parameterControls.decoupledStorage = parsed.constraints.decoupledStorage;
      if (parsed.constraints.firewallNva) parameterControls.externalFirewall = parsed.constraints.firewallNva;
      if (parsed.constraints.cloudNative) parameterControls.cloudNativeServices = parsed.constraints.cloudNative;
      if (parsed.constraints.vdiConfig) parameterControls.vdiFleet = parsed.constraints.vdiConfig;
      if (parsed.constraints.drConfig) parameterControls.drReplication = parsed.constraints.drConfig;
    }

    const constraints: AdminParamConstraints = {
      sddcMgmtCidr: parameterControls.sddcMgmtCidr === 'mandatory' ? 'mandatory' : 'optional',
      decoupledStorage: parameterControls.decoupledStorage === 'mandatory' ? 'mandatory' : 'optional',
      firewallNva: parameterControls.externalFirewall === 'mandatory' ? 'mandatory' : 'optional',
      cloudNative: parameterControls.cloudNativeServices === 'mandatory' ? 'mandatory' : 'optional',
      vdiConfig: parameterControls.vdiFleet === 'mandatory' ? 'mandatory' : 'optional',
      drConfig: parameterControls.drReplication === 'mandatory' ? 'mandatory' : 'optional'
    };

    return {
      templates,
      parameterControls,
      constraints,
      lastUpdated: parsed.lastUpdated || new Date().toISOString()
    };
  } catch (e) {
    console.warn('Failed to parse admin parameter controls from localStorage:', e);
    return {
      templates: DEFAULT_ADMIN_TEMPLATES,
      parameterControls: DEFAULT_PARAMETER_CONTROLS,
      constraints: DEFAULT_ADMIN_CONSTRAINTS,
      lastUpdated: new Date().toISOString()
    };
  }
}

export function saveAdminControlState(
  state: Partial<AdminControlStudioState>
): AdminControlStudioState {
  const current = getAdminControlState();
  const updated: AdminControlStudioState = {
    templates: state.templates || current.templates,
    parameterControls: state.parameterControls || current.parameterControls,
    constraints: state.constraints || current.constraints,
    lastUpdated: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PARAM_CONTROLS, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('zaboraa:admin-params-changed', { detail: updated })
      );
    } catch (e) {
      console.error('Failed to save admin parameter controls to localStorage:', e);
    }
  }

  return updated;
}

export function addAdminTemplate(template: AdminTemplateDef): AdminControlStudioState {
  const state = getAdminControlState();
  const exists = state.templates.some((t) => t.id === template.id);
  const updatedTemplates = exists
    ? state.templates.map((t) => (t.id === template.id ? template : t))
    : [...state.templates, template];
  return saveAdminControlState({ templates: updatedTemplates });
}

export function updateAdminTemplate(
  id: string,
  updated: Partial<AdminTemplateDef>
): AdminControlStudioState {
  const state = getAdminControlState();
  const updatedTemplates = state.templates.map((t) =>
    t.id === id ? { ...t, ...updated } : t
  );
  return saveAdminControlState({ templates: updatedTemplates });
}

export function deleteAdminTemplate(id: string): AdminControlStudioState {
  const state = getAdminControlState();
  const updatedTemplates = state.templates.filter((t) => t.id !== id);
  return saveAdminControlState({ templates: updatedTemplates });
}

export function toggleParameterControl(
  key: string,
  status: ParameterStatus
): AdminControlStudioState {
  const state = getAdminControlState();
  const updatedControls = {
    ...state.parameterControls,
    [key]: status
  };
  return saveAdminControlState({ parameterControls: updatedControls });
}

export function resetAdminControlState(): AdminControlStudioState {
  const resetState: AdminControlStudioState = {
    templates: DEFAULT_ADMIN_TEMPLATES,
    parameterControls: DEFAULT_PARAMETER_CONTROLS,
    constraints: DEFAULT_ADMIN_CONSTRAINTS,
    lastUpdated: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_PARAM_CONTROLS);
      window.dispatchEvent(
        new CustomEvent('zaboraa:admin-params-changed', { detail: resetState })
      );
    } catch (e) {
      console.error('Failed to reset admin parameter controls:', e);
    }
  }

  return resetState;
}
