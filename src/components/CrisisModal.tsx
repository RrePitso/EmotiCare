import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, PhoneCall, MessageSquare, Globe, Heart, X, Sparkles } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  triggerReason
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
          id="crisis-modal-container"
        >
          {/* Header Banner */}
          <div className="bg-rose-50 border-b border-rose-100 p-6 flex items-start gap-4">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-rose-900 font-serif-accent">
                You Are Not Alone. Your Safety Matters.
              </h2>
              <p className="text-rose-800 text-sm mt-1 leading-relaxed">
                {triggerReason
                  ? triggerReason
                  : "If you are feeling overwhelmed, having thoughts of self-harm, or facing a crisis, immediate caring support is available 24/7."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Close"
              id="close-crisis-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compassionate Message */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-stone-800 text-sm leading-relaxed">
              <p className="font-medium text-amber-950 mb-1 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" /> A gentle reminder from EmotiCare:
              </p>
              "What you are carrying right now is heavy, but you do not have to carry it by yourself. Reaching out is a courageous step of self-care."
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Immediate 24/7 Confidential Support
              </h3>

              {/* 988 Lifeline */}
              <div className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">
                      988 Suicide & Crisis Lifeline
                    </h4>
                    <p className="text-xs text-stone-600">
                      Free, confidential support across the US & Canada. Call or text anytime.
                    </p>
                  </div>
                </div>
                <a
                  href="tel:988"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap transition-colors"
                  id="call-988-link"
                >
                  Call / Text 988
                </a>
              </div>

              {/* Crisis Text Line */}
              <div className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">
                      Crisis Text Line
                    </h4>
                    <p className="text-xs text-stone-600">
                      Text <span className="font-semibold text-stone-800">HOME</span> to <span className="font-semibold text-stone-800">741741</span> to connect with a Crisis Counselor.
                    </p>
                  </div>
                </div>
                <a
                  href="sms:741741?body=HOME"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap transition-colors"
                  id="text-741741-link"
                >
                  Text 741741
                </a>
              </div>

              {/* International Directory */}
              <div className="flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">
                      International Crisis Services
                    </h4>
                    <p className="text-xs text-stone-600">
                      Find hotlines and support resources worldwide (IASP / Befrienders).
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.iasp.info/resources/Crisis_Centres/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap transition-colors"
                  id="international-crisis-link"
                >
                  Find Directory
                </a>
              </div>
            </div>

            {/* Quick Grounding Anchor button */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  audioSynth.playChime(384);
                }}
                className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                id="calm-bell-btn"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                Play Grounding Chime
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                id="close-crisis-modal-confirm"
              >
                Return to EmotiCare
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
