# ZABORAA MASTER BIBLE — v2.1
**Single source of truth for Zaboraa — for AI video, content and marketing prompts**

> **READ THIS FIRST (accuracy note for any AI using this file).**
> Zaboraa is **NOT** a consumer AI-tools platform. It is a **founder-led enterprise VMware / hyperscaler cloud-architecture advisory** with a free **engineering workbench of 6 calculators/assessment tools**. There is **no pricing page, no credits system, no billing and no generation history** in the codebase. Do not invent them.
> **Source precedence (v2.1):** (0) the founder's decisions **D1–D9** (SEO Master §19.2) → (1) the codebase as uploaded on **10 Nov 2026** → (2) this file → (3) older documents / v1.x. Founder decisions override any code value they contradict; Phase 1 of the SEO Master brings the code in line. Where the code contradicts itself it is tagged **[CONFLICT-IN-CODE]** and the founder must decide before the claim is used in marketing.
> Tags: **[NOT IN CODEBASE]** supply from founder · **[DERIVED]** reasoned summary, not a quote · **[CONFLICT-IN-CODE]** two places disagree · **[HOLD]** do not publish yet · **[VERIFY]** could not be confirmed from the zip.
> Companion file: `ZABORAA-SEO-MASTER-V2.md` (SEO / GEO status, implementation plan and Antigravity runbook).
> **v2.1 (10 Nov 2026):** the founder answered **D1–D9**. The old **[HOLD]** / **[CONFLICT-IN-CODE]** tags that mention D1–D9 are **resolved** — the approved values are in §9. Where this file says "the code still shows …", the code is brought in line by SEO Master Phase 1 (P1-02 … P1-08).

| Field | Value |
|---|---|
| Version | **v2.2 — 12 Nov 2026** (supersedes v2.1; adds Content Agent Phase 2a/2b and quality guardrails specifications) |
| Audited against | `Zaboraa-Website-Project-Folder.zip` (247 files, built 10 Nov 2026) + Git commits on `congodb1-ui/Zaboraa-12` through 12 Nov 2026 |
| Not in the zip | `.env*`, `README`, `.git`. The founder confirmed on 10 Nov 2026 that `vercel.json`, `tsconfig.json` and `.gitignore` **exist in the real repo and work** (they were only missing from the audit zip) |

---

# 0. v2.0 RECONCILIATION — WHAT CHANGED VS v1 (and why)

| # | v1 said | The code now says | Evidence |
|---|---|---|---|
| 1 | 3 case studies: Tier-1 bank (1,240 VMs), 18-hospital network (4,500), global freight (820 / $1.4M) | **7 anonymised case studies** (6 Middle East government, 1 private sector). The 3 old ones are archived as "legacy" and **blocked by tests** | `caseStudies.ts`, `_legacyCaseStudies.ts`, `caseStudiesAndSeoRoutes.test.ts` |
| 2 | Hero stats 12+ yrs · 40+ migrations · 8× certs · 100% zero-downtime | Hero: **13+ · 25+ · 8× · 100% Runbook-Driven Cutovers**. /about tiles still say 12+ / 40+ / 100% Zero-Downtime → **[CONFLICT-IN-CODE]** | `initialData.ts:626–640`, `heroMetricsAndAlignment.test.ts` |
| 3 | Founder = "Principal Cloud Architect" | **"Principal VMware Architect"** nearly everywhere | `routes.ts`, `prerender.mjs`, `index.html`, `llms*.txt` |
| 4 | 6 certs incl. Azure Solutions Architect, GCP Cloud Architect, NSX-T Adv. Security | Code lists a **different 6** (NCP-CI-Azure, VCAP-DCV Design 2023, VCP-NV, VCP-DCV, VCF Specialist, VMC Master Specialist); hero still says 8× | `initialData.ts` `validatedCertifications` |
| 5 | Pure client-side SPA; crawlers see an empty page | **Build-time prerender**: 30 static HTML routes with own title, description, canonical, OG, JSON-LD and an H1 + body | `scripts/prerender.mjs`, `package.json` build script |
| 6 | Routes: hub `/case-studies` only | **30 URLs**, incl. 7 `/case-studies/:slug` | `src/seo/routes.ts` (`ROUTE_MANIFEST`) |
| 7 | 8 KB articles | **14** (8 core + 6 Nutanix `KB-NTX-1001…1006`) | `initialData.ts` `knowledgeBase` |
| 8 | 4 video masterclasses | Default data is `videos: []`. **Founder decision D9: the videos do not exist yet** (they will be created and added later) | `initialData.ts:1271` |
| 9 | `<title>` "Zaboraa Technologies – …" | **"Zaboraa - Enterprise VMware Cloud Architecture"** | `routes.ts` home entry, `index.html` |
| 10 | Unknown URL falls back to homepage | Renders a **NotFoundPage with `noindex`** (still HTTP 200 on Vercel SPA fallback) | `App.tsx`, `NotFoundPage.tsx` |
| 11 | Founder bio "verbatim from code" | That text is no longer in `src/` | grep of `src/` |
| 12 | Hosting "Vercel (`vercel.json`…)" | `vercel.json` was not in the audit zip, but the founder confirmed it exists and works in the real repo | founder, 10 Nov 2026 |

---

# 1. COMPANY IDENTITY

