import React, { useState, useEffect } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { CaseStudy } from '../types/siteData';
import {
  X,
  CheckCircle2,
  Trash2,
  Plus,
  ShieldCheck,
  Save,
  Briefcase,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Server,
  Activity,
  Cpu
} from 'lucide-react';

const AVAILABLE_DIAGRAMS = [
  { id: 'avs-gov-network-flow', label: 'AVS Migration & FastPath Transit Topology' },
  { id: 'avs-cross-region-flow', label: 'AVS Cross-Region Replication & Global Reach' },
  { id: 'avs-dr-failover-timeline', label: 'AVS Disaster Recovery Failover Timeline (5-15 min RPO)' },
  { id: 'gcve-vmc-hybrid-transit', label: 'GCVE & VMC on AWS Dual-Cloud Transit & Sizing' },
  { id: 'nsx-microseg-flow-pipeline', label: 'NSX-T Micro-segmentation & DFW Architecture' },
  { id: 'aria-ops-networks-architecture', label: 'Aria Operations for Networks Flow Analysis' },
  { id: 'aria-automation-lifecycle', label: 'Aria Automation Multi-Tier Cloud Templates' }
];

export const TrackRecordEditorModal: React.FC = () => {
  const {
    isTrackRecordModalOpen,
    setIsTrackRecordModalOpen,
    activeEditCaseStudy,
    setActiveEditCaseStudy,
    addCaseStudy,
    updateCaseStudy,
    deleteCaseStudy
  } = useCustomization();

  const isEditing = Boolean(activeEditCaseStudy);

  const [sector, setSector] = useState('');
  const [title, setTitle] = useState('');
  const [h1, setH1] = useState('');
  const [slug, setSlug] = useState('');
  const [scale, setScale] = useState('');
  const [platforms, setPlatforms] = useState('');
  const [connectivity, setConnectivity] = useState('');
  const [role, setRole] = useState('');
  const [summary, setSummary] = useState('');
  const [diagram, setDiagram] = useState('avs-migration-flow-pipeline');
  const [verifiedBadge, setVerifiedBadge] = useState('VERIFIED ARCHITECTURE');
  const [lessons, setLessons] = useState<string[]>([]);
  const [newLessonInput, setNewLessonInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (activeEditCaseStudy) {
      setSector(activeEditCaseStudy.facts?.sector || activeEditCaseStudy.sector || 'Middle East Government Entities');
      setTitle(activeEditCaseStudy.title || '');
      setH1(activeEditCaseStudy.h1 || activeEditCaseStudy.title || '');
      setSlug(activeEditCaseStudy.slug || activeEditCaseStudy.id || '');
      setScale(activeEditCaseStudy.facts?.scale || activeEditCaseStudy.metrics?.vms || '50-100 VMs average, up to 300 VMs');
      setPlatforms(
        activeEditCaseStudy.facts?.platforms ||
        (Array.isArray(activeEditCaseStudy.platforms) ? activeEditCaseStudy.platforms.join(', ') : 'Azure VMware Solution, VMware HCX')
      );
      setConnectivity(activeEditCaseStudy.facts?.connectivity || 'ExpressRoute FastPath and VPN');
      setRole(activeEditCaseStudy.facts?.role || 'Principal VMware Architect');
      setSummary(activeEditCaseStudy.summary || '');
      setDiagram(activeEditCaseStudy.diagram || 'avs-migration-flow-pipeline');
      setVerifiedBadge(activeEditCaseStudy.verifiedBadge || 'VERIFIED ARCHITECTURE');
      setLessons(
        activeEditCaseStudy.lessonsLearned && activeEditCaseStudy.lessonsLearned.length > 0
          ? activeEditCaseStudy.lessonsLearned
          : activeEditCaseStudy.architectureSolution || []
      );
    } else {
      // New case study defaults adhering to Approved Fact Sheet
      setSector('Middle East Government Entities');
      setTitle('Standardised VMware Migration and Sovereign DR Framework');
      setH1('Standardised VMware to Hyperscaler Migration Framework for Public Sector');
      setSlug(`gov-vmware-migration-${Date.now().toString().slice(-4)}`);
      setScale('50-100 VMs average, up to 300 VMs');
      setPlatforms('Azure VMware Solution, VMware HCX');
      setConnectivity('ExpressRoute FastPath with VPN secondary failover');
      setRole('Principal VMware Architect');
      setSummary('Standardised multi-cluster VMware cloud migration ensuring data residency, minimal maintenance window downtime, and decoupled external storage pools.');
      setDiagram('avs-migration-flow-pipeline');
      setVerifiedBadge('VERIFIED ARCHITECTURE');
      setLessons([
        'Pre-audit MTU settings across all IPSec and ExpressRoute endpoints before scheduling replication waves.',
        'Validate external NFS datastore performance with synthetic workloads prior to final cutover.',
        'Enforce non-overlapping CIDR allocations across on-premises and target cloud subnets to eliminate re-IP delays.'
      ]);
    }
  }, [activeEditCaseStudy, isTrackRecordModalOpen]);

  if (!isTrackRecordModalOpen) return null;

  const handleAddLesson = () => {
    if (!newLessonInput.trim()) return;
    setLessons(prev => [...prev, newLessonInput.trim()]);
    setNewLessonInput('');
  };

  const handleRemoveLesson = (index: number) => {
    setLessons(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a title for the case study.');
      return;
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || `cs-${Date.now()}`;
    const parsedPlatforms = platforms.split(',').map(p => p.trim()).filter(Boolean);

    const payload: CaseStudy = {
      ...(activeEditCaseStudy || {}),
      id: cleanSlug,
      slug: cleanSlug,
      title: title.trim(),
      h1: h1.trim() || title.trim(),
      metaTitle: activeEditCaseStudy?.metaTitle || `${title.trim()} - Zaboraa`,
      metaDescription: activeEditCaseStudy?.metaDescription || summary.trim().slice(0, 155),
      sector: sector.trim(),
      platforms: parsedPlatforms.length > 0 ? parsedPlatforms : ['Azure VMware Solution', 'VMware HCX'],
      facts: {
        sector: sector.trim(),
        scale: scale.trim(),
        platforms: platforms.trim(),
        connectivity: connectivity.trim(),
        role: role.trim()
      },
      summary: summary.trim(),
      diagram,
      lessonsLearned: lessons.length > 0 ? lessons : ['Validated architectural cutover and governance runbooks.'],
      sections: activeEditCaseStudy?.sections || [
        {
          heading: 'Executive Architecture Overview',
          body: [summary.trim()]
        }
      ],
      faq: activeEditCaseStudy?.faq || [],
      relatedTools: activeEditCaseStudy?.relatedTools || [],
      relatedDisciplines: activeEditCaseStudy?.relatedDisciplines || [],
      relatedSlugs: activeEditCaseStudy?.relatedSlugs || [],
      keywords: activeEditCaseStudy?.keywords || ['VMware Migration', 'Disaster Recovery', 'Sovereign Cloud'],
      verifiedBadge: verifiedBadge.trim() || 'VERIFIED ARCHITECTURE',
      // Legacy compatibility fields
      metrics: {
        vms: scale.trim(),
        downtime: 'Maintenance window cutover',
        costReduction: 'Optimized node sizing',
        timeline: connectivity.trim()
      },
      architectureSolution: lessons,
      datePublished: activeEditCaseStudy?.datePublished || '2026-11-03',
      dateModified: '2026-11-03'
    };

    if (isEditing && activeEditCaseStudy) {
      updateCaseStudy(activeEditCaseStudy.slug || activeEditCaseStudy.id || cleanSlug, payload);
      setNotification(`Updated "${payload.title}" successfully!`);
    } else {
      addCaseStudy(payload);
      setNotification(`Added new case study "${payload.title}"!`);
    }

    setTimeout(() => {
      setNotification(null);
      setIsTrackRecordModalOpen(false);
      setActiveEditCaseStudy(null);
    }, 1000);
  };

  const handleDelete = () => {
    if (!activeEditCaseStudy) return;
    if (window.confirm(`Are you sure you want to delete "${activeEditCaseStudy.title}"?`)) {
      deleteCaseStudy(activeEditCaseStudy.slug || activeEditCaseStudy.id || '');
      setIsTrackRecordModalOpen(false);
      setActiveEditCaseStudy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        data-theme-container="dark"
        className="dark-card dark-feature-container relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-xs text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isEditing ? 'Edit Enterprise Case Study' : 'Author New Case Study'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                  VERIFIED ARCHITECTURE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Configure case study facts, architectural diagram, and lessons learned with full persistence.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsTrackRecordModalOpen(false);
              setActiveEditCaseStudy(null);
            }}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Section 1: Overview & Classification */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Client Sector / Domain
                </label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="e.g. Middle East Government Entities"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  URL Route Slug (/case-studies/...)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. middle-east-gov-avs-framework"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Display Title (Navigation & Card Heading)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Middle East Government AVS Migration Framework"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Page H1 (Detail Article Headline)
              </label>
              <input
                type="text"
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                placeholder="e.g. Standardised VMware to Azure VMware Solution Migration for Middle East Government Entities"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Executive Architecture Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="Brief description of the migration architecture, replication engine, and storage decoupling."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 2: Concrete Architectural Facts */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Architectural Facts Sheet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                  Estate Scale (Workloads)
                </label>
                <input
                  type="text"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  placeholder="e.g. 50-100 VMs average, up to 300 VMs"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                  Cloud Platforms & Tools (comma-separated)
                </label>
                <input
                  type="text"
                  value={platforms}
                  onChange={(e) => setPlatforms(e.target.value)}
                  placeholder="e.g. Azure VMware Solution, VMware HCX"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                  Network Connectivity & Transit
                </label>
                <input
                  type="text"
                  value={connectivity}
                  onChange={(e) => setConnectivity(e.target.value)}
                  placeholder="e.g. ExpressRoute FastPath, VPN"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                  Architecture Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Principal VMware Architect"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Interactive Architecture Vector Diagram */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architecture Vector Diagram Association</span>
            </label>
            <select
              value={diagram}
              onChange={(e) => setDiagram(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              {AVAILABLE_DIAGRAMS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} ({d.id})
                </option>
              ))}
            </select>
          </div>

          {/* Section 4: Engineering Lessons Learned */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lessons Learned & Architectural Insights ({lessons.length})</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Bullet-Point Findings</span>
            </div>

            <div className="space-y-2">
              {lessons.map((sol, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 group"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={sol}
                    onChange={(e) => {
                      const updated = [...lessons];
                      updated[idx] = e.target.value;
                      setLessons(updated);
                    }}
                    className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none focus:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLesson(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Lesson Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newLessonInput}
                onChange={(e) => setNewLessonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLesson();
                  }
                }}
                placeholder="Add architectural lesson or takeaway (press Enter)..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddLesson}
                className="px-3 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Case Study</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTrackRecordModalOpen(false);
                  setActiveEditCaseStudy(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Publish Case Study'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
