import { useEffect, useRef, useState } from 'react';

/**
 * AdBanner — Google AdSense compatible ad slot component.
 *
 * HOW TO ACTIVATE REAL ADS:
 * 1. Apply at adsense.google.com (needs live website, takes 1-2 weeks approval)
 * 2. Replace PUBLISHER_ID with your ca-pub-XXXXXXXXXXXXXXXX
 * 3. Replace adSlot values with your real slot IDs from AdSense dashboard
 * 4. Add the AdSense script to index.html (see comment in that file)
 *
 * Until approved: shows beautiful placeholder banners.
 */

const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; // ← Replace after AdSense approval
const IS_ADSENSE_LIVE = false; // ← Set to true after AdSense approval

// Placeholder ad designs while waiting for AdSense approval
const PLACEHOLDER_ADS = [
  {
    label: '🚀 Upgrade to Pro',
    sub: 'Unlimited charts, AI insights & more — ₹1,599/mo',
    cta: 'Get Pro →',
    gradient: 'from-purple-600/20 to-pink-600/20',
    border: 'border-purple-500/30',
    ctaClass: 'bg-purple-600 hover:bg-purple-500',
    link: '#pricing',
  },
  {
    label: '📊 Gemini AI Analysis',
    sub: 'Get AI-powered insights for your data instantly',
    cta: 'Try Free →',
    gradient: 'from-cyan-600/20 to-blue-600/20',
    border: 'border-cyan-500/30',
    ctaClass: 'bg-cyan-600 hover:bg-cyan-500',
    link: '/ai-chat',
  },
  {
    label: '🔗 Connect on LinkedIn',
    sub: 'Follow the creator — Neeraj Narwariya',
    cta: 'Connect →',
    gradient: 'from-blue-600/20 to-indigo-600/20',
    border: 'border-blue-500/30',
    ctaClass: 'bg-blue-600 hover:bg-blue-500',
    link: 'https://www.linkedin.com/in/neeraj-narwariya-45a39b349',
  },
];

export function AdBanner({ slot = 'horizontal', className = '' }) {
  const adRef = useRef(null);
  const [adIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDER_ADS.length));
  const ad = PLACEHOLDER_ADS[adIdx];

  useEffect(() => {
    if (!IS_ADSENSE_LIVE) return;
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense push failed:', e);
    }
  }, []);

  if (IS_ADSENSE_LIVE) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Beautiful placeholder ad
  return (
    <a
      href={ad.link}
      target={ad.link.startsWith('http') ? '_blank' : '_self'}
      rel="noopener noreferrer"
      className={`
        flex items-center justify-between gap-4 px-4 py-3
        bg-gradient-to-r ${ad.gradient} border ${ad.border}
        rounded-xl cursor-pointer hover:opacity-90 transition-all group
        ${className}
      `}
    >
      <div className="min-w-0">
        <p className="text-white text-sm font-semibold truncate">{ad.label}</p>
        <p className="text-slate-400 text-xs truncate">{ad.sub}</p>
      </div>
      <span className={`shrink-0 text-xs font-bold text-white px-3 py-1.5 rounded-lg ${ad.ctaClass} transition-colors`}>
        {ad.cta}
      </span>
    </a>
  );
}

/**
 * AdPopup — shows a dismissible popup ad after a delay.
 * Usage: <AdPopup delayMs={8000} />
 */
export function AdPopup({ delayMs = 10000 }) {
  const [visible, setVisible] = useState(false);
  const [adIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDER_ADS.length));
  const ad = PLACEHOLDER_ADS[adIdx];

  useEffect(() => {
    const shown = sessionStorage.getItem('ds_popup_shown');
    if (shown) return;
    const t = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem('ds_popup_shown', '1');
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-xs w-full animate-in slide-in-from-bottom-4">
      <div className={`bg-gradient-to-br ${ad.gradient} border ${ad.border} backdrop-blur-xl rounded-2xl p-5 shadow-2xl shadow-black/40`}>
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <p className="text-white font-bold text-base mb-1">{ad.label}</p>
        <p className="text-slate-300 text-sm mb-4">{ad.sub}</p>
        <div className="flex gap-2">
          <a
            href={ad.link}
            target={ad.link.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className={`flex-1 text-center text-sm font-bold text-white py-2 rounded-xl ${ad.ctaClass} transition-colors`}
          >
            {ad.cta}
          </a>
          <button
            onClick={() => setVisible(false)}
            className="px-4 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">Sponsored · DataSense AI</p>
      </div>
    </div>
  );
}
