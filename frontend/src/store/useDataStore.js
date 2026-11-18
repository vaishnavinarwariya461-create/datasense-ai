import { create } from 'zustand';

// Pre-packaged rich demo dataset for instant exploration
export const DEMO_DATASET = {
  id: 'ds-demo-2024',
  name: 'Global_SaaS_Revenue_&_Retention_2024.csv',
  size: '2.4 MB',
  rows: 4850,
  columns: 14,
  uploadedAt: new Date().toISOString(),
  healthScore: {
    overall: 88,
    status: 'Excellent Health',
    completeness: 94,
    consistency: 86,
    uniqueness: 92,
    validity: 89,
    missingRows: 62,
    duplicateRows: 8,
    issuesCount: 3,
  },
  narrativeStory: `Across 4,850 customer records analyzed, customer lifetime value (LTV) grew by **28.4%** quarter-over-quarter, driven primarily by enterprise tier upgrades in North America and Western Europe. However, a significant churn vulnerability of **14.2%** was detected in accounts on legacy monthly billing with inactivity exceeding 45 days. Addressing these high-risk cohorts through automated retention sequences presents an immediate **$340,000 ARR recovery opportunity**.`,
  keyStats: {
    totalRows: 4850,
    totalColumns: 14,
    missingValuesPct: 1.28,
    duplicateRowsPct: 0.16,
    avgCustomerValue: '$3,842',
    churnRate: '4.8%',
    activeUsers: '3,912',
    mrrGrowth: '+18.5%',
  },
  columnStats: [
    { name: 'Customer_ID', type: 'string', mean: '-', median: '-', std: '-', min: 'CUST-0001', max: 'CUST-4850', nulls: 0, missingPct: 0 },
    { name: 'Monthly_Revenue', type: 'float', mean: '320.45', median: '249.00', std: '184.20', min: '29.00', max: '2450.00', nulls: 14, missingPct: 0.29 },
    { name: 'Customer_Age_Months', type: 'integer', mean: '18.4', median: '14.0', std: '11.8', min: '1', max: '72', nulls: 0, missingPct: 0 },
    { name: 'Plan_Tier', type: 'categorical', mean: '-', median: '-', std: '-', min: 'Starter', max: 'Enterprise', nulls: 0, missingPct: 0 },
    { name: 'Support_Tickets', type: 'integer', mean: '3.12', median: '2.0', std: '2.84', min: '0', max: '24', nulls: 21, missingPct: 0.43 },
    { name: 'NPS_Score', type: 'integer', mean: '8.4', median: '9.0', std: '1.9', min: '1', max: '10', nulls: 27, missingPct: 0.55 },
    { name: 'Churn_Probability', type: 'float', mean: '0.12', median: '0.08', std: '0.15', min: '0.01', max: '0.94', nulls: 0, missingPct: 0 },
    { name: 'Feature_Usage_Score', type: 'float', mean: '74.2', median: '78.0', std: '18.5', min: '12.0', max: '100.0', nulls: 0, missingPct: 0 },
  ],
  insights: [
    {
      id: 'ins-1',
      type: 'warning',
      title: 'Elevated Churn Risk in Monthly Starter Cohort',
      description: 'Accounts with support tickets > 5 and usage score < 50 show an 82% churn likelihood within 30 days.',
      score: 'High Impact',
      metric: '82% risk',
    },
    {
      id: 'ins-2',
      type: 'success',
      title: 'Strong Expansion Momentum in Enterprise Tier',
      description: 'Enterprise accounts increased seat utilization by 34%, showing highest retention (98.4%) across all tiers.',
      score: 'Growth Driver',
      metric: '+34% seats',
    },
    {
      id: 'ins-3',
      type: 'info',
      title: 'Feature Adoption Strongly Correlates with LTV',
      description: 'Customers adopting the automated reporting module show a 2.4x higher customer lifetime value ($6,400 vs $2,650).',
      score: 'Key Insight',
      metric: '2.4x LTV',
    },
    {
      id: 'ins-4',
      type: 'critical',
      title: 'Missing NPS Values in Mid-Market Segment',
      description: '27 records (12% of mid-market) lack survey responses, creating a blind spot in user satisfaction tracking.',
      score: 'Data Quality',
      metric: '27 nulls',
    },
  ],
  charts: [
    {
      id: 'chart-rev-trend',
      title: 'Monthly Recurring Revenue Trajectory',
      description: 'Historical performance across 2024 showing consistent month-over-month ARR expansion.',
      type: 'area',
      badge: 'Revenue Velocity',
      data: [
        { name: 'Jan', actual: 120, projected: 118, target: 110 },
        { name: 'Feb', actual: 145, projected: 135, target: 125 },
        { name: 'Mar', actual: 168, projected: 155, target: 140 },
        { name: 'Apr', actual: 195, projected: 180, target: 160 },
        { name: 'May', actual: 230, projected: 215, target: 185 },
        { name: 'Jun', actual: 265, projected: 250, target: 210 },
        { name: 'Jul', actual: 310, projected: 290, target: 240 },
        { name: 'Aug', actual: 345, projected: 330, target: 275 },
        { name: 'Sep', actual: 390, projected: 375, target: 310 },
        { name: 'Oct', actual: 440, projected: 420, target: 350 },
        { name: 'Nov', actual: 485, projected: 470, target: 395 },
        { name: 'Dec', actual: 540, projected: 520, target: 440 },
      ],
      xKey: 'name',
      yKeys: [
        { key: 'actual', name: 'Actual MRR ($k)', color: '#8b5cf6' },
        { key: 'projected', name: 'Forecast ($k)', color: '#06b6d4' },
      ],
    },
    {
      id: 'chart-plan-distribution',
      title: 'Customer Distribution by Subscription Tier',
      description: 'Proportion of active customer subscriptions across plan tiers.',
      type: 'pie',
      badge: 'Market Share',
      data: [
        { name: 'Enterprise', value: 1450, color: '#8b5cf6' },
        { name: 'Professional', value: 2100, color: '#06b6d4' },
        { name: 'Starter', value: 980, color: '#ec4899' },
        { name: 'Trial', value: 320, color: '#f59e0b' },
      ],
      xKey: 'name',
      yKeys: [{ key: 'value', name: 'Accounts' }],
    },
    {
      id: 'chart-nps-usage',
      title: 'Feature Usage Score vs Net Promoter Score',
      description: 'Bivariate distribution indicating strong satisfaction lift beyond 70% feature adoption.',
      type: 'scatter',
      badge: 'Engagement Link',
      data: [
        { x: 35, y: 5, z: 120, label: 'Cohort A' },
        { x: 45, y: 6, z: 190, label: 'Cohort B' },
        { x: 55, y: 7, z: 240, label: 'Cohort C' },
        { x: 68, y: 8, z: 410, label: 'Cohort D' },
        { x: 75, y: 8.5, z: 580, label: 'Cohort E' },
        { x: 82, y: 9.2, z: 720, label: 'Cohort F' },
        { x: 92, y: 9.8, z: 890, label: 'Cohort G' },
        { x: 98, y: 10, z: 950, label: 'Cohort H' },
      ],
      xKey: 'x',
      yKeys: [{ key: 'y', name: 'NPS Score', color: '#06b6d4' }],
    },
    {
      id: 'chart-tickets-churn',
      title: 'Average Churn Rate by Support Ticket Volume',
      description: 'Ticket escalations above 6 incidents correlate with a 3.8x churn surge.',
      type: 'bar',
      badge: 'Risk Analysis',
      data: [
        { name: '0-1 Tickets', churn: 2.1, benchmark: 3.5 },
        { name: '2-3 Tickets', churn: 3.8, benchmark: 3.5 },
        { name: '4-5 Tickets', churn: 6.9, benchmark: 3.5 },
        { name: '6-8 Tickets', churn: 14.5, benchmark: 3.5 },
        { name: '9+ Tickets', churn: 28.2, benchmark: 3.5 },
      ],
      xKey: 'name',
      yKeys: [
        { key: 'churn', name: 'Churn Rate %', color: '#8b5cf6' },
        { key: 'benchmark', name: 'Target %', color: '#06b6d4' },
      ],
    },
  ],
  correlations: [
    { var1: 'Feature_Usage_Score', var2: 'NPS_Score', value: 0.84, impact: 'Very Strong Positive' },
    { var1: 'Monthly_Revenue', var2: 'Customer_Age_Months', value: 0.72, impact: 'Strong Positive' },
    { var1: 'Support_Tickets', var2: 'Churn_Probability', value: 0.79, impact: 'Strong Positive' },
    { var1: 'Feature_Usage_Score', var2: 'Churn_Probability', value: -0.68, impact: 'Moderate Negative' },
    { var1: 'NPS_Score', var2: 'Churn_Probability', value: -0.74, impact: 'Strong Negative' },
  ],
  outliers: [
    { id: 'CUST-1042', field: 'Support_Tickets', value: '24 tickets', standardDev: '7.3σ above mean', severity: 'Critical' },
    { id: 'CUST-2891', field: 'Monthly_Revenue', value: '$2,450.00', standardDev: '11.5σ above mean', severity: 'High' },
    { id: 'CUST-0419', field: 'NPS_Score', value: '1.0 with $1,800/mo spend', standardDev: '3.9σ below mean', severity: 'Critical' },
    { id: 'CUST-3904', field: 'Feature_Usage_Score', value: '12.0 with Enterprise Tier', standardDev: '3.3σ below mean', severity: 'High' },
  ],
};

