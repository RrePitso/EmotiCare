import { GoEmotionInfo, EmotionCategory } from '../types';

export const GO_EMOTIONS: Record<EmotionCategory, GoEmotionInfo> = {
  anxiety: {
    id: 'anxiety',
    label: 'Anxiety & Worry',
    category: 'challenging',
    color: '#d97706',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    icon: 'Sparkles',
    description: 'Feeling uneasy, on edge, racing thoughts, or protective worry',
    guidanceNote: 'Validate worry as protective instinct. Use 5-4-3-2-1 grounding or box breathing.'
  },
  sadness: {
    id: 'sadness',
    label: 'Sadness & Grief',
    category: 'challenging',
    color: '#2563eb',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: 'CloudRain',
    description: 'Feeling heavy, downhearted, sorrowful, or mourning a loss',
    guidanceNote: 'Honor the loss. Normalize emotional timeline with zero rush to "move on".'
  },
  anger: {
    id: 'anger',
    label: 'Anger & Frustration',
    category: 'challenging',
    color: '#dc2626',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-800',
    icon: 'Flame',
    description: 'Feeling irritated, boundary crossed, resentful, or outraged',
    guidanceNote: 'Validate anger as important information about crossed boundaries and unmet needs.'
  },
  loneliness: {
    id: 'loneliness',
    label: 'Isolation & Loneliness',
    category: 'challenging',
    color: '#7c3aed',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    icon: 'Compass',
    description: 'Feeling unseen, misunderstood, physically or emotionally disconnected',
    guidanceNote: 'Validate the ache of disconnection. Offer warm presence and small steps toward reaching out.'
  },
  shame: {
    id: 'shame',
    label: 'Shame & Remorse',
    category: 'challenging',
    color: '#9333ea',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-200',
    textColor: 'text-fuchsia-800',
    icon: 'ShieldAlert',
    description: 'Feeling inadequate, harsh self-blame, or wishing to hide',
    guidanceNote: 'Separate behavior from identity ("You made a choice, you are not a bad person").'
  },
  confusion: {
    id: 'confusion',
    label: 'Confusion & Uncertainty',
    category: 'reflective',
    color: '#0891b2',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-800',
    icon: 'HelpCircle',
    description: 'Feeling torn, foggy, uncertain of the path forward, or in transition',
    guidanceNote: 'Normalize not having all answers. Explore what is currently known and break into small queries.'
  },
  overwhelm: {
    id: 'overwhelm',
    label: 'Overwhelm & Burnout',
    category: 'challenging',
    color: '#ea580c',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    icon: 'Waves',
    description: 'Too much to carry at once, feeling flooded or completely depleted',
    guidanceNote: 'Pause and establish safety. Untangle and isolate just ONE manageable step.'
  },
  joy: {
    id: 'joy',
    label: 'Joy & Delight',
    category: 'positive',
    color: '#eab308',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    icon: 'Sun',
    description: 'Lighthearted, energized, deeply content, or full of wonder',
    guidanceNote: 'Amplify positive feelings, savor the moment, and explore alignment with core values.'
  },
  gratitude: {
    id: 'gratitude',
    label: 'Gratitude & Appreciation',
    category: 'positive',
    color: '#059669',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    icon: 'Heart',
    description: 'Thankful, touched by kindness, acknowledging life blessings',
    guidanceNote: 'Anchor the feeling and explore what relationships and small gifts make life meaningful.'
  },
  pride: {
    id: 'pride',
    label: 'Pride & Achievement',
    category: 'positive',
    color: '#4f46e5',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    icon: 'Award',
    description: 'Recognizing personal effort, overcome obstacles, and milestones',
    guidanceNote: 'Celebrate genuinely without minimizing. Internalize self-worth to fuel future resilience.'
  },
  hope: {
    id: 'hope',
    label: 'Hope & Optimism',
    category: 'positive',
    color: '#10b981',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-800',
    icon: 'Sunrise',
    description: 'Glimmers of possibility, renewed faith, looking toward tomorrow',
    guidanceNote: 'Nurture emerging optimism and identify the small steps supporting this renewed outlook.'
  },
  relief: {
    id: 'relief',
    label: 'Relief & Release',
    category: 'reflective',
    color: '#0d9488',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    icon: 'Feather',
    description: 'A burden lifted, tension letting go, an exhale after difficulty',
    guidanceNote: 'Help the body consciously register the release and celebrate getting through the storm.'
  },
  calm: {
    id: 'calm',
    label: 'Calm & Grounded',
    category: 'reflective',
    color: '#64748b',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-800',
    icon: 'Anchor',
    description: 'Centered, peaceful, present in this moment, breath flowing smoothly',
    guidanceNote: 'Anchor this steady baseline state as a sanctuary you can always return to.'
  }
};

export const SOMATIC_SENSATIONS = [
  'Tightness in chest',
  'Knot or flutter in stomach',
  'Heavy shoulders / neck tension',
  'Clenched jaw or teeth',
  'Shallow breathing',
  'Warmth in heart area',
  'Tears behind eyes',
  'Restless hands / fidgeting',
  'Light & open sensation',
  'Fatigue / heaviness in limbs',
  'Throat constriction',
  'Steady & relaxed pulse'
];

