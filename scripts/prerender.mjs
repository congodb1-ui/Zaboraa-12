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

// Load route manifest, case studies, and initial site data using esbuild
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

const initialDataBundle = esbuild.buildSync({
  entryPoints: ['src/data/initialData.ts'],
  bundle: true,
  write: false,
  format: 'esm'
});

// Evaluate modules in memory
const routesModuleUri = `data:text/javascript;base64,${Buffer.from(routesBundle.outputFiles[0].text).toString('base64')}`;
const caseStudiesModuleUri = `data:text/javascript;base64,${Buffer.from(caseStudiesBundle.outputFiles[0].text).toString('base64')}`;
const initialDataModuleUri = `data:text/javascript;base64,${Buffer.from(initialDataBundle.outputFiles[0].text).toString('base64')}`;

const { ROUTE_MANIFEST } = await import(routesModuleUri);
const { CASE_STUDIES } = await import(caseStudiesModuleUri);
const { INITIAL_SITE_DATA } = await import(initialDataModuleUri);

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

function renderBreadcrumb(crumbs) {
  const items = crumbs.map((c, i) => {
    if (i === crumbs.length - 1) {
      return `<span style="color:#94a3b8;">${escapeHtml(c.label)}</span>`;
    }
    return `<a href="${c.url}" style="color:#22d3ee;text-decoration:none;">${escapeHtml(c.label)}</a> / `;
  }).join('');
  return `<nav aria-label="Breadcrumb" style="font-size:12px;margin-bottom:24px;font-family:monospace;">${items}</nav>`;
}

function renderRelatedLinks() {
  return `
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
      <h3 style="font-size:18px;color:#ffffff;margin-bottom:12px;">Explore Architecture & Guidance</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;font-size:13px;line-height:1.6;">
        <div>
          <strong style="color:#38bdf8;">Engineering Tools</strong><br/>
          <a href="/tools/sizing" style="color:#cbd5e1;text-decoration:none;">• Node & Storage Sizing</a><br/>
          <a href="/tools/rvtools-analyzer" style="color:#cbd5e1;text-decoration:none;">• RVTools Analyzer</a><br/>
          <a href="/tools/nutanix-nc2-assessment" style="color:#cbd5e1;text-decoration:none;">• Nutanix NC2 Assessment</a><br/>
          <a href="/tools/aria-networks" style="color:#cbd5e1;text-decoration:none;">• Aria Networks Engine</a><br/>
          <a href="/tools/dr-planner" style="color:#cbd5e1;text-decoration:none;">• DR RPO/RTO Planner</a><br/>
          <a href="/tools/design-generator" style="color:#cbd5e1;text-decoration:none;">• Blueprint Generator</a>
        </div>
        <div>
          <strong style="color:#38bdf8;">Core Disciplines</strong><br/>
          <a href="/disciplines/avs" style="color:#cbd5e1;text-decoration:none;">• Azure VMware Solution</a><br/>
          <a href="/disciplines/nutanix-nc2-azure" style="color:#cbd5e1;text-decoration:none;">• Nutanix NC2 on Azure</a><br/>
          <a href="/disciplines/gcve" style="color:#cbd5e1;text-decoration:none;">• Google Cloud VMware Engine</a><br/>
          <a href="/disciplines/vmc-dr" style="color:#cbd5e1;text-decoration:none;">• VMC on AWS & DR</a><br/>
          <a href="/disciplines/nsx" style="color:#cbd5e1;text-decoration:none;">• NSX-T Microsegmentation</a><br/>
          <a href="/disciplines/hcx" style="color:#cbd5e1;text-decoration:none;">• VMware HCX Mobility</a>
        </div>
        <div>
          <strong style="color:#38bdf8;">Runbooks & Guidance</strong><br/>
          <a href="/case-studies" style="color:#cbd5e1;text-decoration:none;">• Case Studies Catalog</a><br/>
          <a href="/roadmap" style="color:#cbd5e1;text-decoration:none;">• 6-Phase Migration Roadmap</a><br/>
          <a href="/resources/kb" style="color:#cbd5e1;text-decoration:none;">• Troubleshooting Knowledge Base</a><br/>
          <a href="/resources/tutorials" style="color:#cbd5e1;text-decoration:none;">• Step-by-Step Tutorials</a><br/>
          <a href="/about" style="color:#cbd5e1;text-decoration:none;">• About Wasim Sayyed</a>
        </div>
      </div>
    </div>
  `;
}

