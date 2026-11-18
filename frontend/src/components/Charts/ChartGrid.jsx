import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Layers } from 'lucide-react';
import ChartCard from './ChartCard';

export default function ChartGrid({ charts = [], className = '' }) {
  const [filterType, setFilterType] = useState('all');

  if (!charts || charts.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-slate-500">
        <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
        <p className="text-sm font-medium">No visualizations generated yet.</p>
        <p className="text-xs text-slate-400 mt-1">Upload a dataset to unlock automated EDA charts.</p>
      </div>
    );
  }

  const filteredCharts = charts.filter((c) => {
    if (filterType === 'all') return true;
    return c.type.toLowerCase() === filterType;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Filter Strip */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Automated Visualizations
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
            {filteredCharts.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
          {['all', 'area', 'bar', 'pie', 'scatter'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg capitalize transition-all font-medium ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-glow-sm-purple'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of ChartCards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCharts.map((chart, index) => (
          <ChartCard key={chart.id || index} chart={chart} index={index} />
        ))}
      </div>
    </div>
  );
}
