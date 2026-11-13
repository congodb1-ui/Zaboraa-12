/**
 * Architecture Compatibility & Vendor Filtering Rules
 * Enforces vendor compatibility across Hypervisors, Clouds, Storage, Firewalls, and Migration Tools.
 * Automatically clears stale incompatible selections when switching templates or platforms.
 */

import {
  WizardState,
  ArchitectureTemplateChoice,
  CHOICE_TO_TEMPLATE_ID_MAP,
  createDefaultSourceItem,
  createDefaultTargetItem,
  getTargetConstraintsForObjective
} from '../types/wizardStateAdapter';
import { parseAndValidateCidr } from './cidrUtils';
import { getAdminControlState } from './adminParameterControls';

export interface TemplateDefinition {
  id: ArchitectureTemplateChoice;
  title: string;
  badge: string;
  description: string;
  targetProvider: 'azure' | 'aws' | 'gcp' | 'multi';
  targetPlatform: 'avs-gen2' | 'nc2-azure' | 'gcve' | 'vmc-aws';
  sourcePlatform: 'vmware' | 'nutanix' | 'hyperv' | 'baremetal';
  defaultSku: string;
  defaultNodeCount: number;
  recommendedMigrationTool: 'VMware HCX Enterprise' | 'Nutanix Move' | 'AWS MGN' | 'None';
  defaultInterconnect: string;
  defaultStorage: string;
  defaultStorageTB: number;
  defaultFirewall: string;
  defaultLandingZone: string;
  defaultDrEngine: string;
  drRpoMinutes?: number;
  drRtoMinutes?: number;
  strategy?: string;
  drStrategy?: string;
}

