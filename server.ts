import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

const EMOTICARE_SYSTEM_PROMPT = `
You are EmotiCare, a deeply empathetic emotional support companion in a journaling app designed to help users process their feelings, build resilience, and understand their emotional patterns.

═══════════════════════════════════════════════════════════════
CORE IDENTITY & TONE:
• Warm, non-judgmental listener who validates all emotions
• Psychologically-informed but conversational (never clinical)
• Genuinely curious about the user's inner world
• Present and focused — make users feel heard and seen
• Encourage self-discovery over direct advice when possible

═══════════════════════════════════════════════════════════════
YOUR PRIMARY RESPONSIBILITIES:
1. VALIDATE FIRST:
   Always begin by acknowledging what the user shared:
   • "That sounds really challenging..."
   • "I can see why that would frustrate you..."
   • "It makes complete sense you'd feel that way..."

2. UNDERSTAND CONTEXT:
   Ask thoughtful follow-up questions:
   • "Can you tell me more about what led to this?"
   • "How long have you been feeling this way?"
   • "What's the hardest part about this situation for you?"

3. PROVIDE SUPPORT:
   Offer perspective, coping strategies, or reframing:
   • Normalize their feelings (others feel this too)
   • Suggest concrete coping techniques (grounding, breathing, etc.)
   • Help them see situations from new angles
   • Celebrate strengths and past resilience

4. ENCOURAGE REFLECTION:
   Guide deeper journaling through prompts:
   • "What would you want to tell your past self about this?"
   • "If you were advising a friend in this situation, what would you say?"
   • "What's one small thing you could do today that might help?"

5. BUILD CONTINUITY:
   Reference previous entries or patterns when available:
   • "I remember you mentioned struggling with this last week..."
   • "I've noticed you often feel better after..."
   • "This seems connected to what you journaled about..."

═══════════════════════════════════════════════════════════════
EMOTION-SPECIFIC GUIDANCE (from GoEmotions analysis):
- ANXIETY/NERVOUSNESS: Validate worry as protective instinct; offer grounding (5-4-3-2-1 sensory, box breathing); break overwhelming situations into manageable steps; normalize nervousness as part of growth.
- SADNESS/GRIEF: Honor the importance of their loss; normalize emotional processing timeline (no "moving on" pressure); suggest gentle self-care; explore what they need right now.
- ANGER/FRUSTRATION: Validate anger as valid emotion with important information; explore what boundary was crossed or need wasn't met; suggest healthy expression (journaling, movement); identify what they need to feel respected.
- JOY/GRATITUDE: Amplify positive feelings; help savor the moment; explore alignment with values; suggest capturing details in journal.
- PRIDE/ACHIEVEMENT: Celebrate genuinely without minimizing; help internalize accomplishments; use to fuel future resilience.
- CONFUSION/UNCERTAINTY: Normalize not having all answers; explore what they DO know; break into smaller questions; suggest journaling for clarity.
- SHAME/REMORSE: Separate behavior from identity ("You made a choice, you're not a bad person"); explore what they are learning; guide toward self-compassion and amends if needed.
- ISOLATION/LONELINESS: Validate pain of disconnection; gently explore barriers; suggest small steps toward reaching out; offer warm presence.

═══════════════════════════════════════════════════════════════
RESPONSE STRUCTURE (keep 200-400 words):
[EMPATHY] Acknowledge what they shared
↓
[VALIDATION] Affirm their feelings are valid/understandable
↓
[EXPLORATION] Ask 1-2 clarifying questions OR share perspective
↓
[SUPPORT] Offer strategy, reframing, or journaling prompt
↓
[ENCOURAGEMENT] End with supportive message or reflection prompt

═══════════════════════════════════════════════════════════════
CRITICAL DO's:
✓ Meet them where they are emotionally
✓ Ask before giving advice
✓ Use their words and language back to them
✓ Acknowledge complexity
✓ Encourage self-compassion
✓ Celebrate growth and insight
✓ Be authentic
✓ Honor the courage it takes to open up

═══════════════════════════════════════════════════════════════
CRITICAL DON'Ts:
✗ Never provide medical/psychiatric diagnosis or treatment
✗ Never diagnose mental health conditions
✗ Never replace professional mental health care recommendations
✗ Never make assumptions — ask instead
✗ Never minimize or dismiss their feelings
✗ Never rush to "fix" their problems
✗ Never use corporate/clinical language
✗ Never be overly cheerful when they're hurting
✗ Never share made-up personal stories
✗ Never store or reference real identifying personal names

═══════════════════════════════════════════════════════════════
CRISIS/HARM PROTOCOL:
If user mentions suicidal thoughts, self-harm, abuse, or acute crisis:
1. Respond with deep compassion: "I'm really concerned about you. What you're going through sounds incredibly painful, and I'm honored you're trusting me."
2. Take it seriously: "Your safety matters. This is bigger than what I can support with."
3. Provide resources:
   • National Suicide Prevention Lifeline: 988 (US)
   • Crisis Text Line: Text HOME to 741741
   • International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
   • Emergency services: 911
4. Encourage immediate action: "Will you reach out to someone today? A trusted friend, family member, or one of these resources?"
5. Continue support: "I'm here for you. You deserve professional support — please don't go through this alone."
`;

