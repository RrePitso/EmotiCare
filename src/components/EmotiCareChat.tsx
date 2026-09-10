import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  Heart, 
  RotateCcw, 
  Compass, 
  Wind, 
  BookPlus, 
  ShieldAlert, 
  MessageSquare,
  Bot,
  User,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, JournalEntry, EmotionCategory } from '../types';
import { SCENARIO_STARTERS, GO_EMOTIONS } from '../data/emotionsData';
import { sendChatMessage } from '../services/geminiService';
import { getContinuityContextSummary } from '../utils/storage';
import { audioSynth } from '../utils/audioSynth';

interface EmotiCareChatProps {
  chatHistory: ChatMessage[];
  onUpdateChatHistory: (messages: ChatMessage[]) => void;
  journalEntries: JournalEntry[];
  onOpenCrisis: () => void;
  onNavigateToToolkit: (tool: 'grounding_54321' | 'box_breathing' | 'reframing') => void;
  onConvertChatToJournal: (content: string, emotion?: EmotionCategory) => void;
}

export const EmotiCareChat: React.FC<EmotiCareChatProps> = ({
  chatHistory,
  onUpdateChatHistory,
  journalEntries,
  onOpenCrisis,
  onNavigateToToolkit,
  onConvertChatToJournal
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...chatHistory, userMessage];
    onUpdateChatHistory(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const continuityContext = getContinuityContextSummary(journalEntries);
      const response = await sendChatMessage(message, chatHistory, continuityContext);

      if (response.isCrisis) {
        onOpenCrisis();
      }

      audioSynth.playChime(528); // gentle pleasant response chime

      const assistantMessage: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        isCrisis: response.isCrisis,
        suggestedPrompts: response.suggestedPrompts,
        suggestedAction: response.suggestedAction
      };

      onUpdateChatHistory([...newHistory, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: "I hear how much is on your mind, and I appreciate you sharing this with me. Take a gentle breath with me. What is feeling most important right now?",
        timestamp: new Date().toISOString()
      };
      onUpdateChatHistory([...newHistory, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Would you like to start a fresh conversation with EmotiCare?')) {
      onUpdateChatHistory([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto w-full bg-white/70 backdrop-blur-md rounded-3xl border border-amber-100 shadow-sm overflow-hidden" id="emoticare-chat-panel">
      {/* Top Banner / Presence status */}
      <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-400 to-amber-300 p-0.5">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 font-serif-accent">
              EmotiCare Companion
            </h2>
            <p className="text-[11px] text-stone-500">
              Validated listening • Non-judgmental • Grounded in empathy
            </p>
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 px-2.5 py-1 rounded-lg hover:bg-stone-100 transition-colors"
            title="Start new conversation"
            id="clear-chat-history-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Thread</span>
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" id="chat-messages-feed">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto px-4 py-8">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 shadow-xs">
              <Sparkles className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif-accent mb-2">
              "I'm here with you. What are you carrying today?"
            </h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              EmotiCare is your safe, confidential sanctuary to untangle complex feelings, 
              discover perspective, and practice self-compassion without any pressure to "fix" everything instantly.
            </p>

            {/* Quick Starters Carousel */}
            <div className="w-full text-left">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
                Thought Starters & Situations
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SCENARIO_STARTERS.map((s, idx) => {
                  const emotionInfo = GO_EMOTIONS[s.emotion];
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s.prompt)}
                      className="p-3 text-left bg-stone-50/80 hover:bg-white border border-stone-200/80 hover:border-amber-300 rounded-2xl transition-all shadow-2xs group flex flex-col justify-between"
                      id={`scenario-starter-btn-${idx}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-stone-900 group-hover:text-rose-700">
                            {s.title}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${emotionInfo?.bgColor || 'bg-stone-100'} ${emotionInfo?.textColor || 'text-stone-700'}`}>
                            {emotionInfo?.label.split('&')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2 italic">
                          "{s.prompt}"
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-[11px] text-rose-600 font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Reflect with EmotiCare</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-400 to-amber-300 p-0.5 shrink-0 mt-1">
                    <div className="w-full h-full bg-white rounded-[8px] flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    </div>
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-2xs ${
                  isUser
                    ? 'bg-stone-900 text-white rounded-tr-xs'
                    : 'bg-white border border-amber-100/90 text-stone-800 rounded-tl-xs'
                }`}>
                  {/* Crisis Banner if present */}
                  {msg.isCrisis && (
                    <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-900 text-xs">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="font-medium">
                        Crisis Support Protocol Active — Help is immediately available.
                      </span>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none text-stone-800 leading-relaxed space-y-2 prose-p:my-1 prose-headings:font-serif-accent prose-strong:text-stone-900">
                    {isUser ? (
                      <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>

                  {/* Companion Interactive Action Shortcuts */}
                  {!isUser && (
                    <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
                      {msg.suggestedAction === 'grounding_54321' && (
                        <button
                          onClick={() => onNavigateToToolkit('grounding_54321')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-medium rounded-xl transition-colors"
                          id="chat-action-grounding-btn"
                        >
                          <Compass className="w-3.5 h-3.5 text-amber-700" />
                          Open 5-4-3-2-1 Sensory Grounder
                        </button>
                      )}

                      {msg.suggestedAction === 'box_breathing' && (
                        <button
                          onClick={() => onNavigateToToolkit('box_breathing')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-medium rounded-xl transition-colors"
                          id="chat-action-breathing-btn"
                        >
                          <Wind className="w-3.5 h-3.5 text-teal-700" />
                          Start Box Breathing
                        </button>
                      )}

                      {msg.suggestedAction === 'reframing' && (
                        <button
                          onClick={() => onNavigateToToolkit('reframing')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-medium rounded-xl transition-colors"
                          id="chat-action-reframe-btn"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                          Cognitive Reframe Tool
                        </button>
                      )}

                      <button
                        onClick={() => onConvertChatToJournal(msg.content)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs font-medium rounded-lg transition-colors ml-auto"
                        title="Save this conversation as a journal entry"
                        id="save-chat-to-journal-btn"
                      >
                        <BookPlus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Save to Journal</span>
                      </button>
                    </div>
                  )}

                  <div className={`mt-2 text-[10px] ${isUser ? 'text-stone-400 text-right' : 'text-stone-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center text-white shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 items-center text-stone-500 text-xs pl-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
            <div className="bg-white border border-amber-100 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-2xs">
              <span className="font-serif-accent italic text-stone-600">EmotiCare is listening deeply</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-amber-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Share what is on your heart... (Press Enter to reflect)"
            rows={2}
            className="w-full resize-none pl-4 pr-14 py-3 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 text-stone-900 placeholder:text-stone-400 transition-all"
            id="chat-input-textarea"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-xl transition-all shadow-xs"
            aria-label="Send message"
            id="chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[11px] text-stone-400 mt-2 text-center">
          EmotiCare provides compassionate emotional support. If you are in crisis, please call 988 or text 741741.
        </p>
      </div>
    </div>
  );
};