## 1.1 Core facts
| Field | Value |
|---|---|
| Brand name | **Zaboraa** — used everywhere, including footer, JSON-LD and LinkedIn (founder decision D7). "Zaboraa Technologies" is retired |
| Domain | **zaboraa.com** (canonical; `www` and the legacy alias `zaboraa-12.vercel.app` redirect to `https://zaboraa.com`) |
| Site `<title>` | **Zaboraa - Enterprise VMware Cloud Architecture** |
| Industry | Enterprise cloud architecture, VMware private cloud, hyperscaler migration, disaster recovery, network security |
| Business model | Founder-led advisory (briefing/consultation booking) + free interactive engineering tools used as lead-generation and credibility |
| Primary CTA | **Book Briefing** / **Book Call** (opens a "Schedule Briefing" modal) |
| Secondary CTA | **Explore Workbench Tools** (`/tools`) |
| Contact email (in code) | wasim@zaboraa.com |
| Contact phone (in code) | +91 7497624807 |
| Location (in code) | Pune & Global Advisory |

## 1.2 One-line pitch
> Founder-led VMware cloud architecture, hyperscaler migration, interactive diagrams, runbooks and software tutorials across Azure AVS, AWS VMC and Google Cloud GCVE.
*(Target wording after SEO Master P1-08 / D9. The code still says "video masterclasses" until P1-08 is applied — the videos do not exist yet.)*

## 1.3 Hero copy (verbatim from site data)
- **Eyebrow:** EXECUTIVE CLOUD ADVISORY · FOUNDER-LED
- **Headline:** Minimal Downtime VMware Cloud & Hyperscaler Migration Authority
- **Subheadline:** Architecting mission-critical enterprise cloud evacuations, sovereign VMware software-defined datacenters, and automated disaster recovery across Azure (AVS), AWS (VMC), and Google Cloud (GCVE).
- **Hero stats (decided — D1/D2/D3/D5):** 13+ Years Enterprise Infrastructure · 25+ Hyperscaler Migrations Executed · **6×** Verified Cloud Certifications · 100% Runbook-Driven Cutovers *(code still shows 8× until P1-02 / P1-05 are applied)*
- **/about proof tiles (decided — D1/D2/D5):** 13+ Years · 25+ Hyperscaler Migrations · 100% Runbook-Driven Cutovers · 6 Free Engineering Tools *(code still shows 12+ / 40+ / "100% Zero-Downtime Cutover Record" until P1-02 is applied)*

## 1.4 Long description [DERIVED from site content]
Zaboraa helps large enterprises (government entities and regulated, high-uptime private enterprises) move VMware-based datacenters to the cloud with minimal downtime and runbook-driven cutovers. It covers the full chain: discovering and sizing the on-premises estate, choosing and sizing the target platform (Azure VMware Solution, Google Cloud VMware Engine, VMware Cloud on AWS, or Nutanix NC2 on Azure), securing it with NSX-T zero-trust microsegmentation, migrating with VMware HCX, and protecting it with disaster-recovery orchestration (SRM and alternatives). Everything is backed by a deep library of reference architectures, runbooks, tutorials and videos, and a set of free browser-based tools that produce sizing, readiness, wave-plan, DR and bill-of-materials deliverables.

## 1.5 Tagline
- Default in-app logo subtitle: **"Enterprise VMware Architecture"** (editable by admin as `brandTagline`).
- Watermark text stamped on exported blueprints: **"ZABORAA · HYBRID CLOUD BLUEPRINT"**.
- Default PDF/export classification: **"CONFIDENTIAL // ARCHITECTURAL ASSESSMENT"**.

## 1.6 Mission & vision
**[NOT IN CODEBASE]** — no explicit mission statement exists. Closest stated positioning: *"Minimal downtime VMware cloud & hyperscaler migration authority"* and *"100% Runbook-Driven Cutovers"* (D5 — the old "100% zero-downtime" wording is retired). The founder should supply an official mission line.

## 1.7 Brand voice & tone [DERIVED]
- **Authoritative, technical, executive-level.** Speaks to CIOs, infrastructure architects and migration leads.
- Vocabulary: "runbook-driven cutover", "minimal downtime", "evacuation", "sovereign", "zero-trust", "mission-critical", "Tier-0", "wave planning", "zero-costing technical assessment".
- Proof-driven: leans on numbers (VM counts, downtime hours, TCO reduction, certifications).
- Serious, calm, engineering-precise; no hype, no emojis, no consumer-style slang.
- v2.1 note: **"100% zero-downtime" is retired (D5).** Use "100% Runbook-Driven Cutovers", "runbook-driven", "minimal downtime", "zero business-hour downtime".
- Labels and microcopy are monospaced "console" style (e.g., `PRINCIPAL ARCHITECTURAL DESK`, `Zero-Cost Technical Architecture`).

## 1.8 Visual identity
| Element | Spec |
|---|---|
| Default theme | **Dark** (page `#020617`, surface `#0f172a`, subtle `#1e293b`, border `#334155`) |
| Light theme | "High-contrast light" (page `#f8fafc`, surface `#ffffff`, text `#0f172a`, accent `#2563eb`) — toggled by a sun/moon button, saved in localStorage |
| Primary accent | **Cyan** (Tailwind cyan-400 `#22d3ee` / cyan-300 for hovers) — used on primary buttons, active states, links |
| Secondary accents | Emerald (success/NC2), Indigo/Violet (generator, logo gradient), Rose (DR/alerts), Amber (theme toggle sun) |
| Logo mark | Square rounded tile, dark slate gradient with thin cyan border; inside, a network/node motif — four corner nodes (sky, cyan, indigo, teal) around a glowing cyan core with a pulsing ring; dashed crosshair guide lines. Gradients: cyan → indigo → violet |
| Wordmark | **ZABORAA** in uppercase, black weight, white; small mono badge beside it; subtitle in tiny uppercase mono slate-400 |
| Heading/body font | **Plus Jakarta Sans** (weights 300–800) |
| Mono/technical font | **JetBrains Mono** (400–600) |
| UI style | Glassmorphism header, dark cards with slate-800 borders, tech-grid background pattern, live "telemetry particle" ambient background, floating data-center graphic, rounded-2xl cards, cyan glow on hover |
| PWA theme color | `#020617` (manifest short name "Zaboraa Admin") |

