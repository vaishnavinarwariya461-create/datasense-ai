import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TableProperties,
  Layers,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  Move,
  Hash,
  Type,
  Calendar,
  Check,
  ChevronDown,
  X,
  Plus,
  Filter,
  Sigma,
  Database,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useDataStore, { DEMO_DATASET } from '../store/useDataStore';
import GlassCard from '../components/Common/GlassCard';
import { getPivotData } from '../utils/api';

// Comprehensive mock dataset records for dynamic pivot aggregation
const RAW_PIVOT_RECORDS = [
  { Region: 'North America', Plan_Tier: 'Enterprise', Month: 'Jan', Category: 'Software', Revenue: 42000, Customers: 140, Support_Tickets: 12 },
  { Region: 'North America', Plan_Tier: 'Professional', Month: 'Jan', Category: 'Services', Revenue: 28000, Customers: 210, Support_Tickets: 25 },
  { Region: 'North America', Plan_Tier: 'Starter', Month: 'Jan', Category: 'Software', Revenue: 14000, Customers: 450, Support_Tickets: 58 },
  { Region: 'Europe', Plan_Tier: 'Enterprise', Month: 'Jan', Category: 'Software', Revenue: 38000, Customers: 110, Support_Tickets: 8 },
  { Region: 'Europe', Plan_Tier: 'Professional', Month: 'Jan', Category: 'Services', Revenue: 22000, Customers: 180, Support_Tickets: 19 },
  { Region: 'Europe', Plan_Tier: 'Starter', Month: 'Jan', Category: 'Software', Revenue: 11000, Customers: 390, Support_Tickets: 42 },
  { Region: 'Asia Pacific', Plan_Tier: 'Enterprise', Month: 'Jan', Category: 'Software', Revenue: 29000, Customers: 95, Support_Tickets: 15 },
  { Region: 'Asia Pacific', Plan_Tier: 'Professional', Month: 'Jan', Category: 'Services', Revenue: 19000, Customers: 160, Support_Tickets: 22 },
  { Region: 'North America', Plan_Tier: 'Enterprise', Month: 'Feb', Category: 'Software', Revenue: 46000, Customers: 155, Support_Tickets: 14 },
  { Region: 'North America', Plan_Tier: 'Professional', Month: 'Feb', Category: 'Services', Revenue: 31000, Customers: 225, Support_Tickets: 28 },
  { Region: 'North America', Plan_Tier: 'Starter', Month: 'Feb', Category: 'Software', Revenue: 15500, Customers: 470, Support_Tickets: 61 },
  { Region: 'Europe', Plan_Tier: 'Enterprise', Month: 'Feb', Category: 'Software', Revenue: 41000, Customers: 120, Support_Tickets: 11 },
  { Region: 'Europe', Plan_Tier: 'Professional', Month: 'Feb', Category: 'Services', Revenue: 24000, Customers: 195, Support_Tickets: 23 },
  { Region: 'Asia Pacific', Plan_Tier: 'Enterprise', Month: 'Feb', Category: 'Software', Revenue: 33000, Customers: 105, Support_Tickets: 16 },
  { Region: 'Asia Pacific', Plan_Tier: 'Professional', Month: 'Feb', Category: 'Services', Revenue: 21000, Customers: 175, Support_Tickets: 26 },
  { Region: 'North America', Plan_Tier: 'Enterprise', Month: 'Mar', Category: 'Software', Revenue: 51000, Customers: 170, Support_Tickets: 10 },
  { Region: 'North America', Plan_Tier: 'Professional', Month: 'Mar', Category: 'Services', Revenue: 34000, Customers: 240, Support_Tickets: 22 },
  { Region: 'Europe', Plan_Tier: 'Enterprise', Month: 'Mar', Category: 'Software', Revenue: 45000, Customers: 135, Support_Tickets: 9 },
  { Region: 'Europe', Plan_Tier: 'Professional', Month: 'Mar', Category: 'Services', Revenue: 27000, Customers: 210, Support_Tickets: 18 },
  { Region: 'Asia Pacific', Plan_Tier: 'Enterprise', Month: 'Mar', Category: 'Software', Revenue: 38000, Customers: 120, Support_Tickets: 14 },
];

// Pre-built Pivot Templates
const PIVOT_TEMPLATES = [
  {
    id: 'tmpl-1',
    name: 'Sales by Region & Month',
    rows: ['Region'],
    columns: ['Month'],
    value: 'Revenue',
    agg: 'sum',
  },
  {
    id: 'tmpl-2',
    name: 'Revenue by Category',
    rows: ['Category', 'Plan_Tier'],
    columns: ['Month'],
    value: 'Revenue',
    agg: 'sum',
  },
  {
    id: 'tmpl-3',
    name: 'HR Headcount by Department',
    rows: ['Region'],
    columns: ['Plan_Tier'],
    value: 'Customers',
    agg: 'sum',
  },
  {
    id: 'tmpl-4',
    name: 'Loan Portfolio by Status',
    rows: ['Plan_Tier'],
    columns: ['Region'],
    value: 'Support_Tickets',
    agg: 'avg',
  },
];

