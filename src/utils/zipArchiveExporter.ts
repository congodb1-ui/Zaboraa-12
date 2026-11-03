import JSZip from 'jszip';

export interface WhitepaperMetadata {
  id: string;
  title: string;
  discipline: string;
  version: string;
  date: string;
  author: string;
  abstract: string;
  targetArchitecture: string;
  contentMarkdown: string;
  specsJson: Record<string, any>;
}

export const ENTERPRISE_WHITEPAPERS: WhitepaperMetadata[] = [
  {
    id: 'wp-nutanix-azure-bare-metal',
    title: 'Nutanix Cloud Clusters (NC2) on Azure: Bare-Metal Architecture & Flow Virtual Networking',
    discipline: 'VMware SDDC to Nutanix NC2 on Azure',
    version: '2.4.0',
    date: '2026-10-10',
    author: 'Wasim Sayyed, Principal VMware Architect',
    abstract: 'Comprehensive engineering guide detailing the deployment of Nutanix AHV hypervisors directly onto Azure physical bare-metal hardware (AN36, AN36P, AN64, AN100 SKUs). Eliminates nested virtualization performance penalties while integrating directly with Azure Virtual Network (VNet) subnets and ExpressRoute FastPath border routing.',
    targetArchitecture: 'Azure Bare-Metal + Nutanix AOS & AHV + Flow Virtual Networking',
    specsJson: {
      bareMetalSKUs: {
        AN36: { cores: 36, threads: 72, ramGB: 768, storageNVMeTB: 19.2, nicSpeedGbps: 100 },
        AN36P: { cores: 36, threads: 72, ramGB: 1536, storageNVMeTB: 19.2, nicSpeedGbps: 100 },
        AN64: { cores: 64, threads: 128, ramGB: 1536, storageNVMeTB: 38.4, nicSpeedGbps: 100 },
        AN100: { cores: 104, threads: 208, ramGB: 2048, storageNVMeTB: 76.8, nicSpeedGbps: 200 }
      },
      networking: {
        flowSDN: 'Native Azure VNet integration without overlay encapsulation penalty',
        hybridInterconnect: 'Azure ExpressRoute with FastPath enabled (ErGw3AZ SKU)',
        mtu: 1500,
        interClusterLatencyMs: '< 0.8ms'
      },
      redundancy: {
        minClusterNodes: 3,
        maxClusterNodes: 28,
        cvmMemoryAllocationGB: 32
      }
    },
    contentMarkdown: `# Nutanix Cloud Clusters (NC2) on Azure
## Bare-Metal Architecture & Flow Virtual Networking Whitepaper
**Author:** Wasim Sayyed, Principal VMware Architect  
**Classification:** Enterprise Engineering Reference Architecture

---

### Executive Summary
Transitioning legacy VMware vSphere software-defined datacenters (SDDC) to Nutanix Cloud Clusters (NC2) on Microsoft Azure combines enterprise-grade Nutanix hyperconverged storage and compute with the global elasticity of Azure infrastructure. Unlike traditional hosted cloud architectures that impose nested hypervisor penalties, NC2 installs the Nutanix Acropolis Operating System (AOS) and Acropolis Hypervisor (AHV) directly on bare-metal physical servers inside Microsoft Azure data centers.

### Bare-Metal Hardware Specifications
| Node SKU | Physical Cores | vCPUs / Threads | Memory | NVMe Storage | Network Fabric |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AN36** | 36 cores | 72 threads | 768 GB RAM | 19.2 TB NVMe | Dual 100GbE Mellanox |
| **AN36P** | 36 cores | 72 threads | 1,536 GB RAM | 19.2 TB NVMe | Dual 100GbE Mellanox |
| **AN64** | 64 cores | 128 threads | 1,536 GB RAM | 38.4 TB NVMe | Dual 100GbE Mellanox |
| **AN100** | 104 cores | 208 threads | 2,048 GB RAM | 76.8 TB NVMe | Dual 200GbE Mellanox |

### Flow Virtual Networking & Direct Azure VNet Integration
1. **Zero Double-Encapsulation**: User VM vNICs attach directly into native Azure Virtual Network (VNet) subnets. Each VM receives a routable private IP address natively recognized by Azure routing tables.
2. **ExpressRoute FastPath**: On-premises VMware environments communicate directly with NC2 bare-metal hypervisors via ExpressRoute FastPath, bypassing the Azure GatewaySubnet CPU bottleneck and delivering line-rate 10G/100G bandwidth with sub-millisecond round-trip time (RTT).
3. **Microsegmentation & Security Policies**: Flow Network Security enforces stateful Layer-4 through Layer-7 firewall policies inside the AHV kernel before frames enter physical wires.

---
*© 2026 Enterprise Architecture. All rights reserved.*
`
  },
  {
    id: 'wp-nutanix-move-migration-pipeline',
    title: 'Nutanix Move: Automated Cross-Hypervisor Migration Pipeline (vSphere to AHV)',
    discipline: 'VMware SDDC to Nutanix NC2 on Azure',
    version: '3.1.2',
    date: '2026-10-10',
    author: 'Wasim Sayyed, Principal VMware Architect',
    abstract: 'Operational methodology and runbook for orchestrating mass cross-hypervisor migration of hundreds of production VMs from VMware ESXi / vCenter to Nutanix AHV on Azure. Features agentless CBT changed block synchronization, automated VirtIO injection, disk controller conversion, and L2 subnet extension.',
    targetArchitecture: 'VMware vSphere 7.0/8.0 -> Nutanix Move Appliance -> Nutanix AHV on Azure',
    specsJson: {
      migrationEngine: 'Nutanix Move 5.x Appliance',
      changeBlockTracking: 'VMware CBT via NFC / VADP APIs',
      driverInjection: 'Automated VirtIO-SCSI and VirtIO-Net injection into Windows and Linux guest OS',
      cutoverDowntime: '< 15 seconds per virtual machine',
      l2StretchedNetwork: 'Flow Layer 2 Network Extension (VXLAN encapsulation)',
      supportedOS: [
        'Windows Server 2012 through 2025',
        'Red Hat Enterprise Linux 7/8/9',
        'Ubuntu Server 18.04 through 24.04 LTS',
        'SUSE Linux Enterprise Server 12/15'
      ]
    },
    contentMarkdown: `# Nutanix Move Automated Migration Pipeline
## Cross-Hypervisor Evacuation Runbook: vSphere to AHV
**Author:** Wasim Sayyed, Principal VMware Architect  
**Classification:** Enterprise Migration Practice

---

### Pipeline Architecture Overview
Nutanix Move provides an agentless, enterprise-grade migration pipeline specifically engineered to eliminate cutover risk when migrating transactional database and application workloads across hypervisors:

1. **Phase 1: Baseline Seed Replication**:
   - Move queries vCenter APIs to identify virtual disk extents.
   - Initial multi-terabyte disk blocks are copied across the ExpressRoute link while production virtual machines run with zero performance impact.
2. **Phase 2: Continuous Delta Synchronization**:
   - Leverages VMware Changed Block Tracking (CBT) to stream only modified disk sectors hourly or continuously.
   - Data replication lag is kept under 30 seconds prior to the scheduled maintenance window.
3. **Phase 3: Automated VirtIO Driver Injection**:
   - Move mounts the target replica disk image offline and stages certified VirtIO-SCSI drivers and Nutanix Guest Tools (NGT).
   - Reconfigures guest registry and initramfs to guarantee crash-free first boot on AHV.
4. **Phase 4: Disk Controller Modernization**:
   - Automatically translates legacy VMware Paravirtual SCSI (PVSCSI) and LSI Logic SAS controllers into modern VirtIO-SCSI controllers supporting queue depths of 256 requests per target.
5. **Phase 5: Sub-Minute Cutover & L2 Subnet Stretch**:
   - Source VM is cleanly quiesced; final delta committed; destination VM powered on in under 15 seconds.
   - Flow Layer 2 Subnet Extension preserves source IP and MAC addresses, avoiding DNS re-propagation delays.

---
*© 2026 Enterprise Architecture. All rights reserved.*
`
  },
  {
    id: 'wp-nutanix-dsf-bcdr-resiliency',
    title: 'Distributed Storage Fabric (DSF), Resiliency & Multi-Region BCDR on Azure',
    discipline: 'VMware SDDC to Nutanix NC2 on Azure',
    version: '2.8.0',
    date: '2026-10-10',
    author: 'Wasim Sayyed, Principal VMware Architect',
    abstract: 'Architectural blueprint covering Nutanix Distributed Storage Fabric (DSF), Replication Factor 2 (RF2) and Replication Factor 3 (RF3) failure domains, inline compression, deduplication, EC-X erasure coding, Azure Blob cold tiering, and Nutanix Leap disaster recovery runbooks.',
    targetArchitecture: 'Nutanix Distributed Storage Fabric + Nutanix Leap + Azure Blob Object Storage',
    specsJson: {
      storageFabric: 'Nutanix DSF Stargate & Cassandra Metadata Ring',
      resiliencePolicies: {
        RF2: { minNodes: 3, nodeFailuresTolerated: 1, overheadPercent: 50 },
        RF3: { minNodes: 5, nodeFailuresTolerated: 2, overheadPercent: 67 }
      },
      dataEfficiency: {
        inlineCompression: 'LZ4 hardware-assisted compression',
        inlineDeduplication: 'SHA-256 fingerprint deduplication',
        erasureCoding: 'EC-X 4:1 and 4:2 striping on cold data tiers'
      },
      disasterRecovery: {
        rpoThreshold: 'Near-zero (Synchronous) or 1 minute (Asynchronous)',
        rtoTarget: '< 15 minutes for 100 VMs via Nutanix Leap',
        cloudArchiveTier: 'Azure Cool/Cold Blob Storage with automated lifecycle rules'
      }
    },
    contentMarkdown: `# Distributed Storage Fabric (DSF) & Multi-Region BCDR
## Enterprise Storage Resiliency on Microsoft Azure
**Author:** Wasim Sayyed, Principal VMware Architect  
**Classification:** Enterprise Storage Blueprint

---

### Storage Architecture Foundation
Nutanix Distributed Storage Fabric (DSF) pools physical NVMe solid-state storage across all Azure bare-metal nodes into a single, cluster-wide, fault-tolerant datastore namespace. Data locality ensures that virtual machine read requests are serviced directly from local node NVMe drives whenever possible, minimizing inter-node network traversal and maximizing IOPS throughput.

### Failure Domain Engineering (RF2 vs RF3)
- **Replication Factor 2 (RF2)**: Writes two synchronous copies of every data block across two separate physical bare-metal nodes. Tolerates 1 concurrent node failure.
- **Replication Factor 3 (RF3)**: Writes three synchronous copies of every data block across three independent bare-metal nodes. Crucial for Tier-0 mission-critical banking, healthcare, and ERP clusters, allowing the cluster to survive two simultaneous server outages or Azure rack maintenance events without interruption.

### Cold Data Tiering to Azure Blob Storage
To optimize total cost of ownership (TCO), DSF integrates directly with Azure Blob Storage accounts. Inactive snapshots and long-term compliance archives are automatically migrated to low-cost Azure Cool or Cold Blob storage via background lifecycle policies, unlocking up to 80% storage cost savings while preserving rapid instant restoration.

### Nutanix Leap Automated DR Runbooks
1. **Protection Domains & Policies**: Configurable RPO schedules replicating changed block snapshots asynchronously or synchronously to a secondary Azure geographic region.
2. **Recovery Plans & Priority Groups**: Boot order sequencing (Tier 1: Domain Controllers/DNS -> Tier 2: Database Clusters -> Tier 3: Application & Web Servers).
3. **Non-Disruptive Test Bubble Validation**: 1-click execution into isolated sandbox networks validating full recovery without impacting production replication streams.

---
*© 2026 Enterprise Architecture. All rights reserved.*
`
  },
  {
    id: 'wp-avs-expressroute-anf-architecture',
    title: 'Azure VMware Solution (AVS): FastPath Routing & Azure NetApp Files Decoupled Storage',
    discipline: 'Azure VMware Solution',
    version: '4.0.1',
    date: '2026-10-10',
    author: 'Wasim Sayyed, Principal VMware Architect',
    abstract: 'Design guide detailing ExpressRoute FastPath border routing, Hub-Spoke VNet transit via Azure Route Server, and decoupled external storage architecture using Azure NetApp Files (ANF) NFSv3 datastores for enterprise AVS clusters.',
    targetArchitecture: 'Microsoft Azure AVS AV36/AV64 + ExpressRoute FastPath + ANF Ultra Datastores',
    specsJson: {
      clusterType: 'AV36 and AV64 bare-metal nodes',
      networkInterconnect: 'Dual MSEE ExpressRoute circuits with FastPath enabled',
      storageDecoupling: 'Azure NetApp Files Ultra tier NFSv3 datastores (up to 100 TB per pool)',
      routeBroker: 'Azure Route Server with dynamic eBGP injection into Hub NVA firewall'
    },
    contentMarkdown: `# Azure VMware Solution (AVS) Architecture Guide
## ExpressRoute FastPath & Azure NetApp Files Decoupled Storage
**Author:** Wasim Sayyed, Principal VMware Architect  
**Classification:** Enterprise Hyperscaler Architecture

---

### Executive Summary
Azure VMware Solution (AVS) enables enterprises to run native VMware vSphere, vSAN, and NSX-T private clouds directly within Microsoft Azure data centers. This whitepaper analyzes two foundational architecture patterns:
1. **ExpressRoute FastPath**: Eliminates the bottleneck of intermediate GatewaySubnet virtual machines by switching frames directly from physical NICs to AVS ESXi hosts.
2. **Decoupled Storage with ANF**: Overcomes the vSAN cluster sizing dilemma (where storage-heavy workloads force purchasing unnecessary compute nodes) by attaching managed Azure NetApp Files (ANF) NFSv3 datastores.

---
*© 2026 Enterprise Architecture. All rights reserved.*
`
  }
];

