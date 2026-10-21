import React, { useState, useEffect, useRef } from 'react';
import { DiagramHotspot, getHotspotsForDesign } from '../data/diagramHotspotsData';
import { ComponentInspectorModal } from './ComponentInspectorModal';
import { useCustomization } from '../context/CustomizationContext';
import {
  Maximize2,
  Minimize2,
  Layers,
  ShieldCheck,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronRight
} from 'lucide-react';

interface InteractiveHotspotImageProps {
  imageUrl: string;
  designId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  customHotspots?: DiagramHotspot[];
  onEnlarge?: () => void;
  className?: string;
}

export const InteractiveHotspotImage: React.FC<InteractiveHotspotImageProps> = ({
  imageUrl,
  designId,
  title,
  subtitle,
  description,
  customHotspots,
  onEnlarge,
  className = ''
}) => {
  const { siteConfig, brandName } = useCustomization();
  
  // Admin top setting: globally display or hide interactive hotspots
  // If disabled from top setting, it must not show hotspot anymore anywhere!
  const isGloballyEnabled = siteConfig.enableHotspots === true;

  // Diagram-level hotspot interaction state
  const [selectedHotspot, setSelectedHotspot] = useState<DiagramHotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<DiagramHotspot | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>(imageUrl);
  
  // Full-screen distraction-free state
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // When diagram or subsection changes, reset image source and zoom
  useEffect(() => {
    setCurrentSrc(imageUrl);
    setHoveredHotspot(null);
    setSelectedHotspot(null);
    setZoomLevel(1);
  }, [imageUrl, designId]);

  // Handle keyboard shortcuts when in fullscreen mode
  useEffect(() => {
    if (!isFullScreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
        setZoomLevel(1);
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel(z => Math.min(2.5, Number((z + 0.25).toFixed(2))));
      } else if (e.key === '-') {
        setZoomLevel(z => Math.max(0.75, Number((z - 0.25).toFixed(2))));
      } else if (e.key === '0') {
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, isGloballyEnabled]);

  // Resolve distinct hotspots specific to this exact subsection diagram and image
  const hotspots: DiagramHotspot[] = isGloballyEnabled
    ? (customHotspots || getHotspotsForDesign(designId, imageUrl))
    : [];

  // Watermark configuration from siteConfig
  const watermark = siteConfig.watermark;
  const isWatermarkEnabled = watermark?.enabled ?? true;

  const getWatermarkPositionClasses = (position?: string) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4 text-left';
      case 'top-right':
        return 'top-4 right-4 text-right';
      case 'bottom-left':
        return 'bottom-4 left-4 text-left';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4 text-right';
    }
  };

  const handleOpenFullScreen = () => {
    if (onEnlarge) {
      onEnlarge();
      return;
    }
    setIsFullScreen(true);
    setZoomLevel(1);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(z => Math.min(2.5, Number((z + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel(z => Math.max(0.75, Number((z - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Reusable hotspot pins renderer for both inline canvas and full-screen window
  const renderHotspotPins = (scaleModifier: number = 1) => {
    if (!isGloballyEnabled || hotspots.length === 0) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        {hotspots.map((spot, idx) => {
          const isHovered = hoveredHotspot?.id === spot.id;
          return (
            <div
              key={spot.id}
              style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            >
              {/* Discrete, unobtrusive pin: small 16-18px numbered dot, NO large icons, NO floating text label on diagram */}
              <button
                type="button"
                onClick={() => setSelectedHotspot(spot)}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className="relative flex items-center justify-center group focus:outline-none cursor-pointer"
                aria-label={`Inspect ${spot.name}`}
              >
                {/* Subtle pulse ring */}
                <span className="absolute -inset-1 rounded-full bg-cyan-400/40 animate-ping opacity-60 pointer-events-none" />

                {/* Small discrete numbered badge */}
                <span
                  style={{ transform: `scale(${scaleModifier})` }}
                  className="relative flex items-center justify-center w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-cyan-400 text-slate-950 font-mono font-bold text-[9px] shadow-lg border border-white/90 group-hover:scale-125 group-hover:bg-white group-hover:text-cyan-600 transition-all duration-150"
                >
                  {idx + 1}
                </span>
              </button>

              {/* Clean inspection tooltip on hover only */}
              {isHovered && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-64 p-2.5 rounded-xl bg-slate-900/98 border border-cyan-500/70 shadow-2xl backdrop-blur-md text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                      {spot.category}
                    </span>
                    <span className="text-[9px] text-cyan-300 font-mono font-semibold flex items-center gap-1">
                      <span>Click to Inspect</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-tight mb-1">{spot.name}</div>
                  <div className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                    {spot.shortDescription}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Reusable watermark overlay
  const renderWatermark = () => {
    if (!isWatermarkEnabled) return null;
    return (
      <div
        className={`absolute pointer-events-none z-10 transition-opacity select-none ${getWatermarkPositionClasses(
          watermark?.position
        )}`}
        style={{ opacity: watermark?.opacity ?? 0.35 }}
      >
        {watermark?.type === 'image' && watermark?.imageUrl ? (
          <img
            src={watermark.imageUrl}
            alt="Architecture Watermark"
            className="max-h-9 sm:max-h-12 w-auto object-contain filter drop-shadow-md"
          />
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-700/60 backdrop-blur-[2px] text-[10px] sm:text-xs font-mono font-bold tracking-widest text-slate-300 uppercase shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{watermark?.text || `${(brandName || siteConfig.brand || 'ENTERPRISE').toUpperCase()} · ARCHITECTURE BLUEPRINT`}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Standard In-Page Visual Canvas Container - Click anywhere to open in full screen */}
      <div
        onClick={handleOpenFullScreen}
        className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group select-none cursor-pointer"
        title="Click diagram to open in high-resolution full screen"
      >
        {/* Base Architectural Image with optional Ken Burns and hover zoom */}
        <img
          src={currentSrc}
          alt={title}
          referrerPolicy="no-referrer"
          onError={() => {
            if (currentSrc.startsWith('/src/assets/images/')) {
              setCurrentSrc(currentSrc.replace('/src/assets/images/', '/assets/images/'));
            } else if (currentSrc.startsWith('/assets/images/')) {
              setCurrentSrc('/src' + currentSrc);
            }
          }}
          className="w-full h-full object-contain bg-slate-950 transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Hover click-to-expand pill cue */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-cyan-500/50 backdrop-blur-md text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-xl">
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span>Click to Expand Full Screen</span>
          </div>
        </div>

        {/* Watermark Overlay */}
        {renderWatermark()}

        {/* Top Control Bar: Title badge + Full Screen */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-20">
          <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-700/80 backdrop-blur-md text-xs font-mono text-slate-200 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold truncate max-w-[160px] sm:max-w-xs">{title}</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {/* Full Screen Mode Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenFullScreen();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-slate-200 hover:text-white backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-md"
              title="View in distraction-free full screen mode"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          </div>
        </div>

        {/* Discrete Pins in Standard View (Rendered only if globally enabled AND user enabled on this diagram) */}
        {renderHotspotPins(1)}
      </div>

      {/* Component Quick Bar (Shown when globally enabled and components exist) */}
      {isGloballyEnabled && hotspots.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 uppercase text-[11px] flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blueprint Components ({hotspots.length}): Click any item for specifications & CLI</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {hotspots.map((spot, idx) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => setSelectedHotspot(spot)}
                className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 group shadow-sm cursor-pointer"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[9px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold text-xs">{spot.name}</span>
                <span className="text-[9px] font-mono text-slate-400 group-hover:text-cyan-300">
                  [{spot.badge}]
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DISTRACTION-FREE FULL SCREEN MODE WINDOW                 */}
      {/* Maintains complete interactive hotspot functionality!   */}
      {/* ======================================================== */}
      {isFullScreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col p-3 sm:p-5 overflow-hidden text-white animate-in fade-in duration-200"
        >
          {/* Top Full Screen Header Bar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/90 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 shrink-0 shadow-lg">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/70">
                    FULL SCREEN ARCHITECTURE INSPECTION
                  </span>
                  {subtitle && (
                    <span className="text-xs text-slate-400 hidden md:inline font-mono">
                      · {subtitle}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                  {title}
                </h3>
              </div>
            </div>

            {/* Header Controls: Zoom Controls + Close */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 text-slate-300">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.75}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-1.5 py-0.5 text-[10px] font-mono hover:bg-slate-800 rounded font-semibold text-cyan-300"
                  title="Reset Zoom (0)"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2.5}
                  className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Exit Full Screen Button */}
              <button
                type="button"
                onClick={handleCloseFullScreen}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Exit Full Screen (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Exit Full Screen</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1 py-0.2 rounded border border-slate-700">Esc</span>
              </button>
            </div>
          </div>

          {/* Maximized Architectural Canvas Area */}
          <div className="flex-1 relative overflow-auto flex items-center justify-center p-2 sm:p-4 bg-slate-950 select-none">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out'
              }}
              className="relative max-w-full max-h-[82vh] aspect-video w-full flex items-center justify-center rounded-2xl overflow-hidden border border-slate-800/80 bg-black shadow-2xl"
            >
              <img
                src={currentSrc}
                alt={title}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (currentSrc.startsWith('/src/assets/images/')) {
                    setCurrentSrc(currentSrc.replace('/src/assets/images/', '/assets/images/'));
                  } else if (currentSrc.startsWith('/assets/images/')) {
                    setCurrentSrc('/src' + currentSrc);
                  }
                }}
                className="w-full h-full object-contain mx-auto"
              />

              {/* Watermark in Fullscreen */}
              {renderWatermark()}

              {/* Interactive Hotspot Pins in Full Screen */}
              {renderHotspotPins(1.15)}
            </div>
          </div>

          {/* Full Screen Footer Strip: Component Bar & Instructions */}
          <div className="pt-2 border-t border-slate-800/90 shrink-0 space-y-2">
            {/* Component Quick Bar if hotspots are enabled */}
            {isGloballyEnabled && hotspots.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>Components ({hotspots.length}):</span>
                </span>
                {hotspots.map((spot, idx) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => setSelectedHotspot(spot)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[9px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-xs">{spot.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">[{spot.badge}]</span>
                  </button>
                ))}
              </div>
            )}

            {/* Architectural Scope & Hotkey Guide */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1.5">
              <div className="truncate max-w-2xl text-[11px]">
                {description && (
                  <span>
                    <strong className="text-cyan-400 font-mono">Architecture Scope:</strong>{' '}
                    {description}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                <span>Hotkeys: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Esc</kbd> Exit</span>
                <span><kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">+</kbd>/<kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">-</kbd> Zoom</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Modal Triggered When Hotspot Clicked (Accessible in both standard and fullscreen views) */}
      <ComponentInspectorModal
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
      />
    </div>
  );
};
