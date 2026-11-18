import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isProUser, activateProKey } from '../../utils/license';

const PLANS = {
  pro: { label: 'Pro Plan', price: '₹1,599', usdPrice: '$19', color: 'from-purple-600 to-pink-600' },
  team: { label: 'Team Plan', price: '₹4,099', usdPrice: '$49', color: 'from-cyan-600 to-purple-600' },
};

const UPI_ID = '9589273314@yapl';
const PAYEE_NAME = 'DataSense AI';
const LINKEDIN_URL = 'https://www.linkedin.com/in/neeraj-narwariya-45a39b349';

export default function UPIModal({ open, onClose, plan = 'pro' }) {
  const [tab, setTab] = useState('pay'); // 'pay' | 'redeem'
  const [licenseKey, setLicenseKey] = useState('');
  const [redeemResult, setRedeemResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsPro(isProUser());
  }, [open]);

  const info = PLANS[plan] || PLANS.pro;
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${plan === 'pro' ? '1599' : '4099'}&cu=INR&tn=${encodeURIComponent(`DataSense AI ${info.label}`)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&color=ffffff&bgcolor=1a1a2e&data=${encodeURIComponent(upiString)}`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = (e) => {
    e.preventDefault();
    const result = activateProKey(licenseKey);
    setRedeemResult(result);
    if (result.success) {
      setIsPro(true);
      setTimeout(() => {
        onClose();
      }, 2200);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111118] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/10 relative overflow-hidden"
          >
            {/* Top close button */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  {info.label}
                  {isPro && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                      ACTIVE 👑
                    </span>
                  )}
                </h3>
                <p className="text-slate-400 text-xs">Unlock all 12+ charts, AI unlimited & exports</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Toggle Tabs: Pay vs Redeem */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-white/[0.04] border border-white/5 rounded-xl mb-4">
              <button
                onClick={() => setTab('pay')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'pay'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📱 Scan & Pay
              </button>
              <button
                onClick={() => setTab('redeem')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'redeem'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔑 Redeem Key
              </button>
            </div>

            {tab === 'pay' ? (
              <>
                {/* Price badge */}
                <div className={`bg-gradient-to-r ${info.color} rounded-xl p-3 mb-4 text-center`}>
                  <p className="text-white/70 text-xs font-medium">Monthly VIP Access</p>
                  <p className="text-white text-3xl font-black">{info.price}</p>
                  <p className="text-white/60 text-[11px]">{info.usdPrice}/month • UPI Direct</p>
                </div>

                {/* QR Code */}
                <div className="bg-[#1a1a2e] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 mb-3">
                  <img
                    src={qrUrl}
                    alt="UPI QR Code"
                    className="w-44 h-44 rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/176x176/1a1a2e/ffffff?text=QR+Code';
                    }}
                  />
                  <p className="text-[11px] text-slate-400 text-center">
                    PhonePe / GPay / Paytm / BHIM se scan karein 📱
                  </p>
                </div>

                {/* UPI ID copy */}
                <div
                  onClick={copyUPI}
                  className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 cursor-pointer hover:bg-white/[0.07] transition-all group mb-4"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">UPI ID</p>
                    <p className="text-white font-mono text-xs font-semibold truncate">{UPI_ID}</p>
                  </div>
                  <span className="text-xs text-purple-400 group-hover:text-purple-300 font-bold shrink-0 ml-2">
                    {copied ? '✅ Copied!' : '📋 Copy'}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-400">
                    Pay karne ke baad UTR/Screenshot bhejein:
                  </p>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline"
                  >
                    LinkedIn: Neeraj Narwariya →
                  </a>
                  <p className="text-[11px] text-slate-500">
                    Aapko turant Pro Key mil jayegi! ⚡
                  </p>
                </div>
              </>
            ) : (
              /* Redeem Key Tab */
              <div className="space-y-4 py-2">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left">
                  <p className="text-xs text-purple-200 font-semibold mb-1">
                    Payment kar diya hai? 🎁
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Aapko Neeraj ki taraf se mila <strong>VIP Pro Key</strong> yaha paste karke activate karein.
                  </p>
                </div>

                <form onSubmit={handleRedeem} className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Enter Pro Activation Key
                    </label>
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="e.g. PRO-NEERAJ-2026"
                      className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {redeemResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs p-2.5 rounded-lg border ${
                        redeemResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}
                    >
                      {redeemResult.message}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:opacity-95 shadow-glow-purple transition-all"
                  >
                    🚀 Activate Pro Access
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-white/5">
                  <p className="text-[11px] text-slate-500">
                    Key nahi mili?{' '}
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline font-semibold"
                    >
                      LinkedIn par message karein
                    </a>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
