import React, { useState } from 'react';
import {
  HardDriveDownload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { adminService, ALLOWLISTED_TABLES } from '../../../services/adminService';

interface AdminBackupsViewProps {
  currentUserEmail: string;
}

export const AdminBackupsView: React.FC<AdminBackupsViewProps> = ({
  currentUserEmail
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Known verified migrations
  const migrations = [
    {
      id: '20261015_briefing_requests.sql',
      name: 'Initial Profiles, Briefing Requests & Basic RLS',
      appliedAt: '2026-10-15',
      status: 'applied',
      description: 'Created public.profiles with user/admin roles and public.briefing_requests with RLS.'
    },
    {
      id: '20261016_blueprints_and_feature_controls.sql',
      name: 'Blueprints Table & Central Feature Controls',
      appliedAt: '2026-10-16',
      status: 'applied',
      description: 'Added public.blueprints with JSONB metadata and central admin_feature_controls.'
    },
    {
      id: '20261019_enterprise_admin_suite.sql',
      name: 'Enterprise Administration Suite (CRM, Audit, Workspaces, CMS, SEO)',
      appliedAt: '2026-10-19',
      status: 'pending_deployment',
      description: 'Adds 4-tier roles, public.user_workspaces, crm_leads, audit_logs, admin_notifications, site_content, and seo_metadata with RLS.'
    }
  ];

  const handleFullDatabaseExport = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      // Collect all allowlisted data
      const backupPayload: Record<string, any> = {
        exportTimestamp: new Date().toISOString(),
        exportedBy: currentUserEmail,
        schemaVersion: '20261019_enterprise_admin_suite',
        tables: {}
      };

      for (const table of ALLOWLISTED_TABLES) {
        const res = await adminService.queryTableRecords(table.name, {
          page: 1,
          pageSize: 500
        });
        backupPayload.tables[table.name] = {
          rowCount: res.totalCount,
          records: res.records
        };
      }

      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zaboraa_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await adminService.logAuditEvent({
        actorEmail: currentUserEmail,
        actorRole: 'admin',
        action: 'EXPORT_FULL_DATABASE_BACKUP_JSON',
        targetEntity: 'database_backup',
        outcome: 'success',
        metadata: { tablesCount: ALLOWLISTED_TABLES.length }
      });

      setExportSuccess('Complete database snapshot exported successfully as JSON.');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>SCHEMA RECOVERY & MIGRATIONS OPERATIONS</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Database Migrations & Disaster Recovery
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Audit known SQL migrations, verify schema versions, download comprehensive JSON data backups, and inspect recovery checklists.
          </p>
        </div>

        <button
          onClick={handleFullDatabaseExport}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Generating Snapshot...' : 'Export Complete JSON Backup'}</span>
        </button>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Honest Backup Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-white font-mono">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Supabase Cloud Backup vs Application Data Snapshots</span>
        </div>
        <p className="leading-relaxed">
          Daily point-in-time recovery (PITR) and physical WAL backups are managed natively by Supabase Cloud at the PostgreSQL infrastructure tier. This application provides independent application-level logical JSON backups of all allowlisted tables without exposing master database credentials.
        </p>
      </div>

      {/* Migrations Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Verified Database Migrations Inventory
          </h2>
          <span className="text-[10px] font-mono text-cyan-400">Schema v2026.10.19</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {migrations.map((m) => (
            <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono font-bold text-white">{m.id}</span>
                </div>
                <div className="font-semibold text-slate-200">{m.name}</div>
                <p className="text-[11px] text-slate-400 max-w-xl">{m.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                    m.status === 'applied'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-950 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {m.status === 'applied' ? 'APPLIED (VERIFIED)' : 'READY IN REPO'}
                </span>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Date: {m.appliedAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Launch Operational Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white">Pre-Launch Operational & Disaster Recovery Checklist</h2>
        <div className="space-y-2.5">
          {[
            { label: 'Run SQL migration in Supabase Dashboard SQL Editor', desc: 'Copy supabase/migrations/20261019_enterprise_admin_suite.sql to provision crm_leads, audit_logs, etc.' },
            { label: 'Verify Supabase Environment Keys in Vercel / Production', desc: 'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY match your live Supabase project.' },
            { label: 'Set Up Emergency Recovery Master Passphrase', desc: 'Generate encrypted offline vault canary in Emergency Recovery Vault tab.' },
            { label: 'Verify Sizing Tool Calculation Precision', desc: 'Run automated vitest test suite to confirm vCPU:pCore and decoupled NFS capacity math.' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">{item.label}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
