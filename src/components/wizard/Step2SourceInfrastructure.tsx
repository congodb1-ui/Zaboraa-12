import React, { useState } from 'react';
import {
  Server,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Building,
  User,
  Calendar,
  Globe,
  Sliders,
  AlertCircle,
  Layers,
  Cloud,
  Check,
  Network
} from 'lucide-react';
import {
  WizardState,
  WizardClusterSpec,
  SourceInfrastructureItem,
  createDefaultSourceItem
} from '../../types/wizardStateAdapter';
import { parseAndValidateCidr } from '../../utils/cidrUtils';
import { HARDWARE_VENDOR_CATALOGUE } from '../../data/cloudCompatibilityCatalogue';
import { validateWizardStep } from '../../utils/architectureCompatibilityRules';

interface Step2SourceInfrastructureProps {
  wizardState: WizardState;
  onChange: (updater: (prev: WizardState) => WizardState) => void;
  onNext: () => void;
  onPrev: () => void;
}

type SupportedSourcePlatform =
  | 'vmware-onprem'
  | 'nutanix-onprem'
  | 'azure'
  | 'vmc-aws'
  | 'avs'
  | 'gcve'
  | 'nc2-azure';

interface PlatformMeta {
  id: SupportedSourcePlatform;
  label: string;
  category: 'On-Premises' | 'Hyperscaler VMware' | 'Native Cloud';
  desc: string;
  badge: string;
}

const SUPPORTED_SOURCE_PLATFORMS: PlatformMeta[] = [
  {
    id: 'vmware-onprem',
    label: 'VMware vSphere On-Premises',
    category: 'On-Premises',
    desc: 'vSphere 7.0/8.0 / VCF Enterprise Datacenter',
    badge: 'On-Prem'
  },
  {
    id: 'nutanix-onprem',
    label: 'Nutanix AHV On-Premises',
    category: 'On-Premises',
    desc: 'AOS 6.5/6.8 Prism Central Clustered Nodes',
    badge: 'On-Prem'
  },
  {
    id: 'azure',
    label: 'Microsoft Azure Native',
    category: 'Native Cloud',
    desc: 'Azure IaaS Virtual Machines & Virtual Networks',
    badge: 'Public Cloud'
  },
  {
    id: 'vmc-aws',
    label: 'VMware Cloud on AWS (VMC)',
    category: 'Hyperscaler VMware',
    desc: 'AWS Bare-Metal i4i.metal SDDC & ENI Connected VPCs',
    badge: 'Cloud SDDC'
  },
  {
    id: 'avs',
    label: 'Azure VMware Solution (AVS)',
    category: 'Hyperscaler VMware',
    desc: 'AV36P / AV64 Dedicated Private Cloud Clusters',
    badge: 'Cloud SDDC'
  },
  {
    id: 'gcve',
    label: 'Google Cloud VMware Engine (GCVE)',
    category: 'Hyperscaler VMware',
    desc: 've1 / ve2 Dedicated Google Cloud SDDC Clusters',
    badge: 'Cloud SDDC'
  },
  {
    id: 'nc2-azure',
    label: 'Nutanix Cloud Clusters (NC2) on Azure',
    category: 'Hyperscaler VMware',
    desc: 'AN36 / AN36P Azure Bare-Metal Nutanix AOS Clusters',
    badge: 'Cloud Cluster'
  }
];

