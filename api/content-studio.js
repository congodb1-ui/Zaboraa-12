export default async function handler(req, res) {
  let track = '';
  try {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed. Content Studio requires POST.' });
    }

    // Dynamic import inside handler to ensure zero module-level crash risk
    const { default: requireAdmin } = await import('./_lib/requireAdmin.js');

    const authResult = await requireAdmin(req, res);
    if (!authResult || !authResult.authorized) {
      return;
    }

    track = req.query?.track || '';
    const { draftId } = req.body || {};

    if (!draftId) {
      return res.status(400).json({ success: false, error: 'Missing required body field: draftId' });
    }

    const {
      processGenerateCaptions,
      processGenerateVideoScript,
      processGenerateKB,
      processGeneratePoster,
      processGenerateAll,
    } = await import('./_lib/studioProcessors.js');

    let result;
    switch (track) {
      case 'captions':
        result = await processGenerateCaptions(draftId);
        break;
      case 'video-script':
        result = await processGenerateVideoScript(draftId);
        break;
      case 'kb':
        result = await processGenerateKB(draftId);
        break;
      case 'poster':
        result = await processGeneratePoster(draftId);
        break;
      case 'all':
        result = await processGenerateAll(draftId);
        break;
      default:
        return res.status(400).json({ success: false, error: `Invalid or missing track parameter: ${track}` });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(`[content-studio] Handler uncaught exception (track=${track}):`, err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      track,
      error: 'Content Studio internal error: ' + String(err?.message || err).slice(0, 300),
      retryable: true,
    });
  }
}
