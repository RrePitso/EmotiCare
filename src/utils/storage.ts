import { JournalEntry, ChatMessage, ThoughtReframe, ResilienceMoment, UserProfile } from '../types';
import { SAMPLE_INITIAL_ENTRIES } from '../data/emotionsData';

const STORAGE_KEYS = {
  ENTRIES: 'emoticare_journal_entries',
  CHAT: 'emoticare_chat_history',
  REFRAMES: 'emoticare_reframes',
  RESILIENCE: 'emoticare_resilience_moments',
  USER_PROFILE: 'emoticare_user_profile'
};

export const getStoredUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      return {
        name: 'Friend',
        intent: 'Finding peace and reflection',
        hasCompletedOnboarding: false,
        streakCount: 2
      };
    }
    return JSON.parse(data);
  } catch {
    return {
      name: 'Friend',
      intent: 'Finding peace and reflection',
      hasCompletedOnboarding: false,
      streakCount: 2
    };
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
};

export interface UserContinuityProfile {
  name?: string;
  recurringThemes: string[];
  recognizedStrengths: string[];
  frequentEmotions: string[];
  totalJournalCount: number;
}

export const getStoredEntries = (): JournalEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(SAMPLE_INITIAL_ENTRIES));
      return SAMPLE_INITIAL_ENTRIES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load entries from storage', e);
    return SAMPLE_INITIAL_ENTRIES;
  }
};

export const saveEntries = (entries: JournalEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save entries', e);
  }
};

export const getStoredChatHistory = (): ChatMessage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveChatHistory = (messages: ChatMessage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
};

export const getStoredReframes = (): ThoughtReframe[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REFRAMES);
    if (!data) return [
      {
        id: 'reframe-1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        automaticThought: "I made a mistake in the team meeting so everyone probably thinks I'm incompetent.",
        underlyingEmotion: 'shame',
        distortionType: 'Mind Reading & Catastrophizing',
        balancedPerspective: "One slip-up in a 45-minute discussion does not erase months of solid work. People are focused on their own responsibilities, and making a minor mistake is human.",
        selfCompassionMessage: "You can hold space for wanting to do well while gently giving yourself permission to be imperfect."
      }
    ];
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveReframes = (reframes: ThoughtReframe[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REFRAMES, JSON.stringify(reframes));
  } catch (e) {
    console.error('Failed to save reframes', e);
  }
};

export const getStoredResilienceMoments = (): ResilienceMoment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESILIENCE);
    if (!data) return [
      {
        id: 'resilience-1',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Breathed through presentation anxiety',
        insight: 'Discovered that pausing for 3 slow breaths helped me stay grounded even when my heart raced.',
        emotionShift: 'From 7/10 Anxiety to 5/10 Relief & Pride',
        sourceEntryId: 'entry-seed-1'
      },
      {
        id: 'resilience-2',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Allowed myself to receive kindness',
        insight: 'Realized that reaching out and accepting friend support refuels my emotional battery.',
        emotionShift: 'From drained fatigue to 8/10 Gratitude & Warmth',
        sourceEntryId: 'entry-seed-2'
      }
    ];
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveResilienceMoments = (moments: ResilienceMoment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESILIENCE, JSON.stringify(moments));
  } catch (e) {
    console.error('Failed to save resilience moments', e);
  }
};

export const getContinuityContextSummary = (entries: JournalEntry[]): string => {
  if (!entries || entries.length === 0) return "No previous entries.";
  const recent = entries.slice(0, 5);
  return recent.map(e => `[${new Date(e.date).toLocaleDateString()}] Title: "${e.title}", Emotion: ${e.primaryEmotion} (${e.intensity}/10), Sensation: ${e.bodySensation || 'none'}, Summary: ${e.content.slice(0, 140)}...`).join('\n');
};
