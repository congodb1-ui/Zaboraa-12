export type CloudProvider = 'Azure AVS' | 'AWS VMC' | 'Google Cloud GCVE' | 'VMware VCF' | 'NSX-T SDN' | 'Multi-Cloud';

export interface KBSolutionStep {
  stepNumber: number;
  title: string;
  description: string;
  commandSnippet?: {
    language: string;
    code: string;
    environment?: string; // e.g. "ESXi CLI", "NSX Manager CLI", "PowerCLI", "Azure CLI", "gcloud"
  };
  architectNote?: string;
}

export interface KnowledgeBaseArticle {
  id: string; // e.g. 'KB-AVS-8921'
  title: string;
  component: 'Azure VMware Solution' | 'Google Cloud VMware Engine' | 'VMware Cloud on AWS' | 'VMware NSX-T' | 'VMware HCX' | 'VMware Site Recovery Manager' | 'VMware Aria Operations for Networks' | 'VMware Cloud Foundation';
  serviceCategory: 'Network & Routing' | 'Storage Decoupling' | 'Microsegmentation' | 'Workload Mobility' | 'Disaster Recovery' | 'Flow & Discovery' | 'SDDC Lifecycle';
  severity: 'Critical' | 'High' | 'Operational' | 'Advisory';
  lastUpdated: string;
  verifiedInProduction: boolean;
  symptoms: string[];
  rootCause: string;
  impactScope: string;
  resolutionSteps: KBSolutionStep[];
  verificationCheck: string;
  relatedDocLinks?: { label: string; url: string }[];
  tags: string[];
}

export interface TopologyNode {
  id: string;
  name: string;
  layer: 'On-Premises' | 'Hybrid Connectivity' | 'Cloud SDDC Core' | 'Storage Tier' | 'PaaS & Peering';
  status: 'Active' | 'Redundant' | 'Protected';
  description: string;
  specs: string;
  ipRange?: string;
  iconType?: 'datacenter' | 'router' | 'server' | 'storage' | 'cloud' | 'shield' | 'network';
}

export interface TopologyLink {
  from: string;
  to: string;
  label: string;
  speed: string;
  type: 'fiber' | 'vxlan' | 'vpn' | 'bgp';
}

export interface ArchitectureDiagram {
  id: string;
  title: string;
  subtitle: string;
  provider: CloudProvider;
  category: 'Hybrid Migration' | 'Disaster Recovery' | 'Zero-Trust Networking' | 'Storage Decoupling';
  description: string;
  nodes: TopologyNode[];
  links: TopologyLink[];
  bestPractices: string[];
  iacSnippet: {
    language: string;
    code: string;
    title: string;
  };
}

export interface VideoChapter {
  time: string;
  title: string;
}

export interface VideoItem {
  id: string;
  title: string;
  provider: CloudProvider;
  duration: string;
  category: 'Migration Runbook' | 'Network Architecture' | 'Storage Sizing' | 'Hands-on Labs';
  embedUrl: string; // YouTube embed or video URL
  thumbnailUrl?: string;
  summary: string;
  chapters: VideoChapter[];
  takeaways: string[];
  tags: string[];
  publishedDate: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  description?: string;
}

export interface TutorialSection {
  heading: string;
  content: string;
  codeBlock?: CodeBlock;
  callout?: {
    type: 'tip' | 'warning' | 'architect-note';
    text: string;
  };
}

export interface TutorialArticle {
  id: string;
  slug: string;
  title: string;
  type: 'tutorial' | 'article';
  provider: CloudProvider;
  category: 'Cloud Migration' | 'NSX-T & SDN' | 'HCX Mobility' | 'Storage & Backup' | 'Disaster Recovery';
  readTime: string;
  publishedDate: string;
  difficulty: 'Foundational' | 'Enterprise Architect' | 'Production Operator';
  summary: string;
  tags: string[];
  prerequisites: string[];
  sections: TutorialSection[];
  author: {
    name: string;
    title: string;
  };
}

export interface ServicePillar {
  id: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  tags: string[];
  badge: string;
}

