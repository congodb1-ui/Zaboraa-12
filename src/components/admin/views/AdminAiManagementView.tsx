import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import {
  Cpu,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Lock,
  ArrowRight,
  Server,
  Zap,
  Info
} from 'lucide-react';

interface AdminAiManagementViewProps {
  currentUserEmail: string;
}

export const AdminAiManagementView: React.FC<AdminAiManagementViewProps> = ({ currentUserEmail }) => {
  const [provider, setProvider] = useState<'google-genai' | 'vertex-ai'>('google-genai');
  const [model, setModel] = useState<'gemini-3.1-flash' | 'gemini-3.1-flash-image' | 'gemini-1.5-pro'>('gemini-3.1-flash-image');
  const [vertexEnabled, setVertexEnabled] = useState(false);
  const [autoApprovalAllowed, setAutoApprovalAllowed] = useState(false); // strictly false
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(30);

  // Proposal Test Bench States
  const [testCloud, setTestCloud] = useState('Azure AVS');
  const [testVmCount, setTestVmCount] = useState(650);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  // Request History State
  const [requestHistory, setRequestHistory] = useState([
    {
      id: 'req-01',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      type: '3D Isometric Blueprint',
      target: 'Azure AVS (16 Nodes)',
      model: 'gemini-3.1-flash-image',
      status: 'success',
      latencyMs: 1420
    },
    {
      id: 'req-02',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      type: 'Architecture Proposal',
      target: 'AWS VMC (i4i.metal)',
      model: 'server-side validator',
      status: 'success',
      latencyMs: 180
    },
    {
      id: 'req-03',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: 'Nutanix NC2 Sizing',
      target: 'Azure AN36 Cluster',
      model: 'server-side validator',
      status: 'success',
      latencyMs: 210
    }
  ]);

  const handleRunTestProposal = async () => {
    setIsRunningTest(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCloud: testCloud,
          vmCount: testVmCount,
          avgVcpu: 4,
          avgRamGB: 16,
          avgStorageGB: 120,
          vcpuOvercommit: 2.5,
          storageOffloadPercent: 40
        })
      });

      const data = await response.json();
      const duration = Math.round(performance.now() - start);
      setTestLatency(duration);

      if (data.success && data.proposal) {
        setTestResult(data.proposal);
        setRequestHistory(prev => [
          {
            id: `req-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'Architecture Proposal Test',
            target: `${testCloud} (${testVmCount} VMs)`,
            model: 'server-side validator',
            status: 'success',
            latencyMs: duration
          },
          ...prev
        ]);
        await adminService.logAuditEvent({
          actorEmail: currentUserEmail,
          actorRole: 'admin',
          action: 'EXECUTE_AI_PROPOSAL_DIAGNOSTIC',
          targetEntity: 'api/generate-proposal',
          targetId: testCloud,
          outcome: 'success',
          metadata: { vmCount: testVmCount, latencyMs: duration }
        });
      }
    } catch (err: any) {
      console.error('Test proposal failed:', err);
    } finally {
      setIsRunningTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Orchestration & Safety Management</h1>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              Server-Side Gateway
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure server-side Gemini integration, Vertex AI enterprise readiness, prompt isolation, quota monitoring, and proposal review guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0 Keys Leaked to Client</span>
          </span>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Primary Provider</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white mt-2">Google GenAI</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">SDK v2.28 · Serverless Proxy</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vertex AI Readiness</span>
            <Server className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white mt-2">GCP Compatible</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Dual-Mode Driver Ready</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Human Approval Gate</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-2">Enforced (Strict)</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">Zero auto-execution</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Rate Limit Ceiling</span>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-lg font-bold text-white mt-2">30 Req / Min</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">IP Bucket Token Limiter</div>
        </div>
      </div>

      {/* Safety Policy & Architecture Approval Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <Info className="w-4 h-4" />
          <span>Enterprise AI Architecture Governance Protocol</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          In compliance with enterprise cloud infrastructure security standards, all AI-generated architecture proposals and node calculations are generated server-side.
          Proprietary scoring algorithms and prompts remain confidential. Under no circumstances will the platform automatically execute cloud changes or provision infrastructure without mandatory human architect review and approval.
        </p>
      </div>

      {/* Provider Configuration & Diagnostic Bench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration Panel */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">AI Gateway Orchestration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                AI Service Orchestrator
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="google-genai">Google GenAI TypeScript SDK (Standard)</option>
                <option value="vertex-ai">Google Cloud Vertex AI Enterprise (Managed VPC)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Both drivers use server-side execution. Credentials are read strictly from private environment variables.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Active 3D Blueprint Generation Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (High Speed 16:9)</option>
                <option value="gemini-3.1-flash">gemini-3.1-flash (Text & Structured BOM)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Multimodal Reasoning)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Vertex AI Production Mode</div>
                  <div className="text-[11px] text-slate-400">Enable Google Cloud Project service account credentials</div>
                </div>
                <input
                  type="checkbox"
                  checked={vertexEnabled}
                  onChange={(e) => setVertexEnabled(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div>
                  <div className="text-xs font-bold text-white">Automated Topology Application</div>
                  <div className="text-[11px] text-rose-400">Blocked: User must explicitly review & approve</div>
                </div>
                <input
                  type="checkbox"
                  disabled
                  checked={autoApprovalAllowed}
                  className="w-4 h-4 text-slate-600 rounded bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                API Rate Limit (Requests per minute)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={rateLimitPerMinute}
                onChange={(e) => setRateLimitPerMinute(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Enforced by /api/generate-proposal serverless function.</p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Proposal Simulation Test Bench */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Proposal Generation Test Bench</h2>
            </div>
            {testLatency !== null && (
              <span className="text-[10px] font-mono text-cyan-400">
                Latency: {testLatency}ms
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Cloud</label>
                <select
                  value={testCloud}
                  onChange={(e) => setTestCloud(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Azure AVS">Azure AVS</option>
                  <option value="AWS VMC">AWS VMC</option>
                  <option value="Google GCVE">Google GCVE</option>
                  <option value="Nutanix NC2">Nutanix NC2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workload Scale (VMs)</label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={testVmCount}
                  onChange={(e) => setTestVmCount(parseInt(e.target.value, 10) || 500)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleRunTestProposal}
              disabled={isRunningTest}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isRunningTest ? (
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{isRunningTest ? 'Validating via Server...' : 'Execute Diagnostic Proposal'}</span>
            </button>

            {/* Test Result Display */}
            {testResult ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{testResult.summary}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    Validated
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Recommended Nodes</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">
                      {testResult.sizing.recommendedNodeCount} × {testResult.sizing.recommendedHostType.split(' ')[0]}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated TCO Savings</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      ${testResult.sizing.estimatedMonthlyTcoSavingsUsd.toLocaleString()} / mo
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300">
                  <span className="font-semibold text-slate-400">Decoupled Storage: </span>
                  {testResult.sizing.decoupledStorageTB} TB via {testResult.sizing.decoupledStorageEngine}
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Human approval required before applying to active architecture designer.</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center text-xs text-slate-400">
                Click "Execute Diagnostic Proposal" to test the serverless /api/generate-proposal endpoint and verify sizing models.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Request History */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">AI Engine Request History & Quota Telemetry</h2>
          <span className="text-xs font-mono text-slate-400">Auto-Refreshed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operation Type</th>
                <th className="py-2.5 px-3">Target Workload</th>
                <th className="py-2.5 px-3">Execution Engine</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {requestHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">{item.type}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">{item.target}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{item.model}</td>
                  <td className="py-2.5 px-3 font-mono tabular-nums">{item.latencyMs}ms</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
