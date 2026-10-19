import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  UserCheck,
  Building,
  Mail,
  Phone,
  X,
  FileSpreadsheet
} from 'lucide-react';
import {
  CrmLead,
  LeadStatus,
  LeadPriority,
  LeadSource,
  adminService
} from '../../../services/adminService';

interface AdminCrmViewProps {
  leads: CrmLead[];
  onRefreshLeads: () => void;
  currentUserEmail: string;
}

export const AdminCrmView: React.FC<AdminCrmViewProps> = ({
  leads,
  onRefreshLeads,
  currentUserEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSource, setNewSource] = useState<LeadSource>('direct');
  const [newPriority, setNewPriority] = useState<LeadPriority>('medium');
  const [newCloud, setNewCloud] = useState('Azure AVS');
  const [newVmCount, setNewVmCount] = useState<number>(500);
  const [newDealValue, setNewDealValue] = useState<number>(50000);
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Status updating state
  const [statusNote, setStatusNote] = useState('');

  // Filtering
  const filteredLeads = leads.filter((lead) => {
    const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    const matchSearch =
      !searchTerm ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cloud_interest.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newCompany.trim()) {
      setFormError('Please enter Name, Business Email, and Company.');
      return;
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      setFormError('Please enter a valid business email address.');
      return;
    }

    try {
      await adminService.createLead(
        {
          name: newName.trim(),
          email: newEmail.trim(),
          company: newCompany.trim(),
          phone: newPhone.trim() || null,
          source: newSource,
          status: 'new',
          priority: newPriority,
          assigned_to: 'Wasim Sayyed',
          cloud_interest: newCloud,
          estimated_vm_count: newVmCount,
          estimated_deal_value_usd: newDealValue,
          notes: newNotes.trim() || null,
          follow_up_date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0]
        },
        currentUserEmail
      );

      setIsAddLeadModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewCompany('');
      setNewPhone('');
      setNewNotes('');
      setFormError(null);
      onRefreshLeads();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create lead.');
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    await adminService.updateLeadStatus(leadId, newStatus, currentUserEmail, statusNote);
    setStatusNote('');
    onRefreshLeads();
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({
        ...selectedLead,
        status: newStatus
      });
    }
  };

  const handleExportCsv = () => {
    adminService.exportToCsv('zaboraa_crm_leads', filteredLeads);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_CRM_LEADS_CSV',
      targetEntity: 'crm_leads',
      outcome: 'success',
      metadata: { rowCount: filteredLeads.length }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <Briefcase className="w-3.5 h-3.5" />
            <span>ENTERPRISE CLIENT RELATIONSHIP MANAGEMENT</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Consulting Pipeline & Leads Directory
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Track enterprise workload migrations, qualified node sizing prospects, follow-up dates, and consulting engagement values.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
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
            <span className="text-[11px] text-slate-400 font-mono">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Stages ({leads.length})</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal sent">Proposal Sent</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Company & Lead</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Cloud Scope & Scale</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No CRM leads found matching current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const priorityColors = {
                    urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                    high: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                    low: 'bg-slate-800 text-slate-400 border-slate-700'
                  };

                  const stageColors: Record<LeadStatus, string> = {
                    new: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                    contacted: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                    qualified: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    'proposal sent': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                    won: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    lost: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  };

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {lead.company}
                        </div>
                        <div className="text-[11px] text-slate-400">{lead.name}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>{lead.email}</div>
                        {lead.phone && <div className="text-slate-400">{lead.phone}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{lead.cloud_interest}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {lead.estimated_vm_count} VMs
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ${lead.estimated_deal_value_usd ? (lead.estimated_deal_value_usd / 1000).toFixed(0) + 'k' : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                            stageColors[lead.status] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                            priorityColors[lead.priority]
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-mono cursor-pointer"
                        >
                          Details &rarr;
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

      {/* Selected Lead Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  LEAD RECORD DETAILS
                </span>
                <h2 className="text-lg font-bold text-white">{selectedLead.company}</h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Contact Person</span>
                <span className="font-bold text-white">{selectedLead.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <span className="font-bold text-white truncate block">{selectedLead.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Cloud Focus</span>
                <span className="font-bold text-cyan-300">{selectedLead.cloud_interest}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Estimated Scale</span>
                <span className="font-bold text-white">{selectedLead.estimated_vm_count} VMs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Deal Value (USD)</span>
                <span className="font-bold text-emerald-400">
                  ${selectedLead.estimated_deal_value_usd ? selectedLead.estimated_deal_value_usd.toLocaleString() : '0'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Lead Source</span>
                <span className="font-bold text-white uppercase">{selectedLead.source}</span>
              </div>
            </div>

            {/* Current Stage Switcher */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="font-bold text-white">Advance Lead Stage</div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(['new', 'contacted', 'qualified', 'proposal sent', 'won', 'lost'] as LeadStatus[]).map((stg) => (
                  <button
                    key={stg}
                    onClick={() => handleUpdateStatus(selectedLead.id, stg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer border ${
                      selectedLead.status === stg
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            {selectedLead.notes && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  Technical Architecture Notes
                </div>
                <p className="text-slate-200 leading-relaxed">{selectedLead.notes}</p>
              </div>
            )}

            {/* Activity History */}
            {selectedLead.activity_history && selectedLead.activity_history.length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  Activity & Qualification History
                </div>
                <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-950 border border-slate-800 p-3">
                  {selectedLead.activity_history.map((act, i) => (
                    <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <span className="text-slate-200">{act.action}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {act.author} · {new Date(act.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateLead}
            className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  CRM PIPELINE INGESTION
                </span>
                <h2 className="text-base font-bold text-white">Create New Lead Record</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. FSI Capital"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. David Richardson"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Business Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Phone (Optional)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Target Cloud Platform</label>
                <select
                  value={newCloud}
                  onChange={(e) => setNewCloud(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="Azure AVS">Azure AVS</option>
                  <option value="AWS VMC">AWS VMC</option>
                  <option value="Google GCVE">Google GCVE</option>
                  <option value="Nutanix NC2">Nutanix NC2</option>
                  <option value="NSX Distributed Firewall">NSX Distributed Firewall</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Lead Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as LeadPriority)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="urgent">Urgent (Immediate Project)</option>
                  <option value="high">High (&lt; 60 Days)</option>
                  <option value="medium">Medium (Evaluation)</option>
                  <option value="low">Low (Nurture)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Estimated VM Scale</label>
                <input
                  type="number"
                  value={newVmCount}
                  onChange={(e) => setNewVmCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Estimated Deal Value ($)</label>
                <input
                  type="number"
                  value={newDealValue}
                  onChange={(e) => setNewDealValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-slate-300 font-semibold">Architecture Scope & Requirements</label>
              <textarea
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Details regarding decoupled storage, license consolidation, migration runbooks..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Create Lead
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
