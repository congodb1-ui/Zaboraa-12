import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Edit2,
  ExternalLink,
  ShieldCheck,
  BarChart,
  Save,
  X
} from 'lucide-react';
import {
  SeoPageMetadata,
  adminService
} from '../../../services/adminService';

interface AdminSeoViewProps {
  currentUserEmail: string;
}

export const AdminSeoView: React.FC<AdminSeoViewProps> = ({
  currentUserEmail
}) => {
  const [pages, setPages] = useState<SeoPageMetadata[]>([]);
  const [selectedPage, setSelectedPage] = useState<SeoPageMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'sitemap' | 'robots' | 'integrations'>('pages');
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Edit State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCanonical, setEditCanonical] = useState('');
  const [editOgImage, setEditOgImage] = useState('');
  const [editIndexable, setEditIndexable] = useState(true);

  const loadSeo = async () => {
    const list = await adminService.getSeoMetadata();
    setPages(list);
  };

  useEffect(() => {
    loadSeo();
  }, []);

  const handleOpenEdit = (page: SeoPageMetadata) => {
    setSelectedPage(page);
    setEditTitle(page.meta_title);
    setEditDesc(page.meta_description);
    setEditCanonical(page.canonical_url || '');
    setEditOgImage(page.og_image_url || '');
    setEditIndexable(page.indexable);
  };

  const handleSavePageSeo = async () => {
    if (!selectedPage) return;
    await adminService.updateSeoMetadata(
      selectedPage.page_path,
      {
        meta_title: editTitle,
        meta_description: editDesc,
        canonical_url: editCanonical,
        og_image_url: editOgImage,
        indexable: editIndexable
      },
      currentUserEmail
    );

    setStatusMsg(`SEO metadata updated for ${selectedPage.page_path}`);
    setTimeout(() => setStatusMsg(null), 3000);
    setSelectedPage(null);
    loadSeo();
  };

  const sitemapXml = adminService.generateSitemapXml(pages);
  const robotsTxt = adminService.generateRobotsTxt();

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Search className="w-3.5 h-3.5" />
            <span>ENTERPRISE SEARCH ENGINE OPTIMIZATION & GROWTH REGISTRY</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            SEO & Social Growth Administration
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Audit meta tags, OpenGraph previews, canonical routes, and export dynamic XML sitemaps and robots.txt.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'pages' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pages ({pages.length})
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'sitemap' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            sitemap.xml
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'robots' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            robots.txt
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'integrations' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            GSC & Analytics
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tab 1: Pages Registry */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Route Path</th>
                    <th className="py-3 px-4">Meta Title & Description</th>
                    <th className="py-3 px-4">Audit Score</th>
                    <th className="py-3 px-4">Indexing</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {pages.map((p) => (
                    <tr
                      key={p.page_path}
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => handleOpenEdit(p)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                        {p.page_path}
                      </td>
                      <td className="py-3 px-4 space-y-0.5 max-w-md">
                        <div className="font-semibold text-white line-clamp-1">{p.meta_title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{p.meta_description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-400">
                          {p.audit_score}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            p.indexable
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {p.indexable ? 'INDEX' : 'NOINDEX'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(p);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-mono cursor-pointer"
                        >
                          Edit &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: sitemap.xml */}
      {activeTab === 'sitemap' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Dynamic XML Sitemap</h2>
              <p className="text-[11px] text-slate-400">
                Generated automatically from indexable application routes for Googlebot ingestion.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(sitemapXml, 'sitemap')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isCopied === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy XML</span>
              </button>
              <button
                onClick={() => handleDownloadFile(sitemapXml, 'sitemap.xml', 'application/xml')}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download sitemap.xml</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-96">
            {sitemapXml}
          </pre>
        </div>
      )}

      {/* Tab 3: robots.txt */}
      {activeTab === 'robots' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Robots Exclusion Protocol (robots.txt)</h2>
              <p className="text-[11px] text-slate-400">
                Directs web crawlers to public architecture showcases and protects admin routes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(robotsTxt, 'robots')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isCopied === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy robots.txt</span>
              </button>
              <button
                onClick={() => handleDownloadFile(robotsTxt, 'robots.txt', 'text/plain')}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download robots.txt</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
            {robotsTxt}
          </pre>
        </div>
      )}

      {/* Tab 4: GSC & Analytics Integration Card */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Google Search Console (GSC)</h2>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                Awaiting Verification
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Google Search Console tracks search impressions, average ranking position, and crawling errors for <code className="text-cyan-300">zaboraa-12.vercel.app</code>.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="text-slate-400 font-bold uppercase">Setup Requirements:</div>
              <div className="text-slate-300">1. Verify domain ownership in Google Search Console via DNS TXT record or HTML meta tag.</div>
              <div className="text-slate-300">2. Submit sitemap URL: <span className="text-cyan-300">https://zaboraa-12.vercel.app/sitemap.xml</span></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Google Analytics 4 (GA4)</h2>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                Privacy-Preserving
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Enterprise visitor telemetry with cookie consent mode and zero third-party marketing trackers.
            </p>
            <div className="space-y-1">
              <label className="text-slate-400 font-mono">GA4 Measurement ID:</label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                defaultValue={(import.meta as any).env?.VITE_GA_MEASUREMENT_ID || ''}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">PAGE SEO EDITOR</span>
                <h2 className="text-base font-bold text-white font-mono">{selectedPage.page_path}</h2>
              </div>
              <button
                onClick={() => setSelectedPage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Meta Title (50-60 characters):</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
                <span className="text-[10px] text-slate-400 font-mono">{editTitle.length} characters</span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Meta Description (120-160 characters):</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 font-mono">{editDesc.length} characters</span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">Canonical URL:</label>
                <input
                  type="text"
                  value={editCanonical}
                  onChange={(e) => setEditCanonical(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold font-mono">OpenGraph Social Share Card Image:</label>
                <input
                  type="text"
                  value={editOgImage}
                  onChange={(e) => setEditOgImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIndexable}
                  onChange={(e) => setEditIndexable(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700"
                />
                <span className="font-semibold text-slate-200">Allow search engine indexation (Googlebot, Bingbot)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePageSeo}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Save Meta Tags
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
