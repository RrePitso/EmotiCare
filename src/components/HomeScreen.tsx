import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Wind, 
  Compass, 
  Smile, 
  Frown, 
  Meh, 
  Check, 
  ChevronRight, 
  MessageSquare, 
  BookPlus, 
  CheckCircle2, 
  Plus, 
  X,
  Volume2,
  RefreshCw,
  Award
} from 'lucide-react';
import { EmotionCategory, JournalEntry, ChatMessage, UserProfile } from '../types';
import { GO_EMOTIONS, SOMATIC_SENSATIONS } from '../data/emotionsData';
import { sendChatMessage, requestEntryReflection } from '../services/geminiService';
import { getContinuityContextSummary } from '../utils/storage';
import { audioSynth } from '../utils/audioSynth';

interface HomeScreenProps {
  userProfile: UserProfile;
  pastEntries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onNavigateToToolbox: (tool?: 'breathing' | 'grounding' | 'reframing' | 'wins' | 'sounds') => void;
  onOpenCrisis: () => void;
}

// 8 Primary Emotion Chips for effortless 1-tap selection
const PRIMARY_EMOTIONS: {
  id: EmotionCategory;
  emoji: string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  activeRing: string;
}[] = [
  { id: 'joy', emoji: '😊', label: 'Happy', bgColor: 'bg-yellow-50/80', textColor: 'text-amber-800', borderColor: 'border-yellow-200', activeRing: 'ring-amber-400 bg-amber-100/90' },
  { id: 'calm', emoji: '😌', label: 'Calm', bgColor: 'bg-emerald-50/80', textColor: 'text-emerald-800', borderColor: 'border-emerald-200', activeRing: 'ring-emerald-400 bg-emerald-100/90' },
  { id: 'sadness', emoji: '😔', label: 'Sad', bgColor: 'bg-blue-50/80', textColor: 'text-blue-800', borderColor: 'border-blue-200', activeRing: 'ring-blue-400 bg-blue-100/90' },
  { id: 'anxiety', emoji: '😟', label: 'Anxious', bgColor: 'bg-amber-50/80', textColor: 'text-amber-900', borderColor: 'border-amber-200', activeRing: 'ring-amber-400 bg-amber-100/90' },
  { id: 'anger', emoji: '😤', label: 'Frustrated', bgColor: 'bg-rose-50/80', textColor: 'text-rose-800', borderColor: 'border-rose-200', activeRing: 'ring-rose-400 bg-rose-100/90' },
  { id: 'loneliness', emoji: '🥺', label: 'Lonely', bgColor: 'bg-purple-50/80', textColor: 'text-purple-800', borderColor: 'border-purple-200', activeRing: 'ring-purple-400 bg-purple-100/90' },
  { id: 'overwhelm', emoji: '😓', label: 'Overwhelmed', bgColor: 'bg-orange-50/80', textColor: 'text-orange-800', borderColor: 'border-orange-200', activeRing: 'ring-orange-400 bg-orange-100/90' },
  { id: 'gratitude', emoji: '❤️', label: 'Something Else', bgColor: 'bg-pink-50/80', textColor: 'text-pink-800', borderColor: 'border-pink-200', activeRing: 'ring-pink-400 bg-pink-100/90' },
];

const QUICK_BODY_CUES = [
  'Tightness in chest',
  'Knot or flutter in stomach',
  'Heavy shoulders',
  'Warmth in heart area',
  'Tears behind eyes',
  'Steady & relaxed'
];

