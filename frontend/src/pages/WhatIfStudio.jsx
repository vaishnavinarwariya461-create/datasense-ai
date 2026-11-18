import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Save,
  Check,
  BrainCircuit,
  ShieldAlert,
  Percent,
  DollarSign,
  Users,
  Database,
  ArrowRight,
  Layers,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import useDataStore, { DEMO_DATASET } from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';
import { getWhatIfAnalysis } from '../utils/api';

// Baseline Default Variables
const BASELINE_VARIABLES = {
  pricePerUser: 320, // $
  marketingSpend: 45000, // $
  retentionLift: 0, // %
  supportDeflection: 65, // %
  conversionRate: 4.2, // %
};

// Variable Configs with Min, Max, and Units
const VARIABLE_CONFIGS = [
  {
    key: 'pricePerUser',
    label: 'Price per Account (ARPU)',
    unit: '$',
    min: 150,
    max: 600,
    step: 5,
    baseline: 320,
    description: 'Average subscription revenue per active account per month',
  },
  {
    key: 'marketingSpend',
    label: 'Marketing Acquisition Budget',
    unit: '$',
    min: 10000,
    max: 120000,
    step: 2500,
    baseline: 45000,
    description: 'Total monthly performance ad spend and lead generation',
  },
  {
    key: 'retentionLift',
    label: 'Customer Retention Lift',
    unit: '%',
    min: -15,
    max: 25,
    step: 1,
    baseline: 0,
    description: 'Reduction in overall churn probability via success interventions',
  },
  {
    key: 'supportDeflection',
    label: 'Support Automation Rate',
    unit: '%',
    min: 20,
    max: 95,
    step: 5,
    baseline: 65,
    description: 'Percentage of tickets solved by autonomous AI without agent cost',
  },
  {
    key: 'conversionRate',
    label: 'Trial-to-Paid Conversion',
    unit: '%',
    min: 1.0,
    max: 10.0,
    step: 0.2,
    baseline: 4.2,
    description: 'Conversion velocity from free trial to paying tier',
  },
];

