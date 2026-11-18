import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  ArrowRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  ChevronRight,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useDataStore from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';

// 16 Full Business Templates
const TEMPLATES_CATALOG = [
  {
    id: 'tmpl-sales',
    emoji: '💰',
    title: 'Sales Dashboard',
    industry: 'Sales',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30',
    description: 'Track monthly sales velocity, rep quota attainment, product SKU performance, and regional pipelines.',
    rows: 4200,
    columns: 12,
    charts: ['Monthly MRR Trajectory', 'Regional Quota Attainment', 'Top 10 Product SKUs'],
    metrics: { kpi1: '$1.42M ARR', kpi2: '+22.4% QoQ', kpi3: '94% Win Rate' },
    sampleCsvHeaders: ['Deal_ID', 'Account_Name', 'Region', 'Rep_Name', 'Deal_Size', 'Stage', 'Close_Date', 'Product_SKU'],
  },
  {
    id: 'tmpl-loan',
    emoji: '🏦',
    title: 'Loan Portfolio',
    industry: 'Finance',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Monitor borrower risk scores, monthly EMI collections, non-performing asset (NPA) rates, and disbursements.',
    rows: 6800,
    columns: 14,
    charts: ['NPA Default Curve', 'Disbursements by Branch', 'Tenure vs Interest Yield'],
    metrics: { kpi1: '$18.4M Disbursed', kpi2: '1.82% NPA', kpi3: '98.1% Collection' },
    sampleCsvHeaders: ['Loan_ID', 'Borrower', 'Principal', 'Interest_Rate', 'Tenure_Months', 'Credit_Score', 'Status', 'EMI'],
  },
  {
    id: 'tmpl-hr',
    emoji: '👥',
    title: 'HR Analytics',
    industry: 'HR',
    color: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30',
    description: 'Analyze headcount distribution, voluntary attrition, salary compensation bands, and hiring funnel stages.',
    rows: 1850,
    columns: 10,
    charts: ['Attrition by Tenure', 'Department Salary Bands', 'Hiring Funnel Conversion'],
    metrics: { kpi1: '1,850 Headcount', kpi2: '4.8% Attrition', kpi3: '42d Time-to-Hire' },
    sampleCsvHeaders: ['Employee_ID', 'Department', 'Job_Title', 'Salary', 'Tenure_Yrs', 'Performance_Rating', 'Attrition_Status'],
  },
  {
    id: 'tmpl-marketing',
    emoji: '📈',
    title: 'Marketing Campaign',
    industry: 'Marketing',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Evaluate multi-touch attribution, ad spend return (ROAS), click-through rates, and lead cost across channels.',
    rows: 5200,
    columns: 11,
    charts: ['Channel Spend vs Revenue', 'CTR by Audience Segment', 'Cost Per Acquisition (CAC)'],
    metrics: { kpi1: '4.2x ROAS', kpi2: '$34.50 CAC', kpi3: '3.8% Overall CTR' },
    sampleCsvHeaders: ['Campaign_ID', 'Channel', 'Impressions', 'Clicks', 'Ad_Spend', 'Conversions', 'Attributed_Revenue'],
  },
  {
    id: 'tmpl-ecommerce',
    emoji: '🛒',
    title: 'E-commerce Store',
    industry: 'E-commerce',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
    description: 'Inspect basket size, cart abandonment, SKU return rates, logistics delivery time, and customer lifetime value.',
    rows: 9400,
    columns: 13,
    charts: ['Daily Gross Merchandise Vol', 'Return Rate by Category', 'Customer LTV Cohorts'],
    metrics: { kpi1: '$82.40 AOV', kpi2: '2.4% Cart Abandon', kpi3: '3.1d Delivery' },
    sampleCsvHeaders: ['Order_ID', 'Customer_ID', 'Cart_Value', 'Payment_Method', 'Shipping_City', 'Delivery_Days', 'Returned'],
  },
  {
    id: 'tmpl-hospital',
    emoji: '💊',
    title: 'Hospital Records',
    industry: 'Healthcare',
    color: 'from-red-500/20 to-rose-500/20 text-rose-300 border-rose-500/30',
    description: 'Audit patient inpatient days, ICU bed occupancy, diagnosis classifications, and 30-day readmission risk.',
    rows: 3600,
    columns: 15,
    charts: ['Bed Occupancy Trends', 'Diagnosis Distribution', 'Length of Stay (ALOS)'],
    metrics: { kpi1: '84% Bed Utilization', kpi2: '3.4d Avg Stay', kpi3: '1.2% Readmit Rate' },
    sampleCsvHeaders: ['Admission_ID', 'Patient_Age', 'Department', 'Primary_Diagnosis', 'Length_Of_Stay', 'Billing_Amount'],
  },
  {
    id: 'tmpl-student',
    emoji: '🎓',
    title: 'Student Performance',
    industry: 'Education',
    color: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30',
    description: 'Track academic grades, attendance correlation, subject difficulty percentiles, and semester graduation pace.',
    rows: 2400,
    columns: 9,
    charts: ['GPA Distribution Curve', 'Attendance vs Exam Score', 'Subject Pass Percentiles'],
    metrics: { kpi1: '3.42 Avg GPA', kpi2: '93.5% Attendance', kpi3: '96.2% Pass Rate' },
    sampleCsvHeaders: ['Student_ID', 'Semester', 'Course_Code', 'Attendance_Pct', 'Midterm_Score', 'Final_Grade', 'Status'],
  },
  {
    id: 'tmpl-realestate',
    emoji: '🏠',
    title: 'Real Estate',
    industry: 'Real Estate',
    color: 'from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30',
    description: 'Analyze residential square-foot pricing, days on market, zip-code appreciation trends, and rental yields.',
    rows: 3100,
    columns: 12,
    charts: ['Price per SqFt by Area', 'Days on Market Timeline', 'Gross Rental Yield Distribution'],
    metrics: { kpi1: '$420/sqft Avg', kpi2: '28d on Market', kpi3: '6.8% Rental Cap' },
    sampleCsvHeaders: ['Listing_ID', 'Property_Type', 'Neighborhood', 'Bedrooms', 'Sq_Footage', 'List_Price', 'Sold_Price'],
  },
  {
    id: 'tmpl-inventory',
    emoji: '📦',
    title: 'Inventory Management',
    industry: 'Operations',
    color: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
    description: 'Identify stockout risks, safety stock buffers, warehouse turnover ratios, and lead times across vendor suppliers.',
    rows: 4800,
    columns: 10,
    charts: ['Stockout Risk Matrix', 'Warehouse Turnover Ratio', 'Supplier Lead Times'],
    metrics: { kpi1: '99.2% Fill Rate', kpi2: '6.4x Stock Turns', kpi3: '14d Lead Time' },
    sampleCsvHeaders: ['SKU_ID', 'Warehouse_Location', 'Units_In_Stock', 'Reorder_Point', 'Unit_Cost', 'Turnover_Rate'],
  },
  {
    id: 'tmpl-creditcard',
    emoji: '💳',
    title: 'Credit Card Analysis',
    industry: 'Finance',
    color: 'from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30',
    description: 'Map spending categories, credit limit utilization, interchange fee revenue, and delinquent payment patterns.',
    rows: 7200,
    columns: 11,
    charts: ['Category Spend Breakdown', 'Credit Limit Utilization', 'Delinquency Roll-Rates'],
    metrics: { kpi1: '28.4% Utilization', kpi2: '$1,240 Avg Balance', kpi3: '0.8% 30+ DPD' },
    sampleCsvHeaders: ['Account_Num', 'Card_Tier', 'Monthly_Spend', 'Credit_Limit', 'Merchant_Category', 'Delinquency_Status'],
  },
  {
    id: 'tmpl-financial',
    emoji: '📊',
    title: 'Financial P&L',
    industry: 'Finance',
    color: 'from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Track gross revenues, OPEX line items, EBITDA margins, cash burn rate, and capital expenditure amortization.',
    rows: 1200,
    columns: 14,
    charts: ['EBITDA Margin Evolution', 'OPEX Breakdown by Dept', 'Free Cash Flow Trajectory'],
    metrics: { kpi1: '$4.8M Revenue', kpi2: '28.5% EBITDA', kpi3: '18mo Cash Runway' },
    sampleCsvHeaders: ['Period_Month', 'Gross_Revenue', 'COGS', 'Gross_Margin', 'R&D_Spend', 'G&A_Spend', 'EBITDA'],
  },
  {
    id: 'tmpl-vehicle',
    emoji: '🚗',
    title: 'Vehicle Fleet',
    industry: 'Operations',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30',
    description: 'Log diesel fuel efficiency, preventive maintenance schedules, telemetry route miles, and telemetry idle times.',
    rows: 2900,
    columns: 11,
    charts: ['Fleet MPG Efficiency', 'Maintenance Cost vs Age', 'Route Telemetry Idling'],
    metrics: { kpi1: '8.4 MPG Avg', kpi2: '$0.28 Cost/Mile', kpi3: '96% Fleet Uptime' },
    sampleCsvHeaders: ['Vehicle_VIN', 'Model_Year', 'Driver_Name', 'Miles_Driven', 'Fuel_Gallons', 'Maintenance_Cost_YTD'],
  },
  {
    id: 'tmpl-website',
    emoji: '🌐',
    title: 'Website Analytics',
    industry: 'Marketing',
    color: 'from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Inspect unique sessions, page load times, bounce rate by device, and multi-funnel landing page conversions.',
    rows: 8100,
    columns: 10,
    charts: ['Daily Unique Visitors', 'Device Bounce Rate Comparison', 'Top Organic Landing Pages'],
    metrics: { kpi1: '240k Sessions', kpi2: '38.2% Bounce Rate', kpi3: '1.4s Page Load' },
    sampleCsvHeaders: ['Date', 'Traffic_Source', 'Device_Category', 'Sessions', 'Bounce_Rate', 'Avg_Session_Duration'],
  },
  {
    id: 'tmpl-restaurant',
    emoji: '☕',
    title: 'Restaurant/Cafe',
    industry: 'Hospitality',
    color: 'from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30',
    description: 'Examine table turnover velocity, peak hour revenue spikes, food waste cost, and best-selling menu combinations.',
    rows: 3800,
    columns: 10,
    charts: ['Revenue by Hour of Day', 'Food Cost % by Dish', 'Table Turnover Rate'],
    metrics: { kpi1: '$48.50 Check Avg', kpi2: '42m Table Turn', kpi3: '26% Food Cost' },
    sampleCsvHeaders: ['Bill_ID', 'Table_No', 'Server_Name', 'Food_Revenue', 'Beverage_Revenue', 'Guests_Count', 'Peak_Hour'],
  },
  {
    id: 'tmpl-manufacturing',
    emoji: '🏭',
    title: 'Manufacturing',
    industry: 'Manufacturing',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30',
    description: 'Track overall equipment effectiveness (OEE), defect parts per million (PPM), plant downtime, and factory yields.',
    rows: 5500,
    columns: 12,
    charts: ['OEE by Production Line', 'Defect PPM Root Causes', 'Scheduled vs Unscheduled Downtime'],
    metrics: { kpi1: '88.4% OEE', kpi2: '142 PPM Defects', kpi3: '99.1% Yield' },
    sampleCsvHeaders: ['Batch_ID', 'Production_Line', 'Shift', 'Units_Produced', 'Defect_Count', 'Downtime_Minutes'],
  },
  {
    id: 'tmpl-app',
    emoji: '📱',
    title: 'App Analytics',
    industry: 'Tech',
    color: 'from-indigo-500/20 to-cyan-500/20 text-indigo-300 border-indigo-500/30',
    description: 'Analyze daily active users (DAU), day 1/7/30 retention cohorts, in-app purchases, and crash session rates.',
    rows: 10500,
    columns: 11,
    charts: ['DAU/MAU Stickiness', 'Retention Cohort Curves', 'In-App Purchase ARPU'],
    metrics: { kpi1: '64k DAU', kpi2: '42% D30 Retention', kpi3: '0.04% Crash Rate' },
    sampleCsvHeaders: ['User_UUID', 'Signup_Date', 'Platform_OS', 'Days_Active_L30', 'In_App_Purchases_Total', 'Crash_Count'],
  },
];