function generateCaseStudyBody(study) {
  const sectionsHtml = (study.sections || []).map((sec, sIdx) => {
    const paragraphsHtml = (sec.body || []).map(p => `<p class="prerender-p" style="margin-bottom:14px;color:#cbd5e1;">${escapeHtml(p)}</p>`).join('\n');
    let tableHtml = '';
    if (sec.table) {
      const headers = sec.table.headers.map(h => `<th style="border:1px solid #334155;padding:8px 12px;background:#1e293b;color:#f8fafc;">${escapeHtml(h)}</th>`).join('');
      const rows = sec.table.rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #334155;padding:8px 12px;color:#cbd5e1;">${escapeHtml(c)}</td>`).join('')}</tr>`).join('');
      tableHtml = `<div class="prerender-table-wrap" style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    const subsectionsHtml = (sec.subsections || []).map(sub => {
      const subPars = (sub.body || []).map(p => `<p class="prerender-sub-p" style="margin-bottom:12px;color:#94a3b8;">${escapeHtml(p)}</p>`).join('\n');
      let subTableHtml = '';
      if (sub.table) {
        const subHeaders = sub.table.headers.map(h => `<th style="border:1px solid #334155;padding:6px 10px;background:#1e293b;color:#f8fafc;">${escapeHtml(h)}</th>`).join('');
        const subRows = sub.table.rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #334155;padding:6px 10px;color:#cbd5e1;">${escapeHtml(c)}</td>`).join('')}</tr>`).join('');
        subTableHtml = `<div class="prerender-table-wrap" style="overflow-x:auto;margin:14px 0;"><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr>${subHeaders}</tr></thead><tbody>${subRows}</tbody></table></div>`;
      }
      return `<div class="prerender-subsection" style="margin:20px 0 16px 0;"><h3 style="font-size:18px;color:#e2e8f0;margin-bottom:8px;">${escapeHtml(sub.heading)}</h3>${subPars}${subTableHtml}</div>`;
    }).join('\n');

    return `<section class="prerender-section" style="margin-bottom:32px;"><h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;border-bottom:1px solid #1e293b;padding-bottom:8px;">${escapeHtml(sec.heading)}</h2>${paragraphsHtml}${tableHtml}${subsectionsHtml}</section>`;
  }).join('\n');

  const lessonsHtml = (study.lessonsLearned || []).map((l, idx) => `<li style="margin-bottom:8px;"><strong>Lesson 0${idx + 1}:</strong> ${escapeHtml(l)}</li>`).join('\n');
  const faqsHtml = (study.faq || []).map(f => `<div class="prerender-faq-item" style="margin-bottom:16px;"><dt><strong style="color:#38bdf8;">${escapeHtml(f.question)}</strong></dt><dd style="margin:6px 0 0 0;color:#cbd5e1;">${escapeHtml(f.answer)}</dd></div>`).join('\n');
  const toolsHtml = (study.relatedTools || []).map(t => `<li style="margin-bottom:6px;"><a href="${t.path}" style="color:#22d3ee;text-decoration:none;"><strong>${escapeHtml(t.title)}:</strong></a> <span style="color:#94a3b8;">${escapeHtml(t.desc)}</span></li>`).join('\n');
  const disciplinesHtml = (study.relatedDisciplines || []).map(d => `<li style="margin-bottom:6px;"><a href="${d.path}" style="color:#22d3ee;text-decoration:none;"><strong>${escapeHtml(d.title)}:</strong></a> <span style="color:#94a3b8;">${escapeHtml(d.desc)}</span></li>`).join('\n');

  return `
    <article class="prerender-case-study" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Case Studies', url: '/case-studies' },
        { label: study.title, url: `/case-studies/${study.slug}` }
      ])}

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
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;">Key Lessons Learned</h2>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${lessonsHtml}
        </ul>
      </section>

      <section style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;">Reproduce This on Your Estate</h2>
        <p style="font-size:13px;color:#94a3b8;margin-bottom:12px;">Reproduce each discovery, sizing, and DR modeling step with our free browser-based tools:</p>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${toolsHtml}
        </ul>
      </section>

      <section style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;">Related Disciplines</h2>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${disciplinesHtml}
        </ul>
      </section>

      <section style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;">Frequently Asked Questions</h2>
        <dl style="font-size:14px;line-height:1.6;color:#cbd5e1;">
          ${faqsHtml}
        </dl>
      </section>

      ${renderRelatedLinks()}
    </article>
  `;
}

