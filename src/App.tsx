import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { CustomizationProvider, useCustomization } from './context/CustomizationContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomizerDrawer } from './components/CustomizerDrawer';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { PlatformEditorModal } from './components/PlatformEditorModal';
import { ScheduleBriefingModal } from './components/ScheduleBriefingModal';
import { SearchCommandModal } from './components/SearchCommandModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { WatermarkSettingsModal } from './components/WatermarkSettingsModal';
import { CommercializeModal } from './components/CommercializeModal';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { TelemetryBackground } from './components/TelemetryBackground';
import { useAuth } from './context/AuthContext';
import { EmergencyModeBanner } from './components/offline/EmergencyModeBanner';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ReconciliationDrawer } from './components/offline/ReconciliationDrawer';
import { PWAInstallPrompt } from './components/offline/PWAInstallPrompt';
import { TrackRecordEditorModal } from './components/TrackRecordEditorModal';
import { FounderCredentialsModal } from './components/FounderCredentialsModal';
import { HeroStatsModal } from './components/HeroStatsModal';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { UserWorkspaceDrawer } from './components/workspace/UserWorkspaceDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { DisciplineDetailPage } from './pages/DisciplineDetailPage';
import { WorkbenchHubPage } from './pages/tools/WorkbenchHubPage';
import { NodeSizingToolPage } from './pages/tools/NodeSizingToolPage';
import { RVToolsAnalyzerPage } from './pages/tools/RVToolsAnalyzerPage';
import { AriaNetworksToolPage } from './pages/tools/AriaNetworksToolPage';
import { NutanixNC2AssessmentPage } from './pages/tools/NutanixNC2AssessmentPage';
import { DRPlannerPage } from './pages/tools/DRPlannerPage';
import { DesignGeneratorPage } from './pages/tools/DesignGeneratorPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CaseStudiesPage } from './pages/CaseStudiesPage';
import { AboutPage } from './pages/AboutPage';
import { AdminControlCenterPage } from './pages/admin/AdminControlCenterPage';

