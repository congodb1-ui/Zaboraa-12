import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';

interface ZaboraaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  brandName?: string;
  logoUrl?: string;
}

export const ZaboraaLogoMark: React.FC<{
  sizeClass?: string;
  glow?: boolean;
  logoUrl?: string;
  altText?: string;
}> = ({
  sizeClass = 'w-9 h-9 sm:w-10 sm:h-10',
  glow = true,
  logoUrl: propLogoUrl,
  altText
}) => {
  const { brandLogoUrl, brandName } = useCustomization();
  const effectiveLogoUrl = propLogoUrl !== undefined ? propLogoUrl : brandLogoUrl;
  const [imageError, setImageError] = useState(false);

  // If a custom logo image URL is configured and has not failed to load, render the custom image
  if (effectiveLogoUrl && !imageError) {
    return (
      <div
        className={`relative ${sizeClass} rounded-xl bg-slate-900/90 p-1 border border-cyan-500/30 group-hover:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <img
          src={effectiveLogoUrl}
          alt={altText || brandName || 'Brand Logo'}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    );
  }

  // Otherwise, render the distinctive isometric SVG monogram mark
  return (
    <div
      className={`relative ${sizeClass} rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-1 border border-cyan-500/30 group-hover:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {/* Ambient glass sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-transparent to-indigo-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Custom Isometric Multi-Cloud Architectural Monogram SVG */}
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(6,182,212,0.6)]"
      >
        <defs>
          <linearGradient id="zabGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="zabGradIndigo" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="zabGradViolet" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <radialGradient id="zabCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>
        </defs>

        {/* Outer Isometric Hexagonal Defense Shield */}
        <polygon
          points="22,3 39,12.5 39,31.5 22,41 5,31.5 5,12.5"
          stroke="url(#zabGradCyan)"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          fill="rgba(2, 6, 23, 0.6)"
        />

        {/* Subtle Internal Wireframe Mesh */}
        <line x1="22" y1="3" x2="22" y2="41" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="2 2" />
        <line x1="5" y1="22" x2="39" y2="22" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="2 2" />

        {/* Dynamic 'Z' Monogram - Upper Bar */}
        <path
          d="M12 12.5H32L27.5 17.5H16.5L12 12.5Z"
          fill="url(#zabGradCyan)"
        />

        {/* Dynamic 'Z' Monogram - Central High-Speed Transit Blade */}
        <path
          d="M29.5 15.5L14.5 28.5H19.5L34.5 15.5H29.5Z"
          fill="url(#zabGradIndigo)"
        />

        {/* Dynamic 'Z' Monogram - Lower Baseline */}
        <path
          d="M12 26.5L16.5 31.5H32L27.5 26.5H12Z"
          fill="url(#zabGradViolet)"
        />

        {/* Central Interconnect Core Routing Crystal */}
        <circle cx="22" cy="22" r="3.2" fill="url(#zabCoreGlow)" />
        <circle cx="22" cy="22" r="5.5" stroke="#22d3ee" strokeWidth="0.9" strokeOpacity="0.7" className="animate-pulse" />

        {/* Precision Micro-Telemetry Satellite Nodes */}
        <circle cx="12" cy="12.5" r="1.5" fill="#38bdf8" />
        <circle cx="32" cy="12.5" r="1.5" fill="#22d3ee" />
        <circle cx="32" cy="31.5" r="1.5" fill="#818cf8" />
        <circle cx="12" cy="31.5" r="1.5" fill="#06b6d4" />
      </svg>
    </div>
  );
};

export const BrandLogoMark = ZaboraaLogoMark;

export const ZaboraaLogo: React.FC<ZaboraaLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
  brandName: propBrandName,
  logoUrl: propLogoUrl
}) => {
  const { brandName: contextBrandName, brandLogoUrl: contextLogoUrl, siteConfig } = useCustomization();
  const effectiveBrandName = propBrandName || contextBrandName || 'Zaboraa';
  const effectiveLogoUrl = propLogoUrl || contextLogoUrl;

  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-12 sm:h-12'
  };

  // Split words for modern high-tech wordmark styling
  const words = effectiveBrandName.trim().split(/\s+/);
  const primaryWord = words[0] || effectiveBrandName;
  const secondaryWord = words.slice(1).join(' ');

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <ZaboraaLogoMark sizeClass={sizeMap[size]} logoUrl={effectiveLogoUrl} altText={effectiveBrandName} />

      {showText && (
        <span className="flex flex-col tracking-tight">
          <span className="flex items-center gap-1.5 leading-none">
            <span className="text-base sm:text-lg font-black tracking-tight text-white font-sans group-hover:text-cyan-300 transition-colors uppercase">
              {primaryWord}
            </span>
            {secondaryWord && (
              <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase shadow-sm group-hover:border-cyan-400 group-hover:bg-cyan-900/60 transition-all">
                {secondaryWord}
              </span>
            )}
          </span>
          {showSubtitle && (
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-semibold mt-1 group-hover:text-cyan-300/80 transition-colors hidden sm:block">
              {siteConfig.brandTagline || 'Enterprise VMware Architecture'}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export const BrandLogo = ZaboraaLogo;
