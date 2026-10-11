import React, { useState } from 'react';
import { Station } from '../types';

interface TicketsAndRoutesViewProps {
  currentStation: Station;
  onNavigateToPlatform: (platformId: string) => void;
}

export const TicketsAndRoutesView: React.FC<TicketsAndRoutesViewProps> = ({
  currentStation,
  onNavigateToPlatform,
}) => {
  const [activeTab, setActiveTab] = useState<'departures' | 'passes'>('departures');

  const departures = (currentStation.departures && currentStation.departures.length > 0)
    ? currentStation.departures.map((dep, idx) => ({
        trainNo: dep.trainNumber,
        destination: dep.destination,
        time: dep.time,
        track: dep.platform,
        trackId: `platform-${(idx % currentStation.platforms) + 1}`,
        status: dep.status === 'LIVE' ? 'Boarding' : 'On Time',
        statusColor: idx === 0 ? 'text-[#10b981] bg-[#10b981]/20 border-[#10b981]/40' : 'text-[#00f0ff] bg-[#00f0ff]/20 border-[#00f0ff]/40',
        line: 'Southern Railway Mainline',
      }))
    : [
        {
          trainNo: '12681',
          destination: 'Chennai Central - Coimbatore SF Exp',
          time: '06:42 AM',
          track: 'Platform 5',
          trackId: 'platform-5',
          status: 'Boarding',
          statusColor: 'text-[#10b981] bg-[#10b981]/20 border-[#10b981]/40',
          line: 'Southern Railway (Salem Div)',
        },
        {
          trainNo: '20644',
          destination: 'Coimbatore - Chennai Vande Bharat',
          time: '06:00 AM',
          track: 'Platform 1',
          trackId: 'platform-1',
          status: 'On Time',
          statusColor: 'text-[#00f0ff] bg-[#00f0ff]/20 border-[#00f0ff]/40',
          line: 'Salem - MAS High Speed Corridor',
        },
        {
          trainNo: '12676',
          destination: 'Kovai Superfast Express',
          time: '03:05 PM',
          track: 'Platform 2',
          trackId: 'platform-2',
          status: 'On Time',
          statusColor: 'text-[#00f0ff] bg-[#00f0ff]/20 border-[#00f0ff]/40',
          line: 'Jolarpettai - Shoranur Line',
        },
        {
          trainNo: '16616',
          destination: 'Chemmozhi Express (Mannargudi)',
          time: '07:30 PM',
          track: 'Platform 4',
          trackId: 'platform-4',
          status: 'Scheduled',
          statusColor: 'text-[#eab308] bg-[#eab308]/20 border-[#eab308]/40',
          line: 'Cauvery Delta Line',
        },
      ];

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white pt-20 pb-32 font-sans">
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
        {/* Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#ff3e00] font-bold uppercase tracking-widest">
                REAL-TIME TELEMETRY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
              Transit Schedule
            </h1>
            <p className="text-xs font-mono text-white/50 uppercase mt-0.5">
              Live Departures &amp; Electronic Passes // {currentStation.name}
            </p>
          </div>

          <div className="flex bg-[#121212] border border-white/15 p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('departures')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'departures'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Departures
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'passes'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Digital Pass
            </button>
          </div>
        </div>

        {activeTab === 'departures' ? (
          /* Live Departures Board */
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2 text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
              <span>TRAIN // DESTINATION</span>
              <span>DEPARTURE &amp; TRACK</span>
            </div>

            {departures.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#121212] border border-white/15 p-4 sm:p-5 hover:border-[#ff3e00] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-white bg-[#1e1e1e] px-2 py-0.5 border border-white/20">
                      {item.trainNo}
                    </span>
                    <span className="text-[10px] font-mono text-white/50 uppercase">{item.line}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight">{item.destination}</h3>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-left sm:text-right">
                    <div className="text-base sm:text-lg font-display font-black text-white">{item.time}</div>
                    <div className="text-xs font-mono font-bold text-[#ff3e00] uppercase">{item.track}</div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider border ${
                        item.status === 'Boarding'
                          ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                          : 'bg-white/10 text-white border-white/20'
                      }`}
                    >
                      {item.status}
                    </span>
                    <button
                      onClick={() => onNavigateToPlatform(item.trackId)}
                      className="text-xs font-bold text-white/80 hover:text-[#ff3e00] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Navigate</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Active Digital Boarding Pass */
          <div className="max-w-md mx-auto bg-[#121212] border border-white/20 overflow-hidden shadow-2xl">
            <div className="bg-black p-6 border-b border-white/15 text-white relative">
              <div className="text-[10px] font-mono font-bold text-[#ff3e00] uppercase tracking-widest mb-1">
                METRO-NORTH RAILROAD // E-TICKET
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight">New Haven Express #1542</h2>
              <div className="text-xs font-mono text-white/60 mt-1 uppercase">
                Grand Central Terminal → New Haven Union Station
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black p-3 border border-white/10">
                  <span className="text-[9px] uppercase font-mono font-bold text-white/40 tracking-widest">TRACK</span>
                  <p className="text-base font-display font-black text-[#ff3e00] uppercase">Platform 5</p>
                </div>
                <div className="bg-black p-3 border border-white/10">
                  <span className="text-[9px] uppercase font-mono font-bold text-white/40 tracking-widest">BOARDING</span>
                  <p className="text-base font-display font-black text-white">11:15 AM</p>
                </div>
                <div className="bg-black p-3 border border-white/10">
                  <span className="text-[9px] uppercase font-mono font-bold text-white/40 tracking-widest">SEAT</span>
                  <p className="text-base font-display font-black text-white">03 / 14A</p>
                </div>
              </div>

              {/* QR Code Graphic Box */}
              <div className="flex flex-col items-center justify-center p-6 bg-white border border-white text-black">
                <div className="w-32 h-32 bg-black flex flex-col items-center justify-center p-2 text-white text-[10px] text-center font-mono">
                  {/* QR Matrix Representation */}
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-white">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                            ? 'bg-black'
                            : (i * 7) % 5 === 0
                            ? 'bg-black'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-black mt-2 tracking-widest">
                  PASS: MN-NY-8893-X
                </span>
              </div>

              <button
                onClick={() => onNavigateToPlatform('platform-5')}
                className="w-full py-3.5 bg-[#ff3e00] hover:bg-white hover:text-black text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                Guide Me to Platform 5
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
