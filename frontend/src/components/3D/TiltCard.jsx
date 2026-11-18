import React, { useRef, useState } from 'react';

export default function TiltCard({
  children,
  maxTilt = 15,
  glare = true,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [isHovered, setIsHovered] = useState(false);
  const [glareState, setGlareState] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    
    if (glare) {
      setGlareState({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 1,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareState((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
        ...style,
      }}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      {...props}
    >
      {children}

      {/* Glare/Shine Effect */}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: glareState.opacity ? 0.35 : 0,
            background: `radial-gradient(circle 320px at ${glareState.x}% ${glareState.y}%, rgba(255, 255, 255, 0.25), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
