import React, { useState, useMemo } from 'react';
import {
  Network,
  Shield,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  Maximize2,
  X,
  FileCode,
  Copy,
  Check,
  Server,
  Zap,
  Filter,
  RefreshCw,
  Eye,
  Sliders,
  Calendar,
  Upload,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Info
} from 'lucide-react';
import { useCustomization } from '../context/CustomizationContext';
import { exportColorCodedWavePlanExcel } from '../utils/excelWaveExport';
import { SAMPLE_ENTERPRISE_VMS } from '../data/sampleRvToolsData';
import { calculateMigrationWaves } from '../utils/migrationCalculator';

export interface AriaApplicationTier {
  id: string;
  name: string;
  tier: string;
  vmCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  flowsDetected: number;
  vms: string[];
}

export interface AriaDfwRecommendation {
  id: string;
  source: string;
  destination: string;
  port: string;
  action: 'ALLOW' | 'DROP';
  status: 'Recommended' | 'Active' | 'Enforced' | 'Audited';
}

export interface AriaDataset {
  applications: AriaApplicationTier[];
  dfwRecommendations: AriaDfwRecommendation[];
}

// Production Sample Data embedded directly for instant one-click testing
export const SAMPLE_ARIA_DATA: AriaDataset = {
  applications: [
    {
      id: "app-01",
      name: "Core Banking Platform",
      tier: "Database Tier",
      vmCount: 4,
      riskLevel: "Medium",
      flowsDetected: 1420,
      vms: ["db-node-01", "db-node-02", "redis-cache-01", "redis-cache-02"]
    },
    {
      id: "app-02",
      name: "Core Banking Platform",
      tier: "Application Tier",
      vmCount: 6,
      riskLevel: "Low",
      flowsDetected: 3850,
      vms: ["app-srv-01", "app-srv-02", "app-srv-03", "app-srv-04", "app-srv-05", "app-srv-06"]
    },
    {
      id: "app-03",
      name: "Core Banking Platform",
      tier: "Web Tier",
      vmCount: 3,
      riskLevel: "Low",
      flowsDetected: 8900,
      vms: ["web-proxy-01", "web-proxy-02", "lb-edge-01"]
    },
    {
      id: "app-04",
      name: "SAP S/4HANA ERP",
      tier: "Database Tier (HANA)",
      vmCount: 3,
      riskLevel: "High",
      flowsDetected: 14200,
      vms: ["hana-primary-01", "hana-standby-02", "hana-worker-03"]
    },
    {
      id: "app-05",
      name: "SAP S/4HANA ERP",
      tier: "Application Tier (PAS/AAS)",
      vmCount: 4,
      riskLevel: "Medium",
      flowsDetected: 6400,
      vms: ["sap-pas-01", "sap-aas-01", "sap-aas-02", "sap-gw-01"]
    }
  ],
  dfwRecommendations: [
    { id: "dfw-1", source: "Web-Tier-SG", destination: "App-Tier-SG", port: "443 / TCP", action: "ALLOW", status: "Recommended" },
    { id: "dfw-2", source: "App-Tier-SG", destination: "DB-Tier-SG", port: "1433 / TCP", action: "ALLOW", status: "Recommended" },
    { id: "dfw-3", source: "Any", destination: "Web-Tier-SG", port: "80 / TCP", action: "ALLOW", status: "Active" },
    { id: "dfw-4", source: "Web-Tier-SG", destination: "DB-Tier-SG", port: "ANY (Direct Bypass)", action: "DROP", status: "Recommended" },
    { id: "dfw-5", source: "App-Tier-SG", destination: "Shared-Services-SG", port: "53, 88 / UDP, TCP", action: "ALLOW", status: "Enforced" }
  ]
};

