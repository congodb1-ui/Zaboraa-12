import React, { useState, useRef } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { PhotoStyle } from '../types/siteData';
import {
  X,
  Upload,
  Camera,
  RotateCcw,
  Sliders,
  Check,
  Sparkles,
  Link as LinkIcon,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const PhotoEditorModal: React.FC = () => {
  const { siteConfig, isPhotoEditorOpen, setIsPhotoEditorOpen, updateFounderPhoto } = useCustomization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialPhoto = siteConfig.founder.portraitImage || '/assets/images/wasim_pic_02.webp';
  const initialStyle: PhotoStyle = siteConfig.founder.photoStyle || {
    zoom: 1.05,
    brightness: 102,
    contrast: 104,
    objectPosition: 'top',
    borderGlow: 'cyan'
  };

  const [currentImage, setCurrentImage] = useState<string>(initialPhoto);
  const [zoom, setZoom] = useState<number>(initialStyle.zoom || 1.05);
  const [brightness, setBrightness] = useState<number>(initialStyle.brightness || 102);
  const [contrast, setContrast] = useState<number>(initialStyle.contrast || 104);
  const [position, setPosition] = useState<'center' | 'top' | 'bottom'>(initialStyle.objectPosition || 'top');
  const [borderGlow, setBorderGlow] = useState<'cyan' | 'emerald' | 'subtle' | 'none'>(initialStyle.borderGlow || 'cyan');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isPhotoEditorOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCurrentImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setCurrentImage(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleSave = () => {
    updateFounderPhoto(currentImage, {
      zoom,
      brightness,
      contrast,
      objectPosition: position,
      borderGlow
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsPhotoEditorOpen(false);
    }, 900);
  };

  const handleReset = () => {
    setCurrentImage('/assets/images/wasim_pic_02.webp');
    setZoom(1.05);
    setBrightness(102);
    setContrast(104);
    setPosition('top');
    setBorderGlow('cyan');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 lg:p-10 flex items-center justify-center animate-in fade-in duration-150">
      <div
        data-theme-container="dark"
        className="dark-card dark-feature-container relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dynamic Profile Photo Studio</h3>
              <p className="text-xs text-slate-400">Upload, adjust styling, and customize Wasim Sayyed's executive portrait</p>
            </div>
          </div>
          <button
            onClick={() => setIsPhotoEditorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Interactive Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-800/80 space-y-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Site Preview</span>
            </div>

            {/* Circular Avatar Preview Frame with Dynamic Styles */}
            <div className="relative group">
              <div
                className={`w-36 h-36 rounded-full overflow-hidden transition-all duration-200 border-2 ${
                  borderGlow === 'cyan'
                    ? 'border-cyan-400 shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-500/20'
                    : borderGlow === 'emerald'
                    ? 'border-emerald-400 shadow-xl shadow-emerald-500/25 ring-2 ring-emerald-500/20'
                    : borderGlow === 'subtle'
                    ? 'border-slate-600 shadow-lg shadow-black/40'
                    : 'border-slate-800'
                }`}
              >
                <img
                  src={currentImage}
                  alt="Wasim Sayyed Executive Preview"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('/src/assets/images/')) {
                      target.src = target.src.replace('/src/assets/images/', '/assets/images/');
                    } else if (target.src.includes('/assets/images/')) {
                      target.src = target.src.replace('/assets/images/', '/src/assets/images/');
                    }
                  }}
                  style={{
                    transform: `scale(${zoom})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    objectPosition: position
                  }}
                  className="w-full h-full object-cover transition-transform duration-150"
                />
              </div>

              {/* Online Verified Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-0.5">
              <div className="text-xs font-bold text-white">{siteConfig.founder.name}</div>
              <div className="text-[10px] text-cyan-400">{siteConfig.founder.role}</div>
            </div>

            {/* Upload Button Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload From Device (e.g. Wasim-Pic-4.png)</span>
            </button>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Quick Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Curated Executive Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentImage('/assets/images/Wasim-Pic-02.webp');
                    setPosition('center');
                    setZoom(1.0);
                    setBrightness(100);
                    setContrast(100);
                    setBorderGlow('none');
                  }}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentImage.includes('wasim_pic_02') || currentImage.includes('Wasim-Pic-02')
                      ? 'bg-slate-800 border-cyan-400 text-white font-semibold ring-1 ring-cyan-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src="/assets/images/Wasim-Pic-02.webp"
                      alt="Uploaded Executive Portrait"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <span className="truncate text-[11px]">Uploaded Plan (Original)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentImage('/assets/images/wasim_headshot_framer.webp');
                    setPosition('center');
                    setZoom(1.0);
                  }}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentImage.includes('wasim_headshot_framer')
                      ? 'bg-slate-800 border-cyan-400 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src="/assets/images/wasim_headshot_framer.webp"
                      alt="Wasim Original Headshot"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <span className="truncate text-[11px]">Wasim Framer Portrait</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentImage('/assets/images/wasim_sayyed_executive_1791473154875.webp');
                    setPosition('top');
                  }}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentImage.includes('wasim_sayyed_executive')
                      ? 'bg-slate-800 border-cyan-400 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src="/assets/images/wasim_sayyed_executive_1791473154875.webp"
                      alt="Executive Wasim"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <span className="truncate text-[11px]">Wasim Executive (Suited)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentImage('/assets/images/hero_cloud_datacenter_1791450064361.webp');
                    setPosition('center');
                  }}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    currentImage.includes('hero_cloud_datacenter')
                      ? 'bg-slate-800 border-cyan-400 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src="/assets/images/hero_cloud_datacenter_1791450064361.webp"
                      alt="Datacenter Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="truncate text-[11px]">Datacenter Avatar</span>
                </button>
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Or Paste Custom Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/wasim.png"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Load
                </button>
              </div>
            </div>

            {/* Sliders: Zoom & Focus Position */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Zoom / Crop:</span>
                  <span className="font-mono text-cyan-400">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={1.5}
                  step={0.05}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block">Vertical Focus Point</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['top', 'center', 'bottom'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPosition(p)}
                      className={`py-1 text-[11px] font-medium rounded-md border uppercase ${
                        position === p
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sliders: Brightness & Contrast */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Brightness:</span>
                  <span className="font-mono text-cyan-400">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={130}
                  step={2}
                  value={brightness}
                  onChange={e => setBrightness(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Contrast:</span>
                  <span className="font-mono text-cyan-400">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={130}
                  step={2}
                  value={contrast}
                  onChange={e => setContrast(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Border Glow Style */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Avatar Border Glow Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cyan', label: 'Cyan Cyber' },
                  { id: 'emerald', label: 'Emerald' },
                  { id: 'subtle', label: 'Subtle Slate' },
                  { id: 'none', label: 'Minimal' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBorderGlow(opt.id as any)}
                    className={`py-1.5 px-2 text-center text-[11px] rounded-lg border transition-all ${
                      borderGlow === opt.id
                        ? 'bg-slate-800 border-cyan-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoEditorOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-lg shadow-cyan-500/20"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Apply & Save Profile Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
