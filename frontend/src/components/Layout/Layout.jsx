import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex relative overflow-x-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-700/10 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-700/10 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-900/10 blur-[140px] pointer-events-none -z-10" />

      {/* Sidebar (Desktop fixed, Mobile sliding drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
