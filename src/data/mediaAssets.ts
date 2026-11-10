// Centralized Media Assets Configuration
// Resolves image and asset paths with fallback to bundled local assets.

export const ISOMETRIC_BLUEPRINT_3D_FALLBACK = '/assets/images/blueprint_3d_isometric_1791610246387.webp';

export const GOOGLE_DRIVE_CONFIG = {
  folderId: '1sFG8NLUcajo8DuCs7jq9ChYK-rksx7Io',
  folderUrl: 'https://drive.google.com/drive/folders/1sFG8NLUcajo8DuCs7jq9ChYK-rksx7Io',
  label: 'Google Drive Architecture Repository'
};

/**
 * Resolves a media URL.
 * If given a Google Drive file ID (e.g. "gdrive:1abcXYZ..."), returns direct Google Drive URL.
 * If given an existing local path or URL, returns that URL, or falls back to local assets if unavailable.
 */
export function resolveMediaUrl(pathOrId: string | undefined, fallbackLocalPath: string = '/assets/images/hero_cloud_datacenter_1791450064361.webp'): string {
  if (!pathOrId || pathOrId.trim() === '') return fallbackLocalPath;

  const trimmed = pathOrId.trim();

  // Data URLs (e.g. from local file uploads FileReader readAsDataURL)
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Google Drive file ID prefix
  if (trimmed.startsWith('gdrive:')) {
    const fileId = trimmed.replace('gdrive:', '').trim();
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Full external URL (HTTP/HTTPS)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Public directory paths normalization (in Vite, public/ files are served directly at /)
  if (trimmed.startsWith('/public/assets/images/')) {
    return trimmed.replace('/public/assets/images/', '/assets/images/');
  }
  if (trimmed.startsWith('public/assets/images/')) {
    return trimmed.replace('public/assets/images/', '/assets/images/');
  }

  // Src directory paths normalization
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/assets/images/');
  }
  if (trimmed.startsWith('src/assets/images/')) {
    return trimmed.replace('src/assets/images/', '/assets/images/');
  }

  // Missing leading slash on assets path
  if (trimmed.startsWith('assets/images/')) {
    return '/' + trimmed;
  }

  return trimmed;
}

/**
 * Converts a Google Drive link or file ID to an embeddable preview URL
 */
export function getDrivePreviewUrl(fileIdOrUrl: string): string {
  if (fileIdOrUrl.includes('/file/d/')) {
    const match = fileIdOrUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  if (fileIdOrUrl.startsWith('gdrive:')) {
    const id = fileIdOrUrl.replace('gdrive:', '').trim();
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return fileIdOrUrl;
}
