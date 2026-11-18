import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import GlassCard from '../Common/GlassCard';

export default function DataHealth({ healthScore, className = '' }) {
  const overall = healthScore?.overall ?? 85;
  const status = healthScore?.status || (overall > 70 ? 'Optimal Integrity' : overall > 40 ? 'Fair Quality' : 'Severe Issues');
  
  const completeness = healthScore?.completeness ?? 92;
  const consistency = healthScore?.consistency ?? 86;
  const uniqueness = healthScore?.uniqueness ?? 94;
  const validity = healthScore?.validity ?? 88;

  // Determine color scheme based on score
  const getScoreTheme = (score) => {
    if (score >= 70) {
      return {
        text: 'text-emerald-400',
        stroke: '#10b981',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        label: 'Optimal Health',
      };
    }
    if (score >= 40) {
      return {
        text: 'text-amber-400',
        stroke: '#f59e0b',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        label: 'Needs Review',
      };
    }
    return {
      text: 'text-rose-400',
      stroke: '#f43f5e',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      label: 'Critical Flaws',
    };
  };

  const theme = getScoreTheme(overall);

  // Circular ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  const metrics = [
    { label: 'Completeness', value: completeness, desc: 'Zero nulls & missing ratios' },
    { label: 'Consistency', value: consistency, desc: 'Uniform formats & type bounds' },
    { label: 'Uniqueness', value: uniqueness, desc: 'Deduplicated record ratios' },
    { label: 'Validity', value: validity, desc: 'Rule conformances & schema' },
  ];

  return (
    <GlassCard hover={false} className={`p-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              DataSense Score™
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${theme.bg} ${theme.text} border ${theme.border}`}>
                {status}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Automated dataset hygiene & integrity index</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Circular SVG Score Ring */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
              {/* Background Ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-white/10"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`text-3xl font-black font-mono tracking-tight ${theme.text}`}
              >
                {overall}
              </motion.span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                out of 100
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-300 font-medium mt-2">
            Dataset Reliability Index
          </span>
        </div>

        {/* Right: Breakdown Progress Bars */}
        <div className="md:col-span-7 space-y-3.5">
          {metrics.map((m, idx) => (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-200">{m.label}</span>
                <span className="font-mono font-semibold text-slate-300">{m.value}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    m.value >= 90
                      ? 'bg-emerald-400'
                      : m.value >= 75
                      ? 'bg-cyan-400'
                      : 'bg-amber-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * idx }}
                />
              </div>
              <p className="text-[10px] text-slate-300">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
