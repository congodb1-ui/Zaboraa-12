import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { KnowledgeBaseArticle, KBSolutionStep } from '../types/siteData';
import { NotFoundPage } from './NotFoundPage';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  Share2,
  Terminal,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Wrench,
  Search
} from 'lucide-react';

export const KBDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { siteConfig, setIsBriefingModalOpen } = useCustomization();
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [copiedFullRunbook, setCopiedFullRunbook] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const rawArticles: KnowledgeBaseArticle[] = siteConfig.knowledgeBase || [];
  const article = rawArticles.find(
    (a) => a.id.toLowerCase() === (id || '').toLowerCase()
  );

  if (!article) {
    return <NotFoundPage />;
  }

  const handleCopyCode = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(snippetId);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleCopyFullRunbook = () => {
    const markdown = `# ${article.id}: ${article.title}
Component: ${article.component}
Category: ${article.serviceCategory}
Severity: ${article.severity}
Status: ${article.status}
Last Updated: ${article.lastUpdated}

## Architecture Advisory Note
${article.architectNote || 'None'}

## Symptoms & Trigger Conditions
${(article.symptoms || []).map((s) => `- ${s}`).join('\n')}

## Root Cause & Failure Domain Analysis
${article.rootCause || 'N/A'}

## Impact Scope & Workload Vulnerability
${article.impactScope || 'N/A'}

## Step-by-Step Resolution Runbook
${(article.resolutionSteps || [])
  .map(
    (step: KBSolutionStep) =>
      `### Step ${step.stepNumber}: ${step.title}\n${step.description}${
        step.codeSnippet ? `\n\`\`\`bash\n${step.codeSnippet}\n\`\`\`` : ''
      }`
  )
  .join('\n\n')}

## Verification & Health Check
${article.verificationCheck || 'N/A'}

## Rollback & Failure Recovery Procedure
${article.rollbackProcedure || 'N/A'}
`;
    navigator.clipboard.writeText(markdown);
    setCopiedFullRunbook(true);
    setTimeout(() => setCopiedFullRunbook(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Related articles in same component or category
  const relatedArticles = rawArticles
    .filter((a) => a.id !== article.id && (a.component === article.component || a.serviceCategory === article.serviceCategory))
    .slice(0, 3);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/resources" className="hover:text-cyan-400 transition-colors">Resources</Link>
        <span>/</span>
        <Link to="/resources/kb" className="hover:text-cyan-400 transition-colors">Knowledge Base</Link>
        <span>/</span>
        <span className="text-cyan-400 truncate max-w-xs">{article.id}</span>
      </nav>

      {/* Article Header */}
      <div className="space-y-4 border-b border-slate-800 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 font-mono text-xs font-semibold">
            {article.id}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs">
            {article.component}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-400 font-mono text-xs">
            {article.serviceCategory}
          </span>
          <span
            className={`px-2.5 py-1 rounded font-mono text-xs font-semibold ${
              article.severity === 'Critical'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                : article.severity === 'Major'
                ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
            }`}
          >
            {article.severity} Severity
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Updated: {article.lastUpdated}</span>
            </span>
            <span>·</span>
            <span>By Wasim Sayyed, Principal VMware Architect</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handleCopyFullRunbook}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              {copiedFullRunbook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFullRunbook ? 'Copied Full Markdown' : 'Copy Full Runbook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Architect Note Callout */}
      {article.architectNote && (
        <aside className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm leading-relaxed space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Architecture Advisory Note</span>
          </div>
          <p className="pl-6 text-xs sm:text-sm text-amber-200/90">{article.architectNote}</p>
        </aside>
      )}

      {/* Diagnostic Context: Symptoms, Root Cause, Impact Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptoms */}
        <section className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h2 className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Symptoms & Trigger Conditions</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            {(article.symptoms || []).map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 mt-1 shrink-0">•</span>
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Impact Scope */}
        <section className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h2 className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Impact Scope & Vulnerability</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {article.impactScope || 'Applies to enterprise environments undergoing active migration and network extension.'}
          </p>
        </section>
      </div>

      {/* Root Cause Analysis */}
      <section className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <h2 className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Root Cause & Failure Domain Analysis</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {article.rootCause || 'Detailed in resolution runbook steps below.'}
        </p>
      </section>

      {/* Step-by-Step Resolution Runbook */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>Step-by-Step Resolution Runbook</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {(article.resolutionSteps || []).length} Actions
          </span>
        </div>

        <div className="space-y-4">
          {(article.resolutionSteps || []).map((step: KBSolutionStep, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400 font-mono text-xs font-bold shrink-0">
                    {step.stepNumber || idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {step.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-10">
                {step.description}
              </p>

              {step.codeSnippet && (
                <div className="ml-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>CLI / PowerCLI Script</span>
                    <button
                      onClick={() => handleCopyCode(step.codeSnippet!, `step-${idx}`)}
                      className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                    >
                      {copiedSnippetId === `step-${idx}` ? (
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
                  <pre className="p-3 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre">
                    <code>{step.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Verification & Rollback Procedures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {article.verificationCheck && (
          <section className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <h2 className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verification & Health Check</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              {article.verificationCheck}
            </p>
          </section>
        )}

        {article.rollbackProcedure && (
          <section className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
            <h2 className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Rollback & Recovery Procedure</span>
            </h2>
            <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
              {article.rollbackProcedure}
            </p>
          </section>
        )}
      </div>

      {/* Related Resources & Advisory CTA */}
      <div className="pt-8 border-t border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white">Related Technical Runbooks</h2>
          <Link
            to="/resources/kb"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All 18 Knowledge Base Runbooks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.id}
              to={`/resources/kb/${rel.id.toLowerCase()}`}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all group block space-y-2"
            >
              <div className="text-[11px] font-mono text-cyan-400 font-semibold">{rel.id}</div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-2">
                {rel.title}
              </div>
              <div className="text-[11px] font-mono text-slate-400">{rel.component}</div>
            </Link>
          ))}
        </div>

        {/* Advisory Consultation Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Founder-Led Architecture Consultation
            </div>
            <div className="text-base font-bold text-white">
              Facing Complex Network Extension or Cutover Anomalies?
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Schedule a confidential engineering briefing with Wasim Sayyed, Principal VMware Architect. Review underlay packet routes, MTU boundaries, and HCX service mesh topologies.
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
