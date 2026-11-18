import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable GlassCard component with glassmorphism, customizable glow, and hover transitions.
 */
export default function GlassCard({
  children,
  className = '',
  glow = 'none', // 'purple' | 'cyan' | 'both' | 'none'
  hover = true,
  onClick,
  ...props
}) {
  const getGlowStyles = () => {
    switch (glow) {
      case 'purple':
        return 'shadow-glow-purple border-purple-500/30';
      case 'cyan':
        return 'shadow-glow-cyan border-cyan-500/30';
      case 'both':
        return 'shadow-glow-purple border-purple-500/20';
      default:
        return 'border-white/10 shadow-glass';
    }
  };

  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -3,
              borderColor:
                glow === 'cyan'
                  ? 'rgba(6, 182, 212, 0.45)'
                  : 'rgba(139, 92, 246, 0.45)',
              boxShadow:
                glow === 'cyan'
                  ? '0 12px 35px -5px rgba(6, 182, 212, 0.3)'
                  : '0 12px 35px -5px rgba(139, 92, 246, 0.25)',
              transition: { duration: 0.2 },
            }
          : undefined
      }
      onClick={onClick}
      className={`
        relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border 
        transition-colors duration-200 overflow-hidden
        ${getGlowStyles()}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle top reflection line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
