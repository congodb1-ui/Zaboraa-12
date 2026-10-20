import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ShieldCheck,
  Lock,
  LogOut,
  Wifi,
  WifiOff,
  Menu,
  Check,
  ExternalLink,
  Activity,
  Layers,
  Sparkles,
  Download,
  UserCheck,
  SlidersHorizontal,
  Cpu
} from 'lucide-react';
import { AdminViewId } from './AdminSidebar';
import { AdminNotification, adminService } from '../../services/adminService';

interface AdminTopBarProps {
  activeView: AdminViewId;
  onSelectView: (view: AdminViewId) => void;
  onOpenMobileSidebar: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOnline: boolean;
  onSignOut: () => void;
  notifications: AdminNotification[];
  onRefreshNotifications: () => void;
  onGlobalSearch: (term: string) => void;
  onQuickAction: (actionKey: string) => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  activeView,
  onSelectView,
  onOpenMobileSidebar,
  theme,
  onToggleTheme,
  isOnline,
  onSignOut,
  notifications,
  onRefreshNotifications,
  onGlobalSearch,
  onQuickAction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles: Record<AdminViewId, { title: string; category: string }> = {
    overview: { title: 'Executive Overview', category: 'Core Operations' },
    crm: { title: 'CRM & Pipeline', category: 'Core Operations' },
    briefings: { title: 'Briefing Requests', category: 'Core Operations' },
    workspaces: { title: 'Architecture Projects', category: 'Core Control Plane' },
    users: { title: 'User Directory & Roles', category: 'Core Control Plane' },
    profile: { title: 'Profile & Security', category: 'Core Control Plane' },
    settings: { title: 'Platform & Branding', category: 'Governance & Platform' },
    ai: { title: 'AI Engine & Guardrails', category: 'Governance & Platform' },
    security: { title: 'Security & Audit Trail', category: 'Governance & Platform' },
    database: { title: 'Database Explorer', category: 'Data & Storage' },
    media: { title: 'Media Library', category: 'Data & Storage' },
    backups: { title: 'Backups & Migrations', category: 'Data & Storage' },
    content: { title: 'Website Content CMS', category: 'Platform & Growth' },
    seo: { title: 'SEO & Growth Center', category: 'Platform & Growth' },
    analytics: { title: 'Analytics & Reporting', category: 'Platform & Growth' },
    integrations: { title: 'Storage & Integrations', category: 'Platform & Growth' }
  };

  const currentMeta = viewTitles[activeView] || { title: 'Admin Console', category: 'Administration' };

  return (
    <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm text-slate-100">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation sidebar"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 font-semibold">{currentMeta.category}</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-bold tracking-wide">{currentMeta.title}</span>
        </div>
      </div>

      {/* Center: Global Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onGlobalSearch(e.target.value);
            }}
            placeholder="Search users, leads, briefings, workspaces..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Right: Status Pill & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync Status Badge */}
        <div
          className={`hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-mono font-bold border ${
            isOnline
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{isOnline ? 'CLOUD SYNC ONLINE' : 'LOCAL VAULT ACTIVE'}</span>
        </div>

        {/* Quick Action Dropdown */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actions</span>
          </button>

          {isQuickActionsOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 border-b border-slate-800">
                QUICK ADMINISTRATIVE SHORTCUTS
              </div>
              <button
                onClick={() => {
                  onSelectView('crm');
                  onQuickAction('new_lead');
                  setIsQuickActionsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create New CRM Lead</span>
              </button>
              <button
                onClick={() => {
                  onSelectView('content');
                  onQuickAction('new_announcement');
                  setIsQuickActionsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Edit Site Announcement</span>
              </button>
              <button
                onClick={() => {
                  onSelectView('security');
                  onQuickAction('export_audit');
                  setIsQuickActionsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Audit Log (CSV)</span>
              </button>
              <button
                onClick={() => {
                  onSelectView('integrations');
                  onQuickAction('ping_health');
                  setIsQuickActionsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Run System Health Diagnostics</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View notifications"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 relative transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">
                  Notifications ({unreadCount} unread)
                </span>
                <button
                  onClick={() => {
                    notifications.forEach((n) => adminService.markNotificationAsRead(n.id));
                    onRefreshNotifications();
                  }}
                  className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications. System operations normal.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        adminService.markNotificationAsRead(notif.id);
                        onRefreshNotifications();
                        if (notif.category === 'briefing') onSelectView('briefings');
                        if (notif.category === 'lead') onSelectView('crm');
                        if (notif.category === 'security') onSelectView('security');
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-800/80 transition cursor-pointer text-xs space-y-1 ${
                        !notif.is_read ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{notif.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light high contrast theme' : 'Switch to dark theme'}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xs shrink-0 overflow-hidden shadow-sm">
              <span className="flex items-center justify-center w-full h-full text-center leading-none">WS</span>
            </div>
            <span className="hidden sm:inline font-semibold text-slate-200">Wasim Sayyed</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-100">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-400 flex items-center justify-center font-extrabold text-slate-950 text-sm shrink-0 shadow-md">
                  <span className="flex items-center justify-center w-full h-full text-center leading-none">WS</span>
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="font-bold text-white truncate">Wasim Sayyed</div>
                  <div className="text-[11px] font-mono text-cyan-400">Lead Principal Architect</div>
                  <div className="text-[10px] text-slate-400 truncate">wasim.sayyed@zaboraa.com</div>
                </div>
              </div>

              <div className="py-1 divide-y divide-slate-800">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onSelectView('profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Profile & Security</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Platform & Branding Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('ai');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition"
                  >
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Engine & Guardrails</span>
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      onSignOut();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out of Admin Console</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
