import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SiteConfig, ArchitectureDiagram, VideoItem, TutorialArticle, ServicePillar, CaseStudy, PhotoStyle, PlatformShowcase, ArchitectureDesignItem, WatermarkConfig, AdminSettings, FeatureControlsConfig } from '../types/siteData';
import { INITIAL_SITE_DATA } from '../data/initialData';
import { useAuth, isUserAdminEmail } from './AuthContext';
import { adminService } from '../services/adminService';
import { isSupabaseConfigured } from '../lib/supabase';
import { externalizeImages } from '../services/siteAssets';

const STORAGE_KEY = 'zaboraa_site_config_v8';
const THEME_STORAGE_KEY = 'zaboraa_theme_mode';

function cleanOldStorageKeys() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('zaboraa_site_config_') || key.startsWith('zaboraa_config_'))) {
        if (key !== STORAGE_KEY) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

function sanitizeImagePaths<T>(data: T): T {
  if (!data) return data;
  try {
    const jsonStr = JSON.stringify(data);
    const fixedStr = jsonStr.replace(/\/src\/assets\/images\//g, '/assets/images/');
    return JSON.parse(fixedStr);
  } catch {
    return data;
  }
}

interface CustomizationContextType {
  siteConfig: SiteConfig;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;
  isReconciliationOpen: boolean;
  setIsReconciliationOpen: (open: boolean) => void;
  isOfflineEmergencyOpen: boolean;
  setIsOfflineEmergencyOpen: (open: boolean) => void;
  isWatermarkModalOpen: boolean;
  setIsWatermarkModalOpen: (open: boolean) => void;
  verifyAdminPasscode: (passcode: string) => boolean;
  signOutAdmin: () => void;
  updateWatermarkConfig: (cfg: Partial<WatermarkConfig>) => void;
  updateEnableHotspots: (enabled: boolean) => void;
  updateAdminSettings: (cfg: Partial<AdminSettings>) => void;
  featureControls: FeatureControlsConfig;
  updateFeatureControls: (controls: Partial<FeatureControlsConfig>) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  isPhotoEditorOpen: boolean;
  setIsPhotoEditorOpen: (open: boolean) => void;
  activeEditPlatformId: string | null;
  setActiveEditPlatformId: (id: string | null) => void;
  isBriefingModalOpen: boolean;
  setIsBriefingModalOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  selectedTutorial: TutorialArticle | null;
  setSelectedTutorial: (tutorial: TutorialArticle | null) => void;
  selectedDiagram: ArchitectureDiagram | null;
  setSelectedDiagram: (diagram: ArchitectureDiagram | null) => void;
  selectedVideo: VideoItem | null;
  setSelectedVideo: (video: VideoItem | null) => void;
  
  brandName: string;
  brandLogoUrl?: string;
  updateBranding: (data: { brandName: string; brandLogoUrl?: string; brandTagline?: string }) => void;

  // Customization methods
  updateGeneralInfo: (info: { brand: string; brandTagline: string; brandLogoUrl?: string; founder: SiteConfig['founder'] }) => void;
  updateFounderPhoto: (portraitImage: string, photoStyle?: PhotoStyle) => void;
  setFeaturedVideoId: (id: string) => void;
  updatePlatformShowcase: (id: string, updated: Partial<PlatformShowcase>) => void;
  addPlatformShowcase: (platform: PlatformShowcase) => void;
  deletePlatformShowcase: (id: string) => void;
  togglePlatformEnabled: (id: string) => void;
  reorderPlatformShowcases: (startIndex: number, endIndex: number) => void;
  movePlatformShowcase: (id: string, direction: 'up' | 'down') => void;
  pinPlatformShowcaseToTop: (id: string) => void;
  addPlatformDesign: (platformId: string, design: ArchitectureDesignItem) => void;
  updatePlatformDesign: (platformId: string, designId: string, updated: Partial<ArchitectureDesignItem>) => void;
  deletePlatformDesign: (platformId: string, designId: string) => void;
  toggleDesignEnabled: (platformId: string, designId: string) => void;
  updateHero: (hero: SiteConfig['hero']) => void;
  addDiagram: (diagram: ArchitectureDiagram) => void;
  updateDiagram: (id: string, diagram: Partial<ArchitectureDiagram>) => void;
  deleteDiagram: (id: string) => void;
  addVideo: (video: VideoItem) => void;
  updateVideo: (id: string, video: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;
  addTutorial: (tutorial: TutorialArticle) => void;
  updateTutorial: (id: string, tutorial: Partial<TutorialArticle>) => void;
  deleteTutorial: (id: string) => void;

  // Case Study & Track Record Management
  isTrackRecordModalOpen: boolean;
  setIsTrackRecordModalOpen: (open: boolean) => void;
  activeEditCaseStudy: CaseStudy | null;
  setActiveEditCaseStudy: (study: CaseStudy | null) => void;
  addCaseStudy: (study: CaseStudy) => void;
  updateCaseStudy: (id: string, updated: Partial<CaseStudy>) => void;
  deleteCaseStudy: (id: string) => void;
  reorderCaseStudies: (startIndex: number, endIndex: number) => void;

  // Founder & Homepage Fields Management
  isFounderModalOpen: boolean;
  setIsFounderModalOpen: (open: boolean) => void;
  updateFounderCredentials: (founder: Partial<SiteConfig['founder']>) => void;
  isHeroStatsModalOpen: boolean;
  setIsHeroStatsModalOpen: (open: boolean) => void;
  updateHeroStats: (stats: SiteConfig['hero']['stats']) => void;
  updateHeroContent: (hero: Partial<SiteConfig['hero']>) => void;

  resetToDefaults: () => void;
  exportConfigJson: () => string;
  importConfigJson: (json: string) => boolean;
  savePersistentAdminSettings: (
    updates: Partial<AdminSettings>,
    brandingUpdates?: { brandName?: string; brandTagline?: string; brandLogoUrl?: string }
  ) => Promise<{ success: boolean; message: string }>;
  refreshRemoteSettings: () => Promise<void>;
  syncAllContentToCloud: () => Promise<{ success: boolean; message: string; persistedToCloud: boolean }>;
  isHydrated: boolean;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage', e);
    }
    return 'dark';
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      cleanOldStorageKeys();
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('zaboraa_site_config_v6') ||
        localStorage.getItem('zaboraa_site_config_v3');
      if (saved) {
        const parsed = sanitizeImagePaths(JSON.parse(saved));
        if (parsed.brand && parsed.founder) {
          const merged: SiteConfig = {
            ...INITIAL_SITE_DATA,
            ...parsed,
            brand: parsed.brand || parsed.adminSettings?.brandName || INITIAL_SITE_DATA.brand,
            brandLogoUrl: parsed.brandLogoUrl || parsed.adminSettings?.brandLogoUrl || undefined,
            founder: {
              ...INITIAL_SITE_DATA.founder,
              ...(parsed.founder || {}),
              portraitImage:
                parsed.founder?.portraitImage || INITIAL_SITE_DATA.founder.portraitImage,
              photoStyle: parsed.founder?.photoStyle || INITIAL_SITE_DATA.founder.photoStyle
            },
            hero: {
              ...INITIAL_SITE_DATA.hero,
              ...(parsed.hero || {})
            },
            platformShowcases: parsed.platformShowcases && parsed.platformShowcases.length > 0
              ? parsed.platformShowcases
              : INITIAL_SITE_DATA.platformShowcases,
            diagrams: parsed.diagrams || INITIAL_SITE_DATA.diagrams,
            videos: parsed.videos || INITIAL_SITE_DATA.videos,
            tutorials: parsed.tutorials || INITIAL_SITE_DATA.tutorials,
            knowledgeBase: parsed.knowledgeBase || INITIAL_SITE_DATA.knowledgeBase,
            caseStudies: parsed.caseStudies || INITIAL_SITE_DATA.caseStudies,
            services: parsed.services || INITIAL_SITE_DATA.services,
            enableHotspots: parsed.enableHotspots !== undefined ? parsed.enableHotspots : true
          };
          if (!merged.adminSettings) {
            merged.adminSettings = INITIAL_SITE_DATA.adminSettings;
          } else {
            const rawAccessMode = merged.adminSettings.blueprintAccessMode ||
                                  merged.adminSettings.featureControls?.blueprintAccessMode ||
                                  'signed_in';
            merged.adminSettings = {
              ...INITIAL_SITE_DATA.adminSettings,
              ...merged.adminSettings,
              blueprintAccessMode: rawAccessMode,
              publicAccessEnabled: merged.adminSettings.publicAccessEnabled !== undefined
                ? merged.adminSettings.publicAccessEnabled
                : true,
              authRequiredForTools: merged.adminSettings.authRequiredForTools !== undefined
                ? merged.adminSettings.authRequiredForTools
                : false,
              featureControls: {
                exportDossier: merged.adminSettings?.featureControls?.exportDossier !== undefined
                  ? merged.adminSettings.featureControls.exportDossier
                  : true,
                exportExecutiveSummary: merged.adminSettings?.featureControls?.exportExecutiveSummary !== undefined
                  ? merged.adminSettings.featureControls.exportExecutiveSummary
                  : true,
                export4k: merged.adminSettings?.featureControls?.export4k !== undefined
                  ? merged.adminSettings.featureControls.export4k
                  : true,
                generateBlueprint: merged.adminSettings?.featureControls?.generateBlueprint !== undefined
                  ? merged.adminSettings.featureControls.generateBlueprint
                  : true,
                blueprintAccessMode: rawAccessMode
              }
            };
          }
          return sanitizeImagePaths(merged);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved config from localStorage', e);
    }
    return INITIAL_SITE_DATA;
  });

  const { user, isAdmin: isAuthAdmin, signOut: authSignOut } = useAuth();

  // Authoritative admin verification: true when authenticated through Supabase with admin role or admin email
  const isAdmin = Boolean(isAuthAdmin || user?.role === 'admin' || isUserAdminEmail(user?.email));
  const setIsAdmin = (_val: boolean) => {
    // Only real Supabase authentication modifies admin status
  };
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);
  const [isOfflineEmergencyOpen, setIsOfflineEmergencyOpen] = useState(false);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);

  const verifyAdminPasscode = (_passcode: string): boolean => {
    // Passcode bypass disabled: Authentication must be conducted through Supabase Auth
    return false;
  };

  const signOutAdmin = async () => {
    try {
      localStorage.removeItem('zaboraa_admin_session');
    } catch {}
    await authSignOut();
  };

  const featureControls: FeatureControlsConfig = {
    exportDossier: siteConfig.adminSettings?.featureControls?.exportDossier ?? true,
    exportExecutiveSummary: siteConfig.adminSettings?.featureControls?.exportExecutiveSummary ?? true,
    export4k: siteConfig.adminSettings?.featureControls?.export4k ?? true,
    generateBlueprint: siteConfig.adminSettings?.featureControls?.generateBlueprint ?? true
  };

  const updateFeatureControls = (controls: Partial<FeatureControlsConfig>) => {
    setSiteConfig(prev => {
      const current = prev.adminSettings?.featureControls || {
        exportDossier: true,
        exportExecutiveSummary: true,
        export4k: true,
        generateBlueprint: true
      };
      const baseAdminSettings = prev.adminSettings || INITIAL_SITE_DATA.adminSettings!;
      const updatedAdminSettings: AdminSettings = {
        ...baseAdminSettings,
        featureControls: {
          ...current,
          ...controls
        }
      };
      const updated: SiteConfig = {
        ...prev,
        adminSettings: updatedAdminSettings
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save updated feature controls', e);
      }
      return updated;
    });
  };

  const updateWatermarkConfig = (cfg: Partial<WatermarkConfig>) => {
    setSiteConfig(prev => ({
      ...prev,
      watermark: {
        ...(prev.watermark || {
          enabled: true,
          type: 'text',
          text: 'ZABORAA TECHNOLOGIES · HYBRID CLOUD BLUEPRINT',
          position: 'bottom-right',
          opacity: 0.35
        }),
        ...cfg
      }
    }));
  };

  const updateEnableHotspots = (enabled: boolean) => {
    setSiteConfig(prev => ({
      ...prev,
      enableHotspots: enabled
    }));
  };

  const updateAdminSettings = (cfg: Partial<AdminSettings>) => {
    setSiteConfig(prev => {
      const updatedAdminSettings: AdminSettings = {
        ...(prev.adminSettings || INITIAL_SITE_DATA.adminSettings!),
        ...cfg
      };

      if (isAdmin) {
        if (cfg.announcementBannerEnabled !== undefined || cfg.announcementText !== undefined || cfg.announcementLink !== undefined) {
          adminService.saveAppSetting(
            'announcement',
            {
              announcementBannerEnabled: updatedAdminSettings.announcementBannerEnabled,
              announcementText: updatedAdminSettings.announcementText,
              announcementLink: updatedAdminSettings.announcementLink
            },
            'general',
            'Announcement banner settings',
            user?.email || 'admin@zaboraa.com'
          ).catch(e => console.warn('Notice persisting announcement settings:', e));
        }

        adminService.saveAppSetting(
          'admin_settings',
          updatedAdminSettings,
          'general',
          'Platform layout and theme preset configuration',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting admin_settings:', e));
      }

      return {
        ...prev,
        adminSettings: updatedAdminSettings
      };
    });
  };

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [activeEditPlatformId, setActiveEditPlatformId] = useState<string | null>(null);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialArticle | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<ArchitectureDiagram | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Track Record & Homepage Fields modal states
  const [isTrackRecordModalOpen, setIsTrackRecordModalOpen] = useState(false);
  const [activeEditCaseStudy, setActiveEditCaseStudy] = useState<CaseStudy | null>(null);
  const [isFounderModalOpen, setIsFounderModalOpen] = useState(false);
  const [isHeroStatsModalOpen, setIsHeroStatsModalOpen] = useState(false);

  // Sync theme to root class and localStorage
  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Could not save theme to storage', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-high-contrast');
    } else {
      root.classList.remove('light-high-contrast');
      root.classList.add('dark');
    }

    const currentTheme = siteConfig.adminSettings?.themePreset || 'default';
    const currentDensity = siteConfig.adminSettings?.layoutDensity || 'balanced';
    const currentHeader = siteConfig.adminSettings?.headerStyle || 'glass';
    const currentPattern = siteConfig.adminSettings?.backgroundPattern || 'tech-grid';
    root.setAttribute('data-ui-theme', currentTheme);
    root.setAttribute('data-ui-density', currentDensity);
    root.setAttribute('data-ui-header', currentHeader);
    root.setAttribute('data-ui-pattern', currentPattern);
  }, [theme, siteConfig.adminSettings]);

  const [isHydrated, setIsHydrated] = useState(false);

  // Remote Hydration: Asynchronously fetch persistent settings from Supabase
  const applyRemoteSettings = (remote: any) => {
    if (!remote || (!remote.branding && !remote.featureControls && !remote.organization && !remote.siteContent && !remote.announcement && !remote.adminSettings)) {
      return;
    }

    setSiteConfig((prev) => {
      const currentAdminSettings = prev.adminSettings || INITIAL_SITE_DATA.adminSettings!;
      const rawAccessMode = remote.featureControls?.blueprintAccessMode ||
                            remote.organization?.blueprintAccessMode ||
                            currentAdminSettings.blueprintAccessMode ||
                            'signed_in';

      // Remote Branding takes precedence over stale localStorage
      const brand = remote.branding?.brandName || remote.branding?.brand || prev.brand;
      const brandTagline = remote.branding?.brandTagline || prev.brandTagline;
      const brandLogoUrl = remote.branding?.brandLogoUrl !== undefined ? remote.branding.brandLogoUrl : prev.brandLogoUrl;

      // Remote Announcement Banner
      const announcementData = remote.announcement || remote.adminSettings || remote.branding?.announcement || {};
      const announcementBannerEnabled = announcementData.announcementBannerEnabled !== undefined
        ? Boolean(announcementData.announcementBannerEnabled)
        : currentAdminSettings.announcementBannerEnabled;
      const announcementText = announcementData.announcementText || currentAdminSettings.announcementText;
      const announcementLink = announcementData.announcementLink || currentAdminSettings.announcementLink;

      // Remote Site Content
      const siteContent = remote.siteContent || {};

      const merged: SiteConfig = {
        ...prev,
        brand,
        brandTagline,
        brandLogoUrl,
        founder: siteContent.founder ? { ...INITIAL_SITE_DATA.founder, ...prev.founder, ...siteContent.founder } : prev.founder,
        featuredVideoId: siteContent.misc?.featuredVideoId ?? prev.featuredVideoId,
        enableHotspots: siteContent.misc?.enableHotspots ?? prev.enableHotspots,
        watermark: siteContent.misc?.watermark ? { ...prev.watermark, ...siteContent.misc.watermark } : prev.watermark,
        hero: siteContent.hero ? { ...INITIAL_SITE_DATA.hero, ...prev.hero, ...siteContent.hero } : prev.hero,
        diagrams: Array.isArray(siteContent.diagrams) && siteContent.diagrams.length > 0 ? siteContent.diagrams : prev.diagrams,
        videos: Array.isArray(siteContent.videos) && siteContent.videos.length > 0 ? siteContent.videos : prev.videos,
        tutorials: Array.isArray(siteContent.tutorials) && siteContent.tutorials.length > 0 ? siteContent.tutorials : prev.tutorials,
        knowledgeBase: Array.isArray(siteContent.knowledgeBase) && siteContent.knowledgeBase.length > 0 ? siteContent.knowledgeBase : prev.knowledgeBase,
        caseStudies: Array.isArray(siteContent.caseStudies) && siteContent.caseStudies.length > 0 ? siteContent.caseStudies : prev.caseStudies,
        services: Array.isArray(siteContent.services) && siteContent.services.length > 0 ? siteContent.services : prev.services,
        platformShowcases: Array.isArray(siteContent.platformShowcases) && siteContent.platformShowcases.length > 0
          ? siteContent.platformShowcases
          : Array.isArray(siteContent.platforms) && siteContent.platforms.length > 0
          ? siteContent.platforms
          : prev.platformShowcases,
        adminSettings: {
          ...currentAdminSettings,
          ...(remote.adminSettings || {}),
          brandName: brand,
          brandLogoUrl,
          supportEmail: remote.organization?.supportEmail || currentAdminSettings.supportEmail,
          executiveContact: remote.organization?.executiveContact || currentAdminSettings.executiveContact,
          defaultCloudPlatform: remote.organization?.defaultCloudPlatform || currentAdminSettings.defaultCloudPlatform,
          defaultVcpuOvercommit: remote.organization?.defaultVcpuOvercommit ?? currentAdminSettings.defaultVcpuOvercommit,
          defaultRamBufferPercent: remote.organization?.defaultRamBufferPercent ?? currentAdminSettings.defaultRamBufferPercent,
          defaultTargetRpoMinutes: remote.organization?.defaultTargetRpoMinutes ?? currentAdminSettings.defaultTargetRpoMinutes,
          defaultTargetRtoHours: remote.organization?.defaultTargetRtoHours ?? currentAdminSettings.defaultTargetRtoHours,
          primaryRegion: remote.organization?.primaryRegion || currentAdminSettings.primaryRegion,
          authRequiredForTools: remote.organization?.authRequiredForTools ?? currentAdminSettings.authRequiredForTools,
          publicAccessEnabled: remote.organization?.publicAccessEnabled ?? currentAdminSettings.publicAccessEnabled,
          blueprintAccessMode: rawAccessMode,
          announcementBannerEnabled,
          announcementText,
          announcementLink,
          featureControls: {
            ...(currentAdminSettings.featureControls || {
              exportDossier: true,
              exportExecutiveSummary: true,
              export4k: true,
              generateBlueprint: true,
              blueprintAccessMode: 'signed_in'
            }),
            ...(remote.featureControls || {}),
            blueprintAccessMode: rawAccessMode
          }
        }
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('Notice saving hydrated settings to localStorage:', e);
      }

      return merged;
    });
  };

  const refreshRemoteSettings = async (): Promise<void> => {
    try {
      const remote = await adminService.getGlobalSettings(!isAdmin);
      applyRemoteSettings(remote);
    } catch (e) {
      console.warn('Notice refreshing remote settings:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const hydrateRemoteSettings = async () => {
      try {
        const remote = await adminService.getGlobalSettings(!isAdmin);
        if (!isMounted) return;
        applyRemoteSettings(remote);

        // Safe one-time backfill: if an authenticated administrator is active and the remote site_content table is empty,
        // sync the active local site content into Supabase so incognito visitors and public users see it immediately.
        if (isAdmin && isSupabaseConfigured && (!remote.siteContent || Object.keys(remote.siteContent).length === 0)) {
          console.info('Authoritative admin session detected with empty remote site_content: syncing initial site content to Supabase...');
          syncAllContentToCloud().catch(err => console.warn('Notice during auto-sync to cloud:', err));
        }
      } catch (e) {
        console.warn('Notice hydrating remote settings:', e);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };

    hydrateRemoteSettings();
    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const brandName = siteConfig.brand || siteConfig.adminSettings?.brandName || 'Zaboraa Technologies';
  const brandLogoUrl = siteConfig.brandLogoUrl || siteConfig.adminSettings?.brandLogoUrl;

  const updateBranding = (data: { brandName: string; brandLogoUrl?: string; brandTagline?: string }) => {
    setSiteConfig(prev => {
      const updatedBrand = data.brandName;
      const updatedTagline = data.brandTagline !== undefined ? data.brandTagline : prev.brandTagline;
      const updatedLogo = data.brandLogoUrl !== undefined ? data.brandLogoUrl : prev.brandLogoUrl;

      const updated: SiteConfig = {
        ...prev,
        brand: updatedBrand,
        brandLogoUrl: updatedLogo,
        brandTagline: updatedTagline,
        adminSettings: {
          ...(prev.adminSettings || INITIAL_SITE_DATA.adminSettings!),
          brandName: updatedBrand,
          brandLogoUrl: updatedLogo
        }
      };

      if (isAdmin) {
        adminService.saveAppSetting(
          'branding',
          {
            brandName: updatedBrand,
            brandTagline: updatedTagline,
            brandLogoUrl: updatedLogo
          },
          'branding',
          'Global platform brand identity',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting branding to Supabase:', e));
      }

      return updated;
    });
  };

  // Dynamically synchronize document.title and meta descriptions with branding state
  useEffect(() => {
    const currentBrand = siteConfig.brand || 'Zaboraa Technologies';
    const currentTagline = siteConfig.brandTagline || 'Enterprise VMware Cloud Architecture';
    document.title = `${currentBrand} - ${currentTagline}`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${currentBrand}: ${currentTagline}. Hyperscaler migration, interactive diagrams, video masterclasses, and software tutorials across Azure AVS, AWS VMC, and Google Cloud GCVE.`);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `${currentBrand} - ${currentTagline}`);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', `${currentBrand}: ${currentTagline}. Hyperscaler migration, interactive diagrams, video masterclasses, and software tutorials.`);
    }
  }, [siteConfig.brand, siteConfig.brandTagline]);

  // Sync to localStorage with quota protection and fallback
  useEffect(() => {
    try {
      cleanOldStorageKeys();

      // Filter out giant base64 data URLs from localStorage payload to respect quota limits
      const safeWatermark = siteConfig.watermark ? {
        ...siteConfig.watermark,
        imageUrl: siteConfig.watermark.imageUrl && siteConfig.watermark.imageUrl.startsWith('data:') && siteConfig.watermark.imageUrl.length > 50000
          ? undefined // Large uploaded watermark preserved in active session memory
          : siteConfig.watermark.imageUrl
      } : undefined;

      const safeFounder = siteConfig.founder ? {
        ...siteConfig.founder,
        portraitImage: siteConfig.founder.portraitImage && siteConfig.founder.portraitImage.startsWith('data:') && siteConfig.founder.portraitImage.length > 50000
          ? INITIAL_SITE_DATA.founder.portraitImage
          : siteConfig.founder.portraitImage
      } : INITIAL_SITE_DATA.founder;

      // Store customized configuration safely
      const payloadToSave: Partial<SiteConfig> = {
        brand: siteConfig.brand,
        brandTagline: siteConfig.brandTagline,
        brandLogoUrl: siteConfig.brandLogoUrl,
        adminSettings: siteConfig.adminSettings,
        enableHotspots: siteConfig.enableHotspots,
        featuredVideoId: siteConfig.featuredVideoId,
        watermark: safeWatermark,
        founder: safeFounder,
        hero: siteConfig.hero,
        platformShowcases: siteConfig.platformShowcases,
        diagrams: siteConfig.diagrams,
        videos: siteConfig.videos,
        services: siteConfig.services
      };

      if (siteConfig.tutorials !== INITIAL_SITE_DATA.tutorials) {
        payloadToSave.tutorials = siteConfig.tutorials;
      }
      if (siteConfig.knowledgeBase !== INITIAL_SITE_DATA.knowledgeBase) {
        payloadToSave.knowledgeBase = siteConfig.knowledgeBase;
      }
      if (siteConfig.caseStudies !== INITIAL_SITE_DATA.caseStudies) {
        payloadToSave.caseStudies = siteConfig.caseStudies;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payloadToSave));
    } catch (e: any) {
      // If quota exceeded or storage unavailable, clean and save minimal essential config
      try {
        cleanOldStorageKeys();
        const minimalPayload = {
          brand: siteConfig.brand,
          brandTagline: siteConfig.brandTagline,
          brandLogoUrl: siteConfig.brandLogoUrl,
          adminSettings: siteConfig.adminSettings,
          enableHotspots: siteConfig.enableHotspots,
          founder: {
            name: siteConfig.founder.name,
            role: siteConfig.founder.role,
            location: siteConfig.founder.location
          },
          hero: {
            eyebrow: siteConfig.hero.eyebrow,
            headline: siteConfig.hero.headline,
            subheadline: siteConfig.hero.subheadline,
            stats: siteConfig.hero.stats
          },
          watermark: siteConfig.watermark ? {
            enabled: siteConfig.watermark.enabled,
            type: siteConfig.watermark.type,
            text: siteConfig.watermark.text,
            position: siteConfig.watermark.position,
            opacity: siteConfig.watermark.opacity
          } : undefined
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalPayload));
      } catch {
        // Silently preserve in active React state
      }
    }
  }, [siteConfig]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsPhotoEditorOpen(false);
        if (selectedTutorial) setSelectedTutorial(null);
        if (selectedDiagram) setSelectedDiagram(null);
        if (selectedVideo) setSelectedVideo(null);
        setIsBriefingModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTutorial, selectedDiagram, selectedVideo]);

  const updateGeneralInfo = (info: { brand: string; brandTagline: string; brandLogoUrl?: string; founder: SiteConfig['founder'] }) => {
    setSiteConfig(prev => {
      const updated: SiteConfig = {
        ...prev,
        brand: info.brand,
        brandTagline: info.brandTagline,
        brandLogoUrl: info.brandLogoUrl !== undefined ? info.brandLogoUrl : prev.brandLogoUrl,
        founder: info.founder,
        adminSettings: {
          ...(prev.adminSettings || INITIAL_SITE_DATA.adminSettings!),
          brandName: info.brand,
          brandLogoUrl: info.brandLogoUrl !== undefined ? info.brandLogoUrl : prev.adminSettings?.brandLogoUrl
        }
      };

      if (isAdmin) {
        adminService.saveAppSetting(
          'branding',
          {
            brandName: info.brand,
            brandTagline: info.brandTagline,
            brandLogoUrl: info.brandLogoUrl
          },
          'branding',
          'Global platform brand identity',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting branding:', e));

        adminService.saveSiteContent(
          'founder',
          info.founder,
          'Executive Founder Profile',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting founder:', e));
      }

      return updated;
    });
  };

  const updateFounderPhoto = (portraitImage: string, photoStyle?: PhotoStyle) => {
    setSiteConfig(prev => {
      const updatedFounder = {
        ...prev.founder,
        portraitImage,
        photoStyle: photoStyle !== undefined ? photoStyle : prev.founder.photoStyle
      };

      if (isAdmin && (!portraitImage.startsWith('data:') || portraitImage.length < 50000)) {
        adminService.saveSiteContent(
          'founder',
          updatedFounder,
          'Executive Founder Profile',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting founder photo:', e));
      }

      return {
        ...prev,
        founder: updatedFounder
      };
    });
  };

  const setFeaturedVideoId = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      featuredVideoId: id
    }));
  };

  const updatePlatformShowcase = (id: string, updated: Partial<PlatformShowcase>) => {
    setSiteConfig(prev => {
      const updatedList = (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item =>
        item.id === id ? { ...item, ...updated } : item
      );
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const addPlatformShowcase = (platform: PlatformShowcase) => {
    setSiteConfig(prev => {
      const updatedList = [...(prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases), platform];
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const deletePlatformShowcase = (id: string) => {
    setSiteConfig(prev => {
      const updatedList = (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).filter(item => item.id !== id);
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const togglePlatformEnabled = (id: string) => {
    setSiteConfig(prev => {
      const updatedList = (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item =>
        item.id === id ? { ...item, enabled: item.enabled === false ? true : false } : item
      );
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const reorderPlatformShowcases = (startIndex: number, endIndex: number) => {
    setSiteConfig(prev => {
      const list = [...(prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases)];
      if (startIndex < 0 || startIndex >= list.length || endIndex < 0 || endIndex >= list.length) {
        return prev;
      }
      const [movedItem] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, movedItem);
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', list, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: list
      };
    });
  };

  const movePlatformShowcase = (id: string, direction: 'up' | 'down') => {
    setSiteConfig(prev => {
      const list = [...(prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases)];
      const index = list.findIndex(p => p.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const [movedItem] = list.splice(index, 1);
      list.splice(targetIndex, 0, movedItem);
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', list, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: list
      };
    });
  };

  const pinPlatformShowcaseToTop = (id: string) => {
    setSiteConfig(prev => {
      const list = [...(prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases)];
      const index = list.findIndex(p => p.id === id);
      if (index <= 0) return prev;
      const [item] = list.splice(index, 1);
      list.unshift(item);
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', list, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: list
      };
    });
  };

  const addPlatformDesign = (platformId: string, design: ArchitectureDesignItem) => {
    setSiteConfig(prev => {
      const updatedList = (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId) {
          const existingDesigns = item.designs || [];
          return {
            ...item,
            designs: [design, ...existingDesigns]
          };
        }
        return item;
      });
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const updatePlatformDesign = (platformId: string, designId: string, updated: Partial<ArchitectureDesignItem>) => {
    setSiteConfig(prev => {
      const updatedList = (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.map(d => (d.id === designId ? { ...d, ...updated } : d))
          };
        }
        return item;
      });
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const deletePlatformDesign = (platformId: string, designId: string) => {
    setSiteConfig(prev => {
      const updatedList = (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.filter(d => d.id !== designId)
          };
        }
        return item;
      });
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const toggleDesignEnabled = (platformId: string, designId: string) => {
    setSiteConfig(prev => {
      const updatedList = (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.map(d =>
              d.id === designId ? { ...d, enabled: d.enabled === false ? true : false } : d
            )
          };
        }
        return item;
      });
      if (isAdmin) {
        adminService.saveSiteContent('platformShowcases', updatedList, 'Platform Showcases', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting platform showcases:', e));
      }
      return {
        ...prev,
        platformShowcases: updatedList
      };
    });
  };

  const updateHero = (hero: SiteConfig['hero']) => {
    setSiteConfig(prev => {
      const updated = {
        ...prev,
        hero
      };

      if (isAdmin) {
        adminService.saveSiteContent(
          'hero',
          hero,
          'Homepage Hero Section',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting hero:', e));
      }

      return updated;
    });
  };

  const addDiagram = (diagram: ArchitectureDiagram) => {
    setSiteConfig(prev => {
      const updatedList = [diagram, ...prev.diagrams];
      if (isAdmin) {
        adminService.saveSiteContent('diagrams', updatedList, 'Architecture Diagrams', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting diagrams:', e));
      }
      return {
        ...prev,
        diagrams: updatedList
      };
    });
  };

  const updateDiagram = (id: string, updated: Partial<ArchitectureDiagram>) => {
    setSiteConfig(prev => {
      const updatedList = prev.diagrams.map(d => (d.id === id ? { ...d, ...updated } : d));
      if (isAdmin) {
        adminService.saveSiteContent('diagrams', updatedList, 'Architecture Diagrams', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting diagrams:', e));
      }
      return {
        ...prev,
        diagrams: updatedList
      };
    });
  };

  const deleteDiagram = (id: string) => {
    setSiteConfig(prev => {
      const updatedList = prev.diagrams.filter(d => d.id !== id);
      if (isAdmin) {
        adminService.saveSiteContent('diagrams', updatedList, 'Architecture Diagrams', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting diagrams:', e));
      }
      return {
        ...prev,
        diagrams: updatedList
      };
    });
    if (selectedDiagram?.id === id) setSelectedDiagram(null);
  };

  const addVideo = (video: VideoItem) => {
    setSiteConfig(prev => {
      const updatedList = [video, ...prev.videos];
      if (isAdmin) {
        adminService.saveSiteContent('videos', updatedList, 'Video Masterclasses', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting videos:', e));
      }
      return {
        ...prev,
        videos: updatedList
      };
    });
  };

  const updateVideo = (id: string, updated: Partial<VideoItem>) => {
    setSiteConfig(prev => {
      const updatedList = prev.videos.map(v => (v.id === id ? { ...v, ...updated } : v));
      if (isAdmin) {
        adminService.saveSiteContent('videos', updatedList, 'Video Masterclasses', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting videos:', e));
      }
      return {
        ...prev,
        videos: updatedList
      };
    });
  };

  const deleteVideo = (id: string) => {
    setSiteConfig(prev => {
      const updatedList = prev.videos.filter(v => v.id !== id);
      if (isAdmin) {
        adminService.saveSiteContent('videos', updatedList, 'Video Masterclasses', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting videos:', e));
      }
      return {
        ...prev,
        videos: updatedList
      };
    });
    if (selectedVideo?.id === id) setSelectedVideo(null);
  };

  const addTutorial = (tutorial: TutorialArticle) => {
    setSiteConfig(prev => {
      const updatedList = [tutorial, ...prev.tutorials];
      if (isAdmin) {
        adminService.saveSiteContent('tutorials', updatedList, 'Tutorials & Articles', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting tutorials:', e));
      }
      return {
        ...prev,
        tutorials: updatedList
      };
    });
  };

  const updateTutorial = (id: string, updated: Partial<TutorialArticle>) => {
    setSiteConfig(prev => {
      const updatedList = prev.tutorials.map(t => (t.id === id ? { ...t, ...updated } : t));
      if (isAdmin) {
        adminService.saveSiteContent('tutorials', updatedList, 'Tutorials & Articles', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting tutorials:', e));
      }
      return {
        ...prev,
        tutorials: updatedList
      };
    });
  };

  const deleteTutorial = (id: string) => {
    setSiteConfig(prev => {
      const updatedList = prev.tutorials.filter(t => t.id !== id);
      if (isAdmin) {
        adminService.saveSiteContent('tutorials', updatedList, 'Tutorials & Articles', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting tutorials:', e));
      }
      return {
        ...prev,
        tutorials: updatedList
      };
    });
    if (selectedTutorial?.id === id) setSelectedTutorial(null);
  };

  // Case Study & Track Record CRUD
  const addCaseStudy = (study: CaseStudy) => {
    setSiteConfig(prev => {
      const updatedList = [study, ...(prev.caseStudies || INITIAL_SITE_DATA.caseStudies)];
      if (isAdmin) {
        adminService.saveSiteContent('caseStudies', updatedList, 'Case Studies & Track Records', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting case studies:', e));
      }
      return {
        ...prev,
        caseStudies: updatedList
      };
    });
  };

  const updateCaseStudy = (id: string, updated: Partial<CaseStudy>) => {
    setSiteConfig(prev => {
      const updatedList = (prev.caseStudies || INITIAL_SITE_DATA.caseStudies).map(s =>
        s.id === id ? { ...s, ...updated } : s
      );
      if (isAdmin) {
        adminService.saveSiteContent('caseStudies', updatedList, 'Case Studies & Track Records', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting case studies:', e));
      }
      return {
        ...prev,
        caseStudies: updatedList
      };
    });
  };

  const deleteCaseStudy = (id: string) => {
    setSiteConfig(prev => {
      const updatedList = (prev.caseStudies || INITIAL_SITE_DATA.caseStudies).filter(s => s.id !== id);
      if (isAdmin) {
        adminService.saveSiteContent('caseStudies', updatedList, 'Case Studies & Track Records', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting case studies:', e));
      }
      return {
        ...prev,
        caseStudies: updatedList
      };
    });
  };

  const reorderCaseStudies = (startIndex: number, endIndex: number) => {
    setSiteConfig(prev => {
      const list = [...(prev.caseStudies || INITIAL_SITE_DATA.caseStudies)];
      if (startIndex < 0 || startIndex >= list.length || endIndex < 0 || endIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, moved);
      if (isAdmin) {
        adminService.saveSiteContent('caseStudies', list, 'Case Studies & Track Records', user?.email || 'admin@zaboraa.com')
          .catch(e => console.warn('Notice persisting case studies:', e));
      }
      return {
        ...prev,
        caseStudies: list
      };
    });
  };

  const updateFounderCredentials = (founder: Partial<SiteConfig['founder']>) => {
    setSiteConfig(prev => {
      const updatedFounder = {
        ...prev.founder,
        ...founder
      };

      if (isAdmin) {
        adminService.saveSiteContent(
          'founder',
          updatedFounder,
          'Executive Founder Profile',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting founder credentials:', e));
      }

      return {
        ...prev,
        founder: updatedFounder
      };
    });
  };

  const updateHeroStats = (stats: SiteConfig['hero']['stats']) => {
    setSiteConfig(prev => {
      const updatedHero = {
        ...prev.hero,
        stats
      };

      if (isAdmin) {
        adminService.saveSiteContent(
          'hero',
          updatedHero,
          'Homepage Hero Section',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting hero stats:', e));
      }

      return {
        ...prev,
        hero: updatedHero
      };
    });
  };

  const updateHeroContent = (hero: Partial<SiteConfig['hero']>) => {
    setSiteConfig(prev => {
      const updatedHero = {
        ...prev.hero,
        ...hero
      };

      if (isAdmin) {
        adminService.saveSiteContent(
          'hero',
          updatedHero,
          'Homepage Hero Section',
          user?.email || 'admin@zaboraa.com'
        ).catch(e => console.warn('Notice persisting hero content:', e));
      }

      return {
        ...prev,
        hero: updatedHero
      };
    });
  };

  const resetToDefaults = () => {
    setSiteConfig(INITIAL_SITE_DATA);
    cleanOldStorageKeys();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const exportConfigJson = () => {
    return JSON.stringify(siteConfig, null, 2);
  };

  const importConfigJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.brand && parsed.founder && Array.isArray(parsed.diagrams)) {
        setSiteConfig(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON imported', e);
      return false;
    }
  };

  const savePersistentAdminSettings = async (
    updates: Partial<AdminSettings>,
    brandingUpdates?: { brandName?: string; brandTagline?: string; brandLogoUrl?: string }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const currentAdmin = siteConfig.adminSettings || INITIAL_SITE_DATA.adminSettings!;
      const updatedAdminSettings: AdminSettings = {
        ...currentAdmin,
        ...updates,
        featureControls: {
          ...(currentAdmin.featureControls || {
            exportDossier: true,
            exportExecutiveSummary: true,
            export4k: true,
            generateBlueprint: true
          }),
          ...(updates.featureControls || {})
        }
      };

      const newBrand = brandingUpdates?.brandName || siteConfig.brand;
      const newTagline = brandingUpdates?.brandTagline || siteConfig.brandTagline;
      const newLogo = brandingUpdates?.brandLogoUrl !== undefined ? brandingUpdates.brandLogoUrl : siteConfig.brandLogoUrl;

      const newConfig: SiteConfig = {
        ...siteConfig,
        brand: newBrand,
        brandTagline: newTagline,
        brandLogoUrl: newLogo,
        adminSettings: updatedAdminSettings
      };

      setSiteConfig(newConfig);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      } catch (e) {
        console.warn('Notice saving new config to localStorage:', e);
      }

      // Persist to Supabase app_settings & admin_feature_controls
      const result = await adminService.saveGlobalSettings(
        {
          branding: {
            brandName: newBrand,
            brandTagline: newTagline,
            brandLogoUrl: newLogo
          },
          announcement: {
            announcementBannerEnabled: updatedAdminSettings.announcementBannerEnabled ?? false,
            announcementText: updatedAdminSettings.announcementText,
            announcementLink: updatedAdminSettings.announcementLink
          },
          adminSettings: updatedAdminSettings,
          featureControls: updatedAdminSettings.featureControls,
          organization: {
            supportEmail: updatedAdminSettings.supportEmail,
            executiveContact: updatedAdminSettings.executiveContact,
            defaultCloudPlatform: updatedAdminSettings.defaultCloudPlatform,
            defaultVcpuOvercommit: updatedAdminSettings.defaultVcpuOvercommit,
            defaultRamBufferPercent: updatedAdminSettings.defaultRamBufferPercent,
            defaultTargetRpoMinutes: updatedAdminSettings.defaultTargetRpoMinutes,
            defaultTargetRtoHours: updatedAdminSettings.defaultTargetRtoHours,
            primaryRegion: updatedAdminSettings.primaryRegion,
            authRequiredForTools: updatedAdminSettings.authRequiredForTools,
            publicAccessEnabled: updatedAdminSettings.publicAccessEnabled,
            blueprintAccessMode: updatedAdminSettings.blueprintAccessMode || updatedAdminSettings.featureControls?.blueprintAccessMode || 'signed_in'
          }
        },
        user?.email || 'admin@zaboraa.com'
      );

      const hasSupabase = (import.meta as any).env?.VITE_SUPABASE_URL && 
        !(import.meta as any).env?.VITE_SUPABASE_URL.includes('mock-zaboraa');

      if (!hasSupabase) {
        return {
          success: true,
          message: 'Settings saved to local browser storage (Supabase environment variables are not configured).'
        };
      }

      if (!result.persistedToCloud) {
        return {
          success: false,
          message: `Failed to persist to Supabase cloud: ${result.cloudError || 'Cloud write did not complete'}. Changes saved to local browser cache only.`
        };
      }

      return {
        success: true,
        message: 'Settings, branding, and blueprint access controls successfully persisted to Supabase.'
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to persist settings.' };
    }
  };

  const syncAllContentToCloud = async (): Promise<{ success: boolean; message: string; persistedToCloud: boolean }> => {
    try {
      const rawPayload: Record<string, any> = {
        hero: siteConfig.hero,
        founder: siteConfig.founder,
        platformShowcases: siteConfig.platformShowcases,
        diagrams: siteConfig.diagrams,
        videos: siteConfig.videos,
        tutorials: siteConfig.tutorials,
        caseStudies: siteConfig.caseStudies,
        services: siteConfig.services,
        knowledgeBase: siteConfig.knowledgeBase,
        misc: {
          featuredVideoId: siteConfig.featuredVideoId,
          enableHotspots: siteConfig.enableHotspots,
          watermark: siteConfig.watermark
        }
      };

      // Upload any embedded images to Supabase Storage so only short URLs are stored
      const original = { payload: rawPayload, logo: siteConfig.brandLogoUrl };
      const cleaned: any = await externalizeImages(original);
      const payload: Record<string, any> = cleaned.payload;
      const brandLogoUrl: string | undefined = cleaned.logo;

      if (JSON.stringify(cleaned) !== JSON.stringify(original)) {
        setSiteConfig(prev => ({
          ...prev,
          hero: payload.hero,
          founder: payload.founder,
          platformShowcases: payload.platformShowcases,
          diagrams: payload.diagrams,
          videos: payload.videos,
          tutorials: payload.tutorials,
          caseStudies: payload.caseStudies,
          services: payload.services,
          knowledgeBase: payload.knowledgeBase,
          featuredVideoId: payload.misc?.featuredVideoId,
          enableHotspots: payload.misc?.enableHotspots,
          watermark: payload.misc?.watermark,
          brandLogoUrl
        }));
      }

      const result = await adminService.saveGlobalSettings(
        {
          branding: {
            brandName: siteConfig.brand || brandName,
            brandTagline: siteConfig.brandTagline,
            brandLogoUrl
          },
          announcement: {
            announcementBannerEnabled: siteConfig.adminSettings?.announcementBannerEnabled ?? false,
            announcementText: siteConfig.adminSettings?.announcementText,
            announcementLink: siteConfig.adminSettings?.announcementLink
          },
          adminSettings: siteConfig.adminSettings,
          featureControls: siteConfig.adminSettings?.featureControls,
          organization: {
            defaultCloudPlatform: siteConfig.adminSettings?.defaultCloudPlatform,
            supportEmail: siteConfig.adminSettings?.supportEmail,
            executiveContact: siteConfig.adminSettings?.executiveContact,
            defaultVcpuOvercommit: siteConfig.adminSettings?.defaultVcpuOvercommit,
            defaultRamBufferPercent: siteConfig.adminSettings?.defaultRamBufferPercent,
            defaultTargetRpoMinutes: siteConfig.adminSettings?.defaultTargetRpoMinutes,
            defaultTargetRtoHours: siteConfig.adminSettings?.defaultTargetRtoHours,
            primaryRegion: siteConfig.adminSettings?.primaryRegion,
            authRequiredForTools: siteConfig.adminSettings?.authRequiredForTools,
            publicAccessEnabled: siteConfig.adminSettings?.publicAccessEnabled,
            blueprintAccessMode: siteConfig.adminSettings?.blueprintAccessMode || siteConfig.adminSettings?.featureControls?.blueprintAccessMode || 'signed_in'
          },
          siteContent: payload
        },
        user?.email || 'admin@zaboraa.com'
      );

      return {
        success: result.success,
        message: result.persistedToCloud
          ? 'All site content, showcases, diagrams, and settings synchronized to Supabase Cloud.'
          : (result.cloudError || 'Content saved to local browser cache only.'),
        persistedToCloud: result.persistedToCloud
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Synchronization failed',
        persistedToCloud: false
      };
    }
  };

  const lastSyncedRef = useRef<string>('');

  // Auto-save: any admin change is uploaded to Supabase (images to Storage, content to site_content/app_settings)
  useEffect(() => {
    if (!isAdmin || !isHydrated || !isSupabaseConfigured) return;

    const snapshot = JSON.stringify({
      c: [
        siteConfig.hero, siteConfig.founder, siteConfig.platformShowcases, siteConfig.diagrams,
        siteConfig.videos, siteConfig.tutorials, siteConfig.caseStudies, siteConfig.services,
        siteConfig.knowledgeBase, siteConfig.featuredVideoId, siteConfig.enableHotspots, siteConfig.watermark
      ],
      b: [siteConfig.brand, siteConfig.brandTagline, siteConfig.brandLogoUrl],
      a: siteConfig.adminSettings
    });

    // First run after loading from Supabase: remember the state, don't save
    if (!lastSyncedRef.current) {
      lastSyncedRef.current = snapshot;
      return;
    }
    if (snapshot === lastSyncedRef.current) return;

    const timer = setTimeout(async () => {
      lastSyncedRef.current = snapshot;
      const result = await syncAllContentToCloud();
      if (!result.persistedToCloud) {
        lastSyncedRef.current = ''; // retry on the next change
        console.error('Auto-save to Supabase failed:', result.message);
        alert('Your last change could NOT be saved to Supabase: ' + result.message);
      }
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteConfig, isAdmin, isHydrated]);

  return (
    <CustomizationContext.Provider
      value={{
        siteConfig,
        theme,
        toggleTheme,
        setTheme,
        isAdmin,
        setIsAdmin,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        isAdminDashboardOpen,
        setIsAdminDashboardOpen,
        isReconciliationOpen,
        setIsReconciliationOpen,
        isOfflineEmergencyOpen,
        setIsOfflineEmergencyOpen,
        isWatermarkModalOpen,
        setIsWatermarkModalOpen,
        verifyAdminPasscode,
        signOutAdmin,
        updateWatermarkConfig,
        updateEnableHotspots,
        updateAdminSettings,
        featureControls,
        updateFeatureControls,
        isCustomizerOpen,
        setIsCustomizerOpen,
        isPhotoEditorOpen,
        setIsPhotoEditorOpen,
        activeEditPlatformId,
        setActiveEditPlatformId,
        isBriefingModalOpen,
        setIsBriefingModalOpen,
        isSearchOpen,
        setIsSearchOpen,
        selectedTutorial,
        setSelectedTutorial,
        selectedDiagram,
        setSelectedDiagram,
        selectedVideo,
        setSelectedVideo,
        brandName,
        brandLogoUrl,
        updateBranding,
        updateGeneralInfo,
        updateFounderPhoto,
        setFeaturedVideoId,
        updatePlatformShowcase,
        addPlatformShowcase,
        deletePlatformShowcase,
        togglePlatformEnabled,
        reorderPlatformShowcases,
        movePlatformShowcase,
        pinPlatformShowcaseToTop,
        addPlatformDesign,
        updatePlatformDesign,
        deletePlatformDesign,
        toggleDesignEnabled,
        updateHero,
        addDiagram,
        updateDiagram,
        deleteDiagram,
        addVideo,
        updateVideo,
        deleteVideo,
        addTutorial,
        updateTutorial,
        deleteTutorial,

        // Case Study & Track Record Management
        isTrackRecordModalOpen,
        setIsTrackRecordModalOpen,
        activeEditCaseStudy,
        setActiveEditCaseStudy,
        addCaseStudy,
        updateCaseStudy,
        deleteCaseStudy,
        reorderCaseStudies,

        // Founder & Homepage Fields Management
        isFounderModalOpen,
        setIsFounderModalOpen,
        updateFounderCredentials,
        isHeroStatsModalOpen,
        setIsHeroStatsModalOpen,
        updateHeroStats,
        updateHeroContent,

        resetToDefaults,
        exportConfigJson,
        importConfigJson,
        savePersistentAdminSettings,
        refreshRemoteSettings,
        syncAllContentToCloud,
        isHydrated
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};
