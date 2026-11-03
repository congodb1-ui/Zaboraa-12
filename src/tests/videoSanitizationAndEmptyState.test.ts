import { describe, it, expect } from 'vitest';
import { isDummyVideoUrl } from '../utils/videoUtils';
import { INITIAL_SITE_DATA } from '../data/initialData';

describe('Video URL Sanitization & Removal (Part 1)', () => {
  describe('isDummyVideoUrl verification', () => {
    it('detects Rickroll video IDs across all YouTube domains', () => {
      expect(isDummyVideoUrl('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe(true);
      expect(isDummyVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isDummyVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isDummyVideoUrl('https://youtube.com/v/dQw4w9WgXcQ')).toBe(true);
    });

    it('detects exact dummy placeholders and example.com domains', () => {
      expect(isDummyVideoUrl('https://example.com/video.mp4')).toBe(true);
      expect(isDummyVideoUrl('https://cdn.example.com/stream')).toBe(true);
      expect(isDummyVideoUrl('https://www.youtube.com/embed/placeholder')).toBe(true);
      expect(isDummyVideoUrl('https://www.youtube.com/embed/dummy')).toBe(true);
      expect(isDummyVideoUrl('https://www.youtube.com/embed/12345')).toBe(true);
      expect(isDummyVideoUrl('placeholder')).toBe(true);
      expect(isDummyVideoUrl('dummy')).toBe(true);
    });

    it('rejects empty, null, or undefined values', () => {
      expect(isDummyVideoUrl('')).toBe(true);
      expect(isDummyVideoUrl('   ')).toBe(true);
      expect(isDummyVideoUrl(null)).toBe(true);
      expect(isDummyVideoUrl(undefined)).toBe(true);
    });

    it('permits legitimate video URLs and does not trigger false positives on substrings', () => {
      expect(isDummyVideoUrl('https://www.youtube.com/embed/kJQP7kiw5Fk')).toBe(false);
      expect(isDummyVideoUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE')).toBe(false);
      // Valid URLs that happen to have "test" or "example" in path or query parameter must NOT be blocked
      expect(isDummyVideoUrl('https://cloud.zaboraa.com/media/network-testing-runbook.mp4')).toBe(false);
      expect(isDummyVideoUrl('https://vimeo.com/987654321?sample=test')).toBe(false);
    });
  });

  describe('INITIAL_SITE_DATA clean state', () => {
    it('has zero videos in INITIAL_SITE_DATA.videos array', () => {
      expect(INITIAL_SITE_DATA.videos).toEqual([]);
    });

    it('has undefined featuredVideoId in INITIAL_SITE_DATA', () => {
      expect(INITIAL_SITE_DATA.featuredVideoId).toBeUndefined();
    });

    it('has zero dummy videoUrl fields across all platform showcases', () => {
      for (const platform of INITIAL_SITE_DATA.platformShowcases) {
        if (platform.videoUrl) {
          expect(isDummyVideoUrl(platform.videoUrl)).toBe(false);
        }
      }
    });
  });
});