/**
 * Compiles selected whitepapers into an in-memory ZIP bundle using JSZip and triggers a browser download.
 */
export async function downloadWhitepapersZip(
  selectedIds: string[],
  bundleName?: string,
  brandName?: string
): Promise<void> {
  const effectiveOrg = brandName || 'Enterprise Architecture';
  const effectiveBundle = bundleName || `${effectiveOrg.replace(/[^a-zA-Z0-9]/g, '_')}_Architecture_Kit`;
  const zip = new JSZip();

  const selectedPapers = ENTERPRISE_WHITEPAPERS.filter(wp => selectedIds.includes(wp.id));
  if (selectedPapers.length === 0) {
    throw new Error('No whitepapers selected for export.');
  }

  // Create folder structure in ZIP
  const whitepapersFolder = zip.folder('Whitepapers');
  const specsFolder = zip.folder('Architecture_Specifications');

  const manifest = {
    packageName: effectiveBundle,
    generatedDate: new Date().toISOString(),
    organization: effectiveOrg,
    curator: 'Wasim Sayyed, Principal VMware Architect',
    totalDocuments: selectedPapers.length,
    documents: selectedPapers.map(wp => ({
      id: wp.id,
      title: wp.title,
      discipline: wp.discipline,
      version: wp.version,
      date: wp.date,
      abstract: wp.abstract,
      targetArchitecture: wp.targetArchitecture
    }))
  };

  // 1. Add Manifest JSON
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // 2. Add README
  const readmeContent = `# ${effectiveOrg} Enterprise Architecture Bundle
Generated: ${new Date().toLocaleDateString()}
Curator: Wasim Sayyed (Principal VMware Architect)

This archive contains ${selectedPapers.length} technical whitepapers and architecture specifications curated for enterprise VMware hyperscaler migration.

### Included Documents:
${selectedPapers.map((p, idx) => `${idx + 1}. **${p.title}** (v${p.version}) - ${p.discipline}`).join('\n')}

For architectural briefing inquiries, contact Wasim Sayyed.
`;
  zip.file('README.md', readmeContent);

  // 3. Add Whitepaper Markdown files and Spec JSONs
  selectedPapers.forEach(wp => {
    const safeFilename = wp.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    whitepapersFolder?.file(`${safeFilename}.md`, wp.contentMarkdown);
    specsFolder?.file(`${safeFilename}_specs.json`, JSON.stringify(wp.specsJson, null, 2));
  });

  // 4. Generate Blob and trigger download
  const contentBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const url = URL.createObjectURL(contentBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${bundleName}_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