export const CANONICAL_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'vmware-to-avs',
    title: 'VMware to AVS',
    badge: 'Azure VMware Solution',
    description: 'On-premises VMware vSphere to Azure VMware Solution (AVS Gen 2 bare-metal AV64 nodes) with ExpressRoute FastPath and HCX.',
    targetProvider: 'azure',
    targetPlatform: 'avs-gen2',
    sourcePlatform: 'vmware',
    defaultSku: 'AV64',
    defaultNodeCount: 4,
    recommendedMigrationTool: 'VMware HCX Enterprise',
    defaultInterconnect: 'Azure ExpressRoute FastPath (10 Gbps)',
    defaultStorage: 'Azure NetApp Files (ANF NFS Datastore)',
    defaultStorageTB: 120,
    defaultFirewall: 'Palo Alto Networks VM-Series',
    defaultLandingZone: 'Azure Virtual WAN Hub-and-Spoke',
    defaultDrEngine: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
    drRpoMinutes: 5,
    drRtoMinutes: 20,
    drStrategy: 'Pilot Light (3-Node Minimum)'
  },
  {
    id: 'vmware-to-nc2',
    title: 'VMware to NC2 on Azure',
    badge: 'Nutanix on Azure',
    description: 'Cross-hypervisor migration from VMware vSphere to Nutanix Cloud Clusters (NC2) running natively on Azure bare-metal AN36P nodes.',
    targetProvider: 'azure',
    targetPlatform: 'nc2-azure',
    sourcePlatform: 'vmware',
    defaultSku: 'AN36P',
    defaultNodeCount: 4,
    recommendedMigrationTool: 'Nutanix Move',
    defaultInterconnect: 'Azure ExpressRoute Dedicated Circuit (10 Gbps)',
    defaultStorage: 'Native Nutanix Distributed Storage Fabric (DSF)',
    defaultStorageTB: 80,
    defaultFirewall: 'Azure Firewall Premium / Native',
    defaultLandingZone: 'Azure Virtual WAN Hub-and-Spoke',
    defaultDrEngine: 'Nutanix Protection Domains (NearSync & Metro Availability)',
    drRpoMinutes: 15,
    drRtoMinutes: 60,
    drStrategy: 'Pilot Light (3-Node Minimum)'
  },
  {
    id: 'nutanix-to-nc2',
    title: 'Nutanix to NC2 on Azure',
    badge: 'Nutanix AOS / AHV Native',
    description: 'Seamless on-premises Nutanix AOS/AHV estate extension to NC2 on Azure with native Prism Central orchestration and Nutanix Move.',
    targetProvider: 'azure',
    targetPlatform: 'nc2-azure',
    sourcePlatform: 'nutanix',
    defaultSku: 'AN36P',
    defaultNodeCount: 4,
    recommendedMigrationTool: 'Nutanix Move',
    defaultInterconnect: 'Azure ExpressRoute Dedicated Circuit (10 Gbps)',
    defaultStorage: 'Native Nutanix Distributed Storage Fabric (DSF)',
    defaultStorageTB: 80,
    defaultFirewall: 'Azure Firewall Premium / Native',
    defaultLandingZone: 'Azure Virtual WAN Hub-and-Spoke',
    defaultDrEngine: 'Nutanix Protection Domains (NearSync & Metro Availability)',
    drRpoMinutes: 15,
    drRtoMinutes: 60,
    drStrategy: 'Pilot Light (3-Node Minimum)'
  },
  {
    id: 'vmware-to-gcve',
    title: 'VMware to GCVE',
    badge: 'Google Cloud VMware Engine',
    description: 'Enterprise VMware workloads to Google Cloud VMware Engine (ve1-standard-72 nodes) with Cloud Interconnect and Google Cloud NetApp Volumes.',
    targetProvider: 'gcp',
    targetPlatform: 'gcve',
    sourcePlatform: 'vmware',
    defaultSku: 've1-standard-72',
    defaultNodeCount: 4,
    recommendedMigrationTool: 'VMware HCX Enterprise',
    defaultInterconnect: 'Google Cloud Dedicated Interconnect (10 Gbps)',
    defaultStorage: 'Google Cloud NetApp Volumes (GCNV NFS Datastore)',
    defaultStorageTB: 100,
    defaultFirewall: 'Palo Alto Networks VM-Series',
    defaultLandingZone: 'Google Cloud Shared VPC + Cloud NCC',
    defaultDrEngine: 'Zerto Continuous Data Protection (CDP)',
    drRpoMinutes: 15,
    drRtoMinutes: 30,
    drStrategy: 'Pilot Light (3-Node Minimum)'
  },
  {
    id: 'vmware-to-vmc',
    title: 'VMware to VMC on AWS',
    badge: 'VMware Cloud on AWS',
    description: 'VMware vSphere clusters to VMware Cloud on AWS (i4i.metal nodes) with AWS Direct Connect and Amazon FSx for NetApp ONTAP.',
    targetProvider: 'aws',
    targetPlatform: 'vmc-aws',
    sourcePlatform: 'vmware',
    defaultSku: 'i4i.metal',
    defaultNodeCount: 3,
    recommendedMigrationTool: 'VMware HCX Enterprise',
    defaultInterconnect: 'AWS Direct Connect (10 Gbps)',
    defaultStorage: 'Amazon FSx for NetApp ONTAP (NFS Datastore)',
    defaultStorageTB: 150,
    defaultFirewall: 'Fortinet FortiGate-VM',
    defaultLandingZone: 'AWS Transit Gateway (TGW) Hub',
    defaultDrEngine: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
    drRpoMinutes: 15,
    drRtoMinutes: 30,
    drStrategy: 'Pilot Light (3-Node Minimum)'
  },
  {
    id: 'custom-path',
    title: 'Hybrid Extension',
    badge: 'Hybrid Cloud Burst',
    description: 'Extend on-premises datacenter into hybrid cloud with bidirectional VM mobility, L2 network stretch, and elastic compute burst.',
    targetProvider: 'azure',
    targetPlatform: 'avs-gen2',
    sourcePlatform: 'vmware',
    defaultSku: 'AV64',
    defaultNodeCount: 4,
    recommendedMigrationTool: 'VMware HCX Enterprise',
    defaultInterconnect: 'Azure ExpressRoute FastPath (10 Gbps)',
    defaultStorage: 'Azure NetApp Files (ANF NFS Datastore)',
    defaultStorageTB: 80,
    defaultFirewall: 'Palo Alto Networks VM-Series',
    defaultLandingZone: 'Azure Virtual WAN Hub-and-Spoke',
    defaultDrEngine: 'VMware Site Recovery Manager (SRM) + vSphere Replication',
    drRpoMinutes: 15,
    drRtoMinutes: 45,
    drStrategy: 'Warm Standby (Full Cluster)'
  }
];

