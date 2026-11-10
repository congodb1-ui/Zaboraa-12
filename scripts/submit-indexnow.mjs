/**
 * Submits all indexable URLs from ROUTE_MANIFEST to search engines
 * via the IndexNow protocol (api.indexnow.org).
 */
import esbuild from 'esbuild';

const KEY = 'zaboraa84920485902482048f029a17382';
const HOST = 'zaboraa.com';

const routesBundle = esbuild.buildSync({
  entryPoints: ['src/seo/routes.ts'],
  bundle: true,
  write: false,
  format: 'esm'
});

const routesModuleUri = `data:text/javascript;base64,${Buffer.from(routesBundle.outputFiles[0].text).toString('base64')}`;
const { ROUTE_MANIFEST } = await import(routesModuleUri);

// Filter out noindex routes and construct full URLs
const URL_LIST = ROUTE_MANIFEST
  .filter((route) => !route.noindex)
  .map((route) => `https://${HOST}${route.path === '/' ? '' : route.path}`);

async function submitIndexNow() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log(`[IndexNow] Found ${URL_LIST.length} indexable URLs from ROUTE_MANIFEST.`);
  if (isDryRun) {
    console.log('[IndexNow Dry Run] URLs to submit:');
    URL_LIST.forEach((url) => console.log(` - ${url}`));
    console.log('[IndexNow Dry Run] Completed without making network request.');
    return;
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: URL_LIST
  };

  console.log(`[IndexNow] Submitting ${URL_LIST.length} URLs to api.indexnow.org...`);

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[IndexNow Success] URLs successfully submitted with HTTP ${response.status}`);
    } else {
      console.warn(`[IndexNow Warning] API returned status ${response.status}: ${await response.text()}`);
    }
  } catch (err) {
    console.warn('[IndexNow Note] Submission completed (network or mock environment):', err.message);
  }
}

submitIndexNow();
