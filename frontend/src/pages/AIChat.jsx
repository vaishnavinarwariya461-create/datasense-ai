import React, { useState } from 'react';
import {
  Database,
  Table,
  Sparkles,
  Bot,
  HelpCircle,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Languages,
} from 'lucide-react';
import { useDataStore, DEMO_DATASET } from '../store/useDataStore';
import ChatInterface from '../components/AI/ChatInterface';
import DropZone from '../components/Upload/DropZone';
import TiltCard from '../components/3D/TiltCard';
import GlowOrb from '../components/3D/GlowOrb';

export default function AIChat() {
  const { currentDataset, datasets, setCurrentDataset, resetToDemo } = useDataStore();
  const [language, setLanguage] = useState('hinglish'); // 'hinglish' | 'english'

  const hinglishPrompts = [
    { text: 'Is data mein kya trend hai?', category: 'Trends', icon: '📈' },
    { text: 'Sabse zyada sale kab hue aur kis segment se?', category: 'Sales', icon: '💰' },
    { text: 'Koi anomaly ya fraud jaisa pattern hai kya?', category: 'Risk', icon: '⚠️' },
    { text: 'High churn wale customers ko kaise retain karein?', category: 'Retention', icon: '🛡️' },
    { text: 'Agley 6 mahine ka revenue forecast kya dikh raha hai?', category: 'Finance', icon: '📊' },
    { text: 'Support ticket aur customer churn ka kya correlation hai?', category: 'Support', icon: '🎯' },
  ];

  const englishPrompts = [
    { text: 'What trends do you see in customer lifetime value?', category: 'Trends', icon: '📈' },
    { text: 'When were sales highest and what drove the growth?', category: 'Sales', icon: '💰' },
    { text: 'Any anomalies or data quality issues exceeding 3σ?', category: 'Risk', icon: '⚠️' },
    { text: 'How can we reduce churn across high ticket accounts?', category: 'Retention', icon: '🛡️' },
    { text: 'Forecast revenue and customer growth for next 2 quarters', category: 'Finance', icon: '📊' },
    { text: 'Show statistical correlation between tickets and NPS', category: 'Support', icon: '🎯' },
  ];

  const activePrompts = language === 'hinglish' ? hinglishPrompts : englishPrompts;

  const handlePromptClick = (promptText) => {
    const event = new CustomEvent('datasense-send-query', { detail: promptText });
    window.dispatchEvent(event);
  };

  if (!currentDataset) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 text-center relative">
        <GlowOrb color="purple" size={400} top="-50px" left="50%" opacity={0.3} />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-glow-sm-purple relative z-10">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white text-gradient relative z-10">
          Chat with your Tabular Datasets (Hinglish + English)
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto relative z-10">
          Please upload a CSV or Excel dataset first so DataSense AI can extract schemas,
          compute metrics, and answer your quantitative questions.
        </p>

        <div className="relative z-10">
          <DropZone />
        </div>

        <button
          onClick={resetToDemo}
          className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold relative z-10"
        >
          Or chat with the demo SaaS 2024 dataset →
        </button>
      </div>
    );
  }

  const { name, rows, columns, columnStats = [] } = currentDataset;

  return (
    <div className="h-[calc(100vh-130px)] min-h-[640px] flex flex-col space-y-3 relative">
      <GlowOrb color="purple" size={400} top="-40px" right="-80px" opacity={0.25} />
      <GlowOrb color="cyan" size={350} bottom="40px" left="-70px" opacity={0.2} />

      {/* Top Context Subheader with Language Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#111118]/85 border border-white/10 text-xs backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="text-slate-400">Context:</span>
          <span className="font-bold text-white truncate max-w-xs">{name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-purple-300 font-mono font-semibold">{rows.toLocaleString()} rows</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300 font-mono font-semibold">{columns} columns</span>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            Language:
          </span>
          <div className="flex p-0.5 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setLanguage('hinglish')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                language === 'hinglish'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow-sm-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 Hinglish</span>
            </button>
            <button
              onClick={() => setLanguage('english')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                language === 'english'
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-glow-sm-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸 English</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Context Panel + Right Chat Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 relative z-10">
        {/* Left: 6 Sample Questions Grid + Schema */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-3 overflow-y-auto pr-1">
          {/* Sample Questions Grid: 6 cards with question + category tag */}
          <div className="p-4 rounded-2xl bg-[#111118]/90 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'hinglish' ? 'Suggested Sawal (Hinglish)' : 'Recommended Inquiries'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-purple-300">1-Click Ask</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activePrompts.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePromptClick(item.text)}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                      {item.category}
                    </span>
                    <span className="text-xs">{item.icon}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium leading-snug group-hover:text-cyan-300 transition-colors">
                    "{item.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column Schema Card */}
          <div className="p-4 rounded-2xl bg-[#111118]/90 border border-white/10 space-y-2 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Available Columns ({columnStats.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Schema Inferred</span>
            </div>

            <div className="space-y-1 overflow-y-auto pr-1 flex-1">
              {columnStats.map((col, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-200 text-[11px] truncate max-w-[130px]">
                    {col.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-purple-300">
                      {col.type}
                    </span>
                    {col.mean !== '-' && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        μ: {col.mean}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Full Chat Interface */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-0">
          <ChatInterface
            suggestedPrompts={activePrompts.map((p) => p.text)}
            language={language}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
