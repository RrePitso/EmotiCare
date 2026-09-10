import React from 'react';
import { Sparkles, CalendarHeart, Wrench, Heart, Compass, BookOpen } from 'lucide-react';
import { MainTab } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange
}) => {
  const handleSelect = (tab: MainTab) => {
    audioSynth.playChime(tab === 'home' ? 440 : tab === 'journey' ? 520 : 600);
    onTabChange(tab);
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-amber-100/80 px-4 py-2 shadow-lg"
      id="mobile-bottom-navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${
            activeTab === 'home'
              ? 'text-rose-600 font-semibold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          id="mobile-tab-home"
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-rose-50' : ''}`}>
            <Heart className={`w-5 h-5 ${activeTab === 'home' ? 'fill-rose-500 text-rose-500' : ''}`} />
          </div>
          <span className="text-[11px]">Home</span>
        </button>

        {/* Journey */}
        <button
          type="button"
          onClick={() => handleSelect('journey')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${
            activeTab === 'journey'
              ? 'text-amber-700 font-semibold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          id="mobile-tab-journey"
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'journey' ? 'bg-amber-50' : ''}`}>
            <CalendarHeart className={`w-5 h-5 ${activeTab === 'journey' ? 'text-amber-600' : ''}`} />
          </div>
          <span className="text-[11px]">Journey</span>
        </button>

        {/* Toolbox */}
        <button
          type="button"
          onClick={() => handleSelect('toolbox')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all rounded-2xl ${
            activeTab === 'toolbox'
              ? 'text-teal-700 font-semibold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          id="mobile-tab-toolbox"
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'toolbox' ? 'bg-teal-50' : ''}`}>
            <Compass className={`w-5 h-5 ${activeTab === 'toolbox' ? 'text-teal-600' : ''}`} />
          </div>
          <span className="text-[11px]">Toolbox</span>
        </button>
      </div>
    </nav>
  );
};
