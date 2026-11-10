export interface RouteSeoEntry {
  path: string;
  title: string;
  description: string;
  h1: string;
  summary: string;
  lastmod: string;
  jsonld: Record<string, unknown>[];
  noindex?: boolean;
}

const BASE_ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://zaboraa.com/#organization',
  'name': 'Zaboraa',
  'url': 'https://zaboraa.com',
  'logo': 'https://zaboraa.com/assets/images/zaboraa-logo.png',
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Pune',
    'addressRegion': 'Maharashtra',
    'addressCountry': 'IN'
  },
  'founder': {
    '@type': 'Person',
    '@id': 'https://zaboraa.com/#wasim-sayyed',
    'name': 'Wasim Sayyed',
    'jobTitle': 'Principal VMware Architect',
    'worksFor': {
      '@id': 'https://zaboraa.com/#organization'
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Pune',
      'addressRegion': 'Maharashtra',
      'addressCountry': 'IN'
    },
    'knowsAbout': [
      'Azure VMware Solution',
      'VMware HCX',
      'NSX-T',
      'VMware Site Recovery Manager',
      'Google Cloud VMware Engine',
      'VMware Cloud on AWS',
      'Aria Operations'
    ],
    'sameAs': 'https://www.linkedin.com/in/wasim-sayyed-8b857714b/'
  },
  'description': 'Enterprise VMware cloud architecture advisory and free browser-based migration tools for Azure AVS, Google GCVE, AWS VMC, and Nutanix NC2.'
};

