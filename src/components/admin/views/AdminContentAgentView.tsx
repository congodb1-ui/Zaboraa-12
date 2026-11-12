import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Trash2,
  Edit2,
  X,
  Save,
  Check,
  RefreshCw,
  Hash,
  ExternalLink,
  Bot,
  ArrowRight,
  Filter,
  Eye,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Inbox,
  Lightbulb,
  Plus,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Copy,
  Download,
  Image as ImageIcon,
  Video,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  PILLARS,
  ContentPillar,
  ContentIdea,
  ContentDraft,
  ContentQueueItem,
  SuggestedTopicsResponse,
  generateContentIdeas,
  fetchSuggestedTopics,
  getContentDrafts,
  saveContentDraft,
  getContentQueue,
  approveDraftToQueue,
  unapproveQueueItem,
  deleteQueueItem,
  formatLinkedInPost,
  validateLinkedInUrl,
  markQueueItemAsPosted,
  fetchGeneratedAssets,
  generateCaptions,
  generateVideoScript,
  generateKB,
  generatePoster,
  generateAll,
  CaptionsResult,
  VideoScriptResult,
  KBResult,
  PosterResult,
  GenerateAllResult,
  GeneratedAssetRow
} from '../../../lib/contentAgent';

interface AdminContentAgentViewProps {
  currentUserEmail: string;
}

type TabType = 'ideas' | 'drafts' | 'queue' | 'analytics';
type TopicMode = 'manual' | 'suggest';

interface StudioState {
  isGeneratingPoster?: boolean;
  isGeneratingCaptions?: boolean;
  isGeneratingVideoScript?: boolean;
  isGeneratingKB?: boolean;
  isGeneratingAll?: boolean;
  posterData?: PosterResult;
  captionsData?: CaptionsResult;
  videoScriptData?: VideoScriptResult;
  kbData?: KBResult;
  generateAllData?: GenerateAllResult;
  error?: string;
  badges?: Record<string, boolean>;
}

