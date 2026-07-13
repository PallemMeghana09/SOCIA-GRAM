import React from 'react';

interface InteractiveLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function InteractiveLogo({ size = 'md', className = '' }: InteractiveLogoProps) {
  // Responsive Tailwind dimensions
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64 sm:w-72 sm:h-72',
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      id={`interactive-logo-container-${size}`}
    >
      {/* Pristine Reusable SVG logo */}
      <div
        className="w-full h-full relative z-10"
        id="static-logo-wrapper"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definitions for Gradients and Filters */}
          <defs>
            {/* Sector Gradients */}
            <linearGradient id="sectorElectric" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#022c22" />
              <stop offset="100%" stopColor="#d1fae5" />
            </linearGradient>
            
            <linearGradient id="sectorRoad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            
            <linearGradient id="sectorTransport" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#ecfdf5" />
            </linearGradient>
            
            <linearGradient id="sectorWater" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
            
            <linearGradient id="sectorSewer" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>

            {/* Shading filter for the central white circle */}
            <filter id="shadow-logo-new" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#014725" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* Clean White Circular Base background of the entire emblem */}
          <circle cx="200" cy="200" r="185" fill="#ffffff" />

          {/* 5 Upper Sector Wedges meeting at the center (200, 205).
              The white circle at (200, 205) r=78 will cover the center automatically. */}
          
          {/* 1. Sector 1: Electricity Grid (Bottom-Left) */}
          <path d="M200,205 L65,235 A152,152 0 0,1 55,140 Z" fill="url(#sectorElectric)" />
          {/* Detailed Electrical pylons and sparks inside Sector 1 */}
          <g transform="translate(0, 0)">
            {/* Big transmission tower */}
            <path d="M102,215 L108,160 L114,215 M108,160 L108,215" stroke="#022c22" strokeWidth="1.8" fill="none" />
            <line x1="95" y1="180" x2="121" y2="180" stroke="#022c22" strokeWidth="1.8" />
            <line x1="98" y1="195" x2="118" y2="195" stroke="#022c22" strokeWidth="1.5" />
            {/* Struts */}
            <line x1="102" y1="215" x2="108" y2="195" stroke="#022c22" strokeWidth="1" />
            <line x1="114" y1="215" x2="108" y2="195" stroke="#022c22" strokeWidth="1" />
            <line x1="108" y1="195" x2="108" y2="180" stroke="#022c22" strokeWidth="1" />
            {/* Secondary power line pole */}
            <line x1="135" y1="215" x2="148" y2="175" stroke="#022c22" strokeWidth="1.8" />
            <line x1="141" y1="182" x2="153" y2="186" stroke="#022c22" strokeWidth="1.5" />
            {/* Connecting electrical wires */}
            <path d="M65,190 Q95,200 108,180 Q130,195 141,182" fill="none" stroke="#064e3b" strokeWidth="0.8" opacity="0.6" />
            {/* Spark lightning bolt */}
            <polygon points="152,170 159,180 154,182 161,194 151,184 155,182" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
          </g>

          {/* 2. Sector 2: Broken Road (Upper-Left) */}
          <path d="M200,205 L55,140 A152,152 0 0,1 120,65 Z" fill="url(#sectorRoad)" />
          {/* Road cracked texture and barriers */}
          <g transform="translate(0, 0)">
            {/* Winding road borders with perspective */}
            <path d="M110,68 L142,205" stroke="#0f172a" strokeWidth="2" fill="none" />
            <path d="M72,115 L118,205" stroke="#0f172a" strokeWidth="2" fill="none" />
            {/* Jagged deep cracks */}
            <path d="M96,98 L92,112 L102,122 L94,142 L110,158 L104,180" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M92,112 L84,118 L86,126" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Danger road sign */}
            <polygon points="76,102 85,116 67,116" fill="#f8fafc" stroke="#022c22" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="76" y1="106" x2="76" y2="111" stroke="#022c22" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="76" cy="114" r="0.9" fill="#022c22" />
          </g>

          {/* 3. Sector 3: Public Transport & City (Top-Center) */}
          <path d="M200,205 L120,65 A152,152 0 0,1 280,65 Z" fill="url(#sectorTransport)" />
          {/* Bus, city skyline and modern road */}
          <g transform="translate(0, 0)">
            {/* Skyline buildings in light green silhouette */}
            <rect x="180" y="70" width="8" height="15" fill="#a7f3d0" opacity="0.6" />
            <rect x="190" y="65" width="12" height="20" fill="#a7f3d0" opacity="0.75" />
            <rect x="204" y="68" width="9" height="17" fill="#a7f3d0" opacity="0.6" />
            <rect x="215" y="72" width="7" height="13" fill="#a7f3d0" opacity="0.5" />
            {/* Asphalt highway with dividing lane strip */}
            <path d="M140,118 Q200,146 260,118" stroke="#1e293b" strokeWidth="14" fill="none" />
            <path d="M145,121 Q200,143 255,121" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="5,5" fill="none" />
            {/* Green and White Public Bus */}
            <rect x="182" y="98" width="36" height="18" rx="3.5" fill="#047857" stroke="#ffffff" strokeWidth="1.2" />
            {/* White upper body stripe */}
            <rect x="182" y="98" width="36" height="6" rx="1" fill="#ffffff" />
            {/* Bus windows */}
            <rect x="185" y="101" width="8" height="5" fill="#111827" rx="0.5" />
            <rect x="196" y="101" width="8" height="5" fill="#111827" rx="0.5" />
            <rect x="207" y="101" width="8" height="5" fill="#111827" rx="0.5" />
            {/* Tires */}
            <circle cx="191" cy="116" r="3.5" fill="#111827" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="209" cy="116" r="3.5" fill="#111827" stroke="#ffffff" strokeWidth="0.8" />
          </g>

          {/* 4. Sector 4: Clean Water Supply (Upper-Right) */}
          <path d="M200,205 L280,65 A152,152 0 0,1 345,140 Z" fill="url(#sectorWater)" />
          {/* Faucet/Tap and pristine water pipeline discharge */}
          <g transform="translate(0, 0)">
            {/* Faucet/Tap */}
            <path d="M282,108 L296,108 L296,102 L304,102 L304,114 L296,114 L296,110 Z" fill="#0369a1" />
            <circle cx="282" cy="108" r="3" fill="#0369a1" />
            <path d="M298,97 L298,103 L302,103 L302,97 Z" fill="#0284c7" />
            {/* Water Flow from faucet */}
            <path d="M282,111 C282,125 272,130 270,145" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="270" cy="148" r="1.5" fill="#0284c7" />
            <circle cx="274" cy="142" r="1" fill="#38bdf8" />
            
            {/* Big Water Outlet Pipe and Gushing Stream */}
            <path d="M312,110 Q325,124 332,106" stroke="#475569" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M312,110 Q315,135 292,155" stroke="#0284c7" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M316,113 Q322,132 302,152" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Splashes */}
            <path d="M285,152 Q290,146 295,153" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* 5. Sector 5: Sewer & Waste Drainage (Bottom-Right) */}
          <path d="M200,205 L345,140 A152,152 0 0,1 335,235 Z" fill="url(#sectorSewer)" />
          {/* Large concrete discharge pipe and murky sewage canal */}
          <g transform="translate(0, 0)">
            {/* Concrete Sewer Pipe */}
            <ellipse cx="308" cy="178" rx="13" ry="19" fill="#1e293b" stroke="#64748b" strokeWidth="3" transform="rotate(-15, 308, 178)" />
            <ellipse cx="308" cy="178" rx="16" ry="23" fill="none" stroke="#475569" strokeWidth="3.5" transform="rotate(-15, 308, 178)" />
            {/* Murky Wastewater discharging */}
            <path d="M310,183 C312,198 296,215 290,228" stroke="#334155" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M304,185 C306,196 290,210 284,222" stroke="#4a5568" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Dirty channel bed textures */}
            <path d="M328,198 L314,228" stroke="#334155" strokeWidth="2" />
            <path d="M336,204 L322,234" stroke="#334155" strokeWidth="2" />
          </g>

          {/* White border/separator lines radiating from the center to partition the sectors neatly */}
          <line x1="200" y1="205" x2="65" y2="235" stroke="#ffffff" strokeWidth="4.5" />
          <line x1="200" y1="205" x2="55" y2="140" stroke="#ffffff" strokeWidth="4.5" />
          <line x1="200" y1="205" x2="120" y2="65" stroke="#ffffff" strokeWidth="4.5" />
          <line x1="200" y1="205" x2="280" y2="65" stroke="#ffffff" strokeWidth="4.5" />
          <line x1="200" y1="205" x2="345" y2="140" stroke="#ffffff" strokeWidth="4.5" />
          <line x1="200" y1="205" x2="335" y2="235" stroke="#ffffff" strokeWidth="4.5" />

          {/* Beautiful Decagon Frame Outline wrapping the upper half */}
          <polygon points="65,235 55,140 120,65 280,65 345,140 335,235" fill="none" stroke="#014725" strokeWidth="4" strokeLinejoin="round" />

          {/* Central White Circular Shield containing the Government Headquarters & Citizens */}
          <circle
            cx="200"
            cy="205"
            r="78"
            fill="#ffffff"
            stroke="#014725"
            strokeWidth="4"
            filter="url(#shadow-logo-new)"
          />

          {/* Secretariat / Assembly Government Dome Building */}
          <g transform="translate(200, 155)">
            {/* Dome roof */}
            <path d="M-15,-4 C-15,-16 15,-16 15,-4 Z" fill="#014725" />
            {/* Small flag on top of dome */}
            <line x1="0" y1="-15" x2="0" y2="-21" stroke="#014725" strokeWidth="1.2" />
            <polygon points="0,-21 6,-19.5 0,-18" fill="#014725" />
            {/* Main secretariat portico body */}
            <rect x="-18" y="-4" width="36" height="15" fill="#ffffff" stroke="#014725" strokeWidth="2.2" />
            {/* Classical pillars */}
            <line x1="-12" y1="-4" x2="-12" y2="11" stroke="#014725" strokeWidth="1.8" />
            <line x1="-5" y1="-4" x2="-5" y2="11" stroke="#014725" strokeWidth="1.8" />
            <line x1="5" y1="-4" x2="5" y2="11" stroke="#014725" strokeWidth="1.8" />
            <line x1="12" y1="-4" x2="12" y2="11" stroke="#014725" strokeWidth="1.8" />
            {/* Foundation steps */}
            <rect x="-22" y="11" width="44" height="3.5" fill="#014725" />
          </g>

          {/* Group of active citizens waving, raising hands in front of secretariat */}
          <g transform="translate(200, 205)">
            {/* Center Leader (raising both hands) */}
            <circle cx="0" cy="-14" r="5" fill="#014725" />
            <path d="M-6,0 C-6,-8 6,-8 6,0 Z" fill="#014725" />
            <path d="M-5,-6 L-10,-15" stroke="#014725" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M5,-6 L10,-15" stroke="#014725" strokeWidth="2.2" strokeLinecap="round" />

            {/* Left citizen (raising one hand) */}
            <circle cx="-14" cy="-10" r="4" fill="#014725" />
            <path d="M-19,4 C-19,-3 -9,-3 -9,4 Z" fill="#014725" />
            <path d="M-18,-2 L-24,-10" stroke="#014725" strokeWidth="2" strokeLinecap="round" />

            {/* Right citizen (raising one hand) */}
            <circle cx="14" cy="-10" r="4" fill="#014725" />
            <path d="M9,4 C9,-3 19,-3 19,4 Z" fill="#014725" />
            <path d="M18,-2 L24,-10" stroke="#014725" strokeWidth="2" strokeLinecap="round" />

            {/* Small Child Silhouette on Left */}
            <circle cx="-8" cy="-1" r="3" fill="#014725" />
            <path d="M-12,10 C-12,5 -4,5 -4,10 Z" fill="#014725" />

            {/* Small Child Silhouette on Right */}
            <circle cx="8" cy="-1" r="3" fill="#014725" />
            <path d="M4,10 C4,5 12,5 12,10 Z" fill="#014725" />
          </g>

          {/* Caring hands / leaves cradling the citizens at the bottom of the shield */}
          <g transform="translate(200, 218)">
            {/* Left green cradling leaf-hand */}
            <path d="M-38,4 C-38,20 -18,24 -4,24 C-12,22 -26,16 -26,2 Z" fill="#16a34a" />
            {/* Right green cradling leaf-hand */}
            <path d="M38,4 C38,20 18,24 4,24 C12,22 26,16 26,2 Z" fill="#16a34a" />
          </g>

          {/* Bold, Shaded "SOCIA GRAM" Brand Lettering */}
          <text
            x="200"
            y="298"
            textAnchor="middle"
            fill="#014725"
            style={{
              fontFamily: '"Inter", "Space Grotesk", sans-serif',
              fontWeight: 900,
              fontSize: '44px',
              letterSpacing: '0.01em',
            }}
            id="brand-text-logo"
          >
            SOCIA GRAM
          </text>

          {/* Horizontal split divider with four citizens silhouettes */}
          <g transform="translate(200, 314)">
            {/* Left horizontal line */}
            <line x1="-115" y1="0" x2="-22" y2="0" stroke="#014725" strokeWidth="1.8" />
            
            {/* 4 Standing Citizen Silhouettes (representing the village community) */}
            <g transform="translate(-16, -6)" fill="#014725">
              {/* Figure 1 */}
              <circle cx="4" cy="2" r="1.5" />
              <path d="M2.5,9 C2.5,6.5 5.5,6.5 5.5,9 Z" />
              {/* Figure 2 */}
              <circle cx="12" cy="1.5" r="1.6" />
              <path d="M10,9 C10,5.8 14,5.8 14,9 Z" />
              {/* Figure 3 */}
              <circle cx="20" cy="1.5" r="1.6" />
              <path d="M18,9 C18,5.8 22,5.8 22,9 Z" />
              {/* Figure 4 */}
              <circle cx="28" cy="2" r="1.5" />
              <path d="M26.5,9 C26.5,6.5 29.5,6.5 29.5,9 Z" />
            </g>

            {/* Right horizontal line */}
            <line x1="22" y1="0" x2="115" y2="0" stroke="#014725" strokeWidth="1.8" />
          </g>

          {/* Tagline: TOGETHER FOR A BETTER TOMORROW */}
          <text
            x="200"
            y="333"
            textAnchor="middle"
            fill="#0f172a"
            style={{
              fontFamily: '"Inter", "JetBrains Mono", sans-serif',
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '0.14em',
            }}
            id="tagline-text-logo"
          >
            TOGETHER FOR A BETTER TOMORROW
          </text>

          {/* Thick Dark Green Outer Circular Border */}
          <circle
            cx="200"
            cy="200"
            r="184"
            fill="none"
            stroke="#014725"
            strokeWidth="8"
            id="outer-circle-ring"
          />
        </svg>
      </div>
    </div>
  );
}
