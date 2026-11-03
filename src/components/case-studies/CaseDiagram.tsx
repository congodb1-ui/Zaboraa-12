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

  return null;
};
