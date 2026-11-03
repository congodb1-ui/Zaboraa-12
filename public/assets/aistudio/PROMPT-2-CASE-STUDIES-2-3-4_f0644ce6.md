You are updating the zaboraa.com codebase (React 19, Vite, TypeScript, Tailwind 4, React Router 7, hosted on Vercel). This is PROMPT 2 of 3. Do only the work described here.

## FIRST: INSPECT THE CODEBASE

A previous prompt already added: `src/data/caseStudies.ts` (typed array), a `CaseStudyPage` template, a `CaseDiagram` SVG component, routes `/case-studies` and `/case-studies/:slug`, `src/seo/routes.ts` (route manifest), `scripts/prerender.mjs`, per-route canonicals, and Case Study 1 (`middle-east-gov-avs-framework`). Open these and REUSE them exactly. If any of them is missing, stop and report what is missing instead of rebuilding the foundation. Do not modify the template design.

## GLOBAL RULES

1. Do not invent facts. Use only the Approved Fact Sheet below. If a detail is missing, omit the sentence. Never ship placeholder text such as "TBD" or "[confirm]". At the end, list every fact you omitted.
2. Anonymisation: never name a ministry, department, city, country, customer or IP address. Use "Middle East Government Entities". Every case study page shows the notice "This case study is anonymised and aggregated across multiple engagements."
3. Naming: company "Zaboraa" (never "Zaboraa Technologies"). Founder: Wasim Sayyed, Principal VMware Architect, 13 years VMware architecture, Pune, Maharashtra, India.
4. All URLs and filenames lowercase. Canonical host is the apex https://zaboraa.com.
5. Never claim: "100% zero-downtime", "40+ migrations", "audit passed", a specific per-entity VM count, a specific per-entity RPO/RTO, or that Zaboraa's free tools were "used" on engagements. Say "reproduce this step with the free tool".
6. Keep the existing visual identity (dark theme, cyan accent, executive technical tone, no emojis).

## APPROVED FACT SHEET

- Work: last 3 years, 80-90% Middle East Government Entities via Microsoft Partner, 14+ entities. Secondary: private entities via AWS Partner (VMC) and Google Partner (GCVE).
- Scale: 50-100 VMs per entity on average, up to 300 VMs for a single entity.
- Workloads: SQL Server, SQL databases, Red Hat OpenShift clusters, Postgres clusters, Oracle clusters.
- Migrations: VMware to AVS (majority); AVS to AVS cross-region (rare); VMware to GCVE; VMware to VMC on AWS.
- Connectivity: mostly VPN, some ExpressRoute.
- Blockers: reIP, routing and IP changes, Oracle clusters, latency when migrated and remaining workloads share a network.
- DR: RPO 5-15 minutes (customer dependent), RTO 1-2 hours; DR for most customers; DR drill every 6 months where DR exists.
- Methods: HCX RAV (zero downtime, majority); HCX Bulk (minimal downtime) for some.
- Tools in real work: RVTools, HCX (RAV, Bulk), Azure NetApp Files, SRM, JetStream DR; FSx for VMC context.

Accuracy corrections to bake in:
- "Zero-downtime" applies only to RAV workloads that kept their IP. Bulk and reIP workloads had minimal downtime.
- Global Reach requires ExpressRoute.
- Azure NetApp Files cross-region replication has a minimum schedule of 10 minutes. Never claim it delivers 5-minute RPO. SRM with vSphere Replication supports a 5-minute minimum RPO; JetStream DR is the comparison option.
- The GCVE storage equivalent of ANF is Google Cloud NetApp Volumes (or Filestore), never "ANF".
- HCX is not the standard failback path; SRM reprotect/failback is. Do not credit HCX for failback.

---

## TASK: ADD THREE CASE STUDIES

Add each to `caseStudies.ts`, the route manifest (`src/seo/routes.ts`), the hub cards, and the prerender. Use the template sections: Engagement facts card, anonymisation notice, body sections, diagram, Lessons learned, "Reproduce this on your estate", related case studies, related disciplines, FAQ (3 questions), Book Briefing CTA. Each page also emits TechArticle, BreadcrumbList and FAQPage JSON-LD via the existing mechanism. datePublished and dateModified: 2026-11-03. Cross-link each new page with Case Study 1 (both directions).

### CS2: AVS to AVS cross-region

- slug: `avs-to-avs-cross-region`
- metaTitle: `AVS to AVS Cross-Region Migration with HCX: Government Case Study`
- metaDescription (max 155 chars): write one covering AVS-to-AVS migration between Azure regions for a government entity, HCX RAV and Bulk, DR continuity.
- H1: `Azure VMware Solution Cross-Region Migration for a Middle East Government Entity`
- Facts card: rare scenario; same geography for data residency and compliance; part of the 14+ entity program; RPO 5-15 min maintained during the move; RTO 1-2 h in the new region.
- Sections: (1) Overview; (2) Why move an AVS private cloud: data residency, compliance, user latency, cost; (3) Challenges: AVS-to-AVS HCX differs from on-prem-to-AVS (HCX versions, vMotion compatibility, network extension across regions); IP preservation vs reIP with a decision matrix; Global Reach and ExpressRoute for inter-region routing; low downtime tolerance; (4) Solution: RAV for critical workloads (SQL, Postgres), Bulk for the rest, Global Reach for L3, Network Extension for L2; (5) DR continuity during the move: no DR coverage gap, dual DR kept while migrating; (6) Outcome: zero downtime for RAV workloads, minimal downtime for Bulk; (7) Lessons: not the same as on-prem to AVS; HCX versioning; ANF cross-region replication has a 10-minute minimum schedule, plan around it.
- Do not put "zero downtime" for all VMs in the title. Do not state a VM count. Describe the HCX topology generically; do not assert Connector vs Cloud pairing.
- Diagram: Region A AVS to Global Reach to Region B AVS, with HCX appliance placement.
- Related tools: /tools/rvtools-analyzer, /tools/sizing. Related disciplines: /disciplines/avs, /disciplines/hcx.
- FAQ: Why would you move an AVS private cloud to another region? / Is AVS to AVS the same as on-prem to AVS? / How do you keep DR running while migrating?
- Keywords: avs to avs migration, azure vmware solution cross region migration, hcx avs to avs.

