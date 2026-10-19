import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FolderKanban,
  ShieldCheck,
  Database,
  Image as ImageIcon,
  HardDriveDownload,
  FileText,
  Search,
  BarChart3,
  Activity,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';

export type AdminViewId =
  | 'overview'
  | 'crm'
  | 'briefings'
  | 'workspaces'
  | 'users'
  | 'security'
  | 'database'
  | 'media'
  | 'backups'
  | 'content'
  | 'seo'
  | 'analytics'
  | 'integrations'
  | 'vault';

interface AdminSidebarProps {
  activeView: AdminViewId;
  onSelectView: (view: AdminViewId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  badges?: {
    briefings?: number;
    leads?: number;
    security?: number;
  };
}

interface NavSection {
  title: string;
  items: {
    id: AdminViewId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  badges = {}
}) => {
  const sections: NavSection[] = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'crm', label: 'CRM & Pipeline', icon: Briefcase, badge: badges.leads, badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
        { id: 'briefings', label: 'Briefing Requests', icon: Calendar, badge: badges.briefings, badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' },
        { id: 'workspaces', label: 'Client Workspaces', icon: FolderKanban }
      ]
    },
    {
      title: 'IDENTITY & ACCESS',
      items: [
        { id: 'users', label: 'User Directory & Roles', icon: Users },
        { id: 'security', label: 'Security & Audit Trail', icon: ShieldCheck, badge: badges.security, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' }
      ]
    },
    {
      title: 'DATA & STORAGE',
      items: [
        { id: 'database', label: 'Database Explorer', icon: Database },
        { id: 'media', label: 'Media Library', icon: ImageIcon },
        { id: 'backups', label: 'Backups & Migrations', icon: HardDriveDownload }
      ]
    },
    {
      title: 'PLATFORM & GROWTH',
      items: [
        { id: 'content', label: 'Website Content CMS', icon: FileText },
        { id: 'seo', label: 'SEO & Growth Center', icon: Search },
        { id: 'analytics', label: 'Analytics & Reporting', icon: BarChart3 },
        { id: 'integrations', label: 'System Health & Integrations', icon: Activity },
        { id: 'vault', label: 'Emergency Offline Vault', icon: KeyRound }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 p-0.5 shrink-0 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm text-white tracking-wide block">ZABORAA</span>
                <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-widest">
                  Control Center
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!isCollapsed && typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Collapse Button (Desktop Only) */}
        <div className="p-3 border-t border-slate-800 shrink-0 hidden lg:flex items-center justify-between bg-slate-950/40">
          {!isCollapsed && (
            <div className="text-[11px] font-mono text-slate-400">
              <span>Console v2.6</span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer mx-auto"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
