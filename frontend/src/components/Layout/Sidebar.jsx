import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  LayoutDashboard,
  FolderUp,
  Wand2,
  Table,
  BarChart3,
  Zap,
  Bot,
  Layers,
  GitCompare,
  FileText,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  Database,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null, emoji: '🏠' },
  { name: 'Upload & Analyze', path: '/analysis', icon: FolderUp, badge: 'Auto EDA', emoji: '📁' },
  { name: 'Data Cleaner', path: '/cleaner', icon: Wand2, badge: 'NEW', emoji: '🧹' },
  { name: 'Pivot Table', path: '/pivot', icon: Table, badge: 'NEW', emoji: '🔄' },
  { name: 'Advanced Charts', path: '/charts', icon: BarChart3, badge: '12+', emoji: '📊' },
  { name: 'What-If Studio', path: '/whatif', icon: Zap, badge: 'AI Sim', emoji: '🔮' },
  { name: 'AI Chat', path: '/ai-chat', icon: Bot, badge: 'Gemini', emoji: '🤖' },
  { name: 'Templates', path: '/templates', icon: Layers, badge: 'Ready', emoji: '📋' },
  { name: 'Compare Mode', path: '/compare', icon: GitCompare, badge: 'A/B', emoji: '🔁' },
  { name: 'Reports', path: '/reports', icon: FileText, badge: 'PDF', emoji: '📄' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { currentDataset } = useDataStore();

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64
          bg-[#0d0d16]/95 backdrop-blur-2xl
          flex flex-col justify-between transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r border-transparent [border-image:linear-gradient(to_bottom,#8b5cf6,#06b6d4,#ec4899,transparent)_1]
        `}
      >
        {/* Top: Logo & Close Button (Mobile) */}
        <div className="flex-1 overflow-y-auto">
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08]">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl animated-gradient-bg p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.6)] transform-gpu group-hover:scale-105 group-hover:rotate-3 transition-transform">
                <div className="w-full h-full bg-[#0d0d16] rounded-[10px] flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-cyan-400 group-hover:text-pink-400 transition-colors animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-gradient">
                  DataSense<span className="text-white ml-0.5 font-black">AI</span>
                </span>
                <span className="text-[9px] text-cyan-300 uppercase tracking-widest font-bold">
                  Gen-Z 3D Analytics
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Dataset Indicator Badge */}
          <div className="px-4 pt-3 pb-1">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-ping" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Active Dataset
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {currentDataset ? currentDataset.name : 'No dataset loaded'}
                </p>
              </div>
              <Database className="w-4 h-4 text-purple-400 shrink-0" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Menu & Studios
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `
                    relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold
                    transition-all duration-200 group
                    ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-purple-600/30 to-cyan-600/20 border-l-[3px] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'text-slate-400 hover:text-white hover:translate-x-1.5 hover:bg-white/[0.05] hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-cyan-400'
                              : 'text-slate-400 group-hover:text-purple-300'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-white/5 text-slate-400 border border-white/10 group-hover:border-purple-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-glow"
                            className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                          />
                        )}
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Pro Upgrade Banner & User Profile */}
        <div className="p-3 space-y-2.5 border-t border-white/[0.08] shrink-0">
          {/* Pro Card CTA with holographic effect */}
          <div className="relative rounded-2xl p-3 holographic border border-purple-500/40 overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-purple-500/30 text-purple-200">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </span>
              <span className="text-xs font-bold text-white tracking-wide">Upgrade to Pro</span>
              <span className="ml-auto text-[9px] font-black px-1.5 py-0.2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full">
                GEN-Z
              </span>
            </div>
            <p className="text-[10px] text-slate-200 mb-2 leading-tight">
              Unlimited uploads, custom Gemini reasoning & What-If models.
            </p>
            <Link
              to="/reports"
              className="w-full flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-glow-sm-purple transition-all"
            >
              <span>Unlock All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* LinkedIn Credit */}
          {/* LinkedIn Credit */}
          <a
            href="https://www.linkedin.com/in/neeraj-narwariya-45a39b349"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors group mb-1"
          >
            <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="text-[10px] text-slate-500 group-hover:text-blue-400 transition-colors truncate">Neeraj Narwariya</span>
          </a>

          {/* Footer badge */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                  DS
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0d0d16]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">DataSense AI</span>
                <span className="text-[9px] text-purple-300 font-semibold">Free · No Login</span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
