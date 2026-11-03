import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

const distDir = path.resolve('dist');
const templatePath = path.join(distDir, 'index.html');
const pristinePath = path.join(distDir, '_template.html');

if (!fs.existsSync(templatePath) && !fs.existsSync(pristinePath)) {
  console.error(`[Prerender Error] Build template not found at ${templatePath}. Run vite build first.`);
  process.exit(1);
}

let pristineHtml = '';
if (fs.existsSync(pristinePath)) {
  pristineHtml = fs.readFileSync(pristinePath, 'utf-8');
} else {
  const currentHtml = fs.readFileSync(templatePath, 'utf-8');
  if (currentHtml.includes('<div id="root"></div>')) {
    pristineHtml = currentHtml;
  } else {
    pristineHtml = currentHtml.replace(/<div id="root">[\s\S]*?<\/div>(?=\s*(?:<!-- Fixes|<noscript>|<script))/i, '<div id="root"></div>');
  }
  fs.writeFileSync(pristinePath, pristineHtml, 'utf-8');
}

// Load route manifest and case studies using esbuild
const routesBundle = esbuild.buildSync({
  entryPoints: ['src/seo/routes.ts'],
  bundle: true,
  write: false,
  format: 'esm'
});

const caseStudiesBundle = esbuild.buildSync({
  entryPoints: ['src/data/caseStudies.ts'],
  bundle: true,
  write: false,
  format: 'esm'
});

// Evaluate modules in memory
const routesModuleUri = `data:text/javascript;base64,${Buffer.from(routesBundle.outputFiles[0].text).toString('base64')}`;
const caseStudiesModuleUri = `data:text/javascript;base64,${Buffer.from(caseStudiesBundle.outputFiles[0].text).toString('base64')}`;

const { ROUTE_MANIFEST } = await import(routesModuleUri);
const { CASE_STUDIES } = await import(caseStudiesModuleUri);

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;');
}

