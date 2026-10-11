import React from 'react';

interface SmartRailLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'color';
}

export const SmartRailLogo: React.FC<SmartRailLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  variant = 'color',
}) => {
  const sizeMap = {
    xs: { icon: 20, text: 'text-xs', sub: 'text-[8px]' },
    sm: { icon: 26, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 34, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 44, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 60, text: 'text-3xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Tech Railway Emblem SVG */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300 hover:scale-105"
        style={{ width: dim.icon, height: dim.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(255,62,0,0.3)]"
        >
          <defs>
            <linearGradient id="sr-grad-train" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff5e1a" />
              <stop offset="50%" stopColor="#ff3e00" />
              <stop offset="100%" stopColor="#d12e00" />
            </linearGradient>
            <linearGradient id="sr-grad-rail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#00a8ff" />
            </linearGradient>
            <linearGradient id="sr-grad-beacon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>
            <filter id="sr-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Hexagonal Shield / Waypoint Frame */}
          <polygon
            points="50,4 90,26 90,74 50,96 10,74 10,26"
            stroke="url(#sr-grad-train)"
            strokeWidth="3"
            fill="#0d0d0d"
            strokeLinejoin="round"
          />

          {/* Internal Geometric High-Speed Rail Tracks converging into distance */}
          {/* Left Rail */}
          <path
            d="M26 84 L44 48 L46 48 L32 84 Z"
            fill="url(#sr-grad-rail)"
            opacity="0.85"
          />
          {/* Right Rail */}
          <path
            d="M74 84 L56 48 L54 48 L68 84 Z"
            fill="url(#sr-grad-rail)"
            opacity="0.85"
          />

          {/* Rail Sleepers / Ties */}
          <line x1="30" y1="78" x2="70" y2="78" stroke="#00f0ff" strokeWidth="2.5" strokeOpacity="0.7" />
          <line x1="35" y1="68" x2="65" y2="68" stroke="#00f0ff" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="40" y1="58" x2="60" y2="58" stroke="#00f0ff" strokeWidth="1.8" strokeOpacity="0.9" />

          {/* Aerodynamic High-Speed Bullet Locomotive Nose */}
          <path
            d="M50 18 C57 18 64 24 64 34 L62 50 C62 56 57 60 50 60 C43 60 38 56 38 50 L36 34 C36 24 43 18 50 18 Z"
            fill="url(#sr-grad-train)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Train Aerodynamic Cockpit Windshield */}
          <path
            d="M44 26 C47 24 53 24 56 26 L58 35 C58 37 55 38 50 38 C45 38 42 37 42 35 Z"
            fill="#080808"
            stroke="#00f0ff"
            strokeWidth="1"
          />

          {/* High-Beam Spatial Navigation Headlamp */}
          <circle cx="50" cy="46" r="3.5" fill="#ffffff" filter="url(#sr-glow)" />
          <circle cx="50" cy="46" r="2" fill="#00f0ff" />

          {/* Front Speed Cowling Accents */}
          <line x1="43" y1="52" x2="57" y2="52" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="45" y1="56" x2="55" y2="56" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />

          {/* Pulse Beacon Antenna at Top Vertex */}
          <circle cx="50" cy="10" r="2.5" fill="#00ff66" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-black tracking-tighter uppercase ${dim.text} ${
                variant === 'light' ? 'text-black' : 'text-white'
              }`}
            >
              SMART<span className="text-[#ff3e00]">RAIL</span>
            </span>
            <span className="px-1.5 py-0.2 bg-[#ff3e00]/20 text-[#ff3e00] text-[8px] font-mono font-bold tracking-widest border border-[#ff3e00]/40 uppercase">
              TN
            </span>
          </div>
          <span
            className={`font-mono font-semibold tracking-[0.25em] uppercase text-white/50 ${dim.sub} mt-0.5`}
          >
            NAVIGATOR 2.0
          </span>
        </div>
      )}
    </div>
  );
};
