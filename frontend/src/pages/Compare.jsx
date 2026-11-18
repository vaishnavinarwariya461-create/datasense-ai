import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Layers,
  Database,
  BrainCircuit,
  BarChart3,
  Scale,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import useDataStore, { DEMO_DATASET } from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';
import { compareDatasets } from '../utils/api';

// Pre-packaged Datasets for Comparison
const MOCK_COMPARISON_DATASETS = [
  {
    id: 'ds-dataset-a',
    name: 'Q3_Global_SaaS_Revenue_Cleaned.csv',
    rows: 4850,
    columns: 14,
    missingPct: 1.28,
    score: 88,
    status: 'Excellent Health',
    avgCustomerValue: 3842,
    churnRate: 4.8,
    duplicateRows: 0,
    columnsList: [
      'Customer_ID',
      'Monthly_Revenue',
      'Plan_Tier',
      'Age_Months',
      'Support_Tickets',
      'NPS_Score',
      'Churn_Probability',
      'Feature_Usage_Score',
      'Region',
      'Signup_Date',
      'Renewal_Status',
      'Contract_Length',
      'Payment_Method',
      'Account_Executive',
    ],
    timelineData: [
      { name: 'Month 1', value: 120 },
      { name: 'Month 2', value: 145 },
      { name: 'Month 3', value: 168 },
      { name: 'Month 4', value: 195 },
      { name: 'Month 5', value: 230 },
      { name: 'Month 6', value: 265 },
    ],
  },
  {
    id: 'ds-dataset-b',
    name: 'Q4_Expansion_Raw_Ingest.csv',
    rows: 5820,
    columns: 16,
    missingPct: 5.12,
    score: 72,
    status: 'Needs Imputation',
    avgCustomerValue: 3310,
    churnRate: 6.9,
    duplicateRows: 24,
    columnsList: [
      'Customer_ID',
      'Monthly_Revenue',
      'Plan_Tier',
      'Age_Months',
      'Support_Tickets',
      'NPS_Score',
      'Churn_Probability',
      'Feature_Usage_Score',
      'Region',
      'Signup_Date',
      'Renewal_Status',
      'Contract_Length',
      'Payment_Method',
      'Account_Executive',
      'Beta_Feature_Flag', // Extra in B
      'Telemetry_Ping_Rate', // Extra in B
    ],
    timelineData: [
      { name: 'Month 1', value: 110 },
      { name: 'Month 2', value: 130 },
      { name: 'Month 3', value: 152 },
      { name: 'Month 4', value: 175 },
      { name: 'Month 5', value: 205 },
      { name: 'Month 6', value: 240 },
    ],
  },
  {
    id: 'ds-dataset-c',
    name: 'EMEA_Regional_Performance_Audit.csv',
    rows: 3200,
    columns: 13,
    missingPct: 2.1,
    score: 83,
    status: 'Good Health',
    avgCustomerValue: 4120,
    churnRate: 3.9,
    duplicateRows: 4,
    columnsList: [
      'Customer_ID',
      'Monthly_Revenue',
      'Plan_Tier',
      'Age_Months',
      'Support_Tickets',
      'NPS_Score',
      'Churn_Probability',
      'Region',
      'Signup_Date',
      'Renewal_Status',
      'Contract_Length',
      'Payment_Method',
      'VAT_Number', // Extra in C
    ],
    timelineData: [
      { name: 'Month 1', value: 95 },
      { name: 'Month 2', value: 115 },
      { name: 'Month 3', value: 138 },
      { name: 'Month 4', value: 160 },
      { name: 'Month 5', value: 190 },
      { name: 'Month 6', value: 220 },
    ],
  },
];

