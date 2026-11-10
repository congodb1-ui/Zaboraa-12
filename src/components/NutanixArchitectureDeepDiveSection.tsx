import React, { useState } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { InteractiveHotspotImage } from './InteractiveHotspotImage';
import {
  ENTERPRISE_WHITEPAPERS,
  downloadWhitepapersZip
} from '../utils/zipArchiveExporter';
import {
  FileArchive,
  Download,
  CheckCircle2,
  Server,
  Network,
  HardDrive,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NutanixArchitectureDeepDiveSection: React.FC = () => {
  const { brandName } = useCustomization();
  // Whitepaper selection state for JSZip bundling
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(
    ENTERPRISE_WHITEPAPERS.map(w => w.id)
  );
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipSuccessMessage, setZipSuccessMessage] = useState<string | null>(null);

  const togglePaperSelection = (id: string) => {
    setSelectedPaperIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPaperIds(ENTERPRISE_WHITEPAPERS.map(w => w.id));
  };

  const handleDeselectAll = () => {
    setSelectedPaperIds([]);
  };

  const handleDownloadZip = async () => {
    if (selectedPaperIds.length === 0) return;
    setIsZipping(true);
    setZipSuccessMessage(null);
    try {
      const cleanPrefix = (brandName || 'Enterprise').replace(/[^a-zA-Z0-9]/g, '_');
      await downloadWhitepapersZip(selectedPaperIds, `${cleanPrefix}_Nutanix_NC2_Architecture_Kit`, brandName);
      setZipSuccessMessage(`Successfully packaged and downloaded ${selectedPaperIds.length} technical whitepapers.`);
      setTimeout(() => setZipSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Section Kicker & Master Header */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Dedicated Platform Architecture Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Nutanix Cloud Clusters (NC2) on Azure Architectural Blueprint Suite
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Production-grade architectural designs, network topology schematics, and cross-hypervisor migration runbooks for deploying enterprise Nutanix AHV on Microsoft Azure bare-metal infrastructure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Link
              to="/disciplines/nutanix-nc2-azure"
              className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>View Full Discipline Detail</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tools/nutanix-nc2-assessment"
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Launch RVTools Assessment</span>
            </Link>
          </div>
        </div>

        {/* Feature: Download Technical Whitepapers / Architecture PDFs as JSZip */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <FileArchive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Download Architecture Whitepapers & Specifications (ZIP Archive)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    JSZip Powered
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select technical papers to bundle into a compressed multi-document archive with markdown whitepapers, specs JSON, and manifest metadata.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectedPaperIds.length === ENTERPRISE_WHITEPAPERS.length ? handleDeselectAll : handleSelectAll}
                className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {selectedPaperIds.length === ENTERPRISE_WHITEPAPERS.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={selectedPaperIds.length === 0 || isZipping}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  selectedPaperIds.length > 0 && !isZipping
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isZipping ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Packaging ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Selected Bundle ({selectedPaperIds.length} Files)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {zipSuccessMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{zipSuccessMessage}</span>
            </div>
          )}

          {/* Whitepaper Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {ENTERPRISE_WHITEPAPERS.map(wp => {
              const isSelected = selectedPaperIds.includes(wp.id);
              return (
                <div
                  key={wp.id}
                  onClick={() => togglePaperSelection(wp.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400/30 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {wp.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {wp.abstract}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-2 pt-0.5">
                      <span>v{wp.version}</span>
                      <span>·</span>
                      <span>{wp.discipline}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SUBSECTION 1: AZURE BARE-METAL NODE ARCHITECTURE & FLOW VNET
          ========================================================================= */}
      <section id="subsection-azure-bare-metal" className="space-y-8 scroll-mt-24">
        {/* Subsection Header */}
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              Subsection 1
            </span>
            <span className="text-xs font-mono text-slate-400">
              Azure Bare-Metal & Flow SDN
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Azure Bare-Metal Node Architecture & Flow Virtual Networking
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            Deploying Nutanix Acropolis Operating System (AOS) and Acropolis Hypervisor (AHV) directly on Azure physical bare-metal hardware. Features native Azure Virtual Network (VNet) flow integration assigning native Azure NICs and IPs directly to AHV user VMs, eliminating nested virtualization penalties while maintaining sub-millisecond inter-VM latency.
          </p>
        </div>

        {/* Visual Architecture Image with Hotspots and Animation */}
        <div className="space-y-3">
          <InteractiveHotspotImage
            imageUrl="/assets/images/nutanix_nc2_azure_architecture_1791687138119.webp"
            designId="nc2-design-1"
            title="Azure Bare-Metal Hardware & Flow Virtual Networking Topology"
            subtitle="AN36 / AN64 / AN100 SKUs with Native Azure VNet Flow Fabric"
            description="Hardware-level physical layout of Nutanix NC2 bare-metal cluster inside Microsoft Azure data centers, highlighting Controller VM (CVM) storage clustering, Azure VNet native attachments, and ExpressRoute FastPath interconnectivity."
          />
        </div>

        {/* Deep Dive Narrative & Hardware Specifications Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Executive & Architectural Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Executive Architectural Analysis</span>
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong>Zero Nested Virtualization:</strong> In standard virtualized cloud hosting, running a secondary hypervisor introduces a 15% to 25% CPU overhead penalty. Nutanix NC2 deploys directly on dedicated bare-metal Azure nodes, ensuring that the AHV hypervisor interacts directly with physical Intel Xeon hardware-assisted virtualization extensions (VT-x) and local PCIe NVMe flash controller buses.
                </p>
                <p>
                  <strong>Native Azure VNet Flow Fabric:</strong> User VMs do not reside behind an internal proprietary overlay NAT gateway. Instead, Nutanix Flow Virtual Networking provisions secondary private IP addresses directly from Azure VNet subnets and binds them to guest VM interfaces. This delivers wire-speed connectivity between NC2 workloads and native Azure resources (such as Azure NetApp Files, Azure SQL, and Azure Kubernetes Service).
                </p>
                <p>
                  <strong>ExpressRoute FastPath Hybrid Backbone:</strong> Hybrid traffic between on-premises VMware data centers and Azure NC2 routes directly over an Azure ExpressRoute circuit with FastPath enabled. Traffic bypasses Azure Virtual Network Gateway CPU throughput throttles, achieving 10Gbps to 100Gbps line-rate bandwidth with sub-millisecond transit latency.
                </p>
              </div>
            </div>

            {/* Production CLI Diagnostics Box */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Production Diagnostics & CLI Verification</span>
                </span>
                <span className="text-[10px]">nutanix-cli / az-cli</span>
              </div>
              <div className="space-y-2 text-slate-300 text-[11px]">
                <div className="text-slate-500"># Verify bare-metal cluster operational state and node count:</div>
                <div className="text-cyan-400 bg-slate-900/90 p-2 rounded border border-slate-800">
                  ncli host list | grep -E "Name|Node Position|Hypervisor Type|Status"
                </div>
                <div className="text-slate-500"># Query Azure VNet IP allocations assigned to Nutanix AHV nodes:</div>
                <div className="text-emerald-400 bg-slate-900/90 p-2 rounded border border-slate-800">
                  az network nic show -g rg-nc2-prod -n nic-an64-01 --query "ipConfigurations[].privateIpAddress"
                </div>
              </div>
            </div>
          </div>

          {/* Technical Hardware SKUs & Roles Table (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Azure Bare-Metal SKUs Matrix</span>
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>AN36 Standard Node</span>
                    <span className="text-cyan-400 font-mono">36 Cores / 768 GB</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Dual Intel Xeon Scalable (72 threads), 19.2 TB raw NVMe flash, dual 100GbE NICs. Ideal for general enterprise compute workloads.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>AN36P High-Memory Node</span>
                    <span className="text-cyan-400 font-mono">36 Cores / 1.5 TB</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Same compute as AN36 with doubled RAM capacity (1,536 GB). Engineered for SAP HANA, SQL Server, and memory-bound databases.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>AN64 Performance Node</span>
                    <span className="text-cyan-400 font-mono">64 Cores / 1.5 TB</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Dual 32-core Intel Xeon (128 threads), 38.4 TB NVMe flash storage. High-density virtualization tier for large migration waves.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>AN100 Ultra-Dense Node</span>
                    <span className="text-cyan-400 font-mono">104 Cores / 2 TB</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    104 physical cores (208 threads), 76.8 TB NVMe flash, dual 200GbE Mellanox NICs. Maximum consolidation ratio for large enterprises.
                  </div>
                </div>
              </div>
            </div>

            {/* Key Deliverables Checklist */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider text-cyan-400">
                Key Architectural Safeguards
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sub-millisecond write latency via local PCIe NVMe drive pass-through</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Azure ExpressRoute FastPath bypassing GatewaySubnet bottlenecks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automatic node failure recovery and Azure physical replacement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SUBSECTION 2: NUTANIX MOVE AUTOMATED MIGRATION PIPELINE
          ========================================================================= */}
      <section id="subsection-nutanix-move" className="space-y-8 scroll-mt-24 pt-8 border-t border-slate-800/80">
        {/* Subsection Header */}
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              Subsection 2
            </span>
            <span className="text-xs font-mono text-slate-400">
              vSphere to AHV Cross-Hypervisor Evacuation
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Nutanix Move Automated Cross-Hypervisor Migration Pipeline (vSphere to AHV)
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            End-to-end automated cross-hypervisor migration pipeline capturing changed data blocks from VMware ESXi / vCenter and streaming non-disruptive deltas into Nutanix AHV on Azure. Features agentless changed block tracking (CBT) synchronization, automated VirtIO driver injection, disk controller conversion (PVSCSI/LSI to VirtIO-SCSI), and Flow Layer 2 Subnet Extension.
          </p>
        </div>

        {/* Visual Architecture Image with Hotspots and Animation */}
        <div className="space-y-3">
          <InteractiveHotspotImage
            imageUrl="/assets/images/nutanix_move_migration_1791690428522.webp"
            designId="nc2-design-2"
            title="Nutanix Move Cross-Hypervisor Migration Pipeline (vSphere to AHV)"
            subtitle="Agentless CBT Delta Streaming, VirtIO Driver Injection & L2 Subnet Stretch"
            description="Detailed workflow schema demonstrating the five migration stages: vCenter snapshot capture, background CBT disk replication stream, offline VirtIO storage driver staging, VirtIO-SCSI bus translation, and sub-15s cutover."
          />
        </div>

        {/* Deep Dive Narrative & Migration Sequence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Executive & Architectural Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" />
                <span>Migration Pipeline Engineering Details</span>
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong>Agentless CBT Synchronization:</strong> Nutanix Move communicates directly with VMware vCenter APIs via standard VMware VADP and NFC protocols. It does not require installing any kernel agents inside production guest VMs. Move captures Changed Block Tracking (CBT) deltas and replicates them continuously across the ExpressRoute link, keeping replication lag under 15 seconds.
                </p>
                <p>
                  <strong>Automated VirtIO Driver Injection:</strong> The primary barrier in cross-hypervisor migration is operating system boot failure due to missing storage drivers. Move automatically mounts the target replica disk before cutover, injects certified Nutanix VirtIO-SCSI and VirtIO-Net drivers into Windows System32 or Linux initramfs, and updates the boot manager.
                </p>
                <p>
                  <strong>Disk Controller Conversion:</strong> Converts outdated virtual hardware definitions from legacy VMware Paravirtual SCSI (PVSCSI) and LSI Logic SAS controllers into high-performance VirtIO-SCSI controllers. This unlocks deep queue depths of 256 requests per target on AHV, maximizing IOPS performance on Azure NVMe storage.
                </p>
                <p>
                  <strong>Flow Layer 2 Subnet Extension:</strong> Spans enterprise on-premises broadcast VLANs into Azure VNet over encrypted VXLAN tunnels. Migrated virtual machines retain their original IP addresses, subnet masks, and default gateways, completely eliminating the need for complex application re-IPing or cross-subnet NAT routers.
                </p>
              </div>
            </div>

            {/* Production CLI Diagnostics Box */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Move Migration CLI Diagnostics</span>
                </span>
                <span className="text-[10px]">move-cli / acli</span>
              </div>
              <div className="space-y-2 text-slate-300 text-[11px]">
                <div className="text-slate-500"># Monitor active replication plan sync rate and data lag:</div>
                <div className="text-cyan-400 bg-slate-900/90 p-2 rounded border border-slate-800">
                  move-cli migration-plan get --name "Wave-02-Oracle-RAC" --format json
                </div>
                <div className="text-slate-500"># Verify converted VM disk controller bus type on AHV hypervisor:</div>
                <div className="text-emerald-400 bg-slate-900/90 p-2 rounded border border-slate-800">
                  acli vm.get vm-ora-prod-01 | grep -A 5 "disk_address"
                </div>
              </div>
            </div>
          </div>

          {/* 5-Phase Migration Sequence Table (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-emerald-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>5-Phase Migration Execution Lifecycle</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Phase 1: Seed Replication</span>
                    <span className="text-emerald-400 font-mono">0% Downtime</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Background copy of baseline VMDK blocks over ExpressRoute. Production database continues running at full speed.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Phase 2: Continuous Delta Sync</span>
                    <span className="text-emerald-400 font-mono">&lt; 15s Lag</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hourly and continuous CBT delta syncs stream only modified sectors. WAN bandwidth throttling active.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Phase 3: VirtIO Injection</span>
                    <span className="text-emerald-400 font-mono">Automated</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Offline injection of VirtIO storage and network drivers into guest registry / initramfs, preventing BSOD.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Phase 4: SCSI Modernization</span>
                    <span className="text-emerald-400 font-mono">VirtIO-SCSI</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Translation of disk controllers to multi-queue VirtIO-SCSI with 256 queue depth per target.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Phase 5: Sub-15s Cutover</span>
                    <span className="text-emerald-400 font-mono">&lt; 15s Cutover</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Source VM gracefully shut down; final sector delta committed; destination VM powered on; IP preserved via L2 stretch.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SUBSECTION 3: DISTRIBUTED STORAGE FABRIC (DSF), RESILIENCY & BCDR
          ========================================================================= */}
      <section id="subsection-nutanix-dsf" className="space-y-8 scroll-mt-24 pt-8 border-t border-slate-800/80">
        {/* Subsection Header */}
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-300">
              Subsection 3
            </span>
            <span className="text-xs font-mono text-slate-400">
              Storage Architecture & Disaster Recovery
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Distributed Storage Fabric (DSF), Resiliency & Multi-Region BCDR
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            Enterprise hyperconverged storage architecture pooling all local Azure bare-metal NVMe SSDs into a single resilient datastore namespace. Delivers Replication Factor 2 (RF2) and Replication Factor 3 (RF3) failure domains, inline deduplication, compression, erasure coding (EC-X), Azure Blob snapshot tiering, and Nutanix Leap automated disaster recovery runbooks.
          </p>
        </div>

        {/* Visual Architecture Image with Hotspots and Animation */}
        <div className="space-y-3">
          <InteractiveHotspotImage
            imageUrl="/assets/images/nutanix_dsf_storage_bcdr_1791690439733.webp"
            designId="nc2-design-3"
            title="Distributed Storage Fabric (DSF) & Multi-Region BCDR on Azure"
            subtitle="RF2 / RF3 Failure Domains, Inline Deduplication & Nutanix Leap Disaster Recovery"
            description="Architectural storage topology highlighting Controller VM (CVM) storage pools, synchronous write mirroring across physical failure domains, hardware inline optimization, cold snapshot archival to Azure Blob, and automated cross-region Leap disaster recovery."
          />
        </div>

        {/* Deep Dive Narrative & Resiliency Specifications Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Executive & Architectural Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-blue-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span>Distributed Storage Architecture & BCDR Mechanisms</span>
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong>Unified Storage Fabric (DSF):</strong> All local PCIe NVMe solid-state storage across the Azure bare-metal cluster is aggregated into a single, shared, fault-tolerant datastore pool. Data locality ensures that VM read requests are fulfilled directly from local server NVMe flash, delivering sub-millisecond IOPS without saturating top-of-rack network switches.
                </p>
                <p>
                  <strong>RF2 vs. RF3 Failure Domains:</strong> RF2 writes two synchronous copies of each data block across distinct physical servers, tolerating one simultaneous node crash. For mission-critical Tier-0 clusters, RF3 writes three synchronous copies across three separate nodes, ensuring the cluster survives two simultaneous physical server outages or Azure rack maintenance events with zero downtime and zero data loss.
                </p>
                <p>
                  <strong>Inline Data Reduction & EC-X:</strong> Real-time LZ4 compression and SHA-256 fingerprint deduplication run inline with zero write latency penalty. For cold archive data, Post-Process Erasure Coding (EC-X) recalculates parity strips (4:1 and 4:2), reclaiming up to 75% of storage space while preserving complete RF3 data resilience standards.
                </p>
                <p>
                  <strong>Azure Blob Snapshot Tiering & Nutanix Leap:</strong> Older snapshots are automatically moved to cost-efficient Azure Cool/Cold Blob storage accounts. In parallel, Nutanix Leap orchestrates cross-region disaster recovery runbooks, automated boot ordering, IP customization, and non-disruptive DR test bubble sandboxes.
                </p>
              </div>
            </div>

            {/* Production CLI Diagnostics Box */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Storage & DR CLI Diagnostics</span>
                </span>
                <span className="text-[10px]">ncli / leap-cli</span>
              </div>
              <div className="space-y-2 text-slate-300 text-[11px]">
                <div className="text-slate-500"># Verify cluster redundancy factor and storage efficiency savings:</div>
                <div className="text-cyan-400 bg-slate-900/90 p-2 rounded border border-slate-800">
                  ncli cluster get-redundancy-state && ncli container get name="default-container"
                </div>
                <div className="text-slate-500"># Execute non-disruptive DR test run in isolated Azure test bubble:</div>
                <div className="text-blue-400 bg-slate-900/90 p-2 rounded border border-slate-800">
                  leap-cli recovery-plan test --plan-name "NC2-Azure-CrossRegion-DR"
                </div>
              </div>
            </div>
          </div>

          {/* Resiliency & BCDR Metric Matrix (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-blue-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>DSF Storage & BCDR Matrix</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Replication Factor 2 (RF2)</span>
                    <span className="text-blue-400 font-mono">1 Node Tolerance</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Two synchronous copies of all blocks. Minimum 3 nodes. Tolerates 1 concurrent host outage with automatic self-healing.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Replication Factor 3 (RF3)</span>
                    <span className="text-blue-400 font-mono">2 Node Tolerance</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Three synchronous copies. Minimum 5 nodes. Withstands two simultaneous physical server crashes with zero data loss.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Inline Optimization & EC-X</span>
                    <span className="text-blue-400 font-mono">3.2× Savings Ratio</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    LZ4 inline compression, SHA-256 fingerprint deduplication, and EC-X post-process parity striping across cold data.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Azure Blob Archival Tier</span>
                    <span className="text-blue-400 font-mono">80% Cost Reduction</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Automated tiering moves cold snapshots to Azure Cool or Cold Blob accounts over the private Azure backbone.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Nutanix Leap DR Orchestration</span>
                    <span className="text-blue-400 font-mono">1-Click Test Bubble</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Policy-driven cross-region failover runbooks with automated priority group boot sequencing and isolated testing.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
