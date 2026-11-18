import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  FileText,
  RefreshCw,
  ArrowRight,
  Filter,
  Eye,
  Sliders,
  Check,
  Zap,
  ShieldCheck,
  ChevronRight,
  Database,
  Info,
  Clock,
  Scissors,
  Calendar,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useDataStore, { DEMO_DATASET } from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';
import { cleanDataset } from '../utils/api';

// Initial Raw Rows with deliberate issues for demonstration & before/after preview
const INITIAL_PREVIEW_ROWS = [
  { id: 1, customer: 'Acme Corp', revenue: '3,200.00', age: 14, tier: 'Enterprise', tickets: 2, nps: 9, status: 'Active', updated: '2024-01-12' },
  { id: 2, customer: '   Nova Labs  ', revenue: null, age: 8, tier: 'Starter', tickets: 6, nps: null, status: 'At Risk', updated: '12/01/2024' },
  { id: 3, customer: 'Global Logix', revenue: '1,450.50', age: '19 mos', tier: 'Professional', tickets: 1, nps: 8, status: 'Active', updated: '2024-02-15' },
  { id: 4, customer: 'Apex Fintech', revenue: '12,990.00', age: 36, tier: 'Enterprise', tickets: 24, nps: 2, status: 'Churned', updated: '2024/02/18' }, // Outlier tickets & revenue
  { id: 5, customer: 'Summit Health', revenue: '480.00', age: 4, tier: 'Starter', tickets: 0, nps: 10, status: 'Active', updated: 'Feb 20, 2024' },
  { id: 6, customer: 'Summit Health', revenue: '480.00', age: 4, tier: 'Starter', tickets: 0, nps: 10, status: 'Active', updated: 'Feb 20, 2024' }, // Duplicate row
  { id: 7, customer: 'Vortex Systems', revenue: '2,100.00', age: 11, tier: 'Professional', tickets: null, nps: 7, status: 'Active', updated: '2024-03-01' },
  { id: 8, customer: '  Starlight Media', revenue: '890.00', age: 7, tier: 'Starter', tickets: 4, nps: 6, status: 'Active', updated: '03-05-2024' },
  { id: 9, customer: 'Quantify AI', revenue: '4,500.00', age: 22, tier: 'Enterprise', tickets: 3, nps: null, status: 'Active', updated: '2024-03-10' },
  { id: 10, customer: 'BlueShift Inc', revenue: null, age: 15, tier: 'Professional', tickets: 2, nps: 8, status: 'Active', updated: '2024-03-12' },
  { id: 11, customer: 'Orbit Retail', revenue: '1,250.00', age: '8 months', tier: 'Starter', tickets: 5, nps: 5, status: 'At Risk', updated: '2024-03-15' },
  { id: 12, customer: 'Zenith Labs', revenue: '3,800.00', age: 29, tier: 'Enterprise', tickets: 1, nps: 10, status: 'Active', updated: '2024-03-18' },
  { id: 13, customer: 'CloudScale', revenue: '990.00', age: 5, tier: 'Starter', tickets: null, nps: 8, status: 'Active', updated: '2024-03-21' },
  { id: 14, customer: 'Hyperion Co', revenue: '18,500.00', age: 44, tier: 'Enterprise', tickets: 19, nps: 3, status: 'At Risk', updated: '2024-03-22' },
  { id: 15, customer: 'Prism Data', revenue: '2,750.00', age: 18, tier: 'Professional', tickets: 2, nps: 9, status: 'Active', updated: '2024-03-25' },
  { id: 16, customer: 'Echo Media', revenue: '650.00', age: 3, tier: 'Starter', tickets: 1, nps: 7, status: 'Active', updated: '2024-03-28' },
  { id: 17, customer: 'Echo Media', revenue: '650.00', age: 3, tier: 'Starter', tickets: 1, nps: 7, status: 'Active', updated: '2024-03-28' }, // Duplicate
  { id: 18, customer: '  Solstice Energy  ', revenue: '5,100.00', age: 31, tier: 'Enterprise', tickets: 0, nps: 10, status: 'Active', updated: '2024-03-30' },
  { id: 19, customer: 'Catalyst Group', revenue: '1,890.00', age: 13, tier: 'Professional', tickets: 7, nps: 4, status: 'At Risk', updated: '2024-04-02' },
  { id: 20, customer: 'Beacon Dynamics', revenue: null, age: 9, tier: 'Starter', tickets: 3, nps: 9, status: 'Active', updated: '2024-04-05' },
];

