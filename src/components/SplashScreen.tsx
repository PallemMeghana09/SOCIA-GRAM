import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entry' | 'pulsing'>('entry');
  const [showText, setShowText] = useState(false);

  // Generate stable floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 260 - 130, // moderate dispersion
      y: Math.random() * 260 - 130,
      scale: Math.random() * 0.4 + 0.3,
      duration: Math.random() * 4 + 3.5,
      delay: Math.random() * 1.2,
    }));
  }, []);

  useEffect(() => {
    // 1. Entry phase (0.0 to 0.8 Seconds) zoom finishes, transition to pulsing
    const phaseTimer = setTimeout(() => {
      setAnimationPhase('pulsing');
    }, 800);

    // 2. Text fades in (2.5 to 3.2 Seconds)
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 2500);

    // 3. Smooth exit fade out starts at 3.3 Seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3300);

    // 4. Call onComplete after exit transition finishes at 4.0 Seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden select-none"
      id="splash-screen-container"
    >
      {/* Soft light-green radial gradient centered behind the logo */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: "radial-gradient(circle at center, rgba(230,244,234,0.65) 0%, rgba(255,255,255,1) 72%)"
        }} 
        id="splash-radial-bg"
      />

      {/* Elegant green ambient glow/halo behind the logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          animationPhase === 'pulsing'
            ? {
                opacity: [0.35, 0.65, 0.35],
                scale: [1, 1.15, 1],
              }
            : { opacity: 0, scale: 0.8 }
        }
        transition={{
          opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          delay: animationPhase === 'entry' ? 0.8 : 0,
        }}
        className="absolute bg-emerald-500/15 blur-3xl rounded-full w-72 h-72 z-0"
        id="splash-glow"
      />

      <div className="relative flex flex-col items-center justify-center max-w-lg px-6" id="splash-content-wrapper">
        
        {/* Floating particles around the logo (active in pulsing phase) */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={
              animationPhase === 'pulsing'
                ? {
                    opacity: [0, 0.5, 0.5, 0],
                    x: [0, p.x, p.x * 1.05],
                    y: [0, p.y, p.y * 1.05],
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full pointer-events-none z-0"
          />
        ))}

        {/* The center vector Logo with smooth zoom-in and gentle continuous float */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={
            animationPhase === 'entry'
              ? { scale: 1, opacity: 1 }
              : { scale: [1, 1.03, 1], opacity: 1 }
          }
          transition={
            animationPhase === 'entry'
              ? { duration: 0.8, ease: "easeInOut" }
              : { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
          }
          className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 drop-shadow-[0_12px_24px_rgba(4,120,87,0.12)] filter"
          id="splash-logo"
        >
          {/* SVG representation of the premium Pentagon Governance logo */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Definitions for Gradients and Filters */}
            <defs>
              <linearGradient id="topGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e6f4ea" />
                <stop offset="100%" stopColor="#c2e7d9" />
              </linearGradient>
              <linearGradient id="rightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f4fbf7" />
                <stop offset="100%" stopColor="#e1f5ec" />
              </linearGradient>
              <linearGradient id="bottomRightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e8f5e9" />
                <stop offset="100%" stopColor="#c8e6c9" />
              </linearGradient>
              <linearGradient id="bottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f0fdf4" />
                <stop offset="100%" stopColor="#d1e7dd" />
              </linearGradient>
              <linearGradient id="bottomLeftGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f4fbf7" />
                <stop offset="100%" stopColor="#e1f5ec" />
              </linearGradient>
              <linearGradient id="leftGrad" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#e8f5e9" />
                <stop offset="100%" stopColor="#c8e6c9" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#047857" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* 6 Polygon Segments meeting at center (100, 100) forming a perfect 6-pointed star */}
            {/* 1. Top Sector (Public Transport) */}
            <polygon points="100,100 74,55 100,10 126,55" fill="url(#topGrad)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
            
            {/* 2. Upper-Right Sector (Electricity Grid) */}
            <polygon points="100,100 126,55 178,55 152,100" fill="url(#rightGrad)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
            
            {/* 3. Lower-Right Sector (Water/Drainage) */}
            <polygon points="100,100 152,100 178,145 126,145" fill="url(#bottomRightGrad)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
            
            {/* 4. Bottom Sector (School/Education) */}
            <polygon points="100,100 126,145 100,190 74,145" fill="url(#bottomGrad)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
            
            {/* 5. Lower-Left Sector (Waste/Garbage) */}
            <polygon points="100,100 74,145 22,145 48,100" fill="url(#bottomLeftGrad)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
            
            {/* 6. Upper-Left Sector (Broken Road) */}
            <polygon points="100,100 48,100 22,55 74,55" fill="url(#leftGrad)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />

            {/* Icons Inside Segments */}
            {/* Top Segment: Bus Icon */}
            <g transform="translate(100, 32)">
              <rect x="-8" y="-6" width="16" height="11" rx="2" fill="none" stroke="#047857" strokeWidth="1.5" />
              <circle cx="-4" cy="7" r="1.5" fill="#047857" />
              <circle cx="4" cy="7" r="1.5" fill="#047857" />
              <line x1="-8" y1="1" x2="8" y2="1" stroke="#047857" strokeWidth="1" />
              <rect x="-5" y="-4" width="4" height="3" rx="0.5" fill="none" stroke="#047857" strokeWidth="1" />
              <rect x="1" y="-4" width="4" height="3" rx="0.5" fill="none" stroke="#047857" strokeWidth="1" />
            </g>

            {/* Upper-Right Segment: Electrical Grid Pole */}
            <g transform="translate(150, 70)">
              <line x1="0" y1="10" x2="0" y2="-10" stroke="#047857" strokeWidth="1.5" />
              <line x1="-8" y1="-6" x2="8" y2="-6" stroke="#047857" strokeWidth="1.5" />
              <line x1="-6" y1="-1" x2="6" y2="-1" stroke="#047857" strokeWidth="1.2" />
              <path d="M-8,-6 L-10,-10 M8,-6 L10,-10 M0,-10 L0,-14" stroke="#047857" strokeWidth="1" />
              <path d="M-12,2 Q0,6 12,2" fill="none" stroke="#059669" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
            </g>

            {/* Lower-Right Segment: Water Drainage */}
            <g transform="translate(150, 130)">
              <circle cx="0" cy="-4" r="4" fill="none" stroke="#047857" strokeWidth="1.5" />
              <path d="M0,0 C0,3 -4,4 -2,8 M0,0 C0,3 4,4 2,8" fill="none" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M-6,9 Q0,11 6,9" fill="none" stroke="#059669" strokeWidth="1" />
            </g>

            {/* Bottom Segment: School / Books */}
            <g transform="translate(100, 168)">
              <path d="M0,7 C-5,3 -12,3 -16,5 L-16,-3 C-12,-5 -5,-5 0,-1 C5,-5 12,-5 16,-3 L16,5 C12,3 5,3 0,7 Z" fill="none" stroke="#047857" strokeWidth="1.5" />
              <line x1="0" y1="-1" x2="0" y2="7" stroke="#047857" strokeWidth="1.5" />
              <polygon points="0,-13 8,-9 0,-5 -8,-9" fill="#047857" />
              <rect x="-3" y="-8" width="6" height="3" fill="#047857" />
            </g>

            {/* Lower-Left Segment: Waste Bin */}
            <g transform="translate(50, 130)">
              <rect x="-5" y="-5" width="10" height="11" rx="1" fill="none" stroke="#047857" strokeWidth="1.5" />
              <line x1="-7" y1="-7" x2="7" y2="-7" stroke="#047857" strokeWidth="1.5" />
              <line x1="-2" y1="-2" x2="-2" y2="4" stroke="#047857" strokeWidth="1" />
              <line x1="2" y1="-2" x2="2" y2="4" stroke="#047857" strokeWidth="1" />
              <line x1="0" y1="-2" x2="0" y2="4" stroke="#047857" strokeWidth="1" />
            </g>

            {/* Upper-Left Segment: Broken Road */}
            <g transform="translate(50, 70)">
              <polygon points="0,-10 8,4 -8,4" fill="none" stroke="#047857" strokeWidth="1.5" />
              <line x1="0" y1="-5" x2="0" y2="-1" stroke="#047857" strokeWidth="1.5" />
              <circle cx="0" cy="2" r="0.8" fill="#047857" />
              <path d="M-10,8 L-6,6 L-2,9 L2,7 L6,10" fill="none" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* Thick Outer Hexagram Star Boundary */}
            <polygon points="100,10 126,55 178,55 152,100 178,145 126,145 100,190 74,145 22,145 48,100 22,55 74,55" fill="none" stroke="#022c22" strokeWidth="5" strokeLinejoin="round" />
            <polygon points="100,10 126,55 178,55 152,100 178,145 126,145 100,190 74,145 22,145 48,100 22,55 74,55" fill="none" stroke="#34d399" strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" />

            {/* Central White Circular Shield */}
            <circle
              cx="100"
              cy="100"
              r="46"
              fill="#ffffff"
              stroke="#047857"
              strokeWidth="4"
              filter="url(#shadow)"
            />

            {/* Courthouse / Secretariat Icon inside Shield */}
            <g transform="translate(100, 78)">
              <path d="M0,-12 L-14,-3 L14,-3 Z" fill="#047857" />
              <rect x="-11" y="-3" width="22" height="11" fill="none" stroke="#047857" strokeWidth="1.5" />
              <line x1="-7" y1="-3" x2="-7" y2="8" stroke="#047857" strokeWidth="1.2" />
              <line x1="-2.5" y1="-3" x2="-2.5" y2="8" stroke="#047857" strokeWidth="1.2" />
              <line x1="2.5" y1="-3" x2="2.5" y2="8" stroke="#047857" strokeWidth="1.2" />
              <line x1="7" y1="-3" x2="7" y2="8" stroke="#047857" strokeWidth="1.2" />
              <rect x="-14" y="8" width="28" height="2" fill="#047857" />
              <line x1="0" y1="-12" x2="0" y2="-16" stroke="#047857" strokeWidth="0.8" />
              <polygon points="0,-16 5,-14.5 0,-13" fill="#047857" />
            </g>

            {/* Citizens/People standing together */}
            <g transform="translate(100, 108)">
              {/* Center Citizen */}
              <circle cx="0" cy="-8" r="2.8" fill="#047857" />
              <path d="M-3.5,2 C-3.5,-3.5 3.5,-3.5 3.5,2 Z" fill="#047857" />
              
              {/* Left Citizen */}
              <circle cx="-6" cy="-5" r="2.2" fill="#10b981" />
              <path d="M-8.5,4 C-8.5,-0.5 -3.5,-0.5 -3.5,4 Z" fill="#10b981" />
              
              {/* Right Citizen */}
              <circle cx="6" cy="-5" r="2.2" fill="#10b981" />
              <path d="M3.5,4 C3.5,-0.5 8.5,-0.5 8.5,4 Z" fill="#10b981" />
            </g>

            {/* Caring Hands Cradling the Citizens at the bottom of Shield */}
            <g transform="translate(100, 112)">
              {/* Left support curve / hand */}
              <path d="M-26,0 C-26,13 -13,18 -5,18 C-9,16 -19,11 -19,1 Z" fill="#047857" opacity="0.9" />
              {/* Right support curve / hand */}
              <path d="M26,0 C26,13 13,18 5,18 C9,16 19,11 19,1 Z" fill="#047857" opacity="0.9" />
            </g>
          </svg>

          {/* Very subtle diagonal light shimmer overlay effect */}
          {animationPhase === 'pulsing' && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 62%, rgba(255,255,255,0) 100%)",
                backgroundSize: "250% 250%",
              }}
              initial={{ backgroundPosition: "200% 0%" }}
              animate={{ backgroundPosition: "-200% 0%" }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
          )}
        </motion.div>

        {/* The App Name "SOCIA GRAM" with smooth modern fade-up */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          className="text-4xl sm:text-5xl font-extrabold text-[#1B5E20] tracking-[0.18em] mt-8 font-sans text-center uppercase"
          style={{ textShadow: '0 2px 4px rgba(27,94,32,0.06)' }}
          id="splash-app-title"
        >
          Socia Gram
        </motion.h1>

        {/* Tagline showing platform purpose with soft fade-in */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={showText ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-[11px] sm:text-xs font-semibold text-[#607D66] uppercase tracking-[0.12em] mt-2.5 text-center max-w-xs sm:max-w-md leading-relaxed"
          id="splash-app-tagline"
        >
          Smart Village Issue Reporting Platform
        </motion.p>

        {/* Small Elegant Footer Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showText ? { opacity: 0.5 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-[-100px] flex flex-col items-center gap-1.5"
          id="splash-footer-badge"
        >
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Digital Village Initiative</span>
          <div className="w-8 h-0.5 bg-emerald-700/30 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
}
