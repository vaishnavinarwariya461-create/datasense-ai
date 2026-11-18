import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import TiltCard from '../3D/TiltCard';

function Counter({ value }) {
  // Extract number and affix if numeric
  const match = String(value).match(/^([^0-9.-]*)([0-9.,]+)(.*)$/);
  if (!match) return <span>{value}</span>;

  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';
  const targetNum = parseFloat(numStr);

  if (isNaN(targetNum)) return <span>{value}</span>;

  const isDecimal = numStr.includes('.');
  const decimalPlaces = isDecimal ? numStr.split('.')[1].length : 0;

  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    const formatted = current.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    spring.set(targetNum);
  }, [targetNum, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel = 'vs benchmark',
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  color = 'purple', // 'purple' | 'cyan' | 'pink' | 'emerald'
  delay = 0,
}) {
  const isGood = trendDirection === 'up';
  const isBad = trendDirection === 'down';
  const isNeutral = trendDirection === 'neutral';

  const glowClass = isGood
    ? 'shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)] border-emerald-500/30'
    : isBad
    ? 'shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_35px_rgba(244,63,94,0.45)] border-rose-500/30'
    : 'shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.45)] border-purple-500/30';

  const iconGradients = {
    purple: 'from-purple-600 via-indigo-600 to-purple-400 text-purple-200',
    cyan: 'from-cyan-500 via-teal-500 to-cyan-300 text-cyan-200',
    emerald: 'from-emerald-500 via-teal-500 to-emerald-300 text-emerald-200',
    pink: 'from-pink-500 via-rose-500 to-pink-300 text-pink-200',
  }[color] || 'from-purple-600 via-indigo-600 to-purple-400 text-purple-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <TiltCard
        maxTilt={12}
        glare={true}
        className={`p-[1px] rounded-2xl bg-gradient-to-br from-white/10 via-purple-500/20 to-cyan-500/20 transition-all duration-300 ${glowClass}`}
      >
        <div className="relative p-5 rounded-2xl bg-[#0f0f18]/95 backdrop-blur-xl h-full flex flex-col justify-between overflow-hidden group">
          {/* Shimmer background on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shimmer" />

          {/* Top Row: Label & Large Gradient Icon */}
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {label}
              </span>
              <div className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight mt-1">
                <Counter value={value} />
              </div>
            </div>

            {Icon && (
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`p-3 rounded-2xl bg-gradient-to-tr ${iconGradients} shadow-md shrink-0`}
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </div>

          {/* Bottom Row: Animated Trend indicator */}
          {trend && (
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg font-bold text-[11px] font-mono ${
                    isNeutral
                      ? 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                      : isGood
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  <motion.span
                    animate={isGood ? { y: [-1, 1, -1] } : isBad ? { y: [1, -1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {isNeutral ? (
                      <Minus className="w-3 h-3" />
                    ) : isGood ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                  </motion.span>
                  {trend}
                </span>
                <span className="text-slate-400 text-[11px] truncate">{trendLabel}</span>
              </div>
            </div>
          )}
        </div>
      </TiltCard>
    </motion.div>
  );
}
