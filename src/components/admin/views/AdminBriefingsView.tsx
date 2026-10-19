import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Mail,
  Building,
  Phone,
  X,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { adminService } from '../../../services/adminService';

interface AdminBriefingsViewProps {
  briefings: any[];
  onRefreshBriefings: () => void;
  currentUserEmail: string;
}

export const AdminBriefingsView: React.FC<AdminBriefingsViewProps> = ({
  briefings,
  onRefreshBriefings,
  currentUserEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cloudFilter, setCloudFilter] = useState<string>('all');
  const [selectedBriefing, setSelectedBriefing] = useState<any | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const filteredBriefings = briefings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchCloud = cloudFilter === 'all' || b.cloud_focus === cloudFilter;
    const matchSearch =
      !searchTerm ||
      (b.company && b.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.cloud_focus && b.cloud_focus.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchCloud && matchSearch;
  });

  const handleUpdateStatus = async (briefingId: string, newStatus: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('briefing_requests')
          .update({
            status: newStatus,
            notes: notesDraft || selectedBriefing?.notes || undefined
          })
          .eq('id', briefingId);
      } catch (e) {
        console.warn('Notice updating briefing in Supabase:', e);
      }
    }

    await adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'UPDATE_BRIEFING_STATUS',
      targetEntity: 'briefing_requests',
      targetId: briefingId,
      outcome: 'success',
      metadata: { new_status: newStatus }
    });

    onRefreshBriefings();
    if (selectedBriefing && selectedBriefing.id === briefingId) {
      setSelectedBriefing({ ...selectedBriefing, status: newStatus, notes: notesDraft || selectedBriefing.notes });
    }
  };

  const handleExportCsv = () => {
    adminService.exportToCsv('zaboraa_briefing_requests', filteredBriefings);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_BRIEFINGS_CSV',
      targetEntity: 'briefing_requests',
      outcome: 'success',
      metadata: { count: filteredBriefings.length }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>INBOUND EXECUTIVE CONSULTING INQUIRIES</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Architecture Briefing Requests
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Inbound executive sessions covering decoupled storage economics, VMware license optimization, and hyperscaler cutover timelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Briefings CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, name, email, platform..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Statuses ({briefings.length})</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Cloud Focus Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Platform:</span>
            <select
              value={cloudFilter}
              onChange={(e) => setCloudFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Platforms</option>
              <option value="Azure AVS">Azure AVS</option>
              <option value="AWS VMC">AWS VMC</option>
              <option value="Google GCVE">Google GCVE</option>
              <option value="Nutanix NC2">Nutanix NC2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Briefings Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Company & Lead</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Cloud Scope</th>
                <th className="py-3 px-4">VM Scale & Urgency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBriefings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No briefing requests found matching current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredBriefings.map((b) => {
                  const statusColors: Record<string, string> = {
                    new: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                    contacted: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                    scheduled: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    archived: 'bg-slate-800 text-slate-400 border-slate-700'
                  };

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => {
                        setSelectedBriefing(b);
                        setNotesDraft(b.notes || '');
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {b.company}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.name}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{b.email}</div>
                        {b.phone && <div className="text-slate-400">{b.phone}</div>}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {b.cloud_focus}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-white">{b.vm_scale}</div>
                        <div className="text-slate-400 text-[10px]">{b.urgency}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                            statusColors[b.status] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBriefing(b);
                            setNotesDraft(b.notes || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-mono cursor-pointer"
                        >
                          View &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Briefing Modal */}
      {selectedBriefing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                  EXECUTIVE BRIEFING DOSSIER
                </span>
                <h2 className="text-base font-bold text-white">{selectedBriefing.company}</h2>
              </div>
              <button
                onClick={() => setSelectedBriefing(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Contact</span>
                <span className="text-white font-bold">{selectedBriefing.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Email</span>
                <span className="text-white truncate block">{selectedBriefing.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Phone</span>
                <span className="text-white">{selectedBriefing.phone || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Target Platform</span>
                <span className="text-cyan-300 font-bold">{selectedBriefing.cloud_focus}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">VM Scale</span>
                <span className="text-white font-bold">{selectedBriefing.vm_scale}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Timeline Urgency</span>
                <span className="text-amber-300 font-bold">{selectedBriefing.urgency}</span>
              </div>
            </div>

            {/* Status Switcher */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="font-bold text-white">Briefing Session Status</div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['new', 'contacted', 'scheduled', 'completed', 'archived'].map((stg) => (
                  <button
                    key={stg}
                    onClick={() => handleUpdateStatus(selectedBriefing.id, stg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer border ${
                      selectedBriefing.status === stg
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Technical Agenda */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold font-mono">
                Architectural Notes & Scope Details:
              </label>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Session agenda, sizing details, node class decisions..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  void adminService.createLead(
                    {
                      name: selectedBriefing.name,
                      email: selectedBriefing.email,
                      company: selectedBriefing.company,
                      phone: selectedBriefing.phone,
                      source: 'briefing_form',
                      status: 'qualified',
                      priority: 'urgent',
                      assigned_to: 'Wasim Sayyed',
                      cloud_interest: selectedBriefing.cloud_focus,
                      estimated_vm_count: 1000,
                      estimated_deal_value_usd: 120000,
                      notes: `Imported from briefing request: ${notesDraft || selectedBriefing.notes || ''}`
                    },
                    currentUserEmail
                  );
                  setSelectedBriefing(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Promote to CRM Deal</span>
              </button>

              <button
                onClick={() => setSelectedBriefing(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