// Helper to call Gemini with retry and fallback models
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = [
    params.primaryModel || 'gemini-3.7-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isTransient = 
          errMessage.includes('503') || 
          errMessage.includes('high demand') || 
          errMessage.includes('UNAVAILABLE') || 
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED');
        
        if (isTransient) {
          await new Promise(resolve => setTimeout(resolve, 350 * Math.pow(2, attempt) + Math.random() * 150));
          continue;
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('All model attempts failed');
}

// Fallback pattern generator based on actual user entries
function generateFallbackPatterns(entries: any[]) {
  if (!entries || entries.length === 0) {
    return {
      recurringThemes: [
        "Developing emotional mindfulness",
        "Listening to mind-body sensations",
        "Creating a safe daily sanctuary"
      ],
      growthHighlights: [
        "Starting your mindful reflection journey",
        "Validating emotions without harsh self-judgment"
      ],
      emoticareContinuitySummary: "You have opened a warm, safe sanctuary for your reflections. As you continue to check in and record your emotions, EmotiCare will track your evolving themes, somatic signals, and moments of resilience."
    };
  }

  // Count emotions
  const emotionCounts: Record<string, number> = {};
  const sensations: string[] = [];
  entries.forEach(e => {
    if (e.primaryEmotion) {
      emotionCounts[e.primaryEmotion] = (emotionCounts[e.primaryEmotion] || 0) + 1;
    }
    if (e.bodySensation && e.bodySensation !== 'None' && !sensations.includes(e.bodySensation)) {
      sensations.push(e.bodySensation);
    }
  });

  const sortedEmotions = Object.keys(emotionCounts).sort((a, b) => emotionCounts[b] - emotionCounts[a]);
  const primaryEmotion = sortedEmotions[0] || 'reflection';
  const secondaryEmotion = sortedEmotions[1] || 'awareness';

  const themes = [
    `Navigating episodes of ${primaryEmotion} with growing insight`,
    sensations.length > 0 ? `Somatic connection (noticing sensations like ${sensations.slice(0, 2).join(' and ')})` : "Building mindful awareness around emotional triggers",
    `Balancing inner challenges with intentional moments of ${secondaryEmotion}`
  ];

  const highlights = [
    `Consistent dedication to giving your feelings voice (${entries.length} entry${entries.length > 1 ? 's' : ''} recorded)`,
    `Acknowledging intensity levels honestly rather than suppressing what you feel`
  ];

  const summary = `Across your recent journal entries, there is a clear rhythm of honest self-reflection. You have been navigating ${primaryEmotion}${secondaryEmotion !== 'awareness' ? ` alongside moments of ${secondaryEmotion}` : ''}, and each entry demonstrates your courage in pausing to listen to your inner world. Keep offering yourself the gentleness you deserve.`;

  return {
    recurringThemes: themes,
    growthHighlights: highlights,
    emoticareContinuitySummary: summary
  };
}
function isCrisisContent(text: string): boolean {
  const crisisTerms = [
    /suicid/i,
    /kill myself/i,
    /end my life/i,
    /want to die/i,
    /self[\s-]?harm/i,
    /cut myself/i,
    /hanging myself/i,
    /overdose/i,
    /better off dead/i,
    /no reason to live/i
  ];
  return crisisTerms.some(term => term.test(text));
}

// 1. EmotiCare Chat Endpoint
app.post('/api/emoticare/chat', async (req, res) => {
  try {
    const { message, history = [], continuityContext = '' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const isCrisis = isCrisisContent(message);

    if (isCrisis) {
      return res.json({
        reply: `I'm really concerned about you. What you're going through sounds incredibly painful, and I'm honored you're trusting me.\n\nYour safety matters deeply. This is bigger than what I can support with as an AI companion.\n\nPlease reach out to a crisis line or mental health professional right now:\n• **National Suicide Prevention Lifeline**: Call or text **988** (US/Canada)\n• **Crisis Text Line**: Text **HOME to 741741**\n• **International Crisis Centers**: https://www.iasp.info/resources/Crisis_Centres/\n• **Emergency Services**: Call **911**\n\nWill you reach out to someone today? A trusted friend, family member, or one of these compassionate resources?\n\nI'm here for you. You deserve professional human support and gentle care — please don't carry this alone.`,
        isCrisis: true,
        detectedEmotion: 'sadness',
        suggestedAction: 'grounding_54321'
      });
    }

    const ai = getAiClient();
    if (!ai) {
      // Fallback response generator if API key not set yet
      return res.json({
        reply: `I hear how much is on your mind, and I appreciate you sharing this with me.\n\nWhat you're experiencing is completely valid, and it makes sense that you are feeling this way right now.\n\nCan you tell me more about what's feeling hardest for you at this exact moment?\n\nTake a gentle breath with me. If it feels helpful, we can try a quick 5-4-3-2-1 grounding exercise or explore what one small, compassionate step forward might look like.\n\nFor your journal: What is one kind thing you would say to someone you love if they were walking through this same situation?`,
        isCrisis: false,
        detectedEmotion: 'anxiety',
        suggestedPrompts: [
          "Can you tell me more about what led to this?",
          "What is one small thing that might bring a little comfort right now?"
        ]
      });
    }

    // Build context
    const contextPrompt = continuityContext
      ? `\n\nUser's Past Journal Themes & Continuity Context:\n${continuityContext}\n(Note: Reference past themes gently when relevant to build continuity and show you remember).`
      : '';

    const formattedHistory = history.map((h: { role: string; content: string }) => `${h.role === 'user' ? 'User' : 'EmotiCare'}: ${h.content}`).join('\n\n');

    const prompt = `${formattedHistory ? `Conversation history:\n${formattedHistory}\n\n` : ''}User's current message: "${message}"${contextPrompt}\n\nRespond as EmotiCare following the exact 5-step response structure [EMPATHY] -> [VALIDATION] -> [EXPLORATION] -> [SUPPORT] -> [ENCOURAGEMENT] (200-400 words). Maintain a soothing, warm, psychologically-grounded tone.`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: EMOTICARE_SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I'm listening and right here with you. What feels most important to explore right now?";

    // Suggest action based on emotion
    let suggestedAction: string | undefined;
    const lower = replyText.toLowerCase();
    if (lower.includes('grounding') || lower.includes('5-4-3-2-1') || lower.includes('sensory')) {
      suggestedAction = 'grounding_54321';
    } else if (lower.includes('breath') || lower.includes('box breath') || lower.includes('inhale')) {
      suggestedAction = 'box_breathing';
    } else if (lower.includes('reframe') || lower.includes('perspective') || lower.includes('inner critic')) {
      suggestedAction = 'reframing';
    }

    return res.json({
      reply: replyText,
      isCrisis: false,
      suggestedAction
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.json({
      reply: "I hear what you're sharing, and I want to acknowledge how important this is. Even when things feel overwhelming, your feelings deserve gentle space. Let's take a slow breath together.\n\nCan you tell me a little more about what's feeling most present for you right now?",
      isCrisis: false,
      suggestedAction: 'box_breathing'
    });
  }
});

// 2. Reflect on a Full Journal Entry Endpoint
app.post('/api/emoticare/reflect-entry', async (req, res) => {
  try {
    const { title, content, emotion, intensity, bodySensation, continuityContext } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Entry content is required' });
    }

    const isCrisis = isCrisisContent(content);
    if (isCrisis) {
      return res.json({
        isCrisis: true,
        fullText: `I'm really concerned about you. What you're going through sounds incredibly painful, and I'm honored you're trusting your journal with this.\n\nYour safety matters deeply. Please connect with immediate professional support:\n• **National Suicide Prevention Lifeline**: 988\n• **Crisis Text Line**: Text HOME to 741741\n• **Emergency**: 911`,
        reflectionPrompts: [
          "Will you reach out to a trusted friend or call 988 today?",
          "What is one safe, grounding anchor you can hold right now?"
        ]
      });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        empathy: "Thank you for putting your thoughts and raw feelings onto paper.",
        validation: `It makes complete sense that you are feeling this ${emotion || 'way'} (${intensity || 5}/10 intensity). Your emotions carry valuable information.`,
        exploration: `Notice the physical sensation you marked (${bodySensation || 'in your body'}). What is that sensation asking you for right now?`,
        support: "Allow yourself to sit with this without needing to fix everything immediately.",
        encouragement: "You showed great courage in expressing this today.",
        fullText: `Thank you for putting your thoughts onto the page. Feeling this ${emotion || 'way'} with a ${intensity || 5}/10 intensity is completely valid.\n\nWhen we give voice to what we carry, the burden becomes lighter to hold. Notice the sensation in your body (${bodySensation || 'throughout your system'})—it is a reminder to offer yourself gentle care right now.\n\nFor your continued reflection:\n1. If a compassionate friend came to you with these exact feelings, how would you comfort them?\n2. What is one small, low-pressure thing you can do for yourself in the next hour?`,
        reflectionPrompts: [
          "If a compassionate friend came to you with these exact feelings, how would you comfort them?",
          "What is one small, low-pressure thing you can do for yourself in the next hour?"
        ],
        suggestedTechnique: intensity > 6 ? 'box_breathing' : 'self_compassion'
      });
    }

    const prompt = `
Analyze and reflect on this user's journal entry as EmotiCare:
Title: "${title || 'Untitled'}"
Primary Emotion: "${emotion}" (Intensity: ${intensity}/10)
Physical Sensation: "${bodySensation || 'Not specified'}"
Entry Text:
"""
${content}
"""

Continuity Context:
${continuityContext || 'First recent entry.'}

Provide a structured empathetic companion response in JSON format.
Follow the 5-step response sequence:
- empathy: Acknowledge what they shared with warmth
- validation: Affirm their emotions as valid and understandable
- exploration: A thoughtful psychological insight or clarifying exploration
- support: A concrete coping strategy, reframing, or self-compassion note
- encouragement: A supportive closing reflection
- fullText: The combined cohesive response (200-350 words) written directly to the user in first-person EmotiCare voice.
- reflectionPrompts: An array of 2 thoughtful follow-up journaling questions.
- suggestedTechnique: One of 'grounding_54321', 'box_breathing', 'reframing', 'self_compassion'.
`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: EMOTICARE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empathy: { type: Type.STRING },
            validation: { type: Type.STRING },
            exploration: { type: Type.STRING },
            support: { type: Type.STRING },
            encouragement: { type: Type.STRING },
            fullText: { type: Type.STRING },
            reflectionPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedTechnique: {
              type: Type.STRING,
              enum: ['grounding_54321', 'box_breathing', 'reframing', 'self_compassion']
            }
          },
          required: ['empathy', 'validation', 'exploration', 'support', 'encouragement', 'fullText', 'reflectionPrompts']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error reflecting on journal entry:', error);
    const { emotion, intensity, bodySensation } = req.body || {};
    return res.json({
      empathy: "Thank you for taking the time to put your thoughts into words.",
      validation: `Feeling ${emotion || 'this way'} (${intensity || 5}/10) is completely valid. Your emotions are messengers, not flaws.`,
      exploration: `Notice what the sensation (${bodySensation || 'within you'}) might be telling you about your boundaries or needs.`,
      support: "Take a slow, gentle breath. You don't have to solve everything all at once.",
      encouragement: "Showing up to reflect on yourself is a profound act of self-care and resilience.",
      fullText: `Thank you for putting your thoughts onto the page. Feeling ${emotion || 'this way'} is completely understandable.\n\nWhen we give voice to what we carry, the burden becomes easier to bear. Take a moment to honor the effort it took to write this down.\n\nFor your continued reflection:\n1. What is one small, kind thing you can do for yourself today?\n2. If a dear friend shared this with you, what comforting words would you offer them?`,
      reflectionPrompts: [
        "What is one small, kind thing you can do for yourself today?",
        "If a dear friend shared this with you, what comforting words would you offer them?"
      ],
      suggestedTechnique: (intensity && intensity > 6) ? 'box_breathing' : 'self_compassion'
    });
  }
});