export interface CompatibilityFilterResult {
  allowedMigrationTools: Array<'VMware HCX Enterprise' | 'Nutanix Move' | 'AWS MGN' | 'None'>;
  allowedStorageProviders: string[];
  allowedFirewalls: string[];
  allowedInterconnects: string[];
  allowedVdiPlatforms: Array<'Azure Virtual Desktop (AVD)' | 'VMware Horizon Cloud' | 'Citrix DaaS' | 'Nutanix Frame' | 'Amazon WorkSpaces'>;
  allowedDrEngines: string[];
}

export function getCompatibilityForPlatform(platform: string): CompatibilityFilterResult {
  switch (platform) {
    case 'avs-gen1':
    case 'avs-gen2':
      return {
        allowedMigrationTools: ['VMware HCX Enterprise', 'None'],
        allowedStorageProviders: [
          'Azure NetApp Files (ANF NFS Datastore)',
          'Azure Elastic SAN (iSCSI Datastore)',
          'Native vSAN Storage Pool Only'
        ],
        allowedFirewalls: [
          'Azure Firewall Premium / Native',
          'Palo Alto Networks VM-Series',
          'Fortinet FortiGate-VM',
          'Check Point CloudGuard Network'
        ],
        allowedInterconnects: [
          'Azure ExpressRoute FastPath (10 Gbps)',
          'Azure ExpressRoute Standard (1-10 Gbps)',
          'IPsec VPN with BGP Transit'
        ],
        allowedVdiPlatforms: [
          'Azure Virtual Desktop (AVD)',
          'VMware Horizon Cloud',
          'Citrix DaaS'
        ],
        allowedDrEngines: [
          'VMware Site Recovery Manager (SRM) + vSphere Replication',
          'Azure Site Recovery (ASR)',
          'Zerto Continuous Data Protection (CDP)'
        ]
      };

    case 'nc2-azure':
      return {
        allowedMigrationTools: ['Nutanix Move', 'None'],
        allowedStorageProviders: [
          'Native Nutanix Distributed Storage Fabric (DSF)',
          'Azure Blob Storage Backup Tier',
          'Native Storage Pool Only'
        ],
        allowedFirewalls: [
          'Azure Firewall Premium / Native',
          'Palo Alto Networks VM-Series',
          'Fortinet FortiGate-VM'
        ],
        allowedInterconnects: [
          'Azure ExpressRoute Dedicated Circuit (10 Gbps)',
          'Azure ExpressRoute Standard (1-10 Gbps)',
          'IPsec VPN with BGP Transit'
        ],
        allowedVdiPlatforms: [
          'Citrix DaaS',
          'Nutanix Frame',
          'Azure Virtual Desktop (AVD)'
        ],
        allowedDrEngines: [
          'Nutanix Protection Domains (NearSync & Metro Availability)',
          'Nutanix Leap Disaster Recovery Service',
          'Zerto Continuous Data Protection (CDP)'
        ]
      };

    case 'gcve':
      return {
        allowedMigrationTools: ['VMware HCX Enterprise', 'None'],
        allowedStorageProviders: [
          'Google Cloud NetApp Volumes (GCNV NFS Datastore)',
          'Google Cloud Filestore High Scale',
          'Native vSAN Storage Pool Only'
        ],
        allowedFirewalls: [
          'Google Cloud Firewall Plus (Cloud IDS)',
          'Palo Alto Networks VM-Series',
          'Fortinet FortiGate-VM'
        ],
        allowedInterconnects: [
          'Google Cloud Dedicated Interconnect (10 Gbps)',
          'Google Cloud Partner Interconnect (5 Gbps)',
          'Cloud VPN (HA VPN over Internet)'
        ],
        allowedVdiPlatforms: [
          'Citrix DaaS',
          'VMware Horizon Cloud'
        ],
        allowedDrEngines: [
          'Zerto Continuous Data Protection (CDP)',
          'VMware Site Recovery Manager (SRM) + vSphere Replication'
        ]
      };

    case 'vmc-aws':
      return {
        allowedMigrationTools: ['VMware HCX Enterprise', 'AWS MGN', 'None'],
        allowedStorageProviders: [
          'Amazon FSx for NetApp ONTAP (NFS Datastore)',
          'Amazon EFS Elastic File System',
          'Native vSAN Storage Pool Only'
        ],
        allowedFirewalls: [
          'AWS Network Firewall',
          'Fortinet FortiGate-VM',
          'Palo Alto Networks VM-Series'
        ],
        allowedInterconnects: [
          'AWS Direct Connect (10 Gbps)',
          'AWS Direct Connect with Hosted VIF (1 Gbps)',
          'AWS Site-to-Site IPsec VPN'
        ],
        allowedVdiPlatforms: [
          'Amazon WorkSpaces',
          'VMware Horizon Cloud',
          'Citrix DaaS'
        ],
        allowedDrEngines: [
          'VMware Site Recovery Manager (SRM) + vSphere Replication',
          'AWS Elastic Disaster Recovery (AWS DRS)',
          'Zerto Continuous Data Protection (CDP)'
        ]
      };

    default:
      return {
        allowedMigrationTools: ['VMware HCX Enterprise', 'Nutanix Move', 'AWS MGN', 'None'],
        allowedStorageProviders: [
          'Azure NetApp Files (ANF NFS Datastore)',
          'Amazon FSx for NetApp ONTAP (NFS Datastore)',
          'Google Cloud NetApp Volumes (GCNV NFS Datastore)',
          'Native Storage Pool Only'
        ],
        allowedFirewalls: [
          'Palo Alto Networks VM-Series',
          'Fortinet FortiGate-VM',
          'Azure Firewall Premium / Native',
          'AWS Network Firewall'
        ],
        allowedInterconnects: [
          'Azure ExpressRoute FastPath (10 Gbps)',
          'AWS Direct Connect (10 Gbps)',
          'Google Cloud Dedicated Interconnect (10 Gbps)',
          'IPsec VPN with BGP Transit'
        ],
        allowedVdiPlatforms: [
          'Azure Virtual Desktop (AVD)',
          'Citrix DaaS',
          'VMware Horizon Cloud',
          'Nutanix Frame',
          'Amazon WorkSpaces'
        ],
        allowedDrEngines: [
          'VMware Site Recovery Manager (SRM) + vSphere Replication',
          'Nutanix Protection Domains (NearSync & Metro Availability)',
          'Zerto Continuous Data Protection (CDP)',
          'Azure Site Recovery (ASR)'
        ]
      };
  }
}

