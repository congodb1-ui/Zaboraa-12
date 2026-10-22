import React, { useState } from 'react';
import {
  Cloud,
  HardDrive,
  Cpu,
  ShieldCheck,
  Sparkles,
  Save,
  FileSpreadsheet,
  Download,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Network,
  Maximize2,
  Layers,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Check
} from 'lucide-react';
import {
  WizardState,
  TargetInfrastructureItem,
  createDefaultTargetItem,
  getTargetConstraintsForObjective
} from '../../types/wizardStateAdapter';
import {
  TARGET_NODE_SKU_CATALOGUE,
  STORAGE_ATTACHMENT_CATALOGUE
} from '../../data/cloudCompatibilityCatalogue';
import {
  getCompatibilityForPlatform,
  validateWizardStep
} from '../../utils/architectureCompatibilityRules';
import { parseAndValidateCidr } from '../../utils/cidrUtils';

interface Step5TargetAndDRProps {
  wizardState: WizardState;
  onChange: (updater: (prev: WizardState) => WizardState) => void;
  onPrev: () => void;
  onGenerateAI: () => void;
  isGeneratingAI: boolean;
  generationStep: string;
  generationProgress: number;
  onSaveBlueprint: () => void;
  onExportJson: () => void;
  onExportExcel: () => void;
  onExport4K: () => void;
  onOpenDossier: () => void;
  hasGeneratedBlueprint: boolean;
  onScrollToBlueprint: () => void;
}

type SupportedTargetPlatform =
  | 'avs-gen2'
  | 'avs-gen1'
  | 'nc2-azure'
  | 'gcve'
  | 'vmc-aws'
  | 'azure-native';

const TARGET_PLATFORMS: Array<{
  id: SupportedTargetPlatform;
  label: string;
  provider: 'Microsoft Azure' | 'Google Cloud' | 'AWS';
  desc: string;
  badge: string;
}> = [
  {
    id: 'avs-gen2',
    label: 'Azure VMware Solution (AVS Gen 2)',
    provider: 'Microsoft Azure',
    desc: 'AV64 Bare-Metal Nodes (Sapphire Rapids) with Direct vNet Storage',
    badge: 'Azure SDDC'
  },
  {
    id: 'avs-gen1',
    label: 'Azure VMware Solution (AVS Gen 1)',
    provider: 'Microsoft Azure',
    desc: 'AV36P / AV52 Bare-Metal Nodes with All-Flash vSAN Datastore',
    badge: 'Azure SDDC'
  },
  {
    id: 'nc2-azure',
    label: 'Nutanix Cloud Clusters (NC2) on Azure',
    provider: 'Microsoft Azure',
    desc: 'AN36 / AN36P Azure BareMetal with Nutanix DSF Storage Pool',
    badge: 'Nutanix Cloud'
  },
  {
    id: 'azure-native',
    label: 'Microsoft Azure Native (IaaS Compute)',
    provider: 'Microsoft Azure',
    desc: 'Azure Dedicated Host / Standard D-Series & E-Series Workload Hub',
    badge: 'Azure Native'
  },
  {
    id: 'gcve',
    label: 'Google Cloud VMware Engine (GCVE)',
    provider: 'Google Cloud',
    desc: 've1 / ve2 Dedicated BareMetal Nodes with Google Cloud Interconnect',
    badge: 'Google Cloud'
  },
  {
    id: 'vmc-aws',
    label: 'VMware Cloud on AWS (VMC)',
    provider: 'AWS',
    desc: 'i4i.metal Nitro Bare-Metal Nodes with FSx for NetApp ONTAP',
    badge: 'AWS Cloud'
  }
];

