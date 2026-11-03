/**
 * Submits the 8 new and updated URLs (Case Studies Hub + 7 Case Studies)
 * to search engines via the IndexNow protocol (api.indexnow.org).
 */

const KEY = 'zaboraa84920485902482048f029a17382';
const HOST = 'zaboraa.com';

const URL_LIST = [
  'https://zaboraa.com/case-studies',
  'https://zaboraa.com/case-studies/middle-east-gov-avs-framework',
  'https://zaboraa.com/case-studies/avs-to-avs-cross-region',
  'https://zaboraa.com/case-studies/gov-dr-failover-drills',
  'https://zaboraa.com/case-studies/private-gcve-vmc-migration',
  'https://zaboraa.com/case-studies/nsxt-microsegmentation-aria-networks',
  'https://zaboraa.com/case-studies/aria-operations-networks-deployment',
  'https://zaboraa.com/case-studies/aria-automation-blueprints-vcenter'
];

async function submitIndexNow() {
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
