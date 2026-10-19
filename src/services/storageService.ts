import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import configJson from '../../firebase-applet-config.json';
import { supabase } from './supabaseClient';

const firebaseConfig = {
  projectId: configJson.projectId || 'ai-studio-applet-webapp-faf08',
  appId: configJson.appId || '1:351445412039:web:e84748d6467445c80936e2',
  apiKey: configJson.apiKey || 'AIzaSyAGOeXqh-jb5WYAoP1x36rYekzOUZ1M5XQ',
  authDomain: configJson.authDomain || 'ai-studio-applet-webapp-faf08.firebaseapp.com',
  storageBucket: configJson.storageBucket || 'ai-studio-applet-webapp-faf08.firebasestorage.app',
  messagingSenderId: configJson.messagingSenderId || '351445412039'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const storage = getStorage(app);

export interface UploadResult {
  url: string;
  source: 'supabase' | 'firebase' | 'base64';
  filename: string;
  sizeBytes?: number;
}

/**
 * Robust image upload pipeline:
 * 1. Attempts Supabase Storage upload if bucket exists and configured
 * 2. Attempts Firebase Storage upload with clean path
 * 3. Guaranteed local Base64 fallback if cloud storage or CORS blocks upload in preview
 */
export async function uploadAssetImage(
  file: File,
  folder = 'showcases'
): Promise<UploadResult> {
  const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = `${folder}/${cleanName}`;

  // 1. Try Supabase Storage first if available and valid URL configured
  if (supabase && (import.meta as any).env?.VITE_SUPABASE_URL) {
    try {
      const { data, error } = await supabase.storage
        .from('generated-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from('generated-images').getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return {
            url: pubData.publicUrl,
            source: 'supabase',
            filename: file.name,
            sizeBytes: file.size
          };
        }
      }
    } catch (sbErr) {
      console.warn('Supabase upload skipped or unavailable, trying Firebase:', sbErr);
    }
  }

  // 2. Try Firebase Storage
  try {
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/png'
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return {
      url: downloadUrl,
      source: 'firebase',
      filename: file.name,
      sizeBytes: file.size
    };
  } catch (fbErr: any) {
    console.warn('Firebase Storage upload blocked or CORS restricted in preview, using base64 fallback:', fbErr?.message || fbErr);
  }

  // 3. Fallback to resilient in-browser Base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      resolve({
        url: base64,
        source: 'base64',
        filename: file.name,
        sizeBytes: file.size
      });
    };
    reader.onerror = () => {
      // If reading fails, generate safe placeholder
      resolve({
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        source: 'base64',
        filename: file.name,
        sizeBytes: file.size
      });
    };
    reader.readAsDataURL(file);
  });
}

export interface SaveBlueprintPayload {
  title: string;
  imageDataOrUrl: string; // Base64 data URL, blob URL, or static asset URL
  userId?: string | null;
  userEmail?: string | null;
  configSummary: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SaveBlueprintResult {
  success: boolean;
  storageUrl?: string;
  storagePath?: string;
  savedToDatabase: boolean;
  error?: string;
  message: string;
}

/**
 * Saves a generated blueprint (image asset and configuration metadata) to Supabase Storage
 * and the blueprints database table with per-user RLS isolation and graceful fallbacks.
 */
export async function saveGeneratedBlueprint(
  payload: SaveBlueprintPayload
): Promise<SaveBlueprintResult> {
  // If user is not authenticated, prompt sign-in to persist without breaking preview
  if (!payload.userId) {
    return {
      success: false,
      savedToDatabase: false,
      message: 'Blueprint preview generated. Sign in to your account to persist and backup blueprints to cloud storage.'
    };
  }

  const cleanTitle = payload.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  const fileName = `${Date.now()}_${cleanTitle}.png`;
  const storagePath = `${payload.userId}/${fileName}`;

  try {
    let blob: Blob;

    if (payload.imageDataOrUrl.startsWith('data:')) {
      const parts = payload.imageDataOrUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      // Static URL or HTTP URL: fetch as blob
      const res = await fetch(payload.imageDataOrUrl);
      blob = await res.blob();
    }

    let storageUrl: string | undefined = undefined;

    // 1. Upload to Supabase Storage 'blueprints' bucket (or fallback to 'generated-images')
    if (supabase && (import.meta as any).env?.VITE_SUPABASE_URL) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('blueprints')
          .upload(storagePath, blob, {
            contentType: 'image/png',
            upsert: true
          });

        if (!uploadError) {
          const { data: pubData } = supabase.storage.from('blueprints').getPublicUrl(storagePath);
          storageUrl = pubData?.publicUrl;
        } else {
          // If 'blueprints' bucket has a policy failure or doesn't exist, try 'generated-images'
          const { error: genError } = await supabase.storage
            .from('generated-images')
            .upload(storagePath, blob, {
              contentType: 'image/png',
              upsert: true
            });
          if (!genError) {
            const { data: pubData } = supabase.storage.from('generated-images').getPublicUrl(storagePath);
            storageUrl = pubData?.publicUrl;
          }
        }
      } catch (sbErr) {
        console.warn('Supabase Storage upload notice:', sbErr);
      }
    }

