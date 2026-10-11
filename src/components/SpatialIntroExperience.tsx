import React, { useState, useEffect } from 'react';
import { Station, StationPOI } from '../types';

interface SpatialIntroExperienceProps {
  station: Station;
  onEnterMapWithDestination?: (poi: StationPOI) => void;
  onEnterMapDirectly: () => void;
  onOpenLogin?: () => void;
}

export const SpatialIntroExperience: React.FC<SpatialIntroExperienceProps> = ({
  station,
  onEnterMapWithDestination,
  onEnterMapDirectly,
  onOpenLogin,
}) => {
  const [stage, setStage] = useState<'title' | 'grid_reveal' | 'path_draw' | 'ready'>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  useEffect(() => {
    // Progression timers
    const timer1 = setTimeout(() => setStage('grid_reveal'), 1000);
    const timer2 = setTimeout(() => setStage('path_draw'), 2200);
    const timer3 = setTimeout(() => setStage('ready'), 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const filteredPOIs = station.pois.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectQuick = (poiId: string) => {
    const poi = station.pois.find((p) => p.id === poiId) || station.pois[0];
    if (onEnterMapWithDestination) {
      onEnterMapWithDestination(poi);
    } else {
      onEnterMapDirectly();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070707] text-white flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      {/* Background 3D Perspective Digital Twin Floor */}
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none">
        {/* Dynamic perspective grid matrix */}
        <div
          className={`w-[1200px] h-[1200px] border border-white/10 transition-all duration-1000 ease-out ${
            stage === 'title'
              ? 'opacity-10 scale-75 rotate-0'
              : 'opacity-30 scale-100 rotate-12'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 62, 0, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `perspective(600px) rotateX(65deg) translateY(${
              stage === 'ready' ? '120px' : '40px'
            })`,
            transformOrigin: 'center center',
          }}
        >
          {/* Spatial Station Waypoint Nodes */}
          {stage !== 'title' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 border border-[#ff3e00]/40 relative animate-pulse">
                {/* Station Central Hub Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#ff3e00] shadow-[0_0_20px_#ff3e00]" />
                {/* Platform nodes */}
                <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-[#ff3e00]" />
                <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-white" />
              </div>
            </div>
          )}
        </div>

        {/* Cinematic Laser Route Path Generation */}
        {(stage === 'path_draw' || stage === 'ready') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <svg
              className="w-full h-96 max-w-xl opacity-80"
              viewBox="0 0 400 300"
              fill="none"
            >
              <path
                d="M 120 260 L 200 180 L 280 120"
                stroke="#ff3e00"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="animate-path-flow"
              />
              <circle cx="120" cy="260" r="5" fill="#ffffff" />
              <circle cx="280" cy="120" r="6" fill="#ff3e00" className="animate-ping" />
            </svg>
          </div>
        )}

        {/* Ambient Dark Gradient Vigneete */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070707]/70 to-[#070707]" />
      </div>

      {/* Top Right Action Buttons: Direct Login Page Access and Skip */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => {
            if (onOpenLogin) {
              onOpenLogin();
            } else {
              window.location.hash = 'login';
            }
          }}
          className="px-3 py-1.5 bg-[#ff3e00] hover:bg-[#e03700] text-white text-[11px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer shadow-lg shadow-[#ff3e00]/20 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[14px]">login</span>
          <span>Login / Register Page</span>
        </button>
        <button
          onClick={onEnterMapDirectly}
          className="px-3.5 py-1.5 bg-black/60 border border-white/20 hover:border-white text-[11px] font-mono uppercase tracking-widest text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-md"
        >
          Skip Intro →
        </button>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center text-center">
        {/* Stage 1: Brand Title Reveal */}
        <div
          className={`transition-all duration-700 ${
            stage === 'title'
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-90 scale-95 -translate-y-2'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-[#ff3e00] mb-3">
            <span className="w-1.5 h-1.5 bg-[#ff3e00] animate-ping" />
            DIGITAL TWIN TELEMETRY // SIH1710
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-tight text-white leading-none">
            SMART RAIL
          </h1>
          <p className="text-xs sm:text-sm font-mono text-white/50 uppercase tracking-widest mt-2">
            {station.name} • {station.location}
          </p>
        </div>

        {/* Stage 2 & 3: Prompt & Interactive Search */}
        {stage === 'ready' && (
          <div className="w-full mt-8 animate-fade-in flex flex-col items-center">
            <h2 className="text-lg sm:text-xl font-display font-bold text-white uppercase tracking-tight mb-4">
              Where are you going?
            </h2>

            {/* Primary Search Bar */}
            <div className="w-full relative">
              <div className="flex items-center bg-[#121212] border-2 border-white/30 focus-within:border-[#ff3e00] transition-colors p-1 shadow-2xl">
                <span className="material-symbols-outlined text-white/50 ml-3 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  placeholder="SEARCH PLATFORM, FACILITY, OR TRAIN..."
                  className="w-full bg-transparent px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white placeholder:text-white/40 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={onEnterMapDirectly}
                  className="px-5 py-2.5 bg-white text-black font-display font-black text-xs uppercase tracking-widest hover:bg-[#ff3e00] hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  Enter
                </button>
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSearchSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#121212] border border-white/20 shadow-2xl max-h-56 overflow-y-auto text-left z-30">
                  {filteredPOIs.slice(0, 5).map((poi) => (
                    <button
                      key={poi.id}
                      onClick={() => handleSelectQuick(poi.id)}
                      className="w-full p-3 flex items-center justify-between border-b border-white/10 hover:bg-white/10 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[#ff3e00] text-[18px]">
                          {poi.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold uppercase text-white group-hover:text-[#ff3e00]">
                            {poi.name}
                          </div>
                          <div className="text-[10px] font-mono text-white/50 uppercase">
                            Level {poi.floor} • {poi.category}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/60 uppercase">
                        {poi.walkingTimeMin}m walk →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Destination Chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                { id: 'platform-5', label: 'Platform 5', icon: 'train' },
                { id: 'ticket-office', label: 'Ticket Counter', icon: 'confirmation_number' },
                { id: 'restrooms-main', label: 'Washrooms', icon: 'wc' },
                { id: 'station-brew', label: 'Station Brew', icon: 'local_cafe' },
                { id: 'exit-42nd', label: 'Main Exit', icon: 'exit_to_app' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleSelectQuick(chip.id)}
                  className="px-3 py-1.5 bg-[#181818] border border-white/15 text-[11px] font-mono uppercase text-white/80 hover:text-white hover:border-[#ff3e00] hover:bg-black transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#ff3e00]">
                    {chip.icon}
                  </span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Direct 3D Map Button */}
            <button
              onClick={onEnterMapDirectly}
              className="mt-6 text-xs font-mono font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Explore Full 3D Station Twin →
            </button>
          </div>
        )}
      </div>

      {/* Bottom Status Telemetry Line */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest border-t border-white/10 pt-3 pointer-events-none">
        <div>SMARTRAIL ENGINE v3.4</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#00ff66]" />
          <span>SPATIAL MESH ONLINE</span>
        </div>
      </div>
    </div>
  );
};