### CS3: Government DR, failover/failback and 6-monthly drills

- slug: `gov-dr-failover-drills`
- metaTitle: `AVS Disaster Recovery: RPO 5-15 Min, RTO 1-2 Hr, 6-Month DR Drills`
- metaDescription (max 155 chars): write one covering DR on Azure VMware Solution for government, SRM and JetStream, failover, failback, 6-monthly drills.
- H1: `Disaster Recovery Validation on Azure VMware Solution: Failover, Failback and 6-Monthly Drills`
- Facts card: most entities had DR; where DR existed, a drill every 6 months; RPO 5-15 min (customer dependent); RTO 1-2 h.
- Sections: (1) Overview: most entities required DR, some had existing DR; (2) Problem: audit needs proven failover and failback, not only setup; (3) Challenges: reaching RPO per customer; what RTO includes (DNS, routing, application startup for SQL, Postgres, OpenShift); VPN vs ExpressRoute effect on replication; test failover vs real failover; failback with reIP, often forgotten; (4) Solution: SRM + vSphere Replication for most; JetStream DR as a comparison option with a neutral rationale only; storage-level replication only where its schedule supports the RPO (ANF cross-region minimum 10 min); runbook structure: failover, DNS update, routing change, application validation, failback; (5) Drill process every 6 months: pre-drill checklist and stakeholder sign-off; isolated bubble-network test failover or planned failover; post-drill RTO measurement, gap analysis, compliance report; (6) Outcome: drills completed on schedule, RTO measured per drill (do NOT write "audit passed"); (7) Lessons.
- Any sample report shown must be fully synthetic and labelled "Illustrative sample".
- Diagram: primary AVS to SRM/JetStream to DR site, plus a failover timeline showing RTO phases.
- Related tools: /tools/dr-planner. Related disciplines: /disciplines/srm, /disciplines/vmc-dr.
- FAQ: What RPO is realistic with SRM on AVS? / What is the difference between a test failover and a real failover? / Why is failback harder than failover?
- Keywords: avs disaster recovery, srm vsphere replication avs, jetstream dr avs, dr drill failover failback, rpo 5 minutes avs.

### CS4: Private sector, VMware to GCVE and VMC on AWS

- slug: `private-gcve-vmc-migration`
- metaTitle: `VMware to GCVE vs VMC on AWS: Networking Differences vs AVS`
- metaDescription (max 155 chars): write one covering VMware to GCVE and VMC migrations for private enterprises and how networking differs from AVS.
- H1: `VMware to Google Cloud VMware Engine and VMware Cloud on AWS for Private Enterprises`
- Facts card: private entities via AWS Partner and Google Partner; same blockers as AVS (reIP, Oracle, OpenShift, Postgres); omit scale.
- Sections: (1) Overview; (2) Problem: VMware exit, cost, scalability, networking differs from AVS; (3) Challenges: GCVE (Private Services Access, DNS peering, optional BigQuery analytics); VMC (Connected VPC, ENI routing, FSx for NetApp ONTAP storage); same blockers with platform-specific solutions; (4) Comparison table: connectivity (VPN vs Cloud Interconnect vs Direct Connect), storage (Google Cloud NetApp Volumes/Filestore vs FSx ONTAP vs ANF), networking constructs (PSA vs Connected VPC vs ExpressRoute/Global Reach), node types (ve1-standard-72, ve2-standard-128, i4i.metal); (5) Solution: HCX on both, networking differs; (6) Outcome: zero downtime RAV where IP kept, minimal downtime Bulk; (7) Lessons. Do not claim "same RPO/RTO framework".
- Diagram: on-prem to HCX to GCVE and VMC side by side.
- Related tools: /tools/sizing, /tools/rvtools-analyzer. Related disciplines: /disciplines/gcve, /disciplines/vmc-dr.
- FAQ: How does GCVE networking differ from AVS? / What is Connected VPC in VMC? / Which external storage fits each platform?
- Keywords: vmware to gcve migration, vmware to vmc migration, gcve private services access, vmc connected vpc.

## ACCEPTANCE CHECKLIST (verify and report)

- The hub lists CS1 to CS4. Each page prerenders (curl with JS off) with its own title, canonical, h1, body text and FAQ text.
- No "audit passed", no ANF 5-minute RPO claim, no "ANF" for GCVE, no per-entity VM count, no placeholder text.
- Internal links between CS1-CS4 and to tools and disciplines all resolve (no 404).
- Dark and light themes and mobile width render correctly.

When done, report: files changed, facts omitted, any issues. Do not start any other work, and do not touch llms.txt or sitemap.xml.
