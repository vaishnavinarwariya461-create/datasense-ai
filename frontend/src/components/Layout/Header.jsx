import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Database,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentDataset } = useDataStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine dynamic title and subtitle from pathname
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: 'Executive Dashboard',
          subtitle: 'Automated intelligence and high-level KPI telemetry',
        };
      case '/analysis':
        return {
          title: 'Deep Exploratory Analysis',
          subtitle: 'Distributions, correlation matrices, and anomaly detection',
        };
      case '/chat':
        return {
          title: 'AI Data Copilot',
          subtitle: 'Natural language dataset querying powered by Gemini',
        };
      case '/reports':
        return {
          title: 'Intelligence Reports',
          subtitle: 'Export publication-ready briefs and data narratives',
        };
      default:
        return {
          title: 'DataSense AI Studio',
          subtitle: 'Autonomous Exploratory Data Analysis & Discovery',
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {title}
            </h1>
            {currentDataset && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 max-w-[200px] truncate">
                <Database className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{currentDataset.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right: Search, Notifications, Dataset Action & Profile */}
      <div className="flex items-center gap-2.5 md:gap-4">
        {/* Glass Search Bar */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search metrics, columns, charts..."
            className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:bg-white/[0.07] transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 rounded">
            Ctrl+K
          </kbd>
        </div>

        {/* Quick Upload Button */}
        <button
          onClick={() => navigate('/analysis')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload Data</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0a0a0f] animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#111118] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  DataSense Alerts
                </span>
                <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      Exploratory profiling completed
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      4,850 rows processed with 14 derived metrics.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      High churn vulnerability detected
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Starter cohort accounts show a 14.5% risk spike.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Indicator / Decorative Toggle */}
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-purple-300" title="Dark Mode Active">
          <Moon className="w-4 h-4" />
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5">
            <div className="w-full h-full bg-[#111118] rounded-[10px] flex items-center justify-center font-bold text-xs text-purple-200">
              DA
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