import {
  Sliders,
  Calendar,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

// Scroll to top automatically on route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout: React.FC = () => {
  const {
    siteConfig,
    theme,
    toggleTheme,
    isAdmin,
    signOutAdmin,
    setIsCustomizerOpen,
    setIsWatermarkModalOpen,
    setIsBriefingModalOpen,
    setIsAdminDashboardOpen,
    updateEnableHotspots
  } = useCustomization();

  const { isOfflineAdminSession, lockOfflineAdminSession } = useAuth();
  const isAnyAdminActive = isAdmin || isOfflineAdminSession;

  return (
    <div
      data-ui-theme={siteConfig.adminSettings?.themePreset || 'default'}
      data-ui-density={siteConfig.adminSettings?.layoutDensity || 'balanced'}
      data-ui-header={siteConfig.adminSettings?.headerStyle || 'glass'}
      data-ui-pattern={siteConfig.adminSettings?.backgroundPattern || 'tech-grid'}
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } theme-root flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative`}
    >
      {/* Persistent Emergency & Offline Mode Banner */}
      <EmergencyModeBanner />

      {/* Live Ambient Telemetry Particles */}
      <TelemetryBackground />

      {/* Site-wide Announcement Banner (Admin Configurable) */}
      {siteConfig.adminSettings?.announcementBannerEnabled && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/40 px-4 py-2 text-center text-xs font-semibold text-emerald-200 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{siteConfig.adminSettings.announcementText}</span>
          {siteConfig.adminSettings.announcementLink && (
            <a
              href={siteConfig.adminSettings.announcementLink}
              className="underline text-cyan-300 hover:text-white font-mono ml-1"
            >
              Explore Tool &rarr;
            </a>
          )}
        </div>
      )}

      {/* Admin Mode Top Status Bar (Visible when Live Admin or Decrypted Offline Vault is active) */}
      {isAnyAdminActive && (
        <div className="sticky top-0 z-50 bg-emerald-950/95 border-b border-emerald-500/40 px-4 py-2 text-xs font-mono text-emerald-200 flex items-center justify-between backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide">
              {isOfflineAdminSession ? 'OFFLINE ADMIN MODE (VAULT ACTIVE)' : 'ADMIN MODE: Wasim Sayyed'}
            </span>
            <span className="hidden md:inline text-emerald-300/80">· Enterprise Operations Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-200 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
              title="Open full enterprise administrative console"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Console</span>
            </Link>
            <button
              onClick={() => updateEnableHotspots(!siteConfig.enableHotspots)}
              className={`px-2.5 py-1 rounded border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                siteConfig.enableHotspots
                  ? 'bg-emerald-900/90 hover:bg-emerald-800 border-emerald-500 text-emerald-100'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Globally toggle diagram interactive hotspots across entire site"
            >
              {siteConfig.enableHotspots ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hotspots: ON</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hotspots: OFF</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsWatermarkModalOpen(true)}
              className="px-2.5 py-1 rounded bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-600/70 text-emerald-100 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Watermarks</span>
            </button>
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="px-2.5 py-1 rounded bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-600/70 text-emerald-100 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Site</span>
            </button>
            <button
              onClick={() => {
                if (isOfflineAdminSession) {
                  lockOfflineAdminSession();
                } else {
                  void signOutAdmin();
                }
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-emerald-700/70 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Exit administrative view"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar />

      {/* Viewport Routes */}
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          {/* 1. Home Page Overview */}
          <Route path="/" element={<HomePage />} />

          {/* 2. Dynamic Standalone Discipline Page for EVERY item in platformShowcases */}
          <Route path="/disciplines/:id" element={<DisciplineDetailPage />} />

          {/* 3. Interactive Engineering Workbench Suite */}
          <Route path="/tools" element={<WorkbenchHubPage />} />
          <Route path="/tools/sizing" element={<NodeSizingToolPage />} />
          <Route path="/tools/rvtools-analyzer" element={<RVToolsAnalyzerPage />} />
          <Route path="/tools/nutanix-nc2-assessment" element={<NutanixNC2AssessmentPage />} />
          <Route path="/tools/aria-networks" element={<AriaNetworksToolPage />} />
          <Route path="/tools/dr-planner" element={<DRPlannerPage />} />
          <Route path="/tools/design-generator" element={<DesignGeneratorPage />} />

          {/* 4. Standalone Dedicated Roadmap, Resources, Case Studies, About */}
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:tab" element={<ResourcesPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* 5. Enterprise Admin Control Center */}
          <Route path="/admin" element={<AdminControlCenterPage />} />
          <Route path="/admin/:tab" element={<AdminControlCenterPage />} />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating Action Controls */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Admin-Only Floating Customizer Control */}
        {isAdmin && (
          <>
            <button
              onClick={() => setIsWatermarkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
              title="Watermark customization"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Watermark</span>
            </button>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
              title="Open Site Customizer"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Customize Site</span>
            </button>
          </>
        )}

        <button
          onClick={() => setIsBriefingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-2xl transition-all hover:scale-105 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Call</span>
        </button>
      </div>

      {/* Global Modals & Drawers */}
      <CustomizerDrawer />
      <PhotoEditorModal />
      <PlatformEditorModal />
      <ScheduleBriefingModal />
      <SearchCommandModal />
      <AdminLoginModal />
      <AdminDashboardModal />
      <ReconciliationDrawer />
      <PWAInstallPrompt />
      <WatermarkSettingsModal />
      <TrackRecordEditorModal />
      <FounderCredentialsModal />
      <HeroStatsModal />
      <UserWorkspaceDrawer />
      <AuthErrorBoundary fallbackTitle="Commercialization & Authentication Portal">
        <CommercializeModal />
      </AuthErrorBoundary>
    </div>
  );
};

export default function App() {
  return (
    <AuthErrorBoundary fallbackTitle="Enterprise Cloud Workspace">
      <AuthProvider>
        <WorkspaceProvider>
          <CustomizationProvider>
            <BrowserRouter>
              <MainLayout />
            </BrowserRouter>
          </CustomizationProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </AuthErrorBoundary>
  );
}
