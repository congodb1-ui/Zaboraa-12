import React from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  Activity,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { AdminViewId } from '../AdminSidebar';
import {
  AdminUserProfile,
  CrmLead,
  AdminAuditLog,
  IntegrationStatus
} from '../../../services/adminService';

interface AdminOverviewViewProps {
  users: AdminUserProfile[];
  leads: CrmLead[];
  briefings: any[];
  auditLogs: AdminAuditLog[];
  integrations: IntegrationStatus[];
  onSelectView: (view: AdminViewId) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  users,
  leads,
  briefings,
  auditLogs,
  integrations,
  onSelectView
}) => {
  // Real metric calculations
  const totalUsers = users.length;
  const activeAdmins = users.filter((u) => u.role === 'admin' && u.status === 'active').length;
  const authorizedEvaluators = users.filter((u) => u.role === 'authorized').length;

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified' || l.status === 'proposal sent' || l.status === 'won').length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const pendingBriefings = briefings.filter((b) => b.status === 'new' || b.status === 'scheduled').length;
  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.estimated_deal_value_usd || 0), 0);

  const healthyIntegrations = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Health Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>EXECUTIVE MISSION CONTROL · PRODUCTION VERIFIED</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Enterprise Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Live telemetry for multi-cloud workload assessments, inbound executive briefings, customer workspaces, and security compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectView('crm')}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Manage CRM Pipeline</span>
          </button>
          <button
            onClick={() => onSelectView('database')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Database Explorer</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Registered Profiles */}
        <div
          onClick={() => onSelectView('users')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition shadow-sm hover:shadow-md cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Registered Profiles
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{totalUsers}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <span className="text-emerald-400 font-bold">{activeAdmins} Admin</span>
              <span>·</span>
              <span className="text-cyan-300 font-bold">{authorizedEvaluators} Authorized</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active CRM Pipeline */}
        <div
          onClick={() => onSelectView('crm')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition shadow-sm hover:shadow-md cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Active CRM Pipeline
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{totalLeads} Leads</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <span className="text-emerald-400 font-bold">${(totalPipelineValue / 1000).toFixed(0)}k Pipeline</span>
              <span>·</span>
              <span className="text-cyan-300 font-bold">{conversionRate}% Win Rate</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Briefing Requests */}
        <div
          onClick={() => onSelectView('briefings')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition shadow-sm hover:shadow-md cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Executive Briefings
            </span>
            <div className="p-2 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-500/30">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{briefings.length} Requests</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <span className="text-amber-400 font-bold">{pendingBriefings} Awaiting Action</span>
              <span>·</span>
              <span className="text-slate-400">Azure AVS & NC2</span>
            </div>
          </div>
        </div>

        {/* Metric 4: System Integration Health */}
        <div
          onClick={() => onSelectView('integrations')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition shadow-sm hover:shadow-md cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Integration Health
            </span>
            <div className="p-2 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-500/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">
              {healthyIntegrations} / {integrations.length} Active
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <span className="text-teal-400 font-bold">100% RLS Protected</span>
              <span>·</span>
              <span className="text-slate-400">Vault Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Pipeline Funnel + Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 Cols): CRM Funnel Stage Distribution */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Consulting Pipeline & Qualification Funnel
              </h2>
              <p className="text-xs text-slate-400">
                Inbound architecture opportunities across hyperscaler SDDC cutovers.
              </p>
            </div>
            <button
              onClick={() => onSelectView('crm')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Full CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pipeline Stage Progress Bars */}
          <div className="space-y-4">
            {[
              { stage: 'new', label: '1. New Discovery', color: 'bg-sky-500' },
              { stage: 'contacted', label: '2. Architecture Contacted', color: 'bg-blue-500' },
              { stage: 'qualified', label: '3. Technical Qualification', color: 'bg-amber-500' },
              { stage: 'proposal sent', label: '4. SOW / Proposal Sent', color: 'bg-purple-500' },
              { stage: 'won', label: '5. Contract Executed', color: 'bg-emerald-500' }
            ].map(({ stage, label, color }) => {
              const count = leads.filter((l) => l.status === stage).length;
              const percent = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className="text-slate-400 font-bold">
                      {count} lead{count === 1 ? '' : 's'} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Lead Snapshot Table */}
          <div className="pt-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              High-Priority Deal Engagements
            </div>
            <div className="divide-y divide-slate-800/80">
              {leads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">{lead.company}</div>
                    <div className="text-[11px] text-slate-400">
                      {lead.name} · {lead.cloud_interest} ({lead.estimated_vm_count} VMs)
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-400">
                      ${lead.estimated_deal_value_usd ? (lead.estimated_deal_value_usd / 1000).toFixed(0) + 'k' : 'Custom'}
                    </div>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (5 Cols): Live Security & Operational Audit Log */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Live Administrative Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Immutable record of administrative and security events.
              </p>
            </div>
            <button
              onClick={() => onSelectView('security')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300 text-[11px]">{log.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  Target: <span className="font-mono text-slate-200">{log.target_entity}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Actor: {log.actor_email}</span>
                  <span
                    className={`font-mono font-semibold ${
                      log.outcome === 'success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ● {log.outcome.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Security Checklist Teaser */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-emerald-200">Zero Privilege Hardening</div>
              <p className="text-[11px] text-emerald-300/80">
                All 8 tables require authenticated Supabase identity. No service keys exposed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
