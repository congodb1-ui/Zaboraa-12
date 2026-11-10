import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { InteractiveHotspotImage } from './InteractiveHotspotImage';
import { MigrationTrafficSimulator } from './MigrationTrafficSimulator';
import { DIAGRAM_HOTSPOTS_COLLECTION } from '../data/diagramHotspotsData';
import {
  Server,
  Cloud,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  Calendar,
  Sparkles,
  Terminal,
  Network,
  Zap,
  Clock,
  Compass,
  Database,
  Sliders,
  FileCheck2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

type HyperscalerKey = 'azure' | 'aws' | 'gcp';

interface RoadmapPhase {
  id: number;
  phaseCode: string;
  title: string;
  subtitle: string;
  duration: string;
  focus: string;
  objectives: string[];
  deliverables: string[];
  keyTools: string[];
  cliRunbook: {
    command: string;
    description: string;
  };
  hyperscalerSpecifics: {
    azure: string;
    aws: string;
    gcp: string;
  };
}

export const MigrationStrategyRoadmap: React.FC = () => {
  const { setIsBriefingModalOpen } = useCustomization();
  const [activeHyperscaler, setActiveHyperscaler] = useState<HyperscalerKey>('azure');
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(2); // Default to Phase 3 (Migration Mesh)
  const [activeTab, setActiveTab] = useState<'architecture' | 'trafficSimulator' | 'executionPlan'>('architecture');

  const hyperscalers: {
    id: HyperscalerKey;
    label: string;
    badge: string;
    heroImage: string;
    designId: string;
    accent: string;
    circuit: string;
    storage: string;
    sddcModel: string;
  }[] = [
    {
      id: 'azure',
      label: 'Azure VMware Solution (AVS)',
      badge: 'Azure FastPath',
      heroImage: '/assets/images/hcx_architecture_showcase_1791544913309.webp',
      designId: 'hcx-design-1',
      accent: 'cyan',
      circuit: 'ExpressRoute FastPath (Ultra / ErGw3AZ)',
      storage: 'Azure NetApp Files (ANF) NFS Datastores',
      sddcModel: 'AV36 / AV52 / AV64 Dedicated Bare-Metal Nodes'
    },
    {
      id: 'aws',
      label: 'VMware Cloud on AWS (VMC)',
      badge: 'Connected VPC ENI',
      heroImage: '/assets/images/vmc_aws_migration_dr_showcase_1791541789539.webp',
      designId: 'vmc-design-1',
      accent: 'amber',
      circuit: 'AWS Direct Connect (DX) + Transit Gateway (TGW)',
      storage: 'Amazon FSx for NetApp ONTAP Datastores',
      sddcModel: 'i3en.metal / i4i.metal Dedicated Bare-Metal Clusters'
    },
    {
      id: 'gcp',
      label: 'Google Cloud VMware Engine (GCVE)',
      badge: 'PSA Zero-NAT Peering',
      heroImage: '/assets/images/gcve_architecture_showcase_1791541780539.webp',
      designId: 'gcve-design-1',
      accent: 'blue',
      circuit: 'Partner / Dedicated Cloud Interconnect',
      storage: 'Google Cloud NetApp Volumes (GCNV)',
      sddcModel: 've1-standard-72 / ve2-standard-128 Node Pools'
    }
  ];

  const currentHyperscaler = hyperscalers.find(h => h.id === activeHyperscaler) || hyperscalers[0];

  const roadmapPhases: RoadmapPhase[] = [
    {
      id: 1,
      phaseCode: 'PHASE 01',
      title: 'Discovery, Assessment & Application Profiling',
      subtitle: 'Dependency analysis, bandwidth sizing, and MTU boundary discovery',
      duration: 'Weeks 1 - 2',
      focus: 'Assessment & TCO',
      objectives: [
        'Profile on-premises vSphere inventory using RVTools and Aria Operations for Networks',
        'Map active TCP/UDP communication flows between database, application, and web tiers',
        'Validate MTU path support and Round Trip Time (RTT) latency constraints across sites',
        'Group workloads into migration waves based on tight latency couplings and shared subnets'
      ],
      deliverables: [
        'Wave Migration Schedule & Readiness Scorecard',
        'Underlay Bandwidth Sizing Model (TB / Day)',
        'Storage Decoupling vs Bare-Metal Node Sizing Matrix'
      ],
      keyTools: ['Aria Operations for Networks', 'RVTools', 'vCenter CBT Profiler'],
      cliRunbook: {
        command: 'rvtools -s vcenter.corp.local -u administrator@vsphere.local -p ***** -c ExportAll2csv -d /reports',
        description: 'Automate comprehensive compute, disk allocation, and vNIC mapping extraction'
      },
      hyperscalerSpecifics: {
        azure: 'Size AVS node count using Azure Migrate AVS assessment module; calculate Azure NetApp Files tier savings.',
        aws: 'Execute VMC Sizer tool with active IOPS and RAM headroom metrics; evaluate cross-account ENI placement.',
        gcp: 'Run GCVE TCO Calculator; verify Google Cloud Region availability and Cloud Interconnect peering SLAs.'
      }
    },
    {
      id: 2,
      phaseCode: 'PHASE 02',
      title: 'Underlay Connectivity & Network Foundation',
      subtitle: 'Provision carrier circuits, BGP routing sessions, and Hub transit topology',
      duration: 'Weeks 3 - 4',
      focus: 'Network Plumbing',
      objectives: [
        'Establish dedicated carrier circuits with dual cross-connect redundant BGP sessions',
        'Configure Jumbo Frames (MTU 9000/8900) across physical switches and edge routers',
        'Deploy centralized transit hub (Virtual WAN / Transit Gateway / VPC Peering)',
        'Establish DNS forwarders and Active Directory domain controller sync into the cloud'
      ],
      deliverables: [
        'Deterministic BGP Routing Table with Dual Peering Redundancy',
        'Sub-Millisecond Hub-to-SDDC Interconnect Verified',
        'IP Address Management (IPAM) allocation without CIDR overlaps'
      ],
      keyTools: ['BGP 4-Byte ASN', 'ExpressRoute FastPath', 'AWS TGW', 'Cloud Interconnect'],
      cliRunbook: {
        command: 'ping -s 8972 -M do 10.200.1.1',
        description: 'Confirm end-to-end Jumbo Frame MTU 9000 support across hybrid circuit without fragmentation'
      },
      hyperscalerSpecifics: {
        azure: 'Deploy ExpressRoute with FastPath enabled on GatewaySubnet to bypass Virtual Network Gateway CPU queue.',
        aws: 'Attach VMC SDDC to AWS Transit Gateway via Transit VIF; link Connected VPC via cross-account ENI.',
        gcp: 'Configure Private Services Access (PSA) and enable custom route import/export on Cloud Router.'
      }
    },
    {
      id: 3,
      phaseCode: 'PHASE 03',
      title: 'Migration Mesh & HCX Appliance Deployment',
      subtitle: 'Deploy HCX Cloud/Connector, establish site pairing, and initialize Service Mesh',
      duration: 'Weeks 5 - 6',
      focus: 'HCX Service Mesh',
      objectives: [
        'Deploy HCX Cloud Manager in target SDDC and HCX Connector in on-premises vSphere',
        'Establish mutual TLS site pairing over port 443 with SSO authentication',
        'Define Compute Profiles (Clusters, DVS, Storage) and Network Profiles (Uplink, vMotion, Mgmt)',
        'Deploy Service Mesh appliance fleet: Interconnect (IX), Network Extension (NE), WAN Opt (WO)'
      ],
      deliverables: [
        'Active HCX Service Mesh with UP status on IX and NE tunnels',
        'Encrypted IPsec UDP 4500 transport verified across underlay',
        'Disaster Recovery and Bulk Migration replication engine online'
      ],
      keyTools: ['VMware HCX 4.9+', 'HCX Interconnect (IX)', 'Network Extension (NE)'],
      cliRunbook: {
        command: 'curl -kv https://<hcx-cloud-ip>:443/hybridity/api/admin/status',
        description: 'Verify HCX mutual TLS site pairing endpoint and handshake integrity'
      },
      hyperscalerSpecifics: {
        azure: 'HCX Cloud Manager is pre-provisioned automatically by Azure; deploy HCX Connector on-premises.',
        aws: 'Deploy HCX Enterprise via VMC Console Add-ons; map Compute Profile to compute-cluster.',
        gcp: 'Initialize HCX from GCVE Portal; reserve IP pool in GCVE management subnets for IX/NE appliances.'
      }
    },
    {
      id: 4,
      phaseCode: 'PHASE 04',
      title: 'Live L2 Network Extension & Default Gateway Strategy',
      subtitle: 'Stretch production VLANs into NSX overlays and activate MON anti-hairpin routing',
      duration: 'Weeks 7 - 8',
      focus: 'L2 Stretch & MON',
      objectives: [
        'Extend on-premises VLAN subnets seamlessly to Cloud NSX-T overlay segments via HCX NE',
        'Verify zero IP re-addressing or DNS modification required for migrated VMs',
        'Enable Mobility Optimized Networking (MON) to prevent traffic tromboning/hairpinning',
        'Inject /32 host routes into Cloud NSX Tier-1 router for local cloud breakout'
      ],
      deliverables: [
        'Stretched Layer 2 Broadcast Domains with Sub-Millisecond Transit',
        'MON Local Egress Policy verified for cloud-native PaaS services',
        'Zero IP address alteration for legacy transactional databases'
      ],
      keyTools: ['HCX Network Extension (NE)', 'Mobility Optimized Networking (MON)', 'NSX Tier-1 Router'],
      cliRunbook: {
        command: 'get logical-router <t1-id> forwarding | grep MON',
        description: 'Inspect active /32 host routes injected by MON in cloud NSX Edge'
      },
      hyperscalerSpecifics: {
        azure: 'Route local AVS internet breakout through Azure Firewall via Default Route 0.0.0.0/0 injection.',
        aws: 'Route local VMC traffic directly to Connected VPC ENI for Amazon S3 and RDS without hairpins.',
        gcp: 'Route traffic through Google Cloud NAT or Cloud Router peering directly to BigQuery and Vertex AI.'
      }
    },
    {
      id: 5,
      phaseCode: 'PHASE 05',
      title: 'Workload Migration Waves & Atomic Switchover',
      subtitle: 'Execute scheduled Bulk and Replication-Assisted vMotion (RAV) migration batches',
      duration: 'Weeks 9 - 14',
      focus: 'Execution Waves',
      objectives: [
        'Pre-seed bulk virtual disks asynchronously in background without impacting production IOPS',
        'Execute final sync and cutover during scheduled maintenance windows with zero data loss',
        'Leverage Replication-Assisted vMotion (RAV) for transactional Oracle/SQL databases',
        'Perform automated vSphere guest customization and verification checks post-cutover'
      ],
      deliverables: [
        'Hundreds of virtual machines migrated per maintenance wave',
        'Zero downtime transactional database live cutovers',
        'Complete rollback safety with on-premises snapshot retention'
      ],
      keyTools: ['HCX Bulk Migration', 'HCX RAV', 'PowerCLI Orchestrator'],
      cliRunbook: {
        command: 'Start-HCXMigration -ScheduleTime "2026-10-10 22:00:00" -SourceVM $vm -TargetComputePool $pool',
        description: 'Schedule automated maintenance cutover wave using VMware HCX PowerShell cmdlets'
      },
      hyperscalerSpecifics: {
        azure: 'Leverage ExpressRoute FastPath for up to 10 Gbps disk replication throughput per wave.',
        aws: 'Distribute replication across multiple IX appliances to saturate 25 Gbps Direct Connect links.',
        gcp: 'Schedule migration batches during off-peak windows with dedicated Cloud Interconnect VLAN attachments.'
      }
    },
    {
      id: 6,
      phaseCode: 'PHASE 06',
      title: 'Post-Migration Optimization & Modernization',
      subtitle: 'Unextend L2 VLANs, cut over default gateways to NSX, and attach cloud storage',
      duration: 'Weeks 15 - 18',
      focus: 'Day-2 Operations',
      objectives: [
        'Unextend legacy Layer 2 VLANs once all workloads on the subnet have migrated',
        'Cut over default gateway IP to NSX Tier-1 Gateway for pure cloud routing',
        'Decommission on-premises source appliances and tear down temporary HCX Service Mesh',
        'Attach decoupled external storage (ANF / FSx / GCNV) and integrate with cloud AI/analytics'
      ],
      deliverables: [
        'Clean native NSX overlay routing with zero reliance on on-premises infrastructure',
        'Decoupled storage pools scaling independently from physical node licensing',
        'Private AI/ML pipeline integration (Azure OpenAI, AWS Bedrock, GCP Vertex AI)'
      ],
      keyTools: ['NSX Tier-1 Gateway', 'External NFS Datastores', 'Private Endpoints'],
      cliRunbook: {
        command: 'Unextend-HCXNetwork -NetworkId $netId -ForceTransferGateway',
        description: 'Safely unextend Layer 2 bridge and establish default gateway in NSX'
      },
      hyperscalerSpecifics: {
        azure: 'Mount Azure NetApp Files datastores directly to AVS ESXi; link workloads to Azure OpenAI private endpoints.',
        aws: 'Attach Amazon FSx for NetApp ONTAP external datastores; integrate VMC workloads with Amazon Bedrock & Aurora.',
        gcp: 'Mount Google Cloud NetApp Volumes (GCNV); stream application telemetry into BigQuery and Vertex AI.'
      }
    }
  ];

  const currentPhase = roadmapPhases[activePhaseIndex];

  return (
    <section id="migration-roadmap" className="py-20 bg-slate-950 border-t border-slate-800/80 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>HYPERSCALER CLOUD ADOPTION FRAMEWORK</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Migration Strategy Roadmap
            </h2>
            <p className="text-sm text-slate-300">
              Interactive multi-step enterprise journey from On-Premises to Hyperscaler Cloud. Explore architectural network connectivity, live traffic animations, and click any component to inspect its role, ports, and CLI diagnostics.
            </p>
          </div>

          {/* Hyperscaler Selector Tabs (Azure, AWS, GCP) */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl self-start lg:self-auto">
            <span className="text-[11px] font-mono text-slate-400 uppercase px-2 hidden sm:inline">
              Target Cloud:
            </span>
            {hyperscalers.map((hyp) => {
              const isSelected = activeHyperscaler === hyp.id;
              return (
                <button
                  key={hyp.id}
                  onClick={() => setActiveHyperscaler(hyp.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? hyp.id === 'azure'
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : hyp.id === 'aws'
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {hyp.id === 'azure' && <Server className="w-3.5 h-3.5" />}
                  {hyp.id === 'aws' && <Layers className="w-3.5 h-3.5" />}
                  {hyp.id === 'gcp' && <Cloud className="w-3.5 h-3.5" />}
                  <span>{hyp.id === 'azure' ? 'Azure AVS' : hyp.id === 'aws' ? 'AWS VMC' : 'Google GCVE'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Hyperscaler Strategic Profile Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${
              activeHyperscaler === 'azure' ? 'text-cyan-400' : activeHyperscaler === 'aws' ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {activeHyperscaler === 'azure' ? <Server className="w-5 h-5" /> : activeHyperscaler === 'aws' ? <Layers className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentHyperscaler.label}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentHyperscaler.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Underlay: <span className="text-slate-200 font-semibold">{currentHyperscaler.circuit}</span> · Storage: <span className="text-slate-200 font-semibold">{currentHyperscaler.storage}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsBriefingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Architecture Review</span>
            </button>
          </div>
        </div>

        {/* 6-Stage Visual Journey Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Roadmap Timeline (Click Phase to Inspect):</span>
            </span>
            <span className="text-cyan-400 font-semibold">Phase {activePhaseIndex + 1} of 6 Selected</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {roadmapPhases.map((phase, idx) => {
              const isSelected = activePhaseIndex === idx;
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {phase.phaseCode}
                      </span>
                      <span className="text-slate-400">{phase.duration}</span>
                    </div>

                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {phase.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono truncate max-w-[100px]">{phase.focus}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode Switcher: Architecture Hotspot Image vs Real-Time Traffic Simulator vs Execution Plan */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Architecture Image & Hotspots</span>
            </button>

            <button
              onClick={() => setActiveTab('trafficSimulator')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'trafficSimulator'
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Traffic Flow Animation</span>
            </button>

            <button
              onClick={() => setActiveTab('executionPlan')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'executionPlan'
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Phase Runbook & CLI</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE HOTSPOT ARCHITECTURE IMAGE */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Interactive Hybrid Cloud Blueprint: {currentHyperscaler.label}</span>
                </h3>
                <span className="text-[11px] font-mono text-cyan-400">Click any hotspot to inspect component details</span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect HCX Interconnect (IX), Network Extension (NE), WAN Optimization, MON routers, Bare-Metal nodes, and underlay carrier interconnects directly on the blueprint.
              </p>
            </div>

            <InteractiveHotspotImage
              imageUrl={currentHyperscaler.heroImage}
              designId={currentHyperscaler.designId}
              title={`${currentHyperscaler.label} - Hybrid Migration Architecture`}
              subtitle={currentHyperscaler.circuit}
            />
          </div>
        )}

        {/* TAB 2: LIVE TRAFFIC FLOW SIMULATOR */}
        {activeTab === 'trafficSimulator' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
              Watch real-time animated packets traversing between on-premises ESXi hosts, HCX IPsec encryption engines, underlay carrier links, and cloud NSX gateways. Toggle between Bulk Replication, Live vMotion, and L2 Extended Network MON routing modes.
            </div>

            <MigrationTrafficSimulator hyperscaler={activeHyperscaler} />
          </div>
        )}

        {/* TAB 3: PHASE RUNBOOK & EXECUTION DETAILS */}
        {activeTab === 'executionPlan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Objectives & Deliverables (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {currentPhase.phaseCode} · {currentPhase.duration}
                    </span>
                    <h3 className="text-lg font-bold text-white">{currentPhase.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                    {currentPhase.focus}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentPhase.subtitle}
                </p>

                {/* Key Objectives */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Architectural Objectives</span>
                  </h4>
                  <ul className="space-y-2">
                    {currentPhase.objectives.map((obj, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verified Deliverables & Audit Criteria</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentPhase.deliverables.map((deliv, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-300">
                        {deliv}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: CLI Runbook Snippet & Hyperscaler Focus (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Hyperscaler Specific Guidance */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="text-xs font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentHyperscaler.label} Implementation Focus</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentPhase.hyperscalerSpecifics[activeHyperscaler]}
                </p>
              </div>

              {/* Automation / CLI Snippet */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Production CLI Command</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">PowerShell / CLI</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 select-all overflow-x-auto">
                  <code>{currentPhase.cliRunbook.command}</code>
                </div>

                <p className="text-[11px] text-slate-400">
                  {currentPhase.cliRunbook.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