function generateCaseStudyBody(study) {
  const sectionsHtml = (study.sections || []).map((sec, sIdx) => {
    const paragraphsHtml = (sec.body || []).map(p => `<p class="prerender-p">${escapeHtml(p)}</p>`).join('\n');
    let tableHtml = '';
    if (sec.table) {
      const headers = sec.table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
      const rows = sec.table.rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('');
      tableHtml = `<div class="prerender-table-wrap"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    const subsectionsHtml = (sec.subsections || []).map(sub => {
      const subPars = (sub.body || []).map(p => `<p class="prerender-sub-p">${escapeHtml(p)}</p>`).join('\n');
      let subTableHtml = '';
      if (sub.table) {
        const subHeaders = sub.table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
        const subRows = sub.table.rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('');
        subTableHtml = `<div class="prerender-table-wrap"><table><thead><tr>${subHeaders}</tr></thead><tbody>${subRows}</tbody></table></div>`;
      }
      return `<div class="prerender-subsection"><h3>${escapeHtml(sub.heading)}</h3>${subPars}${subTableHtml}</div>`;
    }).join('\n');

    return `<section class="prerender-section"><h2>${escapeHtml(sec.heading)}</h2>${paragraphsHtml}${tableHtml}${subsectionsHtml}</section>`;
  }).join('\n');

  const lessonsHtml = (study.lessonsLearned || []).map((l, idx) => `<li><strong>Lesson 0${idx + 1}:</strong> ${escapeHtml(l)}</li>`).join('\n');
  const faqsHtml = (study.faq || []).map(f => `<div class="prerender-faq-item"><dt><strong>${escapeHtml(f.question)}</strong></dt><dd>${escapeHtml(f.answer)}</dd></div>`).join('\n');
  const toolsHtml = (study.relatedTools || []).map(t => `<li><a href="${t.path}"><strong>${escapeHtml(t.title)}:</strong> ${escapeHtml(t.desc)}</a></li>`).join('\n');
  const disciplinesHtml = (study.relatedDisciplines || []).map(d => `<li><a href="${d.path}"><strong>${escapeHtml(d.title)}:</strong> ${escapeHtml(d.desc)}</a></li>`).join('\n');

  return `
    <article class="prerender-case-study" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      <nav aria-label="Breadcrumb" style="font-size:12px;margin-bottom:20px;">
        <a href="/" style="color:#22d3ee;text-decoration:none;">Home</a> /
        <a href="/case-studies" style="color:#22d3ee;text-decoration:none;">Case Studies</a> /
        <span style="color:#94a3b8;">${escapeHtml(study.title)}</span>
      </nav>

      <div style="font-size:12px;font-family:monospace;color:#22d3ee;margin-bottom:8px;text-transform:uppercase;">
        ${escapeHtml(study.sector)}
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(study.h1)}
      </h1>

      <p style="font-size:13px;color:#94a3b8;font-family:monospace;margin-bottom:24px;">
        By Wasim Sayyed, Principal VMware Architect, Pune · Updated: ${study.dateModified} · Broadcom has rebranded Aria under VCF Operations/Automation.
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:13px;color:#38bdf8;font-family:monospace;margin:0 0 12px 0;text-transform:uppercase;">
          Engagement Facts
        </h2>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
          <li><strong>Sector:</strong> ${escapeHtml(study.facts.sector)}</li>
          <li><strong>Estate Scale:</strong> ${escapeHtml(study.facts.scale)}</li>
          <li><strong>Platforms:</strong> ${escapeHtml(study.facts.platforms)}</li>
          <li><strong>Connectivity:</strong> ${escapeHtml(study.facts.connectivity)}</li>
          <li><strong>Role:</strong> ${escapeHtml(study.facts.role)}</li>
        </ul>
      </div>

      <aside style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px 16px;margin-bottom:28px;font-size:12px;color:#fcd34d;font-family:monospace;">
        <strong>Confidentiality Notice:</strong> This case study is anonymised and aggregated across multiple engagements.
      </aside>

      <div style="font-size:16px;color:#cbd5e1;margin-bottom:32px;font-weight:500;">
        ${escapeHtml(study.summary)}
      </div>

      <div class="prerender-sections-body">
        ${sectionsHtml}
      </div>

      <section style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <h2 style="font-size:22px;color:#ffffff;">Key Lessons Learned</h2>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${lessonsHtml}
        </ul>
      </section>

      <section style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <h2 style="font-size:22px;color:#ffffff;">Reproduce This on Your Estate</h2>
        <p style="font-size:13px;color:#94a3b8;">Reproduce each discovery, sizing, and DR modeling step with our free browser-based tools:</p>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${toolsHtml}
        </ul>
      </section>

      <section style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <h2 style="font-size:22px;color:#ffffff;">Related Disciplines</h2>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${disciplinesHtml}
        </ul>
      </section>

      <section style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <h2 style="font-size:22px;color:#ffffff;">Frequently Asked Questions</h2>
        <dl style="font-size:14px;line-height:1.6;color:#cbd5e1;">
          ${faqsHtml}
        </dl>
      </section>
    </article>
  `;
}

function generateStandardBody(route) {
  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      <nav aria-label="Site Navigation" style="font-size:12px;margin-bottom:24px;font-family:monospace;">
        <a href="/" style="color:#22d3ee;text-decoration:none;margin-right:12px;">Home</a>
        <a href="/tools" style="color:#22d3ee;text-decoration:none;margin-right:12px;">Tools</a>
        <a href="/case-studies" style="color:#22d3ee;text-decoration:none;margin-right:12px;">Case Studies</a>
        <a href="/about" style="color:#22d3ee;text-decoration:none;">About Wasim Sayyed</a>
      </nav>

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa · Enterprise VMware Cloud Architecture
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>
    </div>
  `;
}

console.log(`[Prerender] Processing ${ROUTE_MANIFEST.length} routes from manifest...`);

let generatedCount = 0;

for (const route of ROUTE_MANIFEST) {
  const canonicalUrl = `https://zaboraa.com${route.path === '/' ? '' : route.path}`;

  let pageHtml = pristineHtml;

  // 1. Replace Title
  pageHtml = pageHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);

  // 2. Replace Meta Description
  pageHtml = pageHtml.replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="description" content="${escapeAttr(route.description)}" />`);

  // 3. Replace or inject Canonical link
  if (pageHtml.includes('rel="canonical"')) {
    pageHtml = pageHtml.replace(/<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    pageHtml = pageHtml.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // 4. Update OpenGraph and Twitter tags
  pageHtml = pageHtml.replace(/<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:title" content="${escapeAttr(route.title)}" />`);
  pageHtml = pageHtml.replace(/<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:description" content="${escapeAttr(route.description)}" />`);
  pageHtml = pageHtml.replace(/<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Add Twitter card tags if not already matched
  if (!pageHtml.includes('name="twitter:title"')) {
    pageHtml = pageHtml.replace('</head>', `  <meta name="twitter:title" content="${escapeAttr(route.title)}" />\n  <meta name="twitter:description" content="${escapeAttr(route.description)}" />\n</head>`);
  }

  // 5. Inject JSON-LD
  const jsonLdScripts = (route.jsonld || []).map(schema => {
    return `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`;
  }).join('\n');

  if (jsonLdScripts) {
    pageHtml = pageHtml.replace('</head>', `${jsonLdScripts}\n</head>`);
  }

  // 6. Generate Static Body inside <div id="root"></div>
  let bodyContent = '';
  if (route.path.startsWith('/case-studies/') && route.path !== '/case-studies') {
    const slug = route.path.replace('/case-studies/', '');
    const study = CASE_STUDIES.find(cs => cs.slug === slug);
    if (study) {
      bodyContent = generateCaseStudyBody(study);
    } else {
      bodyContent = generateStandardBody(route);
    }
  } else {
    bodyContent = generateStandardBody(route);
  }

  if (pageHtml.includes('<div id="root"></div>')) {
    pageHtml = pageHtml.replace('<div id="root"></div>', () => `<div id="root"><!--prerender-start-->${bodyContent}<!--prerender-end--></div>`);
  } else {
    pageHtml = pageHtml.replace(/<div id="root">[\s\S]*?<\/div>(?=\s*(?:<!-- Fixes|<noscript>|<script))/i, () => `<div id="root"><!--prerender-start-->${bodyContent}<!--prerender-end--></div>`);
  }

  // 7. Write to dist/<path>/index.html
  let targetFile;
  if (route.path === '/') {
    targetFile = path.join(distDir, 'index.html');
  } else {
    const routeSubdir = path.join(distDir, route.path.replace(/^\//, ''));
    fs.mkdirSync(routeSubdir, { recursive: true });
    targetFile = path.join(routeSubdir, 'index.html');
  }

  fs.writeFileSync(targetFile, pageHtml, 'utf-8');
  generatedCount++;
}

console.log(`[Prerender Success] Successfully prerendered ${generatedCount} static HTML routes with independent canonicals, JSON-LD, and static body text.`);
