import React, { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Cloud,
  Network,
  HardDrive,
  Shield,
  Repeat,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Layers,
  Activity,
  FileSpreadsheet,
  Lock,
  Cpu,
  Zap,
  Info,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export type TargetCloudPlatform = 'avs' | 'gcve' | 'vmc' | 'nc2';
export type TopologyLayer = 'all' | 'compute' | 'storage' | 'sdn' | 'migration';

interface PipelineStage {
  id: number;
  title: string;
  shortName: string;
  phase: string;
  description: string;
  technicalNarrative: {
    overview: string;
    engineeringDecisions: string[];
    slaMetrics: { label: string; value: string; context: string }[];
    commandLineOrConfig: string;
    securityBoundary: string;
  };
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    title: 'Workload Discovery & Inventory Ingestion',
    shortName: '01. Discovery & Audit',
    phase: 'Assessment & Profiling',
    description: 'RVTools XLSX ingestion and vCenter API inventory profiling cataloging vCPU:pCore allocations, zombie VMDKs, and snapshot age.',
    technicalNarrative: {
      overview: 'Discovery establishes the mathematical baseline for hyperscaler node procurement. Parsing vInfo, vCPU, and vDisk sheets exposes phantom allocations and dormant workloads before commitment.',
      engineeringDecisions: [
        'RVTools spreadsheet parsing for exact VM provisioning vs actual active utilization',
        'Identification of zombie VMDKs and snapshots >3 days old causing storage bloat',
        'vCPU:pCore overcommitment target modeled at 3:1 to 4:1 for general enterprise compute',
        'Decoupled storage eligibility check: evaluating external NFS tiering vs hyperconverged vSAN'
      ],
      slaMetrics: [
        { label: 'Ingested VMs', value: '450+ VMs', context: 'Multi-datacenter inventory' },
        { label: 'Identified Waste', value: '28.4 TB', context: 'Stale snapshots & zombie VMDKs' },
        { label: 'Compute Allocation', value: '3.2:1 vCPU:pCore', context: 'Recommended sizing ratio' },
        { label: 'Audit Duration', value: '< 15 mins', context: 'Automated client parsing' }
      ],
      commandLineOrConfig: 'rvtools-cli --export all --filter "powerState=poweredOn" --output ./inventory_audit.xlsx',
      securityBoundary: 'Read-only service account on on-premise vCenter Server; zero guest-OS credential requirements.'
    }
  },
  {
    id: 2,
    title: 'Dependency Mapping & Zero-Trust Microsegmentation',
    shortName: '02. Flow Mapping',
    phase: 'Traffic & Boundary Analysis',
    description: 'Aria Operations for Networks (vRNI) IPFIX telemetry maps East-West traffic flows, clustering applications into zero-trust NSX DFW rules.',
    technicalNarrative: {
      overview: 'Unmonitored cross-vNet and cross-VLAN dependencies trigger migration outages. IPFIX packet flows define tight 3-tier boundary zones (Web, App, DB) prior to network extension.',
      engineeringDecisions: [
        'IPFIX flow sampling collected over a minimum 14-day billing and month-end cycle',
        'Automated grouping of multi-tier workloads by security tags rather than fragile static IPs',
        'NSX Distributed Firewall (DFW) kernel-level rule generation for Layer 4/Layer 7 App-ID filtering',
        'Identification of external WAN dependencies and legacy hardcoded broadcast/multicast protocols'
      ],
      slaMetrics: [
        { label: 'Discovered Flows', value: '1.8M flows', context: 'East-West internal traffic' },
        { label: 'DFW Rules Drafted', value: '142 rules', context: 'Zero-trust least-privilege policies' },
        { label: 'Coupled Apps', value: '18 bundles', context: 'Multi-tier migration waves' },
        { label: 'Inspection Overhead', value: '0 ms wire', context: 'Hypervisor vNIC distributed enforcement' }
      ],
      commandLineOrConfig: 'nsx-cli> get firewall status detail; set firewall-group --tag "Tier=Database" --membership dynamic',
      securityBoundary: 'Enforced at each hypervisor kernel vNIC before traffic hits the physical or overlay network wire.'
    }
  },
  {
    id: 3,
    title: 'Target Cloud SDDC Architecture & Storage Decoupling',
    shortName: '03. Target Architecture',
    phase: 'Hyperscaler Topology Design',
    description: 'Bare-metal private cloud deployment with decoupled external NFS datastores (ANF / FSx / GCNV) to eliminate compute overprovisioning.',
    technicalNarrative: {
      overview: 'Standard hyperscaler nodes bundle compute and storage together. By decoupling storage via managed NFS (Azure NetApp Files, FSx ONTAP, GCNV), storage can scale independently, saving up to 40% TCO.',
      engineeringDecisions: [
        'Deployment of bare-metal ESXi hosts with N+1 or N+2 High Availability reserve',
        'Mounting external NFS 3.0/4.1 storage pools directly to ESXi for high-capacity VMDK tiers',
        'Active-Active Tier-0 ECMP multi-edge routers terminating dual 10–100 Gbps private interconnects',
        'FastPath ExpressRoute / DirectConnect / Cloud Interconnect bypasses gateway transit hops'
      ],
      slaMetrics: [
        { label: 'Private Interconnect', value: '10–100 Gbps', context: 'Sub-2ms wire latency guarantee' },
        { label: 'Storage TCO Saved', value: '-38% costs', context: 'Avoided buying redundant bare-metal nodes' },
        { label: 'SDDC Availability', value: '99.99%', context: 'Multi-AZ synchronous cluster SLA' },
        { label: 'NFS Mount Throughput', value: '1,200 MB/s', context: 'Burst line-rate for database I/O' }
      ],
      commandLineOrConfig: 'az vmware cluster create --resource-group rg-sddc --private-cloud pc-avs --sku AV36 --node-count 3',
      securityBoundary: 'Isolated tenant VPC/VNet peering with customer-managed encryption keys (CMEK) and strict IAM roles.'
    }
  },
  {
    id: 4,
    title: 'HCX Migration Wave Execution (Bulk & RAV)',
    shortName: '04. Wave Migration',
    phase: 'Live Cutover Windows',
    description: 'VMware HCX Service Mesh deploys L2 Network Extension with Mobility Optimized Networking (MON) and Replication-Assisted vMotion.',
    technicalNarrative: {
      overview: 'VMware HCX extends layer-2 broadcast domains across the WAN with hardware WAN optimization and data deduplication. Workloads migrate live without IP readdressing.',
      engineeringDecisions: [
        'HCX-IX (Interconnect) and HCX-WAN-OPT appliances deployed with multi-site mesh peering',
        'Bulk Migration pre-seeds 99% of disk blocks in the background during normal business hours',
        'Replication-Assisted vMotion (RAV) performs live delta sync with <1 second hypervisor stun',
        'Mobility Optimized Networking (MON) dynamically routes local VM egress to prevent WAN tromboning'
      ],
      slaMetrics: [
        { label: 'Cutover Stun', value: '< 1.0 sec', context: 'Zero user session disconnect' },
        { label: 'Replication Bandwidth', value: '850 Mbps', context: 'WAN-optimized compression stream' },
        { label: 'Migration Wave Size', value: '40 VMs / batch', context: 'Automated parallel delta sync' },
        { label: 'IP Readdressing', value: '0 changes', context: 'L2 extended broadcast preservation' }
      ],
      commandLineOrConfig: 'hcx-appliance# mobility-engine --migrate --type RAV --source-ds vsanDatastore --target-ds anfDatastore',
      securityBoundary: 'Suite-B AES-256 IPsec tunnel encapsulation across dedicated private leased circuit.'
    }
  },
  {
    id: 5,
    title: 'Cutover Validation & Dynamic Routing Convergence',
    shortName: '05. Routing Convergence',
    phase: 'Validation & Traffic Swing',
    description: 'Gateway swing, BGP route reflection verification, DNS TTL convergence, and end-to-end synthetic latency monitoring.',
    technicalNarrative: {
      overview: 'Following workload cutover, default gateway ownership transfers from on-premise core switches to the cloud NSX Tier-1 router via MON, eliminating latency hairpins.',
      engineeringDecisions: [
        'Automated swing of default gateway IP to NSX Tier-1 router once 80%+ of subnet has migrated',
        'Verification of BGP route tables across top-of-rack switches and cloud transit gateways',
        'Synthetic probers validate TCP port availability (HTTP 443, SQL 1433, RPC 135) across all tiers',
        'Rollback contingency test: verified reverse vMotion delta sync available for 72 hours post-cutover'
      ],
      slaMetrics: [
        { label: 'Routing Symmetry', value: '100% verified', context: 'Zero asymmetric packet drop' },
        { label: 'Round-Trip Time', value: '1.4 ms', context: 'Cloud SDDC to native PaaS services' },
        { label: 'BGP Convergence', value: '< 3.0 sec', context: 'Autonomous system path update' },
        { label: 'Synthetic SLA Checks', value: '240 probes/min', context: 'Health & response-time validation' }
      ],
      commandLineOrConfig: 'nsx-t> get logical-router-interface --type tier1-uplink; traceroute 10.240.12.50 --numeric',
      securityBoundary: 'Autonomous System (AS) boundary path filtering prevents accidental route leaking to public Internet.'
    }
  },
  {
    id: 6,
    title: 'Day-2 Cloud Operations & Multi-AZ Disaster Recovery',
    shortName: '06. Day-2 & DR Operations',
    phase: 'Steady-State & Resiliency',
    description: 'Site Recovery Manager (SRM) automated protection groups, non-disruptive test bubbles, and native cloud services integration.',
    technicalNarrative: {
      overview: 'With workloads operational in the cloud SDDC, automated BCDR runbooks provide sub-15 minute RPO protection, while native cloud endpoints enable analytics and AI pipelines.',
      engineeringDecisions: [
        'Site Recovery Manager (SRM) protection groups paired with cross-AZ or secondary region SDDC',
        'Quarterly non-disruptive DR drill execution in isolated virtual test network bubbles',
        'Private endpoints link VMware VMs directly to native services (BigQuery, Azure SQL, Amazon S3)',
        'vSphere Lifecycle Manager (vLCM) ensures firmware and hypervisor patch compliance without downtime'
      ],
      slaMetrics: [
        { label: 'Target RPO', value: '5 - 15 mins', context: 'Granular replication frequency' },
        { label: 'Target RTO', value: '< 30 mins', context: 'Automated multi-tier failover runbook' },
        { label: 'DR Drill Disruption', value: '0 downtime', context: 'Isolated sandbox test bubble' },
        { label: 'PrivateLink Bandwidth', value: '40 Gbps', context: 'Zero-NAT cloud PaaS throughput' }
      ],
      commandLineOrConfig: 'srm-cmdline -u admin -p srm_runbook_failover --plan "Tier1_MissionCritical_Plan" --test-bubble',
      securityBoundary: 'Zero-trust PrivateLink endpoints eliminate public IP exposure for all back-end databases.'
    }
  }
];

