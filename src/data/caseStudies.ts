export interface CaseStudySection {
  heading: string;
  subsections?: Array<{
    heading: string;
    body: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }>;
  body: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface CaseStudyFAQ {
  question: string;
  answer: string;
}

export interface CaseStudyFacts {
  sector: string;
  scale: string;
  platforms: string;
  connectivity: string;
  role: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  sector: string;
  platforms: string[];
  facts: CaseStudyFacts;
  summary: string;
  sections: CaseStudySection[];
  diagram: string;
  lessonsLearned: string[];
  faq: CaseStudyFAQ[];
  relatedTools: Array<{ title: string; path: string; desc: string }>;
  relatedDisciplines: Array<{ title: string; path: string; desc: string }>;
  relatedSlugs: string[];
  datePublished: string;
  dateModified: string;
  keywords: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'middle-east-gov-avs-framework',
    title: 'Middle East Government AVS Migration Framework',
    metaTitle: 'VMware to Azure VMware Solution: Government Migration Framework',
    metaDescription: 'How a repeatable HCX RAV/Bulk framework moved VMware estates of 50-300 VMs to Azure VMware Solution for Middle East government entities: reIP, Oracle and latency.',
    h1: 'Standardised VMware to Azure VMware Solution Migration for Middle East Government Entities',
    sector: 'Middle East Government Entities',
    platforms: ['Azure VMware Solution (AVS)', 'VMware HCX', 'Azure NetApp Files'],
    facts: {
      sector: 'Middle East Government Entities',
      scale: '50-100 VMs average, up to 300 VMs',
      platforms: 'VMware to AVS via Microsoft Partner',
      connectivity: 'Mostly VPN, some ExpressRoute',
      role: 'Migration architecture and delivery'
    },
    summary: 'A repeatable HCX RAV and Bulk migration framework developed across 14+ Middle East government entities moving VMware estates of 50 to 300 virtual machines to Azure VMware Solution.',
    sections: [
      {
        heading: '1. Overview and Why Repeatability Matters',
        body: [
          'Over the past three years, eighty to ninety percent of public sector migration engagements delivered across 14+ Middle East government entities targeted Azure VMware Solution (AVS) through a Microsoft Partner delivery model. The virtual machine estates typically ranged from 50 to 100 VMs on average, scaling up to 300 VMs for larger single entities.',
          'Operating under strict institutional mandates required shifting away from bespoke, ad-hoc migration scripts toward a standardised, repeatable delivery framework. Repeatability provided predictable cutover schedules, controlled variance during maintenance windows, and established auditable technical baselines across diverse infrastructure footprints.'
        ]
      },
      {
        heading: '2. Problem: Compliance, Disaster Recovery, and Uptime Expectations',
        body: [
          'Public sector entities operate under stringent governance constraints where service availability directly impacts citizen and departmental workflows. Business stakeholders maintained an uncompromising expectation of minimal operational interruption during core business hours.',
          'Concurrently, mandatory disaster recovery mandates required resilient post-migration configurations. Disaster recovery architectures needed to sustain Recovery Point Objectives (RPO) between 5 and 15 minutes, with Recovery Time Objectives (RTO) bounded between 1 and 2 hours, verified by required DR drills every 6 months where disaster recovery was implemented.'
        ]
      },
      {
        heading: '3. Workload Landscape: Relational Databases and Container Clusters',
        body: [
          'The workloads deployed across these environments reflected core institutional enterprise architectures. Mission-critical transaction engines were dominated by Microsoft SQL Server and standalone SQL database instances, running alongside enterprise Postgres clusters.',
          'Modern application tiers were frequently hosted on multi-node Red Hat OpenShift clusters, while legacy back-office transaction platforms relied on complex, shared-disk Oracle clusters. Accommodating both cloud-ready services and rigid database engines within a unified migration pipeline demanded strict tier classification.'
        ]
      },
      {
        heading: '4. Critical Architectural Challenges',
        body: [
          'Across all 14+ entities, real-world execution revealed four consistent blockers: IP address mutation, shared-disk clustering restrictions, split-brain network latency, and WAN transit throughput variances.'
        ],
        subsections: [
          {
            heading: '4.1 reIP and Routing Changes',
            body: [
              'Modifying IP addresses on legacy systems introduces substantial operational overhead, requiring extensive firewall policy refactoring and DNS propagation cycles. Consequently, each subnet was evaluated against explicit criteria to determine whether to stretch Layer-2 broadcast domains with VMware HCX Network Extension or execute a clean reIP.'
            ],
            table: {
              headers: ['Evaluation Parameter', 'HCX Network Extension (Keep IP)', 'Subnet reIP'],
              rows: [
                ['Connectivity Type', 'ExpressRoute preferred; high-grade VPN supported with MTU tuning', 'VPN or ExpressRoute with standard routed transit'],
                ['Latency Sensitivity', 'High (cross-tier dependencies require co-located broadcast domains)', 'Moderate to low (workloads decouple across routed hops)'],
                ['Application Dependencies', 'Hardcoded legacy IP bindings, legacy services, or embedded endpoints', 'DNS-driven applications and services supporting dynamic reconfiguration'],
                ['Security & Governance Policy', 'Temporary extension permissible until full wave retirement', 'Mandated by target cloud landing zone governance and IP schema hygiene']
              ]
            }
          },
          {
            heading: '4.2 Oracle and Shared-Disk Clusters',
            body: [
              'Oracle clusters and other shared-disk clusters generally cannot use VMware HCX Replication-Assisted vMotion (RAV) or live vMotion due to multi-writer disk flags, shared SCSI bus configurations, and physical RDM bindings. Because live hypervisor-level motion is technically unsupported for these shared architectures, Oracle clusters were isolated and handled as a separate migration track.'
            ]
          },
          {
            heading: '4.3 Split-Brain Latency and Transient Cross-Talk',
            body: [
              'When workloads within an extended subnet migrate incrementally, migrated VMs in AVS and remaining on-premises VMs share the same logical network across the WAN, introducing split-brain latency penalties. For VPN-connected entities, Global Reach was unavailable, as Global Reach strictly requires an ExpressRoute backbone.',
              'To eliminate performance degradation, latency was actively mitigated by disciplined wave design—grouping tightly coupled application tiers into identical migration waves—activating Mobility Optimized Networking (MON) to keep local default gateway routing in the cloud, and systematically avoiding tromboning hairpin network paths back across the VPN link.'
            ]
          },
          {
            heading: '4.4 VPN vs ExpressRoute Throughput Dynamics',
            body: [
              'The majority of government entities connected via IPsec VPN, with a secondary subset deploying dedicated Azure ExpressRoute circuits. VPN connections exhibited throughput constraints, packet overhead, and variable internet jitter, which directly dictated smaller, staggered wave batches to satisfy replication completion windows. Conversely, entities with ExpressRoute circuits sustained substantially higher concurrent replication streams, enabling larger consolidation waves.'
            ]
          }
        ]
      },
      {
        heading: '5. Discovery, Sizing, and Blocker Detection',
        body: [
          'Initial estate discovery utilized comprehensive RVTools inventory ingestion to identify potential hypervisor-level blockers prior to wave scheduling. The pre-migration audit scanned for Raw Device Mappings (RDMs), obsolete virtual hardware versions, lingering snapshots requiring consolidation, and multi-writer shared virtual disks.',
          'To optimize AVS economics and prevent artificial cluster node sprawl, Azure NetApp Files (ANF) external NFS datastores were architected to decouple high-capacity file storage from compute node allocations, ensuring host procurement matched actual CPU and RAM requirements rather than raw storage capacity.'
        ]
      },
      {
        heading: '6. Migration Methodology: RAV vs Bulk Workload Allocation',
        body: [
          'Workload allocation followed a strict risk-to-downtime matrix. Replication-Assisted vMotion (RAV) was designated for transactional SQL Server instances, enterprise Postgres clusters, and Red Hat OpenShift nodes where existing IP addresses were preserved via HCX Network Extension.',
          'HCX Bulk Migration was assigned to batch processing, non-transactional application tiers, and systems undergoing reIP. While RAV delivered zero downtime for eligible workloads that preserved their IP, Bulk migrations operated with minimal, scheduled downtime restricted to a rapid shutdown, final delta sync, and restart sequence during planned cutover intervals.'
        ]
      },
      {
        heading: '7. Hybrid Connectivity and Transit Routing Architecture',
        body: [
          'Hybrid transit utilized IPsec VPN gateways configured with redundant tunnels for the majority of entities, complemented by ExpressRoute where institutional procurement permitted. HCX Interconnect (HCX-IX) and Network Extension (HCX-NE) appliances were deployed within dedicated management subnets.',
          'Routing tables and route tables in Azure Virtual WAN or Hub VNets were documented and updated to reflect active L2 stretched segments, ensuring on-premises core switches and Azure Route Server converged without creating routing loops.'
        ]
      },
      {
        heading: '8. Measured Outcomes Across the Framework',
        body: [
          'Application of this standardised framework delivered predictable, zero-downtime live cutovers for RAV workloads that kept their IP addresses via Network Extension, while workloads assigned to Bulk migration or reIP pathways incurred minimal planned downtime confined strictly to maintenance windows.',
          'For entities with disaster recovery requirements, secondary replication topologies achieved operational RPOs between 5 and 15 minutes, with recovery runbooks confirming RTOs between 1 and 2 hours, validated during semi-annual recovery drills.'
        ]
      },
      {
        heading: '9. Core Architectural Lessons',
        body: [
          'Production delivery highlighted three indispensable operational imperatives: establish an exhaustive reIP decision matrix before scheduling cutovers; design migration waves around application coupling rather than infrastructure boundaries to avoid split-brain latency; and isolate shared-disk database architectures into dedicated engineering tracks from day one.'
        ]
      }
    ],
    diagram: 'avs-gov-network-flow',
    lessonsLearned: [
      'Standardise reIP decisions early: maintain an objective matrix comparing Network Extension against permanent reIP to prevent eleventh-hour scope changes.',
      'Group interdependent application tiers: co-migrate web, application, and database tiers together to eliminate cross-WAN split-brain latency, particularly on VPN connections.',
      'Isolate shared-disk database clusters: Oracle and multi-writer clusters cannot use HCX RAV and require an independent, dedicated migration track.',
      'Decouple storage with Azure NetApp Files: leverage external NFS datastores to avoid over-provisioning expensive compute nodes for capacity-heavy estates.'
    ],
    faq: [
      {
        question: 'What is the biggest blocker when migrating VMware to AVS?',
        answer: 'IP address mutation and routing changes represent the single most pervasive blocker across government estates. Legacy systems frequently contain hardcoded IP references, while split-brain traffic flows across extended subnets demand disciplined evaluation between HCX Network Extension and documented reIP runbooks.'
      },
      {
        question: 'Can Oracle clusters use HCX RAV?',
        answer: 'No. Oracle clusters and other shared-disk multi-writer architectures cannot use HCX RAV or standard vMotion due to disk locking, shared SCSI bus configurations, and physical RDM limitations. These workloads must be isolated into a separate migration track.'
      },
      {
        question: 'Is HCX over VPN suitable for large waves?',
        answer: 'While HCX operates effectively over IPsec VPN, available WAN throughput and packet overhead limit replication bandwidth. VPN-connected estates require smaller, staggered migration waves compared to dedicated ExpressRoute circuits to ensure initial sync and cutover windows complete on schedule.'
      }
    ],
    relatedTools: [
      {
        title: 'RVTools Migration Readiness Engine',
        path: '/tools/rvtools-analyzer',
        desc: 'Reproduce pre-migration discovery: parse estate spreadsheets, flag RDMs, lingering snapshots, and calculate wave schedules client-side.'
      },
      {
        title: 'Node & Storage Sizing Estimator',
        path: '/tools/sizing',
        desc: 'Reproduce cluster economics: size AVS AV36/AV64 nodes and calculate host reduction using decoupled Azure NetApp Files NFS datastores.'
      },
      {
        title: 'Disaster Recovery RPO/RTO Planner',
        path: '/tools/dr-planner',
        desc: 'Reproduce secondary site protection: model 5-15 min RPO bandwidth requirements and evaluate replication journal capacity.'
      }
    ],
    relatedDisciplines: [
      {
        title: 'Azure VMware Solution (AVS)',
        path: '/disciplines/avs',
        desc: 'Deep-dive reference architecture for AVS bare-metal nodes, ExpressRoute FastPath, and ANF decoupled storage.'
      },
      {
        title: 'VMware HCX Migration Architecture',
        path: '/disciplines/hcx',
        desc: 'Detailed architectural patterns for HCX Network Extension, Mobility Optimized Networking (MON), and RAV vs Bulk execution.'
      }
    ],
    relatedSlugs: [],
    datePublished: '2026-11-03',
    dateModified: '2026-11-03',
    keywords: [
      'vmware to avs migration',
      'avs migration government',
      'reip azure vmware solution',
      'oracle cluster avs migration',
      'hcx rav vs bulk'
    ]
  }
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}