---

# 2. ABOUT / FOUNDER

| Field | Value |
|---|---|
| Name | **Wasim Sayyed** |
| Title (v2, matches code) | **Founder & Principal VMware Architect** — used in `src/seo/routes.ts`, JSON-LD, `llms.txt`, `llms-full.txt`, prerendered pages and `index.html`. Decided (D4): **Principal VMware Architect**. Older documents said "Principal Cloud Architect" (retired); two stale strings remain in code and are fixed in SEO Master P1-03: `src/utils/excelFormatter.ts:46` and `src/pages/tools/NodeSizingToolPage.tsx:451`. |
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

> ✅ **Certification count decided (D3): 6.** The hero in code still shows "8× Verified Cloud Certifications" (`initialData.ts:630`, locked by `heroMetricsAndAlignment.test.ts`); SEO Master P1-02 / P1-05 change it to **6×** so it equals the 6 itemised certificates. Never add a certificate without founder proof.
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

# 3. COMPLETE SITE MAP (every route, section, CTA)

The site is a single-page React app (client-side routing). **All public pages and all tools are open to anonymous visitors** (`publicAccessEnabled: true`, `authRequiredForTools: false`). Only the admin console is protected.

## 3.1 Public routes (30 URLs in the SEO manifest; every one is prerendered to static HTML at build)
| URL path | Page | What it contains |
|---|---|---|
| `/` | **Homepage** | Hero (headline, stats, portrait, "Book Briefing", "Explore Workbench Tools"); Cloud Migration Architecture Showcase; Layered Architecture Showcase; Engagement Methodology; discipline cards; Case Studies section; Featured video / knowledge sections |
| `/disciplines/:id` | **Discipline detail** (8 ids, see 3.3) | Deep-dive per platform: architecture layers, components, interactive diagrams |
| `/tools` | **Workbench Hub** | Index of the 6 tools (section 4) |
| `/tools/sizing` | Node & Storage Sizing Estimator | Tool 1 |
| `/tools/rvtools-analyzer` | RVTools Ingestion & Wave Planner | Tool 2 |
| `/tools/nutanix-nc2-assessment` | Nutanix NC2 on Azure Assessment | Tool 3 |
| `/tools/aria-networks` | Aria Operations for Networks Engine | Tool 4 |
| `/tools/dr-planner` | DR RPO/RTO Planner | Tool 5 |
| `/tools/design-generator` | Hybrid Blueprint Generator | Tool 6 |
| `/roadmap` | **6-Phase Enterprise Hyperscaler Migration Roadmap** | "From RVTools discovery and HCX fleet provisioning through live L2 extension, non-disruptive cutover and post-migration optimization." CTA: Assess Inventory in RVTools Tool |
| `/resources` | **Resources hub** (tabs: All / Nutanix Architecture / KB / Tutorials / Videos) | Knowledge base, tutorials; Videos tab is an empty "coming soon" state until videos exist (D9) |
| `/resources/:tab` | Direct tab links: `/resources/kb`, `/resources/tutorials`, `/resources/videos` | Same page, tab preselected |
| `/case-studies` | **Case Studies hub** | Lists the 7 case studies (section 3.5) |
| `/case-studies/:slug` | **Case Study detail** (7 slugs, §3.5) | Facts, sections, lessons learned, related tools/disciplines, FAQ, JSON-LD |
| `/about` | **About Principal Architect** | Founder profile (section 2) |
| `*` (any unknown URL) | **NotFoundPage** (`noindex`) | Served with HTTP 200 by the SPA fallback — see SEO Master P2-06 |

## 3.2 Admin routes (protected — not public)
| URL path | Purpose |
|---|---|
| `/admin`, `/admin/:tab` and `/console`, `/console/:tab` | Admin Control Center. Guard: signed-in user with role `admin` (or an offline admin session); otherwise redirected to `/`. |

Admin tabs/views: Overview, Analytics, AI Management, Briefings, Content, CRM, Database, Integrations, Media, Profile, Security, SEO, Settings, Users, Vault, Workspaces, Backups. Also an in-page Site Customizer drawer, Photo Editor, Platform Editor, Track Record Editor, Watermark Settings.

## 3.3 Discipline pages (`/disciplines/:id`)
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

## 3.4 Global layout elements (on every public page)
**Header / Navbar:** logo → `/`; Tools mega-menu (`/tools` + all 6 tools); Roadmap; Resources dropdown (Resources, Knowledge Base, Tutorials, Videos); Case Studies; About; **Search** (Ctrl+K command palette across platforms, tools, runbooks); theme toggle; **Sign In** (Google / Microsoft single sign-on or email); **Book Briefing** CTA; admin link (admins only). Mobile drawer mirrors this.

**Footer:** logo; Tools column (Workbench, Sizing, RVTools, DR Planner, Blueprint Generator); Disciplines column (links to `/disciplines/:id`); contact (mailto + tel); links to About, Resources, Case Studies; discreet Admin link.

**Floating controls (bottom-right):** theme toggle · "Customize Site" (admins) · **Book Call** (cyan pill).

**Optional announcement banner** (admin-toggled; default text: "New: VMware to Nutanix NC2 on Azure Migration Assessment Engine is Live!" → `/tools/nutanix-nc2-assessment`).

**Modals/drawers:** Schedule Briefing; Search Command; Founder Credentials; Hero Stats; User Workspace drawer (saved work); Commercialize/Auth portal; PWA install prompt; Offline reconciliation drawer.

## 3.5 Case studies (7 active — anonymised, aggregated)

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