const PLATFORM_DETAILS: Record<TargetCloudPlatform, {
  name: string;
  badge: string;
  nodeModel: string;
  interconnect: string;
  storageSolution: string;
  nativeServices: string;
}> = {
  avs: {
    name: 'Azure VMware Solution',
    badge: 'Microsoft Azure',
    nodeModel: 'AV36 / AV64 Bare-Metal Intel Xeon',
    interconnect: 'ExpressRoute FastPath (10–100 Gbps)',
    storageSolution: 'Azure NetApp Files (ANF) NFS Datastores',
    nativeServices: 'Azure Private Link, Azure SQL, Blob Storage'
  },
  gcve: {
    name: 'Google Cloud VMware Engine',
    badge: 'Google Cloud',
    nodeModel: 've1-standard-72 / ve2 Bare-Metal',
    interconnect: 'Cloud Interconnect & PSA (100 Gbps)',
    storageSolution: 'Google Cloud NetApp Volumes (GCNV)',
    nativeServices: 'BigQuery, Vertex AI via Private Google Access'
  },
  vmc: {
    name: 'VMware Cloud on AWS',
    badge: 'Amazon Web Services',
    nodeModel: 'i3en.metal / i4i.metal Storage-Dense',
    interconnect: 'AWS Direct Connect & Connected VPC ENI (25 Gbps)',
    storageSolution: 'Amazon FSx for NetApp ONTAP (Multi-AZ)',
    nativeServices: 'Amazon S3, Aurora Serverless, KMS'
  },
  nc2: {
    name: 'Nutanix NC2 on Azure',
    badge: 'Nutanix Hybrid Cloud',
    nodeModel: 'Bare-Metal AN36 / AN64 Intel Xeon',
    interconnect: 'Azure VNet Direct Injected Flow SDN',
    storageSolution: 'Nutanix Distributed Storage Fabric (DSF RF2/RF3)',
    nativeServices: 'Azure Native Services & Nutanix Prism Central'
  }
};

