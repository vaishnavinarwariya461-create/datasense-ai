import React from 'react';
import {
  ResponsiveContainer,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ZAxis,
} from 'recharts';

// Custom Palette for DataSense AI
const PALETTE = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

/**
 * Custom Glass Tooltip for all Recharts visualizations
 */
const CustomGlassTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111118]/95 backdrop-blur-xl border border-white/15 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[130px]">
        {label !== undefined && (
          <p className="font-semibold text-slate-200 border-b border-white/10 pb-1 mb-1">
            {label}
          </p>
        )}
        {payload.map((entry, index) => (
          <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill || '#8b5cf6' }}
              />
              <span className="text-slate-400 font-medium">
                {entry.name || entry.dataKey}:
              </span>
            </div>
            <span className="font-bold text-white font-mono">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartRenderer({
  type = 'area',
  data = [],
  xKey = 'name',
  yKeys = [],
  height = 300,
  colors = PALETTE,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs italic">
        No graphical data points to render.
      </div>
    );
  }

  // Ensure yKeys has fallback
  const resolvedYKeys = yKeys.length > 0 ? yKeys : [{ key: 'value', name: 'Value', color: '#8b5cf6' }];

  switch (type.toLowerCase()) {
    case 'bar':
    case 'histogram':
      return (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradientPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="barGradientCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey={xKey} stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip content={<CustomGlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              {resolvedYKeys.map((item, index) => (
                <Bar
                  key={item.key || index}
                  dataKey={item.key}
                  name={item.name || item.key}
                  fill={index === 0 ? 'url(#barGradientPurple)' : (item.color || colors[index % colors.length])}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'line':
      return (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey={xKey} stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip content={<CustomGlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              {resolvedYKeys.map((item, index) => (
                <Line
                  key={item.key || index}
                  type="monotone"
                  dataKey={item.key}
                  name={item.name || item.key}
                  stroke={item.color || colors[index % colors.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: item.color || colors[index % colors.length], strokeWidth: 1 }}
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );

    case 'area':
      return (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradientPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="areaGradientCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey={xKey} stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip content={<CustomGlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              {resolvedYKeys.map((item, index) => (
                <Area
                  key={item.key || index}
                  type="monotone"
                  dataKey={item.key}
                  name={item.name || item.key}
                  stroke={item.color || (index === 0 ? '#8b5cf6' : '#06b6d4')}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={index === 0 ? 'url(#areaGradientPurple)' : 'url(#areaGradientCyan)'}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );

    case 'pie':
      return (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomGlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Pie
                data={data}
                dataKey="value"
                nameKey={xKey || 'name'}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                stroke="#111118"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || colors[index % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );

    case 'scatter':
      return (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="x" name="Metric X" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis dataKey="y" name="Metric Y" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <ZAxis dataKey="z" range={[60, 300]} name="Volume" />
              <Tooltip content={<CustomGlassTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Data Distribution" data={data} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-64 text-slate-500 text-xs">
          Unsupported chart format: {type}
        </div>
      );
  }
}
