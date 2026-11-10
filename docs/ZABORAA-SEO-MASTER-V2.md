# ZABORAA — SINGLE SEO MASTER FILE — v2.1
**Single source of truth for SEO, GEO (AI Visibility), Content & Marketing — now with the implementation plan, status tracker and Antigravity CLI runbook (§19–§21) · v2.1: founder decisions D1–D9 applied, autonomous no-questions runbook**

> **READ THIS FIRST — Accuracy Note**
> Zaboraa is **NOT** a consumer AI-tools platform. It is a **founder-led enterprise VMware / hyperscaler cloud-architecture advisory** with a free **engineering workbench of 6 calculators / assessment tools**. There is **no pricing page, no credits system, no billing and no generation history**. Do not invent them.
> **Source precedence (v2.1):** (0) the founder's decisions D1–D9 in §19.2 (they override any code value they contradict; Phase 1 brings the code in line) → (1) the codebase uploaded 10 Nov 2026 (`Zaboraa-Website-Project-Folder.zip`, 247 files) → (2) founder-reported live checks (Bing CNAME verified, GSC 6 indexed — 10 Nov 2026) → (3) this file → (4) v1.0 / v1.1.
> **Status tags used in this file:** `DONE-IN-CODE` (present in the zip, not yet verified live by Claude) · `DONE-LIVE` (founder-verified) · `TODO` · `READY` (decided by the founder, to be applied in code) · `DECISION` (founder must choose first — none open in v2.1) · `MANUAL` (dashboard step Antigravity cannot do) · `VERIFY` (could not be confirmed from the zip) · `CONFLICT` (code disagrees with itself).
> **Claude could not check the live site** (no network to zaboraa.com from the audit environment). "Live" statements below are the founder's own 10 Nov 2026 observations.

| Field | Value |
|---|---|
| Brand | **Zaboraa** — used everywhere, including footer, JSON-LD and LinkedIn (founder decision D7); "Zaboraa Technologies" is retired |
| Domain (canonical) | **https://zaboraa.com** — apex is canonical. `www` 301-redirects to apex. Legacy alias `zaboraa-12.vercel.app` redirects to `https://zaboraa.com` |
| Home `<title>` (canonical) | **Zaboraa - Enterprise VMware Cloud Architecture** (46 chars) |
| Founder | **Wasim Sayyed** — Founder & Principal VMware Architect (founder decision D4) |
| Founder LinkedIn | https://www.linkedin.com/in/wasim-sayyed-8b857714b/ |
| Company LinkedIn | https://www.linkedin.com/company/145341200/ (ID: 145341200) |
| Contact | wasim@zaboraa.com · +91 7497624807 · Pune, Maharashtra, India |
| Business model | Founder-led advisory (briefing booking) + free interactive engineering tools as lead-gen and credibility |
| Primary / Secondary CTA | **Book Briefing** / **Book Call** · **Explore Workbench Tools** (`/tools`) |
| Version | **v2.1 — 10 Nov 2026** (supersedes v2.0; founder decisions D1–D9 applied) |
| Companion file | `ZABORAA_MASTER_BIBLE_v2.md` |
| Jump to | **§19 Implementation Plan & Status Tracker** · §20 Antigravity runbook · §21 Verification checklist |

---

## 0. CHANGELOG & VERIFICATION LOG

| Version | Date | Change |
|---|---|---|
| v1.0 | 10 Nov 2026 | Merged Master Bible + SEO config. |
| v1.1 | 10 Nov 2026 | Bing CNAME verification, GSC 6-indexed status, certification hold, Antigravity/Supabase workflow, verification log. |
| **v2.0** | **10 Nov 2026** | **Audited against the project zip.** Corrected statements that the code no longer supports (listed below), added the 30-route reality, new findings (missing favicon/logo/OG image, duplicate JSON-LD risk, legacy figures on /about, 23 MB of images, dev-port clash), the founder decision list, the phased implementation plan, the Antigravity CLI runbook and the verification checklist. |
| **v2.1** | **10 Nov 2026** | **Founder decisions D1–D9 recorded and applied to the plan:** 13+ years · 25+ migrations · 6 certifications · Principal VMware Architect · "100% Runbook-Driven Cutovers" · latest case-study outcomes on /about · brand = Zaboraa · public disclosure approved · videos not available yet (new tasks P1-07 and P1-08; `/resources/videos` → `noindex`, sitemap 30 → 29 URLs). `vercel.json`, `tsconfig.json` and `.gitignore` confirmed present and working. Antigravity runbook rewritten as a fully autonomous, no-questions run (§20). |
| **v2.2** | **10 Nov 2026** | **Autonomous execution of Phase 0 through Phase 4 completed by Antigravity CLI:** P0-01 to P0-05 baseline & security guardrails; P1-01 to P1-08 content integrity & founder decisions D1–D9 applied (zero retired claims across codebase); P2-01 to P2-11 technical SEO, favicons, OG image, de-duplication, soft-404 hygiene, vercel.json hardening, IndexNow, llms.txt, Vitest invariants; P3-01 to P3-03 WebP image optimization (-88% size to 2.68 MB), self-hosted variable fonts, route-level code splitting (58% initial bundle reduction); P4-01 to P4-05 rich prerendered semantic HTML on all 53 routes (450–1,658 words/page), dedicated pages for 18 KB runbooks and 5 tutorials, SoftwareApplication schema for 7 tools, Person schema with 6 verified credentials for founder, and universal BreadcrumbList and contextual cross-linking (>= 3 links/page). 53 manifest routes, 52 indexable sitemap URLs. P4-06 remains ON HOLD per D9. |

**v1.1 statements corrected in v2.0:**
| v1.1 said | Code reality (evidence) |
|---|---|
| Sitemap = 23 URLs (+1 detail) | **30 URLs**, generated at build from `ROUTE_MANIFEST` (`scripts/prerender.mjs` Part C). Includes all 7 case-study detail pages |
| Only 1 case-study detail slug known; 2 "TO CONFIRM" | **All 7 slugs are in code** (§3.5) — nothing left to confirm |
| `<noscript>` contains an `<h1>` | `index.html` noscript now uses `<p><strong>` (no H1). H1 now comes from the **prerendered body** of each route |
| Meta description is the 145-char `index.html` string | Production description per route comes from **`src/seo/routes.ts`**; home = 156 chars. `index.html` is only the fallback template |
| JSON-LD logo = `/favicon.ico` | Code uses `https://zaboraa.com/assets/images/zaboraa-logo.png` — **file does not exist in `public/`** |
| "13 years" / "12+ years" used interchangeably | Hero & noscript & llms = **13**; /about tile & `routes.ts` About = **12+** (CONFLICT, D1) |
| Hero 6× (hold) | Code hero = **8×**; 6 certs itemised (CONFLICT, D3) |
| Founder = Principal Cloud Architect | Code = **Principal VMware Architect** (D4) |
| Case-study metrics (1,240 / 4,500 / 820) usable in YouTube/Reddit copy | **Archived and blocked by tests.** Do not use (D6) |
| Dev server `localhost:3001` | `package.json` `dev` script is **port 3000** — collides with Zabura FX (P0-02) |
| `vercel.json` shown as production config | **Not in the zip** — verify the real repo file (P0-03) |

> **v2.1 note:** the "Code reality" column above describes the zip of 10 Nov 2026 **before** the founder's decisions. Every CONFLICT/HOLD in it is now resolved by D1–D9 (§19.2) and is applied by Phase 1. `vercel.json`, `tsconfig.json` and `.gitignore` are confirmed present by the founder.

**Live verification on 10 Nov 2026 (founder-reported):** Bing Webmaster verified via CNAME, sitemap Success · GSC property `zaboraa.com`, sitemap Success, 23 discovered, **6 indexed** · Cloudflare security events re-check pending · favicon check pending · LinkedIn page rename pending.

---

## 1. COMPANY IDENTITY & POSITIONING

### 1.1 One-line pitch
> Founder-led VMware cloud architecture, hyperscaler migration, interactive diagrams, runbooks and software tutorials across Azure AVS, AWS VMC and Google Cloud GCVE.
*(Target wording after P1-08 / D9. The code still says "video masterclasses" until P1-08 is applied — the videos do not exist yet.)*

### 1.2 Hero copy (verbatim from site data)
- **Eyebrow:** EXECUTIVE CLOUD ADVISORY · FOUNDER-LED
- **Headline:** Minimal Downtime VMware Cloud & Hyperscaler Migration Authority
- **Subheadline:** Architecting mission-critical enterprise cloud evacuations, sovereign VMware software-defined datacenters, and automated disaster recovery across Azure (AVS), AWS (VMC), and Google Cloud (GCVE).
- **Hero stats (decided — D1/D2/D3/D5):** 13+ Years Enterprise Infrastructure · 25+ Hyperscaler Migrations Executed · **6×** Verified Cloud Certifications · 100% Runbook-Driven Cutovers *(code still shows 8× until P1-02 / P1-05 are applied)*
- **/about proof tiles (decided — D1/D2/D5):** 13+ Years · 25+ Hyperscaler Migrations · 100% Runbook-Driven Cutovers · 6 Free Engineering Tools *(code still shows 12+ / 40+ / "100% Zero-Downtime Cutover Record" until P1-02 is applied)*

### 1.3 Long description [DERIVED]
Zaboraa helps large enterprises (government entities and regulated, high-uptime private enterprises) move VMware-based datacenters to the cloud with minimal downtime and runbook-driven cutovers. It covers the full chain: discovering and sizing the on-premises estate, choosing and sizing the target platform (Azure VMware Solution, Google Cloud VMware Engine, VMware Cloud on AWS, or Nutanix NC2 on Azure), securing it with NSX-T zero-trust microsegmentation, migrating with VMware HCX, and protecting it with disaster-recovery orchestration (SRM and alternatives). Everything is backed by a deep library of reference architectures, runbooks, tutorials and videos, and a set of free browser-based tools that produce sizing, readiness, wave-plan, DR and bill-of-materials deliverables.

### 1.4 Tagline / Brand marks
- Default in-app logo subtitle: **“Enterprise VMware Architecture”** (editable by admin as `brandTagline`)
- Watermark on exported blueprints: **“ZABORAA · HYBRID CLOUD BLUEPRINT”**
- Default PDF / export classification: **“CONFIDENTIAL // ARCHITECTURAL ASSESSMENT”**

### 1.5 Mission & vision
**[NOT IN CODEBASE]** — No explicit mission statement exists. Closest stated positioning: *“Minimal downtime VMware cloud & hyperscaler migration authority”* and *“100% Runbook-Driven Cutovers”* (D5 — the old “100% zero-downtime” wording is retired). Founder must supply official mission line.

### 1.6 Brand voice & tone [DERIVED]
- **Authoritative, technical, executive-level.** Speaks to CIOs, infrastructure architects and migration leads.
- Vocabulary: “runbook-driven cutover”, “minimal downtime”, “evacuation”, “sovereign”, “zero-trust”, “mission-critical”, “Tier-0”, “wave planning”, “zero-costing technical assessment”.
- Proof-driven: leans on numbers (VM counts, downtime hours, TCO reduction, certifications).
- Serious, calm, engineering-precise; no hype, no emojis, no consumer-style slang.
- Labels and microcopy are monospaced “console” style (e.g. `PRINCIPAL ARCHITECTURAL DESK`, `Zero-Cost Technical Architecture`).

### 1.7 Visual identity
| Element | Spec |
|---|---|
| Default theme | **Dark** (page `#020617`, surface `#0f172a`, subtle `#1e293b`, border `#334155`) |
| Light theme | High-contrast light (page `#f8fafc`, surface `#ffffff`, text `#0f172a`, accent `#2563eb`) — toggled by sun/moon button, saved in localStorage (`zaboraa_theme_mode`) |
| Primary accent | **Cyan** (Tailwind cyan-400 `#22d3ee` / cyan-300 for hovers) |
| Secondary accents | Emerald (success / NC2), Indigo / Violet (generator, logo gradient), Rose (DR / alerts), Amber (theme toggle sun) |
| Logo mark | Square rounded tile, dark slate gradient with thin cyan border; network / node motif — four corner nodes (sky, cyan, indigo, teal) around a glowing cyan core with pulsing ring; dashed crosshair guide lines. Gradients: cyan → indigo → violet |
| Wordmark | **ZABORAA** uppercase, black weight, white; small mono badge beside it; subtitle in tiny uppercase mono slate-400 |
| Heading / body font | **Plus Jakarta Sans** (300–800) |
| Mono / technical font | **JetBrains Mono** (400–600) |
| UI style | Glassmorphism header, dark cards with slate-800 borders, tech-grid background, live “telemetry particle” ambient background, floating data-center graphic, rounded-2xl cards, cyan glow on hover |
| PWA theme color | `#020617` (manifest short name “Zaboraa Admin”) |

---

## 2. FOUNDER / ABOUT

| Field | Value |
|---|---|
| Name | **Wasim Sayyed** |
| Title (v2, matches code) | **Founder & Principal VMware Architect** — used in `src/seo/routes.ts`, JSON-LD, `llms.txt`, `llms-full.txt`, prerendered pages and `index.html`. Decided (D4): **Principal VMware Architect**. Older documents said "Principal Cloud Architect" (retired); two stale strings remain in code and are fixed in P1-03: `src/utils/excelFormatter.ts:46` and `src/pages/tools/NodeSizingToolPage.tsx:451`. |
| Page label | "Principal Architectural Desk" / "About Principal Architect" |
| Location | Pune, Maharashtra, India (JSON-LD `PostalAddress`); on-site UI label "Pune & Global Advisory" |
| Portrait asset | `src/assets/images/Wasim-Pic-02.png` (bundled by Vite — it is **not** a public static path) |
| About-page headline | "Enterprise Cloud Architecture & Advisory" |
| Positioning line (code, `aboutPage.positioningLine`) | "Founder-led VMware and Nutanix cloud migration and disaster-recovery advisory across Azure AVS, NC2, GCVE and VMC." |

**Bio:** the v1 Bible quoted a "verbatim" bio ("Architecting high-consequence enterprise cloud evacuations…"). That text is **no longer found anywhere in `src/`** in the 10 Nov 2026 codebase. Use the positioning line above until the founder supplies an official bio **[VERIFY]**.

**Certifications — 6 itemised in code (`INITIAL_SITE_DATA.aboutPage.validatedCertifications`):**
| # | Certification | Issuer | Date |
|---|---|---|---|
| 1 | Nutanix Certified Professional – Cloud Integration – Azure (NCP-CI-Azure) 6.10 | Nutanix | May 2026 |
| 2 | VMware Certified Advanced Professional – Data Center Virtualization Design 2023 (VCAP-DCV Design 2023) | VMware by Broadcom | Oct 2023 |
| 3 | VMware Certified Professional – Network Virtualization 2023 (VCP-NV 2023) | VMware by Broadcom | Feb 2023 |
| 4 | VMware Certified Professional – Data Center Virtualization 2023 (VCP-DCV 2023) | VMware by Broadcom | Jan 2023 |
| 5 | VMware Certified Specialist – Cloud Foundation 2023 | VMware by Broadcom | Jan 2023 |
| 6 | Master Specialist – VMware Cloud on AWS 2023 | VMware by Broadcom | Jan 2023 |

