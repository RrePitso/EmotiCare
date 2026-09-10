import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Wind, 
  Compass, 
  Sparkles, 
  Award, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Heart, 
  Eye, 
  Hand, 
  Ear, 
  Smile, 
  Plus, 
  Trash2,
  CloudRain,
  Waves,
  Flame,
  Bell,
  ArrowRight
} from 'lucide-react';
import { ThoughtReframe, ResilienceMoment, EmotionCategory } from '../types';
import { GO_EMOTIONS } from '../data/emotionsData';
import { requestThoughtReframe } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynth';

interface ToolboxScreenProps {
  initialTool?: 'breathing' | 'grounding' | 'reframing' | 'wins' | 'sounds';
  reframes: ThoughtReframe[];
  resilienceMoments: ResilienceMoment[];
  onSaveReframe: (reframe: ThoughtReframe) => void;
  onSaveResilienceMoment: (moment: ResilienceMoment) => void;
  onDeleteReframe: (id: string) => void;
  onDeleteResilienceMoment: (id: string) => void;
}

type ToolTab = 'breathing' | 'grounding' | 'reframing' | 'wins' | 'sounds';

export const ToolboxScreen: React.FC<ToolboxScreenProps> = ({
  initialTool = 'breathing',
  reframes,
  resilienceMoments,
  onSaveReframe,
  onSaveResilienceMoment,
  onDeleteReframe,
  onDeleteResilienceMoment
}) => {
  const [activeTool, setActiveTool] = useState<ToolTab>(initialTool);

  useEffect(() => {
    if (initialTool) setActiveTool(initialTool);
  }, [initialTool]);

  // --- 1. Breathing State ---
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [breathingPattern, setBreathingPattern] = useState<'box' | '478'>('box');

  useEffect(() => {
    let interval: any;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev <= 1) {
            // Switch phase
            if (breathingPattern === 'box') {
              if (breathingPhase === 'Inhale') { setBreathingPhase('Hold'); audioSynth.playChime(500); return 4; }
              if (breathingPhase === 'Hold') { setBreathingPhase('Exhale'); audioSynth.playChime(420); return 4; }
              if (breathingPhase === 'Exhale') { setBreathingPhase('Rest'); audioSynth.playChime(350); return 4; }
              if (breathingPhase === 'Rest') { setBreathingPhase('Inhale'); audioSynth.playChime(580); return 4; }
            } else {
              // 4-7-8
              if (breathingPhase === 'Inhale') { setBreathingPhase('Hold'); audioSynth.playChime(500); return 7; }
              if (breathingPhase === 'Hold') { setBreathingPhase('Exhale'); audioSynth.playChime(380); return 8; }
              if (breathingPhase === 'Exhale') { setBreathingPhase('Inhale'); audioSynth.playChime(580); return 4; }
            }
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase, breathingPattern]);

  // --- 2. 5-4-3-2-1 Grounding State ---
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState<string[]>(['', '', '', '', '']);

  const GROUNDING_STEPS = [
    { count: 5, sense: 'See', prompt: 'Look around and notice 5 things you can see.', icon: Eye, color: 'text-blue-500 bg-blue-50' },
    { count: 4, sense: 'Touch', prompt: 'Notice 4 things you can physically touch or feel (e.g. feet on floor, sweater fabric).', icon: Hand, color: 'text-amber-500 bg-amber-50' },
    { count: 3, sense: 'Hear', prompt: 'Listen carefully for 3 distinct sounds around you.', icon: Ear, color: 'text-purple-500 bg-purple-50' },
    { count: 2, sense: 'Smell', prompt: 'Notice 2 things you can smell, or 2 soothing scents you love.', icon: Wind, color: 'text-teal-500 bg-teal-50' },
    { count: 1, sense: 'Taste or Self-Kindness', prompt: 'Notice 1 taste, or say one kind, gentle sentence to yourself.', icon: Heart, color: 'text-rose-500 bg-rose-50' },
  ];

  // --- 3. See Another Perspective State ---
  const [thoughtInput, setThoughtInput] = useState('');
  const [thoughtEmotion, setThoughtEmotion] = useState<EmotionCategory>('anxiety');
  const [isReframing, setIsReframing] = useState(false);
  const [reframeResult, setReframeResult] = useState<ThoughtReframe | null>(null);

  const handleRunReframe = async () => {
    if (!thoughtInput.trim() || isReframing) return;
    setIsReframing(true);
    audioSynth.playChime(440);
    try {
      const res = await requestThoughtReframe(thoughtInput, thoughtEmotion);
      const newReframe: ThoughtReframe = {
        id: `reframe-${Date.now()}`,
        date: new Date().toISOString(),
        automaticThought: thoughtInput,
        underlyingEmotion: thoughtEmotion,
        distortionType: res.distortionType,
        balancedPerspective: res.balancedPerspective,
        selfCompassionMessage: res.selfCompassionMessage
      };
      setReframeResult(newReframe);
      onSaveReframe(newReframe);
      audioSynth.playChime(528);
    } catch (err) {
      console.error('Reframe error', err);
    } finally {
      setIsReframing(false);
    }
  };

  // --- 4. Wins & Breakthroughs State ---
  const [winTitle, setWinTitle] = useState('');
  const [winInsight, setWinInsight] = useState('');
  const [winShift, setWinShift] = useState('');
  const [showAddWin, setShowAddWin] = useState(false);

  const handleAddWin = () => {
    if (!winTitle.trim() || !winInsight.trim()) return;
    const moment: ResilienceMoment = {
      id: `resilience-${Date.now()}`,
      date: new Date().toISOString(),
      title: winTitle.trim(),
      insight: winInsight.trim(),
      emotionShift: winShift.trim() || 'Found inner strength'
    };
    onSaveResilienceMoment(moment);
    setWinTitle('');
    setWinInsight('');
    setWinShift('');
    setShowAddWin(false);
    audioSynth.playChime(528);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  // --- 5. Calm Sounds State ---
  const [soundMode, setSoundMode] = useState<'off' | 'rain' | 'stream' | 'hearth' | 'bowl'>('off');

  const handleToggleSound = (mode: 'rain' | 'stream' | 'hearth' | 'bowl') => {
    if (soundMode === mode) {
      setSoundMode('off');
      audioSynth.stopSoundscape();
    } else {
      setSoundMode(mode);
      audioSynth.playSoundscape(mode);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8" id="toolbox-screen-root">
      {/* 1. Header Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-amber-100/90 shadow-2xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Supportive Sanctuary Tools
        </div>
        <h1 className="text-2xl font-bold text-stone-900 font-serif-accent">
          Toolbox for Calm & Clarity
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Gentle, research-backed exercises to calm your nervous system and soften difficult thoughts.
        </p>
      </div>

      {/* 2. Tool Navigation Chips */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/70" id="toolbox-tab-bar">
        <button
          type="button"
          onClick={() => { setActiveTool('breathing'); audioSynth.playChime(440); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTool === 'breathing' ? 'bg-white text-teal-900 shadow-2xs font-bold' : 'text-stone-600 hover:bg-white/50'
          }`}
          id="tab-tool-breathing"
        >
          <Wind className="w-4 h-4 text-teal-600" />
          <span>Breathing</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTool('grounding'); audioSynth.playChime(480); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTool === 'grounding' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-stone-600 hover:bg-white/50'
          }`}
          id="tab-tool-grounding"
        >
          <Compass className="w-4 h-4 text-amber-600" />
          <span>5-4-3-2-1 Grounding</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTool('reframing'); audioSynth.playChime(520); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTool === 'reframing' ? 'bg-white text-indigo-900 shadow-2xs font-bold' : 'text-stone-600 hover:bg-white/50'
          }`}
          id="tab-tool-reframing"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>See Another Perspective</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTool('wins'); audioSynth.playChime(560); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTool === 'wins' ? 'bg-white text-rose-900 shadow-2xs font-bold' : 'text-stone-600 hover:bg-white/50'
          }`}
          id="tab-tool-wins"
        >
          <Award className="w-4 h-4 text-rose-600" />
          <span>Wins & Breakthroughs</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTool('sounds'); audioSynth.playChime(600); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTool === 'sounds' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-stone-600 hover:bg-white/50'
          }`}
          id="tab-tool-sounds"
        >
          <Volume2 className="w-4 h-4 text-purple-600" />
          <span>Calm Sounds</span>
        </button>
      </div>

      {/* 3. ACTIVE TOOL WORKSPACE */}

      {/* --- TOOL 1: BREATHING ORB --- */}
      {activeTool === 'breathing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-teal-100 shadow-xs text-center space-y-8"
          id="tool-breathing-workspace"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif-accent">
              Mindful Breathing Orb
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              Synchronize your breath to signal safety to your nervous system.
            </p>
          </div>

          {/* Pattern Selector */}
          <div className="inline-flex p-1 bg-stone-100 rounded-2xl">
            <button
              onClick={() => { setBreathingPattern('box'); setBreathingPhase('Inhale'); setBreathingTimer(4); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                breathingPattern === 'box' ? 'bg-white text-teal-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              Box 4-4-4-4 (Calm Focus)
            </button>
            <button
              onClick={() => { setBreathingPattern('478'); setBreathingPhase('Inhale'); setBreathingTimer(4); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                breathingPattern === '478' ? 'bg-white text-teal-800 shadow-2xs' : 'text-stone-600'
              }`}
            >
              4-7-8 (Deep Relaxation)
            </button>
          </div>

          {/* Animated Glowing Breathing Orb */}
          <div className="relative py-10 flex items-center justify-center">
            <motion.div
              animate={{
                scale: !breathingActive
                  ? 1
                  : breathingPhase === 'Inhale'
                  ? 1.5
                  : breathingPhase === 'Hold'
                  ? 1.5
                  : breathingPhase === 'Exhale'
                  ? 1
                  : 1,
              }}
              transition={{
                duration: breathingActive ? breathingTimer : 1,
                ease: 'easeInOut'
              }}
              className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-teal-300 via-cyan-200 to-rose-200 flex flex-col items-center justify-center shadow-xl shadow-teal-100/50 relative"
            >
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                <span className="text-base sm:text-lg font-bold text-teal-950 font-serif-accent">
                  {breathingActive ? breathingPhase : 'Ready'}
                </span>
                <span className="text-3xl font-extrabold text-teal-600 font-mono mt-1">
                  {breathingActive ? breathingTimer : '4'}
                </span>
                <span className="text-[10px] text-stone-400 mt-1">seconds</span>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const nextState = !breathingActive;
                setBreathingActive(nextState);
                if (nextState) audioSynth.playChime(580);
              }}
              className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2"
              id="breathing-toggle-btn"
            >
              {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{breathingActive ? 'Pause Exercise' : 'Begin Breathing'}</span>
            </button>

            <button
              onClick={() => {
                setBreathingActive(false);
                setBreathingPhase('Inhale');
                setBreathingTimer(4);
              }}
              className="p-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* --- TOOL 2: 5-4-3-2-1 GROUNDING --- */}
      {activeTool === 'grounding' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-xs space-y-6"
          id="tool-grounding-workspace"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif-accent">
              5-4-3-2-1 Sensory Grounding
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Gently bring your mind back into the present physical moment.
            </p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2">
            {GROUNDING_STEPS.map((s, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx <= groundingStep ? 'bg-amber-500' : 'bg-stone-100'
                }`}
              />
            ))}
          </div>

          {/* Active Step Card */}
          {groundingStep < GROUNDING_STEPS.length ? (
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${GROUNDING_STEPS[groundingStep].color}`}>
                  {GROUNDING_STEPS[groundingStep].count}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif-accent">
                    Sense of {GROUNDING_STEPS[groundingStep].sense}
                  </h3>
                  <p className="text-xs text-stone-600">
                    {GROUNDING_STEPS[groundingStep].prompt}
                  </p>
                </div>
              </div>

              <textarea
                value={groundingInputs[groundingStep]}
                onChange={(e) => {
                  const updated = [...groundingInputs];
                  updated[groundingStep] = e.target.value;
                  setGroundingInputs(updated);
                }}
                placeholder="What do you notice? (e.g. sunlight on the desk, plant on the shelf...)"
                rows={3}
                className="w-full text-sm p-4 bg-white rounded-2xl border border-stone-200 focus:ring-2 focus:ring-amber-300 focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={groundingStep === 0}
                  onClick={() => setGroundingStep(prev => prev - 1)}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 disabled:opacity-30"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioSynth.playChime(420 + groundingStep * 40);
                    setGroundingStep(prev => prev + 1);
                    if (groundingStep === GROUNDING_STEPS.length - 1) {
                      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
                    }
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <span>{groundingStep === GROUNDING_STEPS.length - 1 ? 'Complete Grounding' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-amber-50/70 rounded-3xl border border-amber-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900 font-serif-accent">
                You Are Grounded & Safe in This Moment
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Take a long, quiet breath. You have returned to the here and now.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGroundingStep(0);
                  setGroundingInputs(['', '', '', '', '']);
                }}
                className="mt-2 px-5 py-2 bg-white text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 hover:bg-stone-50"
              >
                Start Over
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* --- TOOL 3: SEE ANOTHER PERSPECTIVE (REFRAMING) --- */}
      {activeTool === 'reframing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xs space-y-6"
          id="tool-reframing-workspace"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif-accent">
              See Another Perspective
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Softens harsh self-criticism and catastrophic thoughts with compassionate reality checks.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                What harsh thought or worry is looping in your head?
              </label>
              <textarea
                value={thoughtInput}
                onChange={(e) => setThoughtInput(e.target.value)}
                placeholder="e.g. 'I made one small mistake in the presentation so everyone must think I'm incompetent.'"
                rows={3}
                className="w-full text-sm p-4 bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Feeling:</span>
                <select
                  value={thoughtEmotion}
                  onChange={(e) => setThoughtEmotion(e.target.value as EmotionCategory)}
                  className="text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {(Object.keys(GO_EMOTIONS) as EmotionCategory[]).map(c => (
                    <option key={c} value={c}>{GO_EMOTIONS[c]?.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRunReframe}
                disabled={!thoughtInput.trim() || isReframing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-200 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isReframing ? 'Finding Compassionate View...' : 'See Another Perspective'}</span>
              </button>
            </div>

            {/* Reframe Result */}
            {reframeResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-2xl border border-indigo-100 space-y-3 mt-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">
                    A Gentle, Balanced Perspective:
                  </span>
                  {reframeResult.distortionType && (
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border text-stone-600">
                      Pattern: {reframeResult.distortionType}
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-800 leading-relaxed font-sans">
                  "{reframeResult.balancedPerspective}"
                </p>
                <div className="pt-2 border-t border-indigo-100 text-xs text-indigo-800 font-medium italic">
                  Compassion note: "{reframeResult.selfCompassionMessage}"
                </div>
              </motion.div>
            )}

            {/* Saved Perspectives Archive */}
            {reframes.length > 0 && (
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Your Past Reframed Thoughts
                </h3>
                <div className="space-y-2">
                  {reframes.map(r => (
                    <div key={r.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-800 line-through">"{r.automaticThought}"</span>
                        <button
                          onClick={() => onDeleteReframe(r.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-stone-800 font-medium">✨ {r.balancedPerspective}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* --- TOOL 4: WINS & BREAKTHROUGHS --- */}
      {activeTool === 'wins' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs space-y-6"
          id="tool-wins-workspace"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-serif-accent">
                Wins & Breakthroughs
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                A sanctuary to celebrate moments where you showed resilience or treated yourself kindly.
              </p>
            </div>

            <button
              onClick={() => setShowAddWin(!showAddWin)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record a Win</span>
            </button>
          </div>

          {/* Add Win Form */}
          {showAddWin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-5 bg-rose-50/60 rounded-3xl border border-rose-200 space-y-3"
            >
              <input
                type="text"
                value={winTitle}
                onChange={(e) => setWinTitle(e.target.value)}
                placeholder="What did you do or handle well? (e.g. Kept calm during traffic)"
                className="w-full text-xs sm:text-sm p-3 bg-white rounded-xl border border-rose-200 focus:outline-none"
              />
              <textarea
                value={winInsight}
                onChange={(e) => setWinInsight(e.target.value)}
                placeholder="What did this teach you about your inner strength?"
                rows={2}
                className="w-full text-xs sm:text-sm p-3 bg-white rounded-xl border border-rose-200 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWin(false)}
                  className="px-3 py-1.5 text-xs text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddWin}
                  className="px-5 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save Win ✨
                </button>
              </div>
            </motion.div>
          )}

          {/* Wins List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resilienceMoments.map(m => (
              <div
                key={m.id}
                className="p-5 bg-stone-50 rounded-3xl border border-stone-200/80 hover:border-rose-200 shadow-2xs space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🏆</span>
                  <button
                    onClick={() => onDeleteResilienceMoment(m.id)}
                    className="text-stone-300 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-stone-900 font-serif-accent">
                  {m.title}
                </h3>
                <p className="text-xs text-stone-700 font-sans">
                  "{m.insight}"
                </p>
                {m.emotionShift && (
                  <span className="inline-block text-[10px] bg-rose-100/70 text-rose-800 font-semibold px-2 py-0.5 rounded-md">
                    {m.emotionShift}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* --- TOOL 5: CALM SOUNDS --- */}
      {activeTool === 'sounds' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs space-y-6"
          id="tool-sounds-workspace"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif-accent">
              Calm Soundscapes
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Natural acoustic frequencies generated to relax brainwaves and mask sudden background noises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rain */}
            <button
              type="button"
              onClick={() => handleToggleSound('rain')}
              className={`p-6 rounded-3xl border text-left flex items-center justify-between transition-all ${
                soundMode === 'rain'
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Gentle Rain</h3>
                  <p className="text-xs text-stone-500">Soothing soft raindrops</p>
                </div>
              </div>
              {soundMode === 'rain' ? <Pause className="w-5 h-5 text-blue-600" /> : <Play className="w-5 h-5 text-stone-400" />}
            </button>

            {/* Stream */}
            <button
              type="button"
              onClick={() => handleToggleSound('stream')}
              className={`p-6 rounded-3xl border text-left flex items-center justify-between transition-all ${
                soundMode === 'stream'
                  ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-400'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Quiet Stream</h3>
                  <p className="text-xs text-stone-500">Gentle flowing water</p>
                </div>
              </div>
              {soundMode === 'stream' ? <Pause className="w-5 h-5 text-teal-600" /> : <Play className="w-5 h-5 text-stone-400" />}
            </button>

            {/* Hearth */}
            <button
              type="button"
              onClick={() => handleToggleSound('hearth')}
              className={`p-6 rounded-3xl border text-left flex items-center justify-between transition-all ${
                soundMode === 'hearth'
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Warm Hearth</h3>
                  <p className="text-xs text-stone-500">Cozy wood fire warmth</p>
                </div>
              </div>
              {soundMode === 'hearth' ? <Pause className="w-5 h-5 text-amber-600" /> : <Play className="w-5 h-5 text-stone-400" />}
            </button>

            {/* Singing bowl */}
            <button
              type="button"
              onClick={() => handleToggleSound('bowl')}
              className={`p-6 rounded-3xl border text-left flex items-center justify-between transition-all ${
                soundMode === 'bowl'
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Singing Bowl</h3>
                  <p className="text-xs text-stone-500">528Hz meditative resonance</p>
                </div>
              </div>
              {soundMode === 'bowl' ? <Pause className="w-5 h-5 text-purple-600" /> : <Play className="w-5 h-5 text-stone-400" />}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