export const useDataStore = create((set, get) => ({
  // Core State
  currentDataset: DEMO_DATASET,
  datasets: [DEMO_DATASET],
  insights: DEMO_DATASET.insights,
  isAnalyzing: false,
  activeTab: 'overview',
  simulationValues: {
    priceMultiplier: 1.0,
    marketingSpendMultiplier: 1.0,
    retentionLiftPct: 0,
  },

  // AI Chat History
  chatHistory: [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello! I'm **DataSense AI**, your autonomous data analyst. 

I've examined **Global_SaaS_Revenue_&_Retention_2024.csv** (4,850 rows, 14 columns).
Key discovery: **Enterprise tier accounts have driven 64% of total revenue**, but clients with more than 5 support tickets exhibit a sharp **14.5% churn risk**.

Ask me anything about distributions, root causes, or run what-if scenarios!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Which customer cohort has the highest churn rate?',
        'Forecast revenue for the next 2 quarters',
        'Show correlation between tickets and NPS',
        'Summarize top data hygiene anomalies',
      ],
    },
  ],

  // Actions
  setCurrentDataset: (dataset) => {
    set((state) => ({
      currentDataset: dataset,
      insights: dataset?.insights || [],
      // Keep or add to datasets collection
      datasets: dataset && !state.datasets.some((d) => d.id === dataset.id)
        ? [dataset, ...state.datasets]
        : state.datasets,
    }));
  },

  addDataset: (dataset) => {
    set((state) => ({
      datasets: [dataset, ...state.datasets.filter((d) => d.id !== dataset.id)],
      currentDataset: dataset,
      insights: dataset.insights || [],
    }));
  },

  removeDataset: (id) => {
    set((state) => {
      const filtered = state.datasets.filter((d) => d.id !== id);
      return {
        datasets: filtered,
        currentDataset: state.currentDataset?.id === id ? filtered[0] || null : state.currentDataset,
      };
    });
  },

  addChatMessage: (message) => {
    set((state) => ({
      chatHistory: [...state.chatHistory, {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...message,
      }],
    }));
  },

  clearChat: () => {
    set({ chatHistory: [] });
  },

  setInsights: (insights) => {
    set({ insights });
  },

  setIsAnalyzing: (isAnalyzing) => {
    set({ isAnalyzing });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  updateWhatIfSimulation: (newValues) => {
    set((state) => ({
      simulationValues: { ...state.simulationValues, ...newValues },
    }));
  },

  clearData: () => {
    set({
      currentDataset: null,
      datasets: [],
      insights: [],
      chatHistory: [],
    });
  },

  resetToDemo: () => {
    set({
      currentDataset: DEMO_DATASET,
      datasets: [DEMO_DATASET],
      insights: DEMO_DATASET.insights,
    });
  },
}));

export default useDataStore;
