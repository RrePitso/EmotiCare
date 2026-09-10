import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  Wind, 
  Sparkles, 
  Heart, 
  Check, 
  Eye, 
  Hand, 
  Volume2, 
  Smile, 
  Coffee, 
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  Plus,
  ShieldCheck,
  Award,
  HelpCircle
} from 'lucide-react';
import { EmotionCategory, ThoughtReframe, ResilienceMoment } from '../types';
import { GO_EMOTIONS } from '../data/emotionsData';
import { requestThoughtReframe } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynth';

interface GroundingToolkitProps {
  initialTool?: 'grounding_54321' | 'box_breathing' | 'reframing';
  reframes: ThoughtReframe[];
  onSaveReframe: (reframe: ThoughtReframe) => void;
  resilienceMoments: ResilienceMoment[];
  onSaveResilienceMoment: (moment: ResilienceMoment) => void;
}

export const GroundingToolkit: React.FC<GroundingToolkitProps> = ({
  initialTool = 'grounding_54321',
  reframes,
  onSaveReframe,
  resilienceMoments,
  onSaveResilienceMoment
}) => {
  const [activeSubTool, setActiveSubTool] = useState<'grounding_54321' | 'box_breathing' | 'reframing' | 'resilience'>(initialTool);

  useEffect(() => {
    if (initialTool) {
      setActiveSubTool(initialTool);
    }
  }, [initialTool]);

  // 1. 5-4-3-2-1 Grounding State
  const [step54321, setStep54321] = useState<number>(5);
  const [items54321, setItems54321] = useState<{ [key: number]: string[] }>({
    5: ['', '', '', '', ''],
    4: ['', '', '', ''],
    3: ['', '', ''],
    2: ['', ''],
    1: ['']
  });
  const [completed54321, setCompleted54321] = useState(false);

  // 2. Breathing State
  const [breathPattern, setBreathPattern] = useState<'box' | 'relax'>('box'); // 'box' = 4-4-4-4, 'relax' = 4-7-8
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [completedBreathCycles, setCompletedBreathCycles] = useState(0);

  // 3. Cognitive Reframe State
  const [automaticThought, setAutomaticThought] = useState('');
  const [reframeEmotion, setReframeEmotion] = useState<EmotionCategory>('anxiety');
  const [isReframing, setIsReframing] = useState(false);
  const [currentReframeResult, setCurrentReframeResult] = useState<{
    distortionType: string;
    balancedPerspective: string;
    selfCompassionMessage: string;
  } | null>(null);

  // 4. Resilience Jar State
  const [newMomentTitle, setNewMomentTitle] = useState('');
  const [newMomentInsight, setNewMomentInsight] = useState('');
  const [newMomentShift, setNewMomentShift] = useState('');

  // 5-4-3-2-1 Step handler
  const handleItemChange = (step: number, index: number, value: string) => {
    setItems54321(prev => ({
      ...prev,
      [step]: prev[step].map((item, i) => (i === index ? value : item))
    }));
  };

  const handleNextStep54321 = () => {
    audioSynth.playChime(350 + (6 - step54321) * 60);
    if (step54321 > 1) {
      setStep54321(step54321 - 1);
    } else {
      setCompleted54321(true);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  };

  const reset54321 = () => {
    setStep54321(5);
    setCompleted54321(false);
    setItems54321({
      5: ['', '', '', '', ''],
      4: ['', '', '', ''],
      3: ['', '', ''],
      2: ['', ''],
      1: ['']
    });
  };

  // Breathing Loop effect
  useEffect(() => {
    if (!isBreathingActive) return;

    let timer: number;
    let phase = 'Inhale';
    let count = 4;

    const timings = breathPattern === 'box'
      ? { Inhale: 4, Hold1: 4, Exhale: 4, Hold2: 4 }
      : { Inhale: 4, Hold1: 7, Exhale: 8, Hold2: 0 };

    setBreathPhase('Inhale');
    setBreathCountdown(timings.Inhale);
    audioSynth.playChime(432);

    const interval = window.setInterval(() => {
      setBreathCountdown(prev => {
        if (prev > 1) return prev - 1;

        // Advance phase
        setBreathPhase(currentPhase => {
          if (currentPhase === 'Inhale') {
            audioSynth.playChime(320);
            return 'Hold';
          } else if (currentPhase === 'Hold') {
            audioSynth.playChime(280);
            return 'Exhale';
          } else if (currentPhase === 'Exhale') {
            if (breathPattern === 'box') {
              audioSynth.playChime(300);
              return 'Rest';
            } else {
              audioSynth.playChime(432);
              setCompletedBreathCycles(c => c + 1);
              return 'Inhale';
            }
          } else {
            // After Rest in box breathing
            audioSynth.playChime(432);
            setCompletedBreathCycles(c => c + 1);
            return 'Inhale';
          }
        });

        // Return next countdown based on next phase
        return breathPhase === 'Inhale' 
          ? (breathPattern === 'box' ? 4 : 7)
          : breathPhase === 'Hold' 
          ? (breathPattern === 'box' ? 4 : 8)
          : 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathPattern]);

  // Handle Thought Reframe API
  const handleGenerateReframe = async () => {
    if (!automaticThought.trim()) return;
    setIsReframing(true);
    audioSynth.playChime(440);

    try {
      const result = await requestThoughtReframe(automaticThought, reframeEmotion);
      setCurrentReframeResult(result);
      audioSynth.playChime(528);
    } catch (err) {
      console.error('Reframe error', err);
    } finally {
      setIsReframing(false);
    }
  };

  const handleSaveCurrentReframe = () => {
    if (!currentReframeResult || !automaticThought.trim()) return;

    const newReframe: ThoughtReframe = {
      id: `reframe-${Date.now()}`,
      date: new Date().toISOString(),
      automaticThought,
      underlyingEmotion: reframeEmotion,
      distortionType: currentReframeResult.distortionType,
      balancedPerspective: currentReframeResult.balancedPerspective,
      selfCompassionMessage: currentReframeResult.selfCompassionMessage
    };

    onSaveReframe(newReframe);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 }
    });
    setAutomaticThought('');
    setCurrentReframeResult(null);
  };

  // Handle Add Resilience Moment
  const handleAddResilienceMoment = () => {
    if (!newMomentTitle.trim() || !newMomentInsight.trim()) return;

    const newMoment: ResilienceMoment = {
      id: `resilience-${Date.now()}`,
      date: new Date().toISOString(),
      title: newMomentTitle.trim(),
      insight: newMomentInsight.trim(),
      emotionShift: newMomentShift.trim() || 'Grounded & Self-Aware'
    };

    onSaveResilienceMoment(newMoment);
    setNewMomentTitle('');
    setNewMomentInsight('');
    setNewMomentShift('');
    audioSynth.playChime(660);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="grounding-toolkit-container">
      {/* Toolkit Nav Tabs */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-3 border border-amber-100 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActiveSubTool('grounding_54321')}
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubTool === 'grounding_54321'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            id="tab-subtool-54321"
          >
            <Compass className="w-4 h-4 text-amber-600" />
            5-4-3-2-1 Sensory
          </button>

          <button
            onClick={() => setActiveSubTool('box_breathing')}
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubTool === 'box_breathing'
                ? 'bg-teal-100 text-teal-900 border border-teal-300 shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            id="tab-subtool-breathing"
          >
            <Wind className="w-4 h-4 text-teal-600" />
            Breath Orb
          </button>

          <button
            onClick={() => setActiveSubTool('reframing')}
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubTool === 'reframing'
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            id="tab-subtool-reframe"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Thought Reframe
          </button>

          <button
            onClick={() => setActiveSubTool('resilience')}
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeSubTool === 'resilience'
                ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            id="tab-subtool-resilience"
          >
            <Award className="w-4 h-4 text-rose-600" />
            Resilience Sanctuary
          </button>
        </div>
      </div>

      {/* 1. 5-4-3-2-1 SENSORY GROUNDING */}
      {activeSubTool === 'grounding_54321' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-2xs space-y-6" id="sensory-grounding-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Somatic Grounding
              </span>
              <h2 className="text-xl font-bold text-stone-900 font-serif-accent mt-1">
                5-4-3-2-1 Sensory Reset
              </h2>
              <p className="text-xs text-stone-500">
                Bring your nervous system back into the physical present moment.
              </p>
            </div>

            <button
              onClick={reset54321}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 self-start"
              id="reset-54321-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Exercise
            </button>
          </div>

          {!completed54321 ? (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-between gap-2">
                {[5, 4, 3, 2, 1].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      s > step54321
                        ? 'bg-emerald-500'
                        : s === step54321
                        ? 'bg-amber-500 ring-2 ring-amber-300'
                        : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>

              {/* Current Sensory Step Prompt */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                  {step54321 === 5 && <Eye className="w-7 h-7 text-amber-700" />}
                  {step54321 === 4 && <Hand className="w-7 h-7 text-amber-700" />}
                  {step54321 === 3 && <Volume2 className="w-7 h-7 text-amber-700" />}
                  {step54321 === 2 && <Smile className="w-7 h-7 text-amber-700" />}
                  {step54321 === 1 && <Coffee className="w-7 h-7 text-amber-700" />}
                </div>

                <h3 className="text-lg font-bold text-stone-900 font-serif-accent">
                  {step54321 === 5 && 'Notice 5 things you can SEE'}
                  {step54321 === 4 && 'Notice 4 things you can physically TOUCH or feel'}
                  {step54321 === 3 && 'Notice 3 things you can HEAR'}
                  {step54321 === 2 && 'Notice 2 things you can SMELL'}
                  {step54321 === 1 && 'Notice 1 thing you can TASTE or savor'}
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  {step54321 === 5 && 'Look around your room: textures, shapes, light reflections, colors, or small details.'}
                  {step54321 === 4 && 'Feel your feet on the ground, the texture of your fabric, temperature of your hands, or the chair supporting you.'}
                  {step54321 === 3 && 'Listen for distant traffic, clock ticking, humming fan, or the quiet sound of your own breath.'}
                  {step54321 === 2 && 'Notice the scent of air, coffee, paper, or simply take a deep inhale.'}
                  {step54321 === 1 && 'Notice any lingering flavor, or take a sip of water and savor its cool freshness.'}
                </p>
              </div>

              {/* Input slots */}
              <div className="space-y-2.5">
                {items54321[step54321].map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-semibold text-stone-400 text-center">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleItemChange(step54321, idx, e.target.value)}
                      placeholder={`e.g. ${
                        step54321 === 5 ? 'Sunlight on the wall' :
                        step54321 === 4 ? 'Warm mug in my hands' :
                        step54321 === 3 ? 'Gentle breeze outside' :
                        step54321 === 2 ? 'Herbal tea aroma' :
                        'Cool clean water'
                      }`}
                      className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-800 focus:bg-white focus:ring-2 focus:ring-amber-300 focus:outline-none transition-all"
                      id={`sensory-input-${step54321}-${idx}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextStep54321}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  id="sensory-next-step-btn"
                >
                  <span>{step54321 === 1 ? 'Complete Grounding' : `Proceed to ${step54321 - 1}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 font-serif-accent">
                You Are Grounded and Present
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Take a deep, nourishing breath. Your nervous system has reconnected with the safety of this present moment.
              </p>
              <button
                onClick={reset54321}
                className="px-5 py-2 bg-stone-900 text-white text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors shadow-2xs"
                id="sensory-repeat-btn"
              >
                Practice Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. BREATH ORB */}
      {activeSubTool === 'box_breathing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-2xs space-y-6" id="breath-orb-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-teal-800 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Breathwork Rhythm
              </span>
              <h2 className="text-xl font-bold text-stone-900 font-serif-accent mt-1">
                Mindful Breathing Orb
              </h2>
              <p className="text-xs text-stone-500">
                Activate your parasympathetic nervous system to dissolve tension.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBreathPattern('box');
                  setIsBreathingActive(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                  breathPattern === 'box'
                    ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
                id="breath-pattern-box"
              >
                Box 4-4-4-4
              </button>
              <button
                onClick={() => {
                  setBreathPattern('relax');
                  setIsBreathingActive(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                  breathPattern === 'relax'
                    ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
                id="breath-pattern-relax"
              >
                Relaxing 4-7-8
              </button>
            </div>
          </div>

          {/* Visual Orb Container */}
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Animated Outer Pulse */}
              <motion.div
                animate={{
                  scale: isBreathingActive 
                    ? breathPhase === 'Inhale' ? 1.35 : breathPhase === 'Hold' ? 1.35 : 0.85
                    : 1,
                  opacity: isBreathingActive ? 0.85 : 0.4
                }}
                transition={{
                  duration: breathPhase === 'Hold' ? 0.3 : breathCountdown,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-200 via-emerald-100 to-cyan-100 blur-md"
              />

              {/* Central Core Orb */}
              <motion.div
                animate={{
                  scale: isBreathingActive 
                    ? breathPhase === 'Inhale' ? 1.25 : breathPhase === 'Hold' ? 1.25 : 0.8
                    : 1
                }}
                transition={{
                  duration: breathPhase === 'Hold' ? 0.3 : breathCountdown,
                  ease: 'easeInOut'
                }}
                className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-lg flex flex-col items-center justify-center p-4 select-none"
              >
                <span className="text-xs uppercase tracking-widest font-medium opacity-80">
                  {isBreathingActive ? breathPhase : 'Ready'}
                </span>
                <span className="text-4xl font-bold font-serif-accent my-1">
                  {isBreathingActive ? breathCountdown : '4'}
                </span>
                <span className="text-[11px] opacity-90">
                  {isBreathingActive
                    ? (breathPhase === 'Inhale' ? 'Breathe in peace' :
                       breathPhase === 'Hold' ? 'Hold gently' :
                       breathPhase === 'Exhale' ? 'Release tension' : 'Soft pause')
                    : 'Press start'}
                </span>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-2xl shadow-sm transition-all"
                id="toggle-breath-orb-btn"
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingActive ? 'Pause Rhythm' : 'Begin Breathwork'}</span>
              </button>
            </div>

            {completedBreathCycles > 0 && (
              <p className="text-xs text-stone-500">
                🌱 Completed <span className="font-semibold text-teal-700">{completedBreathCycles}</span> mindful breath cycles.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. COGNITIVE REFRAMER */}
      {activeSubTool === 'reframing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-2xs space-y-6" id="cognitive-reframing-section">
          <div className="border-b border-stone-100 pb-4">
            <span className="text-[10px] font-bold tracking-wider text-indigo-800 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Cognitive Flexibility
            </span>
            <h2 className="text-xl font-bold text-stone-900 font-serif-accent mt-1">
              Thought Reframing & Self-Compassion Studio
            </h2>
            <p className="text-xs text-stone-500">
              Transform harsh, automatic self-critical thoughts into balanced, compassionate truths.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1.5">
                What harsh thought or worry is echoing in your mind?
              </label>
              <textarea
                value={automaticThought}
                onChange={(e) => setAutomaticThought(e.target.value)}
                placeholder="e.g., 'I made a small mistake during the meeting, so everyone thinks I have no idea what I'm doing and I will be fired.'"
                rows={3}
                className="w-full text-xs p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all"
                id="reframe-thought-input"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Associated Emotion:</span>
                <select
                  value={reframeEmotion}
                  onChange={(e) => setReframeEmotion(e.target.value as EmotionCategory)}
                  className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none"
                  id="reframe-emotion-select"
                >
                  <option value="anxiety">Anxiety & Worry</option>
                  <option value="shame">Shame & Inadequacy</option>
                  <option value="sadness">Sadness & Loss</option>
                  <option value="anger">Anger & Frustration</option>
                  <option value="overwhelm">Overwhelm</option>
                  <option value="loneliness">Loneliness</option>
                </select>
              </div>

              <button
                onClick={handleGenerateReframe}
                disabled={!automaticThought.trim() || isReframing}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-200 text-white disabled:text-stone-400 text-xs font-semibold rounded-xl shadow-xs transition-colors"
                id="generate-reframe-btn"
              >
                <Sparkles className={`w-4 h-4 ${isReframing ? 'animate-spin' : ''}`} />
                <span>{isReframing ? 'Synthesizing...' : 'Reframe with EmotiCare'}</span>
              </button>
            </div>

            {/* Reframe Result Card */}
            {currentReframeResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-indigo-50/70 to-purple-50/50 border border-indigo-200 rounded-2xl p-5 space-y-4 mt-4"
                id="reframe-result-card"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-indigo-200">
                    Distortion Identified
                  </span>
                  <h4 className="text-sm font-semibold text-stone-900 mt-1">
                    {currentReframeResult.distortionType}
                  </h4>
                </div>

                <div className="bg-white rounded-xl p-4 border border-indigo-100/80 space-y-2">
                  <h5 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Balanced, Grounded Perspective:
                  </h5>
                  <p className="text-xs text-stone-800 leading-relaxed">
                    {currentReframeResult.balancedPerspective}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-purple-100/80 space-y-2">
                  <h5 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    Self-Compassion Truth:
                  </h5>
                  <p className="text-xs text-stone-800 leading-relaxed italic">
                    "{currentReframeResult.selfCompassionMessage}"
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveCurrentReframe}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    id="save-reframe-btn"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save to Reframe Sanctuary</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Saved Reframes List */}
            {reframes.length > 0 && (
              <div className="pt-6 border-t border-stone-100 space-y-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Saved Perspective Shifts ({reframes.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {reframes.map((r) => (
                    <div key={r.id} className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="font-semibold text-indigo-700">{r.distortionType || 'Reframe'}</span>
                        <span>{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-stone-500 line-through">
                        "{r.automaticThought}"
                      </p>
                      <p className="text-xs text-stone-900 font-medium">
                        ✨ {r.balancedPerspective}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. RESILIENCE SANCTUARY */}
      {activeSubTool === 'resilience' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-2xs space-y-6" id="resilience-sanctuary-section">
          <div className="border-b border-stone-100 pb-4">
            <span className="text-[10px] font-bold tracking-wider text-rose-800 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Resilience Continuity
            </span>
            <h2 className="text-xl font-bold text-stone-900 font-serif-accent mt-1">
              Resilience & Strengths Sanctuary
            </h2>
            <p className="text-xs text-stone-500">
              Anchor breakthroughs, emotional shifts, and moments you showed up for yourself.
            </p>
          </div>

          {/* Add Resilience Moment */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Add a Resilience Breakthrough
            </h3>
            <input
              type="text"
              value={newMomentTitle}
              onChange={(e) => setNewMomentTitle(e.target.value)}
              placeholder="Title (e.g. 'Set a firm boundary without apologizing')"
              className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
              id="resilience-title-input"
            />
            <textarea
              value={newMomentInsight}
              onChange={(e) => setNewMomentInsight(e.target.value)}
              placeholder="What insight or strength helped you navigate through it?"
              rows={2}
              className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
              id="resilience-insight-input"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <input
                type="text"
                value={newMomentShift}
                onChange={(e) => setNewMomentShift(e.target.value)}
                placeholder="Shift (e.g. 'From 8/10 panic to 5/10 calm')"
                className="w-full sm:w-72 text-xs p-2 bg-white border border-stone-200 rounded-xl text-stone-900"
                id="resilience-shift-input"
              />
              <button
                onClick={handleAddResilienceMoment}
                disabled={!newMomentTitle.trim() || !newMomentInsight.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs w-full sm:w-auto justify-center"
                id="save-resilience-moment-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Anchor Strength</span>
              </button>
            </div>
          </div>

          {/* List of Resilience Milestones */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Anchored Milestones ({resilienceMoments.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resilienceMoments.map((m) => (
                <div key={m.id} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-rose-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{m.title}</span>
                    <span className="text-[10px] text-stone-400">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {m.insight}
                  </p>
                  <div className="inline-block text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    🌱 {m.emotionShift}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
