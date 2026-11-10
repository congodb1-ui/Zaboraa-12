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

  // Ensure OG / Twitter image tags
  if (!pageHtml.includes('property="og:image"')) {
    pageHtml = pageHtml.replace('</head>', `  <meta property="og:image" content="https://zaboraa.com/og/zaboraa-og.png" />\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />\n  <meta property="og:image:alt" content="Zaboraa - Enterprise VMware Cloud Architecture by Wasim Sayyed" />\n  <meta name="twitter:image" content="https://zaboraa.com/og/zaboraa-og.png" />\n</head>`);
  }

  // 4b. Emit noindex robots tag for noindex routes (D9: videos coming soon)
  if (route.noindex) {
    if (pageHtml.includes('name="robots"')) {
      pageHtml = pageHtml.replace(/<meta\s+name="robots"\s+content="[\s\S]*?"\s*\/?>/i, '<meta name="robots" content="noindex, follow" />');
    } else {
      pageHtml = pageHtml.replace('</head>', '  <meta name="robots" content="noindex, follow" />\n</head>');
    }
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

// --- PART C: Generate sitemap.xml at build from route manifest (omits noindex routes, 29 URLs) ---
const sitemapRoutes = ROUTE_MANIFEST.filter(r => !r.noindex);
const sitemapUrls = sitemapRoutes.map(r => {
  const loc = `https://zaboraa.com${r.path === '/' ? '' : r.path}`;
  const lastmod = r.lastmod || '2026-11-03';
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
const publicDir = path.resolve('public');
if (fs.existsSync(publicDir)) {
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
}
console.log(`[Sitemap Success] Generated sitemap.xml with ${sitemapRoutes.length} URLs (omitted priority and changefreq).`);

// --- PART C: Generate llms-full.txt at build from caseStudies.ts so it cannot drift ---
const caseStudiesFullMarkdown = CASE_STUDIES.map((study, idx) => {
  const sectionsText = (study.sections || []).map(sec => {
    let out = `#### ${sec.heading}\n\n${(sec.body || []).join('\n\n')}`;
    if (sec.table) {
      const headerRow = `| ${sec.table.headers.join(' | ')} |`;
      const sepRow = `| ${sec.table.headers.map(() => '---').join(' | ')} |`;
      const dataRows = sec.table.rows.map(r => `| ${r.join(' | ')} |`).join('\n');
      out += `\n\n${headerRow}\n${sepRow}\n${dataRows}`;
    }
    if (sec.subsections) {
      const subs = sec.subsections.map(sub => `##### ${sub.heading}\n\n${(sub.body || []).join('\n\n')}`).join('\n\n');
      out += `\n\n${subs}`;
    }
    return out;
  }).join('\n\n');

  const lessonsText = (study.lessonsLearned || []).map((l, i) => `${i + 1}. ${l}`).join('\n');
  const faqsText = (study.faq || []).map(f => `**Q: ${f.question}**\nA: ${f.answer}`).join('\n\n');

  return `### Case Study 0${idx + 1}: ${study.h1}
- URL: https://zaboraa.com/case-studies/${study.slug}
- Sector: ${study.sector}
- Scale: ${study.facts.scale}
- Platforms: ${study.facts.platforms}
- Connectivity: ${study.facts.connectivity}
- Role: ${study.facts.role}
- Confidentiality Notice: This case study is anonymised and aggregated across multiple engagements.
- Architecture Note: Broadcom has rebranded VMware Aria under VCF Operations and Automation.

Summary:
${study.summary}

${sectionsText}

#### Lessons Learned
${lessonsText}

#### Frequently Asked Questions
${faqsText}
`;
}).join('\n---\n\n');

const llmsFullText = `# Zaboraa — full plain-text reference

Zaboraa (https://zaboraa.com) is a founder-led enterprise VMware architecture advisory based in Pune, Maharashtra, India. Tagline: Minimal Downtime VMware Cloud and Hyperscaler Migration Authority. Led by Principal VMware Architect Wasim Sayyed, who brings 13+ years of enterprise VMware infrastructure architecture experience.

Advisory engagements serve CIOs, cloud directors, infrastructure architects, and migration leads at regulated, high-uptime public sector and enterprise organizations moving VMware datacenters to Azure VMware Solution (AVS), Google Cloud VMware Engine (GCVE), VMware Cloud on AWS (VMC), or Nutanix NC2 on Azure.

Primary call to action: Book Briefing (confidential technical consultation). Secondary: utilize the free browser-based tools at https://zaboraa.com/tools. There is no consumer software tier, pricing page, credits system, or billing.

## Founder
Wasim Sayyed, Founder and Principal VMware Architect. 13+ years in VMware infrastructure architecture. Based in Pune, Maharashtra, India. Specialist in sovereign cloud migrations, Azure VMware Solution, Google Cloud VMware Engine, and VMware Cloud on AWS.

## Advisory specialisations
- Hyperscaler procurement and sizing: avoid bare-metal cluster over-provisioning by decoupling storage to external NFS datastores (Azure NetApp Files, Amazon FSx for NetApp ONTAP, Google Cloud NetApp Volumes / Filestore).
- HCX migration architecture: wave sequencing, Replication-Assisted vMotion (RAV) for zero downtime where IPs are kept, Bulk migration for scheduled reboot windows, Layer-2 Network Extension, and Mobility Optimized Networking (MON).
- NSX-T microsegmentation: flow-based zero-trust Distributed Firewall (DFW) planning using VMware Aria Operations for Networks (vRNI) before cutover.
- Disaster recovery validation: automated failover and failback orchestration with Site Recovery Manager (SRM), 5-15 minute RPO modeling, and mandatory semi-annual recovery drills.
- Operations & Automation: VMware Aria Operations capacity forecasting, right-sizing analysis, and VMware Aria Automation cloud templates with department project isolation.

## Free engineering tools (all execute client-side with zero server storage)
1. Multi-Cloud Node and Usable Storage Estimator — /tools/sizing. Covers NC2 on Azure, AVS (AV36/AV64), VMC (i4i.metal), and GCVE (ve1/ve2). Applies RAID/FTT policies and vSAN slack factors. Shows host savings from decoupled external NFS storage. Exports Excel.
2. RVTools Ingestion and Wave Planner — /tools/rvtools-analyzer. Parses vInfo, vDisk, vMemory, vNetwork, vTools. Detects physical-mode RDMs, multi-writer disks, hardware versions below 14, missing VMware Tools, and stale snapshots. Categorizes VMs into HCX RAV, Bulk, or Cold migration waves. Outputs readiness score and Excel schedule.
3. Nutanix NC2 on Azure Assessment — /tools/nutanix-nc2-assessment. AHV compatibility, VirtIO driver injection requirements, NC2 node sizing (RF2/RF3), and Nutanix Move wave planning.
4. Aria Operations for Networks Engine — /tools/aria-networks. Ingests IPFIX flow data to discover application tiers, generate NSX Distributed Firewall rule matrices, and sequence migration waves.
5. DR RPO/RTO Planner — /tools/dr-planner. Evaluates VMware SRM with vSphere Replication, HPE Zerto, JetStream DR, and Veeam. Supports 5-minute to 24-hour RPO modeling, hot standby, pilot light, and cold storage models. Exports Excel and PDF runbooks.
6. Hybrid Blueprint Generator — /tools/design-generator. 5-step guided wizard for AVS, NC2, GCVE, and VMC architectures. Generates complete bill of materials, vector diagrams, and executive dossiers.

## Case Studies (Aggregated & Anonymised Track Record)

${caseStudiesFullMarkdown}

## Knowledge base topics (https://zaboraa.com/resources/kb)
AVS ExpressRoute FastPath BGP flapping and MTU fragmentation; mounting Azure NetApp Files NFS datastores on AVS; GCVE Private Services Access peering and DNS; VMC Connected VPC ENI routing asymmetry; migrating non-NSX workloads to NSX DFW; HCX MON asymmetric return traffic; SRM test-failover isolation; IPFIX on vSphere Distributed Switch for Aria.

## Tutorials (https://zaboraa.com/resources/tutorials)
AVS ExpressRoute FastPath and Global Reach; HCX Network Extension L2 troubleshooting runbook; NSX-T zero-trust east-west microsegmentation; external NFS datastores on VMC with Amazon FSx for NetApp ONTAP; GCVE to BigQuery analytics pipeline.

## Migration roadmap (https://zaboraa.com/roadmap)
Six phases: RVTools discovery, HCX fleet provisioning, live L2 extension, wave migration, non-disruptive cutover, post-migration optimisation.

## Contact
- Website: https://zaboraa.com
- Location: Pune, Maharashtra, India
- Email: wasim@zaboraa.com
- Founder LinkedIn: https://www.linkedin.com/in/wasim-sayyed-8b857714b/
- Company LinkedIn: https://www.linkedin.com/company/145341200/
`;

fs.writeFileSync(path.join(distDir, 'llms-full.txt'), llmsFullText, 'utf-8');
if (fs.existsSync(publicDir)) {
  fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullText, 'utf-8');
}
console.log(`[LLMs Full Success] Generated llms-full.txt with all ${CASE_STUDIES.length} case studies synchronized at build.`);
