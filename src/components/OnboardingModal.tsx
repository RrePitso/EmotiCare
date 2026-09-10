import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ArrowRight, Check } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (name: string, intent: string) => void;
}

const COMMON_INTENTS = [
  'A safe space to vent & reflect',
  'Working through anxiety & overwhelm',
  'Building daily self-compassion',
  'Understanding my feelings better',
  'Celebrating little wins & peace'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [intent, setIntent] = useState(COMMON_INTENTS[0]);
  const [customIntent, setCustomIntent] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    audioSynth.playChime(528);
    if (step === 1) {
      setStep(2);
    } else {
      const finalName = name.trim() || 'Friend';
      const finalIntent = customIntent.trim() || intent;
      onComplete(finalName, finalIntent);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden p-6 sm:p-8"
          id="onboarding-modal-card"
        >
          {/* Gentle Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-400 via-amber-300 to-teal-300 p-0.5 mx-auto shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 font-serif-accent">
              Welcome to EmotiCare
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
              Your warm, confidential sanctuary to process feelings, breathe, and find gentle clarity.
            </p>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-800 block">
                  What should EmotiCare call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext();
                  }}
                  placeholder="Your first name or nickname..."
                  autoFocus
                  className="w-full text-base px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-300 focus:outline-none transition-all"
                  id="onboarding-name-input"
                />
                <p className="text-xs text-stone-400">
                  You can change this anytime. We protect your privacy.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all"
                  id="onboarding-next-btn-1"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: What brings you here today */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-stone-800 block">
                  What brings you here today, {name.trim() || 'friend'}?
                </label>

                <div className="space-y-2">
                  {COMMON_INTENTS.map((item, idx) => {
                    const isSelected = intent === item;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setIntent(item);
                          audioSynth.playChime(420 + idx * 30);
                        }}
                        className={`w-full p-3 rounded-2xl text-left text-xs font-medium border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                        id={`onboarding-intent-btn-${idx}`}
                      >
                        <span>{item}</span>
                        {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 text-xs text-stone-500 hover:text-stone-800"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all"
                  id="onboarding-finish-btn"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Begin My Sanctuary</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