/**
 * Sanitizes state when switching templates or platforms to purge stale, incompatible selections.
 */
/**
 * Applies a template to the wizard state, ALWAYS updating template-owned fields,
 * rebuilding sources[] and targets[], preserving user non-template fields, and running
 * compatibility sanitization as a second pass.
 */
export function applyTemplateToWizardState(
  state: WizardState,
  newTemplateId: ArchitectureTemplateChoice
): { state: WizardState; notices: string[] } {
  let template: TemplateDefinition | undefined = undefined;

  if (typeof window !== 'undefined') {
    try {
      const adminState = getAdminControlState();
      const adminMatch = adminState.templates.find((t) => t.id === newTemplateId);
      if (adminMatch) {
        template = {
          id: adminMatch.id as any,
          title: adminMatch.title,
          badge: adminMatch.badge,
          description: adminMatch.description,
          targetProvider:
            adminMatch.targetPlatform === 'gcve' ? 'gcp' :
            adminMatch.targetPlatform === 'vmc-aws' ? 'aws' : 'azure',
          targetPlatform: (adminMatch.targetPlatform || 'avs-gen2') as any,
          sourcePlatform: (adminMatch.sourcePlatform || 'vmware') as any,
          defaultSku: adminMatch.nodeSku,
          defaultNodeCount: adminMatch.recommendedNodes,
          recommendedMigrationTool: (adminMatch.recommendedMigrationTool || 'VMware HCX Enterprise') as any,
          defaultInterconnect: adminMatch.interconnect,
          defaultStorage: adminMatch.storage,
          defaultStorageTB: adminMatch.storageTB || 100,
          defaultFirewall: adminMatch.firewall || adminMatch.security,
          defaultLandingZone: adminMatch.landingZone,
          defaultDrEngine: adminMatch.drEngine,
          drRpoMinutes: adminMatch.drRpoMinutes,
          drRtoMinutes: adminMatch.drRtoMinutes,
          drStrategy: adminMatch.drStrategy || adminMatch.strategy
        };
      }
    } catch {
      // fallback
    }
  }

  if (!template) {
    template = CANONICAL_TEMPLATES.find((t) => t.id === newTemplateId);
  }

  if (!template) {
    return { state: { ...state, templateChoice: newTemplateId }, notices: [] };
  }

  // Cloud-appropriate WAF solution helper
  const wafSolution = template.targetPlatform === 'vmc-aws'
    ? 'AWS WAF'
    : template.targetPlatform === 'gcve'
    ? 'Google Cloud Armor'
    : 'Azure WAF on Application Gateway';

  const isDefaultSddcCidr = !state.sddcMgmtCidr || state.sddcMgmtCidr === '10.240.0.0/22';
  const newSddcCidr = isDefaultSddcCidr ? '10.240.0.0/22' : state.sddcMgmtCidr;

  const targetPlatform = template.targetPlatform;
  const sourcePlatform = template.sourcePlatform;

  // Active template ID mapping
  const activeTemplate = CHOICE_TO_TEMPLATE_ID_MAP[newTemplateId] || 'avs';

  // 1. Rebuild primary source and target
  const newPrimarySource = createDefaultSourceItem(
    sourcePlatform === 'nutanix' ? 'nutanix-onprem' : 'vmware-onprem'
  );

  const newPrimaryTarget = createDefaultTargetItem(
    'Production',
    'Primary Production SDDC',
    targetPlatform,
    {
      nodeSku: template.defaultSku,
      nodeCount: template.defaultNodeCount,
      decoupledStorageTB: template.defaultStorageTB,
      decoupledStorageProvider: template.defaultStorage,
      migrationTool: template.recommendedMigrationTool,
      drEngine: template.defaultDrEngine,
      drRpoMinutes: template.drRpoMinutes ?? 15,
      drRtoMinutes: template.drRtoMinutes ?? 30,
      drStrategy: template.drStrategy || 'Pilot Light (3-Node Minimum)',
      interconnectCircuitType: template.defaultInterconnect,
      layer2Extension: newTemplateId === 'custom-path' ? true : false
    }
  );

  let newTargets = [newPrimaryTarget];
  if (state.drEnabled) {
    const newDrTarget = createDefaultTargetItem(
      'Disaster Recovery',
      'Secondary Disaster Recovery SDDC',
      targetPlatform,
      {
        nodeSku: template.defaultSku,
        nodeCount: Math.max(3, template.defaultNodeCount - 1),
        decoupledStorageTB: Math.round(template.defaultStorageTB / 2),
        decoupledStorageProvider: template.defaultStorage,
        migrationTool: 'None',
        drEngine: template.defaultDrEngine,
        drRpoMinutes: template.drRpoMinutes ?? 5,
        drRtoMinutes: template.drRtoMinutes ?? 20,
        drStrategy: template.drStrategy || 'Pilot Light (3-Node Minimum)',
        interconnectCircuitType: template.defaultInterconnect,
        layer2Extension: newTemplateId === 'custom-path' ? true : false
      }
    );
    newTargets.push(newDrTarget);
  }

  // Preserve user non-template fields: customerName, architectName, projectDate, clusters, objective, etc.
  const updatedState: WizardState = {
    ...state,
    templateChoice: newTemplateId,
    activeTemplate,
    sourcePlatform,
    targetPlatform,
    targetNodeSku: template.defaultSku,
    targetNodeCount: template.defaultNodeCount, // Overwrite exact value
    landingZonePattern: template.defaultLandingZone,
    connectivityCarrier: template.defaultInterconnect,
    firewallProvider: template.defaultFirewall,
    sddcMgmtCidr: newSddcCidr,
    objective: newTemplateId === 'custom-path' ? 'extend-dc' : state.objective,

    interconnectConfig: {
      ...state.interconnectConfig,
      type: template.defaultInterconnect,
      bandwidthGbps: 10,
      fastPathEnabled: template.defaultInterconnect.includes('FastPath'),
      layer2Extension: newTemplateId === 'custom-path' ? true : state.interconnectConfig.layer2Extension
    },

    securityNvaConfig: {
      ...state.securityNvaConfig,
      firewall: template.defaultFirewall,
      wafSolution: wafSolution
    },
    wafSolution: wafSolution,

    decoupledStorageProvider: template.defaultStorage,
    decoupledStorageTB: template.defaultStorageTB,

    otherServicesConfig: {
      ...state.otherServicesConfig,
      decoupledStorageProvider: template.defaultStorage,
      decoupledStorageTB: template.defaultStorageTB,
      migrationAppliance: template.recommendedMigrationTool
    },

    drConfig: {
      ...state.drConfig,
      engine: template.defaultDrEngine,
      rpoMinutes: template.drRpoMinutes ?? 15,
      rtoMinutes: template.drRtoMinutes ?? 30,
      strategy: template.drStrategy || 'Pilot Light (3-Node Minimum)'
    },

    sources: [newPrimarySource],
    targets: newTargets
  };

  // Run compatibility sanitizer pass
  const sanitizeResult = sanitizeWizardStateForTemplate(updatedState, newTemplateId);
  return {
    state: sanitizeResult.state,
    notices: sanitizeResult.clearedNotices
  };
}