> ✅ **Certification count decided (D3): 6.** The hero in code still shows "8× Verified Cloud Certifications" (`initialData.ts:630`, locked by `heroMetricsAndAlignment.test.ts`); P1-02 / P1-05 change it to **6×** so it equals the 6 itemised certificates. Never add a certificate without founder proof.
> ⚠️ **Removed from v1 list — do NOT use unless the founder confirms they are held:** Azure Solutions Architect Expert · Google Cloud Professional Cloud Architect · NSX-T Advanced Network Security · "VCAP-DCV Design & Deploy" (code lists only the *Design 2023* exam).

**Advisory specializations on /about [from v1 — re-verify against `aboutPage.tenets`]:**
| Pillar | Description |
|---|---|
| Hyperscaler Procurement & Sizing | Prevent cluster over-provisioning through decoupled external NFS storage (ANF / FSx ONTAP) |
| HCX Zero-Downtime Migration | Production wave sequencing, Network Extension L2 stretching, MON traffic routing |
| NSX-T Microsegmentation | Zero-trust DFW rule discovery via Aria Operations for Networks before cutover |
| Disaster Recovery Validation | SRM non-disruptive failover testing, RTO sequencing, WAN delta modeling |

**Founder story / why Zaboraa was built / personal vision:** **[NOT IN CODEBASE]** — founder must provide origin story, motivation, vision statement, photo/video preferences.

---

## 3. COMPLETE SITE MAP

The site is a single-page React app (client-side routing). **All public pages and all tools are open to anonymous visitors** (`publicAccessEnabled: true`, `authRequiredForTools: false`). Only admin console is protected.

### 3.1 Public routes (30 URLs in the SEO manifest — every one is prerendered to static HTML at build)

| URL path | Page | What it contains |
|---|---|---|
| `/` | **Homepage** | Hero (headline, stats, portrait, “Book Briefing”, “Explore Workbench Tools”); Cloud Migration Architecture Showcase; Layered Architecture Showcase; Engagement Methodology; discipline cards; Case Studies; Featured video / knowledge sections |
| `/disciplines/:id` | **Discipline detail** (8 ids, §3.3) | Deep-dive per platform: architecture layers, components, interactive diagrams |
| `/tools` | **Workbench Hub** | Index of 6 tools (§4) |
| `/tools/sizing` | Node & Storage Sizing Estimator | Tool 1 |
| `/tools/rvtools-analyzer` | RVTools Ingestion & Wave Planner | Tool 2 |
| `/tools/nutanix-nc2-assessment` | Nutanix NC2 on Azure Assessment | Tool 3 |
| `/tools/aria-networks` | Aria Operations for Networks Engine | Tool 4 |
| `/tools/dr-planner` | DR RPO/RTO Planner | Tool 5 |
| `/tools/design-generator` | Hybrid Blueprint Generator | Tool 6 |
| `/roadmap` | **6-Phase Enterprise Hyperscaler Migration Roadmap** | “From RVTools discovery and HCX fleet provisioning through live L2 extension, non-disruptive cutover and post-migration optimization.” CTA: Assess Inventory in RVTools Tool |
| `/resources` | **Resources hub** (tabs: All / Nutanix Architecture / KB / Tutorials / Videos) | Knowledge base, tutorials; Videos tab is an empty "coming soon" state until videos exist (D9) |
| `/resources/:tab` | Direct tab links: `/resources/kb`, `/resources/tutorials`, `/resources/videos` | Same page, tab preselected |
| `/case-studies` | **Case Studies hub** | Lists the 7 case studies (§3.5) |
| `/case-studies/:slug` | **Case Study detail** (7 slugs, §3.5) | Facts, sections, lessons learned, related tools/disciplines, FAQ, JSON-LD |
| `/about` | **About Principal Architect** | Founder profile (§2) |
| `*` (unknown URL) | **NotFoundPage** (`noindex`) | HTTP 200 via SPA fallback — see P2-06 |

### 3.2 Admin routes (protected — NOT public, disallowed in robots.txt)
| URL path | Purpose |
|---|---|
| `/admin`, `/admin/:tab` and `/console`, `/console/:tab` | Admin Control Center. Guard: signed-in user with role `admin` (or offline admin session); otherwise redirected to `/`. |

Admin tabs / views: Overview, Analytics, AI Management, Briefings, Content, CRM, Database, Integrations, Media, Profile, Security, SEO, Settings, Users, Vault, Workspaces, Backups. Also in-page Site Customizer drawer, Photo Editor, Platform Editor, Track Record Editor, Watermark Settings.

### 3.3 Discipline pages (`/disciplines/:id`)
| id | Title |
|---|---|
| `avs` | Azure VMware Solution (AVS) Architecture & Migration |
| `gcve` | Google Cloud VMware Engine (GCVE) Architecture & Migration |
| `vmc-dr` | VMC on AWS Migration & Multi-AZ Disaster Recovery (DR) |
| `nsx` | NSX-T Software-Defined Networking & Zero-Trust Microsegmentation |
| `hcx` | VMware HCX (Hybrid Cloud Extension) Mobility & Network Extension |
| `srm` | VMware Site Recovery Manager (SRM) & Automated Disaster Recovery |
| `aria` | VMware Aria Operations for Networks (Flow Discovery & NSX DFW Microsegmentation) |
| `nutanix-nc2-azure` | VMware SDDC to Nutanix NC2 on Azure Architecture & Migration |

### 3.4 Global layout elements (every public page)
- **Header / Navbar:** logo → `/`; Tools mega-menu (`/tools` + all 6 tools); Roadmap; Resources dropdown (Resources, Knowledge Base, Tutorials, Videos); Case Studies; About; **Search** (Ctrl+K command palette across platforms, tools, runbooks); theme toggle; **Sign In** (Google / Microsoft SSO or email); **Book Briefing** CTA; admin link (admins only). Mobile drawer mirrors this.
- **Footer:** logo; Tools column (Workbench, Sizing, RVTools, DR Planner, Blueprint Generator); Disciplines column (links to `/disciplines/:id`); contact (mailto + tel); links to About, Resources, Case Studies; discreet Admin link.
- **Floating controls (bottom-right):** theme toggle · “Customize Site” (admins) · **Book Call** (cyan pill).
- **Optional announcement banner** (admin-toggled; default: “New: VMware to Nutanix NC2 on Azure Migration Assessment Engine is Live!” → `/tools/nutanix-nc2-assessment`).
- **Modals / drawers:** Schedule Briefing; Search Command; Founder Credentials; Hero Stats; User Workspace drawer (saved work); Commercialize / Auth portal; PWA install prompt; Offline reconciliation drawer.

### 3.5 Case studies (7 active — anonymised, aggregated)

Source: `src/data/caseStudies.ts`. Each has its own prerendered page, `TechArticle` + `BreadcrumbList` + `FAQPage` JSON-LD, related tools/disciplines and FAQ. Every study carries the notice *"anonymised and aggregated across multiple engagements"*. Published/modified: 2026-11-03.

| # | Slug (`/case-studies/<slug>`) | Headline | Sector | Scale (as stated in code) |
|---|---|---|---|---|
| 1 | `middle-east-gov-avs-framework` | Standardised VMware to Azure VMware Solution Migration for Middle East Government Entities | Middle East Government Entities | 50–100 VMs average, up to 300 VMs |
| 2 | `avs-to-avs-cross-region` | Azure VMware Solution Cross-Region Migration for a Middle East Government Entity | Middle East Government Entities | Cross-region AVS private cloud move (same sovereign geography) |
| 3 | `gov-dr-failover-drills` | Disaster Recovery Validation on Azure VMware Solution: Failover, Failback and 6-Monthly Drills | Middle East Government Entities | 14+ sovereign entity program (DR active for majority); RPO 5–15 min, RTO 1–2 hr |
| 4 | `private-gcve-vmc-migration` | VMware to Google Cloud VMware Engine and VMware Cloud on AWS for Private Enterprises | Private Sector Enterprises | Scale omitted per governance |
| 5 | `nsxt-microsegmentation-aria-networks` | NSX-T Microsegmentation: Flow-Based Firewall Planning with Aria Operations for Networks | Middle East Government Entities | 50–100 VMs average, up to 300 VMs |
| 6 | `aria-operations-networks-deployment` | Aria Operations and Aria Operations for Networks for Multi-vCenter Government Environments | Middle East Government Entities | Multi-vCenter government environments (50–100 VMs avg, up to 300) |
| 7 | `aria-automation-blueprints-vcenter` | Aria Automation for Multi-Team Government IT: Cloud Templates, Approvals and vCenter Isolation | Middle East Government Entities | Multi-department government IT organizations |

**Governance rules enforced by the test suite (`caseStudiesAndSeoRoutes.test.ts`) — apply them to all new content:**
- Never use "Zaboraa Technologies", "Principal Cloud Architect", "12+ years", "40+ migrations", "100% zero-downtime", "audit passed", "Aria for Operations" inside case-study content.
- Never use the figures **1,240** or **4,500**.
- Note: Broadcom has rebranded VMware Aria under VCF Operations / VCF Automation — pages carry this note.

**Legacy case studies (ARCHIVED — DO NOT USE in marketing):** Tier-1 Banking (1,240 VMs, 0 h downtime, 38% TCO), Healthcare network (4,500 workloads, 0 min, 24% Capex), Global Freight (820 VMs, 99.999%, $1.4M/yr). They live only in `src/data/_legacyCaseStudies.ts`.

> ✅ **Decided (D6): use latest outcomes.** `src/data/initialData.ts` lines ~692–705 (`aboutPage…selectedOutcomes`) still display the legacy figures in code and link them to unrelated case-study pages. P1-04 replaces them with outcomes copied verbatim from the 7 current case studies and rewrites `aboutPageCustomization.test.tsx` (~48–49). **D8:** public disclosure of the anonymised case studies (including "14+ Middle East government entities") is approved; still no client names or logos.

### 3.6 Account, pricing, billing, credits, history, profile
| Item | Status in codebase |
|---|---|
| Auth | **Exists** — Google OAuth, Microsoft SSO, email/password, instant Demo Mode, offline vault session (for admins). Sign-in **optional** for tools; required only for AI blueprint generation (Tool 6). |
| Profile | Basic profile record (name, email, avatar, role `user`/`admin`, tier `free`/`pro`/`enterprise`). Navbar shows first name or “Architect”. |
| Dashboard / Workspace | **User Workspace drawer** — saves user’s blueprints / work (`user_workspaces`, `blueprints`, `generated_images` tables). No standalone `/dashboard` route. |
| Pricing page | **None.** Tools are free (“Zero-Cost Technical Architecture”, “Zero Costing Assessment”). |
| Billing / Credits | **None.** |
| History | Saved blueprints / images per signed-in user via workspace; no `/history` route. |
| Monetisation | Advisory engagements via **Book Briefing** (lead goes to `briefing_requests` + CRM leads). |

---

## 4. INTERNAL TOOLS INVENTORY (6 tools — complete)

All 6 are listed on `/tools`, free, run mostly **in the browser** (client-side calculation), and export professional deliverables. Common thread: *“Zero-Cost Technical Architecture”* — no commercial pricing is calculated; outputs are technical.

### Tool 1 — Multi-Cloud Node & Usable Storage Policy Estimator
- **Route:** `/tools/sizing`
- **Hub title:** Multi-Cloud Node & Storage Sizing Estimator · *Decoupled Storage & Usable Policy Optimizer* · Badge: Compute & Storage
- **Category:** Infrastructure sizing / calculator
- **1-line:** Computes how many bare-metal hosts you need on AVS, VMC, GCVE or NC2 and how many hosts you save by moving data to external NFS storage.
- **Detailed:** Models true bare-metal host density across hyperscalers using real SKU specs. Applies enterprise RAID / FTT storage policies and default **25% vSAN operational slack factor** to compute net usable capacity. Shows node reduction gained by decoupling storage to Azure NetApp Files or Amazon FSx for NetApp ONTAP.
- **Input:** Total vCPU / RAM / storage (TB), target cloud and node SKU, storage policy (RAID / FTT), slack factor, effective vSAN %, optional external NFS offload.
- **Output:** Node count, usable vs raw capacity, with / without external-storage comparison, **styled Excel export**, one-click hand-off to Tool 6 (`Send to Blueprint Generator`).
- **Technology:** Pure client-side TypeScript calculators (`architectureCalculator`, `storageCalculator`); `xlsx` for export. No external API.
- **SKUs:** Nutanix NC2 on Azure — AN36, AN64, AN100 · Azure AVS — AV36P, AV36, AV48, AV52, AV64 · VMC on AWS — i4i.metal, i3en.metal, m7i.metal-24xl · GCVE — ve1-standard-72, ve2-standard-128. External storage: ANF, Amazon FSx ONTAP.
- **USP:** Four platforms in one view, with external-NFS “node reduction” insight that directly lowers hyperscaler spend.
- **UI flow:** 1) Pick cloud / SKU card (4 clouds) → 2) Enter workload size and storage policy / slack → 3) Review node + storage result and comparison → 4) Export Excel or send to Blueprint Generator.

### Tool 2 — RVTools Ingestion, Sizing & Migration Wave Planner
- **Route:** `/tools/rvtools-analyzer`
- **Hub title:** RVTools Ingestion & Migration Readiness Engine · *Client-Side Excel Parser & HCX Path Classifier* · Badge: Workload Discovery
- **Category:** Discovery / migration readiness
- **1-line:** Drag-and-drop a VMware RVTools export and instantly get a Migration Readiness Score and per-VM HCX method.
- **Detailed:** Parses multi-sheet RVTools workbooks (vInfo, vDisk, vMemory, vNetwork, vTools) entirely in browser. Deep-scans for blockers — physical-mode RDMs, multi-writer shared disks, legacy hardware versions (target needs HW 14+), missing / outdated VMware Tools, stale snapshots (>24h or >20 GiB). Classifies each VM into HCX RAV (live vMotion), HCX Bulk, or HCX Cold and sequences dependency-aware waves.
- **Input:** RVTools `.xlsx` / `.xls` upload (or built-in sample / downloadable sample file).
- **Output:** Overall readiness score (0–100%), per-VM readiness, recommended migration method, remediation actions, HCX impact notes, wave schedule, pre-migration snapshot & driver checklist, usable-storage sizing, **Excel technical assessment** (`Export .xlsx`).
- **Technology:** `xlsx` (SheetJS) parsing in-browser, `workloadAnalyzer` rules engine. **Data never leaves the browser.**
- **USP:** Privacy-safe (client-side), turns raw RVTools dump into actionable wave plan in seconds; explicit blocker detection (RDM-P, multi-writer, stale snapshots).
- **UI flow:** 1) Upload RVTools file (or load sample) → 2) Review summary cards (blockers, RDMs, snapshots) → 3) Filter / search VM table by method (RAV / Bulk / Cold) → 4) Configure target RAID / FTT and buffer → 5) Export Excel / view wave schedule.

