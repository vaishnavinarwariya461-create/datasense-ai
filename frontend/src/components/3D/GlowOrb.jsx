import React from 'react';
import { motion } from 'framer-motion';

export default function GlowOrb({
  color = 'purple',
  size = 360,
  top,
  left,
  right,
  bottom,
  position = {},
  opacity = 0.5,
  className = '',
  delay = 0,
}) {
  const gradients = {
    purple: 'radial-gradient(circle, rgba(139, 92, 246, 0.55) 0%, rgba(99, 102, 241, 0.25) 45%, transparent 70%)',
    cyan: 'radial-gradient(circle, rgba(6, 182, 212, 0.55) 0%, rgba(14, 165, 233, 0.25) 45%, transparent 70%)',
    pink: 'radial-gradient(circle, rgba(236, 72, 153, 0.55) 0%, rgba(217, 70, 239, 0.25) 45%, transparent 70%)',
    gold: 'radial-gradient(circle, rgba(245, 158, 11, 0.55) 0%, rgba(217, 119, 6, 0.25) 45%, transparent 70%)',
  };

  const chosenGradient = gradients[color] || gradients.purple;
  const dimension = typeof size === 'number' ? `${size}px` : size;

  const posStyle = {
    top: top !== undefined ? top : position.top,
    left: left !== undefined ? left : position.left,
    right: right !== undefined ? right : position.right,
    bottom: bottom !== undefined ? bottom : position.bottom,
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: [1, 1.18, 0.94, 1],
        opacity: [opacity * 0.8, opacity * 1.15, opacity * 0.9, opacity * 0.8],
      }}
      transition={{
        duration: 9,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      style={{
        width: dimension,
        height: dimension,
        background: chosenGradient,
        filter: 'blur(75px)',
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 0,
        ...posStyle,
      }}
      className={`rounded-full ${className}`}
    />
  );
}