export function sanitizeWizardStateForTemplate(
  state: WizardState,
  newTemplateId: ArchitectureTemplateChoice
): { state: WizardState; clearedNotices: string[] } {
  let template: TemplateDefinition | undefined = undefined;

  if (typeof window !== 'undefined') {
    try {
      const adminState = getAdminControlState();
      const adminMatch = adminState.templates.find((t) => t.id === newTemplateId);
      if (adminMatch) {
        template = {
          id: adminMatch.id as any,
          title: adminMatch.title,
          badge: adminMatch.badge,
          description: adminMatch.description,
          targetProvider:
            adminMatch.targetPlatform === 'gcve' ? 'gcp' :
            adminMatch.targetPlatform === 'vmc-aws' ? 'aws' : 'azure',
          targetPlatform: (adminMatch.targetPlatform || 'avs-gen2') as any,
          sourcePlatform: (adminMatch.sourcePlatform || 'vmware') as any,
          defaultSku: adminMatch.nodeSku,
          defaultNodeCount: adminMatch.recommendedNodes,
          recommendedMigrationTool: (adminMatch.recommendedMigrationTool || 'VMware HCX Enterprise') as any,
          defaultInterconnect: adminMatch.interconnect,
          defaultStorage: adminMatch.storage,
          defaultStorageTB: adminMatch.storageTB || 100,
          defaultFirewall: adminMatch.firewall || adminMatch.security,
          defaultLandingZone: adminMatch.landingZone,
          defaultDrEngine: adminMatch.drEngine
        };
      }
    } catch {
      // fallback
    }
  }

  if (!template) {
    template = CANONICAL_TEMPLATES.find((t) => t.id === newTemplateId);
  }

  if (!template) {
    return { state: { ...state, templateChoice: newTemplateId }, clearedNotices: [] };
  }

  const notices: string[] = [];
  const compat = getCompatibilityForPlatform(template.targetPlatform);

  const updatedState: WizardState = {
    ...state,
    templateChoice: newTemplateId,
    targetPlatform: template.targetPlatform,
    sourcePlatform: template.sourcePlatform,
    targetNodeSku: template.defaultSku,
    targetNodeCount: Math.max(state.targetNodeCount, template.defaultNodeCount),
    landingZonePattern: template.defaultLandingZone
  };

  // 1. Sanitize Migration Tool
  if (!compat.allowedMigrationTools.includes(state.otherServicesConfig.migrationAppliance)) {
    notices.push(
      `Updated migration tool from "${state.otherServicesConfig.migrationAppliance}" to "${template.recommendedMigrationTool}" for ${template.title}.`
    );
    updatedState.otherServicesConfig = {
      ...updatedState.otherServicesConfig,
      migrationAppliance: template.recommendedMigrationTool
    };
  }

  // 2. Sanitize Storage Provider
  if (
    updatedState.otherServicesConfig.decoupledStorageEnabled &&
    !compat.allowedStorageProviders.includes(state.otherServicesConfig.decoupledStorageProvider)
  ) {
    notices.push(
      `Adjusted decoupled storage datastore to "${template.defaultStorage}" to match ${template.targetPlatform.toUpperCase()}.`
    );
    updatedState.otherServicesConfig = {
      ...updatedState.otherServicesConfig,
      decoupledStorageProvider: template.defaultStorage,
      decoupledStorageTB: template.defaultStorageTB
    };
    updatedState.decoupledStorageProvider = template.defaultStorage;
    updatedState.decoupledStorageTB = template.defaultStorageTB;
  }

  // 3. Sanitize Interconnect
  if (!compat.allowedInterconnects.includes(state.interconnectConfig.type)) {
    notices.push(
      `Selected ${template.defaultInterconnect} compatible with ${template.targetProvider.toUpperCase()} target.`
    );
    updatedState.interconnectConfig = {
      ...updatedState.interconnectConfig,
      type: template.defaultInterconnect
    };
  }

  // 4. Sanitize Firewall
  if (!compat.allowedFirewalls.includes(state.securityNvaConfig.firewall)) {
    notices.push(
      `Adjusted perimeter firewall to "${template.defaultFirewall}".`
    );
    updatedState.securityNvaConfig = {
      ...updatedState.securityNvaConfig,
      firewall: template.defaultFirewall
    };
  }

  // 5. Sanitize DR Engine
  if (state.drEnabled && !compat.allowedDrEngines.includes(state.drConfig.engine)) {
    notices.push(
      `Updated DR engine to "${template.defaultDrEngine}".`
    );
    updatedState.drConfig = {
      ...updatedState.drConfig,
      engine: template.defaultDrEngine
    };
  }

  // 6. Sanitize VDI
  if (state.vdiEnabled && !compat.allowedVdiPlatforms.includes(state.vdiConfig.platform)) {
    const fallbackVdi = compat.allowedVdiPlatforms[0];
    notices.push(
      `Switched VDI platform to "${fallbackVdi}".`
    );
    updatedState.vdiConfig = {
      ...updatedState.vdiConfig,
      platform: fallbackVdi
    };
  }

  return { state: updatedState, clearedNotices: notices };
}