export const AriaNetworkDeepDiveSection: React.FC = () => {
  const { theme, setIsBriefingModalOpen } = useCustomization();

  // Active Aria Dataset state (supports built-in sample or uploaded files)
  const [ariaData, setAriaData] = useState<AriaDataset>(SAMPLE_ARIA_DATA);
  const [dataSourceName, setDataSourceName] = useState<string>('Built-In Sample Data (One-Click Loaded)');
  const [activeTab, setActiveTab] = useState<'topology' | 'dfw' | 'flows' | 'diagrams'>('topology');
  const [selectedAppName, setSelectedAppName] = useState<string>('All Applications');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedRuleId, setCopiedRuleId] = useState<string | null>(null);
  const [approvedRules, setApprovedRules] = useState<Record<string, boolean>>({
    'dfw-1': true,
    'dfw-2': true,
    'dfw-3': true,
    'dfw-4': true
  });

  // Excel Wave Export Customer State
  const [customerName, setCustomerName] = useState<string>('Global Financial Enterprises');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [handoffSuccessNotice, setHandoffSuccessNotice] = useState<string | null>(null);

  // Diagram modal state
  const [fullscreenDiagram, setFullscreenDiagram] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  // Load Built-in Sample Data
  const handleLoadSampleData = () => {
    setAriaData(SAMPLE_ARIA_DATA);
    setDataSourceName('Built-In Sample Data (One-Click Loaded)');
    setUploadError(null);
  };

  // Handle Manual File Upload (.json or .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const fileName = file.name;
    const isJson = fileName.toLowerCase().endsWith('.json');
    const isCsv = fileName.toLowerCase().endsWith('.csv');

    if (!isJson && !isCsv) {
      setUploadError('Unsupported file format. Please upload an Aria export in .json or .csv format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || '');

        if (isJson) {
          const parsed = JSON.parse(text);

          // Support exact SAMPLE_ARIA_DATA structure or variations
          if (parsed.applications && Array.isArray(parsed.applications)) {
            const validApps: AriaApplicationTier[] = parsed.applications.map((app: any, idx: number) => ({
              id: app.id || `app-${idx + 1}`,
              name: app.name || 'Enterprise Workload',
              tier: app.tier || 'Application Tier',
              vmCount: Number(app.vmCount) || (Array.isArray(app.vms) ? app.vms.length : 1),
              riskLevel: (['Low', 'Medium', 'High'].includes(app.riskLevel) ? app.riskLevel : 'Low') as 'Low' | 'Medium' | 'High',
              flowsDetected: Number(app.flowsDetected) || 1200,
              vms: Array.isArray(app.vms) ? app.vms : [`vm-node-${idx + 1}`]
            }));

            const validDfw: AriaDfwRecommendation[] = Array.isArray(parsed.dfwRecommendations)
              ? parsed.dfwRecommendations.map((r: any, idx: number) => ({
                  id: r.id || `dfw-${idx + 1}`,
                  source: r.source || 'Any',
                  destination: r.destination || 'Workload-SG',
                  port: r.port || '443 / TCP',
                  action: r.action === 'DROP' ? 'DROP' : 'ALLOW',
                  status: (['Recommended', 'Active', 'Enforced', 'Audited'].includes(r.status) ? r.status : 'Recommended') as any
                }))
              : SAMPLE_ARIA_DATA.dfwRecommendations;

            setAriaData({
              applications: validApps,
              dfwRecommendations: validDfw
            });
            setDataSourceName(`Imported File: ${fileName}`);
          } else {
            throw new Error('JSON is missing the "applications" array. Ensure format matches Aria/vRNI export schema.');
          }
        } else if (isCsv) {
          // Parse CSV lines
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length < 2) {
            throw new Error('CSV file is empty or missing data rows.');
          }

          const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
          const newApps: AriaApplicationTier[] = [];
          const newDfw: AriaDfwRecommendation[] = [];

          // Heuristic CSV parsing: check whether it's app inventory or DFW rules
          const isDfwCsv = headers.some(h => h.includes('source') || h.includes('destination') || h.includes('port'));

          if (isDfwCsv) {
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
              if (cols.length >= 4) {
                newDfw.push({
                  id: `dfw-csv-${i}`,
                  source: cols[0] || 'Any',
                  destination: cols[1] || 'Internal-SG',
                  port: cols[2] || '443 / TCP',
                  action: (cols[3] || '').toUpperCase().includes('DROP') || (cols[3] || '').toUpperCase().includes('DENY') ? 'DROP' : 'ALLOW',
                  status: 'Recommended'
                });
              }
            }
            if (newDfw.length > 0) {
              setAriaData(prev => ({ ...prev, dfwRecommendations: newDfw }));
              setDataSourceName(`Imported DFW CSV: ${fileName}`);
            }
          } else {
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
              if (cols.length >= 3) {
                const vmList = cols[4] ? cols[4].split(';').map(v => v.trim()) : [`vm-${i}-01`, `vm-${i}-02`];
                newApps.push({
                  id: `app-csv-${i}`,
                  name: cols[0] || 'Discovered Application',
                  tier: cols[1] || 'Application Tier',
                  vmCount: Number(cols[2]) || vmList.length,
                  riskLevel: (['Low', 'Medium', 'High'].includes(cols[3]) ? cols[3] : 'Low') as any,
                  flowsDetected: Number(cols[5]) || 2400,
                  vms: vmList
                });
              }
            }
            if (newApps.length > 0) {
              setAriaData(prev => ({ ...prev, applications: newApps }));
              setDataSourceName(`Imported Application CSV: ${fileName}`);
            }
          }
        }
      } catch (err: any) {
        setUploadError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the selected file. Please verify permissions.');
    };
    reader.readAsText(file);
  };

  // Filtered Applications
  const availableAppNames = useMemo(() => {
    const names = Array.from(new Set(ariaData.applications.map(a => a.name)));
    return ['All Applications', ...names];
  }, [ariaData.applications]);

  const displayedApplications = useMemo(() => {
    if (selectedAppName === 'All Applications') {
      return ariaData.applications;
    }
    return ariaData.applications.filter(a => a.name === selectedAppName);
  }, [ariaData.applications, selectedAppName]);

  // Aggregated Flow Metrics
  const totalFlows = useMemo(() => {
    return displayedApplications.reduce((acc, a) => acc + a.flowsDetected, 0);
  }, [displayedApplications]);

  const totalVMsDiscovered = useMemo(() => {
    return displayedApplications.reduce((acc, a) => acc + a.vmCount, 0);
  }, [displayedApplications]);

  // Copy rule configuration snippet
  const handleCopyCode = (rule: AriaDfwRecommendation) => {
    const terraformSnippet = `# NSX Distributed Firewall Rule generated by Aria Networks
resource "nsxt_firewall_section" "dfw_rule_${rule.id}" {
  display_name = "RULE_${rule.id}_${rule.source}_to_${rule.destination}"
  stateful     = true

  rule {
    display_name        = "${rule.action}_${rule.source}_to_${rule.destination}"
    source_groups       = ["${rule.source}"]
    destination_groups  = ["${rule.destination}"]
    services            = ["${rule.port}"]
    action              = "${rule.action}"
    logged              = true
  }
}`;
    navigator.clipboard.writeText(terraformSnippet);
    setCopiedRuleId(rule.id);
    setTimeout(() => setCopiedRuleId(null), 2500);
  };

  // Toggle Rule Approval state
  const toggleRuleApproval = (ruleId: string) => {
    setApprovedRules(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  // Export Color-Coded Excel Plan
  const handleExportExcel = () => {
    const waveResults = calculateMigrationWaves(
      SAMPLE_ENTERPRISE_VMS as any,
      {
        vCpuOvercommit: 2,
        ramBufferPercent: 15,
        migrationWanMbps: 2000,
        dataCompressionRatio: 0.35,
        dailyChurnPercent: 15,
        concurrentMigrationsPerAppliance: 8
      }
    );

    exportColorCodedWavePlanExcel({
      customerName: customerName.trim() || 'Global Financial Enterprises',
      architectName: 'Wasim Sayyed, Principal VMware Architect',
      targetCloud: 'Azure VMware Solution (AVS)',
      nodeSku: 'AV36P Bare-Metal Cluster',
      storagePolicy: 'RAID 5, FTT 1 (~1.33x Overhead)',
      totalNodes: 6,
      vCpuOvercommit: 2,
      ramBufferPercent: 15,
      waves: waveResults.waves,
      allWorkloads: SAMPLE_ENTERPRISE_VMS as any,
      dfwRules: ariaData.dfwRecommendations
    });
    setShowExportModal(false);
  };

  // Sync discovered application tiers with Migration Wave Planner
  const handleApplyToWavePlanner = () => {
    try {
      localStorage.setItem('zaboraa_aria_wave_state', JSON.stringify({
        customerName,
        source: dataSourceName,
        applications: ariaData.applications,
        dfwRules: ariaData.dfwRecommendations,
        timestamp: new Date().toISOString()
      }));
      setHandoffSuccessNotice(
        `Discovered application tiers (${totalVMsDiscovered} VMs across ${ariaData.applications.length} tiers) successfully mapped to Migration Wave Planner.`
      );
      setTimeout(() => setHandoffSuccessNotice(null), 5000);
    } catch {}
  };

  const diagramsList = [
    {
      id: 'diag-flow-discovery',
      title: 'Flow-Based Discovery & IPFIX Ingestion Telemetry Fabric',
      subtitle: 'Capturing wire-rate packets across vSphere Distributed Switches (VDS), physical switches, and cloud interconnects.',
      url: '/assets/images/aria_flow_discovery_analytics_1791552004516.jpg',
      badge: 'Flow Telemetry'
    },
    {
      id: 'diag-dfw-migration',
      title: 'NSX DFW Microsegmentation Modeling & Migration Wave Planner',
      subtitle: 'Translating observed flows into NSX Distributed Firewall rules and scheduling zero-downtime migration waves.',
      url: '/assets/images/aria_dfw_microseg_migration_planner_1791552031328.jpg',
      badge: 'DFW Zero-Trust'
    },
    {
      id: 'diag-overview',
      title: 'Aria Operations for Networks End-to-End Enterprise Architecture',
      subtitle: 'Comprehensive view of discovery, dependency mapping, migration planning, and distributed firewall policy enforcement.',
      url: '/assets/images/aria_network_microseg_showcase_1791551934452.jpg',
      badge: 'Full Architecture'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Executive Overview */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>ARIA OPERATIONS FOR NETWORKS (vRNI) ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Application Discovery, Flow Analytics & NSX DFW Planner
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Eliminate migration blind spots through wire-rate IPFIX flow capture. Map multi-tier application dependencies (Web, App, DB), generate NSX Distributed Firewall zero-trust rules, and group workloads into dependency-aware migration waves without packet loss.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Color-Coded Excel Plan</span>
            </button>
            <button
              onClick={handleApplyToWavePlanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Push Tiers to Wave Planner</span>
            </button>
          </div>
        </div>

        {/* Handoff Notice */}
        {handoffSuccessNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{handoffSuccessNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Dual Ingestion Control Bar: One-Click Sample vs Manual File Upload */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">Dual Data Ingestion Mode</div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                <span>Active Source:</span>
                <span className="font-mono text-cyan-300 text-xs px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {dataSourceName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* One-Click Sample Data Load Button */}
            <button
              onClick={handleLoadSampleData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Instantly load pre-calculated 3-tier banking and ERP topology sample"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Sample Data</span>
            </button>

            {/* Manual File Upload Picker */}
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Aria Export (.json / .csv)</span>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Quick KPI Telemetry Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Application Tiers</div>
            <div className="text-xl font-bold text-cyan-300 font-mono mt-0.5">{displayedApplications.length}</div>
            <div className="text-[10px] text-slate-500">Grouped by Aria vRNI</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Total Workloads</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">{totalVMsDiscovered} VMs</div>
            <div className="text-[10px] text-slate-500">Active East-West Traffic</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Discovered Network Flows</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{totalFlows.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Captured via IPFIX</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">NSX DFW Rules</div>
            <div className="text-xl font-bold text-indigo-400 font-mono mt-0.5">{ariaData.dfwRecommendations.length}</div>
            <div className="text-[10px] text-slate-500">Zero-Trust Modeled</div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'topology'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Application Tiers & Topology ({displayedApplications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dfw')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'dfw'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>NSX DFW Security Matrix ({ariaData.dfwRecommendations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('flows')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flows'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Inter-Tier Flow Dependencies</span>
          </button>

          <button
            onClick={() => setActiveTab('diagrams')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'diagrams'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual Architecture Blueprints (3)</span>
          </button>
        </div>

        {/* Application Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Application Scope:</span>
          <select
            value={selectedAppName}
            onChange={e => setSelectedAppName(e.target.value)}
            className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-cyan-300 font-bold cursor-pointer"
          >
            {availableAppNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. TAB CONTENT: Application Topology & Tier Grid */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedApplications.map(app => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 space-y-4 shadow-lg group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                      {app.name}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {app.tier}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      app.riskLevel === 'Low'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                        : app.riskLevel === 'Medium'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                        : 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                    }`}
                  >
                    {app.riskLevel} Risk
                  </span>
                </div>

                {/* Flow and Workload Statistics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Assigned VMs</div>
                    <div className="text-lg font-bold text-white mt-0.5">{app.vmCount} Nodes</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Flows Captured</div>
                    <div className="text-lg font-bold text-cyan-300 mt-0.5">{app.flowsDetected.toLocaleString()}</div>
                  </div>
                </div>

                {/* Member VM Roster */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>Discovered Member Workloads:</span>
                    <span className="text-[10px] font-mono text-slate-500">vNIC IPFIX</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {app.vms.map(vm => (
                      <span
                        key={vm}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{vm}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Migration Recommendation Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Recommended Boundary:</span>
                  <span className="text-emerald-400 font-bold">NSX Security Group</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: NSX DFW Rule Recommendations Table */}
      {activeTab === 'dfw' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>NSX Distributed Firewall Zero-Trust Recommendations</span>
              </div>
              <div className="text-slate-400 mt-0.5">
                Rules synthesized from observed East-West traffic flows. Enforce least-privilege microsegmentation before wave cutover.
              </div>
            </div>
            <div className="text-slate-400 font-mono">
              Approved: <span className="text-emerald-400 font-bold">{Object.values(approvedRules).filter(Boolean).length}</span> / {ariaData.dfwRecommendations.length} Rules
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-3">Rule ID</th>
                  <th className="py-3 px-3">Source SG</th>
                  <th className="py-3 px-3">Destination SG</th>
                  <th className="py-3 px-2">Port / Protocol</th>
                  <th className="py-3 px-2">Action</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-3 text-center">Governance Approval</th>
                  <th className="py-3 px-3 text-right">IaC Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {ariaData.dfwRecommendations.map(rule => {
                  const isApproved = Boolean(approvedRules[rule.id]);
                  return (
                    <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{rule.id}</td>
                      <td className="py-3 px-3 text-cyan-300">{rule.source}</td>
                      <td className="py-3 px-3 text-indigo-300">{rule.destination}</td>
                      <td className="py-3 px-2 text-slate-300">{rule.port}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            rule.action === 'ALLOW'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                              : 'bg-rose-950 text-rose-300 border border-rose-600/50'
                          }`}
                        >
                          {rule.action}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rule.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleRuleApproval(rule.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer border transition-colors ${
                            isApproved
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 hover:bg-emerald-900'
                              : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          {isApproved ? 'Approved' : 'Pending Review'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleCopyCode(rule)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy Terraform NSX-T Code"
                        >
                          {copiedRuleId === rule.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-cyan-400" />
                              <span className="text-[10px]">Terraform</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: Inter-Tier Flow Dependencies */}
      {activeTab === 'flows' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time East-West Flow Matrix (Wire-Rate Telemetry)</span>
            </div>
            <div className="text-slate-400 mt-0.5">
              Identifies latencies and bandwidth spikes across application tiers to prevent distributed lock contention.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Web-Tier to App-Tier Flow</span>
                <span className="text-emerald-400 font-mono text-[10px]">Healthy (0.4 ms RTT)</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Protocol / Port:</span>
                  <span className="text-white font-bold">TCP 443 / HTTPS &amp; mTLS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Aggregate Throughput:</span>
                  <span className="text-cyan-300 font-bold">1.8 Gbps Burst</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Flow Classification:</span>
                  <span className="text-emerald-300 font-bold">East-West Microsegment</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>App-Tier to Database-Tier Flow</span>
                <span className="text-emerald-400 font-mono text-[10px]">Optimal (0.2 ms RTT)</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Protocol / Port:</span>
                  <span className="text-white font-bold">TCP 1433 (SQL) &amp; TCP 1521 (Oracle)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Aggregate Throughput:</span>
                  <span className="text-cyan-300 font-bold">4.2 Gbps Sustained</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Security Zone:</span>
                  <span className="text-rose-300 font-bold">Zero-Trust Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: Visual Architecture Blueprints */}
      {activeTab === 'diagrams' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {diagramsList.map(diagram => (
            <div
              key={diagram.id}
              onClick={() => setFullscreenDiagram(diagram)}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-lg cursor-pointer group"
            >
              <div className="relative h-48 bg-slate-950 overflow-hidden">
                <img
                  src={diagram.url}
                  alt={diagram.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/hero_cloud_datacenter_1791450064361.jpg';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-cyan-300">
                    {diagram.badge}
                  </span>
                </div>
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="p-2 rounded-full bg-slate-950/90 text-cyan-400 border border-cyan-500/50 shadow-xl">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {diagram.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {diagram.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Diagram Lightbox */}
      {fullscreenDiagram && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 flex flex-col justify-center items-center">
          <div className="max-w-6xl w-full space-y-4">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-cyan-300">{fullscreenDiagram.title}</h3>
                <p className="text-xs text-slate-400">{fullscreenDiagram.subtitle}</p>
              </div>
              <button
                onClick={() => setFullscreenDiagram(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[80vh] flex items-center justify-center">
              <img
                src={fullscreenDiagram.url}
                alt={fullscreenDiagram.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Export to Formatted Excel Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Export Color-Coded Wave Plan</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Generate an executive, color-coded multi-tab Excel spreadsheet containing executive governance metrics, wave execution sequencing, workload discovery, and NSX Distributed Firewall rules.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Client / Customer Organization Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Global Financial Enterprises"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-slate-400 font-mono text-[11px]">
                <div className="text-emerald-400 font-bold mb-1">Generated Multi-Tab Worksheets:</div>
                <div>• Tab 1: Executive Governance &amp; Ratios (Branded Summary)</div>
                <div>• Tab 2: Wave Execution Sequence (Color-Coded Risk Tiers)</div>
                <div>• Tab 3: Detailed Workload Discovery &amp; Compatibility Matrix</div>
                <div>• Tab 4: NSX Distributed Firewall (DFW) Microsegmentation Rules</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Color-Coded .xls</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