export default function PivotTable() {
  const { currentDataset, setCurrentDataset } = useDataStore();

  // Drag-and-drop zone states
  const [rowFields, setRowFields] = useState(['Region']);
  const [colFields, setColFields] = useState(['Month']);
  const [valueField, setValueField] = useState('Revenue');
  const [aggregation, setAggregation] = useState('sum'); // 'sum' | 'avg' | 'count' | 'min' | 'max'
  const [filterFields, setFilterFields] = useState([]);
  const [activeFilterValue, setActiveFilterValue] = useState('All');

  // Dragging metadata
  const [draggedItem, setDraggedItem] = useState(null);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Field categorization
  const dimensions = useMemo(() => ['Region', 'Plan_Tier', 'Month', 'Category'], []);
  const measures = useMemo(() => ['Revenue', 'Customers', 'Support_Tickets'], []);

  // HTML5 Drag Handlers
  const handleDragStart = (e, field, type) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ field, type }));
    setDraggedItem({ field, type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
      const { field } = data;
      if (!field) return;

      if (zone === 'rows') {
        if (!rowFields.includes(field)) setRowFields([...rowFields, field]);
      } else if (zone === 'columns') {
        if (!colFields.includes(field)) setColFields([...colFields, field]);
      } else if (zone === 'values') {
        setValueField(field);
      } else if (zone === 'filters') {
        if (!filterFields.includes(field)) setFilterFields([...filterFields, field]);
      }
      toast.success(`Added "${field}" to ${zone.toUpperCase()}`);
    } catch (err) {
      console.warn('Drop error:', err);
    } finally {
      setDraggedItem(null);
    }
  };

  // Remove field from dropzone
  const removeField = (zone, field) => {
    if (zone === 'rows') setRowFields(rowFields.filter((f) => f !== field));
    if (zone === 'columns') setColFields(colFields.filter((f) => f !== field));
    if (zone === 'filters') setFilterFields(filterFields.filter((f) => f !== field));
  };

  // Apply template
  const applyTemplate = (tmpl) => {
    setRowFields(tmpl.rows);
    setColFields(tmpl.columns);
    setValueField(tmpl.value);
    setAggregation(tmpl.agg);
    setFilterFields([]);
    toast.success(`Loaded template: ${tmpl.name}`);
  };

  // Compute Pivot Aggregation Matrix
  const pivotMatrix = useMemo(() => {
    const primaryRow = rowFields[0] || 'Region';
    const primaryCol = colFields[0] || 'Month';

    // Distinct Row values
    const distinctRows = Array.from(new Set(RAW_PIVOT_RECORDS.map((r) => r[primaryRow] || 'Other')));
    // Distinct Column values
    const distinctCols = Array.from(new Set(RAW_PIVOT_RECORDS.map((r) => r[primaryCol] || 'Other')));

    // Matrix cell aggregator
    const matrix = {};
    const colTotals = {};
    const rowTotals = {};
    let grandTotal = 0;
    let grandCount = 0;

    distinctRows.forEach((rVal) => {
      matrix[rVal] = {};
      rowTotals[rVal] = { sum: 0, count: 0, min: Infinity, max: -Infinity };

      distinctCols.forEach((cVal) => {
        matrix[rVal][cVal] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
      });
    });

    distinctCols.forEach((cVal) => {
      colTotals[cVal] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
    });

    // Populate data
    RAW_PIVOT_RECORDS.forEach((rec) => {
      const rVal = rec[primaryRow] || 'Other';
      const cVal = rec[primaryCol] || 'Other';
      const numVal = parseFloat(rec[valueField]) || 0;

      if (matrix[rVal] && matrix[rVal][cVal]) {
        matrix[rVal][cVal].sum += numVal;
        matrix[rVal][cVal].count += 1;
        matrix[rVal][cVal].min = Math.min(matrix[rVal][cVal].min, numVal);
        matrix[rVal][cVal].max = Math.max(matrix[rVal][cVal].max, numVal);

        rowTotals[rVal].sum += numVal;
        rowTotals[rVal].count += 1;
        rowTotals[rVal].min = Math.min(rowTotals[rVal].min, numVal);
        rowTotals[rVal].max = Math.max(rowTotals[rVal].max, numVal);

        colTotals[cVal].sum += numVal;
        colTotals[cVal].count += 1;
        colTotals[cVal].min = Math.min(colTotals[cVal].min, numVal);
        colTotals[cVal].max = Math.max(colTotals[cVal].max, numVal);

        grandTotal += numVal;
        grandCount += 1;
      }
    });

    // Formatting helper according to active aggregation
    const formatValue = (cell) => {
      if (!cell || cell.count === 0) return '-';
      let val = 0;
      switch (aggregation) {
        case 'avg':
          val = cell.sum / cell.count;
          break;
        case 'count':
          val = cell.count;
          break;
        case 'min':
          val = cell.min === Infinity ? 0 : cell.min;
          break;
        case 'max':
          val = cell.max === -Infinity ? 0 : cell.max;
          break;
        case 'sum':
        default:
          val = cell.sum;
          break;
      }

      if (valueField === 'Revenue') {
        return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
      }
      return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    };

    return {
      distinctRows,
      distinctCols,
      matrix,
      rowTotals,
      colTotals,
      grandTotal: formatValue({ sum: grandTotal, count: grandCount, min: 0, max: grandTotal }),
      formatValue,
      primaryRow,
      primaryCol,
    };
  }, [rowFields, colFields, valueField, aggregation]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    try {
      const { distinctRows, distinctCols, matrix, rowTotals, formatValue, primaryRow } = pivotMatrix;
      const headers = [primaryRow, ...distinctCols, 'Grand Total'];
      const rows = [];

      distinctRows.forEach((rVal) => {
        const row = [rVal];
        distinctCols.forEach((cVal) => {
          row.push(`"${formatValue(matrix[rVal][cVal])}"`);
        });
        row.push(`"${formatValue(rowTotals[rVal])}"`);
        rows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `pivot_${valueField.toLowerCase()}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Pivot Table exported successfully!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  // Export to PDF print view
  const handleExportPdf = () => {
    window.print();
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
            Please activate a dataset to build multidimensional pivot aggregations.
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔄</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Pivot Table Builder
            </h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Multidimensional Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Drag columns to build your table — slice, dice, and aggregate across dimensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export as Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            Export as PDF
          </button>
        </div>
      </div>

      {/* Pre-built Pivot Templates Bar */}
      <GlassCard hover={false} className="p-4 bg-gradient-to-r from-purple-950/20 to-cyan-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Instant Templates:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {PIVOT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-purple-400/40 transition-all whitespace-nowrap"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Main Builder Layout: Left Sidebar + Drop Zones + Output Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar — Field List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard hover={false} className="p-5 space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Dataset Fields</h3>
                <p className="text-xs text-slate-400">Drag chips into zones or click to add</p>
              </div>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                {dimensions.length + measures.length} fields
              </span>
            </div>

            {/* Category 1: Dimensions (Categorical) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
                Dimensions (Categorical)
              </span>
              <div className="flex flex-wrap gap-2">
                {dimensions.map((dim) => (
                  <div
                    key={dim}
                    draggable
                    onDragStart={(e) => handleDragStart(e, dim, 'dimension')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium cursor-grab active:cursor-grabbing shadow-sm transition-all group"
                  >
                    <Move className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100" />
                    <span>{dim}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2: Measures (Numeric) */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-400" />
                Measures (Numeric Metrics)
              </span>
              <div className="flex flex-wrap gap-2">
                {measures.map((meas) => (
                  <div
                    key={meas}
                    draggable
                    onDragStart={(e) => handleDragStart(e, meas, 'measure')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium cursor-grab active:cursor-grabbing shadow-sm transition-all group"
                  >
                    <Sigma className="w-3 h-3 text-purple-400 opacity-60 group-hover:opacity-100" />
                    <span>{meas}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aggregation Function Selector */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Aggregation Function:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {['sum', 'avg', 'count', 'min', 'max'].map((agg) => (
                  <button
                    key={agg}
                    onClick={() => setAggregation(agg)}
                    className={`py-1.5 text-xs font-semibold uppercase rounded-lg border transition-all ${
                      aggregation === agg
                        ? 'bg-purple-600 text-white border-purple-400 shadow-glow-sm-purple'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {agg}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Area — 4 Drop Zones & Pivot Output (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Drop Zones Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zone 1: ROWS */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'rows')}
              className="p-4 rounded-2xl bg-white/[0.03] border-2 border-dashed border-white/15 hover:border-purple-500/40 transition-colors min-h-[110px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <TableProperties className="w-3.5 h-3.5" />
                  Rows (Y-Axis)
                </span>
                <span className="text-[10px] text-slate-500">Drag dimensions here</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {rowFields.map((field) => (
                  <span
                    key={field}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-medium"
                  >
                    {field}
                    <button
                      onClick={() => removeField('rows', field)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {rowFields.length === 0 && (
                  <span className="text-xs text-slate-500 italic">Drop row columns here</span>
                )}
              </div>
            </div>

            {/* Zone 2: COLUMNS */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'columns')}
              className="p-4 rounded-2xl bg-white/[0.03] border-2 border-dashed border-white/15 hover:border-cyan-500/40 transition-colors min-h-[110px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Layers className="w-3.5 h-3.5" />
                  Columns (X-Axis)
                </span>
                <span className="text-[10px] text-slate-500">Drag dimensions here</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colFields.map((field) => (
                  <span
                    key={field}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 text-xs font-medium"
                  >
                    {field}
                    <button
                      onClick={() => removeField('columns', field)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {colFields.length === 0 && (
                  <span className="text-xs text-slate-500 italic">Drop column categories here</span>
                )}
              </div>
            </div>

            {/* Zone 3: VALUES */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'values')}
              className="p-4 rounded-2xl bg-white/[0.03] border-2 border-dashed border-white/15 hover:border-emerald-500/40 transition-colors min-h-[110px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Sigma className="w-3.5 h-3.5" />
                  Values ({aggregation.toUpperCase()})
                </span>
                <span className="text-[10px] text-slate-500">Measure to aggregate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs font-medium">
                  {aggregation.toUpperCase()}({valueField})
                </span>
              </div>
            </div>

            {/* Zone 4: FILTERS */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'filters')}
              className="p-4 rounded-2xl bg-white/[0.03] border-2 border-dashed border-white/15 hover:border-amber-500/40 transition-colors min-h-[110px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                </span>
                <span className="text-[10px] text-slate-500">Slice dataset</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterFields.map((field) => (
                  <span
                    key={field}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-medium"
                  >
                    {field}: All
                    <button
                      onClick={() => removeField('filters', field)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filterFields.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No filters active (showing 100%)</span>
                )}
              </div>
            </div>
          </div>

          {/* Rendered Pivot Table Output */}
          <GlassCard hover={false} className="p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <TableProperties className="w-4 h-4 text-purple-400" />
                  Calculated Pivot Table
                </h4>
                <p className="text-xs text-slate-400">
                  Grouped by <span className="text-purple-300 font-medium">{pivotMatrix.primaryRow}</span> × <span className="text-cyan-300 font-medium">{pivotMatrix.primaryCol}</span> ({aggregation} of {valueField})
                </p>
              </div>

              <button
                onClick={() => {
                  setRowFields(['Region']);
                  setColFields(['Month']);
                  setValueField('Revenue');
                  setAggregation('sum');
                  toast('Pivot reset to defaults', { icon: '🔄' });
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#12121e] text-slate-200 font-bold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-3 border-r border-white/10 text-purple-300">
                      {pivotMatrix.primaryRow} \ {pivotMatrix.primaryCol}
                    </th>
                    {pivotMatrix.distinctCols.map((col) => (
                      <th key={col} className="p-3 text-right font-mono text-cyan-300">
                        {col}
                      </th>
                    ))}
                    <th className="p-3 text-right font-mono text-amber-300 border-l border-white/10 bg-white/[0.02]">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {pivotMatrix.distinctRows.map((rowVal, idx) => (
                    <tr
                      key={rowVal}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-white/[0.03]'
                      } hover:bg-white/[0.06]`}
                    >
                      <td className="p-3 font-semibold text-white border-r border-white/10">
                        {rowVal}
                      </td>
                      {pivotMatrix.distinctCols.map((colVal) => {
                        const cell = pivotMatrix.matrix[rowVal]?.[colVal];
                        return (
                          <td key={colVal} className="p-3 text-right font-mono text-slate-300">
                            {pivotMatrix.formatValue(cell)}
                          </td>
                        );
                      })}
                      {/* Row Grand Total */}
                      <td className="p-3 text-right font-mono font-bold text-amber-200 border-l border-white/10 bg-white/[0.02]">
                        {pivotMatrix.formatValue(pivotMatrix.rowTotals[rowVal])}
                      </td>
                    </tr>
                  ))}

                  {/* Grand Totals Bottom Row */}
                  <tr className="bg-[#161622] font-bold border-t-2 border-white/20 text-white">
                    <td className="p-3 border-r border-white/10 text-amber-300 uppercase tracking-wider">
                      Grand Total
                    </td>
                    {pivotMatrix.distinctCols.map((colVal) => (
                      <td key={colVal} className="p-3 text-right font-mono text-cyan-300">
                        {pivotMatrix.formatValue(pivotMatrix.colTotals[colVal])}
                      </td>
                    ))}
                    <td className="p-3 text-right font-mono text-emerald-400 border-l border-white/10 bg-emerald-500/10 text-sm">
                      {pivotMatrix.grandTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
