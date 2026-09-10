import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  CalendarHeart, 
  Compass, 
  CloudRain,
  Waves,
  Flame,
  Bell,
  Check
} from 'lucide-react';
import { MainTab, UserProfile } from '../types';
import { audioSynth } from '../utils/audioSynth';

interface HeaderProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenCrisis: () => void;
  userProfile: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenCrisis,
  userProfile
}) => {
  const [ambientMode, setAmbientMode] = useState<'off' | 'rain' | 'stream' | 'hearth' | 'bowl'>('off');
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

  const handleSoundChange = (mode: 'off' | 'rain' | 'stream' | 'hearth' | 'bowl') => {
    setAmbientMode(mode);
    setShowAmbientMenu(false);
    if (mode === 'off') {
      audioSynth.stopSoundscape();
    } else {
      audioSynth.playSoundscape(mode);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100/80 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
              id="header-brand-logo"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-amber-300 to-teal-300 p-0.5 shadow-xs group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 font-serif-accent">
                    EmotiCare
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                    Companion
                  </span>
                </div>
                <p className="text-xs text-stone-500 hidden sm:block">
                  Your emotional sanctuary • Safe & judgment-free
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs (Only 3: Home, Journey, Toolbox) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/70">
            <button
              onClick={() => onTabChange('home')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-rose-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
              id="desktop-nav-home"
            >
              <Heart className={`w-4 h-4 ${activeTab === 'home' ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
              Home
            </button>

            <button
              onClick={() => onTabChange('journey')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'journey'
                  ? 'bg-white text-amber-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
              id="desktop-nav-journey"
            >
              <CalendarHeart className={`w-4 h-4 ${activeTab === 'journey' ? 'text-amber-600' : 'text-stone-400'}`} />
              Journey
            </button>

            <button
              onClick={() => onTabChange('toolbox')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'toolbox'
                  ? 'bg-white text-teal-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
              id="desktop-nav-toolbox"
            >
              <Compass className={`w-4 h-4 ${activeTab === 'toolbox' ? 'text-teal-600' : 'text-stone-400'}`} />
              Toolbox
            </button>
          </nav>

          {/* Quick Actions: Soundscape & Crisis */}
          <div className="flex items-center gap-2">
            {/* Ambient Soundscape Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAmbientMenu(!showAmbientMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                  ambientMode !== 'off'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs animate-pulse'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
                title="Calm Soundscapes"
                id="ambient-sound-toggle-btn"
              >
                {ambientMode !== 'off' ? (
                  <Volume2 className="w-4 h-4 text-amber-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-400" />
                )}
                <span className="hidden sm:inline capitalize">
                  {ambientMode === 'off' ? 'Sound: Off' : ambientMode}
                </span>
              </button>

              {showAmbientMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50"
                  id="ambient-sound-dropdown"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Soothing Soundscapes
                  </div>
                  <button
                    onClick={() => handleSoundChange('off')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-stone-50 ${ambientMode === 'off' ? 'font-semibold text-stone-900 bg-stone-50' : 'text-stone-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <VolumeX className="w-4 h-4 text-stone-400" />
                      Sound Off
                    </span>
                    {ambientMode === 'off' && <Check className="w-3.5 h-3.5 text-stone-800" />}
                  </button>
                  <button
                    onClick={() => handleSoundChange('rain')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-stone-50 ${ambientMode === 'rain' ? 'font-semibold text-blue-700 bg-blue-50/50' : 'text-stone-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-blue-500" />
                      Gentle Rain
                    </span>
                    {ambientMode === 'rain' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => handleSoundChange('stream')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-stone-50 ${ambientMode === 'stream' ? 'font-semibold text-teal-700 bg-teal-50/50' : 'text-stone-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-teal-500" />
                      Quiet Stream
                    </span>
                    {ambientMode === 'stream' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => handleSoundChange('hearth')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-stone-50 ${ambientMode === 'hearth' ? 'font-semibold text-amber-700 bg-amber-50/50' : 'text-stone-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Warm Hearth
                    </span>
                    {ambientMode === 'hearth' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                  <button
                    onClick={() => handleSoundChange('bowl')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-stone-50 ${ambientMode === 'bowl' ? 'font-semibold text-purple-700 bg-purple-50/50' : 'text-stone-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-500" />
                      Singing Bowl
                    </span>
                    {ambientMode === 'bowl' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Crisis / Safety Protocol Trigger */}
            <button
              onClick={onOpenCrisis}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-200 text-rose-700 bg-rose-50/70 hover:bg-rose-100 hover:text-rose-800 transition-colors shadow-2xs"
              title="24/7 Crisis Support"
              id="header-crisis-btn"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">24/7 Crisis Help</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
