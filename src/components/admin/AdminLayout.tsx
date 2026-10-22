import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { TelemetryBackground } from '../TelemetryBackground';
import { useCustomization } from '../../context/CustomizationContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Isolated AdminLayout:
 * Completely unmounts the public website navbar, public footer, and public floating widgets.
 * Strictly contains the dedicated administrative top navbar, left sidebar, and view container.
 */
export const AdminLayout: React.FC = () => {
  const { theme, siteConfig } = useCustomization();
  const { isAdmin, isOfflineAdminSession, loading } = useAuth();

  // Defense in depth: even if a route is added without the RequireAdmin wrapper,
  // this layout never renders for a non-admin.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Verifying access…
      </div>
    );
  }
  if (!isAdmin && !isOfflineAdminSession) return <Navigate to="/" replace />;

  return (
    <div
      data-ui-theme={siteConfig.adminSettings?.themePreset || 'default'}
      data-ui-density={siteConfig.adminSettings?.layoutDensity || 'balanced'}
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
      } font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative flex flex-col`}
    >
      {/* Ambient Telemetry */}
      <TelemetryBackground />

      {/* Dedicated Administrative Viewport Container */}
      <div className="flex-1 min-h-screen flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};