export const SCENARIO_STARTERS = [
  {
    title: 'Failure / Self-Doubt',
    description: 'Dealing with an outcome that shook your confidence',
    prompt: "I bombed my interview today. I feel like I'm not good enough for anything.",
    emotion: 'shame' as EmotionCategory
  },
  {
    title: 'Loneliness & Disconnection',
    description: 'Feeling separated while everyone else seems to have it figured out',
    prompt: "I feel so alone. Everyone else seems to have their life figured out.",
    emotion: 'loneliness' as EmotionCategory
  },
  {
    title: 'Overwhelm & Panic',
    description: 'Too many demands crashing down simultaneously',
    prompt: "Everything feels like too much. I have so much to do and I don't know where to start. I'm panicking.",
    emotion: 'overwhelm' as EmotionCategory
  },
  {
    title: 'Anger & Boundary Crossed',
    description: 'Someone overlooked your needs or crossed a boundary',
    prompt: "My colleague took full credit for my project in front of the whole team. I am fuming and can't focus.",
    emotion: 'anger' as EmotionCategory
  },
  {
    title: 'Quiet Pride & Growth',
    description: 'A quiet breakthrough you want to acknowledge',
    prompt: "I set a firm boundary with my family today without apologizing. I feel nervous but secretly really proud of myself.",
    emotion: 'pride' as EmotionCategory
  }
];

export const SAMPLE_INITIAL_ENTRIES = [
  {
    id: 'entry-seed-1',
    title: 'Navigating work presentation anxiety',
    content: "Had to present the quarterly results today. I woke up with my heart pounding and a tight knot in my stomach. Kept thinking everyone would judge my hesitation. But I paused, took three slow breaths, and delivered the slides. It wasn't flawless, but I made it through.",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    primaryEmotion: 'anxiety' as EmotionCategory,
    secondaryEmotions: ['pride' as EmotionCategory, 'relief' as EmotionCategory],
    intensity: 7,
    bodySensation: 'Tightness in chest',
    tags: ['work', 'public-speaking', 'growth'],
    isFavorite: true,
    companionResponse: {
      empathy: "I hear how much courage it took to stand up and deliver that presentation when your nervous system was in high alarm.",
      validation: "It is completely understandable to feel your heart race when putting yourself out there. Performance anxiety is an instinctive surge of energy, not a sign of inability.",
      exploration: "What helped you remember to take those three slow breaths in the middle of that pressure?",
      support: "Notice that even with hesitation, you did not abandon yourself. You stayed present and followed through.",
      encouragement: "For your reflection: How can you honor the courage you showed today, rather than critiquing the imperfections?",
      fullText: "I hear how much courage it took to stand up and deliver that presentation when your nervous system was in high alarm.\n\nIt makes complete sense that you'd feel that racing heartbeat and stomach knot. Performance anxiety is a natural protective surge, not a measure of your capability.\n\nI noticed something wonderful in what you shared: when the anxiety peaked, you chose to pause, take three slow breaths, and continue. That is emotional resilience in action.\n\nFor your journal: What would you want to tell your past self who was dreading this morning? How can you celebrate this step tonight?",
      reflectionPrompts: [
        "What would you tell someone you care about who just completed a hard presentation?",
        "What is one concrete self-care gift you can give yourself this evening to celebrate showing up?"
      ],
      suggestedTechnique: 'box_breathing' as const
    }
  },
  {
    id: 'entry-seed-2',
    title: 'Quiet evening reflecting on friendship',
    content: "Spent an hour sitting by the window with a warm mug of tea. Realized how grateful I am for my friend Maya who called just to check on me without any agenda. It made me feel seen after a draining week.",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    primaryEmotion: 'gratitude' as EmotionCategory,
    secondaryEmotions: ['calm' as EmotionCategory],
    intensity: 8,
    bodySensation: 'Warmth in heart area',
    tags: ['friendship', 'gratitude', 'peace'],
    isFavorite: true,
    companionResponse: {
      empathy: "What a comforting, gentle space you carved out by the window.",
      validation: "Feeling truly seen by someone who checks in without expectations is one of life's sweetest balms, especially after a draining week.",
      exploration: "What did Maya's check-in reflect back to you about the kind of connections that nourish your spirit?",
      support: "Savoring these quiet moments helps build a steady emotional reservoir you can draw on when life gets noisy.",
      encouragement: "Keep holding onto that warmth in your chest. You deserve friendships that honor who you are.",
      fullText: "What a comforting, gentle space you carved out by the window.\n\nFeeling truly seen by a friend who checks in without any agenda is such a grounding gift, especially after a draining stretch of days. It makes complete sense that this brought warmth to your heart.\n\nSavoring these quiet moments of connection helps your nervous system feel safe and appreciated. \n\nFor your journal: How might you express or return this gentle warmth to someone you care about this week?",
      reflectionPrompts: [
        "What makes you feel most genuinely seen and understood in relationships?",
        "What small ritual like your window tea time can you protect this coming weekend?"
      ]
    }
  }
];
