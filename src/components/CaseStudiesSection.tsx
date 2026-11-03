import React from 'react';
import { Link } from 'react-router-dom';
import { CASE_STUDIES } from '../data/caseStudies';
import { Shield, ArrowRight, AlertCircle, Wrench } from 'lucide-react';
import { TiltCard } from './TiltCard';

export const CaseStudiesSection: React.FC = () => {
  return (
    <section id="case-studies" className="py-20 bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 scroll-mt-12 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-sky-700 dark:text-cyan-400 uppercase tracking-wider font-mono">
                Verified Enterprise Track Record
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-mono text-teal-700 dark:text-emerald-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>MIDDLE EAST GOVERNMENT SECTOR</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Standardised Architecture Across 14+ Government Entities
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Real public sector case study featuring repeatable HCX RAV/Bulk wave allocation, decoupled Azure NetApp Files storage, and strict disaster recovery runbooks.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <span>Explore Case Studies Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Anonymisation Notice */}
        <aside className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="font-mono">
            <strong>Confidentiality Notice:</strong> This case study is anonymised and aggregated across multiple engagements.
          </p>
        </aside>

        {/* Case Study Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CASE_STUDIES.map((study) => (
            <TiltCard key={study.slug} maxTilt={3} className="h-full">
              <div className="h-full flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-7 space-y-6 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all shadow-sm hover:shadow-md group relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{study.sector}</span>
                    <span className="text-[11px] font-mono text-slate-400">{study.dateModified}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors leading-snug">
                    <Link to={`/case-studies/${study.slug}`}>
                      {study.h1}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {study.summary}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1 text-xs font-mono">
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Scope & Connectivity:</div>
                    <div className="text-slate-800 dark:text-slate-200">{study.facts.scale} · {study.facts.connectivity}</div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {study.platforms.map((p, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
              </div>
            </TiltCard>
          ))}

          {/* Reproduce with Free Tool Card */}
          <TiltCard maxTilt={3} className="h-full">
            <div className="h-full flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-7 space-y-6 text-white group shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Self-Service Reproduction</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  Reproduce These Sizing & Discovery Steps on Your Estate
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Run client-side RVTools spreadsheet parsing, detect raw device mappings (RDMs) and snapshots, and calculate decoupled Azure NetApp Files host reduction without uploading data to external servers.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-mono text-cyan-300 font-bold uppercase">Included Free Tools:</div>
                  <ul className="text-xs font-mono text-slate-300 space-y-1">
                    <li>&bull; RVTools Migration Readiness Engine</li>
                    <li>&bull; Node & Storage Sizing Estimator</li>
                    <li>&bull; Disaster Recovery RPO/RTO Planner</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                <Link to="/tools" className="inline-flex items-center gap-1.5 hover:underline">
                  <span>Launch Free Tools</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};
