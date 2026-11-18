import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import AIChat from './pages/AIChat';
import Reports from './pages/Reports';
import DataCleaner from './pages/DataCleaner';
import PivotTable from './pages/PivotTable';
import AdvancedCharts from './pages/AdvancedCharts';
import WhatIfStudio from './pages/WhatIfStudio';
import Templates from './pages/Templates';
import Compare from './pages/Compare';
import { AdPopup } from './components/Monetization/AdBanner';
import { checkUrlForProKey } from './utils/license';

export default function App() {
  useEffect(() => {
    // Check if user came with a magic pro activation link
    const res = checkUrlForProKey();
    if (res && res.success) {
      alert('🎉 DataSense AI Pro Mode Activated! Welcome to VIP access.');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Home />} />

        {/* App — no login required */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/analysis"  element={<Layout><Analysis /></Layout>} />
        <Route path="/ai-chat"   element={<Layout><AIChat /></Layout>} />
        <Route path="/reports"   element={<Layout><Reports /></Layout>} />
        <Route path="/cleaner"   element={<Layout><DataCleaner /></Layout>} />
        <Route path="/pivot"     element={<Layout><PivotTable /></Layout>} />
        <Route path="/charts"    element={<Layout><AdvancedCharts /></Layout>} />
        <Route path="/whatif"    element={<Layout><WhatIfStudio /></Layout>} />
        <Route path="/templates" element={<Layout><Templates /></Layout>} />
        <Route path="/compare"   element={<Layout><Compare /></Layout>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Popup ad — once per session, 12s delay */}
      <AdPopup delayMs={12000} />
    </BrowserRouter>
  );
}
