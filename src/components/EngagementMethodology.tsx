import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  HardDrive,
  Cpu,
  Repeat,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Workflow
} from 'lucide-react';

interface MethodologyStage {
  step: string;
  title: string;
  subtitle: string;
  objective: string;
  deliverables: string[];
  toolLink?: string;
  toolLabel?: string;
  icon: React.ReactNode;
  accentColor: string;
}

const STAGES: MethodologyStage[] = [
  {
    step: '01',
    title: 'Discovery & Flow Analytics',
    subtitle: 'Automated East-West Traffic & Dependency Mapping',
    objective: 'Eliminates migration blind spots by observing network sockets, port bindings, and multi-tier database couplings using Aria Operations for Networks.',
    deliverables: [
      'Comprehensive IPFIX & NetFlow socket discovery across all VMs',
      'Cluster identification for tightly coupled multi-tier applications',
      'Automated translation of observed traffic into recommended NSX DFW rules'
    ],
    toolLink: '/tools/aria-networks',
    toolLabel: 'Explore Flow Analyzer',
    icon: <Activity className="w-5 h-5 text-sky-700 dark:text-cyan-400" />,
    accentColor: 'border-sky-300 dark:border-cyan-500/40 text-sky-700 dark:text-cyan-400'
  },
  {
    step: '02',
    title: 'Target Sizing & Storage Decoupling',
    subtitle: 'Host Optimization via Decoupled External NFS Pools',
    objective: 'Sizes exact bare-metal node counts while decoupling capacity-heavy storage using Azure NetApp Files (ANF) or Amazon FSx for NetApp ONTAP.',
    deliverables: [
      'Automated RVTools Excel spreadsheet parsing and vCPU:pCore ratio modeling',
      'Independent external NFSv3 datastore calculation preventing host over-provisioning',
      'Validated multi-cloud Bill of Materials (BOM) with 3-year TCO projections'
    ],
    toolLink: '/tools/sizing',
    toolLabel: 'Run Node Sizer',
    icon: <HardDrive className="w-5 h-5 text-teal-700 dark:text-emerald-400" />,
    accentColor: 'border-teal-300 dark:border-emerald-500/40 text-teal-700 dark:text-emerald-400'
  },
  {
    step: '03',
    title: 'Live Wave Cutover Execution',
    subtitle: 'Zero-Downtime HCX Replication-Assisted vMotion (RAV)',
    objective: 'Executes synchronized migration waves during scheduled maintenance windows with sub-second memory handoff and automated rollback safety nets.',
    deliverables: [
      'Background seed replication capturing multi-terabyte VMDKs while production runs',
      'Continuous delta synchronization with WAN-optimized encryption',
      'Sub-second vMotion stun switchover with zero dropped transactional TCP sessions'
    ],
    toolLink: '/roadmap',
    toolLabel: 'View Runbook Standards',
    icon: <Cpu className="w-5 h-5 text-amber-700 dark:text-amber-400" />,
    accentColor: 'border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
  },
  {
    step: '04',
    title: 'Day-2 DR & Zero-Trust Compliance',
    subtitle: 'Automated Failover Orchestration & Isolated Test Bubbles',
    objective: 'Guarantees business continuity through policy-driven disaster recovery testing in air-gapped test networks without interrupting production replication.',
    deliverables: [
      'Site Recovery Manager (SRM) paired with vSphere Replication for 5-minute RPO',
      'Isolated Test Bubble sandbox networks verifying runbooks with zero IP collision',
      'Automated regulatory audit compliance reports generated post-failover test'
    ],
    toolLink: '/tools/dr-planner',
    toolLabel: 'Open DR Planner',
    icon: <Repeat className="w-5 h-5 text-rose-700 dark:text-rose-400" />,
    accentColor: 'border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400'
  }
];

export const EngagementMethodology: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-sky-700 dark:text-cyan-400">
            <span>ENGAGEMENT METHODOLOGY</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400">PROVEN 4-STAGE FRAMEWORK</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-teal-700 dark:text-emerald-400 font-semibold">ZERO-DOWNTIME GOVERNANCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How High-Consequence Cloud Evacuations Are Delivered
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            A battle-tested delivery framework designed to de-risk complex VMware migrations into Azure AVS, AWS VMC, Google Cloud GCVE, and Nutanix NC2.
          </p>
        </div>

        {/* 4-Stage Horizontal/Vertical Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((stage) => (
            <div
              key={stage.step}
              className="relative rounded-2xl bg-slate-50/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition group shadow-sm hover:shadow-md"
            >
              {/* Card Top: Step Index & Icon */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
                  <span className="text-2xl font-black font-mono text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-cyan-400 transition-colors">
                    {stage.step}
                  </span>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                    {stage.icon}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {stage.title}
                  </h3>
                  <div className="text-xs font-semibold text-sky-700 dark:text-cyan-400">
                    {stage.subtitle}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {stage.objective}
                </p>

                {/* Deliverables List */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">
                    Verified Outcomes
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {stage.deliverables.map((deliv, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Tool Link */}
              {stage.toolLink && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    to={stage.toolLink}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-cyan-300 hover:text-slate-900 dark:hover:text-white transition group-hover:translate-x-0.5"
                  >
                    <span>{stage.toolLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
