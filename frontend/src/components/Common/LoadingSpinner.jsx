import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated LoadingSpinner with dual gradient rotating rings and optional status messaging.
 */
export default function LoadingSpinner({
  size = 'md',
  text = 'Analyzing data...',
  subtext = 'Running statistical models & neural interpretations',
  fullScreen = false,
  className = '',
}) {
  const sizeMap = {
    sm: { container: 'w-8 h-8', outer: 'w-8 h-8 border-2', inner: 'w-5 h-5 border-2', text: 'text-xs' },
    md: { container: 'w-14 h-14', outer: 'w-14 h-14 border-2', inner: 'w-9 h-9 border-2', text: 'text-sm' },
    lg: { container: 'w-20 h-20', outer: 'w-20 h-20 border-[3px]', inner: 'w-12 h-12 border-2', text: 'text-base' },
    xl: { container: 'w-28 h-28', outer: 'w-28 h-28 border-4', inner: 'w-16 h-16 border-[3px]', text: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Outer Purple Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className={`absolute rounded-full border-t-purple-500 border-r-purple-500/30 border-b-transparent border-l-transparent ${currentSize.outer}`}
        />

        {/* Inner Cyan Ring (Reverse rotation) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className={`absolute rounded-full border-t-cyan-400 border-r-transparent border-b-cyan-400/30 border-l-transparent ${currentSize.inner}`}
        />

        {/* Pulsing Core Glow */}
        <motion.div
          animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_12px_#8b5cf6]"
        />
      </div>

      {text && (
        <div className="text-center space-y-1">
          <p className={`font-medium text-slate-200 tracking-wide ${currentSize.text}`}>
            {text}
          </p>
          {subtext && (
            <p className="text-xs text-slate-400 max-w-xs">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