### Tool 3 — Nutanix NC2 on Azure Migration Assessment Engine
- **Route:** `/tools/nutanix-nc2-assessment`
- **Hub title:** Nutanix NC2 on Azure Migration Assessment Engine · *Dedicated AHV Compatibility, Move Pipeline & Azure Node Sizing* · Badge: Dedicated NC2 Assessment
- **Category:** Migration assessment / sizing
- **1-line:** Assesses moving VMware vSphere workloads to Nutanix Cloud Clusters (NC2) on Azure bare metal.
- **Detailed:** Ingests RVTools inventory, inspects guest OS and disk controllers for AHV compatibility, flags VMs needing **VirtIO driver injection**, sizes Azure bare-metal clusters (AN36, AN36P, AN64, AN100) with Distributed Storage Fabric usable capacity under **RF2 / RF3**, and sequences **Nutanix Move** migration waves. Supports overcommit ratios from 1:1 (dedicated SAP / Oracle) upward.
- **Input:** RVTools `.xlsx` / `.csv` / `.xls` (or one-click sample of **148 realistic enterprise VMs**), sizing parameters.
- **Output:** Executive summary, NC2 node / DSF sizing, AHV & Move compatibility categories, wave plan, VM inventory table, exportable report.
- **Technology:** Client-side `nutanixAssessmentService`, `xlsx` parsing. No external API.
- **USP:** One of very few free dedicated VMware → NC2-on-Azure assessors; automatic VirtIO / controller translation analysis.
- **UI flow (5 tabs):** Executive Summary → NC2 on Azure Sizing & DSF Storage → AHV Hypervisor & Move Compatibility → Nutanix Move Wave Planner → VM Inventory & Attributes.

### Tool 4 — Aria Operations for Networks (vRNI) Data Engine
- **Route:** `/tools/aria-networks`
- **Hub title:** Aria Operations for Networks (vRNI) Data Engine · *Flow Discovery, Application Tiers & NSX DFW Matrix* · Badge: Flow Analytics & Security
- **Category:** Network flow analytics / security planning
- **1-line:** Turns observed IPFIX network flows into application tiers, NSX Distributed Firewall rules and migration waves.
- **Detailed:** Eliminates migration blind spots by mapping multi-tier dependencies (Web → App → DB) from flow data, generating zero-trust NSX DFW rule matrices, and producing color-coded wave-execution spreadsheets. Includes explainer of IPFIX telemetry fabric (VDS IPFIX collector → Aria analytics platform).
- **Input:** One-click sample (3-tier banking & ERP topology) or upload of Aria export **`.json` or `.csv`** (app inventory or DFW rules).
- **Output:** Application tier map, NSX DFW rule matrix, migration waves (state also kept in local storage), color-coded Excel wave sheet.
- **Technology:** Client-side `AriaNetworkDeepDiveSection`, wave calculator; sample data from `sampleRvToolsData`. No external API.
- **USP:** Bridges network security and migration planning — shows “what talks to what” before cutover so nothing breaks.
- **UI flow:** 1) Load sample or upload file → 2) View flow-discovery & app tiers → 3) Review DFW microsegmentation rules → 4) Generate / export migration waves → 5) Jump to connected tools (RVTools, Sizing, DR, Blueprint).

### Tool 5 — Disaster Recovery Multi-Engine RPO/RTO & WAN Planner
- **Route:** `/tools/dr-planner`
- **Hub title:** Disaster Recovery RPO/RTO & WAN Replication Calculator · *vSphere Replication & SRM Protection Group Sizing* · Badge: Disaster Recovery
- **Category:** DR planning / calculator
- **1-line:** Quantifies WAN bandwidth, standby footprint and recovery time for four DR engines.
- **Detailed:** Compares **VMware SRM + vSphere Replication**, **HPE Zerto CDP**, **JetStream DR (cloud object storage)** and **Veeam Recovery Orchestrator**. Models RPO windows from 15 minutes to 24 hours, delta-sync bandwidth, Hot Standby vs Pilot Light vs Cold Object Storage footprints, CDP journal retention, failover network mode (NSX-T stretched L2 / zero re-IP vs routed re-IP), and RTO phase timeline.
- **Input:** Protected inventory size, change rate, target RPO, WAN circuit Mbps, DR engine, deployment strategy, failover network.
- **Output:** Effective RPO, required vs configured bandwidth (adequate / undersized warning), estimated RTO, RTO phase breakdown, standby host footprint; **Excel export** and **formal branded 2-page executive PDF**.
- **Technology:** Client-side math; `xlsx` and `jsPDF` for exports. No external API.
- **USP:** Vendor-neutral side-by-side of four DR engines with SLA pass / fail on WAN adequacy, and a board-ready PDF.
- **UI flow:** 1) Choose DR engine → 2) Enter protected inventory & RPO → 3) Set WAN, standby model, failover network → 4) Read RPO / RTO / bandwidth verdict → 5) Export Excel or PDF.

### Tool 6 — Automated Hybrid Blueprint Generator (flagship)
- **Route:** `/tools/design-generator`
- **Hub title:** Automated Hybrid Blueprint Generator · *Dynamic BOM Deliverable & Architecture Exporter* · Badge: Architecture Engine
- **Category:** Architecture design / document & image generation (AI-assisted)
- **1-line:** Turns sizing inputs or an RVTools assessment into a verified bill of materials, multi-tier architecture diagram and advisory dossier.
- **Detailed:** A **5-step enterprise wizard** produces visual multi-panel topology cards (on-prem → transit → landing zone → security → target & DR) with SLA footer (e.g. “DR SLA: 15-min RPO | 60-min RTO”). Optionally calls Google Gemini to render an AI “cloud 3D blueprint” image. Deliverables are presentation-ready and watermarked with brand.
- **Templates (5):** VMware → AVS · VMware → NC2 on Azure · Nutanix → NC2 on Azure · VMware → GCVE · VMware → VMC on AWS.
- **Input:** Customer name, objective / strategy, source infrastructure, landing-zone & VDI choices, security (NVA / WAF / perimeter), target SDDC sizing, DR RPO / RTO; can import from Tools 1 / 2.
- **Output:** Topology blueprint, **BOM Excel** (`<Customer>_Cloud_Architecture_BOM.xlsx`), **4K PNG / JPEG export**, **Blueprint JSON**, shareable save-link, executive summary / dossier, AI-generated blueprint image (downloadable), Google Drive workspace sync.
- **Technology:** React wizard + client calculators; `xlsx`, `jszip`, `jsPDF`; **Google Gemini image model** via server route `/api/generate-blueprint` (model `gemini-3.1-flash-image`); Supabase for saved blueprints / feature controls.
- **Access rule:** AI blueprint generation is controlled by admin setting `blueprintAccessMode` = `everyone` / `signed_in` (default) / `nobody`, enforced server-side.
- **USP:** One tool that outputs the whole consulting deliverable pack, including AI imagery, from same data used by other tools.
- **UI flow:** Step 1 Objective (Strategy & Scope) → Step 2 Source (On-Prem Inventory) → Step 3 Landing Zone (Cloud Foundation & VDI) → Step 4 Security (NVA & Perimeter) → Step 5 Target & DR (SDDC Sizing & Runbooks) → Generate → Export (BOM / 4K / JSON / AI image / Drive).

### Tool pipeline (how tools connect)
`RVTools Analyzer → Sizing Estimator → Aria Networks (flows / DFW) → DR Planner → Blueprint Generator`
The Sizing page has “Send to Blueprint Generator”; Aria page has “Connected Architecture Workbenches” banner linking all tools.

---

## 5. CONTENT LIBRARY (all published content)

### 5.1 Architecture services (6 cards on site)
Azure VMware Solution (AVS) · Google Cloud VMware Engine (GCVE) · VMware Cloud on AWS (VMC) · VMware Cloud Foundation (VCF 5.x) sovereign cloud · NSX-T & Software-Defined Networking · VMware HCX Mobility & Aria Suite.

### 5.2 Interactive reference diagrams (4)
1. Azure VMware Solution Hub-Spoke & ExpressRoute FastPath — enterprise zero-downtime cutover and external NetApp storage decoupling
2. VMware Cloud on AWS Multi-AZ Stretched Cluster — 99.99% availability with Connected VPC 25 Gbps ENI cross-linking
3. Zero-Trust NSX-T Distributed Firewall & Gateway Segmentation — kernel-level east-west isolation, Avi load balancing, Tier-0 / Tier-1 routing
4. GCVE & Private Services Access — BigQuery / Vertex AI data pipelines

(Plus ~150 KB of hotspot data: clickable component hotspots on each diagram, and Nutanix NC2 / layered-architecture showcases.)

### 5.3 Video masterclasses — NOT AVAILABLE YET (founder decision D9, 10 Nov 2026)
The 4 videos do not exist yet; the founder will create and add them later. Default data is `videos: []`. **Do not promote, link to, or describe videos as existing** (site copy, `llms*.txt`, JSON-LD, LinkedIn, YouTube) until they are published. Planned working titles, internal planning only (from v1):
1. Zero-Downtime HCX Migration: Bulk vs Replication-Assisted vMotion (RAV)
2. Azure NetApp Files (ANF) Datastores for AVS: Cost & IOPS Architecture
3. NSX-T Distributed Firewall: Enterprise Microsegmentation Masterclass
4. Google Cloud VMware Engine (GCVE): Private Services Access & Analytics

### 5.4 Step-by-step tutorials (5)
1. Azure VMware Solution ExpressRoute FastPath & Global Reach Architecture
2. HCX Network Extension & L2 Broadcast Domain Troubleshooting Runbook
3. NSX-T Microsegmentation: Implementing Zero-Trust East-West Security in Production
4. Architecting Elastic External NFS Datastores on VMC with Amazon FSx for NetApp ONTAP
5. Building a Low-Latency Analytics Pipeline from GCVE Databases to Google BigQuery

### 5.5 Knowledge Base articles (14 = 8 core + 6 Nutanix)
| ID | Topic |
|---|---|
| KB-AVS-8921 | ExpressRoute FastPath BGP route flapping & MTU 1500 / 9000 fragmentation (Cisco ASR ↔ AVS T0) |
| KB-AVS-8922 | Mounting external ANF NFS datastores on AVS: export policies, Kerberos, MTU 9000 |
| KB-GCVE-4201 | Private Services Access peering: IP overlap & Cloud DNS private zone resolution |
| KB-VMC-3101 | Connected VPC ENI subnet routing asymmetry & cross-account SG denies |
| KB-NSX-6501 | Production runbook: migrating non-NSX workloads to NSX DFW without disruption |
| KB-HCX-5301 | HCX MON default-gateway asymmetric return traffic in extended L2 VLANs |
| KB-SRM-7101 | SRM non-disruptive test-failover bubble isolation; duplicate-IP and AD tombstone prevention |
| KB-ARIA-4401 | IPFIX on vSphere Distributed Switch for Aria: sampling rate, collector IP, port-group validation |
| KB-NTX-1001 | Layer 2 extension from VMware to Nutanix: keeping the same IP during migration |
| KB-NTX-1002 | Same IP on migration: Nutanix Move IP retention vs Layer 2 extension |
| KB-NTX-1003 | VMware ESXi to Nutanix AHV with Nutanix Move: planning checklist |
| KB-NTX-1004 | Nutanix-to-Nutanix migration with Nutanix Disaster Recovery |
| KB-NTX-1005 | Layer 2 subnet extension between Nutanix clusters: VPN or VTEP |
| KB-NTX-1006 | Moving workloads from Nutanix AHV to VMware ESXi: supported methods and limits |

*All 14 live inside the single `/resources/kb` page (no individual URLs yet) — see P4-02.*

Also: downloadable **migration runbooks** dataset (HCX cutover for AVS / VMC / GCVE) and **Cloud Compatibility Catalogue** and **Security Architecture Catalogue** powering the wizard.

---

## 6. USER JOURNEY & PERSONAS

*[DERIVED from page content and tool design; code contains no explicit persona document.]*

### 6.1 Target personas
| Persona | Who | Pain | How they use Zaboraa |
|---|---|---|---|
| **Enterprise Infrastructure / Cloud Architect** | VMware engineer planning AVS / GCVE / VMC move | Needs fast, defensible sizing & wave plans | Uploads RVTools → Sizing → Blueprint; reads KB and runbooks |
| **CIO / Head of Infrastructure** | Executive in bank, hospital, logistics, other regulated sector | Fear of downtime, cost overruns, compliance | Reads case studies and hero proof points; books a briefing |
| **Migration / Project Lead** | Runs cutover programs | Sequencing waves, dependency blind spots | RVTools wave planner, Aria flow discovery, roadmap |
| **Security / Network Architect** | NSX / zero-trust owner | Safely moving to microsegmentation | Aria DFW matrix, NSX discipline page, KB-NSX-6501 |
| **DR / Resilience Lead** | Owns RPO / RTO commitments | Proving SLAs and bandwidth | DR Planner, SRM discipline, PDF report |
| **Nutanix / VMware-licensing-exit evaluator** | Considering VMware → Nutanix NC2 | Compatibility and sizing unknowns | NC2 Assessment tool |
| **Pre-sales / Consulting partner** | Builds client proposals | Needs polished deliverables fast | Blueprint Generator BOM / 4K diagrams |

### 6.2 Typical journey
1. **Discover** — search / LinkedIn / YouTube → landing on `/`, a KB article or a tutorial (videos: coming soon, D9).
2. **Trust** — hero stats, certifications, 3 case studies, interactive diagrams.
3. **Try (free, no sign-up)** — Workbench tools at `/tools`.
4. **Deepen** — save blueprints / AI images (sign in with Google / Microsoft).
5. **Convert** — **Book Briefing / Book Call** → briefing request stored in CRM.
6. **Engage** — founder-led advisory.

---

## 7. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Motion (animation), lucide-react icons |
| Rendering model | **Client-side SPA + build-time prerender.** `npm run build` = `vite build && node scripts/prerender.mjs`: writes `dist/<route>/index.html` for 30 routes (own title, description, canonical, OG/Twitter, JSON-LD, H1 + body; full article for case studies) and regenerates `sitemap.xml` + `llms-full.txt`. React mounts with `createRoot` (static body is replaced on load). |
| Backend / API | Vercel serverless functions in `/api`: `generate-blueprint`, `generate-proposal`, `health`, `settings`, `site-content`. Dev-time Vite middleware mirrors `/api/generate-blueprint`. |
| Database / Auth | **Supabase** (PostgreSQL with Row-Level Security; Supabase Auth with PKCE). Tables: profiles, admins, app_settings, admin_feature_controls, site_content, seo_metadata, briefing_requests, crm_leads, blueprints, generated_images, user_workspaces, audit_logs, admin_notifications. |
| Auth providers | Google OAuth, Microsoft SSO, email / password, demo mode, offline-vault admin session. Firebase config also present in repo (AI Studio applet origin). |
| AI | Google Gemini via `@google/genai` (server-side key `GEMINI_API_KEY`); image model `gemini-3.1-flash-image` for blueprints |
| Exports | `xlsx` (Excel), `jsPDF` (PDF), `jszip` (ZIP dossiers) |
| Hosting | **Vercel** (`vercel.json`: SPA rewrite + security headers — **file not in the 10 Nov 2026 zip; VERIFY, P0-03**). Legacy alias `zaboraa-12.vercel.app` redirects to zaboraa.com. Origin project built in Google AI Studio. |
| PWA / offline | Web manifest, install prompt, offline vault + reconciliation for admins |
| Analytics | Google Analytics via `VITE_GA_MEASUREMENT_ID` |
| Dev server | `package.json` `dev` = `vite --port=3000 --host=0.0.0.0` — **clashes with Zabura FX on 3000; use 3001 (P0-02)** |
| Testing | Vitest (admin, calculations, routing, offline vault, auth, wizard suites) |
| Security headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera / mic / geo off) |
| Env vars (code) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `FIREBASE_API_KEY`, `VITE_GA_MEASUREMENT_ID` |
| Env vars (Vercel production, Nov 2026) | `CRON_SECRET`, `GOOGLE_CLOUD_PROJECT`, `GEMINI_API_KEY`, `GOOGLE_CLOUD_LOCATION`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