> ✅ **Decided (D6): use latest outcomes.** `src/data/initialData.ts` lines ~692–705 (`aboutPage…selectedOutcomes`) still display the legacy figures in code and link them to unrelated case-study pages. SEO Master P1-04 replaces them with outcomes copied verbatim from the 7 current case studies and rewrites `aboutPageCustomization.test.tsx` (~48–49). **D8:** public disclosure of the anonymised case studies (including "14+ Middle East government entities") is approved; still no client names or logos.

## 3.6 Account, pricing, billing, credits, history, profile
| Item | Status in codebase |
|---|---|
| Auth | **Exists** — Google OAuth, Microsoft SSO, email/password, instant Demo Mode, offline vault session (for admins). Sign-in is **optional** for tools; required only for AI blueprint generation (see tool 6). |
| Profile | Basic profile record (name, email, avatar, role `user`/`admin`, tier `free`/`pro`/`enterprise`). Navbar shows first name or "Architect". |
| Dashboard / Workspace | **User Workspace drawer** — saves a user's blueprints/work (`user_workspaces`, `blueprints`, `generated_images` tables). No standalone `/dashboard` route. |
| Pricing page | **None.** Tools are free ("Zero-Cost Technical Architecture", "Zero Costing Assessment"). |
| Billing / Credits | **None.** |
| History | Saved blueprints/images per signed-in user via workspace; no `/history` route. |
| Monetisation | Advisory engagements via **Book Briefing** (lead goes to `briefing_requests` + CRM leads). |

---

# 4. INTERNAL TOOLS INVENTORY (6 tools — complete)

All 6 are listed on `/tools`, free, run mostly **in the browser** (client-side calculation), and export professional deliverables. Common thread: *"Zero-Cost Technical Architecture"* — no commercial pricing is calculated; outputs are technical.

## Tool 1 — Multi-Cloud Node & Usable Storage Policy Estimator
- **Route:** `/tools/sizing`
- **Hub title:** Multi-Cloud Node & Storage Sizing Estimator · *Decoupled Storage & Usable Policy Optimizer* · Badge: Compute & Storage
- **Category:** Infrastructure sizing / calculator
- **1-line:** Computes how many bare-metal hosts you need on AVS, VMC, GCVE or NC2 and how much hosts you save by moving data to external NFS storage.
- **Detailed:** Models true bare-metal host density across hyperscalers using real SKU specs. Applies enterprise RAID/FTT storage policies and a default **25% vSAN operational slack factor** to compute net usable capacity. Shows the node reduction gained by decoupling storage to Azure NetApp Files or Amazon FSx for NetApp ONTAP.
- **Input:** Total vCPU/RAM/storage (TB), target cloud and node SKU, storage policy (RAID/FTT), slack factor, effective vSAN %, optional external NFS offload.
- **Output:** Node count, usable vs raw capacity, with/without external-storage comparison, **styled Excel export** (`Export Styled Excel`), one-click hand-off to Tool 6 (`Send to Blueprint Generator`).
- **Technology:** Pure client-side TypeScript calculators (`architectureCalculator`, `storageCalculator`); `xlsx` for export. No external API.
- **SKUs covered:** Nutanix NC2 on Azure — AN36, AN64, AN100 · Azure AVS — AV36P, AV36, AV48, AV52, AV64 · VMC on AWS — i4i.metal, i3en.metal, m7i.metal-24xl · GCVE — ve1-standard-72, ve2-standard-128. External storage: ANF, Amazon FSx ONTAP.
- **USP:** Four platforms in one view, with the external-NFS "node reduction" insight that directly lowers hyperscaler spend.
- **UI flow:** 1) Pick cloud/SKU card (4 clouds) → 2) Enter workload size and storage policy/slack → 3) Review node + storage result and comparison → 4) Export Excel or send to Blueprint Generator.

## Tool 2 — RVTools Ingestion, Sizing & Migration Wave Planner
- **Route:** `/tools/rvtools-analyzer`
- **Hub title:** RVTools Ingestion & Migration Readiness Engine · *Client-Side Excel Parser & HCX Path Classifier* · Badge: Workload Discovery
- **Category:** Discovery / migration readiness
- **1-line:** Drag-and-drop a VMware RVTools export and instantly get a Migration Readiness Score and per-VM HCX method.
- **Detailed:** Parses multi-sheet RVTools workbooks (vInfo, vDisk, vMemory, vNetwork, vTools) entirely in the browser. Deep-scans for blockers — physical-mode RDMs, multi-writer shared disks, legacy hardware versions (target needs HW 14+), missing/outdated VMware Tools, and stale snapshots (>24h or >20 GiB). Classifies each VM into HCX RAV (live vMotion), HCX Bulk, or HCX Cold and sequences dependency-aware waves.
- **Input:** RVTools `.xlsx`/`.xls` upload (or built-in sample / downloadable sample file).
- **Output:** Overall readiness score (0–100%), per-VM readiness, recommended migration method, remediation actions, HCX impact notes, wave schedule, pre-migration snapshot & driver checklist, usable-storage sizing, **Excel technical assessment** (`Export .xlsx`).
- **Technology:** `xlsx` (SheetJS) parsing in-browser, `workloadAnalyzer` rules engine. **Data never leaves the browser.**
- **USP:** Privacy-safe (client-side), turns a raw RVTools dump into an actionable wave plan in seconds; explicit blocker detection (RDM-P, multi-writer, stale snapshots).
- **UI flow:** 1) Upload RVTools file (or load sample) → 2) Review summary cards (blockers, RDMs, snapshots) → 3) Filter/search VM table by method (RAV/Bulk/Cold) → 4) Configure target RAID/FTT and buffer → 5) Export Excel / view wave schedule.

