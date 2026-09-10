import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { JourneyScreen } from './components/JourneyScreen';
import { ToolboxScreen } from './components/ToolboxScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { CrisisModal } from './components/CrisisModal';
import { 
  MainTab,
  JournalEntry, 
  ThoughtReframe, 
  ResilienceMoment, 
  UserProfile 
} from './types';
import { 
  getStoredEntries, 
  saveEntries, 
  getStoredReframes,
  saveReframes,
  getStoredResilienceMoments,
  saveResilienceMoments,
  getStoredUserProfile,
  saveUserProfile
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [crisisTriggerReason, setCrisisTriggerReason] = useState<string | undefined>();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // User profile
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredUserProfile());

  // Stored state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [reframes, setReframes] = useState<ThoughtReframe[]>([]);
  const [resilienceMoments, setResilienceMoments] = useState<ResilienceMoment[]>([]);

  // Focus specific toolbox tool when requested
  const [initialToolboxTool, setInitialToolboxTool] = useState<'breathing' | 'grounding' | 'reframing' | 'wins' | 'sounds'>('breathing');

  // Initial load
  useEffect(() => {
    const profile = getStoredUserProfile();
    setUserProfile(profile);
    if (!profile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
    setJournalEntries(getStoredEntries());
    setReframes(getStoredReframes());
    setResilienceMoments(getStoredResilienceMoments());
  }, []);

  const handleCompleteOnboarding = (name: string, intent: string) => {
    const updated: UserProfile = {
      ...userProfile,
      name,
      intent,
      hasCompletedOnboarding: true
    };
    setUserProfile(updated);
    saveUserProfile(updated);
    setShowOnboarding(false);
  };

  // Handlers for persistence
  const handleSaveEntry = (newEntry: JournalEntry) => {
    const updated = [newEntry, ...journalEntries.filter(e => e.id !== newEntry.id)];
    setJournalEntries(updated);
    saveEntries(updated);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = journalEntries.filter(e => e.id !== id);
    setJournalEntries(updated);
    saveEntries(updated);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = journalEntries.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e);
    setJournalEntries(updated);
    saveEntries(updated);
  };

  const handleSaveReframe = (reframe: ThoughtReframe) => {
    const updated = [reframe, ...reframes.filter(r => r.id !== reframe.id)];
    setReframes(updated);
    saveReframes(updated);
  };

  const handleDeleteReframe = (id: string) => {
    const updated = reframes.filter(r => r.id !== id);
    setReframes(updated);
    saveReframes(updated);
  };

  const handleSaveResilienceMoment = (moment: ResilienceMoment) => {
    const updated = [moment, ...resilienceMoments.filter(m => m.id !== moment.id)];
    setResilienceMoments(updated);
    saveResilienceMoments(updated);
  };

  const handleDeleteResilienceMoment = (id: string) => {
    const updated = resilienceMoments.filter(m => m.id !== id);
    setResilienceMoments(updated);
    saveResilienceMoments(updated);
  };

  // Navigations
  const handleOpenCrisis = (reason?: string) => {
    setCrisisTriggerReason(reason);
    setIsCrisisModalOpen(true);
  };

  const handleNavigateToToolbox = (tool?: 'breathing' | 'grounding' | 'reframing' | 'wins' | 'sounds') => {
    if (tool) setInitialToolboxTool(tool);
    setActiveTab('toolbox');
  };

  return (
    <div className="min-h-screen bg-stone-50/60 flex flex-col font-sans antialiased text-stone-800 selection:bg-rose-100 selection:text-rose-900" id="emoticare-app-root">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCrisis={() => handleOpenCrisis()}
        userProfile={userProfile}
      />

      {/* Main Screen Views (Home, Journey, Toolbox) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6" id="main-content-area">
        {activeTab === 'home' && (
          <HomeScreen
            userProfile={userProfile}
            pastEntries={journalEntries}
            onSaveEntry={handleSaveEntry}
            onNavigateToToolbox={handleNavigateToToolbox}
            onOpenCrisis={() => handleOpenCrisis("EmotiCare detected a moment of severe distress. Immediate caring support is available.")}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyScreen
            entries={journalEntries}
            userProfile={userProfile}
            onDeleteEntry={handleDeleteEntry}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'toolbox' && (
          <ToolboxScreen
            initialTool={initialToolboxTool}
            reframes={reframes}
            resilienceMoments={resilienceMoments}
            onSaveReframe={handleSaveReframe}
            onSaveResilienceMoment={handleSaveResilienceMoment}
            onDeleteReframe={handleDeleteReframe}
            onDeleteResilienceMoment={handleDeleteResilienceMoment}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Minimalist 2-Step Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleCompleteOnboarding}
      />

      {/* 24/7 Crisis Safety Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        triggerReason={crisisTriggerReason}
      />
    </div>
  );
}
