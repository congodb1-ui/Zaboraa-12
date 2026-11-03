export interface RouteSeoEntry {
  path: string;
  title: string;
  description: string;
  h1: string;
  summary: string;
  lastmod: string;
  jsonld: Record<string, unknown>[];
}

const BASE_ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
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
    'name': 'Wasim Sayyed',
    'jobTitle': 'Principal VMware Architect',
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
        'url': 'https://zaboraa.com',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://zaboraa.com/tools?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
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
      }
    ]
  },

  // 10-16: 7 Interactive Tools
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
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Browser'
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
        'applicationCategory': 'BusinessApplication'
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
        'applicationCategory': 'BusinessApplication'
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
        'applicationCategory': 'BusinessApplication'
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
        'applicationCategory': 'BusinessApplication'
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
        'applicationCategory': 'BusinessApplication'
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
        'applicationCategory': 'BusinessApplication'
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
      BASE_ORGANIZATION_JSONLD
    ]
  },

  // 18-22: Resources and Tabs
  {
    path: '/resources',
    title: 'Architecture Resources, Diagrams & Playbooks — Zaboraa',
    description: 'Curated technical library: 4K vector architecture topologies, step-by-step migration playbooks, and video masterclasses.',
    h1: 'Enterprise Architecture Resources & Playbooks',
    summary: 'Explore reference architectures, configuration guides, and architectural diagrams covering hyperscaler VMware environments. Includes playbooks for ExpressRoute FastPath, HCX Network Extension, and zero-trust NSX-T distributed firewall designs.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD
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
      BASE_ORGANIZATION_JSONLD
    ]
  },
  {
    path: '/resources/diagrams',
    title: '4K Vector Architecture Diagrams — Zaboraa',
    description: 'Downloadable high-resolution architecture diagrams: AVS stretched clusters, GCVE transit hubs, and Nutanix NC2 bare-metal topologies.',
    h1: '4K Vector Multi-Cloud Architecture Diagrams',
    summary: 'Access production-grade architectural diagrams detailing hybrid network topologies, transit routing, and disaster recovery fabrics. Diagrams detail traffic flows between on-premises datacenters, hyperscaler edges, and bare-metal ESXi clusters.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD
    ]
  },
  {
    path: '/resources/videos',
    title: 'Video Masterclasses & Technical Walkthroughs — Zaboraa',
    description: 'Technical video briefings on AVS storage decoupling, HCX live migration mechanics, and NSX-T zero-trust microsegmentation.',
    h1: 'Enterprise Architecture Video Masterclasses',
    summary: 'Watch deep-dive technical sessions walking through real-world cloud evacuations, storage decoupling economics, and live cutover procedures. Learn directly from Lead Principal Architect Wasim Sayyed.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD
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
      BASE_ORGANIZATION_JSONLD
    ]
  },

  // 23. About
  {
    path: '/about',
    title: 'About Principal Architect Wasim Sayyed — Zaboraa',
    description: 'Wasim Sayyed, Principal VMware Architect: 13 years VMware architecture experience, Pune, Maharashtra. Advisory across AVS, GCVE, VMC, and NC2.',
    h1: 'Enterprise Cloud Architecture & Advisory',
    summary: 'Founded by Wasim Sayyed, Principal VMware Architect with 13 years of VMware infrastructure architecture experience based in Pune, Maharashtra, India. Specialist in sovereign cloud migrations, Azure VMware Solution, Google Cloud VMware Engine, and VMware Cloud on AWS.',
    lastmod: '2026-11-03',
    jsonld: [
      BASE_ORGANIZATION_JSONLD,
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        'mainEntity': {
          '@type': 'Person',
          'name': 'Wasim Sayyed',
          'jobTitle': 'Principal VMware Architect',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Pune',
            'addressRegion': 'Maharashtra',
            'addressCountry': 'IN'
          },
          'sameAs': 'https://www.linkedin.com/in/wasim-sayyed-8b857714b/'
        }
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
      }
    ]
  },

  // 25. Case Study 1
  {
    path: '/case-studies/middle-east-gov-avs-framework',
    title: 'VMware to Azure VMware Solution: Government Migration Framework',
    description: 'How a repeatable HCX RAV/Bulk framework moved VMware estates of 50-300 VMs to Azure VMware Solution for Middle East government entities: reIP, Oracle and latency.',
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
      }
    ]
  }
];

export function getRouteSeo(path: string): RouteSeoEntry | undefined {
  // Normalize path without trailing slash
  const cleanPath = path === '/' ? '/' : path.replace(/\/+$/, '');
  return ROUTE_MANIFEST.find((r) => r.path === cleanPath);
}