## Tool 3 — Nutanix NC2 on Azure Migration Assessment Engine
- **Route:** `/tools/nutanix-nc2-assessment`
- **Hub title:** Nutanix NC2 on Azure Migration Assessment Engine · *Dedicated AHV Compatibility, Move Pipeline & Azure Node Sizing* · Badge: Dedicated NC2 Assessment
- **Category:** Migration assessment / sizing
- **1-line:** Assesses moving VMware vSphere workloads to Nutanix Cloud Clusters (NC2) on Azure bare metal.
- **Detailed:** Ingests RVTools inventory, inspects guest OS and disk controllers for AHV compatibility, flags VMs needing **VirtIO driver injection**, sizes Azure bare-metal clusters (AN36, AN36P, AN64, AN100) with Distributed Storage Fabric usable capacity under **RF2/RF3**, and sequences **Nutanix Move** migration waves. Supports overcommit ratios from 1:1 (dedicated SAP/Oracle) upward.
- **Input:** RVTools `.xlsx/.csv/.xls` (or one-click sample of **148 realistic enterprise VMs**), sizing parameters.
- **Output:** Executive summary, NC2 node/DSF sizing, AHV & Move compatibility categories, wave plan, VM inventory table, exportable report.
- **Technology:** Client-side `nutanixAssessmentService`, `xlsx` parsing. No external API.
- **USP:** One of very few free dedicated VMware→NC2-on-Azure assessors; automatic VirtIO/controller translation analysis.
- **UI flow (5 tabs):** Executive Summary → NC2 on Azure Sizing & DSF Storage → AHV Hypervisor & Move Compatibility → Nutanix Move Wave Planner → VM Inventory & Attributes.

## Tool 4 — Aria Operations for Networks (vRNI) Data Engine
- **Route:** `/tools/aria-networks`
- **Hub title:** Aria Operations for Networks (vRNI) Data Engine · *Flow Discovery, Application Tiers & NSX DFW Matrix* · Badge: Flow Analytics & Security
- **Category:** Network flow analytics / security planning
- **1-line:** Turns observed IPFIX network flows into application tiers, NSX Distributed Firewall rules and migration waves.
- **Detailed:** Eliminates migration blind spots by mapping multi-tier dependencies (Web → App → DB) from flow data, generating zero-trust NSX DFW rule matrices, and producing color-coded wave-execution spreadsheets. Includes an explainer of the IPFIX telemetry fabric (VDS IPFIX collector → Aria analytics platform).
- **Input:** One-click sample (3-tier banking & ERP topology) or upload of Aria export **`.json` or `.csv`** (app inventory or DFW rules).
- **Output:** Application tier map, NSX DFW rule matrix, migration waves (state also kept in local storage), color-coded Excel wave sheet.
- **Technology:** Client-side `AriaNetworkDeepDiveSection`, wave calculator; sample data from `sampleRvToolsData`. No external API.
- **USP:** Bridges network security and migration planning — shows "what talks to what" before cutover so nothing breaks.
- **UI flow:** 1) Load sample or upload file → 2) View flow-discovery & app tiers → 3) Review DFW microsegmentation rules → 4) Generate/export migration waves → 5) Jump to connected tools (RVTools, Sizing, DR, Blueprint).

## Tool 5 — Disaster Recovery Multi-Engine RPO/RTO & WAN Planner
- **Route:** `/tools/dr-planner`
- **Hub title:** Disaster Recovery RPO/RTO & WAN Replication Calculator · *vSphere Replication & SRM Protection Group Sizing* · Badge: Disaster Recovery
- **Category:** DR planning / calculator
- **1-line:** Quantifies WAN bandwidth, standby footprint and recovery time for four DR engines.
- **Detailed:** Compares **VMware SRM + vSphere Replication**, **HPE Zerto CDP**, **JetStream DR (cloud object storage)** and **Veeam Recovery Orchestrator**. Models RPO windows from 15 minutes to 24 hours, delta-sync bandwidth, Hot Standby vs Pilot Light vs Cold Object Storage footprints, CDP journal retention, failover network mode (NSX-T stretched L2 / zero re-IP vs routed re-IP), and an RTO phase timeline.
- **Input:** Protected inventory size, change rate, target RPO, WAN circuit Mbps, DR engine, deployment strategy, failover network.
- **Output:** Effective RPO, required vs configured bandwidth (adequate / undersized warning), estimated RTO, RTO phase breakdown, standby host footprint; **Excel export** and **formal branded 2-page executive PDF**.
- **Technology:** Client-side math; `xlsx` and `jsPDF` for exports. No external API.
- **USP:** Vendor-neutral side-by-side of four DR engines with SLA pass/fail on WAN adequacy, and a board-ready PDF.
- **UI flow:** 1) Choose DR engine → 2) Enter protected inventory & RPO → 3) Set WAN, standby model, failover network → 4) Read RPO/RTO/bandwidth verdict → 5) Export Excel or PDF.

