import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import GlassCard from '../Common/GlassCard';

export default function InsightCard({
  insight,
  index = 0,
  onExplore,
  className = '',
}) {
  if (!insight) return null;

  const { title, description, type = 'info', metric, score } = insight;

  // Determine styling based on insight type
  const getTypeConfig = () => {
    switch (type.toLowerCase()) {
      case 'warning':
        return {
          barColor: 'bg-amber-500',
          badgeBg: 'bg-amber-500/15',
          badgeText: 'text-amber-300',
          borderHover: 'hover:border-amber-500/40',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          pulse: true,
        };
      case 'critical':
        return {
          barColor: 'bg-rose-500',
          badgeBg: 'bg-rose-500/15',
          badgeText: 'text-rose-300',
          borderHover: 'hover:border-rose-500/40',
          icon: Flame,
          iconColor: 'text-rose-400',
          pulse: true,
        };
      case 'success':
        return {
          barColor: 'bg-emerald-500',
          badgeBg: 'bg-emerald-500/15',
          badgeText: 'text-emerald-300',
          borderHover: 'hover:border-emerald-500/40',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          pulse: false,
        };
      case 'info':
      default:
        return {
          barColor: 'bg-cyan-500',
          badgeBg: 'bg-cyan-500/15',
          badgeText: 'text-cyan-300',
          borderHover: 'hover:border-cyan-500/40',
          icon: Info,
          iconColor: 'text-cyan-400',
          pulse: false,
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={className}
    >
      <GlassCard
        hover
        className={`relative pl-5 pr-5 py-4 ${config.borderHover} transition-all`}
      >
        {/* Left colored bar indicator */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.barColor} ${
            config.pulse ? 'animate-pulse' : ''
          }`}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`p-1 rounded-md bg-white/5 ${config.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-sm font-semibold text-white tracking-tight">
                {title}
              </h4>
              {score && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}
                >
                  {score}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* AI Badge & Metric */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full shadow-glow-sm-purple">
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              AI Insight
            </span>
            {metric && (
              <span className="text-xs font-bold font-mono text-white bg-white/5 px-2 py-0.5 rounded-md">
                {metric}
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
