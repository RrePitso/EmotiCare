import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Heart, 
  Save, 
  Mic, 
  MicOff, 
  Compass, 
  Wind, 
  Tag, 
  CheckCircle, 
  HelpCircle, 
  Lightbulb, 
  Activity, 
  Bookmark,
  Share2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { JournalEntry, EmotionCategory } from '../types';
import { GO_EMOTIONS, SOMATIC_SENSATIONS } from '../data/emotionsData';
import { requestEntryReflection } from '../services/geminiService';
import { getContinuityContextSummary } from '../utils/storage';
import { audioSynth } from '../utils/audioSynth';

const PROMPT_IDEAS = [
  "What felt heaviest to carry today, and why?",
  "What is one emotion you tried to suppress or ignore today?",
  "Where did you notice a glimmer of joy, relief, or quiet strength?",
  "If your current feeling had a voice, what would it be trying to protect you from?",
  "What boundary do you need to give yourself permission to uphold?",
  "What would your most compassionate self say to you right now?"
];

interface JournalStudioProps {
  onSaveEntry: (entry: JournalEntry) => void;
  pastEntries: JournalEntry[];
  initialContent?: string;
  initialEmotion?: EmotionCategory;
  onNavigateToToolkit: (tool: 'grounding_54321' | 'box_breathing' | 'reframing') => void;
}

