import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { VideoItem } from '../types/siteData';
import { isDummyVideoUrl } from '../utils/videoUtils';
import {
  Play,
  Clock,
  ListOrdered,
  CheckCircle,
  Film,
  Sparkles,
  ArrowDown,
  Sliders,
  Maximize2
} from 'lucide-react';

export const FeaturedVideoSection: React.FC = () => {
  const { siteConfig, setFeaturedVideoId, setIsCustomizerOpen, setSelectedVideo } = useCustomization();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Find valid featured video or fallback to the first valid video
  const validVideos = (siteConfig.videos || []).filter(v => !isDummyVideoUrl(v.embedUrl));
  const featuredVideo: VideoItem | undefined =
    validVideos.find(v => v.id === siteConfig.featuredVideoId) ||
    validVideos[0];

  if (!featuredVideo) return null;

  return (
    <section id="featured-video" className="py-20 bg-slate-950 border-b border-slate-800 scroll-mt-12 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-cyan-900/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Section Header with Featured Badge & Video Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Featured Masterclass</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Main Stage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {featuredVideo.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              {featuredVideo.summary}
            </p>
          </div>

          {/* Action to Swap Featured Video or Edit */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={featuredVideo.id}
                onChange={e => setFeaturedVideoId(e.target.value)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs text-cyan-300 font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
                title="Select which video to feature on the home page"
              >
                {siteConfig.videos.map(v => (
                  <option key={v.id} value={v.id}>
                    Featured: {v.title.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
              title="Edit video URLs or upload new sessions"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Manage Videos</span>
            </button>
          </div>
        </div>

        {/* Cinema Video Player Showcase */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Cinema Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-800/90 bg-slate-950/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-cyan-400 font-semibold">{featuredVideo.provider}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{featuredVideo.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{featuredVideo.duration}</span>
              </div>
              <button
                onClick={() => setSelectedVideo(featuredVideo)}
                className="text-slate-400 hover:text-white"
                title="Open Modal Player"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Stage Grid: Video Screen + Chapters & Takeaways */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left 8 Cols: High-Res Embedded Video Player */}
            <div className="lg:col-span-8 bg-black relative flex items-center justify-center aspect-video lg:aspect-auto min-h-[340px] sm:min-h-[440px]">
              {isPlaying ? (
                <iframe
                  src={`${featuredVideo.embedUrl}?autoplay=1`}
                  title={featuredVideo.title}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="w-full h-full absolute inset-0 cursor-pointer group flex flex-col items-center justify-center p-6 text-center select-none"
                >
                  {/* Backdrop artwork */}
                  <img
                    src="/assets/images/architecture_avs_mesh_1791450083586.webp"
                    alt={featuredVideo.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = '/assets/images/hero_cloud_datacenter_1791450064361.webp';
                      if (target.src && !target.src.endsWith(fallback)) {
                        target.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                  {/* Play Button */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-400/40 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>

                  <div className="relative z-10 mt-4 space-y-1">
                    <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Click to Stream Architecture Walkthrough
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      High Definition · Zero Lag · Runtime {featuredVideo.duration}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Interactive Chapters & Architectural Takeaways */}
            <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-900 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 space-y-5">
              {/* Chapters Selector */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Session Chapters</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {featuredVideo.chapters.length} Parts
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {featuredVideo.chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        activeChapterIndex === idx
                          ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/40'
                          : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                      }`}
                    >
                      <span className="truncate pr-2">{ch.title}</span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0 bg-slate-900 px-1.5 py-0.5 rounded">
                        {ch.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Architect Takeaways */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Architectural Takeaways</span>
                </div>
                <div className="space-y-2">
                  {featuredVideo.takeaways.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Jump to All Videos */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Other recorded sessions:</span>
                <a
                  href="#videos"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Browse Video Archive</span>
                  <ArrowDown className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