export const Step2SourceInfrastructure: React.FC<Step2SourceInfrastructureProps> = ({
  wizardState,
  onChange,
  onNext,
  onPrev
}) => {
  const [collapsedSources, setCollapsedSources] = useState<Record<string, boolean>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedExtras, setExpandedExtras] = useState<Record<string, boolean>>({});
  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({});

  // Ensure wizardState.sources is populated and initialized
  const activeSources: SourceInfrastructureItem[] =
    wizardState.sources && wizardState.sources.length > 0
      ? wizardState.sources
      : [
          createDefaultSourceItem(
            (wizardState.sourcePlatform as SupportedSourcePlatform) || 'vmware-onprem'
          )
        ];

  // Helper to sync primary source back to legacy single-source fields for 100% backward compatibility
  const syncWithLegacyFields = (sourcesList: SourceInfrastructureItem[]): Partial<WizardState> => {
    const primary = sourcesList[0] || createDefaultSourceItem('vmware-onprem');
    let legacyPlatform: 'vmware' | 'nutanix' | 'baremetal' | 'hyperv' = 'vmware';
    if (primary.platform === 'nutanix-onprem' || primary.platform === 'nc2-azure') {
      legacyPlatform = 'nutanix';
    } else if (primary.platform === 'vmware-onprem' || primary.platform === 'avs' || primary.platform === 'vmc-aws' || primary.platform === 'gcve') {
      legacyPlatform = 'vmware';
    } else {
      legacyPlatform = 'baremetal';
    }

    return {
      sources: sourcesList,
      sourcePlatform: legacyPlatform,
      sourceMgmtCidr: primary.mgmtCidr || '10.10.0.0/16',
      clusters: primary.clusters && primary.clusters.length > 0 ? primary.clusters : wizardState.clusters,
      hardwareVendor: (primary.hardwareVendor as any) || wizardState.hardwareVendor,
      hardwareSku: primary.hardwareSku || wizardState.hardwareSku
    };
  };

  const toggleSourceCollapse = (id: string) => {
    setCollapsedSources((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleTogglePlatformSelection = (platformId: SupportedSourcePlatform) => {
    setValidationError(null);
    const existingIndex = activeSources.findIndex((s) => s.platform === platformId);
    let updatedSources: SourceInfrastructureItem[];

    if (existingIndex >= 0) {
      // Platform already selected
      if (activeSources.length <= 1) {
        setValidationError('At least one source infrastructure platform must remain active.');
        return;
      }
      updatedSources = activeSources.filter((_, idx) => idx !== existingIndex);
    } else {
      // Add new source platform with valid preselected defaults
      const newSource = createDefaultSourceItem(platformId);
      updatedSources = [...activeSources, newSource];
    }

    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updatedSources)
    }));
  };

  const handleUpdateSource = (sourceId: string, partial: Partial<SourceInfrastructureItem>) => {
    setValidationError(null);
    const updated = activeSources.map((s) => (s.id === sourceId ? { ...s, ...partial } : s));
    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleRemoveSource = (sourceId: string) => {
    if (activeSources.length <= 1) {
      setValidationError('At least one source infrastructure environment is required.');
      return;
    }
    const updated = activeSources.filter((s) => s.id !== sourceId);
    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleAddClusterToSource = (sourceId: string) => {
    const targetSource = activeSources.find((s) => s.id === sourceId);
    if (!targetSource) return;

    const newCluster: WizardClusterSpec = {
      id: `cluster-${Date.now()}`,
      name: `Cluster ${targetSource.clusters.length + 1}`,
      hostCount: 4,
      sockets: 2,
      coresPerSocket: 32,
      hyperthreading: true,
      ramGB: 768,
      storageTB: 19.2
    };

    const updated = activeSources.map((s) =>
      s.id === sourceId ? { ...s, clusters: [...s.clusters, newCluster] } : s
    );

    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleUpdateSourceCluster = (
    sourceId: string,
    clusterId: string,
    field: keyof WizardClusterSpec,
    val: any
  ) => {
    const updated = activeSources.map((s) => {
      if (s.id !== sourceId) return s;
      return {
        ...s,
        clusters: s.clusters.map((c) => (c.id === clusterId ? { ...c, [field]: val } : c))
      };
    });

    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleRemoveSourceCluster = (sourceId: string, clusterId: string) => {
    const updated = activeSources.map((s) => {
      if (s.id !== sourceId || s.clusters.length <= 1) return s;
      return {
        ...s,
        clusters: s.clusters.filter((c) => c.id !== clusterId)
      };
    });

    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleContinue = () => {
    const check = validateWizardStep(2, {
      ...wizardState,
      sources: activeSources
    });
    if (!check.isValid) {
      setValidationError(check.errors[0] || 'Please complete all required fields.');
      // Open the hidden sections so the field behind an error is never out of sight
      setExpandedClusters(Object.fromEntries(activeSources.map((src) => [src.id, true])));
      setExpandedExtras(Object.fromEntries(activeSources.map((src) => [src.id, true])));
      return;
    }
    setValidationError(null);
    onNext();
  };

  // Aggregate Metrics Across All Active Source Infrastructures
  const totalPhysicalHosts = activeSources.reduce(
    (acc, s) => acc + (s.clusters?.reduce((cAcc, c) => cAcc + c.hostCount, 0) || 0),
    0
  );
  const totalRawCores = activeSources.reduce(
    (acc, s) =>
      acc + (s.clusters?.reduce((cAcc, c) => cAcc + c.hostCount * c.sockets * c.coresPerSocket, 0) || 0),
    0
  );
  const totalInstalledRamTB = (
    activeSources.reduce(
      (acc, s) => acc + (s.clusters?.reduce((cAcc, c) => cAcc + c.hostCount * c.ramGB, 0) || 0),
      0
    ) / 1024
  ).toFixed(1);
  const totalInstalledStorageTB = activeSources
    .reduce(
      (acc, s) => acc + (s.clusters?.reduce((cAcc, c) => cAcc + c.hostCount * c.storageTB, 0) || 0),
      0
    )
    .toFixed(1);
  const totalWorkloadVMs = activeSources.reduce((acc, s) => acc + (s.workloadVmsCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1.5">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase">
          <span>Step 02 / 05</span>
          <span>·</span>
          <span>Source Infrastructure</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Multi-Source Infrastructure & Workload Inventory
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>{activeSources.length} Source{activeSources.length > 1 ? 's' : ''} Selected</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Pick your source platforms, then fill in the required fields for each one. Optional details and cluster sizing are one click away.
        </p>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Customer & Project Metadata */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-200">Enterprise Engagement Details</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Customer / Account <span className="text-cyan-400 font-mono">*</span>
              </span>
            </label>
            <input
              type="text"
              value={wizardState.customerName}
              onChange={(e) => {
                setValidationError(null);
                onChange((p) => ({ ...p, customerName: e.target.value }));
              }}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lead Architect</span>
            </label>
            <input
              type="text"
              value={wizardState.architectName}
              onChange={(e) => onChange((p) => ({ ...p, architectName: e.target.value }))}
              placeholder="e.g. Wasim Sayyed"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architecture Date</span>
            </label>
            <input
              type="text"
              value={wizardState.projectDate}
              onChange={(e) => onChange((p) => ({ ...p, projectDate: e.target.value }))}
              placeholder="e.g. October 2026"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Platform selection: compact chips (same toggle handler) */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-200">
            Source platforms
            <span className="text-slate-400 font-normal"> · click to add or remove</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
            {activeSources.length} of {SUPPORTED_SOURCE_PLATFORMS.length} active
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_SOURCE_PLATFORMS.map((plat) => {
            const isSelected = activeSources.some((s) => s.platform === plat.id);
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => handleTogglePlatformSelection(plat.id)}
                title={plat.desc}
                aria-pressed={isSelected}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 text-white ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                    isSelected ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span className="whitespace-nowrap">{plat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aggregate Resource Summary Bar */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Total Sources</div>
          <div className="text-sm font-bold text-cyan-400 font-mono">{activeSources.length} Platform{activeSources.length > 1 ? 's' : ''}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Workload VMs</div>
          <div className="text-sm font-bold text-white font-mono">{totalWorkloadVMs} VMs</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Physical / Cloud Hosts</div>
          <div className="text-sm font-bold text-white font-mono">{totalPhysicalHosts} Nodes</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Compute Capacity</div>
          <div className="text-sm font-bold text-white font-mono">{totalRawCores} Cores · {totalInstalledRamTB} TB RAM</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Storage Footprint</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">{totalInstalledStorageTB} TB Raw</div>
        </div>
      </div>

      {/* SECTION 2: Expandable Configuration Subsection per Selected Source */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-200">
            Source Infrastructure Configuration Subsections ({activeSources.length})
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Mandatory fields marked with <span className="text-cyan-400 font-mono">*</span>
          </span>
        </div>

        {activeSources.map((source, sIdx) => {
          const isCollapsed = Boolean(collapsedSources[source.id]);
          const cidrCheck = parseAndValidateCidr(source.mgmtCidr, 'on-premise');
          const platMeta =
            SUPPORTED_SOURCE_PLATFORMS.find((p) => p.id === source.platform) ||
            SUPPORTED_SOURCE_PLATFORMS[0];
          const clusterCount = source.clusters?.length || 0;
          const hostCount = source.clusters?.reduce((acc, c) => acc + c.hostCount, 0) || 0;

          return (
            <div
              key={source.id}
              className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg transition-all"
            >
              {/* Source Subsection Header */}
              <div className="p-3.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {sIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={source.name}
                        onChange={(e) => handleUpdateSource(source.id, { name: e.target.value })}
                        className="font-bold text-xs sm:text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none px-1 truncate"
                      />
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono shrink-0">
                        {platMeta.badge} · {platMeta.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono pl-1">
                      {hostCount} Nodes · {source.workloadVmsCount || 0} Workload VMs · Subnet: {source.mgmtCidr}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeSources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(source.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                      title="Remove this source infrastructure"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleSourceCollapse(source.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-1 text-xs"
                  >
                    {isCollapsed ? (
                      <>
                        <span className="text-[10px] hidden sm:inline">Expand</span>
                        <ChevronDown className="w-4 h-4 text-cyan-400" />
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] hidden sm:inline">Collapse</span>
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Source Subsection Content */}
              {!isCollapsed && (
                <div className="p-4 space-y-4 text-xs animate-in fade-in duration-150">
                  {/* Platform-Specific Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Field 1: Hypervisor / Platform Version (Required) */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        Hypervisor / Engine Version <span className="text-cyan-400 font-mono">*</span>
                      </label>
                      {source.platform === 'vmware-onprem' && (
                        <select
                          value={source.hypervisorVersion || 'vSphere 8.0u3'}
                          onChange={(e) => handleUpdateSource(source.id, { hypervisorVersion: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="vSphere 8.0u3">VMware vSphere 8.0u3 (Latest Enterprise)</option>
                          <option value="vSphere 8.0u2">VMware vSphere 8.0u2</option>
                          <option value="vSphere 7.0u3">VMware vSphere 7.0u3</option>
                          <option value="VMware Cloud Foundation 5.2">VMware Cloud Foundation (VCF) 5.2</option>
                          <option value="VMware Cloud Foundation 5.1">VMware Cloud Foundation (VCF) 5.1</option>
                        </select>
                      )}
                      {source.platform === 'nutanix-onprem' && (
                        <select
                          value={source.hypervisorVersion || 'AOS 6.8 LTS (AHV)'}
                          onChange={(e) => handleUpdateSource(source.id, { hypervisorVersion: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="AOS 6.8 LTS (AHV)">Nutanix AOS 6.8 LTS + AHV</option>
                          <option value="AOS 6.5 LTS (AHV)">Nutanix AOS 6.5 LTS + AHV</option>
                          <option value="AOS 6.8 STS (AHV)">Nutanix AOS 6.8 STS + AHV</option>
                        </select>
                      )}
                      {source.platform === 'azure' && (
                        <select
                          value={source.hypervisorVersion || 'Azure Hyper-V / Azure ARM'}
                          onChange={(e) => handleUpdateSource(source.id, { hypervisorVersion: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Azure Hyper-V / Azure ARM">Azure Virtual Machines (ARM IaaS)</option>
                          <option value="Azure Stack HCI">Azure Stack HCI Clustered Nodes</option>
                        </select>
                      )}
                      {source.platform === 'vmc-aws' && (
                        <select
                          value={source.hypervisorVersion || 'VMC SDDC 1.24+ / vSphere 8'}
                          onChange={(e) => handleUpdateSource(source.id, { hypervisorVersion: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="VMC SDDC 1.24+ / vSphere 8">VMware Cloud on AWS SDDC 1.24+</option>
                          <option value="VMC SDDC 1.22">VMware Cloud on AWS SDDC 1.22</option>
                        </select>
                      )}
                      {source.platform === 'avs' && (
                        <select
                          value={source.hypervisorVersion || 'vSphere 8.0u2 / AVS Private Cloud'}
                          onChange={(e) => handleUpdateSource(source.id, { hypervisorVersion: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="vSphere 8.0u2 / AVS Private Cloud">AVS Gen 2 (AV64 / vSphere 8.0u2)</option>
                          <option value="vSphere 7.0u3 / AVS Private Cloud">AVS Gen 1 (AV36P / vSphere 7.0u3)</option>
                        </select>
                      )}
                      {source.platform === 'gcve' && (
                        <select
                          value={source.hypervisorVersion || 'vSphere 8.0 / Google Cloud VMware Engine'}
                          onChange={(e) => handleUpdateSource(source.id, { hypervisorVersion: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="vSphere 8.0 / Google Cloud VMware Engine">Google Cloud VMware Engine (vSphere 8.0)</option>
                        </select>
                      )}
                      {source.platform === 'nc2-azure' && (
                        <select
                          value={source.hypervisorVersion || 'AOS 6.8 / Nutanix Prism Central on Azure'}
                          onChange={(e) => handleUpdateSource(source.id, { hypervisorVersion: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="AOS 6.8 / Nutanix Prism Central on Azure">NC2 on Azure AOS 6.8 LTS</option>
                        </select>
                      )}
                    </div>

                    {/* Field 2: Management Subnet CIDR (Required) */}
                    <div className="space-y-1">
                      <label className="text-slate-400 flex items-center justify-between">
                        <span>
                          Source Management CIDR <span className="text-cyan-400 font-mono">*</span>
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            cidrCheck.isValid ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {cidrCheck.isValid ? '✓ Valid IPv4 CIDR' : 'Required IPv4'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={source.mgmtCidr}
                        onChange={(e) => handleUpdateSource(source.id, { mgmtCidr: e.target.value })}
                        placeholder="e.g. 10.10.0.0/16"
                        className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-white text-xs font-mono focus:outline-none ${
                          cidrCheck.isValid ? 'border-slate-700 focus:border-cyan-400' : 'border-amber-500/60'
                        }`}
                      />
                    </div>

                    {/* Field 3: Workload VM Count (Required) */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        Workload VMs Count <span className="text-cyan-400 font-mono">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100000}
                        value={source.workloadVmsCount || 200}
                        onChange={(e) =>
                          handleUpdateSource(source.id, {
                            workloadVmsCount: Math.max(1, parseInt(e.target.value) || 1)
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Optional fields: collapsed by default, nothing removed */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <button
                        type="button"
                        onClick={() => setExpandedExtras((p) => ({ ...p, [source.id]: !p[source.id] }))}
                        aria-expanded={Boolean(expandedExtras[source.id])}
                        className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                      >
                        {expandedExtras[source.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>
                          Optional details
                          <span className="text-slate-500 font-normal"> · endpoint, hardware model, notes</span>
                        </span>
                      </button>
                    </div>
                    {expandedExtras[source.id] && (
                      <>
                    {/* Field 4: Management Endpoint / FQDN (Optional) */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        {source.platform.includes('nutanix')
                          ? 'Prism Central Endpoint'
                          : source.platform === 'azure'
                          ? 'Subscription / Portal Resource'
                          : 'vCenter Server FQDN'}
                        <span className="text-slate-500 font-normal"> (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={source.vcenterFqdn || ''}
                        onChange={(e) => handleUpdateSource(source.id, { vcenterFqdn: e.target.value })}
                        placeholder={
                          source.platform.includes('nutanix')
                            ? 'prism.corp.internal:9440'
                            : source.platform === 'azure'
                            ? 'sub-enterprise-prod (vNet-EastUS)'
                            : 'vcenter.corp.internal'
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    {/* Field 5: Hardware Vendor & Sku */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        Hardware / Node Model
                        <span className="text-slate-500 font-normal"> (Architecture Spec)</span>
                      </label>
                      <input
                        type="text"
                        value={source.hardwareSku || ''}
                        onChange={(e) => handleUpdateSource(source.id, { hardwareSku: e.target.value })}
                        placeholder="e.g. Dell PowerEdge R760 / Supermicro NX-8170-G9"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    {/* Field 6: Notes & Architecture Specifics */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        Environment Notes & Constraints
                        <span className="text-slate-500 font-normal"> (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={source.notes || ''}
                        onChange={(e) => handleUpdateSource(source.id, { notes: e.target.value })}
                        placeholder="e.g. Dual 25GbE ToR Switches, FC SAN Storage"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                      </>
                    )}
                  </div>

                  {/* Compute fabric: summary line, expands to the full cluster editor */}
                  {!expandedClusters[source.id] ? (
                    <button
                      type="button"
                      onClick={() => setExpandedClusters((p) => ({ ...p, [source.id]: true }))}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 flex items-center justify-between gap-3 text-left cursor-pointer transition"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-slate-200">
                          Compute fabric · {source.clusters.length} cluster{source.clusters.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          {hostCount} hosts · {source.clusters.reduce((acc, c) => acc + c.hostCount * c.sockets * c.coresPerSocket, 0)} cores · {(source.clusters.reduce((acc, c) => acc + c.hostCount * c.ramGB, 0) / 1024).toFixed(1)} TB RAM
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1 shrink-0">
                        Edit clusters <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setExpandedClusters((p) => ({ ...p, [source.id]: false }))}
                        className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide cluster editor</span>
                      </button>
                  {/* Compute Fabric / Clustered Nodes for this Source */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-200">
                          Compute Fabric Clusters ({source.clusters.length})
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Source Total: {hostCount} Hosts · {source.clusters.reduce((acc, c) => acc + c.hostCount * c.sockets * c.coresPerSocket, 0)} Cores · {(source.clusters.reduce((acc, c) => acc + c.hostCount * c.ramGB, 0) / 1024).toFixed(1)} TB RAM
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddClusterToSource(source.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Cluster</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {source.clusters.map((cluster) => (
                        <div
                          key={cluster.id}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={cluster.name}
                              onChange={(e) =>
                                handleUpdateSourceCluster(source.id, cluster.id, 'name', e.target.value)
                              }
                              className="font-bold text-xs text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none px-1"
                            />
                            {source.clusters.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSourceCluster(source.id, cluster.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                title="Remove cluster"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">Hosts / Nodes</label>
                              <input
                                type="number"
                                min={1}
                                max={64}
                                value={cluster.hostCount}
                                onChange={(e) =>
                                  handleUpdateSourceCluster(
                                    source.id,
                                    cluster.id,
                                    'hostCount',
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">Sockets / Host</label>
                              <input
                                type="number"
                                min={1}
                                max={8}
                                value={cluster.sockets}
                                onChange={(e) =>
                                  handleUpdateSourceCluster(
                                    source.id,
                                    cluster.id,
                                    'sockets',
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">Cores / Socket</label>
                              <input
                                type="number"
                                min={4}
                                max={128}
                                value={cluster.coresPerSocket}
                                onChange={(e) =>
                                  handleUpdateSourceCluster(
                                    source.id,
                                    cluster.id,
                                    'coresPerSocket',
                                    Math.max(4, parseInt(e.target.value) || 4)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">RAM / Host (GB)</label>
                              <input
                                type="number"
                                min={64}
                                max={4096}
                                step={64}
                                value={cluster.ramGB}
                                onChange={(e) =>
                                  handleUpdateSourceCluster(
                                    source.id,
                                    cluster.id,
                                    'ramGB',
                                    Math.max(64, parseInt(e.target.value) || 64)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">Storage / Host (TB)</label>
                              <input
                                type="number"
                                min={1}
                                max={200}
                                step={1}
                                value={cluster.storageTB}
                                onChange={(e) =>
                                  handleUpdateSourceCluster(
                                    source.id,
                                    cluster.id,
                                    'storageTB',
                                    Math.max(1, parseFloat(e.target.value) || 1)
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Objective</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Continue to Landing Zone & VDI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
