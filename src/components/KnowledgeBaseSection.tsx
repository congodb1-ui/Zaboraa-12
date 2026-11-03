import React, { useState, useMemo, useEffect } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { KnowledgeBaseArticle, KBSolutionStep } from '../types/siteData';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  Terminal,
  Shield,
  Layers,
  Server,
  Cloud,
  Repeat,
  Activity,
  Network,
  Share2,
  Calendar,
  ExternalLink,
  ArrowDown,
  ArrowUp,
  Compass,
  Hash,
  Filter,
  Sparkles
} from 'lucide-react';

export const KnowledgeBaseSection: React.FC = () => {
  const { siteConfig, isAdmin, setIsBriefingModalOpen } = useCustomization();
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [componentFilter, setComponentFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [copiedFullRunbook, setCopiedFullRunbook] = useState<boolean>(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);

  const rawArticles = siteConfig.knowledgeBase || [];
  // Show all published articles to everyone; draft articles only if admin
  const kbArticles = useMemo(() => {
    return rawArticles.filter(item => isAdmin || item.status !== 'draft');
  }, [rawArticles, isAdmin]);

  // Priority-ordered articles: 1. Nutanix, 2. AVS, 3. All others
  const sortedArticles = useMemo(() => {
    return [...kbArticles].sort((a, b) => {
      const getPriority = (comp: string) => {
        if (comp.startsWith('Nutanix')) return 1;
        if (comp === 'Azure VMware Solution') return 2;
        return 3;
      };
      const pA = getPriority(a.component);
      const pB = getPriority(b.component);
      if (pA !== pB) return pA - pB;
      return a.id.localeCompare(b.id);
    });
  }, [kbArticles]);

  // Grouped buckets
  const nutanixArticles = useMemo(() => {
    return sortedArticles.filter(a => a.component.startsWith('Nutanix'));
  }, [sortedArticles]);

  const avsArticles = useMemo(() => {
    return sortedArticles.filter(a => a.component === 'Azure VMware Solution');
  }, [sortedArticles]);

  const otherArticles = useMemo(() => {
    return sortedArticles.filter(a => !a.component.startsWith('Nutanix') && a.component !== 'Azure VMware Solution');
  }, [sortedArticles]);

  // Component filter buttons arranged: 1. Nutanix, 2. AVS, 3. All others
  const components = [
    'All',
    'All Nutanix',
    'Nutanix NC2 on Azure',
    'Nutanix AHV & Move',
    'Nutanix Flow Virtual Networking',
    'Nutanix Disaster Recovery',
    'Azure VMware Solution',
    'VMware HCX',
    'VMware NSX-T',
    'Google Cloud VMware Engine',
    'VMware Cloud on AWS',
    'VMware Site Recovery Manager',
    'VMware Aria Operations for Networks'
  ];

  // Filtering
  const filteredArticles = useMemo(() => {
    return sortedArticles.filter(item => {
      let matchesComponent = true;
      if (componentFilter === 'All') {
        matchesComponent = true;
      } else if (componentFilter === 'All Nutanix') {
        matchesComponent = item.component.startsWith('Nutanix');
      } else {
        matchesComponent = item.component === componentFilter;
      }

      const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;
      const matchesSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rootCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesComponent && matchesSeverity && matchesSearch;
    });
  }, [sortedArticles, componentFilter, severityFilter, searchTerm]);

  // Check URL hash on mount or when hash changes to scroll to specific article
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && (hash.startsWith('KB-') || hash.startsWith('kb-'))) {
      const targetId = hash.toUpperCase();
      setTimeout(() => {
        scrollToCard(targetId);
      }, 400);
    }
  }, []);

  // Smooth scroll helper
  const scrollToElement = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToCard = (articleId: string) => {
    const card = document.getElementById(articleId) || document.getElementById(`kb-${articleId.toLowerCase()}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedCardId(articleId);
      setTimeout(() => {
        setHighlightedCardId(null);
      }, 3500);
    }
  };

  const handleCopyLink = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${articleId}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(articleId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleCopyFullRunbook = (article: KnowledgeBaseArticle) => {
    const isGuide = article.articleType === 'guide';
    const fullText = `[${article.id}] ${article.title}${article.status === 'draft' ? ' [DRAFT]' : ''}
Component: ${article.component} | Category: ${article.serviceCategory}
Severity: ${article.severity} | Verified in Production: ${article.verifiedInProduction ? 'YES' : 'NO'}
${article.architectNote ? `\nARCHITECT NOTE:\n${article.architectNote}\n` : ''}
${isGuide ? 'WHEN THIS APPLIES:' : 'SYMPTOMS:'}
${article.symptoms.map(s => `- ${s}`).join('\n')}

${isGuide ? 'DESIGN RATIONALE:' : 'ROOT CAUSE:'}
${article.rootCause}

${isGuide ? 'SCOPE AND LIMITS:' : 'IMPACT SCOPE:'}
${article.impactScope}

${isGuide ? 'PROCEDURE:' : 'RESOLUTION STEPS:'}
${article.resolutionSteps.map(step => `
Step ${step.stepNumber}: ${step.title}
${step.description}
${step.commandSnippet ? `\nCode (${step.commandSnippet.environment || step.commandSnippet.language}):\n${step.commandSnippet.code}\n` : ''}
${step.architectNote ? `Architect Note: ${step.architectNote}\n` : ''}
`).join('\n')}

${isGuide ? 'VALIDATION:' : 'VERIFICATION:'}
${article.verificationCheck}
${article.relatedDocLinks && article.relatedDocLinks.length > 0 ? `\nREFERENCES:\n${article.relatedDocLinks.map(l => `- ${l.label}: ${l.url}`).join('\n')}\n` : ''}`;
    navigator.clipboard.writeText(fullText);
    setCopiedFullRunbook(true);
    setTimeout(() => setCopiedFullRunbook(false), 2500);
  };

  const getComponentBadgeColor = (component: string) => {
    switch (component) {
      case 'Azure VMware Solution':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/50';
      case 'Google Cloud VMware Engine':
        return 'text-blue-400 border-blue-500/30 bg-blue-950/50';
      case 'VMware Cloud on AWS':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/50';
      case 'VMware NSX-T':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/50';
      case 'VMware HCX':
        return 'text-teal-400 border-teal-500/30 bg-teal-950/50';
      case 'VMware Site Recovery Manager':
        return 'text-rose-400 border-rose-500/30 bg-rose-950/50';
      case 'VMware Aria Operations for Networks':
        return 'text-indigo-400 border-indigo-500/30 bg-indigo-950/50';
      case 'Nutanix NC2 on Azure':
        return 'text-sky-400 border-sky-500/30 bg-sky-950/50';
      case 'Nutanix AHV & Move':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/50';
      case 'Nutanix Flow Virtual Networking':
        return 'text-teal-300 border-teal-500/30 bg-teal-950/50';
      case 'Nutanix Disaster Recovery':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/50';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Operational':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Advisory':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Render individual card helper
  const renderCard = (article: KnowledgeBaseArticle) => {
    const isGuide = article.articleType === 'guide';
    const isHighlighted = highlightedCardId === article.id;
    return (
      <article
        key={article.id}
        id={article.id}
        onClick={() => setSelectedArticle(article)}
        className={`cursor-pointer group flex flex-col justify-between rounded-2xl bg-slate-900/70 border p-6 transition-all duration-300 scroll-mt-32 relative ${
          isHighlighted
            ? 'border-cyan-400 ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/30 scale-[1.01] bg-slate-900'
            : 'border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-cyan-950/20'
        }`}
      >
        <div className="space-y-3.5">
          {/* Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-500" />
                {article.id}
              </span>
              <span className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] ${getSeverityBadgeColor(article.severity)}`}>
                {article.severity}
              </span>
              {article.status === 'draft' && (
                <span className="px-2 py-0.5 rounded-lg border border-amber-500/40 bg-amber-950/70 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Draft
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleCopyLink(article.id, e)}
                title="Copy direct anchor link to this runbook"
                className="p-1 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              >
                {copiedLinkId === article.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>
              <span className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] ${getComponentBadgeColor(article.component)}`}>
                {article.component}
              </span>
            </div>
          </div>

          {/* Article Title */}
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
            {article.title}
          </h3>

          {/* Root Cause / Design Rationale Teaser */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            <strong className="text-slate-300">{isGuide ? 'Design rationale:' : 'Root Cause:'}</strong> {article.rootCause}
          </p>

          {/* Symptoms / When this applies Preview Bullets */}
          <div className="space-y-1 pt-1">
            <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold">
              {isGuide ? 'When this applies:' : 'Key Observed Symptoms:'}
            </div>
            {article.symptoms.slice(0, 2).map((symptom, sIdx) => (
              <div key={sIdx} className="flex items-start gap-1.5 text-xs text-slate-300">
                <span className={isGuide ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isGuide ? '•' : '✕'}
                </span>
                <span className="truncate">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Bottom: Steps count & Open Action */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{article.resolutionSteps.length} Step {isGuide ? 'Procedure' : 'Runbook'}</span>
          </div>

          <div className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>{isGuide ? 'View Guide' : 'View Runbook'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </article>
    );
  };

  const isShowingAll = componentFilter === 'All' && searchTerm.trim() === '' && severityFilter === 'All';

  return (
    <section 
      id="knowledge-base" 
      className="py-16 sm:py-24 bg-slate-950 border-b border-slate-800 scroll-mt-16 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="font-mono text-emerald-400 font-bold tracking-wider">
                FIELD-PROVEN ENGINEERING RUNBOOKS
              </span>
              <span className="text-slate-600">·</span>
              <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-950/60 font-mono text-[11px]">
                {kbArticles.length} Verified Runbooks
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-medium">Nutanix · AVS · Multi-Cloud</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Knowledge Base & Engineering Runbooks
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Exhaustive technical runbooks, architecture migration guides, exact network procedures, and root-cause post-mortems crafted from high-stakes deployments across Nutanix Cloud Clusters, Azure VMware Solution, and hybrid cloud infrastructures.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-start md:self-auto">
            {/* Runbook counts pill */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{kbArticles.length} Technical Guides Available</span>
            </div>
          </div>
        </div>

        {/* Quick-Jump Category Navigation & Interactive Scroll Selector */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* 1-2-3 Quick-Jump Anchor Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-semibold flex items-center gap-1 mr-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Quick Scroll:
              </span>

              <button
                type="button"
                onClick={() => scrollToElement('kb-group-nutanix')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 border border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping" />
                <span className="font-semibold text-white">1. Nutanix</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-emerald-400 font-mono">
                  {nutanixArticles.length}
                </span>
                <ArrowDown className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => scrollToElement('kb-group-avs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shadow-sm group"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-semibold text-white">2. Azure VMware Solution</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-cyan-400 font-mono">
                  {avsArticles.length}
                </span>
                <ArrowDown className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => scrollToElement('kb-group-others')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-indigo-300 transition-all cursor-pointer shadow-sm group"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="font-semibold text-white">3. All Others</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-indigo-400 font-mono">
                  {otherArticles.length}
                </span>
                <ArrowDown className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </button>
            </div>

            {/* "Scroll to Specific KB" Interactive Dropdown */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <label htmlFor="kb-quick-scroll" className="text-xs font-mono text-slate-400 whitespace-nowrap hidden sm:inline">
                Scroll to KB:
              </label>
              <div className="relative w-full lg:w-80">
                <select
                  id="kb-quick-scroll"
                  onChange={(e) => {
                    if (e.target.value) {
                      scrollToCard(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="w-full bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-cyan-400 cursor-pointer transition-colors"
                >
                  <option value="" disabled>
                    ⚡ Jump directly to any Runbook / Guide...
                  </option>
                  <optgroup label="1. Nutanix Architecture & Migration (10 Guides)">
                    {nutanixArticles.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.id}] {a.title.slice(0, 45)}...
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="2. Azure VMware Solution (2 Runbooks)">
                    {avsArticles.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.id}] {a.title.slice(0, 45)}...
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="3. All Other Cloud & VMware Runbooks (6 Runbooks)">
                    {otherArticles.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.id}] {a.title.slice(0, 45)}...
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

          </div>

          {/* Component Tabs Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {components.map(comp => (
              <button
                key={comp}
                type="button"
                onClick={() => setComponentFilter(comp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  componentFilter === comp
                    ? 'bg-slate-800 border-cyan-400 text-cyan-300 font-semibold shadow-sm'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>

          {/* Search & Severity Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search procedures, error signatures, symptoms..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <span className="text-slate-500 text-[11px] font-mono">Severity:</span>
              {['All', 'Critical', 'High', 'Operational', 'Advisory'].map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    severityFilter === sev
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Display: If "All" view with no search, show 3 distinct hierarchical sections */}
        {isShowingAll ? (
          <div className="space-y-14">
            
            {/* GROUP 1: NUTANIX */}
            <div id="kb-group-nutanix" className="space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                      Section 1
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      Enterprise Migration & Architecture
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Nutanix Cloud Clusters (NC2), AHV, Flow & Disaster Recovery
                  </h3>
                  <p className="text-xs text-slate-300">
                    10 comprehensive architectural guides, VMware-to-Nutanix migration procedures, and cross-cluster recovery runbooks.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-slate-950 border border-emerald-500/40 font-mono text-xs text-emerald-300 font-bold">
                    {nutanixArticles.length} Guides
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollToElement('kb-group-avs')}
                    title="Scroll down to Azure VMware Solution"
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nutanixArticles.map(article => renderCard(article))}
              </div>
            </div>

            {/* GROUP 2: AZURE VMWARE SOLUTION */}
            <div id="kb-group-avs" className="space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                      Section 2
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      Enterprise Cloud Infrastructure
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Azure VMware Solution (AVS) Engineering Runbooks
                  </h3>
                  <p className="text-xs text-slate-300">
                    Production BGP route damping, NSX-T gateway symmetry, and enterprise Azure NetApp Files datastore resolution procedures.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-slate-950 border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold">
                    {avsArticles.length} Runbooks
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollToElement('kb-group-others')}
                    title="Scroll down to All Other Runbooks"
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-400 text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {avsArticles.map(article => renderCard(article))}
              </div>
            </div>

            {/* GROUP 3: ALL OTHERS */}
            <div id="kb-group-others" className="space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                      Section 3
                    </span>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      Hybrid Cloud & VMware Ecosystem
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Multi-Cloud & VMware Infrastructure Runbooks
                  </h3>
                  <p className="text-xs text-slate-300">
                    Remediation procedures across Google Cloud VMware Engine (GCVE), VMware Cloud on AWS, NSX-T DFW, HCX, SRM, and Aria Networks.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-slate-950 border border-indigo-500/40 font-mono text-xs text-indigo-300 font-bold">
                    {otherArticles.length} Runbooks
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollToElement('knowledge-base')}
                    title="Scroll back to top of Knowledge Base"
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherArticles.map(article => renderCard(article))}
              </div>
            </div>

          </div>
        ) : (
          /* Filtered or Searched Grid View */
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Showing <strong className="text-white">{filteredArticles.length}</strong> matching runbooks
              </span>
              <button
                type="button"
                onClick={() => {
                  setComponentFilter('All');
                  setSeverityFilter('All');
                  setSearchTerm('');
                }}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Reset to All Categories (1. Nutanix &rarr; 2. AVS &rarr; 3. Others)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map(article => renderCard(article))}
            </div>
          </div>
        )}

        {filteredArticles.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs space-y-3">
            <p className="text-sm text-slate-300">No Knowledge Base runbooks match your selected filter.</p>
            <button
              onClick={() => { setComponentFilter('All'); setSeverityFilter('All'); setSearchTerm(''); }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              Reset all filters to view 18 Runbooks
            </button>
          </div>
        )}

        {/* Back to top scroll button at bottom of section */}
        <div className="flex justify-center pt-8 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => scrollToElement('knowledge-base')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-md cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Back to Top of Knowledge Base</span>
          </button>
        </div>

      </div>

      {/* Reader Modal / Full Resolution Runbook Drawer */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-xl p-4 sm:p-6 lg:p-12 flex justify-center animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8 my-auto">
            {/* Top Close Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-400 font-bold">
                  {selectedArticle.id}
                </span>
                <span className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] ${getSeverityBadgeColor(selectedArticle.severity)}`}>
                  {selectedArticle.severity}
                </span>
                {selectedArticle.status === 'draft' && (
                  <span className="px-2 py-0.5 rounded-lg border border-amber-500/40 bg-amber-950/70 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Draft
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] ${getComponentBadgeColor(selectedArticle.component)}`}>
                  {selectedArticle.component}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 font-mono text-[11px]">{selectedArticle.lastUpdated}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyFullRunbook(selectedArticle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  title="Copy complete runbook to clipboard"
                >
                  {copiedFullRunbook ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                  title="Close Runbook"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Header & Verified Badge */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {selectedArticle.verifiedInProduction ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified in Production Deployments</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Advisory Technical Guide</span>
                  </div>
                )}
                {selectedArticle.status === 'draft' && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold">
                    <span>Draft Status (Admin Preview Only)</span>
                  </div>
                )}
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
                {selectedArticle.title}
              </h2>

              <div className="text-xs text-slate-400 space-y-1">
                <div><strong className="text-slate-300">Service Category:</strong> {selectedArticle.serviceCategory}</div>
                <div>
                  <strong className="text-slate-300">
                    {selectedArticle.articleType === 'guide' ? 'Scope and limits:' : 'Impact Scope:'}
                  </strong>{' '}
                  {selectedArticle.impactScope}
                </div>
              </div>

              {selectedArticle.architectNote && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-300 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                  <div>
                    <strong className="font-mono text-indigo-200">Architect Advisory Note:</strong> {selectedArticle.architectNote}
                  </div>
                </div>
              )}
            </div>

            {/* Symptoms / When this applies Box */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              selectedArticle.articleType === 'guide'
                ? 'bg-slate-950 border-cyan-800/40'
                : 'bg-rose-950/20 border-rose-900/40'
            }`}>
              <div className={`text-xs font-mono uppercase font-bold flex items-center gap-1.5 ${
                selectedArticle.articleType === 'guide' ? 'text-cyan-400' : 'text-rose-400'
              }`}>
                {selectedArticle.articleType === 'guide' ? <Layers className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{selectedArticle.articleType === 'guide' ? 'When this applies' : 'Observed Symptoms & Error Signatures'}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {selectedArticle.symptoms.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={selectedArticle.articleType === 'guide' ? 'text-cyan-400 font-bold shrink-0 mt-0.5' : 'text-rose-400 font-bold shrink-0 mt-0.5'}>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Root Cause / Design Rationale Post-Mortem */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{selectedArticle.articleType === 'guide' ? 'Design rationale' : 'Technical Root Cause'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedArticle.rootCause}
              </p>
            </div>

            {/* Resolution Steps / Procedure */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>{selectedArticle.articleType === 'guide' ? 'Procedure' : 'Step-by-Step Resolution Runbook'}</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {selectedArticle.resolutionSteps.length} Steps
                </span>
              </div>

              <div className="space-y-6">
                {selectedArticle.resolutionSteps.map(step => (
                  <div 
                    key={step.stepNumber} 
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold shrink-0">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {step.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-8">
                      {step.description}
                    </p>

                    {/* Code Snippet Box */}
                    {step.commandSnippet && (
                      <div className="ml-8 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
                        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                          <span className="text-cyan-400 font-medium">
                            {step.commandSnippet.environment || step.commandSnippet.language}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySnippet(step.commandSnippet!.code, `step-${step.stepNumber}`)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedSnippetId === `step-${step.stepNumber}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3.5 font-mono text-[11px] text-cyan-200 overflow-x-auto leading-relaxed scrollbar-thin">
                          <code>{step.commandSnippet.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Architect Field Note */}
                    {step.architectNote && (
                      <div className="ml-8 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 flex items-start gap-2">
                        <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                        <div>
                          <strong>Principal Architect Note:</strong> {step.architectNote}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification / Validation Check */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{selectedArticle.articleType === 'guide' ? 'Validation' : 'Production Verification & Validation Check'}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedArticle.verificationCheck}
              </p>
            </div>

            {/* Official Documentation Links */}
            {selectedArticle.relatedDocLinks && selectedArticle.relatedDocLinks.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Official Architecture & Engineering References</span>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {selectedArticle.relatedDocLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedArticle.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => { setSelectedArticle(null); setIsBriefingModalOpen(true); }}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all"
              >
                Schedule Technical Review with Architect
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
