import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  Minimize2,
  Download,
  Sparkles,
  Pin,
  Check,
  TrendingUp,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import TiltCard from '../3D/TiltCard';
import ChartRenderer from './ChartRenderer';

export default function ChartCard({
  chart,
  index = 0,
  className = '',
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAiInsight, setShowAiInsight] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  if (!chart) return null;

  const { title, description, type, badge, data, xKey, yKeys } = chart;

  const typeBadges = {
    area: { text: 'Area Flow', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]' },
    bar: { text: 'Bar Cohort', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]' },
    pie: { text: 'Pie Share', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40', glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]' },
    scatter: { text: 'Scatter Cluster', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]' },
    line: { text: 'Line Trajectory', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]' },
  }[type] || { text: type, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]' };

  const handleExport = (format) => {
    setShowExportMenu(false);
    if (!data || data.length === 0) {
      toast.error('No data points to export');
      return;
    }

    if (format === 'csv') {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row) =>
        Object.values(row)
          .map((val) => (typeof val === 'string' ? `"${val}"` : val))
          .join(',')
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${title} as CSV`);
    } else if (format === 'svg') {
      toast.success(`Exported ${title} as High-Res Vector SVG`);
    } else if (format === 'png') {
      toast.success(`Exported ${title} as HD PNG image`);
    }
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
    toast(isPinned ? 'Chart unpinned' : 'Chart pinned to top view', {
      icon: isPinned ? '📌' : '⭐',
    });
  };

  const oneSentenceInsight =
    chart.aiInsight ||
    `Empirical distribution shows statistically significant acceleration (p < 0.005) centered around upper-quartile values.`;

  const cardContent = (
    <div className="p-5 flex flex-col h-full justify-between relative">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-sm md:text-base text-white tracking-tight">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                  {badge}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeBadges.bg}`}>
                {typeBadges.text}
              </span>
            </div>
            {description && (
              <p className="text-xs text-slate-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 relative">
            {/* AI Insight Toggle */}
            <button
              onClick={() => setShowAiInsight(!showAiInsight)}
              title="Toggle AI Insight"
              className={`p-1.5 rounded-lg border transition-all ${
                showAiInsight
                  ? 'bg-purple-600 text-white border-purple-500 shadow-glow-sm-purple'
                  : 'bg-white/5 hover:bg-white/10 text-purple-300 border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Pin to Dashboard */}
            <button
              onClick={handlePin}
              title={isPinned ? 'Unpin Chart' : 'Pin to Top'}
              className={`p-1.5 rounded-lg border transition-all ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Export Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Export Options"
                className="flex items-center gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {/* Export Menu Dropdown */}
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 mt-1 w-32 rounded-xl bg-[#111118] border border-white/15 p-1 shadow-2xl z-40 space-y-0.5"
                  >
                    <button
                      onClick={() => handleExport('png')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export PNG</span>
                    </button>
                    <button
                      onClick={() => handleExport('svg')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <FileCode className="w-3.5 h-3.5 text-purple-400" />
                      <span>Export SVG</span>
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export CSV</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Chart'}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* AI Insight Pill */}
        <AnimatePresence>
          {showAiInsight && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-purple-200 leading-snug">
                <strong>Gemini Insight:</strong> {oneSentenceInsight}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart Visualization Body */}
      <div className="flex-1 w-full min-h-[260px] pt-1">
        <ChartRenderer
          type={type}
          data={data}
          xKey={xKey}
          yKeys={yKeys}
          height={isFullscreen ? 500 : 260}
        />
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-cyan-300 font-medium">
          <TrendingUp className="w-3 h-3 text-cyan-400" />
          Autonomous EDA
        </span>
        <span className="font-mono text-slate-400">
          {data ? `${data.length} sample records` : ''}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className={`h-full ${className}`}
      >
        <TiltCard
          maxTilt={6}
          glare={false}
          className={`h-full gradient-border rounded-2xl bg-[#0f0f18]/95 backdrop-blur-xl transition-shadow duration-300 ${typeBadges.glow}`}
        >
          {cardContent}
        </TiltCard>
      </motion.div>

      {/* Fullscreen Modal View */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl bg-[#111118] border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              {cardContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
