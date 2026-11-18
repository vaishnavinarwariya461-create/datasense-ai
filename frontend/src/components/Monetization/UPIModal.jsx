import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * UPIModal — shows a scannable QR code for UPI payment.
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   plan: 'pro' | 'team'
 */

const PLANS = {
  pro: { label: 'Pro Plan', price: '₹1,599', usdPrice: '$19', color: 'from-purple-600 to-pink-600' },
  team: { label: 'Team Plan', price: '₹4,099', usdPrice: '$49', color: 'from-cyan-600 to-purple-600' },
};

// Replace with your actual UPI ID
const UPI_ID = '9589273314@yapl'; // Neeraj Narwariya — DataSense AI
const PAYEE_NAME = 'DataSense AI';

export default function UPIModal({ open, onClose, plan = 'pro' }) {
  const [copied, setCopied] = useState(false);
  const info = PLANS[plan] || PLANS.pro;

  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${plan === 'pro' ? '1599' : '4099'}&cu=INR&tn=${encodeURIComponent(`DataSense AI ${info.label}`)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&color=ffffff&bgcolor=1a1a2e&data=${encodeURIComponent(upiString)}`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111118] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold text-lg">{info.label}</h3>
                <p className="text-slate-400 text-sm">UPI se pay karo — instant!</p>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Price badge */}
            <div className={`bg-gradient-to-r ${info.color} rounded-xl p-3 mb-5 text-center`}>
              <p className="text-white/70 text-xs font-medium">Monthly Subscription</p>
              <p className="text-white text-3xl font-black">{info.price}</p>
              <p className="text-white/60 text-xs">{info.usdPrice}/month</p>
            </div>

            {/* QR Code */}
            <div className="bg-[#1a1a2e] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 mb-4">
              <img
                src={qrUrl}
                alt="UPI QR Code"
                className="w-48 h-48 rounded-lg"
                onError={(e) => { e.target.src = 'https://placehold.co/192x192/1a1a2e/ffffff?text=QR+Code'; }}
              />
              <p className="text-xs text-slate-400 text-center">
                PhonePe / GPay / Paytm se scan karo 📱
              </p>
            </div>

            {/* UPI ID copy */}
            <div
              onClick={copyUPI}
              className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/[0.07] transition-all group mb-4"
            >
              <div>
                <p className="text-xs text-slate-500 mb-0.5">UPI ID</p>
                <p className="text-white font-mono text-sm">{UPI_ID}</p>
              </div>
              <span className="text-xs text-purple-400 group-hover:text-purple-300 transition-colors font-medium">
                {copied ? '✅ Copied!' : '📋 Copy'}
              </span>
            </div>

            <p className="text-center text-xs text-slate-500">
              Payment ke baad screenshot bhejo{' '}
              <a
                href="https://www.linkedin.com/in/neeraj-narwariya-45a39b349"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                LinkedIn
              </a>{' '}
              pe — activate ho jayega 24hr mein ⚡
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