// Industry filter list
const INDUSTRIES = [
  'All',
  'Sales',
  'Finance',
  'HR',
  'Marketing',
  'Healthcare',
  'Education',
  'E-commerce',
  'Real Estate',
  'Operations',
  'Hospitality',
  'Manufacturing',
  'Tech',
];

export default function Templates() {
  const navigate = useNavigate();
  const { setCurrentDataset, setIsAnalyzing } = useDataStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATES_CATALOG.filter((t) => {
      const matchesIndustry = selectedIndustry === 'All' || t.industry.toLowerCase() === selectedIndustry.toLowerCase();
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.industry.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesIndustry && matchesSearch;
    });
  }, [searchQuery, selectedIndustry]);

  // Handle "Use This Template"
  const handleUseTemplate = (tmpl) => {
    toast.loading(`Deploying ${tmpl.title} template & modeling dataset...`, { id: 'deploy-tmpl' });

    // Generate rich dataset modeled for this template
    const simulatedDataset = {
      id: `tmpl-${tmpl.id}-${Date.now()}`,
      name: `${tmpl.title.replace(/\s+/g, '_')}_2024_Dataset.csv`,
      size: `${(tmpl.rows * 0.0006).toFixed(1)} MB`,
      rows: tmpl.rows,
      columns: tmpl.columns,
      uploadedAt: new Date().toISOString(),
      healthScore: {
        overall: 92,
        status: 'Excellent Health',
        completeness: 98,
        consistency: 90,
        uniqueness: 94,
        validity: 92,
        missingRows: 12,
        duplicateRows: 0,
        issuesCount: 1,
      },
      narrativeStory: `DataSense analyzed the **${tmpl.title}** suite. Performance indicates high stability with strong underlying velocity (${tmpl.metrics.kpi2}). The top quartile shows concentrated value retention.`,
      keyStats: {
        totalRows: tmpl.rows,
        totalColumns: tmpl.columns,
        missingValuesPct: 0.8,
        duplicateRowsPct: 0.0,
        avgCustomerValue: tmpl.metrics.kpi1,
        churnRate: tmpl.metrics.kpi2,
        activeUsers: `${Math.round(tmpl.rows * 0.85).toLocaleString()}`,
        mrrGrowth: tmpl.metrics.kpi2,
      },
      columnStats: tmpl.sampleCsvHeaders.map((col, idx) => ({
        name: col,
        type: idx % 2 === 0 ? 'string' : 'float',
        mean: idx % 2 === 0 ? '-' : '342.10',
        median: idx % 2 === 0 ? '-' : '310.00',
        std: idx % 2 === 0 ? '-' : '48.20',
        min: '10',
        max: '950',
        nulls: 0,
        missingPct: 0,
      })),
      insights: [
        {
          id: `ins-${tmpl.id}-1`,
          type: 'success',
          title: `Peak Efficiency Detected in ${tmpl.title}`,
          description: `Key KPI benchmark (${tmpl.metrics.kpi1}) is operating in the top 90th percentile across peer industry distributions.`,
          score: 'High Value',
          metric: tmpl.metrics.kpi1,
        },
        {
          id: `ins-${tmpl.id}-2`,
          type: 'info',
          title: `Strong Expansion Trajectory (${tmpl.metrics.kpi2})`,
          description: 'Quarterly velocity shows sustained momentum across primary cohort dimensions.',
          score: 'Growth Driver',
          metric: tmpl.metrics.kpi2,
        },
      ],
      charts: [
        {
          id: `chart-${tmpl.id}-1`,
          title: tmpl.charts[0],
          description: 'Primary chronological performance trajectory.',
          type: 'area',
          badge: 'Velocity',
          data: [
            { name: 'Jan', actual: 120, projected: 110 },
            { name: 'Feb', actual: 145, projected: 130 },
            { name: 'Mar', actual: 178, projected: 160 },
            { name: 'Apr', actual: 210, projected: 195 },
            { name: 'May', actual: 255, projected: 235 },
            { name: 'Jun', actual: 310, projected: 280 },
          ],
          xKey: 'name',
          yKeys: [
            { key: 'actual', name: 'Actual Metric', color: '#8b5cf6' },
            { key: 'projected', name: 'Forecast Benchmark', color: '#06b6d4' },
          ],
        },
        {
          id: `chart-${tmpl.id}-2`,
          title: tmpl.charts[1],
          description: 'Distribution across segments.',
          type: 'bar',
          badge: 'Share',
          data: [
            { name: 'Segment Alpha', value: 420 },
            { name: 'Segment Beta', value: 310 },
            { name: 'Segment Gamma', value: 240 },
            { name: 'Segment Delta', value: 180 },
          ],
          xKey: 'name',
          yKeys: [{ key: 'value', name: 'Volume', color: '#06b6d4' }],
        },
      ],
    };

    setCurrentDataset(simulatedDataset);
    setIsAnalyzing(true);

    setTimeout(() => {
      toast.dismiss('deploy-tmpl');
      toast.success(`${tmpl.title} template deployed to Executive Dashboard!`);
      setIsAnalyzing(false);
      navigate('/dashboard');
    }, 900);
  };

  // Download Sample CSV
  const handleDownloadCsv = (e, tmpl) => {
    e.stopPropagation();
    try {
      const headers = tmpl.sampleCsvHeaders.join(',');
      const rows = [];

      for (let i = 1; i <= 25; i++) {
        const row = tmpl.sampleCsvHeaders.map((col, idx) => {
          if (col.includes('ID') || col.includes('VIN') || col.includes('UUID')) return `"${col.slice(0, 3)}-${1000 + i}"`;
          if (col.includes('Date')) return `"2024-03-${i < 10 ? '0' + i : i}"`;
          if (col.includes('Name') || col.includes('Borrower')) return `"Entity ${i}"`;
          if (col.includes('Stage') || col.includes('Status')) return i % 3 === 0 ? '"Closed Won"' : '"Active"';
          return Math.floor(Math.random() * 800 + 120);
        });
        rows.push(row.join(','));
      }

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${tmpl.title.toLowerCase().replace(/\s+/g, '_')}_sample.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded sample CSV for ${tmpl.title}`);
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Templates Library
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Har Business Ke Liye
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Production-ready industry datasets with automated EDA, statistical distributions & KPI dashboards.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <GlassCard hover={false} className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by industry, metric, or title..."
              className="w-full bg-[#111118] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono shrink-0">
            Showing {filteredTemplates.length} of 16 templates
          </span>
        </div>

        {/* Industry Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedIndustry === ind
                  ? 'bg-purple-600 text-white shadow-glow-sm-purple'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Templates Grid (All 16 templates) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTemplates.map((tmpl, idx) => (
          <motion.div
            key={tmpl.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="h-full"
          >
            <GlassCard
              hover={true}
              className="p-5 flex flex-col justify-between h-full group border-white/10 hover:border-purple-500/40 transition-all"
            >
              <div>
                {/* Top Row: Emoji & Industry Tag */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl p-2 rounded-2xl bg-white/[0.04] border border-white/5">
                    {tmpl.emoji}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r ${tmpl.color} border`}>
                    {tmpl.industry}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>

                {/* Sample Chart Thumbnails Preview */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Included Intelligence Models:
                  </span>
                  <div className="space-y-1">
                    {tmpl.charts.map((cName, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/[0.02] px-2 py-1 rounded-md"
                      >
                        <BarChart3 className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{cName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPI Highlights Bar */}
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1.5 rounded-xl border border-purple-500/20">
                  <span>{tmpl.metrics.kpi1}</span>
                  <span>•</span>
                  <span>{tmpl.metrics.kpi2}</span>
                  <span>•</span>
                  <span>{tmpl.metrics.kpi3}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={(e) => handleDownloadCsv(e, tmpl)}
                  title="Download Sample CSV"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleUseTemplate(tmpl)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-sm-purple flex items-center justify-center gap-1.5 transition-all group-hover:shadow-glow-purple"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
