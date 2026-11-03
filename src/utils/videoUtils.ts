/**
 * Video URL sanitizer and verification utilities.
 * Ensures no placeholder or dummy video URLs (e.g., Rickroll dQw4w9WgXcQ or example.com)
 * are published or rendered.
 */

export const isDummyVideoUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed) return true;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Check host against example.com
    if (host === 'example.com' || host.endsWith('.example.com')) {
      return true;
    }

    // Check YouTube / Vimeo / etc video ID
    if (
      host === 'youtube.com' ||
      host.endsWith('.youtube.com') ||
      host === 'youtube-nocookie.com' ||
      host.endsWith('.youtube-nocookie.com') ||
      host === 'youtu.be'
    ) {
      let videoId = '';
      if (parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v') || '';
      } else {
        const parts = parsed.pathname.split('/').filter(Boolean);
        videoId = parts[parts.length - 1] || '';
      }
      const dummyIds = ['dQw4w9WgXcQ', 'placeholder', 'dummy', '12345'];
      if (dummyIds.includes(videoId)) {
        return true;
      }
    }
  } catch {
    // If not a parseable URL, check exact dummy placeholder tokens
    const lower = trimmed.toLowerCase();
    if (['placeholder', 'dummy', '12345'].includes(lower)) {
      return true;
    }
  }

  // Exact fallback check for the Rickroll placeholder ID
  if (trimmed.includes('dQw4w9WgXcQ')) {
    return true;
  }

  return false;
};
