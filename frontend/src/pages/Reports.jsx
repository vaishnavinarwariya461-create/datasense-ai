import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  Printer,
  Copy,
  ExternalLink,
  Layers,
  TrendingUp,
  BarChart3,
  Calendar,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDataStore, DEMO_DATASET } from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';
import ChartRenderer from '../components/Charts/ChartRenderer';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Reports() {
  const { currentDataset, resetToDemo } = useDataStore();
  const [reportType, setReportType] = useState('executive'); // 'executive' | 'technical' | 'story'
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const dataset = currentDataset || DEMO_DATASET;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Generated report preview!');
    }, 600);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Report URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Configurator Header */}
      <div className="p-6 rounded-3xl bg-[#111118]/90 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-glow-sm-purple">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Intelligence Dossier & Report Studio
              </h2>
              <p className="text-xs text-slate-400">
                Generate board-ready briefs, technical audits, and executive summaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Link'}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-glow-sm-purple transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-white/[0.08]">
          {/* Report Type */}
          <div className="md:col-span-6 space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Select Report Format
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'executive', label: 'Executive Summary', badge: 'High-Level' },
                { id: 'technical', label: 'Technical Report', badge: 'Full Stats' },
                { id: 'story', label: 'Data Story', badge: 'Narrative' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    reportType === type.id
                      ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-glow-sm-purple'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <p className="text-xs font-bold">{type.label}</p>
                  <span className="text-[10px] text-slate-300">{type.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Report Options & Checkboxes */}
          <div className="md:col-span-6 space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Content Sections
            </span>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
                <span>Include Visual Charts</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnomalies}
                  onChange={(e) => setIncludeAnomalies(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
                <span>Include Anomaly Registry</span>
              </label>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Re-Generate Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state indicator */}
      {isGenerating && (
        <div className="py-12">
          <LoadingSpinner text="Compiling Report Dossier..." subtext="Synthesizing charts and statistical commentary" />
        </div>
      )}

      {/* Report Document Preview (Structured Paper View) */}
      {!isGenerating && (
        <div className="rounded-3xl bg-[#0f0f18] border border-white/10 p-6 md:p-12 shadow-2xl space-y-8 max-w-5xl mx-auto printable-report">
          {/* Document Header */}
          <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {reportType === 'technical' ? 'Statistical Dossier' : 'Executive Briefing'}
                </span>
                <span className="text-xs text-slate-300">Confidential</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {reportType === 'technical'
                  ? 'Tabular Data Quality & Empirical Correlation Audit'
                  : 'SaaS Revenue & Customer Cohort Strategic Evaluation'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Target Dataset: <span className="text-purple-300 font-mono">{dataset.name}</span> • Compiled by DataSense AI
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 space-y-1">
              <p className="font-mono">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-[11px] text-cyan-400 font-medium">DataSense Score™: 88/100</p>
            </div>
          </div>

          {/* Section 1: Executive Abstract */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
              1. Executive Abstract
            </h3>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs md:text-sm text-slate-200 leading-relaxed space-y-2">
              <p>
                {dataset.narrativeStory ||
                  'The dataset indicates robust top-line momentum across core segments with strong product utilization driving quarterly retention above industry benchmarks.'}
              </p>
            </div>
          </div>

          {/* Section 2: Core Metrics Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              2. Key Metric Indicators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Total Observations</span>
                <p className="text-lg font-mono font-bold text-white mt-0.5">{dataset.rows.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Total Dimensions</span>
                <p className="text-lg font-mono font-bold text-white mt-0.5">{dataset.columns} Features</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Missing Ratio</span>
                <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{dataset.keyStats?.missingValuesPct ?? 1.28}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Churn Likelihood</span>
                <p className="text-lg font-mono font-bold text-amber-400 mt-0.5">{dataset.keyStats?.churnRate ?? '4.8%'}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Embedded Charts */}
          {includeCharts && dataset.charts && dataset.charts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                3. Analytical Visualizations
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dataset.charts.slice(0, 2).map((chart, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <h4 className="text-xs font-bold text-white mb-1">{chart.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">{chart.description}</p>
                    <ChartRenderer
                      type={chart.type}
                      data={chart.data}
                      xKey={chart.xKey}
                      yKeys={chart.yKeys}
                      height={220}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Anomaly Registry */}
          {includeAnomalies && dataset.outliers && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                4. Statistical Outliers & Risk Factors
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Subject ID</th>
                      <th className="py-2 px-3">Dimension</th>
                      <th className="py-2 px-3">Value</th>
                      <th className="py-2 px-3">Standard Deviation</th>
                      <th className="py-2 px-3 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {dataset.outliers.map((o, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono font-bold text-white">{o.id}</td>
                        <td className="py-2 px-3 font-mono text-purple-300">{o.field}</td>
                        <td className="py-2 px-3 font-mono">{o.value}</td>
                        <td className="py-2 px-3 font-mono text-rose-400">{o.standardDev}</td>
                        <td className="py-2 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300">
                            {o.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: Strategic Recommendations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              5. Actionable Prescriptions
            </h3>
            <div className="space-y-2">
              {[
                'Deploy automated retention outreach on starter plan accounts exceeding 3 support escalations.',
                'Prioritize enterprise cross-sell campaigns where feature adoption score exceeds 75%.',
                'Resolve survey non-response gaps in mid-market cohorts to maintain NPS integrity.',
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Signature */}
          <div className="border-t border-white/10 pt-6 flex items-center justify-between text-[11px] text-slate-300">
            <span>Generated autonomously via DataSense AI Neural Pipeline</span>
            <span className="font-mono">Verification Hash: DS-2024-88A9F</span>
          </div>
        </div>
      )}

      {/* Free Tier Ad Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-indigo-950/30 to-cyan-950/20 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Free Plan Notice
          </span>
          <p className="text-xs text-slate-300">
            Upgrade to Pro to remove ads, generate automated weekly email briefs, and export custom white-labeled reports.
          </p>
        </div>
        <button
          onClick={() => window.open('https://stripe.com', '_blank')}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0"
        >
          <span>Upgrade to Pro</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