export const JournalStudio: React.FC<JournalStudioProps> = ({
  onSaveEntry,
  pastEntries,
  initialContent = '',
  initialEmotion = 'anxiety',
  onNavigateToToolkit
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent);
  const [primaryEmotion, setPrimaryEmotion] = useState<EmotionCategory>(initialEmotion);
  const [intensity, setIntensity] = useState<number>(6);
  const [bodySensation, setBodySensation] = useState<string>('Tightness in chest');
  const [tagsInput, setTagsInput] = useState<string>('reflection');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [companionReflection, setCompanionReflection] = useState<JournalEntry['companionResponse'] | null>(null);
  const [answeredPrompts, setAnsweredPrompts] = useState<{ [prompt: string]: string }>({});
  const [isSaved, setIsSaved] = useState(false);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setContent(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechRecognitionSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        audioSynth.playChime(600);
      } catch (e) {
        console.error('Speech error', e);
      }
    }
  };

  const handleReflectWithEmotiCare = async () => {
    if (!content.trim()) return;
    setIsGeneratingReflection(true);
    audioSynth.playChime(440);

    try {
      const continuityContext = getContinuityContextSummary(pastEntries);
      const reflection = await requestEntryReflection({
        title: title || 'Journal Entry',
        content,
        primaryEmotion,
        intensity,
        bodySensation
      }, continuityContext);

      setCompanionReflection(reflection);
      audioSynth.playChime(528);
    } catch (err) {
      console.error('Error reflecting:', err);
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const handleSave = () => {
    if (!content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const formattedReflections = companionReflection?.reflectionPrompts?.map(prompt => ({
      prompt,
      answer: answeredPrompts[prompt] || ''
    })) || [];

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: title.trim() || `Journal: ${GO_EMOTIONS[primaryEmotion]?.label.split('&')[0]} Moment`,
      content,
      date: new Date().toISOString(),
      primaryEmotion,
      intensity,
      bodySensation,
      tags,
      isFavorite,
      companionResponse: companionReflection || undefined,
      reflectionsAnswered: formattedReflections
    };

    onSaveEntry(newEntry);
    setIsSaved(true);
    audioSynth.playChime(660);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#fbbf24', '#2dd4bf', '#a78bfa']
    });

    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  const selectedEmotionInfo = GO_EMOTIONS[primaryEmotion];

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="journal-studio-container">
      {/* Top Header & Guided Inspiration */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-amber-100/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              Mindful Journaling Sanctuary
            </span>
            <h1 className="text-2xl font-bold text-stone-900 font-serif-accent mt-1">
              Give Voice to Your Inner World
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Name your emotions, notice somatic body cues, and receive deep empathetic reflection from EmotiCare.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const random = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
                setContent(prev => (prev ? `${prev}\n\n*Prompt: ${random}*\n` : `*Prompt: ${random}*\n\n`));
                audioSynth.playChime(480);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors shadow-2xs"
              id="insert-prompt-btn"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Inspire Prompt</span>
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite 
                  ? 'bg-amber-50 border-amber-300 text-amber-600' 
                  : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
              }`}
              title="Mark as special moment"
              id="favorite-entry-btn"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Emotion & Somatic Check-in */}
        <div className="lg:col-span-4 space-y-5">
          {/* Emotion Wheel Picker */}
          <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                1. Core Emotion (GoEmotions)
              </h2>
              <span className="text-[10px] text-stone-400">Select one</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {(Object.keys(GO_EMOTIONS) as EmotionCategory[]).map(catKey => {
                const info = GO_EMOTIONS[catKey];
                const isSelected = primaryEmotion === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => {
                      setPrimaryEmotion(catKey);
                      audioSynth.playChime(350 + catKey.length * 20);
                    }}
                    className={`p-2.5 text-left rounded-2xl border transition-all text-xs font-medium flex flex-col justify-between ${
                      isSelected
                        ? `${info.bgColor} ${info.borderColor} ${info.textColor} ring-2 ring-rose-400/40 shadow-xs`
                        : 'bg-stone-50/70 border-stone-200/70 text-stone-600 hover:bg-stone-100/70'
                    }`}
                    id={`emotion-select-${catKey}`}
                  >
                    <span className="font-semibold">{info.label.split('&')[0]}</span>
                    <span className="text-[10px] opacity-75 line-clamp-1 mt-1 font-normal">
                      {info.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Guidance Note on Selected Emotion */}
            {selectedEmotionInfo && (
              <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${selectedEmotionInfo.bgColor} ${selectedEmotionInfo.borderColor} ${selectedEmotionInfo.textColor}`}>
                <p className="font-semibold mb-0.5">EmotiCare Gentle Stance:</p>
                <p className="text-[11px] opacity-90">{selectedEmotionInfo.guidanceNote}</p>
              </div>
            )}
          </div>

          {/* Intensity Slider */}
          <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                2. Emotional Intensity
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
                {intensity} / 10
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              id="emotion-intensity-slider"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>1 - Subtle whisper</span>
              <span>5 - Noticeable</span>
              <span>10 - Overwhelming surge</span>
            </div>
          </div>

          {/* Somatic Check-in: Where in your body? */}
          <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              3. Somatic Sensation
            </h2>
            <p className="text-[11px] text-stone-500">
              Where does your body feel this emotion right now?
            </p>

            <select
              value={bodySensation}
              onChange={(e) => setBodySensation(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:bg-white focus:ring-2 focus:ring-rose-300 focus:outline-none"
              id="somatic-sensation-select"
            >
              {SOMATIC_SENSATIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-2xs space-y-2">
            <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. work, relationships, self-compassion"
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:bg-white focus:ring-2 focus:ring-rose-300 focus:outline-none"
              id="entry-tags-input"
            />
          </div>
        </div>

        {/* Right Column: Writing Canvas & EmotiCare Reflection */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Writing Pad */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title or theme (optional)..."
                className="w-full text-base font-bold text-stone-900 font-serif-accent border-b border-transparent hover:border-stone-200 focus:border-rose-400 focus:outline-none pb-1 transition-colors placeholder:text-stone-300"
                id="entry-title-input"
              />

              {/* Dictation voice button */}
              {speechRecognitionSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                  title="Speak your journal entry aloud"
                  id="voice-dictation-btn"
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
              )}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely without editing or censoring yourself. EmotiCare is here to walk alongside you with zero judgment..."
              rows={12}
              className="w-full text-sm leading-relaxed text-stone-800 placeholder:text-stone-400 bg-stone-50/40 p-4 rounded-2xl border border-stone-200/80 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none resize-y transition-all font-sans"
              id="entry-content-textarea"
            />

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-stone-400">
                {content.split(/\s+/).filter(Boolean).length} words • {content.length} characters
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReflectWithEmotiCare}
                  disabled={!content.trim() || isGeneratingReflection}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                  id="reflect-with-emoticare-btn"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingReflection ? 'animate-spin' : ''}`} />
                  <span>
                    {isGeneratingReflection ? 'EmotiCare is Reflecting...' : 'Reflect with EmotiCare'}
                  </span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={!content.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 text-white disabled:text-stone-400 text-xs font-semibold rounded-xl shadow-xs transition-all"
                  id="save-entry-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaved ? 'Saved to Sanctuary!' : 'Save Entry'}</span>
                </button>
              </div>
            </div>

            {isSaved && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Your reflection has been safely stored in your archive.</span>
              </motion.div>
            )}
          </div>

          {/* EmotiCare Empathetic Reflection Card */}
          <AnimatePresence>
            {companionReflection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="bg-gradient-to-b from-rose-50/60 to-amber-50/40 rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-5"
                id="companion-reflection-card"
              >
                <div className="flex items-center justify-between border-b border-rose-100/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 font-serif-accent">
                        EmotiCare Companion Reflection
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Structured Empathetic Processing
                      </p>
                    </div>
                  </div>

                  {companionReflection.suggestedTechnique && (
                    <button
                      onClick={() => onNavigateToToolkit(
                        companionReflection.suggestedTechnique === 'grounding_54321' ? 'grounding_54321'
                        : companionReflection.suggestedTechnique === 'box_breathing' ? 'box_breathing'
                        : 'reframing'
                      )}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl transition-colors shadow-2xs"
                      id="reflection-suggested-tool-btn"
                    >
                      <Compass className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        {companionReflection.suggestedTechnique === 'grounding_54321' ? 'Try 5-4-3-2-1 Grounding' :
                         companionReflection.suggestedTechnique === 'box_breathing' ? 'Try Box Breathing' :
                         'Try Thought Reframe'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Structured Breakdown */}
                <div className="space-y-4 text-sm leading-relaxed text-stone-800">
                  <div className="bg-white/80 rounded-2xl p-4 border border-rose-100/70">
                    <div className="prose prose-sm max-w-none text-stone-800">
                      <ReactMarkdown>{companionReflection.fullText}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Reflection Prompts to answer */}
                  {companionReflection.reflectionPrompts && companionReflection.reflectionPrompts.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        Guided Deeper Exploration
                      </h4>

                      {companionReflection.reflectionPrompts.map((prompt, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
                          <p className="text-xs font-semibold text-stone-900 italic">
                            "{prompt}"
                          </p>
                          <textarea
                            value={answeredPrompts[prompt] || ''}
                            onChange={(e) => setAnsweredPrompts({
                              ...answeredPrompts,
                              [prompt]: e.target.value
                            })}
                            placeholder="Jot down a few words or thoughts in response..."
                            rows={2}
                            className="w-full text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:outline-none"
                            id={`prompt-answer-${idx}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
