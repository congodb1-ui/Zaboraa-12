import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const width = 1200;
const height = 630;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="60%" stop-color="#0b1120" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <radialGradient id="glowTopRight" cx="85%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#0891b2" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBottomLeft" cx="15%" cy="80%" r="50%">
      <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0" />
      <stop offset="30%" stop-color="#22d3ee" stop-opacity="0.8" />
      <stop offset="70%" stop-color="#38bdf8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="zabGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="zabGradIndigo" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="zabGradViolet" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <radialGradient id="zabCoreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a5f3fc"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </radialGradient>
  </defs>

  <!-- Background base -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect width="${width}" height="${height}" fill="url(#glowTopRight)" />
  <rect width="${width}" height="${height}" fill="url(#glowBottomLeft)" />

  <!-- Subtle grid pattern -->
  <g stroke="#1e293b" stroke-width="1" stroke-opacity="0.4">
    <line x1="100" y1="0" x2="100" y2="630" />
    <line x1="250" y1="0" x2="250" y2="630" />
    <line x1="400" y1="0" x2="400" y2="630" />
    <line x1="550" y1="0" x2="550" y2="630" />
    <line x1="700" y1="0" x2="700" y2="630" />
    <line x1="850" y1="0" x2="850" y2="630" />
    <line x1="1000" y1="0" x2="1000" y2="630" />
    <line x1="1150" y1="0" x2="1150" y2="630" />
    <line x1="0" y1="100" x2="1200" y2="100" />
    <line x1="0" y1="230" x2="1200" y2="230" />
    <line x1="0" y1="360" x2="1200" y2="360" />
    <line x1="0" y1="490" x2="1200" y2="490" />
  </g>

  <!-- Outer frame accent -->
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="#0e7490" stroke-width="1.5" stroke-opacity="0.4" />
  <line x1="24" y1="24" x2="1176" y2="24" stroke="url(#cyanLine)" stroke-width="3" />

  <!-- Top Badge -->
  <g transform="translate(80, 80)">
    <!-- Logo Mark Container -->
    <rect width="72" height="72" rx="16" fill="#020617" stroke="#06b6d4" stroke-width="1.5" stroke-opacity="0.6" />
    <g transform="translate(10, 10) scale(1.18)">
      <polygon points="22,3 39,12.5 39,31.5 22,41 5,31.5 5,12.5" stroke="url(#zabGradCyan)" stroke-width="1.5" stroke-opacity="0.8" fill="rgba(2, 6, 23, 0.8)"/>
      <path d="M12 12.5H32L27.5 17.5H16.5L12 12.5Z" fill="url(#zabGradCyan)"/>
      <path d="M29.5 15.5L14.5 28.5H19.5L34.5 15.5H29.5Z" fill="url(#zabGradIndigo)"/>
      <path d="M12 26.5L16.5 31.5H32L27.5 26.5H12Z" fill="url(#zabGradViolet)"/>
      <circle cx="22" cy="22" r="3.2" fill="url(#zabCoreGlow)"/>
      <circle cx="22" cy="22" r="5.5" stroke="#22d3ee" stroke-width="0.9" stroke-opacity="0.8"/>
    </g>

    <!-- Brand Name & Architecture Pill -->
    <text x="92" y="34" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#ffffff" letter-spacing="-0.5">ZABORAA</text>
    <text x="92" y="58" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600" fill="#06b6d4" letter-spacing="1.5">ENTERPRISE CLOUD ARCHITECTURE</text>
  </g>

  <!-- Main Headline -->
  <text x="80" y="240" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#f8fafc" letter-spacing="-1">
    Enterprise VMware Cloud Architecture
  </text>

  <!-- Subheadline -->
  <text x="80" y="300" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#94a3b8" letter-spacing="-0.2">
    AVS · GCVE · VMC on AWS · Nutanix NC2 · Zero-Trust NSX-T
  </text>

  <!-- Key Capability Badges -->
  <g transform="translate(80, 340)">
    <rect x="0" y="0" width="220" height="42" rx="8" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
    <text x="18" y="26" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#22d3ee">13+ Years Experience</text>

    <rect x="236" y="0" width="250" height="42" rx="8" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
    <text x="254" y="26" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#38bdf8">25+ Hyperscaler Cutovers</text>

    <rect x="502" y="0" width="230" height="42" rx="8" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
    <text x="520" y="26" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#818cf8">6x Verified Certifications</text>

    <rect x="748" y="0" width="280" height="42" rx="8" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
    <text x="766" y="26" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#a5f3fc">100% Runbook-Driven Cutovers</text>
  </g>

  <!-- Divider Line -->
  <line x1="80" y1="440" x2="1120" y2="440" stroke="#1e293b" stroke-width="1" />

  <!-- Footer Info -->
  <g transform="translate(80, 480)">
    <text x="0" y="24" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#e2e8f0">
      Wasim Sayyed
    </text>
    <text x="0" y="50" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="400" fill="#64748b">
      Founder &amp; Principal VMware Architect · Pune, India
    </text>

    <text x="1040" y="24" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="600" fill="#06b6d4">
      https://zaboraa.com
    </text>
    <text x="1040" y="50" text-anchor="end" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="13" font-weight="400" fill="#64748b">
      Free RVTools Analyzer · Sizing Tools · Architectural Runbooks
    </text>
  </g>
</svg>`;

async function generateOg() {
  const ogDir = path.resolve('public/og');
  fs.mkdirSync(ogDir, { recursive: true });
  const outPath = path.join(ogDir, 'zaboraa-og.png');

  const buf = await sharp(Buffer.from(ogSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toBuffer();

  fs.writeFileSync(outPath, buf);
  const sizeKb = (buf.length / 1024).toFixed(1);
  console.log(`Generated ${outPath} (${sizeKb} KB)`);
}

generateOg().catch(err => {
  console.error(err);
  process.exit(1);
});
