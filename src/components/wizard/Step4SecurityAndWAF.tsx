import React, { useState, useMemo } from 'react';
import {
  Shield,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Server,
  Network,
  Globe2,
  Sliders,
  HelpCircle,
  Share2,
  Zap,
  Radio,
  FileCheck2,
  Workflow
} from 'lucide-react';
import { WizardState } from '../../types/wizardStateAdapter';
import { validateWizardStep } from '../../utils/architectureCompatibilityRules';
import {
  FIREWALL_MODEL_CATALOGUE,
  LOAD_BALANCER_CATALOGUE,
  PUBLISHING_PLATFORM_CATALOGUE,
  DEFAULT_TRAFFIC_FLOW_DEFINITIONS,
  FirewallModelSpec
} from '../../data/securityArchitectureCatalogue';
import { getAdminControlState } from '../../utils/adminParameterControls';

interface Step4SecurityAndWAFProps {
  wizardState: WizardState;
  onChange: (updater: (prev: WizardState) => WizardState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4SecurityAndWAF: React.FC<Step4SecurityAndWAFProps> = ({
  wizardState,
  onChange,
  onNext,
  onPrev
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ external: true, waf: true });
  const [showAdvancedExternal, setShowAdvancedExternal] = useState(false);
  const [showAdvancedInternal, setShowAdvancedInternal] = useState(false);
  const [paramControls, setParamControls] = useState(() => getAdminControlState().parameterControls);

  React.useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.parameterControls) {
        setParamControls(e.detail.parameterControls);
      }
    };
    window.addEventListener('zaboraa:admin-params-changed', handler);
    return () => window.removeEventListener('zaboraa:admin-params-changed', handler);
  }, []);

  const toggleAccordion = (section: 'external' | 'internal' | 'dfw' | 'publishing' | 'loadbalancer' | 'waf' | 'traffic') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Safe fallback getters for security state
  const externalFw = wizardState.externalFirewall || {
    status: 'enabled',
    vendor: 'Palo Alto Networks',
    model: 'VM-300',
    deploymentMode: 'Active/Active ECMP',
    haTopology: 'Active/Active Multi-Zone Cluster',
    placement: 'Perimeter Ingress/Egress Transit Hub',
    throughputGbps: 4.0,
    maxSessions: '800,000'
  };

  const internalFw = wizardState.internalFirewall || {
    status: 'enabled',
    vendor: 'Fortinet',
    model: 'FortiGate-VM04',
    deploymentMode: 'Active/Passive',
    haTopology: 'Active/Passive Stateful Failover',
    placement: 'Internal Workload & Inter-Subnet Segmentation',
    throughputGbps: 7.5,
    maxSessions: '1,500,000'
  };

  const nsxDfw = wizardState.nsxDistributedFirewall || {
    enabled: true,
    version: 'NSX 4.2.x',
    policyMode: 'zero-trust-microsegmentation',
    loggingEnabled: true,
    idpsEnabled: true
  };

  const publishing = wizardState.applicationPublishing || {
    enabled: true,
    platformName: 'Customer VAP (Virtual Access Platform)',
    ingressMode: 'reverse-proxy',
    publishingPort: 443,
    protocol: 'HTTPS',
    authenticationIntegration: 'SAML 2.0 / Microsoft Entra ID'
  };

  const loadBalancing = wizardState.loadBalancing || {
    enabled: true,
    platform: 'VMware NSX Advanced Load Balancer (Avi Networks)',
    highAvailability: 'active-standby',
    sslOffloading: true,
    algorithm: 'least-connections',
    healthCheckIntervalSeconds: 5
  };

  const trafficFlows = wizardState.trafficFlows && wizardState.trafficFlows.length > 0
    ? wizardState.trafficFlows
    : DEFAULT_TRAFFIC_FLOW_DEFINITIONS.map(f => ({
        flowId: f.flowId,
        flowName: f.flowName,
        category: f.category,
        description: f.description,
        inspectingControls: f.defaultControls,
        bypassInspection: false
      }));

  // Unique vendors from catalogue
  const availableVendors = useMemo(() => {
    const vendors = Array.from(new Set(FIREWALL_MODEL_CATALOGUE.map(m => m.vendor)));
    return vendors;
  }, []);

  // Filter models for external firewall
  const externalModels = useMemo(() => {
    return FIREWALL_MODEL_CATALOGUE.filter(m => m.vendor === externalFw.vendor);
  }, [externalFw.vendor]);

  // Filter models for internal firewall
  const internalModels = useMemo(() => {
    return FIREWALL_MODEL_CATALOGUE.filter(m => m.vendor === internalFw.vendor);
  }, [internalFw.vendor]);

  // Update External Firewall helper with legacy synchronization
  const updateExternalFirewall = (patch: Partial<typeof externalFw>) => {
    setValidationError(null);
    onChange(prev => {
      const updatedExternal = { ...externalFw, ...patch };
      const isAnyFwActive = updatedExternal.status !== 'not-applicable' || prev.internalFirewall?.status !== 'not-applicable';
      const dualMode = updatedExternal.status !== 'not-applicable' && prev.internalFirewall?.status !== 'not-applicable';
      
      const primaryFwName = updatedExternal.status !== 'not-applicable'
        ? `${updatedExternal.vendor} ${updatedExternal.isCustomModel ? (updatedExternal.customModelName || 'Custom') : updatedExternal.model}`
        : `${prev.internalFirewall?.vendor || 'Palo Alto'} ${prev.internalFirewall?.model || 'VM-Series'}`;

      return {
        ...prev,
        externalFirewall: updatedExternal,
        securityNvaEnabled: isAnyFwActive,
        securityNvaConfig: {
          ...prev.securityNvaConfig,
          firewall: primaryFwName,
          inspectionMode: dualMode ? 'dual-layer' : (updatedExternal.status !== 'not-applicable' ? 'centralized-nva' : 'distributed')
        }
      };
    });
  };

  // Update Internal Firewall helper with legacy synchronization
  const updateInternalFirewall = (patch: Partial<typeof internalFw>) => {
    setValidationError(null);
    onChange(prev => {
      const updatedInternal = { ...internalFw, ...patch };
      const isAnyFwActive = prev.externalFirewall?.status !== 'not-applicable' || updatedInternal.status !== 'not-applicable';
      const dualMode = prev.externalFirewall?.status !== 'not-applicable' && updatedInternal.status !== 'not-applicable';

      return {
        ...prev,
        internalFirewall: updatedInternal,
        securityNvaEnabled: isAnyFwActive,
        securityNvaConfig: {
          ...prev.securityNvaConfig,
          inspectionMode: dualMode ? 'dual-layer' : (prev.externalFirewall?.status !== 'not-applicable' ? 'centralized-nva' : 'distributed')
        }
      };
    });
  };

  // Update NSX DFW helper with legacy synchronization
  const updateNsxDfw = (patch: Partial<typeof nsxDfw>) => {
    onChange(prev => {
      const updatedDfw = { ...nsxDfw, ...patch };
      return {
        ...prev,
        nsxDistributedFirewall: updatedDfw,
        securityNvaConfig: {
          ...prev.securityNvaConfig,
          microsegmentation: updatedDfw.enabled
        }
      };
    });
  };

  // Update Application Publishing
  const updatePublishing = (patch: Partial<typeof publishing>) => {
    onChange(prev => ({
      ...prev,
      applicationPublishing: { ...publishing, ...patch }
    }));
  };

  // Update Load Balancing
  const updateLoadBalancing = (patch: Partial<typeof loadBalancing>) => {
    onChange(prev => ({
      ...prev,
      loadBalancing: { ...loadBalancing, ...patch }
    }));
  };

  // Toggle inspecting component for a flow
  const toggleFlowControl = (
    flowId: string,
    control: 'external-firewall' | 'internal-firewall' | 'nsx-dfw' | 'waf' | 'publishing-platform' | 'load-balancer'
  ) => {
    onChange(prev => {
      const currentFlows = prev.trafficFlows && prev.trafficFlows.length > 0 ? prev.trafficFlows : trafficFlows;
      const updated = currentFlows.map(f => {
        if (f.flowId !== flowId) return f;
        const exists = f.inspectingControls.includes(control);
        const nextControls = exists
          ? f.inspectingControls.filter(c => c !== control)
          : [...f.inspectingControls, control];
        return {
          ...f,
          inspectingControls: nextControls,
          bypassInspection: nextControls.length === 0
        };
      });
      return { ...prev, trafficFlows: updated };
    });
  };

  // Toggle flow bypass inspection
  const toggleFlowBypass = (flowId: string) => {
    onChange(prev => {
      const currentFlows = prev.trafficFlows && prev.trafficFlows.length > 0 ? prev.trafficFlows : trafficFlows;
      const updated = currentFlows.map(f => {
        if (f.flowId !== flowId) return f;
        const willBypass = !f.bypassInspection;
        return {
          ...f,
          bypassInspection: willBypass,
          inspectingControls: willBypass ? [] : (DEFAULT_TRAFFIC_FLOW_DEFINITIONS.find(d => d.flowId === flowId)?.defaultControls || ['external-firewall'])
        };
      });
      return { ...prev, trafficFlows: updated };
    });
  };

  const SECTION_IDS = ['external', 'internal', 'dfw', 'publishing', 'loadbalancer', 'waf', 'traffic'];

  const renderToggle = (id: string, summary: string) => (
    <button
      type="button"
      onClick={() => setOpenSections((p) => ({ ...p, [id]: !p[id] }))}
      aria-expanded={Boolean(openSections[id])}
      className="w-full px-4 py-2 border-t border-slate-800/80 bg-slate-950/30 hover:bg-slate-950/60 flex items-center justify-between gap-3 text-left cursor-pointer transition"
    >
      <span className="text-[11px] text-slate-400 font-mono truncate">{summary}</span>
      <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1 shrink-0">
        {openSections[id] ? 'Hide details' : 'Show details'}
        {openSections[id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </span>
    </button>
  );

  const handleContinue = () => {
    const check = validateWizardStep(4, wizardState);
    if (!check.isValid) {
      setValidationError(check.errors[0] || 'Please complete required security settings.');
      setOpenSections(Object.fromEntries(SECTION_IDS.map((id) => [id, true])));
      return;
    }
    setValidationError(null);
    onNext();
  };

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1.5">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase">
          <span>Step 04 / 05</span>
          <span>·</span>
          <span>Security, Firewalls & Ingress</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>Multi-Vendor Firewall, NSX DFW & Ingress Architecture</span>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            Enterprise Tier Isolation
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          External firewall and WAF are shown first. Other sections are summarized; open one to edit it.
        </p>
      </div>

      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="font-medium">{validationError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EXTERNAL / PERIMETER FIREWALL (NORTH-SOUTH EDGE) */}
      {/* ========================================================================= */}
      {paramControls.externalFirewall !== 'hidden' && (
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>1. External / Perimeter Firewall (Edge Gateway)</span>
                {externalFw.status === 'enabled' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                    Active Inspection
                  </span>
                )}
                {externalFw.status === 'existing' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 border border-sky-500/50 text-sky-300">
                    Reusing Existing
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inspects Internet ingress/egress, direct peering circuits, and edge threat protection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => updateExternalFirewall({ status: 'enabled' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                externalFw.status === 'enabled'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Enabled (New)
            </button>
            <button
              type="button"
              onClick={() => updateExternalFirewall({ status: 'existing' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                externalFw.status === 'existing'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Existing / Reused
            </button>
            <button
              type="button"
              onClick={() => updateExternalFirewall({ status: 'not-applicable' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                externalFw.status === 'not-applicable'
                  ? 'bg-slate-700 text-slate-200 font-semibold'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Not Applicable
            </button>
          </div>
        </div>

        {externalFw.status !== 'not-applicable' &&
          renderToggle('external', `${externalFw.vendor || 'No vendor'} ${externalFw.model || ''} · ${externalFw.deploymentMode || ''}`)}
        {externalFw.status !== 'not-applicable' && openSections.external && (
          <div className="p-4 space-y-4 bg-slate-950/40 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vendor */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>Firewall Vendor</span>
                  <span className="text-[10px] font-mono text-cyan-400">*Mandatory</span>
                </label>
                <select
                  value={externalFw.vendor}
                  onChange={(e) => {
                    const newVendor = e.target.value as any;
                    const matchedModel = FIREWALL_MODEL_CATALOGUE.find(m => m.vendor === newVendor);
                    updateExternalFirewall({
                      vendor: newVendor,
                      model: matchedModel ? matchedModel.model : 'Custom-Edge',
                      isCustomModel: false,
                      throughputGbps: matchedModel?.throughputGbps || 5.0,
                      maxSessions: matchedModel?.maxSessions || '1,000,000'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                >
                  {availableVendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>

              {/* Model Selection from Catalogue or Custom */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Model & Sizing Specification</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(externalFw.isCustomModel)}
                      onChange={(e) => updateExternalFirewall({ isCustomModel: e.target.checked })}
                      className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                    />
                    <span>Enter Unlisted / Custom Model</span>
                  </label>
                </div>

                {externalFw.isCustomModel ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="e.g. PA-5450 or FortiGate-1800F"
                        value={externalFw.customModelName || ''}
                        onChange={(e) => updateExternalFirewall({ customModelName: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Throughput (Gbps)"
                          value={externalFw.customThroughputGbps || externalFw.throughputGbps || ''}
                          onChange={(e) => updateExternalFirewall({
                            customThroughputGbps: parseFloat(e.target.value) || 1,
                            throughputGbps: parseFloat(e.target.value) || 1
                          })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                        />
                        <span className="text-[11px] text-slate-400 shrink-0 font-mono">Gbps</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-600/30 text-[11px] text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>Unverified / Custom Model:</strong> Specifications are user-provided and not verified against official hardware benchmarks.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <select
                      value={externalFw.model}
                      onChange={(e) => {
                        const selected = externalModels.find(m => m.model === e.target.value);
                        if (selected) {
                          updateExternalFirewall({
                            model: selected.model,
                            throughputGbps: selected.throughputGbps,
                            maxSessions: selected.maxSessions,
                            haTopology: selected.recommendedDeploymentTopology
                          });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                    >
                      {externalModels.map(m => (
                        <option key={m.model} value={m.model}>
                          {m.displayName} — {m.throughputGbps} Gbps ({m.maxSessions} sessions)
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                        Rated: {externalFw.throughputGbps} Gbps Throughput
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        Max Sessions: {externalFw.maxSessions}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Official Verified Model
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsed Advanced Deployment Details for External Firewall */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedExternal(!showAdvancedExternal)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <span>{showAdvancedExternal ? 'Hide' : 'Show'} Deployment Mode, Placement & High Availability Options</span>
                {showAdvancedExternal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedExternal && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Deployment Architecture</label>
                    <select
                      value={externalFw.deploymentMode}
                      onChange={(e) => updateExternalFirewall({ deploymentMode: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                    >
                      <option value="Active/Active ECMP">Active/Active ECMP (Equal-Cost Multi-Path)</option>
                      <option value="Active/Passive">Active/Passive Stateful Pair</option>
                      <option value="Gateway Load Balancer (GWLB)">Gateway Load Balancer (GWLB Sandwich)</option>
                      <option value="Azure Route Server (ARS)">Azure Route Server / BGP Peering</option>
                      <option value="Native Managed Fabric">Native Managed Cloud Fabric</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Firewall Placement Tier</label>
                    <input
                      type="text"
                      value={externalFw.placement || 'Perimeter Ingress/Egress Transit Hub'}
                      onChange={(e) => updateExternalFirewall({ placement: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INTERNAL / SEGMENTATION FIREWALL (EAST-WEST TRANSIT) */}
      {/* ========================================================================= */}

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>2. Internal / Segmentation Firewall (East-West & Inter-Subnet)</span>
                {internalFw.status === 'enabled' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/50 text-indigo-300">
                    Active Segmentation
                  </span>
                )}
                {internalFw.status === 'existing' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 border border-sky-500/50 text-sky-300">
                    Reusing Existing
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inspects traffic between internal application tiers, cross-VNet/VPC routes, and hybrid datacenter transit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => updateInternalFirewall({ status: 'enabled' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                internalFw.status === 'enabled'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Enabled (New)
            </button>
            <button
              type="button"
              onClick={() => updateInternalFirewall({ status: 'existing' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                internalFw.status === 'existing'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Existing / Reused
            </button>
            <button
              type="button"
              onClick={() => updateInternalFirewall({ status: 'not-applicable' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                internalFw.status === 'not-applicable'
                  ? 'bg-slate-700 text-slate-200 font-semibold'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Not Applicable
            </button>
          </div>
        </div>

        {internalFw.status !== 'not-applicable' &&
          renderToggle('internal', `${internalFw.vendor || 'No vendor'} ${internalFw.model || ''} · ${internalFw.deploymentMode || ''}`)}
        {internalFw.status !== 'not-applicable' && openSections.internal && (
          <div className="p-4 space-y-4 bg-slate-950/40 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vendor (Independent from External) */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>Internal Firewall Vendor</span>
                  <span className="text-[10px] font-mono text-cyan-400">Independent Vendor</span>
                </label>
                <select
                  value={internalFw.vendor}
                  onChange={(e) => {
                    const newVendor = e.target.value as any;
                    const matchedModel = FIREWALL_MODEL_CATALOGUE.find(m => m.vendor === newVendor);
                    updateInternalFirewall({
                      vendor: newVendor,
                      model: matchedModel ? matchedModel.model : 'Custom-Internal',
                      isCustomModel: false,
                      throughputGbps: matchedModel?.throughputGbps || 7.5,
                      maxSessions: matchedModel?.maxSessions || '1,500,000'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                >
                  {availableVendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  Different vendors can be chosen for external perimeter and internal segmentation.
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Internal Model & Capacity</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(internalFw.isCustomModel)}
                      onChange={(e) => updateInternalFirewall({ isCustomModel: e.target.checked })}
                      className="rounded text-indigo-500 bg-slate-900 border-slate-700"
                    />
                    <span>Enter Unlisted / Custom Model</span>
                  </label>
                </div>

                {internalFw.isCustomModel ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="e.g. FortiGate-VM08 or CheckPoint-8Core"
                        value={internalFw.customModelName || ''}
                        onChange={(e) => updateInternalFirewall({ customModelName: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Throughput (Gbps)"
                          value={internalFw.customThroughputGbps || internalFw.throughputGbps || ''}
                          onChange={(e) => updateInternalFirewall({
                            customThroughputGbps: parseFloat(e.target.value) || 1,
                            throughputGbps: parseFloat(e.target.value) || 1
                          })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                        />
                        <span className="text-[11px] text-slate-400 shrink-0 font-mono">Gbps</span>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-600/30 text-[11px] text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>Unverified / Custom Model:</strong> Specifications are user-provided.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <select
                      value={internalFw.model}
                      onChange={(e) => {
                        const selected = internalModels.find(m => m.model === e.target.value);
                        if (selected) {
                          updateInternalFirewall({
                            model: selected.model,
                            throughputGbps: selected.throughputGbps,
                            maxSessions: selected.maxSessions,
                            haTopology: selected.recommendedDeploymentTopology
                          });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                    >
                      {internalModels.map(m => (
                        <option key={m.model} value={m.model}>
                          {m.displayName} — {m.throughputGbps} Gbps ({m.maxSessions} sessions)
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                        Rated: {internalFw.throughputGbps} Gbps
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        Max Sessions: {internalFw.maxSessions}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Verified Specification
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsed Advanced Deployment Details for Internal Firewall */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedInternal(!showAdvancedInternal)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                <span>{showAdvancedInternal ? 'Hide' : 'Show'} Internal HA, Topology & Inspection Policy</span>
                {showAdvancedInternal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedInternal && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">High Availability Topology</label>
                    <select
                      value={internalFw.deploymentMode}
                      onChange={(e) => updateInternalFirewall({ deploymentMode: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                    >
                      <option value="Active/Passive">Active/Passive Stateful Pair</option>
                      <option value="Active/Active ECMP">Active/Active ECMP (Equal-Cost Multi-Path)</option>
                      <option value="Gateway Load Balancer (GWLB)">Gateway Load Balancer (GWLB)</option>
                      <option value="Azure Route Server (ARS)">Azure Route Server / BGP</option>
                      <option value="Native Managed Fabric">Native Managed Cloud Fabric</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Segmentation Placement</label>
                    <input
                      type="text"
                      value={internalFw.placement || 'Internal Workload & Inter-Subnet Segmentation'}
                      onChange={(e) => updateInternalFirewall({ placement: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. OPTIONAL NSX DISTRIBUTED FIREWALL (DFW) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-500/30 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>3. Optional VMware NSX Distributed Firewall (DFW)</span>
                {nsxDfw.enabled && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/50 text-purple-300">
                    Host Hypervisor Microsegmentation
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kernel-level Zero-Trust security enforced at the virtual NIC of every workload VM without hairpinning.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateNsxDfw({ enabled: !nsxDfw.enabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
              nsxDfw.enabled
                ? 'bg-purple-950 border-purple-500 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {nsxDfw.enabled ? 'NSX DFW: ACTIVE' : 'NSX DFW: DISABLED'}
          </button>
        </div>

        {nsxDfw.enabled && renderToggle('dfw', `${nsxDfw.version || 'NSX'} · ${nsxDfw.policyMode || ''}`)}
        {nsxDfw.enabled && openSections.dfw && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Policy Enforcement Mode</label>
              <select
                value={nsxDfw.policyMode}
                onChange={(e) => updateNsxDfw({ policyMode: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-400"
              >
                <option value="zero-trust-microsegmentation">Zero-Trust Microsegmentation (Default Deny)</option>
                <option value="environment-isolation">Environment Isolation (Prod / Dev / UAT)</option>
                <option value="zone-based">Zone-Based Layer 4 / Layer 7 Filtering</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">NSX Distributed IDPS</label>
              <div className="flex items-center gap-2 pt-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={nsxDfw.idpsEnabled}
                  onChange={(e) => updateNsxDfw({ idpsEnabled: e.target.checked })}
                  className="rounded text-purple-500 bg-slate-900 border-slate-700"
                />
                <span>Enable Distributed Intrusion Detection (IDPS)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Traffic Logging & Telemetry</label>
              <div className="flex items-center gap-2 pt-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={nsxDfw.loggingEnabled}
                  onChange={(e) => updateNsxDfw({ loggingEnabled: e.target.checked })}
                  className="rounded text-purple-500 bg-slate-900 border-slate-700"
                />
                <span>Stream DFW Flow Logs to SIEM / Aria Operations</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. OPTIONAL EXTERNAL APPLICATION PUBLISHING (VAP / REVERSE PROXY) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-500/30 text-amber-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>4. Optional External Application Publishing Platform (Customer VAP)</span>
                {publishing.enabled && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300">
                    Configurable Ingress Platform
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Securely publish internal enterprise applications to external clients using customer-specified VAP, Citrix Gateway, or App Proxy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updatePublishing({ enabled: !publishing.enabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
              publishing.enabled
                ? 'bg-amber-950 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {publishing.enabled ? 'PUBLISHING: ACTIVE' : 'PUBLISHING: DISABLED'}
          </button>
        </div>

        {publishing.enabled && renderToggle('publishing', publishing.platformName?.trim() || 'Platform name not set')}
        {publishing.enabled && openSections.publishing && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Configurable Platform Name (Preserves Customer VAP) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>Publishing Product / Platform Name</span>
                  <span className="text-[10px] text-slate-500 font-mono">Configurable Product Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer VAP (Virtual Access Platform) or Citrix Gateway"
                  value={publishing.platformName}
                  onChange={(e) => updatePublishing({ platformName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400 font-medium"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <span className="text-slate-500">Quick presets:</span>
                  {PUBLISHING_PLATFORM_CATALOGUE.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updatePublishing({ platformName: p.name })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer transition"
                    >
                      {p.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingress Mode */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Ingress Delivery Mode</label>
                <select
                  value={publishing.ingressMode}
                  onChange={(e) => updatePublishing({ ingressMode: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="reverse-proxy">Reverse Proxy with SSL Offload</option>
                  <option value="zero-trust-tunnel">Zero-Trust Outbound Tunnel (No Open Ports)</option>
                  <option value="dual-tier">Dual-Tier DMZ Proxy Architecture</option>
                  <option value="ssl-offload">Direct SSL Pass-through</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Published Service Port</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={publishing.publishingPort}
                    onChange={(e) => updatePublishing({ publishingPort: parseInt(e.target.value) || 443 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">TCP</span>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] text-slate-400">Identity & Authentication Integration</label>
                <input
                  type="text"
                  value={publishing.authenticationIntegration}
                  onChange={(e) => updatePublishing({ authenticationIntegration: e.target.value })}
                  placeholder="e.g. SAML 2.0 / Microsoft Entra ID with Conditional Access"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. OPTIONAL LOAD BALANCING (VMWARE AVI, NSX LB, HYPERSCALER) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>5. Optional Application Delivery & Load Balancing</span>
                {loadBalancing.enabled && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                    L4 / L7 Traffic Distribution
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Distribute incoming traffic across healthy workload instances with health checks and SSL offloading.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateLoadBalancing({ enabled: !loadBalancing.enabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
              loadBalancing.enabled
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {loadBalancing.enabled ? 'LOAD BALANCER: ACTIVE' : 'LOAD BALANCER: DISABLED'}
          </button>
        </div>

        {loadBalancing.enabled && renderToggle('loadbalancer', loadBalancing.platform || 'Platform not set')}
        {loadBalancing.enabled && openSections.loadbalancer && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-slate-300 font-medium">Load Balancing Platform</label>
              <select
                value={loadBalancing.platform}
                onChange={(e) => updateLoadBalancing({ platform: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                {LOAD_BALANCER_CATALOGUE.map(lb => (
                  <option key={lb.id} value={lb.name}>
                    {lb.name} ({lb.type} ADC)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Balancing Algorithm</label>
              <select
                value={loadBalancing.algorithm}
                onChange={(e) => updateLoadBalancing({ algorithm: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="least-connections">Least Connections</option>
                <option value="round-robin">Round Robin</option>
                <option value="ip-hash">Source IP Hash (Session Affinity)</option>
                <option value="consistent-hashing">Consistent Hashing</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. WEB APPLICATION FIREWALL (WAF) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-500/30 text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>6. Web Application Firewall (WAF) & Layer 7 Defense</span>
                {wizardState.securityNvaConfig.wafEnabled && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-300">
                    OWASP Top 10 Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Protects against SQL injection, cross-site scripting (XSS), and HTTP protocol violations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange(p => ({
              ...p,
              securityNvaConfig: {
                ...p.securityNvaConfig,
                wafEnabled: !p.securityNvaConfig.wafEnabled
              }
            }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer ${
              wizardState.securityNvaConfig.wafEnabled
                ? 'bg-rose-950 border-rose-500 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {wizardState.securityNvaConfig.wafEnabled ? 'WAF: ACTIVE' : 'WAF: DISABLED'}
          </button>
        </div>

        {wizardState.securityNvaConfig.wafEnabled &&
          renderToggle('waf', wizardState.securityNvaConfig.wafSolution || 'Solution not set')}
        {wizardState.securityNvaConfig.wafEnabled && openSections.waf && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">WAF Appliance / Managed Engine</label>
              <select
                value={wizardState.securityNvaConfig.wafSolution}
                onChange={(e) => onChange(p => ({
                  ...p,
                  securityNvaConfig: { ...p.securityNvaConfig, wafSolution: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-rose-400"
              >
                <option value="Azure WAF on Application Gateway">Azure WAF on Application Gateway (v2)</option>
                <option value="AWS WAF on Application Load Balancer">AWS WAF on Application Load Balancer</option>
                <option value="Google Cloud Armor (Managed WAF & DDoS)">Google Cloud Armor (Managed WAF & DDoS)</option>
                <option value="Cloudflare Magic Transit & Edge WAF">Cloudflare Enterprise Edge WAF</option>
                <option value="F5 BIG-IP Advanced WAF">F5 BIG-IP Advanced WAF Virtual Edition</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Rule Engine Standard</label>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>OWASP Core Rule Set (CRS 3.3)</span>
                <span className="text-emerald-400 font-mono">Prevention Mode</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. INTERACTIVE TRAFFIC-FLOW MODELLING MATRIX */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Workflow className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <span>7. Traffic-Flow Modelling & Inspection Matrix</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  5 Flow Paths
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Identify which security controls inspect each enterprise traffic flow.
              </p>
            </div>
          </div>
        </div>

        {renderToggle('traffic', `${trafficFlows.length} traffic flow paths`)}
        {openSections.traffic && (
        <div className="p-4 space-y-3 bg-slate-950/50">
          {trafficFlows.map((flow) => {
            const hasExternal = flow.inspectingControls.includes('external-firewall');
            const hasInternal = flow.inspectingControls.includes('internal-firewall');
            const hasDfw = flow.inspectingControls.includes('nsx-dfw');
            const hasWaf = flow.inspectingControls.includes('waf');
            const hasVap = flow.inspectingControls.includes('publishing-platform');
            const hasLb = flow.inspectingControls.includes('load-balancer');

            return (
              <div
                key={flow.flowId}
                className={`p-3.5 rounded-xl border transition-all ${
                  flow.bypassInspection
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{flow.flowName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {flow.category}
                      </span>
                      {flow.bypassInspection && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-900/80 border border-rose-600 text-rose-200 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-300" />
                          Direct / Uninspected Flow
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{flow.description}</p>
                  </div>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer self-start sm:self-auto shrink-0">
                    <input
                      type="checkbox"
                      checked={flow.bypassInspection}
                      onChange={() => toggleFlowBypass(flow.flowId)}
                      className="rounded text-rose-500 bg-slate-950 border-slate-700"
                    />
                    <span className={flow.bypassInspection ? 'text-rose-300 font-semibold' : 'text-slate-400'}>
                      Bypass Inspection
                    </span>
                  </label>
                </div>

                {!flow.bypassInspection && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Active Controls:</span>

                    {/* External Firewall Button */}
                    <button
                      type="button"
                      onClick={() => toggleFlowControl(flow.flowId, 'external-firewall')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        hasExternal
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>Ext Firewall</span>
                    </button>

                    {/* Internal Firewall Button */}
                    <button
                      type="button"
                      onClick={() => toggleFlowControl(flow.flowId, 'internal-firewall')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        hasInternal
                          ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Network className="w-3 h-3" />
                      <span>Int Firewall</span>
                    </button>

                    {/* NSX DFW Button */}
                    <button
                      type="button"
                      onClick={() => toggleFlowControl(flow.flowId, 'nsx-dfw')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        hasDfw
                          ? 'bg-purple-950 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>NSX DFW</span>
                    </button>

                    {/* WAF Button */}
                    <button
                      type="button"
                      onClick={() => toggleFlowControl(flow.flowId, 'waf')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        hasWaf
                          ? 'bg-rose-950 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>WAF</span>
                    </button>

                    {/* Publishing / VAP Button */}
                    <button
                      type="button"
                      onClick={() => toggleFlowControl(flow.flowId, 'publishing-platform')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        hasVap
                          ? 'bg-amber-950 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Globe2 className="w-3 h-3" />
                      <span>Publishing (VAP)</span>
                    </button>

                    {/* Load Balancer Button */}
                    <button
                      type="button"
                      onClick={() => toggleFlowControl(flow.flowId, 'load-balancer')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        hasLb
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Load Balancer</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
          <span>Back to Landing Zone</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Continue to Target & DR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
