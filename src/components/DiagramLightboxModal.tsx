import React, { useState, useEffect, useRef } from 'react';
import { DiagramHotspot, getHotspotsForDesign } from '../data/diagramHotspotsData';
import { ComponentInspectorModal } from './ComponentInspectorModal';
import { useCustomization } from '../context/CustomizationContext';
import { resolveMediaUrl, ISOMETRIC_BLUEPRINT_3D_FALLBACK } from '../data/mediaAssets';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronRight,
  Move
} from 'lucide-react';

export interface DiagramLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  designId?: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export const DiagramLightboxModal: React.FC<DiagramLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  designId,
  title,
  subtitle,
  description
}) => {
  const { siteConfig, brandName } = useCustomization();
  const isGloballyEnabled = siteConfig.enableHotspots === true;

  const [currentSrc, setCurrentSrc] = useState<string>(() => resolveMediaUrl(imageUrl));
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<DiagramHotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<DiagramHotspot | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync image URL on change
  useEffect(() => {
    if (isOpen) {
      setCurrentSrc(resolveMediaUrl(imageUrl));
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setSelectedHotspot(null);
      setHoveredHotspot(null);
      setShowHotspots(true);
    }
  }, [isOpen, imageUrl, designId]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel(z => Math.min(3, Number((z + 0.25).toFixed(2))));
      } else if (e.key === '-') {
        setZoomLevel(z => Math.max(0.75, Number((z - 0.25).toFixed(2))));
      } else if (e.key === '0') {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGloballyEnabled, onClose]);

  if (!isOpen) return null;

  const hotspots: DiagramHotspot[] = isGloballyEnabled
    ? getHotspotsForDesign(designId, currentSrc)
    : [];

  const handleZoomIn = () => {
    setZoomLevel(z => Math.min(3, Number((z + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel(z => Math.max(0.75, Number((z - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // primary mouse button only
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Watermark
  const watermark = siteConfig.watermark;
  const isWatermarkEnabled = watermark?.enabled ?? true;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col p-3 sm:p-5 overflow-hidden text-white animate-in fade-in duration-200 select-none"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 shrink-0 shadow-lg">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/70">
                FULLSCREEN ARCHITECTURE INSPECTION
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

        {/* Action Controls: Zoom Controls + Close */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom & Pan Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 text-slate-300">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 text-cyan-300 font-bold min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.0}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer ml-0.5 border-l border-slate-700/60 pl-1.5"
              title="Reset Zoom & Pan (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close Full Screen Window */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-400 border border-slate-700 hover:border-rose-800/80 text-slate-300 transition-colors shadow-lg cursor-pointer"
            title="Exit Full Screen (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Pan and Zoom Canvas Wrapper */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950 shrink-0"
        >
          {/* Main Architectural Graphic */}
          <img
            src={currentSrc}
            alt={title}
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => {
              if (currentSrc.startsWith('/src/assets/images/')) {
                setCurrentSrc(currentSrc.replace('/src/assets/images/', '/assets/images/'));
              } else if (currentSrc.startsWith('/assets/images/')) {
                setCurrentSrc('/src' + currentSrc);
              } else {
                setCurrentSrc(ISOMETRIC_BLUEPRINT_3D_FALLBACK);
              }
            }}
            className="max-h-[82vh] w-auto max-w-full object-contain pointer-events-none select-none"
          />

          {/* Watermark in Fullscreen */}
          {isWatermarkEnabled && (
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950/80 border border-slate-700/80 text-xs font-mono font-bold tracking-widest text-slate-300 uppercase shadow-xl backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{watermark?.text || `${(brandName || siteConfig.brand || 'ENTERPRISE').toUpperCase()} · CERTIFIED BLUEPRINT`}</span>
              </div>
            </div>
          )}

          {/* Discrete Pins in Fullscreen */}
          {isGloballyEnabled && showHotspots && hotspots.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {hotspots.map((spot, idx) => {
                const isHovered = hoveredHotspot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspot(spot);
                      }}
                      onMouseEnter={() => setHoveredHotspot(spot)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      className={`relative flex items-center justify-center rounded-full transition-transform cursor-pointer ${
                        isHovered ? 'scale-125 z-30' : 'scale-100 z-10'
                      }`}
                    >
                      <span className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
                      <span className="w-6 h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg text-[10px] font-mono font-bold text-cyan-300">
                        {idx + 1}
                      </span>
                    </button>

                    {/* Quick Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 rounded-lg bg-slate-950/95 border border-cyan-500/50 text-[11px] text-white shadow-2xl z-40 pointer-events-none backdrop-blur-md">
                        <div className="font-bold text-cyan-300 truncate">{spot.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">[{spot.badge}]</div>
                        <div className="text-[10px] text-slate-300 line-clamp-2 mt-1">{spot.shortDescription}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pan Instruction Cue */}
        {zoomLevel > 1 && (
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2 shadow-lg backdrop-blur-md">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click & Drag to pan canvas</span>
          </div>
        )}
      </div>

      {/* Bottom Component Hotspot Drawer */}
      {isGloballyEnabled && showHotspots && hotspots.length > 0 && (
        <div className="pt-2 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 font-semibold">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blueprint Hotspots ({hotspots.length}):</span>
            </span>
            {hotspots.map((spot, idx) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => setSelectedHotspot(spot)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[9px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold">{spot.name}</span>
                <span className="text-[9px] font-mono text-slate-400">[{spot.badge}]</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Technical Hotspot Inspector Modal */}
      {selectedHotspot && (
        <ComponentInspectorModal
          hotspot={selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
        />
      )}
    </div>
  );
};
