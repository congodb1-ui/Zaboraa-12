import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { Search, X, Layers, BookOpen, Film, Server, ArrowRight, Cpu, HardDrive, FileSpreadsheet, ShieldAlert, History, Trash2, Terminal } from 'lucide-react';
import { isDummyVideoUrl } from '../utils/videoUtils';

const RECENT_SEARCHES_KEY = 'zaboraa_recent_searches_v1';

export const SearchCommandModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    siteConfig,
    isAdmin,
    isSearchOpen,
    setIsSearchOpen,
    setSelectedTutorial,
    setSelectedDiagram,
    setSelectedVideo
  } = useCustomization();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch {}
    return ['Nutanix NC2', 'Bare-Metal Azure', 'RVTools Analyzer', 'DR Planner', 'NSX-T Microseg'];
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  const saveRecentSearch = (searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteRecentSearchItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(item => item !== itemToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const handleSelectRecent = (searchTerm: string) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      saveRecentSearch(query.trim());
    }
  };

  const handleNavigateWithQuery = (action: () => void) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    setIsSearchOpen(false);
    action();
  };

  if (!isSearchOpen) return null;

  const lowerQuery = query.toLowerCase().trim();

  // Filter across all types
  const matchingPlatforms = (siteConfig.platformShowcases || []).filter(
    p =>
      p.platform.toLowerCase().includes(lowerQuery) ||
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.techTags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );

  const matchingTutorials = siteConfig.tutorials.filter(
    t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.summary.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );

  const matchingDiagrams = siteConfig.diagrams.filter(
    d =>
      d.title.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery) ||
      d.provider.toLowerCase().includes(lowerQuery)
  );

  const matchingVideos = siteConfig.videos.filter(
    v =>
      !isDummyVideoUrl(v.embedUrl) &&
      (v.title.toLowerCase().includes(lowerQuery) ||
       v.summary.toLowerCase().includes(lowerQuery) ||
       v.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );

  const matchingKBArticles = (siteConfig.knowledgeBase || [])
    .filter(a => isAdmin || a.status !== 'draft')
    .filter(
      a =>
        a.id.toLowerCase().includes(lowerQuery) ||
        a.title.toLowerCase().includes(lowerQuery) ||
        a.component.toLowerCase().includes(lowerQuery) ||
        a.rootCause.toLowerCase().includes(lowerQuery) ||
        a.symptoms.some(s => s.toLowerCase().includes(lowerQuery)) ||
        a.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

  const engineeringTools = [
    { title: 'Node & Storage Sizing Estimator', path: '/tools/sizing', desc: 'Decoupled ANF/FSx storage node sprawl reduction' },
    { title: 'RVTools Migration Readiness Engine', path: '/tools/rvtools-analyzer', desc: 'In-browser .xlsx assessment & HCX wave mapping' },
    { title: 'DR RPO/RTO & Replication Calculator', path: '/tools/dr-planner', desc: 'vSphere replication WAN bandwidth & SRM protection' },
    { title: 'Automated Hybrid Blueprint Generator', path: '/tools/design-generator', desc: 'Generate production architecture BOM & deliverables' },
  ].filter(
    t => !lowerQuery || t.title.toLowerCase().includes(lowerQuery) || t.desc.toLowerCase().includes(lowerQuery)
  );

  const hasResults =
    matchingPlatforms.length > 0 ||
    matchingTutorials.length > 0 ||
    matchingDiagrams.length > 0 ||
    matchingVideos.length > 0 ||
    matchingKBArticles.length > 0 ||
    engineeringTools.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 lg:p-12 flex justify-center animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, platforms, architecture diagrams, runbooks..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-500 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-5 flex-1 text-xs">
          {/* Recent Searches Persisted List */}
          {recentSearches.length > 0 && !query && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5 font-mono uppercase text-[11px]">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recent Searches ({recentSearches.length})</span>
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Clear search history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all font-mono text-xs shadow-sm group overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectRecent(term)}
                      className="px-2.5 py-1.5 text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3 h-3 text-cyan-400/70 group-hover:text-cyan-300" />
                      <span>{term}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => deleteRecentSearchItem(e, term)}
                      className="px-1.5 py-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer border-l border-slate-800"
                      title={`Remove "${term}" from history`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasResults && query && (
            <div className="text-center py-8 text-slate-500">
              No results found for "{query}". Try searching for "Sizing", "RVTools", "AVS", "HCX", "NSX-T", or "Storage".
            </div>
          )}

          {!query && (
            <div className="py-2 text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300">Quick Navigation Suggestions:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Node Sizing', 'RVTools Parser', 'Azure AVS', 'NSX-T Microseg', 'HCX Migration', 'DR Calculator'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSelectRecent(tag)}
                    className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Engineering Workbench Tools */}
          {engineeringTools.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Interactive Engineering Tools ({engineeringTools.length})</span>
              </div>
              <div className="space-y-1.5">
                {engineeringTools.map((tool, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigateWithQuery(() => navigate(tool.path))}
                    className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-cyan-300">
                        {tool.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {tool.desc}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core Platforms Matches */}
          {matchingPlatforms.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Dedicated Cloud Platforms ({matchingPlatforms.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingPlatforms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleNavigateWithQuery(() => navigate(`/disciplines/${p.id}`))}
                    className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-cyan-300">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.platform} · {p.badge}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Architecture Diagrams Matches */}
          {matchingDiagrams.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture Diagrams ({matchingDiagrams.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingDiagrams.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleNavigateWithQuery(() => {
                      setSelectedDiagram(d);
                      navigate('/tools/design-generator');
                    })}
                    className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-cyan-300">
                        {d.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {d.provider} · {d.category}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tutorials & Articles Matches */}
          {matchingTutorials.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tutorials & Articles ({matchingTutorials.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingTutorials.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleNavigateWithQuery(() => {
                      setSelectedTutorial(t);
                      navigate('/resources/tutorials');
                    })}
                    className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-emerald-300">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {t.type.toUpperCase()} · {t.provider} · {t.readTime}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos Matches */}
          {matchingVideos.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                <span>Video Masterclasses ({matchingVideos.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingVideos.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleNavigateWithQuery(() => {
                      setSelectedVideo(v);
                      navigate('/resources/videos');
                    })}
                    className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-amber-300">
                        {v.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {v.provider} · {v.duration} · {v.category}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Base Runbooks Matches */}
          {matchingKBArticles.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Knowledge Base & Technical Runbooks ({matchingKBArticles.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingKBArticles.map(a => (
                  <button
                    key={a.id}
                    onClick={() => handleNavigateWithQuery(() => {
                      navigate('/resources/kb');
                    })}
                    className="w-full text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-cyan-300">
                          {a.title}
                        </span>
                        {a.status === 'draft' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-amber-500/40 bg-amber-950/70 text-amber-300 uppercase font-bold">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {a.id} · {a.component} · {a.serviceCategory}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or tap ESC to close</span>
          <span className="font-mono">Global Search · Multi-Page Navigation</span>
        </div>
      </div>
    </div>
  );
};
