import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';

import {
  Search,
  Sliders,
  Calendar,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  Cpu,
  FileSpreadsheet,
  ShieldAlert,
  HardDrive,
  BookOpen,
  Film,
  FileText,
  ExternalLink,
  Network,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { ZaboraaLogoMark } from './ZaboraaLogo';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    siteConfig,
    brandName,
    theme,
    toggleTheme,
    isAdmin,
    setIsAdminDashboardOpen,
    setIsCustomizerOpen,
    setIsBriefingModalOpen,
    setIsSearchOpen
  } = useCustomization();

  const { user: authUser, subscriptionTier: licenseTier, setIsCommercializeModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'disciplines' | 'tools' | 'resources' | null>(null);

  // Close dropdowns on outside click or navigation
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (key: 'disciplines' | 'tools' | 'resources') => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 transition-colors text-xs font-semibold py-1 px-2.5 rounded-md ${
      isActive
        ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div
        ref={navRef}
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-6 relative"
      >
        {/* Subtle ambient brand glow in navbar */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-48 h-8 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Zone 1: Brand Wordmark & Architectural Emblem */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 relative z-10">
          <ZaboraaLogoMark sizeClass="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="flex flex-col tracking-tight select-none">
            <span className="flex items-center gap-1.5 leading-none">
              <span className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white font-sans group-hover:text-cyan-300 transition-colors uppercase">
                {brandName.trim().split(/\s+/)[0] || brandName}
              </span>
              {brandName.trim().split(/\s+/).slice(1).join(' ') && (
                <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase shadow-sm group-hover:border-cyan-400 group-hover:bg-cyan-900/60 transition-all">
                  {brandName.trim().split(/\s+/).slice(1).join(' ')}
                </span>
              )}
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-semibold mt-1 group-hover:text-cyan-300/80 transition-colors hidden xl:block">
              {siteConfig.brandTagline || 'Multi-Cloud VMware Architecture'}
            </span>
          </span>
        </Link>

        {/* Zone 2: Navigation Links & Accessible Dropdowns */}
        <nav className="hidden xl:flex items-center gap-1.5 xl:gap-2.5 text-xs font-semibold text-slate-300">
          {/* Disciplines Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('disciplines')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/disciplines') || openDropdown === 'disciplines'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>Disciplines</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'disciplines' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'disciplines' && (
              <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-800/80 mb-1">
                  Cloud Architectures
                </div>
                {(siteConfig.platformShowcases || []).map(p => (
                  <Link
                    key={p.id}
                    to={`/disciplines/${p.id}`}
                    className="flex flex-col px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                        {p.title}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400/80">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">
                      {p.platform}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('tools')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/tools') || openDropdown === 'tools'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'tools' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'tools' && (
              <div className="absolute top-full left-0 mt-2 w-80 p-2 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                <Link
                  to="/tools"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors text-xs font-bold text-cyan-400 border-b border-slate-800/80 pb-2 mb-1"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Workbench Overview Hub</span>
                </Link>
                <Link
                  to="/tools/sizing"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <HardDrive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                      Node & Decoupled Storage Sizing
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ANF / FSx ONTAP node reduction estimator
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/rvtools-analyzer"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                      RVTools Migration Readiness Engine
                    </div>
                    <div className="text-[10px] text-slate-400">
                      In-browser .xlsx parser & HCX wave mapping
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/nutanix-nc2-assessment"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Cpu className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                      Nutanix NC2 on Azure Assessment
                    </div>
                    <div className="text-[10px] text-slate-400">
                      AHV VirtIO audit & Azure bare-metal node sizing
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/aria-networks"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Network className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      Aria Networks (vRNI) Data Engine
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Flow analytics, app tiers & NSX DFW rules
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/dr-planner"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400">
                      DR RPO/RTO & Replication Calculator
                    </div>
                    <div className="text-[10px] text-slate-400">
                      WAN bandwidth & SRM protection groups
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/design-generator"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Layers className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">
                      Automated Hybrid Blueprint Generator
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Dynamic BOM deliverable & 4K UHD export
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Direct Link: Roadmap */}
          <NavLink to="/roadmap" className={navLinkClass}>
            Roadmap
          </NavLink>

          {/* Knowledge Hub Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('resources')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/resources') || openDropdown === 'resources'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>Knowledge Hub</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'resources' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'resources' && (
              <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                <Link
                  to="/resources"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors text-xs font-bold text-cyan-400 border-b border-slate-800/80 pb-2 mb-1"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>All Resources Portal</span>
                </Link>
                <Link
                  to="/resources/kb"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                      KB Production Runbooks
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Verified operational fix playbooks
                    </div>
                  </div>
                </Link>
                <Link
                  to="/resources/tutorials"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                      Software Tutorials & Automation
                    </div>
                    <div className="text-[10px] text-slate-400">
                      PowerCLI and IaC architecture guides
                    </div>
                  </div>
                </Link>
                <Link
                  to="/resources/videos"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Film className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">
                      Video Masterclasses Archive
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Architectural walkthroughs & demos
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Direct Link: Case Studies */}
          <NavLink to="/case-studies" className={navLinkClass}>
            Case Studies
          </NavLink>

          {/* Direct Link: About */}
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>

          {/* Admin Console Tab (Visible whenever user logs in with admin account) */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 transition-colors text-xs font-bold py-1.5 px-3 rounded-md flex items-center gap-1.5 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/90 border border-cyan-500/60 shadow-sm'
                    : 'text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40 border border-cyan-500/30'
                }`
              }
              title="Enterprise Administrative Control Center"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Console</span>
            </NavLink>
          )}
        </nav>

        {/* Zone 3: Primary Actions & Admin & Theme & Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>

          {/* Search Button (Ctrl+K) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Search across all platforms, tools, and runbooks (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Admin Controls (When logged in with admin account) */}
          {isAdmin && (
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 rounded-lg transition-colors cursor-pointer"
                title="Open Administrative Console"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Console</span>
              </Link>
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Open site customizer drawer (Watermark & Hotspot controls)"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Site</span>
              </button>
            </div>
          )}

          {/* User Account / Sign In Trigger (Zero Tiers) */}
          <button
            onClick={() => setIsCommercializeModalOpen(true)}
            className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
              authUser
                ? 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Enterprise Architect Account & SSO Session"
          >
            {authUser ? (
              <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-cyan-400/50 bg-cyan-950">
                {authUser.photoURL ? (
                  <img
                    src={authUser.photoURL}
                    alt={authUser.displayName || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-center font-bold text-cyan-300 text-[10px] leading-none">
                    {(authUser.displayName || authUser.email || 'A').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="truncate max-w-[100px] lg:max-w-[130px]">
              {authUser ? (authUser.displayName?.split(' ')[0] || 'Architect') : 'Sign In'}
            </span>
          </button>

          {/* Primary CTA Button: Book Briefing (Visible on md+ screens, available in mobile drawer on small screens) */}
          <button
            onClick={() => setIsBriefingModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-sm hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
            title="Schedule an Executive Architecture Briefing"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Book Briefing</span>
          </button>

          {/* Mobile Menu Hamburger - Always guaranteed visible with 44px touch hitbox */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-slate-200 hover:text-white rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shrink-0 shadow-sm"
            aria-label="Toggle navigation menu"
            title="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-4 max-h-[82vh] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* Top Quick Actions on Mobile */}
          <div className="space-y-2 pt-1 pb-2 border-b border-slate-800/80">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsBriefingModalOpen(true);
              }}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Architecture Briefing</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCommercializeModalOpen(true);
              }}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{authUser ? `Architect Session: ${authUser.displayName || authUser.email}` : 'Sign In / Single Sign-On'}</span>
            </button>

            {isAdmin && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <span>Admin Console</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCustomizerOpen(true);
                  }}
                  className="h-10 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Edit Site</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Mobile Navigation Links */}
          <div className="space-y-1">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
            >
              Home Overview
            </NavLink>
            <NavLink
              to="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-bold text-cyan-400 hover:bg-slate-900 transition-colors"
            >
              Engineering Workbench (6 Production Calculators)
            </NavLink>
            <div className="pl-4 space-y-1.5 text-xs text-slate-300">
              <Link to="/tools/sizing" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-cyan-300">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Node & Storage Decoupling Sizer</span>
              </Link>
              <Link to="/tools/rvtools-analyzer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-emerald-300">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>RVTools Migration Readiness Engine</span>
              </Link>
              <Link to="/tools/nutanix-nc2-assessment" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-emerald-300">
                <Cpu className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Nutanix NC2 on Azure Assessment</span>
              </Link>
              <Link to="/tools/aria-networks" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-cyan-300">
                <Network className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>Aria Networks & DFW Rules Planner</span>
              </Link>
              <Link to="/tools/dr-planner" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>DR RPO/RTO & WAN Calculator</span>
              </Link>
              <Link to="/tools/design-generator" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1 hover:text-indigo-300 font-semibold text-cyan-300">
                <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Automated 4K Blueprint Generator</span>
              </Link>
            </div>

            <NavLink
              to="/roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
            >
              Migration Roadmap (9-Stage Lifecycle)
            </NavLink>
            <NavLink
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
            >
              Knowledge Hub (KB Runbooks, Tutorials & Videos)
            </NavLink>
            <NavLink
              to="/case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
            >
              Verified Case Studies
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
            >
              About Lead Principal Architect Wasim Sayyed
            </NavLink>
          </div>

          {/* Architectural Disciplines Grid in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="font-mono text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              Hyperscaler & Software-Defined Platforms
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(siteConfig.platformShowcases || []).map(p => (
                <Link
                  key={p.id}
                  to={`/disciplines/${p.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <div className="font-bold truncate text-slate-200">{p.platform}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.badge}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
