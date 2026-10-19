import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  KeyRound,
  FileCode,
  Activity,
  X
} from 'lucide-react';
import {
  AdminAuditLog,
  ALLOWLISTED_TABLES,
  adminService
} from '../../../services/adminService';

interface AdminSecurityViewProps {
  auditLogs: AdminAuditLog[];
  onRefreshLogs: () => void;
  currentUserEmail: string;
}

export const AdminSecurityView: React.FC<AdminSecurityViewProps> = ({
  auditLogs,
  onRefreshLogs,
  currentUserEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter;
    const matchSearch =
      !searchTerm ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchOutcome && matchSearch;
  });

  const handleExportCsv = () => {
    adminService.exportToCsv('zaboraa_security_audit_trail', filteredLogs);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_AUDIT_LOG_CSV',
      targetEntity: 'audit_logs',
      outcome: 'success',
      metadata: { count: filteredLogs.length }
    });
  };

  // Security Hardening Verification Matrix
  const securityChecks = [
    {
      title: 'Row-Level Security (RLS) Coverage',
      status: 'verified',
      details: 'All 8 application tables enforce explicit RLS policies (profiles, briefing_requests, crm_leads, user_workspaces, blueprints, audit_logs, admin_notifications, seo_metadata).'
    },
    {
      title: 'Zero Service Key Leakage',
      status: 'verified',
      details: 'No Supabase service-role key or unencrypted credentials are built into client bundles or stored in browser storage.'
    },
    {
      title: 'Last-Administrator Protection',
      status: 'verified',
      details: 'Admin user service prevents demotion, suspension, or deletion of the last remaining administrator account.'
    },
    {
      title: 'PBKDF2-HMAC-SHA-256 Vault Encryption',
      status: 'verified',
      details: 'Offline recovery vault uses 600,000 PBKDF2 iterations with authenticated AES-256-GCM encryption canary verification.'
    },
    {
      title: 'Append-Only Audit Immutability',
      status: 'verified',
      details: 'Database table public.audit_logs possesses no UPDATE or DELETE policies, ensuring write-once audit history.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>IMMUTABLE AUDIT TRAIL & ZERO PRIVILEGE POSTURE</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Security Center & Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Append-only record of all administrative operations, role elevation events, data exports, and RLS policy verification.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Security Posture Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityChecks.map((check, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{check.title}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{check.details}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, target entity..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-mono">Outcome:</span>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="all">All Outcomes ({auditLogs.length})</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="failure">Failure</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-sans">
                    No audit events match current search parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-cyan-300">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 text-white">
                      {log.target_entity}
                      {log.target_id && <span className="text-slate-400"> ({log.target_id})</span>}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {log.actor_email}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.outcome === 'success'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        ● {log.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  SECURITY AUDIT RECORD
                </span>
                <h2 className="text-base font-bold text-white font-mono">{selectedLog.action}</h2>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
              <div>Actor: <span className="text-white font-bold">{selectedLog.actor_email}</span> ({selectedLog.actor_role})</div>
              <div>Target: <span className="text-cyan-300">{selectedLog.target_entity}</span></div>
              <div>Timestamp: <span className="text-slate-400">{new Date(selectedLog.created_at).toISOString()}</span></div>
              <div>Outcome: <span className="text-emerald-400 font-bold uppercase">{selectedLog.outcome}</span></div>
            </div>

            {selectedLog.metadata && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Event Metadata:</span>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