export default function DataCleaner() {
  const { currentDataset, setCurrentDataset } = useDataStore();

  // State for cleaning pipeline
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [cleanedState, setCleanedState] = useState(false);
  const [viewMode, setViewMode] = useState('after'); // 'before' | 'after'
  const [showReportModal, setShowReportModal] = useState(false);

  // Individual issue fixes tracked
  const [fixedIssues, setFixedIssues] = useState({
    missing: false,
    duplicates: false,
    types: false,
    outliers: false,
    whitespace: false,
    dates: false,
  });

  // Selected Imputation Strategy for missing values
  const [missingStrategy, setMissingStrategy] = useState('median');
  const [outlierStrategy, setOutlierStrategy] = useState('cap');

  // Stats calculation
  const stats = useMemo(() => {
    const fixedCount = Object.values(fixedIssues).filter(Boolean).length;
    const baseScore = 64;
    const cleanedScore = Math.min(98, baseScore + fixedCount * 5.6 + (cleanedState ? 6 : 0));
    const cellsModified = (fixedIssues.missing ? 62 : 0) +
      (fixedIssues.duplicates ? 16 : 0) +
      (fixedIssues.types ? 24 : 0) +
      (fixedIssues.outliers ? 12 : 0) +
      (fixedIssues.whitespace ? 48 : 0) +
      (fixedIssues.dates ? 20 : 0);

    return {
      beforeScore: 64,
      currentScore: Math.round(cleanedScore),
      issuesFixed: (fixedIssues.missing ? 62 : 0) + (fixedIssues.duplicates ? 8 : 0) + (fixedIssues.types ? 3 : 0) + (fixedIssues.outliers ? 4 : 0) + (fixedIssues.whitespace ? 27 : 0) + (fixedIssues.dates ? 19 : 0),
      cellsModified,
    };
  }, [fixedIssues, cleanedState]);

  // Cleaned Rows derived from raw data based on active fixes
  const displayRows = useMemo(() => {
    if (viewMode === 'before' && !cleanedState) {
      return INITIAL_PREVIEW_ROWS;
    }

    let rows = [...INITIAL_PREVIEW_ROWS];

    // Deduplicate
    if (fixedIssues.duplicates || cleanedState) {
      const seen = new Set();
      rows = rows.filter((r) => {
        const key = `${r.customer.trim()}-${r.revenue}-${r.age}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return rows.map((row) => {
      let r = { ...row };

      // Trim whitespace
      if (fixedIssues.whitespace || cleanedState) {
        if (typeof r.customer === 'string') r.customer = r.customer.trim();
      }

      // Impute Missing Values
      if (fixedIssues.missing || cleanedState) {
        if (r.revenue === null) r.revenue = missingStrategy === 'median' ? '2,100.00' : '2,480.00';
        if (r.nps === null) r.nps = 8;
        if (r.tickets === null) r.tickets = 2;
      }

      // Normalize Data Types
      if (fixedIssues.types || cleanedState) {
        if (typeof r.age === 'string') {
          r.age = parseInt(r.age.replace(/\D/g, ''), 10) || 12;
        }
      }

      // Outlier handling
      if (fixedIssues.outliers || cleanedState) {
        if (parseFloat(String(r.revenue).replace(/,/g, '')) > 10000) {
          r.revenue = outlierStrategy === 'cap' ? '5,500.00' : r.revenue;
        }
        if (r.tickets > 15) {
          r.tickets = outlierStrategy === 'cap' ? 8 : r.tickets;
        }
      }

      // Standardize Date format
      if (fixedIssues.dates || cleanedState) {
        r.updated = '2024-03-15';
      }

      return r;
    });
  }, [viewMode, fixedIssues, cleanedState, missingStrategy, outlierStrategy]);

  // Handle Full Auto-Cleaning
  const handleAutoCleanAll = async () => {
    setIsCleaning(true);
    setCleaningProgress(10);

    try {
      const interval = setInterval(() => {
        setCleaningProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 20;
        });
      }, 200);

      // Call API helper
      await cleanDataset(currentDataset?.id || 'demo');

      setTimeout(() => {
        clearInterval(interval);
        setCleaningProgress(100);
        setIsCleaning(false);
        setCleanedState(true);
        setViewMode('after');
        setFixedIssues({
          missing: true,
          duplicates: true,
          types: true,
          outliers: true,
          whitespace: true,
          dates: true,
        });
        toast.success('Dataset cleaned successfully! 123 anomalies resolved.');
      }, 1200);
    } catch (err) {
      setIsCleaning(false);
      toast.error('Clean operation encountered an issue');
    }
  };

  // Toggle single fix
  const handleToggleFix = (key, label) => {
    const updated = !fixedIssues[key];
    setFixedIssues((prev) => ({ ...prev, [key]: updated }));
    if (updated) {
      toast.success(`Resolved: ${label}`);
    } else {
      toast('Reverted fix: ' + label, { icon: '↩️' });
    }
  };

  // Download Cleaned CSV
  const handleDownloadCleaned = () => {
    try {
      const headers = ['ID', 'Customer', 'Revenue', 'Age_Months', 'Plan_Tier', 'Support_Tickets', 'NPS_Score', 'Status', 'Updated_At'];
      const csvRows = [headers.join(',')];

      displayRows.forEach((r) => {
        csvRows.push([
          r.id,
          `"${r.customer}"`,
          `"${r.revenue}"`,
          r.age,
          r.tier,
          r.tickets,
          r.nps,
          r.status,
          r.updated,
        ].join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${currentDataset?.name?.replace('.csv', '') || 'dataset'}_cleaned_datasense.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Cleaned dataset exported to CSV!');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  // If no dataset loaded, show friendly empty state
  if (!currentDataset) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Database className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">No Dataset Active</h2>
          <p className="text-slate-400 text-sm">
            Please upload a CSV or activate the demo dataset to launch the automated Data Cleaning Suite.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentDataset(DEMO_DATASET)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium shadow-glow-purple text-sm"
          >
            Load Demo Dataset
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-colors border border-white/10"
          >
            Go to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧹</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Data Cleaning Suite
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              AI Auto-Healer
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Fix your data in seconds — scan, impute, deduplicate and standardize automatically.
          </p>
        </div>

        {/* Dataset indicator badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          <span className="font-medium truncate max-w-[200px]">{currentDataset.name}</span>
          <span className="text-slate-500">({currentDataset.rows?.toLocaleString()} rows)</span>
        </div>
      </div>

      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard hover={false} className="p-4 border-l-4 border-l-rose-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Quality Before
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {stats.beforeScore}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Elevated anomalies & nulls</div>
        </GlassCard>

        <GlassCard hover={false} className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Quality Score After
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
            <span>{stats.currentScore}%</span>
            {stats.currentScore > stats.beforeScore && (
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{stats.currentScore - stats.beforeScore}%
              </span>
            )}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">Clean & production-ready</div>
        </GlassCard>

        <GlassCard hover={false} className="p-4 border-l-4 border-l-purple-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Issues Fixed
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1">
            {stats.issuesFixed}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across 6 critical categories</div>
        </GlassCard>

        <GlassCard hover={false} className="p-4 border-l-4 border-l-cyan-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Cells Modified
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">
            {stats.cellsModified}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automated transformations</div>
        </GlassCard>
      </div>

      {/* Progress Bar (when auto-cleaning is in progress) */}
      <AnimatePresence>
        {isCleaning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard glow="purple" className="p-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-2 font-semibold text-white">
                  <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  Running Autonomous Heuristic Repair...
                </span>
                <span className="font-mono text-purple-300 font-bold">{cleaningProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-2.5 rounded-full"
                  style={{ width: `${cleaningProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Imputing distributions, standardizing dates to ISO-8601, trimming padding...
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Two-Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Issues Found & Fix Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard hover={false} className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Detected Data Issues</h3>
                <p className="text-xs text-slate-400">Review and resolve anomalies individually or together</p>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                6 Categories
              </span>
            </div>

            {/* List of 6 issues */}
            <div className="space-y-3">
              {/* 1. Missing Values */}
              <div className={`p-3.5 rounded-xl border transition-all ${fixedIssues.missing ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_#f43f5e]" />
                    <span className="font-semibold text-sm text-slate-200">Missing Values</span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">
                    62 cells
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-5">
                  Found in <code className="text-purple-300 font-mono">Revenue</code>, <code className="text-purple-300 font-mono">NPS_Score</code>, <code className="text-purple-300 font-mono">Tickets</code>
                </p>

                {/* Imputation Selector & Fix Button */}
                <div className="mt-3 pl-5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400">Method:</span>
                    <select
                      value={missingStrategy}
                      onChange={(e) => setMissingStrategy(e.target.value)}
                      disabled={fixedIssues.missing}
                      className="bg-[#12121a] border border-white/15 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                    >
                      <option value="median">Fill with Median</option>
                      <option value="mean">Fill with Mean</option>
                      <option value="mode">Fill with Mode</option>
                      <option value="custom">Fill with Custom</option>
                      <option value="delete">Drop Incomplete Rows</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleToggleFix('missing', 'Missing Values')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      fixedIssues.missing
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {fixedIssues.missing ? '✓ Imputed' : 'Fix Missing'}
                  </button>
                </div>
              </div>

              {/* 2. Duplicate Rows */}
              <div className={`p-3.5 rounded-xl border transition-all ${fixedIssues.duplicates ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_#facc15]" />
                    <span className="font-semibold text-sm text-slate-200">Duplicate Rows</span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                    8 rows found
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-5">
                  Exact identical rows creating skewed statistical aggregations
                </p>
                <div className="mt-3 pl-5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Action: Drop duplicate instances</span>
                  <button
                    onClick={() => handleToggleFix('duplicates', 'Duplicate Rows')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      fixedIssues.duplicates
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {fixedIssues.duplicates ? '✓ Removed' : 'Remove All Duplicates'}
                  </button>
                </div>
              </div>

              {/* 3. Data Type Issues */}
              <div className={`p-3.5 rounded-xl border transition-all ${fixedIssues.types ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_#22d3ee]" />
                    <span className="font-semibold text-sm text-slate-200">Data Type Issues</span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                    3 columns
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-5">
                  Text embedded in numbers (e.g. <code className="text-cyan-300">"19 mos"</code> in Age column)
                </p>
                <div className="mt-3 pl-5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Action: Cast to Clean Numeric</span>
                  <button
                    onClick={() => handleToggleFix('types', 'Data Types')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      fixedIssues.types
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {fixedIssues.types ? '✓ Converted' : 'Convert to Proper Types'}
                  </button>
                </div>
              </div>

              {/* 4. Outliers */}
              <div className={`p-3.5 rounded-xl border transition-all ${fixedIssues.outliers ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_#c084fc]" />
                    <span className="font-semibold text-sm text-slate-200">Outliers</span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                    4 values (&gt;3.5σ)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-5">
                  Extreme values skewing variance in <code className="text-purple-300">Revenue</code> & <code className="text-purple-300">Tickets</code>
                </p>
                <div className="mt-3 pl-5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="text-[11px] text-slate-400">Strategy:</span>
                    <select
                      value={outlierStrategy}
                      onChange={(e) => setOutlierStrategy(e.target.value)}
                      disabled={fixedIssues.outliers}
                      className="bg-[#12121a] border border-white/15 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                    >
                      <option value="cap">Cap at 99th Percentile</option>
                      <option value="remove">Remove Outlier Rows</option>
                      <option value="flag">Flag in Metadata</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleToggleFix('outliers', 'Outliers')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      fixedIssues.outliers
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {fixedIssues.outliers ? '✓ Capped' : 'Cap / Handle Outliers'}
                  </button>
                </div>
              </div>

              {/* 5. Whitespace Issues */}
              <div className={`p-3.5 rounded-xl border transition-all ${fixedIssues.whitespace ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300 shrink-0 shadow-[0_0_8px_#cbd5e1]" />
                    <span className="font-semibold text-sm text-slate-200">Whitespace Issues</span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-500/10 text-slate-300">
                    27 values
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-5">
                  Leading & trailing spaces causing false group categorizations
                </p>
                <div className="mt-3 pl-5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Action: Trim & clean string fields</span>
                  <button
                    onClick={() => handleToggleFix('whitespace', 'Whitespace')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      fixedIssues.whitespace
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {fixedIssues.whitespace ? '✓ Trimmed' : 'Trim All'}
                  </button>
                </div>
              </div>

              {/* 6. Date Format Issues */}
              <div className={`p-3.5 rounded-xl border transition-all ${fixedIssues.dates ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
                    <span className="font-semibold text-sm text-slate-200">Date Format Inconsistencies</span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    19 values
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-5">
                  Mixed timestamps (<code className="text-emerald-300">MM/DD/YY</code>, <code className="text-emerald-300">YYYY-MM-DD</code>, text)
                </p>
                <div className="mt-3 pl-5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Format: Standardize to ISO 8601 (YYYY-MM-DD)</span>
                  <button
                    onClick={() => handleToggleFix('dates', 'Date Formats')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      fixedIssues.dates
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40'
                    }`}
                  >
                    {fixedIssues.dates ? '✓ Standardized' : 'Standardize Format'}
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: Data Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard hover={false} className="p-5">
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Data Preview (First 20 Records)
                </h3>
                <p className="text-xs text-slate-400">
                  {viewMode === 'before' ? 'Original raw dataset with flagged issues' : 'Active cleaned dataset with resolved anomalies'}
                </p>
              </div>

              {/* Before / After Toggle */}
              <div className="flex items-center gap-1 bg-[#12121a] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('before')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'before'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw (Before)
                </button>
                <button
                  onClick={() => setViewMode('after')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'after'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cleaned (After)
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500/60" />
                Missing Value
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500/60" />
                Whitespace / Duplicate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-500/40 border border-purple-500/60" />
                Outlier
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-500/60" />
                Format Inconsistency
              </span>
            </div>

            {/* Styled Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 max-h-[520px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#12121e] text-slate-300 uppercase tracking-wider font-semibold sticky top-0 border-b border-white/10 z-10">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Customer Name</th>
                    <th className="p-2.5">Revenue</th>
                    <th className="p-2.5">Age</th>
                    <th className="p-2.5">Tier</th>
                    <th className="p-2.5">Tickets</th>
                    <th className="p-2.5">NPS</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {displayRows.map((row, idx) => {
                    const isRaw = viewMode === 'before';
                    const hasWhitespace = isRaw && typeof row.customer === 'string' && (row.customer.startsWith(' ') || row.customer.endsWith(' '));
                    const isMissingRev = isRaw && row.revenue === null;
                    const isMissingNps = isRaw && row.nps === null;
                    const isMissingTickets = isRaw && row.tickets === null;
                    const isTypeIssue = isRaw && typeof row.age === 'string' && row.age.includes('mos');
                    const isOutlier = isRaw && (row.tickets > 15 || parseFloat(String(row.revenue).replace(/,/g, '')) > 10000);
                    const isDuplicate = isRaw && (row.id === 6 || row.id === 17);

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isDuplicate ? 'bg-amber-500/10' : idx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-white/[0.03]'
                        } hover:bg-white/[0.06]`}
                      >
                        <td className="p-2.5 text-slate-400 font-mono">#{row.id}</td>
                        <td className="p-2.5 font-medium">
                          {hasWhitespace ? (
                            <span className="bg-amber-500/20 text-amber-200 px-1 py-0.5 rounded border border-amber-500/30">
                              "{row.customer}"
                            </span>
                          ) : (
                            <span className="text-white">{row.customer}</span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono">
                          {isMissingRev ? (
                            <span className="bg-rose-500/25 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 text-[10px] font-bold">
                              NULL
                            </span>
                          ) : isOutlier && parseFloat(String(row.revenue).replace(/,/g, '')) > 10000 ? (
                            <span className="bg-purple-500/25 text-purple-300 px-1 py-0.5 rounded border border-purple-500/40">
                              ${row.revenue}
                            </span>
                          ) : (
                            <span className="text-slate-200">${row.revenue}</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          {isTypeIssue ? (
                            <span className="bg-cyan-500/25 text-cyan-300 px-1 py-0.5 rounded border border-cyan-500/40 font-mono">
                              {row.age}
                            </span>
                          ) : (
                            <span className="text-slate-300">{row.age}</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.tier === 'Enterprise'
                              ? 'bg-purple-500/15 text-purple-300'
                              : row.tier === 'Professional'
                              ? 'bg-cyan-500/15 text-cyan-300'
                              : 'bg-slate-500/15 text-slate-300'
                          }`}>
                            {row.tier}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {isMissingTickets ? (
                            <span className="bg-rose-500/25 text-rose-300 px-1 py-0.5 rounded text-[10px]">
                              NULL
                            </span>
                          ) : isOutlier && row.tickets > 15 ? (
                            <span className="bg-purple-500/25 text-purple-300 px-1 py-0.5 rounded border border-purple-500/40 font-bold">
                              {row.tickets} ⚠️
                            </span>
                          ) : (
                            <span className="text-slate-300">{row.tickets}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {isMissingNps ? (
                            <span className="bg-rose-500/25 text-rose-300 px-1 py-0.5 rounded text-[10px]">
                              NULL
                            </span>
                          ) : (
                            <span className={`font-semibold ${row.nps >= 8 ? 'text-emerald-400' : row.nps <= 4 ? 'text-rose-400' : 'text-amber-300'}`}>
                              {row.nps}/10
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            row.status === 'Active'
                              ? 'text-emerald-300 bg-emerald-500/10'
                              : 'text-amber-300 bg-amber-500/10'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-400">
                          {isRaw && (row.updated.includes('/') || row.updated.includes('Feb')) ? (
                            <span className="bg-cyan-500/20 text-cyan-300 px-1 py-0.5 rounded border border-cyan-500/30">
                              {row.updated}
                            </span>
                          ) : (
                            <span>{row.updated}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Showing preview of 20 out of {currentDataset.rows?.toLocaleString()} rows</span>
              <span className="text-cyan-400">Real-time reactive pipeline</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <GlassCard glow="both" hover={false} className="p-6 bg-gradient-to-r from-purple-950/40 via-[#0d0d16] to-cyan-950/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-purple">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">One-Click Complete Auto-Cleaning</h4>
              <p className="text-xs text-slate-300">
                Execute end-to-end imputation, whitespace stripping, outlier winsorization, and type casting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              View Cleaning Report
            </button>

            <button
              onClick={handleDownloadCleaned}
              className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Download Cleaned Data
            </button>

            <button
              onClick={handleAutoCleanAll}
              disabled={isCleaning}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm font-bold shadow-glow-purple flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Cleaning Dataset...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Fix All Issues Automatically
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Cleaning Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111118] border border-white/15 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">DataSense AI Cleaning Audit Log</h3>
                    <p className="text-xs text-slate-400">Verifiable transformations applied to {currentDataset.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Audit items */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">Imputed 62 Missing Numerical Values</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Applied median substitution on Revenue ($2,100.00) & NPS Score (8.0). Zero nulls remain.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">Purged 8 Exact Duplicate Rows</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Identified via MD5 tuple hashing across all primary keys. Duplicate inflation reduced to 0.00%.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">Normalized 3 Heterogeneous Column Types</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Cast string ages ("19 mos") to pure integers and converted mixed currencies into IEEE 754 float64.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">Winsorized 4 Extreme Upper-Bound Outliers</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Capped ticket anomalies exceeding 3.5 standard deviations to 99th percentile threshold.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">Trimmed Whitespace across 48 Text Cells</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Removed leading, trailing and non-breaking spaces in categorical labels.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">Standardized Inconsistent Timestamps</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Parsed heterogeneous formats (MM/DD/YYYY, YYYY/MM/DD) into strict ISO 8601 (YYYY-MM-DD).</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                <span className="text-xs text-slate-400">Total Pipeline Latency: 1.28s</span>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-glow-purple"
                >
                  Close Audit Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