export interface CaseStudy {
  id: string;
  sector: string;
  title: string;
  subtitle: string;
  metrics: {
    vms: string;
    downtime: string;
    costReduction: string;
    timeline: string;
  };
  summary: string;
  architectureSolution: string[];
  verifiedBadge?: string;
  techTags?: string[];
  dossierUrl?: string;
}

export interface ArchitectureDesignItem {
  id: string;
  title: string;
  badge?: string;
  description: string;
  detailedSpecs?: string[];
  imageUrl: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  components?: { name: string; role: string; details: string }[];
  enabled?: boolean;
}

export type ThemePreset = 'default' | 'nutanix' | 'azure' | 'terminal' | 'titanium' | 'nordic';
export type LayoutDensity = 'balanced' | 'compact' | 'executive';
export type HeaderStyle = 'glass' | 'solid' | 'blueprint';
export type BackgroundPattern = 'tech-grid' | 'dot-matrix' | 'clean-minimal' | 'blueprint-glow';
export type ImageAnimationType = 'ken-burns' | 'scanline' | 'hover-zoom' | 'all' | 'none';

export type BlueprintAccessMode = 'everyone' | 'signed_in' | 'nobody';

export interface FeatureControlsConfig {
  exportDossier: boolean;
  exportExecutiveSummary: boolean;
  export4k: boolean;
  generateBlueprint: boolean;
  blueprintAccessMode?: BlueprintAccessMode;
}

export interface AdminSettings {
  themePreset: ThemePreset;
  layoutDensity: LayoutDensity;
  headerStyle: HeaderStyle;
  backgroundPattern: BackgroundPattern;
  imageAnimationsEnabled?: boolean;
  imageAnimationType?: ImageAnimationType;
  announcementBannerEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  confidentialityClassification: string;
  clientName: string;
  brandName?: string;
  brandLogoUrl?: string;
  supportEmail?: string;
  executiveContact?: string;
  defaultCloudPlatform?: string;
  defaultVcpuOvercommit?: number;
  defaultRamBufferPercent?: number;
  defaultTargetRpoMinutes?: number;
  defaultTargetRtoHours?: number;
  primaryRegion?: string;
  enableAuditTelemetry: boolean;
  publicAccessEnabled: boolean;
  authRequiredForTools: boolean;
  blueprintAccessMode?: BlueprintAccessMode;
  featureControls?: FeatureControlsConfig;
}

export interface PlatformShowcase {
  id: string; // 'avs', 'gcve', 'vmc-dr', 'nsx', 'hcx', 'srm', 'aria', 'nutanix-nc2-azure'
  platform: 'Azure VMware Solution' | 'GCVE' | 'VMC on AWS Migration & DR' | 'NSX' | 'VMware HCX' | 'VMware Site Recovery Manager' | 'VMware Aria Operations for Networks' | 'VMware SDDC to Nutanix NC2 on Azure';
  title: string;
  badge: string;
  description: string;
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string; // YouTube embed or video URL
  videoDuration?: string;
  keyDeliverables: string[];
  techTags: string[];
  designs?: ArchitectureDesignItem[];
  enabled?: boolean;
}

export interface PhotoStyle {
  zoom?: number;
  brightness?: number;
  contrast?: number;
  objectPosition?: 'center' | 'top' | 'bottom';
  borderGlow?: 'cyan' | 'emerald' | 'subtle' | 'none';
}

export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  imageUrl?: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity: number; // 0.1 to 1.0
}

export interface SiteConfig {
  brand: string;
  brandTagline: string;
  brandLogoUrl?: string;
  enableHotspots?: boolean; // Top-level admin setting: globally enable or disable interactive hotspots across all diagrams
  featuredVideoId?: string;
  watermark?: WatermarkConfig;
  adminSettings?: AdminSettings;
  platformShowcases: PlatformShowcase[];
  founder: {
    name: string;
    role: string;
    certifications: string[];
    bio: string;
    phone: string;
    email: string;
    location: string;
    portraitImage?: string;
    photoStyle?: PhotoStyle;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    stats: {
      value: string;
      label: string;
    }[];
    heroImage?: string;
  };
  services: ServicePillar[];
  diagrams: ArchitectureDiagram[];
  videos: VideoItem[];
  tutorials: TutorialArticle[];
  knowledgeBase?: KnowledgeBaseArticle[];
  caseStudies: CaseStudy[];
}