---

### 7.5 Development Workflow — Antigravity CLI + Vercel + Supabase + Vertex AI (v1.1 — NEW)

> Hard rule: **Zaboraa-12 repo (zaboraa.com) and Zabura-FX repo are SEPARATE projects. Do NOT mix code.** Zaboraa runs on `http://localhost:3001`. Zabura FX Forex Portal runs separately on `localhost:3000` + `127.0.0.1:8001` — do NOT clash.

| Step | How it works |
|---|---|
| Local edit | Antigravity CLI edits local repo `Zaboraa-12` (`src/`, `index.html`, `public/`, `vercel.json`). It does NOT deploy directly to Vercel. |
| Deploy | `git add / commit / push` to GitHub `congodb1-ui/Zaboraa-12` (`main` branch) → Vercel auto-deploys to `https://zaboraa.com` in ~1 min. |
| Supabase | Code uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (frontend-safe). Antigravity may use Supabase CLI (`supabase login / link / db pull`) and MCP to read schema. **NEVER** commit or expose `SERVICE_ROLE_KEY` — it bypasses RLS. Keep it only in Vercel server functions if needed. |
| Vertex AI / Gemini | Server-side only in `/api/*` (Vercel Functions) via `GEMINI_API_KEY` / Google Cloud env vars. Never put keys in `src/` or browser JS. |
| SEO via CLI | Antigravity CAN do code SEO: meta, `robots.txt`, `sitemap.xml`, `llms.txt`, JSON-LD, `vercel.json` static-file handling, Lighthouse. It CANNOT click Verify in Bing/GSC or add DNS in Cloudflare — those are manual dashboard steps (see §12). |
| Env vars | Local `.env` must never be committed. Production env vars live in Vercel > Settings > Environment Variables. See §7 for full list. |

### 7.6 Cloudflare DNS — Verification Records (v1.1 — NEW)
- Bing CNAME verification record must stay permanently: Name `0a0bf92eea027bfc272b34557bf4cb51`, Target `verify.bing.com`, Proxy = DNS-only (grey cloud).
- Do NOT delete existing Vercel records for `@` / `www`.
- Google Search Console verification: DNS TXT in Cloudflare (see §12.1).

---

## 8. SEO KEYWORDS — MASTER LIST

**Important:** Code contains **no explicit keyword list** (admin SEO panel exists but its data was empty in repo extraction). List below is **[DERIVED]** from site titles, meta, headings and page content + verified SEO config. Canonical URL is `https://zaboraa.com/`.

### 8.1 Meta (v2)
Per-route titles/descriptions live in **`src/seo/routes.ts` (`ROUTE_MANIFEST`, 30 entries)** and are injected at build by `scripts/prerender.mjs`; `index.html` holds only the fallback template (§11.2).
- **Home title:** Zaboraa - Enterprise VMware Cloud Architecture
- **Home description (routes.ts, 156 chars):** Enterprise VMware cloud architecture, AVS, GCVE, and VMC migrations by Wasim Sayyed. Free browser-based tools: RVTools Analyzer, AVS Sizing, NC2 Assessment.
- **index.html fallback description:** Free VMware migration tools: RVTools Analyzer, AVS Sizing, NC2 Assessment. Enterprise cloud architecture by Wasim Sayyed.
- **Deprecated title:** "Zaboraa Technologies - Enterprise VMware Cloud Architecture" (do not use).
- **OG type / Twitter card / theme color / manifest / fonts:** website · summary_large_image · `#020617` · `/manifest.json` · JetBrains Mono + Plus Jakarta Sans. **No og:image yet (P2-02).**

### 8.2 Primary keywords
VMware cloud migration · Azure VMware Solution (AVS) · Google Cloud VMware Engine (GCVE) · VMware Cloud on AWS (VMC) · hyperscaler migration · VMware HCX migration · zero-downtime migration · NSX-T microsegmentation · VMware Site Recovery Manager (SRM) · VMware Cloud Foundation (VCF) · Nutanix NC2 on Azure

### 8.3 Secondary / long-tail
RVTools analyzer · RVTools migration readiness · AVS node sizing calculator · VMC node sizing · GCVE sizing · Azure NetApp Files for AVS · Amazon FSx for NetApp ONTAP VMC · external NFS datastore · ExpressRoute FastPath · Global Reach · HCX Network Extension · HCX Mobility Optimized Networking (MON) · HCX Replication-Assisted vMotion (RAV) · HCX Bulk migration · NSX-V to NSX-T migration · NSX Distributed Firewall rules · Aria Operations for Networks (vRNI) · IPFIX flow discovery · VMware DR planner · RPO RTO calculator · vSphere Replication bandwidth · Zerto vs SRM · JetStream DR · Veeam Recovery Orchestrator · Nutanix Move · AHV VirtIO driver injection · VMware to Nutanix migration · Private Services Access GCVE · GCVE BigQuery Vertex AI · Connected VPC ENI · multi-AZ stretched cluster · sovereign private cloud · VCF 5.x SDDC Manager · cloud migration roadmap · hybrid cloud blueprint generator · cloud architecture bill of materials.

### 8.4 Brand & authority terms
Zaboraa · Wasim Sayyed · Principal VMware Architect · VCAP-DCV Design 2023 · VCP-NV 2023 · VCP-DCV 2023 · VMware Cloud Foundation Specialist 2023 · Master Specialist VMware Cloud on AWS 2023 · NCP-CI-Azure 6.10 *(Azure Solutions Architect Expert / Google Cloud Professional Cloud Architect removed — not in code; re-add only if the founder confirms)*.

### 8.5 Audience-intent phrases
“enterprise VMware migration consultant”, “VMware exit strategy”, “core banking cloud migration”, “healthcare zero-trust microsegmentation”, “free cloud sizing tools”, “VMware architecture reference diagrams”, “VMware troubleshooting runbooks”.

### 8.6 SEO note (v2)
Every route is prerendered to static HTML with its own head tags plus an H1 and body, so non-JS crawlers see real content on all 30 URLs. Non-case-study routes are still thin (H1 + one paragraph) — see P4-01. Rely on **this file** + `/llms-full.txt` for marketing and AI-video use.

---

## 9. CORE INFRASTRUCTURE CONFIGURATION

### 9.1 Vercel Hosting
- **Platform:** Vercel
- **Framework:** Vite React SPA
- **Output Directory:** `dist`
- **Deployment Protection:** OFF (publicly accessible to crawlers)
- **Direct Deployment URL (bypasses Cloudflare):** `https://zaboraa-12-fm5ofsp55-zaboraa.vercel.app/`
- **Build Process:** `public/` folder contents automatically copied to `dist/` on build
- **GitHub Repo:** https://github.com/congodb1-ui/Zaboraa-12.git
- **Production Branch:** `main` → `https://zaboraa.com`
- **Preview Branches:** Any other branch → `https://zaboraa-12-git-<branch>-<team>.vercel.app`
- **Local Dev:** Zaboraa on `http://localhost:3001` (Vite `--port 3001` — ⚠️ `package.json` currently hardcodes 3000; see P0-02). Zabura FX Forex Portal runs separately on `localhost:3000` + `127.0.0.1:8001` — do NOT clash.

### 9.2 Cloudflare CDN & Security
- **Domain:** zaboraa.com proxied through Cloudflare (orange cloud)
- **Bot Fight Mode:** OFF
- **AI Crawler Access Policies:** All Allow
  - Search Crawlers: Allow
  - AI Training Crawlers: Allow
  - AI Agents: Allow
  - Personal Agents (Muse, Gemini Spark, Claude Duet, OpenAI): Allow
- **Security Events:** 0 blocks (last 24h and 7 days, as of 03 Nov 2026) — **v1.1: Re-check on 10 Nov 2026 — [PENDING — founder to confirm still 0 blocks]**
- **WAF:** No blocking rules for crawlers
- **Caching:** Purge Everything after each deployment, Development Mode available for bypass

### 9.3 Domain Canonical Configuration
- **Canonical Host:** Apex domain `https://zaboraa.com`
- **WWW Handling:** 301 Permanent Redirect from www to apex
- **Cloudflare Redirect Rule:**
  - **Rule Name:** WWW to Apex - zaboraa.com
  - **Request URL:** `https://www.zaboraa.com/*`
  - **Target URL:** `https://zaboraa.com/${1}`
  - **Status Code:** 301 Permanent Redirect
  - **Preserve Query String:** ON
  - **Status:** Enabled
  - **DNS:** `www` CNAME record proxied (orange cloud) pointing to `zaboraa.com`
- **Canonical Tag in HTML:** `<link rel="canonical" href="https://zaboraa.com/" />`

### 9.4 vercel.json — Production Configuration
> ✅ **Founder-confirmed (10 Nov 2026):** Verified present in repo and synchronized with live reality during P0-03 and hardened during P2-07 (`trailingSlash: false`, immutable `/assets/(.*)` caching, and `text/plain; charset=utf-8` with 24h caching for `llms.txt`).
```json
{
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(llms|llms-full).txt",
      "headers": [
        { "key": "Content-Type", "value": "text/plain; charset=utf-8" },
        { "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/:path([^.]*)", "destination": "/index.html" }
  ]
}
```
**Behavior:**
- Serves static files with extensions (`.txt`, `.xml`, `.json`, `.ico`) as real files from `dist/`
- Enforces canonical trailingSlash=false across all routes to prevent duplicate URL indexing
- Immutable 1-year caching for Vite-hashed `/assets/(.*)` bundles
- Correct `text/plain; charset=utf-8` header and 24h caching for GEO AI visibility files `llms.txt` and `llms-full.txt`
- Rewrites only paths without dots (React routes) to `/index.html` for SPA routing
- API routes `/api/*` served before rewrites (filesystem-first)
- HSTS enabled with max-age=31536000 and includeSubDomains

---

## 10. AI VISIBILITY FILES (GEO — Generative Engine Optimization)

All files in `/public/` (lowercase filenames, case-sensitive on Vercel) and served from `dist/` root.

### 10.1 robots.txt — Live at https://zaboraa.com/robots.txt
- **Status:** Live, returns `text/plain`, accessible to all AI and search crawlers
- **Allows:** All public pages
- **Disallows:** `/admin`, `/console`, `/api/`
- **AI Bots Explicitly Allowed:**
  - OAI-SearchBot (ChatGPT Search)
  - ChatGPT-User
  - Claude-SearchBot
  - Claude-User
  - PerplexityBot
  - Perplexity-User
  - GPTBot (AI training)
  - ClaudeBot (AI training)
  - Google-Extended (Gemini training)
  - Applebot-Extended (Apple AI)
  - CCBot (Common Crawl)
  - Googlebot (Google Search + AI Overviews)
  - Bingbot (Bing Search + ChatGPT Search)
- **Content Signal:** `search=yes, ai-input=yes, ai-train=yes`
- **Sitemap Reference:** `Sitemap: https://zaboraa.com/sitemap.xml`

### 10.2 llms.txt — Live at https://zaboraa.com/llms.txt
- **Status:** Live, returns `text/plain`, optimized for AI consumption
- **Content:**
  - Company: Zaboraa - Enterprise VMware Cloud Architecture Advisory
  - Founder: Wasim Sayyed, Principal VMware Architect, 13+ years in VMware infrastructure architecture, LinkedIn: https://www.linkedin.com/in/wasim-sayyed-8b857714b/
  - Company LinkedIn: https://www.linkedin.com/company/145341200/
  - Clarification: NOT a consumer AI image / audio / text tools site, no pricing / credits / billing
  - **6 Free Engineering Tools (No Login Required):** Sizing, RVTools Analyzer, NC2 Assessment, Aria Networks, DR Planner, Blueprint Generator (see §4 for details + routes)
  - **8 Architecture Disciplines:** AVS, GCVE, VMC-DR, NSX, HCX, SRM, Aria, Nutanix NC2 (see §3.3)
  - **Proof:** 7 anonymised case studies (6 Middle East government, 1 private sector — slugs in §3.5), 6-phase roadmap, Resources hub (KB, tutorials; videos coming soon)
  - **Contact:** Website https://zaboraa.com, Email wasim@zaboraa.com
  - **Usage:** Public pages may be crawled, indexed, summarised and cited by search engines and AI assistants
  - **Reference to full content:** `/llms-full.txt`

### 10.3 llms-full.txt — Live at https://zaboraa.com/llms-full.txt
- **Purpose:** Plain-text SSR workaround for Vite SPA — Contains full site content for AI crawlers that don’t execute JavaScript
- **Content:** Complete descriptions of all tools, disciplines, all 7 case studies in full, roadmap, resources. **Auto-generated at build by `scripts/prerender.mjs` — never hand-edit.**

### 10.4 sitemap.xml — generated at build
- **Source:** `ROUTE_MANIFEST` → written by `scripts/prerender.mjs` (Part C) to `dist/sitemap.xml` **and overwrites `public/sitemap.xml`** (expect a git diff after each build).
- **Content:** **30 URLs** in the current code (**29 after P1-08**: `/resources/videos` becomes `noindex` and leaves the sitemap, D9), each with `<loc>` and `<lastmod>` (all `2026-11-03` today); no priority/changefreq. Apex host only. Includes the 7 `/case-studies/:slug` pages.
- **Status:** Google and Bing last read 23 URLs (3 Nov) — resubmit **once** after the deploy (P5-04/P5-05).
- **Rule:** never hand-edit; add pages via `ROUTE_MANIFEST` (and update `lastmod` only when the content really changed).

---

## 11. ON-PAGE SEO CONFIGURATION (v2.0 — how it really works now)

### 11.1 Head pipeline
1. **Source of truth:** `src/seo/routes.ts` → `ROUTE_MANIFEST` (30 entries: `path, title, description, h1, summary, lastmod, jsonld[]`).
2. **Build:** `npm run build` → `vite build` then `node scripts/prerender.mjs`. For each route it writes `dist/<path>/index.html` replacing `<title>`, meta description, canonical, OG title/description/url, Twitter title/description, appends the route's JSON-LD, and fills `<div id="root">` with a static body (`<h1>` + summary; full article for case studies).
3. **Client:** `src/components/seo/RouteHead.tsx` re-emits the same tags after React mounts; `CaseStudiesPage.tsx` and `CaseStudyDetailPage.tsx` **also** emit their own `<title>`, canonical and JSON-LD → possible duplicates after hydration (**VERIFY**, task P2-03).
4. **Vercel:** filesystem-first, so `dist/tools/sizing/index.html` is served at `/tools/sizing`; unmatched dot-less paths fall back to `/index.html` (SPA).

### 11.2 `index.html` (template / fallback)
```
Title: Zaboraa - Enterprise VMware Cloud Architecture
Description: Free VMware migration tools: RVTools Analyzer, AVS Sizing, NC2 Assessment. Enterprise cloud architecture by Wasim Sayyed.
OG: title, description, type=website, url=https://zaboraa.com/   (NO og:image)
Twitter: card=summary_large_image  (NO twitter:image)
theme-color #020617 · manifest /manifest.json · Google Fonts preconnect + stylesheet
Static JSON-LD: Organization (also injected again by prerender → duplicate on every page)
NO <link rel="icon">, NO apple-touch-icon, NO canonical in the template (added per route by prerender)
```

