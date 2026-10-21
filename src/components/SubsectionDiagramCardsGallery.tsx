import React, { useState } from 'react';
import { ArchitectureDesignItem } from '../types/siteData';
import { useCustomization } from '../context/CustomizationContext';
import { DiagramLightboxModal } from './DiagramLightboxModal';
import { resolveMediaUrl, ISOMETRIC_BLUEPRINT_3D_FALLBACK } from '../data/mediaAssets';
import {
  Maximize2,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
  Edit3,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Power
} from 'lucide-react';

interface SubsectionDiagramCardsGalleryProps {
  platformId: string;
  platformName: string;
  designs: ArchitectureDesignItem[];
  activeDesignId?: string;
  onSelectDesign: (designId: string) => void;
  onEditDesign?: (design: ArchitectureDesignItem) => void;
}

export const SubsectionDiagramCardsGallery: React.FC<SubsectionDiagramCardsGalleryProps> = ({
  platformId,
  platformName,
  designs,
  activeDesignId,
  onSelectDesign,
  onEditDesign
}) => {
  const { siteConfig, isAdmin, toggleDesignEnabled } = useCustomization();

  // Lightbox modal state
  const [lightboxDesign, setLightboxDesign] = useState<ArchitectureDesignItem | null>(null);

  const handleLaunchLightbox = (e: React.MouseEvent, design: ArchitectureDesignItem) => {
    e.stopPropagation();
    onSelectDesign(design.id);
    setLightboxDesign(design);
  };

  const handleToggleEnabled = (e: React.MouseEvent, designId: string) => {
    e.stopPropagation();
    toggleDesignEnabled(platformId, designId);
  };

  if (!designs || designs.length === 0) return null;

  // Filter out disabled designs for non-admin visitors
  const visibleDesigns = designs.filter(d => isAdmin || d.enabled !== false);

  if (visibleDesigns.length === 0 && !isAdmin) return null;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Subsection Diagrams & Architecture Variations</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                {visibleDesigns.length} Modules
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any diagram to launch fullscreen inspection with pan and zoom
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Subsection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleDesigns.map((design, idx) => {
          const isSelected = activeDesignId === design.id;
          const isEnabled = design.enabled !== false;
          const resolvedImg = resolveMediaUrl(design.imageUrl);

          return (
            <div
              key={design.id}
              onClick={() => {
                onSelectDesign(design.id);
                setLightboxDesign(design);
              }}
              className={`group relative rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              } ${!isEnabled ? 'opacity-60 border-amber-900/50' : ''}`}
            >
              {/* Card Header Bar */}
              <div className="p-3.5 pb-2.5 flex items-start justify-between gap-2 border-b border-slate-800/60 bg-slate-950/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 shrink-0">
                    {`0${idx + 1}`}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {design.title}
                    </h4>
                    {design.badge && (
                      <span className="text-[10px] font-mono text-slate-400 truncate block">
                        {design.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Status Pill / Controls */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleEnabled(e, design.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                        isEnabled
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                          : 'bg-rose-950/80 border-rose-500/40 text-rose-300 hover:bg-rose-900'
                      }`}
                      title={isEnabled ? 'Click to disable this subsection' : 'Click to enable this subsection'}
                    >
                      {isEnabled ? 'Active' : 'Disabled'}
                    </button>
                    {onEditDesign && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDesign(design);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Subsection"
                      >
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Diagram Visual Preview Box */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden border-b border-slate-800/60 group/image">
                <img
                  src={resolvedImg}
                  alt={design.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('/src/assets/images/')) {
                      target.src = target.src.replace('/src/assets/images/', '/assets/images/');
                    } else if (target.src.includes('/assets/images/')) {
                      target.src = '/src' + target.src;
                    } else {
                      target.src = ISOMETRIC_BLUEPRINT_3D_FALLBACK;
                    }
                  }}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover/image:scale-105"
                />

                {/* Launch Full Screen Lightbox Button */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => handleLaunchLightbox(e, design)}
                    className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-950/90 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/60 text-slate-200 backdrop-blur-md transition-all flex items-center gap-1 shadow-lg cursor-pointer"
                    title="Launch Fullscreen Lightbox with Pan and Zoom"
                  >
                    <Maximize2 className="w-3 h-3 text-cyan-400" />
                    <span>FULL SCREEN</span>
                  </button>
                </div>

                {/* Hover Cue Banner */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 pointer-events-none">
                  <span className="text-[10px] font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-500/50 shadow-lg">
                    Click to Open Interactive Lightbox
                  </span>
                </div>
              </div>

              {/* Card Body: Specs & Summary */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {design.description}
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>{design.detailedSpecs?.length || 4} Architecture Specs</span>
                  </span>
                  {design.components && design.components.length > 0 && (
                    <span className="text-slate-400">
                      {design.components.length} Components
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal Instance */}
      {lightboxDesign && (
        <DiagramLightboxModal
          isOpen={true}
          onClose={() => setLightboxDesign(null)}
          imageUrl={lightboxDesign.imageUrl}
          designId={lightboxDesign.id}
          title={lightboxDesign.title}
          subtitle={platformName}
          description={lightboxDesign.description}
        />
      )}
    </div>
  );
};
