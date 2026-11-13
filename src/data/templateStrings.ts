import {
  TARGET_NODE_SKU_CATALOGUE,
  STORAGE_ATTACHMENT_CATALOGUE,
  DR_ENGINE_CATALOGUE
} from './cloudCompatibilityCatalogue';

// DR Engines
export const DR_ENGINES = [
  'VMware Site Recovery Manager (SRM) + vSphere Replication',
  'Nutanix Protection Domains (NearSync)',
  'Nutanix Move / Prism Pairing',
  'Nutanix Move Cross-Hypervisor',
  'Nutanix Metro Availability / Leap',
  'Zerto Continuous Data Protection (CDP)',
  'Veeam Backup & Replication v12',
  'Google Cloud VMware Engine HCX / Replication',
  'AWS Elastic Disaster Recovery (DRS)'
] as const;
export type DrEngineOption = (typeof DR_ENGINES)[number];

// Storage Options
export const STORAGE_ATTACHMENT_OPTIONS = [
  'Native All-Flash NVMe Datastore (vSAN / DSF)',
  'Azure NetApp Files (ANF NFS Datastore)',
  'Azure Elastic SAN (iSCSI Block Datastore)',
  'Amazon FSx for NetApp ONTAP (NFS Datastore)',
  'Google Cloud NetApp Volumes (NFS Datastore)',
  'Pure Storage Cloud Block Store (CBS iSCSI)'
] as const;

// Firewall Options
export const FIREWALL_OPTIONS = [
  'Palo Alto Networks VM-Series',
  'Azure Firewall Premium / Native',
  'Fortinet FortiGate-VM',
  'Check Point CloudGuard',
  'Cisco Secure Firewall',
  'AWS Network Firewall',
  'Google Cloud Armor & Cloud NGFW'
] as const;

// Interconnect Options
export const INTERCONNECT_OPTIONS = [
  'Azure ExpressRoute FastPath (10 Gbps)',
  'AWS Direct Connect (10 Gbps)',
  'Google Cloud Interconnect (10 Gbps)',
  'Nutanix Cloud Clusters (NC2) Interconnect',
  'IPsec VPN (1 Gbps Redundant Tunnel)',
  'Software-Defined WAN (SD-WAN) Edge'
] as const;

// Landing Zone Options
export const LANDING_ZONE_OPTIONS = [
  'Azure Virtual WAN Hub-and-Spoke',
  'Hub-Spoke VNet / VPC',
  'Dedicated Transit Hub VNet',
  'Azure Virtual WAN / AWS TGW / GCP NCC',
  'AWS Transit Gateway (TGW) Hub',
  'Google Cloud Network Connectivity Center (NCC)'
] as const;

// WAF Solutions
export const WAF_SOLUTIONS = [
  'Azure WAF on Application Gateway',
  'Cloudflare Magic Transit',
  'AWS WAF',
  'F5 Distributed Cloud WAF',
  'Google Cloud Armor WAF'
] as const;

// VDI Platforms
export const VDI_PLATFORMS = [
  'Azure Virtual Desktop (AVD)',
  'Omnissa Horizon Cloud (formerly VMware)',
  'Citrix DaaS / Virtual Apps & Desktops',
  'Nutanix Frame DaaS'
] as const;

// Migration Tools
export const MIGRATION_TOOLS = [
  'VMware HCX Enterprise',
  'Nutanix Move',
  'Azure Migrate',
  'AWS Application Migration Service (MGN)',
  'Google Cloud Migration Center'
] as const;

// Node SKUs per platform (canonical SKU ids: e.g. 'AV64', 'i4i.metal')
export const NODE_SKUS_BY_PLATFORM = {
  'avs-gen1': ['AV36', 'AV36P', 'AV52'],
  'avs-gen2': ['AV64'],
  'vmc-aws': ['i4i.metal', 'i3en.metal'],
  'gcve': ['ve1-standard-72', 've2-standard-128'],
  'nc2-azure': ['AN36P'],
  'azure-native': ['Standard_D16s_v5', 'Standard_E16s_v5']
} as const;

export const ALLOWED_DR_ENGINES = DR_ENGINES;
export const ALLOWED_STORAGE_PROVIDERS = STORAGE_ATTACHMENT_OPTIONS;
export const ALLOWED_FIREWALLS = FIREWALL_OPTIONS;
export const ALLOWED_INTERCONNECTS = INTERCONNECT_OPTIONS;
export const ALLOWED_LANDING_ZONES = LANDING_ZONE_OPTIONS;
export const ALLOWED_WAF_SOLUTIONS = WAF_SOLUTIONS;
export const ALLOWED_VDI_PLATFORMS = VDI_PLATFORMS;
export const ALLOWED_MIGRATION_TOOLS = MIGRATION_TOOLS;
export const ALLOWED_NODE_SKUS = Object.values(NODE_SKUS_BY_PLATFORM).flat();
