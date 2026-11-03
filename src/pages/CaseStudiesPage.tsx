import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CASE_STUDIES } from '../data/caseStudies';
import { useCustomization } from '../context/CustomizationContext';
import {
  Shield,
  Calendar,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronRight
} from 'lucide-react';

export const CaseStudiesPage: React.FC = () => {
  const { setIsBriefingModalOpen } = useCustomization();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filterChips = [
    { label: 'All Platforms', value: 'ALL' },
    { label: 'AVS', value: 'AVS' },
    { label: 'GCVE', value: 'GCVE' },
    { label: 'VMC', value: 'VMC' },
    { label: 'DR', value: 'DR' },
    { label: 'NSX', value: 'NSX' },
    { label: 'Aria', value: 'Aria' }
  ];

  const filteredStudies = CASE_STUDIES.filter((study) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'AVS') return study.platforms.some((p) => p.includes('AVS') || p.includes('Azure'));
    if (selectedFilter === 'GCVE') return study.platforms.some((p) => p.includes('GCVE') || p.includes('Google'));
    if (selectedFilter === 'VMC') return study.platforms.some((p) => p.includes('VMC') || p.includes('AWS'));
    if (selectedFilter === 'DR') return study.platforms.some((p) => p.includes('DR') || p.includes('Disaster'));
    if (selectedFilter === 'NSX') return study.platforms.some((p) => p.includes('NSX'));
    if (selectedFilter === 'Aria') return study.platforms.some((p) => p.includes('Aria') || p.includes('vRNI'));
    return true;
  });

  const canonicalUrl = 'https://zaboraa.com/case-studies';

  const jsonLdHub = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Case Studies: VMware Migrations, DR and Automation for Middle East Government Entities',
    'url': canonicalUrl,
    'description': 'Real-world VMware migration and disaster recovery frameworks across Middle East government entities to Azure VMware Solution.',
    'publisher': {
      '@type': 'Organization',
      'name': 'Zaboraa',
      'url': 'https://zaboraa.com',
      'logo': 'https://zaboraa.com/assets/images/zaboraa-logo.png'
    }
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
        'item': canonicalUrl
      }
    ]
  };

  return (
    <>
      {/* React 19 Native Head Hoisting */}
      <title>Enterprise Case Studies & Architecture Outcomes — Zaboraa</title>
      <meta
        name="description"
        content="VMware migration and DR case studies for Middle East government entities: Azure VMware Solution frameworks, HCX RAV/Bulk wave allocation, and ANF storage."
      />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content="Enterprise Case Studies & Architecture Outcomes — Zaboraa" />
      <meta property="og:description" content="VMware migration and DR case studies for Middle East government entities to Azure VMware Solution." />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Enterprise Case Studies — Zaboraa" />
      <meta name="twitter:description" content="VMware migration and DR case studies for Middle East government entities." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHub) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />

      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-cyan-300">Case Studies</span>
        </nav>

        {/* Page Header */}
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
            <Shield className="w-3.5 h-3.5" />
            <span>MIDDLE EAST GOVERNMENT SECTOR</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Case Studies: VMware Migrations, DR and Automation for Middle East Government Entities
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Standardised migration architectures and cutover strategies developed across 14+ government entities moving VMware estates to hyperscaler software-defined datacenters.
          </p>

          {/* Anonymisation Notice */}
          <aside className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="font-mono">
              <strong>Notice:</strong> This case study is anonymised and aggregated across multiple engagements.
            </p>
          </aside>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Note: Broadcom has rebranded VMware Aria under VCF Operations and Automation.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Platform Filter:</span>
          </div>
          {filterChips.map((chip) => {
            const isActive = selectedFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setSelectedFilter(chip.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies.map((study) => (
            <article
              key={study.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-7 space-y-6 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all shadow-sm hover:shadow-lg group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{study.sector}</span>
                  <span className="text-[11px] font-mono text-slate-500">{study.dateModified}</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors leading-snug">
                  <Link to={`/case-studies/${study.slug}`}>
                    {study.h1}
                  </Link>
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {study.summary}
                </p>

                {/* Key Facts Pill */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1 text-xs font-mono">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Scale & Connectivity:</div>
                  <div className="text-slate-800 dark:text-slate-200">{study.facts.scale} · {study.facts.connectivity}</div>
                </div>

                {/* Platforms Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {study.platforms.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-300">
                <Link to={`/case-studies/${study.slug}`} className="inline-flex items-center gap-1.5 hover:underline">
                  <span>Read Full Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}

          {filteredStudies.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-3">
              <Layers className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Published Case Studies for {selectedFilter} Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Case studies for {selectedFilter} engagements are currently being anonymised and formatted under Prompt 2 and 3 guidelines.
              </p>
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className="mt-2 text-xs font-mono text-cyan-500 underline cursor-pointer"
              >
                Reset to All Platforms
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">
              Facing an Upcoming VMware Cloud Migration or DR Mandate?
            </h2>
            <p className="text-xs text-slate-300">
              Schedule a confidential architecture briefing directly with Lead Principal Architect Wasim Sayyed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBriefingModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Architecture Briefing</span>
          </button>
        </div>
      </div>
    </>
  );
};
