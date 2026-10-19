import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { Phone, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Award, Camera, Edit3, Cpu, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  const {
    siteConfig,
    setIsBriefingModalOpen,
    setIsPhotoEditorOpen,
    isAdmin,
    setIsFounderModalOpen,
    setIsHeroStatsModalOpen
  } = useCustomization();
  const { hero, founder } = siteConfig;

  const photoStyle = founder.photoStyle || {
    zoom: 1.05,
    brightness: 102,
    contrast: 104,
    objectPosition: 'top',
    borderGlow: 'cyan'
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Subtle Technical Grid Background */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Proposition and Main Calls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Unboxed Metadata Kicker (Anti-Slop Cleanliness) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-sky-700 dark:text-cyan-400">
              <span>{hero.eyebrow || 'FOUNDER-LED ENTERPRISE INFRASTRUCTURE CONSULTANCY'}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-600 dark:text-slate-400">NDA PROTECTED</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-teal-700 dark:text-emerald-400 font-mono font-medium">
                DIRECT ARCHITECT ACCESS
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              {hero.headline}
            </h1>

            {/* Subheadline Prose */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {hero.subheadline}
            </p>

            {/* Validated Architecture Stack Filter Buttons */}
            <div className="pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold mr-1">
                  Validated Platforms:
                </span>
                {[
                  { name: 'Azure AVS', id: 'avs' },
                  { name: 'Google GCVE', id: 'gcve' },
                  { name: 'AWS VMC', id: 'vmc-dr' },
                  { name: 'NSX-T SDN', id: 'nsx' },
                  { name: 'HCX & SRM', id: 'srm' },
                  { name: 'Nutanix NC2', id: 'nutanix-nc2-azure' }
                ].map((cloud) => (
                  <a
                    key={cloud.id}
                    href="#migration-pipeline"
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] transition-colors"
                  >
                    {cloud.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsBriefingModalOpen(true)}
                className="px-5 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Architecture Briefing</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${founder.phone.replace(/\s+/g, '')}`}
                className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                <span>Direct: {founder.phone}</span>
              </a>

              <Link
                to="/tools"
                className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Explore Workbench Tools</span>
              </Link>
            </div>

            {/* Executive Proof Metrics Strip */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Verified Engineering Metrics
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsHeroStatsModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 text-sky-700 dark:text-cyan-300 text-[10px] font-mono font-semibold transition cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                    <span>Edit Metrics</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {hero.stats.map((stat, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Founder Authority Card with Refined Executive Presentation (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm dark:shadow-xl backdrop-blur-sm overflow-hidden">
              {/* Top Authority Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-700 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Lead Principal Architect
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-emerald-400 font-mono font-semibold">
                  <span>ACTIVE CONSULTING PRACTICE</span>
                </div>
              </div>

              {/* Founder Header with Prestigious Framing */}
              <div className="mt-6 flex flex-col items-center text-center">
                <div
                  className={`relative group/avatar ${isAdmin ? 'cursor-pointer' : ''}`}
                  onClick={isAdmin ? () => setIsPhotoEditorOpen(true) : undefined}
                  title={isAdmin ? "Click to customize founder profile photo" : undefined}
                >
                  {/* Clean Double-Ring Circular Frame */}
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-1 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform duration-300">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      {founder.portraitImage ? (
                        <img
                          src={founder.portraitImage}
                          alt={founder.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('/src/assets/images/')) {
                              target.src = target.src.replace('/src/assets/images/', '/assets/images/');
                            } else if (target.src.includes('/assets/images/')) {
                              target.src = target.src.replace('/assets/images/', '/src/assets/images/');
                            }
                          }}
                          style={{
                            transform: photoStyle?.zoom && photoStyle.zoom !== 1 ? `scale(${photoStyle.zoom})` : undefined,
                            filter: photoStyle?.brightness && photoStyle?.contrast && (photoStyle.brightness !== 100 || photoStyle.contrast !== 100)
                              ? `brightness(${photoStyle.brightness}%) contrast(${photoStyle.contrast}%)`
                              : undefined,
                            objectPosition: photoStyle?.objectPosition || 'center'
                          }}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-4xl font-bold bg-slate-200 dark:bg-slate-800">
                          WS
                        </div>
                      )}

                      {/* Admin Overlay */}
                      {isAdmin && (
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold text-white transition-opacity backdrop-blur-[2px]">
                          <Camera className="w-6 h-6 text-white" />
                          <span>Change Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verified Badge */}
                  <div
                    className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-emerald-400 shadow-md"
                    title="Verified Principal VMware Architect"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current text-white dark:text-slate-900" />
                  </div>
                </div>

                {/* Founder Credentials & Details */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {founder.name}
                  </h3>
                  <p className="text-sm text-sky-700 dark:text-cyan-400 font-semibold tracking-wide">
                    {founder.role}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {founder.location}
                  </p>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFounderModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                        title="Edit founder credentials & bio"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Edit Credentials</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPhotoEditorOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                        title="Open Profile Photo Studio"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-600" />
                        <span>Adjust Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Founder Bio Brief */}
              <p className="mt-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l-2 border-slate-300 dark:border-slate-700 pl-3">
                "{founder.bio}"
              </p>

              {/* Verified Specializations */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  <span>Verified Certifications</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsFounderModalOpen(true)}
                      className="text-sky-700 dark:text-cyan-400 hover:underline text-[10px] lowercase font-sans cursor-pointer"
                    >
                      manage certifications
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {founder.certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/80 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Booking Strip */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Consultation Email:</span>
                <a
                  href={`mailto:${founder.email}`}
                  className="text-sky-700 dark:text-cyan-400 hover:underline font-mono font-medium"
                >
                  {founder.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
