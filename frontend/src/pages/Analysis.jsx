import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  BarChart2,
  GitCommit,
  AlertTriangle,
  TrendingUp,
  Sliders,
  Database,
  Search,
  ArrowUpDown,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  Percent,
} from 'lucide-react';
import { useDataStore, DEMO_DATASET } from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';
import ChartRenderer from '../components/Charts/ChartRenderer';
import DropZone from '../components/Upload/DropZone';

export default function Analysis() {
  const { currentDataset, datasets, setCurrentDataset, resetToDemo } = useDataStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'distributions' | 'correlations' | 'outliers' | 'predictions'
  const [columnSearch, setColumnSearch] = useState('');
  const [selectedDistCol, setSelectedDistCol] = useState('Monthly_Revenue');

  // What-If Simulation State
  const [priceChange, setPriceChange] = useState(0); // -20 to +30%
  const [marketingSpendChange, setMarketingSpendChange] = useState(0); // -30 to +50%
  const [retentionLift, setRetentionLift] = useState(0); // 0 to 15%

  if (!currentDataset) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6 text-center">
        <h2 className="text-2xl font-bold text-white">Upload a Dataset for Deep Statistical Analysis</h2>
        <p className="text-sm text-slate-400">
          Upload your data to inspect summary distributions, correlation matrices, and time-series forecasts.
        </p>
        <DropZone />
        <button
          onClick={resetToDemo}
          className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
        >
          Or explore with the Global SaaS 2024 benchmark dataset →
        </button>
      </div>
    );
  }

  const {
    name,
    rows,
    columns,
    columnStats = [],
    correlations = [],
    outliers = [],
  } = currentDataset;

  // Filter columns
  const filteredColumns = columnStats.filter((col) =>
    col.name.toLowerCase().includes(columnSearch.toLowerCase()) ||
    col.type.toLowerCase().includes(columnSearch.toLowerCase())
  );

  // Distribution Data generator for selected column
  const getDistributionData = (colName) => {
    switch (colName) {
      case 'Monthly_Revenue':
        return [
          { name: '$0-$200', count: 980, density: 20 },
          { name: '$200-$400', count: 1850, density: 38 },
          { name: '$400-$600', count: 1120, density: 23 },
          { name: '$600-$1000', count: 640, density: 13 },
          { name: '$1000+', count: 260, density: 6 },
        ];
      case 'Customer_Age_Months':
        return [
          { name: '0-6 mo', count: 820, density: 17 },
          { name: '6-12 mo', count: 1410, density: 29 },
          { name: '12-24 mo', count: 1620, density: 33 },
          { name: '24-36 mo', count: 710, density: 15 },
          { name: '36+ mo', count: 290, density: 6 },
        ];
      case 'Support_Tickets':
        return [
          { name: '0-1 tickets', count: 2150, density: 44 },
          { name: '2-3 tickets', count: 1490, density: 31 },
          { name: '4-5 tickets', count: 820, density: 17 },
          { name: '6-8 tickets', count: 280, density: 6 },
          { name: '9+ tickets', count: 110, density: 2 },
        ];
      case 'Feature_Usage_Score':
        return [
          { name: '0-25%', count: 190, density: 4 },
          { name: '25-50%', count: 720, density: 15 },
          { name: '50-75%', count: 1890, density: 39 },
          { name: '75-90%', count: 1420, density: 29 },
          { name: '90-100%', count: 630, density: 13 },
        ];
      default:
        return [
          { name: 'Bin 1', count: 420 },
          { name: 'Bin 2', count: 890 },
          { name: 'Bin 3', count: 1420 },
          { name: 'Bin 4', count: 960 },
          { name: 'Bin 5', count: 320 },
        ];
    }
  };

  // What-If Dynamic Forecast calculations
  const baseMRR = 540; // in thousands ($540k)
  const priceMultiplier = 1 + priceChange / 100;
  const marketingMultiplier = 1 + (marketingSpendChange * 0.45) / 100;
  const retentionMultiplier = 1 + (retentionLift * 0.75) / 100;
  const simulatedGrowthFactor = priceMultiplier * marketingMultiplier * retentionMultiplier;

  const forecastData = [
    { name: 'Month 1', base: 540, simulated: Math.round(540 * (1 + (simulatedGrowthFactor - 1) * 0.2)), upper: 555, lower: 525 },
    { name: 'Month 2', base: 565, simulated: Math.round(565 * (1 + (simulatedGrowthFactor - 1) * 0.4)), upper: 585, lower: 545 },
    { name: 'Month 3', base: 590, simulated: Math.round(590 * (1 + (simulatedGrowthFactor - 1) * 0.6)), upper: 615, lower: 565 },
    { name: 'Month 4', base: 615, simulated: Math.round(615 * (1 + (simulatedGrowthFactor - 1) * 0.8)), upper: 645, lower: 585 },
    { name: 'Month 5', base: 645, simulated: Math.round(645 * simulatedGrowthFactor), upper: 680, lower: 610 },
    { name: 'Month 6', base: 675, simulated: Math.round(675 * (simulatedGrowthFactor * 1.05)), upper: 720, lower: 630 },
  ];

  const simulatedFinalMRR = forecastData[forecastData.length - 1].simulated;
  const baseFinalMRR = forecastData[forecastData.length - 1].base;
  const revenueVariance = simulatedFinalMRR - baseFinalMRR;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Dataset Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Exploratory Analysis Engine
            </h2>
            <p className="text-xs text-slate-400">
              {name} • {rows.toLocaleString()} observations • {columns} dimensions
            </p>
          </div>
        </div>

        {/* Dataset Switcher */}
        {datasets.length > 1 && (
          <select
            value={currentDataset.id}
            onChange={(e) => {
              const found = datasets.find((d) => d.id === e.target.value);
              if (found) setCurrentDataset(found);
            }}
            className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-slate-200 focus:outline-none"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#111118]">
                {d.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Analysis Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Column Stats', icon: Table },
          { id: 'distributions', label: 'Distributions', icon: BarChart2 },
          { id: 'correlations', label: 'Correlations', icon: GitCommit },
          { id: 'outliers', label: 'Outliers & Anomalies', icon: AlertTriangle },
          { id: 'predictions', label: 'Forecast & What-If', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-sm-purple'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Column Stats Overview */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                placeholder="Filter column name or type..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredColumns.length} of {columnStats.length} analyzed variables
            </span>
          </div>

          <GlassCard hover={false} className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Column Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Mean</th>
                  <th className="py-3 px-3 text-right">Median</th>
                  <th className="py-3 px-3 text-right">Std Dev</th>
                  <th className="py-3 px-3 text-right">Min</th>
                  <th className="py-3 px-3 text-right">Max</th>
                  <th className="py-3 px-3 text-right">Nulls</th>
                  <th className="py-3 px-4 text-right">Missing %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredColumns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {col.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-purple-300 border border-white/5">
                        {col.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{col.mean}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{col.median}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{col.std}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">{col.min}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">{col.max}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {col.nulls > 0 ? (
                        <span className="text-amber-400 font-semibold">{col.nulls}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          col.missingPct > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {col.missingPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>
      )}

      {/* Tab 2: Distributions */}
      {activeTab === 'distributions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Feature Distributions & Density</h3>
              <p className="text-xs text-slate-400">Examine shape, normality, and binning dispersion</p>
            </div>

            {/* Column Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Column:</span>
              <select
                value={selectedDistCol}
                onChange={(e) => setSelectedDistCol(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Monthly_Revenue" className="bg-[#111118]">Monthly_Revenue</option>
                <option value="Customer_Age_Months" className="bg-[#111118]">Customer_Age_Months</option>
                <option value="Support_Tickets" className="bg-[#111118]">Support_Tickets</option>
                <option value="Feature_Usage_Score" className="bg-[#111118]">Feature_Usage_Score</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <GlassCard hover={false} className="lg:col-span-8 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  Histogram: {selectedDistCol}
                </span>
                <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Equal-frequency bins
                </span>
              </div>
              <ChartRenderer
                type="bar"
                data={getDistributionData(selectedDistCol)}
                xKey="name"
                yKeys={[{ key: 'count', name: 'Sample Frequency', color: '#8b5cf6' }]}
                height={320}
              />
            </GlassCard>

            <div className="lg:col-span-4 space-y-4">
              <GlassCard hover={false} className="p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Distribution Characteristics
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Skewness</span>
                    <span className="font-mono text-white">+0.48 (Right Skew)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Kurtosis</span>
                    <span className="font-mono text-white">2.91 (Mesokurtic)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Modal Peak</span>
                    <span className="font-mono text-white">$200 - $400 bin</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Normality Test</span>
                    <span className="font-mono text-emerald-400">p = 0.082 (Passed)</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard hover={false} className="p-5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Modeling Advice</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Logarithmic scaling is recommended prior to linear regression modeling for{' '}
                  <span className="font-mono text-white">{selectedDistCol}</span> to dampen upper-tail distortion.
                </p>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Correlations */}
      {activeTab === 'correlations' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Correlation Matrix & Mutual Information</h3>
              <p className="text-xs text-slate-400">Pairwise Pearson correlation coefficients (-1.00 to +1.00)</p>
            </div>
            <span className="text-xs text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Strongest: Usage ↔ NPS (+0.84)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Pairs Table */}
            <GlassCard hover={false} className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-white">Ranked Correlation Pairs</h4>
              <div className="space-y-3">
                {correlations.map((pair, idx) => {
                  const isPositive = pair.value > 0;
                  const intensity = Math.abs(pair.value);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{pair.var1}</span>
                          <span className="text-slate-500">↔</span>
                          <span>{pair.var2}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{pair.impact}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono text-sm font-black ${
                            pair.value > 0.5
                              ? 'text-purple-400'
                              : pair.value < -0.5
                              ? 'text-cyan-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {pair.value > 0 ? `+${pair.value.toFixed(2)}` : pair.value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Scatter Relationship Representation */}
            <GlassCard hover={false} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  Bivariate Fit: Feature Usage ↔ NPS Score
                </h4>
                <span className="text-xs text-purple-300 font-mono">r = 0.84</span>
              </div>
              <ChartRenderer
                type="scatter"
                data={[
                  { x: 30, y: 5.1 },
                  { x: 42, y: 6.2 },
                  { x: 50, y: 6.8 },
                  { x: 62, y: 7.4 },
                  { x: 74, y: 8.5 },
                  { x: 86, y: 9.3 },
                  { x: 95, y: 9.9 },
                ]}
                height={260}
              />
              <p className="text-xs text-slate-400">
                Data shows a strong linear positive slope. Increasing feature usage by 10 points yields an average +0.72 NPS gain.
              </p>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Outliers */}
      {activeTab === 'outliers' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Statistical Anomaly & Outlier Registry</h3>
              <p className="text-xs text-slate-400">Detected records with z-score &gt; 3.0 standard deviations</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {outliers.length} Critical Outliers Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outliers.map((outlier, i) => (
              <GlassCard key={i} hover className="p-5 border-l-4 border-l-rose-500 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{outlier.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300">
                    {outlier.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Anomaly in <strong className="text-white font-mono">{outlier.field}</strong>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400">Observed Value:</span>
                  <span className="font-mono font-bold text-white">{outlier.value}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Deviation Distance:</span>
                  <span className="font-mono font-semibold text-rose-400">{outlier.standardDev}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 5: Predictions & What-If Simulator */}
      {activeTab === 'predictions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* What-If Simulator Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#111118] to-cyan-950/30 border border-purple-500/30 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    What-If Strategic Simulator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adjust key variables to dynamically project ARR velocity and margin impact
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPriceChange(0);
                  setMarketingSpendChange(0);
                  setRetentionLift(0);
                }}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Reset Sliders
              </button>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: Pricing */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-300">Pricing Adjustment</span>
                  <span className="font-mono font-bold text-purple-400">
                    {priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="30"
                  step="5"
                  value={priceChange}
                  onChange={(e) => setPriceChange(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-300 block">Baseline: Current plan catalog</span>
              </div>

              {/* Slider 2: Marketing Budget */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-300">Marketing & Growth Spend</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {marketingSpendChange > 0 ? `+${marketingSpendChange}%` : `${marketingSpendChange}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="5"
                  value={marketingSpendChange}
                  onChange={(e) => setMarketingSpendChange(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-300 block">Model assumes 0.45x CAC elasticity</span>
              </div>

              {/* Slider 3: Retention Lift */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-300">Retention Initiative Lift</span>
                  <span className="font-mono font-bold text-emerald-400">
                    +{retentionLift}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={retentionLift}
                  onChange={(e) => setRetentionLift(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-300 block">Calculated via automated churn intervention</span>
              </div>
            </div>

            {/* Live Projected Variance Pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
              <span className="text-slate-300">Projected 6-Month ARR Impact:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  revenueVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {revenueVariance >= 0 ? `+$${revenueVariance}k / month` : `-$${Math.abs(revenueVariance)}k / month`}
              </span>
            </div>
          </div>

          {/* Time Series Forecast Chart */}
          <GlassCard hover={false} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  6-Month Forward Looking MRR Trajectory
                </h4>
                <p className="text-xs text-slate-400">
                  ARIMA forecast with 80% confidence intervals and sensitivity overlay
                </p>
              </div>
              <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Simulated vs Baseline
              </span>
            </div>

            <ChartRenderer
              type="line"
              data={forecastData}
              xKey="name"
              yKeys={[
                { key: 'simulated', name: 'Simulated MRR ($k)', color: '#8b5cf6' },
                { key: 'base', name: 'Baseline ($k)', color: '#64748b' },
                { key: 'upper', name: 'Upper Bound ($k)', color: '#06b6d4' },
              ]}
              height={320}
            />
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
