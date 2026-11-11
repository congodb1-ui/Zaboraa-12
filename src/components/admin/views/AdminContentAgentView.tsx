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
  Square
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
  deleteQueueItem
} from '../../../lib/contentAgent';

interface AdminContentAgentViewProps {
  currentUserEmail: string;
}

type TabType = 'ideas' | 'drafts' | 'queue' | 'analytics';
type TopicMode = 'manual' | 'suggest';

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

  // Initial Load
  const loadData = async () => {
    try {
      const [dList, qList] = await Promise.all([
        getContentDrafts(),
        getContentQueue()
      ]);
      setDrafts(dList);
      setQueue(qList);
    } catch (err) {
      console.warn('Notice loading content agent data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setErrorMessage(null);
      setSuccessMessage(null);
    }, 4000);
  };

  // --- Topic Picker Actions ---
  const handleTogglePillar = (pillar: string) => {
    const isSelected = selectedTopics.some((t) => t.toLowerCase() === pillar.toLowerCase());
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter((t) => t.toLowerCase() !== pillar.toLowerCase()));
    } else {
      if (selectedTopics.length >= 3) {
        showToast('Maximum 3 topics allowed per generation run.', true);
        return;
      }
      setSelectedTopics([...selectedTopics, pillar]);
    }
  };

  const handleAddCustomTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 120) {
      showToast('Custom topic must be 120 characters or fewer.', true);
      return;
    }
    if (selectedTopics.length >= 3) {
      showToast('Maximum 3 topics allowed. Remove one before adding another.', true);
      return;
    }
    const alreadySelected = selectedTopics.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (alreadySelected) {
      showToast('Topic is already selected.', true);
      return;
    }
    setSelectedTopics([...selectedTopics, trimmed]);
    setCustomTopicInput('');
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t.toLowerCase() !== topicToRemove.toLowerCase()));
  };

  const handleFetchSuggestedTopics = async () => {
    setIsSuggesting(true);
    setErrorMessage(null);
    try {
      const res = await fetchSuggestedTopics();
      setSuggestResult(res);
      showToast('Suggested 3 topics based on recent coverage.');
    } catch (err: any) {
      showToast(err.message || 'Failed to suggest topics.', true);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplySuggestedTopics = () => {
    if (!suggestResult || !suggestResult.suggestedTopics || suggestResult.suggestedTopics.length === 0) return;
    setSelectedTopics(suggestResult.suggestedTopics.slice(0, 3));
    setTopicMode('manual');
    showToast('Applied suggested topics to picker.');
  };

  // --- Ideas Actions ---
  const handleGenerateIdeas = async () => {
    if (selectedTopics.length === 0 || selectedTopics.length > 3) {
      showToast('Please select between 1 and 3 topics to generate ideas.', true);
      return;
    }
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const newIdeas = await generateContentIdeas(selectedTopics);
      setIdeas(newIdeas);
      showToast(`Generated ${newIdeas.length} new LinkedIn post ideas via Vertex AI.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate ideas. Please check configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsDraft = async (idea: ContentIdea, index: number) => {
    try {
      const draft: ContentDraft = {
        id: `draft-${Date.now()}-${index}`,
        idea_id: idea.id,
        title: idea.title,
        hook: idea.hook,
        body: idea.body,
        hashtags: idea.hashtags,
        cta: idea.cta,
        topic: idea.topic,
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await saveContentDraft(draft);
      
      // Update ideas state to mark as drafted
      const updatedIdeas = [...ideas];
      updatedIdeas[index] = { ...updatedIdeas[index], status: 'drafted' };
      setIdeas(updatedIdeas);
      try {
        localStorage.setItem('zaboraa_content_ideas', JSON.stringify(updatedIdeas));
      } catch {}

      await loadData();
      showToast(`Saved "${idea.title}" as Draft.`);
    } catch (err: any) {
      showToast('Failed to save draft.', true);
    }
  };

  const handleDiscardIdea = (index: number) => {
    const updatedIdeas = ideas.filter((_, i) => i !== index);
    setIdeas(updatedIdeas);
    try {
      localStorage.setItem('zaboraa_content_ideas', JSON.stringify(updatedIdeas));
    } catch {}
    showToast('Idea discarded.');
  };

  // --- Drafts Actions ---
  const handleStartEditDraft = (draft: ContentDraft) => {
    setEditingDraft(draft);
    setEditTitle(draft.title);
    setEditBody(draft.body);
    setEditHashtags(Array.isArray(draft.hashtags) ? draft.hashtags.join(' ') : '');
    setEditCta(draft.cta);
    setEditTopic(draft.topic);
  };

  const handleSaveDraftEdit = async () => {
    if (!editingDraft) return;

    const hashtagsArr = editHashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const updated: ContentDraft = {
      ...editingDraft,
      title: editTitle.trim(),
      body: editBody.trim(),
      hashtags: hashtagsArr,
      cta: editCta.trim(),
      topic: editTopic.trim() || 'AVS',
      updated_at: new Date().toISOString()
    };

    await saveContentDraft(updated);
    setEditingDraft(null);
    await loadData();
    showToast('Draft changes saved successfully.');
  };

  const handleApproveDraft = async (draft: ContentDraft) => {
    try {
      const qItem = await approveDraftToQueue(draft);
      await loadData();
      showToast(`Approved & scheduled for ${qItem.scheduled_day} ${qItem.scheduled_time}.`);
    } catch (err: any) {
      showToast('Failed to approve draft.', true);
    }
  };

  const handleRejectDraft = async (draft: ContentDraft) => {
    try {
      await saveContentDraft({ ...draft, status: 'Rejected' });
      await loadData();
      showToast(`Marked draft "${draft.title}" as Rejected.`);
    } catch (err: any) {
      showToast('Failed to reject draft.', true);
    }
  };

  // --- Queue Actions ---
  const handleUnapproveQueueItem = async (item: ContentQueueItem) => {
    try {
      await unapproveQueueItem(item.id, item.draft_id);
      await loadData();
      showToast('Post unapproved and moved back to Drafts.');
    } catch (err) {
      showToast('Failed to unapprove queue item.', true);
    }
  };

  const handleDeleteQueueItem = async (item: ContentQueueItem) => {
    try {
      await deleteQueueItem(item.id);
      await loadData();
      showToast('Post removed from Queue.');
    } catch (err) {
      showToast('Failed to delete queue item.', true);
    }
  };

  // Filtered Drafts
  const filteredDrafts = drafts.filter((d) => {
    if (draftFilter === 'all') return true;
    return d.status === draftFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Bot className="w-3.5 h-3.5" />
            <span>CONTENT & GROWTH AGENT — PHASE 1</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            LinkedIn Content Engine & Human Approval Pipeline
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Autonomous Gemini AI drafting for enterprise VMware & hyperscaler cloud topics with strict human review, inline editing, and visual scheduling.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ideas'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ideas</span>
            {ideas.length > 0 && (
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300">
                {ideas.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drafts'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Drafts</span>
            {drafts.length > 0 && (
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {drafts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Queue</span>
            {queue.length > 0 && (
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {queue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Toast Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: IDEAS                                                              */}
      {/* ========================================================================= */}
      {activeTab === 'ideas' && (
        <div className="space-y-6">
          {/* Topic Picker Container */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            {/* Top Bar: Title & Manual / Suggest Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Topic Picker & Pillar Strategy</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select 1 to 3 enterprise cloud topics. The AI engine grounds each post in verified enterprise architecture facts.
                </p>
              </div>

              {/* Mode Toggle [Manual | Suggest] */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTopicMode('manual')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    topicMode === 'manual'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Manual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTopicMode('suggest')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    topicMode === 'suggest'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Suggest</span>
                </button>
              </div>
            </div>

            {/* MANUAL MODE VIEW */}
            {topicMode === 'manual' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Standard Content Pillars:
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {selectedTopics.length}/3 topics selected
                  </span>
                </div>

                {/* 6 Pillar Checkbox Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {PILLARS.map((pillar) => {
                    const isSelected = selectedTopics.some(
                      (t) => t.toLowerCase() === pillar.toLowerCase()
                    );
                    const isDisabled = !isSelected && selectedTopics.length >= 3;
                    return (
                      <button
                        key={pillar}
                        type="button"
                        onClick={() => handleTogglePillar(pillar)}
                        disabled={isDisabled}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200 shadow-sm'
                            : isDisabled
                            ? 'bg-slate-950/40 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white cursor-pointer'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{pillar}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Topic Input */}
                <form
                  onSubmit={handleAddCustomTopic}
                  className="flex items-center gap-2 pt-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      placeholder="Or type custom topic (e.g. AWS vs AVS cost breakdown, max 120 chars)..."
                      maxLength={120}
                      disabled={selectedTopics.length >= 3}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!customTopicInput.trim() || selectedTopics.length >= 3}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            )}

            {/* SUGGEST MODE VIEW */}
            {topicMode === 'suggest' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>AI Pillar Coverage Analyzer</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Scans recent drafts and queue history to identify under-represented pillars from the core 6 strategy pillars.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFetchSuggestedTopics}
                      disabled={isSuggesting}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-spin' : ''}`} />
                      <span>{isSuggesting ? 'Analyzing...' : 'Suggest Topics'}</span>
                    </button>
                  </div>

                  {suggestResult && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in">
                      <div className="text-[11px] text-slate-400">
                        <span className="text-amber-400 font-semibold">Recommendation: </span>
                        <span>{suggestResult.reason}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {suggestResult.suggestedTopics.map((top, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-center gap-2"
                          >
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{top}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleApplySuggestedTopics}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use these topics</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Topics Chips Bar & Generate Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                  Active Selected Topics:
                </span>
                {selectedTopics.length === 0 ? (
                  <p className="text-xs text-rose-400 font-medium">
                    Pick 1 to 3 topics to enable idea generation.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedTopics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                      >
                        <span>{topic}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(topic)}
                          className="hover:text-rose-300 cursor-pointer"
                          aria-label={`Remove ${topic}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-500 ml-1">
                      ({selectedTopics.length === 1 && 'will produce 3 posts'}
                      {selectedTopics.length === 2 && 'will produce 2 + 1 posts'}
                      {selectedTopics.length === 3 && 'will produce 1 + 1 + 1 posts'})
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateIdeas}
                disabled={isGenerating || selectedTopics.length === 0 || selectedTopics.length > 3}
                className={`px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer shrink-0 ${
                  isGenerating || selectedTopics.length === 0 || selectedTopics.length > 3
                    ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
                    : ''
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating Ideas...' : 'Generate Ideas'}</span>
              </button>
            </div>
          </div>

          {/* Ideas List or Empty State */}
          {ideas.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No ideas yet. Click Generate Ideas.</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click the button above to prompt Gemini AI for 3 fresh enterprise cloud architecture posts.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {ideas.map((idea, idx) => (
                <div
                  key={idea.id || idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    {/* Topic Badge & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {idea.topic}
                      </span>
                      {idea.status === 'drafted' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved as Draft
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {idea.title}
                    </h3>

                    {/* Hook */}
                    {idea.hook && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs text-cyan-200 font-medium leading-relaxed">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                          Hook Preview:
                        </span>
                        {idea.hook}
                      </div>
                    )}

                    {/* Body Preview */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Body Content:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-6">
                        {idea.body}
                      </p>
                    </div>

                    {/* Hashtags */}
                    {idea.hashtags && idea.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {idea.hashtags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Call To Action */}
                    {idea.cta && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold block">CTA:</span>
                          <span>{idea.cta}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleDiscardIdea(idx)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>

                    <button
                      onClick={() => handleSaveAsDraft(idea, idx)}
                      disabled={idea.status === 'drafted'}
                      className={`px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        idea.status === 'drafted' ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400' : ''
                      }`}
                    >
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

      {/* ========================================================================= */}
      {/* TAB 2: DRAFTS                                                             */}
      {/* ========================================================================= */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
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
                      draftFilter === st
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? `All (${drafts.length})` : `${st} (${drafts.filter((d) => d.status === st).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Total Drafts: <span className="text-white font-bold">{drafts.length}</span>
            </div>
          </div>

          {/* Drafts List */}
          {filteredDrafts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                No drafts found in this category. Generate ideas in the Ideas tab and save them as drafts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {draft.topic}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            draft.status === 'Approved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : draft.status === 'Rejected'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {draft.status}
                        </span>
                        {draft.created_at && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(draft.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">{draft.title}</h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEditDraft(draft)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleApproveDraft(draft)}
                        disabled={draft.status === 'Approved'}
                        className={`px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                          draft.status === 'Approved' ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400' : ''
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleRejectDraft(draft)}
                        disabled={draft.status === 'Rejected'}
                        className={`px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          draft.status === 'Rejected' ? 'opacity-50 cursor-not-allowed text-slate-500' : ''
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Body & Meta Preview */}
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    {draft.body}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    {draft.hashtags && draft.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {draft.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {draft.cta && (
                      <div className="text-[11px] text-emerald-400 font-mono">
                        <span className="text-slate-400 font-normal">CTA:</span> {draft.cta}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUEUE                                                              */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Queue Notice Header */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <Clock className="w-4 h-4" />
              <span>SCHEDULED PUBLICATION SLOTS (MON / WED / FRI 09:30 AM IST)</span>
            </div>
            <p className="text-xs text-slate-400">
              Phase 1 provides visual scheduling and approval controls. Posts in the queue will be dispatched to LinkedIn Company Page via API in Phase 3.
            </p>
          </div>

          {/* Queue List */}
          {queue.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                No posts currently in the queue. Approve posts from the Drafts tab to assign scheduled slots.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, idx) => {
                const linkedDraft = drafts.find((d) => d.id === item.draft_id) || item.draft;
                return (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Time Slot Badge */}
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{item.scheduled_day} {item.scheduled_time}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                          {linkedDraft?.topic || 'Cloud Architecture'}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-400">
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white truncate">
                        {linkedDraft?.title || 'Approved Architecture Post'}
                      </h3>

                      {linkedDraft?.body && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {linkedDraft.body}
                        </p>
                      )}

                      {linkedDraft?.hashtags && linkedDraft.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {linkedDraft.hashtags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-950"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Queue Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUnapproveQueueItem(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Unapprove</span>
                      </button>

                      <button
                        onClick={() => handleDeleteQueueItem(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ANALYTICS                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-cyan-400 mx-auto flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Analytics coming in Phase 3 — Sunday review will show impressions, likes, comments, CTR.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Real LinkedIn API performance metrics and audience telemetry will automatically populate here after Phase 3 deployment.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INLINE / MODAL DRAFT EDITOR                                               */}
      {/* ========================================================================= */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Edit LinkedIn Post Draft</h2>
              </div>
              <button
                onClick={() => setEditingDraft(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Topic */}
              <div className="space-y-1.5">
                <label className="font-mono text-slate-400 uppercase tracking-wider block">
                  Cloud Topic:
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  placeholder="AVS | hyperscaler migration | cloud sizing"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-mono text-slate-400 uppercase tracking-wider block">
                  Post Title:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-semibold text-xs"
                />
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <label className="font-mono text-slate-400 uppercase tracking-wider block">
                  Body Content:
                </label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-1.5">
                <label className="font-mono text-slate-400 uppercase tracking-wider block">
                  Hashtags (Space separated):
                </label>
                <input
                  type="text"
                  value={editHashtags}
                  onChange={(e) => setEditHashtags(e.target.value)}
                  placeholder="#VMware #AzureAVS #CloudMigration"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              {/* CTA */}
              <div className="space-y-1.5">
                <label className="font-mono text-slate-400 uppercase tracking-wider block">
                  Call to Action (CTA):
                </label>
                <input
                  type="text"
                  value={editCta}
                  onChange={(e) => setEditCta(e.target.value)}
                  placeholder="👉 Test migration readiness at zaboraa.com/tools/rvtools-analyzer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraftEdit}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
