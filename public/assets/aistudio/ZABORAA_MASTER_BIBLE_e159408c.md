# ZABORAA MASTER BIBLE
**Single source of truth for Zaboraa Technologies — for AI video, content and marketing prompts**

> **READ THIS FIRST (accuracy note for any AI using this file).**
> Zaboraa is **NOT** a consumer AI-tools platform. It is a **founder-led enterprise VMware / hyperscaler cloud-architecture advisory** with a free **engineering workbench of 6 calculators/assessment tools**. There is **no pricing page, no credits system, no billing and no generation history** in the codebase. Do not invent them.
> Facts below come from the codebase (React/Vite repo, extracted 2026-11-02) and the live HTML shell at zaboraa.com. Anything marked **[NOT IN CODEBASE]** was not found and must be supplied by the founder before being used in marketing. Anything marked **[DERIVED]** is a reasoned summary of the code, not a quote from the site.

---

# 1. COMPANY IDENTITY

## 1.1 Core facts
| Field | Value |
|---|---|
| Legal/brand name | **Zaboraa Technologies** (short brand: **Zaboraa**) |
| Domain | **zaboraa.com** (canonical; `www` and the legacy alias `zaboraa-12.vercel.app` redirect to `https://zaboraa.com`) |
| Site `<title>` | Zaboraa Technologies - Enterprise VMware Cloud Architecture |
| Industry | Enterprise cloud architecture, VMware private cloud, hyperscaler migration, disaster recovery, network security |
| Business model | Founder-led advisory (briefing/consultation booking) + free interactive engineering tools used as lead-generation and credibility |
| Primary CTA | **Book Briefing** / **Book Call** (opens a "Schedule Briefing" modal) |
| Secondary CTA | **Explore Workbench Tools** (`/tools`) |
| Contact email (in code) | wasim@zaboraa.com |
| Contact phone (in code) | +91 7497624807 |
| Location (in code) | Pune & Global Advisory |

