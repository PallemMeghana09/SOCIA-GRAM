import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { InteractiveLogo } from './InteractiveLogo';

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
          className="relative z-10 w-64 h-64 sm:w-72 sm:h-72"
          id="splash-logo"
        >
          <InteractiveLogo size="xl" />
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
