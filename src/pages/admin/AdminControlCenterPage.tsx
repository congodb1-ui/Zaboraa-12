import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomization } from '../../context/CustomizationContext';
import { AdminSidebar, AdminViewId } from '../../components/admin/AdminSidebar';
import { AdminTopBar } from '../../components/admin/AdminTopBar';
import { AdminLoginModal } from '../../components/AdminLoginModal';
import {
  adminService,
  AdminUserProfile,
  CrmLead,
  AdminAuditLog,
  AdminNotification,
  IntegrationStatus
} from '../../services/adminService';

// View Components
import { AdminOverviewView } from '../../components/admin/views/AdminOverviewView';
import { AdminCrmView } from '../../components/admin/views/AdminCrmView';
import { AdminBriefingsView } from '../../components/admin/views/AdminBriefingsView';
import { AdminWorkspacesView } from '../../components/admin/views/AdminWorkspacesView';
import { AdminUsersView } from '../../components/admin/views/AdminUsersView';
import { AdminDatabaseView } from '../../components/admin/views/AdminDatabaseView';
import { AdminMediaView } from '../../components/admin/views/AdminMediaView';
import { AdminContentView } from '../../components/admin/views/AdminContentView';
import { AdminSeoView } from '../../components/admin/views/AdminSeoView';
import { AdminAnalyticsView } from '../../components/admin/views/AdminAnalyticsView';
import { AdminSecurityView } from '../../components/admin/views/AdminSecurityView';
import { AdminBackupsView } from '../../components/admin/views/AdminBackupsView';
import { AdminIntegrationsView } from '../../components/admin/views/AdminIntegrationsView';
import { AdminVaultView } from '../../components/admin/views/AdminVaultView';

