import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BUCKET = 'site-assets';

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
  const path = `content/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase!.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) throw error;
  return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Walks any object and replaces embedded images (data:/blob:) with Supabase Storage URLs
export async function externalizeImages<T>(value: T): Promise<T> {
  if (!isSupabaseConfigured || !supabase) return value;
  const cache = new Map<string, string>();

  const walk = async (v: any): Promise<any> => {
    if (typeof v === 'string') {
      if (v.startsWith('data:image/') || v.startsWith('blob:')) {
        if (!cache.has(v)) cache.set(v, await uploadDataUrl(v));
        return cache.get(v);
      }
      return v;
    }
    if (Array.isArray(v)) return Promise.all(v.map(walk));
    if (v && typeof v === 'object') {
      const out: any = {};
      for (const [k, val] of Object.entries(v)) out[k] = await walk(val);
      return out;
    }
    return v;
  };

  return walk(value);
}