export default function Compare() {
  const { currentDataset } = useDataStore();

  // Active selections
  const [datasetAId, setDatasetAId] = useState(MOCK_COMPARISON_DATASETS[0].id);
  const [datasetBId, setDatasetBId] = useState(MOCK_COMPARISON_DATASETS[1].id);

  // AI Comparison Execution
  const [isAiComparing, setIsAiComparing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Selected Dataset Objects
  const datasetA = useMemo(
    () => MOCK_COMPARISON_DATASETS.find((d) => d.id === datasetAId) || MOCK_COMPARISON_DATASETS[0],
    [datasetAId]
  );
  const datasetB = useMemo(
    () => MOCK_COMPARISON_DATASETS.find((d) => d.id === datasetBId) || MOCK_COMPARISON_DATASETS[1],
    [datasetBId]
  );

  // Winner calculation
  const winner = useMemo(() => {
    if (datasetA.score > datasetB.score) {
      return {
        name: 'Dataset A',
        dataset: datasetA,
        diff: datasetA.score - datasetB.score,
      };
    } else if (datasetB.score > datasetA.score) {
      return {
        name: 'Dataset B',
        dataset: datasetB,
        diff: datasetB.score - datasetA.score,
      };
    }
    return { name: 'Tie', dataset: datasetA, diff: 0 };
  }, [datasetA, datasetB]);

  // Schema Column Mapping analysis
  const columnMapping = useMemo(() => {
    const setA = new Set(datasetA.columnsList);
    const setB = new Set(datasetB.columnsList);

    const shared = datasetA.columnsList.filter((col) => setB.has(col));
    const onlyInA = datasetA.columnsList.filter((col) => !setB.has(col));
    const onlyInB = datasetB.columnsList.filter((col) => !setA.has(col));

    return { shared, onlyInA, onlyInB };
  }, [datasetA, datasetB]);

  // Combined Overlapping Timeline Chart Data
  const combinedTimelineData = useMemo(() => {
    return datasetA.timelineData.map((item, idx) => ({
      name: item.name,
      'Dataset A': item.value,
      'Dataset B': datasetB.timelineData[idx]?.value || 0,
    }));
  }, [datasetA, datasetB]);

  // Metric Comparison Bars Data
  const metricComparisonData = useMemo(() => {
    return [
      {
        metric: 'Avg Customer Value ($)',
        'Dataset A': datasetA.avgCustomerValue,
        'Dataset B': datasetB.avgCustomerValue,
      },
      {
        metric: 'Churn Probability (%)',
        'Dataset A': datasetA.churnRate * 10,
        'Dataset B': datasetB.churnRate * 10,
      },
      {
        metric: 'DataSense Score™',
        'Dataset A': datasetA.score,
        'Dataset B': datasetB.score,
      },
    ];
  }, [datasetA, datasetB]);

  // Execute Gemini AI Deep Comparison
  const handleRunAiComparison = async () => {
    setIsAiComparing(true);
    try {
      const res = await compareDatasets(datasetA.id, datasetB.id);
      setAiReport(res);
      toast.success('Gemini AI dataset comparison completed!');
    } catch (err) {
      toast.error('AI comparison encountered an issue');
    } finally {
      setIsAiComparing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔁</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Compare Mode
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Side-by-Side Benchmark
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Datasets Ko Side-by-Side Compare Karo — detect schema drift, analyze statistical variance, and find the winner.
          </p>
        </div>
      </div>

      {/* Dataset Selector Bar: Dataset A vs Dataset B */}
      <GlassCard hover={false} className="p-5 bg-gradient-to-r from-purple-950/20 via-[#111118] to-cyan-950/20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Dataset A Selector */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                Dataset A (Baseline)
              </span>
              <span className="text-xs font-mono text-purple-400 font-semibold">
                Score: {datasetA.score}/100
              </span>
            </div>
            <select
              value={datasetAId}
              onChange={(e) => setDatasetAId(e.target.value)}
              className="w-full bg-[#141420] border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-purple-400"
            >
              {MOCK_COMPARISON_DATASETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.rows.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          {/* VS Pulsing Badge in the Middle */}
          <div className="shrink-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-glow-purple">
              <div className="w-full h-full bg-[#0d0d16] rounded-[14px] flex items-center justify-center">
                <span className="font-black text-sm tracking-wider bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  VS
                </span>
              </div>
            </div>
          </div>

          {/* Dataset B Selector */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                Dataset B (Comparison)
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                Score: {datasetB.score}/100
              </span>
            </div>
            <select
              value={datasetBId}
              onChange={(e) => setDatasetBId(e.target.value)}
              className="w-full bg-[#141420] border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-cyan-400"
            >
              {MOCK_COMPARISON_DATASETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.rows.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Winner Banner */}
      <GlassCard
        glow={winner.name === 'Dataset A' ? 'purple' : 'cyan'}
        hover={false}
        className="p-5 border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-500/10 via-[#111118] to-purple-500/10"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg">
                  {winner.name} Wins! 🏆
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DataSense Score™: {datasetA.score} vs {datasetB.score}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {winner.name} possesses higher data cleanliness, lower missingness, and verified structural integrity (+{winner.diff} pts better).
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAiComparison}
            disabled={isAiComparing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-glow-purple flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            {isAiComparing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Compare Karo ⚡
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Section 1: Overview Comparison Table */}
      <GlassCard hover={false} className="p-5">
        <div className="border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-base">Overview Metrics Comparison</h4>
            <p className="text-xs text-slate-400">Direct tabular delta between Dataset A and Dataset B</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#12121e] text-slate-300 font-semibold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3">Metric</th>
                <th className="p-3 text-purple-300">Dataset A ({datasetA.name.slice(0, 16)}...)</th>
                <th className="p-3 text-cyan-300">Dataset B ({datasetB.name.slice(0, 16)}...)</th>
                <th className="p-3">Difference & Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {/* Rows */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-semibold text-white">Row Count</td>
                <td className="p-3 font-mono text-slate-200">{datasetA.rows.toLocaleString()}</td>
                <td className="p-3 font-mono text-slate-200">{datasetB.rows.toLocaleString()}</td>
                <td className="p-3 font-mono">
                  <span className={datasetB.rows >= datasetA.rows ? 'text-emerald-400' : 'text-slate-400'}>
                    +{datasetB.rows - datasetA.rows} ({(((datasetB.rows - datasetA.rows) / datasetA.rows) * 100).toFixed(1)}%)
                  </span>
                </td>
              </tr>

              {/* Columns */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-semibold text-white">Total Columns</td>
                <td className="p-3 font-mono text-slate-200">{datasetA.columns}</td>
                <td className="p-3 font-mono text-slate-200">{datasetB.columns}</td>
                <td className="p-3 font-mono">
                  <span className="text-cyan-400">
                    +{datasetB.columns - datasetA.columns} columns
                  </span>
                </td>
              </tr>

              {/* Missing % */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-semibold text-white">Missing Values %</td>
                <td className="p-3 font-mono text-emerald-400">{datasetA.missingPct}%</td>
                <td className="p-3 font-mono text-rose-400">{datasetB.missingPct}%</td>
                <td className="p-3 font-mono">
                  <span className="text-rose-400">
                    +{(datasetB.missingPct - datasetA.missingPct).toFixed(2)}% worse in B
                  </span>
                </td>
              </tr>

              {/* DataSense Score */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-semibold text-white">DataSense Score™</td>
                <td className="p-3 font-mono font-bold text-purple-300">{datasetA.score}/100</td>
                <td className="p-3 font-mono font-bold text-cyan-300">{datasetB.score}/100</td>
                <td className="p-3 font-mono">
                  <span className="text-emerald-400 font-bold">
                    {datasetA.score - datasetB.score} pts better in A
                  </span>
                </td>
              </tr>

              {/* Duplicate Rows */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-semibold text-white">Duplicate Rows</td>
                <td className="p-3 font-mono text-emerald-400">{datasetA.duplicateRows} (0%)</td>
                <td className="p-3 font-mono text-amber-400">{datasetB.duplicateRows} duplicates</td>
                <td className="p-3 font-mono text-amber-400">Cleaned in A</td>
              </tr>

              {/* Avg Customer Value */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-semibold text-white">Avg Customer Value</td>
                <td className="p-3 font-mono text-slate-200">${datasetA.avgCustomerValue.toLocaleString()}</td>
                <td className="p-3 font-mono text-slate-200">${datasetB.avgCustomerValue.toLocaleString()}</td>
                <td className="p-3 font-mono">
                  <span className="text-purple-300">
                    +${datasetA.avgCustomerValue - datasetB.avgCustomerValue} in A
                  </span>
                </td>
              </tr>

              {/* Churn Rate */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3 font-semibold text-white">Churn Probability Rate</td>
                <td className="p-3 font-mono text-emerald-400">{datasetA.churnRate}%</td>
                <td className="p-3 font-mono text-rose-400">{datasetB.churnRate}%</td>
                <td className="p-3 font-mono text-emerald-400">
                  -{(datasetB.churnRate - datasetA.churnRate).toFixed(1)}% safer in A
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Section 2: Column & Schema Mapping */}
      <GlassCard hover={false} className="p-5 space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-base">Column & Schema Mapping</h4>
            <p className="text-xs text-slate-400">Detect schema drift and matched attributes</p>
          </div>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            {columnMapping.shared.length} Matched Fields
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Matched in both */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Shared in Both ({columnMapping.shared.length})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {columnMapping.shared.map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Only in A */}
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Columns Only in Dataset A ({columnMapping.onlyInA.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {columnMapping.onlyInA.length > 0 ? (
                columnMapping.onlyInA.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-0.5 rounded text-[11px] bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {col}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">None (all mapped to B)</span>
              )}
            </div>
          </div>

          {/* Only in B */}
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Columns Only in Dataset B ({columnMapping.onlyInB.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {columnMapping.onlyInB.length > 0 ? (
                columnMapping.onlyInB.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono"
                  >
                    +{col}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">None</span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Section 3: Side-by-Side Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Overlapping Area Chronology */}
        <GlassCard hover={false} className="p-5">
          <div className="border-b border-white/10 pb-3 mb-4">
            <h4 className="font-bold text-white text-base">Overlapping Timeline Distribution</h4>
            <p className="text-xs text-slate-400">Direct volume trajectory: Dataset A vs Dataset B</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedTimelineData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="areaA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="Dataset A" stroke="#8b5cf6" fill="url(#areaA)" strokeWidth={2} />
                <Area type="monotone" dataKey="Dataset B" stroke="#06b6d4" fill="url(#areaB)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 2: Metric Comparison Dual Bars */}
        <GlassCard hover={false} className="p-5">
          <div className="border-b border-white/10 pb-3 mb-4">
            <h4 className="font-bold text-white text-base">Key Metrics Side-by-Side</h4>
            <p className="text-xs text-slate-400">Direct comparison across value, risk & quality scores</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
                />
                <Legend />
                <Bar dataKey="Dataset A" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Dataset B" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Section 4: AI Comparison Summary */}
      <GlassCard glow="purple" hover={false} className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Gemini Comparative Intelligence</h4>
              <p className="text-xs text-slate-400">Automated delta analysis & schema drift recommendations</p>
            </div>
          </div>

          <button
            onClick={handleRunAiComparison}
            disabled={isAiComparing}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isAiComparing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Re-Run AI Comparison
              </>
            )}
          </button>
        </div>

        {/* AI Content */}
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            {aiReport ? aiReport.summary : (
              `Dataset A exhibits superior data hygiene, lower null frequency (1.28% vs 5.12%), and higher variance consistency. Dataset B has 20% higher row count, but suffers from elevated missingness in mid-market segments.`
            )}
          </p>

          {/* 5 Key Differences List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              5 Key Distinctions Discovered by Gemini:
            </span>
            <div className="space-y-1.5">
              {(aiReport?.keyDifferences || [
                'Dataset A has 0 duplicate rows vs 24 duplicates in Dataset B',
                'Dataset A has standardized date strings (ISO 8601), whereas Dataset B contains mixed MM/DD and DD/MM formats',
                'Average customer value is 16% higher in Dataset A ($3,842 vs $3,310)',
                'Dataset B includes 2 additional experimental tracking columns not present in A',
                'Dataset A boasts a 98% validity score across categorical fields vs 84% in Dataset B',
              ]).map((diff, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded-lg bg-white/[0.02]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{diff}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              Data Engineering Recommendations:
            </span>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
              {(aiReport?.recommendations || [
                'Merge cleaned records from Dataset A into Dataset B to backfill missing demographic fields.',
                'Apply automated whitespace and date normalization pipeline on Dataset B before running regressions.',
              ]).map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
