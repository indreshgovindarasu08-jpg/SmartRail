import React, { useState, useMemo } from 'react';
import { Station, TabType } from '../types';

interface StationDiscoveryViewProps {
  stations: Station[];
  currentStation: Station;
  onSelectStation: (station: Station) => void;
  onNavigateToMap: (station: Station) => void;
  onTabChange: (tab: TabType) => void;
}

export const StationDiscoveryView: React.FC<StationDiscoveryViewProps> = ({
  stations,
  currentStation,
  onSelectStation,
  onNavigateToMap,
  onTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter3DOnly, setFilter3DOnly] = useState(false);
  const [filterAROnly, setFilterAROnly] = useState(false);
  const [savedStationIds, setSavedStationIds] = useState<Record<string, boolean>>({
    'grand-central': true,
    'shinjuku': true,
    'paddington': true,
  });

  const toggleBookmark = (e: React.MouseEvent, stationId: string) => {
    e.stopPropagation();
    setSavedStationIds((prev) => ({
      ...prev,
      [stationId]: !prev[stationId],
    }));
  };

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchQuery =
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.country.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;
      if (filter3DOnly && !station.has3D) return false;
      if (filterAROnly && !station.hasAR) return false;
      return true;
    });
  }, [stations, searchQuery, filter3DOnly, filterAROnly]);

  const recentStations = useMemo(() => {
    return [
      {
        id: 'coimbatore-junction',
        name: 'Coimbatore Jn',
        location: 'Salem Division, TN',
        tag: 'MAIN PILOT HUB',
        accentColor: '#ff3e00',
        icon: 'hub',
      },
      {
        id: 'mgr-chennai-central',
        name: 'Chennai Central',
        location: 'Chennai Division, TN',
        tag: 'FLAGSHIP HUB',
        accentColor: '#00f0ff',
        icon: 'train',
      },
      {
        id: 'madurai-junction',
        name: 'Madurai Jn',
        location: 'Madurai Division, TN',
        tag: 'TEMPLE CITY',
        accentColor: '#ff3e00',
        icon: 'account_balance',
      },
      {
        id: 'tiruchirappalli-junction',
        name: 'Trichy Jn',
        location: 'Trichy Division, TN',
        tag: 'CENTRAL HUB',
        accentColor: '#00ff66',
        icon: 'directions_railway',
      },
    ];
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white pt-20 pb-28">
      {/* Sticky Search Bar Section */}
      <div className="sticky top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur-md pt-4 pb-3 px-4 md:px-8 border-b border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-white/50 pointer-events-none text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ANY STATION IN TAMIL NADU (e.g. CBE, Chennai, Madurai, Trichy, Ooty)..."
              className="w-full h-12 pl-11 pr-10 bg-[#121212] text-white rounded-none border border-white/15 focus:border-[#ff3e00] focus:ring-0 outline-none text-xs font-bold uppercase tracking-wider transition-all placeholder:text-white/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`h-12 px-4 rounded-none flex items-center justify-center border text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              filter3DOnly || filterAROnly || filterOpen
                ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                : 'bg-[#121212] text-white border-white/15 hover:border-white/40'
            }`}
            aria-label="Filter stations"
          >
            <span className="material-symbols-outlined text-[18px] mr-1">tune</span>
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Filter Popup / Options */}
        {filterOpen && (
          <div className="max-w-4xl mx-auto mt-3 p-4 bg-[#141414] border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-6">
              <span className="font-bold text-white/50 uppercase tracking-[0.2em]">Filter By:</span>
              <label className="flex items-center gap-2 cursor-pointer text-white font-bold uppercase tracking-wider text-[11px]">
                <input
                  type="checkbox"
                  checked={filter3DOnly}
                  onChange={(e) => setFilter3DOnly(e.target.checked)}
                  className="accent-[#ff3e00]"
                />
                <span>3D Spatial Map</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white font-bold uppercase tracking-wider text-[11px]">
                <input
                  type="checkbox"
                  checked={filterAROnly}
                  onChange={(e) => setFilterAROnly(e.target.checked)}
                  className="accent-[#ff3e00]"
                />
                <span>AR Guidance</span>
              </label>
            </div>
            {(filter3DOnly || filterAROnly) && (
              <button
                onClick={() => {
                  setFilter3DOnly(false);
                  setFilterAROnly(false);
                }}
                className="text-[#ff3e00] text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-6">
        {/* GPS Live Station Discovery Hero Card */}
        {!searchQuery && (
          <div
            id="discovery-near-you-hero"
            onClick={() => onTabChange('nearby')}
            className="mb-8 p-5 sm:p-6 rounded-none bg-gradient-to-r from-[#00f0ff]/10 via-[#121829] to-[#121212] border-2 border-[#00f0ff]/40 hover:border-[#00f0ff] transition-all cursor-pointer group shadow-[0_0_30px_rgba(0,240,255,0.1)] relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-none bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-[#00f0ff] shrink-0">
                  <span className="material-symbols-outlined text-[26px]">near_me</span>
                  <span className="absolute inset-0 border border-[#00f0ff] animate-ping opacity-30" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-[#00f0ff] text-slate-950 px-2 py-0.5 uppercase tracking-wider">
                      GPS GEO-DISCOVERY
                    </span>
                    <span className="text-[10px] font-mono text-[#00f0ff] animate-pulse">● LIVE PROXIMITY</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight mt-1 group-hover:text-[#00f0ff] transition-colors">
                    Find Railway Stations Near You
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Auto-detect your location, calculate distance, and load 3D digital twins & AR wayfinding.
                  </p>
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00f0ff] text-slate-950 text-xs font-black uppercase tracking-widest group-hover:bg-white transition-colors shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <span>Scan GPS</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {filteredStations.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center mt-12 bg-[#121212] border border-white/10">
            <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h3 className="text-lg font-display font-black text-white uppercase tracking-tight mb-2">No stations found</h3>
            <p className="text-xs text-white/60 max-w-xs mb-6 uppercase tracking-wider">
              We couldn't find any station matching "{searchQuery}". Try New York, Tokyo, London, or Chicago.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilter3DOnly(false);
                setFilterAROnly(false);
              }}
              className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-[#ff3e00] hover:text-white transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {/* Recent Stations Section */}
            {!searchQuery && (
              <section className="mb-10">
                <div className="flex justify-between items-end mb-3 border-b border-white/10 pb-2">
                  <h2 className="text-xs font-bold text-white/50 uppercase tracking-[0.25em]">Recent Stations</h2>
                  <span className="text-[10px] font-mono text-white/40 uppercase">04 Active</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {recentStations.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const target = stations.find((s) => s.id === item.id) || stations[0];
                        onSelectStation(target);
                        onNavigateToMap(target);
                      }}
                      className="bg-[#121212] border border-white/10 p-4 text-left hover:border-[#ff3e00] transition-all relative overflow-hidden group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 bg-white/10 text-white">
                          {item.tag}
                        </span>
                        <span
                          className="material-symbols-outlined text-[16px] text-[#ff3e00]"
                        >
                          {item.icon}
                        </span>
                      </div>

                      <h3 className="text-sm font-display font-black text-white uppercase truncate group-hover:text-[#ff3e00] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wider truncate">{item.location}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Stations Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-2">
                <h2 className="text-xs font-bold text-white/50 uppercase tracking-[0.25em]">
                  {searchQuery ? 'Search Directory' : 'Station Directory'}
                </h2>
                <span className="text-[10px] font-mono text-white/40 uppercase">
                  {filteredStations.length} Registered Hubs
                </span>
              </div>

              {filteredStations.map((station) => {
                const isSaved = !!savedStationIds[station.id];
                const isSelected = currentStation.id === station.id;

                return (
                  <div
                    key={station.id}
                    onClick={() => {
                      onSelectStation(station);
                      onNavigateToMap(station);
                    }}
                    className={`bg-[#121212] border p-6 hover:border-[#ff3e00] transition-all flex flex-col relative group cursor-pointer ${
                      isSelected ? 'border-[#ff3e00]' : 'border-white/10'
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      {/* Header row: Station Name & Bookmark */}
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight group-hover:text-[#ff3e00] transition-colors">
                              {station.name}
                            </h3>
                            {isSelected && (
                              <span className="text-[9px] px-2 py-0.5 bg-[#ff3e00] text-white font-black uppercase tracking-widest">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-white/60 mt-1 text-xs uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px] text-[#ff3e00]">location_on</span>
                            <span>{station.location}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => toggleBookmark(e, station.id)}
                          aria-label="Save Station"
                          className="p-2 text-white/40 hover:text-[#ff3e00] hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {isSaved ? 'bookmark' : 'bookmark_border'}
                          </span>
                        </button>
                      </div>

                      {/* Stat Metrics Row: Platforms & Facilities */}
                      <div className="flex gap-8 items-center py-2 border-t border-b border-white/10">
                        <div className="flex flex-col">
                          <span className="text-2xl font-mono font-black text-white">
                            {station.platforms}
                          </span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                            Platforms
                          </span>
                        </div>

                        <div className="w-px h-8 bg-white/10" />

                        <div className="flex flex-col">
                          <span className="text-2xl font-mono font-black text-white">
                            {station.facilitiesCount > 100 ? `${station.facilitiesCount}+` : station.facilitiesCount}
                          </span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">
                            Facilities
                          </span>
                        </div>

                        {station.tag && (
                          <div className="ml-auto hidden sm:flex flex-col text-right">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Operated by</span>
                            <span className="text-xs text-white font-bold uppercase tracking-wider">{station.tag}</span>
                          </div>
                        )}
                      </div>

                      {/* Capability Badges */}
                      <div className="flex flex-wrap gap-2 items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-2">
                          {station.has3D && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
                              <span className="material-symbols-outlined text-[12px] text-[#ff3e00]">3d_rotation</span>
                              3D Spatial
                            </span>
                          )}

                          {station.hasAR && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
                              <span className="material-symbols-outlined text-[12px] text-[#ff3e00]">view_in_ar</span>
                              AR Navigation
                            </span>
                          )}

                          {station.has2D && !station.hasAR && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 text-white/70 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                              2D Vector
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-white group-hover:text-[#ff3e00] transition-colors">
                          <span>Enter Hub</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
};