## Tool 6 — Automated Hybrid Blueprint Generator (flagship)
- **Route:** `/tools/design-generator`
- **Hub title:** Automated Hybrid Blueprint Generator · *Dynamic BOM Deliverable & Architecture Exporter* · Badge: Architecture Engine
- **Category:** Architecture design / document & image generation (AI-assisted)
- **1-line:** Turns sizing inputs or an RVTools assessment into a verified bill of materials, multi-tier architecture diagram and advisory dossier.
- **Detailed:** A **5-step enterprise wizard** produces visual multi-panel topology cards (on-prem → transit → landing zone → security → target & DR) with an SLA footer (e.g., "DR SLA: 15-min RPO | 60-min RTO"). Optionally calls Google Gemini to render an AI "cloud 3D blueprint" image. Deliverables are presentation-ready and watermarked with the brand.
- **Templates (5):** VMware → AVS · VMware → NC2 on Azure · Nutanix → NC2 on Azure · VMware → GCVE · VMware → VMC on AWS.
- **Input:** Customer name, objective/strategy, source infrastructure, landing-zone & VDI choices, security (NVA/WAF/perimeter), target SDDC sizing, DR RPO/RTO; can import from Tools 1/2.
- **Output:** Topology blueprint, **BOM Excel** (`<Customer>_Cloud_Architecture_BOM.xlsx`), **4K PNG/JPEG export**, **Blueprint JSON**, shareable save-link, executive summary / dossier, AI-generated blueprint image (downloadable), Google Drive workspace sync.
- **Technology:** React wizard + client calculators; `xlsx`, `jszip`, `jsPDF`; **Google Gemini image model** via server route `/api/generate-blueprint` (model `gemini-3.1-flash-image`); Supabase for saved blueprints/feature controls.
- **Access rule:** AI blueprint generation is controlled by admin setting `blueprintAccessMode` = `everyone` / `signed_in` (default) / `nobody`, enforced server-side.
- **USP:** One tool that outputs the whole consulting deliverable pack, including AI imagery, from the same data used by the other tools.
- **UI flow:** Step 1 Objective (Strategy & Scope) → Step 2 Source (On-Prem Inventory) → Step 3 Landing Zone (Cloud Foundation & VDI) → Step 4 Security (NVA & Perimeter) → Step 5 Target & DR (SDDC Sizing & Runbooks) → Generate → Export (BOM / 4K / JSON / AI image / Drive).

### Tool pipeline (how tools connect)
`RVTools Analyzer → Sizing Estimator → Aria Networks (flows/DFW) → DR Planner → Blueprint Generator`. The Sizing page has "Send to Blueprint Generator"; the Aria page has a "Connected Architecture Workbenches" banner linking all tools.

---

# 5. CONTENT LIBRARY (all published content)

## 5.1 Architecture services (6 cards on site)
Azure VMware Solution (AVS) · Google Cloud VMware Engine (GCVE) · VMware Cloud on AWS (VMC) · VMware Cloud Foundation (VCF 5.x) sovereign cloud · NSX-T & Software-Defined Networking · VMware HCX Mobility & Aria Suite.

## 5.2 Interactive reference diagrams (4)
1. Azure VMware Solution Hub-Spoke & ExpressRoute FastPath — enterprise zero-downtime cutover and external NetApp storage decoupling
2. VMware Cloud on AWS Multi-AZ Stretched Cluster — 99.99% availability with Connected VPC 25 Gbps ENI cross-linking
3. Zero-Trust NSX-T Distributed Firewall & Gateway Segmentation — kernel-level east-west isolation, Avi load balancing, Tier-0/Tier-1 routing
4. GCVE & Private Services Access — BigQuery / Vertex AI data pipelines

(Plus ~150 KB of hotspot data: clickable component hotspots on each diagram, and Nutanix NC2 / layered-architecture showcases.)

## 5.3 Video masterclasses — NOT AVAILABLE YET (founder decision D9, 10 Nov 2026)
The 4 videos do not exist yet; the founder will create and add them later. Default data is `videos: []`. **Do not promote, link to, or describe videos as existing** (site copy, `llms*.txt`, JSON-LD, LinkedIn, YouTube, AI-video prompts) until they are published. Planned working titles, internal planning only (from v1):
1. Zero-Downtime HCX Migration: Bulk vs Replication-Assisted vMotion (RAV)
2. Azure NetApp Files (ANF) Datastores for AVS: Cost & IOPS Architecture
3. NSX-T Distributed Firewall: Enterprise Microsegmentation Masterclass
4. Google Cloud VMware Engine (GCVE): Private Services Access & Analytics

## 5.4 Step-by-step tutorials (5)
1. Azure VMware Solution ExpressRoute FastPath & Global Reach Architecture
2. HCX Network Extension & L2 Broadcast Domain Troubleshooting Runbook
3. NSX-T Microsegmentation: Implementing Zero-Trust East-West Security in Production
4. Architecting Elastic External NFS Datastores on VMC with Amazon FSx for NetApp ONTAP
5. Building a Low-Latency Analytics Pipeline from GCVE Databases to Google BigQuery

## 5.5 Knowledge Base articles (14 = 8 core + 6 Nutanix)
| ID | Topic |
|---|---|
| KB-AVS-8921 | ExpressRoute FastPath BGP route flapping & MTU 1500/9000 fragmentation (Cisco ASR ↔ AVS T0) |
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

*All 14 live inside the single `/resources/kb` page — they do not yet have individual URLs (growth opportunity: SEO Master P4-02).*

Also: a downloadable **migration runbooks** dataset (HCX cutover for AVS / VMC / GCVE) and a **Cloud Compatibility Catalogue** and **Security Architecture Catalogue** powering the wizard.

---