export const AdminContentAgentView: React.FC<AdminContentAgentViewProps> = ({
  currentUserEmail
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ideas');
  
  // Topic Picker States (Phase 2a)
  const [topicMode, setTopicMode] = useState<TopicMode>('manual');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['AVS Migrations']);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestResult, setSuggestResult] = useState<SuggestedTopicsResponse | null>(null);

  // Data States
  const [ideas, setIdeas] = useState<ContentIdea[]>(() => {
    try {
      const cached = localStorage.getItem('zaboraa_content_ideas');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [queue, setQueue] = useState<ContentQueueItem[]>([]);

  // Content Studio State per Draft ID
  const [studioStates, setStudioStates] = useState<Record<string, StudioState>>({});
  const [expandedStudio, setExpandedStudio] = useState<Record<string, boolean>>({});

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [draftFilter, setDraftFilter] = useState<'all' | 'Draft' | 'Approved' | 'Rejected'>('all');

  // Inline / Modal Edit State for Drafts
  const [editingDraft, setEditingDraft] = useState<ContentDraft | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editHashtags, setEditHashtags] = useState('');
  const [editCta, setEditCta] = useState('');
  const [editTopic, setEditTopic] = useState('');

  // Phase 2b: Manual LinkedIn Posting State
  const [postingQueueItem, setPostingQueueItem] = useState<ContentQueueItem | null>(null);
  const [postingUrl, setPostingUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Copy Feedback Toast
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadDraftsAndQueue();
  }, []);

  const loadDraftsAndQueue = async () => {
    try {
      const loadedDrafts = await getContentDrafts();
      setDrafts(loadedDrafts);
      const loadedQueue = await getContentQueue();
      setQueue(loadedQueue);

      // Fetch asset badges for drafts
      for (const d of loadedDrafts) {
        if (d.status === 'Approved' || d.status === 'Draft') {
          const assets = await fetchGeneratedAssets(d.id);
          if (assets.length > 0) {
            const badges: Record<string, boolean> = {};
            for (const a of assets) {
              badges[a.asset_type] = true;
            }
            setStudioStates((prev) => ({
              ...prev,
              [d.id]: { ...(prev[d.id] || {}), badges }
            }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load content drafts/queue:', err);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBase64Image = (filename: string, base64Data: string) => {
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${base64Data}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Studio Track Handlers
  const handleGenerateTrack = async (
    draftId: string,
    track: 'poster' | 'captions' | 'video_script' | 'kb' | 'all'
  ) => {
    setStudioStates((prev) => ({
      ...prev,
      [draftId]: {
        ...(prev[draftId] || {}),
        error: undefined,
        ...(track === 'poster' ? { isGeneratingPoster: true } : {}),
        ...(track === 'captions' ? { isGeneratingCaptions: true } : {}),
        ...(track === 'video_script' ? { isGeneratingVideoScript: true } : {}),
        ...(track === 'kb' ? { isGeneratingKB: true } : {}),
        ...(track === 'all' ? { isGeneratingAll: true } : {})
      }
    }));

    try {
      if (track === 'poster') {
        const res = await generatePoster(draftId);
        setStudioStates((prev) => ({
          ...prev,
          [draftId]: {
            ...(prev[draftId] || {}),
            isGeneratingPoster: false,
            posterData: res,
            badges: { ...(prev[draftId]?.badges || {}), poster_linkedin: true, poster_instagram: true }
          }
        }));
      } else if (track === 'captions') {
        const res = await generateCaptions(draftId);
        setStudioStates((prev) => ({
          ...prev,
          [draftId]: {
            ...(prev[draftId] || {}),
            isGeneratingCaptions: false,
            captionsData: res,
            badges: { ...(prev[draftId]?.badges || {}), captions: true }
          }
        }));
      } else if (track === 'video_script') {
        const res = await generateVideoScript(draftId);
        setStudioStates((prev) => ({
          ...prev,
          [draftId]: {
            ...(prev[draftId] || {}),
            isGeneratingVideoScript: false,
            videoScriptData: res,
            badges: { ...(prev[draftId]?.badges || {}), video_script: true }
          }
        }));
      } else if (track === 'kb') {
        const res = await generateKB(draftId);
        setStudioStates((prev) => ({
          ...prev,
          [draftId]: {
            ...(prev[draftId] || {}),
            isGeneratingKB: false,
            kbData: res,
            badges: { ...(prev[draftId]?.badges || {}), kb_draft: true }
          }
        }));
      } else if (track === 'all') {
        const res = await generateAll(draftId);
        const newBadges = { ...(studioStates[draftId]?.badges || {}) };
        if (res.results.poster?.ok) {
          newBadges.poster_linkedin = true;
          newBadges.poster_instagram = true;
        }
        if (res.results.captions?.ok) newBadges.captions = true;
        if (res.results.video_script?.ok) newBadges.video_script = true;
        if (res.results.kb?.ok) newBadges.kb_draft = true;

        setStudioStates((prev) => ({
          ...prev,
          [draftId]: {
            ...(prev[draftId] || {}),
            isGeneratingAll: false,
            generateAllData: res,
            posterData: res.results.poster?.ok ? res.results.poster.data : prev[draftId]?.posterData,
            captionsData: res.results.captions?.ok ? res.results.captions.data : prev[draftId]?.captionsData,
            videoScriptData: res.results.video_script?.ok ? res.results.video_script.data : prev[draftId]?.videoScriptData,
            kbData: res.results.kb?.ok ? res.results.kb.data : prev[draftId]?.kbData,
            badges: newBadges
          }
        }));
      }
    } catch (err: any) {
      setStudioStates((prev) => ({
        ...prev,
        [draftId]: {
          ...(prev[draftId] || {}),
          isGeneratingPoster: false,
          isGeneratingCaptions: false,
          isGeneratingVideoScript: false,
          isGeneratingKB: false,
          isGeneratingAll: false,
          error: err.message || 'Generation failed'
        }
      }));
    }
  };

  // Phase 2a Handlers
  const handleTogglePillar = (pillar: string) => {
    if (selectedTopics.includes(pillar)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== pillar));
    } else {
      if (selectedTopics.length < 3) {
        setSelectedTopics([...selectedTopics, pillar]);
      }
    }
  };

  const handleAddCustomTopic = () => {
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 120) {
      setErrorMessage('Custom topic must be 120 characters or less.');
      return;
    }
    const exists = selectedTopics.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setCustomTopicInput('');
      return;
    }
    if (selectedTopics.length >= 3) {
      setErrorMessage('You can select a maximum of 3 topics.');
      return;
    }
    setSelectedTopics([...selectedTopics, trimmed]);
    setCustomTopicInput('');
    setErrorMessage(null);
  };

  const handleRemoveTopic = (topic: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topic));
  };

  const handleFetchSuggestions = async () => {
    setIsSuggesting(true);
    setErrorMessage(null);
    try {
      const res = await fetchSuggestedTopics();
      setSuggestResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch topic suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplySuggestions = () => {
    if (suggestResult && suggestResult.suggestedTopics) {
      setSelectedTopics(suggestResult.suggestedTopics);
      setSuccessMessage('Applied suggested topics!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleGenerateIdeas = async () => {
    if (selectedTopics.length === 0 || selectedTopics.length > 3) {
      setErrorMessage('Pick 1 to 3 topics to generate posts.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await generateContentIdeas(selectedTopics);
      const generated = res.posts || res.ideas || [];
      if (generated.length > 0) {
        setIdeas(generated);
        localStorage.setItem('zaboraa_content_ideas', JSON.stringify(generated));
        setSuccessMessage(`Successfully generated ${generated.length} fresh content ideas!`);
      } else {
        setErrorMessage('No ideas returned from generation API.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate ideas.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsDraft = async (idea: ContentIdea, idx: number) => {
    try {
      const draft = await saveContentDraft(idea);
      const updatedIdeas = ideas.map((item, i) =>
        i === idx ? { ...item, status: 'drafted' as const } : item
      );
      setIdeas(updatedIdeas);
      localStorage.setItem('zaboraa_content_ideas', JSON.stringify(updatedIdeas));
      setDrafts([draft, ...drafts]);
      setSuccessMessage('Idea saved as draft!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save draft.');
    }
  };

  const handleDiscardIdea = (idx: number) => {
    const updated = ideas.filter((_, i) => i !== idx);
    setIdeas(updated);
    localStorage.setItem('zaboraa_content_ideas', JSON.stringify(updated));
  };

  const handleApproveDraft = async (draft: ContentDraft) => {
    try {
      await approveDraftToQueue(draft.id, currentUserEmail);
      await loadDraftsAndQueue();
      setSuccessMessage('Draft approved and added to queue!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to approve draft.');
    }
  };

  const handleRejectDraft = async (draft: ContentDraft) => {
    try {
      await saveContentDraft({ ...draft, status: 'Rejected' });
      await loadDraftsAndQueue();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reject draft.');
    }
  };

  const handleStartEditDraft = (draft: ContentDraft) => {
    setEditingDraft(draft);
    setEditTitle(draft.title || '');
    setEditBody(draft.edited_body || draft.body || '');
    setEditHashtags((draft.hashtags || []).join(' '));
    setEditCta(draft.cta || '');
    setEditTopic(draft.topic || 'AVS Migrations');
  };

  const handleSaveEditDraft = async () => {
    if (!editingDraft) return;
    try {
      const tagsArray = editHashtags
        .split(' ')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await saveContentDraft({
        ...editingDraft,
        title: editTitle,
        body: editBody,
        edited_body: editBody,
        hashtags: tagsArray,
        cta: editCta,
        topic: editTopic as ContentPillar,
      });

      setEditingDraft(null);
      await loadDraftsAndQueue();
      setSuccessMessage('Draft updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save draft edit.');
    }
  };

  const handleOpenPostingModal = (item: ContentQueueItem) => {
    setPostingQueueItem(item);
    setPostingUrl('');
    setErrorMessage(null);
  };

  const handleConfirmMarkPosted = async () => {
    if (!postingQueueItem) return;
    setIsPosting(true);
    setErrorMessage(null);

    try {
      await markQueueItemAsPosted(postingQueueItem.id, postingUrl, currentUserEmail);
      setPostingQueueItem(null);
      setPostingUrl('');
      await loadDraftsAndQueue();
      setSuccessMessage('Post marked as posted to real LinkedIn page!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to mark post as posted.');
    } finally {
      setIsPosting(false);
    }
  };

  const filteredDrafts = drafts.filter((d) => {
    if (draftFilter === 'all') return true;
    return d.status === draftFilter;
  });

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'ideas'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Topic & Ideas</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Drafts & Content Studio ({drafts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Publication Queue ({queue.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: IDEAS */}
      {activeTab === 'ideas' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>Select Content Topics (Pick 1 to 3)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pick strategic VMware cloud pillars or type custom engineering topics.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTopicMode('manual')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    topicMode === 'manual' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual Selection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTopicMode('suggest');
                    handleFetchSuggestions();
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    topicMode === 'suggest' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Suggest Topics
                </button>
              </div>
            </div>

            {topicMode === 'suggest' && suggestResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>AI Suggested Topics:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplySuggestions}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Use These Topics
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{suggestResult.reason}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestResult.suggestedTopics.map((top, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      {top}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {PILLARS.map((pillar) => {
                const isSelected = selectedTopics.includes(pillar);
                const isDisabled = !isSelected && selectedTopics.length >= 3;
                return (
                  <button
                    key={pillar}
                    type="button"
                    onClick={() => handleTogglePillar(pillar)}
                    disabled={isDisabled}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/50 shadow-sm'
                        : isDisabled
                        ? 'bg-slate-950/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{pillar}</span>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="Or type a custom engineering topic (e.g. HCX Bulk Migration)..."
                maxLength={120}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTopic}
                disabled={!customTopicInput.trim() || selectedTopics.length >= 3}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Selected ({selectedTopics.length}/3):</span>
                {selectedTopics.map((topic) => (
                  <span key={topic} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    <span>{topic}</span>
                    <button type="button" onClick={() => handleRemoveTopic(topic)} className="hover:text-rose-300 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerateIdeas}
                disabled={isGenerating || selectedTopics.length === 0 || selectedTopics.length > 3}
                className={`px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer shrink-0 ${
                  isGenerating || selectedTopics.length === 0 || selectedTopics.length > 3 ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : ''
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating Ideas...' : 'Generate Ideas'}</span>
              </button>
            </div>
          </div>

          {ideas.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No ideas yet. Click Generate Ideas.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {ideas.map((idea, idx) => (
                <div key={idea.id || idx} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-700 transition">
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {idea.topic}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{idea.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-6">{idea.body}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button onClick={() => handleDiscardIdea(idx)} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                    <button onClick={() => handleSaveAsDraft(idea, idx)} disabled={idea.status === 'drafted'} className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <Save className="w-3.5 h-3.5" />
                      <span>{idea.status === 'drafted' ? 'Draft Saved' : 'Save as Draft'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DRAFTS & CONTENT STUDIO */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-300">Filter Status:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['all', 'Draft', 'Approved', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setDraftFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer ${
                      draftFilter === st ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? `All (${drafts.length})` : `${st} (${drafts.filter((d) => d.status === st).length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredDrafts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No drafts found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrafts.map((draft) => {
                const isApprovedOrDraft = draft.status === 'Approved' || draft.status === 'Draft';
                const studio = studioStates[draft.id] || {};
                const isExpanded = !!expandedStudio[draft.id];

                return (
                  <div key={draft.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            {draft.topic}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            draft.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : draft.status === 'Rejected' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}>
                            {draft.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{draft.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleStartEditDraft(draft)} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleApproveDraft(draft)} disabled={draft.status === 'Approved'} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button onClick={() => handleRejectDraft(draft)} disabled={draft.status === 'Rejected'} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50">
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      {draft.edited_body || draft.body}
                    </p>

                    {/* CONTENT STUDIO SECTION (Approved or Draft) */}
                    {isApprovedOrDraft && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedStudio((prev) => ({ ...prev, [draft.id]: !prev[draft.id] }))}
                            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-2 cursor-pointer"
                          >
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span>Content Studio (5 Tracks)</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            {studio.badges?.poster_linkedin && <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">✓ Poster</span>}
                            {studio.badges?.captions && <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">✓ Captions</span>}
                            {studio.badges?.video_script && <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">✓ Script</span>}
                            {studio.badges?.kb_draft && <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">✓ KB</span>}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                            {/* Buttons Bar */}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => handleGenerateTrack(draft.id, 'poster')}
                                disabled={studio.isGeneratingPoster}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{studio.isGeneratingPoster ? 'Generating…' : 'Generate Poster'}</span>
                              </button>

                              <button
                                onClick={() => handleGenerateTrack(draft.id, 'captions')}
                                disabled={studio.isGeneratingCaptions}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{studio.isGeneratingCaptions ? 'Generating…' : 'Generate Captions'}</span>
                              </button>

                              <button
                                onClick={() => handleGenerateTrack(draft.id, 'video_script')}
                                disabled={studio.isGeneratingVideoScript}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Video className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{studio.isGeneratingVideoScript ? 'Generating…' : 'Generate Video Script'}</span>
                              </button>

                              <button
                                onClick={() => handleGenerateTrack(draft.id, 'kb')}
                                disabled={studio.isGeneratingKB}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{studio.isGeneratingKB ? 'Generating…' : 'Generate KB Draft'}</span>
                              </button>

                              <button
                                onClick={() => handleGenerateTrack(draft.id, 'all')}
                                disabled={studio.isGeneratingAll}
                                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{studio.isGeneratingAll ? 'Generating All…' : 'Generate All'}</span>
                              </button>
                            </div>

                            {/* Track Error Display */}
                            {studio.error && (
                              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200">
                                {studio.error}
                              </div>
                            )}

                            {/* Poster Output */}
                            {studio.posterData && (
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                <span className="text-xs font-bold text-cyan-300 block">Generated Posters</span>
                                <div className="flex flex-wrap items-center gap-4">
                                  <div className="space-y-1.5">
                                    <img src={`data:image/png;base64,${studio.posterData.linkedin}`} alt="LinkedIn Poster" className="max-h-36 rounded-lg border border-slate-700" />
                                    <button onClick={() => handleDownloadBase64Image(`${draft.title.slice(0, 30)}-linkedin.png`, studio.posterData!.linkedin)} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1 cursor-pointer">
                                      <Download className="w-3 h-3" /> Download LinkedIn (1200×627)
                                    </button>
                                  </div>

                                  <div className="space-y-1.5">
                                    <img src={`data:image/png;base64,${studio.posterData.instagram}`} alt="Instagram Poster" className="max-h-36 rounded-lg border border-slate-700" />
                                    <button onClick={() => handleDownloadBase64Image(`${draft.title.slice(0, 30)}-instagram.png`, studio.posterData!.instagram)} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1 cursor-pointer">
                                      <Download className="w-3 h-3" /> Download Instagram (1080×1080)
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Captions Output */}
                            {studio.captionsData && (
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                                <span className="font-bold text-cyan-300 block">Generated Social Captions</span>
                                <div className="space-y-2">
                                  <div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                                      <span>Instagram Caption (Link in Bio):</span>
                                      <button onClick={() => handleCopyText(studio.captionsData!.instagram_caption, `ig-${draft.id}`)} className="hover:text-cyan-300 cursor-pointer">
                                        {copiedKey === `ig-${draft.id}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <textarea readOnly value={studio.captionsData.instagram_caption} className="w-full bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300 text-xs h-16" />
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                                      <span>YouTube Title:</span>
                                      <button onClick={() => handleCopyText(studio.captionsData!.youtube_title, `yt-t-${draft.id}`)} className="hover:text-cyan-300 cursor-pointer">
                                        {copiedKey === `yt-t-${draft.id}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <input readOnly value={studio.captionsData.youtube_title} className="w-full bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300 text-xs" />
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                                      <span>YouTube Description:</span>
                                      <button onClick={() => handleCopyText(studio.captionsData!.youtube_description, `yt-d-${draft.id}`)} className="hover:text-cyan-300 cursor-pointer">
                                        {copiedKey === `yt-d-${draft.id}` ? 'Copied!' : 'Copy'}
                                      </button>
                                    </div>
                                    <textarea readOnly value={studio.captionsData.youtube_description} className="w-full bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300 text-xs h-20" />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Video Script Output */}
                            {studio.videoScriptData && (
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-cyan-300">Generated Video Script ({studio.videoScriptData.duration_estimate}s)</span>
                                  <button onClick={() => handleCopyText(JSON.stringify(studio.videoScriptData, null, 2), `vs-${draft.id}`)} className="text-cyan-400 hover:text-cyan-300 cursor-pointer text-xs flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> {copiedKey === `vs-${draft.id}` ? 'Copied!' : 'Copy Full Script'}
                                  </button>
                                </div>
                                <div className="space-y-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px]">
                                  <div>{studio.videoScriptData.script.hook}</div>
                                  <div>{studio.videoScriptData.script.problem}</div>
                                  <div>{studio.videoScriptData.script.point1}</div>
                                  <div>{studio.videoScriptData.script.point2}</div>
                                  <div>{studio.videoScriptData.script.point3}</div>
                                  <div className="text-emerald-400 font-bold">{studio.videoScriptData.script.cta}</div>
                                </div>
                              </div>
                            )}

                            {/* KB Draft Output */}
                            {studio.kbData && (
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-cyan-300">Generated KB Runbook Draft</span>
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => handleCopyText(studio.kbData!.full_markdown, `kb-${draft.id}`)} className="text-cyan-400 hover:text-cyan-300 cursor-pointer text-xs">
                                      {copiedKey === `kb-${draft.id}` ? 'Copied!' : 'Copy Body'}
                                    </button>
                                    <button onClick={() => handleDownloadFile(`${studio.kbData!.slug}.md`, studio.kbData!.full_markdown, 'text/markdown')} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer">
                                      <Download className="w-3 h-3" /> Download KB (.md)
                                    </button>
                                  </div>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 space-y-1 text-xs">
                                  <p><span className="font-bold text-slate-400">Slug:</span> {studio.kbData.slug}</p>
                                  <p><span className="font-bold text-slate-400">Meta Title:</span> {studio.kbData.meta_title}</p>
                                  <p><span className="font-bold text-slate-400">Meta Description:</span> {studio.kbData.meta_description}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <Clock className="w-4 h-4" />
              <span>SCHEDULED PUBLICATION SLOTS (MON / WED / FRI 09:30 AM IST)</span>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No posts currently in queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, idx) => {
                const linkedDraft = drafts.find((d) => d.id === item.draft_id) || item.draft;
                const isQueued = item.status === 'Queued';
                const isPosted = item.status === 'Posted';
                const formatted = linkedDraft ? formatLinkedInPost(linkedDraft) : null;

                return (
                  <div key={item.id || idx} className={`p-5 rounded-2xl bg-slate-900 border transition shadow-sm ${
                    isPosted ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{item.scheduled_day} {item.scheduled_time}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                            {linkedDraft?.topic || 'Cloud Architecture'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isPosted ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/50' : 'bg-emerald-950/80 text-emerald-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white truncate">{linkedDraft?.title || 'Approved Post'}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isQueued && formatted && (
                          <>
                            <button onClick={() => handleCopyText(formatted.text, `queue-${item.id}`)} className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedKey === `queue-${item.id}` ? 'Copied!' : 'Copy for LinkedIn'}</span>
                            </button>

                            <a href="https://www.linkedin.com/company/zaboraa/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open LinkedIn</span>
                            </a>

                            <button onClick={() => handleOpenPostingModal(item)} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark as Posted</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: MARK AS POSTED */}
      {postingQueueItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark Post as Published</span>
              </h3>
              <button onClick={() => setPostingQueueItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste the live LinkedIn URL after manually publishing to verify publication.
            </p>

            <input
              type="url"
              value={postingUrl}
              onChange={(e) => setPostingUrl(e.target.value)}
              placeholder="https://www.linkedin.com/feed/update/urn:li:activity:..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button onClick={() => setPostingQueueItem(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer">
                Cancel
              </button>
              <button onClick={handleConfirmMarkPosted} disabled={isPosting || !validateLinkedInUrl(postingUrl)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer">
                <Check className="w-4 h-4" />
                <span>{isPosting ? 'Saving...' : 'Yes, I posted this to the real Zaboraa LinkedIn page'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
