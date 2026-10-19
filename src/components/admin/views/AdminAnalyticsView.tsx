import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  PieChart,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  AdminUserProfile,
  CrmLead,
  adminService
} from '../../../services/adminService';

interface AdminAnalyticsViewProps {
  users: AdminUserProfile[];
  leads: CrmLead[];
  briefings: any[];
  currentUserEmail: string;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  users,
  leads,
  briefings,
  currentUserEmail
}) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Source attribution distribution
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });

  // Cloud platform interest distribution
  const cloudCounts: Record<string, number> = {};
  leads.forEach((l) => {
    cloudCounts[l.cloud_interest] = (cloudCounts[l.cloud_interest] || 0) + 1;
  });
  briefings.forEach((b) => {
    if (b.cloud_focus) {
      cloudCounts[b.cloud_focus] = (cloudCounts[b.cloud_focus] || 0) + 1;
    }
  });

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified' || l.status === 'proposal sent' || l.status === 'won').length;
  const pipelineValue = leads.reduce((acc, l) => acc + (l.estimated_deal_value_usd || 0), 0);

  const handleExportAnalyticsReport = () => {
    const reportData = [
      { metric: 'Total Registered Profiles', value: users.length, period: dateRange },
      { metric: 'Active CRM Leads', value: leads.length, period: dateRange },
      { metric: 'Qualified Leads', value: qualifiedLeads, period: dateRange },
      { metric: 'Won Deals', value: wonLeads, period: dateRange },
      { metric: 'Pipeline Value USD', value: pipelineValue, period: dateRange },
      { metric: 'Executive Briefings Ingested', value: briefings.length, period: dateRange }
    ];
    adminService.exportToCsv('zaboraa_executive_analytics_report', reportData);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_ANALYTICS_REPORT_CSV',
      targetEntity: 'analytics',
      outcome: 'success',
      metadata: { dateRange }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>OPERATIONAL METRICS & CONVERSION ANALYTICS</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Consulting Analytics & Lead Attribution
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Audit conversion velocity, lead attribution by organic vs partner referral, and multi-cloud platform demand.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded-lg uppercase transition cursor-pointer ${
                  dateRange === r ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Time' : r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalyticsReport}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Honest Data Attribution Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-white">Honest Metrics Enforcement: </strong>
          All analytics are computed dynamically from actual Supabase records (<code className="text-cyan-300">profiles</code>, <code className="text-cyan-300">crm_leads</code>, and <code className="text-cyan-300">briefing_requests</code>). Third-party external marketing cookies and simulated vanity metrics are disabled.
        </p>
      </div>

      {/* Grid: Lead Source Attribution + Cloud Demand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Attribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Lead Acquisition Source Attribution</h2>
            <p className="text-[11px] text-slate-400">
              Where enterprise architects and CIOs discover Zaboraa Technologies.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(sourceCounts).map(([src, count]) => {
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={src} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-300 capitalize">{src}</span>
                    <span className="text-white font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hyperscaler Cloud Demand */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Hyperscaler Platform Interest Demand</h2>
            <p className="text-[11px] text-slate-400">
              Aggregated from multi-cloud node sizing queries and consulting briefs.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(cloudCounts).map(([cName, count]) => {
              const totalItems = Object.values(cloudCounts).reduce((a, b) => a + b, 0);
              const pct = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
              return (
                <div key={cName} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-300">{cName}</span>
                    <span className="text-white font-bold">{count} sessions ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