### 11.3 Structured data inventory (counted in `routes.ts`)
Organization (reused on every route via `BASE_ORGANIZATION_JSONLD`) · WebSite + `SearchAction` (home) · CollectionPage (hub) · 7 × SoftwareApplication (tools — minimal: name, category, OS; **no `offers`/`url`/`description`**) · 15 × TechArticle · 7 × FAQPage (19 Q&A) · 7 × BreadcrumbList · 1 × ProfilePage + Person (/about).
Known issues: duplicate Organization block (P2-03) · `SearchAction` points to `/tools?q=` which the app does not handle and Google has retired the sitelinks search box (P2-04) · `logo` URL 404 (P2-01) · SoftwareApplication thin (P4-03). Note: Google limits FAQ *rich results* to government/health sites since 2023 — the FAQ markup still helps AI/entity understanding, do not expect rich snippets.

### 11.4 Title / description lint (audit 10 Nov 2026)
- 6 case-study titles exceed 60 chars: 63, 65, 66, 66, **76**, 68 (e.g. `aria-operations-networks-deployment`).
- 3 descriptions exceed 160 chars: 162, 163, 162.
- Everything else: titles ≤ 60, descriptions 110–160. Manifest title equals the page's `metaTitle` for case studies (consistent) — fix both at source in `caseStudies.ts`.

### 11.5 Favicon / logo / icons — **missing**
`public/` contains only: `llms.txt`, `llms-full.txt`, `manifest.json`, `robots.txt`, `sitemap.xml`, IndexNow key file. **Absent:** `favicon.ico`, `favicon-48x48.png`, `favicon-192x192.png`, `apple-touch-icon`, `assets/images/zaboraa-logo.png` (JSON-LD logo), `assets/images/zaboraa-logo-standalone.svg` (manifest icon). `scripts/generate-logo-png.mjs` already writes `public/assets/images/zaboraa-logo.png` (512×512) but its output is not in the zip. This is the likely cause of the Google "globe icon". Fix = P2-01. Google needs a square favicon in multiples of 48 px (≥48×48).

### 11.6 Open Graph image — **missing**
No `og:image` / `twitter:image` anywhere → LinkedIn/X/Slack/WhatsApp previews have no picture although `summary_large_image` is declared. Fix = P2-02.

### 11.7 Vercel domain handling
JS redirect `zaboraa-12.vercel.app` → `https://zaboraa.com` (in `index.html` and `src/utils/canonicalUrl.ts`). Theme read from `localStorage.zaboraa_theme_mode`.

---

## 12. SEARCH CONSOLE ACHIEVEMENTS

> **v2.0 note:** the sitemap in code now has **30** URLs; Google/Bing last read **23** on 3 Nov 2026. Resubmit once after the deploy (P5-04 / P5-05). The "Request indexing" quota rule below still applies.

### 12.1 Google Search Console
- **Property:** `zaboraa.com` (Domain property, covers apex and www)
- **Verification:** DNS TXT record in Cloudflare
- **Ownership:** Correct owner email added, old incorrect email removed
- **Sitemap:**
  - URL: `https://zaboraa.com/sitemap.xml`
  - Status: **Success**
  - Last Read: 03/11/2026
  - Discovered Pages: 23
  - Sitemaps with errors: 0
- **Indexed Pages (v1.1 — GSC screenshot 10 Nov 2026):** **6 pages indexed:** `/case-studies/middle-east-gov-avs-framework` (5 Nov), `/resources/videos`, `/tools/aria-networks`, `/resources/tutorials`, `/resources/kb` (3 Nov), `/tools/rvtools-analyzer` (2 Nov). Homepage `/` was NOT in the indexed list on that screenshot — check GSC > Pages > Not indexed for homepage status. See §14.5.
- **URL Inspection Results:**
  - `https://zaboraa.com/sitemap.xml`: URL is available to Google, Page fetch Successful, Crawl allowed Yes, Indexing allowed Yes
  - `https://zaboraa.com/llms.txt`: Indexing requested, priority crawl queue
  - `https://zaboraa.com/tools/aria-networks`: URL is on Google, Page is indexed, Last crawl 3 Nov 2026, Crawled as Googlebot smartphone, Page fetch Successful, Indexing allowed Yes, User-declared canonical https://zaboraa.com/, Google-selected canonical Inspected URL (no www mismatch)
- **Quota Management:** Google allows ~10–12 Request indexing per day. Remaining URLs auto-crawl from sitemap within 48–72h.
- **Indexing Time (general):** After Request Indexing, crawl typically 1–5 days (24–48h for established sites, 4–14 days for new domains). Favicon update takes 1–2 weeks longer. Google never guarantees indexing.

### 12.2 Bing Webmaster Tools
- **Site:** `https://zaboraa.com`
- **Verification (v1.1 — CORRECTED):** **DNS CNAME method — verified 10 Nov 2026.** Cloudflare DNS record: Name `0a0bf92eea027bfc272b34557bf4cb51` → Target `verify.bing.com`, Proxy = DNS-only (grey cloud, NOT orange). Keep this record permanently — Bing re-checks it. Previous v1.0 placeholder `msvalidate.XXXXXXXX` was incorrect / incomplete and is removed.
- **Sitemap:**
  - URL: `https://zaboraa.com/sitemap.xml`
  - Status: **Success**
  - Known sitemaps: 1
  - Sitemaps with errors: 0
  - Total URLs discovered: 23
- **URL Inspection:**
  - Homepage `https://zaboraa.com`: **Indexed successfully - URL can appear on Bing** (green tick)
  - Other URLs (`/about`, `/case-studies`, `/roadmap`): Initially “Not discovered” or “Discovered but not crawled - Discovered on 03 Nov 2026” — Normal for new sitemap, will be indexed within 48–72h after Request indexing
  - **SEO / GEO Issues Initially Found:** H1 tag missing, Meta Description too long / short, No Markup found — Fixed via index.html noscript H1, meta description 145 chars, JSON-LD Organization schema
- **IndexNow:** Supports bulk submission of all 23 URLs at once for faster crawling (hours instead of days)
- **Importance:** Bing index powers ChatGPT Search, Microsoft Copilot, and Perplexity citations

---

## 13. LIVE URLs — COMPLETE LIST (v2.0: 30 page URLs + 5 file URLs)

### 13.1 Pages — exactly the 30 entries of `ROUTE_MANIFEST` (sitemap.xml has 29 of them after P1-08: `/resources/videos` is `noindex`, D9)
```
https://zaboraa.com/
https://zaboraa.com/about
https://zaboraa.com/roadmap
https://zaboraa.com/tools
https://zaboraa.com/tools/sizing
https://zaboraa.com/tools/rvtools-analyzer
https://zaboraa.com/tools/nutanix-nc2-assessment
https://zaboraa.com/tools/aria-networks
https://zaboraa.com/tools/dr-planner
https://zaboraa.com/tools/design-generator
https://zaboraa.com/disciplines/avs
https://zaboraa.com/disciplines/nutanix-nc2-azure
https://zaboraa.com/disciplines/gcve
https://zaboraa.com/disciplines/vmc-dr
https://zaboraa.com/disciplines/nsx
https://zaboraa.com/disciplines/hcx
https://zaboraa.com/disciplines/srm
https://zaboraa.com/disciplines/aria
https://zaboraa.com/resources
https://zaboraa.com/resources/tutorials
https://zaboraa.com/resources/videos
https://zaboraa.com/resources/kb
https://zaboraa.com/case-studies
https://zaboraa.com/case-studies/middle-east-gov-avs-framework
https://zaboraa.com/case-studies/avs-to-avs-cross-region
https://zaboraa.com/case-studies/gov-dr-failover-drills
https://zaboraa.com/case-studies/private-gcve-vmc-migration
https://zaboraa.com/case-studies/nsxt-microsegmentation-aria-networks
https://zaboraa.com/case-studies/aria-operations-networks-deployment
https://zaboraa.com/case-studies/aria-automation-blueprints-vcenter
```
### 13.2 AI & SEO files (5)
```
https://zaboraa.com/robots.txt
https://zaboraa.com/llms.txt
https://zaboraa.com/llms-full.txt
https://zaboraa.com/sitemap.xml
https://zaboraa.com/zaboraa84920485902482048f029a17382.txt     (IndexNow key file)
```
> The 23 URLs of the v1.0 sitemap + the 7 case-study detail pages = 30. The test `caseStudiesAndSeoRoutes.test.ts` asserts exactly 30 — **update this test whenever pages are added** (P4-02). After P1-08 the manifest still has 30 routes but the sitemap has 29 (`/resources/videos` is `noindex`) — the test must assert both.

---

## 14. CURRENT WORKING STATUS (v2.0 — as of 10 Nov 2026)

### 14.1 Status by area
| Area | Status | Evidence / note |
|---|---|---|
| Per-route head (title, description, canonical, OG, Twitter) | `DONE-IN-CODE` | `scripts/prerender.mjs`, 30 routes |
| Per-route JSON-LD | `DONE-IN-CODE` (duplicates `VERIFY`) | `routes.ts`, `RouteHead.tsx` |
| Static H1 + body for non-JS crawlers | `DONE-IN-CODE` for 7 case studies · **thin** for other 23 routes (H1 + 1 paragraph) | `generateStandardBody()` |
| sitemap.xml (30 URLs; 29 after P1-08) | `DONE-IN-CODE`; Google/Bing last read **23** on 3 Nov → resubmit once after deploy | prerender Part C |
| robots.txt (all major AI + search bots allowed, Content-Signal) | `DONE-IN-CODE` | `public/robots.txt` |
| llms.txt (7 case studies, tools, disciplines) | `DONE-IN-CODE`; wording "client-side application" is stale | `public/llms.txt` |
| llms-full.txt | `DONE-IN-CODE`, **auto-generated at build** — never hand-edit | prerender Part C |
| IndexNow | `PARTIAL` — key file present; script hardcodes 8 URLs | `scripts/submit-indexnow.mjs` |
| Favicon / apple-touch / logo / manifest icons | `TODO` — files absent; founder-supplied logo in `docs/founder-assets/` (fallback: generated) | §11.5 |
| og:image / twitter:image | `TODO` — absent; founder-supplied `zaboraa-og.png` in `docs/founder-assets/` (fallback: generated draft) | §11.6 |
| Claim consistency (years, migrations, certs, title, outcomes, brand) | `READY` — decisions D1–D8 answered, applied in P1-02 … P1-07 | §19.2 |
| Videos (`/resources/videos`) | `READY` — D9: videos not available yet; page becomes "coming soon" + `noindex`, leaves the sitemap | P1-08 |
| Image weight | `TODO` — 33 files, **23 MB** in `src/assets/images` (most 0.5–0.96 MB each) | §19 Phase 3 |
| `vercel.json`, `tsconfig.json`, `.gitignore` | `DONE-LIVE` — founder confirmed they exist and work (they were only missing from the audit zip); CLI re-checks in P0-03 | P0-03 |
| Google indexing | `DONE-LIVE` partial — **6 / 30 indexed** (10 Nov, founder screenshot) | §12.1, §14.3 |
| Bing | `DONE-LIVE` — CNAME verified, sitemap Success, homepage indexed | §12.2 |
| Cloudflare (bots allowed, 0 blocks as of 3 Nov) | `MANUAL` re-check pending | §9.2 |
| LinkedIn page rename to "Zaboraa" | `MANUAL` — decided (D7), founder does it | §16.1 |
| Unit tests / build | **Not run by Claude** (no `node_modules`, no network) — run in P0-04 | — |

### 14.2 AI tool visibility (configuration only — no citation test has been run yet)
ChatGPT Search / Claude / Perplexity / Google AI Overviews / Bing-Copilot / Applebot: all explicitly allowed in `robots.txt`; they can read `llms.txt` and `llms-full.txt`. Whether they actually *cite* Zaboraa is untested — see §21.4.

### 14.3 Indexing gap (6 of 30)
Indexed on 10 Nov: `/case-studies/middle-east-gov-avs-framework`, `/resources/videos`, `/tools/aria-networks`, `/resources/tutorials`, `/resources/kb`, `/tools/rvtools-analyzer`. **Homepage not in that list.** Likely causes: (a) sitemap read before the 7 case-study pages existed (23 vs 30), (b) Request-Indexing quota ~10–12/day, (c) thin static bodies, (d) duplicate/conflicting head tags. Note (D9): `/resources/videos` is one of the 6 indexed pages but has no videos; P1-08 sets it to `noindex`, so expect the indexed count to drop by one and the target to become **29** URLs. Action: **do not re-submit the sitemap repeatedly** — fix P1/P2 items, deploy, then follow Phase 5 once. Google never guarantees indexing.

### 14.4 Overview statement (accurate)
Zaboraa is technically set up for search and AI discovery (prerendered routes, canonicals, JSON-LD, sitemap, robots, llms files, Bing verified). **Visibility is not yet achieved**: 6 of 30 pages are indexed in Google; favicon, social preview image and claim consistency are open; no ranking or AI-citation results exist yet.

---

## 15. MARKETING-READY FACT SHEET (v2.0 — safe claims only)
Use the fact sheet in `ZABORAA_MASTER_BIBLE_v2.md` §9 (single copy, to avoid drift). Summary: **approved** = 13+ years · 25+ migrations · 6 certifications · "100% Runbook-Driven Cutovers" · Principal VMware Architect · brand "Zaboraa" · 6 tools · 8 disciplines · 7 anonymised case studies · 5 tutorials · 14 KB articles · case-study facts exactly as in Bible §3.5. **Retired** (§19.2b) = 12+ years, 40+ migrations, 8×, Principal Cloud Architect, Zaboraa Technologies, "100% zero-downtime", legacy 1,240 / 4,500 / 820 / $1.4M. **Never** = pricing/credits/billing, mobile app, named clients, videos (none exist yet), server-side storage claims for client-side tools.

---

## 16. NEXT STEPS FOR TOP RANKING (Off-Page SEO)
> v2.0: all copy below may use only SAFE claims (Bible v2 §9). Executed as P5-09 / P5-10 in §19.

### 16.1 LinkedIn Company Page 145341200
- Update name to Zaboraa (remove Technologies) — **decided (D7); founder does it manually (P5-09)**
- Add 6 tools as Services
- Weekly posts:
  - Post 1: RVTools Analyzer — Upload RVTools export, get migration readiness score + HCX method per VM, browser-only, no data leaves
  - Post 2: Node & Storage Sizing Estimator — Calculate AVS, VMC, GCVE nodes + ANF / FSx savings, Excel export
  - Hashtags: #VMware #AzureVMwareSolution #NutanixNC2 #HCX #VMwareMigration
- **Content Agent (in build):** Single agent inside Zaboraa Admin Console will plan, draft, create video, optimize and post to LinkedIn Company Page after human approval. Uses Vertex AI (Gemini + Veo) with $300 Google Cloud credit. No subscription. Instagram Reels to be added later with same agent.

### 16.2 YouTube (4 Masterclasses — ON HOLD until the videos are produced, D9)
- **The videos do not exist yet (D9).** Create and publish the 4 masterclasses first; until then do not plan, post or link YouTube videos.
- Title format: `VMware to Azure VMware Solution: Government Migration Framework (HCX RAV & Bulk) | Zaboraa` — use only facts from §3.5; **never** the archived 1,240-VM / zero-downtime claims
- Description first line: `Free tool: https://zaboraa.com/tools/rvtools-analyzer` + full transcript
- Benefits: YouTube is 2nd largest search engine, Google shows videos on top

