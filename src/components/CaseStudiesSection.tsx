import React from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { Shield, CheckCircle2, ArrowRight, Plus, Edit3, Trash2 } from 'lucide-react';
import { TiltCard } from './TiltCard';

export const CaseStudiesSection: React.FC = () => {
  const {
    siteConfig,
    setIsBriefingModalOpen,
    isAdmin,
    setIsTrackRecordModalOpen,
    setActiveEditCaseStudy,
    deleteCaseStudy
  } = useCustomization();

  const handleEditStudy = (study: any) => {
    setActiveEditCaseStudy(study);
    setIsTrackRecordModalOpen(true);
  };

  const handleCreateNew = () => {
    setActiveEditCaseStudy(null);
    setIsTrackRecordModalOpen(true);
  };

  const handleDeleteStudy = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the track record "${title}"?`)) {
      deleteCaseStudy(id);
    }
  };

  return (
    <section id="case-studies" className="py-20 bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 scroll-mt-12 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header with Admin Add Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-sky-700 dark:text-cyan-400 uppercase tracking-wider font-mono">
                Verified Enterprise Track Record
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-mono text-teal-700 dark:text-emerald-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>100% PRODUCTION VERIFIED</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              When The Stakes Are Highest, Architecture Has To Hold.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Real enterprise case studies featuring zero unplanned downtime cutovers, sovereign multi-cloud deployments, and multi-petabyte database migrations under strict banking and healthcare regulatory compliance.
            </p>
          </div>

          {/* Admin Authoring Trigger */}
          {isAdmin && (
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Enterprise Case Study</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Case Study Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(siteConfig.caseStudies || []).map((study) => (
            <TiltCard key={study.id} maxTilt={4} className="h-full">
              <div
                className="h-full flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-7 space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Bar: Sector & Status / Admin Controls */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-sky-700 dark:text-cyan-400 font-mono text-[11px] truncate max-w-[180px]">{study.sector}</span>

                    {isAdmin ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditStudy(study)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                          title="Edit this track record"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudy(study.id, study.title)}
                          className="p-1 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-300 transition-colors cursor-pointer"
                          title="Delete track record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-teal-800 dark:text-emerald-400 font-mono text-[11px] px-2 py-0.5 rounded bg-teal-50 dark:bg-emerald-950/80 border border-teal-200 dark:border-emerald-500/30 flex items-center gap-1">
                        <span>{study.verifiedBadge || 'VERIFIED'}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-700 dark:group-hover:text-cyan-300 transition-colors">
                    {study.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {study.summary}
                  </p>

                  {/* Concrete Quantitative Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Workload Scale</div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">{study.metrics.vms}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Downtime</div>
                      <div className="text-sm font-bold font-mono text-teal-700 dark:text-emerald-400 mt-0.5">{study.metrics.downtime}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase font-mono">TCO Impact</div>
                      <div className="text-sm font-bold font-mono text-sky-700 dark:text-cyan-300 mt-0.5">{study.metrics.costReduction}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Delivery Window</div>
                      <div className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5">{study.metrics.timeline}</div>
                    </div>
                  </div>

                  {/* Architectural Key Solutions */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Engineering Solution
                    </div>
                    <ul className="space-y-2">
                      {study.architectureSolution.map((sol, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                          <span>{sol}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setIsBriefingModalOpen(true)}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-cyan-300 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Request Full Architecture Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};