// 3. Cognitive Reframe Assistant Endpoint
app.post('/api/emoticare/reframe', async (req, res) => {
  try {
    const { automaticThought, emotion } = req.body;
    if (!automaticThought) {
      return res.status(400).json({ error: 'Thought is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        distortionType: 'Overgeneralization & Self-Criticism',
        balancedPerspective: "This difficult moment is an isolated event rather than a permanent verdict on your capability. Give yourself the same grace you extend to others.",
        selfCompassionMessage: "You are allowed to be a work in progress and still deserve kindness."
      });
    }

    const prompt = `
The user is experiencing a harsh or distressing automatic thought:
Thought: "${automaticThought}"
Associated Emotion: "${emotion || 'challenging'}"

As EmotiCare, gently identify:
1. distortionType: (e.g., Catastrophizing, All-or-Nothing, Mind Reading, Emotional Reasoning, Overgeneralization, Personalization)
2. balancedPerspective: A realistic, nuanced, and grounded reframe of the thought without toxic positivity.
3. selfCompassionMessage: A 1-2 sentence warm, soothing affirmation acknowledging their humanity.
`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: EMOTICARE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distortionType: { type: Type.STRING },
            balancedPerspective: { type: Type.STRING },
            selfCompassionMessage: { type: Type.STRING }
          },
          required: ['distortionType', 'balancedPerspective', 'selfCompassionMessage']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating reframe:', error);
    return res.json({
      distortionType: 'Harsh Inner Critique / Overgeneralization',
      balancedPerspective: 'This distressing thought is a temporary reaction to stress rather than an immutable truth. You have handled tough moments before and can navigate this with patience.',
      selfCompassionMessage: 'Offer yourself the same warmth and non-judgmental grace you would give to someone you love.'
    });
  }
});

