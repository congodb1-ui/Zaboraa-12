import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCaseStudyBySlug, CASE_STUDIES } from '../data/caseStudies';
import { NotFoundPage } from './NotFoundPage';
import { CaseDiagram } from '../components/case-studies/CaseDiagram';
import { useCustomization } from '../context/CustomizationContext';
import {
  Shield,
  Calendar,
  ArrowRight,
  ChevronDown,
  Layers,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const CaseStudyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudyBySlug(slug) : undefined;
  const { setIsBriefingModalOpen } = useCustomization();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!study) {
    return <NotFoundPage />;
  }

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const canonicalUrl = `https://zaboraa.com/case-studies/${study.slug}`;

  // Structured Data
  const jsonLdTechArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': study.h1,
    'description': study.metaDescription,
    'datePublished': study.datePublished,
    'dateModified': study.dateModified,
    'author': {
      '@type': 'Person',
      'name': 'Wasim Sayyed',
      'jobTitle': 'Principal VMware Architect',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Pune',
        'addressRegion': 'Maharashtra',
        'addressCountry': 'IN'
      },
      'sameAs': 'https://www.linkedin.com/in/wasim-sayyed-8b857714b/'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Zaboraa',
      'url': 'https://zaboraa.com',
      'logo': 'https://zaboraa.com/assets/images/zaboraa-logo.png'
    },
    'about': study.platforms,
    'keywords': study.keywords.join(', ')
  };

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://zaboraa.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Case Studies',
        'item': 'https://zaboraa.com/case-studies'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': study.title,
        'item': canonicalUrl
      }
    ]
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': study.faq.map((f) => ({
      '@type': 'Question',
      'name': f.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.answer
      }
    }))
  };

  const relatedStudies = study.relatedSlugs && study.relatedSlugs.length > 0
    ? study.relatedSlugs.map((s) => CASE_STUDIES.find((cs) => cs.slug === s)).filter((cs): cs is typeof CASE_STUDIES[0] => Boolean(cs)).slice(0, 2)
    : CASE_STUDIES.filter((cs) => cs.slug !== study.slug).slice(0, 2);

  return (
    <>
      {/* React 19 Native Head Hoisting */}
      <title>{study.metaTitle}</title>
      <meta name="description" content={study.metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={study.metaTitle} />
      <meta property="og:description" content={study.metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={study.metaTitle} />
      <meta name="twitter:description" content={study.metaDescription} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTechArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <article className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/case-studies" className="hover:text-cyan-400 transition-colors">Case Studies</Link>
          <span>/</span>
          <span className="text-cyan-300 truncate max-w-xs">{study.title}</span>
        </nav>

        {/* 2. Header & H1 */}
        <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
            <Shield className="w-3.5 h-3.5" />
            <span>{study.sector}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {study.h1}
          </h1>

          {/* 3. Byline */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>By <strong className="text-slate-700 dark:text-slate-200">Wasim Sayyed</strong>, Principal VMware Architect, Pune</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>Updated: <time dateTime={study.dateModified}>{study.dateModified}</time></span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500">Notice: Broadcom has rebranded Aria under VCF Operations/Automation.</span>
          </div>
        </header>

        {/* 4. Engagement Facts Card */}
        <section aria-labelledby="facts-card-heading" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-6 sm:p-7 shadow-sm space-y-4">
          <h2 id="facts-card-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
            Engagement Baseline & Delivery Scope
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1 p-3 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Sector</span>
              <div className="font-semibold text-slate-900 dark:text-white">{study.facts.sector}</div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Estate Scale</span>
              <div className="font-semibold text-slate-900 dark:text-white">{study.facts.scale}</div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Platforms</span>
              <div className="font-semibold text-slate-900 dark:text-white">{study.facts.platforms}</div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Connectivity</span>
              <div className="font-semibold text-slate-900 dark:text-white">{study.facts.connectivity}</div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 sm:col-span-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Architectural Role</span>
              <div className="font-semibold text-slate-900 dark:text-white">{study.facts.role}</div>
            </div>
          </div>
        </section>

        {/* 5. Anonymisation Notice */}
        <aside className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-mono">
            <strong>Confidentiality Notice:</strong> This case study is anonymised and aggregated across multiple engagements.
          </p>
        </aside>

        {/* 6. Table of Contents */}
        <nav aria-label="Table of contents" className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs space-y-3">
          <div className="font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Table of Contents
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 font-mono">
            {study.sections.map((sec, idx) => {
              const anchor = `section-${idx + 1}`;
              return (
                <li key={idx}>
                  <a href={`#${anchor}`} className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 truncate">
                    <span className="text-cyan-500">#</span>
                    <span>{sec.heading}</span>
                  </a>
                </li>
              );
            })}
            <li>
              <a href="#case-diagram" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <span className="text-cyan-500">#</span>
                <span>Hybrid Transit Architecture Diagram</span>
              </a>
            </li>
            <li>
              <a href="#lessons-learned" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <span className="text-cyan-500">#</span>
                <span>Key Lessons Learned</span>
              </a>
            </li>
            <li>
              <a href="#reproduce-step" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <span className="text-cyan-500">#</span>
                <span>Reproduce This On Your Estate</span>
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <span className="text-cyan-500">#</span>
                <span>Frequently Asked Questions</span>
              </a>
            </li>
          </ol>
        </nav>

        {/* 7. Body Sections */}
        <div className="space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {study.sections.map((sec, idx) => {
            const anchor = `section-${idx + 1}`;
            return (
              <section key={idx} id={anchor} className="space-y-4 scroll-mt-20">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">
                  {sec.heading}
                </h2>
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}

                {sec.table && (
                  <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono uppercase">
                        <tr>
                          {sec.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-4 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                        {sec.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-3 align-top text-slate-700 dark:text-slate-300">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {sec.subsections && sec.subsections.map((sub, subIdx) => (
                  <div key={subIdx} className="space-y-3 pt-3 pl-3 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {sub.heading}
                    </h3>
                    {sub.body.map((subP, subPIdx) => (
                      <p key={subPIdx}>{subP}</p>
                    ))}
                    {sub.table && (
                      <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono uppercase">
                            <tr>
                              {sub.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4 py-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {sub.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-3 align-top text-slate-700 dark:text-slate-300">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            );
          })}
        </div>

        {/* 8. Architectural Diagram */}
        <section id="case-diagram" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">
            Target Hybrid Network & Wave Architecture
          </h2>
          <CaseDiagram id={study.diagram} />
        </section>

        {/* 9. Lessons Learned */}
        <section id="lessons-learned" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">
            Key Lessons Learned
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {study.lessonsLearned.map((lesson, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-2">
                <div className="flex items-center gap-2 text-teal-600 dark:text-emerald-400 font-mono text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>LESSON 0{idx + 1}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Reproduce This on Your Estate */}
        <section id="reproduce-step" className="space-y-4 scroll-mt-20">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reproduce This on Your Estate
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Run the exact discovery, host calculation, and disaster recovery modeling steps described above using free browser-based tools. All calculations execute locally on your machine with zero server storage.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {study.relatedTools.map((tool, idx) => (
              <Link
                key={idx}
                to={tool.path}
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-600 dark:text-cyan-400">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Free Tool</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-300 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 underline">
                  Launch step &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 11. Related Disciplines */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Related Architecture Disciplines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {study.relatedDisciplines.map((disc, idx) => (
              <Link
                key={idx}
                to={disc.path}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Discipline</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-300 transition-colors">
                    {disc.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {disc.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
              </Link>
            ))}
          </div>
        </section>

        {/* 12. Related Case Studies */}
        {relatedStudies.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Related Case Studies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedStudies.map((rel, idx) => (
                <Link
                  key={idx}
                  to={`/case-studies/${rel.slug}`}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500/50 transition-all group"
                >
                  <span className="text-[10px] font-mono uppercase text-cyan-500">{rel.sector}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-300 mt-1">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rel.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 13. FAQ Accordion (full text rendered statically for prerender/crawlers) */}
        <section id="faq" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {study.faq.map((f, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-slate-900 dark:text-white hover:text-cyan-400 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{f.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Notice: in HTML/DOM, content is accessible to crawlers and toggled in interactive browser */}
                  <div className={`px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3 ${isOpen ? 'block' : 'hidden sm:block'}`}>
                    <p>{f.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 14. CTA: Book Briefing */}
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 text-center space-y-4 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Plan Your VMware Cloud Architecture with Wasim Sayyed
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Direct executive advisory covering government compliance boundaries, HCX RAV/Bulk wave allocation, decoupled storage sizing, and private cloud networking.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsBriefingModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Architecture Briefing</span>
              </button>
            </div>
          </div>
        </section>
      </article>
    </>
  );
};