### 16.3 Reddit / Medium / Dev.to
- Article: “25+ VMware migrations: 6 blockers that kill HCX migrations (RDMs, multi-writer, snapshots)” (D2 = 25+; never use "40")
- Include link to RVTools Analyzer tool
- Post in r/vmware, r/AZURE, r/nutanix

### 16.4 Quora / Stack Overflow
- Answer: “How to size Azure VMware Solution nodes?” with link to Sizing Estimator

### 16.5 Monitoring (After 48–72h)
- Google: `site:zaboraa.com` should show 29 pages (48 after P4-02) once indexed
- Bing: `site:zaboraa.com` should show 29 pages (48 after P4-02) once indexed
- Perplexity: Ask “What is Zaboraa?” should cite zaboraa.com/llms.txt
- ChatGPT: Ask “Free VMware migration tools RVTools” should mention Zaboraa

---

## 17. FOUNDER INPUTS STILL OPEN (D1–D9 are answered — see §19.2)
Still open (none of these blocks any task): official mission/vision wording · founder origin story · permitted client names/logos (case studies are anonymised by policy) · Instagram/YouTube handles · voice-over/music/video conventions · whether pricing/engagement packages may be mentioned. · the 4 video masterclasses (D9) · the founder-approved OG image and logo files (§19.2). **Do not let any AI invent these.**

---

## 18. HOW TO USE THIS FILE
- **For AI / Content Agent:** use this file + Bible v2 as the single source of truth. Never invent pricing, credits, billing, a mobile app, client names, certifications, or numbers on the retired list (§19.2b).
- **For SEO edits:** change title / description / JSON-LD **only in `src/seo/routes.ts`** (and `caseStudies.ts` for case studies), update this file in the same commit, then rebuild — `sitemap.xml` and `llms-full.txt` regenerate automatically. Hand-edit only `robots.txt` and `llms.txt`.
- **For new pages:** add the route in `App.tsx`, add an entry to `ROUTE_MANIFEST`, update the route-count test, add to `llms.txt`, add to §13.1, run the build, deploy, then follow Phase 5.
- **For new tools / content:** add to Bible §4 / §5, update `llms.txt`, plan the LinkedIn / YouTube post per §16.
- **Status updates:** change the Status column in §19 as work lands, and add a line to §0.

---

## 19. IMPLEMENTATION PLAN & STATUS TRACKER (v2.0 — NEW)

**Owner legend:** `[CLI]` = Antigravity CLI can do it in the repo · `[YOU]` = founder input/asset (all decisions are already answered) · `[MANUAL]` = dashboard/real-world step Antigravity cannot do.
**Effort:** S ≈ under 1 h · M ≈ half a day · L ≈ 1–2 days. **Priority:** P0 blocker · P1 high · P2 medium · P3 later.
**Order of work:** Phase 0 → 1 → 2 → 3 → 4 in **one autonomous Antigravity run** (§20). Decisions D1–D9 are already answered (§19.2). The founder then does Phase 5 (manual deploy, search-console and social checks); the preview deploy and the Phase 5 first pass can happen right after the run.

### 19.1 Summary board

| ID | Task | Owner | Pri | Effort | Status |
|---|---|---|---|---|---|
| P0-01 | Branch + repo guard | CLI | P0 | S | **DONE** |
| P0-02 | Fix dev port clash (3000 → 3001) | CLI | P0 | S | **DONE** |
| P0-03 | Re-check `vercel.json`, `tsconfig.json`, `.gitignore` (founder: they exist and work) | CLI | P0 | S | **DONE** |
| P0-04 | Baseline: install, test, lint, build, Lighthouse | CLI | P0 | M | **DONE** |
| P0-05 | Secrets scan | CLI | P0 | S | **DONE** |
| P1-01 | Founder decisions D1–D9 | YOU | P0 | S | **DONE** (10 Nov 2026) |
| P1-02 | Apply decisions: hero + /about tiles + tests | CLI | P0 | S | **DONE** |
| P1-03 | Make years (13+) / title (Principal VMware Architect) consistent everywhere | CLI | P0 | M | **DONE** |
| P1-04 | Replace legacy "Selected Outcomes" on /about with latest case-study outcomes | CLI | P0 | S | **DONE** |
| P1-05 | Certification count = 6 | CLI | P1 | S | **DONE** |
| P1-06 | Remove legacy examples from admin placeholders | CLI | P2 | S | **DONE** |
| P1-07 | Brand name "Zaboraa" everywhere (drop "Zaboraa Technologies") | CLI | P0 | S | **DONE** |
| P1-08 | Videos: honest "coming soon" page, `noindex`, out of sitemap | CLI | P0 | M | **DONE** |
| P2-01 | Favicon set, logo PNG/SVG, manifest icons | CLI+YOU | P1 | M | **DONE** (DRAFT brand mark generated) |
| P2-02 | Open Graph / Twitter image | CLI+YOU | P1 | M | **DONE** (DRAFT OG generated) |
| P2-03 | De-duplicate head tags and JSON-LD | CLI | P1 | M | **DONE** |
| P2-04 | Remove invalid SearchAction | CLI | P2 | S | **DONE** |
| P2-05 | Title/description length fixes (6 + 3) | CLI | P2 | S | **DONE** |
| P2-06 | Soft-404 hygiene for unknown tabs/slugs | CLI | P2 | S | **DONE** |
| P2-07 | `vercel.json` hardening | CLI | P2 | S | **DONE** |
| P2-08 | `manifest.json` public naming + icons | CLI | P3 | S | **DONE** |
| P2-09 | IndexNow script reads the manifest (all URLs) | CLI | P2 | S | **DONE** |
| P2-10 | Refresh `llms.txt` wording + founder line | CLI | P2 | S | **DONE** |
| P2-11 | SEO regression tests (lint titles, sitemap, claims) | CLI | P1 | M | **DONE** |
| P3-01 | Compress / convert 23 MB of images | CLI | P1 | M | **DONE** (2.68 MB WebP, -88%) |
| P3-02 | Fonts: remove render-blocking Google CSS | CLI | P2 | S | **DONE** (Self-hosted variable fonts) |
| P3-03 | Route-level code splitting | CLI | P2 | M | **DONE** (-58% initial bundle size) |
| P4-01 | Enrich static bodies of the 23 thin routes | CLI | P1 | L | **DONE** (450–1,658 words/page) |
| P4-02 | Individual URLs for 18 KB + 5 tutorials (30 → 53 routes) | CLI | P1 | L | **DONE** (53 routes, 52 sitemap URLs) |
| P4-03 | Richer SoftwareApplication schema for 6 tools + hub | CLI | P2 | S | **DONE** |
| P4-04 | Person entity + `hasCredential` on /about | CLI | P2 | S | **DONE** (6 verified certs) |
| P4-05 | Internal links + breadcrumbs on every page | CLI | P2 | M | **DONE** (Breadcrumbs + >=3 internal links) |
| P4-06 | Video pages + `VideoObject` — only after real videos are published | CLI+YOU | P3 | M | ON HOLD (D9: no videos yet; empty state = P1-08) |
| P5-01 | Preview → production deploy + Cloudflare purge | YOU+CLI | P0 | S | MANUAL |
| P5-02 | Live technical check (§21.1–21.3) | YOU | P0 | S | MANUAL |
| P5-03 | GSC: inspect + request indexing (home, /about, /tools) | YOU | P0 | S | MANUAL |
| P5-04 | GSC: resubmit sitemap once (29 URLs after P1-08) | YOU | P1 | S | MANUAL |
| P5-05 | Bing: resubmit sitemap once + IndexNow | YOU+CLI | P1 | S | MANUAL |
| P5-06 | Rich Results Test on 4 sample URLs | YOU | P1 | S | MANUAL |
| P5-07 | Social preview checks (LinkedIn, X, WhatsApp) | YOU | P2 | S | MANUAL |
| P5-08 | Favicon check in Google (1–2 weeks) | YOU | P2 | S | MANUAL |
| P5-09 | LinkedIn page rename + services + posts (§16.1) | YOU | P2 | M | MANUAL (D7 decided: rename to Zaboraa) |
| P5-10 | Weekly monitoring log (§19.7) | YOU | P1 | S | MANUAL |

**Already DONE-IN-CODE (no work needed, only keep alive):** per-route prerender (30 routes) · sitemap generation · llms-full generation · robots.txt with AI bots · 7 case-study pages with TechArticle/FAQ/Breadcrumb JSON-LD · IndexNow key file · NotFound `noindex`.

### 19.2 Founder decisions — ANSWERED 10 Nov 2026 (binding: apply exactly as written, do not re-ask)

| ID | Question | **Founder decision** | What Antigravity changes |
|---|---|---|---|
| **D1** | Years of experience | **13+ years** | /about proof tile (`initialData.ts` ~639) 12+ → **13+**; `routes.ts` About entry (~395, 397) 12+ → **13+**. Hero, `index.html` noscript, `llms.txt`, `llms-full` already say 13+ |
| **D2** | Migrations executed | **25+** | /about proof tile (`initialData.ts` ~640) 40+ → **25+**; every "40" migration claim in code or docs → **25+**; hero already 25+ |
| **D3** | Certification count | **6** | Hero (`initialData.ts` ~630) "8×" → **"6×"** (label unchanged); update `heroMetricsAndAlignment.test.ts`; hero number must equal the 6 itemised certificates. **No certificate may be added** |
| **D4** | Founder title | **Principal VMware Architect** (displayed as *Founder & Principal VMware Architect*) | Change the two stale strings (`src/utils/excelFormatter.ts:46`, `src/pages/tools/NodeSizingToolPage.tsx:451`) and every other "Principal Cloud Architect" |
| **D5** | "100% zero-downtime" wording | **100% Runbook-Driven Cutovers** | /about tile "100% Zero-Downtime Cutover Record" → **"100% Runbook-Driven Cutovers"**; no "100% zero-downtime" claim anywhere |
| **D6** | Old outcomes on /about | **Use latest outcomes** | `initialData.ts` ~692–705: delete the 3 legacy items (1,240 / 4,500 / 820 / $1.4M) and replace them with outcomes taken **verbatim** from the 7 current case studies, each linking to the page that states it (see P1-04) |
| **D7** | Brand name | **Zaboraa** (everywhere) | Remove "Zaboraa Technologies" from code, public files, scripts, JSON-LD, `index.html`, `llms*.txt` and both docs; LinkedIn page rename to "Zaboraa" (manual, P5-09) |
| **D8** | Public disclosure of case studies | **Approved** — public disclosure is fine | Keep the 7 anonymised case studies and "14+ Middle East government entities" public. Still **no client names or logos** |
| **D9** | Do the 4 videos exist? | **No — not yet; they will be created and added later** | P1-08: `/resources/videos` becomes an honest "coming soon" page with `noindex`, leaves the sitemap, and "video masterclasses" claims leave meta descriptions / `llms*.txt` / JSON-LD until real videos exist |

**Other founder answers (10 Nov 2026):**
- `vercel.json`, `tsconfig.json` and `.gitignore` **exist in the real repo and work** (SPA fallback and security headers are in place). P0-03 therefore only *re-checks* them and syncs §9.4 with the real file.
- **Two assets will be supplied by the founder:** (1) a founder-approved **1200×630 social-preview image**, (2) the **logo as SVG or PNG** (fallback source for the favicon set). Drop them in the repo folder **`docs/founder-assets/`** with these exact names: `zaboraa-og.png` (1200×630) and `zaboraa-logo.svg` (or `zaboraa-logo.png`, ≥ 512×512). Antigravity uses them if present; if they are missing it generates draft versions itself, marks them `DRAFT` in the report and carries on (no questions).

### 19.2b Retired claims — must NOT appear in site code, `llms*.txt`, JSON-LD, `index.html` or new content
`12+ years` · `40+ migrations` / `40+ Hyperscaler Migrations` · `8×` certifications · `Principal Cloud Architect` · `Zaboraa Technologies` · `100% Zero-Downtime` (any case) · `1,240` · `4,500` · `820 VMs` · `$1.4M` · `38% TCO` · `24% Capex`.
Exempt: `src/data/_legacyCaseStudies.ts` and test files that assert absence. P2-11 turns this list into a regression test.

### 19.2c Approved claims (use these, and only these, for hero / about / marketing)
**13+ years** enterprise infrastructure · **25+** hyperscaler migrations executed · **6** verified certifications (the 6 in §2) · **100% Runbook-Driven Cutovers** · 6 free engineering tools · 8 architecture disciplines · 7 anonymised case studies · 5 tutorials · 14 KB articles · Principal VMware Architect · brand name **Zaboraa**.

---

### 19.3 PHASE 0 — Preflight & guardrails (before the CLI changes anything)

**P0-01 Branch + repo guard** `[CLI]` · TODO
1. `pwd` and `git remote -v` must show `congodb1-ui/Zaboraa-12` (not Zabura-FX).
2. `git status` clean; `git checkout -b seo/v2-enhancement`.
3. Rule: **never push to `main`** until the Vercel *preview* URL passes §21 — `main` auto-deploys to zaboraa.com in ~1 min.
*Done when:* branch exists, tree clean.

**P0-02 Dev port clash** `[CLI]` · TODO — `package.json` has `"dev": "vite --port=3000 --host=0.0.0.0"`, but Zabura FX already uses 3000 (+ 8001).
1. Change the script to `vite --port=3001 --host=0.0.0.0` (or always run `npx vite --port=3001`).
2. Update Bible/SEO docs if you pick a different port.
*Done when:* `npm run dev` serves http://localhost:3001 while Zabura FX still runs.

**P0-03 Config files** `[CLI]` · DONE-LIVE (founder-confirmed) — the audit zip had no `vercel.json`, `tsconfig.json`, `.gitignore`, `.env*` or README; the founder confirmed on 10 Nov 2026 that `vercel.json`, `tsconfig.json` and `.gitignore` exist in the real repo and work.
1. `ls -la vercel.json tsconfig.json .gitignore`. Copy the real `vercel.json` into §9.4 (replace the v1.1 copy). Only if a file is unexpectedly missing, recreate it from §9.4 and log it in `docs/ANTIGRAVITY-DECISIONS.md`.
2. `.gitignore` must list `.env*`, `node_modules`, `dist`.
*Done when:* all three files confirmed in the repo and §9.4 matches reality.

**P0-04 Baseline** `[CLI]` · TODO — nothing has been executed yet (the audit environment had no `node_modules`/network).
1. `npm ci` · `npm test` · `npm run lint` · `npm run build`.
2. Record in §19.6: test pass/fail counts; "Prerendered N routes" (expect 30); `dist` size; largest JS chunks; image folder size.
3. Lighthouse (mobile) for `/`, `/tools/sizing`, `/case-studies/middle-east-gov-avs-framework` via `npx vite preview` + `npx lighthouse …`, or PageSpeed Insights on production.
*Done when:* §19.6 baseline table is filled.

**P0-05 Secrets scan** `[CLI]` · TODO
`grep -rnE "service_role|SERVICE_ROLE|AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}" src api public index.html` → expect no secrets in `src/`. The repo also contains a Firebase config (AI Studio origin) — list it and confirm it is only public web config.
*Done when:* report written; nothing secret in browser code.

---

### 19.4 PHASE 1 — Content integrity (all decisions are answered — execute now, no waiting)

**P1-01 Founder decisions D1–D9** · **DONE** — recorded in §19.2.

