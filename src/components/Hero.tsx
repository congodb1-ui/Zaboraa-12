import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { Phone, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Award, Terminal, Camera, Sparkles, Edit3, BarChart3 } from 'lucide-react';
import { TiltCard } from './TiltCard';

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
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Graphic Layer */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {hero.heroImage && (
          <img
            src={hero.heroImage}
            alt="Enterprise Datacenter Architecture"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('/src/assets/images/')) {
                target.src = target.src.replace('/src/assets/images/', '/assets/images/');
              } else if (target.src.includes('/assets/images/')) {
                target.src = target.src.replace('/assets/images/', '/src/assets/images/');
              }
            }}
            className="w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Proposition and Main Calls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Unboxed Metadata Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400">
              <span>{hero.eyebrow}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">NDA READY</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                &lt; 2 HRS RESPONSE
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              {hero.headline}
            </h1>

            {/* Subheadline Prose */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {hero.subheadline}
            </p>

            {/* Interactive Multi-Cloud Platform Navigator Pills */}
            <div className="pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1">
                  Validated Stacks:
                </span>
                {[
                  { name: 'Azure AVS', id: 'avs' },
                  { name: 'Google GCVE', id: 'gcve' },
                  { name: 'AWS VMC', id: 'vmc-dr' },
                  { name: 'NSX-T SDN', id: 'nsx' },
                  { name: 'SRM & HCX', id: 'srm' },
                  { name: 'Nutanix NC2', id: 'nutanix-nc2-azure' }
                ].map((cloud) => (
                  <a
                    key={cloud.id}
                    href="#architecture-showcase"
                    className="px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-all hover:scale-105"
                  >
                    {cloud.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Interactive CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsBriefingModalOpen(true)}
                className="px-5 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Architecture Briefing</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${founder.phone.replace(/\s+/g, '')}`}
                className="px-5 py-3 text-sm font-medium text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>Call Direct: {founder.phone}</span>
              </a>

              <Link
                to="/tools/design-generator"
                className="px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 hover:from-cyan-500 hover:to-indigo-500 border border-cyan-400/50 rounded-lg shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Generate Architecture Blueprint</span>
              </Link>
            </div>

            {/* Social Proof Numbers - Adjacent to Proposition */}
            <div className="pt-8 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Executive Proof Metrics
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsHeroStatsModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-mono font-semibold transition cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-cyan-400" />
                    <span>Edit Metrics</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {hero.stats.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 leading-snug">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Founder Authority Card with Tilt */}
          <div className="lg:col-span-5">
            <TiltCard maxTilt={5} className="h-full">
              <div
                data-theme-container="dark"
                className="relative rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md dark-card dark-feature-container hero-dark-card overflow-hidden group/hero"
              >
                {/* Subtle pulsating cyber glow and ambient radial aura */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-cyan-500/20 via-emerald-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />

                {/* Subtle top indicator */}
                <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-300">
                      Lead Principal Architect
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>ACTIVE AVAILABILITY</span>
                  </div>
                </div>

                {/* Founder Header with Large Circular Avatar & Dynamic Radial Cyber Border */}
                <div className="relative z-10 mt-6 flex flex-col items-center text-center">
                {/* Circular Expanded Avatar */}
                <div
                  className={`relative group/avatar ${isAdmin ? 'cursor-pointer' : ''}`}
                  onClick={isAdmin ? () => setIsPhotoEditorOpen(true) : undefined}
                  title={isAdmin ? "Click to customize founder profile photo" : undefined}
                >
                  {/* Subtle pulsating cyber-glow backdrop aura */}
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/40 via-emerald-500/30 to-blue-500/40 blur-2xl animate-cyber-glow pointer-events-none" />

                  {/* Dynamic rotating radial accent border with breathing neon halo */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full p-[4px] animate-ring-breathe overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover/avatar:scale-[1.02]">
                    {/* Rotating Conic-Radial Gradient Element */}
                    <div className="absolute inset-[-50%] cyber-radial-border animate-radial-spin" />

                    {/* Inner Circular Image Frame */}
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative">
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
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-4xl font-bold bg-slate-800">
                            WS
                          </div>
                        )}

                        {/* Hover / Click Overlay to Change Photo - Only visible and active for Admin */}
                        {isAdmin && (
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold text-cyan-300 transition-opacity backdrop-blur-[2px]">
                            <Camera className="w-6 h-6 text-cyan-400" />
                            <span>Change Photo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Verified Indicator */}
                  <div
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-400 shadow-xl shadow-cyan-500/30 z-20"
                    title="Verified Principal VMware Architect"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Founder Details */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {founder.name}
                  </h3>
                  <p className="text-sm text-cyan-400 font-semibold tracking-wide">
                    {founder.role}
                  </p>
                  <p className="text-xs text-slate-400">
                    {founder.location}
                  </p>

                  {/* Quick Customizer Actions - Only visible for Admin */}
                  {isAdmin && (
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFounderModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 transition-all shadow-sm cursor-pointer"
                        title="Edit founder title, bio, experience, and verified certifications"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Edit Credentials & Bio</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPhotoEditorOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
                        title="Open Profile Photo Studio to upload or adjust founder photo"
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Customize Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Founder Bio Brief */}
              <p className="relative z-10 mt-5 text-xs text-slate-300 leading-relaxed border-l-2 border-cyan-500/60 pl-3">
                "{founder.bio}"
              </p>

              {/* Certifications & Badges */}
              <div className="relative z-10 mt-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  <span>Verified Specializations</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsFounderModalOpen(true)}
                      className="text-cyan-400 hover:text-cyan-300 text-[10px] lowercase font-sans cursor-pointer underline"
                    >
                      manage certifications
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {founder.certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800/80"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Booking Strip */}
              <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Direct Consultation:</span>
                <a
                  href={`mailto:${founder.email}`}
                  className="text-cyan-400 hover:underline font-mono font-medium"
                >
                  {founder.email}
                </a>
              </div>
            </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
};
