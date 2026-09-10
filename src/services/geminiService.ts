import { JournalEntry, ChatMessage, EmotionCategory } from '../types';

export interface ChatResponsePayload {
  reply: string;
  isCrisis?: boolean;
  detectedEmotion?: EmotionCategory;
  suggestedPrompts?: string[];
  suggestedAction?: 'grounding_54321' | 'box_breathing' | 'reframing' | 'self_compassion';
  error?: string;
}

export interface EntryReflectionPayload {
  empathy: string;
  validation: string;
  exploration: string;
  support: string;
  encouragement: string;
  fullText: string;
  reflectionPrompts: string[];
  suggestedTechnique?: 'grounding_54321' | 'box_breathing' | 'reframing' | 'self_compassion';
  isCrisis?: boolean;
}

export interface ReframePayload {
  distortionType: string;
  balancedPerspective: string;
  selfCompassionMessage: string;
}

export interface PatternPayload {
  recurringThemes: string[];
  growthHighlights: string[];
  emoticareContinuitySummary: string;
}

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[],
  continuityContext: string
): Promise<ChatResponsePayload> => {
  try {
    const formattedHistory = history.map(h => ({
      role: h.role,
      content: h.content
    }));

    const response = await fetch('/api/emoticare/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: formattedHistory,
        continuityContext
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Chat API error:', err);
    return {
      reply: "I hear you, and I am right here with you. What you shared is important. Let's take a calm breath together—can you tell me what feels most pressing right now?",
      isCrisis: false,
      suggestedAction: 'box_breathing'
    };
  }
};

export const requestEntryReflection = async (
  entry: Partial<JournalEntry>,
  continuityContext: string
): Promise<EntryReflectionPayload> => {
  try {
    const response = await fetch('/api/emoticare/reflect-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: entry.title,
        content: entry.content,
        emotion: entry.primaryEmotion,
        intensity: entry.intensity,
        bodySensation: entry.bodySensation,
        continuityContext
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Entry reflection error:', err);
    return {
      empathy: "Thank you for taking the time to write this out.",
      validation: "What you are experiencing right now makes total sense. Give yourself permission to feel it.",
      exploration: "Notice what your mind and body need most in this moment.",
      support: "Take things one gentle step at a time.",
      encouragement: "You possess innate resilience that carries you through difficult chapters.",
      fullText: "Thank you for sharing your thoughts in your journal. Whatever emotion you are carrying right now is completely valid.\n\nGiving your inner world voice and attention is a meaningful act of self-care. Take a slow, grounding breath.\n\nFor your journal: What is one small way you can treat yourself with softness today?",
      reflectionPrompts: [
        "What is one small way you can treat yourself with softness today?",
        "If you were speaking to someone you deeply love, what perspective would you offer them?"
      ]
    };
  }
};

export const requestThoughtReframe = async (
  automaticThought: string,
  emotion: EmotionCategory
): Promise<ReframePayload> => {
  try {
    const response = await fetch('/api/emoticare/reframe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        automaticThought,
        emotion
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reframe');
    }

    return await response.json();
  } catch (err) {
    console.error('Reframe API error:', err);
    return {
      distortionType: 'Harsh Inner Critique',
      balancedPerspective: 'This difficult thought reflects temporary stress rather than an absolute fact. You are capable of navigating this step by step.',
      selfCompassionMessage: 'Treat yourself with the same tenderness you would offer a dear friend.'
    };
  }
};

export const requestPatternSynthesis = async (
  entries: JournalEntry[]
): Promise<PatternPayload> => {
  try {
    const response = await fetch('/api/emoticare/patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.recurringThemes && data.emoticareContinuitySummary) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Pattern synthesis API note (using contextual continuity engine):', err);
  }

  // Resilient contextual continuity synthesis fallback
  if (!entries || entries.length === 0) {
    return {
      recurringThemes: ['Developing emotional mindfulness', 'Naming somatic body sensations', 'Creating a daily pause sanctuary'],
      growthHighlights: ['Beginning your mindful reflection journey', 'Approaching emotions with gentle curiosity'],
      emoticareContinuitySummary: 'You have begun creating a safe, judgment-free sanctuary for your thoughts. As you continue to record your feelings and somatic cues, EmotiCare will uncover your evolving emotional rhythms and resilience milestones here.'
    };
  }

  const emotionMap: Record<string, number> = {};
  const sensations: string[] = [];
  entries.forEach(e => {
    if (e.primaryEmotion) {
      emotionMap[e.primaryEmotion] = (emotionMap[e.primaryEmotion] || 0) + 1;
    }
    if (e.bodySensation && e.bodySensation !== 'None' && !sensations.includes(e.bodySensation)) {
      sensations.push(e.bodySensation);
    }
  });

  const sortedEmotions = Object.keys(emotionMap).sort((a, b) => emotionMap[b] - emotionMap[a]);
  const primaryEmotion = sortedEmotions[0] || 'reflection';
  const secondaryEmotion = sortedEmotions[1] || 'inner balance';

  return {
    recurringThemes: [
      `Navigating experiences of ${primaryEmotion} with increasing awareness`,
      sensations.length > 0 ? `Somatic attunement (noticing sensations like ${sensations.slice(0, 2).join(' & ')})` : 'Mindful awareness of personal emotional boundaries',
      `Honoring your need for space and ${secondaryEmotion}`
    ],
    growthHighlights: [
      `Dedicated practice of putting feelings into words (${entries.length} reflections recorded)`,
      'Willingness to acknowledge emotional intensity without suppression'
    ],
    emoticareContinuitySummary: `Across your journal entries, there is a clear pattern of meaningful self-discovery. By giving voice to ${primaryEmotion} and connecting with your physical cues, you demonstrate consistent resilience and self-compassion.`
  };
};
