import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Eye,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Train,
  Clock,
  ChevronRight,
  Crosshair,
} from 'lucide-react';
import { Coordinates, LocationStatus, NearbyStationResult, NearbyStationsResponse, Station } from '../types';

interface NearbyStationsViewProps {
  locationStatus: LocationStatus;
  userCoords: Coordinates | null;
  nearbyData: NearbyStationsResponse | null;
  isLoading: boolean;
  selectedStation: Station;
  onSelectStation: (stationId: string) => void;
  onEnterStationMap: (stationId: string) => void;
  onLaunchAR: (stationId: string) => void;
  onRefreshLocation: () => void;
  onRequestPermissionModal: () => void;
}

export const NearbyStationsView: React.FC<NearbyStationsViewProps> = ({
  locationStatus,
  userCoords,
  nearbyData,
  isLoading,
  selectedStation,
  onSelectStation,
  onEnterStationMap,
  onLaunchAR,
  onRefreshLocation,
  onRequestPermissionModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | '3D_AR' | 'nearest'>('all');

  const stations = nearbyData?.stations || [];
  const nearestStation = stations.length > 0 ? stations[0] : null;
  const otherStations = stations.length > 1 ? stations.slice(1) : [];

  // Filtered list based on search and tab
  const filteredOtherStations = otherStations.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.state && st.state.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter === '3D_AR') return st.has3D || st.hasAR;
    return true;
  });

  return (
    <div id="nearby-stations-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#09101f] to-[#131b2e] border border-slate-800 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] shrink-0">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
            {locationStatus === 'DETECTED' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Nearby Railway Stations</h1>
              <span
                id="nearby-location-status-badge"
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                  locationStatus === 'DETECTED'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : locationStatus === 'LOW_ACCURACY'
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : locationStatus === 'PERMISSION_DENIED'
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    : 'bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                {locationStatus === 'DETECTED'
                  ? 'GPS Locked'
                  : locationStatus === 'LOW_ACCURACY'
                  ? 'Approximate GPS'
                  : locationStatus === 'PERMISSION_DENIED'
                  ? 'Location Denied'
                  : locationStatus === 'DETECTING'
                  ? 'Scanning GPS...'
                  : 'Location Service'}
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-mono">
              {userCoords ? (
                <>
                  Lat: <span className="text-slate-200">{userCoords.latitude.toFixed(4)}°</span> • Lng:{' '}
                  <span className="text-slate-200">{userCoords.longitude.toFixed(4)}°</span>
                  {userCoords.accuracy && (
                    <span className="text-slate-500 ml-2">
                      (±{Math.round(userCoords.accuracy)}m accuracy)
                    </span>
                  )}
                  {nearbyData?.locality && (
                    <span className="text-[#00f0ff] ml-2 hidden sm:inline">• {nearbyData.locality}</span>
                  )}
                </>
              ) : (
                'Enable GPS to detect stations within your immediate vicinity'
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-refresh-nearby-gps"
            onClick={onRefreshLocation}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 hover:border-slate-600 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh GPS Coordinates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00f0ff]' : ''}`} />
            <span>{isLoading ? 'Scanning...' : 'Refresh Location'}</span>
          </button>

          {locationStatus !== 'DETECTED' && (
            <button
              id="btn-reopen-location-permission"
              onClick={onRequestPermissionModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00f0ff] hover:bg-[#38f8ff] text-slate-950 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>Enable GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner if Low Accuracy or Denied */}
      {locationStatus === 'LOW_ACCURACY' && (
        <div
          id="location-low-accuracy-alert"
          className="flex items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              GPS signal is approximate (±{Math.round(userCoords?.accuracy || 400)}m). Showing best-estimated railway
              hubs in your zone.
            </span>
          </div>
          <button
            onClick={onRefreshLocation}
            className="underline text-amber-300 hover:text-amber-100 font-medium shrink-0"
          >
            Retry GPS
          </button>
        </div>
      )}

      {locationStatus === 'PERMISSION_DENIED' && (
        <div
          id="location-denied-alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              Location permission was denied. You can manually select any station from the catalog below.
            </span>
          </div>
          <button
            onClick={onRequestPermissionModal}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 font-medium text-xs border border-rose-700/60 w-fit"
          >
            Change Permission
          </button>
        </div>
      )}

      {/* Hero Highlight: NEAREST STATION CARD */}
      {nearestStation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          id={`nearest-station-card-${nearestStation.id}`}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1e38] via-[#0b162b] to-[#070e1c] border-2 border-[#00f0ff]/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.12)]"
        >
          {/* Ambient Corner Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Badge Row */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00f0ff] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Nearest Railway Station
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                  <Navigation className="w-3 h-3 text-[#00f0ff]" />
                  {nearestStation.distanceFormatted} away
                </span>
                {nearestStation.tag && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                    {nearestStation.tag}
                  </span>
                )}
              </div>

              {/* Station Title */}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  {nearestStation.name}
                </h2>
                <p className="text-slate-400 text-sm sm:text-base mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span>
                    {nearestStation.city}
                    {nearestStation.state ? `, ${nearestStation.state}` : ''}, {nearestStation.country}
                  </span>
                </p>
              </div>

              {/* Capability Badges */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {nearestStation.has3D && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    3D Digital Twin Map
                  </span>
                )}
                {nearestStation.hasAR && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    AR Live Wayfinder
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  <Train className="w-3.5 h-3.5 text-emerald-400" />
                  {nearestStation.platforms} Platforms
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  {nearestStation.facilitiesCount} Facilities Mapped
                </span>
              </div>
            </div>

            {/* Quick Launch Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[240px]">
              <button
                id="btn-explore-nearest-station-3d"
                onClick={() => {
                  onSelectStation(nearestStation.id);
                  onEnterStationMap(nearestStation.id);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#00f0ff] hover:bg-[#38f8ff] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Explore Station 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {nearestStation.hasAR && (
                <button
                  id="btn-launch-nearest-station-ar"
                  onClick={() => {
                    onSelectStation(nearestStation.id);
                    onLaunchAR(nearestStation.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-purple-300 hover:text-purple-100 font-semibold text-sm border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>Launch AR Wayfinder</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Spatial Proximity Radar Component */}
      {nearestStation && userCoords && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#091122] border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-[#00f0ff]" />
              <h3 className="text-base sm:text-lg font-bold text-white">Spatial Proximity Radar</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Live GPS Range Finder</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Visual Radar Screen */}
            <div className="md:col-span-1 flex items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800 relative min-h-[220px]">
              {/* Concentric radar rings */}
              <div className="absolute w-44 h-44 rounded-full border border-slate-800" />
              <div className="absolute w-32 h-32 rounded-full border border-slate-700/60" />
              <div className="absolute w-20 h-20 rounded-full border border-[#00f0ff]/20 animate-pulse" />
              
              {/* Radar sweep line */}
              <div
                className="absolute w-24 h-24 border-r border-t border-[#00f0ff]/40 rounded-tr-full origin-bottom-left animate-spin"
                style={{ animationDuration: '4s' }}
              />

              {/* User Center Node */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00f0ff] ring-4 ring-[#00f0ff]/30" />
                </span>
                <span className="text-[10px] font-mono text-slate-300 font-bold mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded">
                  YOU
                </span>
              </div>

              {/* Nearest Station Target Blip */}
              <div className="absolute top-8 right-12 flex flex-col items-center z-10">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 ring-2 ring-emerald-400/40 animate-pulse" />
                </span>
                <span className="text-[9px] font-mono text-emerald-300 font-semibold mt-0.5 bg-slate-950/90 px-1 py-0.2 rounded border border-emerald-500/30 whitespace-nowrap">
                  {nearestStation.name.split(' ')[0]} ({nearestStation.distanceFormatted})
                </span>
              </div>
            </div>

            {/* Radar Coordinates & Distance Breakdown */}
            <div className="md:col-span-2 flex flex-col justify-center space-y-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Current Device Coordinates:</span>
                <span className="font-mono text-slate-200">
                  {userCoords.latitude.toFixed(5)}° N, {userCoords.longitude.toFixed(5)}° E
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Nearest Station Location:</span>
                <span className="font-mono text-[#00f0ff]">
                  {nearestStation.latitude?.toFixed(5)}° N, {nearestStation.longitude?.toFixed(5)}° E
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Radial Vector Distance:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {nearestStation.distanceFormatted} ({nearestStation.distanceMeters.toLocaleString()} meters)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Navigation Handshake:</span>
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Seamless Outdoor-to-Indoor Transition Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Other Nearby Stations */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Other Nearby Stations</h3>
            <p className="text-xs text-slate-400">Stations ordered by geographical distance from your location</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Nearby
              </button>
              <button
                onClick={() => setActiveFilter('3D_AR')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFilter === '3D_AR'
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3D & AR Ready
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="nearby-station-search-input"
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
              />
            </div>
          </div>
        </div>

        {/* Stations Grid */}
        {filteredOtherStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOtherStations.map((station) => {
              const isSelected = selectedStation.id === station.id;

              return (
                <div
                  key={station.id}
                  id={`nearby-station-card-${station.id}`}
                  className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-[#0b1324] border transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? 'border-[#00f0ff] bg-[#0c1830] shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[#00f0ff] font-mono text-xs font-semibold">
                        <Navigation className="w-3 h-3 fill-current" />
                        {station.distanceFormatted}
                      </span>
                      {station.tag && (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {station.tag}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                        {station.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          {station.city}
                          {station.state ? `, ${station.state}` : ''}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {station.platforms} Platforms
                      </span>
                      {station.has3D && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                          3D Twin
                        </span>
                      )}
                      {station.hasAR && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          AR Wayfinder
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-800/80">
                    <button
                      id={`btn-select-station-${station.id}`}
                      onClick={() => {
                        onSelectStation(station.id);
                        onEnterStationMap(station.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-[#00f0ff] hover:text-slate-950 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-[#00f0ff] transition-all cursor-pointer"
                    >
                      <span>Explore Station</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {station.hasAR && (
                      <button
                        id={`btn-launch-ar-${station.id}`}
                        onClick={() => {
                          onSelectStation(station.id);
                          onLaunchAR(station.id);
                        }}
                        className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 transition-colors"
                        title="Direct AR Wayfinder"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <Train className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">No additional stations match your filter in this zone.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-2 text-xs text-[#00f0ff] hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