import { ShieldAlert, Lock, LogIn, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const VALID_VIEWS: AdminViewId[] = [
  'overview',
  'crm',
  'briefings',
  'workspaces',
  'users',
  'security',
  'database',
  'media',
  'backups',
  'content',
  'seo',
  'analytics',
  'integrations',
  'vault'
];

export const AdminControlCenterPage: React.FC = () => {
  const { user, isAdmin, isOfflineAdminSession, lockOfflineAdminSession, signOut } = useAuth();
  const { theme, toggleTheme, siteConfig, setIsAdminLoginModalOpen } = useCustomization();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const isAccessAllowed = isAdmin || isOfflineAdminSession;

  const initialView: AdminViewId = (tab && VALID_VIEWS.includes(tab as AdminViewId)) ? (tab as AdminViewId) : 'overview';
  const [activeView, setActiveView] = useState<AdminViewId>(initialView);

  // Sync state if URL tab parameter changes
  useEffect(() => {
    if (tab && VALID_VIEWS.includes(tab as AdminViewId)) {
      setActiveView(tab as AdminViewId);
    }
  }, [tab]);

  const handleSelectView = (view: AdminViewId) => {
    setActiveView(view);
    navigate(`/admin/${view}`, { replace: true });
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [briefings, setBriefings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Online/offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch all administrative telemetry
  const loadAllAdminData = async () => {
    try {
      const [uList, lList, aList, nList, iList] = await Promise.all([
        adminService.getUsers(),
        adminService.getCrmLeads(),
        adminService.getAuditLogs(),
        adminService.getNotifications(),
        adminService.checkAllIntegrations()
      ]);

      setUsers(uList);
      setLeads(lList);
      setAuditLogs(aList);
      setNotifications(nList);
      setIntegrations(iList);

      // Briefings from Supabase or fallback
      if (isSupabaseConfigured && supabase) {
        const { data: bData } = await supabase
          .from('briefing_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (bData) setBriefings(bData);
      } else {
        setBriefings([
          {
            id: 'b-snap-01',
            name: 'David Richardson',
            email: 'd.richardson@fsi-global.com',
            company: 'FSI Capital Markets',
            phone: '+1 (415) 890-2100',
            cloud_focus: 'Azure AVS',
            vm_scale: '1,500 - 3,500 VMs',
            urgency: 'Immediate (30 Days)',
            status: 'scheduled',
            notes: 'Evaluating NetApp ANF decoupled storage for node reduction from 48 to 16 nodes.',
            created_at: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: 'b-snap-02',
            name: 'Elena Rostova',
            email: 'e.rostova@healthcore-sys.org',
            company: 'HealthCore Systems',
            phone: '+1 (212) 555-0199',
            cloud_focus: 'Nutanix NC2',
            vm_scale: '500 - 1,500 VMs',
            urgency: 'Within 60 Days',
            status: 'new',
            notes: 'Epic EHR database migration to AWS NC2 with cluster disaster recovery runbook.',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString()
          }
        ]);
      }
    } catch (err) {
      console.warn('Notice loading admin data:', err);
    }
  };

  useEffect(() => {
    if (isAccessAllowed) {
      loadAllAdminData();
    }
  }, [isAccessAllowed]);

  const currentUserEmail = user?.email || (isOfflineAdminSession ? 'vault-admin@zaboraa.local' : 'admin@zaboraa.com');

  // Handle Global Search
  const handleGlobalSearch = (term: string) => {
    if (!term) return;
    const lower = term.toLowerCase();
    if (lower.includes('lead') || lower.includes('crm') || lower.includes('deal')) {
      setActiveView('crm');
    } else if (lower.includes('brief') || lower.includes('sched')) {
      setActiveView('briefings');
    } else if (lower.includes('user') || lower.includes('role') || lower.includes('profile')) {
      setActiveView('users');
    } else if (lower.includes('table') || lower.includes('sql') || lower.includes('data')) {
      setActiveView('database');
    } else if (lower.includes('media') || lower.includes('image') || lower.includes('asset')) {
      setActiveView('media');
    } else if (lower.includes('audit') || lower.includes('sec')) {
      setActiveView('security');
    }
  };

  // Handle Quick Action
  const handleQuickAction = (key: string) => {
    if (key === 'new_lead') {
      setActiveView('crm');
    } else if (key === 'new_announcement') {
      setActiveView('content');
    } else if (key === 'export_audit') {
      adminService.exportToCsv('zaboraa_security_audit', auditLogs);
    } else if (key === 'ping_health') {
      setActiveView('integrations');
      loadAllAdminData();
    }
  };

  // If Access Denied (Not logged in as Admin)
  if (!isAccessAllowed) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Administrative Authorization Required
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access to the Zaboraa Enterprise Control Center is restricted to authenticated administrators and authorized disaster recovery sessions.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Admin Credentials</span>
            </button>

            <a
              href="/"
              className="text-xs font-mono text-slate-400 hover:text-white transition"
            >
              &larr; Return to Public Architecture Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Badges
  const badges = {
    briefings: briefings.filter((b) => b.status === 'new').length,
    leads: leads.filter((l) => l.status === 'new' || l.status === 'qualified').length,
    security: auditLogs.filter((a) => a.outcome === 'warning' || a.outcome === 'failure').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* 1. Sidebar */}
      <AdminSidebar
        activeView={activeView}
        onSelectView={handleSelectView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        badges={badges}
      />

      {/* 2. Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Bar */}
        <AdminTopBar
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          isOnline={isOnline}
          isOfflineAdminSession={isOfflineAdminSession}
          onLockVault={lockOfflineAdminSession}
          onSignOut={signOut}
          notifications={notifications}
          onRefreshNotifications={loadAllAdminData}
          onGlobalSearch={handleGlobalSearch}
          onQuickAction={handleQuickAction}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'overview' && (
            <AdminOverviewView
              users={users}
              leads={leads}
              briefings={briefings}
              auditLogs={auditLogs}
              integrations={integrations}
              onSelectView={handleSelectView}
            />
          )}

          {activeView === 'crm' && (
            <AdminCrmView
              leads={leads}
              onRefreshLeads={loadAllAdminData}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'briefings' && (
            <AdminBriefingsView
              briefings={briefings}
              onRefreshBriefings={loadAllAdminData}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'workspaces' && (
            <AdminWorkspacesView
              users={users}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'users' && (
            <AdminUsersView
              users={users}
              onRefreshUsers={loadAllAdminData}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'database' && (
            <AdminDatabaseView
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'media' && (
            <AdminMediaView
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'content' && (
            <AdminContentView
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'seo' && (
            <AdminSeoView
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'analytics' && (
            <AdminAnalyticsView
              users={users}
              leads={leads}
              briefings={briefings}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'security' && (
            <AdminSecurityView
              auditLogs={auditLogs}
              onRefreshLogs={loadAllAdminData}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'backups' && (
            <AdminBackupsView
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'integrations' && (
            <AdminIntegrationsView
              integrations={integrations}
              onRefreshIntegrations={loadAllAdminData}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeView === 'vault' && (
            <AdminVaultView
              isOfflineAdminSession={isOfflineAdminSession}
              onLockVault={lockOfflineAdminSession}
              currentUserEmail={currentUserEmail}
            />
          )}
        </main>
      </div>
    </div>
  );
};
