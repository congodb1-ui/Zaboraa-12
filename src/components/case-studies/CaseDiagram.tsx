import React from 'react';

interface CaseDiagramProps {
  id: string;
  className?: string;
}

export const CaseDiagram: React.FC<CaseDiagramProps> = ({ id, className = '' }) => {
  if (id === 'avs-gov-network-flow') {
    return (
      <div className={`w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono font-bold text-white tracking-wider uppercase">
              Hybrid Transit & Layer-2 Extension Architecture
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Site A &rarr; Region A (AVS)</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300">Anonymised Topology</span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto py-4">
          <svg
            viewBox="0 0 960 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto min-w-[760px] text-slate-200 select-none"
          >
            <defs>
              <linearGradient id="siteAGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="avsGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#082f49" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="splitBrainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.15)" />
                <stop offset="100%" stopColor="rgba(245, 158, 11, 0.02)" />
              </linearGradient>
              <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Split Brain Warning Zone Background */}
            <rect
              x="260"
              y="22"
              width="440"
              height="285"
              rx="12"
              fill="url(#splitBrainGrad)"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <g transform="translate(390, 32)">
              <rect x="0" y="0" width="180" height="24" rx="4" fill="#78350f" fillOpacity="0.8" stroke="#f59e0b" strokeWidth="1" />
              <text x="90" y="16" fill="#fef3c7" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                SPLIT-BRAIN LATENCY ZONE
              </text>
            </g>
            <text x="480" y="70" fill="#fcd34d" fontSize="9.5" fontFamily="Plus Jakarta Sans" textAnchor="middle">
              Mitigated by Co-Located Wave Design & MON (Avoids Tromboning Over WAN)
            </text>

            {/* Site A (On-Premises) Box */}
            <rect x="20" y="30" width="220" height="270" rx="10" fill="url(#siteAGrad)" stroke="#334155" strokeWidth="1.5" />
            <rect x="30" y="40" width="200" height="26" rx="4" fill="#1e293b" />
            <text x="40" y="57" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              SITE A (ON-PREMISES)
            </text>

            {/* Site A Components */}
            <g transform="translate(35, 76)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#0f172a" stroke="#475569" />
              <text x="12" y="18" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">vSphere ESXi Cluster</text>
              <text x="12" y="32" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">SQL / Postgres / OpenShift</text>
            </g>

            <g transform="translate(35, 126)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#0f172a" stroke="#475569" />
              <text x="12" y="18" fill="#cbd5e1" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Local Default Gateway</text>
              <text x="12" y="32" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">Core Switch / L3 Router</text>
            </g>

            <g transform="translate(35, 176)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#082f49" stroke="#0284c7" />
              <text x="12" y="18" fill="#38bdf8" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">HCX-IX & HCX-NE</text>
              <text x="12" y="32" fill="#7dd3fc" fontSize="9" fontFamily="JetBrains Mono">Interconnect & L2 Extension</text>
            </g>

            <g transform="translate(35, 226)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#451a03" stroke="#b45309" strokeDasharray="3 3" />
              <text x="12" y="18" fill="#fed7aa" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Oracle Cluster (Separate Track)</text>
              <text x="12" y="32" fill="#fdba74" fontSize="9" fontFamily="JetBrains Mono">Shared Disk / Non-RAV</text>
            </g>

            {/* Transit Center (VPN & ExpressRoute) */}
            {/* IPsec VPN Path */}
            <path d="M 240 160 L 720 160" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6 4" />
            <g transform="translate(420, 136)">
              <rect x="0" y="0" width="120" height="24" rx="4" fill="#020617" stroke="#06b6d4" strokeWidth="1" />
              <text x="60" y="16" fill="#22d3ee" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                IPsec VPN (Majority)
              </text>
            </g>

            {/* ExpressRoute Path */}
            <path d="M 240 215 L 720 215" stroke="#10b981" strokeWidth="2.5" />
            <g transform="translate(405, 203)">
              <rect x="0" y="0" width="150" height="24" rx="4" fill="#020617" stroke="#10b981" strokeWidth="1" />
              <text x="75" y="16" fill="#34d399" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                ExpressRoute (Where Procured)
              </text>
            </g>

            {/* L2 Stretched Network Line across the bottom */}
            <path d="M 130 220 L 130 280 L 830 280 L 830 220" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 3" />
            <g transform="translate(400, 268)">
              <rect x="0" y="0" width="160" height="22" rx="4" fill="#3b0764" stroke="#a855f7" strokeWidth="1" />
              <text x="80" y="15" fill="#f3e8ff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                HCX Stretched L2 Subnet
              </text>
            </g>

            {/* Target Region A (Azure VMware Solution) Box */}
            <rect x="720" y="30" width="220" height="270" rx="10" fill="url(#avsGrad)" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="730" y="40" width="200" height="26" rx="4" fill="#0c4a6e" />
            <text x="740" y="57" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              REGION A: AZURE AVS
            </text>

            {/* AVS Components */}
            <g transform="translate(735, 76)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#0f172a" stroke="#0369a1" />
              <text x="12" y="18" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">AVS Bare-Metal ESXi</text>
              <text x="12" y="32" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">AV36 / AV64 Cluster</text>
            </g>

            <g transform="translate(735, 126)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#0f172a" stroke="#0369a1" />
              <text x="12" y="18" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">NSX-T Tier-0 / Tier-1</text>
              <text x="12" y="32" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">MON Gateway Activated</text>
            </g>

            <g transform="translate(735, 176)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#082f49" stroke="#0284c7" />
              <text x="12" y="18" fill="#38bdf8" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">HCX Cloud Appliance</text>
              <text x="12" y="32" fill="#7dd3fc" fontSize="9" fontFamily="JetBrains Mono">RAV & Bulk Target</text>
            </g>

            <g transform="translate(735, 226)">
              <rect x="0" y="0" width="190" height="42" rx="6" fill="#0f172a" stroke="#0369a1" />
              <text x="12" y="18" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Azure NetApp Files (ANF)</text>
              <text x="12" y="32" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">External NFS Datastores</text>
            </g>

            {/* Bottom Wave Sequence Strip */}
            <g transform="translate(20, 330)">
              <rect x="0" y="0" width="920" height="135" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <text x="20" y="24" fill="#94a3b8" fontSize="10.5" fontFamily="JetBrains Mono" fontWeight="bold">
                REPEATABLE 4-STAGE MIGRATION WAVE SEQUENCE
              </text>

              {/* 4 Wave Columns */}
              <g transform="translate(15, 36)">
                {/* Wave 1 */}
                <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                <rect x="8" y="8" width="55" height="18" rx="3" fill="#0369a1" />
                <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STAGE 1</text>
                <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Discovery & Sizing</text>
                <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">RVTools blocker detection</text>
                <text x="8" y="72" fill="#38bdf8" fontSize="8.5" fontFamily="Plus Jakarta Sans">ANF external NFS sizing</text>

                {/* Wave 2 */}
                <g transform="translate(226, 0)">
                  <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#7c3aed" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STAGE 2</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Network & Tracks</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">HCX L2 Network Extension</text>
                  <text x="8" y="72" fill="#f59e0b" fontSize="8.5" fontFamily="Plus Jakarta Sans">Oracle isolated track setup</text>
                </g>

                {/* Wave 3 */}
                <g transform="translate(452, 0)">
                  <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#059669" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STAGE 3</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">HCX RAV Cutover</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">SQL, Postgres, OpenShift</text>
                  <text x="8" y="72" fill="#34d399" fontSize="8.5" fontFamily="Plus Jakarta Sans">Zero downtime (kept IP)</text>
                </g>

                {/* Wave 4 */}
                <g transform="translate(678, 0)">
                  <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#0891b2" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STAGE 4</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">HCX Bulk & Unstretch</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">Batch tiers (minimal downtime)</text>
                  <text x="8" y="72" fill="#38bdf8" fontSize="8.5" fontFamily="Plus Jakarta Sans">L2 unstretch & default routes</text>
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> IPsec VPN Tunnel
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> ExpressRoute Circuit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-purple-400 inline-block" /> L2 Stretched Segment
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Note: Broadcom has rebranded VMware Aria under VCF Operations & Automation.
          </span>
        </div>
      </div>
    );
  }

  if (id === 'avs-cross-region-flow') {
    return (
      <div className={`w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono font-bold text-white tracking-wider uppercase">
              Inter-Region AVS Workload Mobility & Global Reach Transit
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Region A (Source AVS) &harr; Region B (Target AVS)</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300">Sovereign Cloud Transit</span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto py-4">
          <svg viewBox="0 0 960 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto min-w-[760px] text-slate-200 select-none">
            <defs>
              <linearGradient id="regAGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#082f49" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="regBGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="globalReachGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(14, 165, 233, 0.15)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.15)" />
              </linearGradient>
            </defs>

            {/* Global Reach Backbone Zone */}
            <rect x="270" y="30" width="420" height="270" rx="12" fill="url(#globalReachGrad)" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 4" />
            <g transform="translate(370, 42)">
              <rect x="0" y="0" width="220" height="26" rx="4" fill="#0369a1" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1" />
              <text x="110" y="17" fill="#f0f9ff" fontSize="10.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                EXPRESSROUTE GLOBAL REACH
              </text>
            </g>
            <text x="480" y="90" fill="#7dd3fc" fontSize="9.5" fontFamily="Plus Jakarta Sans" textAnchor="middle">
              High-Throughput Inter-Region Private Backbone · Sub-Millisecond Jitter
            </text>

            {/* Region A Box */}
            <rect x="20" y="30" width="230" height="270" rx="10" fill="url(#regAGrad)" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="30" y="40" width="210" height="26" rx="4" fill="#0c4a6e" />
            <text x="40" y="57" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              REGION A (SOURCE AVS)
            </text>

            <g transform="translate(35, 76)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#020617" stroke="#0369a1" />
              <text x="12" y="18" fill="#f0f9ff" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Active AVS SDDC Cluster</text>
              <text x="12" y="32" fill="#7dd3fc" fontSize="9" fontFamily="JetBrains Mono">SQL / Postgres / OpenShift</text>
            </g>

            <g transform="translate(35, 126)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#020617" stroke="#0284c7" />
              <text x="12" y="18" fill="#38bdf8" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">HCX Interconnect (IX / NE)</text>
              <text x="12" y="32" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">RAV & L2 Stretched Subnets</text>
            </g>

            <g transform="translate(35, 176)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#020617" stroke="#d97706" />
              <text x="12" y="18" fill="#fcd34d" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Active Primary DR Pathway</text>
              <text x="12" y="32" fill="#fde68a" fontSize="9" fontFamily="JetBrains Mono">5-15 Min RPO Replication Leg</text>
            </g>

            <g transform="translate(35, 226)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#0f172a" stroke="#475569" />
              <text x="12" y="18" fill="#cbd5e1" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Azure NetApp Files (ANF)</text>
              <text x="12" y="32" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">Regional NFS Datastores</text>
            </g>

            {/* Region B Box */}
            <rect x="710" y="30" width="230" height="270" rx="10" fill="url(#regBGrad)" stroke="#059669" strokeWidth="1.5" />
            <rect x="720" y="40" width="210" height="26" rx="4" fill="#065f46" />
            <text x="730" y="57" fill="#6ee7b7" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              REGION B (TARGET AVS)
            </text>

            <g transform="translate(725, 76)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#020617" stroke="#047857" />
              <text x="12" y="18" fill="#ecfdf5" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Target AVS Host Cluster</text>
              <text x="12" y="32" fill="#6ee7b7" fontSize="9" fontFamily="JetBrains Mono">AV36P / AV64 Nodes</text>
            </g>

            <g transform="translate(725, 126)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#020617" stroke="#059669" />
              <text x="12" y="18" fill="#34d399" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">HCX Target Interconnect</text>
              <text x="12" y="32" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">Destination Mesh Endpoints</text>
            </g>

            <g transform="translate(725, 176)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#020617" stroke="#10b981" />
              <text x="12" y="18" fill="#a7f3d0" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">New Target DR Link</text>
              <text x="12" y="32" fill="#6ee7b7" fontSize="9" fontFamily="JetBrains Mono">Dual DR: Continuous Protection</text>
            </g>

            <g transform="translate(725, 226)">
              <rect x="0" y="0" width="200" height="42" rx="6" fill="#0f172a" stroke="#475569" />
              <text x="12" y="18" fill="#cbd5e1" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Target ANF (10-Min Min Schedule)</text>
              <text x="12" y="32" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">NFS Storage Decoupling</text>
            </g>

            {/* Connecting Lines */}
            <path d="M 235 147 L 725 147" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="480" cy="147" r="5" fill="#38bdf8" />
            <text x="480" y="137" fill="#e0f2fe" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
              HCX RAV & Bulk Over Global Reach
            </text>

            <path d="M 235 197 L 725 197" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
            <text x="480" y="215" fill="#fcd34d" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
              Dual-DR Synchronization Link (Zero Coverage Gap)
            </text>

            {/* Migration Stages Strip */}
            <g transform="translate(20, 325)">
              <rect x="0" y="0" width="920" height="135" rx="10" fill="#0f172a" stroke="#1e293b" />
              <text x="20" y="24" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                CROSS-REGION CUTOVER WORKFLOW
              </text>

              <g transform="translate(15, 36)">
                <g transform="translate(0, 0)">
                  <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#0284c7" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STEP 1</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Global Reach Peering</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">Inter-region ExpressRoute link</text>
                  <text x="8" y="72" fill="#38bdf8" fontSize="8.5" fontFamily="Plus Jakarta Sans">HCX version parity check</text>
                </g>

                <g transform="translate(226, 0)">
                  <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#d97706" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STEP 2</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Dual-DR Establishment</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">Target region DR initialized</text>
                  <text x="8" y="72" fill="#fcd34d" fontSize="8.5" fontFamily="Plus Jakarta Sans">Continuous 5-15 min RPO</text>
                </g>

                <g transform="translate(452, 0)">
                  <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#059669" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STEP 3</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">RAV Live Migration</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">SQL, Postgres, OpenShift</text>
                  <text x="8" y="72" fill="#34d399" fontSize="8.5" fontFamily="Plus Jakarta Sans">Zero downtime (kept IP)</text>
                </g>

                <g transform="translate(678, 0)">
                  <rect x="0" y="0" width="212" height="85" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#0891b2" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">STEP 4</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Bulk Cutover & Unstretch</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">Batch tiers (minimal downtime)</text>
                  <text x="8" y="72" fill="#38bdf8" fontSize="8.5" fontFamily="Plus Jakarta Sans">Retire Region A SDDC cleanly</text>
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Global Reach Interconnect</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Dual-DR Replication</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Target AVS Cloud</span>
          </div>
          <span className="text-[11px] text-slate-500">Note: Broadcom has rebranded VMware Aria under VCF Operations & Automation.</span>
        </div>
      </div>
    );
  }

  if (id === 'avs-dr-failover-timeline') {
    return (
      <div className={`w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono font-bold text-white tracking-wider uppercase">
              Disaster Recovery Architecture & 5-Phase Failover/Failback Validation
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Primary AVS &rarr; SRM / JetStream &rarr; DR Site</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300">RPO 5-15m · RTO 1-2h</span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto py-4">
          <svg viewBox="0 0 960 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto min-w-[760px] text-slate-200 select-none">
            <defs>
              <linearGradient id="drPrimGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="drSecGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>

            {/* Primary Site Box */}
            <rect x="20" y="30" width="360" height="230" rx="10" fill="url(#drPrimGrad)" stroke="#4338ca" strokeWidth="1.5" />
            <rect x="30" y="40" width="340" height="26" rx="4" fill="#312e81" />
            <text x="40" y="57" fill="#a5b4fc" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              PRIMARY AVS PRODUCTION SDDC
            </text>

            <g transform="translate(35, 76)">
              <rect x="0" y="0" width="330" height="38" rx="6" fill="#020617" stroke="#4f46e5" />
              <text x="12" y="16" fill="#f1f5f9" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Tier 1: Transactional SQL & Postgres</text>
              <text x="12" y="30" fill="#a5b4fc" fontSize="8.5" fontFamily="JetBrains Mono">vSphere Replication (5-15 min RPO) / JetStream CDP</text>
            </g>
            <g transform="translate(35, 122)">
              <rect x="0" y="0" width="330" height="38" rx="6" fill="#020617" stroke="#4f46e5" />
              <text x="12" y="16" fill="#f1f5f9" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Tier 2: Red Hat OpenShift & App Services</text>
              <text x="12" y="30" fill="#a5b4fc" fontSize="8.5" fontFamily="JetBrains Mono">SRM Protection Groups & Automated Recovery Priority</text>
            </g>
            <g transform="translate(35, 168)">
              <rect x="0" y="0" width="330" height="38" rx="6" fill="#020617" stroke="#334155" />
              <text x="12" y="16" fill="#cbd5e1" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Decoupled ANF Storage NFS Datastores</text>
              <text x="12" y="30" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono">Volume Replication (10-Min Min Schedule)</text>
            </g>
            <g transform="translate(35, 214)">
              <rect x="0" y="0" width="330" height="34" rx="4" fill="#1e1b4b" />
              <text x="165" y="22" fill="#c7d2fe" fontSize="9.5" fontFamily="JetBrains Mono" textAnchor="middle">
                LIVE PRODUCTION TRAFFIC (NORMAL STATE)
              </text>
            </g>

            {/* Replication Channel in Middle */}
            <g transform="translate(410, 85)">
              <rect x="0" y="0" width="140" height="120" rx="8" fill="#0f172a" stroke="#d97706" strokeDasharray="4 4" />
              <text x="70" y="24" fill="#fbbf24" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">REPLICATION</text>
              <text x="70" y="44" fill="#fde68a" fontSize="8.5" fontFamily="JetBrains Mono" textAnchor="middle">vSphere Rep / SRM</text>
              <text x="70" y="60" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans" textAnchor="middle">RPO: 5-15 Minutes</text>
              <text x="70" y="80" fill="#f59e0b" fontSize="8.5" fontFamily="JetBrains Mono" textAnchor="middle">&larr; SRM Reprotect &rarr;</text>
              <text x="70" y="100" fill="#cbd5e1" fontSize="8" fontFamily="Plus Jakarta Sans" textAnchor="middle">Failback Pathway</text>
            </g>

            {/* Secondary DR Site Box */}
            <rect x="580" y="30" width="360" height="230" rx="10" fill="url(#drSecGrad)" stroke="#b45309" strokeWidth="1.5" />
            <rect x="590" y="40" width="340" height="26" rx="4" fill="#78350f" />
            <text x="600" y="57" fill="#fde68a" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              SECONDARY DR PRIVATE CLOUD
            </text>

            <g transform="translate(595, 76)">
              <rect x="0" y="0" width="330" height="38" rx="6" fill="#020617" stroke="#d97706" />
              <text x="12" y="16" fill="#fef3c7" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Air-Gapped Bubble Network (Test Drills)</text>
              <text x="12" y="30" fill="#fde68a" fontSize="8.5" fontFamily="JetBrains Mono">Zero disruption to production replication</text>
            </g>
            <g transform="translate(595, 122)">
              <rect x="0" y="0" width="330" height="38" rx="6" fill="#020617" stroke="#d97706" />
              <text x="12" y="16" fill="#fef3c7" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Production DR Failover Target</text>
              <text x="12" y="30" fill="#fde68a" fontSize="8.5" fontFamily="JetBrains Mono">Automated boot order: Tier 1 &rarr; 2 &rarr; 3 &rarr; 4</text>
            </g>
            <g transform="translate(595, 168)">
              <rect x="0" y="0" width="330" height="38" rx="6" fill="#020617" stroke="#334155" />
              <text x="12" y="16" fill="#cbd5e1" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Target DR Storage Volumes</text>
              <text x="12" y="30" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono">NFS Datastores mounted on standby nodes</text>
            </g>
            <g transform="translate(595, 214)">
              <rect x="0" y="0" width="330" height="34" rx="4" fill="#451a03" />
              <text x="165" y="22" fill="#fcd34d" fontSize="9.5" fontFamily="JetBrains Mono" textAnchor="middle">
                STANDBY CLUSTER · READY FOR DRILL
              </text>
            </g>

            {/* Connecting replication lines */}
            <path d="M 380 135 L 410 135" stroke="#fbbf24" strokeWidth="2" />
            <path d="M 550 135 L 580 135" stroke="#fbbf24" strokeWidth="2" />

            {/* Bottom: 5-Phase RTO Timeline Strip */}
            <g transform="translate(20, 280)">
              <rect x="0" y="0" width="920" height="185" rx="10" fill="#0f172a" stroke="#1e293b" />
              <div className="flex justify-between">
                <text x="20" y="25" fill="#f59e0b" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  5-PHASE OPERATIONAL RTO VALIDATION TIMELINE (1 - 2 HOURS MEASURED RTO)
                </text>
                <text x="900" y="25" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                  Illustrative sample sequence from semi-annual drill protocol
                </text>
              </div>

              <g transform="translate(15, 42)">
                {/* Phase 1 */}
                <g transform="translate(0, 0)">
                  <rect x="0" y="0" width="168" height="115" rx="6" fill="#020617" stroke="#312e81" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#4338ca" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">PHASE 1</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Trigger & Quiesce</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Initiate SRM recovery plan</text>
                  <text x="8" y="72" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Final delta sync flush</text>
                  <text x="8" y="88" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Quiesce primary nodes</text>
                  <text x="8" y="104" fill="#a5b4fc" fontSize="8.5" fontFamily="JetBrains Mono">Duration: 5-10m</text>
                </g>

                {/* Phase 2 */}
                <g transform="translate(180, 0)">
                  <rect x="0" y="0" width="168" height="115" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#0284c7" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">PHASE 2</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Storage & VM Boot</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Mount NFS storage at DR</text>
                  <text x="8" y="72" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Boot Tier 1: SQL/Postgres</text>
                  <text x="8" y="88" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Boot Tier 2: OpenShift/App</text>
                  <text x="8" y="104" fill="#38bdf8" fontSize="8.5" fontFamily="JetBrains Mono">Duration: 20-30m</text>
                </g>

                {/* Phase 3 */}
                <g transform="translate(360, 0)">
                  <rect x="0" y="0" width="168" height="115" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#d97706" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">PHASE 3</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Network & DNS Shift</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Azure Route Server BGP</text>
                  <text x="8" y="72" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Update internal DNS records</text>
                  <text x="8" y="88" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Flush client cache (60s TTL)</text>
                  <text x="8" y="104" fill="#fbbf24" fontSize="8.5" fontFamily="JetBrains Mono">Duration: 10-15m</text>
                </g>

                {/* Phase 4 */}
                <g transform="translate(540, 0)">
                  <rect x="0" y="0" width="168" height="115" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#059669" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">PHASE 4</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Application Validation</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Synthetic database queries</text>
                  <text x="8" y="72" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">OpenShift pod health check</text>
                  <text x="8" y="88" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">End-user synthetic login</text>
                  <text x="8" y="104" fill="#34d399" fontSize="8.5" fontFamily="JetBrains Mono">Duration: 15-20m</text>
                </g>

                {/* Phase 5 */}
                <g transform="translate(720, 0)">
                  <rect x="0" y="0" width="168" height="115" rx="6" fill="#020617" stroke="#1e293b" />
                  <rect x="8" y="8" width="55" height="18" rx="3" fill="#0d9488" />
                  <text x="35" y="20" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">PHASE 5</text>
                  <text x="8" y="42" fill="#f1f5f9" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Reprotect & Failback</text>
                  <text x="8" y="58" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Reverse replication sync</text>
                  <text x="8" y="72" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">Scheduled failback return</text>
                  <text x="8" y="88" fill="#94a3b8" fontSize="8" fontFamily="Plus Jakarta Sans">SRM reprotect verified</text>
                  <text x="8" y="104" fill="#2dd4bf" fontSize="8.5" fontFamily="JetBrains Mono">Duration: Scheduled</text>
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-indigo-400 inline-block" /> Primary AVS Production</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Replication / SRM Pathway</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Secondary Standby DR</span>
          </div>
          <span className="text-[11px] text-slate-500">Note: Broadcom has rebranded VMware Aria under VCF Operations & Automation.</span>
        </div>
      </div>
    );
  }

  if (id === 'gcve-vmc-hybrid-transit') {
    return (
      <div className={`w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-white tracking-wider uppercase">
              Multi-Cloud Architecture: On-Premises to GCVE & VMC on AWS
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>On-Premises &rarr; Private Services Access / Connected VPC</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-300">Multi-Cloud Delivery</span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto py-4">
          <svg viewBox="0 0 960 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto min-w-[760px] text-slate-200 select-none">
            <defs>
              <linearGradient id="onPremGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="gcveGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#14532d" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="vmcGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c2d12" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>

            {/* Left: On-Premises Box */}
            <rect x="20" y="30" width="230" height="420" rx="10" fill="url(#onPremGrad)" stroke="#475569" strokeWidth="1.5" />
            <rect x="30" y="40" width="210" height="26" rx="4" fill="#334155" />
            <text x="40" y="57" fill="#f8fafc" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              ON-PREMISES DATACENTER
            </text>

            <g transform="translate(35, 80)">
              <rect x="0" y="0" width="200" height="48" rx="6" fill="#020617" stroke="#64748b" />
              <text x="12" y="18" fill="#f1f5f9" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">vSphere ESXi Clusters</text>
              <text x="12" y="34" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">SQL / Postgres / OpenShift</text>
            </g>

            <g transform="translate(35, 140)">
              <rect x="0" y="0" width="200" height="52" rx="6" fill="#451a03" stroke="#b45309" />
              <text x="12" y="18" fill="#fef3c7" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="700">Oracle Clusters (Separate Track)</text>
              <text x="12" y="32" fill="#fde68a" fontSize="8.5" fontFamily="JetBrains Mono">Shared-Disk / Multi-Writer</text>
              <text x="12" y="44" fill="#f59e0b" fontSize="8" fontFamily="Plus Jakarta Sans">Live RAV unsupported</text>
            </g>

            <g transform="translate(35, 205)">
              <rect x="0" y="0" width="200" height="48" rx="6" fill="#020617" stroke="#0284c7" />
              <text x="12" y="18" fill="#38bdf8" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">VMware HCX Connector</text>
              <text x="12" y="34" fill="#7dd3fc" fontSize="9" fontFamily="JetBrains Mono">Replication & Network Extension</text>
            </g>

            <g transform="translate(35, 265)">
              <rect x="0" y="0" width="200" height="48" rx="6" fill="#020617" stroke="#475569" />
              <text x="12" y="18" fill="#cbd5e1" fontSize="10.5" fontFamily="Plus Jakarta Sans" fontWeight="600">Edge Gateway & Core Routing</text>
              <text x="12" y="34" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">IPsec VPN / Direct Interconnect</text>
            </g>

            <g transform="translate(35, 330)">
              <rect x="0" y="0" width="200" height="105" rx="6" fill="#0f172a" stroke="#334155" />
              <text x="12" y="20" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">PRE-MIGRATION AUDIT</text>
              <text x="12" y="38" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">RVTools Readiness Assessment</text>
              <text x="12" y="54" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">Flag RDMs & snapshot chains</text>
              <text x="12" y="70" fill="#94a3b8" fontSize="8.5" fontFamily="Plus Jakarta Sans">reIP vs L2 stretch evaluation</text>
              <text x="12" y="90" fill="#34d399" fontSize="8.5" fontFamily="JetBrains Mono">Client-side sizing tools</text>
            </g>

            {/* Center Transit Channels */}
            <g transform="translate(265, 80)">
              <path d="M 0 50 L 120 0" stroke="#10b981" strokeWidth="2.5" />
              <rect x="15" y="0" width="100" height="30" rx="4" fill="#064e3b" stroke="#059669" />
              <text x="65" y="15" fill="#a7f3d0" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">GOOGLE CLUSTER</text>
              <text x="65" y="25" fill="#6ee7b7" fontSize="7" fontFamily="JetBrains Mono" textAnchor="middle">PSA Interconnect</text>

              <path d="M 0 170 L 120 220" stroke="#f97316" strokeWidth="2.5" />
              <rect x="15" y="205" width="100" height="30" rx="4" fill="#7c2d12" stroke="#ea580c" />
              <text x="65" y="220" fill="#fed7aa" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">AWS CLUSTER</text>
              <text x="65" y="230" fill="#fdba74" fontSize="7" fontFamily="JetBrains Mono" textAnchor="middle">Direct Connect / ENI</text>
            </g>

            {/* Right Top: GCVE Box */}
            <rect x="400" y="30" width="540" height="195" rx="10" fill="url(#gcveGrad)" stroke="#16a34a" strokeWidth="1.5" />
            <rect x="410" y="40" width="520" height="26" rx="4" fill="#14532d" />
            <text x="420" y="57" fill="#86efac" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              GOOGLE CLOUD VMWARE ENGINE (GCVE) — PRIVATE ENTERPRISE
            </text>

            <g transform="translate(415, 75)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#020617" stroke="#16a34a" />
              <text x="12" y="16" fill="#f0fdf4" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">ve1-standard-72 / ve2 Nodes</text>
              <text x="12" y="32" fill="#86efac" fontSize="8.5" fontFamily="JetBrains Mono">72 vCPU / 768 GB RAM per host</text>
            </g>

            <g transform="translate(675, 75)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#020617" stroke="#16a34a" />
              <text x="12" y="16" fill="#f0fdf4" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Private Services Access (PSA)</text>
              <text x="12" y="32" fill="#86efac" fontSize="8.5" fontFamily="JetBrains Mono">Cloud Router BGP / DNS Peering</text>
            </g>

            <g transform="translate(415, 126)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#020617" stroke="#15803d" />
              <text x="12" y="16" fill="#f0fdf4" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Google Cloud NetApp Volumes</text>
              <text x="12" y="32" fill="#4ade80" fontSize="8.5" fontFamily="JetBrains Mono">Decoupled External NFS Datastore</text>
            </g>

            <g transform="translate(675, 126)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#052e16" stroke="#22c55e" />
              <text x="12" y="16" fill="#dcfce7" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Google BigQuery Integration</text>
              <text x="12" y="32" fill="#86efac" fontSize="8.5" fontFamily="JetBrains Mono">Sub-2ms Direct Cloud Analytics</text>
            </g>

            <text x="670" y="195" fill="#86efac" fontSize="9" fontFamily="Plus Jakarta Sans" textAnchor="middle">
              Migration Method: HCX RAV (Zero downtime kept IP) & Bulk (Minimal downtime scheduled reboots)
            </text>

            {/* Right Bottom: VMC on AWS Box */}
            <rect x="400" y="240" width="540" height="210" rx="10" fill="url(#vmcGrad)" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="410" y="250" width="520" height="26" rx="4" fill="#7c2d12" />
            <text x="420" y="267" fill="#fed7aa" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              VMWARE CLOUD ON AWS (VMC) — PRIVATE ENTERPRISE
            </text>

            <g transform="translate(415, 285)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#020617" stroke="#ea580c" />
              <text x="12" y="16" fill="#fff7ed" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">i4i.metal Bare-Metal Hosts</text>
              <text x="12" y="32" fill="#fdba74" fontSize="8.5" fontFamily="JetBrains Mono">64 vCPU / 1024 GB RAM / NVMe</text>
            </g>

            <g transform="translate(675, 285)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#020617" stroke="#ea580c" />
              <text x="12" y="16" fill="#fff7ed" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Connected VPC Architecture</text>
              <text x="12" y="32" fill="#fdba74" fontSize="8.5" fontFamily="JetBrains Mono">Cross-Account ENI Zero-Egress Link</text>
            </g>

            <g transform="translate(415, 336)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#020617" stroke="#c2410c" />
              <text x="12" y="16" fill="#fff7ed" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Amazon FSx for NetApp ONTAP</text>
              <text x="12" y="32" fill="#fb923c" fontSize="8.5" fontFamily="JetBrains Mono">Decoupled Multi-AZ NFS Storage</text>
            </g>

            <g transform="translate(675, 336)">
              <rect x="0" y="0" width="250" height="44" rx="6" fill="#431407" stroke="#f97316" />
              <text x="12" y="16" fill="#ffedd5" fontSize="10" fontFamily="Plus Jakarta Sans" fontWeight="600">Native AWS Services Adjacency</text>
              <text x="12" y="32" fill="#fdba74" fontSize="8.5" fontFamily="JetBrains Mono">Direct Amazon Aurora & S3 Access</text>
            </g>

            <text x="670" y="405" fill="#fed7aa" fontSize="9" fontFamily="Plus Jakarta Sans" textAnchor="middle">
              Migration Method: HCX RAV (Zero downtime kept IP) & Bulk (Minimal downtime scheduled reboots)
            </text>
          </svg>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> On-Premises Estate</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Google Cloud PSA & GCVE</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-orange-400 inline-block" /> AWS Connected VPC & VMC</span>
          </div>
          <span className="text-[11px] text-slate-500">Note: Broadcom has rebranded VMware Aria under VCF Operations & Automation.</span>
        </div>
      </div>
    );
  }

  return null;
};