# 6. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Motion (animation), lucide-react icons |
| Rendering model | **Client-side SPA + build-time prerender.** `npm run build` = `vite build && node scripts/prerender.mjs`. The prerender step writes `dist/<route>/index.html` for all 30 manifest routes (own title, description, canonical, OG/Twitter, JSON-LD, H1 + static body; full article body for the 7 case studies) and regenerates `sitemap.xml` and `llms-full.txt`. React then mounts with `createRoot` (static body is replaced on load). |
| Backend / API | Vercel serverless functions in `/api`: `generate-blueprint`, `generate-proposal`, `health`, `settings`, `site-content`. Dev-time Vite middleware mirrors `/api/generate-blueprint`. |
| Database / Auth | **Supabase** (PostgreSQL with Row-Level Security; Supabase Auth with PKCE). Tables: profiles, admins, app_settings, admin_feature_controls, site_content, seo_metadata, briefing_requests, crm_leads, blueprints, generated_images, user_workspaces, audit_logs, admin_notifications. |
| Auth providers | Google OAuth, Microsoft SSO, email/password, demo mode, offline-vault admin session. A Firebase config is also present in the repo (AI Studio applet origin). |
| AI | Google Gemini via `@google/genai` (server-side key `GEMINI_API_KEY`); image model `gemini-3.1-flash-image` for blueprints |
| Exports | `xlsx` (Excel), `jsPDF` (PDF), `jszip` (ZIP dossiers) |
| Hosting | **Vercel** (`vercel.json`: SPA rewrite + security headers — founder-confirmed present and working in the real repo; it was only missing from the audit zip). Legacy alias `zaboraa-12.vercel.app` redirects to zaboraa.com. Origin project built in Google AI Studio. |
| PWA / offline | Web manifest, install prompt, offline vault + reconciliation for admins |
| Analytics | Google Analytics via `VITE_GA_MEASUREMENT_ID` |
| Dev server | `package.json` `dev` = `vite --port=3000 --host=0.0.0.0` (**port 3000 — clashes with the separate Zabura FX project; run Zaboraa on 3001**, see SEO Master P0-02) |
| Testing | Vitest (admin, calculations, routing, offline vault, auth, wizard suites) |
| Security headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo off) |
| Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `FIREBASE_API_KEY`, `VITE_GA_MEASUREMENT_ID` |

---

# 7. USER JOURNEY & PERSONAS

*[DERIVED from page content and tool design; the code contains no explicit persona document.]*

## 7.1 Target personas
| Persona | Who | Pain | How they use Zaboraa |
|---|---|---|---|
| **Enterprise Infrastructure / Cloud Architect** | VMware engineer planning AVS/GCVE/VMC move | Needs fast, defensible sizing & wave plans | Uploads RVTools → Sizing → Blueprint; reads KB and runbooks |
| **CIO / Head of Infrastructure** | Executive in bank, hospital, logistics, other regulated sector | Fear of downtime, cost overruns, compliance | Reads case studies and hero proof points; books a briefing |
| **Migration / Project Lead** | Runs cutover programs | Sequencing waves, dependency blind spots | RVTools wave planner, Aria flow discovery, roadmap |
| **Security / Network Architect** | NSX / zero-trust owner | Safely moving to microsegmentation | Aria DFW matrix, NSX discipline page, KB-NSX-6501 |
| **DR / Resilience Lead** | Owns RPO/RTO commitments | Proving SLAs and bandwidth | DR Planner, SRM discipline, PDF report |
| **Nutanix / VMware-licensing-exit evaluator** | Considering VMware → Nutanix NC2 | Compatibility and sizing unknowns | NC2 Assessment tool |
| **Pre-sales / Consulting partner** | Builds client proposals | Needs polished deliverables fast | Blueprint Generator BOM / 4K diagrams |

## 7.2 Typical journey
1. **Discover** — search/LinkedIn/YouTube → landing on `/`, a KB article or a tutorial (videos: coming soon, D9).
2. **Trust** — hero stats, certifications, 7 anonymised case studies, interactive diagrams.
3. **Try (free, no sign-up)** — Workbench tools at `/tools`.
4. **Deepen** — save blueprints / AI images (sign in with Google/Microsoft).
5. **Convert** — **Book Briefing / Book Call** → briefing request stored in CRM.
6. **Engage** — founder-led advisory.

---

# 8. SEO & CONTENT KEYWORDS

**Important:** the code contains **no explicit keyword list** (an admin SEO panel exists but its data is empty in this repo). The list below is **[DERIVED]** from the site's titles, meta, headings and page content. The site's canonical URL is `https://zaboraa.com/`.

## 8.1 Meta
Per-route titles/descriptions are now defined in **`src/seo/routes.ts` (`ROUTE_MANIFEST`, 30 entries)** and injected at build by `scripts/prerender.mjs`. The `index.html` values are only the fallback template.
- **Home title:** Zaboraa - Enterprise VMware Cloud Architecture
- **Home description (routes.ts):** Enterprise VMware cloud architecture, AVS, GCVE, and VMC migrations by Wasim Sayyed. Free browser-based tools: RVTools Analyzer, AVS Sizing, NC2 Assessment.
- **Canonical:** `https://zaboraa.com/` (apex). Full detail and status: `ZABORAA-SEO-MASTER-V2.md` §8, §11.

## 8.2 Primary keywords
VMware cloud migration · Azure VMware Solution (AVS) · Google Cloud VMware Engine (GCVE) · VMware Cloud on AWS (VMC) · hyperscaler migration · VMware HCX migration · zero-downtime migration · NSX-T microsegmentation · VMware Site Recovery Manager (SRM) · VMware Cloud Foundation (VCF) · Nutanix NC2 on Azure

## 8.3 Secondary / long-tail
RVTools analyzer · RVTools migration readiness · AVS node sizing calculator · VMC node sizing · GCVE sizing · Azure NetApp Files for AVS · Amazon FSx for NetApp ONTAP VMC · external NFS datastore · ExpressRoute FastPath · Global Reach · HCX Network Extension · HCX Mobility Optimized Networking (MON) · HCX Replication-Assisted vMotion (RAV) · HCX Bulk migration · NSX-V to NSX-T migration · NSX Distributed Firewall rules · Aria Operations for Networks (vRNI) · IPFIX flow discovery · VMware DR planner · RPO RTO calculator · vSphere Replication bandwidth · Zerto vs SRM · JetStream DR · Veeam Recovery Orchestrator · Nutanix Move · AHV VirtIO driver injection · VMware to Nutanix migration · Private Services Access GCVE · GCVE BigQuery Vertex AI · Connected VPC ENI · multi-AZ stretched cluster · sovereign private cloud · VCF 5.x SDDC Manager · cloud migration roadmap · hybrid cloud blueprint generator · cloud architecture bill of materials.

