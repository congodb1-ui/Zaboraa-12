import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { KnowledgeBaseSection } from '../components/KnowledgeBaseSection';
import { TutorialsAndArticles } from '../components/TutorialsAndArticles';
import { VideoHub } from '../components/VideoHub';
import { FeaturedVideoSection } from '../components/FeaturedVideoSection';
import { NutanixArchitectureDeepDiveSection } from '../components/NutanixArchitectureDeepDiveSection';
import { BookOpen, Film, Layers, FileText, Search, Sparkles, Cpu } from 'lucide-react';
import { useCustomization } from '../context/CustomizationContext';
import { NotFoundPage } from './NotFoundPage';

export const ResourcesPage: React.FC = () => {
  const location = useLocation();
  const { tab } = useParams<{ tab?: string }>();
  const { setIsSearchOpen } = useCustomization();

  // Validate tab parameter to avoid soft-404 on arbitrary paths like /resources/nonsense
  const VALID_TABS = ['nutanix-arch', 'nutanix', 'architecture', 'kb', 'tutorials', 'videos'];
  if (tab && !VALID_TABS.includes(tab.toLowerCase())) {
    return <NotFoundPage />;
  }

  // Tab state derived from URL or local state
  const [activeTab, setActiveTab] = useState<'all' | 'nutanix-arch' | 'kb' | 'tutorials' | 'videos'>('all');

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/nutanix') || path.includes('/architecture')) {
      setActiveTab('nutanix-arch');
    } else if (path.includes('/kb')) {
      setActiveTab('kb');
    } else if (path.includes('/tutorials')) {
      setActiveTab('tutorials');
    } else if (path.includes('/videos')) {
      setActiveTab('videos');
    }
  }, [location.pathname]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-cyan-300">Knowledge & Engineering Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Knowledge Hub & Engineering Resources
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Battle-tested runbooks, architectural blueprints, software guides, downloadable whitepaper bundles, and technical walkthroughs curated by Lead Principal Architect Wasim Sayyed.
          </p>
        </div>

        {/* Global Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Search Runbooks & Tutorials (Ctrl+K)</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          All Resources
        </button>
        <button
          onClick={() => setActiveTab('nutanix-arch')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'nutanix-arch'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Nutanix NC2 Architecture & Whitepapers</span>
        </button>
        <button
          onClick={() => setActiveTab('kb')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'kb'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>KB Runbooks</span>
        </button>
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tutorials'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Software Tutorials & Articles</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'videos'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Videos</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      <div className="space-y-16">
        {(activeTab === 'all' || activeTab === 'nutanix-arch') && (
          <div id="nutanix-architecture-section">
            <NutanixArchitectureDeepDiveSection />
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'kb') && (
          <div id="kb-section">
            <KnowledgeBaseSection />
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'tutorials') && (
          <div id="tutorials-section">
            <TutorialsAndArticles />
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'videos') && (
          <div id="videos-section" className="space-y-12">
            <FeaturedVideoSection />
            <VideoHub />
          </div>
        )}
      </div>
    </div>
  );
};
