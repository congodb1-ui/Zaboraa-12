import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, ArchitectureDiagram, VideoItem, TutorialArticle, ServicePillar, CaseStudy, PhotoStyle, PlatformShowcase, ArchitectureDesignItem, WatermarkConfig, AdminSettings, FeatureControlsConfig } from '../types/siteData';
import { INITIAL_SITE_DATA } from '../data/initialData';
import { useAuth, isUserAdminEmail } from './AuthContext';
import { adminService } from '../services/adminService';

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
                                  'everyone';
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
    setSiteConfig(prev => ({
      ...prev,
      adminSettings: {
        ...(prev.adminSettings || INITIAL_SITE_DATA.adminSettings!),
        ...cfg
      }
    }));
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

  // Remote Hydration: Asynchronously fetch persistent settings from Supabase
  const applyRemoteSettings = (remote: any) => {
    if (!remote || (!remote.branding && !remote.featureControls && !remote.organization && !remote.siteContent)) {
      return;
    }

    setSiteConfig((prev) => {
      const currentAdminSettings = prev.adminSettings || INITIAL_SITE_DATA.adminSettings!;
      const rawAccessMode = remote.organization?.blueprintAccessMode ||
                            remote.featureControls?.blueprintAccessMode ||
                            currentAdminSettings.blueprintAccessMode ||
                            'everyone';

      const merged: SiteConfig = {
        ...prev,
        brand: remote.branding?.brandName || prev.brand,
        brandTagline: remote.branding?.brandTagline || prev.brandTagline,
        brandLogoUrl: remote.branding?.brandLogoUrl !== undefined ? remote.branding.brandLogoUrl : prev.brandLogoUrl,
        founder: remote.siteContent?.founder ? { ...prev.founder, ...remote.siteContent.founder } : prev.founder,
        hero: remote.siteContent?.hero ? { ...prev.hero, ...remote.siteContent.hero } : prev.hero,
        adminSettings: {
          ...currentAdminSettings,
          brandName: remote.branding?.brandName || currentAdminSettings.brandName,
          brandLogoUrl: remote.branding?.brandLogoUrl !== undefined ? remote.branding.brandLogoUrl : currentAdminSettings.brandLogoUrl,
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
          featureControls: {
            ...(currentAdminSettings.featureControls || {
              exportDossier: true,
              exportExecutiveSummary: true,
              export4k: true,
              generateBlueprint: true,
              blueprintAccessMode: 'everyone'
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
      const remote = await adminService.getGlobalSettings();
      applyRemoteSettings(remote);
    } catch (e) {
      console.warn('Notice refreshing remote settings:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const hydrateRemoteSettings = async () => {
      try {
        const remote = await adminService.getGlobalSettings();
        if (!isMounted) return;
        applyRemoteSettings(remote);
      } catch (e) {
        console.warn('Notice hydrating remote settings:', e);
      }
    };

    hydrateRemoteSettings();
    return () => {
      isMounted = false;
    };
  }, []);

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
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item =>
        item.id === id ? { ...item, ...updated } : item
      )
    }));
  };

  const addPlatformShowcase = (platform: PlatformShowcase) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: [...(prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases), platform]
    }));
  };

  const deletePlatformShowcase = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).filter(item => item.id !== id)
    }));
  };

  const togglePlatformEnabled = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item =>
        item.id === id ? { ...item, enabled: item.enabled === false ? true : false } : item
      )
    }));
  };

  const reorderPlatformShowcases = (startIndex: number, endIndex: number) => {
    setSiteConfig(prev => {
      const list = [...(prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases)];
      if (startIndex < 0 || startIndex >= list.length || endIndex < 0 || endIndex >= list.length) {
        return prev;
      }
      const [movedItem] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, movedItem);
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
      return {
        ...prev,
        platformShowcases: list
      };
    });
  };

  const addPlatformDesign = (platformId: string, design: ArchitectureDesignItem) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId) {
          const existingDesigns = item.designs || [];
          return {
            ...item,
            designs: [design, ...existingDesigns]
          };
        }
        return item;
      })
    }));
  };

  const updatePlatformDesign = (platformId: string, designId: string, updated: Partial<ArchitectureDesignItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.map(d => (d.id === designId ? { ...d, ...updated } : d))
          };
        }
        return item;
      })
    }));
  };

  const deletePlatformDesign = (platformId: string, designId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.filter(d => d.id !== designId)
          };
        }
        return item;
      })
    }));
  };

  const toggleDesignEnabled = (platformId: string, designId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      platformShowcases: (prev.platformShowcases || INITIAL_SITE_DATA.platformShowcases).map(item => {
        if (item.id === platformId && item.designs) {
          return {
            ...item,
            designs: item.designs.map(d =>
              d.id === designId ? { ...d, enabled: d.enabled === false ? true : false } : d
            )
          };
        }
        return item;
      })
    }));
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
    setSiteConfig(prev => ({
      ...prev,
      diagrams: [diagram, ...prev.diagrams]
    }));
  };

  const updateDiagram = (id: string, updated: Partial<ArchitectureDiagram>) => {
    setSiteConfig(prev => ({
      ...prev,
      diagrams: prev.diagrams.map(d => (d.id === id ? { ...d, ...updated } : d))
    }));
  };

  const deleteDiagram = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      diagrams: prev.diagrams.filter(d => d.id !== id)
    }));
    if (selectedDiagram?.id === id) setSelectedDiagram(null);
  };

  const addVideo = (video: VideoItem) => {
    setSiteConfig(prev => ({
      ...prev,
      videos: [video, ...prev.videos]
    }));
  };

  const updateVideo = (id: string, updated: Partial<VideoItem>) => {
    setSiteConfig(prev => ({
      ...prev,
      videos: prev.videos.map(v => (v.id === id ? { ...v, ...updated } : v))
    }));
  };

  const deleteVideo = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }));
    if (selectedVideo?.id === id) setSelectedVideo(null);
  };

  const addTutorial = (tutorial: TutorialArticle) => {
    setSiteConfig(prev => ({
      ...prev,
      tutorials: [tutorial, ...prev.tutorials]
    }));
  };

  const updateTutorial = (id: string, updated: Partial<TutorialArticle>) => {
    setSiteConfig(prev => ({
      ...prev,
      tutorials: prev.tutorials.map(t => (t.id === id ? { ...t, ...updated } : t))
    }));
  };

  const deleteTutorial = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      tutorials: prev.tutorials.filter(t => t.id !== id)
    }));
    if (selectedTutorial?.id === id) setSelectedTutorial(null);
  };

  // Case Study & Track Record CRUD
  const addCaseStudy = (study: CaseStudy) => {
    setSiteConfig(prev => ({
      ...prev,
      caseStudies: [study, ...(prev.caseStudies || INITIAL_SITE_DATA.caseStudies)]
    }));
  };

  const updateCaseStudy = (id: string, updated: Partial<CaseStudy>) => {
    setSiteConfig(prev => ({
      ...prev,
      caseStudies: (prev.caseStudies || INITIAL_SITE_DATA.caseStudies).map(s =>
        s.id === id ? { ...s, ...updated } : s
      )
    }));
  };

  const deleteCaseStudy = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      caseStudies: (prev.caseStudies || INITIAL_SITE_DATA.caseStudies).filter(s => s.id !== id)
    }));
  };

  const reorderCaseStudies = (startIndex: number, endIndex: number) => {
    setSiteConfig(prev => {
      const list = [...(prev.caseStudies || INITIAL_SITE_DATA.caseStudies)];
      if (startIndex < 0 || startIndex >= list.length || endIndex < 0 || endIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, moved);
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
            blueprintAccessMode: updatedAdminSettings.blueprintAccessMode || updatedAdminSettings.featureControls?.blueprintAccessMode || 'everyone'
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
        refreshRemoteSettings
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
