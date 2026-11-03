import React, { useState, useEffect } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import {
  X,
  CheckCircle2,
  Save,
  BarChart3,
  Sparkles
} from 'lucide-react';

export const HeroStatsModal: React.FC = () => {
  const {
    isHeroStatsModalOpen,
    setIsHeroStatsModalOpen,
    siteConfig,
    updateHeroStats
  } = useCustomization();

  const [stats, setStats] = useState<Array<{ value: string; label: string }>>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (siteConfig.hero?.stats) {
      setStats(siteConfig.hero.stats.map(s => ({ ...s })));
    }
  }, [siteConfig.hero?.stats, isHeroStatsModalOpen]);

  if (!isHeroStatsModalOpen) return null;

  const handleStatChange = (index: number, field: 'value' | 'label', val: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: val };
    setStats(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroStats(stats);
    setNotification('Hero metrics updated successfully!');
    setTimeout(() => {
      setNotification(null);
      setIsHeroStatsModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        data-theme-container="dark"
        className="dark-card dark-feature-container relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-xs text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Edit Hero Social Proof Metrics
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Adjust quantitative architectural scale, workload migration volume, and financial impact.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHeroStatsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                  Metric #{idx + 1}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                      Value / Number
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                      placeholder="e.g. 14+"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                      Label / Description
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                      placeholder="e.g. Hyperscaler SDDCs Built"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsHeroStatsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Metrics</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
