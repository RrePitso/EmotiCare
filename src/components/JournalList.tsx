import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  Filter, 
  Bookmark, 
  Trash2, 
  Heart, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Download, 
  Upload, 
  Calendar,
  Compass,
  FileText
} from 'lucide-react';
import { JournalEntry, EmotionCategory } from '../types';
import { GO_EMOTIONS } from '../data/emotionsData';
import { audioSynth } from '../utils/audioSynth';

interface JournalListProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectEntryForStudio?: (entry: JournalEntry) => void;
}

export const JournalList: React.FC<JournalListProps> = ({
  entries,
  onDeleteEntry,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(entries[0]?.id || null);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesEmotion = selectedEmotionFilter === 'all' || e.primaryEmotion === selectedEmotionFilter;
    const matchesFavorite = !onlyFavorites || e.isFavorite;

    return matchesSearch && matchesEmotion && matchesFavorite;
  });

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `emoticare_journal_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    audioSynth.playChime(528);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="journal-archive-container">
      {/* Search & Filter Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-amber-100/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 font-serif-accent">
              Journal Archive & Reflections
            </h1>
            <p className="text-xs text-stone-500">
              {entries.length} stored {entries.length === 1 ? 'entry' : 'entries'} in your private emotional sanctuary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-2xs"
              id="export-journal-data-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Journal</span>
            </button>
          </div>
        </div>

        {/* Search Input & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, insights, or tags..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-300 focus:outline-none"
              id="search-entries-input"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedEmotionFilter}
              onChange={(e) => setSelectedEmotionFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:bg-white focus:outline-none"
              id="filter-emotion-select"
            >
              <option value="all">All Emotions</option>
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
              id="toggle-favorites-filter-btn"
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500' : ''}`} />
              <span>Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Entries List Feed */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-amber-100/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif-accent">
              No journal entries found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search terms or filters, or write a fresh entry in the Journal Studio.
            </p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const isExpanded = expandedEntryId === entry.id;
            const emotionInfo = GO_EMOTIONS[entry.primaryEmotion];

            return (
              <motion.div
                key={entry.id}
                layout
                className="bg-white rounded-3xl border border-stone-200/80 hover:border-amber-200 shadow-2xs overflow-hidden transition-all"
                id={`journal-card-${entry.id}`}
              >
                {/* Header preview row */}
                <div
                  onClick={() => {
                    setExpandedEntryId(isExpanded ? null : entry.id);
                    audioSynth.playChime(380);
                  }}
                  className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${emotionInfo?.bgColor || 'bg-stone-100'} ${emotionInfo?.borderColor || 'border-stone-200'} ${emotionInfo?.textColor || 'text-stone-700'}`}>
                        {emotionInfo?.label || entry.primaryEmotion} ({entry.intensity}/10)
                      </span>

                      {entry.bodySensation && (
                        <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          Sensation: {entry.bodySensation}
                        </span>
                      )}

                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
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

                  {/* Actions & expand toggle */}
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
                      id={`bookmark-btn-${entry.id}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${entry.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this journal entry permanently?')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete entry"
                      id={`delete-btn-${entry.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="p-1 text-stone-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-stone-100 p-6 bg-stone-50/40 space-y-5"
                    >
                      {/* Entry text */}
                      <div className="bg-white p-5 rounded-2xl border border-stone-200 text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                        {entry.content}
                      </div>

                      {/* Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-stone-400" />
                          {entry.tags.map((t, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Companion Reflection section if generated */}
                      {entry.companionResponse && (
                        <div className="bg-gradient-to-br from-rose-50/70 to-amber-50/40 border border-rose-100 rounded-2xl p-5 space-y-3">
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

                          {/* Answered reflection prompts if any */}
                          {entry.reflectionsAnswered && entry.reflectionsAnswered.length > 0 && (
                            <div className="pt-2 space-y-2 border-t border-rose-100/60">
                              <h5 className="text-[11px] font-semibold text-stone-900">
                                Reflection Answers:
                              </h5>
                              {entry.reflectionsAnswered.map((ans, idx) => (
                                <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-stone-200 text-xs">
                                  <p className="font-medium text-stone-700 italic">"{ans.prompt}"</p>
                                  <p className="text-stone-900 mt-1">{ans.answer || '—'}</p>
                                </div>
                              ))}
                            </div>
                          )}
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