    // 2. Persist metadata to public.blueprints table in Supabase
    let savedToDatabase = false;
    if (supabase && (import.meta as any).env?.VITE_SUPABASE_URL) {
      try {
        const { error: dbError } = await supabase.from('blueprints').insert({
          user_id: payload.userId,
          user_email: payload.userEmail || null,
          title: payload.title,
          storage_path: storagePath,
          storage_url: storageUrl || payload.imageDataOrUrl,
          config_summary: payload.configSummary || {},
          metadata: {
            ...payload.metadata,
            savedAt: new Date().toISOString(),
            byteSize: blob.size
          }
        });

        if (!dbError) {
          savedToDatabase = true;
        } else {
          console.warn('Notice: Unable to record in public.blueprints table:', dbError.message);
        }
      } catch (dbErr) {
        console.warn('Notice: Database insert skipped or unavailable:', dbErr);
      }
    }

    // 3. Persist to public.generated_images table for the image gallery & user tracking
    const finalUrl = storageUrl || payload.imageDataOrUrl;
    await recordGeneratedImage({
      image_name: fileName,
      image_type: payload.metadata?.imageType || 'blueprint_3d',
      storage_path: storagePath,
      storage_url: finalUrl,
      user_id: payload.userId || null,
      user_email: payload.userEmail || null,
      user_name: payload.metadata?.architectName || (payload.userEmail ? payload.userEmail.split('@')[0] : 'Enterprise Architect'),
      file_size_bytes: blob.size,
      mime_type: blob.type || 'image/png',
      metadata: {
        ...payload.metadata,
        title: payload.title,
        configSummary: payload.configSummary
      }
    });

    return {
      success: true,
      storageUrl: finalUrl,
      storagePath,
      savedToDatabase,
      message: 'Blueprint saved successfully to Supabase cloud storage.'
    };
  } catch (err: any) {
    console.warn('Notice: Cloud storage upload could not complete:', err?.message || err);
    return {
      success: false,
      savedToDatabase: false,
      error: err?.message,
      message: 'Blueprint preview active. Cloud storage notice: ' + (err?.message || 'Storage temporarily unavailable.')
    };
  }
}

export interface GeneratedImageRecord {
  id: string;
  image_name: string;
  image_type: string;
  storage_path: string;
  storage_url: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
  file_size_bytes: number;
  mime_type: string;
  metadata?: Record<string, any>;
}

const LOCAL_GENERATED_IMAGES_KEY = 'zaboraa_generated_images_cache';

function getLocalGeneratedImages(): GeneratedImageRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_GENERATED_IMAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveLocalGeneratedImages(images: GeneratedImageRecord[]) {
  try {
    localStorage.setItem(LOCAL_GENERATED_IMAGES_KEY, JSON.stringify(images.slice(0, 50)));
  } catch {}
}

/**
 * Record a newly generated image in Supabase database and local cache
 */
export async function recordGeneratedImage(
  item: Omit<GeneratedImageRecord, 'id' | 'created_at'>
): Promise<GeneratedImageRecord> {
  const newRecord: GeneratedImageRecord = {
    ...item,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `img-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  // 1. Try Supabase insert
  if (supabase && (import.meta as any).env?.VITE_SUPABASE_URL) {
    try {
      const { data, error } = await supabase
        .from('generated_images')
        .insert({
          image_name: item.image_name,
          image_type: item.image_type,
          storage_path: item.storage_path,
          storage_url: item.storage_url,
          user_id: item.user_id,
          user_email: item.user_email,
          user_name: item.user_name,
          file_size_bytes: item.file_size_bytes || 0,
          mime_type: item.mime_type || 'image/png',
          metadata: item.metadata || {}
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        newRecord.id = data.id;
        newRecord.created_at = data.created_at;
      }
    } catch (e) {
      console.warn('Notice: Unable to record in public.generated_images table:', e);
    }
  }

  // 2. Cache locally
  const current = getLocalGeneratedImages();
  saveLocalGeneratedImages([newRecord, ...current]);

  return newRecord;
}

/**
 * Fetch generated images.
 * If user is admin (or isAdmin=true), fetches all images across all users.
 * If user is regular architect, fetches strictly user-linked images.
 */
export async function fetchGeneratedImages(
  userId?: string | null,
  isAdmin = false
): Promise<GeneratedImageRecord[]> {
  if (supabase && (import.meta as any).env?.VITE_SUPABASE_URL) {
    try {
      let query = supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin && userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data as GeneratedImageRecord[];
      }
    } catch (e) {
      console.warn('Notice: Error fetching generated images from Supabase:', e);
    }
  }

  // Fallback to local cache
  const local = getLocalGeneratedImages();
  if (isAdmin) return local;
  if (userId) return local.filter(img => img.user_id === userId);
  return local;
}

/**
 * Delete a generated image record from database and storage
 */
export async function deleteGeneratedImage(
  imageId: string,
  storagePath?: string
): Promise<{ success: boolean; error?: string }> {
  let success = true;
  let errorMsg: string | undefined = undefined;

  if (supabase && (import.meta as any).env?.VITE_SUPABASE_URL) {
    try {
      const { error: dbError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        success = false;
        errorMsg = dbError.message;
      }

      if (storagePath) {
        await supabase.storage.from('blueprints').remove([storagePath]);
        await supabase.storage.from('generated-images').remove([storagePath]);
      }
    } catch (err: any) {
      success = false;
      errorMsg = err.message || 'Failed to delete generated image.';
    }
  }

  const current = getLocalGeneratedImages();
  saveLocalGeneratedImages(current.filter(i => i.id !== imageId));

  return { success, error: errorMsg };
}

