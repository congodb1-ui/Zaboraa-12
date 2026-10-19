import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { uploadAssetImage } from '../../../services/storageService';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<MediaAsset | null>(null);

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

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      !searchTerm ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.altText && a.altText.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>CLOUD STORAGE ASSET REGISTRY</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Media Library & Diagram Repository
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Manage high-resolution architectural blueprints, executive portraits, and diagram assets. Enforces MIME validation and safe reference auditing.
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
        <div className="text-xs font-mono text-slate-400">
          Total Assets: <span className="text-white font-bold">{assets.length}</span>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            {/* Image Preview Container */}
            <div className="relative h-44 bg-slate-950 overflow-hidden">
              <img
                src={asset.url}
                alt={asset.altText || asset.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/assets/images/cloud_3d_blueprint_enterprise_1792147431615.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-950/80 text-cyan-300 text-[10px] font-mono border border-slate-800 backdrop-blur-md">
                  {formatSize(asset.sizeBytes)}
                </span>
                {asset.isReferenced && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 backdrop-blur-md">
                    IN USE
                  </span>
                )}
              </div>
            </div>

            {/* Asset Content */}
            <div className="p-4 space-y-2">
              <div className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
                {asset.name}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                {asset.altText || 'No descriptive alt text'}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{asset.mimeType}</span>
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => copyUrl(asset.url, asset.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmAsset(asset)}
                    className="p-1 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition"
                    title="Delete Media Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Asset Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  MEDIA ASSET INSPECTOR
                </span>
                <h2 className="text-sm font-bold text-white truncate max-w-md">
                  {selectedAsset.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 max-h-72 flex items-center justify-center">
              <img
                src={selectedAsset.url}
                alt={selectedAsset.altText || selectedAsset.name}
                className="max-h-72 w-auto object-contain"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">File Size</span>
                <span className="font-bold text-white">{formatSize(selectedAsset.sizeBytes)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">MIME Type</span>
                <span className="font-bold text-cyan-300">{selectedAsset.mimeType}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Dimensions</span>
                <span className="font-bold text-white">{selectedAsset.dimensions || 'Vector/Flex'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Referenced</span>
                <span className="font-bold text-emerald-400">{selectedAsset.isReferenced ? 'Yes (Live)' : 'Unused'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                Public Storage Resource URL:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedAsset.url}
                  className="w-full bg-transparent font-mono text-cyan-300 text-xs focus:outline-none"
                />
                <button
                  onClick={() => copyUrl(selectedAsset.url, selectedAsset.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white shrink-0 cursor-pointer"
                >
                  {copiedId === selectedAsset.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/60 shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h2 className="text-base font-bold text-white">Delete Media Asset</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deleteConfirmAsset.name}</strong>?
            </p>
            {deleteConfirmAsset.isReferenced && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
                ⚠️ Warning: This asset is currently flagged as in-use by an architecture showcase or homepage banner. Deleting it may cause a broken image placeholder.
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAsset(deleteConfirmAsset)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
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
