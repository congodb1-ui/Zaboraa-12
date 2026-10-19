import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import {
  Calendar,
  ShieldCheck,
  Award,
  Mail,
  MapPin,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { resolveMediaUrl } from '../data/mediaAssets';

export const AboutPage: React.FC = () => {
  const { siteConfig, setIsBriefingModalOpen, isAdmin, setIsPhotoEditorOpen } = useCustomization();
  const founder = siteConfig.founder;

  const resolvedPortrait = resolveMediaUrl(
    founder.portraitImage,
    '/assets/images/Wasim-Pic-02.png'
  );

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-cyan-300">About Principal Architect</span>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Portrait & Credentials (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div
            data-theme-container="dark"
            className="dark-card dark-feature-container relative rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden text-center flex flex-col items-center"
          >
            {/* Circular Expanded Avatar with Clean Executive Framing */}
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
                title="Verified Principal VMware Architect"
              >
                <CheckCircle2 className="w-4 h-4 fill-current text-white dark:text-slate-900" />
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <h2 className="text-2xl font-bold text-white">{founder.name}</h2>
              <div className="text-xs font-mono text-cyan-300">{founder.role}</div>
            </div>

            <div className="mt-3 flex flex-col items-center gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{founder.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>{founder.email}</span>
              </div>
            </div>

            {/* Quick Customize Button - Only visible for Admin */}
            {isAdmin && (
              <div className="pt-3">
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

          {/* Certifications Box */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Validated Certifications & Credentials</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {founder.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Narrative Bio & Advisory Services (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PRINCIPAL ARCHITECTURAL DESK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Enterprise Cloud Architecture & Advisory
            </h1>
            <p className="text-base text-slate-300 leading-relaxed pt-2">
              {founder.bio}
            </p>
          </div>

          {/* Core Advisory Pillars */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-slate-400">
              Advisory Specializations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Hyperscaler Procurement & Sizing',
                  desc: 'Prevent cluster over-provisioning through decoupled external NFS storage architectures (ANF / FSx ONTAP).'
                },
                {
                  title: 'HCX Zero-Downtime Migration',
                  desc: 'Production wave sequencing, Network Extension L2 broadcast domain stretching, and MON traffic routing.'
                },
                {
                  title: 'NSX-T Microsegmentation',
                  desc: 'Zero-trust distributed firewall rule discovery via Aria Operations for Networks before hyperscaler cutover.'
                },
                {
                  title: 'Disaster Recovery Validation',
                  desc: 'SRM non-disruptive failover testing, recovery time objective (RTO) sequencing, and WAN delta modeling.'
                }
              ].map((pil, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{pil.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pil.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Book Briefing CTA */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsBriefingModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Strategic Architecture Briefing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
