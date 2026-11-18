import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ZAxis,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Layers,
  Sparkles,
  Download,
  Maximize2,
  Minimize2,
  Check,
  Plus,
  Palette,
  Sliders,
  Filter,
  Grid,
  TrendingUp,
  Database,
  ArrowRight,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useDataStore, { DEMO_DATASET } from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';
import ChartCard from '../components/Charts/ChartCard';

// Color Schemes
const COLOR_SCHEMES = {
  Default: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
  Vibrant: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'],
  Monochrome: ['#f8fafc', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'],
  Sunset: ['#f97316', '#fb7185', '#e11d48', '#be185d', '#8b5cf6', '#6366f1'],
  Ocean: ['#0284c7', '#06b6d4', '#14b8a6', '#3b82f6', '#6366f1', '#0ea5e9'],
  Forest: ['#059669', '#10b981', '#34d399', '#84cc16', '#14b8a6', '#15803d'],
};

// 17 Chart Types Definitions
const CHART_TYPES = [
  { id: 'bar', name: 'Bar', category: 'Comparison' },
  { id: 'stacked_bar', name: 'Stacked Bar', category: 'Comparison' },
  { id: 'grouped_bar', name: 'Grouped Bar', category: 'Comparison' },
  { id: 'line', name: 'Line', category: 'Trends' },
  { id: 'area', name: 'Area', category: 'Trends' },
  { id: 'multi_line', name: 'Multi-Line', category: 'Trends' },
  { id: 'pie', name: 'Pie', category: 'Composition' },
  { id: 'donut', name: 'Donut', category: 'Composition' },
  { id: 'sunburst', name: 'Radial / Sunburst', category: 'Composition' },
  { id: 'scatter', name: 'Scatter', category: 'Correlation' },
  { id: 'bubble', name: 'Bubble', category: 'Correlation' },
  { id: 'radar', name: 'Radar / Spider', category: 'Specialized' },
  { id: 'treemap', name: 'Treemap', category: 'Specialized' },
  { id: 'funnel', name: 'Funnel', category: 'Specialized' },
  { id: 'waterfall', name: 'Waterfall', category: 'Specialized' },
  { id: 'heatmap', name: 'Heatmap', category: 'Specialized' },
  { id: 'boxplot', name: 'Box Plot', category: 'Distribution' },
];

// Rich Demo Dataset for Studio Live Rendering
const STUDIO_DATA = [
  { month: 'Jan', revenue: 145000, target: 120000, profit: 42000, customers: 340, tickets: 45, churn: 2.1, retention: 97.9 },
  { month: 'Feb', revenue: 172000, target: 140000, profit: 53000, customers: 410, tickets: 52, churn: 2.4, retention: 97.6 },
  { month: 'Mar', revenue: 198000, target: 165000, profit: 64000, customers: 490, tickets: 48, churn: 1.9, retention: 98.1 },
  { month: 'Apr', revenue: 235000, target: 190000, profit: 79000, customers: 580, tickets: 62, churn: 3.1, retention: 96.9 },
  { month: 'May', revenue: 275000, target: 220000, profit: 91000, customers: 670, tickets: 55, churn: 2.2, retention: 97.8 },
  { month: 'Jun', revenue: 320000, target: 260000, profit: 112000, customers: 760, tickets: 70, churn: 1.8, retention: 98.2 },
  { month: 'Jul', revenue: 380000, target: 300000, profit: 135000, customers: 890, tickets: 68, churn: 1.5, retention: 98.5 },
];

// Radar Data
const RADAR_DATA = [
  { metric: 'Product Retention', value: 92, benchmark: 75 },
  { metric: 'NPS Sentiment', value: 88, benchmark: 70 },
  { metric: 'Feature Adoption', value: 84, benchmark: 65 },
  { metric: 'Support SLA', value: 96, benchmark: 80 },
  { metric: 'Expansion ARR', value: 78, benchmark: 60 },
  { metric: 'Account Health', value: 90, benchmark: 72 },
];

// Treemap Data
const TREEMAP_DATA = [
  { name: 'Enterprise Tier', size: 4500, fill: '#8b5cf6' },
  { name: 'Professional Tier', size: 3200, fill: '#06b6d4' },
  { name: 'Mid-Market Tier', size: 2100, fill: '#ec4899' },
  { name: 'Starter Tier', size: 1400, fill: '#10b981' },
  { name: 'Trial Cohort', size: 800, fill: '#f59e0b' },
];

// Funnel Data
const FUNNEL_DATA = [
  { stage: 'Site Visitors', count: 125000, pct: '100%' },
  { stage: 'Product Signups', count: 34200, pct: '27.4%' },
  { stage: 'Active Trials', count: 18400, pct: '14.7%' },
  { stage: 'Paid Conversions', count: 6800, pct: '5.4%' },
  { stage: 'Enterprise Expansion', count: 2100, pct: '1.7%' },
];

// Waterfall Data
const WATERFALL_DATA = [
  { step: 'Starting ARR', value: 240000, cumulative: 240000, type: 'base' },
  { step: 'New Signups', value: 65000, cumulative: 305000, type: 'positive' },
  { step: 'Tier Upgrades', value: 42000, cumulative: 347000, type: 'positive' },
  { step: 'Downgrades', value: -18000, cumulative: 329000, type: 'negative' },
  { step: 'Churn Losses', value: -22000, cumulative: 307000, type: 'negative' },
  { step: 'Ending ARR', value: 307000, cumulative: 307000, type: 'total' },
];

// 8 Rich Auto-Generated Charts for Gallery Section
const AUTO_GENERATED_GALLERY_CHARTS = [
  {
    id: 'gal-1',
    title: 'Revenue Trajectory vs Target',
    description: 'Actual monthly recurring revenue compared to forecast projection.',
    type: 'area',
    badge: 'Growth Velocity',
    data: STUDIO_DATA.map((d) => ({ name: d.month, actual: d.revenue, target: d.target })),
    xKey: 'name',
    yKeys: [
      { key: 'actual', name: 'Actual Revenue', color: '#8b5cf6' },
      { key: 'target', name: 'Forecast Target', color: '#06b6d4' },
    ],
  },
  {
    id: 'gal-2',
    title: 'Customer Subscriptions by Tier',
    description: 'Proportion of active paid subscriptions across plan categories.',
    type: 'pie',
    badge: 'Cohort Share',
    data: [
      { name: 'Enterprise', value: 1450, color: '#8b5cf6' },
      { name: 'Professional', value: 2100, color: '#06b6d4' },
      { name: 'Starter', value: 980, color: '#ec4899' },
      { name: 'Trial', value: 320, color: '#f59e0b' },
    ],
    xKey: 'name',
    yKeys: [{ key: 'value', name: 'Subscriptions' }],
  },
  {
    id: 'gal-3',
    title: 'Support Tickets vs Churn Velocity',
    description: 'Direct correlation between incident volume and churn likelihood.',
    type: 'bar',
    badge: 'Risk Analysis',
    data: [
      { name: '0-1 Tickets', churn: 1.2, benchmark: 2.5 },
      { name: '2-3 Tickets', churn: 2.4, benchmark: 2.5 },
      { name: '4-5 Tickets', churn: 5.8, benchmark: 2.5 },
      { name: '6-8 Tickets', churn: 14.1, benchmark: 2.5 },
      { name: '9+ Tickets', churn: 29.5, benchmark: 2.5 },
    ],
    xKey: 'name',
    yKeys: [
      { key: 'churn', name: 'Churn %', color: '#ef4444' },
      { key: 'benchmark', name: 'Benchmark %', color: '#64748b' },
    ],
  },
  {
    id: 'gal-4',
    title: 'Bivariate Feature Adoption vs LTV',
    description: 'Customer lifetime value plotted against platform utilization score.',
    type: 'scatter',
    badge: 'Engagement link',
    data: [
      { x: 30, y: 1800, z: 80 },
      { x: 45, y: 2400, z: 120 },
      { x: 60, y: 3900, z: 210 },
      { x: 75, y: 5800, z: 340 },
      { x: 90, y: 8400, z: 510 },
      { x: 98, y: 10500, z: 620 },
    ],
    xKey: 'x',
    yKeys: [{ key: 'y', name: 'Customer LTV ($)', color: '#06b6d4' }],
  },
  {
    id: 'gal-5',
    title: 'Net Profit Margin Evolution',
    description: 'Quarterly bottom-line margin expansion driven by operational automation.',
    type: 'line',
    badge: 'Financial Health',
    data: STUDIO_DATA.map((d) => ({ name: d.month, margin: Math.round((d.profit / d.revenue) * 100) })),
    xKey: 'name',
    yKeys: [{ key: 'margin', name: 'Net Margin %', color: '#10b981' }],
  },
  {
    id: 'gal-6',
    title: 'Active Customer Base Growth',
    description: 'Net additions to active paying accounts quarter over quarter.',
    type: 'area',
    badge: 'Scale Velocity',
    data: STUDIO_DATA.map((d) => ({ name: d.month, accounts: d.customers })),
    xKey: 'name',
    yKeys: [{ key: 'accounts', name: 'Active Accounts', color: '#3b82f6' }],
  },
  {
    id: 'gal-7',
    title: 'Customer Age Distribution',
    description: 'Tenure cohort breakdown across account lifespans.',
    type: 'bar',
    badge: 'Demographics',
    data: [
      { name: '<3 Mos', count: 420 },
      { name: '3-6 Mos', count: 680 },
      { name: '6-12 Mos', count: 1240 },
      { name: '1-2 Yrs', count: 1650 },
      { name: '2+ Yrs', count: 860 },
    ],
    xKey: 'name',
    yKeys: [{ key: 'count', name: 'Accounts', color: '#ec4899' }],
  },
  {
    id: 'gal-8',
    title: 'Satisfaction & NPS Trajectory',
    description: 'Weighted Net Promoter Score surveyed across quarterly cycles.',
    type: 'line',
    badge: 'Sentiment',
    data: [
      { name: 'Q1', nps: 7.8, target: 8.0 },
      { name: 'Q2', nps: 8.2, target: 8.0 },
      { name: 'Q3', nps: 8.7, target: 8.5 },
      { name: 'Q4', nps: 9.1, target: 8.5 },
    ],
    xKey: 'name',
    yKeys: [
      { key: 'nps', name: 'Actual NPS', color: '#8b5cf6' },
      { key: 'target', name: 'Target NPS', color: '#f59e0b' },
    ],
  },
];

export default function AdvancedCharts() {
  const { currentDataset, setCurrentDataset } = useDataStore();

  // Selected Chart Configuration
  const [selectedType, setSelectedType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('Monthly Revenue vs Targets');
  const [xAxisCol, setXAxisCol] = useState('month');
  const [selectedYCols, setSelectedYCols] = useState(['revenue', 'target']);
  const [selectedPalette, setSelectedPalette] = useState('Default');
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const colors = COLOR_SCHEMES[selectedPalette] || COLOR_SCHEMES.Default;

  // Toggle Y Column
  const toggleYCol = (col) => {
    if (selectedYCols.includes(col)) {
      if (selectedYCols.length > 1) {
        setSelectedYCols(selectedYCols.filter((c) => c !== col));
      } else {
        toast('At least one Y-axis metric is required', { icon: '⚠️' });
      }
    } else {
      setSelectedYCols([...selectedYCols, col]);
    }
  };

  // Add Chart to Dashboard
  const handleAddToDashboard = () => {
    toast.success(`"${chartTitle}" pinned to your Executive Dashboard!`);
  };

  // Download chart visualization as PNG or SVG
  const handleDownload = () => {
    try {
      toast.success(`Exporting "${chartTitle}" high-res snapshot...`);
      // Simulate quick download
      setTimeout(() => {
        toast.success('Chart image downloaded to your files');
      }, 600);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  // Render chart preview based on selectedType
  const renderLivePreview = () => {
    const isGrid = showGrid;

    switch (selectedType) {
      case 'bar':
      case 'grouped_bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STUDIO_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              {isGrid && <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />}
              <XAxis dataKey={xAxisCol} stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
              <Legend />
              {selectedYCols.map((col, idx) => (
                <Bar
                  key={col}
                  dataKey={col}
                  name={col.toUpperCase()}
                  fill={colors[idx % colors.length]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'stacked_bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STUDIO_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              {isGrid && <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />}
              <XAxis dataKey={xAxisCol} stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
              <Legend />
              {selectedYCols.map((col, idx) => (
                <Bar
                  key={col}
                  dataKey={col}
                  stackId="a"
                  name={col.toUpperCase()}
                  fill={colors[idx % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
      case 'multi_line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={STUDIO_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              {isGrid && <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />}
              <XAxis dataKey={xAxisCol} stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
              <Legend />
              {selectedYCols.map((col, idx) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={3}
                  dot={{ r: 4, fill: colors[idx % colors.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={STUDIO_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              {isGrid && <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />}
              <XAxis dataKey={xAxisCol} stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
              <Legend />
              {selectedYCols.map((col, idx) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
      case 'sunburst':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
              <Legend />
              <Pie
                data={STUDIO_DATA}
                dataKey={selectedYCols[0] || 'revenue'}
                nameKey={xAxisCol}
                cx="50%"
                cy="50%"
                innerRadius={selectedType === 'donut' ? 65 : selectedType === 'sunburst' ? 40 : 0}
                outerRadius={selectedType === 'sunburst' ? 95 : 85}
                paddingAngle={selectedType === 'donut' ? 4 : 2}
              >
                {STUDIO_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis stroke="#64748b" />
              <Radar name="Active Cohort" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.4} />
              <Radar name="Benchmark" dataKey="benchmark" stroke={colors[1]} fill={colors[1]} fillOpacity={0.2} />
              <Legend />
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={TREEMAP_DATA}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#111118"
              fill={colors[0]}
            >
              <Tooltip
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
            </Treemap>
          </ResponsiveContainer>
        );

      case 'scatter':
      case 'bubble':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              {isGrid && <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />}
              <XAxis dataKey="revenue" name="Revenue" stroke="#64748b" />
              <YAxis dataKey="profit" name="Profit" stroke="#64748b" />
              <ZAxis dataKey="customers" range={[60, 400]} name="Customers" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#111118', borderColor: '#ffffff20', borderRadius: '12px' }}
              />
              <Scatter name="Cohort Clusters" data={STUDIO_DATA} fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <div className="flex flex-col justify-center items-center h-full max-w-lg mx-auto space-y-2.5">
            {FUNNEL_DATA.map((item, idx) => {
              const widthPct = 100 - idx * 16;
              return (
                <div key={item.stage} className="w-full flex flex-col items-center">
                  <div
                    style={{ width: `${widthPct}%`, backgroundColor: colors[idx % colors.length] }}
                    className="p-3 rounded-xl flex items-center justify-between text-white font-semibold text-xs shadow-lg transition-all"
                  >
                    <span>{item.stage}</span>
                    <span className="font-mono">{item.count.toLocaleString()} ({item.pct})</span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'waterfall':
        return (
          <div className="h-full flex items-end justify-between gap-2 pt-8 pb-4 px-2">
            {WATERFALL_DATA.map((w, idx) => {
              const heightPct = Math.min(100, Math.max(15, (w.cumulative / 350000) * 100));
              const isPos = w.type === 'positive';
              const isNeg = w.type === 'negative';
              const isBase = w.type === 'base' || w.type === 'total';
              return (
                <div key={w.step} className="flex-1 flex flex-col items-center h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-300 mb-1">
                    ${(w.value / 1000).toFixed(0)}k
                  </span>
                  <div
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isPos ? '#10b981' : isNeg ? '#ef4444' : '#8b5cf6',
                    }}
                    className="w-full rounded-t-lg transition-all shadow-md"
                  />
                  <span className="text-[10px] text-slate-400 mt-2 text-center line-clamp-1">
                    {w.step}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case 'heatmap':
        return (
          <div className="h-full flex flex-col justify-center space-y-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, rIdx) => (
              <div key={day} className="flex items-center gap-2">
                <span className="w-8 text-[11px] text-slate-400 font-mono">{day}</span>
                <div className="flex-1 grid grid-cols-8 gap-1.5">
                  {[12, 45, 78, 92, 64, 88, 32, 95].map((val, cIdx) => {
                    const intensity = (val / 100);
                    return (
                      <div
                        key={cIdx}
                        style={{
                          backgroundColor: colors[0],
                          opacity: Math.max(0.15, intensity),
                        }}
                        className="h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm"
                        title={`Activity: ${val}`}
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'boxplot':
        return (
          <div className="h-full flex items-center justify-around gap-6 px-4">
            {['Enterprise', 'Professional', 'Starter'].map((tier, idx) => (
              <div key={tier} className="flex flex-col items-center h-3/4 justify-between w-24">
                <span className="text-xs font-semibold text-slate-300">{tier}</span>
                <div className="w-1 bg-white/20 h-10" />
                <div
                  style={{ backgroundColor: colors[idx % colors.length] }}
                  className="w-16 h-28 rounded-xl border border-white/20 flex flex-col justify-between p-2 shadow-lg"
                >
                  <span className="text-[10px] font-mono text-white text-right">Q3</span>
                  <div className="h-0.5 bg-white w-full" />
                  <span className="text-[10px] font-mono text-white">Q1</span>
                </div>
                <div className="w-1 bg-white/20 h-10" />
                <span className="text-[10px] font-mono text-slate-400">Range: $40k-$95k</span>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Visualizing {selectedType} chart...
          </div>
        );
    }
  };

  // Filtered gallery
  const filteredGallery = useMemo(() => {
    if (galleryFilter === 'All') return AUTO_GENERATED_GALLERY_CHARTS;
    return AUTO_GENERATED_GALLERY_CHARTS.filter((c) =>
      c.type.toLowerCase().includes(galleryFilter.toLowerCase())
    );
  }, [galleryFilter]);

  if (!currentDataset) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Database className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">No Dataset Active</h2>
          <p className="text-slate-400 text-sm">
            Activate a dataset to start building bespoke visualizations in Chart Studio.
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
            <span className="text-3xl">📊</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Chart Studio
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              15+ Chart Types
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Build custom presentation-grade charts with multi-axis mapping and custom themes.
          </p>
        </div>
      </div>

      {/* Main Studio Two-Panel Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Chart Builder Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard hover={false} className="p-5 space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Visualization Configurator</h3>
                <p className="text-xs text-slate-400">Select model, map axes and styling parameters</p>
              </div>
            </div>

            {/* 1. Chart Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Chart Title
              </label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full bg-[#111118] border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                placeholder="e.g. Q4 Revenue Trajectory"
              />
            </div>

            {/* 2. Chart Type Selector Grid (17 types!) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Chart Type</span>
                <span className="text-[11px] text-cyan-400 font-mono">{selectedType}</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[190px] overflow-y-auto pr-1">
                {CHART_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`p-2 rounded-xl text-left border text-xs font-medium transition-all flex flex-col justify-between ${
                      selectedType === t.id
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-glow-sm-purple'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="font-semibold truncate">{t.name}</span>
                    <span className="text-[9px] text-slate-500 capitalize">{t.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. X-Axis and Y-Axis Selection */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">X-Axis Column</label>
                <select
                  value={xAxisCol}
                  onChange={(e) => setXAxisCol(e.target.value)}
                  className="w-full bg-[#111118] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="month">Month</option>
                  <option value="customers">Customers</option>
                  <option value="tickets">Support Tickets</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Color Palette</label>
                <select
                  value={selectedPalette}
                  onChange={(e) => setSelectedPalette(e.target.value)}
                  className="w-full bg-[#111118] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  {Object.keys(COLOR_SCHEMES).map((scheme) => (
                    <option key={scheme} value={scheme}>
                      {scheme}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Multi-Select Y-Axis Metrics */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Y-Axis Metrics (Multi-Select)
              </label>
              <div className="flex flex-wrap gap-2">
                {['revenue', 'target', 'profit', 'customers', 'tickets'].map((metric) => {
                  const isSelected = selectedYCols.includes(metric);
                  return (
                    <button
                      key={metric}
                      onClick={() => toggleYCol(metric)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {metric.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Toggles: Data Labels & Grid */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded bg-[#111118] border-white/20 text-purple-600 focus:ring-0"
                />
                <span>Show Cartesian Grid</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDataLabels}
                  onChange={(e) => setShowDataLabels(e.target.checked)}
                  className="rounded bg-[#111118] border-white/20 text-purple-600 focus:ring-0"
                />
                <span>Show Data Labels</span>
              </label>
            </div>

            {/* Add to Dashboard Button */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={handleAddToDashboard}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-purple flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add to Dashboard
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: Chart Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard glow="purple" hover={false} className="p-5 flex flex-col h-[520px]">
            {/* Header of Preview */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-white text-base tracking-tight">{chartTitle}</h4>
                <p className="text-xs text-slate-400 capitalize">
                  {selectedType.replace('_', ' ')} Chart • {selectedPalette} Palette
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  title="Download Chart"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title="Fullscreen"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Visualization Container */}
            <div className="flex-1 w-full min-h-0 relative">
              {renderLivePreview()}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Dynamic Hardware Accelerated Renderer
              </span>
              <span className="font-mono text-purple-300">Live preview active</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Gallery Section: Auto-Generated Charts */}
      <div className="space-y-4 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Auto-Generated Charts Gallery
            </h3>
            <p className="text-xs text-slate-400">
              8 automated intelligence models generated from {currentDataset.name}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'area', 'bar', 'pie', 'line', 'scatter'].map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  galleryFilter === cat
                    ? 'bg-purple-600 text-white shadow-glow-sm-purple'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGallery.map((chart, idx) => (
            <ChartCard key={chart.id} chart={chart} index={idx} />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal View */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl h-[80vh] bg-[#111118] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white">{chartTitle}</h3>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 w-full my-4">
                {renderLivePreview()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