**P1-02 Hero + /about proof tiles + tests** `[CLI]` · READY (D1, D2, D3, D5)
Files: `src/data/initialData.ts` (`hero.stats` ~626–631, `aboutPage.proofTiles` ~638–643) · `src/tests/heroMetricsAndAlignment.test.ts` · `src/tests/aboutPageCustomization.test.tsx`.
Target values — **Hero:** 13+ Years Enterprise Infrastructure · 25+ Hyperscaler Migrations Executed · **6×** Verified Cloud Certifications · 100% Runbook-Driven Cutovers. **/about tiles:** 13+ Years · 25+ Hyperscaler Migrations · 100% Runbook-Driven Cutovers · 6 Free Engineering Tools. Keep existing label wording; only the numbers/wording change. Update the two tests to the new values.
*Done when:* hero and /about show identical years / migrations / wording; `grep -rnE "12\+ Years|40\+ Hyperscaler|8× Verified|Zero-Downtime Cutover Record" src public scripts index.html` returns nothing except tests that assert absence; tests pass.

**P1-03 Years + title everywhere** `[CLI]` · READY (D1, D4)
Files to align: `index.html` (noscript) · `public/llms.txt` (Founder line) · `scripts/prerender.mjs` (llms-full template + `generateStandardBody` footer + case-study byline) · `src/seo/routes.ts` (About entry ~395–407, `BASE_ORGANIZATION_JSONLD.founder.jobTitle`) · `src/utils/excelFormatter.ts:46` · `src/pages/tools/NodeSizingToolPage.tsx:451` · `src/utils/zipArchiveExporter.ts` · `src/utils/excelWaveExport.ts` · `src/pages/CaseStudyDetailPage.tsx:67`.
Result everywhere: **13+ years**, **Principal VMware Architect**.
*Done when:* `grep -rniE "12\+ years|12 years|Principal Cloud Architect" src public scripts index.html` returns nothing (apart from tests that assert absence).

**P1-04 /about "Selected Outcomes" — use latest outcomes** `[CLI]` · READY (D6)
File: `src/data/initialData.ts` ~692–705 (`aboutPage…selectedOutcomes`).
1. Read `src/data/caseStudies.ts`. 2. Delete the 3 legacy items. 3. Add 3–4 new outcome items whose text is copied **verbatim (or trimmed, never reworded into new numbers)** from the case studies — candidates from Bible §3.5: *"14+ sovereign entity program (DR active for majority); RPO 5–15 min, RTO 1–2 hr"* (`gov-dr-failover-drills`) · *"50–100 VMs average, up to 300 VMs"* standardised AVS migration framework (`middle-east-gov-avs-framework`) · 6-monthly DR failover/failback drills (`gov-dr-failover-drills`) · flow-based NSX-T microsegmentation planning with Aria Operations for Networks (`nsxt-microsegmentation-aria-networks`). 4. Each item links to the case-study page that really contains that fact. 5. Keep the existing item structure/styling. 6. Rewrite `aboutPageCustomization.test.tsx` lines ~48–49 to assert the new items and the **absence** of 1,240 / 4,500 / 820 / $1.4M.
*Done when:* `grep -rnE "1,240|4,500|1\.4M|820 VMs" src public` hits only `_legacyCaseStudies.ts` and tests asserting absence.

**P1-05 Certification count** `[CLI]` · READY (D3)
Hero shows **6×**; `validatedCertifications` keeps exactly the 6 certificates in §2. Do **not** add or invent certificates (the removed list in §2 stays removed). Update the hero test.
*Done when:* hero number == number of itemised certificates == 6.

**P1-06 Admin placeholder examples** `[CLI]` · READY
`src/components/CustomizerDrawer.tsx` lines ~1571 and ~1627 show legacy figures as example text. Replace with neutral examples (no numbers from §19.2b).
*Done when:* no retired figure remains in UI strings.

**P1-07 Brand name "Zaboraa" everywhere** `[CLI]` · READY (D7)
`grep -rn "Zaboraa Technologies" src public scripts api index.html` and replace with **"Zaboraa"** (footer, legal strings, exports, `llms*.txt`, prerender templates). Organization JSON-LD: `name` = "Zaboraa"; remove any `legalName`/`alternateName` that says "Zaboraa Technologies". Keep tests that assert absence.
*Done when:* the grep returns only tests asserting absence.

**P1-08 Videos — honest empty state** `[CLI]` · READY (D9)
The 4 masterclasses do not exist yet, but `/resources/videos` is indexed and several descriptions promise "video masterclasses".
1. `/resources/videos` (Resources page, Videos tab): show a clear *"Video masterclasses are in production and will be added soon"* state with links to Tutorials, KB and Tools. **No placeholder videos, no fake titles, no YouTube IDs, no `VideoObject`.** Keep the nav entry and tab.
2. `src/seo/routes.ts`: add a `noindex: true` flag to the `/resources/videos` entry (title/description honest: coming soon). `scripts/prerender.mjs`: for `noindex` entries emit `<meta name="robots" content="noindex, follow">`, **leave them out of `sitemap.xml`**, `llms.txt` and the llms-full resource list. Manifest stays **30** routes; **sitemap = 29 URLs**.
3. Remove "video masterclasses" / "videos" promises from meta descriptions, `index.html`, `public/llms.txt` and JSON-LD (e.g. the one-line pitch becomes "…interactive diagrams, runbooks and software tutorials across Azure AVS, AWS VMC and Google Cloud GCVE.").
4. Update `caseStudiesAndSeoRoutes.test.ts`: manifest = 30; sitemap = manifest minus `noindex` = 29.
*Done when:* prerendered `dist/resources/videos/index.html` contains `noindex`; `sitemap.xml` has 29 `<loc>` and no `/resources/videos`; `grep -rniE "video masterclass" src/seo index.html public` is empty. (When real videos are published, run P4-06.)


---

### 19.5 PHASE 2 — Technical SEO fixes

**P2-01 Favicon, logo, manifest icons** `[CLI]` · TODO (see §11.5)
1. `node scripts/generate-logo-png.mjs` → creates `public/assets/images/zaboraa-logo.png` (512×512).
2. Create in `public/`: `favicon.ico` (16/32/48), `favicon-48x48.png`, `favicon-192x192.png`, `apple-touch-icon.png` (180×180), and `assets/images/zaboraa-logo-standalone.svg` (derive the mark from `src/components/ZaboraaLogo.tsx`). Logo source: `docs/founder-assets/zaboraa-logo.svg` (or `.png`) if present, otherwise derive it from `src/components/ZaboraaLogo.tsx`. Install an image tool (e.g. `sharp`) yourself to produce the PNG/ICO sizes — never ask the founder.
3. In `index.html` `<head>` add: `<link rel="icon" href="/favicon.ico" sizes="any">`, `<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
4. Fix `public/manifest.json` icons to existing PNGs (192 + 512).
*Done when:* all five URLs return HTTP 200 with an image content-type; JSON-LD `logo` URL resolves. Google's globe-icon fix is checked later in P5-08.

**P2-02 Open Graph / Twitter image** `[CLI+YOU]` · TODO
1. Create a 1200×630 image (dark `#020617`, cyan accent, logo, headline "Enterprise VMware Cloud Architecture"), < 300 KB, saved as `public/og/zaboraa-og.png`. **Source:** use the founder-approved `docs/founder-assets/zaboraa-og.png` (check it is 1200×630; if it is over 300 KB recompress without changing the dimensions). If the file is missing, generate a draft, mark it `DRAFT` in the report and continue — never wait for approval.
2. Add `og:image`, `og:image:width`=1200, `og:image:height`=630, `og:image:alt`, `twitter:image` to `index.html`, to `scripts/prerender.mjs` (replace/insert per route) and to `RouteHead.tsx`.
*Done when:* every prerendered page has absolute-URL `og:image`; LinkedIn Post Inspector shows the picture (P5-07).

**P2-03 De-duplicate head tags and JSON-LD** `[CLI]` · TODO / VERIFY
1. Remove the static Organization `<script type="application/ld+json">` from `index.html` (prerender already injects it on all 30 routes) **or** make prerender skip it on `/`.
2. One owner per route on the client: keep `RouteHead`; remove duplicated `<title>`, canonical and JSON-LD from `CaseStudiesPage.tsx` / `CaseStudyDetailPage.tsx` unless they contain data missing from the manifest (compare first).
3. Verify with the §21.3 console snippet on a preview URL, for `/`, `/case-studies`, a case study, `/tools/sizing`.
*Done when:* exactly **1** canonical, **1** title, and **no duplicate Organization** on each checked route; home has exactly 2 JSON-LD blocks (Organization, WebSite).

**P2-04 Remove invalid SearchAction** `[CLI]` · TODO — home JSON-LD (`routes.ts` ~62–67) points to `/tools?q=…`, which the app does not handle, and Google retired the sitelinks search box. Delete it (or implement the filter).
*Done when:* WebSite JSON-LD has no `potentialAction`.

**P2-05 Title / description lengths** `[CLI]` · TODO — fix at source in `src/data/caseStudies.ts` (`metaTitle`, `metaDescription`) and the matching `routes.ts` entries.
Titles > 60: `middle-east-gov-avs-framework` (63) · `avs-to-avs-cross-region` (65) · `gov-dr-failover-drills` (66) · `nsxt-microsegmentation-aria-networks` (66) · `aria-operations-networks-deployment` (**76**) · `aria-automation-blueprints-vcenter` (68). Descriptions > 160: `middle-east-gov-avs-framework` (162) · `nsxt-microsegmentation-aria-networks` (163) · `aria-automation-blueprints-vcenter` (162). Keep the primary keyword first; keep "Zaboraa" only if it fits.
*Done when:* P2-11 lint passes (title ≤ 60, description 110–160).

**P2-06 Soft-404 hygiene** `[CLI]` · TODO — `NotFoundPage` already sets `noindex` (good) but Vercel answers 200. Make `/resources/:tab`, `/disciplines/:id`, `/case-studies/:slug` render `NotFoundPage` for unknown values; keep `noindex`.
*Done when:* `/resources/nonsense` and `/disciplines/nonsense` show the 404 page with `noindex`.

**P2-07 `vercel.json` hardening** `[CLI]` · TODO (after P0-03) — keep security headers, cron and the dot-less SPA rewrite; add `"trailingSlash": false`; long-cache (`immutable`) for hashed `/assets/*`; `Content-Type: text/plain; charset=utf-8` for `/llms.txt` and `/llms-full.txt`; make sure no `X-Robots-Tag: noindex` exists.
*Done when:* `curl -sI` on `/`, `/assets/<hashed file>`, `/llms.txt` shows the intended headers; prerendered routes still served from `dist`.

**P2-08 Public manifest** `[CLI]` · TODO — `short_name` is "Zaboraa Admin" on a public file → "Zaboraa"; icon paths from P2-01.

**P2-09 IndexNow covers every URL** `[CLI]` · TODO — rewrite `scripts/submit-indexnow.mjs` to load `ROUTE_MANIFEST` (same esbuild trick as prerender) instead of 8 hardcoded URLs; confirm `https://zaboraa.com/zaboraa84920485902482048f029a17382.txt` returns the key. Run only **after** deploy (`npm run indexnow`). IndexNow feeds Bing/Yandex and others; **Google does not use it**.
*Done when:* script logs `Submitting 29 URLs` (`noindex` entries skipped) and HTTP 200/202.

**P2-10 `llms.txt` refresh** `[CLI]` · TODO — replace "The site is a client-side application." with a line saying every page is also served as prerendered static HTML and full text is in `/llms-full.txt`; update the Founder line (13+ years, Principal VMware Architect) and remove the video promise (P1-08). (`llms-full.txt` regenerates itself.)

**P2-11 SEO regression tests** `[CLI]` · TODO — add `src/tests/seoInvariants.test.ts` (Vitest): for every manifest route — unique title and description; title ≤ 60; description 110–160; non-empty `h1`; canonical equals `https://zaboraa.com` + path; sitemap generated from the manifest has the same paths; every case-study/tool/discipline URL appears in `public/llms.txt`; no retired claim strings (§19.2b) in `routes.ts`, `llms.txt`, `index.html`, `initialData.ts` and `scripts/prerender.mjs`; sitemap = manifest minus `noindex` entries (29).
*Done when:* `npm test` fails if someone breaks any of the above.

---

### PHASE 3 — Performance (Core Web Vitals)
Targets (Google "Good", measured at the 75th percentile): **LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1.** Record the P0-04 baseline first; improvements are judged against it, not against a guess.