export const CloudMigrationArchitectureShowcase: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<number>(3);
  const [targetPlatform, setTargetPlatform] = useState<TargetCloudPlatform>('avs');
  const [selectedLayer, setSelectedLayer] = useState<TopologyLayer>('all');
  const [inspectedComponent, setInspectedComponent] = useState<string | null>('hcx');

  const activeStage = PIPELINE_STAGES.find(s => s.id === activeStageId) || PIPELINE_STAGES[2];
  const platform = PLATFORM_DETAILS[targetPlatform];

  const handleNextStage = useCallback(() => {
    setActiveStageId(prev => (prev < 6 ? prev + 1 : 1));
  }, []);

  const handlePrevStage = useCallback(() => {
    setActiveStageId(prev => (prev > 1 ? prev - 1 : 6));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'ArrowRight') {
        handleNextStage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStage();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        setActiveStageId(parseInt(e.key, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextStage, handlePrevStage]);

  return (
    <section
      id="migration-pipeline"
      role="region"
      aria-label="2D Cloud Migration and Architecture Evolution Showcase"
      className="py-16 lg:py-24 bg-white border-b border-slate-200 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header: Clean World-Class Consultancy Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-sky-700">
              <span>SIGNATURE ARCHITECTURE EXPERIENCE</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-slate-600">6-STAGE HYBRID CLOUD PIPELINE</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-teal-700">SUB-2MS DETERMINISTIC NETWORK SLA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Enterprise Cloud Migration & Architecture Pipeline
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Real-time interactive topology mapping VMware vSphere on-premises environments through discovery, microsegmentation flow mapping, decoupled storage sizing, and zero-downtime HCX wave cutovers into hyperscaler SDDCs.
            </p>
          </div>

          {/* Quick Target Cloud Selector */}
          <div className="space-y-1.5 shrink-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Target Cloud Architecture:
            </span>
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(['avs', 'gcve', 'vmc', 'nc2'] as TargetCloudPlatform[]).map((plt) => (
                <button
                  key={plt}
                  onClick={() => setTargetPlatform(plt)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    targetPlatform === plt
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  {plt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 6-Stage Interactive Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="font-semibold text-slate-700">
              ENGINEERING STAGE {activeStage.id} OF 6: <strong className="text-slate-900">{activeStage.phase.toUpperCase()}</strong>
            </span>
            <span className="hidden sm:inline">Use &larr; &rarr; or keys 1–6 to step through pipeline</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PIPELINE_STAGES.map((stage) => {
              const isActive = stage.id === activeStageId;
              const isPassed = stage.id < activeStageId;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-sky-500/20'
                      : isPassed
                      ? 'bg-sky-50/70 text-slate-800 border-sky-200 hover:bg-sky-100/60'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-sky-300' : 'text-slate-500'}`}>
                      STAGE 0{stage.id}
                    </span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </div>
                  <div className="text-xs font-bold leading-snug line-clamp-2">
                    {stage.shortName.replace(/^\d+\.\s*/, '')}
                  </div>
                  <span className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {stage.phase}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Controls Bar: Layer Filter & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold shrink-0 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>Layer:</span>
            </span>
            {[
              { id: 'all', label: 'All Layers' },
              { id: 'compute', label: 'Compute (ESXi)' },
              { id: 'storage', label: 'Decoupled Storage' },
              { id: 'sdn', label: 'NSX & Security' },
              { id: 'migration', label: 'HCX Transit' }
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id as TopologyLayer)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedLayer === layer.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={handlePrevStage}
              aria-label="Previous migration stage"
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-700 tabular-nums px-2">
              {activeStageId} / 6
            </span>
            <button
              onClick={handleNextStage}
              aria-label="Next migration stage"
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Core Visual Stage: 2D Interactive Architecture Topology + Sticky Technical Narrative Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 Cols): 2D Vector Architecture Diagram Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6 shadow-sm relative overflow-hidden">
              {/* Topology Stage Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 gap-4">
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {activeStage.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Target: {platform.name} ({platform.badge})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold">
                    ACTIVE TOPOLOGY
                  </span>
                </div>
              </div>

              {/* 2D Interactive Vector Topology Illustration */}
              <div className="relative py-6">
                <svg
                  viewBox="0 0 760 380"
                  className="w-full h-auto drop-shadow-sm select-none"
                  aria-label="2D Cloud Migration Architecture Diagram"
                >
                  <defs>
                    {/* Linear Gradients for Clean Technical Layers */}
                    <linearGradient id="onPremGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#edf2f7" />
                    </linearGradient>
                    <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f0f9ff" />
                      <stop offset="100%" stopColor="#e0f2fe" />
                    </linearGradient>
                    <linearGradient id="transitGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                    <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
                    </pattern>
                  </defs>

                  {/* Blueprint Grid Background */}
                  <rect x="0" y="0" width="760" height="380" fill="url(#gridPattern)" rx="12" />

                  {/* 1. SOURCE ON-PREMISES DATACENTER BOUNDARY */}
                  <g opacity={selectedLayer === 'all' || selectedLayer === 'compute' ? 1 : 0.4}>
                    <rect
                      x="20"
                      y="30"
                      width="230"
                      height="320"
                      rx="10"
                      fill="url(#onPremGrad)"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    <text x="35" y="55" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                      ON-PREMISES DATACENTER
                    </text>
                    <text x="35" y="70" fill="#64748b" fontSize="9" fontFamily="monospace">
                      vSphere 7.0/8.0 Enterprise Plus
                    </text>

                    {/* vCenter Server Node */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setInspectedComponent('vcenter')}
                    >
                      <rect
                        x="35"
                        y="85"
                        width="200"
                        height="44"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'vcenter' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'vcenter' ? '2' : '1'}
                      />
                      <circle cx="52" cy="107" r="6" fill="#0284c7" />
                      <text x="66" y="103" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        vCenter Server Appliance
                      </text>
                      <text x="66" y="117" fill="#64748b" fontSize="8" fontFamily="monospace">
                        vSphere DRS & HA Enabled
                      </text>
                    </g>

                    {/* On-Prem ESXi Hypervisor Hosts */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setInspectedComponent('esxi-onprem')}
                    >
                      <rect
                        x="35"
                        y="140"
                        width="200"
                        height="58"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'esxi-onprem' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'esxi-onprem' ? '2' : '1'}
                      />
                      <rect x="45" y="150" width="8" height="38" rx="2" fill="#0f172a" />
                      <rect x="57" y="150" width="8" height="38" rx="2" fill="#0f172a" />
                      <rect x="69" y="150" width="8" height="38" rx="2" fill="#0f172a" />
                      <text x="85" y="163" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        ESXi Bare-Metal Hosts (x8)
                      </text>
                      <text x="85" y="176" fill="#475569" fontSize="8" fontFamily="monospace">
                        Dual Intel Xeon / 512GB RAM
                      </text>
                      <text x="85" y="188" fill="#16a34a" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                        N+1 Cluster Resiliency
                      </text>
                    </g>

                    {/* Local vSAN Datastore */}
                    <g
                      className="cursor-pointer"
                      opacity={selectedLayer === 'all' || selectedLayer === 'storage' ? 1 : 0.3}
                      onClick={() => setInspectedComponent('vsan')}
                    >
                      <rect
                        x="35"
                        y="210"
                        width="200"
                        height="50"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'vsan' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'vsan' ? '2' : '1'}
                      />
                      <circle cx="52" cy="235" r="7" fill="#0d9488" />
                      <text x="68" y="228" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        Local vSAN Datastore
                      </text>
                      <text x="68" y="242" fill="#64748b" fontSize="8" fontFamily="monospace">
                        NVMe All-Flash Tier / 96 TB
                      </text>
                    </g>

                    {/* HCX On-Prem Connector */}
                    <g
                      className="cursor-pointer"
                      opacity={selectedLayer === 'all' || selectedLayer === 'migration' ? 1 : 0.3}
                      onClick={() => setInspectedComponent('hcx')}
                    >
                      <rect
                        x="35"
                        y="272"
                        width="200"
                        height="64"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'hcx' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'hcx' ? '2' : '1'}
                      />
                      <rect x="46" y="286" width="14" height="14" rx="3" fill="#0284c7" />
                      <text x="68" y="294" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        HCX Connector Appliance
                      </text>
                      <text x="68" y="308" fill="#64748b" fontSize="8" fontFamily="monospace">
                        HCX-IX & WAN-OPT Interconnect
                      </text>
                      <text x="68" y="322" fill="#0284c7" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                        L2 Network Extension (L2C)
                      </text>
                    </g>
                  </g>

                  {/* 2. HIGH-SPEED TRANSIT LINK (CENTRAL CANAL) */}
                  <g opacity={selectedLayer === 'all' || selectedLayer === 'migration' ? 1 : 0.3}>
                    {/* Tunnel Highway Box */}
                    <rect
                      x="265"
                      y="90"
                      width="200"
                      height="200"
                      rx="10"
                      fill="#f8fafc"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <text x="280" y="112" fill="#0284c7" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                      DEDICATED TRANSIT FABRIC
                    </text>
                    <text x="280" y="126" fill="#475569" fontSize="8" fontFamily="monospace">
                      {platform.interconnect}
                    </text>

                    {/* Animated Circuit Streams */}
                    <path
                      d="M 235 304 L 280 304 L 280 180 L 485 180"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                      className="animate-traffic-flow"
                    />

                    {/* MON Gateway Control Line */}
                    <path
                      d="M 235 110 L 290 110 L 290 220 L 485 220"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-traffic-flow-fast"
                    />

                    {/* Bandwidth & Encrypted Tunnel Node */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setInspectedComponent('transit')}
                    >
                      <rect
                        x="280"
                        y="140"
                        width="170"
                        height="64"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'transit' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'transit' ? '2' : '1'}
                      />
                      <rect x="290" y="152" width="12" height="12" rx="2" fill="#0284c7" />
                      <text x="310" y="161" fill="#0f172a" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                        Suite-B IPsec Encrypted L2
                      </text>
                      <text x="310" y="174" fill="#64748b" fontSize="8" fontFamily="monospace">
                        WAN Compression (4:1)
                      </text>
                      <text x="310" y="188" fill="#16a34a" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                        Latency: &lt; 2.0 ms RTT
                      </text>
                    </g>

                    {/* Workload In-Flight Marker (Animated Wave Progression) */}
                    <g transform={`translate(${activeStageId >= 4 ? 350 : 295}, 210)`}>
                      <rect x="0" y="0" width="75" height="26" rx="4" fill="#0f172a" />
                      <text x="8" y="17" fill="#ffffff" fontSize="8" fontWeight="700" fontFamily="monospace">
                        {activeStageId >= 5 ? 'CUTOVER OK' : 'SYNCING VM'}
                      </text>
                    </g>

                    {/* MON Dynamic Gateway Indicator */}
                    <g
                      className="cursor-pointer"
                      onClick={() => setInspectedComponent('mon')}
                    >
                      <rect
                        x="280"
                        y="245"
                        width="170"
                        height="36"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'mon' ? '#0d9488' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'mon' ? '2' : '1'}
                      />
                      <text x="292" y="260" fill="#0f172a" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                        Mobility Optimized Net (MON)
                      </text>
                      <text x="292" y="272" fill="#0d9488" fontSize="8" fontFamily="monospace">
                        Zero Asymmetric Tromboning
                      </text>
                    </g>
                  </g>

                  {/* 3. TARGET CLOUD SDDC ZONE */}
                  <g opacity={selectedLayer === 'all' || selectedLayer === 'compute' || selectedLayer === 'storage' ? 1 : 0.4}>
                    <rect
                      x="485"
                      y="30"
                      width="255"
                      height="320"
                      rx="10"
                      fill="url(#cloudGrad)"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                    />
                    <text x="500" y="55" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                      TARGET CLOUD SDDC
                    </text>
                    <text x="500" y="70" fill="#0284c7" fontSize="9" fontWeight="600" fontFamily="monospace">
                      {platform.name}
                    </text>

                    {/* NSX Tier-0 Gateway (Active-Active ECMP) */}
                    <g
                      className="cursor-pointer"
                      opacity={selectedLayer === 'all' || selectedLayer === 'sdn' ? 1 : 0.3}
                      onClick={() => setInspectedComponent('nsx-t0')}
                    >
                      <rect
                        x="500"
                        y="85"
                        width="225"
                        height="52"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'nsx-t0' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'nsx-t0' ? '2' : '1'}
                      />
                      <rect x="512" y="98" width="12" height="12" rx="2" fill="#0284c7" />
                      <text x="532" y="104" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        NSX-T Tier-0 Gateway (ECMP)
                      </text>
                      <text x="532" y="117" fill="#64748b" fontSize="8" fontFamily="monospace">
                        BGP Peering to Cloud Transit Route
                      </text>
                      <text x="532" y="129" fill="#16a34a" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                        Active-Active Dual Edge Nodes
                      </text>
                    </g>

                    {/* NSX Tier-1 Distributed Workload Segments & DFW */}
                    <g
                      className="cursor-pointer"
                      opacity={selectedLayer === 'all' || selectedLayer === 'sdn' ? 1 : 0.3}
                      onClick={() => setInspectedComponent('dfw')}
                    >
                      <rect
                        x="500"
                        y="145"
                        width="225"
                        height="62"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'dfw' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'dfw' ? '2' : '1'}
                      />
                      <rect x="512" y="157" width="12" height="12" rx="2" fill="#0d9488" />
                      <text x="532" y="163" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        Tier-1 & DFW Microsegmentation
                      </text>
                      <text x="532" y="176" fill="#64748b" fontSize="8" fontFamily="monospace">
                        Web (vlan10) · App (vlan20) · DB (vlan30)
                      </text>
                      <text x="532" y="190" fill="#0d9488" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                        L4-L7 Zero-Trust App-ID Filtering
                      </text>
                    </g>

                    {/* Cloud Bare-Metal Nodes */}
                    <g
                      className="cursor-pointer"
                      opacity={selectedLayer === 'all' || selectedLayer === 'compute' ? 1 : 0.3}
                      onClick={() => setInspectedComponent('cloud-nodes')}
                    >
                      <rect
                        x="500"
                        y="215"
                        width="225"
                        height="55"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'cloud-nodes' ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'cloud-nodes' ? '2' : '1'}
                      />
                      <rect x="512" y="225" width="8" height="35" rx="2" fill="#0284c7" />
                      <rect x="524" y="225" width="8" height="35" rx="2" fill="#0284c7" />
                      <rect x="536" y="225" width="8" height="35" rx="2" fill="#0284c7" />
                      <text x="552" y="235" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        Cloud ESXi Hosts (N+1)
                      </text>
                      <text x="552" y="247" fill="#64748b" fontSize="8" fontFamily="monospace">
                        {platform.nodeModel}
                      </text>
                      <text x="552" y="259" fill="#16a34a" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                        Multi-AZ Stretched Cluster SLA
                      </text>
                    </g>

                    {/* Decoupled External Storage Fabric */}
                    <g
                      className="cursor-pointer"
                      opacity={selectedLayer === 'all' || selectedLayer === 'storage' ? 1 : 0.3}
                      onClick={() => setInspectedComponent('decoupled-storage')}
                    >
                      <rect
                        x="500"
                        y="278"
                        width="225"
                        height="62"
                        rx="6"
                        fill="#ffffff"
                        stroke={inspectedComponent === 'decoupled-storage' ? '#0d9488' : '#cbd5e1'}
                        strokeWidth={inspectedComponent === 'decoupled-storage' ? '2' : '1'}
                      />
                      <circle cx="518" cy="309" r="8" fill="#0d9488" />
                      <text x="534" y="296" fill="#0f172a" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        Decoupled External NFS Pool
                      </text>
                      <text x="534" y="309" fill="#64748b" fontSize="8" fontFamily="monospace">
                        {platform.storageSolution}
                      </text>
                      <text x="534" y="323" fill="#0d9488" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                        Decouples Storage from Host Purchase
                      </text>
                    </g>
                  </g>
                </svg>
              </div>

              {/* Component Quick Inspector Hint */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-600" />
                  <span>Click any diagram node to inspect technical specifications and routing rules.</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">SVG VECTOR RENDER</span>
              </div>
            </div>

            {/* Selected Component Technical Card */}
            {inspectedComponent && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                      Component Inspector: {inspectedComponent.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => setInspectedComponent(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed">
                  {inspectedComponent === 'hcx' && (
                    <p>
                      <strong>VMware HCX Service Mesh:</strong> Encapsulates L2 networks into an encrypted IPsec/WAN-optimized overlay across the private interconnect. Allows live vMotion across subnets without updating IP addresses or gateway configurations.
                    </p>
                  )}
                  {inspectedComponent === 'decoupled-storage' && (
                    <p>
                      <strong>Decoupled External NFS Storage:</strong> Mounts enterprise file services ({platform.storageSolution}) directly to ESXi hosts. Prevents cluster compute overprovisioning when database workloads require terabytes of storage without additional vCPUs.
                    </p>
                  )}
                  {inspectedComponent === 'mon' && (
                    <p>
                      <strong>Mobility Optimized Networking (MON):</strong> Dynamically switches default gateway route ownership to the local NSX Tier-1 router for migrated VMs. Traffic heading to cloud native services no longer hairpins across the WAN back to on-premise switches.
                    </p>
                  )}
                  {inspectedComponent === 'dfw' && (
                    <p>
                      <strong>NSX Distributed Firewall (DFW):</strong> Stateful microsegmentation enforced at the hypervisor kernel vNIC level. Secures East-West traffic between tiers even when virtual machines share the same broadcast VLAN.
                    </p>
                  )}
                  {inspectedComponent === 'nsx-t0' && (
                    <p>
                      <strong>NSX Tier-0 Gateway (ECMP):</strong> Active-Active Edge clusters handling dynamic BGP routing, route reflection, and redundant uplinks to hyperscaler transit gateways with sub-second route convergence.
                    </p>
                  )}
                  {inspectedComponent === 'transit' && (
                    <p>
                      <strong>High-Speed Transit Interconnect:</strong> Dedicated, carrier-grade private fiber connection ({platform.interconnect}) providing guaranteed sub-2.0ms round-trip latency without exposure to the public Internet.
                    </p>
                  )}
                  {inspectedComponent === 'cloud-nodes' && (
                    <p>
                      <strong>Hyperscaler Bare-Metal Hosts:</strong> Dedicated single-tenant servers running VMware ESXi on {platform.nodeModel}. Managed directly by the cloud provider for hardware maintenance, microcode updates, and failover automation.
                    </p>
                  )}
                  {inspectedComponent === 'vcenter' && (
                    <p>
                      <strong>vCenter Management Plane:</strong> Centralized hypervisor management with vSphere DRS, HA, and vLCM integration, linked to Cloud vCenter via Hybrid Linked Mode (HLM) for single-pane-of-glass operations.
                    </p>
                  )}
                  {inspectedComponent === 'esxi-onprem' && (
                    <p>
                      <strong>Source On-Premise Cluster:</strong> Legacy enterprise VMware environment with existing workloads, vSAN datastores, and local VLANs ready for systematic wave extraction.
                    </p>
                  )}
                  {inspectedComponent === 'vsan' && (
                    <p>
                      <strong>Local vSAN Datastore:</strong> Local software-defined storage on on-premise hosts. Migration pipelines replicate delta disk blocks continuously to target storage fabrics.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 Cols): Sticky Technical Narrative & Engineering Decision Support */}
          <div className="lg:col-span-5 space-y-6">
            {/* Stage Title and Summary */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                  STAGE 0{activeStage.id} SPECIFICATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {platform.badge}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {activeStage.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeStage.technicalNarrative.overview}
                </p>
              </div>

              {/* Quantified SLA Targets for this Stage */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {activeStage.technicalNarrative.slaMetrics.map((sla, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      {sla.label}
                    </span>
                    <span className="text-sm font-bold text-sky-400 font-mono tabular-nums block">
                      {sla.value}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate" title={sla.context}>
                      {sla.context}
                    </span>
                  </div>
                ))}
              </div>

              {/* Command Line / API Configuration Snip */}
              <div className="pt-2">
                <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                  <span>Engine Automation Directive:</span>
                  <span className="text-emerald-400">Verified Syntax</span>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-tight">
                  <code>{activeStage.technicalNarrative.commandLineOrConfig}</code>
                </pre>
              </div>
            </div>

            {/* Engineering Decisions & Constraints Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Architecture Decisions & Constraints</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                {activeStage.technicalNarrative.engineeringDecisions.map((decision, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>

              {/* Security Boundary Definition */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-semibold text-slate-900 block font-mono text-[11px]">
                  Trust & Security Boundary:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {activeStage.technicalNarrative.securityBoundary}
                </p>
              </div>

              {/* Stage Navigation CTAs */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevStage}
                  disabled={activeStageId === 1}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    activeStageId === 1
                      ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <Link
                  to="/tools/design-generator"
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Model in Blueprint</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={handleNextStage}
                  disabled={activeStageId === 6}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    activeStageId === 6
                      ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-600'
                  }`}
                >
                  <span>Next Stage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
