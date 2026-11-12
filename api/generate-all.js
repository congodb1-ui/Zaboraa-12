import requireAdmin from './_lib/requireAdmin.js';
import { processGenerateCaptions } from './generate-captions.js';
import { processGenerateVideoScript } from './generate-video-script.js';
import { processGenerateKB } from './generate-kb.js';
import { processGeneratePoster } from './generate-poster.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await requireAdmin(req, res);
  } catch (authErr) {
    return res.status(authErr.status || 401).json({ success: false, error: authErr.message || 'Unauthorized' });
  }

  const { draftId } = req.body || {};
  if (!draftId) {
    return res.status(400).json({ success: false, error: 'draftId is required' });
  }

  // Execute all 4 generators in parallel using in-process helper calls
  const [captionsRes, scriptRes, kbRes, posterRes] = await Promise.allSettled([
    processGenerateCaptions(draftId),
    processGenerateVideoScript(draftId),
    processGenerateKB(draftId),
    processGeneratePoster(draftId)
  ]);

  const results = {
    captions: captionsRes.status === 'fulfilled'
      ? { ok: true, data: captionsRes.value }
      : { ok: false, error: captionsRes.reason?.message || 'Captions generation failed' },
    video_script: scriptRes.status === 'fulfilled'
      ? { ok: true, data: scriptRes.value }
      : { ok: false, error: scriptRes.reason?.message || 'Video script generation failed' },
    kb: kbRes.status === 'fulfilled'
      ? { ok: true, data: kbRes.value }
      : { ok: false, error: kbRes.reason?.message || 'KB draft generation failed' },
    poster: posterRes.status === 'fulfilled'
      ? { ok: true, data: posterRes.value }
      : { ok: false, error: posterRes.reason?.message || 'Poster generation failed' }
  };

  const hasAnySuccess = Object.values(results).some((r) => r.ok);
  const hasAnyFailure = Object.values(results).some((r) => !r.ok);

  return res.status(hasAnySuccess ? 200 : 502).json({
    success: hasAnySuccess,
    partial: hasAnyFailure,
    results
  });
}
