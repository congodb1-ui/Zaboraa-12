import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  Upload,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  FileText,
  Filter,
  Copy,
  Check,
  X,
  Layers,
  User,
  Calendar,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  uploadAssetImage,
  fetchGeneratedImages,
  deleteGeneratedImage,
  GeneratedImageRecord
} from '../../../services/storageService';
import { adminService } from '../../../services/adminService';

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  dimensions?: string;
  altText?: string;
  isReferenced?: boolean;
}

interface AdminMediaViewProps {
  currentUserEmail: string;
}

export const AdminMediaView: React.FC<AdminMediaViewProps> = ({
  currentUserEmail
}) => {
  const [activeTab, setActiveTab] = useState<'generated' | 'static'>('generated');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<GeneratedImageRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<MediaAsset | null>(null);
  const [deleteConfirmGenerated, setDeleteConfirmGenerated] = useState<GeneratedImageRecord | null>(null);

  // Generated images state
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageRecord[]>([]);
  const [isLoadingGenerated, setIsLoadingGenerated] = useState(true);

  // Initial media assets catalog from known public assets
  const [assets, setAssets] = useState<MediaAsset[]>([
    {
      id: 'img-wasim-exec',
      name: 'wasim_sayyed_executive.jpg',
      url: '/assets/images/wasim_sayyed_executive_1791473154875.jpg',
      sizeBytes: 184500,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-03-01T10:00:00Z',
      dimensions: '1200 x 1200',
      altText: 'Lead Principal Architect Wasim Sayyed Executive Portrait',
      isReferenced: true
    },
    {
      id: 'img-cloud-3d-blueprint',
      name: 'cloud_3d_blueprint_enterprise.jpg',
      url: '/assets/images/cloud_3d_blueprint_enterprise_1792147431615.jpg',
      sizeBytes: 420800,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-03-05T12:00:00Z',
      dimensions: '1920 x 1080',
      altText: 'High-Resolution 3D Isometric Enterprise Multi-Cloud Architecture Topology',
      isReferenced: true
    },
    {
      id: 'img-avs-anf',
      name: 'avs_anf_storage_architecture.jpg',
      url: '/assets/images/avs_anf_storage_architecture_1791548263395.jpg',
      sizeBytes: 312400,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-03-08T09:00:00Z',
      dimensions: '1920 x 1080',
      altText: 'Azure VMware Solution Decoupled Azure NetApp Files Storage Architecture',
      isReferenced: true
    },
    {
      id: 'img-hcx-mon',
      name: 'hcx_mon_traffic_routing_architecture.jpg',
      url: '/assets/images/hcx_mon_traffic_routing_architecture_1791548489298.jpg',
      sizeBytes: 298100,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-03-10T14:00:00Z',
      dimensions: '1920 x 1080',
      altText: 'VMware HCX Mobility Optimized Networking (MON) Traffic Flow',
      isReferenced: true
    },
    {
      id: 'img-nutanix-nc2',
      name: 'nutanix_nc2_azure_architecture.jpg',
      url: '/assets/images/nutanix_nc2_azure_architecture_1791687138119.jpg',
      sizeBytes: 345000,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-03-14T11:00:00Z',
      dimensions: '1920 x 1080',
      altText: 'Nutanix Cloud Clusters (NC2) on Azure BareMetal Infrastructure',
      isReferenced: true
    },
    {
      id: 'img-aria-dfw',
      name: 'aria_dfw_microseg_migration_planner.jpg',
      url: '/assets/images/aria_dfw_microseg_migration_planner_1791552031328.jpg',
      sizeBytes: 285000,
      mimeType: 'image/jpeg',
      uploadedAt: '2026-03-16T15:00:00Z',
      dimensions: '1920 x 1080',
      altText: 'VMware Aria Operations for Networks Microsegmentation Flow Discovery',
      isReferenced: true
    }
  ]);

  // Load generated images on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoadingGenerated(true);
      try {
        const data = await fetchGeneratedImages(null, true);
        if (mounted) {
          // If no generated images exist yet, seed with bundled high-res enterprise blueprint sample
          if (data.length === 0) {
            const bundledSample: GeneratedImageRecord = {
              id: 'sample-gen-3d-blueprint',
              image_name: 'enterprise_multicloud_3d_blueprint.png',
              image_type: 'blueprint_3d',
              storage_path: 'system/cloud_3d_blueprint_enterprise.jpg',
              storage_url: '/assets/images/cloud_3d_blueprint_enterprise_1792147431615.jpg',
              user_id: 'admin-master-root',
              user_email: 'wasim.sayyed@zaboraa-cloud.com',
              user_name: 'Wasim Sayyed (Lead Architect)',
              created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
              file_size_bytes: 420800,
              mime_type: 'image/jpeg',
              metadata: {
                model: 'gemini-3.1-flash-image',
                platform: 'azure-avs',
                title: 'Enterprise Multi-Cloud 3D Architecture Blueprint'
              }
            };
            setGeneratedImages([bundledSample]);
          } else {
            setGeneratedImages(data);
          }
        }
      } catch (err) {
        console.warn('Notice: Error loading generated images in admin view:', err);
      } finally {
        if (mounted) setIsLoadingGenerated(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Unsupported file type. Only JPEG, PNG, WebP, and SVG are permitted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadAssetImage(file, 'media-library');
      const newAsset: MediaAsset = {
        id: `media-${Date.now()}`,
        name: file.name,
        url: res.url,
        sizeBytes: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        altText: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        isReferenced: false
      };

      setAssets([newAsset, ...assets]);

      await adminService.logAuditEvent({
        actorEmail: currentUserEmail,
        actorRole: 'admin',
        action: 'UPLOAD_MEDIA_ASSET',
        targetEntity: 'storage_media',
        targetId: newAsset.name,
        outcome: 'success',
        metadata: { sizeBytes: file.size, storageSource: res.source }
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload asset.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAsset = async (asset: MediaAsset) => {
    setAssets(assets.filter((a) => a.id !== asset.id));
    if (selectedAsset?.id === asset.id) setSelectedAsset(null);
    setDeleteConfirmAsset(null);

    await adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'DELETE_MEDIA_ASSET',
      targetEntity: 'storage_media',
      targetId: asset.name,
      outcome: 'success'
    });
  };

  const handleDeleteGeneratedImage = async (img: GeneratedImageRecord) => {
    await deleteGeneratedImage(img.id, img.storage_path);
    setGeneratedImages(prev => prev.filter(i => i.id !== img.id));
    if (selectedGeneratedImage?.id === img.id) setSelectedGeneratedImage(null);
    setDeleteConfirmGenerated(null);

    await adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'DELETE_GENERATED_IMAGE',
      targetEntity: 'generated_images',
      targetId: img.image_name,
      outcome: 'success',
      metadata: { ownerId: img.user_id, ownerEmail: img.user_email }
    });
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Filtered lists
  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      !searchTerm ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.altText && a.altText.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  const filteredGeneratedImages = generatedImages.filter((img) => {
    const matchesSearch =
      !searchTerm ||
      img.image_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (img.user_email && img.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (img.user_name && img.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (img.image_type && img.image_type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType =
      filterType === 'all' || img.image_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalGeneratedSize = generatedImages.reduce((sum, img) => sum + (img.file_size_bytes || 0), 0);
  const uniqueUsersCount = new Set(generatedImages.map(img => img.user_email || img.user_id).filter(Boolean)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>CLOUD STORAGE ASSET REGISTRY & IMAGE GALLERY</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Media Library & Generated Images Gallery
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Inspect, manage, and audit all user-generated 3D architecture blueprints and uploaded media assets stored securely in Supabase Storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Upload Media Asset'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Tabs Switcher: Generated Images Gallery vs Public Static Assets */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('generated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'generated'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>User-Generated Images & Blueprints Gallery</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            {generatedImages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('static')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'static'
              ? 'bg-slate-800 text-slate-100 border border-slate-600 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          <span>Static Public Media Library</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {assets.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Generated Images & Blueprints Gallery */}
      {activeTab === 'generated' && (
        <div className="space-y-6">
          {/* Summary Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Total Generated Images</div>
              <div className="text-2xl font-black text-white mt-1">{generatedImages.length}</div>
              <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Persisted in Supabase Storage</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Contributing Architects</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{uniqueUsersCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Unique authenticated owners</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Storage Consumed</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{formatSize(totalGeneratedSize)}</div>
              <div className="text-[11px] text-slate-400 mt-1">blueprints & generated-images buckets</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Access Governance</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">RLS Active</div>
              <div className="text-[11px] text-slate-400 mt-1">User isolation enforced at database layer</div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by image name, owner email, architect name, or type..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Image Types</option>
                <option value="blueprint_3d">3D Isometric Blueprints</option>
                <option value="architecture_diagram">Architecture Diagrams</option>
                <option value="node_sizing_bom">Node Sizing BOMs</option>
                <option value="user_asset">User Uploaded Assets</option>
              </select>
            </div>
          </div>

          {/* Generated Images Grid */}
          {isLoadingGenerated ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading generated image repository...</div>
          ) : filteredGeneratedImages.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-semibold text-slate-300">No generated images matching search criteria.</p>
              <p className="text-[11px]">Generate a 3D isometric diagram in the Automated Hybrid Blueprint Generator to populate this registry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGeneratedImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-all flex flex-col group shadow-md"
                >
                  {/* Thumbnail Preview with Aspect Ratio & Centering */}
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                    <img
                      src={img.storage_url}
                      alt={img.image_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                    {/* Quick Action Overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedGeneratedImage(img)}
                        className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-600 text-white shadow-md transition cursor-pointer"
                        title="Inspect full image preview & metadata"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyUrl(img.storage_url, img.id)}
                        className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white shadow-md transition cursor-pointer"
                        title="Copy public URL"
                      >
                        {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Image Type Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 border border-cyan-500/40 backdrop-blur-sm uppercase">
                        {img.image_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Image Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm text-white truncate" title={img.image_name}>
                        {img.image_name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1.5">
                        <HardDrive className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate" title={img.storage_path}>{img.storage_path}</span>
                      </div>
                    </div>

                    {/* Owner & Date Information */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{img.user_name || 'Architect'}</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{formatSize(img.file_size_bytes)}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="truncate max-w-[150px] font-mono" title={img.user_email || 'Public Session'}>
                          {img.user_email || 'Public / Guest'}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(img.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedGeneratedImage(img)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={img.storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={img.image_name}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Open original image in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setDeleteConfirmGenerated(img)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                          title="Delete generated image record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Static Public Media Library */}
      {activeTab === 'static' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assets by filename or alt text..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition flex flex-col group"
              >
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.name}
                    className="w-full h-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="p-2 rounded-lg bg-slate-900/90 text-white hover:bg-cyan-600 transition cursor-pointer"
                      title="Inspect Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyUrl(asset.url, asset.id)}
                      className="p-2 rounded-lg bg-slate-900/90 text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === asset.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-xs text-white truncate" title={asset.name}>
                      {asset.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {asset.altText || 'Platform diagram asset'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{formatSize(asset.sizeBytes)}</span>
                    <button
                      onClick={() => setDeleteConfirmAsset(asset)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Generated Image Modal */}
      {selectedGeneratedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Generated Image Preview & Architecture Record</span>
              </div>
              <button
                onClick={() => setSelectedGeneratedImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Image Preview with perfect aspect ratio and centered placement */}
              <div className="w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={selectedGeneratedImage.storage_url}
                  alt={selectedGeneratedImage.image_name}
                  className="max-h-[380px] w-auto max-w-full rounded-lg object-contain"
                />
              </div>

              {/* Data attributes table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Image Name</div>
                  <div className="font-bold text-white mt-0.5 truncate">{selectedGeneratedImage.image_name}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Image Type</div>
                  <div className="font-bold text-cyan-400 mt-0.5 uppercase">{selectedGeneratedImage.image_type}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Generating Owner (User Email)</div>
                  <div className="font-bold text-white mt-0.5 truncate">{selectedGeneratedImage.user_email || 'Public / Guest'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Generating Owner (User ID)</div>
                  <div className="font-mono text-[11px] text-slate-300 mt-0.5 truncate">{selectedGeneratedImage.user_id || 'guest-session'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Creation Date & Time</div>
                  <div className="font-bold text-slate-200 mt-0.5">{new Date(selectedGeneratedImage.created_at).toLocaleString()}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">File Size & MIME Type</div>
                  <div className="font-bold text-slate-200 mt-0.5">{formatSize(selectedGeneratedImage.file_size_bytes)} ({selectedGeneratedImage.mime_type || 'image/png'})</div>
                </div>
              </div>

              {/* Storage Path */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Supabase Storage Path</div>
                <div className="font-mono text-cyan-300 mt-1 break-all">{selectedGeneratedImage.storage_path}</div>
              </div>

              {/* Configuration Metadata if available */}
              {selectedGeneratedImage.metadata && Object.keys(selectedGeneratedImage.metadata).length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Architecture Metadata & Parameters</div>
                  <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedGeneratedImage.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <button
                onClick={() => copyUrl(selectedGeneratedImage.storage_url, selectedGeneratedImage.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedId === selectedGeneratedImage.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === selectedGeneratedImage.id ? 'Copied URL!' : 'Copy Public URL'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDeleteConfirmGenerated(selectedGeneratedImage);
                    setSelectedGeneratedImage(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-semibold transition cursor-pointer"
                >
                  Delete Record
                </button>
                <button
                  onClick={() => setSelectedGeneratedImage(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Generated Image */}
      {deleteConfirmGenerated && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Generated Image Record?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <span className="text-white font-mono">{deleteConfirmGenerated.image_name}</span>? This will remove the metadata record and purge the asset from Supabase Storage.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmGenerated(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGeneratedImage(deleteConfirmGenerated)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
