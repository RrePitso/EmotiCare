import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  CalendarHeart, 
  Search, 
  Bookmark, 
  Trash2, 
  Heart, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  TrendingUp, 
  Smile, 
  RefreshCw,
  Award,
  BookOpen,
  Tag,
  Filter
} from 'lucide-react';
import { JournalEntry, EmotionCategory, UserProfile } from '../types';
import { GO_EMOTIONS } from '../data/emotionsData';
import { requestPatternSynthesis, PatternPayload } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynth';

interface JourneyScreenProps {
  entries: JournalEntry[];
  userProfile: UserProfile;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({
  entries,
  userProfile,
  onDeleteEntry,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(entries[0]?.id || null);

  // Growth story / Continuity state
  const [patternData, setPatternData] = useState<PatternPayload | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);

  useEffect(() => {
    loadGrowthStory();
  }, [entries.length]);

  const loadGrowthStory = async () => {
    if (entries.length === 0) return;
    setIsLoadingStory(true);
    try {
      const data = await requestPatternSynthesis(entries);
      setPatternData(data);
    } catch (e) {
      console.error('Error synthesizing growth story', e);
    } finally {
      setIsLoadingStory(false);
    }
  };

  // Group entries by date timeline
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toDateString();

  const filteredEntries = entries.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesEmotion = selectedEmotionFilter === 'all' || e.primaryEmotion === selectedEmotionFilter;
    const matchesFavorite = !onlyFavorites || e.isFavorite;

    return matchesSearch && matchesEmotion && matchesFavorite;
  });

  // Calculate friendly mood distribution
  const emotionCounts: { [key in EmotionCategory]?: number } = {};
  entries.forEach(e => {
    emotionCounts[e.primaryEmotion] = (emotionCounts[e.primaryEmotion] || 0) + 1;
  });

  const sortedEmotions = (Object.keys(emotionCounts) as EmotionCategory[]).sort(
    (a, b) => (emotionCounts[b] || 0) - (emotionCounts[a] || 0)
  );

  const topEmotion = sortedEmotions[0] ? GO_EMOTIONS[sortedEmotions[0]]?.label : 'Calm';

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `emoticare_journey_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    audioSynth.playChime(528);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8" id="journey-screen-root">
      {/* 1. Journey Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-amber-100/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Your Emotional Journey
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-accent">
            Reflections & Growth
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {entries.length} gentle check-ins recorded in your sanctuary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-2xs"
            id="export-journey-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Backup</span>
          </button>
        </div>
      </div>

      {/* 2. Mood Trends (Friendly, Non-clinical) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Primary Feeling */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-3xl p-5 border border-amber-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center text-2xl shadow-xs">
            🌸
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Frequent Emotion
            </span>
            <h3 className="text-base font-bold text-stone-900 font-serif-accent">
              {topEmotion}
            </h3>
            <p className="text-xs text-stone-500">
              Your most recurring state of mind
            </p>
          </div>
        </div>

        {/* Card 2: Resilience Streak */}
        <div className="bg-gradient-to-br from-rose-50/80 to-pink-50/50 rounded-3xl p-5 border border-rose-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center text-2xl shadow-xs">
            ✨
          </div>
          <div>
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
              Reflective Streak
            </span>
            <h3 className="text-base font-bold text-stone-900 font-serif-accent">
              {userProfile.streakCount || 2} Days Active
            </h3>
            <p className="text-xs text-stone-500">
              Showing up for yourself with care
            </p>
          </div>
        </div>

        {/* Card 3: Growth Rhythms */}
        <div className="bg-gradient-to-br from-teal-50/80 to-emerald-50/50 rounded-3xl p-5 border border-teal-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-teal-600 flex items-center justify-center text-2xl shadow-xs">
            🌱
          </div>
          <div>
            <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
              Emotional Balance
            </span>
            <h3 className="text-base font-bold text-stone-900 font-serif-accent">
              Calm & Grounded
            </h3>
            <p className="text-xs text-stone-500">
              Healthy self-awareness developing
            </p>
          </div>
        </div>
      </div>

      {/* 3. Your Growth Story (AI Continuity Summary) */}
      <div className="bg-gradient-to-tr from-indigo-50/70 via-purple-50/40 to-rose-50/30 rounded-3xl p-6 border border-indigo-100 shadow-2xs space-y-4" id="growth-story-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-serif-accent">
                Your Growth Story
              </h2>
              <p className="text-[11px] text-stone-500">
                Observations from your heartfelt check-ins
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioSynth.playChime(440);
              loadGrowthStory();
            }}
            disabled={isLoadingStory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-2xs"
            id="refresh-growth-story-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStory ? 'animate-spin' : ''}`} />
            <span>Update Story</span>
          </button>
        </div>

        {patternData ? (
          <div className="space-y-4">
            <div className="bg-white/90 rounded-2xl p-5 border border-indigo-100/80 shadow-2xs">
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
                "{patternData.emoticareContinuitySummary}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patternData.recurringThemes && patternData.recurringThemes.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Themes You're Navigating
                  </h4>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {patternData.recurringThemes.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {patternData.growthHighlights && patternData.growthHighlights.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1.5">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                    Little Breakthroughs
                  </h4>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {patternData.growthHighlights.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">✓</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-stone-500">
            {isLoadingStory ? 'Weaving your growth story...' : 'Keep writing check-ins to unlock your personalized growth story.'}
          </div>
        )}
      </div>

      {/* 4. Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections, feelings, keywords..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-300 focus:outline-none"
              id="search-journey-input"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedEmotionFilter}
              onChange={(e) => setSelectedEmotionFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:bg-white focus:outline-none"
              id="journey-emotion-filter-select"
            >
              <option value="all">All Feelings</option>
              {(Object.keys(GO_EMOTIONS) as EmotionCategory[]).map(cat => (
                <option key={cat} value={cat}>
                  {GO_EMOTIONS[cat]?.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`w-full py-2.5 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                onlyFavorites
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
              id="journey-favorites-toggle-btn"
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Saved</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Timeline Entries Feed */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-amber-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
              📖
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif-accent">
              No entries found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Start with a quick check-in on the Home screen to begin documenting your moments.
            </p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const isExpanded = expandedEntryId === entry.id;
            const emotionInfo = GO_EMOTIONS[entry.primaryEmotion] || GO_EMOTIONS.calm;
            const entryDate = new Date(entry.date);
            const dateHeader = 
              entryDate.toDateString() === todayStr ? 'Today' :
              entryDate.toDateString() === yesterdayStr ? 'Yesterday' :
              entryDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <motion.div
                key={entry.id}
                layout
                className="bg-white rounded-3xl border border-stone-200/80 hover:border-amber-200 shadow-2xs overflow-hidden transition-all"
                id={`journey-card-${entry.id}`}
              >
                {/* Header Preview */}
                <div
                  onClick={() => {
                    setExpandedEntryId(isExpanded ? null : entry.id);
                    audioSynth.playChime(380);
                  }}
                  className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-stone-500">
                        {dateHeader}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${emotionInfo?.bgColor || 'bg-stone-100'} ${emotionInfo?.borderColor || 'border-stone-200'} ${emotionInfo?.textColor || 'text-stone-700'}`}>
                        {emotionInfo?.label || entry.primaryEmotion}
                      </span>

                      {entry.bodySensation && (
                        <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          {entry.bodySensation}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-900 font-serif-accent truncate">
                      {entry.title}
                    </h3>

                    {!isExpanded && (
                      <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-sans">
                        {entry.content}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(entry.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        entry.isFavorite
                          ? 'bg-amber-50 border-amber-200 text-amber-500'
                          : 'bg-stone-50 border-stone-200 text-stone-300 hover:text-stone-600'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${entry.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this entry from your Journey?')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="p-1 text-stone-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-stone-100 p-6 bg-stone-50/40 space-y-4"
                    >
                      {/* Entry Content */}
                      <div className="bg-white p-5 rounded-2xl border border-stone-200 text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                        {entry.content}
                      </div>

                      {/* Companion Response */}
                      {entry.companionResponse && (
                        <div className="bg-gradient-to-br from-rose-50/70 to-amber-50/40 border border-rose-100 rounded-2xl p-5 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                              <Heart className="w-3 h-3 fill-white" />
                            </div>
                            <h4 className="text-xs font-bold text-stone-900 font-serif-accent">
                              EmotiCare Reflection & Support
                            </h4>
                          </div>

                          <div className="text-xs text-stone-800 leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown>{entry.companionResponse.fullText}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
