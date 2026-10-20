import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Download,
  Calendar,
  X
} from 'lucide-react';
import {
  AdminUserProfile,
  AdminUserRole,
  AccountStatus,
  adminService
} from '../../../services/adminService';

interface AdminUsersViewProps {
  users: AdminUserProfile[];
  onRefreshUsers: () => void;
  currentUserEmail: string;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  onRefreshUsers,
  currentUserEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null);

  // Modals
  const [roleModalUser, setRoleModalUser] = useState<AdminUserProfile | null>(null);
  const [targetRole, setTargetRole] = useState<AdminUserRole>('authorized');
  const [suspendModalUser, setSuspendModalUser] = useState<AdminUserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserProfile | null>(null);
  const [editNotesUser, setEditNotesUser] = useState<AdminUserProfile | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showFeedback = (msg: string, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 5000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchSearch =
      !searchTerm ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.admin_notes && u.admin_notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchRole && matchStatus && matchSearch;
  });

  const handleRoleChangeConfirm = async () => {
    if (!roleModalUser) return;
    const res = await adminService.updateUserRole(roleModalUser.id, targetRole, currentUserEmail);
    if (!res.success) {
      showFeedback(res.error || 'Failed to update role.', true);
    } else {
      showFeedback(`Successfully updated role for ${roleModalUser.email} to ${targetRole}.`);
      onRefreshUsers();
    }
    setRoleModalUser(null);
  };

  const handleSuspendConfirm = async () => {
    if (!suspendModalUser) return;
    const isCurrentlySuspended = suspendModalUser.status === 'suspended';
    const newStatus: AccountStatus = isCurrentlySuspended ? 'active' : 'suspended';

    const res = await adminService.updateUserStatus(
      suspendModalUser.id,
      newStatus,
      currentUserEmail,
      suspendReason || suspendModalUser.admin_notes || undefined
    );

    if (!res.success) {
      showFeedback(res.error || 'Action failed.', true);
    } else {
      showFeedback(
        isCurrentlySuspended
          ? `Account for ${suspendModalUser.email} has been restored to active status.`
          : `Account for ${suspendModalUser.email} has been suspended.`
      );
      onRefreshUsers();
    }
    setSuspendModalUser(null);
    setSuspendReason('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;
    const res = await adminService.deleteUserAccount(deleteModalUser.id, currentUserEmail);
    if (!res.success) {
      showFeedback(res.error || 'Deletion failed.', true);
    } else {
      showFeedback(`Profile record for ${deleteModalUser.email} deleted.`);
      onRefreshUsers();
    }
    setDeleteModalUser(null);
  };

  const handleSaveNotes = async () => {
    if (!editNotesUser) return;
    await adminService.updateUserStatus(
      editNotesUser.id,
      editNotesUser.status,
      currentUserEmail,
      notesDraft
    );
    showFeedback(`Administrative notes saved for ${editNotesUser.email}.`);
    onRefreshUsers();
    setEditNotesUser(null);
  };

  const handleExportCsv = () => {
    adminService.exportToCsv('zaboraa_users_directory', filteredUsers);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_USERS_CSV',
      targetEntity: 'profiles',
      outcome: 'success',
      metadata: { count: filteredUsers.length }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Users className="w-3.5 h-3.5" />
            <span>IDENTITY & ACCESS GOVERNANCE</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            User Directory & Role Authorization
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Enforce role boundaries (admin, authorized, public). Guardrails prevent accidental removal of the last administrator.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export User CSV</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email, name, notes..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="admin">Admin</option>
              <option value="authorized">Authorized</option>
              <option value="public">Public</option>
              <option value="user">Legacy 'user'</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">User & Email</th>
                <th className="py-3 px-4">Role Authorization</th>
                <th className="py-3 px-4">License Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No user profiles found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadgeColors: Record<string, string> = {
                    admin: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    authorized: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                    public: 'bg-slate-800 text-slate-300 border-slate-700',
                    user: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  };

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.full_name || 'Avatar'}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 shadow-sm"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0">
                              {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {u.full_name || u.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 truncate">{u.email}</div>
                            {u.admin_notes && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                                Note: {u.admin_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                            roleBadgeColors[u.role] || roleBadgeColors.public
                          }`}
                        >
                          {u.role === 'user' ? 'legacy: user' : u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-[11px]">
                        {u.subscription_tier}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          ● {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Change Role Button */}
                          <button
                            onClick={() => {
                              setRoleModalUser(u);
                              setTargetRole(u.role === 'admin' ? 'authorized' : 'admin');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs transition cursor-pointer"
                            title="Elevate or Modify Role"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Notes Button */}
                          <button
                            onClick={() => {
                              setEditNotesUser(u);
                              setNotesDraft(u.admin_notes || '');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer"
                            title="Add/Edit Administrative Notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Restore Button */}
                          <button
                            onClick={() => setSuspendModalUser(u)}
                            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                              u.status === 'suspended'
                                ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-700 text-emerald-300'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                            }`}
                            title={u.status === 'suspended' ? 'Restore Account' : 'Suspend Account'}
                          >
                            {u.status === 'suspended' ? (
                              <UserCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserX className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => setDeleteModalUser(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs transition cursor-pointer"
                            title="Delete Profile Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirmation Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-base font-bold text-white">Modify User Role</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are updating access permissions for{' '}
              <strong className="text-white">{roleModalUser.email}</strong>.
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-mono">Select Target Role:</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as AdminUserRole)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none"
              >
                <option value="admin">Admin (Full administrative & security authority)</option>
                <option value="authorized">Authorized (Enterprise access to sizing & runbooks)</option>
                <option value="public">Public (Standard baseline access)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
              ⚠️ Guardrail Active: The system will verify that at least one other active Administrator remains before applying a demotion.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChangeConfirm}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Confirm Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Suspension Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-base font-bold text-white">
                {suspendModalUser.status === 'suspended' ? 'Restore Account' : 'Suspend Account'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {suspendModalUser.status === 'suspended'
                ? `Restore access for ${suspendModalUser.email}? They will regain access to their authorized workspaces.`
                : `Suspend account for ${suspendModalUser.email}? This revokes active session access until restored.`}
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-slate-400 font-mono">Administrative Reason (Logged to Audit Trail):</label>
              <input
                type="text"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Inactive evaluation / client request"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSuspendModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                  suspendModalUser.status === 'suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {suspendModalUser.status === 'suspended' ? 'Restore Account' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/60 shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h2 className="text-base font-bold text-white">Delete Profile Record</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete the profile record for{' '}
              <strong className="text-white">{deleteModalUser.email}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300">
              ⚠️ This action removes the database profile. Workspaces owned by this user will be orphaned and flagged in the Workspaces audit.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Administrative Notes Modal */}
      {editNotesUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-cyan-400">
              <Edit2 className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">Administrative Notes</h2>
            </div>
            <p className="text-xs text-slate-300">
              Add internal operational notes for <strong className="text-white">{editNotesUser.email}</strong>.
            </p>
            <textarea
              rows={4}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="e.g. POC timeline, enterprise NDA executed, hyperscaler account team contact..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditNotesUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* User Profile Detail Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 text-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name || 'Avatar'}
                    className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/50 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center font-bold text-lg text-cyan-400">
                    {(selectedUser.full_name || selectedUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-white">
                    {selectedUser.full_name || 'Enterprise User'}
                  </h2>
                  <div className="text-xs font-mono text-cyan-400">{selectedUser.email}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {selectedUser.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Assigned Role</span>
                <span className="font-bold text-white capitalize">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Account Status</span>
                <span className="font-bold text-emerald-400 capitalize">{selectedUser.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">License Tier</span>
                <span className="font-bold text-white capitalize">{selectedUser.subscription_tier}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Member Since</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </span>
              </div>
              {selectedUser.last_sign_in_at && (
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] font-mono uppercase">Last Active Authentication</span>
                  <span className="font-mono text-cyan-300">
                    {new Date(selectedUser.last_sign_in_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {selectedUser.admin_notes && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-400 block text-[10px] font-mono uppercase mb-1">Administrative Notes</span>
                <p className="text-slate-200 italic">{selectedUser.admin_notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRoleModalUser(selectedUser);
                  setTargetRole(selectedUser.role === 'admin' ? 'authorized' : 'admin');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Change Role
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
