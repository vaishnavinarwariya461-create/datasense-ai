import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileText,
  MessageSquareCode,
  Layers,
  Database,
  Check,
  ExternalLink,
  Flame,
  FileSpreadsheet,
  Table,
  Wand2,
  GitCompare,
  FileCode,
  CheckCircle2,
  Bot,
  Play,
  Heart,
} from 'lucide-react';
import ParticleBackground from '../components/3D/ParticleBackground';
import TiltCard from '../components/3D/TiltCard';
import GlowOrb from '../components/3D/GlowOrb';
import UPIModal from '../components/Monetization/UPIModal';
import { AdBanner } from '../components/Monetization/AdBanner';

export default function Home() {
  const navigate = useNavigate();
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [upiModal, setUpiModal] = useState({ open: false, plan: 'pro' });

  const showcaseFeatures = [
    {
      id: 'charts',
      name: 'Smart 3D Charts',
      desc: 'Area, Radial, Scatter, and Radar multi-variable graphs auto-generated from your schemas.',
      previewTag: '12+ Dynamic Engines',
      color: 'purple',
    },
    {
      id: 'insights',
      name: 'AI Statistical Insights',
      desc: 'Autonomous detection of correlations, momentum drivers, and risk blind spots.',
      previewTag: 'p < 0.001 Confidence',
      color: 'cyan',
    },
    {
      id: 'cleaning',
      name: 'Data Cleaning & Hygiene',
      desc: 'Automated deduplication, missing value imputation, and anomaly filtering.',
      previewTag: '98/100 Health Score',
      color: 'pink',
    },
    {
      id: 'pivot',
      name: 'Cross-Tab Pivot Tables',
      desc: 'Multi-dimensional heatmapped aggregations with instant Excel & CSV export.',
      previewTag: 'Dynamic Slicing',
      color: 'purple',
    },
    {
      id: 'reports',
      name: 'Executive PDF Dossiers',
      desc: 'Publication-ready boardroom briefs with embedded visualizations and strategic takeaways.',
      previewTag: '1-Click PDF',
      color: 'cyan',
    },
    {
      id: 'hinglish',
      name: 'Hinglish AI Copilot',
      desc: 'Converse in natural Hindi/English: "Is data mein sabse bada trend kya hai?".',
      previewTag: 'Dual Language',
      color: 'pink',
    },
    {
      id: 'whatif',
      name: 'What-If Simulation Studio',
      desc: 'Adjust price elasticity, retention intensity, and marketing CAC in real time.',
      previewTag: 'Monte Carlo Math',
      color: 'purple',
    },
    {
      id: 'anomaly',
      name: 'Statistical Anomaly Radar',
      desc: 'Identifies multi-standard deviation outliers before they corrupt ML pipelines.',
      previewTag: 'Outlier Registry',
      color: 'cyan',
    },
  ];

  const dataTypes = [
    { name: 'Sales Data', emoji: '🛒', color: 'from-purple-500 to-indigo-500' },
    { name: 'Loan Portfolio', emoji: '💳', color: 'from-cyan-500 to-blue-500' },
    { name: 'HR Analytics', emoji: '👥', color: 'from-pink-500 to-rose-500' },
    { name: 'Finance & P&L', emoji: '💵', color: 'from-amber-500 to-yellow-500' },
    { name: 'E-commerce Baskets', emoji: '🛍️', color: 'from-purple-500 to-pink-500' },
    { name: 'Marketing Ads', emoji: '📣', color: 'from-teal-500 to-cyan-500' },
    { name: 'Inventory & Supply', emoji: '📦', color: 'from-emerald-500 to-teal-500' },
    { name: 'Student Records', emoji: '🎓', color: 'from-indigo-500 to-purple-500' },
    { name: 'Hospital Patients', emoji: '🏥', color: 'from-rose-500 to-pink-500' },
    { name: 'Real Estate Valuation', emoji: '🏙️', color: 'from-blue-500 to-indigo-500' },
    { name: 'Stock Market', emoji: '📈', color: 'from-green-500 to-emerald-500' },
    { name: 'Crypto Assets', emoji: '🪙', color: 'from-amber-500 to-orange-500' },
  ];

  const pricingPlans = [
    {
      name: 'Free / Community',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for students, individual analysts & quick dataset audits.',
      features: [
        'Up to 10MB CSV / Excel uploads',
        'Automated EDA & schema profiling',
        'Standard 2D & 3D charts',
        'Hinglish AI chat copilot',
        'Data hygiene audit score',
      ],
      cta: 'Free Mein Shuru Karo',
      style: 'border border-cyan-500/30 bg-[#0f0f18]/90',
      btnStyle: 'bg-white/10 hover:bg-white/20 text-white',
      glow: 'neon-cyan',
    },
    {
      name: 'Pro Analyst',
      price: '$19',
      period: 'per month',
      desc: 'The complete Gen-Z intelligence toolkit for fast-growing data teams.',
      features: [
        'Up to 500MB dataset uploads',
        'Full What-If sensitivity simulator',
        'Unlimited PDF executive dossiers',
        'Automated data cleaning & deduplication',
        'Advanced 12+ chart gallery',
        'Gemini 1.5 Pro deep reasoning',
      ],
      popular: true,
      cta: 'Pro Trial Launch Karo',
      style: 'border border-purple-500/50 bg-gradient-to-b from-purple-950/40 via-[#111118] to-[#0d0d16]',
      btnStyle: 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-glow-purple',
      glow: 'neon-purple',
    },
    {
      name: 'Enterprise Studio',
      price: '$99',
      period: 'per seat / mo',
      desc: 'Dedicated high-security pipelines for business intelligence departments.',
      features: [
        'Unlimited multi-gigabyte uploads',
        'Custom domain white-labeling',
        'Live SQL & Snowflake connectors',
        'SOC2 & GDPR enterprise compliance',
        '24/7 dedicated data scientist support',
      ],
      cta: 'Sales Se Baat Karo',
      style: 'border border-amber-500/40 bg-[#0f0f18]/90',
      btnStyle: 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white',
      glow: 'text-gradient-gold',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* UPI Payment Modal */}
      <UPIModal open={upiModal.open} plan={upiModal.plan} onClose={() => setUpiModal({ open: false, plan: 'pro' })} />

      {/* 3D Particle Canvas Background */}
      <ParticleBackground opacity={0.35} />

      {/* Decorative Glow Orbs */}
      <GlowOrb color="purple" size={550} top="-100px" left="50%" position={{ top: '-100px', left: '25%' }} opacity={0.35} delay={0} />
      <GlowOrb color="cyan" size={450} top="25%" right="-100px" opacity={0.3} delay={2} />
      <GlowOrb color="pink" size={400} top="55%" left="-80px" opacity={0.25} delay={3} />
      <GlowOrb color="purple" size={500} bottom="5%" right="-60px" opacity={0.3} delay={1} />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl animated-gradient-bg p-0.5 shadow-glow-sm-purple group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d0d16] rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-cyan-400 group-hover:text-pink-400 transition-colors animate-pulse" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gradient">
            DataSense<span className="text-white ml-0.5 font-black">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
          <a href="#bento" className="hover:text-cyan-400 transition-colors">Bento Features</a>
          <a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a>
          <a href="#showcase" className="hover:text-pink-400 transition-colors">Showcase</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:opacity-95 shadow-glow-sm-purple transition-all flex items-center gap-2 group"
          >
            <span>Dashboard Kholo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="relative z-10 pt-16 pb-20 px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-glow-sm-purple backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Gen-Z 3D Autonomous Data Intelligence</span>
            <span className="text-white/30">•</span>
            <span className="text-pink-300">Google Gemini AI</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] max-w-5xl mx-auto">
            DATA KA BOSS <br />
            <span className="text-gradient drop-shadow-[0_0_35px_rgba(139,92,246,0.5)]">
              BAN JAO
            </span>{' '}
            <span className="inline-block animate-bounce">🔥</span>
          </h1>

          {/* Subtitle in Hinglish */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Apna data upload karo, AI sab samjha dega — charts, insights, predictions sab kuch!
          </p>

          {/* Two CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 rounded-2xl text-sm sm:text-base font-black text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:opacity-95 shadow-glow-purple flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 group"
            >
              <span>Free Mein Try Karo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/analysis')}
              className="px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/20 backdrop-blur-xl transition-all flex items-center gap-2 hover:border-cyan-500/50"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Live Demo Dekho</span>
            </button>
          </div>

          {/* Floating 3D Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pt-10 max-w-4xl mx-auto"
          >
            <TiltCard maxTilt={10} glare={true} className="p-[1px] gradient-border rounded-3xl shadow-[0_20px_70px_rgba(139,92,246,0.35)]">
              <div className="rounded-3xl bg-[#0e0e17]/95 p-5 sm:p-7 text-left space-y-4">
                {/* Fake browser bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-xs text-slate-400 font-mono">
                      datasense.ai/workspace • Global_SaaS_2024.csv
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    AI Auto-Profiling Complete
                  </span>
                </div>

                {/* Grid inside mockup */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Total Observations</span>
                    <div className="text-2xl font-black font-mono text-white">4,850</div>
                    <span className="text-[11px] text-emerald-400 font-semibold">+100% Ingested</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">DataSense Score™</span>
                    <div className="text-2xl font-black font-mono text-cyan-300">88 / 100</div>
                    <span className="text-[11px] text-purple-300 font-semibold">Zero schema errors</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Growth Signal</span>
                    <div className="text-2xl font-black font-mono text-pink-400">+28.4% LTV</div>
                    <span className="text-[11px] text-slate-400 font-semibold">Enterprise accounts</span>
                  </div>
                </div>

                {/* Fake chart visualization row */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white">Monthly ARR Trajectory</span>
                    <p className="text-[11px] text-slate-400">Continuous quarter-over-quarter expansion detected</p>
                  </div>
                  {/* Mini CSS Bar Chart Preview */}
                  <div className="flex items-end gap-1.5 h-10">
                    <div className="w-2.5 bg-purple-500/40 rounded-t h-4" />
                    <div className="w-2.5 bg-purple-500/60 rounded-t h-6" />
                    <div className="w-2.5 bg-cyan-500/60 rounded-t h-7" />
                    <div className="w-2.5 bg-cyan-500/80 rounded-t h-9" />
                    <div className="w-2.5 bg-gradient-to-t from-pink-500 to-purple-500 rounded-t h-10 shadow-glow-sm-purple" />
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Stats Row */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-white/10">
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white">50K+</div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Active Users</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-gradient">1M+</div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Datasets Analyzed</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400">99.9%</div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Uptime Reliability</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-pink-400">&lt; 3s</div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Synthesis Speed</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2: Bento Feature Grid */}
      <section id="bento" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
            Next-Gen Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Supercharged Bento Grid
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Everything you need to transform numbers into boardroom clarity in milliseconds.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Card 1 (Large 2 Cols): AI Chat with animated typing */}
          <TiltCard glare maxTilt={10} className="md:col-span-2 p-6 bg-[#111118]/90 border border-purple-500/30 neon-purple flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white">AI Copilot Chat (Hinglish + Eng)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Converse directly with your tabular datasets. Ask nuanced questions in plain Hinglish or English.
              </p>
            </div>

            {/* Chat preview bubble */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-200">
                  <span>🇮🇳 User:</span> "Sabse zyada churn risk kis cohort mein hai?"
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-900/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>DataSense:</strong> Monthly starter accounts with &gt;5 support tickets show <strong>14.2% churn risk</strong>.
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: DataSense Score with Circular Gauge */}
          <TiltCard glare maxTilt={12} className="md:col-span-1 p-6 bg-[#111118]/90 border border-cyan-500/30 neon-cyan flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Audit Score</span>
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="py-3 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#252538" strokeWidth="8" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray="251"
                    strokeDashoffset="30"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-white">88</span>
                  <span className="text-[9px] uppercase font-bold text-cyan-400">Health</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Autonomous completeness, uniqueness & validity audit.
            </p>
          </TiltCard>

          {/* Card 3: 12+ Chart Types with Mini Preview */}
          <TiltCard glare maxTilt={12} className="md:col-span-1 p-6 bg-[#111118]/90 border border-pink-500/30 neon-pink flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Visual Engine</span>
              <BarChart3 className="w-5 h-5 text-pink-400" />
            </div>

            <div>
              <div className="text-3xl font-black font-mono text-white">12+</div>
              <p className="text-xs font-bold text-pink-300 mt-1">Multi-variable Chart Types</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {['Area', 'Radar', 'Scatter', 'Pie', 'Bar'].map((t, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              SVG/PNG export with custom color ramps.
            </p>
          </TiltCard>

          {/* Card 4 (Large 2 Cols): What-If Simulator Preview */}
          <TiltCard glare maxTilt={10} className="md:col-span-2 p-6 bg-[#111118]/90 border border-purple-500/30 neon-purple flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">What-If Sensitivity Simulation</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                Monte Carlo
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Move sensitivity sliders dynamically to forecast revenue impact and churn trajectories in real time.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Simulated Price Lift: +10%</span>
                <span className="font-mono font-bold text-emerald-400">+$485k ARR</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full w-[65%]" />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Calculates churn impact vs elasticity dynamically.
              </span>
            </div>
          </TiltCard>

          {/* Card 5: Hinglish Support Badge */}
          <TiltCard glare maxTilt={12} className="md:col-span-1 p-6 bg-[#111118]/90 border border-white/10 flex flex-col justify-between">
            <div className="text-3xl mb-2">🇮🇳</div>
            <div>
              <h3 className="font-bold text-base text-white">100% Hinglish Ready</h3>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Apni bhasha mein sawaal pucho, AI instant insights dega.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mt-3 block">
              Native Localization
            </span>
          </TiltCard>

          {/* Card 6: PDF Reports */}
          <TiltCard glare maxTilt={12} className="md:col-span-1 p-6 bg-[#111118]/90 border border-white/10 flex flex-col justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Executive Reports</h3>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Board-ready PDF dossiers and technical audits in 1-click.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mt-3 block">
              Printable Format
            </span>
          </TiltCard>

          {/* Card 7: Excel/CSV/JSON Support */}
          <TiltCard glare maxTilt={12} className="md:col-span-1 p-6 bg-[#111118]/90 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <FileCode className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">CSV, Excel & JSON</h3>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Drag and drop client-side ingestion with zero server upload leaks.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mt-3 block">
              Client Parsed
            </span>
          </TiltCard>

          {/* Card 8 (Large 3 Cols): Real-time analysis animation */}
          <TiltCard glare maxTilt={8} className="md:col-span-3 p-6 bg-[#111118]/90 border border-cyan-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <h3 className="font-bold text-sm text-white">Autonomous Telemetry Engine</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Engine Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Inferred Types</span>
                <p className="text-xs font-bold text-white mt-1">14 Features Normalized</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Outliers Identified</span>
                <p className="text-xs font-bold text-rose-400 mt-1">4 Anomaly Records (&gt;3σ)</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Regression Confidence</span>
                <p className="text-xs font-bold text-cyan-300 mt-1">p &lt; 0.0001 (High)</p>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Section 3: Supported Data Types (Horizontal Scroll Tags) */}
      <section className="py-14 px-6 max-w-7xl mx-auto relative z-10 border-t border-b border-white/5">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            Works with any industry
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Supported Tabular Data Domains
          </h2>
        </div>

        {/* Horizontal scrollable pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {dataTypes.map((dt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 shrink-0 transition-all cursor-pointer group"
            >
              <span className="text-lg group-hover:scale-125 transition-transform">{dt.emoji}</span>
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {dt.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
            Simple 3-Step Journey
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            How DataSense AI Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <TiltCard glare className="p-8 bg-[#111118]/90 border border-white/10 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black font-mono mb-6 shadow-glow-sm-purple group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Karo</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Drag and drop your CSV, Excel, or JSON datasets into our secure browser parser. Zero manual setup needed.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-purple-300 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instant Ingestion</span>
            </div>
          </TiltCard>

          {/* Step 2 */}
          <TiltCard glare className="p-8 bg-[#111118]/90 border border-cyan-500/30 neon-cyan flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-600 flex items-center justify-center text-white text-xl font-black font-mono mb-6 shadow-glow-sm-cyan group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Analyze Karega</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Gemini AI computes correlations, identifies outliers, scores health, and builds dynamic chart models.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-300 font-semibold">
              <BrainCircuit className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Neural Modeling</span>
            </div>
          </TiltCard>

          {/* Step 3 */}
          <TiltCard glare className="p-8 bg-[#111118]/90 border border-pink-500/30 neon-pink flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white text-xl font-black font-mono mb-6 shadow-glow-sm-purple group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Insights Lo, Decisions Lo</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Chat interactively, simulate what-if scenarios, and export publication-ready PDF briefs for your team.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-pink-300 font-semibold">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span>Executive Delivery</span>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Section 5: Feature Showcase (Hover preview) */}
      <section id="showcase" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">
            Feature Showcase
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Engineered for Precision
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive list */}
          <div className="lg:col-span-5 space-y-2">
            {showcaseFeatures.map((feat, idx) => (
              <div
                key={feat.id}
                onMouseEnter={() => setActiveFeatureIndex(idx)}
                onClick={() => setActiveFeatureIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeFeatureIndex === idx
                    ? 'bg-purple-900/25 border-purple-500/60 shadow-glow-sm-purple text-white translate-x-2'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold">{feat.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{feat.desc}</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-cyan-300 shrink-0">
                  {feat.previewTag}
                </span>
              </div>
            ))}
          </div>

          {/* Right: Active Preview Card */}
          <div className="lg:col-span-7">
            <TiltCard glare maxTilt={10} className="p-8 bg-[#111118]/95 border border-purple-500/40 rounded-3xl min-h-[380px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Active Feature Preview
                  </span>
                  <span className="text-xs text-cyan-400 font-mono">
                    {showcaseFeatures[activeFeatureIndex].previewTag}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                  {showcaseFeatures[activeFeatureIndex].name}
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mb-8">
                  {showcaseFeatures[activeFeatureIndex].desc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Ready to explore in live workspace?</span>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 shadow-glow-sm-purple hover:opacity-95 transition-all"
                >
                  <span>Launch in App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Section 6: Pricing Bento */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
            Fair & Transparent
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Pricing Bento
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Choose the plan that fits your growth pace. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <TiltCard
              key={idx}
              glare
              maxTilt={12}
              className={`p-8 rounded-3xl flex flex-col justify-between relative ${plan.style} ${plan.glow}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3.5 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[11px] font-black rounded-full shadow-glow-sm-purple">
                  MOST POPULAR 🔥
                </div>
              )}

              <div>
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6">{plan.desc}</p>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl font-black text-white font-mono">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (plan.price === '$0') {
                    navigate('/login');
                  } else if (plan.name.includes('Enterprise')) {
                    window.open('https://www.linkedin.com/in/neeraj-narwariya-45a39b349', '_blank');
                  } else {
                    setUpiModal({ open: true, plan: plan.popular ? 'pro' : 'team' });
                  }
                }}
                className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all ${plan.btnStyle}`}
              >
                {plan.cta}
              </button>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Section 7: Free vs Paid Comparison — Crystal Clear */}
      <section id="free-vs-paid" className="py-20 px-6 max-w-6xl mx-auto relative z-10 border-t border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">Transparent Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
            Free Mein Kya Milta Hai? 🤔
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Koi hidden charge nahi • Koi surprise nahi • Jo free hai woh hamesha free rahega ✅
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* FREE Column */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🆓</span>
              <div>
                <h3 className="text-white font-black text-xl">FREE — Hamesha ke liye</h3>
                <p className="text-emerald-400 text-xs font-semibold">$0 / ₹0 — Koi credit card nahi</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                ['CSV / Excel file upload', 'Up to 10MB'],
                ['Auto EDA — schema profiling', 'Full access'],
                ['DataSense Score™', 'Full access'],
                ['Basic Charts', 'Bar, Line, Pie, Area, Scatter'],
                ['AI Chat (Gemini)', '10 questions/day'],
                ['Data preview table', '100 rows'],
                ['Dataset Templates', '3 sample datasets'],
                ['Hinglish + English support', 'Full access'],
                ['No login required', 'Direct access'],
              ].map(([feat, detail], i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✅</span>
                    <span className="text-sm text-slate-200">{feat}</span>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRO Column */}
          <div className="rounded-2xl border-2 border-purple-500/50 bg-gradient-to-b from-purple-950/30 to-transparent p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full">
              MOST POPULAR 🔥
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-white font-black text-xl">PRO — Analyst Mode</h3>
                <p className="text-purple-400 text-xs font-semibold">₹1,599/month • UPI se pay karo</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                ['Everything in Free', '+'],
                ['File upload limit', 'Up to 500MB'],
                ['All 12+ Chart types', 'Radar, Heatmap, Treemap…'],
                ['AI Chat (Gemini)', 'Unlimited'],
                ['Data Cleaner', 'Full auto-fix'],
                ['Pivot Table Builder', 'Drag & drop'],
                ['What-If Studio', 'AI scenario sim'],
                ['PDF Report generation', 'Executive quality'],
                ['All 16 Templates', 'Sales, Loan, HR…'],
                ['Compare 2 Datasets', 'AI winner analysis'],
                ['Priority support', 'LinkedIn direct'],
              ].map(([feat, detail], i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-sm">{i === 0 ? '✅' : '🚀'}</span>
                    <span className={`text-sm ${i === 0 ? 'text-purple-300 font-semibold' : 'text-slate-200'}`}>{feat}</span>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{detail}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setUpiModal({ open: true, plan: 'pro' })}
              className="w-full mt-6 py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:opacity-90 transition-opacity shadow-lg"
            >
              🚀 Pro Upgrade — ₹1,599/mo via UPI
            </button>
          </div>
        </div>

        {/* Important Notice Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-2xl shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-amber-300 font-bold text-sm mb-1">Important Notice — Please Read</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Free plan features (marked ✅ above) are always available without payment.
              Pro features (marked 🚀) require monthly subscription.
              <strong className="text-white"> Upgrade ke baad screenshot bhejo LinkedIn pe</strong> —
              24 hours mein activate ho jayega.
              Koi refund complaint accept nahi hogi — pay karne se pehle features check kar lo.
            </p>
          </div>
          <a
            href="https://www.linkedin.com/in/neeraj-narwariya-45a39b349"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-2 rounded-xl transition-colors"
          >
            Contact on LinkedIn →
          </a>
        </div>
      </section>

      {/* Section 8: Styled Ad Banner */}
      <section className="py-8 px-6 max-w-5xl mx-auto relative z-10">
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-cyan-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-glow-sm-purple">
              FEATURED
            </span>
            <p className="text-xs text-slate-200">
              Powered by Google Gemini AI • Autonomous statistical discovery without prompts.
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-chat')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0"
          >
            <span>Try AI Copilot</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 max-w-7xl mx-auto relative z-10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <span className="text-white font-extrabold text-sm">DataSense AI</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 inline text-pink-500 fill-pink-500 mx-0.5" /> by{' '}
            <a
              href="https://www.linkedin.com/in/neeraj-narwariya-45a39b349"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors ml-0.5"
            >
              Neeraj Narwariya
            </a>
          </span>
        </div>

        <div className="flex items-center gap-5 flex-wrap justify-center">
          <a href="#bento" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link to="/templates" className="hover:text-white transition-colors">Templates</Link>
          <a
            href="https://www.linkedin.com/in/neeraj-narwariya-45a39b349"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
