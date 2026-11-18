import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import {
  Send,
  Sparkles,
  Trash2,
  Bot,
  User,
  CornerDownLeft,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { sendChatMessage } from '../../utils/api';
import GlassCard from '../Common/GlassCard';

export default function ChatInterface({ className = '', suggestedPrompts = [], language = 'hinglish' }) {
  const { currentDataset, chatHistory, addChatMessage, clearChat } = useDataStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const defaultSuggestions = suggestedPrompts.length > 0 ? suggestedPrompts : [
    'What are the key drivers of customer churn?',
    'Forecast revenue trajectory for next 6 months',
    'Which variables have the strongest correlation?',
    'Identify anomalies and data quality red flags',
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || isTyping) return;

    setInputMessage('');

    // Add user message to store
    addChatMessage({
      sender: 'user',
      text,
      language,
    });

    setIsTyping(true);

    try {
      const response = await sendChatMessage(
        currentDataset?.id || 'demo-dataset',
        text,
        chatHistory
      );

      setIsTyping(false);

      // Add AI reply
      addChatMessage({
        sender: 'ai',
        text: response.reply,
        suggestions: response.suggestions || [],
      });
    } catch (err) {
      setIsTyping(false);
      toast.error('Failed to get AI response. Please try again.');
      addChatMessage({
        sender: 'ai',
        text: 'I encountered an error analyzing your request. Please verify your query or check dataset status.',
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl bg-[#0e0e17]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl ${className}`}>
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-glow-sm-purple">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                DataSense Copilot
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Gemini 1.5 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous contextual intelligence
            </p>
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={() => {
              clearChat();
              toast('Chat history cleared', { icon: '🧹' });
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Questions Chips (When few or no messages) */}
      {chatHistory.length <= 1 && (
        <div className="px-5 py-3 bg-white/[0.015] border-b border-white/5">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Suggested Explorations:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {defaultSuggestions.map((query, i) => (
              <button
                key={i}
                onClick={() => handleSend(query)}
                className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/25 transition-all text-left"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {chatHistory.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold relative ${
                  isUser
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                    : 'bg-white/10 text-cyan-400 border border-white/10'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                {isUser && (
                  <span className="absolute -bottom-1 -right-1 text-[11px] leading-none drop-shadow">
                    {(msg.language || language) === 'hinglish' ? '🇮🇳' : '🇺🇸'}
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] md:max-w-[75%] space-y-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
                <div
                  className={`relative p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-sm-purple rounded-tr-none'
                      : 'bg-white/[0.04] backdrop-blur-xl border border-white/10 text-slate-200 shadow-glass rounded-tl-none'
                  }`}
                >
                  {/* Copy button for AI replies */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  <div className="prose prose-invert max-w-none text-xs md:text-sm space-y-2 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-purple-300">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>

                {/* Follow-up suggestions if provided by AI */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(suggestion)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all text-left"
                      >
                        ↳ {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-300 block px-1">
                  {msg.timestamp || 'Just now'}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 text-cyan-400 border border-white/10 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 rounded-tl-none flex items-center gap-1.5">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-purple-400"
              />
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              />
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              />
              <span className="text-xs text-purple-300 ml-2 font-medium">
                {language === 'hinglish'
                  ? 'DataSense AI soch raha hai...'
                  : 'Reasoning across dataset columns...'}
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 md:p-4 bg-white/[0.02] border-t border-white/[0.08]">
        <div className="flex items-center gap-2">
          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'hinglish'
                ? currentDataset
                  ? `${currentDataset.name} ke baare mein kuch bhi pucho (Hinglish/English)...`
                  : 'Data upload karo aur sawal pucho...'
                : currentDataset
                ? `Ask anything about ${currentDataset.name}...`
                : 'Upload a dataset or ask a statistical question...'
            }
            className="flex-1 resize-none py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:bg-white/[0.08] transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-sm-purple transition-all"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 px-1">
          <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
          <span className="flex items-center gap-1 text-purple-300">
            <Sparkles className="w-3 h-3" />
            Zero training on private data
          </span>
        </div>
      </div>
    </div>
  );
}
