import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Database,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  Sparkles,
  Layers,
  Upload,
  ArrowRight,
  TrendingUp,
  MessageSquareCode,
  FileText,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Share2,
  Wand2,
  Clock,
  Check,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDataStore, DEMO_DATASET } from '../store/useDataStore';
import StatCard from '../components/Dashboard/StatCard';
import DataHealth from '../components/Dashboard/DataHealth';
import InsightCard from '../components/Dashboard/InsightCard';
import ChartGrid from '../components/Charts/ChartGrid';
import DropZone from '../components/Upload/DropZone';
import ParticleBackground from '../components/3D/ParticleBackground';
import GlowOrb from '../components/3D/GlowOrb';
import TiltCard from '../components/3D/TiltCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentDataset, datasets, setCurrentDataset, resetToDemo } = useDataStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    toast.success('Live Dashboard link copied to clipboard!');
    setTimeout(() => setShared(false), 2000);
  };

  // If no dataset is loaded, display onboarding and DropZone
  if (!currentDataset) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 relative">
        <ParticleBackground opacity={0.4} />
        <GlowOrb color="purple" size={400} top="-50px" left="50%" opacity={0.3} />

        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step 1: Ingest Dataset</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white text-gradient">
            Welcome to DataSense AI Studio
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Upload your CSV or Excel dataset to automatically initiate schema discovery,
            statistical distribution profiling, and AI narrative synthesis.
          </p>
        </div>

        <div className="relative z-10">
          <DropZone onUploadSuccess={() => toast.success('Dashboard ready!')} />
        </div>

        <div className="text-center pt-2 relative z-10">
          <button
            onClick={resetToDemo}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold"
          >
            Or load the Global SaaS 2024 benchmark dataset with 1-click →
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    rows = 0,
    columns = 0,
    healthScore,
    insights = [],
    charts = [],
    narrativeStory,
    keyStats,
  } = currentDataset;

  const recentDatasets = [
    { name: 'Global_SaaS_Revenue_2024.csv', rows: '4,850', time: 'Active now', active: true },
    { name: 'D2C_Ecommerce_Baskets.csv', rows: '12,400', time: 'Yesterday', active: false },
    { name: 'Fintech_Credit_Risk.csv', rows: '8,200', time: '3 days ago', active: false },
  ];

  return (
    <div className="space-y-8 pb-16 relative">
      {/* 3D Background elements */}
      <ParticleBackground opacity={0.25} />
      <GlowOrb color="purple" size={450} top="-60px" right="-100px" opacity={0.3} delay={0} />
      <GlowOrb color="cyan" size={400} top="30%" left="-120px" opacity={0.25} delay={2} />
      <GlowOrb color="pink" size={350} bottom="10%" right="-80px" opacity={0.2} delay={4} />

      {/* Top Banner: Dataset Selector & Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#111118]/85 border border-white/10 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-glow-sm-purple">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                Live Dataset
              </span>
              <span className="text-sm font-extrabold text-white max-w-xs md:max-w-md truncate">
                {name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {rows.toLocaleString()} records • {columns} variables • Autonomous Engine Synced
            </p>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-glow-sm-purple transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>

          <button
            onClick={() => navigate('/cleaner')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Clean Data</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shared ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={() => {
              resetToDemo();
              toast.success('Reset to Demo benchmark dataset');
            }}
            title="Reset to Demo"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Upload Drawer / Toggle */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-6 rounded-3xl bg-[#111118] border border-purple-500/40 shadow-2xl space-y-4 relative z-20"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Upload Additional Dataset</h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <DropZone
            onUploadSuccess={() => {
              setShowUploadModal(false);
              toast.success('New dataset loaded into dashboard');
            }}
          />
        </motion.div>
      )}

      {/* AI Daily Digest (Gemini 3-bullet points) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-cyan-950/30 border border-purple-500/30 relative z-10 shadow-lg"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Gemini AI Daily Digest • Executive Pulse
            </h3>
          </div>
          <span className="text-[10px] font-mono text-purple-300">Live AI Synthesis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-300">📈 Revenue Momentum</span>
            <p className="text-slate-200 leading-snug">
              Enterprise Tier MRR increased <strong>+18.5% MoM</strong> with a record-high 98.4% customer retention rate.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">⚠️ Risk Vulnerability</span>
            <p className="text-slate-200 leading-snug">
              <strong>14.2% Churn vulnerability</strong> detected in accounts with &gt;5 unresolved support tickets.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">🧹 Hygiene Opportunity</span>
            <p className="text-slate-200 leading-snug">
              Imputing 27 missing NPS values will elevate your <strong>Health Score from 88 to 98/100</strong>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top: 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <StatCard
          icon={FileSpreadsheet}
          label="Total Records"
          value={rows.toLocaleString()}
          trend="+100%"
          trendLabel="Ingested rows"
          trendDirection="up"
          color="purple"
          delay={0.1}
        />
        <StatCard
          icon={Layers}
          label="Feature Dimensions"
          value={columns}
          trend={`${columns} cols`}
          trendLabel="Derivation ready"
          trendDirection="neutral"
          color="cyan"
          delay={0.15}
        />
        <StatCard
          icon={AlertCircle}
          label="Missing Values"
          value={`${keyStats?.missingValuesPct ?? 1.28}%`}
          trend="-0.4%"
          trendLabel="Better than avg"
          trendDirection="up"
          color="emerald"
          delay={0.2}
        />
        <StatCard
          icon={Copy}
          label="Duplicate Ratio"
          value={`${keyStats?.duplicateRowsPct ?? 0.16}%`}
          trend="0.16%"
          trendLabel="Near-zero entropy"
          trendDirection="up"
          color="pink"
          delay={0.25}
        />
      </div>

      {/* Middle Row: Health Score & Narrative AI 'Your Data Story' + Recent Datasets Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* DataHealth Score Ring with NEW badge */}
        <div className="lg:col-span-4 flex flex-col">
          <TiltCard glare className="h-full bg-[#111118]/90 border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  DataSense Score™
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-glow-sm-purple animate-pulse">
                  NEW AUDIT
                </span>
              </div>
              <DataHealth healthScore={healthScore} />
            </div>
          </TiltCard>
        </div>

        {/* Narrative AI: Your Data Story */}
        <div className="lg:col-span-5 flex flex-col">
          <TiltCard glare className="p-6 h-full bg-[#111118]/90 border border-purple-500/30 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 text-white">
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Your Data Story
                    </h3>
                    <p className="text-[11px] text-purple-300 font-medium">
                      Gemini Autonomous Narrative
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Key Narrative
                </span>
              </div>

              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                {narrativeStory}
              </p>

              {/* Key Takeaways Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Highest Momentum
                  </span>
                  <p className="text-xs font-semibold text-white">
                    Enterprise Tier Accounts (+28.4% LTV)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    Immediate Action
                  </span>
                  <p className="text-xs font-semibold text-white">
                    Engage 5+ Ticket Accounts Before Day 45
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Want deeper answers?
              </span>
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Ask AI Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </TiltCard>
        </div>

        {/* Recent Datasets Sidebar Panel on Right */}
        <div className="lg:col-span-3 flex flex-col">
          <TiltCard glare className="p-5 h-full bg-[#111118]/90 border border-white/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Datasets
                </h4>
              </div>

              <div className="space-y-2">
                {recentDatasets.map((ds, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      ds.active
                        ? 'bg-purple-900/20 border-purple-500/40 text-white'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate max-w-[140px]">{ds.name}</span>
                      {ds.active && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{ds.rows} rows</span>
                      <span>{ds.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/templates')}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-center"
            >
              Browse 8+ Templates →
            </button>
          </TiltCard>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Signals & Insights ({insights.length})
            </h3>
          </div>
          <button
            onClick={() => navigate('/analysis')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
          >
            <span>View Full Statistical Matrix</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <InsightCard key={insight.id || idx} insight={insight} index={idx} />
          ))}
        </div>
      </div>

      {/* ChartGrid with Auto-Generated Visualizations */}
      <div className="space-y-4 pt-2 relative z-10">
        <ChartGrid charts={charts} />
      </div>

      {/* Bottom Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 relative z-10">
        <TiltCard
          glare
          onClick={() => navigate('/whatif')}
          className="p-5 flex items-center gap-4 cursor-pointer bg-[#111118]/90 border border-white/10 hover:border-purple-500/40 transition-colors"
        >
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">What-If Studio</h4>
            <p className="text-xs text-slate-400">Simulate pricing & retention levers</p>
          </div>
        </TiltCard>

        <TiltCard
          glare
          onClick={() => navigate('/chat')}
          className="p-5 flex items-center gap-4 cursor-pointer bg-[#111118]/90 border border-white/10 hover:border-cyan-500/40 transition-colors"
        >
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">AI Copilot Chat (Hinglish)</h4>
            <p className="text-xs text-slate-400">Ask questions in Hindi / English</p>
          </div>
        </TiltCard>

        <TiltCard
          glare
          onClick={() => navigate('/reports')}
          className="p-5 flex items-center gap-4 cursor-pointer bg-[#111118]/90 border border-white/10 hover:border-emerald-500/40 transition-colors"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Executive Dossier</h4>
            <p className="text-xs text-slate-400">Export publication-ready PDF briefs</p>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
