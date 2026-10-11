import React from 'react';
import { TabType, Station } from '../types';

interface LandingCoreCapabilitiesProps {
  onTabChange: (tab: TabType) => void;
  currentStation: Station;
}

export const LandingCoreCapabilitiesView: React.FC<LandingCoreCapabilitiesProps> = ({
  onTabChange,
  currentStation,
}) => {
  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white pt-20 pb-28 relative overflow-hidden">
      {/* Background Watermark Typography */}
      <div className="absolute top-16 right-4 sm:right-12 text-[140px] sm:text-[200px] md:text-[280px] font-display font-black leading-none opacity-[0.03] select-none pointer-events-none">
        2026
      </div>
      <div className="absolute bottom-10 left-4 text-[100px] sm:text-[160px] font-display font-black leading-none opacity-[0.02] select-none pointer-events-none">
        RAIL
      </div>

      {/* Hero Section */}
      <header className="relative min-h-[500px] md:min-h-[560px] flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="z-10 flex flex-col max-w-4xl">
          {/* Micro Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#ff3e00] inline-block"></span>
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff3e00] font-black">
              The Next Standard // Station OS
            </span>
          </div>

          {/* Massive Display Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] font-display font-black leading-[0.88] tracking-tighter uppercase mb-8">
            NAVIGATE<br />
            <span className="text-white">EVERY </span>
            <span className="text-[#ff3e00]">STEP.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl font-light leading-relaxed text-white/80 max-w-2xl mb-10 font-sans">
            Pioneering digital transit architecture through high-precision 3D spatial mapping, adaptive accessible routing, and contextual AI guidance.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <button
              onClick={() => onTabChange('stations')}
              className="bg-white text-black py-4 px-8 text-center text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#ff3e00] hover:text-white transition-colors inline-flex items-center justify-center gap-2"
            >
              Explore Stations
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              onClick={() => onTabChange('map')}
              className="border border-white/20 text-white py-4 px-8 text-center text-xs font-bold uppercase tracking-widest cursor-pointer hover:border-[#ff3e00] hover:text-[#ff3e00] transition-colors inline-flex items-center justify-center gap-2"
            >
              Launch 3D Map
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            </button>
          </div>

          {/* Active Station metadata bar */}
          <div className="mt-12 flex items-center gap-6 border-t border-white/10 pt-4 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-0.5">CURRENT HUB</span>
              <span className="font-bold uppercase tracking-wider text-white">{currentStation.name}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-0.5">SYSTEM STATUS</span>
              <span className="font-bold uppercase tracking-wider text-[#00ff66]">LIVE &bull; 100% OPERATIONAL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Brutalist 3-Column Focus Bar */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-b border-white/10 py-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] mb-3 text-white/40 font-bold">Focus</span>
            <p className="text-sm sm:text-base font-light leading-relaxed text-white/80">
              Transforming labyrinthine railway hubs into seamless, transparent navigation vectors with sub-meter spatial precision.
            </p>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] mb-3 text-white/40 font-bold">Key Metrics</span>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-end border-b border-white/10 pb-1">
                <span className="text-xs uppercase font-medium">Platforms Mapped</span>
                <span className="text-xs font-mono font-bold text-[#ff3e00]">44 TRACKS</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/10 pb-1">
                <span className="text-xs uppercase font-medium">Transit Lines</span>
                <span className="text-xs font-mono font-bold text-white">8 ARTERIAL</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div
              onClick={() => onTabChange('tickets')}
              className="border border-white/15 p-4 hover:border-[#ff3e00] transition-colors cursor-pointer group flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block mb-1">Transit Schedule</span>
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-[#ff3e00] transition-colors">
                  View Live Departures &rarr;
                </span>
              </div>
              <span className="text-xs font-mono text-[#00ff66]">ON TIME</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Capabilities */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#ff3e00] font-black block mb-2">
              Architecture & Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
              CORE CAPABILITIES
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 max-w-md font-sans">
            Engineered for high-stakes environments where clarity, typography, and speed dictate passenger flow.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 3D Navigation (2 columns on md) */}
          <div
            onClick={() => onTabChange('map')}
            className="md:col-span-2 bg-[#121212] border border-white/10 p-8 relative overflow-hidden group hover:border-[#ff3e00] transition-all cursor-pointer flex flex-col justify-between min-h-[280px]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white text-black font-black flex items-center justify-center text-sm">
                01
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-[#ff3e00] text-white">
                Interactive 3D
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase mb-3 group-hover:text-[#ff3e00] transition-colors">
                3D Spatial Twin
              </h3>
              <p className="text-sm text-white/70 max-w-lg leading-relaxed font-light">
                Authoritative digital twin of the station terminal. Understand multi-level elevation changes, platform bridges, and complex concourses instantaneously.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Multi-Floor Elevation Engine</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#ff3e00] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch 3D Map &rarr;
              </span>
            </div>
          </div>

          {/* Card 2: Accessibility */}
          <div
            onClick={() => onTabChange('profile')}
            className="bg-[#121212] border border-white/10 p-8 group hover:border-[#ff3e00] transition-all cursor-pointer flex flex-col justify-between min-h-[280px]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white text-black font-black flex items-center justify-center text-sm">
                02
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 border border-white/20 text-white">
                Step-Free
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-display font-black text-white uppercase mb-3 group-hover:text-[#ff3e00] transition-colors">
                Accessibility
              </h3>
              <p className="text-sm text-white/70 leading-relaxed font-light">
                Dedicated routing prioritizing elevators, tactile surfaces, and step-free paths for wheelchair and heavy luggage transit.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Obstacle Avoidance</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#ff3e00] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Tune &rarr;
              </span>
            </div>
          </div>

          {/* Card 3: Smart Routing */}
          <div
            onClick={() => onTabChange('map')}
            className="bg-[#121212] border border-white/10 p-8 group hover:border-[#ff3e00] transition-all cursor-pointer flex flex-col justify-between min-h-[260px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-white/10 text-white font-black flex items-center justify-center text-xs">
                03
              </div>
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Dynamic Path</span>
            </div>

            <div>
              <h3 className="text-xl font-display font-black text-white uppercase mb-2 group-hover:text-[#ff3e00] transition-colors">
                Smart Routing
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Dynamic pathfinding adapting to live congestion, elevator maintenance, and immediate boarding calls.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Real-Time</span>
              <span className="text-xs font-bold text-white group-hover:text-[#ff3e00]">&rarr;</span>
            </div>
          </div>

          {/* Card 4: AR Guidance */}
          <div
            onClick={() => onTabChange('ar_nav')}
            className="bg-[#121212] border border-white/10 p-8 group hover:border-[#ff3e00] transition-all cursor-pointer flex flex-col justify-between min-h-[260px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-white/10 text-white font-black flex items-center justify-center text-xs">
                04
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#ff3e00] font-bold">AR Overlay</span>
            </div>

            <div>
              <h3 className="text-xl font-display font-black text-white uppercase mb-2 group-hover:text-[#ff3e00] transition-colors">
                AR Guidance
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Overlay directional vectors directly onto physical station corridors with directional compass telemetry.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Camera HUD</span>
              <span className="text-xs font-bold text-white group-hover:text-[#ff3e00]">&rarr;</span>
            </div>
          </div>

          {/* Card 5: AI Assistant */}
          <div
            onClick={() => onTabChange('assistant')}
            className="bg-[#121212] border border-white/10 p-8 group hover:border-[#ff3e00] transition-all cursor-pointer flex flex-col justify-between min-h-[260px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-white/10 text-white font-black flex items-center justify-center text-xs">
                05
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#00ff66] font-bold">Voice & Chat</span>
            </div>

            <div>
              <h3 className="text-xl font-display font-black text-white uppercase mb-2 group-hover:text-[#ff3e00] transition-colors">
                AI Assistant
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Natural speech & conversational queries for coffee, restrooms, platform transfers, and ticket policies.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Assistant Engine</span>
              <span className="text-xs font-bold text-white group-hover:text-[#ff3e00]">&rarr;</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
