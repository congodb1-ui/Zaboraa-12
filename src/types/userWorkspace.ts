export interface NodeSizingConfig {
  cloudProvider: 'Azure AVS' | 'AWS VMC' | 'Google Cloud GCVE' | 'Azure NC2';
  presetKey: string;
  targetVmCount: number;
  avgVcpuPerVm: number;
  avgRamPerVmGB: number;
  avgStoragePerVmGB: number;
  vcpuOvercommit: number;
  ramBufferPercent: number;
  storagePolicy: string;
  externalNfsOffloadPercent: number;
  anfPerformanceTier: string;
  notes?: string;
  updatedAt?: string;
}

export interface RVToolsAssessmentConfig {
  clusterName: string;
  vmCount: number;
  readinessScore: number;
  hcxBulkCount: number;
  hcxRavCount: number;
  coldMigrationCount: number;
  identifiedRisks: string[];
  lastAnalyzedAt?: string;
}

export interface NutanixNC2Config {
  selectedNode: string;
  nodeCount: number;
  dsfReplicationFactor: 'RF2' | 'RF3';
  dedupCompressionRatio: number;
  ahvVirtioReadyPercent: number;
  lastAssessedAt?: string;
}

export interface AriaNetworksConfig {
  tierCount: number;
  identifiedFlows: number;
  crossTierLatencyMs: number;
  dfwZeroTrustRules: number;
  lastCalculatedAt?: string;
}

export interface DRPlannerConfig {
  rpoMinutes: number;
  targetRtoHours: number;
  deltaChangeRatePercent: number;
  wanBandwidthMbps: number;
  replicationEngine: string;
  lastPlannedAt?: string;
}

export interface BlueprintGeneratorConfig {
  selectedPlatform: string;
  targetTopology: string;
  bomComponents: string[];
  lastGeneratedAt?: string;
}

export interface WorkspaceConfiguration {
  nodeSizing: NodeSizingConfig;
  rvtoolsAssessment: RVToolsAssessmentConfig;
  nutanixNC2: NutanixNC2Config;
  ariaNetworks: AriaNetworksConfig;
  drPlanner: DRPlannerConfig;
  blueprintGenerator: BlueprintGeneratorConfig;
  layoutPreferences: {
    themePreset: string;
    layoutDensity: 'compact' | 'balanced' | 'relaxed';
    sidebarCollapsed?: boolean;
    favoriteTools?: string[];
  };
  projectNotes: string;
  version: number;
}

export interface UserWorkspace {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_default: boolean;
  is_archived: boolean;
  configuration: WorkspaceConfiguration;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  version: number;
}

export interface WorkspaceSnapshot {
  id: string;
  workspace_id: string;
  user_id: string;
  snapshot_label: string;
  snapshot_data: WorkspaceConfiguration;
  created_at: string;
}

export type WorkspaceSaveStatus = 'saved' | 'saving' | 'offline' | 'failed' | 'dirty';
