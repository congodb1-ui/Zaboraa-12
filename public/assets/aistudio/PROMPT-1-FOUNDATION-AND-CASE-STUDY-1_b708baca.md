You are updating the zaboraa.com codebase (React 19, Vite, TypeScript, Tailwind 4, React Router 7, hosted on Vercel with an SPA rewrite in vercel.json). This is PROMPT 1 of 3. Do only the work described here. Do not build case studies 2-7.

## GLOBAL RULES

1. Do not invent facts. Use only the Approved Fact Sheet below. If a detail is missing, omit the sentence. Never ship placeholder text such as "TBD" or "[confirm]". At the end, list every fact you omitted.
2. Anonymisation: never name a ministry, department, city, country, customer or IP address. Use "Middle East Government Entities". Every case study page shows this notice: "This case study is anonymised and aggregated across multiple engagements."
3. Naming: the company is "Zaboraa" (never "Zaboraa Technologies"). Founder: Wasim Sayyed, Principal VMware Architect, 13 years VMware architecture, Pune, Maharashtra, India. Product names: "VMware Aria Operations for Networks (vRNI)", "Aria Operations", "Aria Automation (cloud templates, formerly blueprints)". Mention once per page that Broadcom has rebranded Aria under VCF Operations/Automation.
4. All URLs and filenames lowercase. Canonical host is the apex https://zaboraa.com.
5. Never claim: "100% zero-downtime", "40+ migrations", "audit passed", a specific per-entity VM count, a specific per-entity RPO/RTO, or that Zaboraa's free tools were "used" on engagements. Say "reproduce this step with the free tool".
6. Zaboraa tools run client-side in the browser; never claim server-side storage.
7. Keep the existing visual identity (dark theme #020617, cyan accent, Plus Jakarta Sans and JetBrains Mono, executive technical tone, no emojis).

## APPROVED FACT SHEET

- Work: last 3 years, 80-90% Middle East Government Entities via Microsoft Partner, 14+ entities. Secondary: private entities via AWS Partner (VMC) and Google Partner (GCVE).
- Scale: 50-100 VMs per entity on average, up to 300 VMs for a single entity.
- Workloads: SQL Server, SQL databases, Red Hat OpenShift clusters, Postgres clusters, Oracle clusters.
- Migrations: VMware to AVS (majority); AVS to AVS cross-region (rare); VMware to GCVE; VMware to VMC on AWS.
- Connectivity: mostly VPN, some ExpressRoute.
- Blockers: reIP, routing and IP changes, Oracle clusters, latency when migrated and remaining workloads share a network (split-brain).
- DR: RPO 5-15 minutes (customer dependent), RTO 1-2 hours; DR for most customers; DR drill every 6 months where DR exists.
- Methods: HCX RAV (zero downtime, majority); HCX Bulk (minimal downtime, shutdown/restart) for some.
- Tools in real work: RVTools, HCX (RAV, Bulk), Azure NetApp Files, SRM, JetStream DR.

Accuracy corrections to bake into content:
- "Zero-downtime" applies only to RAV workloads that kept their IP (Network Extension/MON). reIP and Bulk workloads had minimal downtime.
- Global Reach requires ExpressRoute. For VPN entities, latency was mitigated by wave design (move tightly coupled tiers in the same wave), MON, and avoiding hairpin paths.
- Oracle clusters and other shared-disk clusters generally cannot use RAV/vMotion, so they were handled as a separate track. State this as the reason. Do not state a specific method.

---

## TASK 1.1: Data model and routing

- Create `src/data/caseStudies.ts`: a typed array. Each item has: slug, title, metaTitle (max 60 chars), metaDescription (max 155 chars), h1, sector, platforms[], summary, sections[] (heading, body paragraphs, optional table), diagram (id), faq[] (question, answer), relatedTools[], relatedDisciplines[], relatedSlugs[], datePublished, dateModified, keywords[].
- Add routes `/case-studies` (hub) and `/case-studies/:slug`. An unknown slug renders the NotFound page.
- Replace the current catch-all that renders the homepage with a NotFound page that sets `<meta name="robots" content="noindex">` and links home. All 23 existing routes must keep working.

## TASK 1.2: Per-route head (fixes the canonical bug)

- Remove the hardcoded `<link rel="canonical" href="https://zaboraa.com/">` from `index.html`. Every route must emit its own canonical `https://zaboraa.com/<path>` (no trailing slash, no query string).
- Use React 19 native title/meta/link hoisting (or react-helmet-async) so each route sets title, description, canonical, og:title, og:description, og:url and twitter tags.
- Create `src/seo/routes.ts`: a manifest of ALL existing 23 routes plus the new case study routes. Each entry: path, title, description, h1, summary (2-3 plain sentences), lastmod, jsonld[]. This is the single source for head tags, prerender and (later) sitemap.

## TASK 1.3: Prerender (fixes empty HTML for crawlers)

- Add `scripts/prerender.mjs`, run after `vite build`. For every route in the manifest, write `dist/<path>/index.html` (a copy of `dist/index.html`) with that route's title, meta, canonical, JSON-LD, and static content inside `<div id="root">`: the h1, the summary, internal links, and for case studies the full section text. React replaces it on load (use createRoot).
- Make the `build` script always run the prerender.
- Verify on the preview that `curl -s <preview>/case-studies/middle-east-gov-avs-framework` shows the h1, that page's own canonical, and body text without JavaScript.
- Keep the vercel.json SPA rewrite only as fallback for interactive routes. Static prerendered files take precedence.

## TASK 1.4: Structured data

- Update the Organization JSON-LD: name "Zaboraa"; logo as a PNG (min 112x112, not favicon.ico); address with addressLocality Pune, addressRegion Maharashtra, addressCountry IN; founder as a separate Person (Wasim Sayyed, jobTitle "Principal VMware Architect", knowsAbout: Azure VMware Solution, VMware HCX, NSX-T, VMware Site Recovery Manager, Google Cloud VMware Engine, VMware Cloud on AWS, Aria Operations; sameAs his LinkedIn profile URL already used on the site).
- Each case study emits TechArticle (headline, author Person, publisher Organization, datePublished, dateModified, about, keywords), BreadcrumbList (Home > Case Studies > page) and FAQPage generated from its FAQ array.

## TASK 1.5: Global consistency edits

- Replace "Zaboraa Technologies" with "Zaboraa" everywhere (titles, header, footer, About, noscript, manifest, export watermarks).
- Replace "Principal Cloud Architect" with "Principal VMware Architect"; "12+ years" with "13 years VMware architecture".
- Homepage hero stats: replace "40+ Hyperscaler Migrations Executed" and "100% Zero-Downtime Cutover Record" with "14+ Middle East Government Entities", "13 Years VMware Architecture", "AVS · GCVE · VMC". Replace the zero-downtime claim line with "Zero-downtime RAV for eligible workloads; minimal-downtime Bulk for the rest". Show only the 6 certifications that are actually itemised.
- Update the homepage title and meta description (max 155 chars) to remove "40+ migrations".
- Remove the 3 legacy case studies (Tier-1 bank 1,240 VMs; 18-hospital 4,500 VMs; global freight 820 VMs) from the hub, homepage section, search index and everywhere rendered. Move the data to `src/data/_legacyCaseStudies.ts`, imported nowhere.
- Do not edit llms.txt or sitemap.xml in this prompt.

## TASK 1.6: Reusable template `CaseStudyPage`

Order of sections: breadcrumb; H1; byline (Wasim Sayyed, Principal VMware Architect, Pune; "Updated <dateModified>"); Engagement facts card (Sector, Scale range, Platforms, Connectivity, My role); anonymisation notice; table of contents; body sections; diagram; Lessons learned; "Reproduce this on your estate" (links to relevant free tools, framed as "reproduce this step", not "tool used"); 2 related case studies; related disciplines; FAQ accordion (full text present in the prerender); CTA "Book Briefing" using the existing Schedule Briefing modal. Responsive; works in dark and light themes.

Build a reusable `CaseDiagram` SVG component (id-driven, no external images, no IPs, no real names; labels like "Site A", "Region A", "VPN", "ExpressRoute").

## TASK 1.7: Hub page `/case-studies`

- H1: "Case Studies: VMware Migrations, DR and Automation for Middle East Government Entities". Intro paragraph with the anonymisation notice. Cards generated from `caseStudies.ts` (only CS1 exists after this prompt). Filter chips by platform (AVS, GCVE, VMC, DR, NSX, Aria).

## TASK 1.8: Small fixes

- Check the cron `/api/cron` in vercel.json: if `/api/cron.ts` does not exist, remove the cron entry; if it exists, require a `CRON_SECRET` bearer check.
- Add header `Strict-Transport-Security: max-age=31536000; includeSubDomains`; remove `X-XSS-Protection`.

## TASK 1.9: Case Study 1 (full content)

- slug: `middle-east-gov-avs-framework`
- metaTitle: `VMware to Azure VMware Solution: Government Migration Framework`
- metaDescription: `How a repeatable HCX RAV/Bulk framework moved VMware estates of 50-300 VMs to Azure VMware Solution for Middle East government entities: reIP, Oracle and latency.`
- H1: `Standardised VMware to Azure VMware Solution Migration for Middle East Government Entities`
- Facts card: 14+ entities; 50-100 VMs avg, up to 300; VMware to AVS via Microsoft Partner; mostly VPN, some ExpressRoute; role: migration architecture and delivery.
- Sections:
  1. Overview and why repeatability matters.
  2. Problem: government compliance, DR requirement, minimal-downtime expectation.
  3. Complex workloads: SQL Server, Postgres, Red Hat OpenShift, Oracle clusters.
  4. Challenges as short subsections: (a) reIP and routing changes, every entity, with a decision table "extend with HCX Network Extension and keep IP" vs "reIP" and when each was chosen (connectivity type, latency, application dependency, policy); (b) Oracle and shared-disk clusters, why RAV does not apply, handled as a separate track; (c) split-brain latency, migrated vs remaining workloads on the same network, mitigated by wave design, MON, avoiding hairpin, Global Reach only where ExpressRoute exists; (d) VPN vs ExpressRoute, throughput and replication-time difference and its effect on wave size.
  5. Discovery and sizing: RVTools ingestion, blocker detection (RDMs, old hardware versions, snapshots, multi-writer disks), ANF to reduce host count.
  6. Migration method: RAV for SQL, Postgres and OpenShift where IP was kept; Bulk for less critical; downtime stated per method.
  7. Networking: VPN design, ExpressRoute where allowed, HCX Network Extension, documented routing changes.
  8. Outcome (scoped): zero downtime for RAV workloads that kept IP, minimal downtime for Bulk and reIP, DR RPO 5-15 min / RTO 1-2 h where DR was required.
  9. Lessons: reIP runbook, wave design for latency, Oracle handled separately.
- Diagram: before/after network (Site A to AVS over VPN or ExpressRoute, with Network Extension, MON and the split-brain zone highlighted) plus a small HCX wave sequence strip.
- Related tools: /tools/rvtools-analyzer, /tools/sizing, /tools/dr-planner. Related disciplines: /disciplines/avs, /disciplines/hcx.
- FAQ: What is the biggest blocker when migrating VMware to AVS? / Can Oracle clusters use HCX RAV? / Is HCX over VPN suitable for large waves?
- Keywords: vmware to avs migration, avs migration government, reip azure vmware solution, oracle cluster avs migration, hcx rav vs bulk.
- datePublished and dateModified: 2026-11-03.

## ACCEPTANCE CHECKLIST (verify and report)

- With JavaScript off, curl of `/`, `/about`, `/tools/aria-networks` and `/case-studies/middle-east-gov-avs-framework` each return a page-specific canonical, title and h1.
- No page except `/` canonicalises to the homepage.
- An unknown URL shows NotFound with noindex.
- `grep -ri` finds none of: "Zaboraa Technologies", "Principal Cloud Architect", "40+ migrations", "100% zero-downtime", "1,240", "4,500" in rendered content.
- The legacy case studies are not rendered, searchable or in the hub.

When done, report: files changed, facts omitted, any build issues. Do not start any other work.