/**
 * Step-by-step validation engine for the 5-step wizard.
 */
export function validateWizardStep(
  step: number,
  state: WizardState
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (step) {
    case 1:
      if (!state.objective) {
        errors.push('Please select a valid architectural objective.');
      }
      if (!state.footprintScope) {
        errors.push('Please choose a deployment scope (Single cloud, Hybrid, or Multi-cloud).');
      }
      if (state.objective && state.targets && state.targets.length > 0) {
        const constraints = getTargetConstraintsForObjective(state.objective);
        if (!constraints.allowMultiple && state.targets.length > 1) {
          errors.push(
            `Architectural objective "${constraints.ruleTitle}" allows exactly one target environment, but ${state.targets.length} targets are currently configured.`
          );
        }
        if (state.objective === 'migration-only') {
          const hasDrTarget = state.targets.some((t) => t.role === 'Disaster Recovery');
          if (hasDrTarget) {
            errors.push('Migration Only objective cannot include a Disaster Recovery target environment.');
          }
        } else if (state.objective === 'setup-dr') {
          const nonDrTarget = state.targets.some((t) => t.role !== 'Disaster Recovery');
          if (nonDrTarget) {
            errors.push('Setup DR Infrastructure objective requires the target environment to be configured with the Disaster Recovery role.');
          }
        }
      }
      break;

    case 2:
      if (!state.customerName || state.customerName.trim().length < 2) {
        errors.push('Please enter a valid customer or enterprise name.');
      }
      if (state.sourceMgmtCidr) {
        const sourceCidrCheck = parseAndValidateCidr(state.sourceMgmtCidr, 'on-premise');
        if (!sourceCidrCheck.isValid) {
          errors.push(`Source Management CIDR is invalid: ${sourceCidrCheck.error || 'Must be a valid IPv4 CIDR'}`);
        }
      }
      if (state.sources && state.sources.length > 0) {
        for (const src of state.sources) {
          if (!src.platform) {
            errors.push(`Source "${src.name}": Please select a platform.`);
          }
          const cidrCheck = parseAndValidateCidr(src.mgmtCidr, 'on-premise');
          if (!cidrCheck.isValid) {
            errors.push(`Source "${src.name}": Management CIDR is invalid (${cidrCheck.error || 'Must be a valid IPv4 CIDR'}).`);
          }
          const hostCount = src.clusters?.reduce((acc, c) => acc + c.hostCount, 0) || 0;
          if (hostCount < 1) {
            errors.push(`Source "${src.name}": At least 1 compute host must be configured.`);
          }
        }
      } else {
        if (!state.sourcePlatform) {
          errors.push('Please select the source hypervisor platform.');
        }
        const sourceCidrCheck = parseAndValidateCidr(state.sourceMgmtCidr, 'on-premise');
        if (!sourceCidrCheck.isValid) {
          errors.push(`Source Management CIDR is invalid: ${sourceCidrCheck.error || 'Must be a valid IPv4 CIDR'}`);
        }
        const totalHosts = state.clusters.reduce((acc, c) => acc + c.hostCount, 0);
        if (totalHosts < 1) {
          errors.push('At least 1 compute host must be configured in on-premises clusters.');
        }
      }
      break;

    case 3:
      if (!state.targetPlatform && (!state.targets || state.targets.length === 0)) {
        errors.push('Please select a target cloud platform.');
      }
      if (!state.landingZonePattern) {
        errors.push('Please choose a landing zone network topology pattern.');
      }
      const sddcCidrCheck = parseAndValidateCidr(state.sddcMgmtCidr, 'azure');
      if (!sddcCidrCheck.isValid) {
        errors.push(`Target SDDC Management CIDR is invalid: ${sddcCidrCheck.error || 'Must be a valid IPv4 /22 to /20 allocation'}`);
      }
      if (state.vdiEnabled && (!state.vdiConfig.desktopCount || state.vdiConfig.desktopCount < 1)) {
        errors.push('Please specify a positive user count for Virtual Desktop Infrastructure.');
      }
      break;

    case 4:
      if (state.securityNvaEnabled && !state.securityNvaConfig.firewall) {
        errors.push('Please select a perimeter firewall / NVA solution.');
      }
      if (state.securityNvaConfig.wafEnabled && !state.securityNvaConfig.wafSolution) {
        errors.push('Please specify a Web Application Firewall (WAF) solution.');
      }
      if (state.externalFirewall?.status === 'enabled') {
        if (!state.externalFirewall.vendor) {
          errors.push('Please select a vendor for the External Perimeter Firewall.');
        }
        if (state.externalFirewall.isCustomModel && !state.externalFirewall.customModelName?.trim()) {
          errors.push('Please specify a model name for the custom External Firewall.');
        }
      }
      if (state.internalFirewall?.status === 'enabled') {
        if (!state.internalFirewall.vendor) {
          errors.push('Please select a vendor for the Internal Segmentation Firewall.');
        }
        if (state.internalFirewall.isCustomModel && !state.internalFirewall.customModelName?.trim()) {
          errors.push('Please specify a model name for the custom Internal Firewall.');
        }
      }
      if (state.applicationPublishing?.enabled && !state.applicationPublishing.platformName?.trim()) {
        errors.push('Please specify an External Application Publishing platform name.');
      }
      if (state.loadBalancing?.enabled && !state.loadBalancing.platform) {
        errors.push('Please select an Application Load Balancer platform.');
      }
      break;

    case 5:
      if (state.targets && state.targets.length > 0) {
        for (const tgt of state.targets) {
          const minNodes = tgt.platform === 'vmc-aws' ? 2 : 3;
          if (!tgt.nodeCount || tgt.nodeCount < minNodes) {
            errors.push(`Target "${tgt.name}": Requires a minimum cluster quorum of at least ${minNodes} dedicated nodes.`);
          }
          if (!tgt.nodeSku) {
            errors.push(`Target "${tgt.name}": Please select a target bare-metal node SKU.`);
          }
        }
      } else {
        const legacyMinNodes = state.targetPlatform === 'vmc-aws' ? 2 : 3;
        if (!state.targetNodeCount || state.targetNodeCount < legacyMinNodes) {
          errors.push(`Target SDDC requires a minimum cluster quorum of at least ${legacyMinNodes} dedicated bare-metal nodes.`);
        }
        if (!state.targetNodeSku) {
          errors.push('Please select a target bare-metal node SKU.');
        }
      }
      if (state.drEnabled && !state.drConfig.engine) {
        errors.push('Please select an active disaster recovery replication engine.');
      }
      if (!state.interconnectConfig.type) {
        errors.push('Please choose a dedicated interconnect circuit type.');
      }
      break;

    default:
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