## 1.2 One-line pitch
> Founder-led VMware cloud architecture, hyperscaler migration, interactive diagrams, video masterclasses and software tutorials across Azure AVS, AWS VMC and Google Cloud GCVE.
*(This is the site's own meta description.)*

## 1.3 Hero copy (verbatim from site data)
- **Eyebrow:** EXECUTIVE CLOUD ADVISORY · FOUNDER-LED
- **Headline:** Minimal Downtime VMware Cloud & Hyperscaler Migration Authority
- **Subheadline:** Architecting mission-critical enterprise cloud evacuations, sovereign VMware software-defined datacenters, and automated disaster recovery across Azure (AVS), AWS (VMC), and Google Cloud (GCVE).
- **Hero stats:** 12+ Years Enterprise Infrastructure · 40+ Hyperscaler Migrations Executed · 8× Verified Cloud Certifications · 100% Zero-Downtime Cutover Record

## 1.4 Long description [DERIVED from site content]
Zaboraa Technologies helps large enterprises (banks, hospitals, logistics and similar regulated, high-uptime organisations) move VMware-based datacenters to the cloud with minimal or zero downtime. It covers the full chain: discovering and sizing the on-premises estate, choosing and sizing the target platform (Azure VMware Solution, Google Cloud VMware Engine, VMware Cloud on AWS, or Nutanix NC2 on Azure), securing it with NSX-T zero-trust microsegmentation, migrating with VMware HCX, and protecting it with disaster-recovery orchestration (SRM and alternatives). Everything is backed by a deep library of reference architectures, runbooks, tutorials and videos, and a set of free browser-based tools that produce sizing, readiness, wave-plan, DR and bill-of-materials deliverables.

## 1.5 Tagline
- Default in-app logo subtitle: **"Enterprise VMware Architecture"** (editable by admin as `brandTagline`).
- Watermark text stamped on exported blueprints: **"ZABORAA · HYBRID CLOUD BLUEPRINT"**.
- Default PDF/export classification: **"CONFIDENTIAL // ARCHITECTURAL ASSESSMENT"**.

## 1.6 Mission & vision
**[NOT IN CODEBASE]** — no explicit mission statement exists. Closest stated positioning: *"Minimal downtime VMware cloud & hyperscaler migration authority"* and *"100% zero-downtime cutover track record."* The founder should supply an official mission line.

## 1.7 Brand voice & tone [DERIVED]
- **Authoritative, technical, executive-level.** Speaks to CIOs, infrastructure architects and migration leads.
- Vocabulary: "zero-downtime cutover", "evacuation", "sovereign", "zero-trust", "mission-critical", "Tier-0", "wave planning", "zero-costing technical assessment".
- Proof-driven: leans on numbers (VM counts, downtime hours, TCO reduction, certifications).
- Serious, calm, engineering-precise; no hype, no emojis, no consumer-style slang.
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
| Title | **Founder & Principal Cloud Architect** |
| Page label | "Principal Architectural Desk" / "About Principal Architect" |
| Location | Pune & Global Advisory |
| Portrait asset | `/assets/images/Wasim-Pic-02.png` (circular, "Verified Principal VMware Architect" tick badge) |

**Official bio (verbatim from code):**
> Architecting high-consequence enterprise cloud evacuations and sovereign VMware environments across Azure VMware Solution (AVS), Google Cloud VMware Engine (GCVE), VMware Cloud on AWS (VMC), and NSX-T SDN with a 100% zero-downtime cutover track record.

**Certifications (6 listed in the About page data):**
1. VCAP-DCV Design & Deploy
2. VMC on AWS Master Specialist
3. VMware Cloud Foundation (VCF) Specialist
4. Azure Solutions Architect Expert
5. Google Cloud Professional Cloud Architect
6. NSX-T Advanced Network Security
*(The hero says "8× Verified Cloud Certifications"; only 6 are itemised. Reconcile before publishing.)*

**About-page headline:** "Enterprise Cloud Architecture & Advisory"

**Advisory specializations shown on /about:**
| Pillar | Description |
|---|---|
| Hyperscaler Procurement & Sizing | Prevent cluster over-provisioning through decoupled external NFS storage (ANF / FSx ONTAP) |
| HCX Zero-Downtime Migration | Production wave sequencing, Network Extension L2 stretching, MON traffic routing |
| NSX-T Microsegmentation | Zero-trust DFW rule discovery via Aria Operations for Networks before cutover |
| Disaster Recovery Validation | SRM non-disruptive failover testing, RTO sequencing, WAN delta modeling |

**Founder story / why Zaboraa was built / personal vision:** **[NOT IN CODEBASE]** — the repo contains only the professional bio above. For video scripts, the founder must provide: origin story, motivation, vision statement, personal photo/video preferences.

---

# 3. COMPLETE SITE MAP (every route, section, CTA)

The site is a single-page React app (client-side routing). **All public pages and all tools are open to anonymous visitors** (`publicAccessEnabled: true`, `authRequiredForTools: false`). Only the admin console is protected.

## 3.1 Public routes
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
| `/resources` | **Resources hub** (tabs: All / Nutanix Architecture / KB / Tutorials / Videos) | Knowledge base, tutorials, video masterclasses |
| `/resources/:tab` | Direct tab links: `/resources/kb`, `/resources/tutorials`, `/resources/videos` | Same page, tab preselected |
| `/case-studies` | **Case Studies** | 3 case studies (section 3.5) |
| `/about` | **About Principal Architect** | Founder profile (section 2) |
| `*` (any unknown URL) | Falls back to the Homepage | — |

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

## 3.5 Case studies (3)
| Sector | Title | VMs | Downtime | Business result | Timeline |
|---|---|---|---|---|---|
| Tier-1 Banking Institution | Multi-Petabyte Core Banking Evacuation to Azure VMware Solution (AVS) — Oracle RAC, SWIFT gateways, strict regulatory scrutiny | 1,240 | 0 Hours | 38% TCO reduction | 90 Days |
| Healthcare Network (18 hospitals) | In-Place NSX-V to NSX-T Migration & Zero-Trust Microsegmentation — 4,500 patient EHR workloads and biomedical telemetry | 4,500 | 0 Min | 24% Capex reduction | 60 Days |
| Global Freight & Supply Chain | Multi-AZ VMC on AWS Stretched Cluster & Real-Time Fleet Tracking — 15M daily IoT geolocation events | 820 | 99.999% availability | $1.4M / year saved | 45 Days |

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

## 5.3 Video masterclasses (4)
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

## 5.5 Knowledge Base articles (8)
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

Also: a downloadable **migration runbooks** dataset (HCX cutover for AVS / VMC / GCVE) and a **Cloud Compatibility Catalogue** and **Security Architecture Catalogue** powering the wizard.

---

# 6. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Motion (animation), lucide-react icons |
| Rendering model | **Client-side SPA** (CSR). The raw HTML contains an empty `<div id="root">`; all content appears only after JavaScript runs. *(Important for SEO and for AI crawlers — they see an almost empty page.)* |
| Backend / API | Vercel serverless functions in `/api`: `generate-blueprint`, `generate-proposal`, `health`, `settings`, `site-content`. Dev-time Vite middleware mirrors `/api/generate-blueprint`. |
| Database / Auth | **Supabase** (PostgreSQL with Row-Level Security; Supabase Auth with PKCE). Tables: profiles, admins, app_settings, admin_feature_controls, site_content, seo_metadata, briefing_requests, crm_leads, blueprints, generated_images, user_workspaces, audit_logs, admin_notifications. |
| Auth providers | Google OAuth, Microsoft SSO, email/password, demo mode, offline-vault admin session. A Firebase config is also present in the repo (AI Studio applet origin). |
| AI | Google Gemini via `@google/genai` (server-side key `GEMINI_API_KEY`); image model `gemini-3.1-flash-image` for blueprints |
| Exports | `xlsx` (Excel), `jsPDF` (PDF), `jszip` (ZIP dossiers) |
| Hosting | **Vercel** (`vercel.json`: SPA rewrite + security headers). Legacy alias `zaboraa-12.vercel.app` redirects to zaboraa.com. Origin project built in Google AI Studio. |
| PWA / offline | Web manifest, install prompt, offline vault + reconciliation for admins |
| Analytics | Google Analytics via `VITE_GA_MEASUREMENT_ID` |
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
1. **Discover** — search/LinkedIn/YouTube → landing on `/`, a KB article, a tutorial or a video.
2. **Trust** — hero stats, certifications, 3 case studies, interactive diagrams.
3. **Try (free, no sign-up)** — Workbench tools at `/tools`.
4. **Deepen** — save blueprints / AI images (sign in with Google/Microsoft).
5. **Convert** — **Book Briefing / Book Call** → briefing request stored in CRM.
6. **Engage** — founder-led advisory.

---

# 8. SEO & CONTENT KEYWORDS

**Important:** the code contains **no explicit keyword list** (an admin SEO panel exists but its data is empty in this repo). The list below is **[DERIVED]** from the site's titles, meta, headings and page content. The site's canonical URL is `https://zaboraa.com/`.

## 8.1 Meta
- **Title:** Zaboraa Technologies - Enterprise VMware Cloud Architecture
- **Description:** Founder-led VMware cloud architecture, hyperscaler migration, interactive diagrams, video masterclasses, and software tutorials across Azure AVS, AWS VMC, and Google Cloud GCVE.

## 8.2 Primary keywords
VMware cloud migration · Azure VMware Solution (AVS) · Google Cloud VMware Engine (GCVE) · VMware Cloud on AWS (VMC) · hyperscaler migration · VMware HCX migration · zero-downtime migration · NSX-T microsegmentation · VMware Site Recovery Manager (SRM) · VMware Cloud Foundation (VCF) · Nutanix NC2 on Azure

## 8.3 Secondary / long-tail
RVTools analyzer · RVTools migration readiness · AVS node sizing calculator · VMC node sizing · GCVE sizing · Azure NetApp Files for AVS · Amazon FSx for NetApp ONTAP VMC · external NFS datastore · ExpressRoute FastPath · Global Reach · HCX Network Extension · HCX Mobility Optimized Networking (MON) · HCX Replication-Assisted vMotion (RAV) · HCX Bulk migration · NSX-V to NSX-T migration · NSX Distributed Firewall rules · Aria Operations for Networks (vRNI) · IPFIX flow discovery · VMware DR planner · RPO RTO calculator · vSphere Replication bandwidth · Zerto vs SRM · JetStream DR · Veeam Recovery Orchestrator · Nutanix Move · AHV VirtIO driver injection · VMware to Nutanix migration · Private Services Access GCVE · GCVE BigQuery Vertex AI · Connected VPC ENI · multi-AZ stretched cluster · sovereign private cloud · VCF 5.x SDDC Manager · cloud migration roadmap · hybrid cloud blueprint generator · cloud architecture bill of materials.

## 8.4 Brand & authority terms
Zaboraa · Zaboraa Technologies · Wasim Sayyed · Principal Cloud Architect · VCAP-DCV · VMC on AWS Master Specialist · Azure Solutions Architect Expert · Google Cloud Professional Cloud Architect.

## 8.5 Audience-intent phrases
"enterprise VMware migration consultant", "VMware exit strategy", "core banking cloud migration", "healthcare zero-trust microsegmentation", "free cloud sizing tools", "VMware architecture reference diagrams", "VMware troubleshooting runbooks".

## 8.6 SEO caution
Because the site is a client-side SPA with no server-side rendering, social/AI/search crawlers may see only the `<head>` metadata. For marketing and AI-video use, rely on **this file** rather than expecting crawlers to read the page body.

---

# 9. MARKETING-READY FACT SHEET (safe claims only)

**Use freely (stated on the site):** 12+ years enterprise infrastructure · 40+ hyperscaler migrations · 100% zero-downtime cutover record · 3 published case studies with the exact metrics in §3.5 · 6 free engineering tools · 8 architecture disciplines · 4 video masterclasses · 5 tutorials · 8 knowledge-base articles · works on AVS, VMC, GCVE and Nutanix NC2.

**Verify before use:** "8× certifications" vs 6 listed; case-study client identities are anonymised sectors, not named companies.

**Do NOT claim:** pricing/plans/credits, a mobile app, consumer AI video/image tools, or that data is stored server-side for the RVTools/DR/Sizing tools (they run client-side).

**Brand do's:** dark, cyan-accent, technical/executive voice, numbers-first proof, zero-downtime messaging.
**Brand don'ts:** playful slang, stock "AI magic" language, consumer-app framing.

---

# 10. GAPS THE FOUNDER MUST SUPPLY (so this file becomes 100% complete)
1. Mission and vision statement (official wording).
2. Founder origin story and personal "why".
3. Real client names/logos permitted for marketing (case studies are anonymised).
4. Final certification count (6 listed vs "8×" in hero).
5. Official keyword/SEO target list (admin SEO table is empty).
6. Social-media handles and video channel links (none in code).
7. Preferred voice-over tone, music style and video length conventions.
8. Whether pricing/engagement packages should ever be mentioned.