## 8.4 Brand & authority terms
Zaboraa · Wasim Sayyed · Principal VMware Architect · VCAP-DCV Design 2023 · VCP-NV 2023 · VCP-DCV 2023 · VMware Cloud Foundation Specialist 2023 · Master Specialist VMware Cloud on AWS 2023 · NCP-CI-Azure 6.10 *(Azure Solutions Architect Expert and Google Cloud Professional Cloud Architect removed — not in code; re-add only if the founder confirms them)*.

## 8.5 Audience-intent phrases
"enterprise VMware migration consultant", "VMware exit strategy", "core banking cloud migration", "healthcare zero-trust microsegmentation", "free cloud sizing tools", "VMware architecture reference diagrams", "VMware troubleshooting runbooks".

## 8.6 SEO note (v2)
The site is still a client-side React app, but every route is **prerendered to static HTML at build** with its own head tags and an H1 + body, so non-JS crawlers see real content on all 30 URLs. Non-case-study routes currently carry only an H1 and one summary paragraph (thin) — enrichment is planned in SEO Master P4-01. For marketing and AI-video use, rely on **this file** and `/llms-full.txt`.

---

# 9. MARKETING-READY FACT SHEET (v2.1 — founder decisions D1–D9 applied)

**Approved claims — use these (stated in code or decided by the founder):**
- **13+ years** enterprise infrastructure (D1) · **25+** hyperscaler migrations executed (D2) · **6** verified certifications (D3 — the 6 listed in §2) · **100% Runbook-Driven Cutovers** (D5) · founder title **Principal VMware Architect** (D4) · brand name **Zaboraa** (D7).
- 6 free engineering tools (client-side, no login) · 8 architecture disciplines · 7 anonymised case studies · 5 step-by-step tutorials · 14 knowledge-base articles · 6-phase roadmap · works on AVS, VMC, GCVE and Nutanix NC2 on Azure.
- Case-study facts exactly as in §3.5 (e.g. "14+ Middle East government entities", "RPO 5–15 min / RTO 1–2 hr", "50–100 VMs average, up to 300"). Public disclosure of the anonymised case studies is **approved (D8)**; no client names or logos.
- /about outcomes (D6) = the latest outcomes taken from the 7 case studies — never the legacy figures.

**Retired — must NOT appear anywhere (code, `llms*.txt`, JSON-LD, posts, video scripts):**
| Retired claim | Why | Replaced by |
|---|---|---|
| "12+ years" | D1 | 13+ years |
| "40+ migrations" | D2 | 25+ migrations |
| "8× certifications" | D3 — only 6 exist | 6 certifications |
| "Principal Cloud Architect" | D4 | Principal VMware Architect |
| "100% zero-downtime (cutover record)" | D5 | 100% Runbook-Driven Cutovers |
| 1,240 VMs / 4,500 workloads / 820 VMs / 38% TCO / 24% Capex / $1.4M per year | D6 — legacy case studies | latest outcomes from the 7 case studies |
| "Zaboraa Technologies" | D7 | Zaboraa |

**Not available yet:** video masterclasses (D9) — do not mention them as existing.

**Do NOT claim:** pricing/plans/credits, a mobile app, consumer AI video/image tools, named clients/logos, videos, or that RVTools / DR / Sizing data is stored server-side (those tools run client-side).

**Brand do's:** dark, cyan-accent, technical/executive voice, evidence-first proof, "runbook-driven", "minimal downtime", "zero business-hour downtime" (phrase used in code).
**Brand don'ts:** playful slang, stock "AI magic" language, consumer-app framing, any "100% zero-downtime" superlative.

## 9.1 Content Agent Invariants & Guardrails (Phase 2a & 2b)
- **Model Grounding:** Vertex AI `gemini-3.7-flash` (GA v1 endpoint, location `global` via `aiplatform.googleapis.com`). Fail-closed rejection of `gemini-4-argon`.
- **System Instructions:** Strictly limited to approved facts. Zero numeric claims (no "13+ years", "25+ migrations", "6 certs", "500 TB", etc. inside AI-generated post copy).
- **Post Structure:** Hook ($\ge 6$ words, no URL, no #, no "I") + $\ge 2$ paragraph breaks (`\n\n`) + single CTA line + space-separated hashtags as final line (max 7 tags, min 3 tags).
- **Emoji Policy:** Zero emojis anywhere in the post (`\p{Emoji_Presentation}` / `\p{Extended_Pictographic}` rejected).
- **Length Bounds:** 300 to 3,000 characters total.
- **Workflow:** Manual copy-paste to real LinkedIn Company page (`/company/145341200/`). Zero automated posting. Write-order: Supabase DB first, audit log second, local state last. Single authoritative admin: `congodb1@gmail.com`.

---

# 10. GAPS THE FOUNDER MUST SUPPLY (so this file becomes 100% complete)
1. Mission and vision statement (official wording).
2. Founder origin story and personal "why"; official bio text (v1 bio no longer in code).
3. ~~Decisions D1–D9~~ — **answered by the founder on 10 Nov 2026** (SEO Master §19.2). Still open: the 4 video masterclasses themselves (D9) and the founder-approved OG image + logo files (`docs/founder-assets/`).
4. Real client names/logos permitted for marketing (case studies are anonymised by policy).
5. Social handles and video channel links (only LinkedIn company `145341200` and founder LinkedIn are known).
6. Official keyword / SEO target list confirmation (derived list in §8).
7. Preferred voice-over tone, music style and video-length conventions.
8. Whether pricing / engagement packages should ever be mentioned.
