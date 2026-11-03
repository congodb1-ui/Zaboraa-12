You are updating the zaboraa.com codebase (React 19, Vite, TypeScript, Tailwind 4, React Router 7, hosted on Vercel). This is PROMPT 3 of 3 (the final one). Do only the work described here.

## FIRST: INSPECT THE CODEBASE

Previous prompts already added: `src/data/caseStudies.ts`, a `CaseStudyPage` template, a `CaseDiagram` SVG component, routes `/case-studies` and `/case-studies/:slug`, `src/seo/routes.ts` (route manifest), `scripts/prerender.mjs`, per-route canonicals, and Case Studies 1-4 (`middle-east-gov-avs-framework`, `avs-to-avs-cross-region`, `gov-dr-failover-drills`, `private-gcve-vmc-migration`). Open these and REUSE them exactly. If any are missing, stop and report what is missing; do not rebuild earlier work and do not create CS1-CS4. Do not change the template design.

## GLOBAL RULES

1. Do not invent facts. Use only the Approved Fact Sheet below. If a detail is missing, omit the sentence. Never ship placeholder text such as "TBD" or "[confirm]". At the end, list every fact you omitted.
2. Anonymisation: never name a ministry, department, city, country, customer or IP address. Use "Middle East Government Entities". Every case study page shows the notice "This case study is anonymised and aggregated across multiple engagements."
3. Naming: company "Zaboraa" (never "Zaboraa Technologies"). Founder: Wasim Sayyed, Principal VMware Architect, 13 years VMware architecture, Pune, Maharashtra, India. Product names: "VMware Aria Operations for Networks (vRNI)", "Aria Operations", "Aria Automation (cloud templates, formerly blueprints)". Never write "Aria for Operations". Mention once per page that Broadcom has rebranded Aria under VCF Operations/Automation.
4. All URLs and filenames lowercase. Canonical host is the apex https://zaboraa.com.
5. Never claim: "100% zero-downtime", "40+ migrations", "audit passed", a specific per-entity VM count, a specific rule-reduction percentage, or that Zaboraa's free tools were "used" on engagements. Say "reproduce this step with the free tool".
6. Keep the existing visual identity (dark theme, cyan accent, executive technical tone, no emojis).

## APPROVED FACT SHEET

- Work: last 3 years, 80-90% Middle East Government Entities via Microsoft Partner, 14+ entities. Scale: 50-100 VMs per entity on average, up to 300.
- Workloads: SQL Server, SQL databases, Red Hat OpenShift clusters, Postgres clusters, Oracle clusters.
- Also delivered: NSX-T microsegmentation planning with Aria Operations for Networks (flow collection, application tiers, rule filtering, DFW implementation, validation); Aria Operations deployment; Aria Operations for Networks deployment for flow collection and wave planning; Aria Automation deployment (cloud templates, catalog per team, approvals, projects for team isolation).
- Tools in real work: RVTools, HCX, Azure NetApp Files, SRM, JetStream DR.

Accuracy corrections to bake in:
- NSX in AVS is Microsoft-managed. Describe segmentation as DFW policy planning and implementation (on-prem NSX or AVS NSX); never "deployed NSX-T on AVS".
- Do not mention DFW latency overhead or different DFW policies per VPN/ExpressRoute transport.
- Approvals, naming, tagging and lease policies live in Aria Automation, not Aria Operations. In Aria Automation 8, "blueprints" are called cloud templates.
- Do not claim a "single pane across 14 entities", or that Aria was used to measure DR RTO. Say "multi-vCenter government environments".
- Outcomes are qualitative only unless stated below.

---

## PART A: ADD THREE CASE STUDIES

Add each to `caseStudies.ts`, the route manifest, the hub cards and the prerender. Use the template sections: Engagement facts card, anonymisation notice, body sections, diagram, Lessons learned, "Reproduce this on your estate", 2 related case studies, related disciplines, FAQ (3 questions max 2 for CS6 and CS7 is fine), Book Briefing CTA. JSON-LD (TechArticle, BreadcrumbList, FAQPage) via the existing mechanism. datePublished and dateModified: 2026-11-03.

### CS5: NSX-T microsegmentation planned with Aria Operations for Networks
- slug: `nsxt-microsegmentation-aria-networks`
- metaTitle: `NSX-T Microsegmentation Planning with Aria Operations for Networks`
- metaDescription (max 155 chars): write one on flow-based firewall rule planning for government VMware estates.
- H1: `NSX-T Microsegmentation: Flow-Based Firewall Planning with Aria Operations for Networks`
- Sections: (1) Overview: government entities of 50-300 VMs, zero-trust and compliance expectation; (2) Problem: flat network, no flow visibility, manual rules are risky; (3) Challenges: no visibility of what talks to what across SQL, Postgres, OpenShift, Oracle; reIP breaking existing firewall rules; east-west heavy workloads (Oracle, OpenShift); stale and redundant rules; (4) Solution in 5 phases: Discovery (collectors, IPFIX on vDS, 7-14 days of flows); Planning (application tiers and groups from flows); Filtering (remove stale and redundant rules, group by tier); Implementation (export recommended rules, implement DFW, validate); Validation (flow verification after migration, allowed vs blocked); (5) Outcome: qualitative, "a significant share of stale and redundant rules removed", audit-ready documentation; (6) Lessons.
- Diagram: before (flat) to flow map to after (tiered groups with DFW rules). Sanitised.
- Reproduce: /tools/aria-networks. Related disciplines: /disciplines/nsx, /disciplines/aria.
- FAQ: How long should flows be collected before writing DFW rules? / How does reIP affect firewall rules? / Can flow data drive migration waves?
- Keywords: nsx-t microsegmentation aria, aria operations for networks planning, nsx dfw rule filtering, zero trust vmware government.

