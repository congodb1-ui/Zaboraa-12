import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { TutorialArticle, TutorialSection } from '../types/siteData';
import { NotFoundPage } from './NotFoundPage';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Calendar,
  Clock,
  Share2,
  Terminal,
  Shield,
  Layers,
  FileText,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const TutorialDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { siteConfig, setIsBriefingModalOpen } = useCustomization();
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const rawTutorials: TutorialArticle[] = siteConfig.tutorials || [];
  const tutorial = rawTutorials.find(
    (t) => (t.slug || t.id).toLowerCase() === (slug || '').toLowerCase()
  );

  if (!tutorial) {
    return <NotFoundPage />;
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const otherTutorials = rawTutorials
    .filter((t) => (t.slug || t.id).toLowerCase() !== (tutorial.slug || tutorial.id).toLowerCase())
    .slice(0, 3);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/resources" className="hover:text-cyan-400 transition-colors">Resources</Link>
        <span>/</span>
        <Link to="/resources/tutorials" className="hover:text-cyan-400 transition-colors">Tutorials</Link>
        <span>/</span>
        <span className="text-cyan-400 truncate max-w-xs">{tutorial.title}</span>
      </nav>

      {/* Tutorial Header */}
      <div className="space-y-4 border-b border-slate-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 font-mono text-xs font-semibold">
            {tutorial.provider}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs">
            {tutorial.category}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-400 font-mono text-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{tutorial.readTime}</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-400 font-mono text-xs">
            {tutorial.difficulty}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
          {tutorial.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          {tutorial.summary}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tutorial.author.name} · {tutorial.author.title}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{tutorial.publishedDate}</span>
            </span>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Guide'}</span>
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {tutorial.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Prerequisites Checklist */}
      {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
        <section className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h2 className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Deployment Prerequisites & Validation</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {tutorial.prerequisites.map((prereq, pIdx) => (
              <li key={pIdx} className="flex items-start gap-2.5">
                <span className="text-cyan-400 mt-1 shrink-0">✓</span>
                <span>{prereq}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tutorial Sections */}
      <div className="space-y-8">
        {(tutorial.sections || []).map((section: TutorialSection, sIdx: number) => (
          <section
            key={sIdx}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {section.heading}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>

            {/* Code Block */}
            {section.codeBlock && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mt-3">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
                  <span className="uppercase text-cyan-400 font-semibold">{section.codeBlock.language}</span>
                  <button
                    onClick={() => handleCopyCode(section.codeBlock!.code, `sec-code-${sIdx}`)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {copiedCodeId === `sec-code-${sIdx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre">
                  <code>{section.codeBlock.code}</code>
                </pre>
              </div>
            )}

            {/* Callout */}
            {section.callout && (
              <aside
                className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-1 ${
                  section.callout.type === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : section.callout.type === 'tip'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider">
                  {section.callout.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : section.callout.type === 'tip' ? (
                    <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <span>{section.callout.title}</span>
                </div>
                <p className="pl-6 text-slate-200/90">{section.callout.text}</p>
              </aside>
            )}
          </section>
        ))}
      </div>

      {/* Related Resources & CTAs */}
      <div className="pt-8 border-t border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white">More Step-by-Step Architecture Tutorials</h2>
          <Link
            to="/resources/tutorials"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All Tutorials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otherTutorials.map((tut) => (
            <Link
              key={tut.id}
              to={`/resources/tutorials/${tut.slug || tut.id}`}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all group block space-y-2"
            >
              <div className="text-[11px] font-mono text-cyan-400 font-semibold">{tut.provider}</div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-2">
                {tut.title}
              </div>
              <div className="text-[11px] font-mono text-slate-400">{tut.readTime}</div>
            </Link>
          ))}
        </div>

        {/* Advisory Consultation Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Principal Architecture Advisory
            </div>
            <div className="text-base font-bold text-white">
              Planning a Critical Workload Migration?
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Engage Wasim Sayyed for full-lifecycle target architecture validation, replication mesh design, and non-disruptive cutover orchestration.
            </p>
          </div>
          <button
            onClick={() => setIsBriefingModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
          >
            Book Architecture Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
