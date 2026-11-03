import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Mock react-router-dom hooks used in PublicLayout
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/', search: '', hash: '' }),
    useNavigate: () => vi.fn(),
    Outlet: () => React.createElement('div', { id: 'test-outlet' }, 'Page Outlet')
  };
});

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false
}));

// Mock the 8 admin modals and drawers with unique identifiable data attributes
vi.mock('../components/CustomizerDrawer', () => ({
  CustomizerDrawer: () => React.createElement('div', { 'data-testid': 'modal-customizer-drawer' }, 'CustomizerDrawer')
}));
vi.mock('../components/PhotoEditorModal', () => ({
  PhotoEditorModal: () => React.createElement('div', { 'data-testid': 'modal-photo-editor' }, 'PhotoEditorModal')
}));
vi.mock('../components/PlatformEditorModal', () => ({
  PlatformEditorModal: () => React.createElement('div', { 'data-testid': 'modal-platform-editor' }, 'PlatformEditorModal')
}));
vi.mock('../components/admin/AdminDashboardModal', () => ({
  AdminDashboardModal: () => React.createElement('div', { 'data-testid': 'modal-admin-dashboard' }, 'AdminDashboardModal')
}));
vi.mock('../components/WatermarkSettingsModal', () => ({
  WatermarkSettingsModal: () => React.createElement('div', { 'data-testid': 'modal-watermark-settings' }, 'WatermarkSettingsModal')
}));
vi.mock('../components/TrackRecordEditorModal', () => ({
  TrackRecordEditorModal: () => React.createElement('div', { 'data-testid': 'modal-track-record-editor' }, 'TrackRecordEditorModal')
}));
vi.mock('../components/FounderCredentialsModal', () => ({
  FounderCredentialsModal: () => React.createElement('div', { 'data-testid': 'modal-founder-credentials' }, 'FounderCredentialsModal')
}));
vi.mock('../components/HeroStatsModal', () => ({
  HeroStatsModal: () => React.createElement('div', { 'data-testid': 'modal-hero-stats' }, 'HeroStatsModal')
}));

// Mock public modals and drawers
vi.mock('../components/ScheduleBriefingModal', () => ({
  ScheduleBriefingModal: () => React.createElement('div', { 'data-testid': 'modal-schedule-briefing' }, 'ScheduleBriefingModal')
}));
vi.mock('../components/SearchCommandModal', () => ({
  SearchCommandModal: () => React.createElement('div', { 'data-testid': 'modal-search-command' }, 'SearchCommandModal')
}));
vi.mock('../components/offline/PWAInstallPrompt', () => ({
  PWAInstallPrompt: () => React.createElement('div', { 'data-testid': 'modal-pwa-install' }, 'PWAInstallPrompt')
}));
vi.mock('../components/workspace/UserWorkspaceDrawer', () => ({
  UserWorkspaceDrawer: () => React.createElement('div', { 'data-testid': 'modal-user-workspace' }, 'UserWorkspaceDrawer')
}));
vi.mock('../components/CommercializeModal', () => ({
  CommercializeModal: () => React.createElement('div', { 'data-testid': 'modal-commercialize' }, 'CommercializeModal')
}));
vi.mock('../components/Navbar', () => ({
  Navbar: () => React.createElement('nav', { id: 'test-nav' }, 'Navbar')
}));
vi.mock('../components/Footer', () => ({
  Footer: () => React.createElement('footer', { id: 'test-footer' }, 'Footer')
}));
vi.mock('../components/TelemetryBackground', () => ({
  TelemetryBackground: () => React.createElement('div', { id: 'test-telemetry' }, 'Telemetry')
}));

// Mock CustomizationContext to control isAdmin
let mockIsAdmin = false;
const mockSiteConfig = {
  brand: 'Zaboraa Technologies',
  adminSettings: {
    themePreset: 'default',
    layoutDensity: 'balanced',
    headerStyle: 'glass',
    backgroundPattern: 'tech-grid',
    announcementBannerEnabled: false
  }
};

vi.mock('../context/CustomizationContext', () => ({
  useCustomization: () => ({
    siteConfig: mockSiteConfig,
    theme: 'dark',
    toggleTheme: vi.fn(),
    isAdmin: mockIsAdmin,
    setIsCustomizerOpen: vi.fn(),
    setIsBriefingModalOpen: vi.fn()
  })
}));

import { PublicLayout } from '../App';

describe('PublicLayout Admin Modal Gating & Isolation Suite', () => {
  const ADMIN_MODAL_TEST_IDS = [
    'modal-customizer-drawer',
    'modal-photo-editor',
    'modal-platform-editor',
    'modal-admin-dashboard',
    'modal-watermark-settings',
    'modal-track-record-editor',
    'modal-founder-credentials',
    'modal-hero-stats'
  ];

  const PUBLIC_MODAL_TEST_IDS = [
    'modal-schedule-briefing',
    'modal-search-command',
    'modal-pwa-install',
    'modal-user-workspace',
    'modal-commercialize'
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NONE of the 8 admin modals when isAdmin=false', () => {
    mockIsAdmin = false;
    const markup = renderToStaticMarkup(React.createElement(PublicLayout));

    // Assert that none of the 8 admin modals appear in HTML markup
    for (const testId of ADMIN_MODAL_TEST_IDS) {
      expect(markup).not.toContain(`data-testid="${testId}"`);
    }

    // Floating admin button must not be present
    expect(markup).not.toContain('Customize Site');

    // Public modals and controls MUST remain present
    for (const testId of PUBLIC_MODAL_TEST_IDS) {
      expect(markup).toContain(`data-testid="${testId}"`);
    }
    expect(markup).toContain('Book Call');
    expect(markup).toContain('Toggle theme mode');
  });

  it('renders ALL 8 admin modals when isAdmin=true', () => {
    mockIsAdmin = true;
    const markup = renderToStaticMarkup(React.createElement(PublicLayout));

    // Assert that all 8 admin modals appear in HTML markup
    for (const testId of ADMIN_MODAL_TEST_IDS) {
      expect(markup).toContain(`data-testid="${testId}"`);
    }

    // Floating admin button must be present
    expect(markup).toContain('Customize Site');

    // Public modals must also remain present
    for (const testId of PUBLIC_MODAL_TEST_IDS) {
      expect(markup).toContain(`data-testid="${testId}"`);
    }
  });
});