const GENTLE_STARTERS = [
  "I'm feeling really stressed about tomorrow...",
  "Something happened today that hurt my feelings...",
  "I just need to vent without anyone judging me...",
  "I accomplished something small and want to celebrate it..."
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  pastEntries,
  onSaveEntry,
  onNavigateToToolbox,
  onOpenCrisis
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionCategory>('calm');
  const [showFullEmotionPalette, setShowFullEmotionPalette] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedBodyCue, setSelectedBodyCue] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(6);
  const [showBodyOptions, setShowBodyOptions] = useState(false);

  // Response conversation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeThread, setActiveThread] = useState<{
    userPrompt: string;
    emotion: EmotionCategory;
    bodyCue?: string;
    reply: string;
    reflectionPrompts?: string[];
    suggestedTool?: 'breathing' | 'grounding' | 'reframing';
    savedEntryId?: string;
  } | null>(null);

  const [followUpText, setFollowUpText] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const recognitionRef = useRef<any>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechRecognition(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setInputText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + transcript);
        }
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!hasSpeechRecognition || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        audioSynth.playChime(580);
      } catch (err) {
        console.error('Speech error', err);
      }
    }
  };

  const handleSelectEmotion = (emotionId: EmotionCategory) => {
    if (emotionId === 'gratitude' && !showFullEmotionPalette) {
      // Something else clicked
      setShowFullEmotionPalette(true);
      audioSynth.playChime(480);
      return;
    }
    setSelectedEmotion(emotionId);
    audioSynth.playChime(380 + emotionId.length * 15);
  };

  // Main unified Check-In submission
  const handleCheckIn = async (customText?: string) => {
    const textToSubmit = customText || inputText.trim();
    if (!textToSubmit || isProcessing) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsProcessing(true);
    audioSynth.playChime(440);

    const emotionInfo = GO_EMOTIONS[selectedEmotion] || GO_EMOTIONS.anxiety;

    try {
      const continuityContext = getContinuityContextSummary(pastEntries);
      
      // Request reflection
      const reflection = await requestEntryReflection({
        title: `${emotionInfo.label.split('&')[0]} Reflection`,
        content: textToSubmit,
        primaryEmotion: selectedEmotion,
        intensity: intensity || 6,
        bodySensation: selectedBodyCue || undefined
      }, continuityContext);

      // Auto-save entry to Journey
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        title: `${emotionInfo.label.split('&')[0]} Moment`,
        content: textToSubmit,
        date: new Date().toISOString(),
        primaryEmotion: selectedEmotion,
        intensity: intensity || 6,
        bodySensation: selectedBodyCue || undefined,
        tags: [selectedEmotion, 'check-in'],
        companionResponse: reflection
      };

      onSaveEntry(newEntry);
      audioSynth.playChime(528);

      let suggestedTool: 'breathing' | 'grounding' | 'reframing' | undefined;
      if (reflection.suggestedTechnique === 'box_breathing') suggestedTool = 'breathing';
      else if (reflection.suggestedTechnique === 'grounding_54321') suggestedTool = 'grounding';
      else if (reflection.suggestedTechnique === 'reframing') suggestedTool = 'reframing';
      else if (['anxiety', 'overwhelm', 'anger'].includes(selectedEmotion)) suggestedTool = 'breathing';

      setActiveThread({
        userPrompt: textToSubmit,
        emotion: selectedEmotion,
        bodyCue: selectedBodyCue,
        reply: reflection.fullText,
        reflectionPrompts: reflection.reflectionPrompts,
        suggestedTool,
        savedEntryId: newEntry.id
      });

      setFollowUpHistory([]);
      setInputText('');
      
      // Gentle celebration chime
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#f43f5e', '#fbbf24', '#34d399']
      });

      setTimeout(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);

    } catch (err) {
      console.error('Check-in error:', err);
      // Resilient supportive fallback
      const fallbackReply = `I hear how much is on your mind right now. Thank you for giving yourself permission to put these words down. Take a slow, gentle breath with me — you don't have to carry this alone.`;
      
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        title: `${emotionInfo.label.split('&')[0]} Moment`,
        content: textToSubmit,
        date: new Date().toISOString(),
        primaryEmotion: selectedEmotion,
        intensity: intensity || 6,
        bodySensation: selectedBodyCue || undefined,
        tags: [selectedEmotion, 'check-in']
      };

      onSaveEntry(newEntry);

      setActiveThread({
        userPrompt: textToSubmit,
        emotion: selectedEmotion,
        bodyCue: selectedBodyCue,
        reply: fallbackReply,
        suggestedTool: 'breathing',
        savedEntryId: newEntry.id
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Follow-up conversation handler
  const handleSendFollowUp = async () => {
    if (!followUpText.trim() || isFollowUpLoading || !activeThread) return;

    const userMessage = followUpText.trim();
    const updatedHistory = [...followUpHistory, { role: 'user' as const, text: userMessage }];
    setFollowUpHistory(updatedHistory);
    setFollowUpText('');
    setIsFollowUpLoading(true);

    try {
      const historyForApi: ChatMessage[] = [
        { id: '1', role: 'user', content: activeThread.userPrompt, timestamp: new Date().toISOString() },
        { id: '2', role: 'assistant', content: activeThread.reply, timestamp: new Date().toISOString() },
        ...updatedHistory.map((h, i) => ({
          id: `f-${i}`,
          role: h.role,
          content: h.text,
          timestamp: new Date().toISOString()
        }))
      ];

      const continuityContext = getContinuityContextSummary(pastEntries);
      const res = await sendChatMessage(userMessage, historyForApi, continuityContext);

      if (res.isCrisis) {
        onOpenCrisis();
      }

      audioSynth.playChime(528);
      setFollowUpHistory([...updatedHistory, { role: 'assistant' as const, text: res.reply }]);
    } catch (err) {
      console.error('Follow-up error', err);
      setFollowUpHistory([...updatedHistory, {
        role: 'assistant' as const,
        text: "I'm listening and holding this space with you. Take all the time you need."
      }]);
    } finally {
      setIsFollowUpLoading(false);
      setTimeout(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleStartFresh = () => {
    setActiveThread(null);
    setFollowUpHistory([]);
    setInputText('');
    audioSynth.playChime(440);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 md:pb-8" id="home-screen-root">
      {/* 1. Welcoming Header */}
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-accent">
          {getGreeting()}, {userProfile.name || 'friend'}.
        </h1>
        <p className="text-base text-stone-600 font-medium">
          How are you feeling right now?
        </p>
      </div>

      {/* 2. Emotion Chips Grid (8 primary choices) */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRIMARY_EMOTIONS.map((item) => {
            const isSelected = selectedEmotion === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectEmotion(item.id)}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all shadow-2xs ${
                  isSelected
                    ? `${item.activeRing} ring-2 shadow-xs scale-[1.02]`
                    : `${item.bgColor} ${item.borderColor} ${item.textColor} hover:opacity-95 hover:scale-[1.01]`
                }`}
                id={`emotion-chip-${item.id}`}
              >
                <span className="text-xl sm:text-2xl">{item.emoji}</span>
                <span className="text-xs sm:text-sm font-semibold truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Full palette picker modal/drawer */}
        {showFullEmotionPalette && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white rounded-3xl border border-rose-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Explore More Feelings
              </span>
              <button
                type="button"
                onClick={() => setShowFullEmotionPalette(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(GO_EMOTIONS) as EmotionCategory[]).map((catKey) => {
                const info = GO_EMOTIONS[catKey];
                const isSelected = selectedEmotion === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setSelectedEmotion(catKey);
                      setShowFullEmotionPalette(false);
                      audioSynth.playChime(420);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? `${info.bgColor} ${info.borderColor} ${info.textColor} ring-2 ring-rose-400 font-semibold`
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* 3. Main Check-In Canvas (When no active thread or writing new) */}
      {!activeThread && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-100 shadow-xs space-y-4"
          id="main-checkin-card"
        >
          {/* Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              What's on your mind?
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleCheckIn();
                }
              }}
              placeholder="Write or speak freely... 'I feel overwhelmed with work today', 'Had a quiet realization', or anything you need to express."
              rows={4}
              className="w-full text-base sm:text-lg leading-relaxed text-stone-800 placeholder:text-stone-400 bg-stone-50/50 p-4 rounded-2xl border border-stone-200 focus:bg-white focus:ring-2 focus:ring-rose-300 focus:border-rose-400 focus:outline-none resize-y transition-all font-sans"
              id="home-checkin-textarea"
            />
          </div>

          {/* Progressive Disclosure: How does your body feel? */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowBodyOptions(!showBodyOptions)}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
              id="toggle-body-cues-btn"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{showBodyOptions ? 'Hide body sensations' : 'How does your body feel? (Optional)'}</span>
            </button>

            {showBodyOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80"
              >
                <div className="flex flex-wrap gap-2">
                  {QUICK_BODY_CUES.map((cue, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedBodyCue(selectedBodyCue === cue ? '' : cue);
                        audioSynth.playChime(420);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedBodyCue === cue
                          ? 'bg-rose-100 border-rose-300 text-rose-900 font-semibold shadow-2xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {cue}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-stone-500 whitespace-nowrap">Intensity: {intensity}/10</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* TWO GIANT ACTIONS: 🎤 Speak & ✍️ Check In */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Speak button */}
            {hasSpeechRecognition && (
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl border text-sm font-semibold transition-all shadow-xs ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-4 ring-rose-200'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
                id="home-speak-btn"
              >
                {isListening ? (
                  <>
                    <Mic className="w-5 h-5 text-white animate-bounce" />
                    <span>Listening... (Tap to pause)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-rose-500" />
                    <span>🎤 Speak</span>
                  </>
                )}
              </button>
            )}

            {/* Submit / Write button */}
            <button
              type="button"
              onClick={() => handleCheckIn()}
              disabled={!inputText.trim() || isProcessing}
              className={`flex items-center justify-center gap-2.5 py-4 px-5 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-2xl text-sm font-semibold transition-all shadow-xs ${
                !hasSpeechRecognition ? 'sm:col-span-2' : ''
              }`}
              id="home-submit-checkin-btn"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>EmotiCare is listening...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>✍️ Check In</span>
                </>
              )}
            </button>
          </div>

          {/* Gentle Starters */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Gentle prompts if you feel stuck:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GENTLE_STARTERS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(starter);
                    audioSynth.playChime(420);
                  }}
                  className="text-xs px-3 py-1.5 bg-stone-50 hover:bg-rose-50/60 border border-stone-200 hover:border-rose-200 text-stone-600 hover:text-rose-900 rounded-xl transition-colors"
                >
                  "{starter}"
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Active Warm Conversation & Auto-Saved Reflection */}
      {activeThread && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
          id="active-companion-thread"
        >
          {/* User's expression card */}
          <div className="bg-stone-900 text-white p-5 rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                Feeling {GO_EMOTIONS[activeThread.emotion]?.label || activeThread.emotion}
              </span>
              <span>Just now</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
              {activeThread.userPrompt}
            </p>
            {activeThread.bodyCue && (
              <span className="inline-block text-[11px] bg-stone-800 px-2.5 py-0.5 rounded-lg text-stone-300">
                Body sensation: {activeThread.bodyCue}
              </span>
            )}
          </div>

          {/* EmotiCare's Empathetic Response */}
          <div className="bg-gradient-to-b from-rose-50/80 via-white to-amber-50/40 border border-rose-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-400 to-amber-300 p-0.5 shadow-2xs">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif-accent">
                    EmotiCare
                  </h3>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Automatically saved to your Journey
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartFresh}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium px-2.5 py-1 rounded-lg hover:bg-white/80 transition-colors"
                id="new-checkin-btn"
              >
                + New Check-In
              </button>
            </div>

            {/* Response body */}
            <div className="prose prose-sm max-w-none text-stone-800 leading-relaxed space-y-2">
              <ReactMarkdown>{activeThread.reply}</ReactMarkdown>
            </div>

            {/* Suggested Supportive Action from Toolbox */}
            {activeThread.suggestedTool && (
              <div className="pt-2 border-t border-rose-100/70 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-stone-600">
                  Supportive next step for you:
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateToToolbox(activeThread.suggestedTool)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold rounded-xl shadow-2xs transition-all"
                  id="suggested-tool-btn"
                >
                  {activeThread.suggestedTool === 'breathing' && <Wind className="w-4 h-4 text-teal-600" />}
                  {activeThread.suggestedTool === 'grounding' && <Compass className="w-4 h-4 text-amber-600" />}
                  {activeThread.suggestedTool === 'reframing' && <Sparkles className="w-4 h-4 text-indigo-600" />}
                  <span>
                    {activeThread.suggestedTool === 'breathing' ? 'Open Breathing Orb' :
                     activeThread.suggestedTool === 'grounding' ? 'Try 5-4-3-2-1 Grounding' :
                     'See Another Perspective'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            )}
          </div>

          {/* Follow-up conversation bubbles */}
          {followUpHistory.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                item.role === 'user'
                  ? 'bg-stone-900 text-white rounded-tr-xs text-sm'
                  : 'bg-white border border-rose-100 text-stone-800 rounded-tl-xs text-sm prose prose-sm'
              }`}>
                {item.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{item.text}</p>
                ) : (
                  <ReactMarkdown>{item.text}</ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}

          {isFollowUpLoading && (
            <div className="flex items-center gap-2 text-xs text-stone-500 pl-2">
              <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
              <span>EmotiCare is typing...</span>
            </div>
          )}

          {/* Follow-up Input Bar */}
          <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFollowUp();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="Talk more or share another thought..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                id="followup-chat-input"
              />
              <button
                type="submit"
                disabled={!followUpText.trim() || isFollowUpLoading}
                className="p-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-200 text-white rounded-xl transition-colors shadow-2xs"
                id="send-followup-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div ref={threadEndRef} />
        </motion.div>
      )}
    </div>
  );
};
