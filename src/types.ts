export type MainTab = 'home' | 'journey' | 'toolbox';

export interface UserProfile {
  name: string;
  intent: string;
  hasCompletedOnboarding: boolean;
  streakCount: number;
  lastCheckInDate?: string;
}

export type EmotionCategory =
  | 'anxiety'
  | 'sadness'
  | 'anger'
  | 'joy'
  | 'pride'
  | 'confusion'
  | 'shame'
  | 'loneliness'
  | 'gratitude'
  | 'hope'
  | 'relief'
  | 'overwhelm'
  | 'calm';

export interface GoEmotionInfo {
  id: EmotionCategory;
  label: string;
  category: 'challenging' | 'positive' | 'reflective';
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  description: string;
  guidanceNote: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
  primaryEmotion: EmotionCategory;
  secondaryEmotions?: EmotionCategory[];
  intensity: number; // 1 - 10
  bodySensation?: string; // e.g., 'tight chest', 'heavy shoulders', 'fluttering stomach'
  companionResponse?: {
    empathy: string;
    validation: string;
    exploration: string;
    support: string;
    encouragement: string;
    fullText: string;
    reflectionPrompts: string[];
    suggestedTechnique?: 'grounding_54321' | 'box_breathing' | 'reframing' | 'self_compassion';
  };
  tags: string[];
  isFavorite?: boolean;
  reflectionsAnswered?: { prompt: string; answer: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  emotionDetected?: EmotionCategory;
  isCrisis?: boolean;
  suggestedPrompts?: string[];
  suggestedAction?: 'grounding_54321' | 'box_breathing' | 'journal_entry' | 'reframing' | 'self_compassion';
}

export interface ThoughtReframe {
  id: string;
  date: string;
  automaticThought: string;
  underlyingEmotion: EmotionCategory;
  distortionType?: string; // e.g., 'Catastrophizing', 'All-or-Nothing', 'Mind Reading', 'Overgeneralization'
  balancedPerspective: string;
  selfCompassionMessage: string;
}

export interface ResilienceMoment {
  id: string;
  date: string;
  title: string;
  insight: string;
  emotionShift: string;
  sourceEntryId?: string;
}

export interface EmotionalTrend {
  emotion: EmotionCategory;
  count: number;
  avgIntensity: number;
  percentage: number;
}