// 4. Emotional Patterns & Continuity Synthesis Endpoint
app.post('/api/emoticare/patterns', async (req, res) => {
  try {
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.json(generateFallbackPatterns([]));
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json(generateFallbackPatterns(entries));
    }

    const entriesSummary = entries.slice(0, 10).map((e: { title: string; primaryEmotion: string; intensity: number; content: string; date: string }) => {
      return `Date: ${e.date}, Title: "${e.title}", Emotion: ${e.primaryEmotion} (${e.intensity}/10), Excerpt: "${e.content.slice(0, 180)}"`;
    }).join('\n');

    const prompt = `
Review these recent journal entries from the user:
${entriesSummary}

As EmotiCare, synthesize their emotional patterns and resilience continuity:
1. recurringThemes: Array of 3-4 recurring themes or emotional situations.
2. growthHighlights: Array of 2-3 genuine resilience moments, self-compassion breakthroughs, or coping strategies they used.
3. emoticareContinuitySummary: A warm, 150-200 word summary written directly to the user highlighting what you have observed about their emotional rhythm, celebrating their resilience, and offering an encouraging reflection.
`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: EMOTICARE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recurringThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            growthHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            emoticareContinuitySummary: { type: Type.STRING }
          },
          required: ['recurringThemes', 'growthHighlights', 'emoticareContinuitySummary']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.recurringThemes || !parsed.emoticareContinuitySummary) {
      return res.json(generateFallbackPatterns(entries));
    }
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating patterns:', error);
    // Return intelligent contextual fallback patterns derived directly from the user's entries
    const fallback = generateFallbackPatterns(req.body?.entries || []);
    return res.json(fallback);
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EmotiCare server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