export default function WhatIfStudio() {
  const { currentDataset, setCurrentDataset } = useDataStore();

  // Active Scenario Name
  const [scenarioName, setScenarioName] = useState('Aggressive Expansion Q3');

  // Slider Variables State
  const [variables, setVariables] = useState(BASELINE_VARIABLES);

  // Saved Scenarios List
  const [savedScenarios, setSavedScenarios] = useState([
    {
      name: 'Baseline Reality',
      variables: { ...BASELINE_VARIABLES },
      revenue: 1552000,
      profit: 485000,
      customers: 4850,
      growth: 0,
    },
    {
      name: 'Best Case (Scale Out)',
      variables: {
        pricePerUser: 400,
        marketingSpend: 65000,
        retentionLift: 12,
        supportDeflection: 80,
        conversionRate: 6.0,
      },
      revenue: 2180000,
      profit: 745000,
      customers: 5450,
      growth: 40.5,
    },
    {
      name: 'Conservative Target',
      variables: {
        pricePerUser: 350,
        marketingSpend: 48000,
        retentionLift: 5,
        supportDeflection: 70,
        conversionRate: 4.8,
      },
      revenue: 1780000,
      profit: 560000,
      customers: 5085,
      growth: 14.7,
    },
  ]);

  // AI Analysis State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Simulation Calculations
  const simulation = useMemo(() => {
    const baseCustomers = 4850;
    const priceRatio = variables.pricePerUser / BASELINE_VARIABLES.pricePerUser;
    const mktRatio = variables.marketingSpend / BASELINE_VARIABLES.marketingSpend;
    const retLift = variables.retentionLift / 100;
    const convLift = (variables.conversionRate - BASELINE_VARIABLES.conversionRate) / BASELINE_VARIABLES.conversionRate;

    // Derived customer count: new signups from marketing + retained accounts
    const simulatedCustomers = Math.round(
      baseCustomers * (1 + retLift * 0.7) + (mktRatio - 1) * 350 + convLift * 280
    );

    // Baseline Revenue & Simulated Revenue
    const baselineRev = baseCustomers * BASELINE_VARIABLES.pricePerUser;
    const simulatedRev = simulatedCustomers * variables.pricePerUser;

    // Gross Margins & Costs
    const supportSavings = (variables.supportDeflection - BASELINE_VARIABLES.supportDeflection) * 1200;
    const baselineCost = 45000 + baseCustomers * 85;
    const simulatedCost = variables.marketingSpend + simulatedCustomers * 85 - supportSavings;

    const baselineProfit = baselineRev - baselineCost;
    const simulatedProfit = simulatedRev - simulatedCost;

    const revDiff = simulatedRev - baselineRev;
    const revPctChange = ((revDiff / baselineRev) * 100).toFixed(1);
    const profitDiff = simulatedProfit - baselineProfit;
    const profitPctChange = ((profitDiff / baselineProfit) * 100).toFixed(1);
    const customerDiff = simulatedCustomers - baseCustomers;

    return {
      baselineRev,
      simulatedRev,
      revDiff,
      revPctChange,
      baselineProfit,
      simulatedProfit,
      profitDiff,
      profitPctChange,
      simulatedCustomers,
      customerDiff,
      chartData: [
        {
          metric: 'Monthly Revenue ($k)',
          Baseline: Math.round(baselineRev / 1000),
          Simulated: Math.round(simulatedRev / 1000),
        },
        {
          metric: 'Gross Profit ($k)',
          Baseline: Math.round(baselineProfit / 1000),
          Simulated: Math.round(simulatedProfit / 1000),
        },
        {
          metric: 'Customer Base (x10)',
          Baseline: Math.round(baseCustomers / 10),
          Simulated: Math.round(simulatedCustomers / 10),
        },
      ],
    };
  }, [variables]);

  // Handle variable change
  const handleSliderChange = (key, val) => {
    setVariables((prev) => ({
      ...prev,
      [key]: parseFloat(val),
    }));
  };

  // Quick Preset Handlers
  const handleSetBestCase = () => {
    setScenarioName('Aggressive Best Case 🚀');
    setVariables({
      pricePerUser: 400,
      marketingSpend: 65000,
      retentionLift: 15,
      supportDeflection: 85,
      conversionRate: 6.2,
    });
    toast.success('Applied "Best Case" preset');
  };

  const handleSetWorstCase = () => {
    setScenarioName('Recession Worst Case 🛡️');
    setVariables({
      pricePerUser: 270,
      marketingSpend: 25000,
      retentionLift: -10,
      supportDeflection: 45,
      conversionRate: 2.8,
    });
    toast.success('Applied "Worst Case" preset');
  };

  const handleReset = () => {
    setScenarioName('Baseline Reality');
    setVariables({ ...BASELINE_VARIABLES });
    toast('Reset variables to original baseline', { icon: '🔄' });
  };

  // Save current scenario
  const handleSaveScenario = () => {
    const newScen = {
      name: scenarioName || `Scenario ${savedScenarios.length + 1}`,
      variables: { ...variables },
      revenue: simulation.simulatedRev,
      profit: simulation.simulatedProfit,
      customers: simulation.simulatedCustomers,
      growth: parseFloat(simulation.revPctChange),
    };
    setSavedScenarios([newScen, ...savedScenarios.slice(0, 4)]);
    toast.success(`Saved "${newScen.name}" for side-by-side comparison!`);
  };

  // Run AI Analysis
  const handleRunAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await getWhatIfAnalysis(currentDataset?.id || 'demo', {
        name: scenarioName,
        variables,
        simulation,
      });

      setAiReport(res);
      toast.success('Gemini AI simulation review generated!');
    } catch (err) {
      toast.error('AI analysis encountered an issue');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Database className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">No Dataset Active</h2>
          <p className="text-slate-400 text-sm">
            Activate a dataset to run live What-If scenario simulations.
          </p>
        </div>
        <button
          onClick={() => setCurrentDataset(DEMO_DATASET)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium shadow-glow-purple text-sm"
        >
          Load Demo Dataset
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔮</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              What-If Studio
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Predictive Simulator
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Variables change karo aur dekho kya hoga — simulate revenue, churn, and profit trajectories.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSetBestCase}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all flex items-center gap-1.5"
          >
            🚀 Best Case
          </button>
          <button
            onClick={handleSetWorstCase}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all flex items-center gap-1.5"
          >
            🛡️ Worst Case
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Delta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hover={false} className="p-4 border-l-4 border-l-purple-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Projected Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            ${(simulation.simulatedRev / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
            {simulation.revDiff >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +${(simulation.revDiff / 1000).toFixed(1)}k (+{simulation.revPctChange}%)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                -${Math.abs(simulation.revDiff / 1000).toFixed(1)}k ({simulation.revPctChange}%)
              </span>
            )}
            <span className="text-slate-500">vs base</span>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Gross Monthly Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ${(simulation.simulatedProfit / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
            {simulation.profitDiff >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                +${(simulation.profitDiff / 1000).toFixed(1)}k (+{simulation.profitPctChange}%)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-0.5">
                -${Math.abs(simulation.profitDiff / 1000).toFixed(1)}k ({simulation.profitPctChange}%)
              </span>
            )}
            <span className="text-slate-500">net margin</span>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-4 border-l-4 border-l-cyan-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Simulated Customer Base</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">
            {simulation.simulatedCustomers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
            {simulation.customerDiff >= 0 ? (
              <span className="text-cyan-400">+{simulation.customerDiff} accounts</span>
            ) : (
              <span className="text-rose-400">{simulation.customerDiff} accounts</span>
            )}
            <span className="text-slate-500">active pool</span>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-4 border-l-4 border-l-amber-500">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Annual Run-Rate (ARR)</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            ${((simulation.simulatedRev * 12) / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Projected 12-month ARR velocity
          </div>
        </GlassCard>
      </div>

      {/* Main Two-Panel Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Scenario Builder & Variable Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard hover={false} className="p-5 space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Scenario Variables</h3>
                <p className="text-xs text-slate-400">Adjust levers to simulate economic ripple effects</p>
              </div>
            </div>

            {/* Scenario Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Scenario Label
              </label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full bg-[#111118] border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                placeholder="Scenario Name (e.g. Target Case)"
              />
            </div>

            {/* Variable Sliders */}
            <div className="space-y-5">
              {VARIABLE_CONFIGS.map((cfg) => {
                const currentVal = variables[cfg.key];
                const deltaPct = (((currentVal - cfg.baseline) / cfg.baseline) * 100).toFixed(1);
                const isPositive = parseFloat(deltaPct) > 0;
                const isNegative = parseFloat(deltaPct) < 0;

                return (
                  <div key={cfg.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{cfg.label}</span>
                        <p className="text-[10px] text-slate-500">{cfg.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white text-sm">
                          {cfg.unit === '$' ? `$${currentVal.toLocaleString()}` : `${currentVal}${cfg.unit}`}
                        </span>
                        <div className="text-[10px] font-semibold">
                          {isPositive && <span className="text-emerald-400">+{deltaPct}%</span>}
                          {isNegative && <span className="text-rose-400">{deltaPct}%</span>}
                          {!isPositive && !isNegative && <span className="text-slate-500">Base</span>}
                        </div>
                      </div>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min={cfg.min}
                      max={cfg.max}
                      step={cfg.step}
                      value={currentVal}
                      onChange={(e) => handleSliderChange(cfg.key, e.target.value)}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{cfg.unit === '$' ? `$${cfg.min}` : `${cfg.min}${cfg.unit}`}</span>
                      <span>Baseline: {cfg.unit === '$' ? `$${cfg.baseline}` : `${cfg.baseline}${cfg.unit}`}</span>
                      <span>{cfg.unit === '$' ? `$${cfg.max}` : `${cfg.max}${cfg.unit}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions: Save Scenario */}
            <div className="pt-3 border-t border-white/10 flex gap-2">
              <button
                onClick={handleSaveScenario}
                className="flex-1 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4 text-purple-400" />
                Save Scenario
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-all"
              >
                Reset
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: Side-by-Side Comparison Chart & AI Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Chart Card */}
          <GlassCard hover={false} className="p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-white text-base">
                  Baseline vs Simulated Performance
                </h4>
                <p className="text-xs text-slate-400">
                  Real-time visualization of simulated shift against operational baseline
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Live Delta Model
              </span>
            </div>

            {/* Recharts BarChart */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulation.chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="Baseline" fill="#64748b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* AI Advisor Card: "What does AI think?" */}
          <GlassCard glow="purple" hover={false} className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Gemini Simulation Analysis</h4>
                  <p className="text-xs text-slate-400">Autonomous evaluation of scenario viability & risk</p>
                </div>
              </div>

              <button
                onClick={handleRunAiAnalysis}
                disabled={isAiAnalyzing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-glow-purple flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isAiAnalyzing ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Simulating with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    What does AI think?
                  </>
                )}
              </button>
            </div>

            {/* AI Report Body */}
            {aiReport ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs text-purple-200 font-semibold">Is This Scenario Realistic?</span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {aiReport.rating}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiReport.recommendation}
                </p>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                  <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Sensitivity & Risk Factors:
                  </span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                    {aiReport.risks?.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Click <strong className="text-purple-300">"What does AI think?"</strong> to analyze your custom parameter values through Google Gemini.
                </p>
                <span className="text-[11px] text-slate-500">Evaluates price elasticity, CAC thresholds & churn resilience</span>
              </div>
            )}
          </GlassCard>

          {/* Scenario Comparison Table */}
          <GlassCard hover={false} className="p-5">
            <h4 className="font-bold text-white text-base mb-1">Saved Scenario Benchmark</h4>
            <p className="text-xs text-slate-400 mb-4">Side-by-side comparison across saved configurations</p>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#12121e] text-slate-300 font-semibold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-2.5">Scenario</th>
                    <th className="p-2.5 text-right">Revenue</th>
                    <th className="p-2.5 text-right">Profit</th>
                    <th className="p-2.5 text-right">Customers</th>
                    <th className="p-2.5 text-right">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {savedScenarios.map((scen, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.04]">
                      <td className="p-2.5 font-medium text-white">{scen.name}</td>
                      <td className="p-2.5 text-right font-mono text-slate-300">
                        ${(scen.revenue / 1000).toFixed(0)}k
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-400">
                        ${(scen.profit / 1000).toFixed(0)}k
                      </td>
                      <td className="p-2.5 text-right font-mono text-cyan-300">
                        {scen.customers.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        <span className={scen.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {scen.growth >= 0 ? `+${scen.growth}%` : `${scen.growth}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
