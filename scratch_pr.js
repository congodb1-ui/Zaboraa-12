import https from 'https';

const data = JSON.stringify({
  title: 'fix(content-studio): real fix v3 - fontconfig tmp setup, KB markdown split, and forbidden claim validator enhancement',
  head: 'fix/content-studio-real-fix-v3',
  base: 'main',
  body: 'Fixes poster tofu via fontconfig tmp setup, splits KB into 2 Vertex calls returning pure Markdown, and strengthens forbidden claim validator.'
});

const options = {
  hostname: 'api.github.com',
  path: '/repos/congodb1-ui/Zaboraa-12/pulls',
  method: 'POST',
  headers: {
    'User-Agent': 'Node.js',
    'Authorization': `token ${process.env.GH_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(body);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