export const ROUTE_MANIFEST: RouteSeoEntry[] = [
  // 1. Homepage
  {
    path: '/',
    title: 'Zaboraa - Enterprise VMware Cloud Architecture',
    description: 'Enterprise VMware cloud architecture, AVS, GCVE, and VMC migrations by Wasim Sayyed. Free browser-based tools: RVTools Analyzer, AVS Sizing, NC2 Assessment.',
    h1: 'Minimal Downtime VMware Cloud & Hyperscaler Migration Authority',
    summary: 'Zaboraa provides founder-led VMware enterprise cloud architecture, hyperscaler migration frameworks, and sovereign infrastructure design. Led by Principal VMware Architect Wasim Sayyed, the platform features free browser-based tools for RVTools analysis, node sizing, and DR planning. Every assessment tool executes client-side with zero server storage.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Zaboraa',
        'url': 'https://zaboraa.com'
      }
    ]
  },

  // 2-9: 8 Discipline Detail Pages
  {
    path: '/disciplines/avs',
    title: 'Azure VMware Solution (AVS) Architecture — Zaboraa',
    description: 'Reference architecture for Azure VMware Solution: ExpressRoute FastPath, decoupled Azure NetApp Files NFS datastores, and HCX live cutover.',
    h1: 'Azure VMware Solution (AVS) Architecture & Migration',
    summary: 'Full-lifecycle private cloud engineering with native Azure peering and ExpressRoute FastPath routing. Decouple high-capacity storage volume growth from node licensing using external Azure NetApp Files NFS datastores. Execute zero-downtime HCX Replication-Assisted vMotion for eligible mission-critical workloads.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Azure VMware Solution (AVS) Architecture & Migration',
        'url': 'https://zaboraa.com/disciplines/avs'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/avs' }
        ]
      }
    ]
  },
  {
    path: '/disciplines/nutanix-nc2-azure',
    title: 'Nutanix NC2 on Azure Architecture & Migration — Zaboraa',
    description: 'Enterprise architecture for migrating VMware vSphere to Nutanix Cloud Clusters (NC2) on Azure bare metal with AHV hypervisor and Nutanix Move.',
    h1: 'VMware SDDC to Nutanix NC2 on Azure Architecture & Migration',
    summary: 'Methodology and sizing guidelines for transitioning VMware vSphere workloads to Nutanix Cloud Clusters on Azure bare-metal nodes. Combines Nutanix AHV hypervisor with Distributed Storage Fabric and native Azure VNet integration without nested virtualization. Use Nutanix Move for automated cross-hypervisor migration.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'VMware SDDC to Nutanix NC2 on Azure Architecture & Migration',
        'url': 'https://zaboraa.com/disciplines/nutanix-nc2-azure'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/nutanix-nc2-azure' }
        ]
      }
    ]
  },
  {
    path: '/disciplines/gcve',
    title: 'Google Cloud VMware Engine (GCVE) Architecture — Zaboraa',
    description: 'Google Cloud VMware Engine architecture: Private Services Access peering, Google Cloud NetApp Volumes external storage, and BigQuery analytics.',
    h1: 'Google Cloud VMware Engine (GCVE) Architecture & Migration',
    summary: 'High-performance VMware private cloud running natively on Google Cloud bare-metal infrastructure. Connect directly to VPC services via high-speed Private Services Access peering with sub-millisecond latencies. Leverage Google Cloud NetApp Volumes to decouple external NFS storage.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Google Cloud VMware Engine (GCVE) Architecture & Migration',
        'url': 'https://zaboraa.com/disciplines/gcve'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/gcve' }
        ]
      }
    ]
  },
  {
    path: '/disciplines/vmc-dr',
    title: 'VMware Cloud on AWS (VMC) & DR Architecture — Zaboraa',
    description: 'VMware Cloud on AWS reference architecture: Multi-AZ stretched clusters, Connected VPC ENI transit, and Amazon FSx ONTAP decoupled storage.',
    h1: 'VMware Cloud on AWS (VMC) & Disaster Recovery Architecture',
    summary: 'Stretched cluster architectures across AWS Availability Zones providing zero-RPO resilience and seamless AWS service connectivity. Attach Amazon FSx for NetApp ONTAP external NFS datastores to reduce host counts. Integrate native AWS services over 25 Gbps Connected VPC Elastic Network Interfaces.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'VMware Cloud on AWS (VMC) & Disaster Recovery Architecture',
        'url': 'https://zaboraa.com/disciplines/vmc-dr'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/vmc-dr' }
        ]
      }
    ]
  },
  {
    path: '/disciplines/nsx',
    title: 'NSX-T Zero-Trust Microsegmentation — Zaboraa',
    description: 'NSX-T Distributed Firewall architecture: tag-based security policies, Tier-0/Tier-1 routing topologies, and edge load balancing.',
    h1: 'NSX-T Zero-Trust Microsegmentation & Advanced SDN',
    summary: 'Architect zero-trust security domains using NSX-T Distributed Firewall kernel-level packet inspection. Model Tier-0 Active-Active ECMP edge routers alongside Tier-1 service gateways. Discover application communication flows using Aria Operations for Networks before applying strict enforcement rules.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'NSX-T Zero-Trust Microsegmentation & Advanced SDN',
        'url': 'https://zaboraa.com/disciplines/nsx'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/nsx' }
        ]
      }
    ]
  },
  {
    path: '/disciplines/hcx',
    title: 'VMware HCX Migration & Network Extension — Zaboraa',
    description: 'VMware HCX migration playbook: Replication-Assisted vMotion (RAV), Bulk migration, L2 Network Extension, and Mobility Optimized Networking.',
    h1: 'VMware HCX Migration & Layer-2 Network Extension Playbook',
    summary: 'Master enterprise workload migration across heterogeneous vSphere environments and hyperscaler targets. Deploy HCX Network Extension to stretch Layer-2 broadcast domains across WAN links without immediate reIP. Optimize cross-cloud traffic flows with Mobility Optimized Networking (MON).',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'VMware HCX Migration & Layer-2 Network Extension Playbook',
        'url': 'https://zaboraa.com/disciplines/hcx'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/hcx' }
        ]
      }
    ]
  },
  {
    path: '/disciplines/srm',
    title: 'Site Recovery Manager (SRM) & Cloud DR — Zaboraa',
    description: 'Disaster recovery runbook automation: VMware Site Recovery Manager, vSphere Replication journal sizing, and non-disruptive test bubbles.',
    h1: 'Site Recovery Manager (SRM) & Cloud Disaster Recovery',
    summary: 'Automate multi-site disaster recovery and rapid business continuity failover across private and hyperscaler clouds. Validate recovery plans using non-disruptive isolated test networks without impacting live production traffic. Size WAN replication bandwidth and journal disk capacity accurately.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Site Recovery Manager (SRM) & Cloud Disaster Recovery',
        'url': 'https://zaboraa.com/disciplines/srm'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/srm' }
        ]
      }
    ]
  },
  {
    path: '/disciplines/aria',
    title: 'VMware Aria Operations for Networks (vRNI) — Zaboraa',
    description: 'Application discovery and flow analytics: VMware Aria Operations for Networks (vRNI, rebranded under Broadcom VCF Operations) security modeling.',
    h1: 'VMware Aria Operations for Networks (vRNI) & Microsegmentation',
    summary: 'Capture IPFIX traffic flows and distributed switch telemetry to map inter-application dependencies before cloud migration. Broadcom has rebranded VMware Aria under VCF Operations and Automation. Generate recommended distributed firewall rules and eliminate unknown broadcast dependencies.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'VMware Aria Operations for Networks (vRNI) & Microsegmentation',
        'url': 'https://zaboraa.com/disciplines/aria'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Disciplines', 'item': 'https://zaboraa.com/disciplines/aria' }
        ]
      }
    ]
  },

  // 10-16: 7 Interactive Tools (Enriched SoftwareApplication Schema - P4-03)
  {
    path: '/tools',
    title: 'Engineering Workbench & Hyperscaler Sizing Tools — Zaboraa',
    description: 'Free browser-based tools: RVTools Analyzer, Node & Storage Sizing, Nutanix NC2 Assessment, Aria Networks Engine, and DR Calculator.',
    h1: 'Self-Service Engineering Workbench & Hyperscaler Sizing Tools',
    summary: 'A comprehensive suite of free, client-side engineering tools built for enterprise VMware architects. Analyze RVTools exports, calculate bare-metal node allocations, evaluate Nutanix NC2 migrations, and plan disaster recovery RPO/RTO bandwidth. All calculations execute in-browser with zero server storage.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Zaboraa Engineering Workbench',
        'url': 'https://zaboraa.com/tools',
        'description': 'Comprehensive suite of free browser-based engineering calculators and assessment engines for VMware, Nutanix NC2, and hyperscaler cloud migrations.',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'isAccessibleForFree': true,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'provider': {
          '@id': 'https://zaboraa.com/#organization'
        },
        'featureList': [
          'Multi-cloud bare-metal node and storage estimator',
          'Client-side RVTools Excel inventory ingestion and wave sequencing',
          'Nutanix NC2 on Azure node sizing and Move migration planning',
          'Aria Operations for Networks IPFIX flow analysis and NSX DFW rule modeling',
          'Disaster recovery RPO/RTO bandwidth calculator',
          'Hybrid cloud architecture blueprint generator'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://zaboraa.com/tools' }
        ]
      }
    ]
  },
  {
    path: '/tools/sizing',
    title: 'Node & Storage Sizing Estimator — Zaboraa',
    description: 'Multi-cloud node sizing estimator for AVS, GCVE, VMC on AWS, and Nutanix NC2. Model host reduction using decoupled external NFS storage.',
    h1: 'Multi-Cloud Node & Storage Sizing Estimator',
    summary: 'Eliminate hyperscaler sizing guesswork by modeling CPU, RAM, and storage boundaries across AVS, GCVE, VMC, and NC2. Calculate substantial host savings achieved by attaching decoupled external NFS storage datastores like Azure NetApp Files and Amazon FSx ONTAP. Generates an instant downloadable Bill of Materials.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Node & Storage Sizing Estimator',
        'url': 'https://zaboraa.com/tools/sizing',
        'description': 'Multi-cloud node and storage sizing calculator for Azure VMware Solution, Nutanix NC2, Google Cloud VMware Engine, and VMware Cloud on AWS.',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'isAccessibleForFree': true,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'provider': {
          '@id': 'https://zaboraa.com/#organization'
        },
        'featureList': [
          'Calculates bare-metal host counts across AVS, VMC, GCVE, and NC2',
          'Evaluates storage decoupling savings via Azure NetApp Files and Amazon FSx ONTAP',
          'Applies vSAN FTT/RAID policies and slack factor reservations',
          'Exports instant Excel Bill of Materials (BOM) without server uploads'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://zaboraa.com/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Node & Storage Sizing Estimator', 'item': 'https://zaboraa.com/tools/sizing' }
        ]
      }
    ]
  },
  {
    path: '/tools/rvtools-analyzer',
    title: 'RVTools Migration Readiness Engine — Zaboraa',
    description: 'Client-side RVTools .xlsx ingestion tool: flag RDMs, old hardware versions, snapshots, and map automated HCX migration waves.',
    h1: 'RVTools Migration Readiness & Wave Sequencing Engine',
    summary: 'Parse enterprise RVTools inventory spreadsheets directly inside your browser without uploading proprietary data to external servers. Detect hypervisor-level blockers including Raw Device Mappings (RDMs), multi-writer disks, and obsolete virtual hardware. Group workloads into logical migration waves.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'RVTools Migration Readiness Engine',
        'url': 'https://zaboraa.com/tools/rvtools-analyzer',
        'description': 'In-browser RVTools spreadsheet ingestion and migration readiness analyzer detecting RDMs, old virtual hardware, and sequencing HCX migration waves.',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'isAccessibleForFree': true,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'provider': {
          '@id': 'https://zaboraa.com/#organization'
        },
        'featureList': [
          'Parses vInfo, vDisk, vMemory, vNetwork, and vTools sheets locally',
          'Detects migration blockers: physical RDMs, multi-writer disks, snapshots, and legacy hardware',
          'Automates workload grouping into HCX RAV, Bulk, or Cold migration waves',
          'Exports comprehensive migration readiness scorecards and wave schedules'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://zaboraa.com/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'RVTools Analyzer', 'item': 'https://zaboraa.com/tools/rvtools-analyzer' }
        ]
      }
    ]
  },
  {
    path: '/tools/nutanix-nc2-assessment',
    title: 'Nutanix NC2 on Azure Migration Assessment Engine — Zaboraa',
    description: 'Calculate node requirements, Nutanix Move replication waves, and TCO when migrating VMware vSphere to Nutanix NC2 on Azure bare metal.',
    h1: 'VMware to Nutanix NC2 on Azure Assessment Engine',
    summary: 'Assess your VMware virtual machine footprint for migration to Nutanix Cloud Clusters on Microsoft Azure. Calculates bare-metal node requirements across AN36 and AN64 profiles, storage efficiency, and Nutanix Move replication sequencing. Evaluates native Azure VNet flow integration without nested virtualization.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Nutanix NC2 on Azure Assessment Engine',
        'url': 'https://zaboraa.com/tools/nutanix-nc2-assessment',
        'description': 'Assess VMware vSphere workloads for migration to Nutanix Cloud Clusters on Azure, evaluating AHV compatibility, node counts, and Move replication waves.',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'isAccessibleForFree': true,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'provider': {
          '@id': 'https://zaboraa.com/#organization'
        },
        'featureList': [
          'Evaluates AHV hypervisor compatibility and VirtIO driver injection requirements',
          'Sizes Nutanix AN36 and AN64 bare-metal nodes with RF2/RF3 resiliency',
          'Sequences Nutanix Move automated replication batches',
          'Calculates infrastructure licensing and cloud spend comparison'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://zaboraa.com/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Nutanix NC2 Assessment', 'item': 'https://zaboraa.com/tools/nutanix-nc2-assessment' }
        ]
      }
    ]
  },
  {
    path: '/tools/aria-networks',
    title: 'Aria Operations for Networks Traffic Flow Engine — Zaboraa',
    description: 'East-West traffic flow analyzer: discover application dependencies and model NSX-T distributed firewall microsegmentation rules.',
    h1: 'VMware Aria Operations for Networks Traffic Flow Engine',
    summary: 'Model East-West network flow telemetry to map inter-tier application dependencies prior to cloud cutover. VMware Aria has been rebranded by Broadcom under VCF Operations and Automation. Generate recommended zero-trust firewall rules to secure workloads without breaking communications.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Aria Operations for Networks Traffic Flow Engine',
        'url': 'https://zaboraa.com/tools/aria-networks',
        'description': 'Ingest IPFIX flow telemetry and distributed switch traffic to discover multi-tier application dependencies and model NSX Distributed Firewall rules.',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'isAccessibleForFree': true,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'provider': {
          '@id': 'https://zaboraa.com/#organization'
        },
        'featureList': [
          'Parses IPFIX netflow data directly in the browser',
          'Clusters virtual machines into web, application, and database tiers',
          'Generates recommended NSX-T Distributed Firewall zero-trust rule tables',
          'Identifies untracked cross-subnet traffic and broadcast dependencies'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://zaboraa.com/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Aria Networks Engine', 'item': 'https://zaboraa.com/tools/aria-networks' }
        ]
      }
    ]
  },
  {
    path: '/tools/dr-planner',
    title: 'Disaster Recovery RPO/RTO & WAN Calculator — Zaboraa',
    description: 'Model vSphere replication change rates, WAN bandwidth requirements for 5-15 min RPO, and journal capacity for VMware SRM.',
    h1: 'Disaster Recovery RPO/RTO & WAN Replication Calculator',
    summary: 'Calculate exact WAN throughput requirements needed to sustain aggressive Recovery Point Objectives between 5 and 15 minutes. Size disaster recovery journal capacity, replication delta windows, and evaluate Site Recovery Manager operational runbooks. Completely private and browser-based.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Disaster Recovery RPO/RTO & WAN Calculator',
        'url': 'https://zaboraa.com/tools/dr-planner',
        'description': 'Calculate WAN throughput and journal disk sizing for multi-site disaster recovery replication supporting 5-15 min RPO with VMware SRM and vSphere Replication.',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'isAccessibleForFree': true,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'provider': {
          '@id': 'https://zaboraa.com/#organization'
        },
        'featureList': [
          'Calculates required WAN bandwidth from daily data change rates and RPO targets',
          'Compares hot standby, pilot light, and on-demand recovery topologies',
          'Sizes replication journal disk capacity and delta snapshot windows',
          'Exports complete disaster recovery runbook parameters and verification timelines'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://zaboraa.com/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'DR RPO/RTO Planner', 'item': 'https://zaboraa.com/tools/dr-planner' }
        ]
      }
    ]
  },
  {
    path: '/tools/design-generator',
    title: 'Hybrid Architecture Blueprint Generator — Zaboraa',
    description: 'Guided 4-step wizard: Scope & Source, Transit & FastPath, Security & Firewalls, Target SDDC & 4K vector architecture export.',
    h1: 'Self-Service Hybrid Architecture Blueprint Generator',
    summary: 'Configure enterprise hybrid cloud architectures through a guided four-step engineering wizard. Establishes network transit, firewall rules, external storage datastores, and disaster recovery topologies. Produces an exhaustive Bill of Materials and 4K vector topology diagrams.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Hybrid Architecture Blueprint Generator',
        'url': 'https://zaboraa.com/tools/design-generator',
        'description': 'Guided interactive engineering wizard generating complete hybrid cloud bills of materials, vector diagrams, and technical dossiers for AVS, NC2, GCVE, and VMC.',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'isAccessibleForFree': true,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'provider': {
          '@id': 'https://zaboraa.com/#organization'
        },
        'featureList': [
          'Guided 5-step workflow: Scope, Underlay Transit, Security, SDDC Sizing, Cutover',
          'Supports Azure VMware Solution, Nutanix NC2, Google GCVE, and AWS VMC',
          'Generates complete bill of materials with host and storage allocations',
          'Exports high-resolution vector network diagrams and architectural dossiers'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://zaboraa.com/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Blueprint Generator', 'item': 'https://zaboraa.com/tools/design-generator' }
        ]
      }
    ]
  },

  // 17. Roadmap
  {
    path: '/roadmap',
    title: 'Engineering Roadmap & Platform Releases — Zaboraa',
    description: 'Quarterly roadmap of engineering deliverables, reference architectures, migration tools, and deep-dive technical tutorials.',
    h1: 'Quarterly Engineering Architecture Roadmap',
    summary: 'Review published milestones and upcoming engineering tools across Azure VMware Solution, Google Cloud VMware Engine, and Nutanix NC2. Track the release of automated runbooks, microsegmentation analyzers, and disaster recovery calculation engines.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Roadmap', 'item': 'https://zaboraa.com/roadmap' }
        ]
      }
    ]
  },

  // 18-22: Resources and Tabs
  {
    path: '/resources',
    title: 'Architecture Resources, Diagrams & Playbooks — Zaboraa',
    description: 'Curated technical library: 4K vector architecture topologies, step-by-step migration playbooks, and engineering runbooks.',
    h1: 'Enterprise Architecture Resources & Playbooks',
    summary: 'Explore reference architectures, configuration guides, and architectural diagrams covering hyperscaler VMware environments. Includes playbooks for ExpressRoute FastPath, HCX Network Extension, and zero-trust NSX-T distributed firewall designs.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' }
        ]
      }
    ]
  },
  {
    path: '/resources/tutorials',
    title: 'Step-by-Step Architecture Tutorials — Zaboraa',
    description: 'Hands-on enterprise tutorials: AVS ExpressRoute FastPath, HCX asymmetric routing resolution, and NSX-T distributed firewall design.',
    h1: 'Step-by-Step VMware Architecture Tutorials',
    summary: 'Comprehensive engineering tutorials featuring Terraform blueprints, Azure CLI commands, and PowerCLI automation scripts. Learn how to configure decoupled external storage, resolve network extension routing conflicts, and implement zero-trust firewall tags.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Tutorials', 'item': 'https://zaboraa.com/resources/tutorials' }
        ]
      }
    ]
  },
  {
    path: '/resources/videos',
    title: 'Architecture Video Briefings (Coming Soon) — Zaboraa',
    description: 'Technical architecture video briefings and migration masterclasses are currently in production. Explore our interactive tools, KB runbooks, and tutorials.',
    h1: 'Enterprise Architecture Technical Videos',
    summary: 'Technical video briefings are currently in production and will be added soon. Explore our step-by-step tutorials, knowledge base articles, and free browser-based engineering tools in the interim.',
    lastmod: '2026-11-10',
    noindex: true,
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Videos', 'item': 'https://zaboraa.com/resources/videos' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb',
    title: 'Knowledge Base & Technical Runbooks — Zaboraa',
    description: 'Engineering runbooks for resolving HCX asymmetric routing, vSAN storage thresholds, and ExpressRoute gateway saturation.',
    h1: 'Knowledge Base & Operational Runbooks',
    summary: 'Curated technical troubleshooting runbooks addressing complex enterprise scenarios. Resolve HCX Network Extension routing anomalies, diagnose vSAN degradation, and configure high-throughput hybrid transit tunnels.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' }
        ]
      }
    ]
  },

  // 23. About (Enriched Person Entity & Credentials - P4-04)
  {
    path: '/about',
    title: 'About Principal Architect Wasim Sayyed — Zaboraa',
    description: 'Wasim Sayyed, Principal VMware Architect: 13+ years enterprise infrastructure experience, Pune & Global Advisory. Advisory across AVS, NC2, GCVE, and VMC.',
    h1: 'Enterprise Cloud Architecture & Advisory',
    summary: 'Founded by Wasim Sayyed, Principal VMware Architect with 13+ years of enterprise infrastructure experience, Pune & Global Advisory. Specialist in sovereign cloud migrations, Azure VMware Solution, Nutanix NC2 on Azure, Google Cloud VMware Engine, and VMware Cloud on AWS.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        'mainEntity': {
          '@type': 'Person',
          '@id': 'https://zaboraa.com/#wasim-sayyed',
          'name': 'Wasim Sayyed',
          'jobTitle': 'Principal VMware Architect',
          'worksFor': {
            '@id': 'https://zaboraa.com/#organization'
          },
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Pune',
            'addressRegion': 'Maharashtra',
            'addressCountry': 'IN'
          },
          'sameAs': 'https://www.linkedin.com/in/wasim-sayyed-8b857714b/',
          'knowsAbout': [
            'Azure VMware Solution (AVS)',
            'Nutanix NC2 on Azure',
            'Google Cloud VMware Engine (GCVE)',
            'VMware Cloud on AWS (VMC)',
            'VMware HCX Layer-2 Network Extension & RAV',
            'NSX-T Zero-Trust Microsegmentation',
            'Site Recovery Manager (SRM) Cloud DR'
          ],
          'hasCredential': [
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'Nutanix Certified Professional - Cloud Integration - Azure (NCP-CI-Azure) 6.10',
              'credentialCategory': 'Professional Certification',
              'recognizedBy': {
                '@type': 'Organization',
                'name': 'Nutanix'
              },
              'dateCreated': '2026-05'
            },
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'VMware Certified Advanced Professional - Data Center Virtualization Design 2023 (VCAP-DCV Design 2023)',
              'credentialCategory': 'Advanced Professional Certification',
              'recognizedBy': {
                '@type': 'Organization',
                'name': 'VMware by Broadcom'
              },
              'dateCreated': '2023-10'
            },
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'VMware Certified Professional - Network Virtualization 2023 (VCP-NV 2023)',
              'credentialCategory': 'Professional Certification',
              'recognizedBy': {
                '@type': 'Organization',
                'name': 'VMware by Broadcom'
              },
              'dateCreated': '2023-02'
            },
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'VMware Certified Professional - Data Center Virtualization 2023 (VCP-DCV 2023)',
              'credentialCategory': 'Professional Certification',
              'recognizedBy': {
                '@type': 'Organization',
                'name': 'VMware by Broadcom'
              },
              'dateCreated': '2023-01'
            },
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'VMware Certified Specialist - Cloud Foundation 2023',
              'credentialCategory': 'Specialist Certification',
              'recognizedBy': {
                '@type': 'Organization',
                'name': 'VMware by Broadcom'
              },
              'dateCreated': '2023-01'
            },
            {
              '@type': 'EducationalOccupationalCredential',
              'name': 'Master Specialist - VMware Cloud on AWS 2023',
              'credentialCategory': 'Master Specialist Certification',
              'recognizedBy': {
                '@type': 'Organization',
                'name': 'VMware by Broadcom'
              },
              'dateCreated': '2023-01'
            }
          ]
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'About', 'item': 'https://zaboraa.com/about' }
        ]
      }
    ]
  },

  // 24. Case Studies Hub
  {
    path: '/case-studies',
    title: 'Enterprise Case Studies & Architecture Outcomes — Zaboraa',
    description: 'VMware migration and DR case studies for Middle East government entities: Azure VMware Solution frameworks, HCX RAV/Bulk wave allocation, and ANF storage.',
    h1: 'Case Studies: VMware Migrations, DR and Automation for Middle East Government Entities',
    summary: 'Standardised migration architectures and cutover strategies developed across 14+ Middle East government entities moving VMware estates to hyperscaler software-defined datacenters. All case studies are anonymised and aggregated across engagements.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Case Studies: VMware Migrations, DR and Automation for Middle East Government Entities',
        'url': 'https://zaboraa.com/case-studies'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' }
        ]
      }
    ]
  },

  // 25. Case Study 1
  {
    path: '/case-studies/middle-east-gov-avs-framework',
    title: 'VMware to Azure VMware Solution: Government Framework',
    description: 'How a repeatable HCX RAV/Bulk framework moved 50-300 VMs to Azure VMware Solution for Middle East government entities: reIP, Oracle RAC, and network latency.',
    h1: 'Standardised VMware to Azure VMware Solution Migration for Middle East Government Entities',
    summary: 'A repeatable HCX RAV and Bulk migration framework developed across 14+ Middle East government entities moving VMware estates of 50 to 300 virtual machines to Azure VMware Solution.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Standardised VMware to Azure VMware Solution Migration for Middle East Government Entities',
        'url': 'https://zaboraa.com/case-studies/middle-east-gov-avs-framework',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Middle East Gov AVS Framework', 'item': 'https://zaboraa.com/case-studies/middle-east-gov-avs-framework' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Why use both RAV and Bulk migration instead of RAV for all VMs?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'RAV provides true zero downtime live vMotion for mission-critical databases like Oracle RAC, SQL AlwaysOn, and Postgres clusters while preserving IP addresses. Bulk migration is selected for general application workloads where a scheduled reboot window is acceptable, moving tens of VMs in parallel with minimal downtime.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do you handle Oracle clusters without breaking licensing or quorum?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Oracle RAC clusters cannot utilize multi-writer shared VMDKs across standard live vMotion without careful preparation. We converted multi-writer configurations to single-node instances prior to cutover, migrated via RAV, and re-established clustering in AVS, or utilized Oracle Data Guard replication.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What causes latency spikes during network extension cutovers?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Asymmetric routing (hairpinning) occurs when a migrated VM in AVS communicates with default gateway infrastructure still located on-premises. Enabling HCX Mobility Optimized Networking (MON) ensures default gateway routing happens locally within NSX-T Tier-1 routers.'
            }
          }
        ]
      }
    ]
  },

  // 26. Case Study 2: AVS to AVS Cross-Region
  {
    path: '/case-studies/avs-to-avs-cross-region',
    title: 'AVS to AVS Cross-Region Migration: Government Case Study',
    description: 'AVS-to-AVS migration between Azure regions for a government entity: HCX RAV and Bulk execution, 5-15 min RPO, and dual-DR continuity during cutover.',
    h1: 'Azure VMware Solution Cross-Region Migration for a Middle East Government Entity',
    summary: 'Inter-region Azure VMware Solution evacuation framework for a sovereign entity relocating an active AVS private cloud across national data boundaries with continuous DR replication.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Azure VMware Solution Cross-Region Migration for a Middle East Government Entity',
        'url': 'https://zaboraa.com/case-studies/avs-to-avs-cross-region',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' },
          { '@type': 'ListItem', 'position': 3, 'name': 'AVS Cross-Region Migration', 'item': 'https://zaboraa.com/case-studies/avs-to-avs-cross-region' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Why migrate between Azure regions rather than staying in the original region?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Data residency laws, sovereign cloud mandates, or the opening of new sovereign Azure regions require moving running workloads without rebuilding from scratch.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How was disaster recovery maintained during the cross-region migration?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Dual replication targets were configured. Workloads maintained existing SRM replication to their secondary DR site while simultaneously seeding to the new target region via HCX.'
            }
          }
        ]
      }
    ]
  },

  // 27. Case Study 3: Government DR Failover Drills
  {
    path: '/case-studies/gov-dr-failover-drills',
    title: 'AVS Disaster Recovery Validation: 6-Monthly Drills',
    description: 'Disaster recovery validation framework on Azure VMware Solution: 5-15 min RPO, 1-2 hr RTO, and mandatory 6-monthly failover drills for 14+ entities.',
    h1: 'Disaster Recovery Validation on Azure VMware Solution: Failover, Failback and 6-Monthly Drills',
    summary: 'A disaster recovery validation framework deployed across 14+ Middle East government entities demonstrating 5 to 15 minute RPO and 1 to 2 hour RTO on Azure VMware Solution.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Disaster Recovery Validation on Azure VMware Solution: Failover, Failback and 6-Monthly Drills',
        'url': 'https://zaboraa.com/case-studies/gov-dr-failover-drills',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Government DR Failover Drills', 'item': 'https://zaboraa.com/case-studies/gov-dr-failover-drills' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How often should DR failover drills be conducted?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'We established mandatory 6-monthly drills. An untested DR plan is merely an assumption that frequently fails during real enterprise outages.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How do you test failover without disrupting production network traffic?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'VMware SRM creates an isolated test bubble network on an isolated NSX segment. Production replication continues uninterrupted while test VMs boot and run automated validation scripts.'
            }
          }
        ]
      }
    ]
  },

  // 28. Case Study 4: Private Sector GCVE and VMC
  {
    path: '/case-studies/private-gcve-vmc-migration',
    title: 'VMware to GCVE & VMC on AWS: Enterprise Architecture',
    description: 'Multi-cloud VMware migrations to GCVE and VMC on AWS: Private Services Access, Connected VPC ENI, and external NFS storage versus AVS.',
    h1: 'VMware to Google Cloud VMware Engine and VMware Cloud on AWS for Private Enterprises',
    summary: 'Contrasting migration architectures for private enterprises moving on-premises VMware estates to Google Cloud VMware Engine and VMware Cloud on AWS.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'VMware to Google Cloud VMware Engine and VMware Cloud on AWS for Private Enterprises',
        'url': 'https://zaboraa.com/case-studies/private-gcve-vmc-migration',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' },
          { '@type': 'ListItem', 'position': 3, 'name': 'GCVE & VMC Enterprise Architecture', 'item': 'https://zaboraa.com/case-studies/private-gcve-vmc-migration' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'When should an enterprise choose GCVE over AVS or VMC?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'GCVE is ideal for organizations deeply invested in Google Cloud data analytics (BigQuery, Vertex AI) or seeking high-density compute nodes with Private Services Access peering.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does external NFS storage differ between AVS and VMC?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'AVS integrates natively with Azure NetApp Files over ExpressRoute FastPath. VMC on AWS mounts Amazon FSx for NetApp ONTAP over Connected VPC elastic network interfaces, both decoupling storage from bare-metal compute licensing.'
            }
          }
        ]
      }
    ]
  },

  // 29. Case Study 5: NSX-T Microsegmentation
  {
    path: '/case-studies/nsxt-microsegmentation-aria-networks',
    title: 'NSX-T Microsegmentation: Firewall Planning with Aria',
    description: 'Flow-based NSX-T microsegmentation using Aria Operations for Networks: IPFIX discovery, 2,400 tags, zero-trust rules, and zero disruption.',
    h1: 'NSX-T Microsegmentation: Flow-Based Firewall Planning with Aria Operations for Networks',
    summary: 'A structured five-phase methodology using Aria Operations for Networks to analyze East-West network traffic flows, eliminate stale rules, and model zero-trust Distributed Firewall policies.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'NSX-T Microsegmentation: Flow-Based Firewall Planning with Aria Operations for Networks',
        'url': 'https://zaboraa.com/case-studies/nsxt-microsegmentation-aria-networks',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' },
          { '@type': 'ListItem', 'position': 3, 'name': 'NSX-T Microsegmentation Architecture', 'item': 'https://zaboraa.com/case-studies/nsxt-microsegmentation-aria-networks' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Why is flow discovery mandatory before implementing microsegmentation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Attempting microsegmentation based on static spreadsheets or institutional memory invariably causes production outages. Real IPFIX flow data reveals undocumented inter-application dependencies.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the role of VMware Aria Operations for Networks in this process?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Aria Operations for Networks (formerly vRNI, rebranded under Broadcom VCF Operations) visualizes network traffic flows, groups VMs into tiers based on communication patterns, and exports recommended DFW rules.'
            }
          }
        ]
      }
    ]
  },

  // 30. Case Study 6: Aria Operations Multi-vCenter
  {
    path: '/case-studies/aria-operations-networks-deployment',
    title: 'Aria Operations Deployment: Multi-vCenter Estates',
    description: 'Enterprise deployment of Aria Operations and Aria Networks across multi-vCenter government estates: capacity forecasting, AVS host sizing, and wave planning.',
    h1: 'Aria Operations and Aria Operations for Networks for Multi-vCenter Government Environments',
    summary: 'A unified operations and network analytics architecture across disparate government vCenter environments, establishing centralized capacity forecasting, migration readiness dashboards, and automated compliance reporting.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Aria Operations and Aria Operations for Networks for Multi-vCenter Government Environments',
        'url': 'https://zaboraa.com/case-studies/aria-operations-networks-deployment',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Aria Operations Multi-vCenter', 'item': 'https://zaboraa.com/case-studies/aria-operations-networks-deployment' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How does Aria Operations help with hyperscaler migration sizing?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Aria Operations measures actual CPU, RAM, and storage utilization over 30 to 90 days, eliminating on-premises over-allocation waste when sizing target bare-metal cloud nodes.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the impact of Broadcom re-branding on Aria?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Aria Operations is now part of VMware Cloud Foundation (VCF) Operations. The core capabilities remain central to enterprise infrastructure management and capacity optimization.'
            }
          }
        ]
      }
    ]
  },

  // 31. Case Study 7: Aria Automation Blueprints
  {
    path: '/case-studies/aria-automation-blueprints-vcenter',
    title: 'Aria Automation Cloud Templates: Self-Service & Isolation',
    description: 'Aria Automation cloud templates for government IT: self-service VM catalog, approval governance, naming policies, and project isolation without vCenter access.',
    h1: 'Aria Automation for Multi-Team Government IT: Cloud Templates, Approvals and vCenter Isolation',
    summary: 'Standardized VMware Aria Automation deployment for sovereign public sector organizations, establishing self-service cloud templates, automated approval workflows, naming and tagging governance, and secure department isolation without delegating vCenter administrative privileges.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Aria Automation for Multi-Team Government IT: Cloud Templates, Approvals and vCenter Isolation',
        'url': 'https://zaboraa.com/case-studies/aria-automation-blueprints-vcenter',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Case Studies', 'item': 'https://zaboraa.com/case-studies' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Aria Automation Cloud Templates', 'item': 'https://zaboraa.com/case-studies/aria-automation-blueprints-vcenter' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do you isolate teams without giving vCenter access?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Aria Automation projects map developer and database teams to dedicated compute resource pools, storage datastores, and NSX network segments. Users consume catalog items via Service Broker with custom role-based permissions, completely eliminating the need for direct vCenter UI or API access.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are cloud templates (formerly blueprints)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'In Aria Automation 8, declarative infrastructure-as-code definitions previously called blueprints are designated as cloud templates. They define virtual machine specifications, customization specs, network connections, and Day 2 operational actions in human-readable YAML.'
            }
          }
        ]
      }
    ]
  },

  // 32-49: 18 Knowledge Base Runbook Detail Pages (P4-02)
  {
    path: '/resources/kb/kb-ntx-1001',
    title: 'KB-NTX-1001: L2 Extension Nutanix Same IP — Zaboraa',
    description: 'Step-by-step engineering runbook for stretching Layer 2 subnets between VMware ESXi and Nutanix AHV using VTEP gateways to retain IP and MAC addresses.',
    h1: 'Layer 2 Extension from VMware to Nutanix: Keeping the Same IP During Migration',
    summary: 'Step-by-step engineering runbook for stretching Layer 2 subnets between VMware ESXi and Nutanix AHV using VTEP gateways to retain IP and MAC addresses.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Layer 2 Extension from VMware to Nutanix: Keeping the Same IP During Migration',
        'url': 'https://zaboraa.com/resources/kb/kb-ntx-1001',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NTX-1001', 'item': 'https://zaboraa.com/resources/kb/kb-ntx-1001' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-ntx-1002',
    title: 'KB-NTX-1002: Same IP Move vs L2 Extension — Zaboraa',
    description: 'Architectural comparison and decision matrix between Nutanix Move automated IP retention and Layer 2 network subnet extension for zero-reIP migrations.',
    h1: 'Same IP on Migration: Nutanix Move IP Retention vs Layer 2 Extension',
    summary: 'Architectural comparison and decision matrix between Nutanix Move automated IP retention and Layer 2 network subnet extension for zero-reIP migrations.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Same IP on Migration: Nutanix Move IP Retention vs Layer 2 Extension',
        'url': 'https://zaboraa.com/resources/kb/kb-ntx-1002',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NTX-1002', 'item': 'https://zaboraa.com/resources/kb/kb-ntx-1002' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-ntx-1003',
    title: 'KB-NTX-1003: ESXi to AHV Move Checklist — Zaboraa',
    description: 'Pre-migration planning checklist for migrating VMware ESXi virtual machines to Nutanix AHV using Nutanix Move, including VirtIO drivers and validation.',
    h1: 'VMware ESXi to Nutanix AHV with Nutanix Move: Planning Checklist',
    summary: 'Pre-migration planning checklist for migrating VMware ESXi virtual machines to Nutanix AHV using Nutanix Move, including VirtIO drivers and validation.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'VMware ESXi to Nutanix AHV with Nutanix Move: Planning Checklist',
        'url': 'https://zaboraa.com/resources/kb/kb-ntx-1003',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NTX-1003', 'item': 'https://zaboraa.com/resources/kb/kb-ntx-1003' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-nc2-2001',
    title: 'KB-NC2-2001: NC2 on Azure Architecture — Zaboraa',
    description: 'Technical reference architecture for Nutanix Cloud Clusters (NC2) deployed on Microsoft Azure bare metal nodes with native Azure VNet network integration.',
    h1: 'NC2 on Azure Architecture Basics',
    summary: 'Technical reference architecture for Nutanix Cloud Clusters (NC2) deployed on Microsoft Azure bare metal nodes with native Azure VNet network integration.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'NC2 on Azure Architecture Basics',
        'url': 'https://zaboraa.com/resources/kb/kb-nc2-2001',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NC2-2001', 'item': 'https://zaboraa.com/resources/kb/kb-nc2-2001' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-nc2-2002',
    title: 'KB-NC2-2002: NC2 on Azure Licensing Guide — Zaboraa',
    description: 'Comprehensive operational guide to Nutanix Cloud Infrastructure licensing models, pay-as-you-go billing, and Azure Reserved Instances for NC2 clusters.',
    h1: 'NC2 on Azure Licensing Model: NCI License Type, Pay-As-You-Go and Capacity Reservations',
    summary: 'Comprehensive operational guide to Nutanix Cloud Infrastructure licensing models, pay-as-you-go billing, and Azure Reserved Instances for NC2 clusters.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'NC2 on Azure Licensing Model: NCI License Type, Pay-As-You-Go and Capacity Reservations',
        'url': 'https://zaboraa.com/resources/kb/kb-nc2-2002',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NC2-2002', 'item': 'https://zaboraa.com/resources/kb/kb-nc2-2002' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-nc2-2003',
    title: 'KB-NC2-2003: NC2 on Azure Sizing Constraints — Zaboraa',
    description: 'Node minimums, storage capacity thresholds, Prism Central sizing boundaries, and failure domain rules when designing Nutanix NC2 clusters on Azure.',
    h1: 'NC2 on Azure Cluster Sizing Constraints',
    summary: 'Node minimums, storage capacity thresholds, Prism Central sizing boundaries, and failure domain rules when designing Nutanix NC2 clusters on Azure.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'NC2 on Azure Cluster Sizing Constraints',
        'url': 'https://zaboraa.com/resources/kb/kb-nc2-2003',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NC2-2003', 'item': 'https://zaboraa.com/resources/kb/kb-nc2-2003' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-nc2-2004',
    title: 'KB-NC2-2004: NC2 on Azure Network Design — Zaboraa',
    description: 'Network topology design and replication path selection when moving enterprise virtual machines to Nutanix NC2 on Azure without nested virtualization.',
    h1: 'Migrating to NC2 on Azure: Paths and Network Design',
    summary: 'Network topology design and replication path selection when moving enterprise virtual machines to Nutanix NC2 on Azure without nested virtualization.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Migrating to NC2 on Azure: Paths and Network Design',
        'url': 'https://zaboraa.com/resources/kb/kb-nc2-2004',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NC2-2004', 'item': 'https://zaboraa.com/resources/kb/kb-nc2-2004' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-ntx-1004',
    title: 'KB-NTX-1004: Nutanix DR Workload Mobility — Zaboraa',
    description: 'Utilizing Nutanix Disaster Recovery protection domains and Leap runbooks for cross-cluster workload mobility, asynchronous replication, and planned cutover.',
    h1: 'Nutanix-to-Nutanix Migration with Nutanix Disaster Recovery',
    summary: 'Utilizing Nutanix Disaster Recovery protection domains and Leap runbooks for cross-cluster workload mobility, asynchronous replication, and planned cutover.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Nutanix-to-Nutanix Migration with Nutanix Disaster Recovery',
        'url': 'https://zaboraa.com/resources/kb/kb-ntx-1004',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NTX-1004', 'item': 'https://zaboraa.com/resources/kb/kb-ntx-1004' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-ntx-1005',
    title: 'KB-NTX-1005: Nutanix L2 Extension VPN or VTEP — Zaboraa',
    description: 'Architectural selection between IPsec VPN and VTEP gateway technologies when stretching Layer 2 subnets across distributed Nutanix enterprise clusters.',
    h1: 'Layer 2 Subnet Extension Between Nutanix Clusters: VPN or VTEP',
    summary: 'Architectural selection between IPsec VPN and VTEP gateway technologies when stretching Layer 2 subnets across distributed Nutanix enterprise clusters.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Layer 2 Subnet Extension Between Nutanix Clusters: VPN or VTEP',
        'url': 'https://zaboraa.com/resources/kb/kb-ntx-1005',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NTX-1005', 'item': 'https://zaboraa.com/resources/kb/kb-ntx-1005' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-ntx-1006',
    title: 'KB-NTX-1006: Nutanix AHV to ESXi Migration — Zaboraa',
    description: 'Engineering runbook and conversion methods for moving virtual machines from Nutanix AHV back to VMware vSphere ESXi environments with full disk conversion.',
    h1: 'Moving Workloads from Nutanix AHV to VMware ESXi: Supported Methods and Limits',
    summary: 'Engineering runbook and conversion methods for moving virtual machines from Nutanix AHV back to VMware vSphere ESXi environments with full disk conversion.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Moving Workloads from Nutanix AHV to VMware ESXi: Supported Methods and Limits',
        'url': 'https://zaboraa.com/resources/kb/kb-ntx-1006',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NTX-1006', 'item': 'https://zaboraa.com/resources/kb/kb-ntx-1006' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-avs-8921',
    title: 'KB-AVS-8921: AVS FastPath MTU & BGP Flapping — Zaboraa',
    description: 'Troubleshooting guide for resolving BGP route flapping and MTU 1500 vs 9000 packet fragmentation between Cisco ASR routers and Azure VMware Solution T0 edges.',
    h1: 'Resolving ExpressRoute FastPath BGP Route Flapping & MTU 1500/9000 Fragmentation between Cisco ASR and AVS T0',
    summary: 'Troubleshooting guide for resolving BGP route flapping and MTU 1500 vs 9000 packet fragmentation between Cisco ASR routers and Azure VMware Solution T0 edges.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Resolving ExpressRoute FastPath BGP Route Flapping & MTU 1500/9000 Fragmentation between Cisco ASR and AVS T0',
        'url': 'https://zaboraa.com/resources/kb/kb-avs-8921',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-AVS-8921', 'item': 'https://zaboraa.com/resources/kb/kb-avs-8921' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-avs-8922',
    title: 'KB-AVS-8922: Mounting External ANF on AVS — Zaboraa',
    description: 'Production guide for mounting Azure NetApp Files NFS datastores to Azure VMware Solution ESXi clusters with export policies, Kerberos, and MTU 9000.',
    h1: 'Mounting External Azure NetApp Files (ANF) NFS Datastores on AVS: Volume Export Policies, Kerberos Security, and MTU 9000 Tuning',
    summary: 'Production guide for mounting Azure NetApp Files NFS datastores to Azure VMware Solution ESXi clusters with export policies, Kerberos, and MTU 9000.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Mounting External Azure NetApp Files (ANF) NFS Datastores on AVS: Volume Export Policies, Kerberos Security, and MTU 9000 Tuning',
        'url': 'https://zaboraa.com/resources/kb/kb-avs-8922',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-AVS-8922', 'item': 'https://zaboraa.com/resources/kb/kb-avs-8922' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-gcve-4201',
    title: 'KB-GCVE-4201: GCVE Private Access & Cloud DNS — Zaboraa',
    description: 'Troubleshooting IP address overlaps and private Cloud DNS resolution failures across Google Cloud VMware Engine and peered Google Cloud VPC networks.',
    h1: 'Private Services Access (PSA) Peering Troubleshooting: Resolving IP Overlap & Cloud DNS Private Zone Resolution from GCVE to Google VPC',
    summary: 'Troubleshooting IP address overlaps and private Cloud DNS resolution failures across Google Cloud VMware Engine and peered Google Cloud VPC networks.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Private Services Access (PSA) Peering Troubleshooting: Resolving IP Overlap & Cloud DNS Private Zone Resolution from GCVE to Google VPC',
        'url': 'https://zaboraa.com/resources/kb/kb-gcve-4201',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-GCVE-4201', 'item': 'https://zaboraa.com/resources/kb/kb-gcve-4201' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-vmc-3101',
    title: 'KB-VMC-3101: VMC Connected VPC ENI Routing — Zaboraa',
    description: 'Resolving asymmetric routing anomalies and cross-account AWS security group drops across VMware Cloud on AWS and native Connected Amazon VPC subnets.',
    h1: 'Debugging Connected VPC Elastic Network Interface (ENI) Subnet Routing Asymmetry and Cross-Account Security Group Denies',
    summary: 'Resolving asymmetric routing anomalies and cross-account AWS security group drops across VMware Cloud on AWS and native Connected Amazon VPC subnets.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Debugging Connected VPC Elastic Network Interface (ENI) Subnet Routing Asymmetry and Cross-Account Security Group Denies',
        'url': 'https://zaboraa.com/resources/kb/kb-vmc-3101',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-VMC-3101', 'item': 'https://zaboraa.com/resources/kb/kb-vmc-3101' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-nsx-6501',
    title: 'KB-NSX-6501: Migrating to NSX DFW Zero-Trust — Zaboraa',
    description: 'Zero-disruption migration runbook for transitioning non-NSX vSphere workloads into NSX-T Distributed Firewall enforcement with discovery and rules.',
    h1: 'Production Runbook: Migrating Non-NSX vSphere Workloads to NSX Distributed Firewall (DFW) without Service Disruption',
    summary: 'Zero-disruption migration runbook for transitioning non-NSX vSphere workloads into NSX-T Distributed Firewall enforcement with discovery and rules.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Production Runbook: Migrating Non-NSX vSphere Workloads to NSX Distributed Firewall (DFW) without Service Disruption',
        'url': 'https://zaboraa.com/resources/kb/kb-nsx-6501',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-NSX-6501', 'item': 'https://zaboraa.com/resources/kb/kb-nsx-6501' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-hcx-5301',
    title: 'KB-HCX-5301: HCX MON Asymmetric Return Traffic — Zaboraa',
    description: 'Diagnosing and resolving default gateway asymmetric return traffic and hairpinning when extending Layer 2 VLANs via VMware HCX Network Extension.',
    h1: 'Troubleshooting VMware HCX Mobility Optimized Networking (MON) Default Gateway Asymmetric Return Traffic in Extended L2 VLANs',
    summary: 'Diagnosing and resolving default gateway asymmetric return traffic and hairpinning when extending Layer 2 VLANs via VMware HCX Network Extension.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Troubleshooting VMware HCX Mobility Optimized Networking (MON) Default Gateway Asymmetric Return Traffic in Extended L2 VLANs',
        'url': 'https://zaboraa.com/resources/kb/kb-hcx-5301',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-HCX-5301', 'item': 'https://zaboraa.com/resources/kb/kb-hcx-5301' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-srm-7101',
    title: 'KB-SRM-7101: SRM Test Bubble Isolation Runbook — Zaboraa',
    description: 'Configuring non-disruptive test network bubbles in VMware Site Recovery Manager to prevent live IP conflicts and Active Directory tombstone replication.',
    h1: 'SRM Non-Disruptive Test Failover Bubble Network Isolation: Preventing Duplicate IP Conflicts and Active Directory Tombstone Corruption',
    summary: 'Configuring non-disruptive test network bubbles in VMware Site Recovery Manager to prevent live IP conflicts and Active Directory tombstone replication.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'SRM Non-Disruptive Test Failover Bubble Network Isolation: Preventing Duplicate IP Conflicts and Active Directory Tombstone Corruption',
        'url': 'https://zaboraa.com/resources/kb/kb-srm-7101',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-SRM-7101', 'item': 'https://zaboraa.com/resources/kb/kb-srm-7101' }
        ]
      }
    ]
  },
  {
    path: '/resources/kb/kb-aria-4401',
    title: 'KB-ARIA-4401: IPFIX on VDS for Aria Networks — Zaboraa',
    description: 'Configuring IPFIX telemetry flow monitoring on vSphere Distributed Switches for Aria Operations for Networks application discovery and security mapping.',
    h1: 'Configuring IPFIX on vSphere Distributed Switch (VDS) for Aria Operations for Networks: Sampling Rate, Collector IP, and Port Group Validation',
    summary: 'Configuring IPFIX telemetry flow monitoring on vSphere Distributed Switches for Aria Operations for Networks application discovery and security mapping.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Configuring IPFIX on vSphere Distributed Switch (VDS) for Aria Operations for Networks: Sampling Rate, Collector IP, and Port Group Validation',
        'url': 'https://zaboraa.com/resources/kb/kb-aria-4401',
        'datePublished': '2026-11-03',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Knowledge Base', 'item': 'https://zaboraa.com/resources/kb' },
          { '@type': 'ListItem', 'position': 4, 'name': 'KB-ARIA-4401', 'item': 'https://zaboraa.com/resources/kb/kb-aria-4401' }
        ]
      }
    ]
  },

  // 50-54: 5 Tutorial Detail Pages (P4-02)
  {
    path: '/resources/tutorials/avs-expressroute-fastpath-implementation-guide',
    title: 'AVS ExpressRoute FastPath Guide — Zaboraa',
    description: 'Step-by-step engineering implementation guide for Azure VMware Solution ExpressRoute FastPath and Global Reach transit routing with sub-2ms latency.',
    h1: 'Step-by-Step: Azure VMware Solution (AVS) ExpressRoute FastPath & Global Reach Architecture',
    summary: 'A production deployment playbook for connecting an enterprise datacenter to Azure VMware Solution using ExpressRoute FastPath and Global Reach to achieve sub-2ms latency and bypass gateway bottleneck.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Step-by-Step: Azure VMware Solution (AVS) ExpressRoute FastPath & Global Reach Architecture',
        'url': 'https://zaboraa.com/resources/tutorials/avs-expressroute-fastpath-implementation-guide',
        'datePublished': '2026-10-15',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Tutorials', 'item': 'https://zaboraa.com/resources/tutorials' },
          { '@type': 'ListItem', 'position': 4, 'name': 'AVS FastPath Guide', 'item': 'https://zaboraa.com/resources/tutorials/avs-expressroute-fastpath-implementation-guide' }
        ]
      }
    ]
  },
  {
    path: '/resources/tutorials/hcx-l2-network-extension-troubleshooting-runbook',
    title: 'HCX L2 Network Extension Runbook — Zaboraa',
    description: 'Comprehensive troubleshooting runbook for resolving broadcast storms, MTU black holes, and packet drops across VMware HCX Layer 2 extended networks.',
    h1: 'HCX Network Extension & L2 Broadcast Domain Troubleshooting Runbook',
    summary: 'A comprehensive operational runbook for diagnosing and resolving broadcast storms, MTU black holes, and packet drops across VMware HCX Layer 2 stretched networks.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'HCX Network Extension & L2 Broadcast Domain Troubleshooting Runbook',
        'url': 'https://zaboraa.com/resources/tutorials/hcx-l2-network-extension-troubleshooting-runbook',
        'datePublished': '2026-10-12',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Tutorials', 'item': 'https://zaboraa.com/resources/tutorials' },
          { '@type': 'ListItem', 'position': 4, 'name': 'HCX L2 Troubleshooting', 'item': 'https://zaboraa.com/resources/tutorials/hcx-l2-network-extension-troubleshooting-runbook' }
        ]
      }
    ]
  },
  {
    path: '/resources/tutorials/nsxt-microsegmentation-zero-trust-playbook',
    title: 'NSX-T Microsegmentation Playbook — Zaboraa',
    description: 'Production implementation playbook for designing zero-trust East-West microsegmentation with NSX-T Distributed Firewall security groups and tags.',
    h1: 'NSX-T Microsegmentation: Implementing Zero-Trust East-West Security in Production',
    summary: 'Production implementation playbook for designing zero-trust East-West microsegmentation with NSX-T Distributed Firewall security groups, tags, and policy matrices.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'NSX-T Microsegmentation: Implementing Zero-Trust East-West Security in Production',
        'url': 'https://zaboraa.com/resources/tutorials/nsxt-microsegmentation-zero-trust-playbook',
        'datePublished': '2026-10-08',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Tutorials', 'item': 'https://zaboraa.com/resources/tutorials' },
          { '@type': 'ListItem', 'position': 4, 'name': 'NSX-T Zero-Trust Playbook', 'item': 'https://zaboraa.com/resources/tutorials/nsxt-microsegmentation-zero-trust-playbook' }
        ]
      }
    ]
  },
  {
    path: '/resources/tutorials/vmc-aws-external-nfs-fsx-netapp-ontap-architecture',
    title: 'VMC on AWS External FSx ONTAP Storage — Zaboraa',
    description: 'Architecting elastic external NFS datastores on VMware Cloud on AWS using Amazon FSx for NetApp ONTAP to decouple storage from compute nodes.',
    h1: 'Architecting Elastic External NFS Datastores on VMC with Amazon FSx for NetApp ONTAP',
    summary: 'A step-by-step engineering tutorial on attaching Amazon FSx for NetApp ONTAP external NFS datastores to VMware Cloud on AWS bare-metal ESXi clusters.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Architecting Elastic External NFS Datastores on VMC with Amazon FSx for NetApp ONTAP',
        'url': 'https://zaboraa.com/resources/tutorials/vmc-aws-external-nfs-fsx-netapp-ontap-architecture',
        'datePublished': '2026-09-28',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Tutorials', 'item': 'https://zaboraa.com/resources/tutorials' },
          { '@type': 'ListItem', 'position': 4, 'name': 'VMC FSx Storage Guide', 'item': 'https://zaboraa.com/resources/tutorials/vmc-aws-external-nfs-fsx-netapp-ontap-architecture' }
        ]
      }
    ]
  },
  {
    path: '/resources/tutorials/gcve-bigquery-lakehouse-pipeline-architecture',
    title: 'GCVE to BigQuery Lakehouse Pipeline — Zaboraa',
    description: 'Step-by-step architecture guide for streaming transactional database telemetry from Google Cloud VMware Engine into Google BigQuery analytics pipelines.',
    h1: 'Building a Low-Latency Analytics Pipeline from GCVE Databases to Google BigQuery',
    summary: 'Architecture guide for creating private, low-latency Change Data Capture streaming pipelines from Oracle and SQL databases hosted in GCVE into Google BigQuery.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Building a Low-Latency Analytics Pipeline from GCVE Databases to Google BigQuery',
        'url': 'https://zaboraa.com/resources/tutorials/gcve-bigquery-lakehouse-pipeline-architecture',
        'datePublished': '2026-09-20',
        'dateModified': '2026-11-03'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://zaboraa.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://zaboraa.com/resources' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Tutorials', 'item': 'https://zaboraa.com/resources/tutorials' },
          { '@type': 'ListItem', 'position': 4, 'name': 'GCVE BigQuery Lakehouse', 'item': 'https://zaboraa.com/resources/tutorials/gcve-bigquery-lakehouse-pipeline-architecture' }
        ]
      }
    ]
  }
];

export function getRouteSeo(path: string): RouteSeoEntry | undefined {
  // Normalize path without trailing slash
  const cleanPath = path === '/' ? '/' : path.replace(/\/+$/, '');
  return ROUTE_MANIFEST.find((r) => r.path === cleanPath);
}