function generateHomeBody(route) {
  const tools = [
    { title: 'Multi-Cloud Node & Storage Sizing Estimator', url: '/tools/sizing', desc: 'Compute bare-metal node requirements and storage pooling across AVS, NC2, GCVE, and VMC on AWS. Model external NFS datastores (Azure NetApp Files, Amazon FSx ONTAP, Google Cloud NetApp Volumes) to decouple compute and storage spend.' },
    { title: 'RVTools Migration Readiness & Wave Planner', url: '/tools/rvtools-analyzer', desc: 'Ingest and parse multi-tab RVTools vInfo, vDisk, and vNetwork exports in-browser. Detect migration blockers (physical RDMs, multi-writer disks, outdated virtual hardware) and sequence HCX RAV/Bulk waves.' },
    { title: 'Nutanix NC2 on Azure Assessment Engine', url: '/tools/nutanix-nc2-assessment', desc: 'Evaluate bare-metal Nutanix Cloud Clusters on Azure. Model AHV compatibility, VirtIO driver injection, RF2/RF3 replication overhead, and Nutanix Move cutover waves.' },
    { title: 'VMware Aria Operations for Networks Traffic Engine', url: '/tools/aria-networks', desc: 'Analyze East-West IPFIX and sFlow network telemetry to group multi-tier applications, synthesize NSX Distributed Firewall rules, and plan boundary microsegmentation.' },
    { title: 'Disaster Recovery RPO/RTO & WAN Calculator', url: '/tools/dr-planner', desc: 'Model replication bandwidth, change rates, and WAN saturation across VMware Site Recovery Manager (SRM), vSphere Replication, Zerto, and JetStream DR.' },
    { title: 'Hybrid Architecture Blueprint Generator', url: '/tools/design-generator', desc: 'Generate multi-cloud VMware SDDC reference architectures with bill-of-materials, network topology matrices, and exportable engineering dossiers.' }
  ];

  const disciplines = INITIAL_SITE_DATA.platformShowcases || [];
  const studies = CASE_STUDIES;

  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa · Founder-Led Enterprise VMware Advisory
      </div>
      <h1 style="font-size:36px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>
      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:32px;">
        <h2 style="font-size:14px;color:#38bdf8;font-family:monospace;text-transform:uppercase;margin:0 0 16px 0;">
          Verified Advisory Metrics & Architectural Guardrails
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;font-size:13px;">
          <div><strong style="color:#ffffff;font-size:20px;display:block;">13+ Years</strong> Enterprise VMware Infrastructure & Cloud Architecture Experience</div>
          <div><strong style="color:#ffffff;font-size:20px;display:block;">25+ Migrations</strong> Large-Scale Sovereign & Enterprise Datacenter Cutovers</div>
          <div><strong style="color:#ffffff;font-size:20px;display:block;">100% Runbook</strong> Deterministic Pre-Validated Step-by-Step Execution</div>
          <div><strong style="color:#ffffff;font-size:20px;display:block;">6 Credentials</strong> VCAP-DCV Design, VCP-NV, VCP-DCV, NCP-CI Azure, VMC Master</div>
        </div>
      </div>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Self-Service Engineering Workbench (Zero Server Storage)</h2>
        <p style="font-size:14px;color:#94a3b8;margin-bottom:16px;">
          Zaboraa provides six free, production-grade engineering tools that run entirely client-side in the browser. No login, credentials, or registration required. Your workload data and RVTools spreadsheets never leave your local device.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${tools.map(t => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <h3 style="font-size:16px;margin:0 0 8px 0;"><a href="${t.url}" style="color:#22d3ee;text-decoration:none;">${escapeHtml(t.title)}</a></h3>
              <p style="font-size:13px;color:#94a3b8;margin:0;">${escapeHtml(t.desc)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Core Architectural Disciplines</h2>
        <p style="font-size:14px;color:#94a3b8;margin-bottom:16px;">
          Specialized design and migration frameworks developed across complex VMware multi-cloud environments:
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${disciplines.map(d => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <span style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;">${escapeHtml(d.badge)}</span>
              <h3 style="font-size:16px;margin:4px 0 8px 0;"><a href="/disciplines/${d.id}" style="color:#ffffff;text-decoration:none;">${escapeHtml(d.title)}</a></h3>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 10px 0;">${escapeHtml(d.description)}</p>
              <ul style="padding-left:18px;margin:0;font-size:12px;color:#cbd5e1;">
                ${(d.keyDeliverables || []).slice(0, 2).map(kd => `<li>${escapeHtml(kd)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Featured Migration & DR Case Studies</h2>
        <p style="font-size:14px;color:#94a3b8;margin-bottom:16px;">
          Aggregated and anonymized production case studies demonstrating repeatable migration methodologies:
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${studies.map(s => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <span style="font-size:11px;font-family:monospace;color:#22d3ee;text-transform:uppercase;">${escapeHtml(s.sector)}</span>
              <h3 style="font-size:16px;margin:4px 0 8px 0;"><a href="/case-studies/${s.slug}" style="color:#ffffff;text-decoration:none;">${escapeHtml(s.title)}</a></h3>
              <p style="font-size:13px;color:#94a3b8;margin:0;">${escapeHtml(s.summary)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Advisory Process: 6-Phase Hyperscaler Migration Roadmap</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          Every enterprise engagement follows a deterministic 6-phase lifecycle: (1) RVTools Discovery and Workload Profiling, (2) Dedicated ExpressRoute / Direct Connect / Interconnect Underlay Provisioning, (3) HCX Service Mesh and Appliance Fleet Deployment, (4) Live L2 Network Extension with Mobility Optimized Networking (MON), (5) Workload Migration Waves via Bulk and Replication-Assisted vMotion (RAV), and (6) Post-Migration L2 Gateway Cutover and Decoupled Cloud Storage Attachment. Explore the full breakdown on the <a href="/roadmap" style="color:#22d3ee;text-decoration:none;">Hyperscaler Migration Roadmap</a>.
        </p>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </div>
  `;
}

function generateToolBody(route) {
  const path = route.path;
  const toolManifest = route;
  const sw = (route.jsonld || []).find(j => j['@type'] === 'SoftwareApplication');
  const features = sw?.featureList || [];

  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Tools', url: '/tools' },
        { label: route.title.split('—')[0].trim(), url: route.path }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa Self-Service Engineering Workbench
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:13px;color:#38bdf8;font-family:monospace;margin:0 0 12px 0;text-transform:uppercase;">
          Tool Specifications & Privacy Guarantees
        </h2>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
          <li><strong>Execution Mode:</strong> 100% Client-Side Browser Execution</li>
          <li><strong>Data Storage:</strong> Zero Server Storage & No Telemetry Collection</li>
          <li><strong>Authentication:</strong> Free Access (No Login, Cookies or Billing)</li>
          <li><strong>Export Formats:</strong> Microsoft Excel (.xlsx) & Architecture Reports</li>
        </ul>
      </div>

      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;">Core Capabilities & Features</h2>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
        </ul>
      </section>

      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;">Inputs, Analysis & Deliverables</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin-bottom:14px;">
          Architects use this utility to ingest vSphere inventory specifications, storage consumption figures, and network throughput metrics. Calculations run instantly in local memory using official vendor sizing algorithms (Microsoft AVS AV36/AV64 node guidelines, Nutanix NC2 cluster sizing standards, AWS i4i.metal specs, and Google Cloud ve1/ve2 profiles).
        </p>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          All outputs—including recommended cluster node counts, vSAN slack factors, RAID-1/RAID-5/RAID-6 storage allocations, external NFS datastore savings, and wave grouping schedules—are exportable directly to Excel for integration into client proposal decks and migration runbooks.
        </p>
      </section>

      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;">Architectural Context & Related Disciplines</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          This tool directly supports the planning phases of our core architecture disciplines: <a href="/disciplines/avs" style="color:#22d3ee;text-decoration:none;">Azure VMware Solution</a>, <a href="/disciplines/nutanix-nc2-azure" style="color:#22d3ee;text-decoration:none;">Nutanix NC2 on Azure</a>, <a href="/disciplines/hcx" style="color:#22d3ee;text-decoration:none;">VMware HCX Mobility</a>, and <a href="/disciplines/nsx" style="color:#22d3ee;text-decoration:none;">NSX-T Microsegmentation</a>. Review our <a href="/roadmap" style="color:#22d3ee;text-decoration:none;">6-Phase Migration Roadmap</a> to understand how sizing and wave sequencing fit into cutover execution.
        </p>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </div>
  `;
}

function generateToolsHubBody(route) {
  const tools = [
    { title: 'Node & Storage Sizing Estimator', url: '/tools/sizing', desc: 'Host count and usable storage for AVS, VMC, GCVE, and Nutanix NC2. Evaluates external NFS datastores to decouple compute and storage spend.' },
    { title: 'RVTools Migration Readiness & Wave Planner', url: '/tools/rvtools-analyzer', desc: 'Parses RVTools exports to detect migration blockers (RDMs, multi-writer disks, snapshots, old hardware versions) and group VMs into HCX waves.' },
    { title: 'Nutanix NC2 on Azure Assessment', url: '/tools/nutanix-nc2-assessment', desc: 'Evaluates AHV compatibility, VirtIO driver needs, NC2 node sizing (RF2/RF3), and Nutanix Move wave planning.' },
    { title: 'Aria Operations for Networks Traffic Engine', url: '/tools/aria-networks', desc: 'Converts network flow telemetry into application tiers, NSX Distributed Firewall rules, and migration waves.' },
    { title: 'DR RPO/RTO & WAN Calculator', url: '/tools/dr-planner', desc: 'Models WAN bandwidth, 5-minute to 24-hour RPO modeling, and RTO timelines across SRM, vSphere Replication, Zerto, and JetStream DR.' },
    { title: 'Hybrid Architecture Blueprint Generator', url: '/tools/design-generator', desc: '5-step guided wizard producing a complete bill of materials, vector diagrams, and executive dossiers for five migration paths.' }
  ];

  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Tools', url: '/tools' }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa Self-Service Engineering Workbench
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:32px;">
        <h2 style="font-size:13px;color:#38bdf8;font-family:monospace;margin:0 0 12px 0;text-transform:uppercase;">
          Client-Side Zero-Storage Architectural Privacy
        </h2>
        <p style="font-size:13px;color:#cbd5e1;margin:0;">
          All six tools execute entirely in the client browser runtime. No uploaded RVTools spreadsheets, IP addresses, VM names, or sizing criteria are ever transmitted to any backend server or stored in cookies. You retain complete sovereignty over your enterprise workload metadata.
        </p>
      </div>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Available Calculators & Assessment Utilities</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${tools.map(t => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <h3 style="font-size:16px;margin:0 0 8px 0;"><a href="${t.url}" style="color:#22d3ee;text-decoration:none;">${escapeHtml(t.title)}</a></h3>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 12px 0;">${escapeHtml(t.desc)}</p>
              <a href="${t.url}" style="font-size:12px;color:#38bdf8;font-weight:600;text-decoration:none;">Open Tool →</a>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">How to Use the Engineering Workbench in Migration Delivery</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin-bottom:12px;">
          In Phase 1 (Discovery & Assessment), export your vSphere estate using RVTools and ingest it into the <a href="/tools/rvtools-analyzer" style="color:#22d3ee;text-decoration:none;">RVTools Analyzer</a> to detect multi-writer disks, physical RDMs, and snapshot chains.
        </p>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin-bottom:12px;">
          Next, feed raw compute and storage requirements into the <a href="/tools/sizing" style="color:#22d3ee;text-decoration:none;">Node & Storage Sizing Estimator</a> to evaluate bare-metal node counts against decoupled external NFS storage options (Azure NetApp Files, FSx ONTAP, Google Cloud NetApp Volumes).
        </p>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          For East-West network microsegmentation and firewall rule synthesis, ingest NetFlow/IPFIX records into the <a href="/tools/aria-networks" style="color:#22d3ee;text-decoration:none;">Aria Operations for Networks Engine</a> before cutover. For disaster recovery validation, use the <a href="/tools/dr-planner" style="color:#22d3ee;text-decoration:none;">DR RPO/RTO Planner</a> to establish replication bandwidth requirements.
        </p>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </div>
  `;
}

function generateDisciplineBody(route) {
  const platformId = route.path.replace('/disciplines/', '');
  const platform = (INITIAL_SITE_DATA.platformShowcases || []).find(p => p.id === platformId) || {
    badge: 'Enterprise SDDC',
    platform: 'VMware Architecture',
    title: route.h1,
    description: route.summary,
    keyDeliverables: [],
    designs: []
  };

  const designs = platform.designs || [];

  return `
    <article class="prerender-discipline" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Disciplines', url: '/disciplines' },
        { label: platform.platform || platform.badge, url: route.path }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        ${escapeHtml(platform.badge)} · ${escapeHtml(platform.platform)}
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(platform.description || route.summary)}
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:32px;">
        <h2 style="font-size:14px;color:#38bdf8;font-family:monospace;margin:0 0 16px 0;text-transform:uppercase;">
          Core Architectural Deliverables
        </h2>
        <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;line-height:1.8;margin:0;">
          ${(platform.keyDeliverables || []).map(kd => `<li>${escapeHtml(kd)}</li>`).join('')}
        </ul>
      </div>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Production Reference Architecture Designs</h2>
        ${designs.map((d, idx) => `
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:20px;margin-bottom:20px;">
            <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;">Design Pattern 0${idx + 1}</div>
            <h3 style="font-size:18px;color:#ffffff;margin:0 0 10px 0;">${escapeHtml(d.title)}</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0 0 14px 0;">${escapeHtml(d.description)}</p>
            
            <h4 style="font-size:13px;color:#cbd5e1;font-family:monospace;text-transform:uppercase;margin:0 0 8px 0;">Engineering Specifications</h4>
            <ul style="padding-left:18px;font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 16px 0;">
              ${(d.detailedSpecs || []).map(ds => `<li>${escapeHtml(ds)}</li>`).join('')}
            </ul>

            <h4 style="font-size:13px;color:#cbd5e1;font-family:monospace;text-transform:uppercase;margin:0 0 8px 0;">Architectural Components</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
              ${(d.components || []).map(c => `
                <div style="background:#1e293b;border-radius:6px;padding:10px;font-size:12px;">
                  <strong style="color:#ffffff;display:block;">${escapeHtml(c.name)}</strong>
                  <span style="color:#38bdf8;display:block;margin-bottom:4px;">${escapeHtml(c.role)}</span>
                  <span style="color:#94a3b8;">${escapeHtml(c.details)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Related Engineering Tools & Case Studies</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          Model and size this deployment using the <a href="/tools/sizing" style="color:#22d3ee;text-decoration:none;">Node & Storage Sizing Estimator</a> or evaluate workload migration waves with the <a href="/tools/rvtools-analyzer" style="color:#22d3ee;text-decoration:none;">RVTools Analyzer</a>. Review real-world delivery results in our <a href="/case-studies" style="color:#22d3ee;text-decoration:none;">Enterprise Case Studies Catalog</a>.
        </p>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </article>
  `;
}

function generateAboutBody(route) {
  const about = INITIAL_SITE_DATA.aboutPage || {};
  const certs = about.validatedCertifications || [];
  const outcomes = about.selectedOutcomes || [];
  const tenets = about.tenets || [];
  const steps = about.engagementSteps || [];

  return `
    <article class="prerender-about" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'About', url: '/about' }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa Leadership & Track Record
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(about.positioningLine || route.summary)}
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:32px;">
        <h2 style="font-size:14px;color:#38bdf8;font-family:monospace;margin:0 0 16px 0;text-transform:uppercase;">
          Verified Architectural Proof Metrics
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;font-size:13px;">
          <div><strong style="color:#ffffff;font-size:20px;display:block;">13+ Years</strong> Enterprise VMware Infrastructure & Cloud Architecture Experience</div>
          <div><strong style="color:#ffffff;font-size:20px;display:block;">25+ Migrations</strong> Large-Scale Sovereign & Enterprise Datacenter Cutovers</div>
          <div><strong style="color:#ffffff;font-size:20px;display:block;">100% Runbook</strong> Deterministic Pre-Validated Step-by-Step Execution</div>
          <div><strong style="color:#ffffff;font-size:20px;display:block;">6 Credentials</strong> VCAP-DCV Design, VCP-NV, VCP-DCV, NCP-CI Azure, VMC Master</div>
        </div>
      </div>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Founder Background & Engineering Philosophy</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin-bottom:14px;">
          Wasim Sayyed is a Principal VMware Architect and the founder of Zaboraa, based in Pune, Maharashtra, India. With more than 13 years of hands-on infrastructure engineering and cloud architecture experience, Wasim has led large-scale datacenter evacuations, disaster recovery validations, and software-defined network transformations for regulated government agencies, financial institutions, and global enterprises.
        </p>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          Zaboraa operates under a strict founder-led engineering model: every engagement is designed, validated, and overseen directly by a principal architect. There are no junior handoffs, generic offshore staffing, or opaque automated playbooks.
        </p>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Validated Industry Certifications (Verifiable)</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
          ${certs.map(c => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:14px;">
              <strong style="color:#ffffff;font-size:14px;display:block;margin-bottom:4px;">${escapeHtml(c.name)}</strong>
              <div style="font-size:12px;color:#94a3b8;font-family:monospace;">${escapeHtml(c.issuer)} · Verified ${escapeHtml(c.date)}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Selected Migration & Architecture Outcomes</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${outcomes.map(o => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <span style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;">${escapeHtml(o.sector)}</span>
              <p style="font-size:14px;color:#cbd5e1;margin:8px 0 12px 0;line-height:1.6;">${escapeHtml(o.text)}</p>
              ${o.caseStudySlug ? `<a href="/case-studies/${o.caseStudySlug}" style="font-size:12px;color:#22d3ee;text-decoration:none;">View Case Study →</a>` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Core Advisory Tenets</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
          ${tenets.map(t => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <h3 style="font-size:16px;color:#ffffff;margin:0 0 8px 0;">${escapeHtml(t.title)}</h3>
              <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6;">${escapeHtml(t.description)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Engagement Steps</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
          ${steps.map((s, idx) => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;">Step 0${idx + 1}</div>
              <h3 style="font-size:16px;color:#ffffff;margin:0 0 8px 0;">${escapeHtml(s.title)}</h3>
              <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6;">${escapeHtml(s.description)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </article>
  `;
}

function generateRoadmapBody(route) {
  const phases = [
    {
      code: 'Phase 01',
      title: 'Discovery, Assessment & Application Profiling',
      subtitle: 'Dependency analysis, bandwidth sizing, and MTU boundary discovery',
      duration: 'Weeks 1 - 2',
      objectives: [
        'Profile on-premises vSphere inventory using RVTools and Aria Operations for Networks',
        'Map active TCP/UDP communication flows between database, application, and web tiers',
        'Validate MTU path support and Round Trip Time (RTT) latency constraints across sites',
        'Group workloads into migration waves based on tight latency couplings and shared subnets'
      ],
      deliverables: [
        'Wave Migration Schedule & Readiness Scorecard',
        'Underlay Bandwidth Sizing Model (TB / Day)',
        'Storage Decoupling vs Bare-Metal Node Sizing Matrix'
      ]
    },
    {
      code: 'Phase 02',
      title: 'Underlay Connectivity & Network Foundation',
      subtitle: 'Provision carrier circuits, BGP routing sessions, and Hub transit topology',
      duration: 'Weeks 3 - 4',
      objectives: [
        'Establish dedicated carrier circuits with dual cross-connect redundant BGP sessions',
        'Configure Jumbo Frames (MTU 9000/8900) across physical switches and edge routers',
        'Deploy centralized transit hub (Virtual WAN / Transit Gateway / VPC Peering)',
        'Establish DNS forwarders and Active Directory domain controller sync into the cloud'
      ],
      deliverables: [
        'Deterministic BGP Routing Table with Dual Peering Redundancy',
        'Sub-Millisecond Hub-to-SDDC Interconnect Verified',
        'IP Address Management (IPAM) allocation without CIDR overlaps'
      ]
    },
    {
      code: 'Phase 03',
      title: 'Migration Mesh & HCX Appliance Deployment',
      subtitle: 'Deploy HCX Cloud/Connector, establish site pairing, and initialize Service Mesh',
      duration: 'Weeks 5 - 6',
      objectives: [
        'Deploy HCX Cloud Manager in target SDDC and HCX Connector in on-premises vSphere',
        'Establish mutual TLS site pairing over port 443 with SSO authentication',
        'Define Compute Profiles (Clusters, DVS, Storage) and Network Profiles (Uplink, vMotion, Mgmt)',
        'Deploy Service Mesh appliance fleet: Interconnect (IX), Network Extension (NE), WAN Opt (WO)'
      ],
      deliverables: [
        'Active HCX Service Mesh with UP status on IX and NE tunnels',
        'Encrypted IPsec UDP 4500 transport verified across underlay',
        'Disaster Recovery and Bulk Migration replication engine online'
      ]
    },
    {
      code: 'Phase 04',
      title: 'Live L2 Network Extension & Default Gateway Strategy',
      subtitle: 'Stretch production VLANs into NSX overlays and activate MON anti-hairpin routing',
      duration: 'Weeks 7 - 8',
      objectives: [
        'Extend on-premises VLAN subnets seamlessly to Cloud NSX-T overlay segments via HCX NE',
        'Verify zero IP re-addressing or DNS modification required for migrated VMs',
        'Enable Mobility Optimized Networking (MON) to prevent traffic tromboning/hairpinning',
        'Inject /32 host routes into Cloud NSX Tier-1 router for local cloud breakout'
      ],
      deliverables: [
        'Stretched Layer 2 Broadcast Domains with Sub-Millisecond Transit',
        'MON Local Egress Policy verified for cloud-native PaaS services',
        'Zero IP address alteration for legacy transactional databases'
      ]
    },
    {
      code: 'Phase 05',
      title: 'Workload Migration Waves & Atomic Switchover',
      subtitle: 'Execute scheduled Bulk and Replication-Assisted vMotion (RAV) migration batches',
      duration: 'Weeks 9 - 14',
      objectives: [
        'Pre-seed bulk virtual disks asynchronously in background without impacting production IOPS',
        'Execute final sync and cutover during scheduled maintenance windows with zero data loss',
        'Leverage Replication-Assisted vMotion (RAV) for transactional Oracle/SQL databases',
        'Perform automated vSphere guest customization and verification checks post-cutover'
      ],
      deliverables: [
        'Hundreds of virtual machines migrated per maintenance wave',
        'Zero downtime transactional database live cutovers',
        'Complete rollback safety with on-premises snapshot retention'
      ]
    },
    {
      code: 'Phase 06',
      title: 'Post-Migration Optimization & Modernization',
      subtitle: 'Unextend L2 VLANs, cut over default gateways to NSX, and attach cloud storage',
      duration: 'Weeks 15 - 18',
      objectives: [
        'Unextend legacy Layer 2 VLANs once all workloads on the subnet have migrated',
        'Cut over default gateway IP to NSX Tier-1 Gateway for pure cloud routing',
        'Decommission on-premises source appliances and tear down temporary HCX Service Mesh',
        'Attach decoupled external storage (ANF / FSx / GCNV) and integrate with cloud AI/analytics'
      ],
      deliverables: [
        'Clean native NSX overlay routing with zero reliance on on-premises infrastructure',
        'Decoupled storage pools scaling independently from physical node licensing',
        'Private AI/ML pipeline integration (Azure OpenAI, AWS Bedrock, GCP Vertex AI)'
      ]
    }
  ];

  return `
    <article class="prerender-roadmap" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Roadmap', url: '/roadmap' }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa Migration Methodology
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:32px;">
        <h2 style="font-size:14px;color:#38bdf8;font-family:monospace;margin:0 0 12px 0;text-transform:uppercase;">
          Methodology Overview
        </h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin:0;">
          The Zaboraa Hyperscaler Migration Roadmap provides a deterministic, tested framework for migrating complex enterprise and sovereign VMware environments to Azure VMware Solution (AVS), Nutanix NC2 on Azure, Google Cloud VMware Engine (GCVE), or VMware Cloud on AWS (VMC). Each phase incorporates specific exit criteria, automated health checks, and rollback safety gates.
        </p>
      </div>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:20px;">The Six Migration Phases</h2>
        ${phases.map(p => `
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:20px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
              <span style="font-size:12px;font-family:monospace;color:#38bdf8;text-transform:uppercase;font-weight:bold;">${escapeHtml(p.code)} · ${escapeHtml(p.duration)}</span>
            </div>
            <h3 style="font-size:18px;color:#ffffff;margin:0 0 6px 0;">${escapeHtml(p.title)}</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0 0 14px 0;">${escapeHtml(p.subtitle)}</p>

            <h4 style="font-size:12px;color:#cbd5e1;font-family:monospace;text-transform:uppercase;margin:0 0 6px 0;">Phase Objectives</h4>
            <ul style="padding-left:18px;font-size:13px;color:#cbd5e1;line-height:1.7;margin:0 0 14px 0;">
              ${p.objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}
            </ul>

            <h4 style="font-size:12px;color:#cbd5e1;font-family:monospace;text-transform:uppercase;margin:0 0 6px 0;">Key Deliverables</h4>
            <ul style="padding-left:18px;font-size:13px;color:#94a3b8;line-height:1.7;margin:0;">
              ${p.deliverables.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </article>
  `;
}

function generateResourcesHubBody(route) {
  const kbs = INITIAL_SITE_DATA.knowledgeBase || [];
  const tuts = INITIAL_SITE_DATA.tutorials || [];

  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Resources', url: '/resources' }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa Technical Documentation
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Implementation Tutorials (${tuts.length} Guides)</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${tuts.map(t => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <span style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;">${escapeHtml(t.category)} · ${escapeHtml(t.readTime)}</span>
              <h3 style="font-size:16px;margin:4px 0 8px 0;"><a href="/resources/tutorials/${t.slug}" style="color:#ffffff;text-decoration:none;">${escapeHtml(t.title)}</a></h3>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 10px 0;">${escapeHtml(t.summary)}</p>
              <a href="/resources/tutorials/${t.slug}" style="font-size:12px;color:#22d3ee;text-decoration:none;">Read Tutorial →</a>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Operational Knowledge Base (${kbs.length} Runbooks)</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${kbs.map(k => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <span style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;">${escapeHtml(k.id)} · ${escapeHtml(k.serviceCategory)}</span>
              <h3 style="font-size:15px;margin:4px 0 8px 0;"><a href="/resources/kb/${k.id.toLowerCase()}" style="color:#ffffff;text-decoration:none;">${escapeHtml(k.title)}</a></h3>
              <p style="font-size:12px;color:#94a3b8;margin:0 0 10px 0;">${escapeHtml(k.rootCause.substring(0, 140))}...</p>
              <a href="/resources/kb/${k.id.toLowerCase()}" style="font-size:12px;color:#22d3ee;text-decoration:none;">View Runbook →</a>
            </div>
          `).join('')}
        </div>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </div>
  `;
}

function generateTutorialsHubBody(route) {
  const tuts = INITIAL_SITE_DATA.tutorials || [];

  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Resources', url: '/resources' },
        { label: 'Tutorials', url: '/resources/tutorials' }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa Technical Implementation Guides
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Production Tutorials (${tuts.length} Guides)</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${tuts.map(t => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <span style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;">${escapeHtml(t.category)} · ${escapeHtml(t.difficulty)} · ${escapeHtml(t.readTime)}</span>
              <h3 style="font-size:16px;margin:4px 0 8px 0;"><a href="/resources/tutorials/${t.slug}" style="color:#ffffff;text-decoration:none;">${escapeHtml(t.title)}</a></h3>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 10px 0;">${escapeHtml(t.summary)}</p>
              <a href="/resources/tutorials/${t.slug}" style="font-size:12px;color:#22d3ee;text-decoration:none;">Read Full Tutorial →</a>
            </div>
          `).join('')}
        </div>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </div>
  `;
}

function generateKbHubBody(route) {
  const kbs = INITIAL_SITE_DATA.knowledgeBase || [];

  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Resources', url: '/resources' },
        { label: 'Knowledge Base', url: '/resources/kb' }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        Zaboraa Operational Troubleshooting Runbooks
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <section style="margin-bottom:36px;">
        <h2 style="font-size:24px;color:#ffffff;margin-bottom:16px;">Production Runbooks (${kbs.length} Articles)</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          ${kbs.map(k => `
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;">
              <span style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;">${escapeHtml(k.id)} · ${escapeHtml(k.serviceCategory)} · ${escapeHtml(k.severity)}</span>
              <h3 style="font-size:15px;margin:4px 0 8px 0;"><a href="/resources/kb/${k.id.toLowerCase()}" style="color:#ffffff;text-decoration:none;">${escapeHtml(k.title)}</a></h3>
              <p style="font-size:12px;color:#94a3b8;margin:0 0 10px 0;">${escapeHtml(k.rootCause.substring(0, 140))}...</p>
              <a href="/resources/kb/${k.id.toLowerCase()}" style="font-size:12px;color:#22d3ee;text-decoration:none;">View Resolution Steps →</a>
            </div>
          `).join('')}
        </div>
      </section>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </div>
  `;
}

function generateVideosHubBody(route) {
  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Resources', url: '/resources' },
        { label: 'Videos', url: '/resources/videos' }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#f59e0b;text-transform:uppercase;margin-bottom:8px;">
        Video Library · Production Recording in Progress
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(route.h1)}
      </h1>

      <p style="font-size:16px;color:#cbd5e1;margin-bottom:28px;">
        ${escapeHtml(route.summary)}
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:32px;">
        <h2 style="font-size:16px;color:#fcd34d;margin:0 0 10px 0;">Architecture Masterclasses Under Production</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin:0 0 16px 0;">
          Video masterclasses covering Azure VMware Solution ExpressRoute FastPath deployment, VMware HCX Mobility Optimized Networking (MON) troubleshooting, and NSX Distributed Firewall zero-trust modeling are currently in studio production.
        </p>
        <p style="font-size:13px;color:#94a3b8;margin:0;">
          In the interim, please reference our step-by-step written documentation in the <a href="/resources/tutorials" style="color:#22d3ee;text-decoration:none;">Tutorials Catalog</a> and operational troubleshooting guides in the <a href="/resources/kb" style="color:#22d3ee;text-decoration:none;">Knowledge Base</a>.
        </p>
      </div>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </div>
  `;
}

function generateKBArticleBody(kb) {
  const steps = kb.resolutionSteps || [];
  const relatedDocs = kb.relatedDocLinks || [];

  return `
    <article class="prerender-kb" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Resources', url: '/resources' },
        { label: 'Knowledge Base', url: '/resources/kb' },
        { label: kb.id, url: `/resources/kb/${kb.id.toLowerCase()}` }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        ${escapeHtml(kb.id)} · ${escapeHtml(kb.component)} · ${escapeHtml(kb.severity)} Severity
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(kb.title)}
      </h1>

      <div style="font-size:13px;color:#94a3b8;font-family:monospace;margin-bottom:24px;">
        Category: ${escapeHtml(kb.serviceCategory)} · Updated: ${escapeHtml(kb.lastUpdated)} · Status: ${escapeHtml(kb.status)}
      </div>

      ${kb.architectNote ? `
        <div style="background:rgba(56,189,248,0.08);border-left:4px solid #38bdf8;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#bae6fd;">
          <strong style="color:#ffffff;display:block;margin-bottom:4px;">Architect Advisory Note:</strong>
          ${escapeHtml(kb.architectNote)}
        </div>
      ` : ''}

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:13px;color:#38bdf8;font-family:monospace;margin:0 0 10px 0;text-transform:uppercase;">
          Observed Symptoms & Trigger Conditions
        </h2>
        <ul style="padding-left:18px;margin:0;font-size:13px;color:#cbd5e1;line-height:1.7;">
          ${(kb.symptoms || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>

      <section style="margin-bottom:28px;">
        <h2 style="font-size:20px;color:#ffffff;margin-bottom:10px;">Impact Scope</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${escapeHtml(kb.impactScope)}
        </p>
      </section>

      <section style="margin-bottom:28px;">
        <h2 style="font-size:20px;color:#ffffff;margin-bottom:10px;">Technical Root Cause</h2>
        <p style="font-size:14px;color:#cbd5e1;line-height:1.8;">
          ${escapeHtml(kb.rootCause)}
        </p>
      </section>

      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#ffffff;margin-bottom:16px;">Step-by-Step Resolution Procedure</h2>
        ${steps.map((st, idx) => `
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;margin-bottom:14px;">
            <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;">Step 0${idx + 1}</div>
            <h3 style="font-size:16px;color:#ffffff;margin:0 0 6px 0;">${escapeHtml(st.title)}</h3>
            <p style="font-size:13px;color:#cbd5e1;margin:0 0 8px 0;line-height:1.7;">${escapeHtml(st.description)}</p>
            ${st.command ? `
              <pre style="background:#020617;border:1px solid #334155;padding:10px;border-radius:6px;font-family:monospace;font-size:12px;color:#22d3ee;overflow-x:auto;margin:8px 0 0 0;"><code>${escapeHtml(st.command)}</code></pre>
            ` : ''}
          </div>
        `).join('')}
      </section>

      ${kb.verificationCheck ? `
        <section style="margin-bottom:28px;">
          <h2 style="font-size:20px;color:#ffffff;margin-bottom:10px;">Verification & Validation Check</h2>
          <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:16px;font-size:13px;color:#cbd5e1;line-height:1.7;">
            ${escapeHtml(kb.verificationCheck)}
          </div>
        </section>
      ` : ''}

      ${relatedDocs.length > 0 ? `
        <section style="margin-bottom:28px;">
          <h2 style="font-size:20px;color:#ffffff;margin-bottom:10px;">Official Vendor Documentation References</h2>
          <ul style="padding-left:18px;margin:0;font-size:13px;line-height:1.8;">
            ${relatedDocs.map(rd => `<li><a href="${escapeAttr(rd.url)}" target="_blank" rel="noopener noreferrer" style="color:#22d3ee;text-decoration:none;">${escapeHtml(rd.label)}</a></li>`).join('')}
          </ul>
        </section>
      ` : ''}

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </article>
  `;
}

function generateTutorialArticleBody(tut) {
  const sections = tut.sections || [];
  const prereqs = tut.prerequisites || [];

  return `
    <article class="prerender-tutorial" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: 'Resources', url: '/resources' },
        { label: 'Tutorials', url: '/resources/tutorials' },
        { label: tut.title, url: `/resources/tutorials/${tut.slug}` }
      ])}

      <div style="font-size:11px;font-family:monospace;color:#38bdf8;text-transform:uppercase;margin-bottom:8px;">
        ${escapeHtml(tut.category)} · ${escapeHtml(tut.difficulty)} · ${escapeHtml(tut.readTime)}
      </div>

      <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 16px 0;">
        ${escapeHtml(tut.title)}
      </h1>

      <p style="font-size:13px;color:#94a3b8;font-family:monospace;margin-bottom:24px;">
        By ${escapeHtml(tut.author?.name || 'Wasim Sayyed')}, ${escapeHtml(tut.author?.title || 'Principal VMware Architect')} · Published: ${escapeHtml(tut.publishedDate)}
      </p>

      <div style="font-size:16px;color:#cbd5e1;margin-bottom:28px;font-weight:500;">
        ${escapeHtml(tut.summary)}
      </div>

      ${prereqs.length > 0 ? `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:28px;">
          <h2 style="font-size:13px;color:#38bdf8;font-family:monospace;margin:0 0 10px 0;text-transform:uppercase;">
            Prerequisites & Minimum Architecture Requirements
          </h2>
          <ul style="padding-left:18px;margin:0;font-size:13px;color:#cbd5e1;line-height:1.7;">
            ${prereqs.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="prerender-sections-body">
        ${sections.map((s, idx) => `
          <section style="margin-bottom:32px;">
            <h2 style="font-size:22px;color:#ffffff;margin-bottom:12px;border-bottom:1px solid #1e293b;padding-bottom:8px;">${escapeHtml(s.heading)}</h2>
            <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin-bottom:14px;">${escapeHtml(s.content)}</p>
            ${s.callout ? `
              <div style="background:rgba(56,189,248,0.08);border-left:4px solid #38bdf8;padding:12px 16px;margin:14px 0;font-size:13px;color:#bae6fd;">
                ${escapeHtml(s.callout.text)}
              </div>
            ` : ''}
            ${s.codeBlock ? `
              <pre style="background:#020617;border:1px solid #334155;padding:14px;border-radius:8px;font-family:monospace;font-size:12px;color:#22d3ee;overflow-x:auto;margin:14px 0;"><code>${escapeHtml(s.codeBlock.code)}</code></pre>
            ` : ''}
          </section>
        `).join('')}
      </div>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #1e293b;font-size:13px;color:#94a3b8;font-family:monospace;">
        <span>Lead Principal Architect: Wasim Sayyed, Principal VMware Architect, Pune, Maharashtra, India.</span>
        <br/>
        <span>Free browser-based engineering tools execute client-side with zero server storage.</span>
      </div>

      ${renderRelatedLinks()}
    </article>
  `;
}

function generateStandardBody(route) {
  return `
    <div class="prerender-page" style="max-width:960px;margin:0 auto;padding:40px 20px;font-family:sans-serif;line-height:1.6;color:#e2e8f0;">
      ${renderBreadcrumb([
        { label: 'Home', url: '/' },
        { label: route.title.split('—')[0].trim(), url: route.path }
      ])}

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

      ${renderRelatedLinks()}
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
  if (route.path === '/') {
    bodyContent = generateHomeBody(route);
  } else if (route.path === '/tools') {
    bodyContent = generateToolsHubBody(route);
  } else if (route.path.startsWith('/tools/')) {
    bodyContent = generateToolBody(route);
  } else if (route.path.startsWith('/disciplines/')) {
    bodyContent = generateDisciplineBody(route);
  } else if (route.path === '/about') {
    bodyContent = generateAboutBody(route);
  } else if (route.path === '/roadmap') {
    bodyContent = generateRoadmapBody(route);
  } else if (route.path === '/resources') {
    bodyContent = generateResourcesHubBody(route);
  } else if (route.path === '/resources/tutorials') {
    bodyContent = generateTutorialsHubBody(route);
  } else if (route.path === '/resources/kb') {
    bodyContent = generateKbHubBody(route);
  } else if (route.path === '/resources/videos') {
    bodyContent = generateVideosHubBody(route);
  } else if (route.path.startsWith('/resources/kb/')) {
    const kbId = route.path.replace('/resources/kb/', '');
    const kb = (INITIAL_SITE_DATA.knowledgeBase || []).find(k => k.id.toLowerCase() === kbId.toLowerCase());
    if (kb) {
      bodyContent = generateKBArticleBody(kb);
    } else {
      bodyContent = generateStandardBody(route);
    }
  } else if (route.path.startsWith('/resources/tutorials/')) {
    const slug = route.path.replace('/resources/tutorials/', '');
    const tut = (INITIAL_SITE_DATA.tutorials || []).find(t => t.slug === slug);
    if (tut) {
      bodyContent = generateTutorialArticleBody(tut);
    } else {
      bodyContent = generateStandardBody(route);
    }
  } else if (route.path.startsWith('/case-studies/') && route.path !== '/case-studies') {
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

// --- PART C: Generate sitemap.xml at build from route manifest (omits noindex routes, 52 URLs) ---
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

// --- PART D: Generate llms-full.txt at build from caseStudies.ts & initialData.ts so it cannot drift ---
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

const kbsMarkdown = (INITIAL_SITE_DATA.knowledgeBase || []).map(kb => {
  return `### ${kb.id}: ${kb.title}
- URL: https://zaboraa.com/resources/kb/${kb.id.toLowerCase()}
- Category: ${kb.serviceCategory} | Component: ${kb.component} | Severity: ${kb.severity}
- Impact Scope: ${kb.impactScope}
- Root Cause: ${kb.rootCause}
${kb.architectNote ? `- Architect Note: ${kb.architectNote}\n` : ''}`;
}).join('\n');

const tutsMarkdown = (INITIAL_SITE_DATA.tutorials || []).map(tut => {
  return `### ${tut.title}
- URL: https://zaboraa.com/resources/tutorials/${tut.slug}
- Category: ${tut.category} | Difficulty: ${tut.difficulty} | Read Time: ${tut.readTime}
- Author: ${tut.author?.name || 'Wasim Sayyed'}, ${tut.author?.title || 'Principal VMware Architect'}
- Summary: ${tut.summary}
`;
}).join('\n');

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

## Operational Knowledge Base Runbooks (https://zaboraa.com/resources/kb)

${kbsMarkdown}

## Technical Implementation Tutorials (https://zaboraa.com/resources/tutorials)

${tutsMarkdown}

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
console.log(`[LLMs Full Success] Generated llms-full.txt with all ${CASE_STUDIES.length} case studies, ${INITIAL_SITE_DATA.knowledgeBase.length} KB runbooks, and ${INITIAL_SITE_DATA.tutorials.length} tutorials synchronized at build.`);