export const Step5TargetAndDR: React.FC<Step5TargetAndDRProps> = ({
  wizardState,
  onChange,
  onPrev,
  onGenerateAI,
  isGeneratingAI,
  generationStep,
  generationProgress,
  onSaveBlueprint,
  onExportExcel,
  onExport4K,
  onOpenDossier,
  hasGeneratedBlueprint,
  onScrollToBlueprint
}) => {
  const [collapsedTargets, setCollapsedTargets] = useState<Record<string, boolean>>({});
  const [expandedAdvanced, setExpandedAdvanced] = useState<Record<string, boolean>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const constraints = getTargetConstraintsForObjective(wizardState.objective);

  // Initialize active targets from wizardState or build defaults
  const activeTargets: TargetInfrastructureItem[] =
    wizardState.targets && wizardState.targets.length > 0
      ? wizardState.targets
      : [
          createDefaultTargetItem(
            constraints.requiredRole || 'Production',
            'Primary Target Environment',
            (wizardState.targetPlatform as SupportedTargetPlatform) || 'avs-gen2'
          )
        ];

  // Helper to synchronize primary target with legacy single-target fields for 100% backward compatibility
  const syncWithLegacyFields = (targetsList: TargetInfrastructureItem[]): Partial<WizardState> => {
    const primary =
      targetsList.find((t) => t.role === 'Production') ||
      targetsList[0] ||
      createDefaultTargetItem('Production');

    const drTarget = targetsList.find((t) => t.role === 'Disaster Recovery');

    return {
      targets: targetsList,
      targetPlatform: primary.platform,
      targetNodeSku: primary.nodeSku,
      targetNodeCount: primary.nodeCount,
      sddcMgmtCidr: primary.sddcMgmtCidr || '10.240.0.0/22',
      decoupledStorageEnabled: primary.decoupledStorageEnabled,
      decoupledStorageTB: primary.decoupledStorageTB,
      decoupledStorageProvider: primary.decoupledStorageProvider,
      interconnectConfig: {
        ...wizardState.interconnectConfig,
        type: primary.interconnectCircuitType || wizardState.interconnectConfig.type,
        layer2Extension: primary.layer2Extension ?? wizardState.interconnectConfig.layer2Extension
      },
      drEnabled: Boolean(drTarget || primary.drRequired || wizardState.objective === 'migrate-and-dr' || wizardState.objective === 'setup-dr'),
      drConfig: {
        ...wizardState.drConfig,
        engine: (drTarget?.drEngine || primary.drEngine || wizardState.drConfig.engine),
        rpoMinutes: (drTarget?.drRpoMinutes ?? primary.drRpoMinutes ?? wizardState.drConfig.rpoMinutes),
        rtoMinutes: (drTarget?.drRtoMinutes ?? primary.drRtoMinutes ?? wizardState.drConfig.rtoMinutes),
        strategy: (drTarget?.drStrategy || primary.drStrategy || wizardState.drConfig.strategy)
      }
    };
  };

  const toggleTargetCollapse = (id: string) => {
    setCollapsedTargets((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddTarget = () => {
    if (!constraints.allowMultiple) {
      setValidationError(
        `Architectural objective "${constraints.ruleTitle}" allows exactly one target environment.`
      );
      return;
    }
    setValidationError(null);

    // Determine default role for new target
    const hasProduction = activeTargets.some((t) => t.role === 'Production');
    const role: 'Production' | 'Disaster Recovery' =
      hasProduction && constraints.allowedRoles.includes('Disaster Recovery')
        ? 'Disaster Recovery'
        : 'Production';

    const defaultPlatform =
      activeTargets[0]?.platform === 'avs-gen2' ? 'avs-gen2' : 'avs-gen2';

    const newTarget = createDefaultTargetItem(
      role,
      role === 'Disaster Recovery' ? 'Disaster Recovery SDDC' : `Production Target ${activeTargets.length + 1}`,
      defaultPlatform
    );

    const updated = [...activeTargets, newTarget];
    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleRemoveTarget = (id: string) => {
    if (activeTargets.length <= 1) {
      setValidationError('At least one target environment must be configured.');
      return;
    }
    setValidationError(null);
    const updated = activeTargets.filter((t) => t.id !== id);
    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleUpdateTarget = (id: string, partial: Partial<TargetInfrastructureItem>) => {
    setValidationError(null);
    const updated = activeTargets.map((t) => {
      if (t.id !== id) return t;
      const merged = { ...t, ...partial };
      // If platform changed, reset nodeSku to a valid SKU for that platform
      if (partial.platform && partial.platform !== t.platform) {
        const matchingSkus = TARGET_NODE_SKU_CATALOGUE.filter((s) => s.platform === partial.platform);
        if (matchingSkus.length > 0) {
          merged.nodeSku = matchingSkus[0].sku;
        }
      }
      return merged;
    });

    onChange((prev) => ({
      ...prev,
      ...syncWithLegacyFields(updated)
    }));
  };

  const handleGenerateClick = () => {
    const check = validateWizardStep(5, {
      ...wizardState,
      targets: activeTargets
    });
    if (!check.isValid) {
      setValidationError(
        check.errors[0] || 'Please ensure target node counts, SKUs, and interconnect circuits are valid.'
      );
      // Reveal hidden sections so the field behind an error is never out of sight
      setCollapsedTargets({});
      setExpandedAdvanced(Object.fromEntries(activeTargets.map((t) => [t.id, true])));
      return;
    }
    setValidationError(null);
    onGenerateAI();
  };

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1.5">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase">
          <span>Step 05 / 05</span>
          <span>·</span>
          <span>Target Platform & Disaster Recovery</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Target Cloud SDDC Platforms, Replication & DR
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>{activeTargets.length} Target{activeTargets.length > 1 ? 's' : ''} Configured</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Set the role, platform, node SKU and count for each target. Storage, migration and connectivity are summarized; open them to edit.
        </p>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* SECTION 1: Architectural Goal Constraints Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Architectural Objective Rule:</span>
            <span
              className={`px-2.5 py-0.5 rounded font-mono font-bold text-[11px] ${
                constraints.allowMultiple
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
              }`}
            >
              {constraints.ruleTitle}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-2xl">
            {constraints.ruleDescription}
          </p>
        </div>

        {/* Add Target Button */}
        <div>
          {constraints.allowMultiple ? (
            <button
              type="button"
              onClick={handleAddTarget}
              className="px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Target Platform</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[11px] text-center">
              Single Target Enforced by Goal
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Configured Target Environments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-200">
            Target Cloud Deployments ({activeTargets.length})
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Quorum Minimums: 3 nodes (AVS, GCVE, NC2) · 2 nodes (AWS VMC, Azure Native)
          </span>
        </div>

        {activeTargets.map((target, tIdx) => {
          const isCollapsed = Boolean(collapsedTargets[target.id]);
          const targetCompat = getCompatibilityForPlatform(target.platform);
          const availableSkus = TARGET_NODE_SKU_CATALOGUE.filter(
            (sku) => sku.platform === target.platform
          );
          const isDrRole = target.role === 'Disaster Recovery';
          const sddcCidrCheck = parseAndValidateCidr(target.sddcMgmtCidr, 'azure');

          return (
            <div
              key={target.id}
              className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg transition-all"
            >
              {/* Target Card Header */}
              <div className="p-3.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${
                      isDrRole
                        ? 'bg-purple-950/70 border-purple-500/40 text-purple-300'
                        : 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
                    }`}
                  >
                    {tIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={target.name}
                        onChange={(e) => handleUpdateTarget(target.id, { name: e.target.value })}
                        className="font-bold text-xs sm:text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-400 focus:outline-none px-1 truncate"
                      />
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 border ${
                          isDrRole
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                        }`}
                      >
                        {target.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono pl-1">
                      {target.nodeCount}x {target.nodeSku} · Subnet: {target.sddcMgmtCidr} · {target.region || 'Default Region'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeTargets.length > 1 && constraints.allowMultiple && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTarget(target.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                      title="Remove this target platform"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleTargetCollapse(target.id)}
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

              {/* Target Card Body */}
              {!isCollapsed && (
                <div className="p-4 space-y-4 text-xs animate-in fade-in duration-150">
                  {/* Grid 1: Role & Platform Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Role Selector */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        Target Role Assignment <span className="text-cyan-400 font-mono">*</span>
                      </label>
                      <select
                        value={target.role}
                        onChange={(e) =>
                          handleUpdateTarget(target.id, {
                            role: e.target.value as any,
                            drRequired: e.target.value === 'Disaster Recovery'
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-400"
                      >
                        {constraints.allowedRoles.includes('Production') && (
                          <option value="Production">Primary / Production SDDC</option>
                        )}
                        {constraints.allowedRoles.includes('Disaster Recovery') && (
                          <option value="Disaster Recovery">Secondary / DR Standby</option>
                        )}
                      </select>
                    </div>

                    {/* Platform Selector */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        Target Cloud Platform <span className="text-cyan-400 font-mono">*</span>
                      </label>
                      <select
                        value={target.platform}
                        onChange={(e) =>
                          handleUpdateTarget(target.id, {
                            platform: e.target.value as SupportedTargetPlatform
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-cyan-400"
                      >
                        {TARGET_PLATFORMS.map((plat) => (
                          <option key={plat.id} value={plat.id}>
                            {plat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Region Selector */}
                    <div className="space-y-1">
                      <label className="text-slate-400">Target Cloud Region</label>
                      <input
                        type="text"
                        value={target.region || ''}
                        onChange={(e) => handleUpdateTarget(target.id, { region: e.target.value })}
                        placeholder={
                          target.platform.includes('vmc')
                            ? 'us-east-1 (N. Virginia)'
                            : target.platform.includes('gcve')
                            ? 'us-central1 (Iowa)'
                            : isDrRole
                            ? 'East US 2 (Secondary)'
                            : 'East US (Primary)'
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Grid 2: BareMetal Node Class, Node Count, Subnet CIDR */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Node SKU */}
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        Dedicated Node Class / SKU <span className="text-cyan-400 font-mono">*</span>
                      </label>
                      <select
                        value={target.nodeSku}
                        onChange={(e) => handleUpdateTarget(target.id, { nodeSku: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                      >
                        {availableSkus.length > 0 ? (
                          availableSkus.map((sku) => (
                            <option key={sku.sku} value={sku.sku}>
                              {sku.sku} — {sku.ramGB}GB RAM, {sku.physicalCores} Cores, {sku.rawStorageTB}TB Raw
                            </option>
                          ))
                        ) : (
                          <option value={target.nodeSku}>{target.nodeSku}</option>
                        )}
                      </select>
                    </div>

                    {/* Node Count */}
                    <div className="space-y-1">
                      <label className="text-slate-400 flex items-center justify-between">
                        <span>
                          Cluster Node Count <span className="text-cyan-400 font-mono">*</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {target.platform === 'vmc-aws' || target.platform === 'azure-native'
                            ? 'Min 2 Nodes'
                            : 'Min 3 Quorum'}
                        </span>
                      </label>
                      <input
                        type="number"
                        min={target.platform === 'vmc-aws' || target.platform === 'azure-native' ? 2 : 3}
                        max={64}
                        value={target.nodeCount}
                        onChange={(e) =>
                          handleUpdateTarget(target.id, {
                            nodeCount: Math.max(
                              target.platform === 'vmc-aws' || target.platform === 'azure-native' ? 2 : 3,
                              parseInt(e.target.value) || 3
                            )
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* SDDC Management CIDR */}
                    <div className="space-y-1">
                      <label className="text-slate-400 flex items-center justify-between">
                        <span>
                          SDDC Management CIDR <span className="text-cyan-400 font-mono">*</span>
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            sddcCidrCheck.isValid ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {sddcCidrCheck.isValid ? '✓ Valid CIDR' : 'Required Non-Overlapping'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={target.sddcMgmtCidr}
                        onChange={(e) => handleUpdateTarget(target.id, { sddcMgmtCidr: e.target.value })}
                        placeholder={isDrRole ? '10.244.0.0/22' : '10.240.0.0/22'}
                        className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-white font-mono focus:outline-none ${
                          sddcCidrCheck.isValid ? 'border-slate-700 focus:border-cyan-400' : 'border-amber-500/60'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Storage, migration and connectivity: summarized, expands to full controls */}
                  <button
                    type="button"
                    onClick={() => setExpandedAdvanced((p) => ({ ...p, [target.id]: !p[target.id] }))}
                    aria-expanded={Boolean(expandedAdvanced[target.id])}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 flex items-center justify-between gap-3 text-left cursor-pointer transition"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-slate-200">Storage, migration & connectivity</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {target.decoupledStorageEnabled ? `${target.decoupledStorageTB} TB decoupled storage` : 'No decoupled storage'}
                        {' · '}
                        {target.migrationTool || 'No migration tool'}
                        {' · '}
                        {target.interconnectCircuitType || wizardState.interconnectConfig?.type || 'No circuit'}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1 shrink-0">
                      {expandedAdvanced[target.id] ? 'Hide' : 'Edit'}
                      {expandedAdvanced[target.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {expandedAdvanced[target.id] && (
                    <>
                  {/* Grid 3: Decoupled Storage, Migration Appliance, Interconnect Circuit */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Decoupled Storage */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                          <span>External Decoupled Storage</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={target.decoupledStorageEnabled}
                          onChange={(e) =>
                            handleUpdateTarget(target.id, {
                              decoupledStorageEnabled: e.target.checked
                            })
                          }
                          className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                        />
                      </div>
                      {target.decoupledStorageEnabled && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] text-slate-400">
                            {target.platform.includes('avs')
                              ? 'Azure NetApp Files (ANF NFS Datastore)'
                              : target.platform === 'vmc-aws'
                              ? 'Amazon FSx for NetApp ONTAP'
                              : target.platform === 'gcve'
                              ? 'Google Cloud NetApp Volumes (GCNV)'
                              : 'Nutanix DSF Clustered Volumes'}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={10}
                              max={1000}
                              step={10}
                              value={target.decoupledStorageTB}
                              onChange={(e) =>
                                handleUpdateTarget(target.id, {
                                  decoupledStorageTB: Math.max(10, parseInt(e.target.value) || 10)
                                })
                              }
                              className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                            />
                            <span className="text-[11px] text-slate-400">TB Datastore</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Migration Engine */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Workload Migration Engine</span>
                      </label>
                      <select
                        value={target.migrationTool || 'VMware HCX Enterprise'}
                        onChange={(e) => handleUpdateTarget(target.id, { migrationTool: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                      >
                        {targetCompat.allowedMigrationTools.map((tool) => (
                          <option key={tool} value={tool}>
                            {tool}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500">
                        Compatible with {target.platform.toUpperCase()}
                      </p>
                    </div>

                    {/* Interconnect Circuit */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Direct Cloud Interconnect</span>
                      </label>
                      <select
                        value={target.interconnectCircuitType || targetCompat.allowedInterconnects[0]}
                        onChange={(e) =>
                          handleUpdateTarget(target.id, { interconnectCircuitType: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                      >
                        {targetCompat.allowedInterconnects.map((circuit) => (
                          <option key={circuit} value={circuit}>
                            {circuit}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={target.layer2Extension ?? true}
                          onChange={(e) =>
                            handleUpdateTarget(target.id, { layer2Extension: e.target.checked })
                          }
                          className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                        />
                        <span>Layer 2 Network Extension (HCX NE)</span>
                      </div>
                    </div>
                  </div>
                    </>
                  )}

                  {/* Section: Disaster Recovery Replication SLA (Shown for DR role or when objective includes DR) */}
                  {(isDrRole ||
                    wizardState.objective === 'migrate-and-dr' ||
                    wizardState.objective === 'setup-dr') && (
                    <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-xs text-purple-200">
                          Disaster Recovery SLA & Continuous Replication Engine
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Replication Engine</label>
                          <select
                            value={target.drEngine || 'VMware SRM + vSphere Replication'}
                            onChange={(e) => handleUpdateTarget(target.id, { drEngine: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
                          >
                            <option value="VMware SRM + vSphere Replication">VMware SRM + vSphere Replication</option>
                            <option value="Nutanix Metro Availability / Leap">Nutanix Metro Availability / Leap</option>
                            <option value="Zerto Continuous Data Protection (CDP)">Zerto Continuous Data Protection (CDP)</option>
                            <option value="Veeam Backup & Replication v12">Veeam Backup & Replication</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Target RPO SLA (Minutes)</label>
                          <input
                            type="number"
                            min={0}
                            max={1440}
                            value={target.drRpoMinutes ?? 5}
                            onChange={(e) =>
                              handleUpdateTarget(target.id, {
                                drRpoMinutes: Math.max(0, parseInt(e.target.value) || 0)
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Target RTO SLA (Minutes)</label>
                          <input
                            type="number"
                            min={1}
                            max={1440}
                            value={target.drRtoMinutes ?? 20}
                            onChange={(e) =>
                              handleUpdateTarget(target.id, {
                                drRtoMinutes: Math.max(1, parseInt(e.target.value) || 1)
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">DR Deployment Strategy</label>
                          <select
                            value={target.drStrategy || 'Pilot Light (3-Node Minimum)'}
                            onChange={(e) => handleUpdateTarget(target.id, { drStrategy: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
                          >
                            <option value="Pilot Light (3-Node Minimum)">Pilot Light (3-Node Minimum)</option>
                            <option value="Warm Standby (N+1 Reserved Capacity)">Warm Standby (Reserved Cluster)</option>
                            <option value="Hot Standby (Active-Active Multi-Site)">Hot Standby (Active-Active)</option>
                            <option value="Cold Standby (Backup & Rapid Spin-Up)">Cold Standby (Cloud Storage)</option>
                          </select>
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

      {/* Prominent Generation Callout Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-2 border-cyan-500/60 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Synthesize Architecture & Render 3D Cloud Blueprint
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Turns your configuration into a 3D architecture diagram you can review, export and share.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {hasGeneratedBlueprint && (
              <button
                type="button"
                onClick={onScrollToBlueprint}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 border border-cyan-500/40 transition cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>View Blueprint ↓</span>
              </button>
            )}

            <button
              type="button"
              disabled={isGeneratingAI}
              onClick={handleGenerateClick}
              className={`px-6 py-3 rounded-xl text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                isGeneratingAI
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 shadow-cyan-500/30 hover:scale-[1.02]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAI ? 'Synthesizing 3D Blueprint...' : 'Generate 3D Blueprint'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Progress Display */}
        {isGeneratingAI && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {generationStep}
              </span>
              <span className="text-cyan-400 font-bold">{generationProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Security & Firewalls</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveBlueprint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>Save State</span>
          </button>
          <button
            type="button"
            onClick={onExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>BOM Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