### CS6: Aria Operations and Aria Operations for Networks deployment
- slug: `aria-operations-networks-deployment`
- metaTitle: `Aria Operations and Aria for Networks Deployment: Capacity and Wave Planning`
- metaDescription (max 155 chars): write one on capacity planning and flow-based wave planning for multi-vCenter government environments.
- H1: `Aria Operations and Aria Operations for Networks for Multi-vCenter Government Environments`
- Sections: (1) Overview; (2) Problem: vCenter sprawl, no capacity planning, no network flow visibility, no team isolation; (3) Challenges: multi-vCenter monitoring; capacity planning for AVS host count and ANF storage before migration; wave planning from application dependencies; isolated access per team; (4) Solution: Aria Operations dashboards, capacity planning, alerting for SQL, Postgres, OpenShift; Aria Operations for Networks for flow collection, application discovery and wave planning (feeds CS5); integration to correlate VM metrics with network flows; (5) Outcome: qualitative only (better capacity forecasting, fewer surprises in waves); (6) Lessons.
- Diagram: vCenters to Aria Operations to dashboards; vDS IPFIX to Aria Operations for Networks to application tiers and waves.
- Reproduce: /tools/sizing, /tools/aria-networks, /tools/rvtools-analyzer. Related disciplines: /disciplines/aria.
- FAQ: What does Aria Operations add for AVS capacity planning? / How do network flows improve wave planning?
- Keywords: aria operations deployment, aria operations for networks deployment, vrops capacity planning avs.

### CS7: Aria Automation, cloud templates and multi-team isolation
- slug: `aria-automation-blueprints-vcenter`
- metaTitle: `Aria Automation Cloud Templates: VM Self-Service with Team Isolation`
- metaDescription (max 155 chars): write one on self-service VM provisioning, approvals and team isolation for government IT.
- H1: `Aria Automation for Multi-Team Government IT: Cloud Templates, Approvals and vCenter Isolation`
- Sections: (1) Overview: DB, application and OpenShift teams each need VMs while central IT keeps control; (2) Problem: manual VM creation, no approval, no tagging, no isolation; (3) Challenges: giving teams access without vCenter admin; template complexity (SQL Server, Postgres, OpenShift worker, Oracle, generic web/app); compliance (approvals, naming, tagging); Day 2 operations; (4) Solution: cloud templates per workload type; a catalog per team through project content sharing; approvals and policies (naming, tagging, lease) in Aria Automation; vCenter automation (create, customise, reIP handling, add to NSX security group, trigger backup); projects as department isolation (limits, folder, network); (5) Outcome: "faster, audited, consistent provisioning" (do not write "days to minutes"); (6) Lessons.
- Diagram: user to catalog to approval to cloud template to vCenter + NSX + tagging.
- Related disciplines: /disciplines/aria, /disciplines/nsx.
- FAQ: How do you isolate teams without giving vCenter access? / What are cloud templates (formerly blueprints)?
- Keywords: aria automation cloud templates, vra vm provisioning, vcenter team isolation, government vm automation.

## PART B: HUB, CROSS-LINKS, HOMEPAGE

- The hub lists all 7 case studies. Each case study links to 2 related case studies.
- The homepage case study section shows 3 flagship cards (CS1, CS2, CS3) and a "View all 7 case studies" link.

## PART C: AI VISIBILITY FILES (lowercase filenames)

- `sitemap.xml`: generate at build from the route manifest. Include the homepage, the hub, the 7 case studies, plus all existing 23 pages (30 URLs total, no duplicates). Real per-page lastmod (case studies: 2026-11-03). Omit priority and changefreq.
- `llms.txt`: update identity to Zaboraa; Wasim Sayyed, Principal VMware Architect, 13 years, Pune. Remove the old bank/hospital/freight proof line and "40+ migrations". Add a "Case Studies" section listing the 7 URLs with one-line descriptions each.
- `llms-full.txt`: add a full-text section per case study (same anonymised text as the page), generated from `caseStudies.ts` at build so it cannot drift.
- `robots.txt`: change nothing except confirming the `Sitemap:` line.
- IndexNow: add a script that submits the 8 new/changed URLs (hub + 7 case studies) and a key file at the site root.

## PART D: TOOL CONSISTENCY

- `/tools/dr-planner`: add 5 minutes to the RPO options so the tool matches the case studies. Keep existing options.

## PART E: QA (run and report results)

1. `grep -ri` for "Zaboraa Technologies", "Principal Cloud Architect", "12+ years", "40+ migrations", "100% zero", "audit passed", "Aria for Operations", "1,240", "4,500" must return nothing in rendered content, llms files or sitemap.
2. For all 30 sitemap URLs: HTTP 200, unique title, canonical equal to the URL itself, exactly one h1, valid JSON-LD, listed in sitemap.
3. With JS off, curl shows full text for all 7 case studies.
4. All internal links on case study pages resolve (no 404).
5. Lighthouse SEO and accessibility at least 95 on the hub and 2 case studies; check dark and light themes and mobile width.
6. No IP addresses, names, cities or per-entity counts in any text or SVG.
7. Output a final table: URL | title | canonical | h1 | status | JSON-LD valid.

When done, report: files changed, the QA table, and the list of facts omitted. Do not start any other work.
