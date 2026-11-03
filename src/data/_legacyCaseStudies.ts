/**
 * Legacy case studies archived per Zaboraa editorial policy.
 * This file is imported nowhere in production code.
 */
export const LEGACY_CASE_STUDIES = [
  {
    id: 'case-fintech-bank',
    sector: 'Tier-1 Banking Institution',
    title: 'Multi-Petabyte Core Banking Evacuation to Azure VMware Solution (AVS)',
    subtitle: 'Zero downtime cutover of 1,240 VMs, Oracle RAC clusters, and SWIFT messaging gateways under strict regulatory scrutiny.',
    metrics: {
      vms: '1,240 VMs',
      downtime: '0 Hours',
      costReduction: '38% TCO',
      timeline: '90 Days'
    },
    summary: 'When a premier financial institution faced an impending datacenter lease termination and hardware end-of-life, an end-to-end migration to Azure VMware Solution was architected using HCX Replication-Assisted vMotion and Azure NetApp Files.',
    architectureSolution: [
      'Engineered redundant 10 Gbps ExpressRoute FastPath circuits with Global Reach to bypass Virtual Network Gateway CPU bottlenecks.',
      'Decoupled 320 TB of archive transaction logs onto Azure NetApp Files Ultra tier NFS datastores, eliminating the need to purchase 8 additional AV36 nodes.',
      'Executed 14 synchronized migration waves with custom PowerCLI orchestration scripts, migrating 100+ VMs per weekend without breaking regulatory compliance.'
    ]
  },
  {
    id: 'case-healthcare-hospital',
    sector: 'Healthcare Network (18 Hospitals)',
    title: 'In-Place NSX-V to NSX-T Migration & Zero-Trust Microsegmentation',
    subtitle: 'Securing 4,500 patient EHR workloads and biomedical telemetry endpoints with zero downtime across 18 acute care hospitals.',
    metrics: {
      vms: '4,500 VMs',
      downtime: '0 Min',
      costReduction: '24% Capex',
      timeline: '60 Days'
    },
    summary: 'With VMware NSX-V reaching end-of-support, this healthcare conglomerate required an urgent transition to NSX-T with zero interruption to live clinical workstations and surgical theater monitoring feeds.',
    architectureSolution: [
      'Implemented dual-stack NSX-V and NSX-T migration coordinator topology with cross-bridged Layer-2 edges.',
      'Converted legacy IP-based firewall sets into dynamic tag-based Distributed Firewall policies grouping workloads by hospital campus and clinical tier.',
      'Migrated edge load balancers to VMware Avi Vantage, introducing automated SSL offloading and Layer 7 HIPAA compliance inspection.'
    ]
  },
  {
    id: 'case-global-logistics',
    sector: 'Global Freight & Supply Chain',
    title: 'Multi-AZ VMC on AWS Stretched Cluster & Real-Time Fleet Tracking',
    subtitle: 'Active-Active high-availability disaster recovery architecture handling 15M daily IoT geolocation events.',
    metrics: {
      vms: '820 VMs',
      downtime: '99.999%',
      costReduction: '$1.4M / Yr',
      timeline: '45 Days'
    },
    summary: 'Migrated 820 mission-critical freight dispatch and route optimization workloads from an aging colo to a Multi-AZ stretched cluster on VMware Cloud on AWS, directly linking into Amazon Aurora and Kinesis streams.',
    architectureSolution: [
      'Deployed 6-node stretched clusters across AWS us-east-1a and us-east-1b with sub-4ms vSAN synchronous replication.',
      'Configured Connected VPC high-bandwidth ENI links to stream real-time Kafka telematics directly into AWS EKS containers.',
      'Reduced recovery time objective (RTO) from 4 hours down to instantaneous automated DRS failover with zero manual touch.'
    ]
  }
];
