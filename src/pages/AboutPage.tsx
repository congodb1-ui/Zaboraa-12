import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import {
  Calendar,
  ShieldCheck,
  Award,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  Sliders,
  ExternalLink,
  ArrowRight,
  Wrench,
  ArrowUpRight
} from 'lucide-react';
import { resolveMediaUrl } from '../data/mediaAssets';

export const AboutPage: React.FC = () => {
  const { siteConfig, setIsBriefingModalOpen, isAdmin, setIsPhotoEditorOpen } = useCustomization();
  const founder = siteConfig.founder;

  const resolvedPortrait = resolveMediaUrl(
    founder.portraitImage,
    '/assets/images/Wasim-Pic-02.png'
  );

  const phoneDisplay = '+91 7497624807';
  const locationDisplay = 'Pune & Global Advisory';

  const VALIDATED_CERTIFICATIONS = [
    {
      name: 'Nutanix Certified Professional - Cloud Integration - Azure (NCP-CI-Azure) 6.10',
      issuer: 'Nutanix',
      date: 'May 2026'
    },
    {
      name: 'VMware Certified Advanced Professional - Data Center Virtualization Design 2023 (VCAP-DCV Design 2023)',
      issuer: 'VMware by Broadcom',
      date: 'Oct 2023'
    },
    {
      name: 'VMware Certified Professional - Network Virtualization 2023 (VCP-NV 2023)',
      issuer: 'VMware by Broadcom',
      date: 'Feb 2023'
    },
    {
      name: 'VMware Certified Professional - Data Center Virtualization 2023 (VCP-DCV 2023)',
      issuer: 'VMware by Broadcom',
      date: 'Jan 2023'
    },
    {
      name: 'VMware Certified Specialist - Cloud Foundation 2023',
      issuer: 'VMware by Broadcom',
      date: 'Jan 2023'
    },
    {
      name: 'Master Specialist - VMware Cloud on AWS 2023',
      issuer: 'VMware by Broadcom',
      date: 'Jan 2023'
    }
  ];

  const PROOF_TILES = [
    { value: '12+ Years', label: 'Enterprise Infrastructure' },
    { value: '40+', label: 'Hyperscaler Migrations Executed' },
    { value: '100%', label: 'Zero-Downtime Cutover Record' },
    { value: '6', label: 'Free Engineering Tools' }
  ];

  const SPECIALIZATIONS = [
    {
      title: 'Hyperscaler Procurement & Sizing',
      desc: 'Prevent cluster over-provisioning through decoupled external NFS storage architectures (ANF / FSx ONTAP).',
      links: [
        { label: 'AVS Architecture', url: '/disciplines/avs' },
        { label: 'Node Sizing Tool', url: '/tools/sizing' }
      ]
    },
    {
      title: 'HCX Zero-Downtime Migration',
      desc: 'Production wave sequencing, Network Extension L2 broadcast domain stretching, and MON traffic routing.',
      links: [
        { label: 'HCX Architecture', url: '/disciplines/hcx' },
        { label: 'RVTools Analyzer', url: '/tools/rvtools-analyzer' }
      ]
    },
    {
      title: 'NSX-T Microsegmentation',
      desc: 'Zero-trust distributed firewall rule discovery via Aria Operations for Networks before hyperscaler cutover.',
      links: [
        { label: 'NSX-T Security', url: '/disciplines/nsx' },
        { label: 'Aria Networks Tool', url: '/tools/aria-networks' }
      ]
    },
    {
      title: 'Disaster Recovery Validation',
      desc: 'SRM non-disruptive failover testing, recovery time objective (RTO) sequencing, and WAN delta modeling.',
      links: [
        { label: 'SRM Recovery', url: '/disciplines/srm' },
        { label: 'DR Planner Tool', url: '/tools/dr-planner' }
      ]
    },
    {
      title: 'Nutanix NC2 on Azure Migration',
      desc: 'AHV compatibility, VirtIO driver injection, Azure bare-metal node sizing and Nutanix Move wave planning.',
      links: [
        { label: 'NC2 Architecture', url: '/disciplines/nutanix-nc2-azure' },
        { label: 'NC2 Assessment Tool', url: '/tools/nutanix-nc2-assessment' }
      ]
    }
  ];

  const SELECTED_OUTCOMES = [
    '1,240 VMs, 0 hours downtime, 38% TCO reduction (Tier-1 bank)',
    '4,500 workloads, 0 min downtime, 24% Capex reduction (18-hospital network)',
    '820 VMs, 99.999% availability, $1.4M/year saved (global freight)'
  ];

  const ENGAGEMENT_STEPS = [
    {
      step: '01',
      title: 'Assess',
      summary: 'RVTools discovery, sizing, and readiness modeling across compute, memory, and storage boundaries.'
    },
    {
      step: '02',
      title: 'Design',
      summary: 'Target architecture specification, NSX-T microsegmentation policy definition, and disaster-recovery planning.'
    },
    {
      step: '03',
      title: 'Cutover',
      summary: 'HCX wave migration execution, non-disruptive validation, and operational cutover handover.'
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-cyan-300">About Principal Architect</span>
      </nav>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Portrait, Contact, Connect & Credentials (5 Cols) */}
        <aside className="lg:col-span-5 space-y-6">
          <div
            data-theme-container="dark"
            className="dark-card dark-feature-container relative rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden text-center flex flex-col items-center"
          >
            {/* Circular Avatar Framing */}
            <div
              className={`relative group/avatar ${isAdmin ? 'cursor-pointer' : ''}`}
              onClick={isAdmin ? () => setIsPhotoEditorOpen(true) : undefined}
              title={isAdmin ? "Click to customize founder profile photo" : undefined}
            >
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-1 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={resolvedPortrait}
                    alt={founder.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/Wasim-Pic-02.png';
                    }}
                  />
                  {/* Hover / Click Overlay to Change Photo - Only visible for Admin */}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold text-white transition-opacity backdrop-blur-[2px]">
                      <Sliders className="w-6 h-6 text-white" />
                      <span>Edit Portrait</span>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-emerald-400 shadow-md"
                title="Verified Principal VMware & Nutanix Architect"
              >
                <CheckCircle2 className="w-4 h-4 fill-current text-white dark:text-slate-900" />
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <h2 className="text-2xl font-bold text-white">{founder.name}</h2>
              <div className="text-xs font-mono text-cyan-300">{founder.role}</div>
            </div>

            {/* Contact Details */}
            <div className="mt-4 flex flex-col items-center gap-2 text-xs text-slate-300 w-full">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{locationDisplay}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a
                  href={`tel:${phoneDisplay.replace(/\s+/g, '')}`}
                  className="hover:text-cyan-400 transition-colors font-mono"
                >
                  {phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a
                  href={`mailto:${founder.email || 'wasim@zaboraa.com'}`}
                  className="hover:text-cyan-400 transition-colors font-mono"
                >
                  {founder.email || 'wasim@zaboraa.com'}
                </a>
              </div>
            </div>

            {/* Connect Links */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 w-full flex flex-col gap-2 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 text-left w-full">
                Connect on LinkedIn
              </span>
              <a
                href="https://www.linkedin.com/in/wasim-sayyed-8b857714b/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors group"
              >
                <span className="font-medium">LinkedIn - Wasim Sayyed</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
              </a>
              <a
                href="https://www.linkedin.com/company/zaboraa/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors group"
              >
                <span className="font-medium">LinkedIn - Zaboraa</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
              </a>
            </div>

            {/* Quick Customize Button - Only visible for Admin */}
            {isAdmin && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsPhotoEditorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Customize Portrait</span>
                </button>
              </div>
            )}
          </div>

          {/* Certifications Box (exactly 6 credentials, newest first, nothing else) */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Validated Certifications & Credentials (6)</span>
            </h3>
            <ol className="space-y-2.5">
              {VALIDATED_CERTIFICATIONS.map((cert, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold mt-0.5">0{idx + 1}.</span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-slate-200 leading-snug">
                        {cert.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {cert.issuer} <span className="text-slate-600">|</span> {cert.date}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Right Column: Narrative Bio, Proof Strip, Specializations & Engagements (7 Cols) */}
        <section aria-label="Enterprise Cloud Architecture & Advisory" className="lg:col-span-7 space-y-8">
          {/* Header & Positioning */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PRINCIPAL ARCHITECTURAL DESK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Enterprise Cloud Architecture & Advisory
            </h1>
          </div>

          {/* 1. Proof Strip: 4 compact stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROOF_TILES.map((tile, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
              >
                <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono tracking-tight">
                  {tile.value}
                </div>
                <div className="text-xs text-slate-400 font-mono leading-tight">
                  {tile.label}
                </div>
              </div>
            ))}
          </div>

          {/* Bio Rewrite: Positioning Line + 3 Core Tenets */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
              Founder-led VMware and Nutanix cloud migration and disaster-recovery advisory across Azure AVS, NC2, GCVE and VMC.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-white">What I own:</strong> Target architecture, risk, RTO/RPO, cutover decisions.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-white">How it is delivered:</strong> A vetted network of VMware, Nutanix, networking and cloud specialists under one delivery framework.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                <span>
                  <strong className="text-white">How it is protected:</strong> NDA and a single quality standard.
                </span>
              </li>
            </ul>
          </div>

          {/* 2. Advisory Specializations & Evidence Links (5 Specializations including Nutanix NC2) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-slate-400">
                Advisory Specializations
              </h2>
              <span className="text-xs font-mono text-cyan-400">
                5 Practice Areas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECIALIZATIONS.map((pil, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 ${
                    idx === 4 ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{pil.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {pil.desc}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                    <span className="text-[11px] font-mono text-slate-500">See it in action:</span>
                    {pil.links.map((link, lIdx) => (
                      <Link
                        key={lIdx}
                        to={link.url}
                        className="inline-flex items-center gap-1 font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Outcomes Row */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Selected Outcomes
                </span>
                <Link
                  to="/case-studies"
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View all verified case studies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                {SELECTED_OUTCOMES.map((outcome, oIdx) => (
                  <li key={oIdx} className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. How Engagements Work: 3 Steps */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-slate-400">
              How Engagements Work
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ENGAGEMENT_STEPS.map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                    Step {step.step}
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBriefingModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Strategic Architecture Briefing</span>
            </button>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-transparent hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Try the free sizing tools</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
