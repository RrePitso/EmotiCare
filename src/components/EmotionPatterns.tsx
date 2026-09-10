import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Sparkles, 
  Heart, 
  TrendingUp, 
  Lightbulb, 
  Award, 
  Compass, 
  RefreshCw,
  Calendar,
  Layers
} from 'lucide-react';
import { JournalEntry, EmotionCategory } from '../types';
import { GO_EMOTIONS } from '../data/emotionsData';
import { requestPatternSynthesis, PatternPayload } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynth';

interface EmotionPatternsProps {
  entries: JournalEntry[];
}

export const EmotionPatterns: React.FC<EmotionPatternsProps> = ({ entries }) => {
  const [patternData, setPatternData] = useState<PatternPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, [entries.length]);

  const loadPatterns = async () => {
    setIsLoading(true);
    try {
      const data = await requestPatternSynthesis(entries);
      setPatternData(data);
    } catch (e) {
      console.error('Error loading patterns', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute emotion frequency metrics
  const emotionCounts: { [key in EmotionCategory]?: number } = {};
  const emotionIntensitySums: { [key in EmotionCategory]?: number } = {};

  entries.forEach(e => {
    emotionCounts[e.primaryEmotion] = (emotionCounts[e.primaryEmotion] || 0) + 1;
    emotionIntensitySums[e.primaryEmotion] = (emotionIntensitySums[e.primaryEmotion] || 0) + (e.intensity || 5);
  });

  const totalEntries = entries.length || 1;
  const sortedEmotions = (Object.keys(emotionCounts) as EmotionCategory[]).sort(
    (a, b) => (emotionCounts[b] || 0) - (emotionCounts[a] || 0)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="emotion-patterns-container">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-amber-100/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-indigo-800 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Continuity & Self-Discovery
          </span>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-accent mt-1">
            Your Emotional Landscape & Resilience Patterns
          </h1>
          <p className="text-xs text-stone-500">
            Discover recurring rhythms, celebrated breakthroughs, and longitudinal emotional trends.
          </p>
        </div>

        <button
          onClick={() => {
            audioSynth.playChime(440);
            loadPatterns();
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
          id="refresh-patterns-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Synthesize Continuity</span>
        </button>
      </div>

      {/* EmotiCare Continuity Synthesis Card */}
      <div className="bg-gradient-to-tr from-indigo-50/70 via-purple-50/50 to-rose-50/40 rounded-3xl p-6 border border-indigo-100 shadow-2xs space-y-5" id="continuity-synthesis-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 font-serif-accent">
              EmotiCare Continuity Synthesis
            </h2>
            <p className="text-[11px] text-stone-500">
              Personalized Psychological Rhythms
            </p>
          </div>
        </div>

        {patternData ? (
          <div className="space-y-4">
            <div className="bg-white/90 rounded-2xl p-5 border border-indigo-100/80 shadow-2xs">
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
                "{patternData.emoticareContinuitySummary}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Recurring Themes */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Recurring Emotional Themes
                </h3>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {patternData.recurringThemes?.map((theme, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Growth & Resilience Highlights */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-rose-600" />
                  Recognized Growth & Resilience
                </h3>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {patternData.growthHighlights?.map((growth, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✓</span>
                      <span>{growth}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-stone-500">
            Analyzing your journal entries...
          </div>
        )}
      </div>

      {/* GoEmotions Frequency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-amber-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              GoEmotions Distribution
            </h2>
            <span className="text-xs text-stone-400">Total Entries: {entries.length}</span>
          </div>

          <div className="space-y-3">
            {sortedEmotions.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4">No entries recorded yet.</p>
            ) : (
              sortedEmotions.map(cat => {
                const count = emotionCounts[cat] || 0;
                const percentage = Math.round((count / totalEntries) * 100);
                const avgIntensity = ((emotionIntensitySums[cat] || 0) / count).toFixed(1);
                const info = GO_EMOTIONS[cat];

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">
                        {info?.label || cat}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        {count} ({percentage}%) • Avg Intensity: {avgIntensity}/10
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: info?.color || '#f43f5e'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Somatic Cues and Journaling Rhythms */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-amber-100 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Somatic & Bodily Awareness
          </h2>

          <div className="space-y-3">
            {entries.slice(0, 5).map(e => (
              <div key={e.id} className="p-3 bg-stone-50/70 border border-stone-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">{e.title}</h4>
                  <p className="text-[11px] text-stone-500">
                    Sensation: <span className="font-medium text-stone-700">{e.bodySensation || 'Not specified'}</span>
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${GO_EMOTIONS[e.primaryEmotion]?.bgColor || 'bg-stone-100'} ${GO_EMOTIONS[e.primaryEmotion]?.textColor || 'text-stone-700'}`}>
                  {e.primaryEmotion} ({e.intensity}/10)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
