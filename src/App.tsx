import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { CustomizationProvider, useCustomization } from './context/CustomizationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomizerDrawer } from './components/CustomizerDrawer';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { PlatformEditorModal } from './components/PlatformEditorModal';
import { ScheduleBriefingModal } from './components/ScheduleBriefingModal';
import { SearchCommandModal } from './components/SearchCommandModal';
import { WatermarkSettingsModal } from './components/WatermarkSettingsModal';
import { CommercializeModal } from './components/CommercializeModal';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { TelemetryBackground } from './components/TelemetryBackground';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { PWAInstallPrompt } from './components/offline/PWAInstallPrompt';
import { TrackRecordEditorModal } from './components/TrackRecordEditorModal';
import { FounderCredentialsModal } from './components/FounderCredentialsModal';
import { HeroStatsModal } from './components/HeroStatsModal';
import { UserWorkspaceDrawer } from './components/workspace/UserWorkspaceDrawer';
import { RouteHead } from './components/seo/RouteHead';

// Eager Home Page for instant initial render on /
import { HomePage } from './pages/HomePage';

// Lazy-loaded Route Pages & Admin Area (P3-03 Code Splitting)
const DisciplineDetailPage = lazy(() => import('./pages/DisciplineDetailPage').then(m => ({ default: m.DisciplineDetailPage })));
const WorkbenchHubPage = lazy(() => import('./pages/tools/WorkbenchHubPage').then(m => ({ default: m.WorkbenchHubPage })));
const NodeSizingToolPage = lazy(() => import('./pages/tools/NodeSizingToolPage').then(m => ({ default: m.NodeSizingToolPage })));
const RVToolsAnalyzerPage = lazy(() => import('./pages/tools/RVToolsAnalyzerPage').then(m => ({ default: m.RVToolsAnalyzerPage })));
const AriaNetworksToolPage = lazy(() => import('./pages/tools/AriaNetworksToolPage').then(m => ({ default: m.AriaNetworksToolPage })));
const NutanixNC2AssessmentPage = lazy(() => import('./pages/tools/NutanixNC2AssessmentPage').then(m => ({ default: m.NutanixNC2AssessmentPage })));
const DRPlannerPage = lazy(() => import('./pages/tools/DRPlannerPage').then(m => ({ default: m.DRPlannerPage })));
const DesignGeneratorPage = lazy(() => import('./pages/tools/DesignGeneratorPage').then(m => ({ default: m.DesignGeneratorPage })));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage').then(m => ({ default: m.RoadmapPage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const CaseStudiesPage = lazy(() => import('./pages/CaseStudiesPage').then(m => ({ default: m.CaseStudiesPage })));
const CaseStudyDetailPage = lazy(() => import('./pages/CaseStudyDetailPage').then(m => ({ default: m.CaseStudyDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminControlCenterPage = lazy(() => import('./pages/admin/AdminControlCenterPage').then(m => ({ default: m.AdminControlCenterPage })));

import {
  Sliders,
  Calendar,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

// Scroll to top automatically on route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Public Layout:
 * Strictly contains the public header/navbar, main site routes, public footer, and public floating widgets.
 */
export const PublicLayout: React.FC = () => {
  const {
    siteConfig,
    theme,
    toggleTheme,
    isAdmin,
    setIsCustomizerOpen,
    setIsBriefingModalOpen
  } = useCustomization();

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


      {/* Dynamic SEO Head Tags via React 19 native hoisting */}
      <RouteHead />

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

      {/* Public Top Navigation */}
      <Navbar />

      {/* Viewport Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating Action Controls strictly in Public Layout */}
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
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
            title="Open Site Customizer"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Customize Site</span>
          </button>
        )}

        <button
          onClick={() => setIsBriefingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-2xl transition-all hover:scale-105 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Call</span>
        </button>
      </div>

      {/* Admin Modals strictly gated by isAdmin */}
      {isAdmin && (
        <>
          <CustomizerDrawer />
          <PhotoEditorModal />
          <PlatformEditorModal />
          <AdminDashboardModal />
          <WatermarkSettingsModal />
          <TrackRecordEditorModal />
          <FounderCredentialsModal />
          <HeroStatsModal />
        </>
      )}

      {/* Public Modals strictly preserved for all visitors */}
      <ScheduleBriefingModal />
      <SearchCommandModal />
      <PWAInstallPrompt />
      <UserWorkspaceDrawer />
      <AuthErrorBoundary fallbackTitle="Commercialization & Authentication Portal">
        <CommercializeModal />
      </AuthErrorBoundary>
    </div>
  );
};

/**
 * Route guard: only a signed-in user whose role is 'admin' (loaded from the database)
 * can render the admin console. Everyone else is sent to the home page.
 * This is the UI layer only; the database rules are what actually protect the data.
 */
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isOfflineAdminSession, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Verifying access…
      </div>
    );
  }
  if (!isAdmin && !isOfflineAdminSession) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthErrorBoundary fallbackTitle="Enterprise Cloud Workspace">
      <AuthProvider>
        <WorkspaceProvider>
          <CustomizationProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm font-mono">
                    Loading module…
                  </div>
                }
              >
                <Routes>
                  {/* 1. Public Site Routes (Isolated from Admin Layout) */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/disciplines/:id" element={<DisciplineDetailPage />} />
                    <Route path="/tools" element={<WorkbenchHubPage />} />
                    <Route path="/tools/sizing" element={<NodeSizingToolPage />} />
                    <Route path="/tools/rvtools-analyzer" element={<RVToolsAnalyzerPage />} />
                    <Route path="/tools/nutanix-nc2-assessment" element={<NutanixNC2AssessmentPage />} />
                    <Route path="/tools/aria-networks" element={<AriaNetworksToolPage />} />
                    <Route path="/tools/dr-planner" element={<DRPlannerPage />} />
                    <Route path="/tools/design-generator" element={<DesignGeneratorPage />} />
                    <Route path="/roadmap" element={<RoadmapPage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/resources/:tab" element={<ResourcesPage />} />
                    <Route path="/case-studies" element={<CaseStudiesPage />} />
                    <Route path="/case-studies/:slug" element={<CaseStudyDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* 2. Dedicated Admin Console Routes (Completely Isolated Layout) */}
                  <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                    <Route index element={<AdminControlCenterPage />} />
                    <Route path=":tab" element={<AdminControlCenterPage />} />
                  </Route>
                  <Route path="/console" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                    <Route index element={<AdminControlCenterPage />} />
                    <Route path=":tab" element={<AdminControlCenterPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CustomizationProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </AuthErrorBoundary>
  );
}