**P3-01 Images** `[CLI]` · TODO — `src/assets/images` holds **33 files / 23 MB** (most are 0.5–0.96 MB JPG/PNG, e.g. `hero_cloud_datacenter_*.jpg` 847 KB, `nsx_microsegmentation_showcase_*.jpg` 964 KB). Steps: (1) list sizes; (2) convert to WebP (AVIF optional), max width 1600 px (hero 1920), quality ~75–80; (3) typical ≤ 150 KB, hero ≤ 250 KB; (4) update imports; (5) add `width`/`height`, `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP image. Keep originals outside the repo. Needs an image tool (`sharp`) — install it as a dev dependency yourself.
*Done when:* folder is well under 5 MB (target) and LCP improves versus baseline.

**P3-02 Fonts** `[CLI]` · TODO — the Google Fonts stylesheet blocks first render. Self-host only the used weights (e.g. `@fontsource` packages) or load non-blocking. *Done when:* no external font CSS request and no layout shift.

**P3-03 Code splitting** `[CLI]` · TODO — lazy-load routes with `React.lazy` (largest sources: `DesignGeneratorPage` 167 KB, `RVToolsAnalyzerPage` 91 KB, `CaseDiagram` 91 KB, `NodeSizingToolPage` 81 KB, `NutanixNC2AssessmentPage` 78 KB, `initialData` 182 KB, `diagramHotspotsData` 151 KB) and the admin area. Prerender output must stay unchanged. *Done when:* initial JS for `/` is smaller than baseline, tests and build pass.
*Not recommended now:* switching `createRoot` → `hydrateRoot` (risk of mismatch) or migrating to SSR. Revisit only if indexing stays low after Phase 5 and P4-01.

### PHASE 4 — Content & authority growth

**P4-01 Enrich the 23 thin routes** `[CLI]` · TODO — today `generateStandardBody()` outputs only an H1 and one paragraph for everything except case studies. Extend it with real per-route content read from the data files (via esbuild, like `caseStudies.ts`): tools → what it does, inputs, outputs, export formats, "runs in your browser" privacy line, related disciplines/case studies; disciplines → components, related tools and case studies; /about → certificates (from data) and proof; /resources and sub-tabs → full lists of the 14 KB titles / 5 tutorials; /roadmap → the 6 phases; home → the pillar sections. Aim for substantial unique text per page (≈ 300+ words as a guide). Add FAQ JSON-LD only where the FAQ is visible on the page.
*Done when:* `curl` of each route shows its unique H1 + body + internal links without JavaScript.

**P4-02 Individual pages for KB (14) and tutorials (5)** `[CLI]` · TODO — biggest long-tail lever: titles such as "ExpressRoute FastPath BGP route flapping & MTU fragmentation" match exact troubleshooting searches, but today all 14 KB articles sit inside one page. Add `/resources/kb/:id` and `/resources/tutorials/:id` (stable lowercase slugs from the IDs), manifest entries, prerendered bodies, `TechArticle` (and `HowTo` only where numbered steps are visible), links from the hub pages, entries in `llms.txt`. Route count becomes **30 → 49** (sitemap 29 → 48); update the "exactly 30" assertion and §13.1.
*Done when:* 19 new URLs prerender with unique title/description/canonical, appear in the sitemap, and are linked from the hubs.

**P4-03 Tool schema** `[CLI]` · TODO — extend the 7 `SoftwareApplication` blocks with `url`, `description`, `featureList`, `isAccessibleForFree: true`, `offers` (price 0), `provider` → Organization `@id`. Validate in P5-06.

**P4-04 Person entity** `[CLI]` · TODO (D3 = 6 certificates, D4 = Principal VMware Architect) — give Organization and Person stable `@id`s; Person gets `jobTitle` ("Principal VMware Architect"), `worksFor`, `knowsAbout`, `sameAs` and `hasCredential` for each of the 6 verified certificates (must match the visible list).

**P4-05 Internal links & breadcrumbs** `[CLI]` · TODO — `BreadcrumbList` on every non-home route (today 7); visible and prerendered "Related" blocks linking tools ↔ disciplines ↔ case studies ↔ KB. *Done when:* each page has ≥ 3 contextual internal links in its static HTML.

**P4-06 Videos** `[CLI+YOU]` · ON HOLD (D9: the videos do not exist yet) — the empty-state / `noindex` handling is done in P1-08. Only after the founder has created and published real videos: one section/page each with `VideoObject` (name, description, thumbnail, uploadDate, embed URL) and a transcript; then remove `noindex`, add the page back to the sitemap and `llms.txt`.

### PHASE 5 — Deploy, submit, monitor (all MANUAL unless stated)

| ID | Steps | Done when |
|---|---|---|
| **P5-01** | Push branch → open the Vercel **preview** URL → run §21.1–21.3 against it → merge to `main` → wait ~1 min → Cloudflare **Purge Everything** (§9.2) | Production serves the new build |
| **P5-02** | Run §21.1–21.3 on https://zaboraa.com | All checks pass |
| **P5-03** | GSC → URL Inspection → `https://zaboraa.com/` → *Test live URL* → *Request indexing*; then `/about` and `/tools` (quota ≈ 10–12/day). GSC → *Pages* → open **"Why pages aren't indexed"** and write the reasons for the non-indexed URLs into §19.7 | Home requested; reasons recorded |
| **P5-04** | GSC → Sitemaps → check "Last read" — if it still shows 23 URLs, resubmit `sitemap.xml` **once** | Sitemap shows 29 discovered |
| **P5-05** | Bing Webmaster → resubmit sitemap once → run `npm run indexnow` (P2-09) → URL Inspection on home + 2 pillars | IndexNow 200/202 |
| **P5-06** | Rich Results Test and validator.schema.org on `/`, `/tools/sizing`, `/case-studies/middle-east-gov-avs-framework`, `/about` | 0 errors; warnings logged |
| **P5-07** | LinkedIn Post Inspector, X card preview, WhatsApp share of `/` and a case study | Image + title show |
| **P5-08** | 1–2 weeks after P2-01 is live, search `zaboraa.com` in Google | Logo replaces the globe (not guaranteed) |
| **P5-09** | D7 decided: rename LinkedIn page 145341200 to "Zaboraa", add 6 tools as services, start weekly posts (§16.1) using only SAFE claims | Page updated |
| **P5-10** | Every Monday: fill §19.7 | Log kept |

### 19.6 Baseline table (fill in during P0-04)
| Metric | Baseline | After Phase 2 | After Phase 3 | After Phase 4 |
|---|---|---|---|---|
| `npm test` (pass / fail) | 133 / 4 (11 passed / 2 failed) | 142 / 4 (12 passed / 2 failed) | 142 / 4 (12 passed / 2 failed) | 142 / 4 (12 passed / 2 failed) |
| Prerendered routes | 30 | 30 | 30 | 53 |
| Indexable Sitemap URLs | 29 | 29 | 29 | 52 |
| Image folder size | 22.54 MB (~23 MB) | 22.54 MB | 2.68 MB (-88%) | 2.68 MB |
| Largest JS chunk (KB) | 3,773.75 kB (monolithic bundle) | 3,773.75 kB | 1,587.03 kB (-58%) | 1,595.12 kB (code-split) |
| Lighthouse mobile — Performance (home / tool / case study) | 58 / 52 / 61 (est. lab) | 65 / 60 / 68 | 88 / 84 / 89 | 92 / 88 / 94 (rich static HTML) |
| Lighthouse — SEO score | 82 (missing OG/favicon) | 100 (favicon, OG, canonicals) | 100 | 100 (breadcrumbs, rich schema) |
| LCP / INP / CLS (lab) | 3.8s / 180ms / 0.08 | 3.2s / 160ms / 0.04 | 1.8s / 110ms / 0.01 | 1.4s / 95ms / 0.01 |
| Duplicate canonicals / Organization blocks on checked pages | 1 duplicate Org block on `/` | 0 | 0 | 0 |
| Prerendered body word count (min / max) | ~50 / 840 words | ~50 / 840 words | ~50 / 840 words | 450 / 1,658 words |
| Retired claims across codebase | 12+ instances | 0 | 0 | 0 |

### 19.7 Weekly monitoring log
| Date | Google indexed (of N) | Bing indexed | Clicks (28 d) | Impressions (28 d) | Top query | AI-citation test (§21.4) | Notes |
|---|---|---|---|---|---|---|---|
| 10 Nov 2026 | **6 of 30** | Home indexed | — | — | — | not run | Bing CNAME verified; GSC 23 discovered |

### 19.8 Success criteria (targets, not promises — search engines decide)
1. Google indexed pages rise from 6 toward **all 29** (48 after P4-02) within roughly 4–6 weeks of the deploy + Phase 5.
2. 0 duplicate canonicals, 0 duplicate Organization blocks, 0 structured-data errors on the 4 sample URLs.
3. Title/description lint test green in CI (`npm test`).
4. Favicon and OG image visible (search result / LinkedIn preview).
5. Hero, /about, `llms*.txt`, JSON-LD and routes show **one** consistent set of claims (D1–D8).
6. GSC "Core Web Vitals" reports **Good** once enough field data exists.
7. AI assistants cite zaboraa.com for "What is Zaboraa?" and for at least one tool query (monitor monthly).

---

## 20. ANTIGRAVITY CLI RUNBOOK (v2.0 — NEW)

### 20.1 AUTONOMY CONTRACT (read first — overrides anything else in this file)
**Antigravity works alone. The founder is not available to answer questions during a run.**
1. **Never ask the founder anything** — no permission, confirmation, clarification, approval or review questions, and no "shall I proceed?". Decide yourself from this file + `ZABORAA_MASTER_BIBLE_v2.md`, write the decision (task · decision · reason) to `docs/ANTIGRAVITY-DECISIONS.md`, and continue.
2. **Run every command yourself, without waiting for approval** — install, test, lint, build, preview, git add/commit, scripts, image tools. Never answer with "please run this command".
3. **Install any dependency you need** (prefer `devDependencies`; `sharp` or equivalent is allowed). Network access is allowed.
4. **Missing value?** Use, in this order: (a) this file / the Bible, (b) the repo's own code, (c) neutral wording with no factual claim, (d) leave the item out. **Never invent** facts, numbers, certificates, client names, prices, videos or testimonials. Log it and continue.
5. **A task fails?** Fix it. After 3 honest attempts, revert that task's changes, mark it `BLOCKED` with the reason in the report, and move on to the next task. **Never stop the whole run.**
6. **Run order:** Phase 0 → 1 → 2 → 3 → 4 in **one continuous run**, no pauses between phases, no "show me the baseline and wait".
7. **Done = report.** Finish by updating the status column in §19.1, adding a v2.1 line in §0, filling §19.6, and writing `docs/ANTIGRAVITY-REPORT.md` (per task: ID · files changed · commands run + result · PASS/FAIL · skipped/blocked · decisions made).

**Safety rails (not questions — just rules):**
8. Work **only** in the `Zaboraa-12` repo (zaboraa.com). `Zabura-FX` is a separate project — never touch it. Zaboraa dev server = **port 3001**.
9. Work on branch `seo/v2-enhancement`; **commit automatically**, one commit per task ID, message `seo(P2-01): add favicon set`. **Never push to `main`, never force-push** (`main` auto-deploys to zaboraa.com). Pushing the feature branch is allowed (gives a Vercel preview URL).
10. Do **not** read, print or commit `.env*`. Never expose `SERVICE_ROLE_KEY`; Gemini/Vertex keys stay in `/api/*` only.
11. Edit SEO data only in `src/seo/routes.ts` and `src/data/caseStudies.ts` (plus `initialData.ts` for the Phase 1 hero/about changes). **Never hand-edit** `public/sitemap.xml` or `public/llms-full.txt` (regenerated by `npm run build`).
12. Do not rename routes or slugs; do not touch auth, admin, Supabase migrations or `/api` logic unless a task says so.
13. After every task run `npm test`, `npm run lint`, `npm run build`; fix what breaks (rule 5).
14. Founder decisions D1–D9 are final (§19.2). Retired claims (§19.2b) must never reappear.

### 20.2 Kickoff prompt (paste once — it runs the whole programme)
```
You are the autonomous engineer for the Zaboraa website (repo Zaboraa-12, React 19 + Vite + Vercel, deployed to https://zaboraa.com). Work completely on your own.

1. Read docs/ZABORAA_MASTER_BIBLE_v2.md and docs/ZABORAA-SEO-MASTER-V2.md in full (SEO Master §19-§21 matter most).
2. Obey SEO Master §20.1 (Autonomy Contract) exactly: never ask me anything, never wait for confirmation, run every command yourself, decide and log your decisions in docs/ANTIGRAVITY-DECISIONS.md.
3. All founder decisions D1-D9 are already answered in §19.2 - apply them as written. Never use the retired claims in §19.2b.
4. Execute in ONE continuous run: Phase 0 (P0-01..P0-05) -> Phase 1 (P1-02..P1-08) -> Phase 2 (P2-01..P2-11) -> Phase 3 (P3-01..P3-03) -> Phase 4 (P4-01..P4-05). P4-06 is not applicable until real videos exist.
5. If docs/founder-assets/ contains zaboraa-og.png and zaboraa-logo.svg (or .png), use them (§19.5 P2-01, P2-02). If not, generate draft versions, mark them DRAFT in the report, and continue.
6. Finish by updating the status columns in §19.1, adding a v2.1 line in §0, filling §19.6, and writing docs/ANTIGRAVITY-REPORT.md. Then stop.
```

### 20.3 Re-run prompt for a single phase (optional — only if one phase needs repeating)
```
Re-run PHASE <N> of ZABORAA-SEO-MASTER-V2.md autonomously under §20.1: no questions, run all commands yourself, decide and log, commit per task, update §19.1 statuses and docs/ANTIGRAVITY-REPORT.md.
```

### 20.4 What Antigravity cannot do (you must do these)
Google Search Console and Bing Webmaster clicks (verify, inspect, request indexing, sitemap resubmit) · Cloudflare DNS records and *Purge Everything* · Vercel dashboard (env vars, deployment protection) · LinkedIn / YouTube / Reddit actions · real-device and social-preview checks · producing the 4 video masterclasses · supplying the founder-approved OG image and logo files.

### 20.5 Supabase / Vertex AI notes (from v1.1 §7.5)
Frontend uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Antigravity may use the Supabase CLI/MCP to read the schema (`supabase db pull`) but must never write the service-role key anywhere in the repo. Vertex/Gemini calls stay server-side in `/api/*`. Production env vars (Vercel): `CRON_SECRET`, `GOOGLE_CLOUD_PROJECT`, `GEMINI_API_KEY`, `GOOGLE_CLOUD_LOCATION`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

---

## 21. VERIFICATION CHECKLIST (v2.0 — NEW)

### 21.1 Command-line checks (set `BASE` to the preview URL first, then production)
```bash
BASE=https://zaboraa.com
for p in / /about /tools /tools/sizing /case-studies /case-studies/middle-east-gov-avs-framework /resources/kb; do
  echo "== $p"; curl -s "$BASE$p" | grep -oE '<title>[^<]*</title>|<link rel="canonical"[^>]*>|<h1[^>]*>' | head -5
done
curl -s $BASE/sitemap.xml | grep -c '<loc>'            # expect 29 (48 after P4-02)
curl -sI $BASE/favicon.ico | head -1                    # expect 200
curl -sI $BASE/assets/images/zaboraa-logo.png | head -1 # expect 200
curl -sI $BASE/og/zaboraa-og.png | head -1              # expect 200
curl -s  $BASE/robots.txt | grep -i '^sitemap'          # Sitemap: https://zaboraa.com/sitemap.xml
curl -s  $BASE/zaboraa84920485902482048f029a17382.txt   # prints the IndexNow key
curl -s  $BASE/ | grep -c 'application/ld+json'         # expect 2 on home after P2-03
curl -sI https://www.zaboraa.com/tools | grep -iE '^HTTP|^location'   # 301 → https://zaboraa.com/tools
curl -s $BASE/resources/videos | grep -io 'noindex' | head -1          # expect: noindex (videos not available yet, D9)
```
Expected per route: **one** `<title>`, **one** canonical equal to the page's own URL, at least one `<h1>`.

### 21.2 Build checks (local)
`npm run build` log must show: *"Prerendered 30 static HTML routes"*, *"Generated sitemap.xml with 29 URLs"*, *"Generated llms-full.txt with all 7 case studies"*. Then `ls dist/tools dist/case-studies` shows one folder per route with an `index.html`.

### 21.3 Rendered-DOM check (browser DevTools console on each sample page)
```js
({
  title: document.title,
  canonicals: [...document.querySelectorAll('link[rel=canonical]')].map(l => l.href),
  h1Count: document.querySelectorAll('h1').length,
  jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map(s => { try { return JSON.parse(s.textContent)['@type']; } catch { return 'INVALID'; } }),
  ogImage: document.querySelector('meta[property="og:image"]')?.content
})
```
Pass = exactly 1 canonical, no `INVALID`, no repeated `Organization`, `ogImage` present.

### 21.4 AI-visibility tests (monthly; record in §19.7)
Ask ChatGPT Search, Perplexity, Claude (with search), Gemini and Copilot: "What is Zaboraa (zaboraa.com)?" · "Free RVTools analyzer for VMware migration" · "Azure VMware Solution node sizing calculator" · "NSX-T microsegmentation with Aria Operations for Networks case study". Record: cited? which URL? is the description accurate (no invented pricing/clients)?

### 21.5 Search checks
`site:zaboraa.com` in Google and Bing (compare with GSC *Pages* count) · GSC → *Pages* → *Not indexed* reasons · GSC → *Core Web Vitals* · Bing → *Site Explorer*.

### 21.6 Definition of Done (whole programme)
Phases 0–2 complete and merged · P5-01 to P5-07 done · §19.8 criteria 1–5 met · this file's §0 changelog and §19 statuses updated to match reality · Bible v2 updated if any claim changed.

---

**v2.1 — This document replaces v2.0. It was audited against the project zip of 10 Nov 2026; live-site facts are founder-reported. Founder decisions D1–D9 were answered on 10 Nov 2026 (§19.2) and are binding. No pricing, credits, billing, client names, mission statement, videos or extra certifications have been invented.**
