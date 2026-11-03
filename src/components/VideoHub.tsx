import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { VideoItem } from '../types/siteData';
import { isDummyVideoUrl } from '../utils/videoUtils';
import {
  Play,
  Clock,
  BookOpen,
  ListOrdered,
  CheckCircle,
  Plus,
  X,
  ExternalLink,
  Film,
  Star,
  Sparkles
} from 'lucide-react';

export const VideoHub: React.FC = () => {
  const { siteConfig, setIsCustomizerOpen, selectedVideo, setSelectedVideo, setFeaturedVideoId } = useCustomization();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Migration Runbook', 'Network Architecture', 'Storage Sizing', 'Hands-on Labs'];

  const validVideos = (siteConfig.videos || []).filter(v => !isDummyVideoUrl(v.embedUrl));

  const filteredVideos = validVideos.filter(v => {
    if (activeCategory === 'All') return true;
    return v.category === activeCategory;
  });

  return (
    <section id="videos" className="py-20 bg-slate-950 border-b border-slate-800 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Executive Video Masterclasses
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise Walkthroughs & Cutover Demonstrations
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              High-consequence architecture sessions detailing packet traces, live failovers, and storage decoupling mechanisms across AVS, VMC, and GCVE.
            </p>
          </div>

          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Video Session</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 rounded-xl border border-slate-800 w-fit">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Grid or Empty State */}
        {filteredVideos.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
            <p className="text-sm font-medium">Video tutorials coming soon - Check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 p-5 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Video Mock Screen / Thumbnail Area */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    {/* Decorative mesh background */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Play Button Icon */}
                    <div className="relative w-12 h-12 rounded-full bg-cyan-500/90 group-hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>

                    {/* Duration Overlay */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{video.duration}</span>
                    </div>

                    {/* Provider Pill */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-cyan-400">
                      {video.provider}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{video.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{video.chapters.length} Chapters</span>
                      </div>

                      {siteConfig.featuredVideoId === video.id && (
                        <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Featured on Main</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {video.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {video.summary}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeaturedVideoId(video.id);
                      const el = document.getElementById('featured-video');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-[11px] font-medium transition-colors flex items-center gap-1 ${
                      siteConfig.featuredVideoId === video.id
                        ? 'text-cyan-400 font-semibold'
                        : 'hover:text-cyan-300 text-slate-500'
                    }`}
                    title="Showcase this video as the main video on the homepage"
                  >
                    <Star className={`w-3 h-3 ${siteConfig.featuredVideoId === video.id ? 'fill-current text-cyan-400' : ''}`} />
                    <span>{siteConfig.featuredVideoId === video.id ? 'Main Feature Active' : 'Set as Main Feature'}</span>
                  </button>

                  <span className="text-cyan-400 font-medium group-hover:underline flex items-center gap-1">
                    <span>Watch Session</span>
                    <Play className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && !isDummyVideoUrl(selectedVideo.embedUrl) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 lg:p-10 flex justify-center animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Film className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-cyan-400 font-semibold">{selectedVideo.provider}</span>
                <span>/</span>
                <span>{selectedVideo.category}</span>
                <span>/</span>
                <span className="font-mono">{selectedVideo.duration}</span>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <iframe
                src={selectedVideo.embedUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {selectedVideo.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedVideo.summary}
              </p>
            </div>

            {/* Two-column Chapters & Takeaways */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              {/* Chapters list */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Session Chapters</span>
                </div>
                <div className="space-y-1.5">
                  {selectedVideo.chapters.map((ch, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300"
                    >
                      <span>{ch.title}</span>
                      <span className="font-mono text-cyan-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded">
                        {ch.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaways list */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Architectural Takeaways</span>
                </div>
                <div className="space-y-2">
                  {selectedVideo.takeaways.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Want to book a tailored live masterclass for your enterprise engineering team?
              </span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white rounded-lg hover:bg-slate-200"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
